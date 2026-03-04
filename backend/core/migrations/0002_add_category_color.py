# Generated manually for category color

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("core", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="category",
            name="color",
            field=models.CharField(
                choices=[
                    ("orange", "Orange"),
                    ("yellow", "Yellow"),
                    ("sage", "Sage"),
                    ("teal", "Teal"),
                ],
                default="orange",
                max_length=20,
            ),
            preserve_default=True,
        ),
    ]
