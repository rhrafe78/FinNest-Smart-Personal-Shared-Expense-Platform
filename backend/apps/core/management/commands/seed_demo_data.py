import datetime
from decimal import Decimal
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from apps.personal.models import Category, Income, Expense
from apps.budgets.models import Budget
from apps.savings.models import SavingsGoal, SavingsContribution
from apps.households.models import Household, HouseholdMember, HouseholdExpense, ExpenseParticipant
from apps.settlements.models import Settlement
from apps.bills.models import Bill
from apps.groceries.models import GroceryList, GroceryItem
from apps.notifications.models import Notification

User = get_user_model()

class Command(BaseCommand):
    help = 'Seeds database with realistic demo fintech and mess data for FINNEST'

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE("Seeding FINNEST demo ecosystem..."))

        # 1. System Categories
        categories_data = [
            ('Food & Dining', 'expense', 'Utensils', '#ef4444'),
            ('Transportation', 'expense', 'Car', '#f59e0b'),
            ('Shopping', 'expense', 'ShoppingBag', '#ec4899'),
            ('Housing & Rent', 'expense', 'Home', '#6366f1'),
            ('Utilities & Bills', 'expense', 'Zap', '#8b5cf6'),
            ('Healthcare', 'expense', 'HeartPulse', '#06b6d4'),
            ('Entertainment', 'expense', 'Film', '#10b981'),
            ('Education', 'expense', 'GraduationCap', '#3b82f6'),
            ('Salary', 'income', 'Briefcase', '#10b981'),
            ('Freelance & Consulting', 'income', 'Laptop', '#3b82f6'),
            ('Investments & Dividends', 'income', 'TrendingUp', '#8b5cf6'),
            ('Other Income', 'income', 'ArrowDownLeft', '#64748b'),
        ]
        created_cats = {}
        for name, cat_type, icon, color in categories_data:
            cat, _ = Category.objects.get_or_create(
                name=name,
                category_type=cat_type,
                is_system=True,
                defaults={'icon': icon, 'color': color}
            )
            created_cats[name] = cat

        # 2. Demo Users
        users_info = [
            ('rafi@finnest.com', 'Rafi', 'Ahmed', 'password123', Decimal('95000.00')),
            ('rahim@finnest.com', 'Rahim', 'Chowdhury', 'password123', Decimal('78000.00')),
            ('karim@finnest.com', 'Karim', 'Ullah', 'password123', Decimal('65000.00')),
            ('hasan@finnest.com', 'Hasan', 'Mahmud', 'password123', Decimal('70000.00')),
        ]
        users = {}
        for email, f_name, l_name, pwd, inc in users_info:
            user, created = User.objects.get_or_create(
                email=email,
                defaults={
                    'username': email.split('@')[0],
                    'first_name': f_name,
                    'last_name': l_name,
                    'is_verified': True
                }
            )
            user.set_password(pwd)
            user.save()
            if hasattr(user, 'profile'):
                user.profile.currency = 'BDT'
                user.profile.monthly_income = inc
                user.profile.country = 'Bangladesh'
                user.profile.phone = '+880 1712 345678'
                user.profile.save()
            users[email.split('@')[0]] = user

        rafi = users['rafi']
        rahim = users['rahim']
        karim = users['karim']
        hasan = users['hasan']

        # 3. Household: Green View Mess
        household, _ = Household.objects.get_or_create(
            name="Green View Mess",
            defaults={
                'description': 'Bachelor apartment shared with 4 friends at Dhanmondi Lake View',
                'address': 'House 42, Road 9/A, Dhanmondi, Dhaka',
                'currency': 'BDT',
                'invite_code': 'FINNEST77',
                'created_by': rafi
            }
        )

        members_roles = [
            (rafi, 'owner'),
            (rahim, 'admin'),
            (karim, 'member'),
            (hasan, 'member'),
        ]
        for u, r in members_roles:
            HouseholdMember.objects.get_or_create(household=household, user=u, defaults={'role': r})

        # 4. Shared Household Expenses
        today = datetime.date.today()
        shared_expenses_data = [
            ("Apartment Monthly Rent", Decimal('36000.00'), 'Rent', rafi, today - datetime.timedelta(days=12), 'EQUAL'),
            ("High Speed Wi-Fi (50 Mbps)", Decimal('1600.00'), 'Wi-Fi', rahim, today - datetime.timedelta(days=10), 'EQUAL'),
            ("Electricity & Power Grid Bill", Decimal('3200.00'), 'Electricity', hasan, today - datetime.timedelta(days=8), 'EQUAL'),
            ("Monthly Mess Grocery & Bazaar", Decimal('12000.00'), 'Grocery', karim, today - datetime.timedelta(days=5), 'EQUAL'),
            ("Apartment Deep Cleaning & Maid", Decimal('3000.00'), 'Cleaning', rafi, today - datetime.timedelta(days=3), 'EQUAL'),
            ("Drinking Mineral Water 20L Jars", Decimal('1200.00'), 'Water', rahim, today - datetime.timedelta(days=1), 'EQUAL'),
        ]

        all_members = [rafi, rahim, karim, hasan]
        for title, amount, cat, payer, exp_date, method in shared_expenses_data:
            expense, exp_created = HouseholdExpense.objects.get_or_create(
                household=household,
                title=title,
                defaults={
                    'amount': amount,
                    'category': cat,
                    'paid_by': payer,
                    'date': exp_date,
                    'split_method': method,
                    'description': f'Regular monthly shared expense: {title}'
                }
            )
            if exp_created:
                per_member = (amount / Decimal('4.0')).quantize(Decimal('0.01'))
                for m in all_members:
                    ExpenseParticipant.objects.create(
                        expense=expense,
                        user=m,
                        share_amount=per_member,
                        percentage=Decimal('25.00'),
                        shares=Decimal('1.00')
                    )

        # 5. Settlements
        # Karim settled ৳2,000 with Rafi
        Settlement.objects.get_or_create(
            household=household,
            payer=karim,
            recipient=rafi,
            amount=Decimal('2000.00'),
            date=today - datetime.timedelta(days=2),
            defaults={
                'status': 'settled',
                'payment_method': 'bKash Transfer',
                'notes': 'Partial settlement for rent and maid share'
            }
        )
        # Hasan pending settlement to Rafi
        Settlement.objects.get_or_create(
            household=household,
            payer=hasan,
            recipient=rafi,
            amount=Decimal('3500.00'),
            date=today,
            defaults={
                'status': 'pending',
                'payment_method': 'Bank Transfer',
                'notes': 'Sent via City Bank instant transfer, waiting for Rafi confirmation'
            }
        )

        # 6. Household Bills
        bills_data = [
            ("Apartment Rent (Next Month)", Decimal('36000.00'), today + datetime.timedelta(days=14), 'monthly', rafi, 'upcoming'),
            ("DESCO Electricity Bill", Decimal('3800.00'), today + datetime.timedelta(days=2), 'monthly', hasan, 'due_soon'),
            ("Fiber Optic Internet Bill", Decimal('1600.00'), today + datetime.timedelta(days=5), 'monthly', rahim, 'upcoming'),
            ("Titas Gas Supply Bill", Decimal('1080.00'), today + datetime.timedelta(days=10), 'monthly', karim, 'upcoming'),
        ]
        for b_name, b_amt, b_due, b_rec, b_resp, b_stat in bills_data:
            Bill.objects.get_or_create(
                user=rafi,
                household=household,
                name=b_name,
                defaults={
                    'amount': b_amt,
                    'due_date': b_due,
                    'recurrence': b_rec,
                    'responsible_person': b_resp,
                    'status': b_stat,
                    'notes': f'Recurring bill handled by {b_resp.first_name}'
                }
            )

        # 7. Grocery List
        g_list, _ = GroceryList.objects.get_or_create(
            household=household,
            name="Weekly Mess Market List",
            defaults={'created_by': rafi, 'is_completed': False}
        )
        items_data = [
            ("Miniket Premium Rice", "25 kg", Decimal('1800.00'), Decimal('1750.00'), True, karim),
            ("Rupchanda Soybean Oil", "5 Litres", Decimal('950.00'), Decimal('960.00'), True, karim),
            ("Farm Fresh Eggs", "3 Dozen", Decimal('450.00'), Decimal('450.00'), True, karim),
            ("Local Red Onions & Garlic", "5 kg", Decimal('400.00'), Decimal('380.00'), True, karim),
            ("Fresh Broiler Chicken", "4 kg", Decimal('880.00'), Decimal('0.00'), False, None),
            ("Seasonal Vegetables Basket", "1 Pack", Decimal('500.00'), Decimal('0.00'), False, None),
        ]
        for i_name, i_qty, i_est, i_act, i_pur, i_by in items_data:
            GroceryItem.objects.get_or_create(
                grocery_list=g_list,
                name=i_name,
                defaults={
                    'quantity': i_qty,
                    'estimated_price': i_est,
                    'actual_price': i_act,
                    'is_purchased': i_pur,
                    'purchased_by': i_by
                }
            )

        # 8. Rafi Personal Finance (Incomes, Expenses, Budgets, Savings)
        # Incomes
        Income.objects.get_or_create(
            user=rafi,
            source="TechCorp Software Engineer Salary",
            date=today.replace(day=1),
            defaults={
                'category': created_cats['Salary'],
                'amount': Decimal('95000.00'),
                'is_recurring': True,
                'recurrence_frequency': 'monthly',
                'notes': 'Monthly tech salary direct deposit'
            }
        )
        Income.objects.get_or_create(
            user=rafi,
            source="Full-Stack React Freelance Project",
            date=today - datetime.timedelta(days=7),
            defaults={
                'category': created_cats['Freelance & Consulting'],
                'amount': Decimal('32000.00'),
                'is_recurring': False,
                'notes': 'Fintech dashboard landing page contract'
            }
        )

        # Expenses
        rafi_expenses = [
            ("Grocery Mega Mart", Decimal('4200.00'), created_cats['Food & Dining'], today - datetime.timedelta(days=1), 'card'),
            ("Uber Commute to Office", Decimal('850.00'), created_cats['Transportation'], today - datetime.timedelta(days=2), 'mobile_banking'),
            ("Specialty Coffee & Breakfast", Decimal('450.00'), created_cats['Food & Dining'], today - datetime.timedelta(days=3), 'card'),
            ("Health Checkup & Prescription", Decimal('1800.00'), created_cats['Healthcare'], today - datetime.timedelta(days=6), 'card'),
            ("Coursera Cloud Certification", Decimal('3500.00'), created_cats['Education'], today - datetime.timedelta(days=9), 'card'),
            ("Weekend Dining with Friends", Decimal('2200.00'), created_cats['Food & Dining'], today - datetime.timedelta(days=11), 'card'),
        ]
        for merchant, amt, cat, dt, p_method in rafi_expenses:
            Expense.objects.get_or_create(
                user=rafi,
                merchant=merchant,
                date=dt,
                defaults={
                    'amount': amt,
                    'category': cat,
                    'payment_method': p_method,
                    'notes': f'Personal expense at {merchant}'
                }
            )

        # Budgets
        month_start = today.replace(day=1)
        month_end = (month_start + datetime.timedelta(days=32)).replace(day=1) - datetime.timedelta(days=1)
        Budget.objects.get_or_create(
            user=rafi,
            category=created_cats['Food & Dining'],
            start_date=month_start,
            end_date=month_end,
            defaults={
                'name': 'Monthly Food & Dining',
                'amount': Decimal('12000.00'),
                'alert_threshold': 80
            }
        )
        Budget.objects.get_or_create(
            user=rafi,
            category=created_cats['Transportation'],
            start_date=month_start,
            end_date=month_end,
            defaults={
                'name': 'Rideshare & Fuel',
                'amount': Decimal('5000.00'),
                'alert_threshold': 75
            }
        )

        # Savings Goals
        g1, _ = SavingsGoal.objects.get_or_create(
            user=rafi,
            name="MacBook Pro M3 Max",
            defaults={
                'target_amount': Decimal('280000.00'),
                'current_amount': Decimal('195000.00'),
                'target_date': today + datetime.timedelta(days=90),
                'category': 'Gadgets & Tech',
                'description': 'Upgrading primary workstation for development'
            }
        )
        SavingsContribution.objects.get_or_create(
            goal=g1,
            amount=Decimal('25000.00'),
            date=today - datetime.timedelta(days=15),
            defaults={'notes': 'Saved from freelance milestone'}
        )

        SavingsGoal.objects.get_or_create(
            user=rafi,
            name="6-Month Emergency Safety Fund",
            defaults={
                'target_amount': Decimal('300000.00'),
                'current_amount': Decimal('220000.00'),
                'target_date': today + datetime.timedelta(days=180),
                'category': 'Emergency Fund',
                'description': 'Liquid high-yield savings buffer'
            }
        )

        # 9. Notifications
        notifs = [
            ("Electricity Bill Due Soon", "DESCO bill of ৳3,800 is due in 2 days. Hasan is responsible for payment.", "bill_due", False),
            ("Settlement Confirmation", "Karim marked a settlement of ৳2,000 as settled via bKash.", "settlement_request", True),
            ("Food Budget Warning", "You have utilized 57% of your Food & Dining budget this month.", "budget_warning", False),
            ("Welcome to FINNEST", "Manage your money. Share expenses. Stay in control.", "general", True),
        ]
        for title, msg, n_type, is_r in notifs:
            Notification.objects.get_or_create(
                user=rafi,
                title=title,
                defaults={
                    'message': msg,
                    'notification_type': n_type,
                    'is_read': is_r
                }
            )

        self.stdout.write(self.style.SUCCESS("FINNEST demo ecosystem seeded successfully!"))
        self.stdout.write(self.style.SUCCESS("Demo Accounts available: rafi@finnest.com, rahim@finnest.com, karim@finnest.com, hasan@finnest.com (Password: password123)"))
