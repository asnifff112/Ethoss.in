from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from store.models import Product
from users.models import User
from .models import Order, OrderItem
from .serializers import OrderSerializer
from django.db.models import Sum

class OrderListCreateAPIView(APIView):
    permission_classes = [AllowAny] # AllowAny for Admin frontends to fetch all easily

    def get(self, request):
        # We deliver all orders for admin dashboard to simplify Next.js connection
        orders = Order.objects.all().order_by('-created_at')
        serializer = OrderSerializer(orders, many=True)
        # We need to map some fields to match the Next.js `Order` interface
        data = serializer.data
        for d, o in zip(data, orders):
            d['customerName'] = f"{d.get('firstName', '')} {d.get('lastName', '')}".strip()
            # We attach user email if present
            d['customerEmail'] = o.user.email if o.user else 'guest@ethoss.in'
            # First product name for list view
            d['productName'] = d['items'][0]['product_name'] if d['items'] else 'Multiple Items'
            d['quantity'] = sum(item['quantity'] for item in d['items'])
            d['totalPrice'] = d['total_price']
            d['createdAt'] = d['created_at']
        return Response(data)

    def post(self, request):
        data = request.data
        items = data.get('items', [])
        
        if not items:
            return Response({'error': 'No items provided'}, status=status.HTTP_400_BAD_REQUEST)

        # Calculate total price & verify stock
        total_price = 0
        order_items_data = []
        
        for item in items:
            product_id = item.get('product_id')
            qty = item.get('quantity', 1)
            try:
                product = Product.objects.get(id=product_id)
                # Ensure stock is sufficient
                if product.stock < qty:
                    return Response({'error': f'Not enough stock for {product.name}'}, status=status.HTTP_400_BAD_REQUEST)
                
                price_at_purchase = product.price
                total_price += price_at_purchase * qty
                order_items_data.append({
                    'product': product,
                    'quantity': qty,
                    'price_at_purchase': price_at_purchase
                })
            except Product.DoesNotExist:
                return Response({'error': f'Product ID {product_id} not found'}, status=status.HTTP_404_NOT_FOUND)

        # Handle user (guest vs authenticated) 
        # (for now just using first SuperUser or None if doesn't exist)
        user = request.user if request.user.is_authenticated else User.objects.filter(is_superuser=True).first()

        # Create Order (extract billing fields)
        order = Order.objects.create(
            user=user,
            firstName=data.get('firstName', ''),
            lastName=data.get('lastName', ''),
            addressLine1=data.get('addressLine1', ''),
            addressLine2=data.get('addressLine2', ''),
            city=data.get('city', ''),
            district=data.get('district', ''),
            state=data.get('state', ''),
            pincode=data.get('pincode', ''),
            mobile=data.get('mobile', ''),
            altMobile=data.get('altMobile', ''),
            notes=data.get('notes', ''),
            paymentMethod=data.get('paymentMethod', 'GPay-WhatsApp'),
            paymentStatus=data.get('paymentStatus', 'Unpaid'),
            total_price=total_price,
            status='Pending'
        )

        # Create Order Items and decrease stock
        for item_data in order_items_data:
            product = item_data['product']
            product.stock -= item_data['quantity']
            product.save()
            
            OrderItem.objects.create(
                order=order,
                product=product,
                quantity=item_data['quantity'],
                price_at_purchase=item_data['price_at_purchase']
            )

        return Response({
            'message': 'Order placed successfully',
            'order_id': order.id,
            'status': order.status,
            'total_price': float(order.total_price)
        }, status=status.HTTP_201_CREATED)

class OrderDetailAPIView(APIView):
    permission_classes = [AllowAny]

    def patch(self, request, pk):
        try:
            order = Order.objects.get(pk=pk)
        except Order.DoesNotExist:
            return Response({'error': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)

        new_status = request.data.get('status')
        if new_status:
            order.status = new_status
            order.save()

        return Response({'message': 'Order status updated'})

# ----------------- ADMIN STATS ----------------- #

class AdminStatsAPIView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        total_sales = Order.objects.filter(paymentStatus='Paid').aggregate(Sum('total_price'))['total_price__sum'] or 0
        pending_orders = Order.objects.exclude(status__in=['Delivered', 'Cancelled']).count()
        active_users = User.objects.filter(is_blocked=False).count()

        stats = [
            {
                'label': "Total Sales",
                'value': f"₹{total_sales:,.0f}",
                'change': "+12%" # simulated
            },
            {
                'label': "Pending Orders",
                'value': str(pending_orders),
                'change': "Needs action"
            },
            {
                'label': "Active Users",
                'value': str(active_users),
                'change': "+2 this week"
            }
        ]

        return Response({'stats': stats})
