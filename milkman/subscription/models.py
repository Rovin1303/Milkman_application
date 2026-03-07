from django.db import models
from customer.models import Customer
from product.models import Product

# Create your models here.
class Subscription(models.Model):
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name="subscriptions")
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="subscriptions")
    quantity = models.PositiveIntegerField(default=1)
    start_date = models.DateField(auto_now_add=True)
    duration_months = models.PositiveIntegerField(default=1)
    INTERVAL_CHOICES = [
        ('once','One-time'),
        ('daily','Daily'),
        ('weekly','Weekly'),
        ('monthly','Monthly'),
    ]
    interval = models.CharField(max_length=10, choices=INTERVAL_CHOICES, default='monthly')
    is_active = models.BooleanField(default=True)
    # allow user to pause without fully cancelling
    is_paused = models.BooleanField(default=False)
    total_price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    delivery_address = models.CharField(max_length=255, blank=True, default='')

    def __str__(self):
        return f"{self.customer.name} -> {self.product.name}"

    @property
    def end_date(self):
        from datetime import timedelta
        try:
            # approximate by adding 30 days per month
            return self.start_date + timedelta(days=30 * self.duration_months)
        except Exception:
            return None
