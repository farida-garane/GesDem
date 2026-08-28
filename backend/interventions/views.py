from rest_framework import generics, permissions
from rest_framework.exceptions import PermissionDenied
from .models import Commentaire
from .serializers import CommentaireSerializer

class CommentaireListCreateView(generics.ListCreateAPIView):
    serializer_class = CommentaireSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role in ['technicien', 'admin']:
            return Commentaire.objects.all()
        # un demandeur voit les commentaires sur ses propres demandes
        return Commentaire.objects.filter(demande__demandeur=user)

    def perform_create(self, serializer):
        # Techniciens and demandeurs can comment, based on specs (demandeur can comment on their own requests)
        demande = serializer.validated_data['demande']
        if self.request.user.role == 'demandeur' and demande.demandeur != self.request.user:
            raise PermissionDenied("Vous ne pouvez commenter que vos propres demandes.")
        serializer.save(auteur=self.request.user)

class CommentaireDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = CommentaireSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role in ['technicien', 'admin']:
            return Commentaire.objects.all()
        return Commentaire.objects.filter(demande__demandeur=user)