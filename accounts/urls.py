from django.urls import path
from . import views

app_name = 'accounts'
# This is the URL configuration for the accounts app.
# It includes URL patterns for various views related to user accounts.
# The urlpatterns list routes URLs to views. For more information please see:
# Define your URL patterns here
urlpatterns = [
    # Example: path('route/', view_function, name='route_name'),
    path('signup', views.signup, name='signup'),
]
