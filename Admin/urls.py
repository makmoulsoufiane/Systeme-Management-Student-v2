# Admin/urls.py
from django.urls import path
from .views import (AdminListView, AdminDetailView, StudentCreateView, StudentUpdateView, StudentDeleteView, TeacherCreateView, TeacherUpdateView, TeacherDeleteView)

urlpatterns = [
    path('', AdminListView.as_view(), name='admin_list'),
    path('<int:pk>/', AdminDetailView.as_view(), name='admin_detail'),
    # Student URLs
    path('<int:admin_id>/add-student/', StudentCreateView.as_view(), name='add_student'),
    path('update-student/<int:pk>/', StudentUpdateView.as_view(), name='update_student'),
    path('delete-student/<int:pk>/', StudentDeleteView.as_view(), name='delete_student'),
    # Teacher URLs
    path('<int:admin_id>/add-teacher/', TeacherCreateView.as_view(), name='add_teacher'),
    path('update-teacher/<int:pk>/', TeacherUpdateView.as_view(), name='update_teacher'),
    path('delete-teacher/<int:pk>/', TeacherDeleteView.as_view(), name='delete_teacher'),


]
