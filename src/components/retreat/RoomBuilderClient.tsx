'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, BedDouble, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { RetreatGuestRecord, RetreatWorkspaceData, readRetreatWorkspace, writeRetreatWorkspace } from '@/lib/retreatWorkspace'

interface RoomBuilderClientProps {
  festivalId: string
  festivalName: string
}

export default function RoomBuilderClient({ festivalId, festivalName }: RoomBuilderClientProps) {
  const [workspace, setWorkspace] = useState<RetreatWorkspaceData | null>(null)

  useEffect(() => {
    setWorkspace(readRetreatWorkspace(festivalId))
  }, [festivalId])

  const guests = workspace?.guests || []

  const privateGuests = useMemo(() => guests.filter(g => g.privateRoomRequested), [guests])
  const doubleGuests = useMemo(() => guests.filter(g => g.doubleRoomRequested), [guests])
  const unassigned = useMemo(() => guests.filter(g => !g.roomCode), [guests])

  const updateRoomCode = (guestId: string, roomCode: string) => {
    if (!workspace) return

    const nextGuests = workspace.guests.map((guest) =>
      guest.id === guestId ? { ...guest, roomCode: roomCode.trim() || null } : guest
    )

    const nextWorkspace: RetreatWorkspaceData = {
      ...workspace,
      guests: nextGuests,
    }

    setWorkspace(nextWorkspace)
    writeRetreatWorkspace(festivalId, nextWorkspace)
  }

  if (!workspace) {
    return null
  }

  return (
    <div className="container max-w-7xl mx-auto p-6 space-y-6">
      <div>
        <Link href={`/dashboard/festivals/${festivalId}/guests`}>
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Guest Hub
          </Button>
        </Link>
      </div>

      <div>
        <h1 className="text-3xl font-bold text-gray-900">Room Builder</h1>
        <p className="text-gray-600 mt-1">Build room assignments for {festivalName} using imported guest preferences.</p>
      </div>

      {guests.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No guest data yet</CardTitle>
            <CardDescription>Upload a workbook from the Guest Data Hub before building room lists.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href={`/dashboard/festivals/${festivalId}/guests`}>
              <Button>Go to Guest Data Hub</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-600">Private Room Requests</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-indigo-700">{privateGuests.length}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-600">Double Room Requests</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-indigo-700">{doubleGuests.length}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-600">Unassigned Guests</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-amber-700">{unassigned.length}</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BedDouble className="w-5 h-5" />
                Room Assignment Table
              </CardTitle>
              <CardDescription>Set room codes to build your final allocation list.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 pr-3 font-medium text-gray-600">Guest</th>
                      <th className="text-left py-2 pr-3 font-medium text-gray-600">Email</th>
                      <th className="text-left py-2 pr-3 font-medium text-gray-600">Preferences</th>
                      <th className="text-left py-2 pr-3 font-medium text-gray-600">Share Note</th>
                      <th className="text-left py-2 pr-3 font-medium text-gray-600">Room Code</th>
                    </tr>
                  </thead>
                  <tbody>
                    {guests.map((guest: RetreatGuestRecord) => (
                      <tr key={guest.id} className="border-b">
                        <td className="py-2 pr-3 font-medium text-gray-900">{guest.firstName} {guest.lastName}</td>
                        <td className="py-2 pr-3 text-gray-600">{guest.email || '-'}</td>
                        <td className="py-2 pr-3 text-gray-600">
                          {guest.privateRoomRequested && <span className="mr-2 rounded bg-indigo-100 px-2 py-0.5 text-xs text-indigo-700">Private</span>}
                          {guest.doubleRoomRequested && <span className="rounded bg-blue-100 px-2 py-0.5 text-xs text-blue-700">Double</span>}
                          {!guest.privateRoomRequested && !guest.doubleRoomRequested && '-'}
                        </td>
                        <td className="py-2 pr-3 text-gray-600 max-w-xs truncate">{guest.roomSharePreference || '-'}</td>
                        <td className="py-2 pr-3">
                          <input
                            value={guest.roomCode || ''}
                            onChange={(e) => updateRoomCode(guest.id, e.target.value)}
                            placeholder="A12"
                            className="w-28 rounded border border-gray-300 px-2 py-1"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 flex items-center justify-end text-xs text-gray-500">
                <Save className="w-3 h-3 mr-1" />
                Changes save automatically in your browser for this event.
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
