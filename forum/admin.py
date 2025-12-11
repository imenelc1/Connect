from django.contrib import admin
from .models import Forum, Message, Commentaire, Like

# Register your models here.
admin.site.register(Forum)
admin.site.register(Message)
admin.site.register(Commentaire)
admin.site.register(Like)