import mongoose from 'mongoose';
import MenuItem from '../models/MenuItem.js';

export const defaultMenuItems = [
  { itemName: 'Fafda', price: 20 },
  { itemName: 'Gathiya', price: 30 },
  { itemName: 'Chatni', price: 10 },
  { itemName: 'Jalebi', price: 40 },
  { itemName: 'Gulabjamun', price: 50 },
];

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || '');

    await MenuItem.deleteMany({});
    await MenuItem.insertMany(defaultMenuItems);

    console.log('Database seeded successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    mongoose.connection.close();
  }
};

seedDatabase();
