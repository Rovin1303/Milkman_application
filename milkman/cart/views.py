from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from decimal import Decimal
import re
from uuid import uuid4
from django.utils import timezone
from .models import CartItem
from .serializers import CartItemSerializer
from subscription.models import Subscription
from orders.models import Order, OrderItem


class CartItemViewSet(APIView):
    # for now no auth (customers pass their id in requests)
    authentication_classes = []
    permission_classes = []

    def get(self, request, format=None):
        customer_id = request.query_params.get("customer")
        if not customer_id:
            return Response({"error": "customer id required"}, status=status.HTTP_400_BAD_REQUEST)
        items = CartItem.objects.filter(customer_id=customer_id)
        serializer = CartItemSerializer(items, many=True)
        return Response(serializer.data)

    def post(self, request, format=None):
        # if same customer & product exists, just increment quantity
        cust = request.data.get("customer")
        prod = request.data.get("product")
        qty = int(request.data.get("quantity", 1))
        if cust and prod:
            existing = CartItem.objects.filter(customer_id=cust, product_id=prod).first()
            if existing:
                existing.quantity += qty
                existing.save()
                serializer = CartItemSerializer(existing)
                return Response(serializer.data, status=status.HTTP_200_OK)
        serializer = CartItemSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request, pk, format=None):
        item = CartItem.objects.get(pk=pk)
        serializer = CartItemSerializer(item, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk, format=None):
        item = CartItem.objects.get(pk=pk)
        item.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class CartSubscribeView(APIView):
    authentication_classes = []
    permission_classes = []

    def post(self, request, format=None):
        customer_id = request.data.get("customer")
        delivery_address = (request.data.get("delivery_address") or "").strip()
        item_plans = request.data.get("item_plans", {}) or {}
        fallback_interval = request.data.get("interval", "monthly")
        fallback_months = request.data.get("duration_months", 1)
        if not isinstance(item_plans, dict):
            return Response({"error": "item_plans must be an object map of cart_item_id -> plan"}, status=status.HTTP_400_BAD_REQUEST)

        if not customer_id:
            return Response({"error": "customer id required"}, status=status.HTTP_400_BAD_REQUEST)

        items = CartItem.objects.filter(customer_id=customer_id)
        if not items.exists():
            return Response({"error": "cart is empty"}, status=status.HTTP_400_BAD_REQUEST)

        monthly_multipliers = {
            1: Decimal("30.00"),
            2: Decimal("60.00"),
            3: Decimal("90.00"),
        }

        def parse_plan(raw_plan):
            plan = str(raw_plan).strip().lower()
            if plan == "once":
                return "once", 1
            if plan in ("1m", "2m", "3m"):
                return "monthly", int(plan[0])
            if plan == "monthly":
                try:
                    months = int(fallback_months)
                except (TypeError, ValueError):
                    months = 1
                return "monthly", months if months in (1, 2, 3) else 1
            return "monthly", 1

        created_subscriptions = []
        created_orders = []
        order = None
        order_total = Decimal("0.00")

        def generate_order_code():
            return f"ORD-{timezone.now().strftime('%Y%m%d%H%M%S')}-{str(uuid4())[:6].upper()}"

        for item in items:
            product_name = (item.product.name or "").lower()
            is_milk_product = re.search(r"\bmilk\b", product_name) is not None
            selected_plan = item_plans.get(str(item.id), item_plans.get(item.id, fallback_interval))
            final_interval, final_months = parse_plan(selected_plan)

            # Business rule: only milk products can be monthly; all others are one-time.
            if not is_milk_product:
                final_interval = "once"
                final_months = 1

            quantity = Decimal(str(item.quantity))
            product_price = Decimal(str(item.product.price))
            subscription_amount = Decimal(str(item.product.subscription_amount or 0))
            recurring_base = subscription_amount if subscription_amount > 0 else product_price

            if final_interval == "once":
                total_price = product_price * quantity
            elif final_interval == "monthly":
                total_price = recurring_base * quantity * monthly_multipliers[final_months]
            else:
                total_price = recurring_base * quantity

            if final_interval == "once":
                if order is None:
                    order = Order.objects.create(
                        customer=item.customer,
                        order_code=generate_order_code(),
                        delivery_address=delivery_address or (item.customer.address or ""),
                        total_amount=Decimal("0.00"),
                    )

                OrderItem.objects.create(
                    order=order,
                    product=item.product,
                    quantity=item.quantity,
                    unit_price=product_price,
                    line_total=total_price,
                )
                order_total += total_price
                continue

            sub = Subscription.objects.create(
                customer=item.customer,
                product=item.product,
                quantity=item.quantity,
                duration_months=final_months,
                interval=final_interval,
                is_active=True,
                total_price=total_price,
                delivery_address=delivery_address or (item.customer.address or ""),
            )
            created_subscriptions.append(
                {
                    "id": sub.id,
                    "product": item.product.name,
                    "interval": final_interval,
                    "duration_months": final_months,
                    "total_price": str(total_price),
                }
            )

        if order is not None:
            order.total_amount = order_total
            order.save(update_fields=["total_amount"])
            created_orders.append(
                {
                    "id": order.id,
                    "order_code": order.order_code,
                    "total_amount": str(order.total_amount),
                }
            )

        # clear the cart
        items.delete()
        return Response(
            {
                "subscriptions": created_subscriptions,
                "orders": created_orders,
            },
            status=status.HTTP_201_CREATED,
        )
