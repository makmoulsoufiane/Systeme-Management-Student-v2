from django.urls import path
from . views import AdminListView, AdminDetailView


urlpatterns = [
    path('', AdminListView.as_view(), name='admin_list'),
    path('<int:pk>/', AdminDetailView.as_view(), name='admin_detail'),
]