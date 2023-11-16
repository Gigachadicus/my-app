const express = require('express');
const { MongoClient } = require('mongodb');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json({ limit: '10mb' }));
app.use(cors());

const port = 5000;

const mongoURL =
  'mongodb+srv://pes1202201377:lisanlisan@cluster0.buvuxr1.mongodb.net/wwt-project?retryWrites=true&w=majority';

// Define the POST API endpoint
app.post('/saveContent', async (req, res) => {
  const { title, content, image, date, username, likes } = req.body;
  if (!title || !content || !date || !username) {
    return res.status(400).json({ message: 'Title, content, date, and username are required fields.' });
  }
  try {
    const client = await MongoClient.connect(mongoURL, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
    });
    const db = client.db();
    const collectionName = username;

    // Check if collection exists, create if it doesn't
    const collectionExists = await db.listCollections({ name: collectionName }).hasNext();
    if (!collectionExists) {
      await db.createCollection(collectionName);
      console.log('Created new collection');
    }
    const collection = db.collection(collectionName);
    const newContent = {
      title: title,
      content: content,
      image: image,
      date: new Date(date),
      username: username,
      likes: likes || 0,
    };

    console.log('Received POST request data:', req.body);
    await collection.insertOne(newContent);
    console.log('Inserted data into collection');
    res.status(200).json({ message: 'Data inserted successfully' });
  } catch (error) {
    console.error('Error inserting data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
