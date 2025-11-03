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
