const dotenv = require('dotenv')
const express = require('express');
const cors = require('cors');
const routes = require('./routes/mlRoutes');
const authroutes = require('./routes/authRoutes')
const bodyParser = require('body-parser');

dotenv.config();
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use('/api/mlRoutes', routes);
app.use('/api/auth', authroutes)

app.get('/', (req, res) => {
    res.send('API is running');
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
