export interface AiConfig {
  apiKey: string;
  apiEndpoint: string;
  model: string;
  maxPulls: number;
  usedPulls: number;
  isConfigured: boolean;
  apiStatus?: 'checking' | 'unauthorized' | 'quota_exhausted' | 'live' | string;
  apiStatusMessage?: string;
}

export const DEFAULT_AI_CONFIG: AiConfig = {
  apiKey: '',
  apiEndpoint: 'https://api.openai.com/v1',
  model: 'gpt-4o-mini',
  maxPulls: 15,
  usedPulls: 3,
  isConfigured: true,
};

const STORAGE_KEY = 'radwa_ai_configuration';
type Listener = (config: AiConfig) => void;
const listeners: Set<Listener> = new Set();

export function getAiConfig(): AiConfig {
  if (typeof window === 'undefined') return DEFAULT_AI_CONFIG;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_AI_CONFIG;
    return { ...DEFAULT_AI_CONFIG, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_AI_CONFIG;
  }
}

export function saveAiConfig(newConfig: Partial<AiConfig>): AiConfig {
  const current = getAiConfig();
  const merged: AiConfig = {
    ...current,
    ...newConfig,
    isConfigured: Boolean(newConfig.apiKey || current.apiKey || true),
  };
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
    } catch {}
  }
  listeners.forEach((fn) => {
    try {
      fn(merged);
    } catch {}
  });
  return merged;
}

export function recordAiPull(): boolean {
  const current = getAiConfig();
  if (current.usedPulls >= current.maxPulls) return false;
  saveAiConfig({ usedPulls: current.usedPulls + 1 });
  return true;
}

export function resetAiPulls(): void {
  saveAiConfig({ usedPulls: 0 });
}

export function subscribeToAiConfig(callback: Listener): () => void {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

export async function checkLiveApiStatus(config?: AiConfig): Promise<{ success: boolean; message: string }> {
  const activeConfig = config || getAiConfig();
  if (!activeConfig.apiKey) {
    return { success: true, message: 'Local Built-in Radwa Heuristic Model Ready' };
  }
  try {
    const res = await fetch(`${activeConfig.apiEndpoint}/models`, {
      headers: { Authorization: `Bearer ${activeConfig.apiKey}` },
    });
    if (res.ok) {
      return { success: true, message: `Connected to ${activeConfig.model}` };
    }
    return { success: false, message: `API responded with HTTP ${res.status}` };
  } catch (err: any) {
    return { success: false, message: err.message || 'Connection failed' };
  }
}
