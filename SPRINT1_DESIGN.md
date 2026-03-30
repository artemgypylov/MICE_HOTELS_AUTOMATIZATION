# Sprint 1: Multi-Supplier Event Architecture - Design Document

## Executive Summary

This document describes the evolution from a single-hotel booking system to a multi-supplier MICE event platform. The new architecture introduces the concept of Events (replacing hotel-centric bookings) where each event can involve multiple suppliers of different types (Venue, Catering, Decoration, AV/IT, Transfer, Accommodation).

## 1. New Domain Model

### 1.1 Core Entities

#### Supplier
Replaces the concept of "Hotel" as the sole provider. A supplier represents any service provider in the MICE ecosystem.

```
Supplier {
  id: UUID
  name: String
  supplierType: SupplierType (VENUE, CATERING, DECORATION, AV_IT, TRANSFER, ACCOMMODATION)
  contactEmail: String
  contactPhone: String
  address: String
  city: String
  country: String
  description: String
  logoUrl: String
  settings: JSON
  isActive: Boolean
  createdAt: DateTime
  updatedAt: DateTime
}
```

#### Event
Central entity replacing the hotel-centric Booking model. Represents a complete MICE event.

```
Event {
  id: UUID
  userId: UUID (organizer)
  status: EventStatus (DRAFT, PENDING, CONFIRMED, CANCELLED)
  eventName: String
  eventFormat: String (Conference, Seminar, Workshop, etc.)
  startDate: Date
  endDate: Date
  numGuests: Int
  totalPrice: Decimal
  notes: String
  pdfUrl: String
  submittedAt: DateTime
  createdAt: DateTime
  updatedAt: DateTime
}
```

#### EventSupplier
Junction table linking events to their suppliers, with additional metadata about the relationship.

```
EventSupplier {
  id: UUID
  eventId: UUID
  supplierId: UUID
  supplierType: SupplierType
  status: EventSupplierStatus (SELECTED, CONFIRMED, DECLINED)
  totalPrice: Decimal
  notes: String
  createdAt: DateTime
  updatedAt: DateTime
}
```

#### SupplierOffer
Abstract concept for items/services offered by suppliers. Implementation varies by supplier type:
- VENUE suppliers: Halls with seating layouts
- CATERING suppliers: Menu items and packages
- DECORATION suppliers: Decoration packages/items
- AV_IT suppliers: Equipment and technical services
- TRANSFER suppliers: Transportation options
- ACCOMMODATION suppliers: Room types

#### EventItem
Links specific supplier offers to events.

```
EventItem {
  id: UUID
  eventId: UUID
  eventSupplierId: UUID (which supplier this item comes from)
  itemType: ItemType (HALL, CATERING, SERVICE, etc.)
  itemId: UUID (references Hall, CateringItem, Service, etc.)
  quantity: Int
  serviceDate: Date (optional, for dated items)
  price: Decimal
  notes: String
  createdAt: DateTime
}
```

### 1.2 Entity Relationships Diagram

```
User (1) ----< (N) Event
Event (1) ----< (N) EventSupplier
EventSupplier (N) >---- (1) Supplier
Event (1) ----< (N) EventItem
EventItem (N) >---- (1) EventSupplier
EventItem (N) >---- (1) Hall | CateringItem | Service (polymorphic)

Supplier (1) ----< (N) Hall (for VENUE type)
Supplier (1) ----< (N) CateringCategory (for CATERING type)
Supplier (1) ----< (N) ServiceCategory (for all other types)
```

### 1.3 Supplier Type Mappings

#### Current Hotel Model → New Supplier Model

| Current | New Supplier Type | Resources |
|---------|------------------|-----------|
| Hotel (halls) | VENUE | Halls + SeatingLayouts |
| Hotel (catering) | CATERING | CateringCategories + CateringItems |
| Hotel (services: AV) | AV_IT | ServiceCategories + Services |
| Hotel (services: decoration) | DECORATION | ServiceCategories + Services |
| Hotel (services: transfer) | TRANSFER | ServiceCategories + Services |
| Hotel (services: accommodation) | ACCOMMODATION | ServiceCategories + Services |

## 2. Updated Prisma Schema

