const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const { MongoClient, ServerApiVersion } = require("mongodb");

const port = process.env.PORT || 3000;

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_Pass}@kajwala.9fiaw1u.mongodb.net/?appName=kajwala`;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});
async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    // DB  Collections
    const servicesCollection = db.collection("services");
    const bookingsCollection = db.collection("bookings");
    const reviewsCollection = db.collection("reviews");

    //  Create a new service
    app.post("/services", async (req, res) => {
      const newService = req.body;
      const result = await servicesCollection.insertOne(newService);
      res.send(result);
    });

    //  Get single service by ID
    app.get("/services/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await servicesCollection.findOne(query);
      res.send(result);
    });

    //  Get services of a specific provider
    app.get("/my-services/:email", async (req, res) => {
      const email = req.params.email;
      const query = { providerEmail: email };
      const result = await servicesCollection.find(query).toArray();
      res.send(result);
    });

    //  Update a service
    app.put("/services/:id", async (req, res) => {
      const id = req.params.id;
      const updatedData = req.body;
      const query = { _id: new ObjectId(id) };
      const updateDoc = { $set: updatedData };
      const result = await servicesCollection.updateOne(query, updateDoc);
      res.send(result);
    });

    //  Delete a service
    app.delete("/services/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await servicesCollection.deleteOne(query);
      res.send(result);
    });
      
      
      
      
      

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
