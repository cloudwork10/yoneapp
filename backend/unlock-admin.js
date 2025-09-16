const mongoose = require('mongoose');
const User = require('./models/User');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/yoneapp', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function unlockAdmin() {
  try {
    console.log('🔓 Unlocking admin account...');
    
    // Find admin user
    const admin = await User.findOne({ email: 'admin@yoneapp.com' });
    if (!admin) {
      console.log('❌ Admin user not found');
      process.exit(1);
    }
    
    console.log('👤 Found admin user:', admin.name);
    console.log('🔒 Account Locked:', admin.isLocked);
    console.log('⏰ Lock Until:', admin.lockUntil);
    console.log('🔢 Login Attempts:', admin.loginAttempts);
    
    // Unlock the account
    admin.isLocked = false;
    admin.lockUntil = undefined;
    admin.loginAttempts = 0;
    
    await admin.save();
    
    console.log('✅ Admin account unlocked successfully!');
    console.log('🔓 Account Locked: false');
    console.log('⏰ Lock Until: undefined');
    console.log('🔢 Login Attempts: 0');
    
  } catch (error) {
    console.error('❌ Error unlocking admin account:', error);
  } finally {
    mongoose.connection.close();
  }
}

unlockAdmin();
