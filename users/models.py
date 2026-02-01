from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
from django.contrib.auth.hashers import make_password, check_password
from django.utils import timezone
import uuid

class UtilisateurManager(BaseUserManager):
    def create_user(self, adresse_email, mot_de_passe=None, **extra_fields):
        if not adresse_email:
            raise ValueError("L'adresse email est obligatoire")
        email = self.normalize_email(adresse_email)
        user = self.model(adresse_email=email, **extra_fields)
        user.set_password(mot_de_passe)
        user.save(using=self._db)
        return user

    def create_superuser(self, adresse_email, mot_de_passe=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(adresse_email, mot_de_passe, **extra_fields)


class Utilisateur(AbstractBaseUser, PermissionsMixin):
    id_utilisateur = models.AutoField(primary_key=True)
    nom = models.CharField(max_length=100)
    prenom = models.CharField(max_length=100)
    date_naissance = models.DateField(null=True, blank=True)
    adresse_email = models.EmailField(unique=True)
    matricule = models.CharField(max_length=20, unique=True, null=True, blank=True)

    points = models.IntegerField(default=0)

    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    date_inscription = models.DateTimeField(auto_now_add=True)
    must_change_password = models.BooleanField(default=False)
    USERNAME_FIELD = 'adresse_email'
    REQUIRED_FIELDS = ['nom', 'prenom']

    objects = UtilisateurManager()

    def __str__(self):
        return self.adresse_email


class Etudiant(models.Model):
    utilisateur = models.OneToOneField(Utilisateur, on_delete=models.CASCADE, primary_key=True)
    specialite = models.CharField(max_length=100)
    annee_etude = models.CharField(max_length=10)

    def __str__(self):
        return f"{self.utilisateur.nom} {self.utilisateur.prenom} - Étudiant"


class Enseignant(models.Model):
    utilisateur = models.OneToOneField(Utilisateur, on_delete=models.CASCADE, primary_key=True)
    grade = models.CharField(max_length=50)
    can_create_any_course_content = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.utilisateur.nom} {self.utilisateur.prenom} - Enseignant"


class Administrateur(models.Model):
    id_admin = models.AutoField(primary_key=True)
    email_admin = models.EmailField(unique=True)
    mdp_admin = models.CharField(max_length=255)

    def set_password(self, raw_password):
        self.mdp_admin = make_password(raw_password)

    def check_password(self, raw_password):
        return check_password(raw_password, self.mdp_admin)

    def __str__(self):
        return self.email_admin

class PasswordResetToken(models.Model):
    user = models.ForeignKey("Utilisateur", on_delete=models.CASCADE)
    token = models.UUIDField(default=uuid.uuid4, unique=True)
    created_at = models.DateTimeField(default=timezone.now)

    def is_valid(self):
        # Token valable 24h
        return (timezone.now() - self.created_at).total_seconds() < 3600 * 24
