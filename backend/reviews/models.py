from django.db import models
import uuid
from django.contrib.auth.models import User

class Review(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('done', 'Done'),
        ('failed', 'Failed'),
    ]
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reviews')
    title = models.CharField(max_length=255)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} ({self.user.username})"

class ReviewFile(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    review = models.ForeignKey(Review, on_delete=models.CASCADE, related_name='files')
    filename = models.CharField(max_length=500)
    file_content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.filename

class Comment(models.Model):
    SEVERITY_CHOICES = [
        ('error', 'Error'),
        ('warning', 'Warning'),
        ('suggestion', 'Suggestion'),
    ]
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    review_file = models.ForeignKey(ReviewFile, on_delete=models.CASCADE, related_name='comments')
    line_number = models.IntegerField()
    severity = models.CharField(max_length=20, choices=SEVERITY_CHOICES)
    comment = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Line {self.line_number} - {self.severity}"