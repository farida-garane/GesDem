from rest_framework import serializers
from .models import Commentaire, EscaladeExterne, EchangeExterne
from demandes.serializers import DemandeurSerializer

class CommentaireSerializer(serializers.ModelSerializer):
    auteur_details = DemandeurSerializer(source='auteur', read_only=True)

    class Meta:
        model = Commentaire
        fields = ['id', 'demande', 'auteur', 'auteur_details', 'contenu', 'date_creation']
        read_only_fields = ['id', 'auteur', 'date_creation']

class EchangeExterneSerializer(serializers.ModelSerializer):
    auteur_details = DemandeurSerializer(source='auteur', read_only=True)

    class Meta:
        model = EchangeExterne
        fields = ['id', 'escalade', 'auteur', 'auteur_details', 'type_echange', 'sujet', 'contenu', 'date_creation']
        read_only_fields = ['id', 'auteur', 'date_creation']

class EscaladeExterneSerializer(serializers.ModelSerializer):
    cree_par_details = DemandeurSerializer(source='cree_par', read_only=True)
    echanges = EchangeExterneSerializer(many=True, read_only=True)

    class Meta:
        model = EscaladeExterne
        fields = [
            'id',
            'demande',
            'nom_prestataire',
            'contact_nom',
            'contact_email',
            'contact_telephone',
            'reference_externe',
            'motif',
            'cout_estime',
            'statut',
            'date_envoi',
            'date_retour_prevue',
            'date_retour_reelle',
            'cree_par',
            'cree_par_details',
            'echanges',
            'date_creation',
            'date_modification',
        ]
        read_only_fields = ['id', 'cree_par', 'date_creation', 'date_modification']