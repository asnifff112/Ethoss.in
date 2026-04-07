from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView
from .views import SignupAPIView, UserProfileAPIView, UserListAPIView, UserDetailAPIView

urlpatterns = [
    path('auth/signup/', SignupAPIView.as_view(), name='signup'),
    path('auth/login/', TokenObtainPairView.as_view(), name='login'),
    path('users/me/', UserProfileAPIView.as_view(), name='user-profile'),
    
    # Admin
    path('users/', UserListAPIView.as_view(), name='user-list'),
    path('users/<int:pk>/', UserDetailAPIView.as_view(), name='user-detail'),
]
