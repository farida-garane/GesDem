from django.contrib import admin
from .models import Demande, Categorie, Statut, HistoriqueStatut

@admin.register(Categorie)
class CategorieAdmin(admin.ModelAdmin):
    list_display = ('libelle',)

@admin.register(Statut)
class StatutAdmin(admin.ModelAdmin):
    list_display = ('libelle', 'ordre', 'couleur')
    ordering = ('ordre',)

@admin.register(Demande)
class DemandeAdmin(admin.ModelAdmin):
    list_display = ('reference', 'objet', 'statut', 'urgence', 'categorie', 'demandeur', 'technicien', 'date_creation')
    list_filter = ('statut', 'urgence', 'categorie')

@admin.register(HistoriqueStatut)
class HistoriqueStatutAdmin(admin.ModelAdmin):
    list_display = ('demande', 'ancien_statut', 'nouveau_statut', 'date_changement', 'modifie_par')