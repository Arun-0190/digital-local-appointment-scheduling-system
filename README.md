# DLASS - Digital Local Appointment Scheduling System

DLASS is a full-stack service marketplace platform designed to streamline appointment scheduling between users and local service providers.

It enables users to discover services through structured filtering, apply for appointments, and interact with verified providers. Service providers onboard through an approval workflow, and administrators ensure platform quality and trust.

---

## Core Features

### For Users (Customers)

* Structured service discovery using Category → Subcategory → Pincode filtering
* Slot-based appointment booking (First Come First Serve model)
* Secure authentication using JWT

---

### For Service Providers

* Dedicated provider application flow (separate from user registration)
* Submit business details, services, and specialization
* Approval-based onboarding system
* Basic provider dashboard for managing data

---

### For Admins

* Approve or reject provider applications
* Maintain platform quality by controlling provider visibility
* Admin account securely created via backend seeder (environment-based)

---

## System Highlights

* Role-based access control (USER / PROVIDER / ADMIN)
* Approval-based marketplace model
* Category → Subcategory → Service hierarchy
* Secure backend with JWT authentication
* Clean separation of frontend and backend
* Production-oriented architecture

---

## Technology Stack

| Layer          | Technology                             |
| -------------- | -------------------------------------- |
| Frontend       | React.js (Vite) + Tailwind CSS         |
| Backend        | Spring Boot (Java 21)                  |
| Database       | MongoDB                                |
| Authentication | JWT                                    |
| Email          | SMTP (environment-based configuration) |
| Build Tools    | Maven, npm                             |

---

## Project Structure

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

## Setup Instructions

### 1. Clone Repository

```bash
git clone <repository-url>
cd dlass-project
```

---

### 2. Backend Setup

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

### 3. Frontend Setup

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

### 4. Environment Variables

Create a `.env` file in the backend root:

```
ADMIN_EMAIL=admin@dlass.com
ADMIN_PASSWORD=StrongPassword@123

MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your_email
MAIL_PASSWORD=your_app_password
```

Ensure `.env` is added to `.gitignore`.

---

## Security

* JWT-based authentication
* Role-based access control
* Password hashing using BCrypt
* Environment-based configuration for sensitive data
* Admin credentials not exposed via frontend

---

## Workflow

```
User registers → applies as provider → admin reviews → provider becomes ACTIVE → visible in search
```

---

## Future Enhancements

* Payment integration (Razorpay)
* Email notifications (booking confirmations and reminders)
* Advanced analytics dashboard
* Distance-based provider sorting
* AI-based recommendations

---

## Developer Note

This project is structured as a real-world service marketplace system and demonstrates:

* Backend architecture and API design
* Secure authentication and authorization
* Approval workflows
* Scalable frontend-backend integration
* Product-oriented system design

---

## License

MIT License
