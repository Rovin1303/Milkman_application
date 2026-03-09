from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("subscription", "0004_add_total_price_and_delivery_address"),
    ]

    operations = [
        migrations.AddField(
            model_name="subscription",
            name="pause_start_date",
            field=models.DateField(blank=True, null=True),
        ),
    ]
