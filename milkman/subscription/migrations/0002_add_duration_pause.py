from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('subscription', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='subscription',
            name='duration_months',
            field=models.PositiveIntegerField(default=1),
        ),
        migrations.AddField(
            model_name='subscription',
            name='is_paused',
            field=models.BooleanField(default=False),
        ),
    ]
