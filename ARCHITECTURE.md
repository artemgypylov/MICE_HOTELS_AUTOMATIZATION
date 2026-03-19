# MICE Hotel Event Constructor - Technical Architecture

## Technology Stack

### Frontend
- **Framework**: React 18+ with TypeScript
- **State Management**: React Context API + React Query for server state
- **UI Framework**: Material-UI (MUI) v5 for professional B2B interface
- **Form Management**: React Hook Form with Zod validation
- **Routing**: React Router v6
- **Date Handling**: date-fns
- **PDF Generation**: jsPDF + html2canvas for client-side generation
- **Build Tool**: Vite for fast development and optimized production builds

### Backend
- **Runtime**: Node.js 18+ LTS
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL 14+ (production-ready, ACID compliant)
- **ORM**: Prisma (type-safe, excellent DX, automatic migrations)
- **API Documentation**: Swagger/OpenAPI
- **Authentication**: JWT with bcrypt for password hashing
- **Validation**: Zod (shared with frontend)
- **File Storage**: AWS S3 or local storage for PDF archives

### Development & DevOps
- **Package Manager**: npm/yarn
- **Code Quality**: ESLint, Prettier
- **Testing**: Jest + React Testing Library (frontend), Jest + Supertest (backend)
- **Containerization**: Docker + Docker Compose
- **Environment Management**: dotenv

## System Architecture

### High-Level Architecture
```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│   Browser   │◄───────►│   Backend   │◄───────►│  PostgreSQL │
│  (React SPA)│   REST  │  (Express)  │         │   Database  │
└─────────────┘   API   └─────────────┘         └─────────────┘
                              │
                              ▼
                        ┌─────────────┐
                        │  S3/Storage │
                        │    (PDFs)   │
                        └─────────────┘
```

### Application Flow
1. User accesses the wizard interface
2. Step-by-step data collection (5 steps)
3. Real-time price calculation on each step
4. Final estimate generation
5. PDF creation and email notification
6. Hotel manager receives notification

## Database Schema

### Core Tables

#### users
- id (UUID, PK)
- email (VARCHAR, UNIQUE, NOT NULL)
- password_hash (VARCHAR, NOT NULL)
- role (ENUM: 'client', 'manager', 'admin')
- company_name (VARCHAR)
- phone (VARCHAR)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)

#### hotels
- id (UUID, PK)
- name (VARCHAR, NOT NULL)
- address (TEXT)
- contact_email (VARCHAR)
- contact_phone (VARCHAR)
- settings (JSONB) - hotel-specific configuration
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)

#### halls
- id (UUID, PK)
- hotel_id (UUID, FK -> hotels.id)
- name (VARCHAR, NOT NULL)
- max_capacity (INTEGER, NOT NULL)
- area_sqm (DECIMAL)
- base_price_per_day (DECIMAL, NOT NULL)
- description (TEXT)
- amenities (JSONB) - projector, wifi, etc.
- images (JSONB) - array of image URLs
- is_active (BOOLEAN)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)

#### seating_layouts
- id (UUID, PK)
- hall_id (UUID, FK -> halls.id)
- layout_type (ENUM: 'theater', 'classroom', 'u_shape', 'banquet', 'cocktail')
- capacity (INTEGER, NOT NULL)
- price_modifier (DECIMAL) - multiplier or fixed addition

#### catering_categories
- id (UUID, PK)
- hotel_id (UUID, FK -> hotels.id)
- name (VARCHAR, NOT NULL) - 'Coffee Break', 'Lunch', 'Banquet'
- description (TEXT)
- sort_order (INTEGER)

#### catering_items
- id (UUID, PK)
- category_id (UUID, FK -> catering_categories.id)
- name (VARCHAR, NOT NULL)
- description (TEXT)
- price_per_person (DECIMAL, NOT NULL)
- min_persons (INTEGER)
- dietary_options (JSONB) - vegetarian, halal, etc.
- is_active (BOOLEAN)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)

#### service_categories
- id (UUID, PK)
- hotel_id (UUID, FK -> hotels.id)
- name (VARCHAR, NOT NULL) - 'AV Equipment', 'Floristics', 'Transfer', 'Accommodation'
- sort_order (INTEGER)

#### services
- id (UUID, PK)
- category_id (UUID, FK -> service_categories.id)
- name (VARCHAR, NOT NULL)
- description (TEXT)
- pricing_type (ENUM: 'fixed', 'per_person', 'per_day', 'per_hour')
- base_price (DECIMAL, NOT NULL)
- unit (VARCHAR) - 'piece', 'day', 'hour'
- is_active (BOOLEAN)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)

