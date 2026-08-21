from rest_framework import serializers
from .models import Demande
from accounts.models import User

class DemandeurSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email']

class DemandeSerializer(serializers.ModelSerializer):
    demandeur = DemandeurSerializer(read_only=True)

    class Meta:
        model = Demande
        fields = [
            'id',
            'titre',
            'description',
            'type_intervention',
            'urgence',
            'statut',
            'demandeur',
            'date_creation',
            'date_modification'
        ]
        # statut et demandeur ne sont pas modifiables par le demandeur
        read_only_fields = ['id', 'demandeur', 'date_creation', 'date_modification']

class DemandeCreationSerializer(serializers.ModelSerializer):
    """Serializer utilisé uniquement pour la création d'une demande"""
    class Meta:
        model = Demande
        fields = ['titre', 'description', 'type_intervention', 'urgence']

class DemandeStatutSerializer(serializers.ModelSerializer):
    """Serializer utilisé uniquement pour changer le statut (par l'intervenant)"""
    class Meta:
        model = Demande
        fields = ['statut']