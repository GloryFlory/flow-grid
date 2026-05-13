'use client'

import React, { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import * as XLSX from 'xlsx'
import { ArrowLeft, FileSpreadsheet, Upload, Users, BedDouble, Save, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  RetreatGuestRecord,
  RetreatWorkspaceData,
  defaultRetreatWorkspaceData,
  readRetreatWorkspace,
  writeRetreatWorkspace,
} from '@/lib/retreatWorkspace'

type ParsedWorkbook = {
  workbookName: string
  sheetNames: string[]
  workbook: XLSX.WorkBook
}

interface GuestOpsHubClientProps {
  festivalId: string
  festivalName: string
}

function normalizeHeader(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, ' ')
}

function normalizeEmail(value: string): string {
  return value.trim().toLowerCase()
}

function normalizeNamePart(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, ' ')
}

function toBool(value: unknown): boolean {
  const v = String(value ?? '').trim().toLowerCase()
  return ['yes', 'y', 'true', '1', 'x', 'accepted', 'agree', 'i agree'].includes(v)
}

function toNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value
  }

  let raw = String(value ?? '').trim()
  if (!raw) return null

  // Keep numeric separators and minus sign only.
  raw = raw.replace(/[^0-9,.-]/g, '')
  if (!raw) return null

  const lastComma = raw.lastIndexOf(',')
  const lastDot = raw.lastIndexOf('.')

  if (lastComma !== -1 && lastDot !== -1) {
    // If comma is last separator, treat comma as decimal and dot as thousand separator.
    if (lastComma > lastDot) {
      raw = raw.replace(/\./g, '').replace(',', '.')
    } else {
      // Otherwise dot is decimal separator and comma is thousand separator.
      raw = raw.replace(/,/g, '')
    }
  } else if (lastComma !== -1) {
    // Single comma can be decimal or thousands.
    const decimalPartLength = raw.length - lastComma - 1
    raw = decimalPartLength <= 2 ? raw.replace(',', '.') : raw.replace(/,/g, '')
  }

  const parsed = Number(raw)
  return Number.isFinite(parsed) ? parsed : null
}

function getMappedValue(row: Record<string, unknown>, headerAliases: string[]): string {
  for (const [k, v] of Object.entries(row)) {
    const normalized = normalizeHeader(k)
    if (headerAliases.includes(normalized)) {
      return String(v ?? '').trim()
    }
  }
  return ''
}

function buildBuyerNameKey(firstName: string, lastName: string): string {
  return `${normalizeNamePart(firstName)}|${normalizeNamePart(lastName)}`
}

