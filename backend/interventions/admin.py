from django.contrib import admin
from .models import Intervention

@admin.register(Intervention)
class InterventionAdmin(admin.ModelAdmin):
    list_display = ('demande', 'intervenant', 'date_intervention')
