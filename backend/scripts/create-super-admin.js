const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

async function createSuperAdmin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/yoneapp');
    console.log('✅ Connected to MongoDB');

    // Check if super admin already exists
    const existingSuperAdmin = await User.findOne({ adminLevel: 'super' });
    
    if (existingSuperAdmin) {
      console.log('⚠️  Super admin already exists:', existingSuperAdmin.email);
      console.log('🆔 Admin ID:', existingSuperAdmin._id);
      process.exit(0);
    }

    // Create super admin
    const superAdmin = new User({
      name: 'Super Admin',
      email: 'admin@yoneapp.com',
      password: 'SuperAdmin123!', // Change this password immediately after first login
      isAdmin: true,
      adminLevel: 'super',
      emailVerified: true,
      isActive: true
    });

    await superAdmin.save();

    console.log('🎉 Super Admin created successfully!');
    console.log('📧 Email:', superAdmin.email);
    console.log('🔑 Password: SuperAdmin123!');
    console.log('⚠️  IMPORTANT: Change this password immediately after first login!');
    console.log('🆔 Admin ID:', superAdmin._id);

  } catch (error) {
    console.error('❌ Error creating super admin:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

createSuperAdmin();
