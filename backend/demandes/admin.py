
from django.contrib import admin
from .models import Categorie, Demande

@admin.register(Categorie)
class CategorieAdmin(admin.ModelAdmin):
    list_display = ('nom',)

@admin.register(Demande)
class DemandeAdmin(admin.ModelAdmin):
    list_display = ('titre', 'statut', 'urgence', 'categorie', 'demandeur', 'date_creation')
    list_filter = ('statut', 'urgence', 'categorie')