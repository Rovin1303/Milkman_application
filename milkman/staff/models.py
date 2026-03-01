from django.db import models
from django.contrib.auth.hashers import make_password

class Staff(models.Model):
    name = models.CharField(max_length=100)
    email = models.EmailField(max_length=100, unique=True)
    phone = models.CharField(max_length=100)
    address = models.CharField(max_length=100)
    password = models.CharField(max_length=255)
    is_active = models.BooleanField(default=True)

    def save(self, *args, **kwargs):
        if not self.pk or not self.password.startswith('pbkdf2_'):
            from django.contrib.auth.hashers import make_password
            self.password = make_password(self.password)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name

    @property
    def is_authenticated(self):
        return True