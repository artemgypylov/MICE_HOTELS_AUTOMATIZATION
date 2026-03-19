# Database Schema Documentation

## Entity Relationship Diagram

```
┌─────────────┐
│   users     │
└──────┬──────┘
       │
       │ 1:N
       ▼
┌─────────────┐       ┌──────────────┐
│  bookings   │──────►│   hotels     │
└──────┬──────┘  N:1  └──────┬───────┘
       │                     │ 1:N
       │                     ├─────────────┬──────────────┐
       │                     ▼             ▼              ▼
       │              ┌─────────┐   ┌──────────┐  ┌─────────────┐
       │              │  halls  │   │ catering │  │  services   │
       │              └────┬────┘   │categories│  │ categories  │
       │                   │        └────┬─────┘  └──────┬──────┘
       │                   │ 1:N        │ 1:N           │ 1:N
       │                   ▼            ▼               ▼
       │              ┌─────────┐   ┌──────────┐  ┌──────────┐
       │              │ seating │   │ catering │  │ services │
       │              │ layouts │   │  items   │  │          │
       │              └─────────┘   └──────────┘  └──────────┘
       │                   │             │              │
       │ 1:N               │             │              │
       ├───────────────────┼─────────────┼──────────────┤
       ▼                   ▼             ▼              ▼
┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│ booking_halls│   │booking_      │   │booking_      │
│              │   │catering      │   │services      │
└──────────────┘   └──────────────┘   └──────────────┘
```

## Complete SQL Schema

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create ENUM types
CREATE TYPE user_role AS ENUM ('client', 'manager', 'admin');
CREATE TYPE booking_status AS ENUM ('draft', 'pending', 'confirmed', 'cancelled');
CREATE TYPE seating_layout_type AS ENUM ('theater', 'classroom', 'u_shape', 'banquet', 'cocktail', 'boardroom');
CREATE TYPE pricing_type AS ENUM ('fixed', 'per_person', 'per_day', 'per_hour');

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'client',
    company_name VARCHAR(255),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Hotels table
CREATE TABLE hotels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    address TEXT,
    city VARCHAR(100),
    country VARCHAR(100),
    contact_email VARCHAR(255),
    contact_phone VARCHAR(50),
    description TEXT,
    settings JSONB DEFAULT '{}',
    logo_url VARCHAR(500),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Halls table
CREATE TABLE halls (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hotel_id UUID NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    max_capacity INTEGER NOT NULL,
    area_sqm DECIMAL(10,2),
    base_price_per_day DECIMAL(10,2) NOT NULL,
    description TEXT,
    amenities JSONB DEFAULT '[]',
    images JSONB DEFAULT '[]',
    floor INTEGER,
    natural_light BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT positive_capacity CHECK (max_capacity > 0),
    CONSTRAINT positive_price CHECK (base_price_per_day >= 0)
);

-- Seating layouts table
CREATE TABLE seating_layouts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hall_id UUID NOT NULL REFERENCES halls(id) ON DELETE CASCADE,
    layout_type seating_layout_type NOT NULL,
    capacity INTEGER NOT NULL,
    price_modifier DECIMAL(10,2) DEFAULT 0,
    description TEXT,
    image_url VARCHAR(500),
    CONSTRAINT positive_layout_capacity CHECK (capacity > 0),
    UNIQUE(hall_id, layout_type)
);

-- Catering categories table
CREATE TABLE catering_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hotel_id UUID NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Catering items table
CREATE TABLE catering_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID NOT NULL REFERENCES catering_categories(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price_per_person DECIMAL(10,2) NOT NULL,
    min_persons INTEGER DEFAULT 1,
    dietary_options JSONB DEFAULT '[]',
    image_url VARCHAR(500),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT positive_catering_price CHECK (price_per_person >= 0),
    CONSTRAINT positive_min_persons CHECK (min_persons > 0)
);

-- Service categories table
CREATE TABLE service_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hotel_id UUID NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Services table
CREATE TABLE services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID NOT NULL REFERENCES service_categories(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    pricing_type pricing_type NOT NULL,
    base_price DECIMAL(10,2) NOT NULL,
    unit VARCHAR(50),
    image_url VARCHAR(500),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT positive_service_price CHECK (base_price >= 0)
);

