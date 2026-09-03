from django.urls import path
from .views import (
    CommentaireListCreateView,
    CommentaireDetailView,
    EscaladeExterneListCreateView,
    EscaladeExterneDetailView,
    EchangeExterneCreateView,
)

urlpatterns = [
    path('', CommentaireListCreateView.as_view(), name='commentaires'),
    path('<int:pk>/', CommentaireDetailView.as_view(), name='commentaire-detail'),
    path('escalades/', EscaladeExterneListCreateView.as_view(), name='escalades-list-create'),
    path('escalades/<int:pk>/', EscaladeExterneDetailView.as_view(), name='escalade-detail'),
    path('echanges/', EchangeExterneCreateView.as_view(), name='echanges-create'),
]