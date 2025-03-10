# student/views.py
from django.views.generic import DetailView
from .models import Student

class StudentDetailView(DetailView):
    model = Student
    template_name = 'students/student_detail.html'
    pk_url_kwarg = 'id_student'
