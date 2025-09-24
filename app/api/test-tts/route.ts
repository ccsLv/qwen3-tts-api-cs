import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { apiKey, model, voice, language } = await request.json();

    if (!apiKey || typeof apiKey !== 'string') {
      return NextResponse.json(
        { error: 'Please provide a valid API Key' },
        { status: 400 }
      );
    }

    // Use English test text to avoid encoding issues
    const testText = 'Hello, this is a test message for TTS verification.';
    
    const requestBody = {
      model: model || 'qwen3-tts-flash',
      input: {
        text: testText,
      },
      parameters: {
        voice: voice || 'cherry',
        language_type: language || 'English',
      },
    };
    
    // Use the correct API endpoint
    const apiUrl = 'https://dashscope.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation';
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `API request failed: ${response.status}`);
    }

    // If request successful, API Key is valid
    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('TTS Test Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'API test failed' },
      { status: 500 }
    );
  }
}