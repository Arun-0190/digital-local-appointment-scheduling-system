<<<<<<< HEAD
# DLASS - Digital Local Appointment Scheduling System

DLASS is a comprehensive web-based platform designed to streamline appointment scheduling for local service providers. It empowers users to discover services, book appointments seamlessly, and make secure payments, while providing service providers with powerful tools to manage their schedules, handle emergencies, and gain insights through analytics dashboards.

## Features

### For Users (Customers)

- **Service Discovery**: Find local services by category and pincode
- **Appointment Booking**: First Come First Serve (FCFS) booking system
- **Secure Payments**: Integrated online payment processing
- **Notifications**: Real-time in-app and email notifications

### For Service Providers

- **Schedule Management**: Easy creation and management of service slots
- **Emergency Handling**: Quick shutdown and rescheduling capabilities
- **Analytics Dashboard**: Business insights and performance metrics

### For Admins

- **Provider Verification**: Streamlined onboarding process
- **Category Management**: Centralized service categorization
- **Platform Monitoring**: Comprehensive oversight tools

## Technology Stack

- **Frontend**: React.js with Tailwind CSS
- **Backend**: Spring Boot (Java 21) with REST APIs
- **Database**: MongoDB
- **Security**: JWT Authentication
- **Payments**: Razorpay integration
- **Email**: SMTP-based notifications
- **Deployment**: Docker-ready configurations

## Project Structure

```
DLASS PROJECT/
├── backend/                    # Backend source code
│   ├── dlass-backend/          # Spring Boot application
│   │   ├── src/
│   │   │   ├── main/java/com/dlass/backend/  # Java source files
│   │   │   ├── main/resources/               # Application configs
│   │   │   └── test/                         # Unit tests
│   │   ├── pom.xml                           # Maven configuration
│   │   └── README.md
│   └── README.md
├── frontend/                   # Frontend source code
│   ├── dlass-frontend/         # React application
│   │   ├── src/
│   │   │   ├── components/     # Reusable UI components
│   │   │   ├── pages/          # Page components
│   │   │   ├── services/       # API service functions
│   │   │   └── utils/          # Utility functions
│   │   ├── public/             # Static assets
│   │   ├── package.json        # Node dependencies
│   │   └── tailwind.config.js  # Tailwind configuration
│   └── README.md
├── database/                   # Database related files
│   ├── schema/                 # MongoDB collection schemas
│   ├── seed-data/              # Sample data for development
│   └── indexes.md              # Database indexing guidelines
├── docs/                       # Project documentation
│   ├── api-docs/               # API endpoint documentation
│   ├── diagrams/               # Architecture and flow diagrams
│   └── SRS/                    # Software Requirements Specification
├── deployment/                 # Deployment configurations
│   ├── backend-deploy.md       # Backend deployment guide
│   ├── frontend-deploy.md      # Frontend deployment guide
│   └── env-variables.md        # Environment variables setup
├── third-party/                # Third-party integrations
│   ├── payment/                # Razorpay integration notes
│   ├── email/                  # SMTP configuration
│   └── google-business/        # Google Business Profile integration
├── scripts/                    # Build and utility scripts
├── .gitignore                  # Git ignore rules
├── CONTRIBUTING.md             # Contribution guidelines
├── CHANGELOG.md                # Version history
└── README.md                   # This file
```

## Prerequisites

- **Java**: JDK 21 or higher
- **Node.js**: Version 16 or higher
- **MongoDB**: Version 5.0 or higher
- **Maven**: For backend builds
- **Git**: For version control

## Quick Start

1. **Clone the Repository**

   ```bash
   git clone <repository-url>
   cd dlass-project
   ```

2. **Setup Backend**

   ```bash
   cd backend/dlass-backend
   mvn clean install
   # Configure application.yaml with your MongoDB connection
   mvn spring-boot:run
   ```

3. **Setup Frontend**

   ```bash
   cd frontend/dlass-frontend
   npm install
   npm start
   ```

4. **Database Setup**
   - Start MongoDB service
   - Import seed data from `database/seed-data/`

## Build Scripts

Use the provided build scripts for quick setup:

- **Windows**: Run `scripts/build-backend.bat` and `scripts/build-frontend.bat`
- **Linux/Mac**: Use corresponding shell scripts (create if needed)

## API Documentation

API endpoints are documented in `docs/api-docs/api-endpoints.md`. The backend runs on `http://localhost:8080` by default.

## Deployment

Refer to deployment guides in the `deployment/` folder for production setup instructions.

## Contributing

Please read `CONTRIBUTING.md` for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Future Enhancements

- Advanced AI-based analytics
- Mobile application support
- Map integration for location-based services
- SMS/WhatsApp notifications

## Support

For support, email support@dlass.com or create an issue in the repository.

---

**DLASS** - Making local service appointments effortless and efficient.
=======
# digital-local-appointment-scheduling-system
DLASS – A full-stack service marketplace platform for managing service providers, bookings, and availability, built using Java Spring Boot and modern web technologies.
>>>>>>> 16052d35957db3f6a4640c0c86802fb5d6c873e4
