// server.js
const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Сохранение конфигурации виджета
app.post('/api/widgets', async (req, res) => {
    try {
        const { widgetId, config } = req.body;
        
        if (!widgetId || !config) {
            return res.status(400).json({ error: 'Widget ID and config required' });
        }
        
        const configPath = path.join(__dirname, 'configs', `${widgetId}.json`);
        await fs.writeFile(configPath, JSON.stringify(config, null, 2));
        
        res.json({ success: true, widgetId });
    } catch (error) {
        console.error('Error saving widget:', error);
        res.status(500).json({ error: 'Failed to save widget configuration' });
    }
});

// Получение конфигурации виджета
app.get('/api/config/:widgetId', async (req, res) => {
    try {
        const configPath = path.join(__dirname, 'configs', `${req.params.widgetId}.json`);
        const config = await fs.readFile(configPath, 'utf8');
        
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Cache-Control', 'public, max-age=300');
        res.json(JSON.parse(config));
    } catch (error) {
        res.status(404).json({ error: 'Widget configuration not found' });
    }
});

app.listen(3000, () => {
    console.log('Widget API running on port 3000');
});
