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
    pause_start_date = models.DateField(null=True, blank=True)
    paused_days_total = models.PositiveIntegerField(default=0)
    total_price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    delivery_address = models.CharField(max_length=255, blank=True, default='')

    def __str__(self):
        return f"{self.customer.name} -> {self.product.name}"

    def _effective_paused_days(self):
        from datetime import date

        paused_days = int(self.paused_days_total or 0)
        if self.is_paused and self.pause_start_date:
            paused_days += max((date.today() - self.pause_start_date).days, 0)
        return paused_days

    @property
    def end_date(self):
        from datetime import timedelta
        try:
            base_days = 30 * int(self.duration_months or 1)
            total_days = max(base_days - 1 + self._effective_paused_days(), 0)
            return self.start_date + timedelta(days=total_days)
        except Exception:
            return None
