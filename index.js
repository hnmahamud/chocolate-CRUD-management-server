const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.6jia9zl.mongodb.net/?retryWrites=true&w=majority`;

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

    const chocolateDatabase = client.db("chocolateDatabase");
    const chocolates = chocolateDatabase.collection("chocolates");

    // Api for get all chocolates
    app.get("/chocolates", async (req, res) => {
      const cursor = chocolates.find({});
      const allValues = await cursor.toArray();
      res.send(allValues);
    });

    // Api for get single chocolates
    app.get("/chocolates/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await chocolates.findOne(query);
      res.send(result);
    });

    // Api for insert single chocolates
    app.post("/chocolates", async (req, res) => {
      const singleChocolate = req.body;
      const result = await chocolates.insertOne(singleChocolate);
      if (result.insertedId) {
        console.log("Chocolate added successfully!");
      } else {
        console.log("Chocolate added failed!");
      }
      res.send(result);
    });

    // Api for update single chocolates
    app.put("/chocolates/:id", async (req, res) => {
      const id = req.params.id;
      const updateChocolate = req.body;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          name: updateChocolate.name,
          price: updateChocolate.price,
          categoryValue: updateChocolate.categoryValue,
          photo: updateChocolate.photo,
        },
      };
      const result = await chocolates.updateOne(filter, updateDoc, options);
      if (result.modifiedCount === 1) {
        console.log("Chocolate Update Successfully!");
      } else {
        console.log("Chocolate Update Failed!");
      }
      res.send(result);
    });

    // Api for delete single chocolates
    app.delete("/chocolates/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await chocolates.deleteOne(query);
      if (result.deletedCount === 1) {
        console.log("Successfully deleted one document.");
      } else {
        console.log("No documents matched the query. Deleted 0 documents.");
      }
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

app.get("/", (req, res) => {
  res.send("Server running...");
});

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
