const dotenv = require('dotenv');
const express = require('express');
const cors = require('cors');
const mlroute = require('./routes/mlRoutes');
const authroute = require('./routes/authRoutes');
// const geminiroute = require('./routes/geminiRoutes'); 
const postroute = require('./routes/postRoutes');
const db = require('./config/cloudsql');
const bodyParser = require('body-parser');

dotenv.config();
const app = express();
const port = process.env.PORT || 3000;
const host = process.env.HOST || 'localhost';

app.use(cors());
app.use(express.json({ limit: '10mb' })); 
app.use(express.urlencoded({ extended: true, limit: '10mb' })); 


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));



app.use('/api', mlroute);   
app.use('/api', authroute);
// app.use('/api', geminiroute);
app.use('/api', postroute);

app.get('/', (req, res) => {
    db.ping((err) => {  
        if (err) {
            res.status(500).json({ 
                message: 'API is running, but database connection failed', 
                error: err 
            });
        } else {
            res.status(200).json({ 
                message: 'API is running and connected to the database' 
            });
        }
    });
});


app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something went wrong!');
});

app.listen(port, () => {
    const url = `http://${host}:${port}`;
    console.log(`Server running at ${url}`);
});
