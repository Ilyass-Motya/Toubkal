import React, { useState, useEffect } from 'react'
import { Shield, Settings, Brain, Eye, Save, RotateCcw, CheckCircle, AlertCircle, Info } from 'lucide-react'

// Types for settings
interface ToubkalSettings {
  // Privacy Settings
  fingerprintingProtection: boolean
  trackerBlocking: boolean
  enhancedPrivacy: boolean
  auditLogging: boolean
  
  // Security Settings
  httpsEverywhere: boolean
  safeBrowsing: boolean
  csp: boolean
  zeroTelemetry: boolean
  
  // AI Settings
  localAI: boolean
  aiSuggestions: boolean
  privacyAI: boolean
}

const App: React.FC = () => {
  const [settings, setSettings] = useState<ToubkalSettings>({
    fingerprintingProtection: true,
    trackerBlocking: true,
    enhancedPrivacy: true,
    auditLogging: true,
    httpsEverywhere: true,
    safeBrowsing: true,
    csp: true,
    zeroTelemetry: true,
    localAI: true,
    aiSuggestions: true,
    privacyAI: true
  })
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info', text: string } | null>(null)

  useEffect(() => {
    // Simulate loading settings
    const loadSettings = async () => {
      setLoading(true)
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      setLoading(false)
    }

    void loadSettings()
  }, [])

  const handleSettingChange = (key: keyof ToubkalSettings, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const saveSettings = async () => {
    setSaving(true)
    setMessage(null)
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // In real implementation, this would call the Mojo interface
      console.log('Saving settings:', settings)
      
      setMessage({ type: 'success', text: 'Settings saved successfully!' })
    } catch {
      setMessage({ type: 'error', text: 'Failed to save settings. Please try again.' })
    } finally {
      setSaving(false)
    }
  }

  const resetSettings = () => {
    if (confirm('Are you sure you want to reset all settings to their default values?')) {
      setSettings({
        fingerprintingProtection: true,
        trackerBlocking: true,
        enhancedPrivacy: true,
        auditLogging: true,
        httpsEverywhere: true,
        safeBrowsing: true,
        csp: true,
        zeroTelemetry: true,
        localAI: true,
        aiSuggestions: true,
        privacyAI: true
      })
      setMessage({ type: 'info', text: 'Settings reset to defaults' })
    }
  }

  const SettingToggle: React.FC<{
    id: string
    label: string
    description: string
    value: boolean
    onChange: (value: boolean) => void
    icon: React.ReactNode
  }> = ({ label, description, value, onChange, icon }) => (
    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
      <div className="flex items-start space-x-3">
        <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
          {icon}
        </div>
        <div className="flex-1">
          <h3 className="font-medium text-gray-900">{label}</h3>
          <p className="text-sm text-gray-600 mt-1">{description}</p>
        </div>
      </div>
      <label className="toggle">
        <input
          type="checkbox"
          checked={value}
          onChange={(e) => onChange(e.target.checked)}
        />
        <span className="slider"></span>
      </label>
    </div>
  )

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700">Loading settings...</h2>
          <p className="text-gray-500">Please wait while we fetch your preferences.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Toubkal Settings</h1>
              <p className="text-gray-600 mt-1">Configure your privacy-first browsing experience</p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={resetSettings}
                className="btn btn-secondary"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </button>
              <button
                onClick={() => { void saveSettings() }}
                disabled={saving}
                className="btn btn-primary"
              >
                {saving ? (
                  <div className="spinner w-4 h-4 mr-2"></div>
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Message */}
      {message && (
        <div className="container py-4">
          <div className={`p-4 rounded-lg flex items-center ${
            message.type === 'success' ? 'bg-green-100 text-green-800' :
            message.type === 'error' ? 'bg-red-100 text-red-800' :
            'bg-blue-100 text-blue-800'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle className="w-5 h-5 mr-2" />
            ) : message.type === 'error' ? (
              <AlertCircle className="w-5 h-5 mr-2" />
            ) : (
              <Info className="w-5 h-5 mr-2" />
            )}
            {message.text}
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Settings Sections */}
          <div className="lg:col-span-2 space-y-8">
            {/* Privacy Settings */}
            <div className="card">
              <div className="flex items-center mb-6">
                <Shield className="w-6 h-6 text-blue-600 mr-3" />
                <h2 className="text-xl font-semibold text-gray-900">Privacy Settings</h2>
              </div>
              <div className="space-y-4">
                <SettingToggle
                  id="fingerprinting-protection"
                  label="Fingerprinting Protection"
                  description="Prevent websites from creating unique browser fingerprints"
                  value={settings.fingerprintingProtection}
                  onChange={(value) => handleSettingChange('fingerprintingProtection', value)}
                  icon={<Shield className="w-4 h-4" />}
                />
                <SettingToggle
                  id="tracker-blocking"
                  label="Tracker Blocking"
                  description="Block tracking scripts and cookies from third parties"
                  value={settings.trackerBlocking}
                  onChange={(value) => handleSettingChange('trackerBlocking', value)}
                  icon={<Shield className="w-4 h-4" />}
                />
                <SettingToggle
                  id="enhanced-privacy"
                  label="Enhanced Privacy Mode"
                  description="Enable additional privacy protections and data minimization"
                  value={settings.enhancedPrivacy}
                  onChange={(value) => handleSettingChange('enhancedPrivacy', value)}
                  icon={<Shield className="w-4 h-4" />}
                />
                <SettingToggle
                  id="audit-logging"
                  label="Audit Logging"
                  description="Log all privacy decisions for transparency and verification"
                  value={settings.auditLogging}
                  onChange={(value) => handleSettingChange('auditLogging', value)}
                  icon={<Shield className="w-4 h-4" />}
                />
              </div>
            </div>

            {/* Security Settings */}
            <div className="card">
              <div className="flex items-center mb-6">
                <Settings className="w-6 h-6 text-green-600 mr-3" />
                <h2 className="text-xl font-semibold text-gray-900">Security Settings</h2>
              </div>
              <div className="space-y-4">
                <SettingToggle
                  id="https-everywhere"
                  label="HTTPS Everywhere"
                  description="Automatically redirect to secure HTTPS connections"
                  value={settings.httpsEverywhere}
                  onChange={(value) => handleSettingChange('httpsEverywhere', value)}
                  icon={<Settings className="w-4 h-4" />}
                />
                <SettingToggle
                  id="safe-browsing"
                  label="Safe Browsing"
                  description="Protect against malicious websites and downloads"
                  value={settings.safeBrowsing}
                  onChange={(value) => handleSettingChange('safeBrowsing', value)}
                  icon={<Settings className="w-4 h-4" />}
                />
                <SettingToggle
                  id="csp"
                  label="Content Security Policy"
                  description="Enforce strict content security policies"
                  value={settings.csp}
                  onChange={(value) => handleSettingChange('csp', value)}
                  icon={<Settings className="w-4 h-4" />}
                />
                <SettingToggle
                  id="zero-telemetry"
                  label="Zero Telemetry"
                  description="Completely disable all data collection and telemetry"
                  value={settings.zeroTelemetry}
                  onChange={(value) => handleSettingChange('zeroTelemetry', value)}
                  icon={<Settings className="w-4 h-4" />}
                />
              </div>
            </div>

            {/* AI Settings */}
            <div className="card">
              <div className="flex items-center mb-6">
                <Brain className="w-6 h-6 text-purple-600 mr-3" />
                <h2 className="text-xl font-semibold text-gray-900">AI Settings</h2>
              </div>
              <div className="space-y-4">
                <SettingToggle
                  id="local-ai"
                  label="Local AI Processing"
                  description="Process AI requests locally without sending data to external servers"
                  value={settings.localAI}
                  onChange={(value) => handleSettingChange('localAI', value)}
                  icon={<Brain className="w-4 h-4" />}
                />
                <SettingToggle
                  id="ai-suggestions"
                  label="AI Suggestions"
                  description="Enable intelligent browsing suggestions powered by local AI"
                  value={settings.aiSuggestions}
                  onChange={(value) => handleSettingChange('aiSuggestions', value)}
                  icon={<Brain className="w-4 h-4" />}
                />
                <SettingToggle
                  id="privacy-ai"
                  label="Privacy-First AI"
                  description="Use AI features that prioritize user privacy and data protection"
                  value={settings.privacyAI}
                  onChange={(value) => handleSettingChange('privacyAI', value)}
                  icon={<Brain className="w-4 h-4" />}
                />
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full btn btn-secondary text-left justify-start">
                  <Eye className="w-4 h-4 mr-2" />
                  View Audit Logs
                </button>
                <button className="w-full btn btn-secondary text-left justify-start">
                  <Shield className="w-4 h-4 mr-2" />
                  Privacy Dashboard
                </button>
                <button className="w-full btn btn-secondary text-left justify-start">
                  <Settings className="w-4 h-4 mr-2" />
                  Advanced Settings
                </button>
              </div>
            </div>

            {/* Privacy Score */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Privacy Score</h3>
              <div className="text-center">
                <div className="text-4xl font-bold text-green-600 mb-2">95/100</div>
                <p className="text-sm text-gray-600 mb-4">Excellent privacy protection</p>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: '95%' }}></div>
                </div>
              </div>
            </div>

            {/* Settings Summary */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Settings Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Privacy Features:</span>
                  <span className="font-medium">
                    {Object.values(settings).slice(0, 4).filter(Boolean).length}/4
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Security Features:</span>
                  <span className="font-medium">
                    {Object.values(settings).slice(4, 8).filter(Boolean).length}/4
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">AI Features:</span>
                  <span className="font-medium">
                    {Object.values(settings).slice(8).filter(Boolean).length}/3
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="container py-6">
          <div className="text-center text-gray-500">
            <p>Toubkal Browser - Privacy-First Settings</p>
            <p className="text-sm mt-1">
              All settings are applied immediately and stored locally.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
