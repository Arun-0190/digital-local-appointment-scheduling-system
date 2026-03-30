# DLASS - Digital Local Appointment Scheduling System

DLASS is a full-stack service marketplace platform designed to streamline appointment scheduling between users and local service providers.

The system is built with a strong focus on **scalability, real-world workflows, and production-level architecture**, incorporating intelligent booking, analytics, and system optimization features.

---

# 🧠 System Overview

DLASS is designed as a **multi-role service marketplace**, supporting:

* Customers (Users)
* Service Providers
* Platform Administrators

The platform handles the complete lifecycle of a service booking system:

```text
Discovery → Selection → Slot Locking → Booking → Management → Analytics → Optimization
```

---

# 🚀 Core Features

## 👤 User (Customer) Features

* Structured service discovery:

  ```
  Category → Subcategory → City → Pincode
  ```
* Advanced filtering:

  * Rating
  * Price range
  * Availability
* Slot-based booking (First Come First Serve)
* Appointment lifecycle:

  ```
  BOOKED → CANCELLED → COMPLETED
  ```
* Appointment rescheduling with validation
* Favorites / wishlist system
* Review & rating system (edit/delete supported)
* Secure JWT-based authentication

---

## 🧑‍💼 Service Provider Features

* Dedicated onboarding flow (separate from user registration)
* Approval-based activation system
* Service & specialization management
* Portfolio system (image uploads)

### 📊 Advanced Provider Dashboard

* Total appointments, today’s bookings, upcoming bookings
* Revenue tracking
* Dynamic analytics:

  * Bookings over time
  * Revenue trends
  * Peak booking hours

### 🤖 AI Recommendation Engine

* Hybrid logic (short-term + historical data)
* Provides:

  * Peak hour insights
  * Demand-based suggestions
  * Popular service detection

### 📅 Availability & Scheduling Engine

* Weekly availability configuration
* Slot generation based on duration
* Smart slot filtering
* Prevention of invalid/past slots

### 🔒 Slot Locking System

* Prevents double booking
* Temporary lock with expiry
* Race-condition safe implementation

### 💬 Chat System

* User ↔ Provider communication
* Polling-based real-time interaction
* Message ordering and read handling

---

## 🛠️ Admin Features

* Approve / reject provider applications
* Manage platform users and providers
* Deactivate / reactivate users & providers
* Track deactivation reasons
* Monitor platform data and system health

---

# ⚙️ System Highlights

* Role-based access control (USER / PROVIDER / ADMIN)
* Approval-driven marketplace workflow
* Concurrency-safe booking system
* Soft delete system with audit tracking:

  ```
  isDeleted, deletedAt, deletedBy
  ```
* Dynamic platform configuration:

  * Cancellation window
  * Slot lock duration
* Modular architecture (Controller → Service → Repository)
* Clean frontend-backend separation

---

# 📊 Analytics & Intelligence Layer

DLASS includes a built-in analytics engine:

### Metrics:

* Total bookings
* Daily/weekly booking trends
* Revenue insights
* Peak usage hours

### Time Filters:

```
1 Day | 7 Days | 1 Month | 1 Year
```

### AI Insights:

* Identify high-demand hours
* Detect underutilized slots
* Suggest service optimization strategies

---

# 🏗️ Technology Stack

| Layer          | Technology                     |
| -------------- | ------------------------------ |
| Frontend       | React.js (Vite) + Tailwind CSS |
| Backend        | Spring Boot (Java 21)          |
| Database       | MongoDB                        |
| Authentication | JWT                            |
| Email          | SMTP                           |
| Charts         | Recharts / Chart.js            |
| Build Tools    | Maven, npm                     |

---

# 📁 Project Structure

```
DLASS PROJECT/
├── backend/                    
│   ├── dlass-backend/          
│   │   ├── src/
│   │   │   ├── main/java/com/dlass/backend/
│   │   │   │   ├── controller/     
│   │   │   │   ├── service/        
│   │   │   │   ├── repository/     
│   │   │   │   ├── model/          
│   │   │   │   ├── dto/            
│   │   │   │   ├── config/         
│   │   │   │   └── security/       
│   │   │   ├── resources/
│   │   │   │   └── application.yaml
│   │   ├── pom.xml
│
├── frontend/                   
│   ├── dlass-frontend/         
│   │   ├── src/
│   │   │   ├── components/     
│   │   │   ├── pages/          
│   │   │   │   ├── Login.jsx
│   │   │   │   ├── Register.jsx
│   │   │   │   ├── SearchProviders.jsx
│   │   │   │   ├── ProviderApply.jsx
│   │   │   │   ├── ProviderDashboard.jsx
│   │   │   │   ├── AdminDashboard.jsx
│   │   │   ├── services/       
│   │   │   ├── utils/
│   │   ├── package.json
│
├── database/                   
│   ├── schema/
│   ├── seed-data/
│
├── docs/                       
├── deployment/                 
├── scripts/                    
├── .gitignore                  
└── README.md                   
```

---

# ⚙️ Setup Instructions

## 1️⃣ Clone Repository

```bash
git clone <repository-url>
cd dlass-project
```

---

## 2️⃣ Backend Setup

```bash
cd backend/dlass-backend
mvn clean install
mvn spring-boot:run
```

Backend runs at:

```
http://localhost:8080
```

---

## 3️⃣ Frontend Setup

```bash
cd frontend/dlass-frontend
npm install
npm run dev
```

Frontend runs at:

```
http://localhost:5173
```

---

## 4️⃣ Environment Variables

Create `.env` in backend:

```
ADMIN_EMAIL=admin@dlass.com
ADMIN_PASSWORD=StrongPassword@123

MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your_email
MAIL_PASSWORD=your_app_password
```

---

# 🔐 Security

* JWT-based authentication
* Role-based authorization
* BCrypt password hashing
* Protected routes (frontend + backend)
* Environment-based configuration for sensitive data

---

# 🔄 Workflow

```
User registers
   ↓
Applies as provider
   ↓
Admin reviews & approves
   ↓
Provider becomes ACTIVE
   ↓
Users can discover and book services
```

---

# 🚀 Future Enhancements

* Payment integration (Razorpay / Stripe)
* Real-time notifications (WebSockets)
* Distance-based provider search
* Mobile application (React Native)
* Advanced AI recommendation system

---

# 💡 Developer Note

This project demonstrates:

* Real-world marketplace architecture
* Concurrency-safe booking system
* Data aggregation & analytics
* AI-driven feature design
* Full-stack integration (React + Spring Boot)
* Scalable and modular backend structure

---

# 📜 License

MIT License
