# AI Assistant Setup Guide

## Overview
The Prime SMS Hub now includes an AI Assistant powered by Google's Generative AI (Gemini). The assistant helps users with customer support, SMS management guidance, and general app questions.

## Setup Instructions

### 1. Get Google AI Studio API Key

1. Go to [Google AI Studio](https://aistudio.google.com)
2. Sign in with your Google account
3. Click "Get API Key"
4. Create a new API key or use an existing one
5. Copy the API key

### 2. Add to Environment Variables

In your backend `.env` file, add:

```env
GOOGLE_AI_API_KEY=your_api_key_here
```

### 3. Features

The AI Assistant modal provides:
- **Chat Interface**: Click the 🤖 button in the bottom-right corner to open
- **Conversation History**: Messages are maintained during a session
- **Clear History**: Use the 🔄 button to start a fresh conversation
- **Helpful Responses**: AI is trained to help with SMS services, account issues, and general questions

### 4. Security

- **API Key Storage**: The API key is stored **only on the backend** in `.env` - never exposed to clients
- **Request Proxying**: All API requests are proxied through your backend at `/api/ai-chat`
- **Authentication**: Future versions can add Firebase authentication to `/api/ai-chat`

### 5. API Endpoint

**Route**: `POST /api/ai-chat`

**Request Body**:
```json
{
  "message": "User's question",
  "conversationHistory": [
    { "role": "user", "parts": [{ "text": "previous message" }] },
    { "role": "model", "parts": [{ "text": "AI response" }] }
  ]
}
```

**Response**:
```json
{
  "success": true,
  "message": "AI's response text",
  "timestamp": "2026-05-30T08:43:27.647Z"
}
```

### 6. Customization

**To change the AI behavior**, edit the `systemPrompt` in `backend/server.js`:

```javascript
const systemPrompt = `You are a helpful AI assistant for Prime SMS Hub...`;
```

**To adjust response length**, modify `maxOutputTokens` (default: 500):

```javascript
generationConfig: {
  maxOutputTokens: 1000,  // Increase for longer responses
  temperature: 0.7,       // Adjust creativity (0-1)
},
```

### 7. Cost Considerations

- Google's Generative AI free tier includes generous limits
- Monitor usage at [Google AI Studio](https://aistudio.google.com)
- Set up billing alerts if needed

### 8. Troubleshooting

**"AI service not configured"**
- Ensure `GOOGLE_AI_API_KEY` is set in backend `.env`
- Restart the backend server

**"Failed to process AI request"**
- Check API key validity
- Verify network connectivity
- Check backend logs for detailed errors

**"Empty or slow responses"**
- Check API rate limits
- Verify internet connection
- Try shorter, more specific questions

## Frontend Component

Location: `src/components/AIAssistant.jsx`

Features:
- Modal-based UI (triggered by button)
- Auto-scrolling message list
- Loading state with typing indicator
- Error handling and recovery
- Responsive design for mobile/tablet

## Backend Integration

Location: `backend/server.js`

- Uses `@google/generative-ai` package
- Integrates with existing Express server
- No additional dependencies required

## Next Steps (Optional)

1. **Message Persistence**: Store conversations in Firestore
2. **User Context**: Include user data (balance, purchases) in system prompt
3. **Rate Limiting**: Add request throttling per user
4. **Analytics**: Track most-asked questions
5. **Feedback Loop**: Let users rate AI responses
