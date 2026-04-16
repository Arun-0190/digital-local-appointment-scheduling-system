const { MongoClient } = require('mongodb');

const uri = "mongodb+srv://arunishere2003_db_user:nWqqsl3Ffaum62Uu@mycluster.u8zrdyj.mongodb.net/dlass_db?retryWrites=true&w=majority";
const client = new MongoClient(uri);

async function run() {
  try {
    await client.connect();
    const database = client.db('dlass_db');
    const users = database.collection('users');
    const providers = database.collection('providers');

    console.log("--- User Sample ---");
    const userSample = await users.findOne({ email: 'newuser@dlass.com' });
    console.log(JSON.stringify(userSample, null, 2));

    console.log("\n--- Provider Sample ---");
    const providerSample = await providers.findOne({ userId: userSample?._id.toString() });
    if (!providerSample) {
        const p2 = await providers.findOne({ businessName: { $exists: true } });
        console.log("Random provider sample:");
        console.log(JSON.stringify(p2, null, 2));
    } else {
        console.log(JSON.stringify(providerSample, null, 2));
    }

    console.log("\n--- Admin Sample ---");
    const adminSample = await users.findOne({ role: 'ADMIN' });
    console.log(JSON.stringify(adminSample, null, 2));

  } finally {
    await client.close();
  }
}
run().catch(console.dir);
