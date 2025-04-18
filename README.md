# Agro Fix Backend 

Given an `app.js` file and an empty database file `agro.db`.

Create a table with the name `todo` with the following columns,

**Users Table**

| Column   | Type    |
| -------- | ------- |
| id       | VARCHAR |
| username | VARCHAR |
| email    | VARCHAR |
| password | VARCHAR |


**Products Table**

| Column     | Type    |
| ---------- | ------- |
| id         | VARCHAR |
| name       | VARCHAR |
| price      |  INT    | 
| image      | VARCHAR |
| category   | VARCHAR |
| descripiton| VARCHAR |  

**Orders Table**

| Column           | Type    |
| ---------------- | ------- |
| id               | VARCHAR |
| buyer_name       | TEXT    |
| buyer_contact    | TEXT    | 
| delivery_address | TEXT    |
| items            | TEXT    |
| status           | TEXT    |



and write APIs to perform operations on the table `users`, `products`,`orders`;


AgroShop is a RESTful API built using **Node.js**, **Express**, and **SQLite**. It supports user authentication, product management, and order placement features. Ideal for small-scale eCommerce or inventory-based apps.

---

## 🚀 Features

- 🔐 User registration & login with JWT-based authentication
- 🛍️ Admin: Add, update, delete, and view all products
- 📦 Customers: Place orders with delivery details and cart items
- 📋 Admin: View and manage all orders
- 📞 Customers: Track order status using contact number

---

## ⚙️ Technologies Used

- Node.js
- Express.js
- SQLite (via `sqlite3` and `sqlite` packages)
- bcrypt for password hashing
- JWT for secure authentication
- UUID for unique IDs
- CORS middleware

---

## 🧑‍💻 API Endpoints

### ✅ Auth
| Method | Endpoint       | Description          |
|--------|----------------|----------------------|
| POST   | `/register`     | Register new user    |
| POST   | `/login`        | Login & get JWT token|

---

### 📦 Products

| Method | Endpoint            | Access | Description              |
|--------|---------------------|--------|--------------------------|
| GET    | `/products`          | Public | View all products        |
| GET    | `/products/:id`      | Public | View product by ID       |
| POST   | `/products`          | Admin  | Add a new product        |
| PUT    | `/products/:id`      | Admin  | Update product           |
| DELETE | `/products/:id`      | Admin  | Delete product           |

---

### 🛒 Orders

| Method | Endpoint                     | Access      | Description                        |
|--------|------------------------------|-------------|------------------------------------|
| POST   | `/api/orders`                | Public      | Place a new order                  |
| GET    | `/api/orders/:id`            | Public      | View single order by ID            |
| GET    | `/api/orders/user/:contact`  | Public      | View user orders via contact number|
| GET    | `/api/orders`                | Admin       | View all orders                    |
| PUT    | `/api/orders/:id`            | Admin       | Update order status                |

---

## 🛡️ Authentication

All protected routes require a **JWT token** in the `Authorization` header:
Authorization: Bearer <token>

yaml
Copy
Edit

---

## 🛠️ Installation & Setup

```bash
# 1. Clone the repo
git clone https://github.com/Vinaykumar5890/Agro-fix-Backend-Assignment-
cd agroshop-backend

# 2. Install dependencies
npm install

# 3. Run the server
nodemon  app.js

<br/>

Use `npm install` to install the packages.

**Export the express instance using the default export syntax.**

**Use Common JS module syntax.**
