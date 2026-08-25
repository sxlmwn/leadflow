const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://aovlzjmeqtuvdqhgjjxy.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFvdmx6am1lcXR1dmRxaGdqanh5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc2Njg4NjIsImV4cCI6MjEwMzI0NDg2Mn0.Rfz2SaL4O6A1gzPRecqWmc0SKQFRBhyCSDq4NP9bslM';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function runStep4Tests() {
  console.log('--- STARTING STEP 4 VERIFICATION & SCORING TESTS ---');

  // 1. Fetch WindowHound brand ID
  const { data: brand, error: brandErr } = await supabase
    .from('brands')
    .select('id, name')
    .eq('slug', 'windowhound')
    .single();

  if (brandErr || !brand) {
    console.error('Failed to find brand:', brandErr);
    process.exit(1);
  }

  // --- Test 1: Full High-Quality Lead Submission (TF Cert Present, Clean Phone) ---
  const lead1Email = `step4_high_score_${Date.now()}@example.com`;
  console.log('\n[Test 1] Submitting high-quality lead with TrustedForm cert & clean phone...');

  const res1 = await fetch('http://localhost:3000/api/leads', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      brand_id: brand.id,
      trustedform_cert_url: 'https://cert.trustedform.com/abc123456789',
      form_data: {
        full_name: 'High Quality User',
        email: lead1Email,
        phone: '(555) 234-5678',
        zip_code: '90210',
        project_type: 'replace',
        number_of_windows: '6-10',
        home_ownership: 'own',
      },
    }),
  });

  const body1 = await res1.json();
  if (!body1.success) {
    console.error('Test 1 failed to create lead:', body1);
    process.exit(1);
  }
  console.log('✓ Created Lead ID:', body1.lead_id);

  // Wait 1.5s for async pipeline to complete
  await new Promise((r) => setTimeout(r, 1500));

  // Check lead score & verification_results
  const { data: lead1Data } = await supabase.from('leads').select('*').eq('id', body1.lead_id).single();
  const { data: results1 } = await supabase.from('verification_results').select('*').eq('lead_id', body1.lead_id);

  console.log(`✓ Test 1 Score: ${lead1Data.score}/100`);
  console.log('✓ Test 1 Verification Results Count:', results1.length);
  results1.forEach((r) => console.log(`   - [${r.check_type}] Provider: ${r.provider}, Status: ${r.status}`));

  if (lead1Data.score < 80 || results1.length < 3) {
    console.error('Test 1 Failed: Expected score >= 80 and 3 verification records.');
    process.exit(1);
  }
  console.log('✓ Test 1 PASSED: High-quality lead scored high!');

  // --- Test 2: DNC Hit Test (Phone contains '999') ---
  const lead2Email = `step4_dnc_hit_${Date.now()}@example.com`;
  console.log('\n[Test 2] Submitting lead with DNC-listed phone number ((555) 999-0000)...');

  const res2 = await fetch('http://localhost:3000/api/leads', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      brand_id: brand.id,
      trustedform_cert_url: 'https://cert.trustedform.com/xyz987654321',
      form_data: {
        full_name: 'DNC Test User',
        email: lead2Email,
        phone: '(555) 999-0000', // Triggers DNC match
        zip_code: '10001',
        project_type: 'repair',
      },
    }),
  });

  const body2 = await res2.json();
  await new Promise((r) => setTimeout(r, 1500));

  const { data: lead2Data } = await supabase.from('leads').select('*').eq('id', body2.lead_id).single();
  const { data: results2 } = await supabase.from('verification_results').select('*').eq('lead_id', body2.lead_id);

  console.log(`✓ Test 2 Score: ${lead2Data.score}/100 (Hard Capped)`);
  console.log(`✓ Test 2 DNC Flagged: ${lead2Data.dnc_flagged}`);
  results2.forEach((r) => console.log(`   - [${r.check_type}] Provider: ${r.provider}, Status: ${r.status}`));

  if (!lead2Data.dnc_flagged || lead2Data.score > 20) {
    console.error('Test 2 Failed: DNC hit should flag lead and hard cap score at 20.');
    process.exit(1);
  }
  console.log('✓ Test 2 PASSED: DNC hit correctly capped score at 20!');

  // --- Test 3: Missing TrustedForm Cert Penalty ---
  const lead3Email = `step4_no_tf_${Date.now()}@example.com`;
  console.log('\n[Test 3] Submitting lead with missing TrustedForm cert URL...');

  const res3 = await fetch('http://localhost:3000/api/leads', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      brand_id: brand.id,
      // no trustedform_cert_url
      form_data: {
        full_name: 'No TF User',
        email: lead3Email,
        phone: '(555) 345-6789',
        zip_code: '30301',
        project_type: 'replace',
      },
    }),
  });

  const body3 = await res3.json();
  await new Promise((r) => setTimeout(r, 1500));

  const { data: lead3Data } = await supabase.from('leads').select('*').eq('id', body3.lead_id).single();
  const { data: results3 } = await supabase.from('verification_results').select('*').eq('lead_id', body3.lead_id);

  const tfRecord = results3.find((r) => r.check_type === 'trustedform');
  console.log(`✓ Test 3 Score: ${lead3Data.score}/100`);
  console.log(`✓ Test 3 TF Check Status: ${tfRecord?.status}`);

  if (tfRecord?.status !== 'skipped' || lead3Data.score >= lead1Data.score) {
    console.error('Test 3 Failed: Missing TF cert should have status skipped and lower score.');
    process.exit(1);
  }
  console.log('✓ Test 3 PASSED: Missing TrustedForm cert penalized properly!');

  console.log('\n--- ALL STEP 4 VERIFICATION & SCORING TESTS PASSED SUCCESSFULLY! ---');
}

runStep4Tests().catch((err) => {
  console.error('Step 4 test error:', err);
  process.exit(1);
});
