from django.views.generic import ListView, DetailView
from .models import Admin

class AdminListView(ListView):
    model = Admin
    

class AdminDetailView(DetailView):
    model = Admin