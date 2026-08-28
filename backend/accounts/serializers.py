from rest_framework import serializers
from .models import User

class UserSerializer(serializers.ModelSerializer):
    nom = serializers.CharField(source='username', required=False)

    class Meta:
        model = User
        fields = ['id', 'nom', 'email', 'role']
        read_only_fields = ['id']

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    nom = serializers.CharField(source='username')

    class Meta:
        model = User
        fields = ['nom', 'email', 'password', 'role']

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
        )
        if 'role' in validated_data:
            user.role = validated_data['role']
            user.save()
        return user