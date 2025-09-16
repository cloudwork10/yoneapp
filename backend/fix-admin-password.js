const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/yoneapp', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function fixAdminPassword() {
  try {
    console.log('🔐 Fixing admin password...');
    
    // Find admin user
    const admin = await User.findOne({ email: 'admin@yoneapp.com' });
    if (!admin) {
      console.log('❌ Admin user not found');
      process.exit(1);
    }
    
    console.log('👤 Found admin user:', admin.name);
    console.log('📧 Email:', admin.email);
    console.log('🔓 Account Locked:', admin.isLocked);
    
    // Set password to plain text (will be hashed by pre-save hook)
    admin.password = 'admin123';
    admin.isLocked = false;
    admin.lockUntil = undefined;
    admin.loginAttempts = 0;
    
    // Save (this will trigger the pre-save hook to hash the password)
    await admin.save();
    
    console.log('✅ Admin password fixed successfully!');
    console.log('📧 Email: admin@yoneapp.com');
    console.log('🔑 Password: admin123');
    console.log('👑 Admin Level:', admin.adminLevel);
    console.log('🔓 Account Unlocked');
    
  } catch (error) {
    console.error('❌ Error fixing admin password:', error);
  } finally {
    mongoose.connection.close();
  }
}

fixAdminPassword();
