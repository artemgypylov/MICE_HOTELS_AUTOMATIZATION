# MICE Hotel Event Constructor

A modern B2B web application that allows corporate clients and event managers to create custom event proposals like a constructor, instantly getting preliminary cost estimates.

## 🎯 Features

- **5-Step Wizard Interface**
  - Step 1: Basic Parameters (dates, guests, event format)
  - Step 2: Hall Selection (with capacity filtering and seating layouts)
  - Step 3: Catering Options (menus, coffee breaks, banquets)
  - Step 4: Additional Services (AV equipment, floristics, transfer, accommodation)
  - Step 5: Final Estimate (detailed breakdown and submission)

- **Real-time Price Calculation**
- **User Authentication (JWT-based)**
- **Responsive Design (Mobile-friendly)**
- **Modular Architecture (Easy to extend)**
- **Database-driven Configuration**

## 🏗️ Architecture

### Technology Stack

**Backend:**
- Node.js 18+ with TypeScript
- Express.js
- PostgreSQL 14+
- Prisma ORM
- JWT Authentication
- bcrypt for password hashing

**Frontend:**
- React 18 with TypeScript
- Material-UI (MUI) v5
- React Router v6
- React Query (TanStack Query)
- Vite

**DevOps:**
- Docker & Docker Compose
- PostgreSQL container

## 📋 Prerequisites

- Node.js 18+ LTS
- Docker and Docker Compose (for easy setup)
- OR PostgreSQL 14+ (if not using Docker)

## 🚀 Quick Start with Docker

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd MICE_HOTELS_AUTOMATIZATION
   ```

2. **Start all services**
   ```bash
   docker-compose up
   ```

   This will start:
   - PostgreSQL database on port 5432
   - Backend API on port 3000
   - Frontend app on port 5173

3. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000
   - API Health Check: http://localhost:3000/health

## 🔧 Manual Setup (Without Docker)

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup environment variables**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` and configure your database:
   ```env
   DATABASE_URL="postgresql://postgres:password@localhost:5432/mice_hotel_db?schema=public"
   JWT_SECRET="your-super-secret-jwt-key"
   JWT_EXPIRES_IN="24h"
   PORT=3000
   CORS_ORIGIN="http://localhost:5173"
   ```

4. **Run database migrations**
   ```bash
   npx prisma migrate dev
   ```

5. **Generate Prisma Client**
   ```bash
   npx prisma generate
   ```

6. **Seed the database**
   ```bash
   npm run prisma:seed
   ```

7. **Start the backend server**
   ```bash
   npm run dev
   ```

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup environment variables**
   ```bash
   cp .env.example .env
   ```

   Edit `.env`:
   ```env
   VITE_API_URL=http://localhost:3000/api
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Access the application**
   Open http://localhost:5173 in your browser

## 📊 Database Management

### Prisma Studio (Database GUI)
```bash
cd backend
npx prisma studio
```

This opens a visual database editor at http://localhost:5555

### Create a new migration
```bash
cd backend
npx prisma migrate dev --name <migration-name>
```

### Reset database (caution: deletes all data)
```bash
cd backend
npx prisma migrate reset
```

## 🔑 Test Credentials

After running the seed script, you can login with:
- **Email:** client@example.com
- **Password:** password123

## 📖 API Documentation

### Authentication Endpoints

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (requires auth)

### Hotel Endpoints

- `GET /api/hotels` - List all hotels
- `GET /api/hotels/:id` - Get hotel details
- `GET /api/hotels/:hotelId/halls` - Get hotel halls
- `GET /api/hotels/:hotelId/catering` - Get catering options
- `GET /api/hotels/:hotelId/services` - Get additional services

### Booking Endpoints (Authenticated)

- `POST /api/bookings` - Create new booking
- `GET /api/bookings` - List user's bookings
- `GET /api/bookings/:id` - Get booking details
- `PUT /api/bookings/:id` - Update booking
- `POST /api/bookings/:id/calculate` - Calculate booking price
- `POST /api/bookings/:id/submit` - Submit booking for review

## 🎨 Frontend Structure

```
frontend/src/
├── components/
│   ├── layout/
│   │   └── Layout.tsx
│   └── wizard/
│       └── steps/
│           ├── Step1_BasicParameters.tsx
│           ├── Step2_HallSelection.tsx
│           ├── Step3_Catering.tsx
│           ├── Step4_AdditionalServices.tsx
│           └── Step5_FinalEstimate.tsx
├── pages/
│   ├── HomePage.tsx
│   ├── WizardPage.tsx
│   └── DashboardPage.tsx
├── services/
│   └── api.ts
├── types/
│   └── index.ts
├── App.tsx
└── main.tsx
```

## 🔧 Backend Structure

```
backend/src/
├── routes/
│   ├── auth.routes.ts
│   ├── hotels.routes.ts
│   ├── halls.routes.ts
│   ├── catering.routes.ts
│   ├── services.routes.ts
│   └── bookings.routes.ts
├── middleware/
│   └── auth.middleware.ts
├── utils/
│   ├── jwt.ts
│   └── password.ts
├── types/
│   └── index.ts
└── app.ts
```

## 🚢 Production Deployment

### Backend Deployment (Railway/Render/AWS)

1. **Build the application**
   ```bash
   cd backend
   npm run build
   ```

2. **Set production environment variables**
   ```env
   DATABASE_URL=<production-database-url>
   JWT_SECRET=<strong-random-secret>
   NODE_ENV=production
   CORS_ORIGIN=<frontend-url>
   ```

3. **Run migrations**
   ```bash
   npx prisma migrate deploy
   ```

4. **Start the server**
   ```bash
   npm start
   ```

### Frontend Deployment (Vercel/Netlify)

1. **Build the application**
   ```bash
   cd frontend
   npm run build
   ```

2. **Set environment variable**
   ```env
   VITE_API_URL=<backend-api-url>
   ```

3. **Deploy the `dist` folder**

## 🔒 Security Considerations

- All passwords are hashed using bcrypt
- JWT tokens for authentication
- Environment variables for sensitive data
- SQL injection protection through Prisma ORM
- CORS configured for specific origins
- Input validation on both frontend and backend

## 📝 Future Enhancements

- PDF generation for proposals
- Email notifications
- Multi-hotel support
- Payment integration
- Calendar view for availability
- Admin panel for hotel managers
- Analytics dashboard
- Mobile app
- Multi-language support

## 🐛 Troubleshooting

### Database Connection Issues
```bash
# Check if PostgreSQL is running
docker ps

# View logs
docker-compose logs postgres

# Restart services
docker-compose restart
```

### Port Already in Use
```bash
# Find process using port 3000
lsof -i :3000
# or
netstat -ano | findstr :3000

# Kill the process
kill -9 <PID>
```

### Prisma Client Out of Sync
```bash
cd backend
npx prisma generate
```

## 📄 License

MIT

## 👥 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📧 Support

For support, please open an issue in the repository.

---

**Built with ❤️ for the hospitality industry**
