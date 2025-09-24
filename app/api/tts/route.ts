import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { text, model, voice, language } = await request.json();

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Please provide valid text content' },
        { status: 400 }
      );
    }

    // Get API Key from request header
    const apiKey = request.headers.get('x-api-key') || 'sk-36d60931f6704b05babb05a8ba65a98b';
    
    // Call Qwen3-TTS API - 使用正确的参数格式
    const requestBody = {
      model: model || 'qwen3-tts-flash',
      input: {
        text: text,
        voice: voice || 'cherry',  // 将voice参数移到input中
      },
      parameters: {
        language_type: language || 'Chinese',
      },
    };
    
    // 添加调试信息
    console.log('TTS Request Body:', JSON.stringify(requestBody, null, 2));
    console.log('Selected Voice:', voice);
    
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

    // Check if response is JSON (contains audio URL) or binary audio data
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      // API returned JSON with audio URL
      const result = await response.json();
      console.log('API Response:', JSON.stringify(result, null, 2));
      
      if (result.output && result.output.audio && result.output.audio.url) {
        // Fetch the audio file from the URL
        const audioUrl = result.output.audio.url;
        console.log('Audio URL:', audioUrl);
        
        const audioResponse = await fetch(audioUrl);
        if (!audioResponse.ok) {
          throw new Error(`Failed to fetch audio file: ${audioResponse.status}`);
        }
        const audioBuffer = await audioResponse.arrayBuffer();
        
        return new NextResponse(audioBuffer, {
          headers: {
            'Content-Type': 'audio/wav',
            'Content-Disposition': 'attachment; filename="tts-output.wav"',
          },
        });
      } else if (result.output && result.output.audio_url) {
        // Alternative field name
        const audioUrl = result.output.audio_url;
        console.log('Audio URL (alternative):', audioUrl);
        
        const audioResponse = await fetch(audioUrl);
        if (!audioResponse.ok) {
          throw new Error(`Failed to fetch audio file: ${audioResponse.status}`);
        }
        const audioBuffer = await audioResponse.arrayBuffer();
        
        return new NextResponse(audioBuffer, {
          headers: {
            'Content-Type': 'audio/wav',
            'Content-Disposition': 'attachment; filename="tts-output.wav"',
          },
        });
      } else {
        console.log('No audio URL found in response');
        throw new Error('No audio data in API response');
      }
    } else {
      // API returned binary audio data directly
      const audioBuffer = await response.arrayBuffer();
      
      return new NextResponse(audioBuffer, {
        headers: {
          'Content-Type': 'audio/wav',
          'Content-Disposition': 'attachment; filename="tts-output.wav"',
        },
      });
    }

  } catch (error) {
    console.error('TTS API Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Speech synthesis failed' },
      { status: 500 }
    );
  }
}