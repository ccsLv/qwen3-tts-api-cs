'use client';

import { useState, useEffect } from 'react';

interface SettingsModalProps {
  onClose: () => void;
}

export default function SettingsModal({ onClose }: SettingsModalProps) {
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('qwen3-tts-flash');
  const [voice, setVoice] = useState('cherry');
  const [language, setLanguage] = useState('Chinese');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  useEffect(() => {
    // 从localStorage加载保存的设置
    const savedApiKey = localStorage.getItem('qwen_api_key');
    const savedModel = localStorage.getItem('qwen_model');
    const savedVoice = localStorage.getItem('qwen_voice');
    const savedLanguage = localStorage.getItem('qwen_language');
    
    if (savedApiKey) setApiKey(savedApiKey);
    if (savedModel) setModel(savedModel);
    if (savedVoice) setVoice(savedVoice);
    if (savedLanguage) setLanguage(savedLanguage);
  }, []);

  const handleSave = () => {
    localStorage.setItem('qwen_api_key', apiKey);
    localStorage.setItem('qwen_model', model);
    localStorage.setItem('qwen_voice', voice);
    localStorage.setItem('qwen_language', language);
    onClose();
  };

  const handleTest = async () => {
    if (!apiKey.trim()) {
      setTestResult('请先输入API Key');
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      const response = await fetch('/api/test-tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          apiKey: apiKey.trim(),
          model,
          voice,
          language,
        }),
      });

      if (response.ok) {
        setTestResult('✅ 连接测试成功！API Key有效');
      } else {
        const errorData = await response.json();
        setTestResult(`❌ 测试失败: ${errorData.error || '未知错误'}`);
      }
    } catch (error) {
      setTestResult(`❌ 测试失败: ${error instanceof Error ? error.message : '网络错误'}`);
    } finally {
      setIsTesting(false);
    }
  };

  const voiceOptions = [
    { value: 'cherry', label: 'Cherry (樱桃)' },
    { value: 'alloy', label: 'Alloy (合金)' },
    { value: 'echo', label: 'Echo (回声)' },
    { value: 'fable', label: 'Fable (寓言)' },
    { value: 'onyx', label: 'Onyx (玛瑙)' },
    { value: 'nova', label: 'Nova (新星)' },
    { value: 'shimmer', label: 'Shimmer (闪烁)' },
  ];

  const languageOptions = [
    { value: 'Chinese', label: '中文' },
    { value: 'English', label: '英文' },
    { value: 'Japanese', label: '日文' },
    { value: 'Korean', label: '韩文' },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">TTS 设置</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>

          <div className="space-y-6">
            {/* API Key 设置 */}
            <div>
              <label htmlFor="api-key" className="block text-sm font-medium text-gray-700 mb-2">
                API Key *
              </label>
              <input
                type="password"
                id="api-key"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="请输入您的Qwen3-TTS API Key"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="mt-1 text-sm text-gray-500">
                您的API Key将安全地存储在浏览器本地存储中
              </p>
            </div>

            {/* 模型选择 */}
            <div>
              <label htmlFor="model" className="block text-sm font-medium text-gray-700 mb-2">
                模型
              </label>
              <select
                id="model"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="qwen3-tts-flash">qwen3-tts-flash (快速版)</option>
                <option value="qwen3-tts">qwen3-tts (标准版)</option>
              </select>
            </div>

            {/* 语音选择 */}
            <div>
              <label htmlFor="voice" className="block text-sm font-medium text-gray-700 mb-2">
                语音类型
              </label>
              <select
                id="voice"
                value={voice}
                onChange={(e) => setVoice(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {voiceOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* 语言选择 */}
            <div>
              <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-2">
                语言
              </label>
              <select
                id="language"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {languageOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* 测试连接 */}
            <div>
              <button
                onClick={handleTest}
                disabled={isTesting || !apiKey.trim()}
                className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {isTesting ? '测试中...' : '测试连接'}
              </button>
              {testResult && (
                <div className={`mt-3 p-3 rounded-lg ${
                  testResult.includes('✅') 
                    ? 'bg-green-50 text-green-700 border border-green-200' 
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}>
                  {testResult}
                </div>
              )}
            </div>

            {/* 操作按钮 */}
            <div className="flex gap-4 pt-4">
              <button
                onClick={onClose}
                className="flex-1 bg-gray-300 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-400 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleSave}
                className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                保存设置
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
