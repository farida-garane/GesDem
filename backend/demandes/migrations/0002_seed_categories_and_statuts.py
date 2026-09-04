from django.db import migrations

def seed_data(apps, schema_editor):
    Categorie = apps.get_model('demandes', 'Categorie')
    Statut = apps.get_model('demandes', 'Statut')

    categories = [
        {'id': 1, 'libelle': 'Matériel (Ordinateur, écran, imprimante)', 'description': 'Pannes matérielles, périphériques, postes de travail'},
        {'id': 2, 'libelle': 'Logiciel (Applications, messagerie, licences)', 'description': 'Bugs applicatifs, logiciels métiers, outils bureautiques'},
        {'id': 3, 'libelle': 'Réseau & Connexion (Wi-Fi, VPN, Internet)', 'description': 'Coupures réseau, accès VPN, bornes Wi-Fi'},
        {'id': 4, 'libelle': 'Assistance informatique (Mot de passe, droits)', 'description': 'Réinitialisation mot de passe, permissions d\'accès'},
        {'id': 5, 'libelle': 'Logistique & Mobilier (Déplacement de poste)', 'description': 'Aménagement bureau, chaises, déménagement interne'},
        {'id': 6, 'libelle': 'Autre (Problème non listé)', 'description': 'Autres demandes et besoins spécifiques'},
    ]

    for cat in categories:
        Categorie.objects.update_or_create(
            id=cat['id'],
            defaults={'libelle': cat['libelle'], 'description': cat['description']}
        )

    statuts = [
        {'id': 1, 'libelle': 'Reçu / En attente', 'ordre': 1, 'couleur': '#FF5E00'},
        {'id': 2, 'libelle': 'En cours de traitement', 'ordre': 2, 'couleur': '#002B7F'},
        {'id': 3, 'libelle': 'En attente de pièces / validation', 'ordre': 3, 'couleur': '#F59E0B'},
        {'id': 4, 'libelle': 'Résolu / Prêt', 'ordre': 4, 'couleur': '#10B981'},
        {'id': 5, 'libelle': 'Clôturé', 'ordre': 5, 'couleur': '#64748B'},
    ]

    for st in statuts:
        Statut.objects.update_or_create(
            id=st['id'],
            defaults={'libelle': st['libelle'], 'ordre': st['ordre'], 'couleur': st['couleur']}
        )

def reverse_seed(apps, schema_editor):
    pass

class Migration(migrations.Migration):

    dependencies = [
        ('demandes', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(seed_data, reverse_seed),
    ]
