from django.urls import path
from .views import CategoryListAPIView, CategoryDetailAPIView, ProductListAPIView, ProductDetailAPIView, FeedbackListAPIView, FeedbackDetailAPIView, StudioSubmissionListAPIView, StudioSubmissionDetailAPIView

urlpatterns = [
    path('categories/', CategoryListAPIView.as_view(), name='category-list'),
    path('categories/<str:pk>/', CategoryDetailAPIView.as_view(), name='category-detail'),
    path('products/', ProductListAPIView.as_view(), name='product-list'),
    path('products/<str:pk>/', ProductDetailAPIView.as_view(), name='product-detail'),
    path('feedbacks/', FeedbackListAPIView.as_view(), name='feedback-list'),
    path('feedbacks/<str:pk>/', FeedbackDetailAPIView.as_view(), name='feedback-detail'),
    path('studio_submissions/', StudioSubmissionListAPIView.as_view(), name='studio-list'),
    path('studio_submissions/<str:pk>/', StudioSubmissionDetailAPIView.as_view(), name='studio-detail'),
]
