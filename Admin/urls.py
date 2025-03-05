from django.urls import path
from . views import AdminCreateView, AdminDeleteView, AdminListView, AdminDetailView, AdminUpdateView


urlpatterns = [
    path('', AdminListView.as_view(), name='admin_list'),
    path('<int:pk>/', AdminDetailView.as_view(), name='admin_detail'),
    path('create/', AdminCreateView.as_view(), name='admin_create'), 
    path('<int:pk>/update/', AdminUpdateView.as_view(), name='admin_update'),
    path('<int:pk>/delete/', AdminDeleteView.as_view(), name='admin_delete'),
]

