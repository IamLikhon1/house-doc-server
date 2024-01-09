const express = require('express');
const app = express();
const cors = require('cors');
const port = process.env.PORT || 5000;
require("dotenv").config();

// middleware

app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.snwbd1q.mongodb.net/?retryWrites=true&w=majority`;

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

        const testimonialDocCollection = client.db('House-Doc-Data').collection('Testimonial');
        const doctorsDocCollection = client.db('House-Doc-Data').collection('doctorsData');
        const reviewDocCollection = client.db('House-Doc-Data').collection('reviewsData');
        const servicesDocCollection = client.db('House-Doc-Data').collection('ServiceAllData');
        const userServiceDocCollection = client.db('House-Doc-Data').collection('userServicesData');

        // get the testimonial data from mongodb 
        app.get('/getTestimonialData', async (req, res) => {
            const testimonial = await testimonialDocCollection.find().toArray();
            res.send(testimonial)
        });

        // get api for all doctors data from mongodb
        app.get('/getDoctorsData', async (req, res) => {
            const search = req.query.search
            const sort = req.query.sort
            const query = { name: { $regex: `${search}`, $options: 'i' } };
            const sortOptions = {
                sort: {
                    'fee': sort === 'asc' ? 1 : -1
                }
            }
            const doctorsData = await doctorsDocCollection.find(query, sortOptions).toArray();
            res.send(doctorsData)
        });

        // specific get api for single doctors from mongodb
        app.get('/doctor/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await doctorsDocCollection.findOne(query);
            res.send(result);
        });
        // post api for doctors for dashboard 
        app.post('/postDoctorData', async (req, res) => {
            const userDoctorDataStore = req.body;
            const result = await doctorsDocCollection.insertOne(userDoctorDataStore)
            res.send(result)
        });
        // delete data for doctors for dashboard
        app.delete('/deleteDoctorData/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await doctorsDocCollection.deleteOne(query);
            res.send(result);
        });

        // post api for single doctor review
        app.post('/postReview', async (req, res) => {
            const userDataStore = req.body;
            const result = await reviewDocCollection.insertOne(userDataStore)
            res.send(result)
        });

        // get api for doctors review  
        app.get('/getReview', async (req, res) => {
            const getReview = await reviewDocCollection.find().toArray();
            res.send(getReview)
        });

        // delete api for doctor review
        app.delete('/deleteReview/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await reviewDocCollection.deleteOne(query);
            res.send(result);
        });

        // get all services data from mongodb
        app.get('/getAllServiceData', async (req, res) => {
            const search = req.query.search
            const sort = req.query.sort
            const query = { service_name: { $regex: `${search}`, $options: 'i' } };
            const sortOptions = {
                sort: {
                    'fee': sort === 'asc' ? 1 : -1
                }
            }
            const doctorsData = await servicesDocCollection.find(query, sortOptions).toArray();
            res.send(doctorsData)
        });

        // post api for services data for dashboard
        app.post('/postServicesData', async (req, res) => {
            const servicesDataStore = req.body;
            const result = await servicesDocCollection.insertOne(servicesDataStore)
            res.send(result)
        });

        // delete api for  services data for dashboard
        app.delete('/deleteServicesData/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await servicesDocCollection.deleteOne(query);
            res.send(result);
        });

        // post api for user sent appointment data for user
        app.post('/postUserServiceData', async (req, res) => {
            const userDataStoreService = req.body;
            const result = await userServiceDocCollection.insertOne(userDataStoreService)
            res.send(result)
        });
        // get api for user sent appointment for dashboard
        app.get('/getAllUserSentData', async (req, res) => {
            const getAllUserSentData = await userServiceDocCollection.find().toArray();
            res.send(getAllUserSentData)
        });

        // delete api for user sent appointment data for dashboard
        app.delete('/deleteUserSentData/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await userServiceDocCollection.deleteOne(query);
            res.send(result);
        });


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
    res.send('Doc-House server Is running')
})
app.listen(port, () => {
    console.log(`Doc-House is server running on port: ${port}`)
})