# Multi-Supplier Event API Documentation

## Overview

This document describes the new REST API endpoints for the multi-supplier event management system.

## Base URL

```
http://localhost:3000/api
```

## Authentication

Most endpoints require authentication via Bearer token:

```
Authorization: Bearer <jwt_token>
```

Roles:
- `CLIENT` - Regular users who create events
- `MANAGER` - Hotel/supplier managers
- `ADMIN` - System administrators

---

## Events API

### Create Event

Create a new event (draft status).

**Endpoint:** `POST /api/events`
**Auth Required:** Yes
**Role:** CLIENT, MANAGER, ADMIN

**Request Body:**
```json
{
  "eventName": "Annual Conference 2024",
  "eventFormat": "Conference",
  "startDate": "2024-06-15",
  "endDate": "2024-06-17",
  "numGuests": 150,
  "notes": "VIP section required"
}
```

**Response:** `201 Created`
```json
{
  "id": "uuid",
  "userId": "uuid",
  "status": "DRAFT",
  "eventName": "Annual Conference 2024",
  "eventFormat": "Conference",
  "startDate": "2024-06-15",
  "endDate": "2024-06-17",
  "numGuests": 150,
  "totalPrice": null,
  "notes": "VIP section required",
  "createdAt": "2024-01-15T10:00:00Z",
  "updatedAt": "2024-01-15T10:00:00Z"
}
```

---

### List Events

Get all events for the authenticated user.

**Endpoint:** `GET /api/events`
**Auth Required:** Yes
**Role:** CLIENT, MANAGER, ADMIN

**Response:** `200 OK`
```json
[
  {
    "id": "uuid",
    "userId": "uuid",
    "status": "DRAFT",
    "eventName": "Annual Conference 2024",
    "startDate": "2024-06-15",
    "endDate": "2024-06-17",
    "numGuests": 150,
    "totalPrice": 25000.00,
    "createdAt": "2024-01-15T10:00:00Z"
  }
]
```

---

### Get Event Details

Get a specific event with all suppliers and items.

