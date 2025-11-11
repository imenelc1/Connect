from django.contrib import admin
from .models import Badge, GagnerBadge

@admin.register(Badge)
class BadgeAdmin(admin.ModelAdmin):
    list_display = ('nom', 'description', 'condition')
    search_fields = ('nom',)

@admin.register(GagnerBadge)
class GagnerBadgeAdmin(admin.ModelAdmin):
    list_display = ('utilisateur', 'badge', 'date_obtention')
    search_fields = ('utilisateur__adresse_email', 'badge__nom')
