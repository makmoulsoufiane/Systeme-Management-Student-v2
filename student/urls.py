# student/urls.py
from django.urls import path
from . import views
from .views import StudentListView, StudentDetailView

urlpatterns = [
    path('', StudentListView.as_view(), name='student_list'),
    #path('<int:pk>/', views.StudentDetailView.as_view(), name='student-detail'),
    path('<int:pk>/', StudentDetailView.as_view(), name='student_detail'),

]