-- Bookings table
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    hotel_id UUID NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
    status booking_status NOT NULL DEFAULT 'draft',
    event_name VARCHAR(255),
    event_format VARCHAR(100),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    num_guests INTEGER NOT NULL,
    total_price DECIMAL(10,2),
    notes TEXT,
    pdf_url VARCHAR(500),
    submitted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT positive_guests CHECK (num_guests > 0),
    CONSTRAINT valid_date_range CHECK (end_date >= start_date)
);

-- Booking halls table (junction table with date)
CREATE TABLE booking_halls (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    hall_id UUID NOT NULL REFERENCES halls(id) ON DELETE CASCADE,
    seating_layout_id UUID REFERENCES seating_layouts(id) ON DELETE SET NULL,
    booking_date DATE NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT positive_hall_price CHECK (price >= 0),
    UNIQUE(hall_id, booking_date)
);

-- Booking catering table (junction table)
CREATE TABLE booking_catering (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    catering_item_id UUID NOT NULL REFERENCES catering_items(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL,
    service_date DATE,
    price DECIMAL(10,2) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT positive_catering_quantity CHECK (quantity > 0),
    CONSTRAINT positive_catering_price_check CHECK (price >= 0)
);

-- Booking services table (junction table)
CREATE TABLE booking_services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT positive_service_quantity CHECK (quantity > 0),
    CONSTRAINT positive_service_price_check CHECK (price >= 0)
);

