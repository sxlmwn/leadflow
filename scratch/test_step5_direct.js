const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://aovlzjmeqtuvdqhgjjxy.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFvdmx6am1lcXR1dmRxaGdqanh5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc2Njg4NjIsImV4cCI6MjEwMzI0NDg2Mn0.Rfz2SaL4O6A1gzPRecqWmc0SKQFRBhyCSDq4NP9bslM';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function debugDelivery() {
  const { data: brand } = await supabase.from('brands').select('id').eq('slug', 'windowhound').single();
  console.log('Brand ID:', brand.id);

  // Check buyer_brands
  const { data: bb } = await supabase.from('buyer_brands').select('*').eq('brand_id', brand.id);
  console.log('buyer_brands rows:', bb);

  if (bb.length > 0) {
    const bIds = bb.map(r => r.buyer_id);
    const { data: buyers } = await supabase.from('buyers').select('*').in('id', bIds);
    console.log('buyers found:', buyers);
  }

  // Create a dummy lead
  const { data: lead } = await supabase.from('leads').insert({
    brand_id: brand.id,
    full_name: 'Debug Lead',
    email: `debug_${Date.now()}@example.com`,
    phone: '(555) 111-2222',
    score: 100,
    dnc_flagged: false,
    is_duplicate: false
  }).select('*').single();

  console.log('Created lead:', lead.id);

  // Call /api/dev/mock-buyer directly
  try {
    const res = await fetch('http://localhost:3000/api/dev/mock-buyer?mode=accept&price=25.00', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lead_id: lead.id }),
    });
    console.log('Mock buyer status:', res.status);
    const data = await res.json();
    console.log('Mock buyer response:', data);
  } catch (e) {
    console.error('Fetch error to mock buyer:', e.message);
  }
}

debugDelivery();
