# Vue + Django REST Framework Starter Template

A modern, full-stack web application template combining Vue.js 3 with Django REST Framework, featuring user authentication, state management, and a responsive UI component system.

## 🚀 Tech Stack

### Frontend

- **Vue.js 3** - Progressive JavaScript framework with Composition API
- **TypeScript** - Type-safe JavaScript development
- **Vite** - Fast build tool and development server
- **Vue Router 4** - Official router for Vue.js
- **Pinia** - Intuitive state management for Vue
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/vue** - Beautiful and accessible UI components

### Backend

- **Django 5.2+** - High-level Python web framework
- **Django REST Framework** - Powerful toolkit for building Web APIs
- **Djoser** - Authentication system for Django REST Framework
- **JWT Authentication** - Secure token-based authentication
- **Django CORS Headers** - Cross-Origin Resource Sharing handling
- **Django Filter** - Dynamic QuerySet filtering

## 📋 Prerequisites

- **Node.js** 20.19.0+ or 22.12.0+
- **Python** 3.13+
- **pip** or **uv** (recommended)

## 🛠️ Installation

### Backend Setup

1. Navigate to the backend directory:

```bash
cd backend
```

2. Create and activate a virtual environment:

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:

```bash
pip install -e .
# or with uv (recommended)
uv pip install -e .
```

4. Create a `.env` file in the backend directory:

```env
SECRET_KEY=your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

5. Run database migrations:

```bash
python manage.py migrate
```

6. Create a superuser (optional):

```bash
python manage.py createsuperuser
```

7. Start the development server:

```bash
python manage.py runserver
```

The Django API will be available at `http://localhost:8000`

### Frontend Setup

1. Navigate to the frontend directory:

```bash
cd frontend
```

2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Install Tailwind CSS and shadcn/vue (if not already configured):

```bash
# Install Tailwind CSS
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# Install shadcn/vue
npx shadcn-vue@latest init
```

4. Start the development server:

```bash
npm run dev
```

The Vue app will be available at `http://localhost:5173`

## 🏗️ Project Structure

```
vue-django-starter/
├── backend/                    # Django REST API
│   ├── account/               # User account management
│   ├── config/                # Django settings and configuration
│   └── manage.py              # Django management script
├── frontend/                  # Vue.js application
│   ├── src/
│   │   ├── components/        # Vue components
│   │   ├── router/           # Vue Router configuration
│   │   ├── stores/           # Pinia stores
│   │   └── App.vue           # Root component
│   └── package.json          # Frontend dependencies
└── README.md
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the backend directory with the following variables:

```env
# Django Settings
SECRET_KEY=your-django-secret-key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# CORS Settings
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173

# Database (SQLite by default)
# DATABASE_URL=sqlite:///db.sqlite3

# JWT Settings (optional customization)
# SIMPLE_JWT_ACCESS_TOKEN_LIFETIME=5
# SIMPLE_JWT_REFRESH_TOKEN_LIFETIME=24
```

### API Endpoints

The backend provides the following authentication endpoints via Djoser:

- `POST /auth/users/` - User registration
- `POST /auth/jwt/create/` - Login (JWT token creation)
- `POST /auth/jwt/refresh/` - Token refresh
- `POST /auth/jwt/verify/` - Token verification
- `GET /auth/users/me/` - Get current user profile
- `PUT/PATCH /auth/users/me/` - Update user profile

## 🎨 UI Components

This template uses shadcn/vue components built on top of Tailwind CSS. To add new components:

```bash
npx shadcn-vue@latest add button
npx shadcn-vue@latest add input
npx shadcn-vue@latest add card
```

## 📊 State Management

The template uses Pinia for state management. Example store structure:

```typescript
// stores/auth.ts
import { defineStore } from "pinia";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    user: null,
    token: null,
    isAuthenticated: false,
  }),
  actions: {
    async login(credentials) {
      // Login implementation
    },
    async logout() {
      // Logout implementation
    },
  },
});
```

## 🔐 Authentication Flow

1. User registers/logs in through the Vue frontend
2. Django returns JWT access and refresh tokens
3. Frontend stores tokens and includes them in API requests
4. Protected routes use Vue Router navigation guards
5. Automatic token refresh handling

## 🚀 Deployment

### Frontend (Netlify/Vercel)

1. Build the frontend:

```bash
cd frontend
npm run build
```

2. Deploy the `dist` folder to your hosting platform

### Backend (Heroku/Railway/DigitalOcean)

1. Set environment variables in your hosting platform
2. Configure static file serving
3. Run migrations: `python manage.py migrate`
4. Collect static files: `python manage.py collectstatic`

## 📝 Scripts

### Frontend Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run type-check` - Run TypeScript type checking
- `npm run format` - Format code with Prettier

### Backend Scripts

- `python manage.py runserver` - Start development server
- `python manage.py migrate` - Run database migrations
- `python manage.py createsuperuser` - Create admin user
- `python manage.py collectstatic` - Collect static files

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit your changes: `git commit -am 'Add new feature'`
4. Push to the branch: `git push origin feature/new-feature`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions, please:

1. Check the [Issues](../../issues) page
2. Create a new issue with detailed information
3. Include error messages and steps to reproduce

## ⭐ Features

- ✅ JWT Authentication with Djoser
- ✅ Vue 3 with Composition API
- ✅ TypeScript support
- ✅ Pinia state management
- ✅ Vue Router with navigation guards
- ✅ Tailwind CSS styling
- ✅ shadcn/vue components
- ✅ CORS configured
- ✅ Hot reload in development
- ✅ Production-ready build process

---

**Happy coding! 🎉**
