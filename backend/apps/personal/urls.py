from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CategoryViewSet, IncomeViewSet, ExpenseViewSet, UnifiedTransactionsView

router = DefaultRouter()
router.register(r'categories', CategoryViewSet, basename='personal-categories')
router.register(r'incomes', IncomeViewSet, basename='personal-incomes')
router.register(r'expenses', ExpenseViewSet, basename='personal-expenses')

urlpatterns = [
    path('', include(router.urls)),
    path('transactions/', UnifiedTransactionsView.as_view(), name='personal-transactions'),
]
