const express = require('express');
const router = express.Router();

// Assuming connection is passed as a parameter to this module
module.exports = function (connection) {

    /**
     * @swagger
     * tags:
     *   name: Compete
     *   description: Compete management
     */

    /**
     * @swagger
     * /api/competitions/athletes/{athlete_id}:
     *   get:
     *     summary: Retrieve competitions for a specific athlete
     *     tags: [Compete]
     *     description: Retrieve a list of competitions that a specific athlete has participated in from the database.
     *     parameters:
     *       - in: path
     *         name: athlete_id
     *         required: true
     *         description: The ID of the athlete to retrieve competitions for.
     *         schema:
     *           type: integer
     *     responses:
     *       200:
     *         description: A list of competitions for the specified athlete.
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 type: object
     *                 properties:
     *                   id:
     *                     type: integer
     *                     description: The competition ID.
     *                   athlete_id:
     *                     type: integer
     *                   event_id:
     *                     type: integer
     *                   score:
     *                     type: object
     *                     description: The score of the athlete in the competition.
     *                   remark:
     *                     type: string
     *       404:
     *         description: Athlete or competitions not found.
     *       500:
     *         description: An error occurred with the database operation.
     */
    router.get('/competitions/athletes/:athlete_id', (req, res) => {
        const athleteId = req.params.athlete_id;
        const query = `
        SELECT 
            c.id,
            e.event_name, 
            e.event_class,
            e.event_date_time,
            e.event_gender,
            e.status,
            a.first_name, 
            a.last_name, 
            a.bib, 
            a.country, 
            a.date_of_birth, 
            c.score, 
            c.remark
        FROM 
        \`apm-project\`.COMPETES_IN c
        JOIN 
        \`apm-project\`.ATHLETE a ON c.athlete_id = a.id
        JOIN 
        \`apm-project\`.EVENTS e ON c.event_id = e.id
        WHERE 
            c.athlete_id = ?;
    `;
        connection.query(query, [athleteId], (err, result) => {
            if (err) {
                console.error('Error fetching competitions:', err);
                res.status(500).send('An error occurred with the database operation.');
            } else if (result.length === 0) {
                res.status(404).send('No competitions found for the specified athlete.');
            } else {
                res.json(result);
            }
        });
    });

    /**
 * @swagger
 * /api/competitions/events/{event_id}:
 *   get:
 *     summary: Retrieve a list of athletes in a specific event
 *     tags: [Compete]
 *     description: Retrieve a list of athletes who competed in a specific event.
 *     parameters:
 *       - in: path
 *         name: event_id
 *         required: true
 *         description: The ID of the event.
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: A list of athletes in the specified event.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   athlete_id:
 *                     type: integer
 *                   first_name:
 *                     type: string
 *                   last_name:
 *                     type: string
 *                   bib:
 *                     type: string
 *                   country:
 *                     type: string
 *                   date_of_birth:
 *                     type: string
 *                     format: date
 *                   score:
 *                     type: object
 *                   remark:
 *                     type: string
 *                   event_id:
 *                     type: integer
 *                   event_name:
 *                     type: string
 *                   event_class:
 *                     type: string
 *                   event_description:
 *                     type: string
 *                   event_date_time:
 *                     type: string
 *                   event_gender:
 *                     type: string
 *                   status:
 *                     type: string
 *       404:
 *         description: Event or athletes not found.
 *       500:
 *         description: An error occurred with the database operation.
 */
router.get('/competitions/events/:event_id', (req, res) => {
    const eventId = req.params.event_id;
    const query = `
        SELECT 
            c.id,
            a.id AS athlete_id,
            a.first_name, 
            a.last_name, 
            a.bib, 
            a.country,
            a.date_of_birth, 
            c.score, 
            c.remark,
            e.id AS event_id,
            e.event_name, 
            e.event_class,
            e.event_description,
            e.event_date_time,
            e.event_gender,
            e.status
        FROM 
        \`apm-project\`.COMPETES_IN c
        JOIN 
        \`apm-project\`.ATHLETE a ON c.athlete_id = a.id
        JOIN 
        \`apm-project\`.EVENTS e ON c.event_id = e.id
        WHERE 
            c.event_id = ?;
    `;
    connection.query(query, [eventId], (err, result) => {
        if (err) {
            console.error('SQL Error:', err.message);
            res.status(500).send(`Error fetching athletes for the event: ${err.message}`);
        } else if (result.length === 0) {
            res.status(404).send('No athletes found for the specified event.');
        } else {
            res.json(result);
        }
    });
});
/**
 * @swagger
 * /api/competitions:
 *   post:
 *     summary: Create a new competition record
 *     tags: [Compete]
 *     description: Add a new competition record to the database.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - athlete_id
 *               - event_id
 *             properties:
 *               athlete_id:
 *                 type: integer
 *               event_id:
 *                 type: integer
 *               score:
 *                 type: object
 *               remark:
 *                 type: string
 *     responses:
 *       201:
 *         description: Competition record created successfully.
 *       400:
 *         description: Missing required fields.
 *       500:
 *         description: Error adding the competition record to the database.
 */
router.post('/competitions', (req, res) => {
    const { athlete_id, event_id, score, remark } = req.body;

    if (!athlete_id || !event_id) {
        return res.status(400).send('Missing required fields: athlete_id and event_id are required');
    }

    const query = `
        INSERT INTO \`apm-project\`.COMPETES_IN (athlete_id, event_id, score, remark)
        VALUES (?, ?, ?, ?);
    `;
    connection.query(query, [athlete_id, event_id, JSON.stringify(score), remark], (err, result) => {
        if (err) {
            console.error('SQL Error:', err.message);
            res.status(500).send(`Error adding the competition record: ${err.message}`);
        } else {
            res.status(201).send({ message: 'Competition record created successfully', id: result.insertId });
        }
    });
});

/**
 * @swagger
 * /api/competitions/{id}:
 *   put:
 *     summary: Update a competition record by ID
 *     tags: [Compete]
 *     description: Update details of a specific competition record by its ID in the database.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the competition record to update.
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               athlete_id:
 *                 type: integer
 *               event_id:
 *                 type: integer
 *               score:
 *                 type: object
 *               remark:
 *                 type: string
 *     responses:
 *       200:
 *         description: Competition record updated successfully.
 *       400:
 *         description: Missing required fields.
 *       404:
 *         description: Competition record not found.
 *       500:
 *         description: Error updating the competition record in the database.
 */
router.put('/competitions/:id', (req, res) => {
    const competitionId = req.params.id;
    const { athlete_id, event_id, score, remark } = req.body;

    const query = `
        UPDATE \`apm-project\`.COMPETES_IN
        SET athlete_id = ?, event_id = ?, score = ?, remark = ?
        WHERE id = ?;
    `;
    connection.query(query, [athlete_id, event_id, JSON.stringify(score), remark, competitionId], (err, result) => {
        if (err) {
            console.error('SQL Error:', err.message);
            res.status(500).send(`Error updating the competition record: ${err.message}`);
        } else if (result.affectedRows === 0) {
            res.status(404).send('Competition record not found.');
        } else {
            res.status(200).send('Competition record updated successfully.');
        }
    });
});

/**
 * @swagger
 * /api/competitions/{id}:
 *   delete:
 *     summary: Delete a competition record by ID
 *     tags: [Compete]
 *     description: Remove a specific competition record by its ID from the database.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the competition record to delete.
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Competition record deleted successfully.
 *       404:
 *         description: Competition record not found.
 *       500:
 *         description: Error deleting the competition record from the database.
 */
router.delete('/competitions/:id', (req, res) => {
    const competitionId = req.params.id;

    const query = `DELETE FROM \`apm-project\`.COMPETES_IN WHERE id = ?;`;
    connection.query(query, [competitionId], (err, result) => {
        if (err) {
            console.error('SQL Error:', err.message);
            res.status(500).send(`Error deleting the competition record: ${err.message}`);
        } else if (result.affectedRows === 0) {
            res.status(404).send('Competition record not found.');
        } else {
            res.status(200).send('Competition record deleted successfully.');
        }
    });
});
    return router;
}
