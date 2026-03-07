from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('subscription', '0002_add_duration_pause'),
    ]

    operations = [
        migrations.AddField(
            model_name='subscription',
            name='interval',
            field=models.CharField(choices=[('once', 'One-time'), ('daily', 'Daily'), ('weekly', 'Weekly'), ('monthly', 'Monthly')], default='monthly', max_length=10),
        ),
    ]
