import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'gesdem.settings')
django.setup()

from accounts.models import User

# Réactiver tous les comptes admin / staff / superuser
admins = User.objects.filter(role='admin') | User.objects.filter(is_superuser=True) | User.objects.filter(is_staff=True)
count = 0
for u in admins:
    u.is_active = True
    u.role = 'admin'
    u.save()
    count += 1

print(f"{count} compte(s) administrateur réactivé(s) avec succès dans la base de données !")
