const dotenv = require('dotenv');
const express = require('express');
const cors = require('cors');
const mlroute = require('./routes/mlRoutes');
const authroute = require('./routes/authRoutes');
const bodyParser = require('body-parser');

dotenv.config();
const app = express();
const port = process.env.PORT || 3000;
const host = process.env.HOST || 'localhost';

app.use(cors());
app.use(bodyParser.json());

app.use('/api', mlroute);   
app.use('/api', authroute);

app.get('/', (req, res) => {
    res.send('API is running');
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something went wrong!');
});

app.listen(port, () => {
    const url = `http://${host}:${port}`;
    console.log(`Server running at ${url}`);
});
