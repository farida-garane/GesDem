from rest_framework import generics, permissions
from rest_framework.response import Response
from django.contrib.auth import authenticate
from rest_framework.authtoken.models import Token
from rest_framework.views import APIView
from rest_framework.exceptions import PermissionDenied
from .models import User
from .serializers import UserSerializer, RegisterSerializer

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        login_input = (request.data.get('username') or '').strip()
        password = request.data.get('password', '')

        # 1. Tentative avec username exact
        user = authenticate(username=login_input, password=password)

        # 2. Si échec, recherche insensible à la casse par email ou nom d'utilisateur
        if not user:
            candidate = User.objects.filter(email__iexact=login_input).first() or User.objects.filter(username__iexact=login_input).first()
            if candidate and candidate.check_password(password):
                user = candidate

        if user:
            if not user.is_active:
                return Response({'error': "Ce compte a été désactivé par l'administrateur."}, status=403)

            # Si le compte est un super-administrateur Django, s'assurer que role='admin'
            if (user.is_superuser or user.is_staff) and user.role != 'admin':
                user.role = 'admin'
                user.save(update_fields=['role'])

            token, _ = Token.objects.get_or_create(user=user)
            return Response({
                'token': token.key,
                'role': user.role,
                'username': user.username,
                'nom': user.username,
                'email': user.email,
                'departement': getattr(user, 'departement', '')
            })

        # Vérification si le compte existe mais est désactivé
        target_user = (
            User.objects.filter(username__iexact=login_input).first() or
            User.objects.filter(email__iexact=login_input).first()
        )
        if target_user and target_user.check_password(password) and not target_user.is_active:
            return Response({'error': "Ce compte a été désactivé par l'administrateur."}, status=403)

        return Response({'error': 'Identifiants ou mot de passe incorrects.'}, status=400)


class ProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        user = self.request.user
        if (user.is_superuser or user.is_staff) and user.role != 'admin':
            user.role = 'admin'
            user.save(update_fields=['role'])
        return user

class UserListView(generics.ListAPIView):
    queryset = User.objects.all().order_by('id')
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if (user.is_superuser or user.is_staff) and user.role != 'admin':
            user.role = 'admin'
            user.save(update_fields=['role'])
        if user.role != 'admin' and not user.is_superuser and not user.is_staff:
            raise PermissionDenied("Réservé aux administrateurs.")
        return User.objects.all().order_by('id')

class UserUpdateView(generics.RetrieveUpdateDestroyAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_update(self, serializer):
        user = self.request.user
        if (user.is_superuser or user.is_staff) and user.role != 'admin':
            user.role = 'admin'
            user.save(update_fields=['role'])
        if user.role != 'admin' and not user.is_superuser and not user.is_staff:
            raise PermissionDenied("Réservé aux administrateurs.")
        serializer.save()

    def perform_destroy(self, instance):
        user = self.request.user
        if (user.is_superuser or user.is_staff) and user.role != 'admin':
            user.role = 'admin'
            user.save(update_fields=['role'])
        if user.role != 'admin' and not user.is_superuser and not user.is_staff:
            raise PermissionDenied("Réservé aux administrateurs.")
        if instance.id == user.id:
            raise PermissionDenied("Vous ne pouvez pas supprimer votre propre compte administrateur.")
        instance.delete()