**Endpoint:** `GET /api/events/:id`
**Auth Required:** Yes
**Role:** Owner, MANAGER, ADMIN

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "userId": "uuid",
  "status": "PENDING",
  "eventName": "Annual Conference 2024",
  "startDate": "2024-06-15",
  "endDate": "2024-06-17",
  "numGuests": 150,
  "totalPrice": 25000.00,
  "eventSuppliers": [
    {
      "id": "uuid",
      "supplierId": "uuid",
      "supplierType": "VENUE",
      "status": "CONFIRMED",
      "totalPrice": 15000.00,
      "supplier": {
        "id": "uuid",
        "name": "Grand Hotel Berlin",
        "supplierType": "VENUE",
        "city": "Berlin"
      },
      "eventItems": [
        {
          "id": "uuid",
          "itemType": "HALL",
          "itemId": "uuid",
          "quantity": 1,
          "price": 15000.00,
          "serviceDate": "2024-06-15"
        }
      ]
    }
  ]
}
```

---

### Update Event

Update event details.

**Endpoint:** `PUT /api/events/:id`
**Auth Required:** Yes
**Role:** Owner

**Request Body:**
```json
{
  "eventName": "Updated Conference Name",
  "numGuests": 200
}
```

**Response:** `200 OK` (updated event object)

---

### Delete Event

Delete a draft event.

**Endpoint:** `DELETE /api/events/:id`
**Auth Required:** Yes
**Role:** Owner

**Response:** `204 No Content`

---

### Submit Event

Submit event for approval (changes status to PENDING).

**Endpoint:** `POST /api/events/:id/submit`
**Auth Required:** Yes
**Role:** Owner

**Response:** `200 OK` (updated event object)

---

### Confirm Event

Confirm an event (manager/admin only).

**Endpoint:** `POST /api/events/:id/confirm`
**Auth Required:** Yes
**Role:** MANAGER, ADMIN

**Response:** `200 OK` (updated event object)

---

### Cancel Event

Cancel an event.

**Endpoint:** `POST /api/events/:id/cancel`
**Auth Required:** Yes
**Role:** Owner, MANAGER, ADMIN

**Response:** `200 OK` (updated event object)

---

### Calculate Event Price

Calculate total price breakdown by supplier.

**Endpoint:** `POST /api/events/:id/calculate`
**Auth Required:** Yes
**Role:** Owner, MANAGER, ADMIN

**Response:** `200 OK`
```json
{
  "bySupplier": [
    {
      "supplierId": "uuid",
      "supplierName": "Grand Hotel Berlin",
      "supplierType": "VENUE",
      "total": 15000.00,
      "items": [
        {
          "name": "Main Conference Hall",
          "itemType": "HALL",
          "quantity": 1,
          "price": 15000.00,
          "serviceDate": "2024-06-15"
        }
      ]
    },
    {
      "supplierId": "uuid",
      "supplierName": "Gourmet Catering Co.",
      "supplierType": "CATERING",
      "total": 10000.00,
      "items": [
        {
          "name": "Business Lunch Package",
          "itemType": "CATERING",
          "quantity": 150,
          "price": 10000.00
        }
      ]
    }
  ],
  "grandTotal": 25000.00
}
```

---

## Event Suppliers Management

### Add Supplier to Event

Add a supplier to an event.

**Endpoint:** `POST /api/events/:id/suppliers`
**Auth Required:** Yes
**Role:** Owner

**Request Body:**
```json
{
  "supplierId": "uuid",
  "supplierType": "VENUE",
  "notes": "Main venue for conference"
}
```

**Response:** `201 Created`
```json
{
  "id": "uuid",
  "eventId": "uuid",
  "supplierId": "uuid",
  "supplierType": "VENUE",
  "status": "SELECTED",
  "totalPrice": null,
  "notes": "Main venue for conference"
}
```

---

### Remove Supplier from Event

Remove a supplier from an event.

**Endpoint:** `DELETE /api/events/:id/suppliers/:supplierId`
**Auth Required:** Yes
**Role:** Owner

**Response:** `204 No Content`

---

### Update Event Supplier

Update event-supplier relationship.

**Endpoint:** `PUT /api/events/:id/suppliers/:supplierId`
**Auth Required:** Yes
**Role:** Owner, MANAGER, ADMIN

**Request Body:**
```json
{
  "status": "CONFIRMED",
  "notes": "Confirmed by supplier"
}
```

**Response:** `200 OK` (updated event supplier object)

---

## Event Items Management

### Add Item to Event

Add a hall/catering/service item to an event.

**Endpoint:** `POST /api/events/:id/items`
**Auth Required:** Yes
**Role:** Owner

**Request Body:**
```json
{
  "eventSupplierId": "uuid",
  "itemType": "HALL",
  "itemId": "uuid",
  "quantity": 1,
  "serviceDate": "2024-06-15",
  "notes": "Need projector setup"
}
```

**Response:** `201 Created`
```json
{
  "id": "uuid",
  "eventId": "uuid",
  "eventSupplierId": "uuid",
  "itemType": "HALL",
  "itemId": "uuid",
  "quantity": 1,
  "serviceDate": "2024-06-15",
  "price": 5000.00,
  "notes": "Need projector setup"
}
```

---

### Update Event Item

Update an event item.

**Endpoint:** `PUT /api/events/:id/items/:itemId`
**Auth Required:** Yes
**Role:** Owner

**Request Body:**
```json
{
  "quantity": 2,
  "notes": "Updated requirements"
}
```

**Response:** `200 OK` (updated event item object)

---

### Remove Item from Event

Remove an item from an event.

**Endpoint:** `DELETE /api/events/:id/items/:itemId`
**Auth Required:** Yes
**Role:** Owner

**Response:** `204 No Content`

---

## Suppliers API

### List Suppliers

List all active suppliers with optional filters.

**Endpoint:** `GET /api/suppliers`
**Auth Required:** No
**Query Parameters:**
- `type` - Filter by supplier type (VENUE, CATERING, etc.)
- `city` - Filter by city
- `country` - Filter by country
- `isActive` - Filter by active status (true/false)

**Example:** `GET /api/suppliers?type=VENUE&city=Berlin`

**Response:** `200 OK`
```json
[
  {
    "id": "uuid",
    "name": "Grand Hotel Berlin",
    "supplierType": "VENUE",
    "city": "Berlin",
    "country": "Germany",
    "contactEmail": "info@grandhotel.de",
    "contactPhone": "+49 30 1234567",
    "description": "Premium conference venue",
    "isActive": true
  }
]
```

---

### Search Suppliers

Advanced supplier search with filters.

**Endpoint:** `GET /api/suppliers/search`
**Auth Required:** No
**Query Parameters:**
- `q` - Search query (name, description)
- `type` - Supplier type
- `city` - City
- `country` - Country
- `minCapacity` - Minimum capacity for venues

**Example:** `GET /api/suppliers/search?q=conference&type=VENUE&minCapacity=100`

**Response:** `200 OK` (array of suppliers with their offers)

---

### Get Supplier Details

Get supplier with all available offers.

**Endpoint:** `GET /api/suppliers/:id`
**Auth Required:** No

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "name": "Grand Hotel Berlin",
  "supplierType": "VENUE",
  "city": "Berlin",
  "description": "Premium conference venue",
  "halls": [
    {
      "id": "uuid",
      "name": "Main Conference Hall",
      "maxCapacity": 300,
      "basePricePerDay": 5000.00,
      "amenities": ["Projector", "Sound System", "WiFi"],
      "seatingLayouts": [
        {
          "layoutType": "THEATER",
          "capacity": 300,
          "priceModifier": 0
        },
        {
          "layoutType": "BANQUET",
          "capacity": 200,
          "priceModifier": 500
        }
      ]
    }
  ],
  "cateringCategories": [],
  "serviceCategories": []
}
```

