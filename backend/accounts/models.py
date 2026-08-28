from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    ROLE_CHOICES=[
        ('demandeur','Demandeur'),
        ('technicien','Technicien'),
        ('admin','Administrateur'),
    ]
    role=models.CharField(
        max_length=20,
        choices=ROLE_CHOICES,
        default='demandeur'
    )
    departement = models.CharField(max_length=100, blank=True, null=True)
    telephone = models.CharField(max_length=20, blank=True, null=True)

    def __str__(self):
        return f"{self.username} ({self.role})"