### 2.1 New Enums

```prisma
enum SupplierType {
  VENUE
  CATERING
  DECORATION
  AV_IT
  TRANSFER
  ACCOMMODATION
}

enum EventStatus {
  DRAFT
  PENDING
  CONFIRMED
  CANCELLED
}

enum EventSupplierStatus {
  SELECTED
  CONFIRMED
  DECLINED
}

enum ItemType {
  HALL
  CATERING
  SERVICE
}
```

### 2.2 New Models

```prisma
model Supplier {
  id              String        @id @default(uuid())
  name            String
  supplierType    SupplierType  @map("supplier_type")
  contactEmail    String?       @map("contact_email")
  contactPhone    String?       @map("contact_phone")
  address         String?
  city            String?
  country         String?
  description     String?
  logoUrl         String?       @map("logo_url")
  settings        Json          @default("{}")
  isActive        Boolean       @default(true) @map("is_active")
  createdAt       DateTime      @default(now()) @map("created_at")
  updatedAt       DateTime      @updatedAt @map("updated_at")

  halls               Hall[]
  cateringCategories  CateringCategory[]
  serviceCategories   ServiceCategory[]
  eventSuppliers      EventSupplier[]

  @@index([supplierType])
  @@index([city])
  @@index([isActive])
  @@map("suppliers")
}

model Event {
  id            String        @id @default(uuid())
  userId        String        @map("user_id")
  status        EventStatus   @default(DRAFT)
  eventName     String?       @map("event_name")
  eventFormat   String?       @map("event_format")
  startDate     DateTime      @map("start_date") @db.Date
  endDate       DateTime      @map("end_date") @db.Date
  numGuests     Int           @map("num_guests")
  totalPrice    Decimal?      @map("total_price") @db.Decimal(10, 2)
  notes         String?
  pdfUrl        String?       @map("pdf_url")
  submittedAt   DateTime?     @map("submitted_at")
  createdAt     DateTime      @default(now()) @map("created_at")
  updatedAt     DateTime      @updatedAt @map("updated_at")

  user            User            @relation(fields: [userId], references: [id], onDelete: Cascade)
  eventSuppliers  EventSupplier[]
  eventItems      EventItem[]

  @@index([userId])
  @@index([status])
  @@index([startDate])
  @@map("events")
}

model EventSupplier {
  id            String              @id @default(uuid())
  eventId       String              @map("event_id")
  supplierId    String              @map("supplier_id")
  supplierType  SupplierType        @map("supplier_type")
  status        EventSupplierStatus @default(SELECTED)
  totalPrice    Decimal?            @map("total_price") @db.Decimal(10, 2)
  notes         String?
  createdAt     DateTime            @default(now()) @map("created_at")
  updatedAt     DateTime            @updatedAt @map("updated_at")

  event       Event       @relation(fields: [eventId], references: [id], onDelete: Cascade)
  supplier    Supplier    @relation(fields: [supplierId], references: [id], onDelete: Cascade)
  eventItems  EventItem[]

  @@unique([eventId, supplierId])
  @@index([eventId])
  @@index([supplierId])
  @@map("event_suppliers")
}

model EventItem {
  id                String    @id @default(uuid())
  eventId           String    @map("event_id")
  eventSupplierId   String    @map("event_supplier_id")
  itemType          ItemType  @map("item_type")
  itemId            String    @map("item_id")
  quantity          Int       @default(1)
  serviceDate       DateTime? @map("service_date") @db.Date
  price             Decimal   @db.Decimal(10, 2)
  notes             String?
  createdAt         DateTime  @default(now()) @map("created_at")

  event           Event           @relation(fields: [eventId], references: [id], onDelete: Cascade)
  eventSupplier   EventSupplier   @relation(fields: [eventSupplierId], references: [id], onDelete: Cascade)

  @@index([eventId])
  @@index([eventSupplierId])
  @@index([itemType, itemId])
  @@map("event_items")
}
```

### 2.3 Modified Models

**Hall**: Change `hotelId` → `supplierId`
**CateringCategory**: Change `hotelId` → `supplierId`
**ServiceCategory**: Change `hotelId` → `supplierId`

**User**: Add relation to `Event[]`

