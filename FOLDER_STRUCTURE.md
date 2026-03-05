# DLASS Project Folder Structure

## Overview

This document provides a detailed explanation of the folder structure for the DLASS (Digital Local Appointment Scheduling System) project. It describes the purpose of each directory and subfolder to help developers understand the organization and navigate the codebase effectively.

## Root Level Folders

### backend/

The `backend/` directory contains all server-side code, configurations, and resources for the DLASS system. It is the core of the application's business logic, API endpoints, and data processing.

#### backend/dlass-backend/

This is the main Spring Boot application directory, housing the Java-based backend implementation.

- **src/main/java/com/dlass/backend/**: Contains the primary Java source code files. This includes:
  - Controllers for handling HTTP requests and responses
  - Service classes for business logic implementation
  - Model/Entity classes representing data structures
  - Configuration classes for Spring Boot settings
  - Security configurations for JWT authentication

- **src/main/resources/**: Stores non-code resources and configuration files:
  - `application.yaml`: Main configuration file for Spring Boot application settings, database connections, and other properties
  - `static/`: Static assets served by the application (if any)
  - `templates/`: Server-side templates (if used)

- **src/test/java/com/dlass/backend/**: Contains unit tests, integration tests, and test utilities for the backend application. Ensures code quality and prevents regressions.

- **pom.xml**: Maven project object model file defining:
  - Project dependencies (Spring Boot starters, MongoDB driver, etc.)
  - Build plugins and configurations
  - Project metadata and version information

- **mvnw** and **mvnw.cmd**: Maven wrapper scripts that allow running Maven commands without requiring Maven to be installed globally. Ensures consistent Maven version across different environments.

- **.gitattributes** and **.gitignore**: Git configuration files for version control management specific to the backend module.

- **target/**: Generated directory containing compiled classes, JAR files, and other build artifacts (typically ignored by Git).

### frontend/

The `frontend/` directory houses all client-side code for the DLASS web application, built with React.js and styled using Tailwind CSS.

#### frontend/dlass-frontend/

The main React application directory.

- **src/components/**: Reusable UI components organized by user roles:
  - `admin/`: Components specific to administrative functions
  - `common/`: Shared components used across different user types
  - `provider/`: Components for service provider interfaces
  - `user/`: Components for end-user/customer interfaces

- **src/pages/**: Page-level components representing different views or screens in the application, such as login, dashboard, booking forms, etc.

- **src/services/**: Contains functions and utilities for API communication:
  - HTTP client configurations
  - API endpoint definitions
  - Data fetching and caching logic

- **src/utils/**: Utility functions and helper modules:
  - Date/time formatting functions
  - Validation helpers
  - Common constants and enums

- **package.json**: Node.js project configuration file specifying:
  - Project dependencies (React, Tailwind CSS, etc.)
  - Scripts for building, testing, and running the application
  - Project metadata

- **tailwind.config.js**: Configuration file for Tailwind CSS, defining custom themes, colors, and responsive breakpoints.

- **public/**: Static assets that are served directly by the web server (favicons, manifest files, etc.).

### database/

This directory contains all database-related files, schemas, and sample data for the MongoDB database used by DLASS.

- **schema/**: JSON schema definitions for MongoDB collections:
  - `appointments-schema.json`: Structure for appointment records
  - `availability-schema.json`: Schema for service provider availability slots
  - `providers-schema.json`: Structure for service provider information
  - `users-schema.json`: Schema for user/customer data

- **seed-data/**: Sample data files used for development and testing:
  - JSON files containing mock data for appointments, users, providers, services, and availability
  - Used to populate the database with initial data for testing purposes

- **indexes.md**: Documentation on database indexing strategies:
  - Recommended indexes for query performance
  - Indexing guidelines for different collections
  - Performance optimization tips

### docs/

The `docs/` directory contains all project documentation, specifications, and visual aids for understanding and maintaining the DLASS system.

- **api-docs/**: API documentation and reference materials:
  - `api-endpoints.md`: Detailed documentation of all REST API endpoints, including request/response formats and authentication requirements

- **diagrams/**: Visual representations of the system:
  - `architecture.png`: High-level system architecture diagram
  - `database-schema.png`: Database schema visualization
  - `flowcharts.png`: Process flow diagrams for key user journeys

- **SRS/**: Software Requirements Specification documents:
  - `DLASS_SRS.docx` and `DLASS_SRS.pdf`: Comprehensive requirements document outlining functional and non-functional requirements

### deployment/

This directory contains deployment configurations, scripts, and guides for setting up DLASS in different environments.

- **backend-deploy.md**: Step-by-step instructions for deploying the backend application, including:
  - Server setup requirements
  - Environment configuration
  - Build and deployment commands

- **frontend-deploy.md**: Deployment guide for the frontend application, covering:
  - Build processes for production
  - Static file hosting setup
  - CDN configuration

- **env-variables.md**: Documentation of all environment variables required for different deployment scenarios:
  - Database connection strings
  - API keys for third-party services
  - Security-related configurations

### third-party/

Documentation and configuration files for integrations with external services and APIs.

- **payment/**: Razorpay payment gateway integration:
  - `razorpay-notes.md`: Implementation notes, API usage, and configuration details

- **email/**: Email notification system configuration:
  - `smtp-config.md`: SMTP server setup and email template configurations

- **google-business/**: Google Business Profile integration:
  - `integration-notes.md`: Notes on integrating with Google Business services for enhanced local visibility

### scripts/

Utility scripts for automating common development and build tasks.

- **build-backend.bat**: Windows batch script for building the backend application, typically running Maven commands and any pre/post-build steps.

- **build-frontend.bat**: Windows batch script for building the frontend application, usually executing npm build commands and asset optimization.

## Root Level Files

- **.gitignore**: Git ignore file specifying files and directories that should not be tracked in version control (build artifacts, logs, sensitive configuration files).

- **README.md**: Main project documentation providing an overview of DLASS, setup instructions, features, and quick start guide.

- **CONTRIBUTING.md**: Guidelines for contributors, including coding standards, pull request processes, and development workflow.

## Conclusion

This folder structure follows best practices for modern web application development, promoting separation of concerns, maintainability, and scalability. The clear organization makes it easier for developers to locate files, understand dependencies, and contribute effectively to the DLASS project.