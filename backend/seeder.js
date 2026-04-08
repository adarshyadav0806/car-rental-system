/**
 * Database Seeder
 * Populates the database with sample data for testing
 * Run: node seeder.js
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const User = require('./models/User');
const Car = require('./models/Car');
const Booking = require('./models/Booking');

const connectDB = require('./config/db');

const users = [
  {
    name: 'Admin User',
    email: 'admin@carrental.com',
    password: 'admin123',
    phone: '+1-555-0100',
    role: 'admin'
  },
  {
    name: 'John Smith',
    email: 'john@example.com',
    password: 'user123',
    phone: '+1-555-0101',
    role: 'user'
  },
  {
    name: 'Sarah Johnson',
    email: 'sarah@example.com',
    password: 'user123',
    phone: '+1-555-0102',
    role: 'user'
  }
];

const getCars = (adminId) => [
  {
    name: 'Tesla Model 3',
    brand: 'Tesla',
    model: 'Model 3',
    year: 2023,
    type: 'Electric',
    transmission: 'Automatic',
    fuelType: 'Electric',
    seats: 5,
    pricePerDay: 120,
    description: 'Premium electric sedan with autopilot, long range battery, and cutting-edge technology.',
    features: ['Autopilot', 'GPS', 'Bluetooth', 'Heated Seats', 'Sunroof', 'Fast Charging'],
    location: 'New York, NY',
    mileage: 0,
    images: [],
    isAvailable: true,
    addedBy: adminId
  },
  {
    name: 'BMW 5 Series',
    brand: 'BMW',
    model: '5 Series',
    year: 2023,
    type: 'Luxury',
    transmission: 'Automatic',
    fuelType: 'Petrol',
    seats: 5,
    pricePerDay: 150,
    description: 'Luxurious executive sedan combining comfort, performance and sophistication.',
    features: ['GPS', 'Bluetooth', 'Leather Seats', 'Sunroof', 'Parking Sensors', 'Lane Assist'],
    location: 'Los Angeles, CA',
    mileage: 14,
    images: [],
    isAvailable: true,
    addedBy: adminId
  },
  {
    name: 'Toyota RAV4',
    brand: 'Toyota',
    model: 'RAV4',
    year: 2022,
    type: 'SUV',
    transmission: 'Automatic',
    fuelType: 'Hybrid',
    seats: 5,
    pricePerDay: 85,
    description: 'Reliable and fuel-efficient hybrid SUV perfect for city and adventure trips.',
    features: ['GPS', 'Bluetooth', 'Backup Camera', 'AC', 'AWD', 'Apple CarPlay'],
    location: 'Chicago, IL',
    mileage: 20,
    images: [],
    isAvailable: true,
    addedBy: adminId
  },
  {
    name: 'Ford Mustang',
    brand: 'Ford',
    model: 'Mustang GT',
    year: 2023,
    type: 'Convertible',
    transmission: 'Manual',
    fuelType: 'Petrol',
    seats: 4,
    pricePerDay: 110,
    description: 'Iconic American muscle car. Perfect for a thrilling open-road experience.',
    features: ['Bluetooth', 'Leather Seats', 'Sport Mode', 'Backup Camera', 'Premium Sound'],
    location: 'Miami, FL',
    mileage: 12,
    images: [],
    isAvailable: true,
    addedBy: adminId
  },
  {
    name: 'Honda Civic',
    brand: 'Honda',
    model: 'Civic',
    year: 2022,
    type: 'Sedan',
    transmission: 'Automatic',
    fuelType: 'Petrol',
    seats: 5,
    pricePerDay: 55,
    description: 'Economical and reliable compact sedan, ideal for city commuting.',
    features: ['Bluetooth', 'Backup Camera', 'AC', 'Apple CarPlay', 'Android Auto'],
    location: 'Houston, TX',
    mileage: 17,
    images: [],
    isAvailable: true,
    addedBy: adminId
  },
  {
    name: 'Mercedes-Benz GLE',
    brand: 'Mercedes-Benz',
    model: 'GLE 450',
    year: 2023,
    type: 'SUV',
    transmission: 'Automatic',
    fuelType: 'Petrol',
    seats: 7,
    pricePerDay: 180,
    description: 'Premium luxury SUV with 7 seats, advanced tech and supreme comfort.',
    features: ['GPS', 'Massage Seats', 'Burmester Sound', 'Sunroof', '360 Camera', 'Ambient Lighting'],
    location: 'New York, NY',
    mileage: 13,
    images: [],
    isAvailable: true,
    addedBy: adminId
  },
  {
    name: 'Volkswagen Golf',
    brand: 'Volkswagen',
    model: 'Golf',
    year: 2022,
    type: 'Hatchback',
    transmission: 'Automatic',
    fuelType: 'Petrol',
    seats: 5,
    pricePerDay: 60,
    description: 'Popular European hatchback with premium feel and excellent handling.',
    features: ['Bluetooth', 'GPS', 'Backup Camera', 'AC', 'Lane Assist'],
    location: 'Seattle, WA',
    mileage: 16,
    images: [],
    isAvailable: true,
    addedBy: adminId
  },
  {
    name: 'Chevrolet Silverado',
    brand: 'Chevrolet',
    model: 'Silverado 1500',
    year: 2023,
    type: 'Truck',
    transmission: 'Automatic',
    fuelType: 'Petrol',
    seats: 5,
    pricePerDay: 95,
    description: 'Full-size pickup truck with powerful towing capacity and spacious cab.',
    features: ['GPS', 'Backup Camera', 'Towing Package', 'Bluetooth', '4WD'],
    location: 'Dallas, TX',
    mileage: 11,
    images: [],
    isAvailable: true,
    addedBy: adminId
  }
];

async function seedDB() {
  await connectDB();
  console.log('\n🌱 Starting database seed...\n');

  try {
    // Clear existing data
    await User.deleteMany({});
    await Car.deleteMany({});
    await Booking.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Create users
    const createdUsers = await User.create(users);
    const admin = createdUsers.find(u => u.role === 'admin');
    const user1 = createdUsers.find(u => u.email === 'john@example.com');
    console.log(`👤 Created ${createdUsers.length} users`);

    // Create cars
    const createdCars = await Car.create(getCars(admin._id));
    console.log(`🚗 Created ${createdCars.length} cars`);

    // Create sample bookings
    const pastDate1 = new Date();
    pastDate1.setDate(pastDate1.getDate() - 20);
    const pastDate2 = new Date();
    pastDate2.setDate(pastDate2.getDate() - 17);

    const futureDate1 = new Date();
    futureDate1.setDate(futureDate1.getDate() + 5);
    const futureDate2 = new Date();
    futureDate2.setDate(futureDate2.getDate() + 8);

    await Booking.create([
      {
        user: user1._id,
        car: createdCars[0]._id,
        startDate: pastDate1,
        endDate: pastDate2,
        totalDays: 3,
        pricePerDay: createdCars[0].pricePerDay,
        totalAmount: 3 * createdCars[0].pricePerDay,
        status: 'completed',
        paymentStatus: 'paid',
        transactionId: 'TXN-SAMPLE-001',
        pickupLocation: 'New York, NY',
        dropoffLocation: 'New York, NY'
      },
      {
        user: user1._id,
        car: createdCars[2]._id,
        startDate: futureDate1,
        endDate: futureDate2,
        totalDays: 3,
        pricePerDay: createdCars[2].pricePerDay,
        totalAmount: 3 * createdCars[2].pricePerDay,
        status: 'confirmed',
        paymentStatus: 'paid',
        transactionId: 'TXN-SAMPLE-002',
        pickupLocation: 'Chicago, IL',
        dropoffLocation: 'Chicago, IL'
      }
    ]);
    console.log('📅 Created sample bookings');

    console.log('\n✅ Database seeded successfully!\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔑 Test Credentials:');
    console.log('   Admin → admin@carrental.com / admin123');
    console.log('   User  → john@example.com / user123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  } catch (err) {
    console.error('❌ Seeding failed:', err.message);
  } finally {
    process.exit();
  }
}

seedDB();
