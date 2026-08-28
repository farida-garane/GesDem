from demandes.models import Categorie, Statut

def run():
    Categorie.objects.get_or_create(libelle='Matériel', description='Problème avec un équipement physique')
    Categorie.objects.get_or_create(libelle='Logiciel / Réseau', description='Problème informatique ou connexion')
    Categorie.objects.get_or_create(libelle='Logistique', description='Besoin en fournitures ou aménagement')

    Statut.objects.get_or_create(libelle='En attente', ordre=1, couleur='#ff0000')
    Statut.objects.get_or_create(libelle='Assignée', ordre=2, couleur='#ffa500')
    Statut.objects.get_or_create(libelle='En cours', ordre=3, couleur='#0000ff')
    Statut.objects.get_or_create(libelle='Terminée', ordre=4, couleur='#008000')

    print("Base de données initialisée avec succès !")

if __name__ == '__main__':
    run()