#### bookings
- id (UUID, PK)
- user_id (UUID, FK -> users.id)
- hotel_id (UUID, FK -> hotels.id)
- status (ENUM: 'draft', 'pending', 'confirmed', 'cancelled')
- event_name (VARCHAR)
- start_date (DATE, NOT NULL)
- end_date (DATE, NOT NULL)
- num_guests (INTEGER, NOT NULL)
- event_format (VARCHAR) - 'conference', 'training', 'corporate_party'
- total_price (DECIMAL)
- notes (TEXT)
- pdf_url (VARCHAR)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)

#### booking_halls
- id (UUID, PK)
- booking_id (UUID, FK -> bookings.id)
- hall_id (UUID, FK -> halls.id)
- seating_layout_id (UUID, FK -> seating_layouts.id, NULLABLE)
- date (DATE, NOT NULL)
- price (DECIMAL, NOT NULL)
- UNIQUE(hall_id, date) - prevent double booking

#### booking_catering
- id (UUID, PK)
- booking_id (UUID, FK -> bookings.id)
- catering_item_id (UUID, FK -> catering_items.id)
- quantity (INTEGER) - usually num_guests
- date (DATE)
- price (DECIMAL, NOT NULL)

#### booking_services
- id (UUID, PK)
- booking_id (UUID, FK -> bookings.id)
- service_id (UUID, FK -> services.id)
- quantity (INTEGER)
- price (DECIMAL, NOT NULL)

### Indexes
- users(email)
- halls(hotel_id, is_active)
- bookings(user_id, status, start_date)
- booking_halls(hall_id, date) - for availability checks
- catering_items(category_id, is_active)
- services(category_id, is_active)

### Database Relations
- One hotel has many halls
- One hall has many seating layouts
- One hotel has many catering categories and service categories
- One category has many items/services
- One booking has many hall bookings, catering items, and services
- One user can have many bookings

## API Endpoints

### Authentication
- POST `/api/auth/register` - Register new user
- POST `/api/auth/login` - Login user
- POST `/api/auth/refresh` - Refresh JWT token
- GET `/api/auth/me` - Get current user

### Hotels
- GET `/api/hotels` - List all hotels
- GET `/api/hotels/:id` - Get hotel details

### Halls
- GET `/api/hotels/:hotelId/halls` - List halls
- GET `/api/halls/:id` - Get hall details with seating layouts
- POST `/api/halls/:id/check-availability` - Check availability for date range

### Catering
- GET `/api/hotels/:hotelId/catering` - Get all catering options grouped by category
- GET `/api/catering/:id` - Get catering item details

### Services
- GET `/api/hotels/:hotelId/services` - Get all services grouped by category
- GET `/api/services/:id` - Get service details

### Bookings
- POST `/api/bookings` - Create new booking (draft)
- GET `/api/bookings/:id` - Get booking details
- PUT `/api/bookings/:id` - Update booking
- POST `/api/bookings/:id/calculate` - Calculate total price
- POST `/api/bookings/:id/submit` - Submit booking for review
- POST `/api/bookings/:id/generate-pdf` - Generate PDF proposal
- GET `/api/bookings` - List user's bookings

### Admin (Hotel Managers)
- GET `/api/admin/bookings` - List all bookings for hotel
- PUT `/api/admin/bookings/:id/status` - Update booking status
- CRUD endpoints for halls, catering, services

## Frontend Structure

```
src/
├── components/
│   ├── common/
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   └── Card.tsx
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   └── Layout.tsx
│   └── wizard/
│       ├── WizardContainer.tsx
│       ├── StepIndicator.tsx
│       ├── steps/
│       │   ├── Step1_BasicParameters.tsx
│       │   ├── Step2_HallSelection.tsx
│       │   ├── Step3_Catering.tsx
│       │   ├── Step4_AdditionalServices.tsx
│       │   └── Step5_FinalEstimate.tsx
│       └── PriceCalculator.tsx
├── hooks/
│   ├── useBooking.ts
│   ├── useHalls.ts
│   ├── useCatering.ts
│   └── useServices.ts
├── services/
│   ├── api.ts
│   ├── auth.ts
│   └── pdf.ts
├── types/
│   ├── booking.ts
│   ├── hall.ts
│   ├── catering.ts
│   └── service.ts
├── contexts/
│   ├── AuthContext.tsx
│   └── BookingContext.tsx
├── utils/
│   ├── validation.ts
│   ├── pricing.ts
│   └── dateHelpers.ts
├── pages/
│   ├── HomePage.tsx
│   ├── WizardPage.tsx
│   ├── DashboardPage.tsx
│   └── AdminPage.tsx
└── App.tsx
```

