import { VerificationResult } from '@/types';

/**
 * Verifies a TrustedForm Certificate URL to confirm TCPA consent.
 * Documentation: https://activeprospect.com/docs/trustedform/
 */
export async function verifyTrustedForm(certUrl?: string | null): Promise<VerificationResult> {
  const apiKey = process.env.TRUSTEDFORM_API_KEY;

  if (!certUrl || certUrl.trim() === '') {
    return {
      check_type: 'trustedform',
      provider: 'trustedform',
      status: 'skipped',
      raw_response: {
        reason: 'No TrustedForm certificate URL provided with lead submission.',
      },
    };
  }

  // If real API key is configured in environment, invoke TrustedForm API
  if (apiKey && apiKey !== 'placeholder_trustedform_api_key' && !apiKey.startsWith('mock')) {
    try {
      const response = await fetch(certUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${Buffer.from(`api:${apiKey}`).toString('base64')}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          match_lead_url: true,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        return {
          check_type: 'trustedform',
          provider: 'trustedform',
          status: 'passed',
          raw_response: data,
        };
      } else {
        return {
          check_type: 'trustedform',
          provider: 'trustedform',
          status: 'failed',
          raw_response: {
            http_status: response.status,
            error: data,
          },
        };
      }
    } catch (err: unknown) {
      const error = err as Error;
      return {
        check_type: 'trustedform',
        provider: 'trustedform',
        status: 'error',
        raw_response: {
          error_message: error.message || 'Failed to connect to TrustedForm API',
        },
      };
    }
  }

  // TODO: replace with real trustedform integration when TRUSTEDFORM_API_KEY is supplied
  console.log('[STUB] Executing stubbed TrustedForm verification for cert:', certUrl);

  const isTestInvalid = certUrl.includes('invalid') || certUrl.includes('failed');

  return {
    check_type: 'trustedform',
    provider: 'trustedform_stub',
    status: isTestInvalid ? 'failed' : 'passed',
    raw_response: {
      simulated: true,
      cert_url: certUrl,
      verified_at: new Date().toISOString(),
      tcpa_compliant: !isTestInvalid,
      page_url: 'https://leadflow.local',
      ip_match: true,
    },
  };
}
