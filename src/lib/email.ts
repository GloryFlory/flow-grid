import { Resend } from 'resend';

/**
 * Normalize email address to lowercase for case-insensitive comparison
 */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export interface PasswordResetEmailProps {
  to: string;
  resetUrl: string;
  userName?: string;
}

export async function sendPasswordResetEmail({ to, resetUrl, userName }: PasswordResetEmailProps) {
  if (!process.env.RESEND_API_KEY) {
    console.error('RESEND_API_KEY is not configured');
    throw new Error('Email service not configured');
  }

  // Initialize Resend with API key
  const resend = new Resend(process.env.RESEND_API_KEY);
  const fromEmail = process.env.FROM_EMAIL || 'onboarding@resend.dev';

  try {
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to,
      subject: 'Reset your password',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reset your password</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; margin-bottom: 30px;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Reset Your Password</h1>
          </div>
          
          <div style="padding: 0 20px;">
            <p style="font-size: 16px; margin-bottom: 20px;">
              ${userName ? `Hi ${userName},` : 'Hi there,'}
            </p>
            
            <p style="font-size: 16px; margin-bottom: 20px;">
              We received a request to reset your password. Click the button below to create a new password:
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" 
                 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                        color: white; 
                        padding: 12px 30px; 
                        text-decoration: none; 
                        border-radius: 5px; 
                        font-size: 16px; 
                        font-weight: bold;
                        display: inline-block;">
                Reset Password
              </a>
            </div>
            
            <p style="font-size: 14px; color: #666; margin-top: 30px;">
              This link will expire in 1 hour for security reasons.
            </p>
            
            <p style="font-size: 14px; color: #666; margin-top: 20px;">
              If you didn't request this password reset, you can safely ignore this email. Your password will remain unchanged.
            </p>
            
            <hr style="border: none; height: 1px; background: #eee; margin: 30px 0;">
            
            <p style="font-size: 12px; color: #999; text-align: center;">
              If the button doesn't work, copy and paste this link into your browser:<br>
              <span style="word-break: break-all;">${resetUrl}</span>
            </p>
          </div>
        </body>
        </html>
      `,
    });

    if (error) {
      console.error('Resend email error:', error);
      throw new Error('Failed to send email');
    }

    console.log('✅ Password reset email sent successfully:', data);
    return data;
  } catch (error) {
    console.error('❌ Failed to send password reset email:', error);
    throw error;
  }
}

export interface WaitlistSpotEmailProps {
  to: string;
  userName: string;
  sessionTitle: string;
  sessionDate: string;
  sessionTime: string;
  festivalName: string;
  festivalLogo?: string;
  primaryColor?: string; // Festival's primary brand color
  accentColor?: string;  // Festival's accent color
  claimUrl: string;
  expiresIn: string; // e.g., "2 hours", "30 minutes"
  isPro?: boolean; // If true, hide Flow Grid branding (white-label)
}

export async function sendWaitlistSpotEmail({
  to,
  userName,
  sessionTitle,
  sessionDate,
  sessionTime,
  festivalName,
  festivalLogo,
  primaryColor = '#4a90e2', // Default blue
  accentColor = '#ff6b6b',  // Default coral
  claimUrl,
  expiresIn,
  isPro = false,
}: WaitlistSpotEmailProps) {
  if (!process.env.RESEND_API_KEY) {
    console.error('RESEND_API_KEY is not configured');
    throw new Error('Email service not configured');
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const fromEmail = process.env.FROM_EMAIL || 'onboarding@resend.dev';

  // Helper to darken a hex color
  const darkenColor = (hex: string, percent: number): string => {
    const num = parseInt(hex.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.max((num >> 16) - amt, 0);
    const G = Math.max((num >> 8 & 0x00FF) - amt, 0);
    const B = Math.max((num & 0x0000FF) - amt, 0);
    return `#${(0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)}`;
  };

  // Helper to lighten a hex color (for backgrounds)
  const lightenColor = (hex: string, percent: number): string => {
    const num = parseInt(hex.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.min((num >> 16) + amt, 255);
    const G = Math.min((num >> 8 & 0x00FF) + amt, 255);
    const B = Math.min((num & 0x0000FF) + amt, 255);
    return `#${(0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)}`;
  };

  // Helper to add alpha to hex color
  const hexToRgba = (hex: string, alpha: number): string => {
    const num = parseInt(hex.replace('#', ''), 16);
    const R = (num >> 16);
    const G = (num >> 8 & 0x00FF);
    const B = (num & 0x0000FF);
    return `rgba(${R}, ${G}, ${B}, ${alpha})`;
  };

  // Generate color variants from primary color
  const primaryDark = darkenColor(primaryColor, 15);
  const primaryLight = lightenColor(primaryColor, 45);
  const primaryLighter = lightenColor(primaryColor, 50);

  // Build event logo HTML if available
  const eventLogoHtml = festivalLogo 
    ? `<img src="${festivalLogo}" alt="${festivalName}" style="max-height: 60px; max-width: 200px; margin-bottom: 15px;" />`
    : '';

  // Flow Grid branding - only show for non-Pro users
  const flowGridHeader = isPro ? '' : `
          <!-- Flow Grid Header (Free tier branding) -->
          <div style="text-align: center; padding: 16px 0 8px 0;">
            <a href="https://tryflowgrid.com" style="text-decoration: none;">
              <img src="https://tryflowgrid.com/flow-grid-logo.png" alt="Flow Grid" style="height: 24px;" onerror="this.outerHTML='<span style=\\'font-size: 18px; font-weight: 600; color: #6366f1;\\'>Flow Grid</span>'" />
            </a>
          </div>`;

  const flowGridFooter = isPro ? '' : `
          <!-- Footer (Free tier branding) -->
          <div style="text-align: center; padding: 24px 0;">
            <p style="font-size: 12px; color: #9ca3af; margin: 0;">
              Powered by <a href="https://tryflowgrid.com" style="color: #6366f1; text-decoration: none; font-weight: 500;">Flow Grid</a>
            </p>
          </div>`;

  try {
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to,
      subject: `🎉 A spot opened up in "${sessionTitle}"!`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>A spot opened up!</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
          ${flowGridHeader}
          
          <!-- Main Card -->
          <div style="background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.07), 0 1px 3px rgba(0,0,0,0.1);">
            <!-- Header with Festival Brand Colors -->
            <div style="background: linear-gradient(135deg, ${primaryColor} 0%, ${primaryDark} 100%); padding: 30px; text-align: center;">
              ${eventLogoHtml}
              <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 600;">🎉 Great news!</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 16px;">A spot just opened up</p>
            </div>
            
            <!-- Content -->
            <div style="padding: 30px;">
              <p style="font-size: 16px; margin: 0 0 20px 0; color: #374151;">
                Hi ${userName},
              </p>
              
              <p style="font-size: 16px; margin: 0 0 20px 0; color: #374151;">
                Someone cancelled their booking, and you're first in line for:
              </p>
              
              <!-- Session Card - Neutral styling -->
              <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin: 24px 0;">
                <h2 style="margin: 0 0 8px 0; color: #1e293b; font-size: 20px; font-weight: 600;">${sessionTitle}</h2>
                <p style="margin: 4px 0; color: #475569; font-size: 15px;">
                  📅 ${sessionDate} at ${sessionTime}
                </p>
                <p style="margin: 4px 0; color: #64748b; font-size: 14px;">
                  📍 ${festivalName}
                </p>
              </div>
              
              <!-- CTA Button with Brand Color -->
              <div style="text-align: center; margin: 32px 0;">
                <a href="${claimUrl}" 
                   style="background: linear-gradient(135deg, ${primaryColor} 0%, ${primaryDark} 100%); 
                          color: white; 
                          padding: 16px 40px; 
                          text-decoration: none; 
                          border-radius: 10px; 
                          font-size: 17px;
                          font-weight: 600;
                          display: inline-block;
                          box-shadow: 0 4px 14px ${hexToRgba(primaryColor, 0.35)};">
                  Claim Your Spot →
                </a>
              </div>
              
              <!-- Urgency Notice - Neutral red/amber -->
              <div style="background: #fef3c7; border: 1px solid #fcd34d; border-radius: 10px; padding: 16px; text-align: center;">
                <p style="font-size: 14px; color: #92400e; margin: 0;">
                  ⏰ <strong>This offer expires in ${expiresIn}.</strong><br>
                  <span style="color: #a16207;">If you don't claim it, the spot goes to the next person.</span>
                </p>
              </div>
              
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 28px 0;">
              
              <p style="font-size: 13px; color: #6b7280; text-align: center; margin: 0;">
                Already booked on another device? You can ignore this email.<br>
                <span style="color: #9ca3af;">Having trouble? Just reply to this email.</span>
              </p>
            </div>
          </div>
          ${flowGridFooter}
        </body>
        </html>
      `,
    });

    if (error) {
      console.error('Resend email error:', error);
      throw new Error('Failed to send waitlist notification email');
    }

    console.log('✅ Waitlist spot email sent successfully:', data);
    return data;
  } catch (error) {
    console.error('❌ Failed to send waitlist spot email:', error);
    throw error;
  }
}

export interface TeamInviteEmailProps {
  to: string;
  festivalName: string;
  festivalLogoUrl?: string;
  inviterName: string;
  role: string;
  acceptUrl: string;
}

export async function sendTeamInviteEmail({
  to,
  festivalName,
  festivalLogoUrl,
  inviterName,
  role,
  acceptUrl
}: TeamInviteEmailProps) {
  if (!process.env.RESEND_API_KEY) {
    console.error('RESEND_API_KEY is not configured');
    throw new Error('Email service not configured');
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const fromEmail = process.env.FROM_EMAIL || 'onboarding@resend.dev';

  // Role descriptions
  const roleDescriptions: Record<string, string> = {
    ADMIN: 'Full access to manage the festival, team members, and all settings',
    EDITOR: 'Can edit sessions, teachers, and content (cannot manage team or settings)',
    VIEWER: 'Read-only access to view the dashboard and analytics'
  };

  const flowGridFooter = `
    <div style="text-align: center; padding: 24px 0; margin-top: 30px; border-top: 1px solid #e5e7eb;">
      <p style="font-size: 12px; color: #9ca3af; margin: 0;">
        Powered by <a href="https://tryflowgrid.com" style="color: #6366f1; text-decoration: none; font-weight: 500;">Flow Grid</a>
      </p>
    </div>`;

  try {
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to,
      subject: `You've been invited to collaborate on ${festivalName}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Team Invitation</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
            ${festivalLogoUrl ? `
              <div style="margin-bottom: 20px;">
                <img src="${festivalLogoUrl}" 
                     alt="${festivalName} logo" 
                     style="max-width: 150px; max-height: 150px; border-radius: 8px;">
              </div>
            ` : ''}
            <h1 style="color: white; margin: 0; font-size: 28px;">You're Invited!</h1>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px;">
            <p style="font-size: 16px; margin-bottom: 20px;">
              <strong>${inviterName}</strong> has invited you to collaborate on <strong>${festivalName}</strong> on Flow Grid.
            </p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #667eea;">
              <p style="margin: 0 0 10px 0; font-size: 14px; color: #666;">Your role:</p>
              <p style="margin: 0; font-size: 18px; font-weight: bold; color: #667eea;">${role}</p>
              <p style="margin: 10px 0 0 0; font-size: 14px; color: #666;">${roleDescriptions[role] || ''}</p>
            </div>

            <p style="font-size: 16px; margin-bottom: 25px;">
              Accept this invitation to start collaborating with your team on Flow Grid.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${acceptUrl}" 
                 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                        color: white; 
                        padding: 14px 32px; 
                        text-decoration: none; 
                        border-radius: 6px; 
                        font-weight: bold; 
                        font-size: 16px;
                        display: inline-block;">
                Accept Invitation
              </a>
            </div>
            
            <p style="font-size: 14px; color: #666; margin-top: 30px; text-align: center;">
              Or copy and paste this link into your browser:<br>
              <a href="${acceptUrl}" style="color: #667eea; word-break: break-all;">${acceptUrl}</a>
            </p>

            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
              <p style="font-size: 14px; color: #666; margin: 0;">
                If you didn't expect this invitation, you can safely ignore this email.
              </p>
            </div>
          </div>
          
          ${flowGridFooter}
        </body>
        </html>
      `,
    });

    if (error) {
      console.error('Resend team invite email error:', error);
      throw new Error('Failed to send team invitation email');
    }

    console.log('✅ Team invitation email sent successfully:', data);
    return data;
  } catch (error) {
    console.error('❌ Failed to send team invitation email:', error);
    throw error;
  }
}

export interface WebinarSignupConfirmationProps {
  to: string;
  firstName?: string;
  festivalName: string;
  festivalLogo?: string;
  primaryColor?: string;
  headline: string;
  description?: string;
  webinarDate?: Date;
  webinarDuration?: number;
  webinarLink?: string;
  speakerName?: string;
  speakerTitle?: string;
  calendarUrl?: string;
  unsubscribeUrl: string;
}

export async function sendWebinarSignupConfirmation({
  to,
  firstName,
  festivalName,
  festivalLogo,
  primaryColor = '#4a90e2',
  headline,
  description,
  webinarDate,
  webinarDuration,
  webinarLink,
  speakerName,
  speakerTitle,
  calendarUrl,
  unsubscribeUrl,
}: WebinarSignupConfirmationProps) {
  if (!process.env.RESEND_API_KEY) {
    console.error('RESEND_API_KEY is not configured');
    throw new Error('Email service not configured');
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const fromEmail = process.env.FROM_EMAIL || 'onboarding@resend.dev';

  const darkenColor = (hex: string, percent: number): string => {
    const num = parseInt(hex.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.max((num >> 16) - amt, 0);
    const G = Math.max((num >> 8 & 0x00FF) - amt, 0);
    const B = Math.max((num & 0x0000FF) - amt, 0);
    return `#${(0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)}`;
  };

  const primaryDark = darkenColor(primaryColor, 15);

  const logoHtml = festivalLogo
    ? `<img src="${festivalLogo}" alt="${festivalName}" style="max-height: 56px; max-width: 180px; margin-bottom: 12px;" /><br/>`
    : '';

  // Format date nicely
  const formattedDate = webinarDate
    ? webinarDate.toLocaleDateString('en-GB', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
      })
    : null;
  const formattedTime = webinarDate
    ? webinarDate.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZoneName: 'short' })
    : null;

  // Google Calendar link
  const googleCalendarUrl = webinarDate ? (() => {
    const start = webinarDate.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    const endDate = new Date(webinarDate.getTime() + (webinarDuration || 60) * 60 * 1000);
    const end = endDate.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: headline,
      dates: `${start}/${end}`,
      details: [description, webinarLink ? `Join: ${webinarLink}` : ''].filter(Boolean).join('\n\n'),
      ...(webinarLink ? { location: webinarLink } : {}),
    });
    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  })() : null;

  const webinarDetailsHtml = `
    <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin: 24px 0;">
      <p style="margin: 0 0 12px 0; font-size: 13px; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600;">Webinar Details</p>
      <p style="margin: 0 0 8px 0; font-size: 17px; color: #1e293b; font-weight: 700;">${headline}</p>
      ${description ? `<p style="margin: 0 0 12px 0; color: #475569; font-size: 14px; line-height: 1.6;">${description}</p>` : ''}
      ${formattedDate ? `<p style="margin: 6px 0; color: #475569; font-size: 14px;"><strong>Date:</strong> ${formattedDate}</p>` : ''}
      ${formattedTime ? `<p style="margin: 6px 0; color: #475569; font-size: 14px;"><strong>Time:</strong> ${formattedTime}${webinarDuration ? ` &middot; ${webinarDuration} min` : ''}</p>` : ''}
      ${speakerName ? `<p style="margin: 6px 0; color: #475569; font-size: 14px;"><strong>Hosted by:</strong> ${speakerName}${speakerTitle ? `, ${speakerTitle}` : ''}</p>` : ''}
    </div>
  `;

  const joinButtonHtml = webinarLink ? `
    <div style="text-align: center; margin: 28px 0 16px 0;">
      <a href="${webinarLink}"
         style="background: linear-gradient(135deg, ${primaryColor} 0%, ${primaryDark} 100%);
                color: white;
                padding: 14px 36px;
                text-decoration: none;
                border-radius: 10px;
                font-size: 16px;
                font-weight: 600;
                display: inline-block;">
        Join Webinar
      </a>
    </div>
    <p style="font-size: 12px; color: #9ca3af; text-align: center; margin: 0 0 24px 0;">
      Or copy this link: <a href="${webinarLink}" style="color: #6b7280; word-break: break-all;">${webinarLink}</a>
    </p>
  ` : '';

  const calendarLinksHtml = (googleCalendarUrl || calendarUrl) ? `
    <div style="background: #f8fafc; border-radius: 10px; padding: 16px; margin: 0 0 24px 0; text-align: center;">
      <p style="font-size: 13px; color: #64748b; margin: 0 0 10px 0; font-weight: 600;">Add to your calendar</p>
      <div style="display: inline-flex; gap: 8px; flex-wrap: wrap; justify-content: center;">
        ${googleCalendarUrl ? `<a href="${googleCalendarUrl}" target="_blank" style="display: inline-block; padding: 8px 16px; background: white; border: 1px solid #e2e8f0; border-radius: 8px; text-decoration: none; color: #374151; font-size: 13px; font-weight: 500;">Google Calendar</a>` : ''}
        ${calendarUrl ? `<a href="${calendarUrl}" style="display: inline-block; padding: 8px 16px; background: white; border: 1px solid #e2e8f0; border-radius: 8px; text-decoration: none; color: #374151; font-size: 13px; font-weight: 500;">Apple / Outlook (.ics)</a>` : ''}
      </div>
    </div>
  ` : '';

  try {
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to,
      subject: `You're signed up: ${headline}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Signup confirmed</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
          <div style="background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.07);">
            <div style="background: linear-gradient(135deg, ${primaryColor} 0%, ${primaryDark} 100%); padding: 32px; text-align: center;">
              ${logoHtml}
              <h1 style="color: white; margin: 0; font-size: 22px; font-weight: 700;">You're confirmed!</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 15px;">${festivalName}</p>
            </div>
            <div style="padding: 32px;">
              <p style="font-size: 16px; margin: 0 0 4px 0; color: #374151;">
                ${firstName ? `Hi ${firstName},` : 'Hi there,'}
              </p>
              <p style="font-size: 15px; margin: 0 0 20px 0; color: #6b7280;">
                Here are all the details for your upcoming webinar.
              </p>
              ${webinarDetailsHtml}
              ${joinButtonHtml}
              ${calendarLinksHtml}
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0 20px 0;">
              <p style="font-size: 12px; color: #9ca3af; text-align: center; margin: 0;">
                You signed up at ${festivalName}. &nbsp;
                <a href="${unsubscribeUrl}" style="color: #9ca3af;">Unsubscribe</a>
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    if (error) {
      console.error('Resend webinar confirmation error:', error);
      throw new Error('Failed to send webinar signup confirmation');
    }

    console.log('✅ Webinar signup confirmation sent successfully:', data);
    return data;
  } catch (error) {
    console.error('❌ Failed to send webinar signup confirmation:', error);
    throw error;
  }
}

const SIGNUP_NOTIFICATION_COPY: Record<string, { subject: string; verb: string }> = {
  WEBINAR:          { subject: 'New webinar signup',          verb: 'signed up for your webinar' },
  EARLY_BIRD:       { subject: 'New early bird signup',       verb: 'joined your early bird list' },
  WAITLIST:         { subject: 'New waitlist signup',         verb: 'joined your waitlist' },
  RETREAT_INTEREST: { subject: 'New retreat interest',        verb: 'expressed interest in your retreat' },
  VOLUNTEER:        { subject: 'New volunteer application',   verb: 'applied to volunteer' },
  SCHOLARSHIP:      { subject: 'New scholarship application', verb: 'applied for a scholarship' },
  DISCOVERY_CALL:   { subject: 'New discovery call request',  verb: 'requested a discovery call' },
}

export async function sendSignupNotificationToOrganiser({
  to,
  pageType,
  pageTitle,
  festivalName,
  festivalId,
  pageId,
  subscriberFirstName,
  subscriberLastName,
  subscriberEmail,
  appUrl,
}: {
  to: string
  pageType: string
  pageTitle: string
  festivalName: string
  festivalId: string
  pageId: string
  subscriberFirstName?: string
  subscriberLastName?: string
  subscriberEmail: string
  appUrl: string
}) {
  if (!process.env.RESEND_API_KEY) return

  const resend = new Resend(process.env.RESEND_API_KEY)
  const fromEmail = process.env.FROM_EMAIL || 'onboarding@resend.dev'
  const copy = SIGNUP_NOTIFICATION_COPY[pageType] ?? SIGNUP_NOTIFICATION_COPY.WEBINAR

  const name = [subscriberFirstName, subscriberLastName].filter(Boolean).join(' ') || subscriberEmail
  const subject = `${copy.subject} — ${name}`
  const subscribersUrl = `${appUrl}/dashboard/festivals/${festivalId}/landing-pages/${pageId}?tab=subscribers`

  try {
    await resend.emails.send({
      from: fromEmail,
      to,
      subject,
      html: `
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f9fafb; margin: 0; padding: 24px;">
          <div style="max-width: 520px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
            <div style="background: #18181b; padding: 20px 28px; display: flex; align-items: center;">
              <span style="color: white; font-size: 15px; font-weight: 600;">Flow Grid</span>
              <span style="color: #71717a; font-size: 14px; margin-left: 8px;">· ${festivalName}</span>
            </div>
            <div style="padding: 28px;">
              <p style="font-size: 16px; color: #18181b; margin: 0 0 6px 0; font-weight: 600;">${name} ${copy.verb}.</p>
              <p style="font-size: 14px; color: #71717a; margin: 0 0 20px 0;">Page: <strong style="color: #374151;">${pageTitle}</strong></p>
              <table style="width: 100%; border-collapse: collapse; background: #f8fafc; border-radius: 8px; overflow: hidden; font-size: 14px;">
                <tr>
                  <td style="padding: 10px 14px; color: #6b7280; border-bottom: 1px solid #e5e7eb; width: 90px;">Name</td>
                  <td style="padding: 10px 14px; color: #111827; border-bottom: 1px solid #e5e7eb; font-weight: 500;">${name}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 14px; color: #6b7280;">Email</td>
                  <td style="padding: 10px 14px;"><a href="mailto:${subscriberEmail}" style="color: #2563eb; text-decoration: none;">${subscriberEmail}</a></td>
                </tr>
              </table>
              <div style="text-align: center; margin-top: 24px;">
                <a href="${subscribersUrl}" style="display: inline-block; background: #18181b; color: white; padding: 11px 24px; border-radius: 8px; text-decoration: none; font-size: 14px; font-weight: 500;">View all subscribers →</a>
              </div>
            </div>
            <div style="padding: 14px 28px; border-top: 1px solid #f1f5f9; text-align: center;">
              <p style="font-size: 12px; color: #9ca3af; margin: 0;">You're receiving this because you manage ${festivalName} on Flow Grid.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    })
  } catch (err) {
    console.error('Failed to send organiser notification:', err)
  }
}
