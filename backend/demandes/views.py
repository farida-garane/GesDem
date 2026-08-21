from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework import status
from .models import Demande
from .serializers import DemandeSerializer, DemandeCreationSerializer, DemandeStatutSerializer

class DemandeListCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return DemandeCreationSerializer
        return DemandeSerializer

    def get_queryset(self):
        user = self.request.user
        if user.role == 'demandeur':
            return Demande.objects.filter(demandeur=user)
        return Demande.objects.all()

    def perform_create(self, serializer):
        serializer.save(demandeur=self.request.user)

class DemandeDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        # si l'intervenant veut changer le statut
        if self.request.method in ['PUT', 'PATCH'] and self.request.user.role == 'intervenant':
            return DemandeStatutSerializer
        return DemandeSerializer

    def get_queryset(self):
        user = self.request.user
        if user.role == 'demandeur':
            return Demande.objects.filter(demandeur=user)
        return Demande.objects.all()