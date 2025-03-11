# Admin/urls.py
from django.urls import path
from .views import (AdminListView, AdminDetailView, StudentCreateView, StudentUpdateView, StudentDeleteView)

urlpatterns = [
    path('', AdminListView.as_view(), name='admin_list'),
    path('<int:pk>/', AdminDetailView.as_view(), name='admin_detail'),
    # Student URLs
    path('<int:admin_id>/add-student/', StudentCreateView.as_view(), name='add_student'),
    path('update-student/<int:pk>/', StudentUpdateView.as_view(), name='update_student'),
    path('delete-student/<int:pk>/', StudentDeleteView.as_view(), name='delete_student'),

]
