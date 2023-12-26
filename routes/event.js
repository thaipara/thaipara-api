// event-api.js
const express = require('express');
const router = express.Router();

// Assuming connection is passed as a parameter to this module
module.exports = function (connection) {

    /**
 * @swagger
 * tags:
 *   name: Events
 *   description: Everything about Events
 * 
 * /api/events:
 *   get:
 *     tags: [Events]
 *     summary: Retrieve a list of events
 *     description: Retrieve a list of events from the database.
 *     responses:
 *       200:
 *         description: A list of events.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     description: The event ID.
 *                   event_name:
 *                     type: string
 *                     description: The name of the event.
 *       500:
 *         description: An error occurred with the database operation.
 */
    router.get('/events', (req, res) => {
        const query = `SELECT * FROM \`apm-project\`.EVENTS;`;
        connection.query(query, (err, result) => {
            if (err) {
                console.log(err);
                res.status(500).send('An error occurred with the database operation.');
            } else {
                res.json(result);
            }
        });
    });

    /**
     * @swagger
     * /api/events/{id}:
     *   get:
     *     tags: [Events]
     *     summary: Retrieve a single event by ID
     *     description: Retrieve details of a specific event by its ID from the database.
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         description: The ID of the event to retrieve.
     *         schema:
     *           type: integer
     *     responses:
     *       200:
     *         description: Details of the event.
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 id:
     *                   type: integer
     *                   description: The event ID.
     *                 event_name:
     *                   type: string
     *                   description: The name of the event.
     *       404:
     *         description: Event not found.
     *       500:
     *         description: An error occurred with the database operation.
     */
    router.get('/events/:id', (req, res) => {
        const eventId = req.params.id;
        const query = `SELECT * FROM \`apm-project\`.EVENTS WHERE id = ?;`;
        connection.query(query, [eventId], (err, result) => {
            if (err) {
                console.error('Error fetching event:', err);
                res.status(500).send('An error occurred with the database operation.');
            } else if (result.length === 0) {
                res.status(404).send('Event not found.');
            } else {
                res.json(result[0]);
            }
        });
    });

    /**
 * @swagger
 * /api/events:
 *   post:
 *     tags: [Events]
 *     summary: Create a new event
 *     description: Add a new event to the database.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - event_date_time
 *             properties:
 *               event_name:
 *                 type: string
 *               event_class:
 *                 type: string
 *               event_description:
 *                 type: string
 *               event_date_time:
 *                 type: string
 *                 format: date-time
 *               event_gender:
 *                 type: string
 *               status:
 *                 type: string
 *               event_location:
 *                 type: string
 *               SPORT_id:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Event added successfully.
 *       400:
 *         description: event_date_time is required.
 *       500:
 *         description: Error adding event to the database.
 */
    router.post('/events', (req, res) => {
        if (!req.body.event_date_time) {
            return res.status(400).send('event_date_time is required');
        }
        // The column names should match the actual columns of your EVENTS table.
        const query = `
            INSERT INTO \`apm-project\`.EVENTS 
            (event_name, event_class, event_description, event_date_time, event_gender, status, event_location, SPORT_id) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?);
        `;
        // const eventDateTime = new Date(req.body.event_date_time).toISOString().replace('T', ' ').replace('Z', '').slice(0, 19);
        // The order of req.body properties should match the order of columns in the query.
        connection.query(query, [
            req.body.event_name,
            req.body.event_class,
            req.body.event_description,
            req.body.event_date_time,
            req.body.event_gender,
            req.body.status,
            req.body.event_location,
            req.body.SPORT_id
        ], (err, result) => {
            if (err) {
                console.error('SQL Error:', err.message);
                res.status(500).send(`Error adding event to the database: ${err.message}`);
            } else {
                res.status(201).send({ message: 'Event added successfully.', id: result.insertId });
            }
        });
    });

    /**
 * @swagger
 * /api/events/{id}:
 *   put:
 *     tags: [Events]
 *     summary: Update an event
 *     description: Update an existing event in the database.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Numeric ID of the event to update.
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               event_name:
 *                 type: string
 *     responses:
 *       200:
 *         description: Event updated successfully.
 *       400:
 *         description: No fields provided for update.
 *       500:
 *         description: Error updating event.
 */
    router.put('/events/:id', (req, res) => {
        const eventId = req.params.id;
        const updateFields = [];
        const updateValues = [];

        // For each possible field, check if it was provided in the request body
        const possibleFields = ['event_name', 'event_class', 'event_description', 'event_date_time', 'event_gender', 'status', 'event_location', 'SPORT_id'];
        possibleFields.forEach(field => {
            if (req.body.hasOwnProperty(field)) {
                updateFields.push(`${field} = ?`);
                updateValues.push(req.body[field]);
            }
        });

        if (updateFields.length === 0) {
            return res.status(400).send('No fields provided for update.');
        }

        // Add the eventId to the updateValues array
        updateValues.push(eventId);

        const query = `
            UPDATE \`apm-project\`.EVENTS 
            SET ${updateFields.join(', ')}
            WHERE id = ?;
        `;

        // Perform the query, passing the updateValues array
        connection.query(query, updateValues, (err, result) => {
            if (err) {
                console.error(err);
                res.status(500).send('Error updating event.');
            } else {
                res.status(200).send('Event updated successfully.');
            }
        });
    });

    /**
 * @swagger
 * /api/events/{id}:
 *   delete:
 *     tags: [Events]
 *     summary: Delete an event
 *     description: Remove an event from the database.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Numeric ID of the event to delete.
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Event deleted successfully.
 *       500:
 *         description: Error deleting event.
 */
    router.delete('/events/:id', (req, res) => {
        const eventId = req.params.id;
        const query = `DELETE FROM \`apm-project\`.EVENTS WHERE id = ?;`;
        connection.query(query, [eventId], (err, result) => {
            if (err) {
                console.log(err);
                res.status(500).send('Error deleting event.');
            } else {
                res.status(200).send('Event deleted successfully.');
            }
        });
    });

    return router;
}
