import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';
import { extractSubIdParams } from '@/lib/subid';

export async function POST(request: NextRequest) {
  try {
    // 1. Check if lf_click_id cookie is already present
    const existingClickId = request.cookies.get('lf_click_id')?.value;
    if (existingClickId) {
      return NextResponse.json({
        success: true,
        click_id: existingClickId,
        created: false,
        message: 'Click already registered for session',
      });
    }

    const body = await request.json().catch(() => ({}));
    const brandId = body.brand_id;
    const landingUrl = body.landing_url || request.headers.get('referer') || '/';
    const rawQueryParams = body.query_params || {};

    if (!brandId) {
      return NextResponse.json(
        { success: false, error: 'Missing brand_id' },
        { status: 400 }
      );
    }

    // 2. Extract subID parameters
    const subidParams = extractSubIdParams(rawQueryParams);

    // 3. Extract IP address, User Agent, and Referrer
    const ipAddress =
      request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
      request.headers.get('x-real-ip') ||
      null;

    const userAgent = request.headers.get('user-agent') || null;
    const referrer = body.referrer || request.headers.get('referer') || null;

    // 4. Insert click into Supabase
    const { data: newClick, error } = await supabase
      .from('clicks')
      .insert({
        brand_id: brandId,
        landing_url: landingUrl,
        subid_params: subidParams,
        ip_address: ipAddress,
        user_agent: userAgent,
        referrer: referrer,
      })
      .select('id')
      .single();

    if (error || !newClick) {
      console.error('Error recording click:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to record click' },
        { status: 500 }
      );
    }

    // 5. Create response and attach lf_click_id cookie (30 days expiry)
    const response = NextResponse.json({
      success: true,
      click_id: newClick.id,
      created: true,
    });

    response.cookies.set('lf_click_id', newClick.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
    });

    return response;
  } catch (err: unknown) {
    const error = err as Error;
    console.error('Unexpected click handler error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal error' },
      { status: 500 }
    );
  }
}
