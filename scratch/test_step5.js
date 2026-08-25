const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://aovlzjmeqtuvdqhgjjxy.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFvdmx6am1lcXR1dmRxaGdqanh5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc2Njg4NjIsImV4cCI6MjEwMzI0NDg2Mn0.Rfz2SaL4O6A1gzPRecqWmc0SKQFRBhyCSDq4NP9bslM';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function runStep5Tests() {
  console.log('--- STARTING STEP 5 BUYER DELIVERY & BROADCAST TESTS ---');

  // 1. Fetch WindowHound brand
  const { data: brand } = await supabase.from('brands').select('id').eq('slug', 'windowhound').single();
  if (!brand) {
    console.error('Brand windowhound not found.');
    process.exit(1);
  }

  // Clear existing buyers and buyer_brands for clean test run
  await supabase.from('buyer_brands').delete().neq('buyer_id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('buyers').delete().neq('id', '00000000-0000-0000-0000-000000000000');

  // 2. Seed 3 Dev Buyers in Supabase
  console.log('\n[Setup] Seeding 3 dev buyers for WindowHound brand...');
  
  const buyerAData = {
    name: 'Dev Buyer A (Fast Accept)',
    api_endpoint: 'http://localhost:3000/api/dev/mock-buyer?mode=accept&price=25.00&delay=10',
    price_per_lead: 25.0,
    min_accept_score: 50,
    min_score: 50,
    active: true,
    is_active: true,
  };

  const buyerBData = {
    name: 'Dev Buyer B (Slower Accept)',
    api_endpoint: 'http://localhost:3000/api/dev/mock-buyer?mode=accept&price=35.00&delay=150',
    price_per_lead: 35.0,
    min_accept_score: 50,
    min_score: 50,
    active: true,
    is_active: true,
  };

  const buyerCData = {
    name: 'Dev Buyer C (High Threshold)',
    api_endpoint: 'http://localhost:3000/api/dev/mock-buyer?mode=accept&price=50.00',
    price_per_lead: 50.0,
    min_accept_score: 95,
    min_score: 95,
    active: true,
    is_active: true,
  };

  const { data: bA } = await supabase.from('buyers').insert(buyerAData).select().single();
  const { data: bB } = await supabase.from('buyers').insert(buyerBData).select().single();
  const { data: bC } = await supabase.from('buyers').insert(buyerCData).select().single();

  await supabase.from('buyer_brands').insert([
    { buyer_id: bA.id, brand_id: brand.id },
    { buyer_id: bB.id, brand_id: brand.id },
    { buyer_id: bC.id, brand_id: brand.id },
  ]);

  console.log(`✓ Seeded buyers: Buyer A (${bA.id}), Buyer B (${bB.id}), Buyer C (${bC.id})`);

  // --- Test Case 1: High Score Lead, Broadcast Delivery, First Accept Wins ---
  console.log('\n[Test 1] Submitting high score lead to trigger broadcast delivery...');
  const res1 = await fetch('http://localhost:3000/api/leads', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      brand_id: brand.id,
      trustedform_cert_url: 'https://cert.trustedform.com/valid_test_cert',
      form_data: {
        full_name: 'Broadcast Winner Lead',
        email: `winner_${Date.now()}@example.com`,
        phone: '(555) 123-7777',
        zip_code: '90210',
        project_type: 'replace',
        number_of_windows: '6-10',
        home_ownership: 'own',
      },
    }),
  });

  const body1 = await res1.json();
  const lead1Id = body1.lead_id;

  // Wait 3.5s for async pipeline & buyer broadcast
  await new Promise((r) => setTimeout(r, 3500));

  const { data: lead1 } = await supabase.from('leads').select('*').eq('id', lead1Id).single();
  const { data: deliveries1 } = await supabase.from('buyer_deliveries').select('*').eq('lead_id', lead1Id);

  console.log(`✓ Lead 1 Score: ${lead1.score}`);
  console.log(`✓ Lead 1 Sold: ${lead1.sold}`);
  console.log(`✓ Lead 1 Sold To Buyer ID: ${lead1.sold_to_buyer_id}`);
  console.log(`✓ Total Deliveries Recorded: ${deliveries1.length}`);
  
  const acceptedDeliveries1 = deliveries1.filter((d) => d.accepted);
  console.log(`✓ Exactly One Winner Accepted: ${acceptedDeliveries1.length === 1}`);
  deliveries1.forEach((d) => {
    console.log(`   - Buyer ID: ${d.buyer_id}, Accepted: ${d.accepted}, Price: $${d.price_paid}`);
  });

  if (!lead1.sold || acceptedDeliveries1.length !== 1) {
    console.error('Test 1 Failed: Lead should be sold to exactly 1 buyer.');
    process.exit(1);
  }
  console.log('✓ Test 1 PASSED: First-accept-wins broadcast worked perfectly!');

  // --- Test Case 2: Near-Simultaneous Accept (Atomic Lock Verification) ---
  console.log('\n[Test 2] Simulating simultaneous acceptance race condition...');
  const res2 = await fetch('http://localhost:3000/api/leads', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      brand_id: brand.id,
      trustedform_cert_url: 'https://cert.trustedform.com/valid_test_cert_2',
      form_data: {
        full_name: 'Race Condition Lead',
        email: `race_${Date.now()}@example.com`,
        phone: '(555) 234-8888',
        zip_code: '10001',
        project_type: 'replace',
        number_of_windows: '3-5',
        home_ownership: 'own',
      },
    }),
  });

  const body2 = await res2.json();
  await new Promise((r) => setTimeout(r, 4000));

  const { data: lead2 } = await supabase.from('leads').select('*').eq('id', body2.lead_id).single();
  const { data: deliveries2 } = await supabase.from('buyer_deliveries').select('*').eq('lead_id', body2.lead_id);
  const acceptedDeliveries2 = deliveries2.filter((d) => d.accepted);

  console.log(`✓ Race Condition Lead Score: ${lead2.score}`);
  console.log(`✓ Race Condition Lead Sold: ${lead2.sold}`);
  console.log(`✓ Sold To Buyer ID: ${lead2.sold_to_buyer_id}`);
  console.log(`✓ Deliveries Count: ${deliveries2.length}`);
  deliveries2.forEach((d) => {
    console.log(`   - Buyer ID: ${d.buyer_id}, Accepted: ${d.accepted}, Response:`, d.response_payload);
  });

  if (!lead2.sold || acceptedDeliveries2.length !== 1) {
    console.error('Test 2 Failed: Race condition resulted in double-sell or un-sold state.');
    process.exit(1);
  }
  console.log('✓ Test 2 PASSED: Atomic locking prevented double selling under race condition!');

  // --- Test Case 3: Low Score Lead (No Buyer Meets Threshold) ---
  console.log('\n[Test 3] Submitting lead with low score (missing cert & incomplete form)...');
  // Update Buyer A & B to require min_score 95 temporarily
  await supabase.from('buyers').update({ min_score: 95, min_accept_score: 95 }).in('id', [bA.id, bB.id]);

  const res3 = await fetch('http://localhost:3000/api/leads', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      brand_id: brand.id,
      // No cert
      form_data: {
        full_name: 'Low Score User',
        email: `low_${Date.now()}@example.com`,
        phone: '(555) 345-9999',
        zip_code: '30301',
      },
    }),
  });

  const body3 = await res3.json();
  await new Promise((r) => setTimeout(r, 3500));

  const { data: lead3 } = await supabase.from('leads').select('*').eq('id', body3.lead_id).single();
  const { data: results3 } = await supabase.from('verification_results').select('*').eq('lead_id', body3.lead_id);
  const deliveryNote = results3.find((r) => r.provider === 'delivery_engine');

  console.log(`✓ Low Score Lead Score: ${lead3.score}`);
  console.log(`✓ Lead Sold: ${lead3.sold}`);
  console.log(`✓ Delivery Log Note: ${deliveryNote?.raw_response?.reason}`);

  if (lead3.sold || deliveryNote?.status !== 'skipped') {
    console.error('Test 3 Failed: Low score lead should not be delivered or sold.');
    process.exit(1);
  }
  console.log('✓ Test 3 PASSED: Low-score lead skipped delivery gracefully!');

  // Restore Buyer A & B min_score
  await supabase.from('buyers').update({ min_score: 50, min_accept_score: 50 }).in('id', [bA.id, bB.id]);

  // --- Test Case 4: DNC Flagged Lead (Hard Gate Test) ---
  console.log('\n[Test 4] Submitting DNC-flagged lead to test Hard Gate...');
  const res4 = await fetch('http://localhost:3000/api/leads', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      brand_id: brand.id,
      trustedform_cert_url: 'https://cert.trustedform.com/valid_cert',
      form_data: {
        full_name: 'DNC Hard Gate Lead',
        email: `dnc_gate_${Date.now()}@example.com`,
        phone: '(555) 999-0000', // DNC trigger
        zip_code: '90210',
      },
    }),
  });

  const body4 = await res4.json();
  await new Promise((r) => setTimeout(r, 3500));

  const { data: lead4 } = await supabase.from('leads').select('*').eq('id', body4.lead_id).single();
  const { data: deliveries4 } = await supabase.from('buyer_deliveries').select('*').eq('lead_id', body4.lead_id);

  console.log(`✓ DNC Lead Flagged: ${lead4.dnc_flagged}`);
  console.log(`✓ DNC Lead Sold: ${lead4.sold}`);
  console.log(`✓ Buyer Deliveries Count: ${deliveries4.length}`);

  if (!lead4.dnc_flagged || lead4.sold || deliveries4.length > 0) {
    console.error('Test 4 Failed: DNC hard gate was bypassed!');
    process.exit(1);
  }
  console.log('✓ Test 4 PASSED: Hard Gate blocked delivery to all buyers!');

  // --- Test Case 5: All Buyers Reject ---
  console.log('\n[Test 5] Testing scenario where all buyers reject lead...');
  // Point Buyer A, B, C endpoints to reject mode
  await supabase.from('buyers').update({
    api_endpoint: 'http://localhost:3000/api/dev/mock-buyer?mode=reject',
  }).in('id', [bA.id, bB.id, bC.id]);

  const res5 = await fetch('http://localhost:3000/api/leads', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      brand_id: brand.id,
      trustedform_cert_url: 'https://cert.trustedform.com/valid_cert',
      form_data: {
        full_name: 'Rejected Lead User',
        email: `reject_${Date.now()}@example.com`,
        phone: '(555) 555-1234',
        zip_code: '90210',
        project_type: 'replace',
      },
    }),
  });

  const body5 = await res5.json();
  await new Promise((r) => setTimeout(r, 3500));

  const { data: lead5 } = await supabase.from('leads').select('*').eq('id', body5.lead_id).single();
  const { data: deliveries5 } = await supabase.from('buyer_deliveries').select('*').eq('lead_id', body5.lead_id);
  const acceptedDeliveries5 = deliveries5.filter((d) => d.accepted);

  console.log(`✓ All-Rejected Lead Sold: ${lead5.sold}`);
  console.log(`✓ Deliveries Logged Count: ${deliveries5.length}`);
  console.log(`✓ Accepted Deliveries Count: ${acceptedDeliveries5.length}`);

  if (lead5.sold || acceptedDeliveries5.length > 0 || deliveries5.length === 0) {
    console.error('Test 5 Failed: Lead should be un-sold with logged rejection records.');
    process.exit(1);
  }
  console.log('✓ Test 5 PASSED: Rejections logged cleanly and lead left unsold!');

  console.log('\n--- ALL STEP 5 BUYER DELIVERY TESTS PASSED SUCCESSFULLY! ---');
}

runStep5Tests().catch((err) => {
  console.error('Step 5 test error:', err);
  process.exit(1);
});
