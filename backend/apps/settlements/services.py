from decimal import Decimal, ROUND_HALF_UP
from django.db.models import Sum
from apps.core.utils import to_decimal
from apps.households.models import Household, HouseholdExpense, ExpenseParticipant
from .models import Settlement

class DebtSimplificationService:
    @staticmethod
    def calculate_net_balances(household: Household):
        """
        Calculates exact net balance for each member in the household.
        Returns a dict: { user_id: { 'user': user, 'net': Decimal } }
        """
        members = household.members.select_related('user').all()
        net_map = {}

        for m in members:
            u = m.user

            paid_sum = HouseholdExpense.objects.filter(
                household=household,
                paid_by=u
            ).aggregate(total=Sum('amount'))['total'] or Decimal('0.00')

            owed_sum = ExpenseParticipant.objects.filter(
                expense__household=household,
                user=u
            ).aggregate(total=Sum('share_amount'))['total'] or Decimal('0.00')

            settlements_paid = Settlement.objects.filter(
                household=household,
                payer=u,
                status='settled'
            ).aggregate(total=Sum('amount'))['total'] or Decimal('0.00')

            settlements_received = Settlement.objects.filter(
                household=household,
                recipient=u,
                status='settled'
            ).aggregate(total=Sum('amount'))['total'] or Decimal('0.00')

            net = (to_decimal(paid_sum) + to_decimal(settlements_paid)) - (to_decimal(owed_sum) + to_decimal(settlements_received))

            net_map[str(u.id)] = {
                'user_id': str(u.id),
                'name': u.get_full_name() or u.username,
                'email': u.email,
                'net': to_decimal(net)
            }

        return net_map

    @classmethod
    def simplify_debts(cls, household: Household):
        """
        Computes the minimal number of direct settlement transfers to clear all debts.
        Greedy bipartite matching:
          - Debtors (negative balance)
          - Creditors (positive balance)
        Complexity: O(N log N) settlements count <= N - 1
        """
        net_map = cls.calculate_net_balances(household)

        debtors = []   # list of [user_id, name, abs_amount]
        creditors = [] # list of [user_id, name, amount]

        for item in net_map.values():
            val = item['net']
            if val < Decimal('-0.01'):
                debtors.append({
                    'user_id': item['user_id'],
                    'name': item['name'],
                    'amount': abs(val)
                })
            elif val > Decimal('0.01'):
                creditors.append({
                    'user_id': item['user_id'],
                    'name': item['name'],
                    'amount': val
                })

        # Sort largest amounts first
        debtors.sort(key=lambda x: x['amount'], reverse=True)
        creditors.sort(key=lambda x: x['amount'], reverse=True)

        simplified_payments = []

        d_idx = 0
        c_idx = 0

        while d_idx < len(debtors) and c_idx < len(creditors):
            debtor = debtors[d_idx]
            creditor = creditors[c_idx]

            transfer_amount = min(debtor['amount'], creditor['amount'])

            if transfer_amount > Decimal('0.01'):
                simplified_payments.append({
                    'from_user_id': debtor['user_id'],
                    'from_user_name': debtor['name'],
                    'to_user_id': creditor['user_id'],
                    'to_user_name': creditor['name'],
                    'amount': str(to_decimal(transfer_amount)),
                    'currency': household.currency,
                    'status': 'recommended'
                })

            debtor['amount'] -= transfer_amount
            creditor['amount'] -= transfer_amount

            if debtor['amount'] <= Decimal('0.01'):
                d_idx += 1
            if creditor['amount'] <= Decimal('0.01'):
                c_idx += 1

        return {
            'household_id': str(household.id),
            'currency': household.currency,
            'simplified_transactions_count': len(simplified_payments),
            'payments': simplified_payments
        }
