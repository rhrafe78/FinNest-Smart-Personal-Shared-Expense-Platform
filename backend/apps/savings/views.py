import datetime
from decimal import Decimal
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from apps.core.utils import to_decimal
from .models import SavingsGoal, SavingsContribution
from .serializers import SavingsGoalSerializer, SavingsContributionSerializer

class SavingsGoalViewSet(viewsets.ModelViewSet):
    serializer_class = SavingsGoalSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return SavingsGoal.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=True, methods=['post'], url_path='add-funds')
    def add_funds(self, request, pk=None):
        goal = self.get_object()
        amount_val = request.data.get('amount')
        notes = request.data.get('notes', '')
        date_str = request.data.get('date', datetime.date.today().isoformat())

        if not amount_val:
            return Response({'detail': 'Amount is required.'}, status=status.HTTP_400_BAD_REQUEST)

        amount = to_decimal(amount_val)
        if amount <= Decimal('0.00'):
            return Response({'detail': 'Amount must be positive.'}, status=status.HTTP_400_BAD_REQUEST)

        SavingsContribution.objects.create(
            goal=goal,
            amount=amount,
            date=date_str,
            notes=notes
        )
        goal.current_amount += amount
        goal.save()

        return Response(SavingsGoalSerializer(goal).data, status=status.HTTP_200_OK)

class SavingsContributionViewSet(viewsets.ModelViewSet):
    serializer_class = SavingsContributionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return SavingsContribution.objects.filter(goal__user=self.request.user)
