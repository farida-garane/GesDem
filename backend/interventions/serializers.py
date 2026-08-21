from rest_framework import serializers
from .models import Intervention
from accounts.models import User
from demandes.models import Demande

class IntervenantInfoSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email']

class DemandeInfoSerializer(serializers.ModelSerializer):
    demandeur = serializers.StringRelatedField()

    class Meta:
        model = Demande
        fields = ['id', 'titre', 'type_intervention', 'urgence', 'statut', 'demandeur']

class InterventionSerializer(serializers.ModelSerializer):
    intervenant = IntervenantInfoSerializer(read_only=True)
    demande = DemandeInfoSerializer(read_only=True)
    demande_id = serializers.PrimaryKeyRelatedField(
        queryset=Demande.objects.all(),
        source='demande',
        write_only=True
    )

    class Meta:
        model = Intervention
        fields = [
            'id',
            'demande',
            'demande_id',
            'intervenant',
            'commentaire',
            'date_intervention'
        ]
        read_only_fields = ['id', 'intervenant', 'date_intervention']