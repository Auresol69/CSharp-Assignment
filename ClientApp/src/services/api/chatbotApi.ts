import api from './index';

// ─── Request ─────────────────────────────────────────────────────────────────

export interface AgentChatRequest {
  message: string;
}

// ─── Response sub-types (mirrors AgentDtos.cs) ───────────────────────────────

export interface IntentAnalysis {
  detectedIntent: string;
  skillName: string;
  extractedParams: Record<string, string>;
  confidence: number;
  reasoning: string;
  method: 'llm' | 'rule_based';
  llmError?: string;
  elapsedMs: number;
}

export interface SkillExecution {
  skillName: string;
  input: unknown;
  output: unknown;
  success: boolean;
  error?: string;
  elapsedMs: number;
}

export interface AgentChatResponse {
  userMessage: string;
  intentAnalysis: IntentAnalysis;
  skillExecution?: SkillExecution;
  answer: string;
  totalElapsedMs: number;
}

// ─── Service call ─────────────────────────────────────────────────────────────

/**
 * Send a message to the Agent Orchestrator.
 * Endpoint: POST /api/agent/chat
 *
 * Returns the full pipeline response. Consumers that only need the
 * natural-language answer should read `response.answer`.
 */
export async function sendChatbotMessage(
  request: AgentChatRequest
): Promise<AgentChatResponse> {
  try {
    const res = await api.post<AgentChatResponse>('/agent/chat', request);
    return res.data;
  } catch (err) {
    // Network error or server unavailable — return a minimal error response
    // so callers always receive a consistent shape.
    const errorMessage =
      err instanceof Error ? err.message : 'Agent service unavailable.';

    return {
      userMessage: request.message,
      intentAnalysis: {
        detectedIntent: 'general_chat',
        skillName: '(none)',
        extractedParams: {},
        confidence: 0,
        reasoning: errorMessage,
        method: 'rule_based',
        elapsedMs: 0,
      },
      answer: `Loi ket noi: ${errorMessage}`,
      totalElapsedMs: 0,
    };
  }
}
