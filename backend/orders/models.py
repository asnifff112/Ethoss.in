from django.db import models
from django.conf import settings
from store.models import Product

class Order(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='orders')
    
    # Billing/Shipping Details
    firstName = models.CharField(max_length=255)
    lastName = models.CharField(max_length=255)
    addressLine1 = models.CharField(max_length=255)
    addressLine2 = models.CharField(max_length=255, blank=True, null=True)
    city = models.CharField(max_length=100)
    district = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    pincode = models.CharField(max_length=20)
    mobile = models.CharField(max_length=20)
    altMobile = models.CharField(max_length=20, blank=True, null=True)
    notes = models.TextField(blank=True, null=True)

    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=50, default='Pending')
    paymentStatus = models.CharField(max_length=50, default='Unpaid')
    paymentMethod = models.CharField(max_length=50, default='GPay-WhatsApp')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Order {self.id} by {self.firstName} {self.lastName}"

class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.IntegerField(default=1)
    price_at_purchase = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"{self.quantity} x {self.product.name} in Order {self.order.id}"
