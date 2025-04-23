# student/views.py
from django.views.generic import DetailView, ListView
from .models import Student





class StudentListView(ListView):
    model = Student
    template_name = 'students/student_list.html'
    context_object_name = "students"

class StudentDetailView(DetailView):
    model = Student
    template_name = 'students/student_detail.html'
    context_object_name = "student"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        student = self.object

        # Get all scores with their related exam information
        context['scores'] = student.scores.all().select_related('exam', 'teacher')

        # Get all exams for the student's group
        if hasattr(student, 'group'):
            context['group_exams'] = student.group.exams.all().select_related('teacher')

        return context
