from django.urls import path

from . import views

urlpatterns = [
    path('session/', views.session, name='api-session'),
    path('login/', views.sign_in, name='api-login'),
    path('logout/', views.sign_out, name='api-logout'),
    path('<str:resource_name>/', views.records, name='api-list'),
    path('<str:resource_name>/<int:record_id>/', views.records, name='api-detail'),
]
