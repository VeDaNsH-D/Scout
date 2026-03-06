import React, { useState } from 'react';
import { mockSettings } from '../utils/mockData';

export default function Settings() {
  const [settings, setSettings] = useState(mockSettings);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleSettingChange = (section, key, value) => {
    setSettings({
      ...settings,
      [section]: {
        ...settings[section],
        [key]: value,
      },
    });
  };

  const handleNotificationChange = (key, value) => {
    handleSettingChange('notifications', key, value);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-text-primary mb-2">Settings</h1>
        <p className="text-text-secondary">Manage your account and preferences</p>
      </div>

      {/* Save Notification */}
      {saved && (
        <div className="p-4 bg-green-500/20 border border-green-500/50 rounded-lg text-green-300 text-sm">
          ✓ Settings saved successfully
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1 space-y-2">
          {['Profile', 'API', 'Notifications', 'Billing', 'Team'].map((section) => (
            <button
              key={section}
              className="w-full text-left px-4 py-3 rounded-lg hover:bg-bg-card transition text-text-primary font-semibold"
            >
              {section}
            </button>
          ))}
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Settings */}
          <div className="bg-bg-card border border-border-card rounded-xl p-6">
            <h2 className="text-2xl font-bold text-text-primary mb-6">Profile Settings</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-text-secondary text-sm font-semibold mb-2">Company Name</label>
                <input
                  type="text"
                  value={settings.profile.name}
                  onChange={(e) => handleSettingChange('profile', 'name', e.target.value)}
                  className="w-full px-4 py-2 bg-bg-card-hover border border-border-card rounded-lg text-text-primary placeholder-text-muted"
                />
              </div>

              <div>
                <label className="block text-text-secondary text-sm font-semibold mb-2">Email Address</label>
                <input
                  type="email"
                  value={settings.profile.email}
                  onChange={(e) => handleSettingChange('profile', 'email', e.target.value)}
                  className="w-full px-4 py-2 bg-bg-card-hover border border-border-card rounded-lg text-text-primary placeholder-text-muted"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-text-secondary text-sm font-semibold mb-2">Timezone</label>
                  <select
                    value={settings.profile.timezone}
                    onChange={(e) => handleSettingChange('profile', 'timezone', e.target.value)}
                    className="w-full px-4 py-2 bg-bg-card-hover border border-border-card rounded-lg text-text-primary"
                  >
                    <option>EST</option>
                    <option>CST</option>
                    <option>MST</option>
                    <option>PST</option>
                  </select>
                </div>

                <div>
                  <label className="block text-text-secondary text-sm font-semibold mb-2">Language</label>
                  <select
                    value={settings.profile.language}
                    onChange={(e) => handleSettingChange('profile', 'language', e.target.value)}
                    className="w-full px-4 py-2 bg-bg-card-hover border border-border-card rounded-lg text-text-primary"
                  >
                    <option>English</option>
                    <option>Spanish</option>
                    <option>French</option>
                  </select>
                </div>
              </div>

              <button
                onClick={handleSave}
                className="px-6 py-2 bg-accent hover:bg-accent-hover text-text-inverse font-semibold rounded-lg transition"
              >
                Save Profile
              </button>
            </div>
          </div>

          {/* API Settings */}
          <div className="bg-bg-card border border-border-card rounded-xl p-6">
            <h2 className="text-xl font-bold text-text-primary mb-6">API Configuration</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-text-secondary text-sm font-semibold mb-2">API Key</label>
                <div className="flex gap-2">
                  <input
                    type="password"
                    value={settings.api.apiKey}
                    readOnly
                    className="flex-1 px-4 py-2 bg-bg-card-hover border border-border-card rounded-lg text-text-primary"
                  />
                  <button className="px-4 py-2 bg-bg-card-hover hover:bg-border-card border border-border-card text-text-primary rounded-lg transition">
                    Copy
                  </button>
                </div>
              </div>

              <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg text-blue-300 text-sm">
                Last reset: {settings.api.lastReset}
              </div>

              <button className="px-6 py-2 bg-bg-card-hover hover:bg-border-card border border-border-card text-text-primary font-semibold rounded-lg transition">
                Regenerate API Key
              </button>

              <div className="pt-4 border-t border-border-subtle">
                <a href="#" className="text-accent hover:text-accent-hover text-sm font-semibold">
                  View API Documentation →
                </a>
              </div>
            </div>
          </div>

          {/* Notification Settings */}
          <div className="bg-bg-card border border-border-card rounded-xl p-6">
            <h2 className="text-xl font-bold text-text-primary mb-6">Notification Preferences</h2>

            <div className="space-y-3">
              {Object.entries(settings.notifications).map(([key, value]) => (
                <label key={key} className="flex items-center gap-3 p-3 hover:bg-bg-card-hover rounded-lg transition cursor-pointer">
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={(e) => handleNotificationChange(key, e.target.checked)}
                    className="w-4 h-4 rounded border-border-card bg-bg-card-hover cursor-pointer"
                  />
                  <span className="text-text-primary font-medium">
                    {key === 'emailNotifications'
                      ? 'Email Notifications'
                      : key === 'campaignUpdates'
                      ? 'Campaign Updates'
                      : 'Weekly Digest'}
                  </span>
                </label>
              ))}
            </div>

            <button
              onClick={handleSave}
              className="mt-4 px-6 py-2 bg-accent hover:bg-accent-hover text-text-inverse font-semibold rounded-lg transition"
            >
              Save Preferences
            </button>
          </div>

          {/* Danger Zone */}
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6">
            <h2 className="text-xl font-bold text-red-300 mb-4">Danger Zone</h2>

            <div className="space-y-3">
              <button className="w-full px-6 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 text-red-300 font-semibold rounded-lg transition">
                Download My Data
              </button>
              <button className="w-full px-6 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 text-red-300 font-semibold rounded-lg transition">
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
