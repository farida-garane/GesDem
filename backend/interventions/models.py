from django.db import models
from accounts.models import User
from demandes.models import Demande

class Commentaire(models.Model):
    demande = models.ForeignKey(
        Demande,
        on_delete=models.CASCADE,
        related_name='commentaires'
    )
    auteur = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='commentaires'
    )
    contenu = models.TextField()
    date_creation = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Commentaire de {self.auteur} sur {self.demande.reference}"

class EscaladeExterne(models.Model):
    STATUT_CHOICES = [
        ('en_attente_devis', 'En attente de devis'),
        ('en_cours_reparation', 'En cours de réparation / SAV'),
        ('en_attente_livraison', 'En attente de pièces / livraison'),
        ('repare_retourne', 'Réparé & retourné aux locaux'),
        ('annule', 'Annulé'),
    ]

    demande = models.ForeignKey(
        Demande,
        on_delete=models.CASCADE,
        related_name='escalades_externes'
    )
    nom_prestataire = models.CharField(max_length=150)
    contact_nom = models.CharField(max_length=100, blank=True, null=True)
    contact_email = models.EmailField(blank=True, null=True)
    contact_telephone = models.CharField(max_length=50, blank=True, null=True)
    reference_externe = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        help_text="N° ticket externe / RMA"
    )
    motif = models.TextField(help_text="Raison du recours au prestataire")
    cout_estime = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    statut = models.CharField(max_length=30, choices=STATUT_CHOICES, default='en_attente_devis')
    date_envoi = models.DateTimeField(null=True, blank=True)
    date_retour_prevue = models.DateTimeField(null=True, blank=True)
    date_retour_reelle = models.DateTimeField(null=True, blank=True)
    cree_par = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='+'
    )
    date_creation = models.DateTimeField(auto_now_add=True)
    date_modification = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-date_creation']

    def __str__(self):
        return f"Escalade {self.nom_prestataire} pour {self.demande.reference}"

class EchangeExterne(models.Model):
    TYPE_ECHANGE_CHOICES = [
        ('email', 'Email'),
        ('appel', 'Appel téléphonique'),
        ('devis', 'Devis / Facturation'),
        ('expedition', 'Expédition / Réception'),
        ('note', 'Note interne SAV'),
    ]

    escalade = models.ForeignKey(
        EscaladeExterne,
        on_delete=models.CASCADE,
        related_name='echanges'
    )
    auteur = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='+'
    )
    type_echange = models.CharField(
        max_length=30,
        choices=TYPE_ECHANGE_CHOICES,
        default='email'
    )
    sujet = models.CharField(max_length=200, blank=True, null=True)
    contenu = models.TextField()
    date_creation = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['date_creation']

    def __str__(self):
        return f"Échange {self.type_echange} - {self.escalade.nom_prestataire}"