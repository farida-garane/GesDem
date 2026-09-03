from rest_framework import generics, permissions, filters
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from .models import Demande, Categorie, Statut, HistoriqueStatut
from .serializers import (
    DemandeSerializer, DemandeCreationSerializer, DemandeStatutSerializer,
    CategorieSerializer, StatutSerializer, HistoriqueStatutSerializer
)
from .emails import (
    send_demande_created_email,
    send_urgent_alert_email,
    send_demande_assigned_email,
    send_demande_resolved_email
)
from accounts.models import User

class CategorieListView(generics.ListAPIView):
    queryset = Categorie.objects.all()
    serializer_class = CategorieSerializer
    permission_classes = [permissions.IsAuthenticated]

class StatutListView(generics.ListAPIView):
    queryset = Statut.objects.all()
    serializer_class = StatutSerializer
    permission_classes = [permissions.IsAuthenticated]

class DemandeListCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['statut', 'urgence', 'categorie', 'technicien']
    search_fields = ['reference', 'objet']

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return DemandeCreationSerializer
        return DemandeSerializer

    def get_queryset(self):
        user = self.request.user
        if user.role == 'demandeur':
            return Demande.objects.filter(demandeur=user).order_by('-date_creation')
        return Demande.objects.all().order_by('-date_creation')

    def perform_create(self, serializer):
        statut = serializer.validated_data.get('statut')
        if not statut:
            statut = Statut.objects.order_by('ordre').first()
        demande = serializer.save(demandeur=self.request.user, statut=statut)
        
        # 1. Email accusé de réception au demandeur
        send_demande_created_email(demande)
        
        # 2. Si urgence élevée, alerte immédiate aux techniciens
        if demande.urgence == 'eleve':
            techniciens_emails = list(
                User.objects.filter(role__in=['technicien', 'admin']).exclude(email='').values_list('email', flat=True)
            )
            send_urgent_alert_email(demande, techniciens_emails)

class DemandeDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return DemandeStatutSerializer
        return DemandeSerializer

    def get_queryset(self):
        user = self.request.user
        if user.role == 'demandeur':
            return Demande.objects.filter(demandeur=user)
        return Demande.objects.all()

    def perform_update(self, serializer):
        demande = self.get_object()
        ancien_statut = demande.statut
        ancien_tech = demande.technicien
        
        updated_demande = serializer.save()
        
        nouveau_statut = updated_demande.statut
        nouveau_tech = updated_demande.technicien

        # If status changed, create HistoriqueStatut
        if ancien_statut != nouveau_statut:
            HistoriqueStatut.objects.create(
                demande=updated_demande,
                ancien_statut=ancien_statut,
                nouveau_statut=nouveau_statut,
                modifie_par=self.request.user
            )
            
            # Notification email si résolution
            if nouveau_statut and nouveau_statut.libelle.lower() in ['résolue', 'clôturée', 'resolue', 'cloturee']:
                send_demande_resolved_email(updated_demande)

        # Notification email si nouvelle prise en charge par un technicien
        if nouveau_tech and ancien_tech != nouveau_tech:
            send_demande_assigned_email(updated_demande)

class DemandeHistoriqueView(generics.ListAPIView):
    serializer_class = HistoriqueStatutSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        demande_id = self.kwargs['pk']
        return HistoriqueStatut.objects.filter(demande_id=demande_id).order_by('-date_changement')