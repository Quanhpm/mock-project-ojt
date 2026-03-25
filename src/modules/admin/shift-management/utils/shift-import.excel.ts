import { saveAs } from 'file-saver'
import * as XLSX from 'xlsx'
import type { BulkAssignShiftRequest } from '@/apis/endpoints/shift.api'

export interface ShiftAssignmentLookupShift {
  shiftId: string
  shiftName: string
  startTime: string
  endTime: string
}

export interface ShiftAssignmentLookupUser {
  userId: string
  userName: string
  userEmail: string
}

export interface ShiftAssignmentLookupData {
  shifts: ShiftAssignmentLookupShift[]
  users: ShiftAssignmentLookupUser[]
  existingAssignmentKeys: string[]
}

export interface ShiftImportValidationIssue {
  row: number
  field: 'work_date' | 'shift_name' | 'user_email' | 'row' | 'file'
  message: string
}

export interface ShiftImportPreviewRow {
  row: number
  workDate: string
  shiftName: string
  shiftTime: string
  userName: string
  userEmail: string
  status: 'valid' | 'error'
  errors: string[]
}

interface ParsedShiftImportResultSuccess {
  success: true
  rows: Record<string, unknown>[]
}

interface ParsedShiftImportResultError {
  success: false
  error: string
}

type ParsedShiftImportResult = ParsedShiftImportResultSuccess | ParsedShiftImportResultError

export interface PreparedShiftImportResult {
  items: BulkAssignShiftRequest['items']
  issues: ShiftImportValidationIssue[]
  previewRows: ShiftImportPreviewRow[]
}

interface ShiftImportExcelRow {
  work_date: string
  shift_name: string
  user_email: string
}

interface ShiftReferenceRow {
  shift_name: string
  start_time: string
  end_time: string
}

interface UserReferenceRow {
  user_name: string
  user_email: string
}

const EXCEL_HEADER_MAP: Record<string, keyof ShiftImportExcelRow> = {
  work_date: 'work_date',
  shift_name: 'shift_name',
  user_email: 'user_email',
}

const EXCEL_TEMPLATE_HEADERS: Array<keyof ShiftImportExcelRow> = [
  'work_date',
  'shift_name',
  'user_email',
]
const TEMPLATE_IMPORT_ROW_COUNT = 200

const normalizeHeader = (value: string) => value.replace(/^\uFEFF/, '').trim()

const normalizeLookupKey = (value: string) => value.trim().toLowerCase()

const normalizeTextValue = (value: unknown) => String(value ?? '').trim()

