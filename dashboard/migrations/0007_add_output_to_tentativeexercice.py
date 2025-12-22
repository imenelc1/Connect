from django.db import migrations, models

class Migration(migrations.Migration):

    dependencies = [
        ('dashboard', '0006_alter_progressioncours_temps_passe'),
    ]

    operations = [
        migrations.AddField(
            model_name='tentativeexercice',
            name='output',
            field=models.TextField(null=True, blank=True),
        ),
    ]
