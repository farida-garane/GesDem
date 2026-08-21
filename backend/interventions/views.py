from rest_framework import generics, permissions
from .models import Intervention
from .serializers import InterventionSerializer

class InterventionListCreateView(generics.ListCreateAPIView):
    serializer_class = InterventionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role in ['intervenant', 'admin']:
            return Intervention.objects.all()
        # un demandeur voit les interventions sur ses propres demandes
        return Intervention.objects.filter(demande__demandeur=user)

    def perform_create(self, serializer):
        serializer.save(intervenant=self.request.user)

class InterventionDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = InterventionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role in ['intervenant', 'admin']:
            return Intervention.objects.all()
        return Intervention.objects.filter(demande__demandeur=user)