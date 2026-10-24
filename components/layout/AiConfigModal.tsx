'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Sparkles, 
  Key, 
  Link2, 
  Cpu, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  Sliders, 
  ShieldCheck, 
  Zap, 
  Eye,
  EyeOff
} from 'lucide-react';
import { getAiConfig, saveAiConfig, resetAiPulls, checkLiveApiStatus, AiConfig, DEFAULT_AI_CONFIG } from '@/utils/aiConfig';

interface AiConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  isQuotaExceededPrompt?: boolean;
  onConfigured?: (config: AiConfig) => void;
}

export const AiConfigModal: React.FC<AiConfigModalProps> = ({
  isOpen,
  onClose,
  isQuotaExceededPrompt = false,
  onConfigured
}) => {
  const [config, setConfig] = useState<AiConfig>(DEFAULT_AI_CONFIG);
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [endpointInput, setEndpointInput] = useState('https://api.openai.com/v1');
  const [modelInput, setModelInput] = useState('gpt-4o-mini');
  const [maxPullsInput, setMaxPullsInput] = useState(15);
  const [showKey, setShowKey] = useState(false);
  
  // Test connection state
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const current = getAiConfig();
      setConfig(current);
      setApiKeyInput(current.apiKey || '');
      setEndpointInput(current.apiEndpoint || 'https://api.openai.com/v1');
      setModelInput(current.model || 'gpt-4o-mini');
      setMaxPullsInput(current.maxPulls || 15);
      setTestResult(null);
      setSaveSuccess(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const remainingPulls = Math.max(0, config.maxPulls - config.pullsUsed);
  const percentUsed = Math.min(100, Math.round((config.pullsUsed / config.maxPulls) * 100));

  const handleSave = () => {
    const isNewKey = apiKeyInput.trim() !== config.apiKey;
    const isNewEndpoint = endpointInput.trim() !== config.apiEndpoint;
    const shouldResetCalls = isNewKey || isNewEndpoint;

    const updated = saveAiConfig({
      apiKey: apiKeyInput.trim(),
      apiEndpoint: endpointInput.trim() || 'https://api.openai.com/v1',
      model: modelInput.trim() || 'gpt-4o-mini',
      maxPulls: Number(maxPullsInput) > 0 ? Number(maxPullsInput) : 15,
      ...(shouldResetCalls ? { pullsUsed: 0 } : {})
    });

    setConfig(updated);
    setSaveSuccess(true);
    if (onConfigured) {
      onConfigured(updated);
    }
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 900);
  };

  const handleResetCounter = () => {
    const reset = resetAiPulls(Number(maxPullsInput) || 15);
    setConfig(reset);
    setTestResult({
      success: true,
      message: `Session quota reset! You now have ${reset.maxPulls} calls available.`
    });
  };

  const handleTestConnection = async () => {
    if (!apiKeyInput.trim()) {
      setTestResult({
        success: false,
        message: 'Please paste an OpenAI API Key before testing.'
      });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      const response = await fetch('/api/test-ai-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey: apiKeyInput.trim(),
          apiEndpoint: endpointInput.trim() || 'https://api.openai.com/v1',
          model: modelInput.trim() || 'gpt-4o-mini'
        })
      });

      const res = await response.json();
      setTestResult({
        success: res.success,
        message: res.message
      });
    } catch (err: any) {
      setTestResult({
        success: false,
        message: `Network error connecting to endpoint: ${err?.message || 'Check endpoint URL'}`
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div 
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(6px)'
      }}
    >
      <div 
        style={{ 
          backgroundColor: '#ffffff', 
          borderColor: '#cbd5e1',
          width: '100%',
          maxWidth: '580px',
          borderRadius: '18px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
          border: '1px solid #cbd5e1',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '92vh'
        }}
      >
        
        {/* Solid Header with High Contrast Guarantee */}
        <div 
          style={{ 
            backgroundColor: '#0f172a', 
            color: '#ffffff',
            padding: '18px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'between',
            borderBottom: '1px solid #1e293b'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
            <div 
              style={{ 
                backgroundColor: '#2563eb', 
                color: '#ffffff',
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.3)',
                flexShrink: 0
              }}
            >
              <Sparkles style={{ width: '20px', height: '20px', color: '#ffffff' }} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 style={{ color: '#ffffff', fontSize: '15px', fontWeight: 800, margin: 0, letterSpacing: '-0.01em' }}>
                  OpenAI & Model Configuration
                </h2>
                <span 
                  style={{ 
                    backgroundColor: '#064e3b', 
                    color: '#34d399', 
                    border: '1px solid #059669',
                    fontSize: '10px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    padding: '2px 8px',
                    borderRadius: '9999px',
                    letterSpacing: '0.04em'
                  }}
                >
                  Live Engine
                </span>
              </div>
              <p style={{ color: '#94a3b8', fontSize: '12px', margin: '3px 0 0 0' }}>
                Manage your API Key, custom endpoint, and real-time pull limit quotas.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{ 
              color: '#94a3b8',
              backgroundColor: 'transparent',
              border: 'none',
              padding: '6px',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title="Close"
          >
            <X style={{ width: '20px', height: '20px' }} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* Quota Exceeded Alert Banner */}
          {isQuotaExceededPrompt && (
            <div 
              style={{ 
                backgroundColor: '#fef2f2', 
                borderColor: '#fca5a5', 
                color: '#991b1b',
                padding: '14px 16px',
                borderRadius: '12px',
                border: '1px solid #fca5a5',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px'
              }}
            >
              <AlertTriangle style={{ width: '18px', height: '18px', color: '#dc2626', flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong style={{ color: '#881337', display: 'block', fontSize: '12px', fontWeight: 800 }}>
                  API Request Limit Reached / Quota Exhausted ({config.pullsUsed}/{config.maxPulls} Calls)
                </strong>
                <p style={{ color: '#9f1239', fontSize: '11px', lineHeight: '1.5', margin: '4px 0 0 0' }}>
                  The current API key has completed all allocated free test pulls or received rate limit status. Please paste another OpenAI API Key or Endpoint link below and click <strong>Configure & Apply API</strong> to continue immediately.
                </p>
              </div>
            </div>
          )}

          {/* Real-time Live API Connection & Credit Status Banner (100% Dynamic, Non-Hardcoded) */}
          <div 
            style={{ 
              backgroundColor: config.apiStatus === 'quota_exhausted' ? '#fef2f2' : config.apiStatus === 'active' ? '#ecfdf5' : '#f8fafc', 
              border: '1.5px solid',
              borderColor: config.apiStatus === 'quota_exhausted' ? '#fca5a5' : config.apiStatus === 'active' ? '#a7f3d0' : '#e2e8f0',
              borderRadius: '14px',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Zap style={{ width: '16px', height: '16px', color: config.apiStatus === 'quota_exhausted' ? '#dc2626' : '#059669' }} />
                <span style={{ color: '#0f172a', fontWeight: 800, fontSize: '13px' }}>
                  Live API Engine & Quota Status
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span 
                  style={{
                    backgroundColor: config.apiKey ? '#dcfce7' : '#f1f5f9',
                    color: config.apiKey ? '#166534' : '#475569',
                    border: '1px solid',
                    borderColor: config.apiKey ? '#86efac' : '#cbd5e1',
                    fontSize: '11.5px',
                    fontWeight: 800,
                    padding: '4px 10px',
                    borderRadius: '8px'
                  }}
                >
                  {config.apiKey ? 'Active • Connected & Ready' : 'No API Key Set'}
                </span>

                <button
                  type="button"
                  onClick={async () => {
                    setIsTesting(true);
                    const updated = await checkLiveApiStatus();
                    setConfig(updated);
                    setIsTesting(false);
                  }}
                  disabled={isTesting}
                  style={{ 
                    backgroundColor: '#ffffff', 
                    color: '#334155', 
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    padding: '5px 10px',
                    fontSize: '11px',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    cursor: isTesting ? 'not-allowed' : 'pointer'
                  }}
                  title="Re-query OpenAI endpoint to verify live credit balance"
                >
                  <RefreshCw style={{ width: '12px', height: '12px', color: '#64748b', animation: isTesting ? 'spin 1s linear infinite' : 'none' }} />
                  <span>Check Live Balance</span>
                </button>
              </div>
            </div>

            {/* Explanatory status text */}
            <p style={{ color: config.apiStatus === 'quota_exhausted' ? '#b91c1c' : '#475569', fontSize: '11.5px', lineHeight: '1.5', margin: 0 }}>
              {config.apiStatusMessage || 'Connected to API endpoint.'}
            </p>

            {/* Target endpoint link badge */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #e2e8f0', paddingTop: '8px', fontSize: '11px', color: '#64748b', flexWrap: 'wrap', gap: '6px' }}>
              <span>Target URL: <strong style={{ color: '#0f172a', fontFamily: 'monospace' }}>{config.apiEndpoint}</strong></span>
              <span>Model: <strong style={{ color: '#0f172a' }}>{config.model}</strong></span>
              <span>Calls Used This Session: <strong style={{ color: '#0f172a' }}>{config.pullsUsed}</strong></span>
            </div>
          </div>

          {/* Form Fields Section */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {/* API Key Input */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <label style={{ color: '#0f172a', fontWeight: 800, fontSize: '12.5px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Key style={{ width: '14px', height: '14px', color: '#2563eb' }} />
                  <span>OpenAI API Key</span>
                </label>
                <span style={{ color: '#64748b', fontSize: '11px' }}>
                  Stored securely in browser session
                </span>
              </div>
              <div style={{ position: 'relative', width: '100%', display: 'flex', alignItems: 'center' }}>
                <input
                  type={showKey ? 'text' : 'password'}
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  placeholder="sk-proj-xxxxxxxxxxxxxxxxxxxx"
                  style={{ 
                    backgroundColor: '#ffffff', 
                    color: '#0f172a', 
                    border: '1.5px solid #cbd5e1',
                    borderRadius: '10px',
                    width: '100%',
                    height: '42px',
                    paddingLeft: '14px',
                    paddingRight: '88px', // Prevent text from colliding with Show/Hide button
                    fontFamily: 'monospace',
                    fontSize: '12.5px',
                    outline: 'none',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.04)'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  style={{ 
                    position: 'absolute',
                    right: '8px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    backgroundColor: '#f1f5f9', 
                    color: '#334155', 
                    border: '1px solid #cbd5e1',
                    borderRadius: '6px',
                    padding: '4px 8px',
                    fontSize: '11px',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    cursor: 'pointer',
                    zIndex: 5
                  }}
                >
                  {showKey ? <EyeOff style={{ width: '13px', height: '13px' }} /> : <Eye style={{ width: '13px', height: '13px' }} />}
                  <span>{showKey ? 'Hide' : 'Show'}</span>
                </button>
              </div>
              <span style={{ color: '#94a3b8', fontSize: '11px' }}>
                Enter your secret key (sk-...). Calls are made directly to the AI endpoint.
              </span>
            </div>

            {/* API Endpoint Link */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <label style={{ color: '#0f172a', fontWeight: 800, fontSize: '12.5px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Link2 style={{ width: '14px', height: '14px', color: '#4f46e5' }} />
                  <span>API Endpoint Link (Base URL)</span>
                </label>
                <span style={{ color: '#64748b', fontSize: '11px' }}>
                  Default: https://api.openai.com/v1
                </span>
              </div>
              <input
                type="text"
                value={endpointInput}
                onChange={(e) => setEndpointInput(e.target.value)}
                placeholder="https://api.openai.com/v1"
                style={{ 
                  backgroundColor: '#ffffff', 
                  color: '#0f172a', 
                  border: '1.5px solid #cbd5e1',
                  borderRadius: '10px',
                  width: '100%',
                  height: '42px',
                  paddingLeft: '14px',
                  paddingRight: '14px',
                  fontFamily: 'monospace',
                  fontSize: '12.5px',
                  outline: 'none',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.04)'
                }}
              />
              <span style={{ color: '#94a3b8', fontSize: '11px' }}>
                Supports custom OpenAI proxies, Azure endpoints, or self-hosted vLLM gateways.
              </span>
            </div>

            {/* Model & Max Pulls Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ color: '#0f172a', fontWeight: 800, fontSize: '12.5px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Cpu style={{ width: '14px', height: '14px', color: '#7c3aed' }} />
                  <span>AI Model</span>
                </label>
                <select
                  value={modelInput}
                  onChange={(e) => setModelInput(e.target.value)}
                  style={{ 
                    backgroundColor: '#ffffff', 
                    color: '#0f172a', 
                    border: '1.5px solid #cbd5e1',
                    borderRadius: '10px',
                    width: '100%',
                    height: '42px',
                    paddingLeft: '12px',
                    paddingRight: '12px',
                    fontSize: '12.5px',
                    fontWeight: 700,
                    outline: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.04)'
                  }}
                >
                  <option value="gpt-4o-mini">gpt-4o-mini (Fast & Recommended)</option>
                  <option value="gpt-4o">gpt-4o (High-Precision EPC Reasoning)</option>
                  <option value="gpt-3.5-turbo">gpt-3.5-turbo (Legacy Free Tier)</option>
                  <option value="o3-mini">o3-mini (Complex Reasoning)</option>
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ color: '#0f172a', fontWeight: 800, fontSize: '12.5px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Sliders style={{ width: '14px', height: '14px', color: '#475569' }} />
                  <span>Session Call Limit (Pulls)</span>
                </label>
                <input
                  type="number"
                  min="1"
                  max="1000"
                  value={maxPullsInput}
                  onChange={(e) => setMaxPullsInput(parseInt(e.target.value, 10) || 15)}
                  style={{ 
                    backgroundColor: '#ffffff', 
                    color: '#0f172a', 
                    border: '1.5px solid #cbd5e1',
                    borderRadius: '10px',
                    width: '100%',
                    height: '42px',
                    paddingLeft: '14px',
                    paddingRight: '14px',
                    fontSize: '13px',
                    fontWeight: 700,
                    outline: 'none',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.04)'
                  }}
                />
              </div>
            </div>

          </div>

          {/* Test Result Message */}
          {testResult && (
            <div 
              style={{
                backgroundColor: testResult.success ? '#ecfdf5' : '#fef2f2',
                borderColor: testResult.success ? '#a7f3d0' : '#fecdd3',
                color: testResult.success ? '#065f46' : '#991b1b',
                padding: '14px 16px',
                borderRadius: '12px',
                border: '1px solid',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px'
              }}
            >
              {testResult.success ? (
                <CheckCircle2 style={{ width: '16px', height: '16px', color: '#059669', flexShrink: 0, marginTop: '2px' }} />
              ) : (
                <AlertTriangle style={{ width: '16px', height: '16px', color: '#dc2626', flexShrink: 0, marginTop: '2px' }} />
              )}
              <span style={{ fontSize: '12px', fontWeight: 600, lineHeight: '1.5' }}>{testResult.message}</span>
            </div>
          )}

          {/* Save Success Message */}
          {saveSuccess && (
            <div 
              style={{ 
                backgroundColor: '#059669', 
                color: '#ffffff',
                padding: '12px 16px',
                borderRadius: '12px',
                fontWeight: 700,
                fontSize: '12.5px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 2px 6px rgba(5, 150, 105, 0.3)'
              }}
            >
              <CheckCircle2 style={{ width: '16px', height: '16px', color: '#ffffff' }} />
              <span>Configuration Applied Successfully! All future AI calls will use this API.</span>
            </div>
          )}

        </div>

        {/* Footer Actions with 100% Solid Visible Colors */}
        <div 
          style={{ 
            backgroundColor: '#f8fafc', 
            borderTop: '1px solid #e2e8f0',
            padding: '16px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            flexWrap: 'wrap'
          }}
        >
          <button
            type="button"
            onClick={handleTestConnection}
            disabled={isTesting}
            style={{ 
              backgroundColor: '#ffffff', 
              color: '#1e293b', 
              border: '1.5px solid #cbd5e1',
              borderRadius: '10px',
              height: '40px',
              padding: '0 16px',
              fontWeight: 700,
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: isTesting ? 'not-allowed' : 'pointer',
              opacity: isTesting ? 0.6 : 1,
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
            }}
          >
            {isTesting ? (
              <>
                <RefreshCw style={{ width: '14px', height: '14px', color: '#2563eb', animation: 'spin 1s linear infinite' }} />
                <span>Testing Connection...</span>
              </>
            ) : (
              <>
                <ShieldCheck style={{ width: '15px', height: '15px', color: '#2563eb' }} />
                <span>Test Key Connection</span>
              </>
            )}
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{ 
                backgroundColor: '#ffffff', 
                color: '#475569', 
                border: '1.5px solid #cbd5e1',
                borderRadius: '10px',
                height: '40px',
                padding: '0 18px',
                fontWeight: 700,
                fontSize: '12px',
                cursor: 'pointer',
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
              }}
            >
              Cancel
            </button>

            {/* Solid High-Contrast Configure Button */}
            <button
              type="button"
              onClick={handleSave}
              style={{ 
                backgroundColor: '#7c3aed', 
                background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
                color: '#ffffff', 
                border: '1px solid #5b21b6',
                borderRadius: '10px',
                height: '40px',
                padding: '0 20px',
                fontWeight: 800,
                fontSize: '12.5px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(124, 58, 237, 0.4)'
              }}
            >
              <Sparkles style={{ width: '15px', height: '15px', color: '#fde047', flexShrink: 0 }} />
              <span style={{ color: '#ffffff', fontWeight: 800 }}>Configure & Apply API</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