-- Create indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_halls_hotel_id ON halls(hotel_id);
CREATE INDEX idx_halls_is_active ON halls(is_active);
CREATE INDEX idx_seating_layouts_hall_id ON seating_layouts(hall_id);
CREATE INDEX idx_catering_categories_hotel_id ON catering_categories(hotel_id);
CREATE INDEX idx_catering_items_category_id ON catering_items(category_id);
CREATE INDEX idx_catering_items_is_active ON catering_items(is_active);
CREATE INDEX idx_service_categories_hotel_id ON service_categories(hotel_id);
CREATE INDEX idx_services_category_id ON services(category_id);
CREATE INDEX idx_services_is_active ON services(is_active);
CREATE INDEX idx_bookings_user_id ON bookings(user_id);
CREATE INDEX idx_bookings_hotel_id ON bookings(hotel_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_start_date ON bookings(start_date);
CREATE INDEX idx_booking_halls_booking_id ON booking_halls(booking_id);
CREATE INDEX idx_booking_halls_hall_date ON booking_halls(hall_id, booking_date);
CREATE INDEX idx_booking_catering_booking_id ON booking_catering(booking_id);
CREATE INDEX idx_booking_services_booking_id ON booking_services(booking_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at trigger to all tables with updated_at column
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_hotels_updated_at BEFORE UPDATE ON hotels
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_halls_updated_at BEFORE UPDATE ON halls
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_catering_categories_updated_at BEFORE UPDATE ON catering_categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_catering_items_updated_at BEFORE UPDATE ON catering_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_service_categories_updated_at BEFORE UPDATE ON service_categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

## Table Descriptions

### users
Stores information about all system users including clients (who make bookings), hotel managers, and administrators.

### hotels
Contains hotel information. Supports multi-hotel scenarios in the future. Settings field (JSONB) allows flexible configuration per hotel.

### halls
Meeting rooms/conference halls available for booking. Each hall belongs to one hotel. Amenities stored as JSONB array for flexibility (e.g., ["projector", "wifi", "whiteboard"]).

### seating_layouts
Different seating arrangements possible in each hall with their respective capacities. Price modifier allows charging extra for certain layouts.

### catering_categories
Groups catering items (e.g., "Coffee Breaks", "Lunches", "Dinners"). Each hotel can have its own categories.

### catering_items
Specific food/beverage options within each category. Price is per person. Dietary options support filtering (vegetarian, vegan, halal, etc.).

### service_categories
Groups additional services (e.g., "AV Equipment", "Transportation", "Accommodation").

### services
Specific services available for booking. Flexible pricing types support different business models (fixed fee, per person, per day, per hour).

### bookings
Master table for event bookings. Tracks the booking lifecycle through status field. Can be saved as draft and submitted later.

### booking_halls
Links bookings to specific halls on specific dates. The UNIQUE constraint on (hall_id, booking_date) prevents double-booking.

### booking_catering
Links bookings to selected catering items with quantities (usually number of guests).

### booking_services
Links bookings to selected additional services with quantities.

## Query Examples

### Check Hall Availability
```sql
-- Check if hall is available for a date range
SELECT h.*,
       ARRAY_AGG(bh.booking_date) as booked_dates
FROM halls h
LEFT JOIN booking_halls bh ON h.id = bh.hall_id
    AND bh.booking_date BETWEEN '2026-03-20' AND '2026-03-25'
WHERE h.hotel_id = 'hotel-uuid'
    AND h.is_active = true
    AND h.max_capacity >= 50
GROUP BY h.id;
```

### Get Complete Booking Details
```sql
-- Get full booking with all related data
SELECT
    b.*,
    u.email as user_email,
    u.company_name,
    json_agg(DISTINCT jsonb_build_object(
        'hall', h.name,
        'date', bh.booking_date,
        'layout', sl.layout_type
    )) as halls,
    json_agg(DISTINCT jsonb_build_object(
        'item', ci.name,
        'quantity', bc.quantity,
        'price', bc.price
    )) as catering,
    json_agg(DISTINCT jsonb_build_object(
        'service', s.name,
        'quantity', bs.quantity,
        'price', bs.price
    )) as services
FROM bookings b
JOIN users u ON b.user_id = u.id
LEFT JOIN booking_halls bh ON b.id = bh.booking_id
LEFT JOIN halls h ON bh.hall_id = h.id
LEFT JOIN seating_layouts sl ON bh.seating_layout_id = sl.id
LEFT JOIN booking_catering bc ON b.id = bc.booking_id
LEFT JOIN catering_items ci ON bc.catering_item_id = ci.id
LEFT JOIN booking_services bs ON b.id = bs.booking_id
LEFT JOIN services s ON bs.service_id = s.id
WHERE b.id = 'booking-uuid'
GROUP BY b.id, u.email, u.company_name;
```

### Calculate Total Price
```sql
-- Calculate total booking price from all components
SELECT
    b.id,
    COALESCE(SUM(bh.price), 0) as halls_total,
    COALESCE(SUM(bc.price), 0) as catering_total,
    COALESCE(SUM(bs.price), 0) as services_total,
    COALESCE(SUM(bh.price), 0) +
    COALESCE(SUM(bc.price), 0) +
    COALESCE(SUM(bs.price), 0) as grand_total
FROM bookings b
LEFT JOIN booking_halls bh ON b.id = bh.booking_id
LEFT JOIN booking_catering bc ON b.id = bc.booking_id
LEFT JOIN booking_services bs ON b.id = bs.booking_id
WHERE b.id = 'booking-uuid'
GROUP BY b.id;
```

### Get Available Halls by Date and Capacity
```sql
-- Find available halls for specific dates
SELECT h.*
FROM halls h
WHERE h.hotel_id = 'hotel-uuid'
    AND h.is_active = true
    AND h.max_capacity >= 50
    AND NOT EXISTS (
        SELECT 1
        FROM booking_halls bh
        WHERE bh.hall_id = h.id
            AND bh.booking_date BETWEEN '2026-03-20' AND '2026-03-25'
    )
ORDER BY h.max_capacity ASC;
```

## Data Integrity Rules

1. **Referential Integrity**: All foreign keys have ON DELETE CASCADE or ON DELETE SET NULL to maintain consistency
2. **Check Constraints**: Ensure positive values for prices, quantities, capacities
3. **Unique Constraints**: Prevent double-booking (hall + date)
4. **Date Validation**: End date must be >= start date
5. **JSONB Validation**: Use application-level validation for JSON structure

## Scaling Considerations

### Current Design (Single Hotel, Up to 10K bookings/year)
- Standard B-tree indexes on foreign keys
- No partitioning needed
- Standard PostgreSQL instance sufficient

### Future Scaling (Multiple Hotels, 100K+ bookings/year)
1. **Partitioning**: Partition bookings table by date range (yearly/monthly)
2. **Separate Databases**: One database per hotel (if complete isolation needed)
3. **Read Replicas**: For analytics and reporting queries
4. **Materialized Views**: For complex aggregations (availability calendar)
5. **Archiving**: Move old bookings (>2 years) to archive tables

## Backup and Recovery

### Recommended Backup Strategy
- **Full Backup**: Daily at 2 AM
- **Incremental Backup**: Every 6 hours
- **Point-in-Time Recovery**: Enabled with WAL archiving
- **Retention**: 30 days for daily backups

### Critical Data
- Users, Hotels, Halls (configuration data - low frequency changes)
- Bookings and related tables (transactional data - high frequency)
- Separate backup schedules may be appropriate

This schema provides a robust foundation for the MICE hotel booking system with proper normalization, indexing, and data integrity constraints.