export default function GuestOpsHubClient({ festivalId, festivalName }: GuestOpsHubClientProps) {
  const [workspace, setWorkspace] = useState<RetreatWorkspaceData>(() => defaultRetreatWorkspaceData())
  const [parsedWorkbook, setParsedWorkbook] = useState<ParsedWorkbook | null>(null)
  const [bookingsSheet, setBookingsSheet] = useState('')
  const [participantsSheet, setParticipantsSheet] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [selectedGuestId, setSelectedGuestId] = useState<string | null>(null)
  const [detectedColumns, setDetectedColumns] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState<'info' | 'checkin' | 'analytics' | 'import'>('info')

  useEffect(() => {
    setWorkspace(readRetreatWorkspace(festivalId))
  }, [festivalId])

  const guestCount = workspace.guests.length
  const paidCount = workspace.guests.filter(g => g.paymentStatus === 'PAID').length
  const roomDemandCount = workspace.guests.filter(g => g.privateRoomRequested || g.doubleRoomRequested).length

  const importedAtLabel = useMemo(() => {
    if (!workspace.importSummary?.importedAtIso) return 'No import yet'
    return new Date(workspace.importSummary.importedAtIso).toLocaleString()
  }, [workspace.importSummary])

  const selectedGuest = useMemo(
    () => workspace.guests.find((guest) => guest.id === selectedGuestId) || null,
    [workspace.guests, selectedGuestId]
  )

  const persistWorkspace = (next: RetreatWorkspaceData) => {
    setWorkspace(next)
    writeRetreatWorkspace(festivalId, next)
  }

  const updateGuest = (guestId: string, updates: Partial<RetreatGuestRecord>) => {
    const nextGuests = workspace.guests.map((guest) =>
      guest.id === guestId ? { ...guest, ...updates } : guest
    )
    persistWorkspace({ ...workspace, guests: nextGuests })
  }

  const handleWorkbookUpload = async (file: File) => {
    setUploadError(null)

    try {
      const data = await file.arrayBuffer()
      const workbook = XLSX.read(data, { type: 'array' })
      const sheetNames = workbook.SheetNames || []

      if (sheetNames.length === 0) {
        setUploadError('The workbook has no sheets.')
        return
      }

      const guessedBookingSheet = sheetNames.find(s => s.toLowerCase().includes('booking')) || sheetNames[0]
      const guessedParticipantSheet = sheetNames.find(s => s.toLowerCase().includes('participant')) || sheetNames[Math.min(1, sheetNames.length - 1)]

      setParsedWorkbook({ workbookName: file.name, sheetNames, workbook })
      setBookingsSheet(guessedBookingSheet)
      setParticipantsSheet(guessedParticipantSheet)
    } catch (error) {
      console.error('Workbook parsing failed', error)
      setUploadError('Could not parse this workbook. Please upload a valid .xlsx file.')
    }
  }

  const processWorkbook = () => {
    if (!parsedWorkbook || !bookingsSheet || !participantsSheet) {
      setUploadError('Select both tabs from your workbook before processing (Bookings tab and Participants tab).')
      return
    }

    setIsProcessing(true)
    setUploadError(null)

    try {
      const bookingSheet = parsedWorkbook.workbook.Sheets[bookingsSheet]
      const participantSheet = parsedWorkbook.workbook.Sheets[participantsSheet]

      if (!bookingSheet || !participantSheet) {
        setUploadError('Selected sheet could not be found in the workbook.')
        setIsProcessing(false)
        return
      }

      const bookingRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(bookingSheet, { defval: '' })
      const participantRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(participantSheet, { defval: '' })

      // Capture all detected column names from participant sheet
      const allColumns = participantRows.length > 0 ? Object.keys(participantRows[0]) : []
      setDetectedColumns(allColumns)

      const bookingByEmail = new Map<string, { balanceDue: number | null; successfulPayments: number | null; tripPrice: number | null }>()
      const bookingByName = new Map<string, { balanceDue: number | null; successfulPayments: number | null; tripPrice: number | null }>()

      for (const row of bookingRows) {
        const buyerEmail = normalizeEmail(getMappedValue(row, ['email']))
        const buyerFirstName = getMappedValue(row, ['buyer first name'])
        const buyerLastName = getMappedValue(row, ['buyer last name'])
        const tripPrice = toNumber(getMappedValue(row, ['trip price']))
        const balanceDue = toNumber(getMappedValue(row, ['balance due']))
        const successfulPayments = toNumber(getMappedValue(row, ['successful payments']))

        const bookingData = { balanceDue, successfulPayments, tripPrice }

        if (buyerEmail) {
          bookingByEmail.set(buyerEmail, bookingData)
        }

        if (buyerFirstName || buyerLastName) {
          bookingByName.set(buildBuyerNameKey(buyerFirstName, buyerLastName), bookingData)
        }
      }

      const guests: RetreatGuestRecord[] = participantRows.map((row, index) => {
        const buyerFirstName = getMappedValue(row, ['buyer first name'])
        const buyerLastName = getMappedValue(row, ['buyer last name'])
        const firstName = getMappedValue(row, ['participant first name', 'first name'])
        const lastName = getMappedValue(row, ['participant last name', 'last name'])
        const emailRaw = getMappedValue(row, ['email', 'participant email'])
        const email = emailRaw ? normalizeEmail(emailRaw) : null

        const bookingLookup = (email && bookingByEmail.get(email)) || bookingByName.get(buildBuyerNameKey(buyerFirstName, buyerLastName))
        const balanceDue = bookingLookup?.balanceDue ?? null
        const successfulPayments = bookingLookup?.successfulPayments ?? null
        const tripPrice = bookingLookup?.tripPrice ?? null

        // Payment status logic: Balance Due = 0 or negative means PAID
        let paymentStatus: RetreatGuestRecord['paymentStatus'] = 'UNPAID'
        if (balanceDue !== null && balanceDue <= 0) {
          paymentStatus = 'PAID'
        } else if ((successfulPayments ?? 0) > 0 && balanceDue !== null && balanceDue > 0) {
          paymentStatus = 'PARTIAL'
        } else if ((successfulPayments ?? 0) > 0 && balanceDue === null) {
          if (tripPrice === null || successfulPayments >= tripPrice) {
            paymentStatus = 'PAID'
          } else {
            paymentStatus = 'PARTIAL'
          }
        }

        // Capture ALL row data for transparency
        const importedFields: Record<string, string> = {}
        for (const [key, value] of Object.entries(row)) {
          const str = String(value ?? '').trim()
          if (str) {
            importedFields[key] = str
          }
        }

        return {
          id: `${festivalId}-${index + 1}`,
          firstName,
          lastName,
          email,
          buyerEmail: email,
          phoneNumber: getMappedValue(row, ['phone number']) || null,
          packageName: getMappedValue(row, ['package']) || null,
          privateRoomRequested: toBool(getMappedValue(row, ['private room'])),
          doubleRoomRequested: toBool(getMappedValue(row, ['double room'])),
          roomSharePreference: getMappedValue(row, ['want to share a room? tell us with whom (and make sure to book the double-room add on at checkout)']) || null,
          tShirtSize: getMappedValue(row, ['t-shirt size']) || null,
          dietaryRequirements: getMappedValue(row, ['dietary requirements']) || null,
          emergencyContact: getMappedValue(row, ['emergency contact (name and phone)']) || null,
          checkoutInfo: getMappedValue(row, ['checkout info']) || null,
          waiverAccepted: toBool(getMappedValue(row, ['by joining the mediterranean acro convention, i am fully aware of the risks involved in the activities, and i take full responsibility for my own safety. i do not hold the teachers, organizers, or hosts responsible for any injuries that might occur.'])),
          photoConsent: toBool(getMappedValue(row, ['by joining the mediterranean acro convention, you consent to the capture and use of photographs during the event for promotional purposes.'])),
          newsletterConsent: toBool(getMappedValue(row, ['newsletter and emails with registering for the mediterranean acro convention 2024, you automatically give permission to be informed about this festival through the e-mail address and phone number provided. if you also want to receive emails after the festival with links to the pictures and videos taken at the mac, stay updated about new activities and receive newsletters (maximum 5 times a year), please give your permission. we of course will not share your details with third parties.'])),
          paymentStatus,
          shirtPrepared: false,
          shirtCollected: false,
          checkInStatus: 'NOT_CHECKED_IN',
          balanceDue,
          successfulPayments,
          tripPrice,
          roomCode: null,
          notes: null,
          // Extract specific insight fields for analytics
          preferredRole: getMappedValue(row, ["what's your preferred role?"]) || null,
          acroYogaExperience: getMappedValue(row, ['what is your acroyoga experience?']) || null,
          skillsToLearn: getMappedValue(row, ['what skills do you want to learn?']) || null,
          importedFields,
        }
      })

      const nextWorkspace: RetreatWorkspaceData = {
        ...workspace,
        guests,
        importSummary: {
          workbookName: parsedWorkbook.workbookName,
          bookingsSheet,
          participantsSheet,
          importedAtIso: new Date().toISOString(),
          bookingRows: bookingRows.length,
          participantRows: participantRows.length,
        },
      }

      // Log import details for debugging
      console.log('Import Summary:')
      console.log(`- Total guests imported: ${guests.length}`)
      console.log(`- All column names from first row:`, participantRows[0] ? Object.keys(participantRows[0]) : 'N/A')
      console.log(`- Sample guest:`, guests[0])

      persistWorkspace(nextWorkspace)
    } catch (error) {
      console.error('Failed to process workbook', error)
      setUploadError('Import failed while processing workbook data.')
    } finally {
      setIsProcessing(false)
    }
  }

  const clearWorkspace = () => {
    const empty = defaultRetreatWorkspaceData()
    persistWorkspace(empty)
    setParsedWorkbook(null)
    setBookingsSheet('')
    setParticipantsSheet('')
    setUploadError(null)
  }

  const saveGeneralInfo = () => {
    persistWorkspace({ ...workspace })
  }

  return (
    <div className="container max-w-7xl mx-auto p-6 space-y-6">
      <div>
        <Link href={`/dashboard/festivals/${festivalId}`}>
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Event
          </Button>
        </Link>
      </div>

      <div>
        <h1 className="text-3xl font-bold text-gray-900">Guest Data Hub</h1>
        <p className="text-gray-600 mt-1">Upload WeTravel workbook data for {festivalName}, store general operations notes, then drive Check-in and Rooms modules.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">Guests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{guestCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">Paid</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700">{paidCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">Room Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-indigo-700">{roomDemandCount}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5" />
            Workbook Upload
          </CardTitle>
          <CardDescription>Upload one .xlsx file, then choose which tabs represent Bookings and Participants. Tab names can vary per organizer.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) void handleWorkbookUpload(file)
              }}
              className="block w-full text-sm text-gray-600 file:mr-4 file:rounded-md file:border-0 file:bg-gray-100 file:px-4 file:py-2 file:text-sm file:font-medium hover:file:bg-gray-200"
            />
            <Button variant="outline" onClick={clearWorkspace}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Reset
            </Button>
          </div>

          {parsedWorkbook && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="text-sm font-medium text-gray-700">
                Bookings Tab
                <select
                  className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                  value={bookingsSheet}
                  onChange={(e) => setBookingsSheet(e.target.value)}
                >
                  {parsedWorkbook.sheetNames.map((name) => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                </select>
              </label>

              <label className="text-sm font-medium text-gray-700">
                Participants Tab
                <select
                  className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                  value={participantsSheet}
                  onChange={(e) => setParticipantsSheet(e.target.value)}
                >
                  {parsedWorkbook.sheetNames.map((name) => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                </select>
              </label>
            </div>
          )}

          {parsedWorkbook && (
            <p className="text-xs text-gray-600">
              Found {parsedWorkbook.sheetNames.length} tabs in this workbook. Pick one tab for booking-level data and one for participant-level data.
            </p>
          )}

          {uploadError && <p className="text-sm text-red-600">{uploadError}</p>}

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-lg border border-gray-200 p-3 bg-gray-50">
            <div>
              <p className="text-sm font-medium text-gray-900">Last import: {importedAtLabel}</p>
              {workspace.importSummary && (
                <p className="text-xs text-gray-600 mt-1">
                  {workspace.importSummary.workbookName} - {workspace.importSummary.bookingRows} booking rows, {workspace.importSummary.participantRows} participant rows
                </p>
              )}
            </div>
            <Button onClick={processWorkbook} disabled={!parsedWorkbook || isProcessing}>
              <Upload className="w-4 h-4 mr-2" />
              {isProcessing ? 'Processing...' : 'Process Workbook'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>General Event Guest Info</CardTitle>
          <CardDescription>Shared operational notes for your team before check-in and room assignment.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="text-sm font-medium text-gray-700">
              Check-in Location
              <input
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                value={workspace.generalInfo.checkInLocation}
                onChange={(e) => setWorkspace({
                  ...workspace,
                  generalInfo: { ...workspace.generalInfo, checkInLocation: e.target.value },
                })}
                placeholder="Reception desk near main hall"
              />
            </label>

            <label className="text-sm font-medium text-gray-700">
              Check-in Opens At
              <input
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                value={workspace.generalInfo.checkInOpenAt}
                onChange={(e) => setWorkspace({
                  ...workspace,
                  generalInfo: { ...workspace.generalInfo, checkInOpenAt: e.target.value },
                })}
                placeholder="Friday 14:00"
              />
            </label>
          </div>

          <label className="text-sm font-medium text-gray-700 block">
            Team Notes
            <textarea
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm min-h-28"
              value={workspace.generalInfo.organiserNotes}
              onChange={(e) => setWorkspace({
                ...workspace,
                generalInfo: { ...workspace.generalInfo, organiserNotes: e.target.value },
              })}
              placeholder="Anything the team should know before guest arrival"
            />
          </label>

          <div className="flex justify-end">
            <Button onClick={saveGeneralInfo}>
              <Save className="w-4 h-4 mr-2" />
              Save General Info
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Next Modules
          </CardTitle>
          <CardDescription>Use imported guest data directly in operational modules.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="rounded-lg border bg-gray-50 p-4">
              <p className="font-medium text-gray-900">Check-in and Guest Ops</p>
              <p className="text-xs text-gray-600 mt-1">Live below in this page: payment, waiver, shirt and check-in controls.</p>
            </div>
            <Link href={`/dashboard/festivals/${festivalId}/rooms`} className="rounded-lg border bg-gray-50 p-4 hover:bg-gray-100 transition-colors">
              <div className="flex items-center gap-2">
                <BedDouble className="w-4 h-4 text-indigo-600" />
                <p className="font-medium text-gray-900">Room Builder</p>
              </div>
              <p className="text-xs text-gray-600 mt-1">Build room assignments from private/double room requests.</p>
            </Link>
          </div>
        </CardContent>
      </Card>

      {workspace.guests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Guest Management</CardTitle>
            <CardDescription>View, browse, and manage guest data and operations in tabs below.</CardDescription>
            <div className="flex gap-2 mt-4 flex-wrap">
              <button
                onClick={() => setActiveTab('info')}
                className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                  activeTab === 'info'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Guest Info
              </button>
              <button
                onClick={() => setActiveTab('checkin')}
                className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                  activeTab === 'checkin'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Check-in Ops
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                  activeTab === 'analytics'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Analytics
              </button>
              {detectedColumns.length > 0 && (
                <button
                  onClick={() => setActiveTab('import')}
                  className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                    activeTab === 'import'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Import Debug
                </button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {activeTab === 'info' && (
              <div>
                <p className="text-sm text-gray-600 mb-4">Browse all imported guest data. Expand rows to see all fields and responses captured from your workbook.</p>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 pr-3 font-medium text-gray-600">Guest</th>
                    <th className="text-left py-2 pr-3 font-medium text-gray-600">Email</th>
                    <th className="text-left py-2 pr-3 font-medium text-gray-600">Package</th>
                    <th className="text-left py-2 pr-3 font-medium text-gray-600">Payment</th>
                    <th className="text-left py-2 pr-3 font-medium text-gray-600">T-Shirt</th>
                    <th className="text-left py-2 pr-3 font-medium text-gray-600">Dietary</th>
                    <th className="text-left py-2 pr-3 font-medium text-gray-600" />
                  </tr>
                </thead>
                <tbody>
                  {workspace.guests.map((guest) => (
                    <React.Fragment key={guest.id}>
                      <tr className="border-b hover:bg-gray-50">
                        <td className="py-2 pr-3 font-medium text-gray-900">{guest.firstName} {guest.lastName}</td>
                        <td className="py-2 pr-3 text-gray-600">{guest.email || '-'}</td>
                        <td className="py-2 pr-3 text-gray-600">{guest.packageName || '-'}</td>
                        <td className="py-2 pr-3">
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${
                            guest.paymentStatus === 'PAID' ? 'bg-green-100 text-green-800' :
                            guest.paymentStatus === 'PARTIAL' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {guest.paymentStatus}
                          </span>
                        </td>
                        <td className="py-2 pr-3 text-gray-600">{guest.tShirtSize || '-'}</td>
                        <td className="py-2 pr-3 text-gray-600 max-w-xs truncate">{guest.dietaryRequirements || '-'}</td>
                        <td className="py-2 pr-3 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedGuestId(selectedGuestId === guest.id ? null : guest.id)}
                          >
                            {selectedGuestId === guest.id ? '▼' : '▶'}
                          </Button>
                        </td>
                      </tr>
                      {selectedGuestId === guest.id && (
                        <tr className="border-b bg-gray-50">
                          <td colSpan={7} className="py-4 pr-3">
                            <div className="space-y-5">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div>
                                  <p className="text-gray-500">Phone</p>
                                  <p className="text-gray-900 font-medium">{guest.phoneNumber || '-'}</p>
                                </div>
                                <div>
                                  <p className="text-gray-500">Balance Due</p>
                                  <p className="text-gray-900 font-medium">
                                    {guest.balanceDue === null ? '-' : `€${guest.balanceDue.toFixed(2)}`}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-gray-500">Room Preferences</p>
                                  <p className="text-gray-900 font-medium">
                                    {guest.privateRoomRequested ? 'Private' : guest.doubleRoomRequested ? 'Double' : 'No specific request'}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-gray-500">Room Share Preference</p>
                                  <p className="text-gray-900 font-medium">{guest.roomSharePreference || '-'}</p>
                                </div>
                                <div>
                                  <p className="text-gray-500">Emergency Contact</p>
                                  <p className="text-gray-900 font-medium">{guest.emergencyContact || '-'}</p>
                                </div>
                              </div>

                              <div>
                                <h4 className="text-sm font-semibold text-gray-900 mb-2">Consents</h4>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                                  <div className="rounded border border-gray-200 bg-white p-3">
                                    <p className="text-gray-500">Waiver</p>
                                    <p className="font-medium text-gray-900">{guest.waiverAccepted ? '✓ Accepted' : '✗ Not accepted'}</p>
                                  </div>
                                  <div className="rounded border border-gray-200 bg-white p-3">
                                    <p className="text-gray-500">Photo Consent</p>
                                    <p className="font-medium text-gray-900">{guest.photoConsent ? '✓ Accepted' : '✗ Not accepted'}</p>
                                  </div>
                                  <div className="rounded border border-gray-200 bg-white p-3">
                                    <p className="text-gray-500">Newsletter</p>
                                    <p className="font-medium text-gray-900">{guest.newsletterConsent ? '✓ Accepted' : '✗ Not accepted'}</p>
                                  </div>
                                </div>
                              </div>

                              {Object.keys(guest.importedFields).length > 0 && (
                                <div>
                                  <h4 className="text-sm font-semibold text-gray-900 mb-2">All Imported Fields</h4>
                                  <div className="space-y-2 max-h-72 overflow-y-auto">
                                    {Object.entries(guest.importedFields).map(([key, value]) => (
                                      <div key={key} className="rounded border border-gray-200 bg-white p-3 text-sm">
                                        <p className="text-gray-500 text-xs">{key}</p>
                                        <p className="text-gray-900 font-medium mt-1 break-words">{value}</p>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
                </div>
              </div>
            )}

            {activeTab === 'analytics' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="rounded-lg border border-gray-200 p-4">
                  <p className="text-sm text-gray-600">Payment Distribution</p>
                  <div className="mt-3 space-y-1">
                    <p className="text-2xl font-bold text-green-700">{workspace.guests.filter(g => g.paymentStatus === 'PAID').length}</p>
                    <p className="text-xs text-gray-600">PAID</p>
                  </div>
                  <div className="mt-2 space-y-1">
                    <p className="text-xl font-bold text-yellow-700">{workspace.guests.filter(g => g.paymentStatus === 'PARTIAL').length}</p>
                    <p className="text-xs text-gray-600">PARTIAL</p>
                  </div>
                  <div className="mt-2 space-y-1">
                    <p className="text-xl font-bold text-red-700">{workspace.guests.filter(g => g.paymentStatus === 'UNPAID').length}</p>
                    <p className="text-xs text-gray-600">UNPAID</p>
                  </div>
                </div>

                <div className="rounded-lg border border-gray-200 p-4">
                  <p className="text-sm text-gray-600">Room Requests</p>
                  <div className="mt-3 space-y-1">
                    <p className="text-2xl font-bold text-indigo-700">{workspace.guests.filter(g => g.privateRoomRequested).length}</p>
                    <p className="text-xs text-gray-600">Private Room</p>
                  </div>
                  <div className="mt-2 space-y-1">
                    <p className="text-xl font-bold text-indigo-600">{workspace.guests.filter(g => g.doubleRoomRequested).length}</p>
                    <p className="text-xs text-gray-600">Double Room</p>
                  </div>
                </div>

                <div className="rounded-lg border border-gray-200 p-4">
                  <p className="text-sm text-gray-600">Consents</p>
                  <div className="mt-3 space-y-1">
                    <p className="text-2xl font-bold text-blue-700">{workspace.guests.filter(g => g.waiverAccepted).length}</p>
                    <p className="text-xs text-gray-600">Waiver Signed</p>
                  </div>
                  <div className="mt-2 space-y-1">
                    <p className="text-xl font-bold text-blue-600">{workspace.guests.filter(g => g.photoConsent).length}</p>
                    <p className="text-xs text-gray-600">Photo Consent</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
              <h3 className="font-medium text-gray-900">Response Distribution</h3>
              
              {(() => {
                const preferredRoles = new Map<string, number>()
                const experiences = new Map<string, number>()
                const skills = new Map<string, number>()
                const tShirts = new Map<string, number>()

                workspace.guests.forEach(guest => {
                  if (guest.preferredRole) {
                    preferredRoles.set(guest.preferredRole, (preferredRoles.get(guest.preferredRole) || 0) + 1)
                  }
                  if (guest.acroYogaExperience) {
                    experiences.set(guest.acroYogaExperience, (experiences.get(guest.acroYogaExperience) || 0) + 1)
                  }
                  if (guest.skillsToLearn) {
                    skills.set(guest.skillsToLearn, (skills.get(guest.skillsToLearn) || 0) + 1)
                  }
                  if (guest.tShirtSize) {
                    tShirts.set(guest.tShirtSize, (tShirts.get(guest.tShirtSize) || 0) + 1)
                  }
                })

                return (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {preferredRoles.size > 0 && (
                      <div className="rounded-lg border border-gray-200 p-4">
                        <p className="text-sm font-semibold text-gray-900 mb-3">Preferred Roles</p>
                        <div className="space-y-2">
                          {Array.from(preferredRoles.entries())
                            .sort((a, b) => b[1] - a[1])
                            .map(([role, count]) => (
                              <div key={role} className="flex items-center justify-between text-sm">
                                <span className="text-gray-700">{role}</span>
                                <span className="font-semibold text-indigo-600">{count}</span>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}

                    {experiences.size > 0 && (
                      <div className="rounded-lg border border-gray-200 p-4">
                        <p className="text-sm font-semibold text-gray-900 mb-3">Acro-Yoga Experience</p>
                        <div className="space-y-2">
                          {Array.from(experiences.entries())
                            .sort((a, b) => b[1] - a[1])
                            .map(([exp, count]) => (
                              <div key={exp} className="flex items-center justify-between text-sm">
                                <span className="text-gray-700">{exp}</span>
                                <span className="font-semibold text-indigo-600">{count}</span>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}

                    {skills.size > 0 && (
                      <div className="rounded-lg border border-gray-200 p-4">
                        <p className="text-sm font-semibold text-gray-900 mb-3">Skills to Learn</p>
                        <div className="space-y-2">
                          {Array.from(skills.entries())
                            .sort((a, b) => b[1] - a[1])
                            .map(([skill, count]) => (
                              <div key={skill} className="flex items-center justify-between text-sm">
                                <span className="text-gray-700">{skill}</span>
                                <span className="font-semibold text-indigo-600">{count}</span>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}

                    {tShirts.size > 0 && (
                      <div className="rounded-lg border border-gray-200 p-4">
                        <p className="text-sm font-semibold text-gray-900 mb-3">T-Shirt Sizes</p>
                        <div className="space-y-2">
                          {Array.from(tShirts.entries())
                            .sort((a, b) => b[1] - a[1])
                            .map(([size, count]) => (
                              <div key={size} className="flex items-center justify-between text-sm">
                                <span className="text-gray-700">{size}</span>
                                <span className="font-semibold text-indigo-600">{count}</span>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })()}
              </div>
            </div>
            )}

            {activeTab === 'checkin' && (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 pr-3 font-medium text-gray-600">Guest</th>
                    <th className="text-left py-2 pr-3 font-medium text-gray-600">Email</th>
                    <th className="text-left py-2 pr-3 font-medium text-gray-600">Payment</th>
                    <th className="text-left py-2 pr-3 font-medium text-gray-600">Waiver</th>
                    <th className="text-left py-2 pr-3 font-medium text-gray-600">Shirt Ready</th>
                    <th className="text-left py-2 pr-3 font-medium text-gray-600">Shirt Collected</th>
                    <th className="text-left py-2 pr-3 font-medium text-gray-600">Check-in</th>
                    <th className="text-left py-2 pr-3 font-medium text-gray-600">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {workspace.guests.map((guest) => (
                    <tr key={guest.id} className="border-b">
                      <td className="py-2 pr-3 font-medium text-gray-900">{guest.firstName} {guest.lastName}</td>
                      <td className="py-2 pr-3 text-gray-600">{guest.email || '-'}</td>
                      <td className="py-2 pr-3">
                        <select
                          className="rounded border border-gray-300 px-2 py-1"
                          value={guest.paymentStatus}
                          onChange={(e) => updateGuest(guest.id, { paymentStatus: e.target.value as RetreatGuestRecord['paymentStatus'] })}
                        >
                          <option value="UNPAID">UNPAID</option>
                          <option value="PARTIAL">PARTIAL</option>
                          <option value="PAID">PAID</option>
                        </select>
                      </td>
                      <td className="py-2 pr-3">
                        <input
                          type="checkbox"
                          checked={guest.waiverAccepted}
                          onChange={(e) => updateGuest(guest.id, { waiverAccepted: e.target.checked })}
                        />
                      </td>
                      <td className="py-2 pr-3">
                        <input
                          type="checkbox"
                          checked={guest.shirtPrepared}
                          onChange={(e) => updateGuest(guest.id, { shirtPrepared: e.target.checked })}
                        />
                      </td>
                      <td className="py-2 pr-3">
                        <input
                          type="checkbox"
                          checked={guest.shirtCollected}
                          onChange={(e) => updateGuest(guest.id, { shirtCollected: e.target.checked })}
                        />
                      </td>
                      <td className="py-2 pr-3">
                        <select
                          className="rounded border border-gray-300 px-2 py-1"
                          value={guest.checkInStatus}
                          onChange={(e) => updateGuest(guest.id, { checkInStatus: e.target.value as RetreatGuestRecord['checkInStatus'] })}
                        >
                          <option value="NOT_CHECKED_IN">Not checked in</option>
                          <option value="CHECKED_IN">Checked in</option>
                        </select>
                      </td>
                      <td className="py-2 pr-3">
                        <input
                          className="w-48 rounded border border-gray-300 px-2 py-1"
                          value={guest.notes || ''}
                          onChange={(e) => updateGuest(guest.id, { notes: e.target.value || null })}
                          placeholder="Internal notes"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            )}

            {activeTab === 'import' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Detected Columns in Participant Sheet</h3>
                  <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
                    <p className="text-xs text-gray-600 mb-2">Total columns: {detectedColumns.length}</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {detectedColumns.map((col) => (
                        <div key={col} className="text-xs bg-white border border-gray-200 rounded px-2 py-1">
                          {col}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {workspace.guests.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">Sample Data - First Guest</h3>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {workspace.guests[0] && Object.entries(workspace.guests[0].importedFields).map(([key, value]) => (
                        <div key={key} className="text-xs bg-white border border-gray-200 rounded p-3">
                          <p className="text-gray-500 font-mono">{key}</p>
                          <p className="text-gray-900 font-medium mt-1 break-words">{value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {workspace.guests.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">Payment Status Calculation Example</h3>
                    {workspace.guests[0] && (
                      <div className="text-sm bg-blue-50 border border-blue-200 rounded p-4 space-y-2">
                        <p><strong>Guest:</strong> {workspace.guests[0].firstName} {workspace.guests[0].lastName}</p>
                        <p><strong>Balance Due:</strong> {workspace.guests[0].balanceDue === null ? 'NULL' : workspace.guests[0].balanceDue}</p>
                        <p><strong>Successful Payments:</strong> {workspace.guests[0].successfulPayments === null ? 'NULL' : workspace.guests[0].successfulPayments}</p>
                        <p><strong>Trip Price:</strong> {workspace.guests[0].tripPrice === null ? 'NULL' : workspace.guests[0].tripPrice}</p>
                        <div className="mt-3 p-3 bg-white border border-blue-200 rounded">
                          <p className="text-xs text-gray-600 mb-2">Payment Logic:</p>
                          <p className="text-xs font-mono">
                            if (balanceDue ≤ 0) → PAID<br/>
                            else if (successfulPayments &gt; 0 AND balanceDue &gt; 0) → PARTIAL<br/>
                            else if (successfulPayments ≥ tripPrice) → PAID<br/>
                            else → unpaid/partial
                          </p>
                        </div>
                        <p className="text-sm font-bold mt-3"><strong>Result:</strong> <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          workspace.guests[0].paymentStatus === 'PAID' ? 'bg-green-100 text-green-800' :
                          workspace.guests[0].paymentStatus === 'PARTIAL' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>{workspace.guests[0].paymentStatus}</span></p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
