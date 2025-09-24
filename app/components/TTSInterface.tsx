'use client';

import { useState, useRef, useEffect } from 'react';

interface TTSInterfaceProps {}

// 音色选项配置
const VOICE_OPTIONS = [
  { value: 'cherry', label: '芊悦 (Cherry)', description: '温柔女声' },
  { value: 'ethan', label: '晨煦 (Ethan)', description: '阳光男声' },
  { value: 'nofish', label: '不吃鱼 (Nofish)', description: '活泼女声' },
  { value: 'jennifer', label: '詹妮弗 (Jennifer)', description: '知性女声' },
  { value: 'ryan', label: '甜茶 (Ryan)', description: '温暖男声' },
  { value: 'katerina', label: '卡捷琳娜 (Katerina)', description: '优雅女声' },
  { value: 'elias', label: '墨讲师 (Elias)', description: '专业男声' },
  { value: 'jada', label: '上海-阿珍 (Jada)', description: '上海话女声' },
  { value: 'dylan', label: '北京-晓东 (Dylan)', description: '北京话男声' },
  { value: 'sunny', label: '四川-晴儿 (Sunny)', description: '四川话女声' },
  { value: 'li', label: '南京-老李 (Li)', description: '南京话男声' },
  { value: 'marcus', label: '陕西-秦川 (Marcus)', description: '陕西话男声' },
  { value: 'roy', label: '闽南-阿杰 (Roy)', description: '闽南话男声' },
  { value: 'peter', label: '天津-李彼得 (Peter)', description: '天津话男声' },
  { value: 'rocky', label: '粤语-阿强 (Rocky)', description: '粤语男声' },
  { value: 'kiki', label: '粤语-阿清 (Kiki)', description: '粤语女声' },
  { value: 'eric', label: '四川-程川 (Eric)', description: '四川话男声' },
];

export default function TTSInterface({}: TTSInterfaceProps) {
  const [text, setText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedVoice, setSelectedVoice] = useState('cherry');
  const audioRef = useRef<HTMLAudioElement>(null);

  // 从localStorage加载保存的音色设置
  useEffect(() => {
    const savedVoice = localStorage.getItem('qwen_voice');
    if (savedVoice) {
      setSelectedVoice(savedVoice);
    }
  }, []);

  // 保存音色选择到localStorage
  const handleVoiceChange = (voice: string) => {
    setSelectedVoice(voice);
    localStorage.setItem('qwen_voice', voice);
  };

  const handleTextToSpeech = async () => {
    if (!text.trim()) {
      setError('请输入要转换的文本');
      return;
    }

    // 获取用户设置
    const apiKey = localStorage.getItem('qwen_api_key') || 'sk-36d60931f6704b05babb05a8ba65a98b';
    const model = localStorage.getItem('qwen_model') || 'qwen3-tts-flash';
    const voice = selectedVoice; // 使用当前选择的音色
    const language = localStorage.getItem('qwen_language') || 'Chinese';

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
        },
        body: JSON.stringify({
          text: text.trim(),
          model,
          voice,
          language,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '语音合成失败');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setAudioUrl(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : '语音合成失败');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlay = () => {
    if (audioRef.current) {
      audioRef.current.play();
    }
  };

  const handleDownload = () => {
    if (audioUrl) {
      const a = document.createElement('a');
      a.href = audioUrl;
      a.download = `tts-${Date.now()}.wav`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8">
      <div className="space-y-6">
        {/* 音色选择区域 */}
        <div>
          <label htmlFor="voice-select" className="block text-sm font-medium text-gray-700 mb-2">
            选择音色
          </label>
          <select
            id="voice-select"
            value={selectedVoice}
            onChange={(e) => handleVoiceChange(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            disabled={isLoading}
          >
            {VOICE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label} - {option.description}
              </option>
            ))}
          </select>
          <div className="mt-2 text-sm text-gray-500">
            当前选择: {VOICE_OPTIONS.find(v => v.value === selectedVoice)?.label}
          </div>
        </div>

        {/* 文本输入区域 */}
        <div>
          <label htmlFor="text-input" className="block text-sm font-medium text-gray-700 mb-2">
            输入要转换的文本
          </label>
          <textarea
            id="text-input"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="请输入要转换为语音的文本..."
            className="w-full h-32 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            disabled={isLoading}
          />
          <div className="mt-2 text-sm text-gray-500">
            字符数: {text.length}
          </div>
        </div>

        {/* 控制按钮 */}
        <div className="flex gap-4">
          <button
            onClick={handleTextToSpeech}
            disabled={isLoading || !text.trim()}
            className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                合成中...
              </span>
            ) : (
              '开始合成'
            )}
          </button>
        </div>

        {/* 错误信息 */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* 音频播放区域 */}
        {audioUrl && (
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-800 mb-4">生成的语音</h3>
            <div className="flex items-center gap-4">
              <button
                onClick={handlePlay}
                className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
              >
                播放
              </button>
              <button
                onClick={handleDownload}
                className="bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors"
              >
                下载
              </button>
            </div>
            <audio
              ref={audioRef}
              src={audioUrl}
              controls
              className="w-full mt-4"
            />
          </div>
        )}
      </div>
    </div>
  );
}
