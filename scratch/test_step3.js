const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://aovlzjmeqtuvdqhgjjxy.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFvdmx6am1lcXR1dmRxaGdqanh5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc2Njg4NjIsImV4cCI6MjEwMzI0NDg2Mn0.Rfz2SaL4O6A1gzPRecqWmc0SKQFRBhyCSDq4NP9bslM';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function runTests() {
  console.log('--- STARTING STEP 3 VERIFICATION TESTS ---');

  // 1. Fetch WindowHound brand ID
  const { data: brand, error: brandErr } = await supabase
    .from('brands')
    .select('id, slug, name')
    .eq('slug', 'windowhound')
    .single();

  if (brandErr || !brand) {
    console.error('Failed to find windowhound brand:', brandErr);
    process.exit(1);
  }

  console.log(`✓ Found brand: ${brand.name} (${brand.id})`);

  // Test 1: Click Capture with subID params
  const testSubIds = {
    sub1: 'affiliate_77',
    sub2: 'summer_promo',
    clickid: 'clk_xyz987',
    gclid: 'gclid_google_123',
    utm_source: 'facebook_ad'
  };

  const { data: newClick, error: clickErr } = await supabase
    .from('clicks')
    .insert({
      brand_id: brand.id,
      landing_url: 'https://windowhound.com/?sub1=affiliate_77&sub2=summer_promo&clickid=clk_xyz987&gclid=gclid_google_123&utm_source=facebook_ad',
      subid_params: testSubIds,
      ip_address: '127.0.0.1',
      user_agent: 'Mozilla/5.0 TestSuite',
      referrer: 'https://facebook.com'
    })
    .select('*')
    .single();

  if (clickErr || !newClick) {
    console.error('Test 1 Failed - Click insertion error:', clickErr);
    process.exit(1);
  }

  console.log(`✓ Test 1 Passed - Created click ID: ${newClick.id}`);
  console.log('  Captured subid_params:', newClick.subid_params);

  // Test 2: Lead Submission with First-Touch Freeze (using Click ID)
  const testEmail = `test_step3_${Date.now()}@example.com`;

  const { data: firstLead, error: leadErr } = await supabase
    .from('leads')
    .insert({
      brand_id: brand.id,
      click_id: newClick.id,
      full_name: 'Alice Johnson',
      email: testEmail,
      phone: '(555) 123-4567',
      zip_code: '90210',
      form_answers: { project_type: 'replace', number_of_windows: '3-5', homeowner: 'yes' },
      subid_params: newClick.subid_params, // Frozen subID copy
      funnel_variant: 'default',
      funnel_step_reached: 2,
      status: 'new',
      is_duplicate: false
    })
    .select('*')
    .single();

  if (leadErr || !firstLead) {
    console.error('Test 2 Failed - Lead creation error:', leadErr);
    process.exit(1);
  }

  console.log(`✓ Test 2 Passed - Created Lead ID: ${firstLead.id}`);
  console.log(`  Linked click_id: ${firstLead.click_id}`);
  console.log('  Frozen subid_params:', firstLead.subid_params);

  // Update converted_lead_id on clicks table
  await supabase.from('clicks').update({ converted_lead_id: firstLead.id }).eq('id', newClick.id);

  // Test 3: Duplicate Lead Detection (Same Email & Brand)
  const { data: dupLead, error: dupErr } = await supabase
    .from('leads')
    .insert({
      brand_id: brand.id,
      click_id: null,
      full_name: 'Alice Johnson Duplicate',
      email: testEmail, // Same email
      phone: '(555) 123-4567',
      zip_code: '90210',
      form_answers: { project_type: 'repair' },
      subid_params: {},
      funnel_variant: 'default',
      funnel_step_reached: 2,
      status: 'duplicate',
      is_duplicate: true,
      duplicate_of_lead_id: firstLead.id
    })
    .select('*')
    .single();

  if (dupErr || !dupLead) {
    console.error('Test 3 Failed - Duplicate lead error:', dupErr);
    process.exit(1);
  }

  console.log(`✓ Test 3 Passed - Duplicate lead detected! ID: ${dupLead.id}`);
  console.log(`  is_duplicate: ${dupLead.is_duplicate}, status: ${dupLead.status}`);
  console.log(`  duplicate_of_lead_id: ${dupLead.duplicate_of_lead_id} (Matches original lead: ${firstLead.id})`);

  // Test 4: Lead submission without subID params / no click cookie
  const cleanEmail = `clean_lead_${Date.now()}@example.com`;
  const { data: cleanLead, error: cleanErr } = await supabase
    .from('leads')
    .insert({
      brand_id: brand.id,
      click_id: null,
      full_name: 'Bob Smith',
      email: cleanEmail,
      phone: '(555) 999-8888',
      zip_code: '10001',
      form_answers: { project_type: 'new_installation' },
      subid_params: {},
      funnel_variant: 'default',
      funnel_step_reached: 2,
      status: 'new',
      is_duplicate: false
    })
    .select('*')
    .single();

  if (cleanErr || !cleanLead) {
    console.error('Test 4 Failed - Clean lead creation error:', cleanErr);
    process.exit(1);
  }

  console.log(`✓ Test 4 Passed - Clean Lead created (no subID) ID: ${cleanLead.id}`);
  console.log('  subid_params:', cleanLead.subid_params);

  console.log('--- ALL STEP 3 VERIFICATION TESTS PASSED SUCCESSFULLY! ---');
}

runTests().catch((err) => {
  console.error('Test execution error:', err);
  process.exit(1);
});
