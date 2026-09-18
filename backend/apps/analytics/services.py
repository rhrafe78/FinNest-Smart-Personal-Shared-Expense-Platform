import datetime
from decimal import Decimal
from django.db.models import Sum
from apps.core.utils import to_decimal
from apps.personal.models import Income, Expense, Category
from apps.budgets.models import Budget
from apps.savings.models import SavingsGoal
from apps.households.models import Household, HouseholdMember, HouseholdExpense, ExpenseParticipant
from apps.settlements.models import Settlement
from apps.bills.models import Bill

class AnalyticsService:
    @staticmethod
    def get_dashboard_summary(user):
        today = datetime.date.today()
        first_day_this_month = today.replace(day=1)

        # 1. Personal Incomes & Expenses
        total_income_all = Income.objects.filter(user=user).aggregate(total=Sum('amount'))['total'] or Decimal('0.00')
        total_expense_all = Expense.objects.filter(user=user).aggregate(total=Sum('amount'))['total'] or Decimal('0.00')
        net_balance = total_income_all - total_expense_all

        income_this_month = Income.objects.filter(user=user, date__gte=first_day_this_month).aggregate(total=Sum('amount'))['total'] or Decimal('0.00')
        expense_this_month = Expense.objects.filter(user=user, date__gte=first_day_this_month).aggregate(total=Sum('amount'))['total'] or Decimal('0.00')

        # 2. Savings
        total_savings = SavingsGoal.objects.filter(user=user).aggregate(total=Sum('current_amount'))['total'] or Decimal('0.00')
        target_savings = SavingsGoal.objects.filter(user=user).aggregate(total=Sum('target_amount'))['total'] or Decimal('0.00')

        # 3. Active Budgets Health
        active_budgets = Budget.objects.filter(user=user, start_date__lte=today, end_date__gte=today)
        total_budget_limit = Decimal('0.00')
        total_budget_spent = Decimal('0.00')

        for b in active_budgets:
            total_budget_limit += b.amount
            spent = Expense.objects.filter(
                user=user,
                category=b.category,
                date__gte=b.start_date,
                date__lte=b.end_date
            ).aggregate(total=Sum('amount'))['total'] or Decimal('0.00')
            total_budget_spent += spent

        budget_usage_pct = 0.0
        if total_budget_limit > 0:
            budget_usage_pct = round(float((total_budget_spent / total_budget_limit) * Decimal('100.0')), 1)

        # 4. Monthly Trend (last 6 months)
        monthly_trends = []
        for i in range(5, -1, -1):
            # calculate year and month
            month_date = (today.replace(day=1) - datetime.timedelta(days=i * 28)).replace(day=1)
            # month end
            next_month = (month_date.replace(day=28) + datetime.timedelta(days=4)).replace(day=1)

            m_income = Income.objects.filter(user=user, date__gte=month_date, date__lt=next_month).aggregate(total=Sum('amount'))['total'] or Decimal('0.00')
            m_expense = Expense.objects.filter(user=user, date__gte=month_date, date__lt=next_month).aggregate(total=Sum('amount'))['total'] or Decimal('0.00')

            monthly_trends.append({
                'month': month_date.strftime('%b %Y'),
                'income': float(m_income),
                'expense': float(m_expense),
                'savings': float(max(Decimal('0.00'), m_income - m_expense))
            })

        # 5. Category breakdown for expenses
        categories_qs = Category.objects.filter(expenses__user=user).annotate(total_spent=Sum('expenses__amount')).order_by('-total_spent')[:6]
        category_breakdown = [
            {
                'name': cat.name,
                'color': cat.color,
                'amount': float(cat.total_spent or 0)
            }
            for cat in categories_qs
        ]

        # 6. Shared Household balances summary
        households = Household.objects.filter(members__user=user)
        total_you_owe = Decimal('0.00')
        total_others_owe_you = Decimal('0.00')

        for hh in households:
            paid_sum = HouseholdExpense.objects.filter(household=hh, paid_by=user).aggregate(total=Sum('amount'))['total'] or Decimal('0.00')
            owed_sum = ExpenseParticipant.objects.filter(expense__household=hh, user=user).aggregate(total=Sum('share_amount'))['total'] or Decimal('0.00')
            settled_paid = Settlement.objects.filter(household=hh, payer=user, status='settled').aggregate(total=Sum('amount'))['total'] or Decimal('0.00')
            settled_rec = Settlement.objects.filter(household=hh, recipient=user, status='settled').aggregate(total=Sum('amount'))['total'] or Decimal('0.00')

            net = (paid_sum + settled_paid) - (owed_sum + settled_rec)
            if net < Decimal('0.00'):
                total_you_owe += abs(net)
            elif net > Decimal('0.00'):
                total_others_owe_you += net

        pending_settlements_count = Settlement.objects.filter(recipient=user, status='pending').count()
        upcoming_bills_count = Bill.objects.filter(user=user, status__in=['upcoming', 'due_soon']).count()

        # 7. Daily Tracker for Today
        today_expenses_qs = Expense.objects.filter(user=user, date=today).select_related('category').order_by('-created_at')
        today_expense = today_expenses_qs.aggregate(total=Sum('amount'))['total'] or Decimal('0.00')
        today_expenses_list = [
            {
                'id': str(e.id),
                'type': 'expense',
                'title': e.merchant or e.notes or 'Daily Expense',
                'merchant': e.merchant or '',
                'category_id': str(e.category.id) if e.category else '',
                'category': e.category.name if e.category else 'General',
                'category_color': e.category.color if e.category else '#6366f1',
                'amount': str(to_decimal(e.amount)),
                'payment_method': e.get_payment_method_display(),
                'payment_method_raw': e.payment_method,
                'date': e.date.isoformat(),
                'notes': e.notes or '',
                'time': e.created_at.strftime('%I:%M %p')
            }
            for e in today_expenses_qs
        ]

        # Daily Target logic: user preference or monthly budget / 30 or 0.00
        user_prefs = getattr(user.profile, 'financial_preferences', {}) if hasattr(user, 'profile') else {}
        daily_target_pref = user_prefs.get('daily_target')
        if daily_target_pref:
            try:
                daily_target = Decimal(str(daily_target_pref))
            except Exception:
                daily_target = Decimal('0.00')
        elif total_budget_limit > 0:
            daily_target = round(total_budget_limit / Decimal('30.0'), 2)
        else:
            daily_target = Decimal('0.00')

        if daily_target > Decimal('0.00'):
            today_diff = daily_target - today_expense
            today_status = 'profit' if today_diff >= 0 else 'loss'
            is_profit = today_diff >= 0
        else:
            today_diff = Decimal('0.00')
            today_status = 'neutral'
            is_profit = True

        daily_tracker = {
            'today_date': today.isoformat(),
            'today_date_formatted': today.strftime('%d %b, %Y'),
            'today_expense': str(to_decimal(today_expense)),
            'daily_target': str(to_decimal(daily_target)),
            'difference': str(to_decimal(abs(today_diff))),
            'status': today_status,
            'is_profit': is_profit,
            'expenses_list': today_expenses_list,
            'count': len(today_expenses_list)
        }

        # 8. Base Salary & Cash in Hand Breakdown
        monthly_salary = to_decimal(getattr(user.profile, 'monthly_income', Decimal('0.00')) if hasattr(user, 'profile') else Decimal('0.00'))
        income_this_month_dec = to_decimal(income_this_month)
        expense_this_month_dec = to_decimal(expense_this_month)
        effective_income = monthly_salary if monthly_salary > Decimal('0.00') else income_this_month_dec
        remaining_salary = effective_income - expense_this_month_dec
        spent_pct = 0.0
        if effective_income > Decimal('0.00'):
            spent_pct = min(100.0, round(float((expense_this_month_dec / effective_income) * Decimal('100.0')), 1))

        # Specific user-requested expense category amounts for this month
        month_expenses = Expense.objects.filter(user=user, date__gte=first_day_this_month)
        cat_housing = month_expenses.filter(category__name__icontains='Rent').aggregate(t=Sum('amount'))['t'] or Decimal('0.00')
        cat_medicine = month_expenses.filter(category__name__iregex=r'health|medicine|medical').aggregate(t=Sum('amount'))['t'] or Decimal('0.00')
        cat_shopping = month_expenses.filter(category__name__icontains='Shopping').aggregate(t=Sum('amount'))['t'] or Decimal('0.00')
        cat_food = month_expenses.filter(category__name__icontains='Food').aggregate(t=Sum('amount'))['t'] or Decimal('0.00')
        cat_transport = month_expenses.filter(category__name__icontains='Transport').aggregate(t=Sum('amount'))['t'] or Decimal('0.00')
        cat_bills = month_expenses.filter(category__name__iregex=r'bill|utilit').aggregate(t=Sum('amount'))['t'] or Decimal('0.00')

        salary_breakdown = {
            'monthly_salary': str(to_decimal(monthly_salary)),
            'effective_income': str(to_decimal(effective_income)),
            'total_spent_this_month': str(to_decimal(expense_this_month)),
            'remaining_salary': str(to_decimal(remaining_salary)),
            'spent_pct': spent_pct,
            'is_overspent': remaining_salary < Decimal('0.00'),
            'categories': {
                'housing_rent': str(to_decimal(cat_housing)),
                'medicine': str(to_decimal(cat_medicine)),
                'shopping': str(to_decimal(cat_shopping)),
                'food': str(to_decimal(cat_food)),
                'transport': str(to_decimal(cat_transport)),
                'bills': str(to_decimal(cat_bills))
            }
        }

        # 9. Recent transactions (Personal)
        recent_incomes = list(Income.objects.filter(user=user).order_by('-date', '-created_at')[:5])
        recent_expenses = list(Expense.objects.filter(user=user).order_by('-date', '-created_at')[:5])
        recent_all = []
        for inc in recent_incomes:
            recent_all.append({
                'id': str(inc.id),
                'type': 'income',
                'title': inc.source,
                'source': inc.source,
                'category_id': str(inc.category.id) if inc.category else '',
                'category': inc.category.name if inc.category else 'Income',
                'category_color': inc.category.color if inc.category else '#10b981',
                'amount': str(to_decimal(inc.amount)),
                'date': inc.date.isoformat(),
                'notes': inc.notes or '',
                'created_at': inc.created_at.isoformat()
            })
        for exp in recent_expenses:
            recent_all.append({
                'id': str(exp.id),
                'type': 'expense',
                'title': exp.merchant or 'Expense',
                'merchant': exp.merchant or '',
                'category_id': str(exp.category.id) if exp.category else '',
                'category': exp.category.name if exp.category else 'Expense',
                'category_color': exp.category.color if exp.category else '#ef4444',
                'amount': str(to_decimal(exp.amount)),
                'payment_method': exp.get_payment_method_display(),
                'payment_method_raw': exp.payment_method,
                'date': exp.date.isoformat(),
                'notes': exp.notes or '',
                'created_at': exp.created_at.isoformat()
            })
        recent_all.sort(key=lambda x: (x['date'], x['created_at']), reverse=True)
        recent_all = recent_all[:6]

        currency = getattr(user.profile, 'currency', 'BDT') if hasattr(user, 'profile') else 'BDT'

        return {
            'currency': currency,
            'net_balance': str(to_decimal(net_balance)),
            'total_income': str(to_decimal(total_income_all)),
            'total_expense': str(to_decimal(total_expense_all)),
            'income_this_month': str(to_decimal(income_this_month)),
            'expense_this_month': str(to_decimal(expense_this_month)),
            'total_savings': str(to_decimal(total_savings)),
            'target_savings': str(to_decimal(target_savings)),
            'budget_limit': str(to_decimal(total_budget_limit)),
            'budget_spent': str(to_decimal(total_budget_spent)),
            'budget_usage_pct': budget_usage_pct,
            'monthly_trends': monthly_trends,
            'category_breakdown': category_breakdown,
            'daily_tracker': daily_tracker,
            'salary_breakdown': salary_breakdown,
            'recent_transactions': recent_all,
            'shared_summary': {
                'active_households': households.count(),
                'you_owe': str(to_decimal(total_you_owe)),
                'others_owe_you': str(to_decimal(total_others_owe_you)),
                'pending_settlements': pending_settlements_count,
                'upcoming_bills': upcoming_bills_count
            }
        }

    @staticmethod
    def generate_insights(user):
        """Generates dynamic, AI-like financial insights based on actual user data."""
        insights = []
        today = datetime.date.today()
        first_day_this_month = today.replace(day=1)
        first_day_prev_month = (first_day_this_month - datetime.timedelta(days=1)).replace(day=1)

        # 1. Budget warnings
        active_budgets = Budget.objects.filter(user=user, start_date__lte=today, end_date__gte=today)
        for b in active_budgets:
            spent = Expense.objects.filter(
                user=user,
                category=b.category,
                date__gte=b.start_date,
                date__lte=b.end_date
            ).aggregate(total=Sum('amount'))['total'] or Decimal('0.00')

            pct = (spent / b.amount) * Decimal('100.0') if b.amount > 0 else Decimal('0')
            if pct >= Decimal('100.0'):
                insights.append({
                    'id': f"budget-exceeded-{b.id}",
                    'type': 'danger',
                    'icon': 'AlertCircle',
                    'title': f"Budget Exceeded: {b.category.name}",
                    'message': f"You have reached {round(float(pct))}% of your {b.name} limit. Consider reviewing discretionary spending.",
                })
            elif pct >= Decimal(str(b.alert_threshold)):
                insights.append({
                    'id': f"budget-warn-{b.id}",
                    'type': 'warning',
                    'icon': 'AlertTriangle',
                    'title': f"Approaching Budget: {b.category.name}",
                    'message': f"You have used {round(float(pct))}% of your {b.name} budget with {b.end_date - today} days left in the cycle.",
                })

        # 2. Savings Goal Projections
        goals = SavingsGoal.objects.filter(user=user)
        for g in goals:
            rem = g.target_amount - g.current_amount
            if rem > Decimal('0.00'):
                days_left = (g.target_date - today).days
                if days_left > 0:
                    months_left = max(1, round(days_left / 30.44))
                    monthly_needed = rem / Decimal(str(months_left))
                    insights.append({
                        'id': f"goal-proj-{g.id}",
                        'type': 'info',
                        'icon': 'Target',
                        'title': f"Goal Projection: {g.name}",
                        'message': f"At a saving rate of ~{to_decimal(monthly_needed)}/month, you are on track to reach '{g.name}' in {months_left} months.",
                    })

        # 3. Category MoM Spending Comparison
        top_cats = Category.objects.filter(expenses__user=user).distinct()[:4]
        for cat in top_cats:
            cur_spent = Expense.objects.filter(
                user=user, category=cat, date__gte=first_day_this_month
            ).aggregate(total=Sum('amount'))['total'] or Decimal('0.00')

            prev_spent = Expense.objects.filter(
                user=user, category=cat, date__gte=first_day_prev_month, date__lt=first_day_this_month
            ).aggregate(total=Sum('amount'))['total'] or Decimal('0.00')

            if prev_spent > Decimal('0.00') and cur_spent > Decimal('0.00'):
                diff_pct = ((cur_spent - prev_spent) / prev_spent) * Decimal('100.0')
                if diff_pct > Decimal('15.0'):
                    insights.append({
                        'id': f"cat-diff-up-{cat.id}",
                        'type': 'warning',
                        'icon': 'TrendingUp',
                        'title': f"{cat.name} Spending Higher",
                        'message': f"You spent {round(float(diff_pct))}% more on {cat.name} this month compared to last month.",
                    })
                elif diff_pct < Decimal('-10.0'):
                    insights.append({
                        'id': f"cat-diff-down-{cat.id}",
                        'type': 'success',
                        'icon': 'TrendingDown',
                        'title': f"{cat.name} Savings",
                        'message': f"Great job! Your {cat.name} expenses decreased by {abs(round(float(diff_pct)))}% this month.",
                    })

        # 4. Fallback positive reinforcement if insights list is short
        if len(insights) < 2:
            insights.append({
                'id': 'general-positive',
                'type': 'success',
                'icon': 'CheckCircle2',
                'title': 'Balanced Cash Flow',
                'message': 'Your overall monthly savings rate is healthy. Keep tracking every transaction to maintain clear visibility.',
            })

        return insights
