from rest_framework.decorators import api_view, permission_classes
from users.jwt_auth import IsAuthenticatedJWT  
from rest_framework.response import Response
from .models import Badge, GagnerBadge

@api_view(["GET"])
@permission_classes([IsAuthenticatedJWT])
def user_badges(request):
    user = request.user
    gained_ids = GagnerBadge.objects.filter(utilisateur=user).values_list('badge_id', flat=True)
    badges = Badge.objects.all()
    data = []

    for badge in badges:
        data.append({
            "id": badge.id,
            "title": badge.nom,
            "desc": badge.description,
            "category": badge.categorie,
            "xp": f"+{badge.numpoints} XP",
            "locked": badge.id not in gained_ids,
            "icon": badge.icone.url if badge.icone else None
        })

    return Response(data)

def check_course_badges(user, progression):
    # Course Explorer
    if progression.avancement_cours >= 100:
        badge = Badge.objects.get(nom="Course Explorer")
        GagnerBadge.objects.get_or_create(utilisateur=user, badge=badge)

    # Halfway There
    elif progression.avancement_cours >= 50:
        badge = Badge.objects.get(nom="Halfway There")
        GagnerBadge.objects.get_or_create(utilisateur=user, badge=badge)