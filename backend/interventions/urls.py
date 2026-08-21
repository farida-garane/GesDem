from django.urls import path
from .views import InterventionListCreateView, InterventionDetailView

urlpatterns = [
    path('', InterventionListCreateView.as_view(), name='interventions'),
    path('<int:pk>/', InterventionDetailView.as_view(), name='intervention-detail'),
]