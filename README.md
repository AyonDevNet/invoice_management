# 📊 Invoice Management System

A full-stack web application for managing invoices, clients, and financial records with user authentication and real-time data synchronization.


---

## 🎯 **Purpose & Features**

### **What is this system for?**

This Invoice Management System helps businesses and individuals:
- **Create and manage invoices** with detailed line items
- **Track payments** (pending, paid, overdue)
- **Store client information** securely
- **Search and filter** invoices by multiple criteria
- **Generate reports** on revenue and invoice statistics
- **Manage multiple users** with role-based access control

### **Key Features**

✅ **User Authentication**
- Secure JWT-based authentication
- Password hashing with Werkzeug
- Role-based access (Super Admin, Admin, User)
- Session management

✅ **Invoice Management**
- Create invoices with multiple line items
- Auto-generate invoice numbers
- Track payment status (Pending, Paid, Overdue)
- Store invoice dates and due dates
- Add notes and attachments

✅ **Client Management**
- Store client contact information
- Track client purchase history
- Search clients by name or email

✅ **Search & Filter**
- Search by invoice number, client name, or device
- Filter by date range
- Filter by payment status

✅ **Dashboard & Analytics**
- Total invoices count
- Revenue tracking (paid vs pending)
- Recent invoices overview
- Monthly statistics

✅ **Real-time Sync**
- Auto-refresh data every 30 seconds
- Instant updates after creating/deleting invoices
- Optimistic UI updates

---

## 🏗️ **Technology Stack**

### **Backend**
- **Framework:** Flask 3.0.0
- **Database:** SQLite (production-ready)
- **Authentication:** Flask-JWT-Extended
- **ORM:** SQLAlchemy
- **CORS:** Flask-CORS
- **Password Hashing:** Werkzeug

### **Frontend**
- **HTML5** - Semantic markup
- **CSS3** - Modern styling with gradients and animations
- **Vanilla JavaScript** - No frameworks, pure ES6+
- **Fetch API** - RESTful API communication



## 🚀 **Quick Start**

### **1. Setup Backend**

```bash
cd backend
pip install -r requirements.txt
python app.py
```

Backend runs on: `http://127.0.0.1:5000`
in new terminal run this : python -m http.server 8000



---

## 📚 **API Endpoints**

### **Authentication**
- `POST /api/register` - Register new user
- `POST /api/login` - Login user
- `GET /api/current-user` - Get current user
- `POST /api/logout` - Logout user

### **Invoices**
- `GET /api/invoices` - Get all invoices
- `POST /api/invoices` - Create invoice
- `GET /api/invoices/<id>` - Get single invoice
- `PUT /api/invoices/<id>` - Update invoice
- `DELETE /api/invoices/<id>` - Delete invoice
- `GET /api/invoices/stats` - Get statistics

---
<<<<<<< HEAD
=======
Dockerization

┌─────────────────────────────────────────┐
│           Docker Network                │
│                                         │
│  ┌──────────┐  ┌──────────┐  ┌───────┐│
│  │ Frontend │←→│ Backend  │←→│  DB   ││
│  │  Nginx   │  │  Flask   │  │ PostSQL││
│  │  :80     │  │  :5000   │  │ :5432 ││
│  └──────────┘  └──────────┘  └───────┘│
└─────────────────────────────────────────┘
>>>>>>> 396ed9c (add)

## 🔧 **Configuration**

Create `.env` file in backend:

```env
SECRET_KEY=your-secret-key
JWT_SECRET_KEY=your-jwt-secret
DATABASE_URI=sqlite:///database/invoices.db
```

---

## 📝 **License**

MIT License - See LICENSE file for details.

<<<<<<< HEAD
this is open source fell free work with it
=======
---
>>>>>>> 396ed9c (add)
