import { NextResponse } from 'next/server';
import { Resend } from 'resend';

// Initialize Resend only if the API key is available
const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;

export async function POST(request: Request) {
  try {
    const { to, subject, html, text } = await request.json();

    if (!to || !subject || (!html && !text)) {
      return NextResponse.json(
        { error: 'Missing required fields (to, subject, html/text)' },
        { status: 400 }
      );
    }

    if (!resend) {
      console.warn('RESEND_API_KEY is not set. Email was not sent. Payload:', { to, subject });
      return NextResponse.json(
        { message: 'Email logged to console (API key missing)', success: true },
        { status: 200 }
      );
    }

    // Note: If you don't have a verified domain in Resend, you can only send to the email address associated with your Resend account.
    // For production, replace 'onboarding@resend.dev' with your verified domain or set RESEND_FROM_EMAIL in .env
    const defaultFrom = 'HostelHub <onboarding@resend.dev>';
    const from = process.env.RESEND_FROM_EMAIL || defaultFrom;
    
    const data = await resend.emails.send({
      from,
      to,
      subject,
      html: html || '',
      text: text || '',
    });

    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (error: any) {
    console.error('Error sending email:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to send email' },
      { status: 500 }
    );
  }
}
