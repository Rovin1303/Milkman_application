from django.db import models
from django.contrib.auth.hashers import make_password


class Customer(models.Model):
    name = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=15)
    address = models.TextField()
    password = models.CharField(max_length=255)
    is_active = models.BooleanField(default=True)

    def save(self, *args, **kwargs):
        if not self.pk or not self.password.startswith("pbkdf2_"):
            self.password = make_password(self.password)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name