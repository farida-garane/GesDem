from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    ROLE_CHOICES=[
        ('demandeur','Demandeur'),
        ('intervenant','Intervenant'),
        ('admin','Administrateur'),
    ]
    role=models.CharField(
        max_length=20,
        choices=ROLE_CHOICES,
        default='demandeur'
    )

    def __str__(self):
        return f"{self.username} ({self.role})"

