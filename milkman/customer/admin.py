from django.contrib import admin
from .models import Customer

# make customer visible in Django admin
@admin.register(Customer)
class CustomerAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "email", "phone", "is_active")
    search_fields = ("name", "email")
    list_filter = ("is_active",)

