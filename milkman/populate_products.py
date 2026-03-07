#!/usr/bin/env python
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'milkman.settings')
django.setup()

from category.models import Category
from product.models import Product


CATALOG = {
    "Milk": {
        "description": "Fresh and regular milk options",
        "products": [
            ("Amul Toned Milk", "Daily toned milk packet", 60, 56),
            ("Amul Full Cream Milk", "Rich full cream milk", 68, 64),
            ("A2 Cow Milk", "Premium A2 cow milk", 85, 80),
            ("Buffalo Milk Premium", "High-fat buffalo milk", 90, 85),
            ("Skimmed Milk", "Low-fat milk", 52, 48),
            ("Double Toned Milk", "Light double toned milk", 48, 45),
            ("Organic Cow Milk", "Certified organic cow milk", 95, 90),
            ("Lactose Free Milk", "Easy-to-digest lactose free milk", 110, 104),
            ("Goat Milk", "Nutrient-rich goat milk", 130, 122),
            ("Raw Farm Milk", "Unprocessed farm fresh milk", 88, 82),
            ("Protein Milk", "High-protein fortified milk", 120, 112),
            ("Calcium Plus Milk", "Calcium-fortified milk", 78, 72),
        ],
    },
    "Flavored Milk": {
        "description": "Ready-to-drink flavored milk beverages",
        "products": [
            ("Chocolate Milk", "Chocolate flavored milk", 45, 42),
            ("Strawberry Milk", "Strawberry flavored milk", 45, 42),
            ("Kesar Milk", "Saffron flavored milk", 55, 52),
            ("Badam Milk", "Almond flavored milk", 60, 56),
            ("Rose Milk", "Rose essence milk drink", 50, 47),
            ("Coffee Milk", "Cold coffee style milk", 52, 49),
        ],
    },
    "Butter & Ghee": {
        "description": "Butter, ghee and spreads",
        "products": [
            ("Amul Butter", "Creamy table butter", 62, 58),
            ("Salted Butter", "Salted spread butter", 66, 62),
            ("Unsalted Butter", "Baking-friendly unsalted butter", 68, 64),
            ("Cow Ghee", "Traditional cow ghee", 230, 218),
            ("Buffalo Ghee", "Rich buffalo milk ghee", 240, 228),
            ("A2 Desi Ghee", "A2 bilona style ghee", 320, 305),
        ],
    },
    "Cheese": {
        "description": "Cheese blocks, cubes and spreads",
        "products": [
            ("Mozzarella Cheese", "Pizza-grade mozzarella", 150, 142),
            ("Cheddar Cheese", "Aged cheddar block", 185, 176),
            ("Feta Cheese", "Brined feta cubes", 168, 160),
            ("Parmesan Cheese", "Hard parmesan wedge", 240, 228),
            ("Gouda Cheese", "Mild dutch gouda", 210, 200),
            ("Processed Cheese Slices", "Sandwich cheese slices", 130, 122),
            ("Cheese Spread", "Creamy cheese spread", 110, 104),
            ("Monterey Jack Cheese", "Mild jack cheese block", 225, 214),
        ],
    },
    "Paneer": {
        "description": "Fresh paneer and paneer variants",
        "products": [
            ("Fresh Paneer", "Soft fresh paneer", 125, 118),
            ("Paneer Cubes", "Ready-to-cook paneer cubes", 132, 124),
            ("Malai Paneer", "Creamy malai paneer", 145, 136),
            ("Smoked Paneer", "Lightly smoked paneer", 155, 146),
            ("Low Fat Paneer", "Protein rich low-fat paneer", 138, 130),
        ],
    },
    "Yogurt & Curd": {
        "description": "Curd, yogurt and probiotic options",
        "products": [
            ("Set Curd", "Traditional set curd", 52, 49),
            ("Greek Yogurt", "Thick high-protein yogurt", 78, 74),
            ("Hung Curd", "Extra thick curd", 64, 60),
            ("Vanilla Yogurt", "Vanilla flavored yogurt cup", 72, 68),
            ("Fruit Yogurt", "Mixed fruit yogurt", 75, 70),
            ("Probiotic Curd", "Live culture probiotic curd", 82, 77),
        ],
    },
    "Cream & Malai": {
        "description": "Cooking cream and fresh malai",
        "products": [
            ("Fresh Cream", "Multi-purpose fresh cream", 95, 90),
            ("Cooking Cream", "Cream for sauces and pasta", 105, 99),
            ("Whipping Cream", "Whippable dessert cream", 120, 114),
            ("Fresh Malai", "Traditional fresh malai", 88, 83),
        ],
    },
    "Milk Powder": {
        "description": "Milk powder and infant-friendly variants",
        "products": [
            ("Whole Milk Powder", "Full-fat milk powder", 220, 208),
            ("Skim Milk Powder", "Low-fat milk powder", 210, 198),
            ("Instant Dairy Whitener", "Tea/coffee whitener", 165, 156),
            ("Infant Milk Formula Stage 1", "Nutritional infant formula", 480, 460),
        ],
    },
    "Lassi & Buttermilk": {
        "description": "Traditional dairy beverages",
        "products": [
            ("Sweet Lassi", "Classic sweet lassi", 42, 39),
            ("Salted Lassi", "Refreshing salted lassi", 40, 37),
            ("Masala Chaas", "Spiced buttermilk", 35, 32),
            ("Mint Buttermilk", "Mint flavored buttermilk", 38, 35),
            ("Mango Lassi", "Mango flavored lassi", 48, 44),
        ],
    },
    "Desserts": {
        "description": "Milk-based desserts and sweets",
        "products": [
            ("Rasgulla Tin", "Soft rasgulla in syrup", 145, 136),
            ("Gulab Jamun Mix", "Instant gulab jamun mix", 120, 112),
            ("Kheer Mix", "Ready kheer premix", 95, 88),
            ("Rabri Cup", "Traditional rabri dessert", 110, 102),
            ("Mishti Doi", "Sweetened bengali yogurt", 85, 80),
        ],
    },
}


def seed_catalog():
    created_categories = 0
    created_products = 0
    updated_products = 0

    print("Adding/Updating expanded dairy catalog...")

    for category_name, data in CATALOG.items():
        category, category_created = Category.objects.get_or_create(
            name=category_name,
            defaults={
                "description": data["description"],
                "is_active": True,
            },
        )
        if category_created:
            created_categories += 1
        else:
            # Keep category descriptions in sync with this source of truth.
            category.description = data["description"]
            category.is_active = True
            category.save(update_fields=["description", "is_active"])

        for name, description, price, subscription in data["products"]:
            product, product_created = Product.objects.get_or_create(
                name=name,
                defaults={
                    "description": description,
                    "price": price,
                    "subscription_amount": subscription,
                    "category": category,
                    "is_active": True,
                },
            )

            if product_created:
                created_products += 1
                continue

            product.description = description
            product.price = price
            product.subscription_amount = subscription
            product.category = category
            product.is_active = True
            product.save(update_fields=["description", "price", "subscription_amount", "category", "is_active"])
            updated_products += 1

    print(f"Categories created: {created_categories}")
    print(f"Products created: {created_products}")
    print(f"Products updated: {updated_products}")
    print(f"Total categories in DB: {Category.objects.count()}")
    print(f"Total products in DB: {Product.objects.count()}")

    print("\nCategory summary:")
    for cat in Category.objects.order_by("name"):
        print(f"  - {cat.name}: {cat.products.count()} products")


if __name__ == "__main__":
    seed_catalog()
