# ETHOSS.IN - Django Backend Requirements

This document outlines the requirements and API contract for the Python Django backend for **Ethoss.in**, a minimalist jewellery e-commerce platform. The frontend is currently built with Next.js and uses mock JSON data. The goal of the backend is to replace this mock data with a production-ready database and REST API.

---

## 🏗️ Technology Stack
- **Framework:** Python, Django
- **API Framework:** Django REST Framework (DRF)
- **Database:** PostgreSQL (recommended for production)
- **Authentication:** JWT (JSON Web Tokens) via `djangorestframework-simplejwt`

---

## 🗄️ Database Models

Based on the frontend's current data structures, the following models need to be implemented:

### 1. `Category` Model
Categories for different jewelry collections.
- `id`: SlugField (Primary Key, e.g., `"onyx-essence"`, `"earthbound-soul"`)
- `title`: CharField (e.g., "The Onyx Essence")
- `description`: TextField
- `image_url`: ImageField or URLField (Uploads to an S3 bucket or local media server)

### 2. `Product` Model
Individual jewelry items.
- `id`: SlugField or CharField (Primary Key, e.g., `"eth-o-001"`)
- `name`: CharField (e.g., "Classic Onyx Bracelet")
- `description`: TextField
- `price`: DecimalField or IntegerField (e.g., `1200`)
- `category`: ForeignKey (Links to `Category`)
- `stock`: IntegerField (e.g., `25`)
- `image_url`: ImageField or URLField

### 3. `User` Model
Custom User model to handle authentication and customer details. We recommend extending `AbstractUser` or `AbstractBaseUser`.
- `name`: CharField
- `email`: EmailField (Unique, used as the login identifier)
- `password`: CharField (Handled securely by Django)

### 4. `Order` & `OrderItem` Models
To handle user order histories and checkouts.
- **Order Model**:
  - `id`: UUIDField (Primary Key)
  - `user`: ForeignKey (Links to `User`)
  - `total_price`: DecimalField or IntegerField
  - `status`: CharField (e.g., 'Pending', 'Shipped', 'Delivered')
  - `created_at`: DateTimeField (auto_now_add=True)
- **OrderItem Model**:
  - `order`: ForeignKey (Links to `Order`)
  - `product`: ForeignKey (Links to `Product`)
  - `quantity`: IntegerField
  - `price_at_purchase`: DecimalField or IntegerField

---

## 🌐 REST API Endpoints

The Next.js frontend expects the following REST API endpoints to consume data. 

> [!IMPORTANT]
> All endpoints should return data in JSON format with standard HTTP status codes.

### Authentication Endpoints
The frontend is already setup to hit `/api/auth/signup` and `/api/auth/login`. The Django backend should provide:

- **`POST /api/auth/signup/`**
  - **Payload:** `{ "name": "User Name", "email": "user@example.com", "password": "password123" }`
  - **Action:** Creates a new user.
  - **Response (201 Created):** Should return the user object (excluding the password) and standard JWT tokens (access & refresh).

- **`POST /api/auth/login/`**
  - **Payload:** `{ "email": "user@example.com", "password": "password123" }`
  - **Action:** Authenticates the user.
  - **Response (200 OK):** Should return JWT `access` and `refresh` tokens, alongside user data.

### Storefront Endpoints
These endpoints are public and do not require authentication.

- **`GET /api/categories/`**
  - **Action:** Returns a list of all categories.
- **`GET /api/categories/<category_id>/`**
  - **Action:** Returns details for a specific category.

- **`GET /api/products/`**
  - **Action:** Returns a list of all products.
  - **Query Params:** Should support `?category=<category_id>` to filter products by their category.
- **`GET /api/products/<product_id>/`**
  - **Action:** Returns details for a specific product.

### Protected User Endpoints
These endpoints require a valid JWT `Authorization: Bearer <token>` header.

- **`GET /api/orders/`**
  - **Action:** Returns the order history for the currently authenticated user.
- **`POST /api/orders/`**
  - **Action:** Creates a new order. 
  - **Payload:** Array of products and quantities (e.g., `[{"product_id": "eth-o-001", "quantity": 1}]`)
- **`GET /api/users/me/`**
  - **Action:** Returns the current authenticated user's profile details.

---

## 🔒 Security & CORS Requirements
1. **CORS:** The backend must have `django-cors-headers` configured to allow requests from the Next.js frontend (e.g., `http://localhost:3000` for dev, and the production domain).
2. **Environment Variables:** Credentials like `SECRET_KEY`, Database URLs, and any Payment Gateways (Razorpay/Stripe) must be loaded from `.env` files.
3. **Admin Panel:** The default Django Admin panel should be configured to manage Categories, Products, Users, and Orders easily.

## 🚀 Next Steps for the Backend Developer
1. Initialize a new Django project and map out the custom User model immediately (`AUTH_USER_MODEL`).
2. Build the DRF serializers for Category and Product.
3. Set up `djangorestframework-simplejwt` to handle the auth endpoints.
4. Provide the frontend developer with a Postman/Swagger/Redoc export once the initial endpoints are mapped.
