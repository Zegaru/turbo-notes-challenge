# Generated manually for note draft state

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("core", "0002_add_category_color"),
    ]

    operations = [
        migrations.AddField(
            model_name="note",
            name="draft",
            field=models.BooleanField(default=False),
        ),
    ]
