from django.urls import path
from .views import SubscriptionViewSet

urlpatterns = [
    path('', SubscriptionViewSet.as_view(), name='subscription-list'),
    path('<int:pk>/', SubscriptionViewSet.as_view(), name='subscription-detail'),
]
