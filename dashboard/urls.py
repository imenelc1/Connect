from django.urls import path
from . import views

urlpatterns = [
 path('complete-lecon/<int:lecon_id>/', views.complete_lesson),


]
