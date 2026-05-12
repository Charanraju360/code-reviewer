from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from .models import Review, ReviewFile, Comment
from .serializers import ReviewListSerializer, ReviewDetailSerializer
from .utils import extract_files_from_upload, call_openrouter

class ReviewListCreateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        """Return all reviews for the logged-in user."""
        reviews = Review.objects.filter(user=request.user).order_by('-created_at')
        serializer = ReviewListSerializer(reviews, many=True)
        return Response(serializer.data)

    def post(self, request):
        """Accept file upload, run AI review, save to DB."""
        uploaded_file = request.FILES.get('file')
        title = request.data.get('title', uploaded_file.name if uploaded_file else 'Untitled')

        if not uploaded_file:
            return Response({'error': 'No file uploaded.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            files_dict = extract_files_from_upload(uploaded_file)
        except ValueError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

        review = Review.objects.create(user=request.user, title=title, status='pending')

        for filename, content in files_dict.items():
            review_file = ReviewFile.objects.create(review=review, filename=filename, file_content=content)
            comments = call_openrouter(filename, content)
            comment_objs = [
                Comment(review_file=review_file, line_number=c['line_number'], severity=c['severity'], comment=c['comment'])
                for c in comments
            ]
            Comment.objects.bulk_create(comment_objs)

        review.status = 'done'
        review.save()
        serializer = ReviewDetailSerializer(review)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class ReviewDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk):
        try:
            review = Review.objects.get(id=pk, user=request.user)
        except Review.DoesNotExist:
            return Response({'error': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)
        serializer = ReviewDetailSerializer(review)
        return Response(serializer.data)

    def delete(self, request, pk):
        try:
            review = Review.objects.get(id=pk, user=request.user)
        except Review.DoesNotExist:
            return Response({'error': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)
        review.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
