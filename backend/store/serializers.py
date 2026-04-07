from rest_framework import serializers
from .models import Category, Product, Feedback, StudioSubmission

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'

class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = '__all__'

class FeedbackSerializer(serializers.ModelSerializer):
    class Meta:
        model = Feedback
        fields = '__all__'

class StudioSubmissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudioSubmission
        fields = '__all__'