## Backend Structure

```
src/
├── controllers/
│   ├── auth.controller.ts
│   ├── hotels.controller.ts
│   ├── halls.controller.ts
│   ├── catering.controller.ts
│   ├── services.controller.ts
│   └── bookings.controller.ts
├── routes/
│   ├── auth.routes.ts
│   ├── hotels.routes.ts
│   ├── halls.routes.ts
│   ├── catering.routes.ts
│   ├── services.routes.ts
│   └── bookings.routes.ts
├── services/
│   ├── booking.service.ts
│   ├── pricing.service.ts
│   ├── availability.service.ts
│   ├── pdf.service.ts
│   └── email.service.ts
├── middleware/
│   ├── auth.middleware.ts
│   ├── validation.middleware.ts
│   └── error.middleware.ts
├── utils/
│   ├── jwt.ts
│   ├── password.ts
│   └── logger.ts
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
├── types/
│   └── index.ts
└── app.ts
```

## Key Design Decisions

### 1. Modular Architecture
- Each step of the wizard is a separate React component
- Backend services are separated by domain (halls, catering, services)
- Easy to add/remove features without affecting other modules

### 2. Real-time Price Calculation
- Price calculator runs on each step change
- Backend provides calculation endpoint for server-side validation
- Pricing rules stored in database for flexibility

### 3. Availability Management
- Separate table for hall bookings by date
- Prevents double-booking through database constraints
- Real-time availability checks during hall selection

### 4. Draft Bookings
- Users can save progress and return later
- Bookings start as 'draft' status
- Only submitted bookings notify hotel managers

### 5. Extensibility
- JSONB fields for flexible attributes (amenities, settings)
- Category-based organization for easy addition of new items
- Role-based access control for future multi-tenancy

### 6. Performance Optimization
- Database indexes on frequently queried fields
- React Query for caching and efficient data fetching
- Optimistic updates in UI for better UX

### 7. Security
- JWT authentication with httpOnly cookies
- Password hashing with bcrypt
- Input validation on both frontend and backend
- SQL injection prevention through Prisma ORM

## Deployment Considerations

### Development Environment
```bash
docker-compose up  # Starts PostgreSQL, backend, and frontend
```

### Production Environment
- **Frontend**: Deployed to Vercel/Netlify (static hosting)
- **Backend**: Deployed to AWS EC2/ECS or Railway/Render
- **Database**: AWS RDS PostgreSQL or managed PostgreSQL
- **Storage**: AWS S3 for PDF files
- **Email**: SendGrid or AWS SES

### Environment Variables
```
# Backend
DATABASE_URL=postgresql://user:pass@localhost:5432/mice_db
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=24h
AWS_S3_BUCKET=mice-pdfs
AWS_REGION=us-east-1
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587

# Frontend
VITE_API_URL=http://localhost:3000/api
```

## Scalability Considerations

### Current MVP Scope
- Single hotel support
- Up to 1000 bookings per month
- Up to 50 concurrent users

### Future Scaling Path
1. **Multi-tenancy**: Add hotel_id to most tables for multiple hotels
2. **Caching**: Redis for session management and frequently accessed data
3. **CDN**: CloudFront/Cloudflare for static assets and PDFs
4. **Load Balancing**: Multiple backend instances behind load balancer
5. **Database**: Read replicas for heavy read operations
6. **Microservices**: Split into separate services if needed (booking, pricing, notifications)

## Next Steps for MVP Development

1. Initialize projects (frontend/backend)
2. Setup database with Prisma
3. Create seed data for testing
4. Implement authentication
5. Build wizard flow (steps 1-5)
6. Implement pricing calculation
7. Add PDF generation
8. Add email notifications
9. Create admin panel for hotel managers
10. Testing and deployment

## Success Metrics

- Time to create booking: < 5 minutes
- Price calculation accuracy: 100%
- System uptime: 99.9%
- PDF generation time: < 3 seconds
- Mobile responsive: Yes

This architecture provides a solid foundation for a production-ready MVP that can scale as the product grows.
