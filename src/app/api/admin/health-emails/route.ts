import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getFestivalHealthList } from '@/lib/adminAnalytics'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

// ============================================================================
// POST /api/admin/health-emails - Send health score follow-up emails
// ============================================================================

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    // Only admins can trigger health emails
    if (!session?.user?.role || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { mode = 'preview', threshold = 60, festivalIds } = await request.json()

    // Get all festivals with health scores
    const festivalHealthList = await getFestivalHealthList()

    // Filter festivals
    let targetFestivals = festivalHealthList

    // If festivalIds specified, send only to those
    if (mode === 'send' && festivalIds && Array.isArray(festivalIds)) {
      targetFestivals = festivalHealthList.filter(f => festivalIds.includes(f.id))
    } else {
      // Otherwise filter by threshold
      targetFestivals = festivalHealthList.filter(f => f.healthScore < threshold)
    }

    if (mode === 'preview') {
      // Just return what would be sent, don't actually send
      const preview = targetFestivals.map(festival => ({
        festivalId: festival.id,
        festivalName: festival.name,
        ownerEmail: festival.ownerEmail,
        healthScore: festival.healthScore,
        missingCriteria: getMissingCriteria(festival),
        emailSubject: getEmailSubject(festival),
        emailPreview: getEmailPreview(festival)
      }))

      return NextResponse.json({
        mode: 'preview',
        threshold,
        totalFestivals: festivalHealthList.length,
        lowHealthCount: targetFestivals.length,
        preview
      })
    }

    // Actually send emails
    const results = {
      sent: 0,
      failed: 0,
      errors: [] as any[]
    }

    for (const festival of targetFestivals) {
      try {
        await sendHealthScoreEmail(festival)
        results.sent++
      } catch (error: any) {
        results.failed++
        results.errors.push({
          festivalId: festival.id,
          error: error.message
        })
      }
    }

    return NextResponse.json({
      mode: 'send',
      threshold,
      totalFestivals: festivalHealthList.length,
      results
    })
  } catch (error: any) {
    console.error('Health email error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to process health emails' },
      { status: 500 }
    )
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

function getMissingCriteria(festival: any) {
  const missing = []
  
  // Safely check if breakdown exists
  if (!festival.breakdown) {
    console.warn('Festival missing breakdown:', festival.id, festival.name)
    return [{
      label: 'Unable to Load Criteria',
      description: 'Health score breakdown data is missing. Please refresh the page.',
      action: 'Refresh',
      points: 0
    }]
  }
  
  if (!festival.breakdown.published?.achieved) {
    missing.push({
      label: 'Publish Your Event',
      description: 'Your festival is in draft mode. Make it live so attendees can find it!',
      action: 'Publish Now',
      points: 25
    })
  }
  
  if (!festival.breakdown.sessions?.achieved) {
    missing.push({
      label: 'Add More Sessions',
      description: `You have ${festival.breakdown.sessions?.value || 0} sessions. Add ${Math.max(0, 10 - (festival.breakdown.sessions?.value || 0))} more to reach the recommended minimum.`,
      action: 'Add Sessions',
      points: 5
    })
  }
  
  if (!festival.breakdown.views?.achieved) {
    missing.push({
      label: 'Get More Visibility',
      description: `Your schedule has ${festival.breakdown.views?.value || 0} views. Share it on social media to reach 100+ views!`,
      action: 'Share Event',
      points: 15
    })
  }
  
  if (!festival.breakdown.branding?.achieved) {
    missing.push({
      label: 'Add Branding',
      description: 'Upload your logo and customize colors to make your event stand out.',
      action: 'Upload Logo',
      points: 20
    })
  }
  
  if (!festival.breakdown.socialLinks?.achieved) {
    missing.push({
      label: 'Add Social Media Links',
      description: 'Connect your social profiles so attendees can find you on WhatsApp, Telegram, Facebook, or Instagram.',
      action: 'Add Social Links',
      points: 10
    })
  }
  
  if (!festival.breakdown.teacherPhotos?.achieved) {
    missing.push({
      label: 'Add Facilitator Photos',
      description: 'Upload photos for your facilitators to make your schedule more engaging and personal.',
      action: 'Upload Photos',
      points: 20
    })
  }
  
  if (!festival.breakdown.shares?.achieved) {
    missing.push({
      label: 'Social Sharing',
      description: 'Get your first share! Use the share buttons to spread the word.',
      action: 'Get Share Link',
      points: 5
    })
  }
  
  return missing
}

function getEmailSubject(festival: any) {
  if (festival.healthScore < 40) {
    return `${festival.name} - Let's Get Your Event Live! 🚀`
  } else if (festival.healthScore < 60) {
    return `${festival.name} - A Few Quick Wins to Improve Your Event ✨`
  } else {
    return `${festival.name} - Almost Perfect! Here's How to Reach 100% 💪`
  }
}

