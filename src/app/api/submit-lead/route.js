// app/api/submit-lead/route.js

import { NextResponse } from 'next/server';
import { createDirectus, rest, readItems, createItem } from "@directus/sdk";


export async function POST(request) {
  try {
    const { name, email, phone, affiliateId, offerId, affiliateLink, apiKey } = await request.json();

    const client = createDirectus("https://track.betongreen.io/").with(rest());

    // Check for duplicate email or phone
    const existingLeads = await client.request(readItems("leads", {
      filter: {
        _or: [
          { email: { _eq: email } },
          { phone: { _eq: phone } },
        ],
      },
    }));

    if (existingLeads.length > 0) {
      return NextResponse.json({ error: "Duplicate email or phone number" }, { status: 400 });
    }

    const UID =  uuidv4(); //GENERATE

    // Scalio API call
    const scalioResponse = await fetch(`https://affiliatescfx.scaletrk.com/api/v2/network/tracker/click?api-key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        affiliate_id: affiliateId.toString(),
        offer_id: offerId.toString(),
        aff_click_id: UID,
      }),
    });


    if (!scalioResponse.ok) {
      return NextResponse.json({ error: "Scalio API error" }, { status: 500 });
    }

    //const scalioData = await scalioResponse.json();
    const clickId = UID;

    if (!clickId) {
      return NextResponse.json({ error: "Click ID not found" }, { status: 500 });
    }

    // Directus create item
    await client.request(createItem("leads", {
      name,
      email,
      phone,
      clickId,
      status: "lead",
    }));

    return NextResponse.json({ clickId, affiliateLink }); // Return clickId and affiliateLink for redirection
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}