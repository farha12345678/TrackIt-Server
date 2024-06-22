const express = require('express')
const cors = require('cors')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const app = express()
const port = process.env.PORT || 5000

// middleware
app.use(cors())
app.use(express.json())



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.rnkwiqi.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    const usersCollection = client.db("twelveDB").collection('users');
    const reviewCollection = client.db("twelveDB").collection('review');
    const parcelCollection = client.db("twelveDB").collection('parcels');

    // bookParcel

    app.get('/parcel', async (req, res) => {
      const cursor = parcelCollection.find()
      const result = await cursor.toArray();

      res.send(result)
    })

    app.get('/parcels/:email', async (req, res) => {

      const result = await parcelCollection.find({ email: req.params.email }).toArray()

      res.send(result)

    })

    app.get('/my-parcel/:deliveryManEmail', async (req, res) => {
      const result = await parcelCollection.find({ deliveryManEmail: req.params.deliveryManEmail }).toArray()

      res.send(result)
    })

    app.put('/parcel/:id', async (req, res) => {
      const { id } = req.params;
      console.log(id);
      const updateData = req.body;
      console.log('updateData', updateData);
      const options = { upsert: true }
      const query = { _id: new ObjectId(id) };
      const update = {
        $set: {
          status: updateData.status,
          deliveryManId: updateData.deliveryManId,
          approxDeliveryDate: updateData.approxDeliveryDate,
          deliveryManEmail: updateData.deliveryManEmail
        },
      };

      const result = await parcelCollection.updateOne(query, update, options);

      res.send(result);

    });







    // add
    app.post('/parcel', async (req, res) => {
      const newParcel = { ...req.body, status: 'Pending', bookingDate: new Date() };

      const result = await parcelCollection.insertOne(newParcel)
      res.send(result)
    })


    // user
    app.get("/users", async (req, res) => {
      const userType = req.query.userType;
      const query = userType ? { userType } : {};
      const result = await usersCollection.find(query).toArray();
      res.send(result);
    });

    app.get('/users/:userEmail', async (req, res) => {
      const result = await usersCollection.findOne({ userEmail: req.params.userEmail })

      res.send(result)

    })


    app.patch('/users/admin/:id', async (req, res) => {
      const id = req.params.id
      const filter = { _id: new ObjectId(id) }
      const updateData = req.body;
      const updatedDoc = {
        $set: {
          userType: updateData.userType,
        }
      }
      const result = await usersCollection.updateOne(filter, updatedDoc);

      res.send(result);
    })

    // review

    app.get('/review', async (req, res) => {
      try {
        const topReviews = await reviewCollection.find().sort({ rating: -1 }).toArray();
        res.send(topReviews);
      } catch (error) {
        res.status(500).send({ message: "Error retrieving top-rated reviews", error });
      }
    });

    app.get('/my-review/:email', async (req, res) => {

      const result = await reviewCollection.find({ email: req.params.email }).toArray()

      res.send(result)

    })


    app.post('/review', async (req, res) => {
      const review = req.body;
      console.log(review);
      const result = await reviewCollection.insertOne(review)
      res.send(result)
    })




    // app.get("/users/admin/:userEmail", async (req, res) => {
    //   const userEmail = req.params.userEmail;
    
    //   const user = await usersCollection.findOne(query);
    //   let admin = false;
    //   if (user) {
    //     admin = user?.userType === 'Admin'
    //   }
    //   res.send({ admin })


    // })


    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.get('/', (req, res) => {
  res.send('server is running')
})

app.listen(port, () => {
  console.log(`assignment-12 is running ${port}`)
})