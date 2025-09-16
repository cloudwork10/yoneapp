const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/yoneapp', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function createAdmin() {
  try {
    console.log('🔐 Creating admin user...');
    
    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@yoneapp.com' });
    if (existingAdmin) {
      console.log('✅ Admin user already exists');
      console.log('📧 Email: admin@yoneapp.com');
      console.log('🔑 Password: admin123');
      console.log('👑 Admin Level:', existingAdmin.adminLevel);
      console.log('🔓 Account Locked:', existingAdmin.isLocked);
      console.log('⏰ Lock Until:', existingAdmin.lockUntil);
      
      // Unlock the account if it's locked
      if (existingAdmin.isLocked) {
        existingAdmin.isLocked = false;
        existingAdmin.lockUntil = undefined;
        existingAdmin.loginAttempts = 0;
        await existingAdmin.save();
        console.log('🔓 Admin account unlocked');
      }
      
      process.exit(0);
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);
    
    // Create admin user
    const adminUser = new User({
      name: 'Admin User',
      email: 'admin@yoneapp.com',
      password: hashedPassword,
      isAdmin: true,
      adminLevel: 'super',
      role: 'admin',
      isActive: true,
      isLocked: false,
      loginAttempts: 0
    });
    
    await adminUser.save();
    
    console.log('✅ Admin user created successfully!');
    console.log('📧 Email: admin@yoneapp.com');
    console.log('🔑 Password: admin123');
    console.log('👑 Admin Level: super');
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  } finally {
    mongoose.connection.close();
  }
}

createAdmin();
