import type { SportEvent } from '../types'
import type { Facility } from '../types'

const STORAGE_KEY = 'uyum:event-registrations'

export interface EventRegistration {
  eventId: string
  name: string
  email: string
  phone: string
  ticketNumber: string
  ts: string
}

function hashStr(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0
  return Math.abs(h)
}

export function generateTicketNumber(eventId: string, dateIso: string): string {
  const d = new Date(dateIso)
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  const num = String(hashStr(eventId + dateIso) % 900 + 100) // 100–999
  return `UYM-${mm}${dd}-#${num}`
}

export function saveRegistration(params: {
  eventId: string
  name: string
  email: string
  phone: string
  dateIso: string
}): EventRegistration {
  const ticketNumber = generateTicketNumber(params.eventId, params.dateIso)
  const entry: EventRegistration = {
    eventId: params.eventId,
    name: params.name,
    email: params.email,
    phone: params.phone,
    ticketNumber,
    ts: new Date().toISOString(),
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const existing: EventRegistration[] = raw ? (JSON.parse(raw) as EventRegistration[]) : []
    existing.push(entry)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing))
  } catch {
    // localStorage unavailable — silently continue
  }
  return entry
}

export function isAlreadyRegistered(eventId: string): boolean {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return false
    const list = JSON.parse(raw) as EventRegistration[]
    return list.some(r => r.eventId === eventId)
  } catch {
    return false
  }
}

export function buildIcsBlob(event: SportEvent, facility: Facility | undefined): Blob {
  const start = new Date(event.date)
  const end = new Date(start.getTime() + 2 * 60 * 60 * 1000) // +2 hours default

  function fmt(d: Date): string {
    return d.toISOString().replace(/[-:]/g, '').replace('.000', '')
  }

  const location = facility
    ? `${facility.name}${facility.contact.address ? ', ' + facility.contact.address : ''}`
    : ''

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//UYUM Platform//TR',
    'BEGIN:VEVENT',
    `UID:${event.id}@uyum.app`,
    `DTSTART:${fmt(start)}`,
    `DTEND:${fmt(end)}`,
    `SUMMARY:${event.title}`,
    `DESCRIPTION:${event.description.replace(/\n/g, '\\n')}`,
    location ? `LOCATION:${location}` : '',
    'END:VEVENT',
    'END:VCALENDAR',
  ]
    .filter(Boolean)
    .join('\r\n')

  return new Blob([lines], { type: 'text/calendar;charset=utf-8' })
}
