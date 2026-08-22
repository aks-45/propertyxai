# Property X AI Backend

This is the backend for the Property X AI application - an AI-powered property decision intelligence platform for Indian users.

## Features

- User authentication (registration, login, profile management)
- Property management (CRUD operations)
- Financial analysis engine with special handling for unknown/none states
- Google Maps Platform integration (geocoding, nearby places, routes, air quality)
- Multi-dimensional property scoring system
- BUY/RENT/WAIT decision engine
- AI-powered explanations using Gemini 2.5 Flash
- Government guidance system for Indian states
- Analysis history storage
- Location caching service

## Technology Stack

- Node.js with Express.js
- TypeScript
- PostgreSQL with Prisma ORM
- Zod for validation
- JWT for authentication
- bcrypt for password hashing
- Axios for HTTP requests
- Dotenv for environment variables

## Setup Instructions

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Then edit `.env` to add your actual values:
   - `DATABASE_URL`: PostgreSQL connection string
   - `JWT_SECRET`: Secret for JWT signing
   - `GOOGLE_MAPS_API_KEY`: Google Maps Platform API key
   - `GEMINI_API_KEY`: Gemini API key
   - `PORT`: Server port (default: 5000)

3. **Generate Prisma client**
   ```bash
   npx prisma generate
   ```

4. **Run database migrations**
   ```bash
   npx prisma migrate dev
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```
   Or:
   ```bash
   npx ts-node src/app.ts
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile (protected)
- `PUT /api/auth/profile` - Update user profile (protected)

### Profile
- `GET /api/profile` - Get profile (protected)
- `PUT /api/profile` - Update profile (protected)

### Properties
- `GET /api/properties` - Get all user properties (protected)
- `POST /api/properties` - Create a new property (protected)
- `GET /api/properties/:id` - Get property by ID (protected)
- `PUT /api/properties/:id` - Update property (protected)
- `DELETE /api/properties/:id` - Delete property (protected)

### Analysis
- `POST /api/properties/:propertyId/analyze` - Analyze a property (protected)
- `GET /api/analysis` - Get all analyses for user (protected)
- `GET /api/analysis/:id` - Get analysis by ID (protected)

### Location
- `POST /api/location/geocode` - Get location intelligence (protected)

### Government
- `GET /api/government/guide` - Get government guidance for property purchase (no auth required)

## Data Models

### User
- id, email, passwordHash, name, phone, currentState, currentCity, residencyStatus, familySize, purposeOfProperty, workplaceLocation, createdAt, updatedAt

### FinancialProfile
- id, userId, monthlyIncome, monthlyExpenses, availableIncome, expenditures (JSON), savings (JSON), investments (JSON), createdAt, updatedAt

### Property
- id, userId, propertyType, address, city, state, pincode, area, price, builtYear, floors, bedrooms, bathrooms, facing, amenities (JSON), createdAt, updatedAt

### Analysis
- id, userId, propertyId, financialSnapshot (JSON), locationSnapshot (JSON), scores (JSON), decision, confidence, aiExplanation (JSON), createdAt

### LocationCache
- id, address, lat, lng, nearbyPlaces (JSON), routes (JSON), airQuality (JSON), expiresAt, createdAt

### GovernmentGuidance
- id, stateKey, stateName, registrationDepartmentName, landRecordsPortalName, reraPortalName, stampDutyPortalName, agriculturalLandWarning, specialNotes (JSON), portals (JSON), checklistDocuments (JSON), procedureSteps (JSON), createdAt, updatedAt

## Security

- Passwords are hashed using bcrypt
- JWT tokens are used for authentication
- Helmet.js for security headers
- CORS configuration
- Input validation with Zod
- Error handling middleware

## Environment Variables

See `.env.example` for required variables.

## Development

- Runs on port 5000 by default
- Uses TypeScript with ts-node for development
- Prisma Studio can be opened with `npx prisma studio`

## Production

For production, consider:
- Using a process manager like PM2
- Setting up a reverse proxy (Nginx)
- Configuring proper logging
- Setting up monitoring and alerts
- Using a managed PostgreSQL service

## License

MIT