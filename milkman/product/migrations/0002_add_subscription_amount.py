from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('product', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='product',
            name='subscription_amount',
            field=models.DecimalField(default=0, max_digits=10, decimal_places=2),
        ),
    ]
