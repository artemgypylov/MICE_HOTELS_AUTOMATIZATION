# Database Migration Guide

## Prerequisites

Before running the migration, ensure:
- PostgreSQL database is running
- `.env` file is configured with `DATABASE_URL`
- No active connections to the database from the application

## Step 1: Create Migration

Create a new Prisma migration for the multi-supplier schema changes:

```bash
cd backend
npx prisma migrate dev --name add_multi_supplier_event_models
```

This will:
1. Create SQL migration files in `prisma/migrations/`
2. Apply the migration to the database
3. Regenerate Prisma Client with new types

## Step 2: Verify Migration

Check that all new tables were created:

```sql
-- Connect to your database
psql $DATABASE_URL

-- List all tables
\dt

-- You should see:
-- suppliers
-- events
-- event_suppliers
-- event_items

-- Check table structure
\d suppliers
\d events
\d event_suppliers
\d event_items
```

## Step 3: Migrate Existing Data (Optional)

If you have existing hotels and bookings, you can migrate them to the new system:

### Option A: Automatic Migration Script

Create a migration script `backend/scripts/migrate-hotels-to-suppliers.ts`:

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migrateHotelsToSuppliers() {
  console.log('Starting hotel to supplier migration...');

  // Get all hotels
  const hotels = await prisma.hotel.findMany({
    include: {
      halls: true,
      cateringCategories: {
        include: { items: true }
      },
      serviceCategories: {
        include: { services: true }
      }
    }
  });

  for (const hotel of hotels) {
    console.log(`Migrating hotel: ${hotel.name}`);

    // Create supplier from hotel
    const supplier = await prisma.supplier.create({
      data: {
        id: hotel.id, // Use same ID to maintain references
        name: hotel.name,
        supplierType: 'VENUE',
        contactEmail: hotel.contactEmail,
        contactPhone: hotel.contactPhone,
        address: hotel.address,
        city: hotel.city,
        country: hotel.country,
        description: hotel.description,
        logoUrl: hotel.logoUrl,
        settings: hotel.settings,
        isActive: hotel.isActive,
      }
    });

    // Update halls to reference supplier
    await prisma.hall.updateMany({
      where: { hotelId: hotel.id },
      data: { supplierId: supplier.id }
    });

    // Update catering categories
    await prisma.cateringCategory.updateMany({
      where: { hotelId: hotel.id },
      data: { supplierId: supplier.id }
    });

    // Update service categories
    await prisma.serviceCategory.updateMany({
      where: { hotelId: hotel.id },
      data: { supplierId: supplier.id }
    });

    console.log(`✓ Migrated hotel: ${hotel.name} → Supplier ID: ${supplier.id}`);
  }

  console.log('Migration complete!');
}

migrateHotelsToSuppliers()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

Run the migration:

```bash
npx ts-node scripts/migrate-hotels-to-suppliers.ts
```

### Option B: Manual SQL Migration

```sql
-- Create suppliers from existing hotels
INSERT INTO suppliers (
  id, name, supplier_type, contact_email, contact_phone,
  address, city, country, description, logo_url, settings, is_active,
  created_at, updated_at
)
SELECT
  id, name, 'VENUE', contact_email, contact_phone,
  address, city, country, description, logo_url, settings, is_active,
  created_at, updated_at
FROM hotels;

-- Update halls to reference suppliers
UPDATE halls
SET supplier_id = hotel_id
WHERE hotel_id IS NOT NULL;

-- Update catering categories
UPDATE catering_categories
SET supplier_id = hotel_id
WHERE hotel_id IS NOT NULL;

-- Update service categories
UPDATE service_categories
SET supplier_id = hotel_id
WHERE hotel_id IS NOT NULL;
```

## Step 4: Seed Sample Suppliers

Create sample suppliers for different types:

```bash
cd backend
npx prisma db seed
```

Update `backend/prisma/seed.ts` to include sample suppliers:

```typescript
// Add to seed.ts
const suppliers = [
  {
    name: "Elite Catering Services",
    supplierType: "CATERING",
    city: "Berlin",
    country: "Germany",
    contactEmail: "info@elitecatering.de",
    description: "Premium catering for corporate events"
  },
  {
    name: "Event Decorators Pro",
    supplierType: "DECORATION",
    city: "Munich",
    country: "Germany",
    contactEmail: "info@eventdecorators.de",
    description: "Professional event decoration and design"
  },
  {
    name: "AV Tech Solutions",
    supplierType: "AV_IT",
    city: "Frankfurt",
    country: "Germany",
    contactEmail: "info@avtech.de",
    description: "Audio-visual and IT equipment rental"
  },
  {
    name: "Executive Transfer Services",
    supplierType: "TRANSFER",
    city: "Berlin",
    country: "Germany",
    contactEmail: "info@executivetransfer.de",
    description: "Premium transportation for events"
  }
];

for (const supplierData of suppliers) {
  await prisma.supplier.create({
    data: {
      ...supplierData,
      isActive: true,
      settings: {}
    }
  });
}
```

## Step 5: Test the New System

Test the new endpoints:

```bash
# Start the backend
cd backend
npm run dev

# In another terminal, test endpoints
curl http://localhost:3000/api/suppliers

# With authentication (replace TOKEN)
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/events
```

## Step 6: Frontend Updates (Next Sprint)

The frontend will need updates to use the new event/supplier system. For now, the old booking system continues to work.

## Rollback Procedure

If you need to rollback:

```bash
# Revert the migration
cd backend
npx prisma migrate resolve --rolled-back [migration_name]

# Or reset the entire database (WARNING: destroys all data)
npx prisma migrate reset
```

## Troubleshooting

### Migration Fails

If the migration fails:

1. Check PostgreSQL logs:
```bash
tail -f /var/log/postgresql/postgresql-*.log
```

2. Verify database connection:
```bash
psql $DATABASE_URL -c "SELECT 1"
```

3. Check for conflicting data:
```sql
-- Check for duplicate IDs
SELECT id, COUNT(*) FROM hotels GROUP BY id HAVING COUNT(*) > 1;
```

### Prisma Client Issues

If Prisma Client is not updated:

```bash
cd backend
npx prisma generate
npm run build
```

### Type Errors

If TypeScript complains about new types:

```bash
cd backend
rm -rf node_modules/.prisma
npx prisma generate
npm run build
```

## Verification Checklist

After migration, verify:

- [ ] All new tables exist in database
- [ ] Sample suppliers can be created
- [ ] New API endpoints respond correctly
- [ ] Old booking endpoints still work
- [ ] Prisma Client types are up to date
- [ ] Backend builds without errors
- [ ] No data loss from existing bookings

## Next Steps

After successful migration:

1. **Test extensively** with sample data
2. **Update frontend** to use new event system
3. **Create admin UI** for supplier management
4. **Document API** changes for frontend team
5. **Plan gradual rollout** to production

## Support

If you encounter issues:

1. Check `SPRINT1_DESIGN.md` for architecture details
2. Review `API_DOCUMENTATION.md` for endpoint specifications
3. Check Prisma migration logs in `backend/prisma/migrations/`
4. Contact the development team

---

**Important:** Always backup your database before running migrations in production!

```bash
# Backup command
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql
```
