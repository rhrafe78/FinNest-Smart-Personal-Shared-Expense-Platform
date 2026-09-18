import csv
from django.http import HttpResponse
from rest_framework import permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from apps.personal.models import Expense, Income
from apps.households.models import Household, HouseholdExpense
from .services import AnalyticsService

class DashboardSummaryView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        data = AnalyticsService.get_dashboard_summary(request.user)
        return Response(data)

class InsightsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        insights = AnalyticsService.generate_insights(request.user)
        return Response(insights)

class ExportTransactionsCSVView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="finnest_personal_transactions.csv"'

        writer = csv.writer(response)
        writer.writerow(['Type', 'Date', 'Title / Merchant', 'Category', 'Amount', 'Payment Method', 'Notes'])

        incomes = Income.objects.filter(user=request.user).order_by('-date')
        for inc in incomes:
            writer.writerow([
                'Income',
                inc.date,
                inc.source,
                inc.category.name if inc.category else 'General Income',
                inc.amount,
                'Deposit',
                inc.notes
            ])

        expenses = Expense.objects.filter(user=request.user).order_by('-date')
        for exp in expenses:
            writer.writerow([
                'Expense',
                exp.date,
                exp.merchant or 'Expense',
                exp.category.name if exp.category else 'Uncategorized',
                exp.amount,
                exp.get_payment_method_display(),
                exp.notes
            ])

        return response

class ExportHouseholdCSVView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        hh_id = request.query_params.get('household')
        if not hh_id:
            return Response({'detail': 'Household ID is required.'}, status=status.HTTP_400_BAD_REQUEST)

        household = Household.objects.filter(id=hh_id, members__user=request.user).first()
        if not household:
            return Response({'detail': 'Household not found.'}, status=status.HTTP_404_NOT_FOUND)

        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = f'attachment; filename="finnest_{household.name}_expenses.csv"'

        writer = csv.writer(response)
        writer.writerow(['Date', 'Title', 'Category', 'Paid By', 'Amount', 'Split Method', 'Participants Breakdown', 'Description'])

        expenses = household.expenses.all().order_by('-date')
        for exp in expenses:
            breakdown = ", ".join([f"{p.user.get_full_name() or p.user.username}: {p.share_amount}" for p in exp.participants.all()])
            writer.writerow([
                exp.date,
                exp.title,
                exp.category,
                exp.paid_by.get_full_name() or exp.paid_by.username,
                exp.amount,
                exp.split_method,
                breakdown,
                exp.description
            ])

        return response
