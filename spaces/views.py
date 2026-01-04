from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from django.views.decorators.csrf import csrf_exempt
from courses.models import Cours
from courses.serializers import CoursSerializer
from exercices.models import Exercice
from rest_framework import exceptions
from rest_framework.permissions import IsAuthenticated
from exercices.serializers import ExerciceSerializer
from quiz.models import Quiz
from django.shortcuts import get_object_or_404
from quiz.serializers import QuizSerializer, QuizSerializer1
from users.models import Utilisateur
from .models import Space, SpaceCour, SpaceEtudiant, SpaceExo, SpaceQuiz
from .serializers import (
    MyExerciseSerializer,
    MyQuizSerializer,
    SpaceCourSerializer,
    SpaceExoSerializer,
    SpaceQuizSerializer,
    SpaceSerializer,
    SpaceEtudiantCreateSerializer,
    SpaceEtudiantDisplaySerializer,
    SpaceSerializer1
)
from users.jwt_auth import IsAuthenticatedJWT, jwt_required
from django.db.models import Q

# --- Création d'un espace ---
class CreateSpaceView(APIView):
    @jwt_required
    def post(self, request):
        data = request.data.copy()
        user = request.user

        serializer = SpaceSerializer(data=data)
        if serializer.is_valid():
            space = serializer.save(utilisateur=user)
            return Response(SpaceSerializer(space).data, status=201)
        return Response(serializer.errors, status=400)


# --- Liste des espaces du prof connecté ---
class SpaceListView(generics.ListAPIView):
    serializer_class = SpaceSerializer
    permission_classes = [IsAuthenticatedJWT]

    def get_queryset(self):
        # Pour les admins, renvoyer tous les espaces
        if getattr(self.request, "user_role", None) == "admin":
            return Space.objects.all()
        
        # Sinon, les espaces du prof connecté
        return Space.objects.filter(utilisateur=self.request.user)

# --- Détail / Update / Delete d'un espace ---
class SpaceDetailView(generics.RetrieveDestroyAPIView):
    serializer_class = SpaceSerializer
    permission_classes = [IsAuthenticatedJWT]
    lookup_field = "id_space"

    def get_queryset(self):
        user = self.request.user
        return Space.objects.filter(
            Q(utilisateur=user) |                # prof (créateur)
            Q(spaceetudiant__etudiant=user)      # étudiant inscrit
        ).distinct()


