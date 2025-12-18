from django.contrib import admin

from badges.models import Badge, GagnerBadge

# --- Badges ---
@admin.register(Badge)
class BadgeAdmin(admin.ModelAdmin):
    list_display = ('nom', 'description', 'condition', 'categorie', 'numpoints')
    search_fields = ('nom', 'condition', 'categorie')

@admin.register(GagnerBadge)
class GagnerBadgeAdmin(admin.ModelAdmin):
    list_display = ('utilisateur', 'badge', 'date_obtention')
    search_fields = ('utilisateur__adresse_email', 'badge__nom')
