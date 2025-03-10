# student/urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('<int:id_student>/', views.StudentDetailView.as_view(), name='student-detail'),
]
