from django.urls import path
from .views import RegisterView, LoginView, ProfileView, UserListView, UserUpdateView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('profile/', ProfileView.as_view(), name='profile'),
    path('users/', UserListView.as_view(), name='users-list'),
    path('users/<int:pk>/', UserUpdateView.as_view(), name='user-update'),
]
