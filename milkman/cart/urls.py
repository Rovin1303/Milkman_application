from django.urls import path
from .views import CartItemViewSet, CartSubscribeView

urlpatterns = [
    path('', CartItemViewSet.as_view(), name='cart-list'),
    path('<int:pk>/', CartItemViewSet.as_view(), name='cart-detail'),
    path('subscribe/', CartSubscribeView.as_view(), name='cart-subscribe'),
]
