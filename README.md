# Milkman - Full Stack Dairy Delivery Platform

Milkman is a full-stack dairy delivery project with:
- Django REST backend
- Customer web app (React + Vite)
- Admin web app (React + Vite + Bootstrap)

It supports catalog browsing, cart checkout, monthly milk subscriptions, one-time orders, and admin management operations.

## Tech Stack

- Backend: Django, Django REST Framework, SQLite
- Customer App: React, Vite
- Admin App: React, Vite, Bootstrap

## Project Structure

```text
daytwo/
  milkman/            Django backend
  milkman-frontend/   Customer-facing frontend
  reactadmin/         Admin panel frontend
  PRODUCTS_CATALOG.md
  README.md
```

## Core Functional Flow

- Milk products can be checked out as monthly subscriptions.
- Non-milk products are handled as one-time orders.
- Checkout supports mixed carts.
- One-time orders are grouped by order batch code.
- Subscriptions and orders are shown separately in the customer UI.

## Applications and URLs

- Backend API: http://127.0.0.1:8000/
- Customer Frontend (Vite): usually http://localhost:5173/
- Admin Frontend (Vite): usually http://localhost:5174/ (or next free port)

## Local Setup

### 1. Backend Setup (Django)

From workspace root (milkproject):

```powershell
env\Scripts\Activate.ps1
cd milkman\daytwo\milkman
python manage.py migrate
python manage.py runserver
```

If packages are missing:

```powershell
pip install django djangorestframework django-cors-headers requests
```

### 2. Customer Frontend Setup

```powershell
cd milkman\daytwo\milkman-frontend
npm install
npm run dev
```

### 3. Admin Frontend Setup

```powershell
cd milkman\daytwo\reactadmin
npm install
npm run dev
```

## API Overview

### Authentication

- `POST /staff/login/` - staff login
- `POST /customer/login/` - customer login

### Master Data

- `GET|POST /staff/staff/`
- `PUT|DELETE /staff/staff/<id>/`
- `GET|POST /customer/`
- `GET|POST /category/`
- `GET|POST /product/`

### Shopping and Billing

- `GET|POST /cart/`
- `POST /cart/subscribe/`
- `GET /orders/`
- `GET|POST /subscription/`

## Default Login Credentials (Local Demo)

- Customer
  - Email: `user@gmail.com`
  - Password: `user`
- Admin/Staff
  - Email: `admin@gmail.com`
  - Password: `admin123`

## Notes

- CORS is enabled for local development.
- Primary database file: `milkman/db.sqlite3`.
- This setup is intended for development mode.

## Troubleshooting

- Backend not reachable:
  - Ensure `python manage.py runserver` is running from `milkman/daytwo/milkman`.
- Frontend API errors:
  - Confirm backend is running on `127.0.0.1:8000`.
- Port already in use:
  - Vite automatically offers the next free port.
