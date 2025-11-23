from django.db import models

class Utilisateur(models.Model):
    id_utilisateur = models.AutoField(primary_key=True)
    nom = models.CharField(max_length=100)
    prenom = models.CharField(max_length=100)
    date_naissance = models.DateField()
    adresse_email = models.EmailField(unique=True)
    mot_de_passe = models.CharField(max_length=255)
    matricule = models.CharField(max_length=20, unique=True)

class Etudiant(models.Model):
    utilisateur = models.OneToOneField(Utilisateur, on_delete=models.CASCADE, primary_key=True)
    specialite = models.CharField(max_length=100)
    annee_etude = models.CharField(max_length=10)

class Enseignant(models.Model):
    utilisateur = models.OneToOneField(Utilisateur, on_delete=models.CASCADE, primary_key=True)
    grade = models.CharField(max_length=50)

class Administrateur(models.Model):
    id_admin = models.AutoField(primary_key=True)
    email_admin = models.EmailField(unique=True)
    mdp_admin = models.CharField(max_length=255)
