import React, { useMemo } from 'react'
import type { CalendarDay, DailyShiftView, ShiftAssignmentView } from '../hooks/useShiftCalendar.hook'
import { useDroppable, useDraggable } from '@dnd-kit/core'

const getStatusClass = (assignment: ShiftAssignmentView) => {
  switch (assignment.status) {
    case 'COMPLETED':
      return 'bg-emerald-50 text-emerald-700 ring-emerald-600/20'
    case 'CANCELED':
      return 'bg-rose-50 text-rose-700 ring-rose-600/20'
    case 'ABSENT':
      return 'bg-orange-50 text-orange-700 ring-orange-600/20'
    case 'ASSIGNED':
      return 'bg-blue-50 text-blue-700 ring-blue-600/20'
    case 'PENDING':
    default:
      return 'bg-amber-50 text-amber-700 ring-amber-600/20'
  }
}

interface ShiftDailyTimelineProps {
  selectedDay: CalendarDay | undefined
  onSelectDate: (date: Date) => void
  onOpenShiftDetail?: (shift: DailyShiftView) => void
}

const START_HOUR = 0
const TOTAL_HOURS = 24

const calculatePosition = (startTime: string, endTime: string) => {
  const parseTime = (timeStr: string) => {
    const [h, m] = timeStr.split(':').map(Number)
    return h * 60 + m
  }

  const startMins = parseTime(startTime)
  let endMins = parseTime(endTime)
  if (endMins <= startMins) {
    endMins += 24 * 60
  }

  const durationMins = endMins - startMins
  const totalMins = TOTAL_HOURS * 60

  const left = (startMins / totalMins) * 100
  const width = (durationMins / totalMins) * 100

  return { left: `${left}%`, width: `${width}%` }
}

const DraggableAssignmentItem: React.FC<{
  assignment: ShiftAssignmentView
}> = ({ assignment }) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `assignment-${assignment.id}`,
    data: {
      type: 'assignment',
      assignmentId: assignment.id,
      shiftId: assignment.shiftId,
      workDate: assignment.workDate,
      userId: assignment.staffId,
      user: {
        userId: assignment.staffId,
        userName: assignment.staffName,
      },
    },
  })

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium border cursor-grab active:cursor-grabbing hover:opacity-80 transition-opacity ${getStatusClass(
        assignment,
      )} ${isDragging ? 'opacity-50 ring-2 ring-primary/50' : 'border-slate-200 bg-slate-100'}`}
    >
      {assignment.staffAvatar ? (
        <img src={assignment.staffAvatar} alt="" className="w-3 h-3 rounded-full" />
      ) : (
        <div className="w-3 h-3 rounded-full bg-slate-300 flex items-center justify-center text-[6px] text-white">
          {assignment.staffName.charAt(0)}
        </div>
      )}
      <span className="truncate max-w-[60px]">{assignment.staffName}</span>
    </div>
  )
}

const TimelineDroppableShift: React.FC<{
  shift: DailyShiftView
  workDate: string
  onClick: () => void
}> = ({ shift, workDate, onClick }) => {
  const { isOver, setNodeRef } = useDroppable({
    id: `timeline-shift-${shift.shiftId}-${workDate}`,
    data: {
      type: 'shift',
      shiftId: shift.shiftId,
      workDate,
      shiftData: shift,
    },
  })

  const { left, width } = useMemo(
    () => calculatePosition(shift.startTime, shift.endTime),
    [shift.startTime, shift.endTime],
  )

  return (
    <div className="relative h-24 w-full group py-1">
      <div
        ref={setNodeRef}
        onClick={onClick}
        style={{ left, width }}
        className={`absolute top-1 bottom-1 flex flex-col rounded-lg border p-2 shadow-sm transition-colors cursor-pointer ${
          isOver
            ? 'border-primary bg-primary/10 ring-2 ring-primary ring-opacity-50 z-10'
            : 'border-slate-200 bg-white hover:border-primary/50 hover:shadow-md'
        }`}
      >
        <div className="flex items-center justify-between mb-1">
          <span className="truncate text-xs font-bold text-slate-800">
            {shift.shiftName}
          </span>
          <span className="shrink-0 text-[10px] font-medium text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
            {shift.startTime} - {shift.endTime}
          </span>
        </div>
        
        <div className="flex flex-wrap gap-1 mt-auto overflow-hidden">
          {shift.assignments.length === 0 ? (
            <span className="text-[10px] italic text-slate-400">Empty shift</span>
          ) : (
            shift.assignments.map((assignment) => (
              <DraggableAssignmentItem key={assignment.id} assignment={assignment} />
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export const ShiftDailyTimeline: React.FC<ShiftDailyTimelineProps> = ({
  selectedDay,
  onOpenShiftDetail,
}) => {
  if (!selectedDay) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center rounded-xl bg-white p-6 text-center ring-1 ring-slate-200 md:min-h-[600px] xl:h-full">
        <span className="material-symbols-outlined mb-4 text-5xl text-slate-300">
          view_timeline
        </span>
        <h3 className="text-lg font-semibold text-slate-900">Select a day</h3>
        <p className="mt-2 text-sm text-slate-500">
          Please select a specific day to view the daily timeline.
        </p>
      </div>
    )
  }

  const hours = Array.from({ length: TOTAL_HOURS }, (_, i) => i + START_HOUR)
  const todayKey = selectedDay.date.toISOString().split('T')[0] // rough key for passing

  return (
    <div className="flex min-h-[60vh] flex-col rounded-xl bg-white ring-1 ring-slate-200 md:min-h-[600px] xl:h-full">
      <div className="flex flex-col gap-3 border-b border-slate-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <span className="material-symbols-outlined">today</span>
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {selectedDay.date.toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
              })}
            </h2>
            <p className="text-xs font-medium text-slate-500">
              {selectedDay.shifts.length} shifts · {selectedDay.assignments.length} assignments
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto bg-slate-50 p-4 sm:p-5">
        <div className="min-w-[760px] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm md:min-w-[1000px]">
          {/* Header Axis */}
          <div className="relative flex h-10 border-b border-slate-100 bg-slate-50/50">
            {hours.map((hour) => (
              <div
                key={hour}
                className="relative flex-1 border-r border-slate-100 text-center"
              >
                <span className="absolute -left-3 top-2.5 z-10 bg-slate-50/50 px-1 text-[10px] font-semibold text-slate-400">
                  {hour.toString().padStart(2, '0')}:00
                </span>
              </div>
            ))}
          </div>

          {/* Body Timeline */}
          <div className="relative min-h-[400px]">
            {/* Background Grid Lines */}
            <div className="pointer-events-none absolute inset-0 flex">
              {hours.map((hour) => (
                <div key={hour} className="flex-1 border-r border-slate-100 border-dashed" />
              ))}
            </div>

            {/* Shift Tracks */}
            <div className="relative flex flex-col gap-1 p-2">
              {selectedDay.shifts.length === 0 ? (
                <div className="flex items-center justify-center pt-20">
                  <p className="text-sm font-medium text-slate-400">No shifts scheduled for this day.</p>
                </div>
              ) : (
                selectedDay.shifts.map((shift) => (
                  <TimelineDroppableShift
                    key={shift.shiftId}
                    shift={shift}
                    workDate={shift.workDate || todayKey}
                    onClick={() => onOpenShiftDetail?.(shift)}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
