# Pharmacy Management System

A full-stack Pharmacy Management System built with **Spring Boot (Java)**, **SQLite**, and a **HTML/CSS/JavaScript** frontend.

## Features

- **Medicine Inventory** — add, edit, delete medicines; track quantity, batch number, expiry date, reorder level
- **Sales / Billing** — search medicines, build a cart, checkout; stock is automatically deducted
- **Supplier Management** — CRUD for suppliers, linked to medicines
- **User Login** — Admin / Staff roles with session-based authentication (Spring Security)
- **Expiry Date Alerts** — dashboard & reports flag medicines expiring within 30 days
- **Reports / Analytics** — sales revenue trend chart, top-selling medicines chart, low-stock & expiry tables

## Tech Stack

| Layer     | Technology                                   |
|-----------|-----------------------------------------------|
| Backend   | Java 17, Spring Boot 3.2.5, Spring Data JPA, Spring Security |
| Database  | SQLite (file-based, zero setup)               |
| Frontend  | HTML5, CSS3, Vanilla JavaScript, Chart.js     |
| Build     | Maven                                         |

## Project Structure

```
pharmacy-management-system/
├── pom.xml
├── src/main/java/com/pharmacy/
│   ├── PharmacyManagementApplication.java
│   ├── model/          # JPA entities: User, Medicine, Supplier, Sale, SaleItem, Role
│   ├── repository/     # Spring Data JPA repositories
│   ├── security/       # Spring Security config + UserDetailsService
│   ├── controller/     # REST controllers (medicines, suppliers, sales, users, reports, auth)
│   ├── dto/             # Request DTOs
│   └── config/          # DataSeeder (creates default users + sample data)
└── src/main/resources/
    ├── application.properties
    └── static/          # Frontend: HTML pages + css/ + js/
```

## Prerequisites

- **JDK 17** or later
- **Maven 3.8+**

(No database server needed — SQLite runs as a local file `pharmacy.db`, created automatically.)

## How to Run

```bash
cd pharmacy-management-system
mvn spring-boot:run
```

Or build a jar and run it:

```bash
mvn clean package
java -jar target/pharmacy-management-system-1.0.0.jar
```

The app starts on **http://localhost:8080**. Open it in your browser — you'll be redirected to the login page.

## Default Login Credentials

The app seeds two users automatically on first run:

| Role  | Username | Password  |
|-------|----------|-----------|
| Admin | `admin`  | `admin123`|
| Staff | `staff`  | `staff123`|

- **Admin**: full access — manage medicines, suppliers, users, view reports, process sales.
- **Staff**: can process sales, view medicines/suppliers/reports, but cannot manage inventory master data or users.

Sample suppliers and medicines are also seeded automatically so the app isn't empty on first launch.

## Key REST API Endpoints

| Method | Endpoint                          | Description                     |
|--------|-------------------------------------|----------------------------------|
| POST   | `/api/auth/login`                 | Login (form-encoded username/password) |
| GET    | `/api/auth/me`                    | Current logged-in user info     |
| GET/POST/PUT/DELETE | `/api/medicines`     | Medicine CRUD                   |
| GET    | `/api/medicines/low-stock`        | Medicines at/below reorder level|
| GET    | `/api/medicines/expiring?days=30` | Medicines expiring soon         |
| GET/POST/PUT/DELETE | `/api/suppliers`     | Supplier CRUD                   |
| GET/POST | `/api/sales`                     | View / create sales (checkout)  |
| GET/POST/PUT/DELETE | `/api/users`         | User management (admin only)    |
| GET    | `/api/reports/dashboard`          | Dashboard summary stats         |
| GET    | `/api/reports/sales-summary`      | Revenue by day for a date range |
| GET    | `/api/reports/top-medicines`      | Best-selling medicines          |

## Notes

- The SQLite database file (`pharmacy.db`) is created automatically in the project root on first run.
- To reset all data, stop the app and delete `pharmacy.db`, then restart.
- Passwords are hashed with BCrypt; nothing is stored in plain text.
- `spring.jpa.hibernate.ddl-auto=update` auto-creates/updates tables from the entity classes — no manual SQL schema needed to get started.

## Possible Next Steps

- Add pagination for large medicine/sales lists
- Generate PDF invoices for each sale
- Add barcode scanning support for faster checkout
- Email/SMS alerts for low stock and expiring medicines
