
const User = require('../models/User');

const seedDemoUser = async () => {
  try {
    const email = 'demo@mindmap.ai';

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      console.log('Demo account already exists');
      return;
    }

    await User.create({
      name: 'MindMap Demo Student',
      email,
      password: 'Mindmap@2026',
      isVerified: true,
    });

    console.log('Demo account created successfully');
  } catch (error) {
    console.error('Demo account creation failed:', error.message);
  }
};

module.exports = seedDemoUser;
