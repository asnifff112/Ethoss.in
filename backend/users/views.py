from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from .serializers import UserSerializer

User = get_user_model()

class SignupAPIView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')
        name = request.data.get('name', '')

        if not email or not password:
            return Response({'error': 'Email and password are required'}, status=status.HTTP_400_BAD_REQUEST)

        if User.objects.filter(email=email).exists():
            return Response({'error': 'User with this email already exists'}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.create_user(
            username=email,
            email=email,
            password=password,
            name=name
        )
        refresh = RefreshToken.for_user(user)
        return Response({
            'user': UserSerializer(user).data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
        }, status=status.HTTP_201_CREATED)

class UserProfileAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

# ----------------- ADMIN USERS VIEWS ----------------- #

class UserListAPIView(APIView):
    permission_classes = [AllowAny] # Temporarily AllowAny for frontend admin integration

    def get(self, request):
        users = User.objects.all().order_by('-date_joined')
        # We need to manually inject "role" for the frontend ("admin" if is_staff else "user")
        data = UserSerializer(users, many=True).data
        for d, u in zip(data, users):
            d['role'] = 'admin' if u.is_staff or u.is_superuser else 'user'
        return Response(data)

class UserDetailAPIView(APIView):
    permission_classes = [AllowAny]

    def patch(self, request, pk):
        try:
            user = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

        is_blocked = request.data.get('isBlocked')
        if is_blocked is not None:
            user.is_blocked = is_blocked
            user.is_active = not is_blocked
            user.save()
            
        return Response({'message': 'User updated successfully'})
