/**
 * Database Inspection Script
 * This script connects to MongoDB and displays all data currently stored in the database.
 * 
 * Usage: node inspect-db.js
 * 
 * Note: Make sure MONGO_URI is set in your .env file or environment variables.
 */

require('dotenv').config();
const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('ERROR: MONGO_URI is not set. Please configure your MongoDB connection.');
  console.error('Set it in Backend/.env file or as an environment variable.');
  process.exit(1);
}

// Model requires (to ensure they're registered)
require('./src/models/AdminUser');
require('./src/models/Advertisement');
require('./src/models/Blog');
require('./src/models/Career');
require('./src/models/CareerApplication');
require('./src/models/Event');
require('./src/models/EventRegistration');
require('./src/models/GalleryItem');
require('./src/models/Resource');
require('./src/models/ResourceDownload');
require('./src/models/Subscription');
require('./src/models/TeamMember');
require('./src/models/Video');

async function inspectDatabase() {
  console.log('\n========== DATABASE INSPECTION ==========\n');
  console.log('Connecting to MongoDB...\n');

  try {
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 30000,
      connectTimeoutMS: 30000,
    });

    console.log('✓ Connected to MongoDB successfully!');
    console.log(`Database: ${mongoose.connection.name}`);
    console.log(`Host: ${mongoose.connection.host}\n`);

    // Get all collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    
    if (collections.length === 0) {
      console.log('No collections found in the database.');
    } else {
      console.log(`Found ${collections.length} collection(s):\n`);
      
      for (const collection of collections) {
        const collectionName = collection.name;
        const Model = mongoose.models[collectionName];
        
        if (Model) {
          const count = await Model.countDocuments();
          console.log(`📁 Collection: "${collectionName}" - ${count} document(s)`);
          
          if (count > 0) {
            // Get sample documents (limit to 5)
            const documents = await Model.find({}).limit(5).lean();
            
            documents.forEach((doc, index) => {
              // Remove MongoDB internal fields for cleaner output
              const { _id, __v, createdAt, updatedAt, ...cleanDoc } = doc;
              console.log(`   [${index + 1}] _id: ${_id}`);
              
              // Show key fields based on collection type
              const keys = Object.keys(cleanDoc);
              if (keys.length > 0) {
                keys.slice(0, 5).forEach(key => {
                  const value = cleanDoc[key];
                  const displayValue = typeof value === 'string' && value.length > 50 
                    ? value.substring(0, 50) + '...' 
                    : value;
                  console.log(`       ${key}: ${JSON.stringify(displayValue)}`);
                });
                if (keys.length > 5) {
                  console.log(`       ... and ${keys.length - 5} more fields`);
                }
              }
              console.log('');
            });
            
            if (count > 5) {
              console.log(`   ... and ${count - 5} more document(s)\n`);
            }
          } else {
            console.log('   (empty)\n');
          }
        } else {
          console.log(`📁 Collection: "${collectionName}" - (no model defined)\n`);
        }
      }
    }

    console.log('\n========== SUMMARY ==========');
    console.log('Collections inspected:', collections.length);
    
  } catch (error) {
    console.error('\n❌ Error connecting to database:');
    console.error(error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\n✓ Disconnected from MongoDB.');
    console.log('\n===========================================\n');
  }
}

// Run the inspection
inspectDatabase();

