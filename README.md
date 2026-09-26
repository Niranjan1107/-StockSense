# 📦 StockSense — Modular Inventory Management System

<p align="center">
  <strong>🚀 A modern, role-based inventory management platform for products, stock, warehouses, receipts, deliveries, transfers, and audits.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=white" />
  <img src="https://img.shields.io/badge/TypeScript-7-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Vite-8-646CFF?style=for-the-badge&logo=vite&logoColor=white" />
  <img src="https://img.shields.io/badge/Tailwind%20CSS-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Status-Project%20Demo-22C55E?style=flat-square" />
  <img src="https://img.shields.io/badge/Inventory-Management-10B981?style=flat-square" />
  <img src="https://img.shields.io/badge/Role--Based%20Access-Enabled-8B5CF6?style=flat-square" />
</p>

---

## ✨ Overview

**StockSense** is a modular inventory management web application designed to simplify and centralize day-to-day warehouse operations.

Instead of managing stock information across spreadsheets and disconnected processes, StockSense provides a single interface for monitoring inventory, managing products, receiving goods, processing deliveries, transferring stock between locations, performing physical adjustments, and maintaining warehouse structures.

The application combines a clean enterprise-style interface with role-based access and persistent browser storage to provide a realistic inventory workflow.

---

## 🎯 Project Goal

The main goal of StockSense is to provide a centralized system that helps inventory teams:

* 📊 Monitor inventory at a glance
* 📦 Manage products and SKUs
* 🏭 Manage multiple warehouses and storage locations
* 📥 Record incoming goods receipts
* 📤 Process delivery orders
* 🔄 Transfer stock between locations
* ⚠️ Detect low-stock and out-of-stock products
* 🧾 Perform physical stock adjustments
* 📜 Track inventory movement history
* 👥 Control access using user roles
* 📈 View important inventory KPIs

---

# 🚀 Core Features

## 📊 Executive Inventory Dashboard

The dashboard provides a centralized overview of inventory activity.

### Dashboard includes:

* Total products
* Total stock units
* Inventory valuation
* Low-stock alerts
* Out-of-stock alerts
* Pending receipts
* Pending deliveries
* Scheduled transfers
* Recent inventory activity
* Stock movement visualization
* Active warehouse information

The dashboard is designed to give users a quick understanding of the current inventory situation without navigating through multiple screens.

---

## 📦 Product & SKU Management

StockSense provides a complete product management workflow.

Users can manage:

* Product name
* SKU
* Product description
* Product category
* Unit of measurement
* Cost price
* Selling price
* Minimum stock level
* Maximum stock level
* Reorder quantity
* Stock by storage location

Products can be added, updated, deleted, and monitored through the inventory interface.

---

## 📈 Stock Overview

The **Stock Overview** module provides detailed visibility into current inventory.

It helps users understand:

* Current stock quantity
* Stock by location
* Product availability
* Inventory value
* Stock status
* Warehouse-level inventory

---

## 🔔 Reordering Rules

StockSense automatically checks inventory against configured minimum stock levels.

The reordering module helps identify products that require attention and provides information such as:

* Current quantity
* Minimum stock
* Maximum stock
* Reorder quantity
* Low-stock status

This helps warehouse teams identify potential stock shortages before they become operational problems.

---

# 🏭 Warehouse Management

StockSense supports a multi-facility inventory structure.

### Warehouse types include:

* 🏢 Main Warehouse
* 🏭 Production Facility
* 🚚 Distribution Center
* 📦 Storage Facility

Each warehouse can contain multiple storage locations, racks, bays, and zones.

### Storage management includes:

* Warehouse codes
* Warehouse names
* Addresses
* Facility types
* Storage locations
* Rack codes
* Zones
* Stock quantities
* Rack utilization

Managers can also create new facilities and storage locations directly from the application.

---

# 📥 Goods Receipt Management

The **Receipts** module handles incoming inventory.

Users can create receipts containing:

* Supplier information
* Target warehouse
* Target location
* Products
* Ordered quantity
* Received quantity
* Unit cost
* Notes
* Receipt status

Receipts can move through operational states and can be validated to update inventory.

---

# 📤 Delivery Order Management

