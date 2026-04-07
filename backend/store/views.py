from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from .models import Category, Product, Feedback, StudioSubmission
from .serializers import CategorySerializer, ProductSerializer, FeedbackSerializer, StudioSubmissionSerializer

# ----------------- CATEGORY VIEWS ----------------- #

class CategoryListAPIView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        categories = Category.objects.all()
        serializer = CategorySerializer(categories, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = CategorySerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class CategoryDetailAPIView(APIView):
    permission_classes = [AllowAny]

    def get_object(self, pk):
        try:
            return Category.objects.get(pk=pk)
        except Category.DoesNotExist:
            return None

    def get(self, request, pk):
        category = self.get_object(pk)
        if not category:
            return Response({'error': 'Category not found'}, status=status.HTTP_404_NOT_FOUND)
        serializer = CategorySerializer(category)
        return Response(serializer.data)
        
    def put(self, request, pk):
        category = self.get_object(pk)
        if not category:
            return Response({'error': 'Category not found'}, status=status.HTTP_404_NOT_FOUND)
        serializer = CategorySerializer(category, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
    def delete(self, request, pk):
        category = self.get_object(pk)
        if not category:
            return Response({'error': 'Category not found'}, status=status.HTTP_404_NOT_FOUND)
        category.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

# ----------------- PRODUCT VIEWS ----------------- #

class ProductListAPIView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        category_id = request.query_params.get('category', None)
        products = Product.objects.all()
        
        if category_id:
            products = products.filter(category_id=category_id)
            
        serializer = ProductSerializer(products, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = ProductSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ProductDetailAPIView(APIView):
    permission_classes = [AllowAny]

    def get_object(self, pk):
        try:
            return Product.objects.get(pk=pk)
        except Product.DoesNotExist:
            return None

    def get(self, request, pk):
        product = self.get_object(pk)
        if not product:
            return Response({'error': 'Product not found'}, status=status.HTTP_404_NOT_FOUND)
        serializer = ProductSerializer(product)
        return Response(serializer.data)
        
    def put(self, request, pk):
        product = self.get_object(pk)
        if not product:
            return Response({'error': 'Product not found'}, status=status.HTTP_404_NOT_FOUND)
        serializer = ProductSerializer(product, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        product = self.get_object(pk)
        if not product:
            return Response({'error': 'Product not found'}, status=status.HTTP_404_NOT_FOUND)
        product.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

# ----------------- FEEDBACK VIEWS ----------------- #

class FeedbackListAPIView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        feedbacks = Feedback.objects.all().order_by('-createdAt')
        serializer = FeedbackSerializer(feedbacks, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = FeedbackSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class FeedbackDetailAPIView(APIView):
    permission_classes = [AllowAny]

    def get_object(self, pk):
        try:
            return Feedback.objects.get(pk=pk)
        except Feedback.DoesNotExist:
            return None

    def delete(self, request, pk):
        feedback = self.get_object(pk)
        if not feedback:
            return Response({'error': 'Feedback not found'}, status=status.HTTP_404_NOT_FOUND)
        feedback.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

# ----------------- STUDIO VIEWS ----------------- #

class StudioSubmissionListAPIView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        submissions = StudioSubmission.objects.all().order_by('-createdAt')
        serializer = StudioSubmissionSerializer(submissions, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = StudioSubmissionSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class StudioSubmissionDetailAPIView(APIView):
    permission_classes = [AllowAny]

    def get_object(self, pk):
        try:
            return StudioSubmission.objects.get(pk=pk)
        except StudioSubmission.DoesNotExist:
            return None

    def patch(self, request, pk):
        submission = self.get_object(pk)
        if not submission:
            return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)
            
        status_val = request.data.get('status')
        if status_val:
            submission.status = status_val
            submission.save()
            return Response({'message': 'Status updated'})
        return Response({'error': 'No status provided'}, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        submission = self.get_object(pk)
        if not submission:
            return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)
        submission.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

