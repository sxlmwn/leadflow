import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';

/**
 * Postback / Conversion Webhook Endpoint for Buyers.
 * Updates buyer_deliveries table when a delivered lead converts downstream.
 * // TODO: add buyer-specific webhook signature verification before going live
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ deliveryId: string }> }
) {
  try {
    const { deliveryId } = await params;
    const body = await request.json().catch(() => ({}));

    if (!deliveryId) {
      return NextResponse.json(
        { success: false, error: 'Missing deliveryId parameter' },
        { status: 400 }
      );
    }

    const { converted = false, conversion_value = 0 } = body;

    // Update matching buyer_deliveries row in Supabase
    const { data: updatedDelivery, error } = await supabase
      .from('buyer_deliveries')
      .update({
        converted: Boolean(converted),
        converted_at: converted ? new Date().toISOString() : null,
        conversion_value: typeof conversion_value === 'number' ? conversion_value : 0,
      })
      .eq('id', deliveryId)
      .select('id, lead_id, buyer_id, converted, conversion_value')
      .maybeSingle();

    if (error || !updatedDelivery) {
      return NextResponse.json(
        { success: false, error: 'Delivery record not found or failed to update.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Postback conversion recorded successfully',
      delivery: updatedDelivery,
    });
  } catch (err: unknown) {
    const error = err as Error;
    console.error('Unexpected postback handler error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal error' },
      { status: 500 }
    );
  }
}
