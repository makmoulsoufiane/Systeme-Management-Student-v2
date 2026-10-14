
# teachers/urls.py
from django.urls import path
from .views import (TeacherListView, TeacherDetailView, ScoreCreateView, ScoreUpdateView, ScoreDeleteView,
    ExamCreateView, ExamUpdateView, ExamDeleteView)

urlpatterns = [
    path('', TeacherListView.as_view(), name='teacher_list'),
    path('<int:pk>/', TeacherDetailView.as_view(), name='teacher_detail'),
    # Score URLs
    path('<int:teacher_id>/add-score/', ScoreCreateView.as_view(), name='add_score'),
    path('update-score/<int:pk>/', ScoreUpdateView.as_view(), name='update_score'),
    path('delete-score/<int:pk>/', ScoreDeleteView.as_view(), name='delete_score'),

    # Exam URLs
    path('<int:teacher_id>/add-exam/', ExamCreateView.as_view(), name='add_exam'),
    path('update-exam/<int:pk>/', ExamUpdateView.as_view(), name='update_exam'),
    path('delete-exam/<int:pk>/', ExamDeleteView.as_view(), name='delete_exam'),
]



"""from django.urls import path,include
from . import views


urlpatterns = [
    path('', views.teachers_list),
    # path('students/', include('student.urls'))
]
"""
