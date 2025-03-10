# Admin/urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('', views.AdminListView.as_view(), name='admin-list'),
    path('<int:id_admin>/', views.AdminDetailView.as_view(), name='admin-detail'),
    path('create/', views.AdminCreateView.as_view(), name='admin-create'),
]
