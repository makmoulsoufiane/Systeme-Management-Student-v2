# teachers/views.py
from django.views.generic import ListView, DetailView, CreateView, UpdateView, DeleteView
from django.urls import reverse_lazy # creates a URL only when it's needed, not immediately
from django.shortcuts import get_object_or_404 # it finds an object in the database and automatically shows a "404 Not Found" error if it not found
from .models import Teacher
from student.models import Student # student model
from exam.models import Exam # exam model
from Scores.models import Score # score model


class TeacherListView(ListView):
    model = Teacher
    template_name = "teachers/teacher_list.html"
    context_object_name = "teachers"

class TeacherDetailView(DetailView):
    model = Teacher
    template_name = "teachers/teacher_detail.html"
    context_object_name = "teacher"

# Score Views
class ScoreCreateView(CreateView):
    model = Score
    fields = ['student', 'exam', 'note']
    template_name = "teachers/score_form.html"

    def form_valid(self, form):
        teacher_id = self.kwargs['teacher_id']
        teacher = get_object_or_404(Teacher, id_teacher=teacher_id)
        form.instance.teacher = teacher
        return super().form_valid(form)

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['teacher_id'] = self.kwargs['teacher_id']  # Send teacher_id to the template
        return context

    def get_success_url(self):
        return reverse_lazy('teacher_detail', kwargs={'pk': self.kwargs['teacher_id']})


class ScoreUpdateView(UpdateView):
    model = Score
    fields = ['note']
    template_name = "teachers/score_form.html"

    def get_success_url(self):
        return reverse_lazy('teacher_detail', kwargs={'pk': self.object.teacher.id_teacher})


class ScoreDeleteView(DeleteView):
    model = Score
    template_name = "teachers/score_confirm_delete.html"

    def get_success_url(self):
        return reverse_lazy('teacher_detail', kwargs={'pk': self.object.teacher.id_teacher})

# Exam Views
class ExamCreateView(CreateView):
    model = Exam
    fields = ['date_hour', 'place', 'name', 'group']
    template_name = "teachers/exam_form.html"

    def form_valid(self, form):
        teacher_id = self.kwargs['teacher_id']
        teacher = get_object_or_404(Teacher, id_teacher=teacher_id)
        form.instance.teacher = teacher
        return super().form_valid(form)

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['teacher_id'] = self.kwargs['teacher_id']  # Send teacher_id to the template
        return context

    def get_success_url(self):
        return reverse_lazy('teacher_detail', kwargs={'pk': self.kwargs['teacher_id']})


class ExamUpdateView(UpdateView):
    model = Exam
    fields = ['date_hour', 'place', 'name']
    template_name = "teachers/exam_form.html"

    def get_success_url(self):
        return reverse_lazy('teacher_detail', kwargs={'pk': self.object.teacher.id_teacher})


class ExamDeleteView(DeleteView):
    model = Exam
    template_name = "teachers/exam_confirm_delete.html"

    def get_success_url(self):
        return reverse_lazy('teacher_detail', kwargs={'pk': self.object.teacher.id_teacher})



"""from django.shortcuts import render
from .models import Teacher

# Create your views here.

def teachers_list(request):
    teachers_list = Teacher.objects.all()
    context = {'teachers_list' : teachers_list}
    return render(request, 'teachers/teachers_list.html', context)"""
