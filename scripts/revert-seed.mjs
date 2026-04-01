import { MongoClient } from 'mongodb';

const uri = 'mongodb://localhost:27017/';
const dbName = 'dlass_db';

const emails = [
  'spotless.full@gmail.com', 'crystal.clear@gmail.com', 'ultra.shine@gmail.com',
  'gleam.bath@gmail.com', 'pure.spaces@gmail.com', 'squeaky.clean@gmail.com',
  'cozy.carpets@gmail.com', 'fabric.fresh@gmail.com', 'deep.clean.sofa@gmail.com',
  'cool.breeze.ac@gmail.com', 'chill.masters@gmail.com', 'quick.cool@gmail.com',
  'frost.fix@gmail.com', 'ice.cold.repair@gmail.com', 'chill.tech@gmail.com',
  'spark.bright@gmail.com', 'wire.masters@gmail.com', 'power.pro@gmail.com',
  'pipe.fixers@gmail.com', 'aqua.flow@gmail.com', 'leak.stop@gmail.com',
  'glow.up@gmail.com', 'beauty.bliss@gmail.com', 'pamper.me@gmail.com',
  'sharp.cuts@gmail.com', 'urban.groom@gmail.com', 'style.studio@gmail.com',
  'bug.busters@gmail.com', 'pest.away@gmail.com', 'safe.shield@gmail.com'
];

async function revert() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db(dbName);
    
    // Find these users to get their IDs
    const users = await db.collection('users').find({ email: { $in: emails } }).toArray();
    const userIds = users.map(u => u._id.toString());
    
    // Delete providers associated with these users
    const resP = await db.collection('providers').deleteMany({ userId: { $in: userIds } });
    console.log(`Deleted ${resP.deletedCount} seeded providers.`);
    
    // Delete the users themselves
    const resU = await db.collection('users').deleteMany({ email: { $in: emails } });
    console.log(`Deleted ${resU.deletedCount} seeded users.`);
    
    console.log('Revert completed successfully.');
  } catch (err) {
    console.error('Error during revert:', err);
  } finally {
    await client.close();
  }
}

revert();
