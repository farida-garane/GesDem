from django.db import models
from accounts.models import User

class Categorie(models.Model):
    nom = models.CharField(max_length=100)

    def __str__(self):
        return self.nom

class Demande(models.Model):
    URGENCE_CHOICES = [
        ('faible', 'Faible'),
        ('moyen', 'Moyen'),
        ('eleve', 'Élevé'),
    ]

    STATUT_CHOICES = [
        ('en_attente', 'En attente'),
        ('en_cours', 'En cours de traitement'),
        ('resolu', 'Résolu'),
        ('rejete', 'Rejeté'),
    ]

    titre = models.CharField(max_length=200)
    description = models.TextField()
    urgence = models.CharField(
        max_length=10,
        choices=URGENCE_CHOICES,
        default='faible'
    )
    statut = models.CharField(
        max_length=20,
        choices=STATUT_CHOICES,
        default='en_attente'
    )
    categorie = models.ForeignKey(
        Categorie,
        on_delete=models.SET_NULL,
        null=True
    )
    demandeur = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='demandes'
    )
    date_creation = models.DateTimeField(auto_now_add=True)
    date_modification = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.titre} - {self.statut}"