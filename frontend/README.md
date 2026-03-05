# DLASS Frontend

This is the React.js frontend application for the DLASS (Digital Local Appointment Scheduling System) platform.

## Overview

The frontend provides a user-friendly interface for customers, service providers, and administrators to interact with the DLASS system. It features a modern, responsive design built with React and styled with Tailwind CSS.

## Features

- **User Authentication**: Secure login and registration
- **Service Discovery**: Browse and search for local services
- **Appointment Booking**: Intuitive booking interface
- **Provider Dashboard**: Schedule management and analytics
- **Admin Panel**: Platform management tools
- **Responsive Design**: Works on desktop and mobile devices

## Technology Stack

- **React**: 18.x
- **Tailwind CSS**: For styling
- **Axios**: For API calls
- **React Router**: For navigation
- **Context API**: For state management

## Project Structure

```
frontend/dlass-frontend/
├── public/                 # Static assets
├── src/
│   ├── components/         # Reusable UI components
│   │   ├── admin/          # Admin-specific components
│   │   ├── common/         # Shared components
│   │   ├── provider/       # Provider-specific components
│   │   └── user/           # User-specific components
│   ├── pages/              # Page components
│   ├── services/           # API service functions
│   ├── utils/              # Utility functions and helpers
│   └── App.js              # Main application component
├── package.json            # Dependencies and scripts
└── tailwind.config.js      # Tailwind CSS configuration
```

## Prerequisites

- Node.js 16 or higher
- npm or yarn package manager

## Installation

1. Navigate to the frontend directory:

   ```bash
   cd frontend/dlass-frontend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

The application will be available at `http://localhost:3000`.

## Available Scripts

- `npm start`: Starts the development server
- `npm run build`: Builds the app for production
- `npm test`: Runs the test suite
- `npm run eject`: Ejects from Create React App (not recommended)

## Environment Variables

Create a `.env` file in the root of the frontend directory with the following variables:

```
REACT_APP_API_BASE_URL=http://localhost:8080/api
REACT_APP_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

## Building for Production

To build the application for production:

```bash
npm run build
```

This will create a `build` folder with the optimized production build.

## Deployment

The built files in the `build` folder can be deployed to any static hosting service like:

- Netlify
- Vercel
- AWS S3 + CloudFront
- GitHub Pages

## Contributing

Please follow the contribution guidelines in the main project README.

## API Integration

The frontend communicates with the Spring Boot backend API. All API calls are handled through the `services` directory. Make sure the backend is running before starting the frontend.

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Troubleshooting

### Common Issues

1. **Port 3000 already in use**: Change the port in `package.json` or kill the process using the port.
2. **API calls failing**: Ensure the backend is running and the API_BASE_URL is correct.
3. **Styling issues**: Clear browser cache or run `npm install` to ensure dependencies are up to date.

For more help, check the main project documentation or create an issue.
