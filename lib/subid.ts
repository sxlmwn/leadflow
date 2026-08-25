/**
 * Utility to extract subID and tracking parameters from URL query parameters.
 * Matches: sub1-sub99, sid1-sid99, clickid, gclid, utm_*, fbclid, msclkid, ttclid, etc.
 */
export function extractSubIdParams(params: Record<string, string> | URLSearchParams): Record<string, string> {
  const subIdParams: Record<string, string> = {};

  const entries = params instanceof URLSearchParams 
    ? Array.from(params.entries()) 
    : Object.entries(params);

  for (const [key, value] of entries) {
    if (!value || typeof value !== 'string') continue;
    
    const lowerKey = key.toLowerCase();
    
    const isSubPattern = /^sub\d{1,2}$/.test(lowerKey);
    const isSidPattern = /^sid\d{1,2}$/.test(lowerKey);
    const isClickId = lowerKey === 'clickid' || lowerKey === 'gclid' || lowerKey === 'fbclid' || lowerKey === 'msclkid' || lowerKey === 'ttclid';
    const isUtm = lowerKey.startsWith('utm_');

    if (isSubPattern || isSidPattern || isClickId || isUtm) {
      subIdParams[key] = value;
    }
  }

  return subIdParams;
}
