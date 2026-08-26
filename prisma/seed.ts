import { PrismaClient, type ContentType } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { generateMemberId } from '../src/lib/email'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  const hashedPassword = await bcrypt.hash('password123', 12)

  // Create admin user
  const admin = await prisma.user.upsert({
    where: { email: 'admin@fxgym.com' },
    update: {},
    create: {
      email: 'admin@fxgym.com',
      name: 'Admin User',
      password: hashedPassword,
      role: 'ADMIN',
      emailVerified: new Date(),
      memberId: generateMemberId(),
      isActive: true,
    },
  })

  // Create trainer users
  const trainer1 = await prisma.user.upsert({
    where: { email: 'trainer1@fxgym.com' },
    update: {},
    create: {
      email: 'trainer1@fxgym.com',
      name: 'Marcus Steele',
      password: hashedPassword,
      role: 'TRAINER',
      emailVerified: new Date(),
      memberId: generateMemberId(),
      isActive: true,
    },
  })

  const trainer2 = await prisma.user.upsert({
    where: { email: 'trainer2@fxgym.com' },
    update: {},
    create: {
      email: 'trainer2@fxgym.com',
      name: 'Sarah Mitchell',
      password: hashedPassword,
      role: 'TRAINER',
      emailVerified: new Date(),
      memberId: generateMemberId(),
      isActive: true,
    },
  })

  // Create member users
  const member1 = await prisma.user.upsert({
    where: { email: 'member1@fxgym.com' },
    update: {},
    create: {
      email: 'member1@fxgym.com',
      name: 'John Doe',
      password: hashedPassword,
      role: 'MEMBER',
      emailVerified: new Date(),
      memberId: generateMemberId(),
      isActive: true,
      assignedTrainerId: trainer1.id,
    },
  })

  const member2 = await prisma.user.upsert({
    where: { email: 'member2@fxgym.com' },
    update: {},
    create: {
      email: 'member2@fxgym.com',
      name: 'Jane Smith',
      password: hashedPassword,
      role: 'MEMBER',
      emailVerified: new Date(),
      memberId: generateMemberId(),
      isActive: true,
      assignedTrainerId: trainer2.id,
    },
  })

  const member3 = await prisma.user.upsert({
    where: { email: 'member3@fxgym.com' },
    update: {},
    create: {
      email: 'member3@fxgym.com',
      name: 'Mike Johnson',
      password: hashedPassword,
      role: 'MEMBER',
      emailVerified: null, // Unverified
      memberId: generateMemberId(),
      isActive: false,
      assignedTrainerId: trainer1.id,
    },
  })

  console.log('✅ Users created:', { 
    admin: admin.id, 
    trainers: [trainer1.id, trainer2.id], 
    members: [member1.id, member2.id, member3.id] 
  })

  // Create services
  const services = [
    {
      name: 'Strength Training',
      description: 'Build muscle and power with our comprehensive strength programs using free machines, cables, and free weights.',
      icon: 'Dumbbell',
      isActive: true,
      sortOrder: 1,
    },
    {
      name: 'Cardio & HIIT',
      description: 'Burn fat and improve endurance with high-intensity interval training and steady-state cardio options.',
      icon: 'HeartPulse',
      isActive: true,
      sortOrder: 2,
    },
    {
      name: 'Group Fitness',
      description: 'Energizing group classes led by certified instructors. From yoga to bootcamp, find your tribe.',
      icon: 'Users',
      isActive: true,
      sortOrder: 3,
    },
    {
      name: 'Personal Training',
      description: 'One-on-one coaching tailored to your goals. Custom nutrition plans and accountability included.',
      icon: 'Zap',
      isActive: true,
      sortOrder: 4,
    },
    {
      name: 'Functional Training',
      description: 'Improve real-world movement patterns with kettlebells, battle ropes, sleds, and bodyweight exercises.',
      icon: 'Flame',
      isActive: true,
      sortOrder: 5,
    },
    {
      name: 'Sports Performance',
      description: 'Athlete-focused training for speed, agility, power, and injury prevention. Youth to pro level.',
      icon: 'Target',
      isActive: true,
      sortOrder: 6,
    },
  ]

  for (const service of services) {
    await prisma.service.upsert({
      where: { id: service.name.toLowerCase().replace(/\s+/g, '-') },
      update: service,
      create: { id: service.name.toLowerCase().replace(/\s+/g, '-'), ...service },
    })
  }

  console.log('✅ Services created')

  // Create pricing packs
  const pricingPacks = [
    {
      name: 'Monthly Membership',
      slug: 'monthly',
      description: 'Perfect for getting started or short-term goals. No commitment, cancel anytime.',
      price: 3000.00,
      duration: 30,
      features: [
        '24/7 Gym Access',
        'All Group Classes',
        'Strength & Cardio Zones',
        'Functional Training Area',
        'Locker Rooms & Showers',
        'Free WiFi',
        'Member App Access',
      ],
      isActive: true,
      isPopular: false,
      sortOrder: 1,
    },
    {
      name: '3 Month Membership',
      slug: 'quarterly',
      description: 'Commit to three months and save Rs 3000 vs going month to month.',
      price: 6000.00,
      duration: 90,
      features: [
        'Everything in Monthly Membership',
        'Save Rs 3000 (3 months for the price of ~2.5)',
        'Free Fitness Assessment',
        'Priority Class Booking (48hrs)',
        'Monthly Body Composition Scan',
        'Nutrition Guide Access',
      ],
      isActive: true,
      isPopular: true,
      sortOrder: 2,
    },
    {
      name: '6 Month Membership',
      slug: 'semiannual',
      description: 'Half-year commitment with serious savings – Rs 6000 saved vs monthly billing.',
      price: 12000.00,
      duration: 180,
      features: [
        'Everything in 3 Month Membership',
        'Save Rs 6000 vs monthly billing',
        'Quarterly Body Composition Scan',
        'Personalized Program Review',
        'Guest Passes Included',
      ],
      isActive: true,
      isPopular: false,
      sortOrder: 3,
    },
    {
      name: '12 Month Membership',
      slug: 'annual',
      description: 'Best value for the committed – Rs 18000 saved vs monthly billing. A full year of transformation.',
      price: 18000.00,
      duration: 365,
      features: [
        'Everything in 6 Month Membership',
        'Biggest savings – Rs 18000 off monthly billing',
        'Unlimited Guest Passes',
        'Quarterly Personal Training Session (4x/year)',
        'Custom Program Design (2x/year)',
        'Premium Recovery Access',
        'Exclusive Member Events',
        'Family Add-on Discount',
        'Lifetime Price Lock Guarantee',
      ],
      isActive: true,
      isPopular: false,
      sortOrder: 4,
    },
  ]

  for (const pack of pricingPacks) {
    await prisma.pricingPack.upsert({
      where: { slug: pack.slug },
      update: pack,
      create: pack,
    })
  }

  console.log('✅ Pricing packs created')

  // Create memberships for verified members
  const monthlyPack = await prisma.pricingPack.findUnique({ where: { slug: 'monthly' } })
  const quarterlyPack = await prisma.pricingPack.findUnique({ where: { slug: 'quarterly' } })
  const annualPack = await prisma.pricingPack.findUnique({ where: { slug: 'annual' } })

  if (monthlyPack && quarterlyPack && annualPack) {
    await prisma.membership.upsert({
      where: { id: 'membership-1' },
      update: {},
      create: {
        id: 'membership-1',
        userId: member1.id,
        pricingPackId: quarterlyPack.id,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-03-31'),
        status: 'ACTIVE',
      },
    })

    await prisma.membership.upsert({
      where: { id: 'membership-2' },
      update: {},
      create: {
        id: 'membership-2',
        userId: member2.id,
        pricingPackId: annualPack.id,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        status: 'ACTIVE',
      },
    })

    await prisma.membership.upsert({
      where: { id: 'membership-3' },
      update: {},
      create: {
        id: 'membership-3',
        userId: member3.id,
        pricingPackId: monthlyPack.id,
        startDate: new Date('2024-01-15'),
        endDate: new Date('2024-02-14'),
        status: 'PENDING',
      },
    })
  }

  console.log('✅ Memberships created')

  // Create sample check-ins
  const checkinDates = [
    '2024-01-15', '2024-01-13', '2024-01-11', '2024-01-10', '2024-01-08',
    '2024-01-06', '2024-01-04', '2024-01-03', '2024-01-01', '2023-12-30',
  ]

  for (let i = 0; i < checkinDates.length; i++) {
    const date = new Date(checkinDates[i])
    const checkInTime = new Date(date)
    checkInTime.setHours(6, 30, 0, 0)
    
    const checkOutTime = new Date(date)
    checkOutTime.setHours(7, 15 + (i % 3) * 15, 0, 0)

    await prisma.checkin.upsert({
      where: { id: `checkin-${i}` },
      update: {},
      create: {
        id: `checkin-${i}`,
        userId: member1.id,
        checkedIn: checkInTime,
        checkedOut: checkOutTime,
      },
    })
  }

  console.log('✅ Check-ins created')

  // Create site content
  const siteContent: { key: string; value: string; type: ContentType }[] = [
    { key: 'hero_headline', value: 'Transform Your Body, Elevate Your Mind', type: 'TEXT' },
    { key: 'hero_subheadline', value: 'Experience the premium fitness difference. State-of-the-art equipment, expert trainers, and a community that pushes you further every day.', type: 'TEXT' },
    { key: 'gym_address', value: 'FX GYM, Sector 137, Noida, Uttar Pradesh 201304, India', type: 'TEXT' },
    { key: 'gym_phone', value: '+91 XXXXXXXXXX', type: 'TEXT' },
    { key: 'gym_email', value: 'hello@fxgym.com', type: 'TEXT' },
  ]

  for (const content of siteContent) {
    await prisma.siteContent.upsert({
      where: { key: content.key },
      update: content,
      create: content,
    })
  }

  console.log('✅ Site content created')

  // Create gym location (FX Gym - Actual location from Google Maps)
  // Coordinates: 28.6412001, 77.3388814
  await prisma.gymLocation.upsert({
    where: { id: 'gym-main' },
    update: {},
    create: {
      id: 'gym-main',
      name: 'FX Gym',
      address: 'FX GYM, Sector 137, Noida, Uttar Pradesh 201304, India',
      latitude: 28.6412001,
      longitude: 77.3388814,
      radiusMeters: 30,
      isActive: true,
    },
  })

  console.log('✅ Gym location created')
  console.log('🎉 Seeding completed!')
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })