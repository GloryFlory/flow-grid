import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      name,
      email,
      phone,
      company,
      role,
      festivalsPerYear,
      typicalFestivalSize,
      currentSolution,
      biggestChallenge,
      timeline,
      additionalNotes,
      source
    } = body

    // Validate required fields
    if (!name || !email) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      )
    }

    // Save to database
    const inquiry = await prisma.salesInquiry.create({
      data: {
        name,
        email,
        phone: phone || null,
        company: company || null,
        role: role || null,
        festivalsPerYear: festivalsPerYear || null,
        typicalFestivalSize: typicalFestivalSize || null,
        currentSolution: currentSolution || null,
        biggestChallenge: biggestChallenge || null,
        timeline: timeline || null,
        additionalNotes: additionalNotes || null,
        source: source || 'sales_form'
      }
    })

    // Send email notification
    const RESEND_API_KEY = process.env.RESEND_API_KEY
    const toEmail = 'florian.hohenleitner@gmail.com'
    const fromEmail = process.env.FROM_EMAIL || 'noreply@tryflowgrid.com'

    const emailHtml = `
      <h2>🎯 New Enterprise Sales Inquiry</h2>
      
      <h3>Contact Information</h3>
      <table style="border-collapse: collapse; width: 100%; max-width: 600px;">
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd; background: #f9f9f9;"><strong>Name</strong></td>
          <td style="padding: 8px; border: 1px solid #ddd;">${name}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd; background: #f9f9f9;"><strong>Email</strong></td>
          <td style="padding: 8px; border: 1px solid #ddd;"><a href="mailto:${email}">${email}</a></td>
        </tr>
        ${phone ? `
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd; background: #f9f9f9;"><strong>Phone</strong></td>
          <td style="padding: 8px; border: 1px solid #ddd;">${phone}</td>
        </tr>
        ` : ''}
        ${company ? `
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd; background: #f9f9f9;"><strong>Company</strong></td>
          <td style="padding: 8px; border: 1px solid #ddd;">${company}</td>
        </tr>
        ` : ''}
        ${role ? `
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd; background: #f9f9f9;"><strong>Role</strong></td>
          <td style="padding: 8px; border: 1px solid #ddd;">${role}</td>
        </tr>
        ` : ''}
      </table>

      <h3 style="margin-top: 24px;">Qualifying Information</h3>
      <table style="border-collapse: collapse; width: 100%; max-width: 600px;">
        ${festivalsPerYear ? `
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd; background: #f9f9f9;"><strong>Festivals per Year</strong></td>
          <td style="padding: 8px; border: 1px solid #ddd;">${festivalsPerYear}</td>
        </tr>
        ` : ''}
        ${typicalFestivalSize ? `
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd; background: #f9f9f9;"><strong>Typical Festival Size</strong></td>
          <td style="padding: 8px; border: 1px solid #ddd;">${typicalFestivalSize}</td>
        </tr>
        ` : ''}
        ${currentSolution ? `
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd; background: #f9f9f9;"><strong>Current Solution</strong></td>
          <td style="padding: 8px; border: 1px solid #ddd;">${currentSolution}</td>
        </tr>
        ` : ''}
        ${timeline ? `
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd; background: #f9f9f9;"><strong>Timeline</strong></td>
          <td style="padding: 8px; border: 1px solid #ddd;">${timeline}</td>
        </tr>
        ` : ''}
      </table>

      ${biggestChallenge ? `
      <h3 style="margin-top: 24px;">Biggest Challenge</h3>
      <p style="background: #f9f9f9; padding: 12px; border-radius: 4px;">${biggestChallenge}</p>
      ` : ''}

      ${additionalNotes ? `
      <h3 style="margin-top: 24px;">Additional Notes</h3>
      <p style="background: #f9f9f9; padding: 12px; border-radius: 4px;">${additionalNotes}</p>
      ` : ''}

      <hr style="margin-top: 32px;" />
      <p style="color: #666; font-size: 12px;">
        Source: ${source || 'sales_form'}<br />
        Inquiry ID: ${inquiry.id}<br />
        Submitted: ${new Date().toISOString()}
      </p>
    `

    if (RESEND_API_KEY) {
      const payload = {
        from: `Flow Grid Sales <${fromEmail}>`,
        to: toEmail,
        subject: `🎯 New Enterprise Inquiry: ${company || name}`,
        html: emailHtml
      }

      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${RESEND_API_KEY}`
        },
        body: JSON.stringify(payload)
      })

      if (!res.ok) {
        const text = await res.text()
        console.error('Resend error:', res.status, text)
        // Don't fail the request, just log the error
      }
    } else {
      console.warn('No RESEND_API_KEY configured — sales inquiry logged only')
      console.info('Sales inquiry:', inquiry)
    }

    return NextResponse.json({ 
      ok: true, 
      inquiryId: inquiry.id 
    })
  } catch (err) {
    console.error('Error in sales inquiry route:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
