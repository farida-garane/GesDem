from django.urls import path
from .views import DemandeListCreateView, DemandeDetailView

urlpatterns = [
    path('', DemandeListCreateView.as_view(), name='demandes'),
    path('<int:pk>/', DemandeDetailView.as_view(), name='demande-detail'),
]