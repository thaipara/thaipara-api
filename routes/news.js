const express = require('express');
const router = express.Router();

// Assuming connection is passed as a parameter to this module
module.exports = function (connection) {

    /**
     * @swagger
     * tags:
     *   name: News
     *   description: Everything about News
     * 
     * /api/news:
     *   get:
     *     tags: [News]
     *     summary: Retrieve a list of news
     *     description: Retrieve a list of news from the database.
     *     responses:
     *       200:
     *         description: A list of news.
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 type: object
     *                 properties:
     *                   id:
     *                     type: integer
     *                     description: The news ID.
     *                   topic:
     *                     type: string
     *                     description: The topic of the news.
     *                   content_text:
     *                     type: string
     *                     description: The content of the news.
     *                   date_time:
     *                     type: string
     *                     format: date-time
     *                     description: The date and time of the news.
     *       500:
     *         description: An error occurred with the database operation.
     */
    router.get('/news', (req, res) => {
        const query = 'SELECT * FROM `apm-project`.news;';
        connection.query(query, (err, result) => {
            if (err) {
                console.error('Error fetching news:', err);
                res.status(500).send('An error occurred with the database operation.');
            } else {
                res.json(result);
            }
        });
    });

    /**
     * @swagger
     * /api/news/{id}:
     *   get:
     *     tags: [News]
     *     summary: Retrieve specific news by ID
     *     description: Retrieve details of a specific news item by its ID from the database.
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         description: The ID of the news item to retrieve.
     *         schema:
     *           type: integer
     *     responses:
     *       200:
     *         description: Details of the news item.
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 id:
     *                   type: integer
     *                   description: The news ID.
     *                 topic:
     *                   type: string
     *                   description: The topic of the news.
     *                 content_text:
     *                   type: string
     *                   description: The content of the news.
     *                 date_time:
     *                   type: string
     *                   format: date-time
     *                   description: The date and time of the news.
     *       404:
     *         description: News not found.
     *       500:
     *         description: An error occurred with the database operation.
     */
    router.get('/news/:id', (req, res) => {
        const newsId = req.params.id;
        const query = `SELECT * FROM \`apm-project\`.news WHERE id = ?;`;
        connection.query(query, [newsId], (err, result) => {
            if (err) {
                console.error('Error fetching news:', err);
                res.status(500).send('An error occurred with the database operation.');
            } else if (result.length === 0) {
                res.status(404).send('News not found.');
            } else {
                res.json(result[0]);
            }
        });
    });

    /**
     * @swagger
     * /api/news:
     *   post:
     *     tags: [News]
     *     summary: Create a new news item
     *     description: Add a new news item to the database.
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - topic
     *               - content_text
     *             properties:
     *               topic:
     *                 type: string
     *               content_text:
     *                 type: string
     *               picture:
     *                 type: string
     *               remark:
     *                 type: string
     *               date_time:
     *                 type: string
     *                 format: date-time
     *     responses:
     *       201:
     *         description: News item created successfully.
     *       400:
     *         description: Missing required fields.
     *       500:
     *         description: Error adding the news item to the database.
     */
    router.post('/news', (req, res) => {
        const { topic, content_text, picture, remark, date_time } = req.body;
        if (!topic || !content_text) {
            return res.status(400).send('Missing required fields');
        }

        // คำสั่ง SQL สำหรับเพิ่มข่าวใหม่
        const query = `
            INSERT INTO \`apm-project\`.news (topic, content_text, picture, remark, date_time)
            VALUES (?, ?, ?, ?, ?);
        `;
        connection.query(query, [topic, content_text, picture, remark, date_time], (err, result) => {
            if (err) {
                console.error('SQL Error:', err.message);
                res.status(500).send(`Error adding the news item to the database: ${err.message}`);
            } else {
                res.status(201).send({ message: 'News item created successfully', id: result.insertId });
            }
        });
    });

    /**
     * @swagger
     * /api/news/{id}:
     *   put:
     *     tags: [News]
     *     summary: Update a news item by ID
     *     description: Update details of a specific news item by its ID in the database.
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         description: The ID of the news item to update.
     *         schema:
     *           type: integer
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               topic:
     *                 type: string
     *               content_text:
     *                 type: string
     *               picture:
     *                 type: string
     *               remark:
     *                 type: string
     *               date_time:
     *                 type: string
     *                 format: date-time
     *     responses:
     *       200:
     *         description: News item updated successfully.
     *       400:
     *         description: Missing required fields.
     *       404:
     *         description: News item not found.
     *       500:
     *         description: Error updating the news item in the database.
     */
    router.put('/news/:id', (req, res) => {
        const newsId = req.params.id;
        const { topic, content_text, picture, remark, date_time } = req.body;

        // ตรวจสอบว่ามีการส่งข้อมูลที่จำเป็นมาหรือไม่
        if (!topic && !content_text && !picture && !remark && !date_time) {
            return res.status(400).send('No fields provided for update.');
        }

        // สร้างส่วนของคำสั่ง SQL สำหรับการอัปเดต
        let updateFields = [];
        if (topic) updateFields.push(`topic = '${topic}'`);
        if (content_text) updateFields.push(`content_text = '${content_text}'`);
        if (picture) updateFields.push(`picture = '${picture}'`);
        if (remark) updateFields.push(`remark = '${remark}'`);
        if (date_time) updateFields.push(`date_time = '${date_time}'`);

        const query = `
            UPDATE \`apm-project\`.news
            SET ${updateFields.join(', ')}
            WHERE id = ${newsId};
        `;

        connection.query(query, (err, result) => {
            if (err) {
                console.error('SQL Error:', err.message);
                res.status(500).send(`Error updating the news item: ${err.message}`);
            } else if (result.affectedRows === 0) {
                res.status(404).send('News item not found.');
            } else {
                res.status(200).send('News item updated successfully.');
            }
        });
    });

    /**
     * @swagger
     * /api/news/{id}:
     *   delete:
     *     tags: [News]
     *     summary: Delete a news item by ID
     *     description: Remove a specific news item by its ID from the database.
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         description: The ID of the news item to delete.
     *         schema:
     *           type: integer
     *     responses:
     *       200:
     *         description: News item deleted successfully.
     *       404:
     *         description: News item not found.
     *       500:
     *         description: Error deleting the news item from the database.
     */
    router.delete('/news/:id', (req, res) => {
        const newsId = req.params.id;

        const query = `DELETE FROM \`apm-project\`.news WHERE id = ?;`;
        connection.query(query, [newsId], (err, result) => {
            if (err) {
                console.error('SQL Error:', err.message);
                res.status(500).send(`Error deleting the news item: ${err.message}`);
            } else if (result.affectedRows === 0) {
                res.status(404).send('News item not found.');
            } else {
                res.status(200).send('News item deleted successfully.');
            }
        });
    });

    return router;
}
