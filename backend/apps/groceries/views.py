import datetime
from decimal import Decimal
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from apps.households.models import HouseholdExpense, ExpenseParticipant
from apps.households.serializers import HouseholdExpenseSerializer
from .models import GroceryList, GroceryItem
from .serializers import GroceryListSerializer, GroceryItemSerializer

class GroceryListViewSet(viewsets.ModelViewSet):
    serializer_class = GroceryListSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = GroceryList.objects.filter(
            household__members__user=self.request.user
        ).distinct()
        hh_id = self.request.query_params.get('household')
        if hh_id:
            qs = qs.filter(household_id=hh_id)
        return qs

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    @action(detail=True, methods=['post'], url_path='convert-to-expense')
    def convert_to_expense(self, request, pk=None):
        """
        Takes purchased items in the grocery list and converts them
        into a shared household expense with automated equal split.
        """
        grocery_list = self.get_object()
        purchased_items = grocery_list.items.filter(is_purchased=True)

        if not purchased_items.exists():
            # If no items are marked purchased, fall back to all items with estimated price
            purchased_items = grocery_list.items.all()

        if not purchased_items.exists():
            return Response({'detail': 'No grocery items to convert.'}, status=status.HTTP_400_BAD_REQUEST)

        # Sum prices
        total = Decimal('0.00')
        for item in purchased_items:
            price = item.actual_price if item.actual_price > Decimal('0.00') else item.estimated_price
            total += price

        if total <= Decimal('0.00'):
            return Response({'detail': 'Total expense must be greater than zero.'}, status=status.HTTP_400_BAD_REQUEST)

        # Create HouseholdExpense
        expense = HouseholdExpense.objects.create(
            household=grocery_list.household,
            title=f"Grocery: {grocery_list.name}",
            amount=total,
            category='Grocery',
            paid_by=request.user,
            date=datetime.date.today(),
            description=f"Automated shared expense generated from grocery checklist '{grocery_list.name}'",
            split_method='EQUAL'
        )

        # Process equal split among members
        serializer = HouseholdExpenseSerializer(expense)
        serializer._process_participants(expense, [])

        grocery_list.is_completed = True
        grocery_list.save()

        return Response({
            'message': f'Grocery list converted to shared expense of {total} {grocery_list.household.currency}',
            'expense': HouseholdExpenseSerializer(expense).data
        }, status=status.HTTP_201_CREATED)

class GroceryItemViewSet(viewsets.ModelViewSet):
    serializer_class = GroceryItemSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return GroceryItem.objects.filter(
            grocery_list__household__members__user=self.request.user
        ).distinct()

    @action(detail=True, methods=['post'], url_path='toggle-purchased')
    def toggle_purchased(self, request, pk=None):
        item = self.get_object()
        item.is_purchased = not item.is_purchased
        if item.is_purchased:
            item.purchased_by = request.user
            actual = request.data.get('actual_price')
            if actual is not None:
                item.actual_price = Decimal(str(actual))
        item.save()
        return Response(GroceryItemSerializer(item).data)
