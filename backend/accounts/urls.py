from django.urls import path
from .views import AccountDetailView, AccountListCreateView, ChangePasswordView, LoginView, LogoutView, MeView, RefreshView

urlpatterns = [
    path('auth/login/', LoginView.as_view(), name='login'),
    path('auth/refresh/', RefreshView.as_view(), name='token-refresh'),
    path('auth/me/', MeView.as_view(), name='current-user'),
    path('auth/change-password/', ChangePasswordView.as_view(), name='change-password'),
    path('auth/logout/', LogoutView.as_view(), name='logout'),
    path('admin/teachers/', AccountListCreateView.as_view(role='teacher')),
    path('admin/teachers/<int:pk>/', AccountDetailView.as_view(role='teacher')),
    path('admin/students/', AccountListCreateView.as_view(role='student')),
    path('admin/students/<int:pk>/', AccountDetailView.as_view(role='student')),
]
