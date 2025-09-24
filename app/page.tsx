'use client';

import { useState } from 'react';
import TTSInterface from './components/TTSInterface';
import SettingsModal from './components/SettingsModal';

export default function Home() {
  const [showSettings, setShowSettings] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Qwen3-TTS 语音合成</h1>
          <p className="text-gray-600">将文本转换为自然流畅的语音</p>
          <button
            onClick={() => setShowSettings(true)}
            className="mt-4 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            设置
          </button>
        </header>
        
        <main>
          <TTSInterface />
        </main>
      </div>
      
      {showSettings && (
        <SettingsModal onClose={() => setShowSettings(false)} />
      )}
    </div>
  );
}
