from rest_framework import serializers
from .models import User

class UserSerializer(serializers.ModelSerializer):
    nom = serializers.CharField(source='username', required=False)
    password = serializers.CharField(write_only=True, required=False, allow_blank=True, min_length=4)

    class Meta:
        model = User
        fields = ['id', 'nom', 'username', 'email', 'role', 'departement', 'telephone', 'is_active', 'password']
        read_only_fields = ['id']

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        username = validated_data.pop('username', None)
        if username:
            instance.username = username
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password:
            instance.set_password(password)
        instance.save()
        return instance

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=4)
    nom = serializers.CharField(required=False, allow_blank=True)
    username = serializers.CharField(required=False, allow_blank=True)
    email = serializers.EmailField(required=True)
    departement = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    role = serializers.CharField(required=False, default='demandeur')

    class Meta:
        model = User
        fields = ['nom', 'username', 'email', 'password', 'role', 'departement']

    def validate(self, attrs):
        # Utiliser 'nom' ou 'username'
        username = attrs.get('username') or attrs.get('nom')
        if not username:
            raise serializers.ValidationError({"nom": "Veuillez renseigner votre nom complet ou identifiant."})
        
        username = username.strip()
        attrs['username'] = username

        if User.objects.filter(username__iexact=username).exists():
            raise serializers.ValidationError({"nom": "Cet identifiant / nom est déjà utilisé."})

        email = attrs.get('email', '').strip().lower()
        attrs['email'] = email
        if User.objects.filter(email__iexact=email).exists():
            raise serializers.ValidationError({"email": "Cette adresse email est déjà enregistrée."})

        return attrs

    def create(self, validated_data):
        username = validated_data['username']
        email = validated_data['email']
        password = validated_data['password']
        role = validated_data.get('role', 'demandeur')
        departement = validated_data.get('departement', '')

        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            role=role,
            departement=departement
        )
        return user