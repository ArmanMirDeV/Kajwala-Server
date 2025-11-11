const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const app = express();
const port = process.env.PORT || 3000;

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_Pass}@kajwala.9fiaw1u.mongodb.net/?appName=kajwala`;

app.use(cors());
app.use(express.json());

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
    console.log("Connected to MongoDB!");

    const db = client.db("kajwalaDB");

    // Collections
    const servicesCollection = db.collection("services");
    const bookingsCollection = db.collection("bookings");
    const reviewsCollection = db.collection("reviews");

    // -----------------------------
    // Services APIs
    // -----------------------------
    app.post("/services", async (req, res) => {
      try {
        const result = await servicesCollection.insertOne(req.body);
        res.json(result);
      } catch (err) {
        res.status(500).json({ error: "Failed to add service" });
      }
    });

    app.get("/services", async (req, res) => {
      try {
        const result = await servicesCollection.find().toArray();
        res.json(result);
      } catch (err) {
        res.status(500).json({ error: "Failed to fetch services" });
      }
    });

    app.get("/services/:id", async (req, res) => {
      try {
        const service = await servicesCollection.findOne({
          _id: new ObjectId(req.params.id),
        });
        res.json(service);
      } catch (err) {
        res.status(500).json({ error: "Failed to fetch service" });
      }
    });

    app.get("/my-services/:email", async (req, res) => {
      try {
        const services = await servicesCollection
          .find({ providerEmail: req.params.email })
          .toArray();
        res.json(services);
      } catch (err) {
        res.status(500).json({ error: "Failed to fetch provider services" });
      }
    });

    app.put("/services/:id", async (req, res) => {
      try {
        const result = await servicesCollection.updateOne(
          { _id: new ObjectId(req.params.id) },
          { $set: req.body }
        );
        res.json(result);
      } catch (err) {
        res.status(500).json({ error: "Failed to update service" });
      }
    });

    app.delete("/services/:id", async (req, res) => {
      try {
        const result = await servicesCollection.deleteOne({
          _id: new ObjectId(req.params.id),
        });
        res.json(result);
      } catch (err) {
        res.status(500).json({ error: "Failed to delete service" });
      }
    });

    // -----------------------------
    // Bookings APIs
    // -----------------------------
    app.post("/bookings", async (req, res) => {
      try {
        const result = await bookingsCollection.insertOne(req.body);
        res.json(result);
      } catch (err) {
        res.status(500).json({ error: "Failed to add booking" });
      }
    });

    app.get("/bookings", async (req, res) => {
      try {
        const result = await bookingsCollection.find().toArray();
        res.json(result);
      } catch (err) {
        res.status(500).json({ error: "Failed to fetch bookings" });
      }
    });

    app.get("/bookings/id/:id", async (req, res) => {
      try {
        const booking = await bookingsCollection.findOne({
          _id: new ObjectId(req.params.id),
        });
        res.json(booking);
      } catch (err) {
        res.status(500).json({ error: "Failed to fetch booking" });
      }
    });

    app.get("/bookings/:email", async (req, res) => {
      try {
        const bookings = await bookingsCollection
          .find({ userEmail: req.params.email })
          .toArray();
        res.json(bookings);
      } catch (err) {
        res.status(500).json({ error: "Failed to fetch bookings for user" });
      }
    });

    app.get("/bookings/provider/:email", async (req, res) => {
      try {
        const providerEmail = req.params.email;

        // Get all services by provider
        const services = await servicesCollection
          .find({ providerEmail })
          .toArray();
        const serviceIds = services.map((s) => s._id);

        // Get bookings for those services
        const bookings = await bookingsCollection
          .find({ serviceId: { $in: serviceIds } })
          .toArray();
        res.json(bookings);
      } catch (err) {
        res.status(500).json({ error: "Failed to fetch provider bookings" });
      }
    });

    app.put("/bookings/:id", async (req, res) => {
      try {
        const { status } = req.body;
        const result = await bookingsCollection.updateOne(
          { _id: new ObjectId(req.params.id) },
          { $set: { status } }
        );
        res.json(result);
      } catch (err) {
        res.status(500).json({ error: "Failed to update booking" });
      }
    });

    app.delete("/bookings/:id", async (req, res) => {
      try {
        const result = await bookingsCollection.deleteOne({
          _id: new ObjectId(req.params.id),
        });
        res.json(result);
      } catch (err) {
        res.status(500).json({ error: "Failed to delete booking" });
      }
    });

    // -----------------------------
    // Reviews APIs
    // -----------------------------
    app.patch("/services/:id/review", async (req, res) => {
      try {
        const result = await servicesCollection.updateOne(
          { _id: new ObjectId(req.params.id) },
          { $push: { reviews: req.body } }
        );
        res.json(result);
      } catch (err) {
        res.status(500).json({ error: "Failed to add review" });
      }
    });

    app.get("/reviews/:serviceId", async (req, res) => {
      try {
        const reviews = await reviewsCollection
          .find({ serviceId: req.params.serviceId })
          .toArray();
        res.json(reviews);
      } catch (err) {
        res.status(500).json({ error: "Failed to fetch reviews" });
      }
    });

    app.post("/reviews", async (req, res) => {
      try {
        const result = await reviewsCollection.insertOne(req.body);
        res.json(result);
      } catch (err) {
        res.status(500).json({ error: "Failed to add review" });
      }
    });

    // -----------------------------
    // Search & Filter APIs
    // -----------------------------
    app.get("/services/filter", async (req, res) => {
      try {
        const min = parseFloat(req.query.min) || 0;
        const max = parseFloat(req.query.max) || Number.MAX_SAFE_INTEGER;
        const services = await servicesCollection
          .find({ price: { $gte: min, $lte: max } })
          .toArray();
        res.json(services);
      } catch (err) {
        res.status(500).json({ error: "Failed to filter services" });
      }
    });

    app.get("/services/search/:text", async (req, res) => {
      try {
        const services = await servicesCollection
          .find({ title: { $regex: req.params.text, $options: "i" } })
          .toArray();
        res.json(services);
      } catch (err) {
        res.status(500).json({ error: "Failed to search services" });
      }
    });

    app.get("/services/sort/price", async (req, res) => {
      try {
        const order = req.query.order === "desc" ? -1 : 1;
        const services = await servicesCollection
          .find()
          .sort({ price: order })
          .toArray();
        res.json(services);
      } catch (err) {
        res.status(500).json({ error: "Failed to sort services" });
      }
    });
  } finally {
    // Do not close client if server runs continuously
  }
}

run().catch(console.dir);

app.get("/", (req, res) => res.send("Hello World!"));

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
