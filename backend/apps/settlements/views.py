from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from apps.households.models import Household
from .models import Settlement
from .serializers import SettlementSerializer
from .services import DebtSimplificationService

class SettlementViewSet(viewsets.ModelViewSet):
    serializer_class = SettlementSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = Settlement.objects.filter(
            household__members__user=self.request.user
        ).distinct()

        hh_id = self.request.query_params.get('household')
        if hh_id:
            qs = qs.filter(household_id=hh_id)
        return qs

    def perform_create(self, serializer):
        payer = serializer.validated_data.get('payer', self.request.user)
        serializer.save(payer=payer)

    @action(detail=True, methods=['post'], url_path='mark-settled')
    def mark_settled(self, request, pk=None):
        settlement = self.get_object()
        settlement.status = 'settled'
        settlement.save()
        return Response(SettlementSerializer(settlement).data)

    @action(detail=False, methods=['get'], url_path='simplified')
    def simplified_debts(self, request):
        hh_id = request.query_params.get('household')
        if not hh_id:
            return Response({'detail': 'Household ID parameter is required.'}, status=status.HTTP_400_BAD_REQUEST)

        household = get_object_or_404(Household, id=hh_id, members__user=request.user)
        result = DebtSimplificationService.simplify_debts(household)
        return Response(result)