function getEmailPreview(festival: any) {
  const missing = getMissingCriteria(festival)
  return `Your event health score is ${festival.healthScore}/100. ${missing[0]?.label || 'Here are some tips'} to improve it.`
}

async function sendHealthScoreEmail(festival: any) {
  const user = await prisma.user.findUnique({
    where: { id: festival.ownerId },
    select: { email: true, name: true }
  })

  if (!user?.email) {
    throw new Error('User email not found')
  }

  const missing = getMissingCriteria(festival)
  const subject = getEmailSubject(festival)
  
  // Determine health tier
  let healthTier = 'critical'
  let tierColor = '#ef4444'
  let tierEmoji = '🚨'
  if (festival.healthScore >= 60) {
    healthTier = 'good'
    tierColor = '#f59e0b'
    tierEmoji = '💪'
  } else if (festival.healthScore >= 40) {
    healthTier = 'moderate'
    tierColor = '#f97316'
    tierEmoji = '✨'
  }

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f9fafb;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: white; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); overflow: hidden;">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: white; font-size: 28px; font-weight: 600;">FlowGrid</h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              
              <!-- Greeting -->
              <p style="margin: 0 0 20px; color: #111827; font-size: 16px; line-height: 1.5;">
                Hi ${user.name || 'there'} 👋
              </p>

              <!-- Health Score Badge -->
              <div style="background-color: #f9fafb; border-radius: 8px; padding: 24px; margin-bottom: 30px; text-align: center;">
                <div style="font-size: 48px; margin-bottom: 8px;">${tierEmoji}</div>
                <div style="font-size: 14px; color: #6b7280; margin-bottom: 8px;">Event Health Score</div>
                <div style="font-size: 40px; font-weight: bold; color: ${tierColor}; margin-bottom: 8px;">${festival.healthScore}/100</div>
                <div style="font-size: 14px; color: #6b7280;">
                  ${festival.healthScore < 40 ? 'Needs Attention' : festival.healthScore < 60 ? 'Making Progress' : 'Almost There!'}
                </div>
              </div>

              <!-- Main Message -->
              <p style="margin: 0 0 20px; color: #374151; font-size: 15px; line-height: 1.6;">
                ${festival.healthScore < 40 
                  ? `We noticed <strong>${festival.name}</strong> isn't quite ready yet. Don't worry - you're just a few quick steps away from having a fully optimized event!` 
                  : festival.healthScore < 60
                  ? `You're making great progress with <strong>${festival.name}</strong>! Just ${100 - festival.healthScore} more points to reach a perfect health score.`
                  : `<strong>${festival.name}</strong> is looking great! You're so close to 100% - here's what's left:`
                }
              </p>

              <!-- Missing Criteria -->
              ${missing.length > 0 ? `
              <div style="margin: 30px 0;">
                <h2 style="margin: 0 0 20px; color: #111827; font-size: 18px; font-weight: 600;">
                  Quick Wins to Improve Your Score:
                </h2>
                
                ${missing.map(item => `
                  <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin-bottom: 16px; border-radius: 4px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                      <strong style="color: #92400e; font-size: 15px;">${item.label}</strong>
                      <span style="background-color: #f59e0b; color: white; padding: 2px 8px; border-radius: 12px; font-size: 12px; font-weight: 600;">+${item.points} pts</span>
                    </div>
                    <p style="margin: 0 0 12px; color: #78350f; font-size: 14px; line-height: 1.5;">
                      ${item.description}
                    </p>
                  </div>
                `).join('')}
              </div>
              ` : ''}

              <!-- CTA Button -->
              <div style="text-align: center; margin: 40px 0 30px;">
                <a href="${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/festivals/${festival.id}" 
                   style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
                  Go to Dashboard →
                </a>
              </div>

              <!-- Footer Note -->
              <div style="background-color: #f9fafb; border-radius: 8px; padding: 20px; margin-top: 30px;">
                <p style="margin: 0; color: #6b7280; font-size: 14px; line-height: 1.5; text-align: center;">
                  💡 <strong>Pro Tip:</strong> Events with complete information and regular updates create better experiences for your attendees!
                </p>
              </div>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 10px; color: #6b7280; font-size: 14px;">
                <strong>Have questions?</strong> Just reply to this email - we're here to help you succeed! 💬
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                Flow Grid • Your Event Management Platform
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `

  await resend.emails.send({
    from: 'Flow Grid <hello@tryflowgrid.com>',
    to: user.email,
    subject,
    html,
    replyTo: 'hello@tryflowgrid.com'
  })
}
