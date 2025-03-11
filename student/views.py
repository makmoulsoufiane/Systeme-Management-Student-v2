# student/views.py
from django.views.generic import DetailView
from .models import Student

class StudentDetailView(DetailView):
    model = Student
    template_name = 'students/student_detail.html'
    context_object_name = "student"