The **Delivery Orders** module handles outgoing inventory.

It supports:

* Customer information
* Shipping address
* Source warehouse
* Source location
* Products
* Ordered quantity
* Picked quantity
* Unit price
* Tracking number
* Delivery status
* Validation

This creates a structured workflow for shipping inventory to customers.

---

# 🔄 Internal Stock Transfers

StockSense allows inventory to be moved between warehouse locations.

Transfers include:

* Source warehouse
* Source location
* Destination warehouse
* Destination location
* Products
* Transfer quantity
* Transfer reason
* Performing user
* Transfer status

This allows inventory movement to be tracked across the warehouse network.

---

# 🧾 Physical Stock Adjustments

The adjustment module helps reconcile system inventory with physical inventory.

Users can record:

* Recorded quantity
* Physically counted quantity
* Quantity difference
* Product
* Warehouse
* Storage location
* Adjustment reason
* Notes
* User responsible
* Adjustment status

### Supported adjustment reasons:

* Damaged
* Spoilage
* Theft / loss
* Found during cycle count
* Annual audit
* Data correction

---

# 📜 Inventory Move History

StockSense maintains an inventory movement history containing:

* Timestamp
* Document type
* Document number
* Product
* SKU
* Source location
* Destination location
* Quantity change
* Balance after movement
* User who performed the operation
* Notes

This creates a traceable record of inventory activity.

---

# 👤 Authentication & Role Management

StockSense includes a browser-based authentication system with two primary roles:

### 👨‍💼 Inventory Manager

Managers have access to management-oriented functionality such as:

* Product management
* Warehouse management
* Category management
* Inventory operations
* Stock adjustments
* Profile management

### 👷 Warehouse Staff

Warehouse staff can work with operational inventory functionality according to their assigned access.

---

## 🔐 Authentication Features

The authentication interface supports:

* Login
* Account registration
* Remember-me functionality
* Role selection
* Warehouse assignment
* Password validation
* Password reset
* OTP verification
* Password change
* Logout
* Session persistence

The project uses `bcryptjs` for password hashing and browser-side session/token logic.

> ⚠️ **Important:** This repository is a project/demo implementation. The authentication implementation is intended for demonstration and learning purposes and should not be treated as production-grade security without moving secrets, authentication, and authorization to a secure backend.

---

# 💾 Data Persistence

StockSense uses browser `localStorage` to persist application data.

Persisted areas include:

* Products
* Warehouses
* Categories
* Receipts
* Deliveries
* Transfers
* Adjustments
* Authentication/session information

The application also includes a **Reset to Demo Data** capability for restoring the initial demonstration dataset.

---

# 📤 Ledger Export

The inventory context includes an option to export the inventory ledger to **CSV**, allowing inventory movement information to be used outside the application.

---

# 🧩 Application Architecture

The project follows a modular React component architecture.

```text
StockSense
│
├── Authentication
│   ├── Login
│   ├── Registration
│   ├── OTP Verification
│   ├── Password Reset
│   └── Profile
│
├── Dashboard
│   ├── KPIs
│   ├── Alerts
│   ├── Activity
│   └── Stock Movement
│
├── Inventory
│   ├── Products
│   ├── Stock Overview
│   └── Reordering Rules
│
├── Operations
│   ├── Goods Receipts
│   ├── Delivery Orders
│   ├── Internal Transfers
│   ├── Stock Adjustments
│   └── Move History
│
└── Configuration
    ├── Warehouses
    ├── Storage Locations
    └── Product Categories
```

---

# 🛠️ Technology Stack

| Technology              | Purpose                        |
| ----------------------- | ------------------------------ |
| ⚛️ React 19             | Frontend UI                    |
| 🔷 TypeScript           | Type-safe development          |
| ⚡ Vite                  | Development & production build |
| 🎨 Tailwind CSS 4       | Styling & responsive UI        |
| 🧩 Lucide React         | UI icons                       |
| 🔐 bcryptjs             | Password hashing               |
| 💾 Browser localStorage | Demo data persistence          |
| 📄 CSV Export           | Inventory ledger export        |

---

# 📁 Project Structure

