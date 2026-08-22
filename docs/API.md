# Property X AI — Backend REST API Documentation

Base URL: `http://localhost:5001` (or configured `PORT`)

All protected endpoints expect an `Authorization` header with a Bearer JWT token:
```http
Authorization: Bearer <jwt_token>
```

---

## 1. System Health

### `GET /health`
Returns the backend operational status and version.

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Property X AI Backend is operational",
  "version": "1.0.0",
  "timestamp": "2026-08-22T02:00:00.000Z"
}
```

---

## 2. Authentication & User Profile

### `POST /api/auth/register`
Register a new investor/buyer account.

**Request Body:**
```json
{
  "name": "Arun Akshat",
  "email": "user@example.com",
  "password": "SecurePassword123",
  "phone": "+91 9876543210",
  "currentState": "Uttar Pradesh",
  "currentCity": "Lucknow"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "c1f73b64-8b62-4309-8b89-1386e8574d32",
      "email": "user@example.com",
      "name": "Arun Akshat",
      "phone": "+91 9876543210",
      "currentState": "Uttar Pradesh",
      "currentCity": "Lucknow",
      "createdAt": "2026-08-22T02:00:00.000Z",
      "updatedAt": "2026-08-22T02:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### `POST /api/auth/login`
Authenticate with email and password.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "c1f73b64-8b62-4309-8b89-1386e8574d32",
      "email": "user@example.com",
      "name": "Arun Akshat"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### `GET /api/profile`
Retrieve personal and financial profile for the authenticated user.

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "c1f73b64-8b62-4309-8b89-1386e8574d32",
    "email": "user@example.com",
    "name": "Arun Akshat",
    "financialProfile": {
      "monthlyIncome": 140000,
      "existingEmi": 0,
      "expenditures": {
        "commute": { "status": "amount", "amount": 6000 },
        "healthcare": { "status": "unknown" },
        "education": { "status": "none", "amount": 0 }
      },
      "savings": {
        "stocks_mutual_funds": { "status": "amount", "amount": 20000 }
      }
    }
  }
}
```

---

### `PUT /api/profile`
Update user preferences, demographic profile, and 3-state expenditures/savings.

**Request Body:**
```json
{
  "name": "Arun Akshat",
  "familySize": 3,
  "purposeOfProperty": "live",
  "workplaceLocation": "Sector 62, Noida",
  "monthlyIncome": 150000,
  "expenditures": {
    "commute": { "status": "amount", "amount": 6000 },
    "groceries": { "status": "amount", "amount": 18000 },
    "healthcare": { "status": "unknown" },
    "education": { "status": "none", "amount": 0 },
    "utilities": { "status": "amount", "amount": 4500 }
  },
  "savings": {
    "stocks_mutual_funds": { "status": "amount", "amount": 20000 },
    "emergency_fund": { "status": "amount", "amount": 15000 }
  }
}
```

---

## 3. Location Intelligence

### `POST /api/location/geocode`
Geocodes an Indian address into coordinates and administrative boundaries with caching.

**Request Body:**
```json
{
  "address": "Gomti Nagar Extension, Lucknow, Uttar Pradesh"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "lat": 26.8467,
    "lng": 80.9462,
    "formattedAddress": "Gomti Nagar Extension, Lucknow, Uttar Pradesh",
    "city": "Lucknow",
    "state": "Uttar Pradesh"
  }
}
```

---

## 4. Property Management

### `POST /api/properties`
Save or register a property for evaluation.

**Request Body:**
```json
{
  "type": "flat",
  "location": "Gomti Nagar, Lucknow",
  "locationDetails": {
    "address": "Gomti Nagar Extension, Lucknow",
    "city": "Lucknow",
    "state": "Uttar Pradesh",
    "lat": 26.8500,
    "lng": 80.9900
  },
  "price": 6500000,
  "area": 1450,
  "areaUnit": "sqft",
  "purpose": "live",
  "age": "New",
  "amenities": ["Gym", "Swimming Pool", "Clubhouse", "24/7 Security"]
}
```

---

### `GET /api/properties`
List all saved properties for the authenticated user.

---

### `GET /api/properties/:id/location-intelligence`
Retrieve full neighborhood intelligence (nearby places, routes, air quality) for a specific property.

---

## 5. Decision Intelligence & Analysis Pipeline

### `POST /api/properties/:id/analyze` *(or `POST /api/analyses`)*
Executes the master property evaluation pipeline:
1. Validates 3-state expenditures (`amount` / `unknown` / `none`).
2. Pulls Google Maps location intelligence (hospitals, schools, routes, air quality).
3. Computes deterministic financial metrics (EMI, upfront acquisition cost, 5-year appreciation).
4. Generates multi-dimensional scores across 8 dimensions.
5. Produces **BUY / RENT / WAIT** verdict with confidence score.
6. Invokes **Gemini 2.5 Flash** for narrative explanation and verification checklist.
7. Saves an immutable snapshot in the database.

**Request Body:**
```json
{
  "type": "flat",
  "location": "Gomti Nagar Extension, Lucknow",
  "locationDetails": {
    "address": "Gomti Nagar Extension, Lucknow",
    "lat": 26.8500,
    "lng": 80.9900,
    "city": "Lucknow",
    "state": "Uttar Pradesh"
  },
  "price": 6500000,
  "area": 1450,
  "areaUnit": "sqft",
  "purpose": "live",
  "monthlySalary": 140000,
  "expenditures": {
    "commute": { "status": "amount", "amount": 6000 },
    "groceries": { "status": "amount", "amount": 18000 },
    "healthcare": { "status": "unknown" }
  }
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "18cf2b31-2852-4742-8fc2-a60618c2ab6f",
    "propertyId": "6f3be1db-e6b9-4682-a2c7-ecfd5c481d79",
    "recommendation": "BUY",
    "confidence": 65,
    "scores": {
      "affordability": 80,
      "connectivity": 90,
      "healthcare": 95,
      "education": 80,
      "daily_convenience": 95,
      "environment": 80,
      "rental_potential": 88,
      "growth": 84,
      "overall": 86,
      "location": 93,
      "infrastructure": 88,
      "future": 86,
      "buy": 94,
      "rent": 54,
      "wait": 32
    },
    "costEstimation": {
      "propertyPrice": 6500000,
      "stampDuty": 390000,
      "registration": 65000,
      "legalCharges": 25000,
      "interiorCost": 650000,
      "totalInitialCost": 7630000,
      "monthlyEMI": 45127,
      "monthlyMaintenance": 4500,
      "monthlyTotal": 49627,
      "annualCost": 628024,
      "fiveYearCost": 3140120
    },
    "futureProjections": [
      { "year": 2026, "expected": 6500000 },
      { "year": 2027, "expected": 6890000 },
      { "year": 2028, "expected": 7280000 },
      { "year": 2029, "expected": 7735000 },
      { "year": 2030, "expected": 8255000 }
    ],
    "nearbyPlaces": [
      { "name": "Delhi Public School", "type": "School", "distance": "1.2 km" },
      { "name": "City Hospital", "type": "Hospital", "distance": "1.8 km" }
    ],
    "aiExplanation": {
      "decision_explanation": "The property at Gomti Nagar Extension demonstrates strong overall fundamentals with a composite score of 86/100...",
      "top_reasons": [
        "Strong overall intelligence score of 86/100 across key dimensions.",
        "Comfortable EMI-to-income ratio aligns with your financial profile."
      ],
      "risks": [
        "Floating home loan interest rate fluctuations over the loan tenure."
      ],
      "financial_summary": "Initial total acquisition requirement is ₹76,30,000...",
      "what_to_verify": [
        "Verify clear chain of title documents and 30-year Encumbrance Certificate (EC).",
        "Confirm RERA registration status on official UP RERA portal."
      ]
    },
    "createdAt": "2026-08-22T02:12:32.475Z"
  }
}
```

---

### `GET /api/analyses`
List immutable analysis history for the user.

---

### `GET /api/analyses/:id`
Retrieve frozen analysis snapshot by ID.

---

## 6. Government & Purchase Guide

### `GET /api/government/guide`
Get verified legal checklist, RERA portal links, circle rates, stamp duty slabs, and interstate warnings for any Indian state/UT.

**Query Parameters:**
- `buyerState` (e.g. `UP`, `DL`, `KA`, `MH`)
- `propertyState` (e.g. `UP`, `KA`)
- `propertyType` (`flat`, `house`, `agricultural_land`, `commercial`)
- `purchasePurpose` (`live`, `investment`, `rent`)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "scenario": {
      "buyerState": "UP",
      "propertyState": "UP",
      "isInterstate": false,
      "propertyTypeLabel": "Flat / Apartment"
    },
    "stateRules": {
      "stateName": "Uttar Pradesh",
      "registrationDepartmentName": "Stamp and Registration Department (IGRS UP)",
      "landRecordsPortalName": "UP Bhulekh / Revenue Council",
      "reraPortalName": "Uttar Pradesh Real Estate Regulatory Authority (UP RERA)"
    },
    "checklist": [
      {
        "id": "doc_title",
        "name": "Sale Deed / Title Deed",
        "status": "required",
        "category": "title"
      }
    ],
    "officialPortals": [
      {
        "name": "IGRS Uttar Pradesh",
        "url": "https://igrsup.gov.in",
        "category": "registration"
      },
      {
        "name": "UP RERA Official Portal",
        "url": "https://www.up-rera.in",
        "category": "rera"
      }
    ]
  }
}
```
