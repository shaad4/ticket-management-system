from django.urls import path
from .views import TicketListCreateView, TicketDetailsView

urlpatterns = [
    path('tickets/',TicketListCreateView.as_view(), name="ticket-list-create"),
    path('tickets/<int:pk>/',TicketDetailsView.as_view(), name="ticket-detail" ),
]