```text
src/
│
├── components/
│   ├── auth/
│   ├── dashboard/
│   ├── inventory/
│   ├── layout/
│   ├── operations/
│   ├── products/
│   ├── profile/
│   └── settings/
│
├── context/
│   ├── AuthContext.tsx
│   └── InventoryContext.tsx
│
├── data/
│   └── mockData.ts
│
├── services/
│   └── authService.ts
│
├── types/
│   └── inventory.ts
│
├── App.tsx
├── main.tsx
└── index.css
```

---

# ⚙️ Getting Started

## 1️⃣ Clone the Repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
cd stocksense
```

## 2️⃣ Install Dependencies

```bash
npm install
```

## 3️⃣ Start the Development Server

```bash
npm run dev
```

The Vite development server will start on:

```text
http://localhost:3000
```

## 4️⃣ Build for Production

```bash
npm run build
```

## 5️⃣ Type Check

```bash
npm run lint
```

---

# 🧪 Demo Accounts

The project includes predefined demonstration users.

### 👨‍💼 Inventory Manager

```text
Email: elena.vance@stocksense.io
Password: Manager@123
```

### 👷 Warehouse Staff

```text
Email: marcus.chen@stocksense.io
Password: Staff@123
```

> These credentials are included in the demo source code and are intended only for local demonstration/testing.

---

# 🖥️ Main Application Screens

The application contains dedicated views for:

```text
🏠 Executive Dashboard
📦 Products
📊 Stock Overview
🔔 Reordering Rules
📥 Goods Receipts
📤 Delivery Orders
🔄 Internal Transfers
🧾 Stock Adjustments
📜 Move History
🏭 Warehouses & Racks
🏷️ Product Categories
👤 Profile
⚙️ Settings
```

---

# 🌟 What Makes StockSense Different?

StockSense is designed around the complete inventory lifecycle rather than a simple product list.

```text
Supplier
   ↓
📥 Goods Receipt
   ↓
📦 Warehouse Stock
   ↓
🏭 Storage Location
   ↓
🔄 Internal Transfer
   ↓
📤 Delivery Order
   ↓
📜 Movement History
   ↓
📊 Inventory Dashboard
```

This workflow provides a connected view of inventory from receiving to storage, movement, adjustment, and delivery.

---

# 🎬 Project Demonstration

The project demonstration showcases the complete StockSense interface, including:

* Authentication
* Dashboard
* Inventory monitoring
* Product management
* Stock overview
* Reordering
* Goods receipts
* Delivery orders
* Internal transfers
* Stock adjustments
* Warehouses and racks
* Product categories
* User profile and security

> 🎥 **Demo Video:** Add your final project demonstration link here.

---

# 📌 Project Highlights

```text
⚡ Modular React Architecture
📊 Real-Time UI Calculations
📦 Product & SKU Management
🏭 Multi-Warehouse Support
📥 Receipt Processing
📤 Delivery Processing
🔄 Internal Stock Transfers
🧾 Physical Stock Auditing
🔔 Low-Stock Monitoring
📜 Inventory Movement Tracking
👥 Role-Based Interface
🔐 Authentication Workflow
💾 Persistent Browser Storage
📤 CSV Ledger Export
📱 Responsive UI
```

---

# 🚀 Future Improvements

Possible production-level improvements include:

* 🌐 REST/GraphQL backend integration
* 🗄️ PostgreSQL / MySQL database
* 🔑 Server-side authentication
* 🛡️ Secure server-side authorization
* ☁️ Cloud deployment
* 📧 Real email/OTP delivery
* 📊 Advanced analytics
* 🔔 Real-time inventory notifications
* 📱 Mobile application
* 📦 Barcode / QR code scanning
* 👥 Advanced user and permission management
* 📈 Historical inventory analytics

---

# 👨‍💻 Developer

**Niranjan S.**

🎓 Computer Science Engineering Student

💻 Full-Stack / Application Development Project

📦 **Project:** StockSense — Modular Inventory Management System

---

<p align="center">

### 🚀 StockSense

**Track. Manage. Move. Optimize.**

*Turning inventory operations into one connected workflow.*

</p>

<p align="center">
  ⭐ If you find this project useful, consider giving the repository a star!
</p>
