import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import type { BulkAssignShiftRequest } from '@/apis/endpoints/shift.api'
import { useToast } from '@/hooks/use-toast.hook'
import {
  downloadShiftImportTemplate,
  parseShiftImportFile,
  prepareShiftImportRows,
  type ShiftImportPreviewRow,
  type ShiftAssignmentLookupData,
  type ShiftImportValidationIssue,
} from '../utils/shift-import.excel'

interface ShiftImportFormValues {
  file: FileList | null
}

interface ShiftImportModalProps {
  isOpen: boolean
  franchiseName: string
  lookupData: ShiftAssignmentLookupData
  isLookupLoading: boolean
  isSubmitting: boolean
  onClose: () => void
  onSubmit: (payload: BulkAssignShiftRequest) => Promise<boolean>
}

export const ShiftImportModal: React.FC<ShiftImportModalProps> = ({
  isOpen,
  franchiseName,
  lookupData,
  isLookupLoading,
  isSubmitting,
  onClose,
  onSubmit,
}) => {
  const { success, error, warning } = useToast()
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [isParsingFile, setIsParsingFile] = useState(false)
  const [selectedFileName, setSelectedFileName] = useState('')
  const [preparedItems, setPreparedItems] = useState<BulkAssignShiftRequest['items']>([])
  const [previewRows, setPreviewRows] = useState<ShiftImportPreviewRow[]>([])
  const [validationIssues, setValidationIssues] = useState<ShiftImportValidationIssue[]>([])
  const {
    register,
    handleSubmit,
    reset,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<ShiftImportFormValues>({
    mode: 'onChange',
    defaultValues: {
      file: null,
    },
  })

  const fileField = register('file', {
    validate: (value) => (value && value.length > 0) || 'Please select an import file.',
  })

  const summary = useMemo(() => {
    const validCount = previewRows.filter((row) => row.status === 'valid').length
    const errorCount = previewRows.length - validCount

    return {
      totalRows: previewRows.length,
      validCount,
      errorCount,
    }
  }, [previewRows])

  useEffect(() => {
    if (!isOpen) {
      reset({ file: null })
      setSelectedFileName('')
      setPreparedItems([])
      setPreviewRows([])
      setValidationIssues([])
      clearErrors()
    }
  }, [clearErrors, isOpen, reset])

  if (!isOpen) {
    return null
  }

  const handlePickFile = () => {
    if (!fileInputRef.current) return

    fileInputRef.current.value = ''
    fileInputRef.current.click()
  }

  const handleDownloadTemplate = () => {
    const hasReferenceUsers = lookupData.users.some((user) => user.userEmail.trim() !== '')

    if (lookupData.shifts.length === 0 || !hasReferenceUsers) {
      warning(
        'Lookup data is limited',
        'The template will still be downloaded, but the References sheet may not list every shift or user email.',
      )
    }

    downloadShiftImportTemplate(lookupData)
    success(
      'Template downloaded',
      'The Excel template is ready with friendly import columns and a References sheet.',
    )
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    fileField.onChange(event)

    const nextFile = event.target.files?.[0]

    setSelectedFileName(nextFile?.name || '')
    setPreparedItems([])
    setPreviewRows([])
    setValidationIssues([])
    clearErrors('file')

    if (!nextFile) {
      return
    }

    setIsParsingFile(true)

    try {
      const parseResult = await parseShiftImportFile(nextFile)

      if (!parseResult.success) {
        setError('file', { type: 'manual', message: parseResult.error })
        error('Import file is invalid', parseResult.error)
        return
      }

      const preparedResult = prepareShiftImportRows(parseResult.rows, lookupData)
      setPreparedItems(preparedResult.items)
      setPreviewRows(preparedResult.previewRows)
      setValidationIssues(preparedResult.issues)

      if (preparedResult.previewRows.length === 0) {
        setError('file', { type: 'manual', message: 'The file does not contain any valid data row.' })
        warning('No rows detected', 'Please check the Excel file content.')
        return
      }

      if (preparedResult.issues.length > 0) {
        warning(
          'Validation errors found',
          `${preparedResult.issues.length} issue(s) need to be fixed before import.`,
        )
        return
      }

      success('File is ready', `${preparedResult.items.length} assignment(s) are ready to import.`)
    } finally {
      setIsParsingFile(false)
    }
  }

  const handleClose = () => {
    if (isSubmitting || isParsingFile) return
    onClose()
  }

  const submitImport = handleSubmit(async () => {
    if (preparedItems.length === 0) {
      setError('file', {
        type: 'manual',
        message: 'Please choose a valid file before importing.',
      })
      return
    }

    if (validationIssues.length > 0) {
      warning('Import is blocked', 'Please fix all validation errors before submitting.')
      return
    }

    const isSuccess = await onSubmit({ items: preparedItems })
    if (isSuccess) {
      onClose()
    }
  })

  return (
    <div className="fixed inset-0 z-[70] flex items-start justify-center overflow-y-auto bg-slate-950/55 px-3 py-3 sm:items-center sm:px-4 sm:py-6">
      <div className="flex max-h-[calc(100dvh-1.5rem)] w-full max-w-6xl flex-col overflow-hidden rounded-2xl bg-white shadow-[0_30px_80px_rgba(15,23,42,0.28)] sm:max-h-[94vh] sm:rounded-[32px]">
        <div className="flex flex-col gap-4 border-b border-slate-200 bg-[linear-gradient(135deg,_rgba(248,250,252,0.98),_rgba(239,246,255,0.95))] px-4 py-5 sm:flex-row sm:items-start sm:justify-between sm:px-6 lg:px-8 lg:py-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
              Shift Import
            </p>
            <h3 className="mt-2 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
              Import Shift Assignments
            </h3>
            <p className="mt-3 text-sm text-slate-500">
              Franchise scope: {franchiseName || 'Selected franchise'}
            </p>
          </div>

          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting || isParsingFile}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/80 bg-white/80 text-slate-500 shadow-sm backdrop-blur transition-colors hover:bg-white hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
            aria-label="Close shift import modal"
          >
            <span className="material-symbols-outlined text-[22px]">close</span>
          </button>
        </div>

        <div className="grid min-h-0 flex-1 lg:grid-cols-[360px_minmax(0,1fr)]">
          <div className="overflow-y-auto border-b border-slate-200 bg-slate-50/70 px-4 py-5 sm:px-6 lg:border-b-0 lg:border-r lg:px-6 lg:py-6">
            <form onSubmit={submitImport} className="space-y-4">
              <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-primary">
                    <span className="material-symbols-outlined text-[20px]">inventory_2</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-base font-semibold text-slate-900">Template</h4>
                    <p className="mt-1 text-sm leading-6 text-slate-500">
                      Download one Excel file with two sheets: <span className="font-medium text-slate-700">Import</span> and <span className="font-medium text-slate-700">References</span>.
                      The import sheet uses <span className="font-medium text-slate-700">work_date</span>, <span className="font-medium text-slate-700">shift_name</span>, and <span className="font-medium text-slate-700">user_email</span>.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleDownloadTemplate}
                  disabled={isLookupLoading}
                  className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <span className="material-symbols-outlined text-[18px]">download</span>
                  <span>Download Template</span>
                </button>
              </div>

              <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
                <label className="mb-3 block text-sm font-semibold text-slate-900">Excel file</label>
                <input
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  hidden
                  {...fileField}
                  ref={(element) => {
                    fileField.ref(element)
                    fileInputRef.current = element
                  }}
                  onChange={handleFileChange}
                />

                <button
                  type="button"
                  onClick={handlePickFile}
                  disabled={isParsingFile || isSubmitting || isLookupLoading}
                  className="flex w-full items-center gap-4 rounded-[24px] border border-dashed border-slate-300 bg-slate-50 px-4 py-4 text-left transition-all hover:border-primary hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-slate-500 shadow-sm">
                    <span className="material-symbols-outlined text-[22px]">upload_file</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-base font-semibold text-slate-900">
                      {selectedFileName || 'Choose a file to import'}
                    </div>
                    <div className="mt-1 text-sm leading-6 text-slate-500">
                      {isLookupLoading
                        ? 'Loading franchise lookup data...'
                        : isParsingFile
                          ? 'Parsing and validating file...'
                          : 'Use work_date, shift_name, and user_email from the template.'}
                    </div>
                  </div>
                </button>

                {errors.file && (
                  <p className="mt-3 text-xs font-medium text-red-500">{errors.file.message as string}</p>
                )}
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="flex min-h-[138px] flex-col justify-between rounded-[24px] border border-slate-200 bg-white px-4 py-4 text-center shadow-sm">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                    Total Rows
                  </div>
                  <div className="text-4xl font-black leading-none text-slate-900">{summary.totalRows}</div>
                </div>
                <div className="flex min-h-[138px] flex-col justify-between rounded-[24px] border border-emerald-200 bg-emerald-50 px-4 py-4 text-center shadow-sm shadow-emerald-100/60">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-600">
                    Ready
                  </div>
                  <div className="text-4xl font-black leading-none text-emerald-700">{summary.validCount}</div>
                </div>
                <div className="flex min-h-[138px] flex-col justify-between rounded-[24px] border border-red-200 bg-red-50 px-4 py-4 text-center shadow-sm shadow-red-100/60">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-red-500">
                    Errors
                  </div>
                  <div className="text-4xl font-black leading-none text-red-600">{summary.errorCount}</div>
                </div>
              </div>

              <div className="flex flex-col-reverse items-stretch gap-3 pt-2 sm:flex-row sm:items-center sm:justify-end">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isSubmitting || isParsingFile}
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={
                    isSubmitting ||
                    isParsingFile ||
                    isLookupLoading ||
                    preparedItems.length === 0 ||
                    validationIssues.length > 0
                  }
                  className="rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  {isSubmitting ? 'Importing...' : `Import ${preparedItems.length || ''}`.trim()}
                </button>
              </div>
            </form>
          </div>

          <div className="min-w-0 overflow-y-auto px-4 py-5 sm:px-6 lg:px-6 lg:py-6">
            <div className="rounded-[28px] border border-slate-200 bg-slate-50 px-5 py-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h4 className="text-xl font-semibold text-slate-900">Preview</h4>
                  <p className="mt-1 text-sm text-slate-500">
                    Review parsed rows before sending the bulk assignment request.
                  </p>
                </div>
                {selectedFileName && (
                  <div className="max-w-full rounded-2xl bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm">
                    <span className="block truncate">{selectedFileName}</span>
                  </div>
                )}
              </div>
            </div>

            {validationIssues.length > 0 && (
              <div className="mt-4 rounded-[28px] border border-red-200 bg-red-50 p-5">
                <div className="text-sm font-semibold text-red-700">
                  {validationIssues.length} validation issue(s)
                </div>
                <div className="mt-3 max-h-44 space-y-2 overflow-y-auto pr-1 text-sm leading-6 text-red-600">
                  {validationIssues.map((issue, index) => (
                    <p key={`${issue.row}-${issue.field}-${index}`}>{issue.message}</p>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-4">
              {previewRows.length === 0 ? (
                <div className="rounded-[28px] border border-dashed border-slate-300 bg-slate-50 px-6 py-16 text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white text-slate-400 shadow-sm">
                    <span className="material-symbols-outlined text-[26px]">table_chart</span>
                  </div>
                  <h5 className="mt-4 text-lg font-semibold text-slate-900">Preview will appear here</h5>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Choose a template file to see resolved shift details and matched user information before import.
                  </p>
                </div>
              ) : (
                <div className="max-h-[560px] space-y-3 overflow-y-auto pr-1">
                  {previewRows.map((row) => (
                    <article
                      key={`preview-row-${row.row}`}
                      className={`rounded-[28px] border p-5 shadow-sm transition-colors ${
                        row.status === 'valid'
                          ? 'border-slate-200 bg-white'
                          : 'border-red-200 bg-red-50/70'
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <span className="inline-flex h-9 min-w-9 items-center justify-center rounded-full bg-slate-100 px-3 text-sm font-semibold text-slate-700">
                            {row.row}
                          </span>
                          <div>
                            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                              Work date
                            </div>
                            <div className="mt-1 font-mono text-sm font-semibold text-slate-700">
                              {row.workDate || '-'}
                            </div>
                          </div>
                        </div>

                        <span
                          className={`inline-flex rounded-full px-3 py-1.5 text-xs font-semibold ${
                            row.status === 'valid'
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-red-100 text-red-600'
                          }`}
                        >
                          {row.status === 'valid' ? 'Ready' : 'Error'}
                        </span>
                      </div>

                      <div className="mt-4 grid gap-3 md:grid-cols-2">
                        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                            Shift
                          </div>
                          <div className="mt-2 text-base font-semibold text-slate-900">
                            {row.shiftName || 'Unresolved shift'}
                          </div>
                          <div className="mt-2 text-sm text-slate-500">
                            {row.shiftTime || 'No matched shift time'}
                          </div>
                        </div>

                        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                            User
                          </div>
                          <div className="mt-2 text-base font-semibold text-slate-900">
                            {row.userName || 'Unresolved user'}
                          </div>
                          <div className="mt-1 text-sm text-slate-500">{row.userEmail || '-'}</div>
                        </div>
                      </div>

                      {row.errors.length > 0 && (
                        <div className="mt-4 rounded-2xl border border-red-200 bg-white px-4 py-3 text-sm text-red-600">
                          {row.errors[0]}
                        </div>
                      )}
                    </article>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
