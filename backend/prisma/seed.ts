import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/utils/password';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create a test user
  const hashedPassword = await hashPassword('password123');
  const user = await prisma.user.upsert({
    where: { email: 'client@example.com' },
    update: {},
    create: {
      email: 'client@example.com',
      passwordHash: hashedPassword,
      role: 'CLIENT',
      companyName: 'Tech Corp',
      firstName: 'John',
      lastName: 'Doe',
      phone: '+1234567890',
    },
  });
  console.log('✓ Created user:', user.email);

  // Create a hotel
  const hotel = await prisma.hotel.upsert({
    where: { id: 'hotel-1' },
    update: {},
    create: {
      id: 'hotel-1',
      name: 'Grand Business Hotel',
      address: '123 Business Street',
      city: 'New York',
      country: 'USA',
      contactEmail: 'events@grandbusiness.com',
      contactPhone: '+1234567890',
      description: 'Premium business hotel with world-class conference facilities',
      isActive: true,
    },
  });
  console.log('✓ Created hotel:', hotel.name);

  // Create halls
  const hall1 = await prisma.hall.create({
    data: {
      hotelId: hotel.id,
      name: 'Grand Ballroom',
      maxCapacity: 500,
      areaSqm: 450,
      basePricePerDay: 5000,
      description: 'Our largest and most prestigious event space',
      amenities: ['projector', 'wifi', 'sound_system', 'stage', 'natural_light'],
      images: ['/images/ballroom1.jpg', '/images/ballroom2.jpg'],
      floor: 2,
      naturalLight: true,
      isActive: true,
    },
  });

  const hall2 = await prisma.hall.create({
    data: {
      hotelId: hotel.id,
      name: 'Executive Conference Room',
      maxCapacity: 50,
      areaSqm: 80,
      basePricePerDay: 1500,
      description: 'Perfect for board meetings and executive sessions',
      amenities: ['projector', 'wifi', 'whiteboard', 'video_conference'],
      images: ['/images/conference1.jpg'],
      floor: 5,
      naturalLight: true,
      isActive: true,
    },
  });

  const hall3 = await prisma.hall.create({
    data: {
      hotelId: hotel.id,
      name: 'Innovation Hub',
      maxCapacity: 100,
      areaSqm: 120,
      basePricePerDay: 2500,
      description: 'Modern space designed for workshops and training sessions',
      amenities: ['projector', 'wifi', 'whiteboard', 'movable_furniture'],
      images: ['/images/hub1.jpg'],
      floor: 3,
      naturalLight: true,
      isActive: true,
    },
  });

  console.log('✓ Created 3 halls');

  // Create seating layouts for halls
  await prisma.seatingLayout.createMany({
    data: [
      { hallId: hall1.id, layoutType: 'THEATER', capacity: 500, priceModifier: 0 },
      { hallId: hall1.id, layoutType: 'BANQUET', capacity: 300, priceModifier: 500 },
      { hallId: hall1.id, layoutType: 'COCKTAIL', capacity: 400, priceModifier: 300 },
      { hallId: hall2.id, layoutType: 'BOARDROOM', capacity: 20, priceModifier: 0 },
      { hallId: hall2.id, layoutType: 'U_SHAPE', capacity: 30, priceModifier: 100 },
      { hallId: hall2.id, layoutType: 'CLASSROOM', capacity: 40, priceModifier: 150 },
      { hallId: hall3.id, layoutType: 'THEATER', capacity: 100, priceModifier: 0 },
      { hallId: hall3.id, layoutType: 'CLASSROOM', capacity: 60, priceModifier: 200 },
      { hallId: hall3.id, layoutType: 'U_SHAPE', capacity: 40, priceModifier: 150 },
    ],
  });
  console.log('✓ Created seating layouts');

  // Create catering categories
  const coffeeBreakCat = await prisma.cateringCategory.create({
    data: {
      hotelId: hotel.id,
      name: 'Coffee Breaks',
      description: 'Refreshment breaks for your event',
      sortOrder: 1,
      isActive: true,
    },
  });

  const lunchCat = await prisma.cateringCategory.create({
    data: {
      hotelId: hotel.id,
      name: 'Lunch Options',
      description: 'Various lunch menus for your guests',
      sortOrder: 2,
      isActive: true,
    },
  });

  const banquetCat = await prisma.cateringCategory.create({
    data: {
      hotelId: hotel.id,
      name: 'Banquet Dinner',
      description: 'Elegant dinner options',
      sortOrder: 3,
      isActive: true,
    },
  });

  console.log('✓ Created catering categories');

  // Create catering items
  await prisma.cateringItem.createMany({
    data: [
      {
        categoryId: coffeeBreakCat.id,
        name: 'Standard Coffee Break',
        description: 'Coffee, tea, cookies, and fruit',
        pricePerPerson: 15,
        minPersons: 10,
        dietaryOptions: ['vegetarian'],
        isActive: true,
      },
      {
        categoryId: coffeeBreakCat.id,
        name: 'Premium Coffee Break',
        description: 'Coffee, tea, pastries, sandwiches, and fresh juice',
        pricePerPerson: 25,
        minPersons: 10,
        dietaryOptions: ['vegetarian', 'vegan_options'],
        isActive: true,
      },
      {
        categoryId: lunchCat.id,
        name: 'Business Lunch Buffet',
        description: 'Hot and cold buffet with salads, main courses, and desserts',
        pricePerPerson: 45,
        minPersons: 20,
        dietaryOptions: ['vegetarian', 'vegan_options', 'gluten_free_options'],
        isActive: true,
      },
      {
        categoryId: lunchCat.id,
        name: 'Executive Lunch Menu',
        description: 'Three-course plated lunch with wine',
        pricePerPerson: 65,
        minPersons: 10,
        dietaryOptions: ['vegetarian', 'vegan_options'],
        isActive: true,
      },
      {
        categoryId: banquetCat.id,
        name: 'Gala Dinner',
        description: 'Five-course dinner with wine pairing',
        pricePerPerson: 120,
        minPersons: 30,
        dietaryOptions: ['vegetarian', 'vegan_options', 'kosher_available'],
        isActive: true,
      },
    ],
  });
  console.log('✓ Created catering items');

  // Create service categories
  const avCat = await prisma.serviceCategory.create({
    data: {
      hotelId: hotel.id,
      name: 'AV Equipment',
      description: 'Audio-visual equipment rental',
      sortOrder: 1,
      isActive: true,
    },
  });

  const floristCat = await prisma.serviceCategory.create({
    data: {
      hotelId: hotel.id,
      name: 'Floristics & Decoration',
      description: 'Flowers and event decoration',
      sortOrder: 2,
      isActive: true,
    },
  });

  const transferCat = await prisma.serviceCategory.create({
    data: {
      hotelId: hotel.id,
      name: 'Transfer Services',
      description: 'Transportation for your guests',
      sortOrder: 3,
      isActive: true,
    },
  });

  const accommodationCat = await prisma.serviceCategory.create({
    data: {
      hotelId: hotel.id,
      name: 'Accommodation',
      description: 'Hotel rooms for participants',
      sortOrder: 4,
      isActive: true,
    },
  });

  console.log('✓ Created service categories');

  // Create services
  await prisma.service.createMany({
    data: [
      {
        categoryId: avCat.id,
        name: 'Professional Projector',
        description: '6000 lumens projector with screen',
        pricingType: 'PER_DAY',
        basePrice: 250,
        unit: 'day',
        isActive: true,
      },
      {
        categoryId: avCat.id,
        name: 'Wireless Microphone System',
        description: 'Professional wireless microphone',
        pricingType: 'PER_DAY',
        basePrice: 150,
        unit: 'day',
        isActive: true,
      },
      {
        categoryId: avCat.id,
        name: 'Sound System',
        description: 'Professional PA system',
        pricingType: 'PER_DAY',
        basePrice: 500,
        unit: 'day',
        isActive: true,
      },
      {
        categoryId: floristCat.id,
        name: 'Table Centerpieces',
        description: 'Elegant flower arrangements',
        pricingType: 'FIXED',
        basePrice: 50,
        unit: 'piece',
        isActive: true,
      },
      {
        categoryId: floristCat.id,
        name: 'Full Event Decoration',
        description: 'Complete event decoration package',
        pricingType: 'FIXED',
        basePrice: 2000,
        unit: 'package',
        isActive: true,
      },
      {
        categoryId: transferCat.id,
        name: 'Airport Transfer',
        description: 'Luxury car service from airport',
        pricingType: 'PER_PERSON',
        basePrice: 50,
        unit: 'person',
        isActive: true,
      },
      {
        categoryId: transferCat.id,
        name: 'Group Bus Transfer',
        description: 'Bus rental for group transportation',
        pricingType: 'PER_DAY',
        basePrice: 800,
        unit: 'day',
        isActive: true,
      },
      {
        categoryId: accommodationCat.id,
        name: 'Standard Room',
        description: 'Comfortable single/double room',
        pricingType: 'PER_DAY',
        basePrice: 150,
        unit: 'room/night',
        isActive: true,
      },
      {
        categoryId: accommodationCat.id,
        name: 'Executive Suite',
        description: 'Spacious suite with living area',
        pricingType: 'PER_DAY',
        basePrice: 350,
        unit: 'suite/night',
        isActive: true,
      },
    ],
  });
  console.log('✓ Created services');

  console.log('🎉 Database seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
