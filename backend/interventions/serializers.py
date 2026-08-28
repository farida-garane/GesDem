from rest_framework import serializers
from .models import Commentaire
from demandes.serializers import DemandeurSerializer

class CommentaireSerializer(serializers.ModelSerializer):
    auteur_details = DemandeurSerializer(source='auteur', read_only=True)

    class Meta:
        model = Commentaire
        fields = ['id', 'demande', 'auteur', 'auteur_details', 'contenu', 'date_creation']
        read_only_fields = ['id', 'auteur', 'date_creation']