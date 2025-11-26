import express from 'express';
import cors from 'cors';
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

function getProjectsData()
{
    try
    {
        const filePath = join(__dirname, 'data', 'projects.json');
        const data = readFileSync(filePath, 'utf8');
        return JSON.parse(data);
    }
    catch (error)
    {
        console.log('Error reading projects:', error);
        return [];
    }
}

function getMessagesData()
{
    try
    {
        const filePath = join(__dirname, 'data', 'messages.json');
        const data = readFileSync(filePath, 'utf8');
        return JSON.parse(data);
    }
    catch (error)
    {
        console.log('Error reading messages:', error);
        return [];
    }
}

function saveMessagesData(messages)
{
    try
    {
        const filePath = join(__dirname, 'data', 'messages.json');
        writeFileSync(filePath, JSON.stringify(messages, null, 2), 'utf8');
    }
    catch (error)
    {
        console.log('Error saving messages:', error);
        throw error;
    }
}

function sanitizeInput(input)
{
    if (typeof input !== 'string')
    {
        return '';
    }
    return input.trim().replace(/[<>]/g, '');
}

app.get('/api/projects', (req, res) => {
    try
    {
        const projects = getProjectsData();
        console.log(`Returning ${projects.length} projects`);
        res.json(projects);
    }
    catch (error)
    {
        console.log('Error getting projects:', error.message);
        res.status(500).json({ error: 'Could not get projects: ' + error.message });
    }
});

app.get('/api/weather', async (req, res) => {
    try
    {
        const city = req.query.city || 'Halifax';
        const apiKey = '07216e07f2e6e4ff2bc1009e81b1e9df';

        const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
        
        console.log(`Fetching weather for ${city}...`);
        const response = await fetch(url);

        if (!response.ok)
        {
            const errorData = await response.json().catch(() => ({}));
            console.log('Weather API error:', response.status, errorData);
            
            if (response.status === 401)
            {
                return res.status(500).json({ error: 'Invalid API key' });
            }
            if (response.status === 404)
            {
                return res.status(404).json({ error: 'City not found' });
            }
            return res.status(500).json({ error: `Weather API error: ${response.status}` });
        }

        const data = await response.json();
        
        const weatherData = {
            city: data.name,
            temperature: Math.round(data.main.temp),
            humidity: data.main.humidity,
            description: data.weather[0].description,
            country: data.sys.country
        };

        console.log('Weather data fetched successfully');
        res.json(weatherData);
    }
    catch (error)
    {
        console.log('Error fetching weather:', error.message);
        res.status(500).json({ error: 'Could not get weather: ' + error.message });
    }
});

app.post('/api/contact', (req, res) => {
    try
    {
        const { name, email, subject, message } = req.body;

        if (!name || !email || !subject || !message)
        {
            return res.status(400).json({ error: 'All fields are required' });
        }

        const sanitizedData = {
            name: sanitizeInput(name),
            email: sanitizeInput(email),
            subject: sanitizeInput(subject),
            message: sanitizeInput(message)
        };

        const messages = getMessagesData();
        messages.push(sanitizedData);
        saveMessagesData(messages);

        res.json({ success: true, message: 'Message saved successfully' });
    }
    catch (error)
    {
        console.log('Error saving message:', error);
        res.status(500).json({ error: 'Failed to save message' });
    }
});

app.get('/api/messages', (req, res) => {
    try
    {
        const messages = getMessagesData();
        res.json(messages);
    }
    catch (error)
    {
        console.log('Error getting messages:', error);
        res.status(500).json({ error: 'Failed to get messages' });
    }
});

app.use('/api/*', (req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`API endpoints:`);
    console.log(`  - http://localhost:${PORT}/api/projects`);
    console.log(`  - http://localhost:${PORT}/api/weather?city=Halifax`);
    console.log(`  - http://localhost:${PORT}/api/contact (POST)`);
    console.log(`  - http://localhost:${PORT}/api/messages (GET)`);
});

