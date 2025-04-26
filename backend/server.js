const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');
const mongoose = require('mongoose');

const app = express();
const PORT = 3001;

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/deepseek_chat', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// Define schema and model
const chatSchema = new mongoose.Schema({
  prompt: String,
  response: String,
  timestamp: { type: Date, default: Date.now },
});
const Chat = mongoose.model('Chat', chatSchema);

app.use(cors());
app.use(bodyParser.json());

// Handle chat prompt
app.post('/api/chat', async (req, res) => {
  const { prompt } = req.body;

  try {
    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'deepseek-r1:1.5b',
        prompt: prompt,
        stream: false,
      }),
    });

    const data = await response.json();

    // Save to MongoDB
    const chat = new Chat({ prompt, response: data.response });
    await chat.save();

    res.json({ response: data.response });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to connect to Ollama' });
  }
});

// Fetch all previous chats
app.get('/api/history', async (req, res) => {
  try {
    const chats = await Chat.find().sort({ timestamp: 1 }); // oldest to newest
    res.json(chats);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch chat history' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
