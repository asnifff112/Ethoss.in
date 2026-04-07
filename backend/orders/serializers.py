from rest_framework import serializers
from .models import Order, OrderItem
from store.serializers import ProductSerializer

class OrderItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_id = serializers.CharField(source='product.id', read_only=True)
    
    class Meta:
        model = OrderItem
        fields = ('product_id', 'product_name', 'quantity', 'price_at_purchase')

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = (
            'id', 'created_at', 'status', 'total_price', 'items',
            'paymentStatus', 'paymentMethod', 'firstName', 'lastName',
            'city', 'state', 'pincode', 'mobile'
        )
