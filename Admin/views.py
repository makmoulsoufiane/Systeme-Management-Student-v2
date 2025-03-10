# Admin/views.py
from django.views.generic import ListView, DetailView, CreateView
from django.urls import reverse
from django.shortcuts import redirect
from .models import Admin
from student.models import Student
from student.forms import StudentForm

class AdminListView(ListView):
    model = Admin
    template_name = 'admins/admin_list.html'

class AdminDetailView(DetailView):
    model = Admin
    template_name = 'admins/admin_detail.html'
    pk_url_kwarg = 'id_admin'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['students'] = Student.objects.filter(admin=self.object)
        context['form'] = StudentForm()
        return context

    def post(self, request, *args, **kwargs):
        admin = self.get_object()
        form = StudentForm(request.POST)
        if form.is_valid():
            student = form.save(commit=False)
            student.admin = admin
            student.save()
            return redirect('admin-detail', id_admin=admin.pk)
        context = self.get_context_data(object=admin)
        context['form'] = form
        return self.render_to_response(context)

class AdminCreateView(CreateView):
    model = Admin
    template_name = 'Admin/admin_form.html'
    fields = ['fullname']
