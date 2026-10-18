# AI Assistant - API Examples & Testing

## 📝 Example Requests & Responses

### Example 1: Simple Question
**Request**:
```json
{
  "message": "How do I buy an SMS activation number?",
  "conversationHistory": []
}
```

**Response**:
```json
{
  "success": true,
  "message": "To buy an SMS activation number:\n\n1. Log in to your Prime SMS Hub account\n2. Browse available countries and services\n3. Select the SMS service you need\n4. Choose your preferred country\n5. Click 'Buy' and complete payment\n6. You'll receive the number instantly\n7. Wait for the SMS code and enter it\n\nYou can reuse most numbers, and you only pay per activation. Let me know if you need help with any specific country or service!",
  "timestamp": "2026-05-30T08:43:27.647Z"
}
```

### Example 2: Conversation with History
**Request** (second message in conversation):
```json
{
  "message": "What about Facebook numbers?",
  "conversationHistory": [
    {
      "role": "user",
      "parts": [{"text": "How do I buy an SMS activation number?"}]
    },
    {
      "role": "model",
      "parts": [{"text": "To buy an SMS activation number:\n\n1. Log in to your Prime SMS Hub account\n2. Browse available countries and services\n3. Select the SMS service you need\n4. Choose your preferred country\n5. Click 'Buy' and complete payment\n6. You'll receive the number instantly\n7. Wait for the SMS code and enter it\n\nYou can reuse most numbers, and you only pay per activation. Let me know if you need help with any specific country or service!"}]
    }
  ]
}
```

**Response**:
```json
{
  "success": true,
  "message": "Facebook numbers are one of our most popular services! Here's what you need to know:\n\n**Availability**: Facebook SMS codes are available in most countries worldwide.\n\n**Process**:\n1. Select \"Facebook\" from the services list\n2. Choose your preferred country\n3. Purchase the number\n4. You'll receive a unique SMS number\n5. Enter this number when creating or verifying your Facebook account\n6. Wait for the SMS verification code\n7. Enter the code in your Prime SMS Hub account to receive it\n\n**Pricing**: Varies by country, typically $1-3 per activation\n\n**Tips**:\n- Lower prices are usually in Asian countries\n- European numbers tend to be more expensive\n- You can use one number multiple times if available for reuse\n\nWould you like to know about prices in a specific country?",
  "timestamp": "2026-05-30T08:43:35.892Z"
}
```

### Example 3: Error Response (Missing API Key)
**Response**:
```json
{
  "error": "AI service not configured",
  "details": "GOOGLE_AI_API_KEY not found in environment variables"
}
```

### Example 4: Error Response (Invalid Input)
**Request**:
```json
{
  "message": "",
  "conversationHistory": []
}
```

**Response**:
```json
{
  "error": "Message is required and must be a string"
}
```

## 🧪 Testing with cURL

### Test 1: Basic Message
```bash
curl -X POST http://localhost:5000/api/ai-chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Hello, what services do you offer?"
  }'
```

### Test 2: With Conversation History
```bash
curl -X POST http://localhost:5000/api/ai-chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Can you provide a discount?",
    "conversationHistory": [
      {
        "role": "user",
        "parts": [{"text": "What is your pricing?"}]
      },
      {
        "role": "model",
        "parts": [{"text": "Our pricing varies by country and service. Asian countries typically range from $0.50-$1.50 per activation, while European numbers are $1-$5. We also offer bulk discounts for corporate users."}]
      }
    ]
  }'
```

### Test 3: Long Conversation
```bash
curl -X POST http://localhost:5000/api/ai-chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "I cannot receive the SMS code. What should I do?",
    "conversationHistory": [
      {"role": "user", "parts": [{"text": "I want to buy a US number"}]},
      {"role": "model", "parts": [{"text": "Great choice! US numbers are available for many services. They typically cost $2-$4 per activation depending on the service. Popular options include WhatsApp, Telegram, and various apps requiring US verification."}]},
      {"role": "user", "parts": [{"text": "I bought a Facebook number"}]},
      {"role": "model", "parts": [{"text": "Excellent! Here is your process: 1) Log into Facebook with your account details 2) Choose \"I cannot access this\" on the login page 3) Complete identity verification 4) Use your SMS number to receive the code from Prime SMS Hub"}]}
    ]
  }'
```

## 🧪 Testing with JavaScript/Fetch

```javascript
// Test from browser console
async function testAI() {
  try {
    const response = await fetch('/api/ai-chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: "Tell me about your SMS services",
        conversationHistory: []
      })
    });
    
    const data = await response.json();
    console.log('AI Response:', data);
    return data;
  } catch (error) {
    console.error('Error:', error);
  }
}

testAI();
```

## 📊 Response Time Expectations

| Scenario | Expected Time |
|----------|----------------|
| Simple question | 1-3 seconds |
| Complex query | 2-5 seconds |
| With history (5+ messages) | 2-4 seconds |
| Network latency | 0.5-1 second |
| **Total typical response** | **2-6 seconds** |

## ⚠️ Common Issues & Solutions

### Issue: Timeout (>10 seconds)
- **Cause**: Slow network or API rate limiting
- **Solution**: Reduce question length, check internet connection

### Issue: Empty message
- **Cause**: API key invalid or expired
- **Solution**: Verify API key at https://aistudio.google.com

### Issue: Repeated answers
- **Cause**: Same context repeated
- **Solution**: Clear conversation history and start fresh

### Issue: Off-topic responses
- **Cause**: System prompt not being respected
- **Solution**: Check backend system prompt, ensure it's loaded correctly

## 🔍 Monitoring & Debugging

### Check Backend Logs
```bash
# Watch backend output
tail -f logs/backend.log | grep "AI chat"
```

### Monitor API Calls
```javascript
// In backend server.js, add logging:
console.log(`📨 AI Request:`, { message, historyLength: conversationHistory?.length || 0 });
```

### Test Endpoint Health
```bash
# Check if endpoint responds
curl -I http://localhost:5000/api/ai-chat

# Should return 405 (method not allowed for GET)
# This confirms endpoint exists
```

## 📈 Load Testing

### Simple Load Test (5 concurrent requests)
```bash
for i in {1..5}; do
  curl -X POST http://localhost:5000/api/ai-chat \
    -H "Content-Type: application/json" \
    -d '{"message": "Hello"}' &
done
wait
```

### Stress Test (check rate limiting)
```bash
# This will show if rate limiting kicks in
ab -n 100 -c 10 -p request.json http://localhost:5000/api/ai-chat
```
(Requires `request.json` file with JSON body)

## 🎯 Quality Assurance Checklist

- [ ] API key configured in .env
- [ ] Backend server restarted
- [ ] Endpoint returns 200 for valid requests
- [ ] Responses contain message field
- [ ] Error handling works (test with empty message)
- [ ] Conversation history is preserved
- [ ] Response time under 6 seconds
- [ ] Button appears in UI
- [ ] Modal opens/closes correctly
- [ ] Messages display correctly
- [ ] Input field clears after sending
- [ ] Loading indicator shows during request
- [ ] Error messages display properly

## 📚 API Rate Limits

Google's Generative AI free tier includes:
- **Requests per minute**: 60 RPM
- **Requests per day**: Generous daily quota
- **Max concurrent**: ~5
- **Token limits**: Based on model (Gemini Pro: 30k input, 8k output)

Contact Google for production rate limit increases.

---

**All tests should pass before deploying to production!** ✅
