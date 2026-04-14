export const sendEmail = async (to: string, subject: string, html: string) => {
  try {
    const response = await fetch('/api/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to,
        subject,
        html,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to send email');
    }

    return data;
  } catch (error) {
    console.error('Email Service Error:', error);
    // We don't throw here to prevent email failures from breaking the main application flow
    return null;
  }
};

// --- Pre-defined Email Templates ---

export const sendBookingConfirmationEmail = async (studentEmail: string, roomNumber: string, hostelName: string) => {
  const subject = `Booking Confirmed - Room ${roomNumber}`;
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
      <h2 style="color: #0f172a; text-transform: uppercase; letter-spacing: 1px;">Booking Confirmed</h2>
      <p style="color: #475569; font-size: 16px; line-height: 1.5;">
        Great news! Your payment was successful and your booking for <strong>Room ${roomNumber}</strong> at <strong>${hostelName}</strong> is now confirmed.
      </p>
      <div style="margin-top: 30px; padding: 15px; background-color: #f8fafc; border-left: 4px solid #10b981;">
        <p style="margin: 0; color: #334155; font-size: 14px;">You can view your full booking details in your Student Dashboard.</p>
      </div>
      <p style="color: #94a3b8; font-size: 12px; margin-top: 40px; text-align: center;">
        &copy; ${new Date().getFullYear()} HostelHub. All rights reserved.
      </p>
    </div>
  `;
  return sendEmail(studentEmail, subject, html);
};

export const sendManagerVerificationEmail = async (managerEmail: string, status: 'verified' | 'rejected', notes?: string) => {
  const isVerified = status === 'verified';
  const subject = isVerified ? 'HostelHub - Account Verified!' : 'HostelHub - Verification Update';
  
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
      <h2 style="color: ${isVerified ? '#10b981' : '#ef4444'}; text-transform: uppercase; letter-spacing: 1px;">
        Verification ${isVerified ? 'Approved' : 'Rejected'}
      </h2>
      <p style="color: #475569; font-size: 16px; line-height: 1.5;">
        ${isVerified 
          ? 'Congratulations! Your manager account has been verified. You can now log in to your dashboard and start listing your hostels.' 
          : 'Unfortunately, your recent verification application was rejected.'}
      </p>
      ${!isVerified && notes ? `
        <div style="margin-top: 20px; padding: 15px; background-color: #fef2f2; border-left: 4px solid #ef4444;">
          <p style="margin: 0; color: #991b1b; font-size: 14px;"><strong>Admin Notes:</strong> ${notes}</p>
        </div>
        <p style="color: #475569; font-size: 14px; margin-top: 20px;">Please log in to your dashboard to submit a new application with the requested corrections.</p>
      ` : ''}
      <p style="color: #94a3b8; font-size: 12px; margin-top: 40px; text-align: center;">
        &copy; ${new Date().getFullYear()} HostelHub. All rights reserved.
      </p>
    </div>
  `;
  return sendEmail(managerEmail, subject, html);
};
