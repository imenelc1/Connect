from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('forum', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='forum',
            name='cible',
            field=models.CharField(
                max_length=20,
                choices=[
                    ('etudiants', 'Étudiants'),
                    ('enseignants', 'Enseignants'),
                ],
                default='etudiants',
            ),
        ),
    ]
