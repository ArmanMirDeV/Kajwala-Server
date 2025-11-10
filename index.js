const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const app = express();
const port = process.env.PORT || 3000;

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_Pass}@kajwala.9fiaw1u.mongodb.net/?appName=kajwala`;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

// MongoDB client setup
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();
    const db = client.db("kajwalaDB");

    // Collections
    const servicesCollection = db.collection("services");
    const bookingsCollection = db.collection("bookings");
    const reviewsCollection = db.collection("reviews");

    // -----------------------------
    // Services APIs
    // -----------------------------

    app.post("/services", async (req, res) => {
      const newService = req.body;
      const result = await servicesCollection.insertOne(newService);
      res.send(result);
    });

    app.get("/services", async (req, res) => {
      const result = await servicesCollection.find().toArray();
      res.send(result);
    });

    app.get("/services/:id", async (req, res) => {
      const id = req.params.id;
      const service = await servicesCollection.findOne({
        _id: new ObjectId(id),
      });
      res.send(service);
    });

    app.get("/my-services/:email", async (req, res) => {
      const email = req.params.email;
      const services = await servicesCollection
        .find({ providerEmail: email })
        .toArray();
      res.send(services);
    });

    app.put("/services/:id", async (req, res) => {
      const id = req.params.id;
      const updatedData = req.body;
      const result = await servicesCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: updatedData }
      );
      res.send(result);
    });

    app.delete("/services/:id", async (req, res) => {
      const id = req.params.id;
      try {
        const result = await servicesCollection.deleteOne({
          _id: new ObjectId(id),
        });
        res.send(result);
      } catch (err) {
        res.status(500).send({ error: "Failed to delete service" });
      }
    });

    // -----------------------------
    // Booking APIs
    // -----------------------------

    app.post("/bookings", async (req, res) => {
      const booking = req.body;
      const result = await bookingsCollection.insertOne(booking);
      res.send(result);
    });

    app.get("/bookings", async (req, res) => {
      const result = await bookingsCollection.find().toArray();
      res.send(result);
    });

    app.get("/bookings/id/:id", async (req, res) => {
      const id = req.params.id;
      const booking = await bookingsCollection.findOne({
        _id: new ObjectId(id),
      });
      res.send(booking);
    });

    app.get("/bookings/:email", async (req, res) => {
      const email = req.params.email;
      const bookings = await bookingsCollection
        .find({ userEmail: email })
        .toArray();
      res.send(bookings);
    });

    app.put("/bookings/:id", async (req, res) => {
      const id = req.params.id;
      const { status } = req.body;
      const result = await bookingsCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: { status } }
      );
      res.send(result);
    });

    app.delete("/bookings/:id", async (req, res) => {
      const id = req.params.id;
      const result = await bookingsCollection.deleteOne({
        _id: new ObjectId(id),
      });
      res.send(result);
    });

    // -----------------------------
    // Reviews APIs
    // -----------------------------

    app.get("/reviews", async (req, res) => {
      const result = await reviewsCollection.find().toArray();
      res.send(result);
    });

    app.post("/reviews", async (req, res) => {
      const review = req.body;
      const result = await reviewsCollection.insertOne(review);
      res.send(result);
    });

    app.get("/reviews/:serviceId", async (req, res) => {
      const serviceId = req.params.serviceId;
      const reviews = await reviewsCollection.find({ serviceId }).toArray();
      res.send(reviews);
    });

    // -----------------------------
    // Search & Sort
    // -----------------------------

    // GET /services/filter?min=50&max=200
    app.get("/services/filter", async (req, res) => {
      const min = parseFloat(req.query.min) || 0;
      const max = parseFloat(req.query.max) || Number.MAX_SAFE_INTEGER;
      try {
        const result = await servicesCollection
          .find({ price: { $gte: min, $lte: max } })
          .toArray();
        res.send(result);
      } catch (err) {
        res.status(500).send({ error: "Failed to filter services" });
      }
    });

    app.get("/services/search/:text", async (req, res) => {
      const text = req.params.text;
      const services = await servicesCollection
        .find({ title: { $regex: text, $options: "i" } })
        .toArray();
      res.send(services);
    });

    app.get("/services/sort/price", async (req, res) => {
      const order = req.query.order === "desc" ? -1 : 1;
      const services = await servicesCollection
        .find()
        .sort({ price: order })
        .toArray();
      res.send(services);
    });

    console.log("Connected to MongoDB!");
  } finally {
    // client.close(); // Do not close client if server is running continuously
  }
}

run().catch(console.dir);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
