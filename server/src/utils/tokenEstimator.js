/**
 * Heuristic token estimation (approx 4 chars per token)
 */
export function estimateTokens(text = '') {
  if (typeof text !== 'string') return 0;
  return Math.ceil(text.length / 4);
}

/**
 * Trims conversation message history to fit within a given token budget
 */
export function trimHistory(messages = [], maxTokens = 3000) {
  if (!Array.isArray(messages) || messages.length === 0) return [];
  
  const result = [];
  let currentTokens = 0;

  // Walk backwards from latest message to preserve recent context
  for (let i = messages.length - 1; i >= 0; i--) {
    const msg = messages[i];
    const msgTokens = estimateTokens(msg.content) + 4; // Add slight overhead for role framing
    if (currentTokens + msgTokens > maxTokens && result.length > 0) {
      break;
    }
    result.unshift(msg);
    currentTokens += msgTokens;
  }

  return result;
}

/**
 * Wraps user-supplied content in safe boundary tags to mitigate prompt injection
 */
export function sanitizePromptData(content = '', tag = 'user_data') {
  if (content === null || content === undefined) return '';
  const str = String(content);
  // Neutralize closing tag injections
  const sanitized = str.replaceAll(`</${tag}>`, `[/${tag}]`);
  return `<${tag}>\n${sanitized}\n</${tag}>`;
}
