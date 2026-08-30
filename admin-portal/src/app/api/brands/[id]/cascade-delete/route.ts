import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: brandId } = await params;
  if (!brandId) {
    return NextResponse.json({ error: "Brand ID is required" }, { status: 400 });
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);

  try {
    // 1. Fetch all lead IDs associated with this brand
    const { data: leadRows, error: leadsFetchErr } = await supabase
      .from("leads")
      .select("id")
      .eq("brand_id", brandId);

    if (leadsFetchErr) {
      throw new Error(`Failed to fetch brand leads: ${leadsFetchErr.message}`);
    }

    const leadIds = (leadRows || []).map((l) => l.id);

    // 2. Clear clicks.converted_lead_id referencing any of these leads
    if (leadIds.length > 0) {
      const { error: clearClickLeadErr } = await supabase
        .from("clicks")
        .update({ converted_lead_id: null })
        .in("converted_lead_id", leadIds);
      if (clearClickLeadErr) {
        console.warn("Warning clearing clicks.converted_lead_id:", clearClickLeadErr);
      }
    }

    // 3. Clear leads.click_id referencing clicks for this brand to eliminate circular FK dependencies
    const { error: clearLeadClickErr } = await supabase
      .from("leads")
      .update({ click_id: null })
      .eq("brand_id", brandId);
    if (clearLeadClickErr) {
      console.warn("Warning clearing leads.click_id:", clearLeadClickErr);
    }

    // 4. Delete verification_results for these leads
    if (leadIds.length > 0) {
      const { error: vErr } = await supabase
        .from("verification_results")
        .delete()
        .in("lead_id", leadIds);
      if (vErr) {
        throw new Error(`Failed to delete verification_results: ${vErr.message}`);
      }

      // 5. Delete buyer_deliveries for these leads
      const { error: dErr } = await supabase
        .from("buyer_deliveries")
        .delete()
        .in("lead_id", leadIds);
      if (dErr) {
        throw new Error(`Failed to delete buyer_deliveries: ${dErr.message}`);
      }
    }

    // 6. Delete clicks for this brand
    const { error: cErr } = await supabase
      .from("clicks")
      .delete()
      .eq("brand_id", brandId);
    if (cErr) {
      throw new Error(`Failed to delete clicks: ${cErr.message}`);
    }

    // 7. Delete leads for this brand
    const { error: lErr } = await supabase
      .from("leads")
      .delete()
      .eq("brand_id", brandId);
    if (lErr) {
      throw new Error(`Failed to delete leads: ${lErr.message}`);
    }

    // 8. Delete buyer_brands linkages for this brand
    const { error: bbErr } = await supabase
      .from("buyer_brands")
      .delete()
      .eq("brand_id", brandId);
    if (bbErr) {
      throw new Error(`Failed to delete buyer_brands: ${bbErr.message}`);
    }

    // 9. Delete the brand row itself
    const { error: bErr } = await supabase
      .from("brands")
      .delete()
      .eq("id", brandId);
    if (bErr) {
      throw new Error(`Failed to delete brand: ${bErr.message}`);
    }

    return NextResponse.json({
      success: true,
      deletedBrandId: brandId,
      deletedLeadsCount: leadIds.length,
    });
  } catch (error: any) {
    console.error("Error during cascade delete:", error);
    return NextResponse.json(
      { error: error.message || "Cascade deletion failed" },
      { status: 500 }
    );
  }
}
