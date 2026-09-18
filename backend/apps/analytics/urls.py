from django.urls import path
from .views import (
    DashboardSummaryView,
    InsightsView,
    ExportTransactionsCSVView,
    ExportHouseholdCSVView
)

urlpatterns = [
    path('dashboard/', DashboardSummaryView.as_view(), name='analytics-dashboard'),
    path('insights/', InsightsView.as_view(), name='analytics-insights'),
    path('export/transactions/', ExportTransactionsCSVView.as_view(), name='export-transactions-csv'),
    path('export/household/', ExportHouseholdCSVView.as_view(), name='export-household-csv'),
]
