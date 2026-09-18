import datetime
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q
from .models import Bill
from .serializers import BillSerializer

class BillViewSet(viewsets.ModelViewSet):
    serializer_class = BillSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = Bill.objects.filter(
            Q(user=user) | Q(household__members__user=user)
        ).distinct()

        hh_id = self.request.query_params.get('household')
        bill_status = self.request.query_params.get('status')

        if hh_id:
            qs = qs.filter(household_id=hh_id)
        if bill_status:
            qs = qs.filter(status=bill_status)
        return qs

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=True, methods=['post'], url_path='mark-paid')
    def mark_paid(self, request, pk=None):
        bill = self.get_object()
        bill.status = 'paid'
        bill.payment_date = datetime.date.today()
        bill.save()
        return Response(BillSerializer(bill).data)
