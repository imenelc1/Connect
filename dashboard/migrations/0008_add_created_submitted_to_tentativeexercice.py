from django.db import migrations, models

class Migration(migrations.Migration):

    dependencies = [
        ('dashboard', '0007_add_output_to_tentativeexercice'),  # ton dernier numéro de migration
    ]

    operations = [
        migrations.AddField(
            model_name='tentativeexercice',
            name='created_at',
            field=models.DateTimeField(auto_now_add=True, null=True),
        ),
        migrations.AddField(
            model_name='tentativeexercice',
            name='submitted_at',
            field=models.DateTimeField(null=True, blank=True),
        ),
    ]
