const express = require('express')
const cors = require('cors')
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express()
const port = process.env.PORT || 5000

app.use(cors());
app.use(express.json());

const uri = "mongodb+srv://toysMarketData:4phbYiE5yF03LRJB@toysmarketdata.uv9io2a.mongodb.net/?retryWrites=true&authSource=admin";

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
        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");


        const toysCollection = client.db('toysMarket').collection('toys_car');
        // const addedCollection = client.db('toysMarket').collection('addedToys');


        const indexKeys = { toys_name: 1, sub_category: 1 }; 
        const indexOptions = { name: "titleCategory" }; 
        const result = await toysCollection.createIndex(indexKeys, indexOptions);
        console.log(result);


        app.get('/toys/:id', async (req, res) => {
            const id = req.params.id;
            console.log(id)
            const query = { _id: new ObjectId(id) };
            const result = await toysCollection.findOne(query);
            res.send(result)
        })
        app.get('/toys', async (req, res) => {
            const cursor = toysCollection.find();
            const result = await cursor.toArray();
            res.send(result)
        })
        app.get('/toyByCategory/:category', async (req, res) => {
            const toysCategory = req.params.category;
            console.log(toysCategory)

            const cursor = toysCollection.find({
                sub_category: req.params.category
            });
            const result = await cursor.toArray();
            res.send(result)
        })

        app.post('/addtoys', async (req, res) => {
            const addedData = req.body;
            console.log(addedData)
            const result = await toysCollection.insertOne(addedData);
            res.send(result)
        })

        app.get('/mytoys', async (req, res) => {
            // const cursor=toysCollection.find()
            let query = {};
            if (req.query?.email) {
                query = { email: req.query.email }
            }
            console.log(query.email);
            const result = await toysCollection.find(query).toArray()
            res.send(result)
        })
        app.delete('/mytoys/:id', async (req, res) => {
            const id = req.params.id;
            console.log(id)
            const query = { _id: new ObjectId(id) };
            const result = await toysCollection.deleteOne(query);
            res.send(result)
        })

        app.get("/toysBySearch/:text", async (req, res) => {
            const text = req.params.text;
            const result = await toysCollection
              .find({
                $or: [
                  { toys_name: { $regex: text, $options: "i" } },
                  { sub_category: { $regex: text, $options: "i" } },
                ],
              })
              .toArray();
              console.log(result)
            res.send(result);
          });

          
        app.put("/updateJob/:id", async (req, res) => {
            const id = req.params.id;
            const body = req.body;
            console.log(body);
            const filter = { _id: new ObjectId(id) };
            const updateDoc = {
                $set: {
                    toys_name: body.toys_name,
                    sub_category: body.sub_category,
                    quantity: body.quantity,
                    price: body.price,
                    toys_image: body.toys_image,
                    rating: body.rating,
                    description: body.description,
                },
            };
            const result = await toysCollection.updateOne(filter, updateDoc);
            res.send(result);
        });

    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);




app.get('/', (req, res) => {
    res.send('Hello Toys Market')
})

// toysMarketData 4phbYiE5yF03LRJB





app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})