# --- Ajouter un étudiant à un espace ---
class AddStudentToSpaceView(APIView):
    permission_classes = [IsAuthenticatedJWT]

    @jwt_required
    def post(self, request):
        data = request.data
        email = data.get("email")
        space_id = data.get("space_id")

        if not email or not space_id:
            return Response({"error": "Email et space_id requis"}, status=status.HTTP_400_BAD_REQUEST)

        # Chercher l'étudiant
        try:
            user = Utilisateur.objects.get(adresse_email=email)
        except Utilisateur.DoesNotExist:
            return Response({"error": "Utilisateur non trouvé"}, status=status.HTTP_404_NOT_FOUND)

        # Chercher l'espace uniquement parmi ceux du prof connecté
        try:
            space = Space.objects.get(id_space=space_id, utilisateur=request.user)
        except Space.DoesNotExist:
            return Response({"error": "Espace non trouvé ou non autorisé"}, status=status.HTTP_404_NOT_FOUND)

        # Créer la relation étudiant-espace
        serializer = SpaceEtudiantCreateSerializer(data={"etudiant": user.id_utilisateur, "space": space.id_space})
        if serializer.is_valid():
            space_etudiant = serializer.save()
            display_serializer = SpaceEtudiantDisplaySerializer(space_etudiant)
            return Response(display_serializer.data, status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
# --- Liste des étudiants par espaces du prof connecté ---
# --- Lister tous les étudiants des espaces du prof ---
class SpaceEtudiantListView(generics.ListAPIView):
    serializer_class = SpaceEtudiantDisplaySerializer
    permission_classes = [IsAuthenticatedJWT]

    def get_queryset(self):
        user = self.request.user
        # Récupérer tous les étudiants des espaces de ce prof
        return SpaceEtudiant.objects.select_related('etudiant', 'space').filter(space__utilisateur=user)
    

class MySpacesStudentView(generics.ListAPIView):
    serializer_class = SpaceSerializer
    permission_classes = [IsAuthenticatedJWT]

    def get_queryset(self):
        user = self.request.user
        return Space.objects.filter(spaceetudiant__etudiant=user)

@api_view(["GET"])
@permission_classes([IsAuthenticatedJWT])
def my_courses(request):
    prof = request.user
    courses = Cours.objects.filter(utilisateur=prof)
    serializer = CoursSerializer(courses, many=True)
    return Response(serializer.data)


@api_view(["GET"])
@permission_classes([IsAuthenticatedJWT])
def my_exercises(request):
    prof = request.user
    # uniquement les exercices qui n'ont pas de quiz associé
    exercises = Exercice.objects.filter(utilisateur=prof).exclude(quiz__isnull=False)
    serializer = MyExerciseSerializer(exercises, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)



@api_view(["GET"])
@permission_classes([IsAuthenticatedJWT])
def my_quizzes(request):
    prof = request.user
    space_id = request.query_params.get("space_id")  # facultatif

    # Tous les quizzes du prof
    quizzes = Quiz.objects.filter(exercice__utilisateur=prof).exclude(exercice__isnull=True)

    if space_id:
        try:
            space = Space.objects.get(id_space=space_id, utilisateur=prof)
            # Exclure ceux déjà dans l'espace
            quizzes_in_space_ids = SpaceQuiz.objects.filter(space=space).values_list('quiz_id', flat=True)
            quizzes = quizzes.exclude(id__in=quizzes_in_space_ids)
        except Space.DoesNotExist:
            return Response({"error": "Espace non trouvé ou non autorisé"}, status=404)

    serializer = MyQuizSerializer(quizzes, many=True)
    return Response(serializer.data)





#verifier si un item (cours, exo ) et etudiant appartient a un mm espace
@api_view(["GET"])
@permission_classes([IsAuthenticatedJWT])
def is_student_in_same_space(request, item_type, item_id, etudiant_id):
    """
    Vérifie si un étudiant et un item (cours ou exercice) partagent un même space.
    Retourne ai_enabled pour chaque espace commun.
    
    item_type: "cours" ou "exercice"
    item_id: id du cours ou de l'exercice
    etudiant_id: id de l'étudiant
    """
    try:
        etudiant = Utilisateur.objects.get(id_utilisateur=etudiant_id)
    except Utilisateur.DoesNotExist:
        return Response({"error": "Etudiant not found"}, status=404)

    if item_type == "exercice":
        try:
            item = Exercice.objects.get(id_exercice=item_id)
        except Exercice.DoesNotExist:
            return Response({"error": "Exercice not found"}, status=404)
        # Espaces contenant l'exercice
        item_spaces = SpaceExo.objects.filter(exercice=item)

    elif item_type == "cours":
        try:
            item = Cours.objects.get(id_cours=item_id)
        except Cours.DoesNotExist:
            return Response({"error": "Cours not found"}, status=404)
        # Espaces contenant le cours
        item_spaces = SpaceCour.objects.filter(cours=item)

    else:
        return Response({"error": "item_type must be 'cours' or 'exercice'"}, status=400)

    # Espaces de l'étudiant
    student_spaces = SpaceEtudiant.objects.filter(etudiant=etudiant).values_list('space_id', flat=True)

    # Intersection + récupérer ai_enabled
    common_spaces = item_spaces.filter(space_id__in=student_spaces)

    if common_spaces.exists():
        spaces_info = []
        for cs in common_spaces:
            spaces_info.append({
                "space_id": cs.space.id_space,
                "space_name": cs.space.nom_space,
                "ai_enabled": getattr(cs, "ai_enabled", True)  # true par défaut si cours n'a pas ai_enabled
            })

        return Response({
            "same_space": True,
            "spaces": spaces_info
        })
    else:
        return Response({
            "same_space": False,
            "spaces": []
        })





@api_view(["GET", "POST"])
@permission_classes([IsAuthenticatedJWT])
def space_courses(request, space_id):
    try:
        space = Space.objects.get(id_space=space_id)
    except Space.DoesNotExist:
        return Response({"error": "Space not found"}, status=404)

    if request.method == "GET":
        courses = SpaceCour.objects.filter(space=space)
        serializer = SpaceCourSerializer(courses, many=True)
        return Response(serializer.data)

    elif request.method == "POST":
        cours_id = request.data.get("cours")
        if not cours_id:
            return Response({"error": "cours field required"}, status=400)

        try:
            cours = Cours.objects.get(id_cours=cours_id)
        except Cours.DoesNotExist:
            return Response({"error": "Cours not found"}, status=404)

        # 🔹 Récupérer ai_enabled depuis le frontend
        ai_enabled = request.data.get("ai_enabled", True)  # True par défaut

        # 🔹 Créer ou récupérer avec ai_enabled
        space_cour, created = SpaceCour.objects.get_or_create(
            space=space,
            cours=cours,
            defaults={"ai_enabled": ai_enabled}  # ✅ IMPORTANT
        )

        # 🔹 Si l’objet existe déjà, on peut mettre à jour ai_enabled si nécessaire
        if not created:
            space_cour.ai_enabled = ai_enabled
            space_cour.save()

        serializer = SpaceCourSerializer(space_cour)
        return Response(serializer.data, status=201 if created else 200)


@api_view(["GET", "POST"])
@permission_classes([IsAuthenticatedJWT])
def space_exercises(request, space_id):
    try:
        space = Space.objects.get(id_space=space_id)
    except Space.DoesNotExist:
        return Response({"error": "Space not found"}, status=404)

    # --- Lister les exercices du space ---
    if request.method == "GET":
        exercises = SpaceExo.objects.filter(space=space)
        serializer = SpaceExoSerializer(exercises, many=True)
        return Response(serializer.data)

    # --- Ajouter un exercice au space ---
    elif request.method == "POST":
        exercice_id = request.data.get("exercice")
        if not exercice_id:
            return Response({"error": "exercice field required"}, status=400)

        try:
            exercice = Exercice.objects.get(id_exercice=exercice_id)
        except Exercice.DoesNotExist:
            return Response({"error": "Exercice not found"}, status=404)

        # 🔹 Récupérer ai_enabled depuis le frontend
        ai_enabled = request.data.get("ai_enabled", True)  # True par défaut

        # 🔹 Créer ou récupérer avec ai_enabled
        space_exo, created = SpaceExo.objects.get_or_create(
            space=space,
            exercice=exercice,
            defaults={"ai_enabled": ai_enabled}  # ✅ IMPORTANT
        )

        # 🔹 Si l’objet existe déjà, mettre à jour ai_enabled
        if not created:
            space_exo.ai_enabled = ai_enabled
            space_exo.save()

        serializer = SpaceExoSerializer(space_exo)
        return Response(serializer.data, status=201 if created else 200)


# --- Liste des quizzes d'un espace ---
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticatedJWT])
def space_quizzes(request, space_id):
    try:
        space = Space.objects.get(id_space=space_id)
    except Space.DoesNotExist:
        return Response({"error": "Space not found"}, status=404)

    # -------- GET --------
    if request.method == "GET":
        print("space_quizzes GET called", space_id)
        space_quizzes = SpaceQuiz.objects.filter(space=space)
        serializer = SpaceQuizSerializer(space_quizzes, many=True)
        return Response(serializer.data)

    # -------- POST --------
    elif request.method == "POST":
        quiz_id = request.data.get("quiz")
        if not quiz_id:
            return Response(
                {"error": "quiz field required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            quiz = Quiz.objects.get(id=quiz_id)
        except Quiz.DoesNotExist:
            return Response(
                {"error": "Quiz not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        #  empêcher le doublon
        if SpaceQuiz.objects.filter(space=space, quiz=quiz).exists():
            return Response(
                {"error": "Ce quiz est déjà ajouté à cet espace"},
                status=status.HTTP_409_CONFLICT
            )

        space_quiz = SpaceQuiz.objects.create(space=space, quiz=quiz)
        serializer = SpaceQuizSerializer(space_quiz)
        
        return Response(serializer.data, status=status.HTTP_201_CREATED)



class remove_student_from_space(APIView):
    permission_classes = [IsAuthenticatedJWT]  # ton JWT
    authentication_classes = []  # JWT gère l'auth

    @csrf_exempt  # ← ignore CSRF
    def delete(self, request, student_id):
        space_id = request.query_params.get("space_id")
        if not space_id:
            return Response({"error": "space_id requis"}, status=400)

        try:
            space_etudiant = SpaceEtudiant.objects.get(
                etudiant_id=student_id,
                space_id=space_id,
                space__utilisateur=request.user
            )
            space_etudiant.delete()
            return Response({"success": "Étudiant supprimé"}, status=200)
        except SpaceEtudiant.DoesNotExist:
            return Response({"error": "Relation non trouvée"}, status=404)
        

def etudiant_appartient_a_lespace(user, exercice):
    return SpaceEtudiant.objects.filter(
        etudiant=user,
        space__spaceexo__exercice=exercice
    ).distinct().exists()


@api_view(["GET"])
@permission_classes([IsAuthenticatedJWT])
def my_space_exercises(request, space_id):
    prof = request.user
    try:
        space = Space.objects.get(id_space=space_id, utilisateur=prof)
    except Space.DoesNotExist:
        return Response({"error": "Espace non trouvé ou non autorisé"}, status=404)

    # Tous les exercices liés à cet espace
    exercises = Exercice.objects.filter(
        spaceexo__space=space,
        utilisateur=prof
    ).distinct()

    serializer = ExerciceSerializer(exercises, many=True)
    return Response(serializer.data)

#Creation d'un espace from admin
@permission_classes([IsAuthenticatedJWT])
class SpaceCreateView(APIView):
   # permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = SpaceSerializer1(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    
    
#Modification d'un espace
@permission_classes([IsAuthenticatedJWT])
class SpaceUpdateView(APIView):
    #permission_classes = [IsAuthenticated]

    def put(self, request, id_space):
        space = get_object_or_404(Space, id_space=id_space)

        serializer = SpaceSerializer1(space, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


#Admin add students to un espace
@permission_classes([IsAuthenticatedJWT])
class AdminAddStudentToSpaceView(APIView):
    """
    Permet à un administrateur d'ajouter un étudiant à n'importe quel espace.
    """
    #permission_classes = [IsAuthenticatedJWT]  # Assurez-vous que l'admin a un JWT valide

    def post(self, request):
        # Vérifier que l'utilisateur est admin
       

        email = request.data.get("email")
        space_id = request.data.get("space_id")

        if not email or not space_id:
            return Response({"error": "Email et space_id requis"}, status=status.HTTP_400_BAD_REQUEST)

        # Chercher l'étudiant
        try:
            user = Utilisateur.objects.get(adresse_email=email)
        except Utilisateur.DoesNotExist:
            return Response({"error": "Utilisateur non trouvé"}, status=status.HTTP_404_NOT_FOUND)

        # Chercher l'espace sans restriction sur l'utilisateur
        try:
            space = Space.objects.get(id_space=space_id)
        except Space.DoesNotExist:
            return Response({"error": "Espace non trouvé"}, status=status.HTTP_404_NOT_FOUND)

        # Créer la relation étudiant-espace
        serializer = SpaceEtudiantCreateSerializer(data={
            "etudiant": user.id_utilisateur,
            "space": space.id_space
        })

        if serializer.is_valid():
            space_etudiant = serializer.save()
            display_serializer = SpaceEtudiantDisplaySerializer(space_etudiant)
            return Response(display_serializer.data, status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
     
     
class SpaceStudentsDetailView(APIView):
    # permission_classes = [IsAuthenticated]

    def get(self, request, space_id):
        try:
            space = Space.objects.get(id_space=space_id)
        except Space.DoesNotExist:
            return Response(
                {"error": "Espace non trouvé"},
                status=status.HTTP_404_NOT_FOUND
            )

        # =======================
        # Étudiants
        # =======================
        students_qs = SpaceEtudiant.objects.select_related("etudiant").filter(space=space)
        students_data = [
            {
                "id_utilisateur": se.etudiant.id_utilisateur,
                "nom": se.etudiant.nom,
                "prenom": se.etudiant.prenom,
                "email": se.etudiant.adresse_email,
                "date_ajout": se.date_ajout,
            }
            for se in students_qs
        ]

        # =======================
        # Cours
        # =======================
        courses_qs = SpaceCour.objects.select_related("cours").filter(space=space)
        courses_data = [
            {
                "id_cours": sc.cours.id_cours,
                "titre": sc.cours.titre_cour,
                "date_ajout": sc.date_ajout,
            }
            for sc in courses_qs
        ]

        # =======================
        # Exercices
        # =======================
        exercices_qs = SpaceExo.objects.select_related("exercice").filter(space=space)
        exercices_data = [
            {
                "id_exercice": se.exercice.id_exercice,
                "titre": se.exercice.titre_exo,
                "date_ajout": se.date_ajout,
            }
            for se in exercices_qs
        ]

        # =======================
        # Quiz
        # =======================
        quizzes_qs = SpaceQuiz.objects.select_related("quiz").filter(space=space)
        quizzes_data = [
            {
                "id_quiz": sq.quiz.id,
                "titre": sq.quiz.exercice.titre_exo,
                "date_ajout": sq.date_ajout,
            }
            for sq in quizzes_qs
        ]

        # =======================
        # Réponse finale
        # =======================
        return Response(
            {
                "space": {
                    "id": space.id_space,
                    "nom": space.nom_space,
                    "description": space.description,
                    "date_creation": space.date_creation,
                },
                "students": students_data,
                "courses": courses_data,
                "exercices": exercices_data,
                "quizzes": quizzes_data,
            },
            status=status.HTTP_200_OK
        )
    
    
    
#----------
#admin remove etudiant from un espace
#---------------
@api_view(['POST'])
def Admin_remove_student_from_space(request):
    """
    Supprime un étudiant d'un espace.
    Attendu dans le body JSON:
    {
        "student_id": 1,
        "space_id": 1
    }
    """
    student_id = request.data.get("student_id")
    space_id = request.data.get("space_id")

    if not student_id or not space_id:
        return Response({"error": "student_id et space_id sont requis"}, status=400)

    try:
        student = Utilisateur.objects.get(id_utilisateur=student_id)
    except Utilisateur.DoesNotExist:
        return Response({"error": "Étudiant introuvable"}, status=404)

    try:
        space = Space.objects.get(id_space=space_id)
    except Space.DoesNotExist:
        return Response({"error": "Espace introuvable"}, status=404)

    try:
        space_etudiant = SpaceEtudiant.objects.get(etudiant=student, space=space)
        space_etudiant.delete()
        return Response({"success": f"{student} retiré de l'espace {space}"}, status=200)
    except SpaceEtudiant.DoesNotExist:
        return Response({"error": "L'étudiant n'est pas dans cet espace"}, status=400)



@api_view(['DELETE'])
def delete_space(request, space_id):
    """
    Supprimer un espace par son ID
    """
    try:
        space = Space.objects.get(id_space=space_id)
    except Space.DoesNotExist:
        return Response(
            {"error": "Espace non trouvé"},
            status=status.HTTP_404_NOT_FOUND
        )

    space.delete()
    return Response(
        {"message": "Espace supprimé avec succès"},
        status=status.HTTP_204_NO_CONTENT
    )