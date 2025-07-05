# MoneyWise - Personal Finance Management System

## Overview

MoneyWise is a comprehensive personal finance management application built with a modern full-stack architecture. The system provides income/expense tracking, savings goal management, AI-powered financial insights, and comprehensive reporting features. It's designed as a responsive web application with Indonesian language support.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query (React Query) for server state
- **UI Framework**: Shadcn/ui components with Radix UI primitives
- **Styling**: Tailwind CSS with custom theming support
- **Form Handling**: React Hook Form with Zod validation
- **Build Tool**: Vite with hot module replacement

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **Authentication**: Replit Auth with OpenID Connect
- **Session Management**: Express sessions with PostgreSQL storage
- **API Design**: RESTful endpoints with consistent error handling

### Database Architecture
- **Database**: PostgreSQL (via Neon serverless)
- **ORM**: Drizzle ORM with type-safe queries
- **Schema Management**: Drizzle Kit for migrations
- **Connection**: Connection pooling for optimal performance

## Key Components

### Authentication System
- **Provider**: Replit Auth integration using OpenID Connect
- **Session Storage**: PostgreSQL-backed sessions for scalability
- **User Management**: Automatic user creation and profile management
- **Route Protection**: Middleware-based route authentication

### Financial Tracking Engine
- **Transaction Management**: CRUD operations for income/expense tracking
- **Category System**: Hierarchical categorization with icons and colors
- **Budget Monitoring**: Category-based budget limits with alerts
- **Date Range Filtering**: Flexible transaction querying by date periods

### Savings Goals System
- **Goal Creation**: Target-based savings with deadlines
- **Progress Tracking**: Visual progress indicators and milestone tracking
- **Contribution Management**: Manual savings contributions
- **Achievement Notifications**: Progress alerts and goal completion

### AI Integration
- **Service**: OpenAI GPT integration for financial analysis
- **Insights Generation**: Spending pattern analysis and recommendations
- **Alert System**: Budget overspending and savings reminders
- **Investment Suggestions**: AI-powered investment recommendations

### Reporting System
- **Report Generation**: PDF and Excel export capabilities
- **Data Aggregation**: Transaction summaries and category breakdowns
- **Visualization**: Chart-ready data for dashboard displays
- **Scheduled Reports**: Automated periodic report generation

## Data Flow

### Authentication Flow
1. User initiates login via Replit Auth
2. OpenID Connect verification and token exchange
3. Session creation and user profile synchronization
4. Protected route access with session validation

### Transaction Processing
1. Client submits transaction via form validation
2. Server validates data against Zod schemas
3. Database insertion with transaction categorization
4. Real-time query invalidation for UI updates
5. AI analysis trigger for spending patterns

### Savings Goal Management
1. Goal creation with target amount and deadline
2. Progress calculation based on contributions
3. Deadline monitoring and reminder system
4. Achievement tracking and notification delivery

### AI Analysis Pipeline
1. Transaction data aggregation by time periods
2. OpenAI API integration for pattern analysis
3. Insight generation with actionable recommendations
4. Storage and retrieval of AI-generated insights

## External Dependencies

### Core Framework Dependencies
- React ecosystem (React, React DOM, React Hook Form)
- TanStack Query for server state management
- Wouter for lightweight routing
- Zod for runtime type validation

### UI and Styling
- Radix UI primitives for accessible components
- Tailwind CSS for utility-first styling
- Lucide React for consistent iconography
- Class Variance Authority for component variants

### Database and Backend
- Drizzle ORM for type-safe database operations
- Neon serverless PostgreSQL driver
- Express.js with middleware for API handling
- Connect-pg-simple for session storage

### Development Tools
- Vite for fast development and building
- TypeScript for type safety
- ESBuild for production bundling
- PostCSS with Autoprefixer

### External Services
- OpenAI API for AI-powered financial insights
- Replit Auth for authentication services
- Neon for managed PostgreSQL hosting

## Deployment Strategy

### Development Environment
- Vite dev server with HMR for frontend development
- TSX for TypeScript execution in development
- Concurrent frontend and backend development servers
- Real-time error overlay and debugging tools

### Production Build
- Vite production build with asset optimization
- ESBuild bundling for server code
- Static asset serving via Express
- Environment-based configuration management

### Database Management
- Drizzle migrations for schema evolution
- Connection pooling for production scalability
- Environment variable configuration for security
- Automated backup and recovery procedures

## Changelog
- June 30, 2025. Initial setup
- July 4, 2025. Major updates:
  - Migrated database from PostgreSQL to MySQL for Hostinger compatibility
  - Integrated Gemini AI API for financial insights
  - Added comprehensive financial charts with responsive design
  - Implemented mobile-responsive UI throughout the application
  - Prepared deployment configuration for Hostinger hosting
  - Enhanced dashboard with interactive data visualizations
- July 5, 2025. Railway API Integration:
  - Configured frontend to use Railway-hosted backend API
  - Updated all fetch calls to use VITE_API_URL environment variable
  - Connected to MySQL database on Hostinger via Railway
  - Modified API request utilities to support external API URL
  - Configured authentication flows for Railway backend
  - Added CORS configuration for cross-origin requests
  - Created health check endpoints for Railway monitoring
  - Added deployment configuration files (railway.json, .env.railway)
  - Fixed 502 and CORS errors for production deployment

## User Preferences

Preferred communication style: Simple, everyday language.