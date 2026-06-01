import { PrismaClient, BookingStatus } from '@prisma/client';
import { hashPassword } from '../src/utils/password';

const prisma = new PrismaClient();

/**
 * Idempotent seed. Clears bookings + inventory (but keeps users) and recreates
 * 3 Moscow hotels with halls, catering, services and demo bookings in various
 * statuses for admin-panel demonstration.
 */
async function main() {
  console.log('🌱 Starting database seed...');

  // ---- Users (upsert, never wiped) --------------------------------------
  const client = await prisma.user.upsert({
    where: { email: 'client@example.com' },
    update: {},
    create: {
      email: 'client@example.com',
      passwordHash: await hashPassword('password123'),
      role: 'CLIENT',
      companyName: 'Tech Corp',
      firstName: 'Иван',
      lastName: 'Клиентов',
      phone: '+7 900 000-00-01',
    },
  });
  const manager = await prisma.user.upsert({
    where: { email: 'manager@example.com' },
    update: {},
    create: {
      email: 'manager@example.com',
      passwordHash: await hashPassword('manager123'),
      role: 'MANAGER',
      companyName: 'MICE Hotels',
      firstName: 'Мария',
      lastName: 'Менеджерова',
      phone: '+7 900 000-00-02',
    },
  });
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      passwordHash: await hashPassword('admin123'),
      role: 'ADMIN',
      companyName: 'System Admin',
      firstName: 'Алексей',
      lastName: 'Админов',
      phone: '+7 900 000-00-03',
    },
  });
  console.log('✓ Users ready:', [client.email, manager.email, admin.email].join(', '));

  // ---- Clean inventory + bookings (idempotent reseed) -------------------
  await prisma.bookingStatusHistory.deleteMany();
  await prisma.bookingComment.deleteMany();
  await prisma.bookingService.deleteMany();
  await prisma.bookingCatering.deleteMany();
  await prisma.bookingHall.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.hallUnavailability.deleteMany();
  await prisma.seatingLayout.deleteMany();
  await prisma.service.deleteMany();
  await prisma.serviceCategory.deleteMany();
  await prisma.cateringItem.deleteMany();
  await prisma.cateringCategory.deleteMany();
  await prisma.hall.deleteMany({ where: { hotelId: { not: null } } });
  await prisma.hotel.deleteMany();
  console.log('✓ Cleared existing inventory & bookings');

  const hotelsData = [
    {
      name: 'Гранд Отель Москва',
      city: 'Москва',
      address: 'ул. Тверская, 1',
      contactEmail: 'events@grandmoscow.ru',
      contactPhone: '+7 495 100-10-10',
      description: 'Премиальный бизнес-отель в центре Москвы с конференц-залами.',
    },
    {
      name: 'Бизнес-Центр Сити',
      city: 'Москва',
      address: 'Пресненская наб., 12',
      contactEmail: 'events@citymoscow.ru',
      contactPhone: '+7 495 200-20-20',
      description: 'Современный комплекс в Москва-Сити для корпоративных мероприятий.',
    },
    {
      name: 'Парк Отель Сокольники',
      city: 'Москва',
      address: 'Сокольнический Вал, 5',
      contactEmail: 'events@parksokolniki.ru',
      contactPhone: '+7 495 300-30-30',
      description: 'Зелёная локация с просторными залами и террасами.',
    },
  ];

  const hallSizes = [
    { suffix: 'Малый зал', cap: 50, price: 1200 },
    { suffix: 'Средний зал', cap: 100, price: 2500 },
    { suffix: 'Большой зал', cap: 200, price: 4500 },
    { suffix: 'Гранд-зал', cap: 500, price: 9000 },
  ];

  const createdHalls: { id: string }[] = [];

  for (const h of hotelsData) {
    const hotel = await prisma.hotel.create({ data: { ...h, country: 'Россия', isActive: true } });

    // 4 halls per hotel
    for (const s of hallSizes) {
      const hall = await prisma.hall.create({
        data: {
          hotelId: hotel.id,
          name: `${s.suffix}`,
          maxCapacity: s.cap,
          basePricePerDay: s.price,
          description: `Зал вместимостью до ${s.cap} человек`,
          amenities: ['wifi', 'projector', 'sound_system'],
          images: [],
          naturalLight: true,
          isActive: true,
        },
      });
      createdHalls.push(hall);
      await prisma.seatingLayout.createMany({
        data: [
          { hallId: hall.id, layoutType: 'THEATER', capacity: s.cap, priceModifier: 0 },
          { hallId: hall.id, layoutType: 'CLASSROOM', capacity: Math.round(s.cap * 0.6), priceModifier: 200 },
          { hallId: hall.id, layoutType: 'BANQUET', capacity: Math.round(s.cap * 0.5), priceModifier: 500 },
        ],
      });
    }

    // Catering: 1 category, several items (coffee break / lunch / dinner / welcome drink)
    const cat = await prisma.cateringCategory.create({
      data: { hotelId: hotel.id, name: 'Меню мероприятий', sortOrder: 1, isActive: true },
    });
    await prisma.cateringItem.createMany({
      data: [
        { categoryId: cat.id, name: 'Welcome drink', pricePerPerson: 800, minPersons: 10, dietaryOptions: [], isActive: true },
        { categoryId: cat.id, name: 'Кофе-брейк стандарт', pricePerPerson: 1200, minPersons: 10, dietaryOptions: ['vegetarian'], isActive: true },
        { categoryId: cat.id, name: 'Кофе-брейк премиум', pricePerPerson: 1800, minPersons: 10, dietaryOptions: ['vegetarian', 'vegan'], isActive: true },
        { categoryId: cat.id, name: 'Бизнес-ланч', pricePerPerson: 2500, minPersons: 20, dietaryOptions: ['vegetarian'], isActive: true },
        { categoryId: cat.id, name: 'Гала-ужин', pricePerPerson: 5500, minPersons: 30, dietaryOptions: ['vegetarian'], isActive: true },
      ],
    });

    // Services: 1 category, several services
    const svcCat = await prisma.serviceCategory.create({
      data: { hotelId: hotel.id, name: 'Дополнительные услуги', sortOrder: 1, isActive: true },
    });
    await prisma.service.createMany({
      data: [
        { categoryId: svcCat.id, name: 'Проектор', pricingType: 'PER_DAY', basePrice: 3000, unit: 'день', isActive: true },
        { categoryId: svcCat.id, name: 'Экран', pricingType: 'PER_DAY', basePrice: 1500, unit: 'день', isActive: true },
        { categoryId: svcCat.id, name: 'Микрофон', pricingType: 'PER_DAY', basePrice: 1000, unit: 'день', isActive: true },
        { categoryId: svcCat.id, name: 'Флористика', pricingType: 'FIXED', basePrice: 15000, unit: 'комплект', isActive: true },
        { categoryId: svcCat.id, name: 'Трансфер', pricingType: 'PER_PERSON', basePrice: 1500, unit: 'чел.', isActive: true },
        { categoryId: svcCat.id, name: 'Фотограф', pricingType: 'PER_DAY', basePrice: 25000, unit: 'день', isActive: true },
      ],
    });

    console.log(`✓ Hotel "${hotel.name}": 4 halls, catering & services created`);
  }

  // ---- Demo bookings in various statuses --------------------------------
  const allHotels = await prisma.hotel.findMany({ select: { id: true } });
  const demoStatuses: { status: BookingStatus; price: number }[] = [
    { status: 'DRAFT', price: 0 },
    { status: 'PENDING', price: 120000 },
    { status: 'PENDING', price: 85000 },
    { status: 'CONFIRMED', price: 240000 },
    { status: 'CONFIRMED', price: 310000 },
    { status: 'CANCELLED', price: 60000 },
  ];

  let idx = 0;
  for (const s of demoStatuses) {
    const hotel = allHotels[idx % allHotels.length];
    const start = new Date();
    start.setDate(start.getDate() + 14 + idx);
    const end = new Date(start);
    end.setDate(start.getDate() + 1);

    const booking = await prisma.booking.create({
      data: {
        userId: client.id,
        hotelId: hotel.id,
        status: s.status,
        eventName: `Демо-мероприятие №${idx + 1}`,
        eventFormat: 'Конференция',
        startDate: start,
        endDate: end,
        numGuests: 50 + idx * 20,
        totalPrice: s.price > 0 ? s.price : null,
        contactPerson: 'Иван Клиентов',
        contactPhone: '+7 900 000-00-01',
        submittedAt: s.status === 'DRAFT' ? null : new Date(),
      },
    });

    // Status history reflecting the path to current status.
    if (s.status !== 'DRAFT') {
      await prisma.bookingStatusHistory.create({
        data: { bookingId: booking.id, fromStatus: 'DRAFT', toStatus: 'PENDING', changedById: client.id, note: 'Отправлена клиентом' },
      });
    }
    if (s.status === 'CONFIRMED' || s.status === 'CANCELLED') {
      await prisma.bookingStatusHistory.create({
        data: {
          bookingId: booking.id,
          fromStatus: 'PENDING',
          toStatus: s.status,
          changedById: manager.id,
          note: s.status === 'CONFIRMED' ? 'Подтверждено менеджером' : 'Отменено: клиент отказался',
        },
      });
      await prisma.bookingComment.create({
        data: {
          bookingId: booking.id,
          authorId: manager.id,
          text: s.status === 'CONFIRMED' ? 'Всё согласовано, ждём гостей.' : 'К сожалению, даты заняты.',
        },
      });
    }
    idx += 1;
  }
  console.log(`✓ Created ${demoStatuses.length} demo bookings with status history`);

  console.log('\n🎉 Seed completed!');
  console.log('Test credentials: client@example.com/password123, manager@example.com/manager123, admin@example.com/admin123');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
