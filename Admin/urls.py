from django.urls import path
from . views import AdminCreateStudentView,AdminListStudentView, AdminCreateTeacherView, AdminCreateView, AdminDeleteView,AdminCreateGroupView, AdminListView, AdminDetailView,AdminListGroupView, AdminUpdateView, AdminCreateStudentView, AdminCreateTeacherView, AdminListGroupView, AdminCreateGroupView, AdminListStudentView, AdminCreateStudentView, AdminCreateTeacherView, AdminListGroupView, AdminCreateGroupView


urlpatterns = [
    path('', AdminListView.as_view(), name='admin_list'),
    path('<int:pk>/', AdminDetailView.as_view(), name='admin_detail'),
    path('create/', AdminCreateView.as_view(), name='admin_create'),
    path('<int:pk>/update/', AdminUpdateView.as_view(), name='admin_update'),
    path('<int:pk>/delete/', AdminDeleteView.as_view(), name='admin_delete'),
    path('create-student/', AdminCreateStudentView.as_view(), name='admin_create_student'),
    path('create-teacher/', AdminCreateTeacherView.as_view(), name='admin_create_teacher'),
    path('create-group/', AdminCreateGroupView.as_view(), name='admin_create_group'),
    path('list-group/', AdminListGroupView.as_view(), name='group-list'),
    #path('group-detail/<int:pk>/', AdminDetailGroupView.as_view(), name='group-detail'),
    path('list-student/', AdminListStudentView.as_view(), name='student_list'),
    path('add-student/', AdminCreateStudentView.as_view(), name='add_student'),
    #path('student-details/', AdminStudentDetailsView.as_view(), name='student-details'),
    path('add-teacher/', AdminCreateTeacherView.as_view(), name='add_teacher'),
    #path('teacher-list/', AdminTeacherListView.as_view(), name='teacher-list'),
    path('teachers/<int:pk>/', AdminDetailView.as_view(), name='teacher_detail'),
    path('add-group/', AdminCreateGroupView.as_view(), name='add_Group'),

]
