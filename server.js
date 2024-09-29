import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors({
    origin: '*', // 允许所有来源，仅用于开发环境
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

const API_KEY = process.env.BAIDU_API_KEY;
const SECRET_KEY = process.env.BAIDU_SECRET_KEY;

async function getAccessToken() {
    const url = `https://aip.baidubce.com/oauth/2.0/token?grant_type=client_credentials&client_id=${API_KEY}&client_secret=${SECRET_KEY}`;
    try {
        const response = await fetch(url, { method: 'POST' });
        const data = await response.json();
        console.log('Access token response:', data);
        if (!data.access_token) {
            console.error('Failed to get access token:', data);
            throw new Error('Failed to get access token');
        }
        return data.access_token;
    } catch (error) {
        console.error('Error getting access token:', error);
        throw error;
    }
}

app.post('/chat', async (req, res) => {
    try {
        console.log('Received message:', req.body.message);
        if (!req.body.message) {
            throw new Error('No message provided');
        }
        const accessToken = await getAccessToken();
        const apiUrl = 'https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop/chat/eb-instant';
        
        const response = await fetch(`${apiUrl}?access_token=${accessToken}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                messages: [{ role: "user", content: req.body.message }]
            })
        });

        if (!response.ok) {
            throw new Error(`API responded with status ${response.status}`);
        }

        const data = await response.json();
        console.log('API response:', JSON.stringify(data, null, 2));

        if (data.error_code) {
            throw new Error(`API error: ${data.error_msg}`);
        }

        if (!data.result) {
            throw new Error('Empty response from API');
        }

        res.json({ response: data.result });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'An error occurred', details: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));