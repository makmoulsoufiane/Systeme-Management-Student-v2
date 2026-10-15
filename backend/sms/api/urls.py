from django.urls import path
from .views import RecordsView

urlpatterns = [
    path('<str:resource_name>/', RecordsView.as_view(), name='api-list'),
    path('<str:resource_name>/<int:record_id>/', RecordsView.as_view(), name='api-detail'),
]
