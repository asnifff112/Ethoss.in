from django.urls import path
from .views import OrderListCreateAPIView, OrderDetailAPIView, AdminStatsAPIView

urlpatterns = [
    path('orders/', OrderListCreateAPIView.as_view(), name='orders-list-create'),
    path('orders/<int:pk>/', OrderDetailAPIView.as_view(), name='order-detail'),
    path('admin/stats/', AdminStatsAPIView.as_view(), name='admin-stats'),
]
