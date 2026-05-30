const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Doctor = require('./models/Doctor');

dotenv.config();

const doctors = [
  {
    name: 'Dr. Sarah Johnson',
    email: 'sarah.johnson@docbook.com',
    password: 'password123',
    phone: '+1-555-0101',
    specialization: 'General Physician',
    degree: 'MBBS, MD',
    experience: '8 Years',
    about: 'Dr. Sarah Johnson is a highly experienced general physician with a passion for preventive care and patient education.',
    fees: 500,
    address: { line1: '123 Medical Center Dr', line2: 'Suite 100, New York' },
    image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=300',
    available: true
  },
  {
    name: 'Dr. Michael Chen',
    email: 'michael.chen@docbook.com',
    password: 'password123',
    phone: '+1-555-0102',
    specialization: 'Cardiologist',
    degree: 'MBBS, DM Cardiology',
    experience: '12 Years',
    about: 'Dr. Michael Chen specializes in cardiovascular diseases and has performed over 500 cardiac procedures.',
    fees: 1200,
    address: { line1: '456 Heart Care Blvd', line2: 'Floor 3, Los Angeles' },
    image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=300',
    available: true
  },
  {
    name: 'Dr. Priya Patel',
    email: 'priya.patel@docbook.com',
    password: 'password123',
    phone: '+1-555-0103',
    specialization: 'Dermatologist',
    degree: 'MBBS, MD Dermatology',
    experience: '6 Years',
    about: 'Dr. Priya Patel is a board-certified dermatologist specializing in skin conditions, cosmetic procedures, and hair disorders.',
    fees: 800,
    address: { line1: '789 Skin Clinic Ave', line2: 'Chicago, IL' },
    image: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=300',
    available: true
  },
  {
    name: 'Dr. James Wilson',
    email: 'james.wilson@docbook.com',
    password: 'password123',
    phone: '+1-555-0104',
    specialization: 'Neurologist',
    degree: 'MBBS, DM Neurology',
    experience: '15 Years',
    about: 'Dr. James Wilson is a leading neurologist with expertise in treating complex neurological disorders.',
    fees: 1500,
    address: { line1: '321 Brain Health Center', line2: 'Houston, TX' },
    image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=300',
    available: true
  },
  {
    name: 'Dr. Emily Rodriguez',
    email: 'emily.rodriguez@docbook.com',
    password: 'password123',
    phone: '+1-555-0105',
    specialization: 'Pediatricians',
    degree: 'MBBS, MD Pediatrics',
    experience: '10 Years',
    about: 'Dr. Emily Rodriguez is a compassionate pediatrician dedicated to the health and well-being of children from birth through adolescence.',
    fees: 700,
    address: { line1: '654 Kids Care Lane', line2: 'Phoenix, AZ' },
    image: 'https://images.unsplash.com/photo-1651008376811-b90baee60c1f?w=300',
    available: true
  },
  {
    name: 'Dr. Robert Kim',
    email: 'robert.kim@docbook.com',
    password: 'password123',
    phone: '+1-555-0106',
    specialization: 'Orthopedic',
    degree: 'MBBS, MS Orthopedics',
    experience: '11 Years',
    about: 'Dr. Robert Kim specializes in orthopedic surgery and sports medicine, helping patients recover from injuries and joint conditions.',
    fees: 1000,
    address: { line1: '987 Bone & Joint Clinic', line2: 'Philadelphia, PA' },
    image: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=300',
    available: true
  },
  {
    name: 'Dr. Aisha Malik',
    email: 'aisha.malik@docbook.com',
    password: 'password123',
    phone: '+1-555-0107',
    specialization: 'Gynecologist',
    degree: 'MBBS, MD Gynecology',
    experience: '9 Years',
    about: "Dr. Aisha Malik is a dedicated gynecologist providing comprehensive women's health care services.",
    fees: 900,
    address: { line1: "147 Women's Health Center", line2: 'San Antonio, TX' },
    image: 'https://images.unsplash.com/photo-1614608682850-e0d6ed316d47?w=300',
    available: true
  },
  {
    name: 'Dr. David Thompson',
    email: 'david.thompson@docbook.com',
    password: 'password123',
    phone: '+1-555-0108',
    specialization: 'Gastroenterologist',
    degree: 'MBBS, DM Gastroenterology',
    experience: '13 Years',
    about: 'Dr. David Thompson is an expert gastroenterologist specializing in digestive system disorders and endoscopic procedures.',
    fees: 1100,
    address: { line1: '258 Digestive Health Blvd', line2: 'San Diego, CA' },
    image: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=300',
    available: true
  }
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected');

    await Doctor.deleteMany({});
    console.log('Cleared existing doctors');

    await Doctor.create(doctors);
    console.log(`✅ Seeded ${doctors.length} doctors successfully`);

    console.log('\n📋 Doctor Login Credentials:');
    doctors.forEach(d => console.log(`  ${d.name}: ${d.email} / password123`));
    console.log('\n🔑 Admin Login: admin@docbook.com / Admin@123');

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seedDB();
