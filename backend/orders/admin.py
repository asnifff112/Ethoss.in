from django.contrib import admin
from .models import Order, OrderItem

class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0

class OrderAdmin(admin.ModelAdmin):
    inlines = [OrderItemInline]
    list_display = ('id', 'user', 'firstName', 'total_price', 'status', 'paymentStatus', 'created_at')
    list_filter = ('status', 'paymentStatus', 'created_at')

admin.site.register(Order, OrderAdmin)
