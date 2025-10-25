import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST() {
  try {
    // First, let's create a test user if one doesn't exist
    let testUser = await prisma.user.findFirst({
      where: {
        email: 'admin@flowgrid.com'
      }
    })

    if (!testUser) {
      testUser = await prisma.user.create({
        data: {
          email: 'admin@flowgrid.com',
          name: 'Flow Grid Admin',
          role: 'ADMIN'
        }
      })
    }

    // Check if flow-grid-demo festival exists
    let festival = await prisma.festival.findUnique({
      where: {
        slug: 'flow-grid-demo'
      }
    })

    if (!festival) {
      // Create the flow-grid-demo festival
      festival = await prisma.festival.create({
        data: {
          name: 'Flow Grid Demo Festival',
          slug: 'flow-grid-demo',
          description: 'A demo festival showcasing Flow Grid features',
          location: 'Demo Location',
          startDate: new Date('2025-03-15'),
          endDate: new Date('2025-03-17'),
          timezone: 'UTC',
          isPublished: true,
          userId: testUser.id,
          primaryColor: '#4a90e2',
          secondaryColor: '#7b68ee',
          accentColor: '#ff6b6b'
        }
      })

      // Create some demo sessions
      const sessions = [
        {
          title: 'Morning Flow',
          description: 'Start your day with gentle movement',
          day: 'Friday',
          startTime: '09:00',
          endTime: '10:30',
          location: 'Main Studio',
          level: 'Beginner',
          styles: ['Flow', 'Gentle'],
          teachers: ['Maria', 'Flo'],
          prerequisites: 'None',
          capacity: 25,
          cardType: 'detailed'
        },
        {
          title: 'Advanced Workshop',
          description: 'Challenging techniques for experienced practitioners',
          day: 'Friday',
          startTime: '14:00',
          endTime: '15:30',
          location: 'Studio 2',
          level: 'Advanced',
          styles: ['Standing', 'Technical'],
          teachers: ['Andre', 'Daria'],
          prerequisites: 'Previous experience required',
          capacity: 20,
          cardType: 'detailed'
        },
        {
          title: 'Lunch Break',
          description: 'Time to refuel',
          day: 'Friday',
          startTime: '12:30',
          endTime: '14:00',
          location: 'Dining Area',
          level: 'All Levels',
          styles: ['Logistics'],
          teachers: [],
          prerequisites: '',
          capacity: null,
          cardType: 'minimal'
        }
      ]

      for (const sessionData of sessions) {
        await prisma.festivalSession.create({
          data: {
            ...sessionData,
            festivalId: festival.id
          }
        })
      }
    }

    // Get updated festival data
    const updatedFestival = await prisma.festival.findUnique({
      where: { id: festival.id },
      include: {
        sessions: true,
        _count: {
          select: {
            sessions: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Demo data created successfully',
      festival: updatedFestival,
      user: testUser
    })
  } catch (error) {
    console.error('Error creating demo data:', error)
    return NextResponse.json(
      { error: 'Failed to create demo data', details: error },
      { status: 500 }
    )
  }
}