**Hotel**: Mark as deprecated, maintain for backward compatibility during migration

**Booking**: Keep for backward compatibility, can be migrated to Events later

## 3. Migration Strategy

### 3.1 Phase 1: Additive Changes (Non-Breaking)

1. **Add new tables**: Supplier, Event, EventSupplier, EventItem
2. **Add new enums**: SupplierType, EventStatus, EventSupplierStatus, ItemType
3. **Keep existing tables**: Hotel, Booking, and all relations intact

### 3.2 Phase 2: Data Migration

For existing data:

1. **Migrate Hotels → Suppliers**
   ```sql
   INSERT INTO suppliers (id, name, supplier_type, contact_email, contact_phone,
                          address, city, country, description, logo_url, settings, is_active)
   SELECT id, name, 'VENUE', contact_email, contact_phone,
          address, city, country, description, logo_url, settings, is_active
   FROM hotels;
   ```

2. **Update Foreign Keys** (if migrating existing bookings):
   - Add nullable `supplier_id` columns to Hall, CateringCategory, ServiceCategory
   - Copy `hotel_id` → `supplier_id` for all records
   - Once verified, can drop `hotel_id` columns

3. **Optional: Migrate Bookings → Events**
   - Can be done later
   - For now, both systems can coexist

### 3.3 Phase 3: Deprecation (Future)

- Mark `Hotel` table as deprecated
- Eventually remove `hotel_id` columns
- Fully migrate to Event-based system

## 4. Backend Services Architecture

### 4.1 Service Layer Structure

```
backend/src/services/
  ├── event.service.ts          # Event CRUD, supplier management
  ├── supplier.service.ts        # Supplier CRUD, offer management
  ├── event-pricing.service.ts   # Multi-supplier pricing logic
  └── legacy/
      └── booking.service.ts     # Existing booking logic (if extracted)
```

### 4.2 EventService

```typescript
class EventService {
  // Event lifecycle
  async createEvent(userId: string, data: CreateEventDTO): Promise<Event>
  async updateEvent(eventId: string, data: UpdateEventDTO): Promise<Event>
  async getEvent(eventId: string): Promise<EventWithSuppliers>
  async listUserEvents(userId: string): Promise<Event[]>
  async deleteEvent(eventId: string): Promise<void>

  // Supplier management
  async addSupplierToEvent(eventId: string, supplierId: string, type: SupplierType): Promise<EventSupplier>
  async removeSupplierFromEvent(eventId: string, eventSupplierId: string): Promise<void>
  async updateEventSupplier(eventSupplierId: string, data: UpdateEventSupplierDTO): Promise<EventSupplier>

  // Item management
  async addItemToEvent(eventId: string, eventSupplierId: string, item: AddItemDTO): Promise<EventItem>
  async removeItemFromEvent(eventItemId: string): Promise<void>
  async updateEventItem(eventItemId: string, data: UpdateItemDTO): Promise<EventItem>

  // Status management
  async submitEvent(eventId: string): Promise<Event>
  async confirmEvent(eventId: string): Promise<Event>
  async cancelEvent(eventId: string): Promise<Event>
}
```

### 4.3 SupplierService

```typescript
class SupplierService {
  // Supplier CRUD
  async createSupplier(data: CreateSupplierDTO): Promise<Supplier>
  async updateSupplier(supplierId: string, data: UpdateSupplierDTO): Promise<Supplier>
  async getSupplier(supplierId: string): Promise<SupplierWithOffers>
  async listSuppliers(filters: SupplierFilters): Promise<Supplier[]>
  async deleteSupplier(supplierId: string): Promise<void>

  // Offer management (polymorphic)
  async getSupplierOffers(supplierId: string, type: SupplierType): Promise<SupplierOffer[]>
  async addOfferToSupplier(supplierId: string, offer: AddOfferDTO): Promise<SupplierOffer>
  async updateOffer(offerId: string, type: ItemType, data: UpdateOfferDTO): Promise<SupplierOffer>

  // Search & filtering
  async searchSuppliers(query: SearchSuppliersDTO): Promise<Supplier[]>
  async getSuppliersByType(type: SupplierType, city?: string): Promise<Supplier[]>
  async checkSupplierAvailability(supplierId: string, startDate: Date, endDate: Date): Promise<boolean>
}
```

