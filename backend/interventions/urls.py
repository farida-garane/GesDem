from django.urls import path
from .views import CommentaireListCreateView, CommentaireDetailView

urlpatterns = [
    path('', CommentaireListCreateView.as_view(), name='commentaires'),
    path('<int:pk>/', CommentaireDetailView.as_view(), name='commentaire-detail'),
]