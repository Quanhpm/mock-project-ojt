import React, { useState, useEffect, useRef } from 'react'
import { useDroppable } from '@dnd-kit/core'
import { motion, AnimatePresence } from 'framer-motion'
import type { CalendarDay, DailyShiftView, ShiftAssignmentView } from '../hooks/useShiftCalendar.hook'
import type { ShiftCalendarViewMode } from '../stores/shift-management.store'

// ─── Types ────────────────────────────────────────────────────────────────────

interface ShiftCalendarProps {
  monthLabel: string
  calendarDays: CalendarDay[]
  selectedDate: Date | null
  viewMode: ShiftCalendarViewMode
  hoveredDateKey?: string | null
  closeSignal?: number
  onSelectDate: (date: Date) => void
  onPrevMonth: () => void
  onNextMonth: () => void
  onOpenShiftDetail?: (shift: DailyShiftView) => void
}

interface DroppableDayCellProps {
  day: CalendarDay
  dayKey: string
  isSelected: boolean
  isHovered: boolean
  viewMode: ShiftCalendarViewMode
  maxVisible: number
  disabled?: boolean
  onSelectDate: (date: Date) => void
  onOpenShiftDetail?: (shift: DailyShiftView) => void
}

// ─── Constants ────────────────────────────────────────────────────────────────

const WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

const STATUS_STYLES: Record<string, string> = {
  PENDING:   'bg-amber-50 text-amber-700 ring-amber-700/10',
  ASSIGNED:  'bg-blue-50 text-blue-700 ring-blue-700/10',
  COMPLETED: 'bg-green-50 text-green-700 ring-green-700/10',
  CANCELED:  'bg-slate-100 text-slate-700 ring-slate-300',
  ABSENT:    'bg-red-50 text-red-700 ring-red-700/10',
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatDateKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`

const getStatusClass = (a: ShiftAssignmentView) =>
  STATUS_STYLES[a.status] ?? 'bg-slate-50 text-slate-700 ring-slate-200'

// ─── ModalDroppableShift ──────────────────────────────────────────────────────

const ModalDroppableShift: React.FC<{ shift: DailyShiftView; workDate: string }> = ({ shift, workDate }) => {
  const { isOver, setNodeRef } = useDroppable({
    id: `shift-${shift.shiftId}-${workDate}`,
    data: { type: 'shift', shiftId: shift.shiftId, workDate },
  })

  return (
    <div
      ref={setNodeRef}
      className={`flex items-center justify-between gap-3 rounded-xl border-2 px-4 py-3 text-sm transition-colors duration-150 ${
        isOver
          ? 'border-primary bg-primary/10 text-primary ring-4 ring-primary/20'
          : 'border-slate-200 bg-white text-slate-700 hover:border-primary/40'
      }`}
    >
      <div className="flex flex-col gap-0.5">
        <span className="font-bold">{shift.shiftName}</span>
        <span className="text-xs text-slate-500">{shift.startTime} - {shift.endTime}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
          shift.assignmentCount > 0 ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'
        }`}>
          {shift.assignmentCount} nhân viên
        </span>
        {isOver && (
          <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="material-symbols-outlined text-primary text-[20px]">
            add_circle
          </motion.span>
        )}
      </div>
    </div>
  )
}

// ─── DroppableDayCell ─────────────────────────────────────────────────────────

