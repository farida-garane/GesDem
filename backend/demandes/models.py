from django.db import models
from accounts.models import User

class Categorie(models.Model):
    libelle = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.libelle

class Statut(models.Model):
    libelle = models.CharField(max_length=50)
    ordre = models.PositiveIntegerField(default=0)
    couleur = models.CharField(max_length=20, default='#000000', help_text="Code couleur hexadécimal")

    class Meta:
        ordering = ['ordre']

    def __str__(self):
        return self.libelle

class Demande(models.Model):
    URGENCE_CHOICES = [
        ('faible', 'Faible'),
        ('moyen', 'Moyen'),
        ('eleve', 'Élevé'),
    ]

    reference = models.CharField(max_length=50, unique=True, blank=True, null=True)
    objet = models.CharField(max_length=200)
    description = models.TextField()
    urgence = models.CharField(max_length=10, choices=URGENCE_CHOICES, default='faible')
    
    categorie = models.ForeignKey(Categorie, on_delete=models.PROTECT, related_name='demandes', null=True)
    statut = models.ForeignKey(Statut, on_delete=models.PROTECT, related_name='demandes', null=True)
    
    localisation = models.CharField(max_length=150, blank=True, null=True)
    piece_jointe = models.FileField(upload_to='pieces_jointes/', null=True, blank=True)
    
    demandeur = models.ForeignKey(User, on_delete=models.CASCADE, related_name='demandes')
    technicien = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='demandes_assignees')
    
    date_creation = models.DateTimeField(auto_now_add=True)
    date_modification = models.DateTimeField(auto_now=True)
    date_cloture = models.DateTimeField(null=True, blank=True)

    def save(self, *args, **kwargs):
        if not self.reference:
            last_id = Demande.objects.all().order_by('id').last()
            next_id = last_id.id + 1 if last_id else 1
            self.reference = f"DEM-{next_id:04d}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.reference} - {self.objet}"

class HistoriqueStatut(models.Model):
    demande = models.ForeignKey(Demande, on_delete=models.CASCADE, related_name='historiques')
    ancien_statut = models.ForeignKey(Statut, on_delete=models.SET_NULL, null=True, related_name='+')
    nouveau_statut = models.ForeignKey(Statut, on_delete=models.SET_NULL, null=True, related_name='+')
    date_changement = models.DateTimeField(auto_now_add=True)
    modifie_par = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)

    def __str__(self):
        return f"Historique de {self.demande.reference}"