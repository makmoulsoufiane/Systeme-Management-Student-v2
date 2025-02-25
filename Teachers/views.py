# teachers/views.py
from django.views.generic import ListView, DetailView
from .models import Teacher

class TeacherListView(ListView):
    model = Teacher
    template_name = "teachers/teacher_list.html"
    context_object_name = "teachers"

class TeacherDetailView(DetailView):
    model = Teacher
    template_name = "teachers/teacher_detail.html"
    context_object_name = "teacher"



"""from django.shortcuts import render
from .models import Teacher

# Create your views here.

def teachers_list(request):
    teachers_list = Teacher.objects.all()
    context = {'teachers_list' : teachers_list}
    return render(request, 'teachers/teachers_list.html', context)"""