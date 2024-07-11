const express = require('express');
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Atlas connection URI
const uri = process.env.MONGODB_URI;

// MongoDB Client
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        console.log('Connected to MongoDB');

        const database = client.db("carMechanic");
        const servicesCollection = database.collection("services");

        // GET all services
        app.get('/services', async (req, res) => {
            try {
                const cursor = servicesCollection.find({});
                const services = await cursor.toArray();
                res.json(services);
            } catch (error) {
                console.error('Error fetching services:', error);
                res.status(500).json({ message: 'Server error' });
            }
        });

        // GET single service by ID
        app.get('/services/:id', async (req, res) => {
            try {
                const id = req.params.id;
                const query = { _id: ObjectId(id) };
                const service = await servicesCollection.findOne(query);
                if (!service) {
                    return res.status(404).json({ message: 'Service not found' });
                }
                res.json(service);
            } catch (error) {
                console.error('Error fetching service by ID:', error);
                res.status(500).json({ message: 'Server error' });
            }
        });

        // POST a new service
        app.post('/services', async (req, res) => {
            try {
                const service = req.body;
                const result = await servicesCollection.insertOne(service);
                res.json(result.ops[0]); // Return the newly inserted service
            } catch (error) {
                console.error('Error adding service:', error);
                res.status(500).json({ message: 'Server error' });
            }
        });

        // DELETE a service by ID
        app.delete('/services/:id', async (req, res) => {
            try {
                const id = req.params.id;
                const query = { _id: ObjectId(id) };
                const result = await servicesCollection.deleteOne(query);
                res.json(result);
            } catch (error) {
                console.error('Error deleting service:', error);
                res.status(500).json({ message: 'Server error' });
            }
        });

    } finally {
        // Ensure the MongoDB client closes when the server shuts down
        // await client.close();
    }
}

run().catch(console.error);

app.get('/', (req, res) => {
    res.send('Server is running...');
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