const DroppableDayCell: React.FC<DroppableDayCellProps> = ({
  day, dayKey, isSelected, isHovered, viewMode, maxVisible, disabled, onSelectDate, onOpenShiftDetail,
}) => {
  const { setNodeRef } = useDroppable({
    id: `date-${dayKey}`,
    data: { type: 'date', date: dayKey, shifts: day.shifts },
    disabled,
  })

  const visibleItems = viewMode === 'assignment' ? day.assignments : day.shifts
  const hiddenCount = Math.max(visibleItems.length - maxVisible, 0)

  return (
    <div
      ref={setNodeRef}
      role="button"
      tabIndex={0}
      onClick={() => onSelectDate(day.date)}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelectDate(day.date) } }}
      className={[
        'relative h-full min-h-[92px] border-b border-r border-slate-200 text-left last:border-r-0 focus:outline-none transition-colors sm:min-h-[100px]',
        day.isCurrentMonth ? 'bg-white' : 'bg-slate-50 text-slate-400',
        isSelected ? 'ring-2 ring-inset ring-primary z-10' : '',
        isHovered && !disabled ? 'bg-primary/5 ring-2 ring-primary ring-inset' : 'hover:bg-slate-50',
        disabled ? 'pointer-events-none opacity-50' : '',
      ].join(' ')}
    >
      <div className="p-2 xl:p-2.5">
        <div className="mb-1 flex items-center justify-between gap-2">
          <span className={`text-sm font-semibold ${day.isToday || isHovered ? 'text-primary' : 'text-slate-900'}`}>
            {day.date.getDate()}
          </span>
          {visibleItems.length > 0 && (
            <span className="shrink-0 text-[10px] text-slate-400">
              {viewMode === 'assignment' ? `${day.assignments.length} asn` : `${day.shifts.length} shifts`}
            </span>
          )}
        </div>

        <div className="flex flex-col gap-1">
          {viewMode === 'assignment' && day.assignments.slice(0, maxVisible).map((a) => (
            <span key={a.id} className={`inline-flex items-center rounded-md px-2 py-1 text-[10px] font-medium ring-1 ring-inset truncate ${getStatusClass(a)}`}>
              {a.staffName} - {a.shiftName}
            </span>
          ))}

          {viewMode === 'shift' && day.shifts.slice(0, maxVisible).map((shift) => (
            <button
              key={shift.id}
              type="button"
              onClick={(e) => { e.stopPropagation(); onSelectDate(day.date); onOpenShiftDetail?.(shift) }}
              className="inline-flex items-center justify-between gap-2 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-left text-[11px] font-semibold text-slate-700 transition-colors hover:border-primary hover:bg-primary/5 hover:text-primary"
            >
              <span className="truncate">{shift.shiftName} ({shift.startTime} - {shift.endTime})</span>
              <span className="rounded-full bg-white px-1.5 py-0.5 text-[10px] text-slate-500 shadow-sm border border-slate-100">
                {shift.assignmentCount}
              </span>
            </button>
          ))}

          {hiddenCount > 0 && (
            <span className="mt-1 block text-center text-[12px] font-bold tracking-[0.2em] text-slate-500">...</span>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── ShiftDropModal ───────────────────────────────────────────────────────────

const ShiftDropModal: React.FC<{ day: CalendarDay; dayKey: string }> = ({ day, dayKey }) => {
  const scrollRef = useRef<HTMLDivElement>(null)
  const animFrameRef = useRef<number>(0)

  useEffect(() => {
    const ZONE = 60
    const SPEED = 8

    const onPointerMove = (e: PointerEvent) => {
      const el = scrollRef.current
      if (!el) return
      cancelAnimationFrame(animFrameRef.current)
      const { top, bottom } = el.getBoundingClientRect()
      const fromTop = e.clientY - top
      const fromBottom = bottom - e.clientY
      const tick = () => {
        if (!scrollRef.current) return
        if (fromBottom < ZONE && fromBottom > 0) {
          scrollRef.current.scrollTop += SPEED * (1 - fromBottom / ZONE)
          animFrameRef.current = requestAnimationFrame(tick)
        } else if (fromTop < ZONE && fromTop > 0) {
          scrollRef.current.scrollTop -= SPEED * (1 - fromTop / ZONE)
          animFrameRef.current = requestAnimationFrame(tick)
        }
      }
      tick()
    }

    window.addEventListener('pointermove', onPointerMove)
    return () => { window.removeEventListener('pointermove', onPointerMove); cancelAnimationFrame(animFrameRef.current) }
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className="fixed inset-0 z-[200] flex items-center justify-center pointer-events-auto"
    >
      <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px]" />

      <motion.div
        initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.7, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="relative z-10 w-[calc(100%-1.5rem)] max-w-md rounded-2xl bg-white p-5 shadow-2xl ring-1 ring-slate-200 sm:w-full"
      >
        <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              {day.date.toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Thả nhân viên vào ca bên dưới để phân công</p>
          </div>
          <div className="flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 animate-pulse">
            <span className="material-symbols-outlined text-primary text-[16px]">person_add</span>
            <span className="text-[11px] font-semibold text-primary">Kéo thả vào đây</span>
          </div>
        </div>

        <div ref={scrollRef} className="flex max-h-[50vh] flex-col gap-2.5 overflow-y-auto custom-scrollbar p-1 -mx-1" style={{ overscrollBehavior: 'contain' }}>
          {day.shifts.length === 0 ? (
            <div className="rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 p-6 text-center">
              <span className="material-symbols-outlined text-slate-300 text-[32px] mb-2 block">event_busy</span>
              <p className="text-sm font-medium text-slate-400">Không có ca làm việc nào trong ngày này</p>
            </div>
          ) : (
            day.shifts.map((shift) => <ModalDroppableShift key={shift.shiftId} shift={shift} workDate={dayKey} />)
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}

// ─── ShiftCalendar (Main) ─────────────────────────────────────────────────────

export const ShiftCalendar: React.FC<ShiftCalendarProps> = ({
  monthLabel, calendarDays, selectedDate, viewMode, hoveredDateKey, closeSignal,
  onSelectDate, onPrevMonth, onNextMonth, onOpenShiftDetail,
}) => {
  const selectedKey = selectedDate ? formatDateKey(selectedDate) : ''
  const [modalDayKey, setModalDayKey] = useState<string | null>(null)

  useEffect(() => {
    if (!hoveredDateKey) return
    const t = setTimeout(() => setModalDayKey(hoveredDateKey), 700)
    return () => clearTimeout(t)
  }, [hoveredDateKey])

  useEffect(() => {
    if ((closeSignal ?? 0) <= 0) return

    const timeoutId = window.setTimeout(() => {
      setModalDayKey(null)
    }, 0)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [closeSignal])

  const modalDay = modalDayKey ? calendarDays.find((d) => formatDateKey(d.date) === modalDayKey) : null

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      {/* Header */}
      <div className="flex flex-col gap-3 border-b border-slate-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <button onClick={onPrevMonth} className="rounded-lg p-2 text-slate-600 transition-colors hover:bg-slate-100 hover:text-primary" aria-label="Previous month">
            <span className="material-symbols-outlined text-[20px]">chevron_left</span>
          </button>
          <button onClick={onNextMonth} className="rounded-lg p-2 text-slate-600 transition-colors hover:bg-slate-100 hover:text-primary" aria-label="Next month">
            <span className="material-symbols-outlined text-[20px]">chevron_right</span>
          </button>
          <h3 className="text-lg font-bold text-slate-900">{monthLabel}</h3>
        </div>
        <span className="text-sm text-slate-500">{viewMode === 'assignment' ? 'Assignment View' : 'Shift View'}</span>
      </div>

      {/* Weekday labels */}
      <div className="overflow-x-auto">
        <div className="min-w-[760px]">
          <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-500">
            {WEEK_DAYS.map((d) => (
              <div key={d} className="border-r border-slate-200 px-3 py-2 last:border-r-0">{d}</div>
            ))}
          </div>

          {/* Day grid */}
          <div className="grid flex-1 grid-cols-7 auto-rows-fr">
            {calendarDays.map((day, i) => {
              const dayKey = formatDateKey(day.date)
              return (
                <DroppableDayCell
                  key={`${dayKey}-${i}`}
                  day={day}
                  dayKey={dayKey}
                  isSelected={selectedKey === dayKey}
                  isHovered={hoveredDateKey === dayKey}
                  viewMode={viewMode}
                  maxVisible={2}
                  disabled={!!modalDayKey}
                  onSelectDate={onSelectDate}
                  onOpenShiftDetail={onOpenShiftDetail}
                />
              )
            })}
          </div>
        </div>
      </div>

      {/* Drag-drop modal */}
      <AnimatePresence>
        {modalDay && modalDayKey && <ShiftDropModal day={modalDay} dayKey={modalDayKey} />}
      </AnimatePresence>
    </div>
  )
}
