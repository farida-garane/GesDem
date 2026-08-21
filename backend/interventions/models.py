from django.db import models
from accounts.models import User
from demandes.models import Demande

class Intervention(models.Model):
    demande = models.ForeignKey(
        Demande,
        on_delete=models.CASCADE,
        related_name='interventions'
    )
    intervenant = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='interventions'
    )
    commentaire = models.TextField()
    date_intervention = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Intervention sur {self.demande.titre} par {self.intervenant}"