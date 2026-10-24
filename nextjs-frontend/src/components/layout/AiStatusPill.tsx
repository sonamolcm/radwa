'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import { getAiConfig, subscribeToAiConfig, checkLiveApiStatus, AiConfig, DEFAULT_AI_CONFIG } from '@/utils/aiConfig';
import { AiConfigModal } from './AiConfigModal';

interface AiStatusPillProps {
  className?: string;
}

export const AiStatusPill: React.FC<AiStatusPillProps> = ({ className = '' }) => {
  const [config, setConfig] = useState<AiConfig>(DEFAULT_AI_CONFIG);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLimitExceededPrompt, setIsLimitExceededPrompt] = useState(false);

  useEffect(() => {
    setConfig(getAiConfig());
    
    // Perform initial live health check with the real API endpoint
    checkLiveApiStatus().catch(() => {});

    const unsubscribe = subscribeToAiConfig((newConfig) => {
      setConfig(newConfig);
    });

    // Listen for custom trigger to open config modal on rate limit
    const handleOpenPrompt = () => {
      setIsLimitExceededPrompt(true);
      setIsModalOpen(true);
    };

    window.addEventListener('radwa_open_ai_config_limit_exceeded', handleOpenPrompt);

    return () => {
      unsubscribe();
      window.removeEventListener('radwa_open_ai_config_limit_exceeded', handleOpenPrompt);
    };
  }, []);

  let endpointHost = 'api.openai.com';
  try {
    if (config.apiEndpoint) {
      const url = new URL(config.apiEndpoint);
      endpointHost = url.hostname;
    }
  } catch {
    endpointHost = 'custom-endpoint';
  }

  // Determine dynamic badge appearance based on REAL API status
  let badgeColor = 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200';
  let dotColor = 'bg-slate-400';
  let statusText = 'AI Engine: Standalone';
  let subText = 'No Key';

  if (config.apiStatus === 'checking') {
    badgeColor = 'bg-amber-50 text-amber-900 border-amber-200 hover:bg-amber-100';
    dotColor = 'bg-amber-500 animate-pulse';
    statusText = 'AI Engine: Verifying API...';
    subText = endpointHost;
  } else if (config.apiStatus === 'unauthorized') {
    badgeColor = 'bg-rose-50 text-rose-900 border-rose-300 hover:bg-rose-100';
    dotColor = 'bg-rose-600';
    statusText = 'AI Engine: Invalid Key';
    subText = 'Auth Failed';
  } else {
    // Active / Live
    badgeColor = 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100';
    dotColor = 'bg-emerald-500';
    statusText = 'AI Engine: Active';
    subText = endpointHost;
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setIsLimitExceededPrompt(config.apiStatus === 'quota_exhausted');
          setIsModalOpen(true);
        }}
        className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shadow-2xs active:scale-95 ${badgeColor} ${className}`}
        title={`Live API Status: ${config.apiStatusMessage || 'Click to view configuration'}`}
      >
        <span className={`w-2 h-2 rounded-full ${dotColor} shrink-0`} />
        
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-purple-600 shrink-0" />
          <span className="font-extrabold tracking-tight">{statusText}</span>
        </div>

        <span className="text-[10px] font-semibold text-slate-500 hidden sm:inline-block border-l border-slate-300/60 pl-1.5 font-mono">
          {subText}
        </span>
      </button>

      <AiConfigModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        isQuotaExceededPrompt={isLimitExceededPrompt}
        onConfigured={() => {
          checkLiveApiStatus().then(() => setConfig(getAiConfig()));
        }}
      />
    </>
  );
};
