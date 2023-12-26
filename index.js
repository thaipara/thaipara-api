const express = require('express');
const app = express();
require('dotenv').config()
const mysql = require('mysql2');
const cors = require('cors');
const port = 3001;
const swaggerUi = require('swagger-ui-express')
const swaggerJsdoc = require('swagger-jsdoc')
const eventApi = require('./routes/event');
const newApi = require('./routes/news');
const AthleteApi = require('./routes/athlete');
const CompeteAPI = require('./routes/compete');

app.use(cors());
app.use(express.json());
const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "root"
  });
// mysql.createConnection(process.env.DATABASE_URL);

connection.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
    } else {
        console.log('Connected to MySQL!');
        app.use('/api',
        eventApi(connection),
        newApi(connection ),
        CompeteAPI(connection ),
        AthleteApi(connection ));
    }
});

app.get('/', (req, res) => {
    console.log("Hello world")
    res.send("Hello world!! thaipara")
 });

const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
                title: 'API DOC',
                version: '1.0.0',
                description: 'simple API doc'

        },
        servers: [
            {
                url: 'http://localhost:3001/'
            }
        ],
    },
    apis: ['./routes/event.js',
            './routes/news.js',
            './routes//compete.js',
            './routes/athlete.js'
        ]
}

const swaggerSpec = swaggerJsdoc(swaggerOptions)
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});