---

### Get Supplier Halls

Get halls for a VENUE supplier.

**Endpoint:** `GET /api/suppliers/:id/halls`
**Auth Required:** No

**Response:** `200 OK` (array of halls)

---

### Get Supplier Catering

Get catering menu for a CATERING supplier.

**Endpoint:** `GET /api/suppliers/:id/catering`
**Auth Required:** No

**Response:** `200 OK` (array of catering categories with items)

---

### Get Supplier Services

Get services for a supplier.

**Endpoint:** `GET /api/suppliers/:id/services`
**Auth Required:** No

**Response:** `200 OK` (array of service categories with services)

---

### Check Supplier Availability

Check if supplier is available for date range.

**Endpoint:** `GET /api/suppliers/:id/availability`
**Auth Required:** No
**Query Parameters:**
- `startDate` - Start date (YYYY-MM-DD)
- `endDate` - End date (YYYY-MM-DD)

**Example:** `GET /api/suppliers/uuid/availability?startDate=2024-06-15&endDate=2024-06-17`

**Response:** `200 OK`
```json
{
  "available": true
}
```

---

## Admin Supplier Management

### Create Supplier

Create a new supplier (admin/manager only).

**Endpoint:** `POST /api/suppliers`
**Auth Required:** Yes
**Role:** MANAGER, ADMIN

**Request Body:**
```json
{
  "name": "Grand Hotel Berlin",
  "supplierType": "VENUE",
  "contactEmail": "info@grandhotel.de",
  "contactPhone": "+49 30 1234567",
  "address": "Unter den Linden 77",
  "city": "Berlin",
  "country": "Germany",
  "description": "Premium conference venue in the heart of Berlin"
}
```

**Response:** `201 Created` (supplier object)

---

### Update Supplier

Update supplier details (admin/manager only).

**Endpoint:** `PUT /api/suppliers/:id`
**Auth Required:** Yes
**Role:** MANAGER, ADMIN

**Request Body:** (any supplier fields to update)

**Response:** `200 OK` (updated supplier object)

---

### Delete Supplier

Delete a supplier (admin only).

**Endpoint:** `DELETE /api/suppliers/:id`
**Auth Required:** Yes
**Role:** ADMIN

**Response:** `204 No Content`

**Note:** Cannot delete suppliers that are used in existing events.

---

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "error": "Validation error message"
}
```

### 401 Unauthorized
```json
{
  "error": "Invalid or expired token"
}
```

### 403 Forbidden
```json
{
  "error": "Access denied"
}
```

### 404 Not Found
```json
{
  "error": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error"
}
```

---

## Supplier Types

```
VENUE          - Conference venues, hotels with meeting rooms
CATERING       - Food and beverage providers
DECORATION     - Event decoration and design services
AV_IT          - Audio/visual and IT equipment providers
TRANSFER       - Transportation services
ACCOMMODATION  - Hotel rooms and lodging
```

## Event Statuses

```
DRAFT      - Event is being created
PENDING    - Event submitted, awaiting confirmation
CONFIRMED  - Event confirmed by manager/admin
CANCELLED  - Event cancelled
```

## Item Types

```
HALL       - Conference halls/meeting rooms
CATERING   - Catering items (food/beverage)
SERVICE    - Additional services (AV, decoration, etc.)
```

## Pricing Types

```
FIXED       - Fixed price per item
PER_PERSON  - Price multiplied by number of guests
PER_DAY     - Price multiplied by number of days
PER_HOUR    - Price multiplied by hours (assumes 8hr/day)
```
