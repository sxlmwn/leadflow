import { VerificationResult } from '@/types/verification';

/**
 * Checks phone number against National & State Do Not Call (DNC) registries.
 */
export async function checkDNC(phoneNumber?: string | null): Promise<VerificationResult> {
  const apiKey = process.env.DNC_SCRUB_API_KEY;

  if (!phoneNumber || phoneNumber.trim() === '') {
    return {
      check_type: 'dnc_scrub',
      provider: 'dnc_scrubber',
      status: 'error',
      raw_response: {
        reason: 'No phone number provided for DNC scrub.',
      },
    };
  }

  // Normalize phone number (strip all non-digit characters)
  const cleanPhone = phoneNumber.replace(/\D/g, '');

  if (cleanPhone.length < 10) {
    return {
      check_type: 'dnc_scrub',
      provider: 'dnc_scrubber',
      status: 'error',
      raw_response: {
        reason: `Invalid phone length (${cleanPhone.length} digits). Expected 10+ digits.`,
        normalized_phone: cleanPhone,
      },
    };
  }

  // Extract last 10 digits for standard US format
  const usPhone = cleanPhone.slice(-10);

  // If real DNC API key is configured in environment, call external DNC API
  if (apiKey && apiKey !== 'placeholder_dnc_api_key' && !apiKey.startsWith('mock')) {
    try {
      const response = await fetch(`https://api.dncscrub.com/v1/scrub`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone: usPhone }),
      });

      const data = await response.json();

      if (response.ok) {
        const isDNC = Boolean(data.is_dnc || data.dnc_listed);
        return {
          check_type: 'dnc_scrub',
          provider: 'dnc_scrubber',
          status: isDNC ? 'failed' : 'passed',
          raw_response: data,
        };
      } else {
        return {
          check_type: 'dnc_scrub',
          provider: 'dnc_scrubber',
          status: 'error',
          raw_response: {
            http_status: response.status,
            error: data,
          },
        };
      }
    } catch (err: unknown) {
      const error = err as Error;
      return {
        check_type: 'dnc_scrub',
        provider: 'dnc_scrubber',
        status: 'error',
        raw_response: {
          error_message: error.message || 'Failed to connect to DNC Scrub API',
        },
      };
    }
  }

  // TODO: replace with real dnc_scrubber integration when DNC_SCRUB_API_KEY is supplied
  console.log('[STUB] Executing stubbed DNC scrub check for phone:', usPhone);

  // Test rule: Phone numbers containing '999' or ending with '0000' or matching test patterns trigger DNC flag
  const isDNCListed = usPhone.includes('999') || usPhone.endsWith('0000') || usPhone.startsWith('5559');

  return {
    check_type: 'dnc_scrub',
    provider: 'dnc_scrubber_stub',
    status: isDNCListed ? 'failed' : 'passed',
    raw_response: {
      simulated: true,
      normalized_phone: usPhone,
      is_dnc_listed: isDNCListed,
      dnc_registries_checked: ['national_dnc', 'state_dnc', 'ftc_complaints'],
      checked_at: new Date().toISOString(),
    },
  };
}
