/**
 * Script to reset ALL data in MongoDB (users, votes, everything)
 * Run with: node scripts/resetVotingData.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/database');

async function resetAllData() {
  try {
    await connectDB();
    console.log('✅ Connected to MongoDB');

    // DELETE all users completely (not just reset)
    const userResult = await mongoose.connection.db.collection('users').deleteMany({});
    console.log(`✅ Deleted ${userResult.deletedCount} users completely`);

    // Delete all votes
    const voteResult = await mongoose.connection.db.collection('votes').deleteMany({});
    console.log(`✅ Deleted ${voteResult.deletedCount} votes`);

    // Clear ALL audit logs
    const auditResult = await mongoose.connection.db.collection('auditlogs').deleteMany({});
    console.log(`✅ Cleared ${auditResult.deletedCount} audit logs`);

    // Clear sessions
    const sessionResult = await mongoose.connection.db.collection('sessions').deleteMany({});
    console.log(`✅ Cleared ${sessionResult.deletedCount} sessions`);

    // Clear OTPs if collection exists
    try {
      const otpResult = await mongoose.connection.db.collection('otps').deleteMany({});
      console.log(`✅ Cleared ${otpResult.deletedCount} OTPs`);
    } catch (e) {
      console.log('ℹ️ No OTPs collection to clear');
    }

    console.log('\n🎉 ALL data has been completely reset! You can now register fresh.');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error resetting data:', error);
    process.exit(1);
  }
}

resetAllData();