### 4.4 EventPricingService (Interface)

```typescript
class EventPricingService {
  // Multi-supplier pricing
  async calculateEventTotal(eventId: string): Promise<PriceCalculation>
  async calculateSupplierTotal(eventSupplierId: string): Promise<number>
  async calculateItemPrice(item: EventItem, numGuests: number, numDays: number): Promise<number>

  // Future: Complex pricing rules
  async applyDiscounts(eventId: string): Promise<void>
  async applySupplierPackages(eventId: string): Promise<void>
}
```

## 5. New REST Endpoints

### 5.1 Events

```
POST   /api/events                    - Create new event
GET    /api/events                    - List user's events
GET    /api/events/:id                - Get event with all suppliers
PUT    /api/events/:id                - Update event details
DELETE /api/events/:id                - Delete event (draft only)
POST   /api/events/:id/submit         - Submit event for approval
POST   /api/events/:id/calculate      - Calculate total price

POST   /api/events/:id/suppliers      - Add supplier to event
DELETE /api/events/:id/suppliers/:sid - Remove supplier from event
PUT    /api/events/:id/suppliers/:sid - Update supplier details

POST   /api/events/:id/items          - Add item to event
PUT    /api/events/:id/items/:itemId  - Update item
DELETE /api/events/:id/items/:itemId  - Remove item
```

### 5.2 Suppliers

```
POST   /api/suppliers                 - Create supplier (admin)
GET    /api/suppliers                 - List suppliers with filters
GET    /api/suppliers/:id             - Get supplier details with offers
PUT    /api/suppliers/:id             - Update supplier (admin)
DELETE /api/suppliers/:id             - Delete supplier (admin)

GET    /api/suppliers/:id/offers      - Get all offers by supplier
GET    /api/suppliers/:id/halls       - Get halls (if VENUE)
GET    /api/suppliers/:id/catering    - Get catering items (if CATERING)
GET    /api/suppliers/:id/services    - Get services (if other types)

GET    /api/suppliers/search          - Search suppliers
  ?type=VENUE&city=Berlin&capacity=100
```

## 6. Frontend TypeScript Types

### 6.1 New Interfaces

```typescript
export type SupplierType = 'VENUE' | 'CATERING' | 'DECORATION' | 'AV_IT' | 'TRANSFER' | 'ACCOMMODATION';
export type EventStatus = 'DRAFT' | 'PENDING' | 'CONFIRMED' | 'CANCELLED';
export type EventSupplierStatus = 'SELECTED' | 'CONFIRMED' | 'DECLINED';
export type ItemType = 'HALL' | 'CATERING' | 'SERVICE';

export interface Supplier {
  id: string;
  name: string;
  supplierType: SupplierType;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  city?: string;
  country?: string;
  description?: string;
  logoUrl?: string;
  isActive: boolean;
}

export interface Event {
  id: string;
  userId: string;
  status: EventStatus;
  eventName?: string;
  eventFormat?: string;
  startDate: string;
  endDate: string;
  numGuests: number;
  totalPrice?: number;
  notes?: string;
  pdfUrl?: string;
  eventSuppliers?: EventSupplier[];
  eventItems?: EventItem[];
}

export interface EventSupplier {
  id: string;
  eventId: string;
  supplierId: string;
  supplierType: SupplierType;
  status: EventSupplierStatus;
  totalPrice?: number;
  notes?: string;
  supplier?: Supplier;
  eventItems?: EventItem[];
}

export interface EventItem {
  id: string;
  eventId: string;
  eventSupplierId: string;
  itemType: ItemType;
  itemId: string;
  quantity: number;
  serviceDate?: string;
  price: number;
  notes?: string;

  // Populated based on itemType
  hall?: Hall;
  cateringItem?: CateringItem;
  service?: Service;
}

export interface SupplierOffer {
  id: string;
  supplierId: string;
  type: ItemType;
  name: string;
  description?: string;
  basePrice: number;
  pricingType?: 'FIXED' | 'PER_PERSON' | 'PER_DAY' | 'PER_HOUR';
  // Additional fields based on type
}

export interface CreateEventDTO {
  eventName?: string;
  eventFormat?: string;
  startDate: string;
  endDate: string;
  numGuests: number;
  notes?: string;
}

export interface UpdateEventDTO {
  eventName?: string;
  eventFormat?: string;
  startDate?: string;
  endDate?: string;
  numGuests?: number;
  notes?: string;
}

export interface AddSupplierToEventDTO {
  supplierId: string;
  supplierType: SupplierType;
  notes?: string;
}

export interface AddItemToEventDTO {
  eventSupplierId: string;
  itemType: ItemType;
  itemId: string;
  quantity: number;
  serviceDate?: string;
}

export interface EventPriceCalculation {
  bySupplier: Array<{
    supplierId: string;
    supplierName: string;
    supplierType: SupplierType;
    total: number;
    items: Array<{
      name: string;
      quantity: number;
      price: number;
    }>;
  }>;
  grandTotal: number;
}
```

