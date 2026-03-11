from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import re
from datetime import date, timedelta
from .models import Subscription
from .serializers import SubscriptionSerializer

class SubscriptionViewSet(APIView):
    # allow customers to hit this endpoint, staff may still use it
    authentication_classes = []
    permission_classes = []

    def get(self, request, format=None):
        # optionally filter by customer id passed as query parameter
        customer_id = request.query_params.get("customer")
        if customer_id:
            subscriptions = Subscription.objects.filter(customer_id=customer_id)
        else:
            subscriptions = Subscription.objects.all()
        serializer = SubscriptionSerializer(subscriptions, many=True)
        return Response(serializer.data)

    def post(self, request, format=None):
        serializer = SubscriptionSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request, pk, format=None):
        subscription = Subscription.objects.get(pk=pk)
        serializer = SubscriptionSerializer(subscription, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    # partial update can be used for pause/resume toggling
    def patch(self, request, pk, format=None):
        subscription = Subscription.objects.get(pk=pk)
        data = request.data.copy()
        resume_requested = False
        pause_requested = False

        def to_bool(value):
            if isinstance(value, bool):
                return value
            if isinstance(value, str):
                return value.strip().lower() in ("1", "true", "yes", "on")
            return bool(value)

        if "is_paused" in data:
            wants_paused = to_bool(data.get("is_paused"))
            product_name = (subscription.product.name or "").lower()
            is_milk_product = re.search(r"\bmilk\b", product_name) is not None

            if not is_milk_product:
                return Response(
                    {"detail": "Pause/Resume is allowed only for milk subscriptions."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # Keep active/paused state consistent from backend side.
            data["is_active"] = not wants_paused
            pause_requested = (not subscription.is_paused) and wants_paused
            # Resume becomes effective from tomorrow and paused days are deducted.
            resume_requested = subscription.is_paused and not wants_paused

        elif "is_active" in data:
            data["is_paused"] = not to_bool(data.get("is_active"))

        serializer = SubscriptionSerializer(subscription, data=data, partial=True)
        if serializer.is_valid():
            updated_subscription = serializer.save()
            if pause_requested:
                updated_subscription.pause_start_date = date.today()
                updated_subscription.save(update_fields=["pause_start_date"])
            if resume_requested:
                pause_from = updated_subscription.pause_start_date or date.today()
                resume_effective_date = date.today() + timedelta(days=1)
                paused_days = max((resume_effective_date - pause_from).days, 0)
                updated_subscription.paused_days_total = int(updated_subscription.paused_days_total or 0) + paused_days
                updated_subscription.pause_start_date = None
                updated_subscription.save(update_fields=["paused_days_total", "pause_start_date"])
                serializer = SubscriptionSerializer(updated_subscription)
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk, format=None):
        subscription = Subscription.objects.get(pk=pk)
        subscription.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
