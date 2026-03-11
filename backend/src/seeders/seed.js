require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

const { sequelize, User } = require('../models');

const run = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected');

    await sequelize.sync({ force: true });
    console.log('All tables created fresh');

    // Create admin user
    await User.create({
      name:     'Admin',
      email:    'admin@gmail.com',
      password: 'admin123',
      role:     'admin',
    });

    // Create teacher user
    await User.create({
      name:     'Teacher',
      email:    'teacher@gmail.com',
      password: 'teacher123',
      role:     'teacher',
    });

    console.log('Users created');
    process.exit(0);

  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  }
};

run();