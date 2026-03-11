from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Order
from .serializers import OrderSerializer


class OrderViewSet(APIView):
    authentication_classes = []
    permission_classes = []

    def get(self, request, format=None):
        customer_id = request.query_params.get("customer")
        if customer_id:
            orders = Order.objects.filter(customer_id=customer_id).order_by("-created_at", "-id")
        else:
            orders = Order.objects.all().order_by("-created_at", "-id")
        serializer = OrderSerializer(orders, many=True)
        return Response(serializer.data)
