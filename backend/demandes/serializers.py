from rest_framework import serializers
from .models import Demande, Categorie, Statut, HistoriqueStatut
from accounts.models import User

class CategorieSerializer(serializers.ModelSerializer):
    class Meta:
        model = Categorie
        fields = ['id', 'libelle', 'description']

class StatutSerializer(serializers.ModelSerializer):
    class Meta:
        model = Statut
        fields = ['id', 'libelle', 'ordre', 'couleur']

class DemandeurSerializer(serializers.ModelSerializer):
    nom = serializers.CharField(source='username', read_only=True)

    class Meta:
        model = User
        fields = ['id', 'nom', 'email', 'role']

class DemandeCommentaireSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    auteur = serializers.IntegerField(source='auteur_id', read_only=True)
    auteur_details = DemandeurSerializer(source='auteur', read_only=True)
    contenu = serializers.CharField(read_only=True)
    date_creation = serializers.DateTimeField(read_only=True)

class DemandeSerializer(serializers.ModelSerializer):
    demandeur = DemandeurSerializer(read_only=True)
    technicien = DemandeurSerializer(read_only=True)
    categorie_details = CategorieSerializer(source='categorie', read_only=True)
    statut_details = StatutSerializer(source='statut', read_only=True)
    commentaires = DemandeCommentaireSerializer(many=True, read_only=True)

    class Meta:
        model = Demande
        fields = [
            'id',
            'reference',
            'objet',
            'description',
            'categorie',
            'categorie_details',
            'urgence',
            'statut',
            'statut_details',
            'localisation',
            'piece_jointe',
            'demandeur',
            'technicien',
            'commentaires',
            'date_creation',
            'date_modification',
            'date_cloture'
        ]
        read_only_fields = ['id', 'reference', 'demandeur', 'date_creation', 'date_modification', 'date_cloture']

class DemandeCreationSerializer(serializers.ModelSerializer):
    """Serializer utilisé uniquement pour la création d'une demande"""
    class Meta:
        model = Demande
        fields = ['objet', 'description', 'categorie', 'urgence', 'statut', 'localisation', 'piece_jointe']

class DemandeStatutSerializer(serializers.ModelSerializer):
    """Serializer utilisé pour changer le statut ou s'assigner la demande (par le technicien)"""
    class Meta:
        model = Demande
        fields = ['statut', 'technicien']

class HistoriqueStatutSerializer(serializers.ModelSerializer):
    ancien_statut = StatutSerializer(read_only=True)
    nouveau_statut = StatutSerializer(read_only=True)
    modifie_par = DemandeurSerializer(read_only=True)

    class Meta:
        model = HistoriqueStatut
        fields = ['id', 'demande', 'ancien_statut', 'nouveau_statut', 'date_changement', 'modifie_par']