# Exchange Office Web Portal

## Overview

This is a secure, client-facing web portal for an Exchange Office built with a full-stack TypeScript architecture. The application allows clients to log in, view multi-currency balances (USD, SAR, YER), perform currency exchanges, and transfer funds to other clients. It features live exchange rate integration and a responsive, modern UI.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized production builds
- **UI Framework**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens and dark mode support
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **Form Management**: React Hook Form with Zod schema validation

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: JWT-based authentication with bcrypt password hashing
- **API Design**: RESTful endpoints with consistent error handling
- **External Services**: Integration with FreeCurrencyAPI and Fixer.io for live exchange rates

### Project Structure
- **Monorepo**: Single repository with shared code between client and server
- **Client**: React application in `/client` directory
- **Server**: Express API in `/server` directory  
- **Shared**: Common schemas and types in `/shared` directory

## Key Components

### Authentication System
- JWT token-based authentication with 24-hour expiration
- Bcrypt password hashing with 12 salt rounds
- Protected routes with middleware authentication
- Automatic token refresh and logout on expiration

### Database Layer
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Connection**: Neon serverless database with connection pooling
- **Migrations**: Automatic schema management with drizzle-kit
- **Storage Pattern**: Repository pattern with IStorage interface for data access

### Currency Exchange System
- Real-time exchange rates from multiple API sources
- Automatic rate updates every hour
- Fallback mechanisms between different rate providers
- Support for USD, SAR, and YER currencies

### UI/UX Design
- Responsive design with mobile-first approach
- Dark mode support with CSS custom properties
- Comprehensive component library from shadcn/ui
- Toast notifications for user feedback
- Loading states and error handling

## Data Flow

### Authentication Flow
1. User submits credentials via login form
2. Server validates against hashed passwords in database
3. JWT token generated and returned to client
4. Token stored in localStorage and included in subsequent requests
5. Server middleware validates token on protected routes

### Transaction Flow
1. Client requests account balances and exchange rates
2. User initiates exchange or transfer through form validation
3. Server validates transaction and updates account balances
4. Transaction record created for audit trail
5. Client receives confirmation and updated balances

### Exchange Rate Updates
1. Scheduled job fetches rates every hour from external APIs
2. FreeCurrencyAPI attempted first, Fixer.io as fallback
3. Rates stored in database with timestamps
4. Client queries current rates for real-time calculations

## External Dependencies

### Database
- **Neon PostgreSQL**: Serverless PostgreSQL database
- **Connection**: WebSocket-based connection with connection pooling
- **Environment**: Requires DATABASE_URL environment variable

### Exchange Rate APIs
- **FreeCurrencyAPI**: Primary source for currency exchange rates
- **Fixer.io**: Fallback exchange rate provider
- **API Keys**: Configurable via environment variables

### Development Tools
- **Replit Integration**: Custom vite plugins for Replit environment
- **Hot Reload**: Vite HMR with WebSocket connections
- **Error Handling**: Runtime error overlay for development

## Deployment Strategy

### Build Process
- **Client**: Vite builds optimized static assets to `/dist/public`
- **Server**: esbuild bundles server code to `/dist/index.js`
- **Assets**: Static files served from build output directory

### Environment Configuration
- **Development**: tsx for TypeScript execution with hot reload
- **Production**: Node.js serves bundled JavaScript
- **Database**: Environment-specific DATABASE_URL configuration

### Security Considerations
- JWT secret configurable via environment variables
- Password hashing with industry-standard bcrypt
- CORS and security headers configured
- Input validation with Zod schemas
- Protected API endpoints with authentication middleware

### Scalability
- Connection pooling for database connections
- Stateless authentication with JWT
- Caching strategies for exchange rates
- Optimized bundle sizes with code splitting