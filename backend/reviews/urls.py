from django.urls import path
from .views import ReviewListCreateView, ReviewDetailView

urlpatterns = [
    path('reviews/', ReviewListCreateView.as_view(), name='reviews-list-create'),
    path('reviews/<uuid:pk>/', ReviewDetailView.as_view(), name='review-detail'),
]
