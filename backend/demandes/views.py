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

    def perform_destroy(self, instance):
        from rest_framework.exceptions import PermissionDenied
        user = self.request.user

        # Seul le demandeur ou un admin peut supprimer
        if user != instance.demandeur and user.role != 'admin':
            raise PermissionDenied("Seul le demandeur peut supprimer sa demande.")

        # Règle métier : la demande ne peut être supprimée QUE si elle n'a pas encore été prise en charge par un intervenant
        if instance.technicien is not None:
            raise PermissionDenied("Impossible de supprimer une demande qui a déjà été prise en charge par un intervenant.")

        instance.delete()

    def perform_update(self, serializer):
        from rest_framework.exceptions import PermissionDenied
        demande = self.get_object()
        user = self.request.user
        ancien_statut = demande.statut
        ancien_tech = demande.technicien

        # Règle de sécurité stricte : Seuls l'intervenant (technicien) et l'administrateur peuvent modifier le statut ou l'intervenant
        if user.role not in ['admin', 'technicien'] and not user.is_superuser and not user.is_staff:
            if 'technicien' in serializer.validated_data and serializer.validated_data['technicien'] != ancien_tech:
                raise PermissionDenied("Seuls l'intervenant et l'administrateur peuvent modifier l'assignation.")

            nouveau_statut_req = serializer.validated_data.get('statut')
            if nouveau_statut_req and nouveau_statut_req != ancien_statut:
                lib_lower = nouveau_statut_req.libelle.lower()
                # Le demandeur n'a le droit de changer le statut que pour Clôturer ou Rouvrir sa propre demande
                if not (lib_lower in ['clôturée', 'cloturee', 'en cours']):
                    raise PermissionDenied("Seuls l'intervenant et l'administrateur peuvent modifier le statut.")

        updated_demande = serializer.save()
        
        nouveau_statut = updated_demande.statut
        nouveau_tech = updated_demande.technicien

        # Si clôturée, enregistrer date_cloture
        if nouveau_statut and nouveau_statut.libelle.lower() in ['clôturée', 'cloturee']:
            if not updated_demande.date_cloture:
                updated_demande.date_cloture = timezone.now()
                updated_demande.save(update_fields=['date_cloture'])

        # Enregistrer l'historique de statut et notifier
        if ancien_statut != nouveau_statut:
            HistoriqueStatut.objects.create(
                demande=updated_demande,
                ancien_statut=ancien_statut,
                nouveau_statut=nouveau_statut,
                modifie_par=user
            )
            
            # Notification email si résolution ou clôture
            if nouveau_statut and nouveau_statut.libelle.lower() in ['résolue', 'clôturée', 'resolue', 'cloturee']:
                send_demande_resolved_email(updated_demande)

        # Notification email si prise en charge / réassignation
        if nouveau_tech and ancien_tech != nouveau_tech:
            send_demande_assigned_email(updated_demande)

class DemandeHistoriqueView(generics.ListAPIView):
    serializer_class = HistoriqueStatutSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        demande_id = self.kwargs['pk']
        return HistoriqueStatut.objects.filter(demande_id=demande_id).order_by('-date_changement')