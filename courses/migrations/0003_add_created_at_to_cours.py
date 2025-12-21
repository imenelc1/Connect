from django.db import migrations, models

class Migration(migrations.Migration):

    dependencies = [
        ('courses', '0001_initial'),  # remplace par ta dernière migration si nécessaire
    ]

    operations = [
        migrations.AddField(
            model_name='cours',
            name='created_at',
            field=models.DateTimeField(auto_now_add=True, null=True),
        ),
    ]
