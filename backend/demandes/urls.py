from django.urls import path
from .views import (
    DemandeListCreateView, DemandeDetailView, 
    CategorieListView, StatutListView, DemandeHistoriqueView
)

urlpatterns = [
    path('categories/', CategorieListView.as_view(), name='categories'),
    path('statuts/', StatutListView.as_view(), name='statuts'),
    path('', DemandeListCreateView.as_view(), name='demandes'),
    path('<int:pk>/', DemandeDetailView.as_view(), name='demande-detail'),
    path('<int:pk>/historique/', DemandeHistoriqueView.as_view(), name='demande-historique'),
]