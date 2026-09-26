# 📦 StockSense — Inventory Management System

**StockSense** is a modular Inventory Management System designed to digitize and streamline stock-related operations within a business.

It replaces manual registers, Excel sheets, and scattered stock-tracking methods with a centralized platform for managing products, warehouses, stock movements, receipts, deliveries, and inventory adjustments.

## 🎯 Problem

Businesses often manage inventory using manual registers, spreadsheets, and disconnected tracking methods.

This can make it difficult to:

* Track real-time stock availability
* Monitor incoming and outgoing goods
* Track stock between locations
* Identify low-stock items
* Maintain accurate inventory records
* Track historical stock movements

StockSense provides a centralized system to manage these operations.

## 🚀 Key Features

### 🔐 Authentication

* User registration and login
* OTP-based password reset
* Secure access to the Inventory Dashboard

### 📊 Dashboard

Provides an overview of inventory operations:

* Total Products in Stock
* Low Stock / Out of Stock Items
* Pending Receipts
* Pending Deliveries
* Scheduled Internal Transfers
* Dynamic filters by status, warehouse, category, and document type

### 📦 Product Management

Users can manage:

* Product Name
* SKU / Product Code
* Category
* Unit of Measure
* Initial Stock
* Stock availability by location
* Reordering rules

### 📥 Receipts — Incoming Stock

Used when goods arrive from suppliers.

**Flow:**

```text
Create Receipt
      ↓
Add Supplier & Products
      ↓
Enter Quantity
      ↓
Validate
      ↓
Stock Automatically Increases
```

Example:

```text
Receive 50 Steel Rods
        ↓
Stock +50
```

### 📤 Delivery Orders — Outgoing Stock

Used when products leave the warehouse.

**Flow:**

```text
Pick Items
    ↓
Pack Items
    ↓
Validate Delivery
    ↓
Stock Automatically Decreases
```

Example:

```text
Deliver 10 Chairs
      ↓
Chair Stock -10
```

### 🔄 Internal Transfers

Stock can be transferred between locations.

Examples:

```text
Main Warehouse → Production Floor

Rack A → Rack B

Warehouse 1 → Warehouse 2
```

Every movement is recorded in the stock ledger.

### ⚖️ Stock Adjustments

Used when physical stock differs from recorded stock.

```text
Select Product & Location
          ↓
Enter Physical Count
          ↓
System Calculates Difference
          ↓
Stock Updated
          ↓
Adjustment Logged
```

### 🚨 Low Stock Alerts

The system can identify products that reach low-stock conditions and provide alerts.

### 🏭 Multi-Warehouse Support

Stock can be managed across multiple warehouses and locations.

### 🔎 Search & Smart Filters

Users can quickly search and filter inventory using:

* SKU
* Product
* Category
* Warehouse
* Location
* Status
* Operation type

## 🔄 Inventory Flow

```text
        SUPPLIER
           │
           ▼
      📥 RECEIPT
           │
           ▼
      📦 STOCK
           │
      ┌────┴────┐
      ▼         ▼
 INTERNAL    PRODUCTION
 TRANSFER
      │
      ▼
   LOCATION
      │
      ▼
 📤 DELIVERY
      │
      ▼
   CUSTOMER
```

Stock adjustments and movements are recorded in the **Stock Ledger**.

## 🧾 Example

### Step 1 — Receive Goods

```text
Receive 100 kg Steel
        ↓
Stock +100 kg
```

### Step 2 — Internal Transfer

```text
Main Store → Production Rack
        ↓
Total Stock: Unchanged
Location: Updated
```

### Step 3 — Delivery

```text
Deliver 20 units
        ↓
Available Stock -20
```

### Step 4 — Adjustment

```text
3 kg damaged
        ↓
Stock -3 kg
        ↓
Adjustment recorded
```

## 🏗️ System Modules

```text
StockSense
│
├── Authentication
│
├── Dashboard
│
├── Products
│
├── Receipts
│
├── Delivery Orders
│
├── Internal Transfers
│
├── Stock Adjustments
│
├── Stock Ledger
│
├── Warehouse Management
│
└── User Profile
```

## 👥 Target Users

### Inventory Managers

Manage incoming and outgoing stock and monitor inventory.

### Warehouse Staff

Handle:

* Transfers
* Picking
* Shelving
* Counting
* Stock operations

## 🛠️ Tech Stack

> Update this section according to the technologies actually used in the implementation.

```text
Frontend   : React.js
Backend    : Node.js / Express.js
Database   : PostgreSQL
Authentication : JWT / OTP
Version Control : Git + GitHub
```

## 📁 Project Structure

```text
StockSense/
│
├── frontend/
│   ├── src/
│   ├── components/
│   ├── pages/
│   └── services/
│
├── backend/
│   ├── controllers/
│   ├── routes/
│   ├── models/
│   ├── middleware/
│   └── server.js
│
├── database/
│
├── README.md
└── .gitignore
```

## 🔀 Team Collaboration

The project is developed collaboratively using GitHub.

Each contributor should work on a separate feature branch:

```text
main
│
├── feature/authentication
├── feature/dashboard
├── feature/products
├── feature/inventory-operations
└── feature/testing
```

After completing a feature:

```text
Create Branch
      ↓
Develop Feature
      ↓
Commit Changes
      ↓
Push Branch
      ↓
Create Pull Request
      ↓
Review
      ↓
Merge into Main
```

## 📌 Development Goals

* Centralized inventory management
* Accurate stock tracking
* Real-time stock updates
* Easy warehouse management
* Transparent stock movement history
* Reduced dependency on manual tracking
* Better visibility into inventory operations

## 📄 Project Reference

This project is based on the StockSense Inventory Management System problem statement and its defined inventory workflows and requirements.

## 👨‍💻 Team

**StockSense Development Team**

Developed collaboratively using GitHub and modern web technologies.
