import { NextRequest, NextResponse } from 'next/server';

/**
 * Dev-Only Mock Buyer API Endpoint for testing broadcast lead delivery.
 * Supports query modes: ?mode=accept, ?mode=reject, ?mode=slow_accept
 * // TODO: Remove or gate behind dev environment before production deployment.
 */
export async function POST(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const mode = searchParams.get('mode') || 'accept';
    const delayMs = parseInt(searchParams.get('delay') || '0', 10);
    const customPrice = parseFloat(searchParams.get('price') || '15.00');

    if (delayMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }

    const body = await request.json().catch(() => ({}));

    if (mode === 'reject') {
      return NextResponse.json({
        accepted: false,
        reason: 'Lead does not match buyer criteria',
        buyer_lead_id: null,
      });
    }

    if (mode === 'timeout') {
      // Simulate slow response > 6 seconds to trigger timeout
      await new Promise((resolve) => setTimeout(resolve, 6000));
    }

    return NextResponse.json({
      accepted: true,
      price: customPrice,
      buyer_lead_id: `buyer_mock_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      received_lead_id: body.lead_id,
    });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json(
      { accepted: false, error: error.message || 'Mock buyer server error' },
      { status: 500 }
    );
  }
}
