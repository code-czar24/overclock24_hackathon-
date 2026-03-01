require('dotenv').config();
const mongoose = require('mongoose');
const Drug = require('./models/Drug');
const Interaction = require('./models/Interaction');
const { interactions, drugs } = require('./data/drugData');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/drug_analyzer';

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing
    await Drug.deleteMany({});
    await Interaction.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Insert drugs
    await Drug.insertMany(drugs);
    console.log(`💊 Inserted ${drugs.length} drugs`);

    // Insert interactions
    await Interaction.insertMany(interactions);
    console.log(`⚡ Inserted ${interactions.length} interactions`);

    console.log('\n🎉 Database seeded successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err.message);
    process.exit(1);
  }
}

seed();
