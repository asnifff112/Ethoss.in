from django.contrib import admin
from .models import Category, Product, Feedback, StudioSubmission

admin.site.register(Category)
admin.site.register(Product)

class FeedbackAdmin(admin.ModelAdmin):
    list_display = ('id', 'userName', 'rating', 'status', 'createdAt')
    list_filter = ('status', 'rating')
    search_fields = ('userName', 'userEmail', 'comment')

class StudioSubmissionAdmin(admin.ModelAdmin):
    list_display = ('id', 'userName', 'requestType', 'status', 'createdAt')
    list_filter = ('status', 'requestType')
    search_fields = ('userName', 'userEmail', 'details')

admin.site.register(Feedback, FeedbackAdmin)
admin.site.register(StudioSubmission, StudioSubmissionAdmin)

