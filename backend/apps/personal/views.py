from rest_framework import viewsets, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Q
from .models import Category, Income, Expense
from .serializers import CategorySerializer, IncomeSerializer, ExpenseSerializer

class CategoryViewSet(viewsets.ModelViewSet):
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = None

    def get_queryset(self):
        # Return both system categories and user-specific custom categories
        return Category.objects.filter(
            Q(is_system=True) | Q(user=self.request.user)
        ).order_by('name')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user, is_system=False)

class IncomeViewSet(viewsets.ModelViewSet):
    serializer_class = IncomeSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = Income.objects.filter(user=self.request.user)
        cat_id = self.request.query_params.get('category')
        start_date = self.request.query_params.get('start_date')
        end_date = self.request.query_params.get('end_date')
        search = self.request.query_params.get('search')

        if cat_id:
            qs = qs.filter(category_id=cat_id)
        if start_date:
            qs = qs.filter(date__gte=start_date)
        if end_date:
            qs = qs.filter(date__lte=end_date)
        if search:
            qs = qs.filter(Q(source__icontains=search) | Q(notes__icontains=search))
        return qs

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class ExpenseViewSet(viewsets.ModelViewSet):
    serializer_class = ExpenseSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = Expense.objects.filter(user=self.request.user)
        cat_id = self.request.query_params.get('category')
        start_date = self.request.query_params.get('start_date')
        end_date = self.request.query_params.get('end_date')
        payment_method = self.request.query_params.get('payment_method')
        search = self.request.query_params.get('search')

        if cat_id:
            qs = qs.filter(category_id=cat_id)
        if start_date:
            qs = qs.filter(date__gte=start_date)
        if end_date:
            qs = qs.filter(date__lte=end_date)
        if payment_method:
            qs = qs.filter(payment_method=payment_method)
        if search:
            qs = qs.filter(Q(merchant__icontains=search) | Q(notes__icontains=search))
        return qs

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

from apps.households.models import HouseholdExpense

class UnifiedTransactionsView(APIView):
    """Returns merged, chronologically sorted personal incomes, personal expenses, and shared mess expenses."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        incomes = Income.objects.filter(user=request.user)
        expenses = Expense.objects.filter(user=request.user)

        # Filters
        tx_type = request.query_params.get('type')  # 'income', 'expense', 'shared_expense', or all
        cat_id = request.query_params.get('category')
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        search = request.query_params.get('search')

        if cat_id:
            incomes = incomes.filter(category_id=cat_id)
            expenses = expenses.filter(category_id=cat_id)
        if start_date:
            incomes = incomes.filter(date__gte=start_date)
            expenses = expenses.filter(date__gte=start_date)
        if end_date:
            incomes = incomes.filter(date__lte=end_date)
            expenses = expenses.filter(date__lte=end_date)
        if search:
            incomes = incomes.filter(Q(source__icontains=search) | Q(notes__icontains=search))
            expenses = expenses.filter(Q(merchant__icontains=search) | Q(notes__icontains=search))

        combined = []
        if tx_type not in ['expense', 'shared_expense']:
            for inc in incomes:
                combined.append({
                    'id': str(inc.id),
                    'type': 'income',
                    'amount': str(inc.amount),
                    'date': inc.date.isoformat(),
                    'title': inc.source,
                    'source': inc.source,
                    'category_id': str(inc.category.id) if inc.category else None,
                    'category': inc.category.name if inc.category else 'General Income',
                    'category_color': inc.category.color if inc.category else '#10b981',
                    'category_icon': inc.category.icon if inc.category else 'ArrowDownLeft',
                    'payment_method': 'Bank/Deposit',
                    'notes': inc.notes,
                    'receipt': None,
                    'created_at': inc.created_at.isoformat()
                })

        if tx_type not in ['income', 'shared_expense']:
            for exp in expenses:
                receipt_url = None
                try:
                    receipt_url = exp.receipt.url if exp.receipt else None
                except Exception:
                    receipt_url = None

                combined.append({
                    'id': str(exp.id),
                    'type': 'expense',
                    'amount': str(exp.amount),
                    'date': exp.date.isoformat(),
                    'title': exp.merchant or 'Expense',
                    'merchant': exp.merchant or '',
                    'category_id': str(exp.category.id) if exp.category else None,
                    'category': exp.category.name if exp.category else 'Uncategorized',
                    'category_color': exp.category.color if exp.category else '#ef4444',
                    'category_icon': exp.category.icon if exp.category else 'ArrowUpRight',
                    'payment_method': exp.get_payment_method_display(),
                    'payment_method_raw': exp.payment_method,
                    'notes': exp.notes,
                    'receipt': receipt_url,
                    'created_at': exp.created_at.isoformat()
                })

        if tx_type not in ['income', 'expense']:
            shared_qs = HouseholdExpense.objects.filter(
                Q(paid_by=request.user) | Q(participants__user=request.user)
            ).distinct().select_related('household', 'paid_by')

            if start_date:
                shared_qs = shared_qs.filter(date__gte=start_date)
            if end_date:
                shared_qs = shared_qs.filter(date__lte=end_date)
            if search:
                shared_qs = shared_qs.filter(
                    Q(title__icontains=search) | Q(description__icontains=search) | Q(household__name__icontains=search)
                )

            for sexp in shared_qs:
                user_part = sexp.participants.filter(user=request.user).first()
                is_payer = (sexp.paid_by == request.user)
                user_share = str(user_part.share_amount) if user_part else str(sexp.amount)
                receipt_url = None
                try:
                    receipt_url = sexp.receipt.url if sexp.receipt else None
                except Exception:
                    receipt_url = None

                combined.append({
                    'id': str(sexp.id),
                    'type': 'shared_expense',
                    'amount': str(sexp.amount),
                    'user_share': user_share,
                    'is_payer': is_payer,
                    'household_name': sexp.household.name,
                    'household_id': str(sexp.household.id),
                    'date': sexp.date.isoformat(),
                    'title': f"[{sexp.household.name}] {sexp.title}",
                    'category_id': None,
                    'category': f"মেস: {sexp.category}",
                    'category_color': '#8b5cf6',
                    'category_icon': 'Home',
                    'payment_method': f"Paid by {sexp.paid_by.get_full_name() or sexp.paid_by.username}" + (" (You)" if is_payer else ""),
                    'notes': sexp.description or f"মেসের খরচ ({sexp.split_method})",
                    'receipt': receipt_url,
                    'created_at': sexp.created_at.isoformat()
                })

        combined.sort(key=lambda x: (x['date'], x['created_at']), reverse=True)
        return Response(combined)

