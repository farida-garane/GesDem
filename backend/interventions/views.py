from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied
from .models import Commentaire, EscaladeExterne, EchangeExterne
from .serializers import CommentaireSerializer, EscaladeExterneSerializer, EchangeExterneSerializer
from demandes.emails import send_commentaire_email

class CommentaireListCreateView(generics.ListCreateAPIView):
    serializer_class = CommentaireSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        demande_id = self.request.query_params.get('demande')
        qs = Commentaire.objects.all()
        if demande_id:
            qs = qs.filter(demande_id=demande_id)
        if user.role in ['technicien', 'admin']:
            return qs
        return qs.filter(demande__demandeur=user)

    def perform_create(self, serializer):
        demande = serializer.validated_data['demande']
        if self.request.user.role == 'demandeur' and demande.demandeur != self.request.user:
            raise PermissionDenied("Vous ne pouvez commenter que vos propres demandes.")
        commentaire = serializer.save(auteur=self.request.user)
        send_commentaire_email(commentaire)

class CommentaireDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = CommentaireSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role in ['technicien', 'admin']:
            return Commentaire.objects.all()
        return Commentaire.objects.filter(demande__demandeur=user)


class EscaladeExterneListCreateView(generics.ListCreateAPIView):
    serializer_class = EscaladeExterneSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        demande_id = self.request.query_params.get('demande')
        qs = EscaladeExterne.objects.all()
        if demande_id:
            qs = qs.filter(demande_id=demande_id)
        if user.role in ['technicien', 'admin']:
            return qs
        # Le demandeur peut consulter l'état d'escalade de sa propre demande
        return qs.filter(demande__demandeur=user)

    def perform_create(self, serializer):
        if self.request.user.role not in ['technicien', 'admin']:
            raise PermissionDenied("Seuls les techniciens et administrateurs peuvent mandater un prestataire externe.")
        serializer.save(cree_par=self.request.user)


class EscaladeExterneDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = EscaladeExterneSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role in ['technicien', 'admin']:
            return EscaladeExterne.objects.all()
        return EscaladeExterne.objects.filter(demande__demandeur=user)


class EchangeExterneCreateView(generics.CreateAPIView):
    serializer_class = EchangeExterneSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        if self.request.user.role not in ['technicien', 'admin']:
            raise PermissionDenied("Seuls les techniciens et administrateurs peuvent consigner des échanges avec un tiers.")
        serializer.save(auteur=self.request.user)