### 6.2 Transformation from Booking to Event

```typescript
// Helper to convert old Booking to new Event format
export function bookingToEvent(booking: Booking): Event {
  return {
    id: booking.id,
    userId: booking.userId,
    status: booking.status as EventStatus,
    eventName: booking.eventName,
    eventFormat: booking.eventFormat,
    startDate: booking.startDate,
    endDate: booking.endDate,
    numGuests: booking.numGuests,
    totalPrice: booking.totalPrice,
    notes: booking.notes,
    pdfUrl: booking.pdfUrl,
    // eventSuppliers would need to be constructed from booking data
    eventSuppliers: [],
    eventItems: [],
  };
}

// Helper to convert Hotel to Supplier
export function hotelToSupplier(hotel: Hotel): Supplier {
  return {
    id: hotel.id,
    name: hotel.name,
    supplierType: 'VENUE',
    contactEmail: hotel.contactEmail,
    contactPhone: hotel.contactPhone,
    address: hotel.address,
    city: hotel.city,
    country: hotel.country,
    description: hotel.description,
    logoUrl: hotel.logoUrl,
    isActive: true,
  };
}
```

## 7. Implementation Roadmap

### Phase 1: Schema & Models (This Sprint)
- ✓ Design new ER model
- ✓ Create Prisma schema updates
- ✓ Define TypeScript interfaces
- Create migration files
- Update database

### Phase 2: Backend Services
- Implement EventService
- Implement SupplierService
- Implement EventPricingService
- Add new REST endpoints
- Write unit tests

### Phase 3: Frontend Types
- Add new TypeScript types
- Create transformation utilities
- Update API client

### Phase 4: Migration Tools
- Create data migration scripts
- Add backward compatibility layer
- Test dual-system operation

### Phase 5: UI Updates (Future Sprint)
- Multi-supplier wizard
- Supplier selection interface
- Enhanced pricing breakdown
- Admin supplier management

## 8. Backward Compatibility

During transition:

1. **Both systems operate simultaneously**
   - Old booking system continues to work
   - New event system is available
   - Data can be migrated incrementally

2. **API versioning**
   - `/api/v1/bookings` - Old system
   - `/api/v2/events` - New system
   - Or use feature flags

3. **Frontend abstraction**
   - Create adapter layer
   - UI can work with both formats
   - Gradual migration of components

## 9. Key Considerations

### 9.1 Pricing Complexity
Multi-supplier pricing is more complex:
- Each supplier has independent pricing
- Cross-supplier discounts possible
- Package deals from single suppliers
- Need clear price breakdown by supplier

### 9.2 Availability Management
- Each supplier manages own availability
- Need to check across all selected suppliers
- Handle conflicts gracefully

### 9.3 Communication Flow
- Event organizer ↔ Multiple suppliers
- Each supplier needs separate confirmation
- Status tracking per supplier
- Notification system design

### 9.4 Extensibility
- New supplier types should be easy to add
- Offer schema needs to be flexible
- Consider plugin architecture for future

## 10. Next Steps

After this sprint:
1. Run database migrations
2. Implement backend services
3. Create REST endpoints
4. Update frontend types
5. Build migration utilities
6. Begin UI updates in Sprint 2
