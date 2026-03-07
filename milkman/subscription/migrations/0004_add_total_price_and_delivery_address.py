from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("subscription", "0003_add_interval"),
    ]

    operations = [
        migrations.AddField(
            model_name="subscription",
            name="delivery_address",
            field=models.CharField(blank=True, default="", max_length=255),
        ),
        migrations.AddField(
            model_name="subscription",
            name="total_price",
            field=models.DecimalField(decimal_places=2, default=0, max_digits=10),
        ),
    ]
