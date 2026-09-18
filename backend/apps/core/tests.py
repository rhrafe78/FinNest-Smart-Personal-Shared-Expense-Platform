import datetime
from decimal import Decimal
from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from apps.personal.models import Category, Expense, Income
from apps.budgets.models import Budget
from apps.households.models import Household, HouseholdMember, HouseholdExpense, ExpenseParticipant
from apps.settlements.models import Settlement
from apps.settlements.services import DebtSimplificationService

User = get_user_model()

class FinnestCoreTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user1 = User.objects.create_user(
            email='alice@example.com', username='alice', password='password123'
        )
        self.user2 = User.objects.create_user(
            email='bob@example.com', username='bob', password='password123'
        )
        self.user3 = User.objects.create_user(
            email='charlie@example.com', username='charlie', password='password123'
        )

    def test_auth_login_jwt(self):
        response = self.client.post('/api/v1/auth/login/', {
            'email': 'alice@example.com',
            'password': 'password123'
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('tokens', response.data)
        self.assertIn('access', response.data['tokens'])

    def test_personal_expense_and_budget(self):
        self.client.force_authenticate(user=self.user1)
        cat = Category.objects.create(name='Dining', user=self.user1)

        # Create budget for dining of 1000.00
        today = datetime.date.today()
        b = Budget.objects.create(
            user=self.user1,
            category=cat,
            name='Dining Budget',
            amount=Decimal('1000.00'),
            start_date=today.replace(day=1),
            end_date=today + datetime.timedelta(days=20),
            alert_threshold=80
        )

        # Add expense of 850.00
        Expense.objects.create(
            user=self.user1,
            category=cat,
            amount=Decimal('850.00'),
            date=today,
            merchant='Local Bistro'
        )

        resp = self.client.get(f'/api/v1/budgets/{b.id}/')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.data['status'], 'warning')
        self.assertEqual(float(resp.data['spent_amount']), 850.00)
        self.assertEqual(float(resp.data['remaining_amount']), 150.00)

    def test_household_and_debt_simplification(self):
        # Create household with Alice, Bob, Charlie
        hh = Household.objects.create(name='Test House', created_by=self.user1, currency='BDT')
        HouseholdMember.objects.create(household=hh, user=self.user1, role='owner')
        HouseholdMember.objects.create(household=hh, user=self.user2, role='member')
        HouseholdMember.objects.create(household=hh, user=self.user3, role='member')

        # Scenario:
        # Alice pays 3000 for rent (Equal split among all 3 -> 1000 each)
        # Alice paid: 3000, share: 1000 -> Net +2000
        # Bob owes 1000, Charlie owes 1000
        exp = HouseholdExpense.objects.create(
            household=hh,
            title='Rent',
            amount=Decimal('3000.00'),
            paid_by=self.user1,
            date=datetime.date.today(),
            split_method='EQUAL'
        )
        ExpenseParticipant.objects.create(expense=exp, user=self.user1, share_amount=Decimal('1000.00'))
        ExpenseParticipant.objects.create(expense=exp, user=self.user2, share_amount=Decimal('1000.00'))
        ExpenseParticipant.objects.create(expense=exp, user=self.user3, share_amount=Decimal('1000.00'))

        simplification = DebtSimplificationService.simplify_debts(hh)
        self.assertEqual(simplification['simplified_transactions_count'], 2)

        # Verify payments: Bob -> Alice 1000, Charlie -> Alice 1000
        amounts = [float(p['amount']) for p in simplification['payments']]
        self.assertIn(1000.00, amounts)
