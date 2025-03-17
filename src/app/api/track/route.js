import { createDirectus, rest, readItems, updateItem, authentication } from '@directus/sdk';
import { NextResponse } from 'next/server';

export async function GET(req) {
  if (req.method !== 'GET') {
    return NextResponse.json({ message: 'Only GET requests allowed' }, { status: 405 });
  }

  const clickId = req?.nextUrl?.searchParams.get('clickId');
  const status = req?.nextUrl?.searchParams.get('status');

  // Validate the status
  if (!['registered', 'deposited'].includes(status)) {
    return NextResponse.json({ message: 'Invalid status value' }, { status: 400 });
  }

  // Initialize Directus client
  const client = createDirectus("http://0.0.0.0:8055/")
    .with(authentication('static', "RQ9PKeQlJJmo3jXhsP55nHCLfYfd1izt"))
    .with(rest());

  try {
    // Fetch the lead item based on ClickId
    const leads = await client.request(
      readItems('leads', {
        filter: {
          clickId: { _eq: clickId },
        },
      })
    );

    const lead = leads[0];

    if (!lead) {
      return NextResponse.json({ message: 'Lead not found' }, { status: 404 });
    }

    // Update the lead status
    await client.request(
      updateItem('leads', lead.id, {
        status: status,
      })
    );

    return NextResponse.json({ message: 'Lead status updated successfully' });
  } catch (error) {
    console.error('Error updating lead status:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}