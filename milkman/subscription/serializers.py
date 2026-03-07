from rest_framework import serializers
from .models import Subscription


class SubscriptionSerializer(serializers.ModelSerializer):
    end_date = serializers.DateField(read_only=True)
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_price = serializers.DecimalField(source='product.price', read_only=True, max_digits=10, decimal_places=2)
    customer_name = serializers.CharField(source='customer.name', read_only=True)

    class Meta:
        model = Subscription
        fields = "__all__"
        read_only_fields = ("start_date",)
