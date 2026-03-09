# Milkman Project (Day Two)

Full-stack milk delivery project with a Django REST backend and two React frontends.

## Tech Stack

- Backend: Django, Django REST Framework, SQLite
- Frontend (User): React + Vite (`milkman-frontend`)
- Frontend (Admin): React + Vite + Bootstrap (`reactadmin`)

## Project Structure

```text
daytwo/
  milkman/            # Django backend
  milkman-frontend/   # Customer-facing frontend (React)
  reactadmin/         # Admin panel frontend (React)
  PRODUCTS_CATALOG.md
```

## Login Credentials

- User login
  - Username: `user@gmail.com`
  - Password: `user`
- Admin login
  - Username: `admin@gmail.com`
  - Password: `admin123`

## Backend Setup (Django)

From the workspace root (`milkproject`), activate the existing virtual environment:

```powershell
env\Scripts\Activate.ps1
```

If needed, install backend dependencies:

```powershell
pip install django djangorestframework django-cors-headers requests
```

Go to backend folder and run server:

```powershell
cd milkman\daytwo\milkman
python manage.py migrate
python manage.py runserver
```

Backend base URL: `http://127.0.0.1:8000/`

## Frontend Setup (Customer App)

```powershell
cd milkman\daytwo\milkman-frontend
npm install
npm run dev
```

Default Vite URL: `http://localhost:5173/`

## Frontend Setup (Admin App)

```powershell
cd milkman\daytwo\reactadmin
npm install
npm run dev
```

Default Vite URL: `http://localhost:5174/` (or next free port)

## Main API Routes

- `POST /staff/login/` - staff/admin login
- `GET|POST /staff/staff/`
- `PUT|DELETE /staff/staff/<id>/`
- `POST /customer/login/` - customer login
- `GET|POST /customer/`
- `GET|POST /category/`
- `GET|POST /product/`
- `GET|POST /subscription/`
- `GET|POST /cart/`
- `POST /cart/subscribe/`

## Notes

- CORS is enabled in backend settings for local frontend development.
- Database file is `milkman/db.sqlite3`.
- This setup is for local development (DEBUG mode enabled).