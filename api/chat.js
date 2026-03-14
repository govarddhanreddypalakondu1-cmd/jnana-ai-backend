// api/chat.js - Smart Soil Intelligence Backend
import { GoogleGenerativeAI } from '@google/generative-ai';
import cors from 'cors';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// CORS middleware
const corsHandler = cors({
  origin: '*',
  methods: ['POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type']
});

export default async function handler(req, res) {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only POST allowed
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      error: 'Method not allowed. Use POST.' 
    });
  }

  try {
    const { prompt, soilData } = req.body;

    // Smart Soil Intelligence Prompt
    const fullPrompt = `
    You are Jnana AI - Smart Soil Intelligence System.
    
    Soil Data: ${JSON.stringify(soilData || {})}
    Farmer Query: ${prompt}
    
    Provide:
    1. Crop recommendations (top 3)
    2. Irrigation schedule
    3. Fertilizer dosage (kg/acre)
    4. pH adjustment advice
    
    Format as JSON: {crops: [], irrigation: "", fertilizer: "", phAdvice: ""}
    `;

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(fullPrompt);
    
    const response = await result.response.text();
    
    res.status(200).json({
      success: true,
      response: response,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Gemini Error:', error);
    res.status(500).json({
      success: false,
      error: 'AI service unavailable',
      details: error.message
    });
  }
}
