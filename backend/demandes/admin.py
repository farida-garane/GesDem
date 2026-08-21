from django.contrib import admin
from .models import Demande

@admin.register(Demande)
class DemandeAdmin(admin.ModelAdmin):
    list_display = ('titre', 'statut', 'urgence', 'type_intervention', 'demandeur', 'date_creation')
    list_filter = ('statut', 'urgence', 'type_intervention')