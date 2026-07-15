const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

(async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;
  const users = db.collection('users');

  await users.updateOne(
    { email: 'admin@owntechsolutions.com' },
    { $set: { role: 'admin' } }
  );

  const u = await users.findOne({ email: 'admin@owntechsolutions.com' });
  console.log('Updated:', u.name, u.email, u.role);

  await mongoose.disconnect();
  process.exit(0);
})();
