# Admin/views.py
from django.views.generic import ListView, DetailView, CreateView, UpdateView, DeleteView
from django.urls import  reverse_lazy
from django.shortcuts import get_object_or_404
from .models import Admin
from student.models import Student
# from student.forms import StudentForm

class AdminListView(ListView):
    model = Admin
    template_name = 'admins/admin_list.html'
    context_object_name = 'admins'

class AdminDetailView(DetailView):
    model = Admin
    template_name = 'admins/admin_detail.html'
    context_object_name = 'admin'


class StudentCreateView(CreateView):
    model = Student
    fields = ['fullname', 'address', 'date_of_inscription', 'admin', 'group']
    template_name = "admins/student_form.html"

    def form_valid(self, form):
        admin_id = self.kwargs['admin_id']
        admin = get_object_or_404(Admin, id_admin=admin_id)
        form.instance.admin = admin
        return super().form_valid(form)

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['admin_id'] = self.kwargs['admin_id']  # Send teacher_id to the template
        return context

    def get_success_url(self):
        return reverse_lazy('admin_detail', kwargs={'pk': self.kwargs['admin_id']})



class StudentUpdateView(UpdateView):
    model = Student
    fields = ['fullname', 'address', 'date_of_inscription', 'admin', 'group']
    template_name = "admins/student_form.html"

    def get_success_url(self):
        return reverse_lazy('admin_detail', kwargs={'pk': self.object.admin.id_admin})

class StudentDeleteView(DeleteView):
    model = Student
    template_name = 'admins/student_confirm_delete.html'

    def get_success_url(self):
        return reverse_lazy('admin_detail', kwargs={'pk': self.object.admin.id_admin})
