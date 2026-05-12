from rest_framework import serializers
from .models import Review, ReviewFile, Comment

class CommentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Comment
        fields = ['id', 'line_number', 'severity', 'comment']

class ReviewFileSerializer(serializers.ModelSerializer):
    comments = CommentSerializer(many=True, read_only=True)
    class Meta:
        model = ReviewFile
        fields = ['id', 'filename', 'file_content', 'comments']

class ReviewListSerializer(serializers.ModelSerializer):
    file_count = serializers.SerializerMethodField()
    class Meta:
        model = Review
        fields = ['id', 'title', 'status', 'created_at', 'file_count']
    def get_file_count(self, obj):
        return obj.files.count()

class ReviewDetailSerializer(serializers.ModelSerializer):
    files = ReviewFileSerializer(many=True, read_only=True)
    class Meta:
        model = Review
        fields = ['id', 'title', 'status', 'created_at', 'files']
