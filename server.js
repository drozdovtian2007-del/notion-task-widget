const express = require('express');
const app = express();

app.use(express.json());

const NOTION_TOKEN = (process.env.NOTION_TOKEN || '').trim();
const PAGE_ID = (process.env.PAGE_ID || '').trim();

console.log('Server starting with PAGE_ID:', PAGE_ID, 'length:', PAGE_ID.length);

app.post('/add-task', async (req, res) => {
  try {
    const { task } = req.body;

    if (!task) {
      return res.status(400).json({ error: 'Task text is required' });
    }

    const time = new Date().toLocaleTimeString('ru-RU', {
      timeZone: 'Asia/Yekaterinburg',
      hour: '2-digit',
      minute: '2-digit'
    });
    const taskText = `${task} — ${time}`;

    const notionPayload = {
      children: [
        {
          object: 'block',
          type: 'to_do',
          to_do: {
            rich_text: [
              {
                type: 'text',
                text: { content: taskText }
              }
            ],
            checked: false
          }
        }
      ]
    };

    const response = await fetch(`https://api.notion.com/v1/blocks/${PAGE_ID}/children`, {
      method: 'PATCH',
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
      return res.status(500).json({ error: 'Failed to add task to Notion', details: error });
    }

    res.json({ success: true, message: 'Задача добавлена ✓' });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
