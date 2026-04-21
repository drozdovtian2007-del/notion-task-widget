const express = require('express');
const app = express();

app.use(express.json());

const NOTION_TOKEN = process.env.NOTION_TOKEN;
const DATABASE_ID = process.env.DATABASE_ID;

app.post('/add-task', async (req, res) => {
  try {
    const { task } = req.body;

    if (!task) {
      return res.status(400).json({ error: 'Task text is required' });
    }

    const today = new Date().toISOString().split('T')[0];
    const time = new Date().toLocaleTimeString('ru-RU');

    const notionPayload = {
      parent: { database_id: DATABASE_ID },
      properties: {
        "Задача": {
          title: [{ text: { content: task } }]
        },
        "Статус": { checkbox: false },
        "Дата создания": { date: { start: today } },
        "Время создания": { rich_text: [{ text: { content: time } }] }
      }
    };

    const response = await fetch('https://api.notion.com/v1/pages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${NOTION_TOKEN}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(notionPayload)
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Notion API error:', error);
      return res.status(500).json({ error: 'Failed to add task to Notion' });
    }

    res.json({ success: true, message: 'Задача добавлена ✓' });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
