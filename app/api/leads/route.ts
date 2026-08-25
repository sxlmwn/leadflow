import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { brand_id, form_data = {}, funnel_step_reached = 1, funnel_variant = 'default' } = body;

    if (!brand_id) {
      return NextResponse.json(
        { success: false, error: 'Missing brand_id' },
        { status: 400 }
      );
    }

    // 1. Read lf_click_id cookie
    const clickIdCookie = request.cookies.get('lf_click_id')?.value;
    let foundClickId: string | null = null;
    let frozenSubIdParams: Record<string, unknown> = {};

    if (clickIdCookie) {
      // Fetch click row
      const { data: clickRow } = await supabase
        .from('clicks')
        .select('id, subid_params')
        .eq('id', clickIdCookie)
        .maybeSingle();

      if (clickRow) {
        foundClickId = clickRow.id;
        frozenSubIdParams = clickRow.subid_params || {};
      }
    }

    // Extract core contact fields from form_data
    const fullName = (form_data.full_name as string) || (form_data.name as string) || null;
    const email = (form_data.email as string) || null;
    const phone = (form_data.phone as string) || null;
    const zipCode = (form_data.zip_code as string) || (form_data.zip as string) || null;

    // Remaining non-standard fields stored in form_answers
    const formAnswers: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(form_data)) {
      if (!['full_name', 'name', 'email', 'phone', 'zip_code', 'zip'].includes(key)) {
        formAnswers[key] = value;
      }
    }

    // 2. Deduplication logic: Check if an existing lead from same email and brand_id already exists
    let isDuplicate = false;
    let duplicateOfLeadId: string | null = null;
    let leadStatus = 'new';

    if (email) {
      const { data: existingLead } = await supabase
        .from('leads')
        .select('id')
        .eq('brand_id', brand_id)
        .eq('email', email)
        .order('created_at', { ascending: true })
        .limit(1)
        .maybeSingle();

      if (existingLead) {
        isDuplicate = true;
        duplicateOfLeadId = existingLead.id;
        leadStatus = 'duplicate';
      }
    }

    // 3. Insert lead into Supabase
    const { data: newLead, error: insertError } = await supabase
      .from('leads')
      .insert({
        brand_id: brand_id,
        click_id: foundClickId,
        full_name: fullName,
        email: email,
        phone: phone,
        zip_code: zipCode,
        form_answers: formAnswers,
        subid_params: frozenSubIdParams,
        funnel_variant: funnel_variant,
        funnel_step_reached: funnel_step_reached,
        status: leadStatus,
        is_duplicate: isDuplicate,
        duplicate_of_lead_id: duplicateOfLeadId,
      })
      .select('id, status, is_duplicate, duplicate_of_lead_id')
      .single();

    if (insertError || !newLead) {
      console.error('Error creating lead:', insertError);
      return NextResponse.json(
        { success: false, error: 'Failed to record lead submission.' },
        { status: 500 }
      );
    }

    // 4. If click was found, update converted_lead_id on clicks table
    if (foundClickId) {
      await supabase
        .from('clicks')
        .update({ converted_lead_id: newLead.id })
        .eq('id', foundClickId);
    }

    return NextResponse.json({
      success: true,
      lead_id: newLead.id,
      status: newLead.status,
      is_duplicate: newLead.is_duplicate,
      duplicate_of_lead_id: newLead.duplicate_of_lead_id,
    });
  } catch (err: unknown) {
    const error = err as Error;
    console.error('Unexpected lead handler error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal error' },
      { status: 500 }
    );
  }
}
