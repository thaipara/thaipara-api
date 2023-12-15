const express = require('express');
const app = express();
require('dotenv').config()
const mysql = require('mysql2');
const cors = require('cors');
const port = 3001;


app.use(cors());

const connection = mysql.createConnection(process.env.DATABASE_URL);

connection.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
    } else {
        console.log('Connected to MySQL!');
    }
});

app.get('/', (req, res) => {
    console.log("Hello world")
    res.send("Hello world!! thaipara")
 });

 app.get('/thaipara', (req, res) => {
    const query = `
        SELECT u.*, a.*
        FROM USERS u
        JOIN ATHLETE a ON u.id = a.USERS_id;
    `;

    connection.query(query, (err, result) => {
        if (err) {
            console.log(err);
            res.status(500).send('An error occurred with the database operation.');
        } else {
            res.json(result);
        }
    });
});

// app.post('/onelove/add', (req, res) => {
//     const { name, information, jar_weight, old_amount, new_amount, avatar } = req.body;

//     const query = "INSERT INTO onelove.cannabis (name, information, jar_weight, old_amount, new_amount, avatar) VALUES (?, ?, ?, ?, ?, ?)";

//     connection.query(query, [name, information, jar_weight, old_amount, new_amount, avatar], (err, result) => {
//         if (err) {
//             console.log(err);
//             res.status(500).send("Error adding cannabis");
//         } else {
//             res.status(200).send("Cannabis added successfully");
//         }
//     });
// });

// app.put('/onelove/:id', (req, res) => {
//     const { id } = req.params;
//     const { name, information, jar_weight, old_amount, new_amount, avatar } = req.body;

//     const updateQuery = `
//         UPDATE onelove.cannabis
//         SET
//             name = ?,
//             information = ?,
//             jar_weight = ?,
//             old_amount = ?,
//             new_amount = ?,
//             avatar = ?
//         WHERE id = ?
//     `;

//     connection.query(updateQuery, [name, information, jar_weight, old_amount, new_amount, avatar, id], (err, result) => {
//         if (err) {
//             console.log(err);
//             res.status(500).send('Error updating data.');
//         } else {
//             res.send('Data updated successfully.');
//         }
//     });
// });

// app.delete('/onelove/:id', (req, res) => {
//     const { id } = req.params;

//     const deleteQuery = `
//         DELETE FROM onelove.cannabis
//         WHERE id = ?
//     `;

//     connection.query(deleteQuery, [id], (err, result) => {
//         if (err) {
//             console.log(err);
//             res.status(500).send('Error deleting data.');
//         } else {
//             res.send('Data deleted successfully.');
//         }
//     });
// });

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});