import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

async function sendWhatsAppNotification(phone: string, message: string) {
  if (!phone) return;
  try {
    // Callmebot free WhatsApp API
    const encoded = encodeURIComponent(message);
    await fetch(
      `https://api.callmebot.com/whatsapp.php?phone=${phone}&text=${encoded}&apikey=get_from_callmebot`,
      { method: "GET" }
    );
  } catch {
    // Non-critical — don't fail the order if notification fails
    console.warn("WhatsApp notification failed");
  }
}

export async function POST(req: NextRequest) {
  const supabase = getServiceClient();
  const body = await req.json();

  // Insert the order
  const { data: order, error } = await supabase.from("orders").insert(body).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  // Fetch the WhatsApp notification number from site_settings
  const { data: settings } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", "order_notification_whatsapp")
    .single();

  const notifyPhone = settings?.value ?? "";

  if (notifyPhone) {
    const items = Array.isArray(body.items)
      ? (body.items as Record<string, string | number>[]).map(i => `${i.garment || "Item"} ×${i.quantity || 1}`).join(", ")
      : "Custom order";

    const message =
      `🆕 New BASE9 Order!\n` +
      `Customer: ${body.customer_name}\n` +
      `Phone: ${body.customer_phone || body.whatsapp || "—"}\n` +
      `Items: ${items}\n` +
      `Total: ₦${Number(body.total).toLocaleString("en-NG")}\n` +
      `Design: ${body.custom_design_url ? "Custom upload" : body.selected_design_url ? "Library design" : "None"}\n` +
      `View: https://base9-store.vercel.app/admin`;

    await sendWhatsAppNotification(notifyPhone, message);
  }

  return NextResponse.json({ success: true, id: order.id });
}
