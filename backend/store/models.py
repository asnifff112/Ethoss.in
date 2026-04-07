from django.db import models

class Category(models.Model):
    id = models.SlugField(primary_key=True)
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    image_url = models.URLField(max_length=500, blank=True, null=True)

    def __str__(self):
        return self.title

class Product(models.Model):
    id = models.SlugField(primary_key=True)
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    shippingPrice = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='products')
    stock = models.IntegerField(default=0)
    image_urls = models.JSONField(default=list, blank=True)
    isAvailable = models.BooleanField(default=True)
    showLowStock = models.BooleanField(default=True)

    def __str__(self):
        return self.name

class Feedback(models.Model):
    id = models.CharField(max_length=50, primary_key=True)
    userName = models.CharField(max_length=255)
    userEmail = models.EmailField(blank=True, null=True)
    comment = models.TextField()
    rating = models.IntegerField(default=5)
    image_url = models.TextField(blank=True, null=True) # Used for Journals Base64
    status = models.CharField(max_length=50, default='pending') # Journals submit as pending
    createdAt = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Feedback by {self.userName}"

class StudioSubmission(models.Model):
    id = models.CharField(max_length=50, primary_key=True)
    userName = models.CharField(max_length=255)
    userEmail = models.EmailField()
    requestType = models.CharField(max_length=100)
    details = models.TextField()
    status = models.CharField(max_length=50, default='Pending')
    createdAt = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Studio Request by {self.userName}"

