# Ethoss.in - Backend API Documentation

This document serves as the formal API contract between the Next.js frontend and the proposed Python Django backend. 

**Base URL (Development):** `http://localhost:8000/api/`
**Content-Type:** `application/json`

---

## 1. Authentication

The API uses **JSON Web Tokens (JWT)** for authentication. Protected routes require an `Authorization` header.
- **Header Format:** `Authorization: Bearer <access_token>`

### 1.1 Sign Up
Create a new user account.

**Endpoint:** `POST /api/auth/signup/`  
**Access:** Public

**Request Body:**
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "securepassword123"
}
```

**Success Response (201 Created):**
```json
{
  "user": {
    "id": 1,
    "name": "Jane Doe",
    "email": "jane@example.com"
  },
  "tokens": {
    "access": "eyJhbGci...<access_token_string>",
    "refresh": "eyJhbGci...<refresh_token_string>"
  }
}
```

### 1.2 Login
Authenticate an existing user to receive JWT tokens.

**Endpoint:** `POST /api/auth/login/`  
**Access:** Public

**Request Body:**
```json
{
  "email": "jane@example.com",
  "password": "securepassword123"
}
```

**Success Response (200 OK):**
```json
{
  "access": "eyJhbGci...<access_token_string>",
  "refresh": "eyJhbGci...<refresh_token_string>"
}
```

**Error Response (401 Unauthorized):**
```json
{
  "detail": "No active account found with the given credentials"
}
```

---

## 2. Categories

### 2.1 List All Categories
Retrieve a list of all product categories. They form the primary collections like "The Onyx Essence".

**Endpoint:** `GET /api/categories/`  
**Access:** Public

**Success Response (200 OK):**
```json
[
  {
    "id": "onyx-essence",
    "title": "The Onyx Essence",
    "description": "Pure. Polished. Timeless. A minimalist staple designed for those who find beauty in simplicity.",
    "image_url": "/catsection/img2.jpeg"
  },
  {
    "id": "earthbound-soul",
    "title": "Earthbound Soul",
    "description": "Raw textures meet refined craftsmanship. Each bead tells a story of the earth’s natural artistry.",
    "image_url": "/earthbound-soul.png"
  }
]
```

### 2.2 Retrieve Single Category
Retrieve specifics for a single category via its string ID (slug).

**Endpoint:** `GET /api/categories/{category_id}/`  
**Access:** Public

**Success Response (200 OK):**
```json
{
  "id": "onyx-essence",
  "title": "The Onyx Essence",
  "description": "Pure. Polished. Timeless. A minimalist staple designed for those who find beauty in simplicity.",
  "image_url": "/catsection/img2.jpeg"
}
```

---

## 3. Products

### 3.1 List All Products
Lists store products. Supports filtering by category ID.

**Endpoint:** `GET /api/products/`  
**Access:** Public  
**Query Parameters:** 
- `category` (optional): Filter by category ID (e.g., `?category=onyx-essence`)

**Success Response (200 OK):**
```json
[
  {
    "id": "eth-o-001",
    "name": "Classic Onyx Bracelet",
    "description": "Pure. Polished. Timeless. A minimalist staple designed for those who find beauty in simplicity.",
    "price": 1200,
    "category_id": "onyx-essence",
    "stock": 25,
    "image_url": "/catsection/img2.jpeg"
  },
  {
    "id": "eth-w-001",
    "name": "Intricate Braided Band",
    "description": "Strength in every strand. A testament to the patient art of slow-handcrafting.",
    "price": 950,
    "category_id": "intricate-weaves",
    "stock": 30,
    "image_url": "/intricate-weaves.png"
  }
]
```

### 3.2 Retrieve Single Product
Retrieve exact details for one specific product.

**Endpoint:** `GET /api/products/{product_id}/`  
**Access:** Public

**Success Response (200 OK):**
```json
{
  "id": "eth-o-001",
  "name": "Classic Onyx Bracelet",
  "description": "Pure. Polished. Timeless. A minimalist staple designed for those who find beauty in simplicity.",
  "price": 1200,
  "category_id": "onyx-essence",
  "stock": 25,
  "image_url": "/catsection/img2.jpeg"
}
```

---

## 4. Orders & User Data

### 4.1 Fetch Order History
Returns the list of previously placed orders for the logged-in user.

**Endpoint:** `GET /api/orders/`  
**Access:** Private (Requires Header: `Authorization: Bearer <token>`)

**Success Response (200 OK):**
```json
[
  {
    "id": "ord-abc-123",
    "created_at": "2024-05-15T10:30:00Z",
    "status": "Delivered",
    "total_price": 2400,
    "items": [
      {
        "product_id": "eth-o-001",
        "product_name": "Classic Onyx Bracelet",
        "quantity": 2,
        "price_at_purchase": 1200
      }
    ]
  }
]
```

### 4.2 Create Checkout Order
Creates a new order from a user's cart logic.

**Endpoint:** `POST /api/orders/`  
**Access:** Private (Requires Header: `Authorization: Bearer <token>`)

**Request Body:**
```json
{
  "items": [
    {
      "product_id": "eth-o-001",
      "quantity": 1
    },
    {
      "product_id": "eth-e-002",
      "quantity": 2
    }
  ]
}
```

**Success Response (201 Created):**
```json
{
  "message": "Order placed successfully",
  "order_id": "ord-xyz-987",
  "status": "Pending",
  "total_price": 5600
}
```
