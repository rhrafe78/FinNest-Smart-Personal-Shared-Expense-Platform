from django.contrib import admin
from .models import GroceryList, GroceryItem

class GroceryItemInline(admin.TabularInline):
    model = GroceryItem
    extra = 2

@admin.register(GroceryList)
class GroceryListAdmin(admin.ModelAdmin):
    inlines = [GroceryItemInline]
    list_display = ('name', 'household', 'created_by', 'is_completed', 'created_at')
    list_filter = ('is_completed', 'created_at')
    search_fields = ('name', 'household__name')
