import React, { useState } from 'react';
import { mockAiMessages } from '../utils/mockData';

export default function AiGenerator() {
  const [messages, setMessages] = useState(mockAiMessages);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [generatedText, setGeneratedText] = useState('');
  const [tone, setTone] = useState('professional');
  const [length, setLength] = useState('medium');

  const handleGenerateMessage = () => {
    const templates = {
      professional: 'Hi {name}, I hope this message finds you well...',
      casual: 'Hey {name}, quick question about {company}...',
      urgent: 'Hi {name}, I wanted to reach out urgently about...',
    };

    const lengths = {
      short: ' Let me know what you think.',
      medium: ' I think this could be a great fit for your team. Let me know your thoughts.',
      long: ' I\'ve been following {company}\'s growth and I really admire what you\'re building. I think we could add tremendous value. Would love to chat soon.',
    };

    setGeneratedText(templates[tone] + lengths[length]);
  };

  const handleCopyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-text-primary mb-2">AI Message Generator</h1>
        <p className="text-text-secondary">Generate personalized outreach messages powered by AI</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Generator Panel */}
        <div className="lg:col-span-2 space-y-4">
          {/* Input Section */}
          <div className="bg-bg-card border border-border-card rounded-xl p-6">
            <h3 className="text-lg font-bold text-text-primary mb-4">Generate Message</h3>

            <div className="space-y-4">
              {/* Tone Selection */}
              <div>
                <label className="block text-text-secondary text-sm font-semibold mb-2">Tone</label>
                <div className="grid grid-cols-3 gap-2">
                  {['professional', 'casual', 'urgent'].map((t) => (
                    <button
                      key={t}
                      onClick={() => setTone(t)}
                      className={`px-4 py-2 rounded-lg font-semibold transition ${
                        tone === t
                          ? 'bg-accent text-text-inverse'
                          : 'bg-bg-card-hover text-text-secondary hover:bg-border-card'
                      }`}
                    >
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Length Selection */}
              <div>
                <label className="block text-text-secondary text-sm font-semibold mb-2">Length</label>
                <div className="grid grid-cols-3 gap-2">
                  {['short', 'medium', 'long'].map((l) => (
                    <button
                      key={l}
                      onClick={() => setLength(l)}
                      className={`px-4 py-2 rounded-lg font-semibold transition ${
                        length === l
                          ? 'bg-accent text-text-inverse'
                          : 'bg-bg-card-hover text-text-secondary hover:bg-border-card'
                      }`}
                    >
                      {l.charAt(0).toUpperCase() + l.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Context Fields */}
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Lead Name"
                  className="px-4 py-2 bg-bg-card-hover border border-border-card rounded-lg text-text-primary placeholder-text-muted"
                  defaultValue="John Smith"
                />
                <input
                  type="text"
                  placeholder="Company"
                  className="px-4 py-2 bg-bg-card-hover border border-border-card rounded-lg text-text-primary placeholder-text-muted"
                  defaultValue="TechCorp"
                />
              </div>

              <textarea
                placeholder="Add additional context..."
                className="w-full px-4 py-2 bg-bg-card-hover border border-border-card rounded-lg text-text-primary placeholder-text-muted h-24 resize-none"
                defaultValue="They are looking to expand their marketing team..."
              />

              <button
                onClick={handleGenerateMessage}
                className="w-full px-6 py-3 bg-accent hover:bg-accent-hover text-text-inverse font-bold rounded-lg transition"
              >
                ✨ Generate Message
              </button>
            </div>
          </div>

          {/* Generated Message */}
          {generatedText && (
            <div className="bg-bg-card border border-accent/30 rounded-xl p-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-bold text-text-primary">Generated Message</h3>
                <button
                  onClick={() => handleCopyToClipboard(generatedText)}
                  className="px-3 py-1 bg-bg-card-hover hover:bg-border-card text-text-primary text-sm rounded transition"
                >
                  Copy
                </button>
              </div>
              <p className="text-text-secondary leading-relaxed">{generatedText}</p>
              <div className="flex gap-2 mt-4">
                <button
                  onClick={handleGenerateMessage}
                  className="flex-1 px-3 py-2 bg-bg-card-hover hover:bg-border-card text-text-primary font-semibold rounded-lg transition text-sm"
                >
                  Regenerate
                </button>
                <button className="flex-1 px-3 py-2 bg-accent hover:bg-accent-hover text-text-inverse font-semibold rounded-lg transition text-sm">
                  Use This
                </button>
              </div>
            </div>
          )}

          {/* Tips */}
          <div className="bg-bg-card-hover border border-border-card rounded-xl p-6">
            <h4 className="font-semibold text-text-primary mb-3">Tips for Better Results</h4>
            <ul className="text-text-secondary text-sm space-y-2">
              <li>• Provide specific context about the lead or company</li>
              <li>• Use personalization variables like {'{name}'} and {'{company}'}</li>
              <li>• Match the tone to your brand voice</li>
              <li>• Review and edit AI-generated content before sending</li>
            </ul>
          </div>
        </div>

        {/* Templates Sidebar */}
        <div className="bg-bg-card border border-border-card rounded-xl p-6 h-fit">
          <h3 className="text-lg font-bold text-text-primary mb-4">Templates</h3>
          <div className="space-y-2">
            {messages.map((msg) => (
              <button
                key={msg.id}
                onClick={() => setSelectedMessage(msg)}
                className={`w-full text-left p-3 rounded-lg transition border ${
                  selectedMessage?.id === msg.id
                    ? 'bg-accent-soft border-accent/50'
                    : 'bg-bg-card-hover border-border-card hover:border-border-strong'
                }`}
              >
                <p className="font-semibold text-text-primary text-sm">{msg.template}</p>
                <p className="text-text-muted text-xs mt-1 line-clamp-1">{msg.subject}</p>
              </button>
            ))}
          </div>

          <button className="w-full mt-4 px-4 py-2 bg-bg-card-hover hover:bg-border-card border border-border-card text-text-primary font-semibold rounded-lg transition text-sm">
            + New Template
          </button>
        </div>
      </div>
    </div>
  );
}
