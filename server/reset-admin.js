const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
dotenv.config();

async function run() {
  try {
    const uri = process.env.MONGODB_URI;
    console.log('Connecting...');
    await mongoose.connect(uri);
    console.log('Connected');

    const count = await User.countDocuments();
    console.log('Current users:', count);

    await User.deleteMany({});
    console.log('All users deleted');

    const admin = await User.create({
      name: 'Admin',
      email: 'admin@owntechsolutions.com',
      password: 'admin123',
      role: 'admin',
      isActive: true
    });
    console.log('Admin created: admin@owntechsolutions.com / admin123');

    await mongoose.disconnect();
    console.log('Done');
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

run();
