
from pyexpat.errors import messages
from django.urls import reverse_lazy
from django.views.generic import ListView, DetailView, CreateView, UpdateView, DeleteView
from .models import Admin

class AdminListView(ListView):
    model = Admin
    

class AdminDetailView(DetailView):
    model = Admin
    fields = ['fullname', 'address', 'date_of_inscription']


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


class AdminDeleteView(DeleteView):
    model = Admin
    fields = ['fullname', 'address', 'date_of_inscription']
    template_name = "Admin/admin_delete.html"



'''
class AdminCreateStudent(AdminCreateStudentView):
    model = Admin
    fields = ['fullname', 'address', 'date_of_inscription']
    template_name = "Admin/admin_create_student.html" '''