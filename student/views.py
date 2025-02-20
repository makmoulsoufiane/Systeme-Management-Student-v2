from django.shortcuts import render
from .models import Student  # Import the Student model
from django.views.generic import ListView, DetailView


class StudentList(ListView):
    model = Student
    # context_object_name = 'students'



class StudentDetail(DetailView):
    model = Student

# Create your views here.
# def student_list(request):
#     student_list = Student.objects.all()  # Complete the query to fetch all students
#     context = {'students' : student_list}
#     return render(request, 'student/student_list.html', context)  # Pass the student list to the template



# def student_detail(request, id_student):
#     student_detail = Student.objects.get(id_student=id_student)  # Complete the query to fetch all students
#     context = {'student' : student_detail}
#     return render(request, 'student/student_detail.html', context)  # Pass the student list to the template
