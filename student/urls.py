from django.urls import path,include

from .import views

urlpatterns = [
    path('', views.student_list),
    path('<int:id_student>/', views.student_detail),
]
