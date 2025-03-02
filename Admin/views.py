
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


class AdminUpdateView(UpdateView):
    model = Admin
    fields = ['fullname', 'address', 'date_of_inscription']
    template_name = "Admin/admin_update.html"


class AdminDeleteView(DeleteView):
    model = Admin
    fields = ['fullname', 'address', 'date_of_inscription']
    template_name = "Admin/admin_delete.html"