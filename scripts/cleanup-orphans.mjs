// Removes Better Auth `account` and `session` documents whose user was deleted.
// Run from the project root:  node scripts/cleanup-orphans.mjs
import 'dotenv/config';
import mongoose from 'mongoose';

const uri = process.env.MONGODB_URI;
if (!uri) {
    console.log('ERROR: MONGODB_URI must be set in .env');
    process.exit(1);
}

// Connect first; this is what gives us `db`
await mongoose.connect(uri, { bufferCommands: false });
const db = mongoose.connection.db;

// Every user _id that still exists
const liveIds = await db.collection('user').distinct('_id');
const orphaned = { userId: { $nin: liveIds } };

// Show what will be removed before removing it
const accounts = await db.collection('account').find(orphaned).toArray();
console.log(`Orphaned accounts: ${accounts.length}`);
for (const a of accounts) console.log(`  - ${a.providerId} account, userId ${a.userId}`);

const accountResult = await db.collection('account').deleteMany(orphaned);
const sessionResult = await db.collection('session').deleteMany(orphaned);

console.log(`Deleted ${accountResult.deletedCount} account(s) and ${sessionResult.deletedCount} session(s).`);

await mongoose.connection.close();