
# teachers/urls.py
from django.urls import path
from .views import TeacherListView, TeacherDetailView  

urlpatterns = [
    path('', TeacherListView.as_view(), name='teacher_list'),
    path('<int:pk>/', TeacherDetailView.as_view(), name='teacher_detail'),
]



"""from django.urls import path,include
from . import views 


urlpatterns = [
    path('', views.teachers_list),
    # path('students/', include('student.urls'))
]
"""