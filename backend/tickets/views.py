from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, SAFE_METHODS
from rest_framework.exceptions import PermissionDenied, ValidationError

from django.shortcuts import get_object_or_404
from .serializers import TicketSerializer
from .pagination import TicketPagination
from .models import Ticket


# Create your views here.


class TicketListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.is_staff:
            tickets = Ticket.objects.all()
        else:
            tickets = Ticket.objects.filter(user=request.user)

        #Filtering
        ticket_status = request.query_params.get("status")
        priority = request.query_params.get("priority")
        user_id = request.query_params.get("user")

        if ticket_status:
            if ticket_status not in Ticket.Status.values:
                    raise ValidationError({"status": "Invalid status."})
            tickets = tickets.filter(status=ticket_status)

        if priority:
            if priority not in Ticket.Priority.values:
                    raise ValidationError({"priority": "Invalid priority."})
            tickets = tickets.filter(priority=priority)

        if user_id:
            if not user_id.isdecimal():
                 raise ValidationError({"user": "Invalid user ID."})
            tickets = tickets.filter(user_id=user_id)

        tickets = tickets.order_by("-created_at")

        paginator = TicketPagination()
        page = paginator.paginate_queryset(tickets, request)

        serializer = TicketSerializer(page, many=True)

        return paginator.get_paginated_response(
            serializer.data
        )


    
    def post(self, request):
        serializer = TicketSerializer(
            data=request.data,
            context={"request": request}
        )

        serializer.is_valid(raise_exception=True)

        serializer.save(user=request.user)

        return Response(
            serializer.data,
            status=status.HTTP_201_CREATED
        )



class TicketDetailsView(APIView):
    permission_classes = [IsAuthenticated]

    def get_ticket(self, request, pk):
        if request.user.is_staff:
            queryset = Ticket.objects.all()
        else:
            queryset = Ticket.objects.filter(user=request.user)

        ticket = get_object_or_404(queryset, pk=pk)

        if (
            not request.user.is_staff
            and ticket.status == Ticket.Status.RESOLVED
            and request.method not in SAFE_METHODS
        ):
            raise PermissionDenied(
                "Resolved tickets are read-only. Ask an administrator to reopen this ticket."
            )

        return ticket

    def get(self, request, pk):
        ticket = self.get_ticket(request, pk)
        serializer = TicketSerializer(ticket)

        return Response(
            serializer.data,
            status=status.HTTP_200_OK
        )   

    def put(self, request, pk):
        ticket = self.get_ticket(request, pk)

        serializer = TicketSerializer(
            ticket,
            data=request.data,
            context={"request": request}
        )

        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(
            serializer.data,
            status=status.HTTP_200_OK
        )  

    def patch(self, request, pk):
        ticket = self.get_ticket(request, pk)

        serializer = TicketSerializer(
            ticket,
            data=request.data,
            partial=True,
            context={"request": request}
        )

        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(
            serializer.data,
            status=status.HTTP_200_OK
        )

    def delete(self, request, pk):
        ticket = self.get_ticket(request, pk)
        ticket.delete()

        return Response(
            status=status.HTTP_204_NO_CONTENT
        )
    
        




