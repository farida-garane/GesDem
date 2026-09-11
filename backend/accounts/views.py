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

        # Auto-réactivation temporaire pour les comptes admin désactivés par erreur
        if not user:
            candidate = User.objects.filter(email__iexact=login_input).first() or User.objects.filter(username__iexact=login_input).first()
            if candidate and candidate.check_password(password):
                if not candidate.is_active and (candidate.role == 'admin' or candidate.is_superuser or candidate.is_staff):
                    candidate.is_active = True
                    candidate.save(update_fields=['is_active'])
                user = candidate

        if user:
            if not user.is_active and (user.role == 'admin' or user.is_superuser or user.is_staff):
                user.is_active = True
                user.save(update_fields=['is_active'])

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
        if target_user and target_user.check_password(password):
            if not target_user.is_active and (target_user.role == 'admin' or target_user.is_superuser or target_user.is_staff):
                target_user.is_active = True
                target_user.save(update_fields=['is_active'])
                token, _ = Token.objects.get_or_create(user=target_user)
                return Response({
                    'token': token.key,
                    'role': target_user.role,
                    'username': target_user.username,
                    'nom': target_user.username,
                    'email': target_user.email,
                    'departement': getattr(target_user, 'departement', '')
                })
            if not target_user.is_active:
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
        if user.role not in ['admin', 'technicien'] and not user.is_superuser and not user.is_staff:
            raise PermissionDenied("Réservé aux intervenants et administrateurs.")
        role_param = self.request.query_params.get('role')
        if role_param:
            return User.objects.filter(role=role_param).order_by('id')
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