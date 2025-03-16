from django.urls import path
from . views import AdminCreateStudentView,AdminListStudentView, AdminCreateTeacherView, AdminCreateView, AdminDeleteView,AdminCreateGroupView, AdminListView, AdminDetailView,AdminListGroupView, AdminUpdateView, AdminCreateStudentView, AdminCreateTeacherView


urlpatterns = [
    path('', AdminListView.as_view(), name='admin_list'),
    path('<int:pk>/', AdminDetailView.as_view(), name='admin_detail'),
    path('create/', AdminCreateView.as_view(), name='admin_create'), 
    path('<int:pk>/update/', AdminUpdateView.as_view(), name='admin_update'),
    path('<int:pk>/delete/', AdminDeleteView.as_view(), name='admin_delete'),
    path('create-student/', AdminCreateStudentView.as_view(), name='admin_create_student'),
    path('create-teacher/', AdminCreateTeacherView.as_view(), name='admin_create_teacher'),
    path('create-group/', AdminCreateGroupView.as_view(), name='admin_create_group'),
    path('list-group/', AdminListGroupView.as_view(), name='admin_list_group'),
    path('list-student/', AdminListStudentView.as_view(), name='admin_list_student'),
    path('add-student/', AdminCreateStudentView.as_view(), name='add_student'), 
    path('add-teacher/', AdminCreateTeacherView.as_view(), name='add_teacher'), 
    path('add-group/', AdminCreateGroupView.as_view(), name='add_Group'), 
]

