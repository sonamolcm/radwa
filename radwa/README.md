# myproject

A clean, standard Django backend project with application **`core`** (configured without REST API, using standard Django models, views, templates, and admin).

---

## 📁 Project Architecture

```
radwa/
│
├── .env                  # Environment configuration
├── .env.example          # Environment template
├── .gitignore            # Git exclusion rules
├── requirements.txt      # Python dependencies
├── manage.py             # Django management entrypoint
├── db.sqlite3            # SQLite database
│
├── myproject/            # Main project configuration
│   ├── __init__.py
│   ├── settings.py       # Django settings (core registered in INSTALLED_APPS)
│   ├── urls.py           # Root URL dispatcher
│   ├── wsgi.py           # WSGI entrypoint
│   └── asgi.py           # ASGI entrypoint
│
├── core/                 # Core Django application
│   ├── migrations/       # Database migrations
│   ├── admin.py          # Admin model registration
│   ├── apps.py           # CoreConfig
│   ├── models.py         # Database models
│   ├── views.py          # View logic (home view, etc.)
│   ├── urls.py           # App URL routing
│   └── tests.py          # Unit test suite
│
├── templates/            # HTML templates
│   ├── base.html         # Base layout template
│   └── core/
│       └── home.html     # Landing page
│
└── static/               # Static assets
    └── css/
        └── style.css     # Stylesheet
```

---

## 🚀 Getting Started

### 1. Activate the Virtual Environment
```powershell
# Windows PowerShell
.\.venv\Scripts\Activate.ps1

# Windows Command Prompt
.\.venv\Scripts\activate.bat

# macOS / Linux
source .venv/bin/activate
```

### 2. Run Database Migrations
```bash
python manage.py migrate
```

### 3. Create an Admin Superuser
To access the Django Admin at `http://127.0.0.1:8000/admin/`:
```bash
python manage.py createsuperuser
```

### 4. Start the Development Server
```bash
python manage.py runserver
```
Visit **`http://127.0.0.1:8000/`** in your browser.

### 5. Run the Test Suite
```bash
python manage.py test
```

---

## 📝 Adding New Features to `core`

1. **Models**: Add your database models in [`core/models.py`](file:///c:/Users/SONA/OneDrive/Desktop/Empire/radwa/core/models.py) and run:
   ```bash
   python manage.py makemigrations core
   python manage.py migrate
   ```
2. **Admin**: Register models in [`core/admin.py`](file:///c:/Users/SONA/OneDrive/Desktop/Empire/radwa/core/admin.py).
3. **Views**: Define your views in [`core/views.py`](file:///c:/Users/SONA/OneDrive/Desktop/Empire/radwa/core/views.py).
4. **URLs**: Add URL routes in [`core/urls.py`](file:///c:/Users/SONA/OneDrive/Desktop/Empire/radwa/core/urls.py).