const formatDateParts = (year: number, month: number, day: number) => {
  return `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

const isValidDateParts = (year: number, month: number, day: number) => {
  const candidate = new Date(year, month - 1, day)
  return (
    candidate.getFullYear() === year &&
    candidate.getMonth() === month - 1 &&
    candidate.getDate() === day
  )
}

const normalizeWorkDate = (value: unknown) => {
  if (typeof value === 'number') {
    const parsed = XLSX.SSF.parse_date_code(value)

    if (!parsed || !isValidDateParts(parsed.y, parsed.m, parsed.d)) {
      return null
    }

    return formatDateParts(parsed.y, parsed.m, parsed.d)
  }

  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return formatDateParts(value.getFullYear(), value.getMonth() + 1, value.getDate())
  }

  const rawValue = String(value ?? '').trim()
  if (rawValue === '') return null

  const cleanedValue = rawValue.split('T')[0].split(' ')[0].trim()

  const yearFirstMatch = cleanedValue.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/)
  if (yearFirstMatch) {
    const [, year, month, day] = yearFirstMatch
    const parsedYear = Number(year)
    const parsedMonth = Number(month)
    const parsedDay = Number(day)

    if (!isValidDateParts(parsedYear, parsedMonth, parsedDay)) {
      return null
    }

    return formatDateParts(parsedYear, parsedMonth, parsedDay)
  }

  const dayFirstMatch = cleanedValue.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/)
  if (dayFirstMatch) {
    const [, day, month, year] = dayFirstMatch
    const parsedYear = Number(year)
    const parsedMonth = Number(month)
    const parsedDay = Number(day)

    if (!isValidDateParts(parsedYear, parsedMonth, parsedDay)) {
      return null
    }

    return formatDateParts(parsedYear, parsedMonth, parsedDay)
  }

  return null
}

const buildImportKey = (shiftId: string, userId: string, workDate: string) => {
  return `${shiftId}__${userId}__${workDate}`
}

const buildLookupMap = <T>(items: T[], getKey: (item: T) => string) => {
  const lookupMap = new Map<string, T[]>()

  items.forEach((item) => {
    const key = getKey(item)
    if (!key) return

    const existingItems = lookupMap.get(key)
    if (existingItems) {
      existingItems.push(item)
      return
    }

    lookupMap.set(key, [item])
  })

  return lookupMap
}

const buildImportTemplateSheet = () => {
  const worksheet = XLSX.utils.aoa_to_sheet([EXCEL_TEMPLATE_HEADERS])

  worksheet['!cols'] = [
    { wch: 16 },
    { wch: 28 },
    { wch: 32 },
  ]

  for (let rowIndex = 2; rowIndex <= TEMPLATE_IMPORT_ROW_COUNT + 1; rowIndex += 1) {
    worksheet[`A${rowIndex}`] = { t: 's', v: '', z: '@' }
    worksheet[`B${rowIndex}`] = { t: 's', v: '' }
    worksheet[`C${rowIndex}`] = { t: 's', v: '' }
  }

  worksheet['!ref'] = `A1:C${TEMPLATE_IMPORT_ROW_COUNT + 1}`

  return worksheet
}

const buildReferencesSheet = (lookupData: ShiftAssignmentLookupData) => {
  const shiftReferenceRows = lookupData.shifts
    .map<ShiftReferenceRow>((shift) => ({
      shift_name: shift.shiftName,
      start_time: shift.startTime,
      end_time: shift.endTime,
    }))
    .sort((left, right) => left.shift_name.localeCompare(right.shift_name))

  const userReferenceRows = lookupData.users
    .filter((user) => normalizeLookupKey(user.userEmail) !== '')
    .map<UserReferenceRow>((user) => ({
      user_name: user.userName,
      user_email: user.userEmail,
    }))
    .sort((left, right) => left.user_name.localeCompare(right.user_name))

  const rows: Array<Array<string>> = [
    ['DATE FORMAT', 'YYYY-MM-DD', 'Example', '2026-04-03', '', ''],
    ['SHIFT REFERENCES', '', '', '', 'USER REFERENCES', ''],
    ['shift_name', 'start_time', 'end_time', '', 'user_name', 'user_email'],
  ]

  const totalRows = Math.max(shiftReferenceRows.length, userReferenceRows.length)

  for (let index = 0; index < totalRows; index += 1) {
    const shiftRow = shiftReferenceRows[index]
    const userRow = userReferenceRows[index]

    rows.push([
      shiftRow?.shift_name || '',
      shiftRow?.start_time || '',
      shiftRow?.end_time || '',
      '',
      userRow?.user_name || '',
      userRow?.user_email || '',
    ])
  }

  const worksheet = XLSX.utils.aoa_to_sheet(rows)
  worksheet['!cols'] = [
    { wch: 28 },
    { wch: 12 },
    { wch: 12 },
    { wch: 4 },
    { wch: 24 },
    { wch: 30 },
  ]

  return worksheet
}

export const downloadShiftImportTemplate = (lookupData: ShiftAssignmentLookupData) => {
  const workbook = XLSX.utils.book_new()
  const importWorksheet = buildImportTemplateSheet()
  const referencesWorksheet = buildReferencesSheet(lookupData)

  XLSX.utils.book_append_sheet(workbook, importWorksheet, 'Import')
  XLSX.utils.book_append_sheet(workbook, referencesWorksheet, 'References')

  const workbookOutput = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
  const blob = new Blob([workbookOutput], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })

  saveAs(blob, `shift_import_template_${new Date().toISOString().slice(0, 10)}.xlsx`)
}

export const parseShiftImportFile = async (file: File): Promise<ParsedShiftImportResult> => {
  const validExtensions = ['.xlsx', '.xls', '.csv']
  const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase()

  if (!validExtensions.includes(fileExtension)) {
    return {
      success: false,
      error: 'Only Excel (.xlsx, .xls) or CSV (.csv) files are supported.',
    }
  }

  if (file.size > 5 * 1024 * 1024) {
    return {
      success: false,
      error: 'File is too large. Maximum size is 5MB.',
    }
  }

  try {
    const buffer = await file.arrayBuffer()
    const workbook = XLSX.read(buffer, { type: 'array' })
    const sheet = workbook.Sheets.Import || workbook.Sheets[workbook.SheetNames[0]]

    if (!sheet) {
      return {
        success: false,
        error: 'The file does not contain an Import sheet.',
      }
    }

    const rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
      defval: '',
    })

    if (rawRows.length === 0) {
      return {
        success: false,
        error: 'The Import sheet does not contain any data rows.',
      }
    }

    const firstRow = rawRows[0]
    const rawHeaders = Object.keys(firstRow).map((header) => normalizeHeader(header))
    const missingHeaders = EXCEL_TEMPLATE_HEADERS.filter((header) => !rawHeaders.includes(header))

    if (missingHeaders.length > 0) {
      return {
        success: false,
        error: `Missing required headers: ${missingHeaders.join(', ')}`,
      }
    }

    const mappedRows = rawRows
      .map((rawRow) => {
        const mappedRow: Record<string, unknown> = {}

        Object.entries(rawRow).forEach(([header, value]) => {
          const trimmedHeader = normalizeHeader(header)
          const field = EXCEL_HEADER_MAP[trimmedHeader]

          if (field) {
            mappedRow[field] = value
          }
        })

        return mappedRow
      })
      .filter((row) => Object.values(row).some((value) => String(value ?? '').trim() !== ''))

    if (mappedRows.length === 0) {
      return {
        success: false,
        error: 'The Import sheet does not contain any filled row.',
      }
    }

    return {
      success: true,
      rows: mappedRows,
    }
  } catch {
    return {
      success: false,
      error: 'Failed to read the import file. Please check the file format.',
    }
  }
}

export const prepareShiftImportRows = (
  rows: Record<string, unknown>[],
  lookupData: ShiftAssignmentLookupData,
): PreparedShiftImportResult => {
  const issues: ShiftImportValidationIssue[] = []
  const previewRows: ShiftImportPreviewRow[] = []
  const items: BulkAssignShiftRequest['items'] = []
  const shiftMatchesByName = buildLookupMap(
    lookupData.shifts,
    (shift) => normalizeLookupKey(shift.shiftName),
  )
  const userMatchesByEmail = buildLookupMap(
    lookupData.users.filter((user) => normalizeLookupKey(user.userEmail) !== ''),
    (user) => normalizeLookupKey(user.userEmail),
  )
  const existingAssignmentKeySet = new Set(lookupData.existingAssignmentKeys)
  const importedAssignmentKeyMap = new Map<string, number>()

  rows.forEach((row, index) => {
    const excelRowNumber = index + 2
    const rowErrors: string[] = []
    const rawShiftName = normalizeTextValue(row.shift_name)
    const rawUserEmail = normalizeTextValue(row.user_email)
    const normalizedShiftName = normalizeLookupKey(rawShiftName)
    const normalizedUserEmail = normalizeLookupKey(rawUserEmail)
    const normalizedWorkDate = normalizeWorkDate(row.work_date)
    const shiftMatches = normalizedShiftName ? shiftMatchesByName.get(normalizedShiftName) || [] : []
    const userMatches = normalizedUserEmail ? userMatchesByEmail.get(normalizedUserEmail) || [] : []
    const matchedShift = shiftMatches.length === 1 ? shiftMatches[0] : undefined
    const matchedUser = userMatches.length === 1 ? userMatches[0] : undefined

    if (!normalizedWorkDate) {
      const message = `Row ${excelRowNumber}: work_date must be a valid date in YYYY-MM-DD format.`
      rowErrors.push(message)
      issues.push({ row: excelRowNumber, field: 'work_date', message })
    }

    if (!rawShiftName) {
      const message = `Row ${excelRowNumber}: shift_name is required.`
      rowErrors.push(message)
      issues.push({ row: excelRowNumber, field: 'shift_name', message })
    }

    if (!rawUserEmail) {
      const message = `Row ${excelRowNumber}: user_email is required.`
      rowErrors.push(message)
      issues.push({ row: excelRowNumber, field: 'user_email', message })
    }

    if (rawShiftName && shiftMatches.length === 0) {
      const message = `Row ${excelRowNumber}: shift_name "${rawShiftName}" was not found in References.`
      rowErrors.push(message)
      issues.push({ row: excelRowNumber, field: 'shift_name', message })
    } else if (rawShiftName && shiftMatches.length > 1) {
      const message = `Row ${excelRowNumber}: shift_name "${rawShiftName}" matches multiple shifts in References.`
      rowErrors.push(message)
      issues.push({ row: excelRowNumber, field: 'shift_name', message })
    }

    if (rawUserEmail && userMatches.length === 0) {
      const message = `Row ${excelRowNumber}: user_email "${rawUserEmail}" was not found in References.`
      rowErrors.push(message)
      issues.push({ row: excelRowNumber, field: 'user_email', message })
    } else if (rawUserEmail && userMatches.length > 1) {
      const message = `Row ${excelRowNumber}: user_email "${rawUserEmail}" matches multiple users in References.`
      rowErrors.push(message)
      issues.push({ row: excelRowNumber, field: 'user_email', message })
    }

    if (normalizedWorkDate && matchedShift && matchedUser) {
      const assignmentKey = buildImportKey(
        matchedShift.shiftId,
        matchedUser.userId,
        normalizedWorkDate,
      )

      const duplicatedRow = importedAssignmentKeyMap.get(assignmentKey)
      if (duplicatedRow) {
        const message = `Row ${excelRowNumber}: this assignment duplicates row ${duplicatedRow}.`
        rowErrors.push(message)
        issues.push({ row: excelRowNumber, field: 'row', message })
      } else {
        importedAssignmentKeyMap.set(assignmentKey, excelRowNumber)
      }

      if (existingAssignmentKeySet.has(assignmentKey)) {
        const message = `Row ${excelRowNumber}: this shift assignment already exists in the calendar.`
        rowErrors.push(message)
        issues.push({ row: excelRowNumber, field: 'row', message })
      }

      if (rowErrors.length === 0) {
        items.push({
          shift_id: matchedShift.shiftId,
          user_id: matchedUser.userId,
          work_date: normalizedWorkDate,
        })
      }
    }

    previewRows.push({
      row: excelRowNumber,
      workDate: normalizedWorkDate || String(row.work_date ?? '').trim(),
      shiftName: matchedShift?.shiftName || rawShiftName,
      shiftTime: matchedShift ? `${matchedShift.startTime} - ${matchedShift.endTime}` : '',
      userName: matchedUser?.userName || '',
      userEmail: matchedUser?.userEmail || rawUserEmail,
      status: rowErrors.length === 0 ? 'valid' : 'error',
      errors: rowErrors,
    })
  })

  return {
    items,
    issues,
    previewRows,
  }
}
