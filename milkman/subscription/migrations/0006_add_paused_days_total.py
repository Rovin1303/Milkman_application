from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("subscription", "0005_add_pause_start_date"),
    ]

    operations = [
        migrations.AddField(
            model_name="subscription",
            name="paused_days_total",
            field=models.PositiveIntegerField(default=0),
        ),
    ]
