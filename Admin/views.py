
from pyexpat.errors import messages
from django.urls import reverse_lazy
from django.views.generic import ListView, DetailView, CreateView, UpdateView, DeleteView
from .models import Admin
from student.models import Student
from Teachers.models import Teacher
from Group.models import Group
from pyexpat.errors import messages
from django.contrib import messages


class AdminListView(ListView):
    model = Admin


class AdminDetailView(DetailView):
    model = Admin
    fields = ['fullname', 'address', 'date_of_inscription']
    context_object_name = "admin"


class AdminCreateView(CreateView):
    model = Admin
    fields = ['fullname', 'address', 'date_of_inscription']
    template_name = "Admin/admin_create.html"
    success_url = reverse_lazy('admin_list')

    def form_valid(self, form):
        messages.success(self.request, "Admin created successfully!")
        return super().form_valid(form)


class AdminUpdateView(UpdateView):
    model = Admin
    fields = ['fullname', 'address', 'date_of_inscription']
    template_name = "Admin/admin_update.html"
    success_url = reverse_lazy('admin_list')



class AdminDeleteView(DeleteView):
    model = Admin
    fields = ['fullname', 'address', 'date_of_inscription']
    template_name = "Admin/admin_delete.html"
    success_url = reverse_lazy('admin_list')


class AdminListStudentView(ListView):
    model = Student
    template_name = "Student/student_list.html"
    context_object_name = "students"

class AdminCreateStudentView(CreateView):
    model = Student
    fields = ['fullname', 'address', 'date_of_inscription']
    template_name = "Admin/admin_create_student.html"
    success_url = reverse_lazy('admin_list_student')  # Ensure this matches the correct URL pattern

    def form_valid(self, form):
        messages.success(self.request, "Student created successfully!")
        return super().form_valid(form)


class AdminCreateTeacherView(CreateView):
    model = Teacher
    fields = ['fullname', 'adress', 'date_of_inscription']
    template_name = "Admin/admin_create_teacher.html"
    success_url = reverse_lazy('teacher_list')

    def form_valid(self, form):
        messages.success(self.request, "Teacher created successfully!")
        return super().form_valid(form)


class AdminCreateGroupView(CreateView):
    model = Group
    fields = ['name', 'teacher', 'year_of_creation']
    template_name = "Admin/admin_create_group.html"
    success_url = reverse_lazy('group_list')

    def form_valid(self, form):
        messages.success(self.request, "The group created successfully!")
        return super().form_valid(form)


class AdminListGroupView(ListView):
    model = Group
