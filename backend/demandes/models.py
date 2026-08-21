from django.db import models
from accounts.models import User

class Demande(models.Model):
    TYPE_CHOICES = [
        ('materiel', 'Matériel'),
        ('reseau', 'Réseau/Logiciel'),
        ('logistique', 'Logistique'),
    ]

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
    type_intervention = models.CharField(
        max_length=20,
        choices=TYPE_CHOICES,
        default='materiel'
    )
    urgence = models.CharField(
        max_length=10,
        choices=URGENCE_CHOICES,
        default='faible'
    )
    # Le statut est géré par l'intervenant, pas le demandeur
    statut = models.CharField(
        max_length=20,
        choices=STATUT_CHOICES,
        default='en_attente'
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