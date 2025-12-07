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
