import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

interface CalendarPickerProps {
  startDate: string;
  endDate: string;
  onDateChange: (start: string, end: string) => void;
  label?: string;
}

export function CalendarPicker({ startDate, endDate, onDateChange, label = 'Date Range' }: CalendarPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectingStart, setSelectingStart] = useState(true);
  const [tempStart, setTempStart] = useState(startDate);
  const [tempEnd, setTempEnd] = useState(endDate);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTempStart(startDate);
    setTempEnd(endDate);
  }, [startDate, endDate]);

  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect();
      const dropdownHeight = 400; // Approximate height of the dropdown
      const dropdownWidth = 600; // Approximate width of the dropdown
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;

      let top = buttonRect.bottom + 8;
      let left = buttonRect.left;

      // Adjust if dropdown would go below viewport
      if (top + dropdownHeight > viewportHeight) {
        top = buttonRect.top - dropdownHeight - 8;
      }

      // Adjust if dropdown would go beyond right edge
      if (left + dropdownWidth > viewportWidth) {
        left = viewportWidth - dropdownWidth - 16;
      }

      // Ensure it doesn't go beyond left edge
      if (left < 16) {
        left = 16;
      }

      setDropdownPosition({ top, left });
    }
  }, [isOpen]);

  const formatDisplayDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: (number | null)[] = [];

    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }

    return days;
  };

  const isDateInRange = (day: number) => {
    if (!tempStart || !tempEnd) return false;
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const start = new Date(tempStart);
    const end = new Date(tempEnd);
    return date >= start && date <= end;
  };

  const isDateSelected = (day: number) => {
    const dateStr = formatDateToString(day);
    return dateStr === tempStart || dateStr === tempEnd;
  };

  const formatDateToString = (day: number) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    return date.toISOString().split('T')[0];
  };

  const handleDayClick = (day: number) => {
    const dateStr = formatDateToString(day);

    if (selectingStart) {
      setTempStart(dateStr);
      if (tempEnd && dateStr > tempEnd) {
        setTempEnd(dateStr);
      }
      setSelectingStart(false);
    } else {
      if (dateStr < tempStart) {
        setTempEnd(tempStart);
        setTempStart(dateStr);
      } else {
        setTempEnd(dateStr);
      }
      setSelectingStart(true);
    }
  };

  const handleApply = () => {
    onDateChange(tempStart, tempEnd);
    setIsOpen(false);
  };

  const handleQuickSelect = (range: string) => {
    const today = new Date();
    let start = new Date();
    let end = new Date();

    switch (range) {
      case 'today':
        start = today;
        end = today;
        break;
      case 'yesterday':
        start = new Date(today.setDate(today.getDate() - 1));
        end = new Date(start);
        break;
      case 'last7days':
        start = new Date(today.setDate(today.getDate() - 6));
        end = new Date();
        break;
      case 'last30days':
        start = new Date(today.setDate(today.getDate() - 29));
        end = new Date();
        break;
      case 'thisMonth':
        start = new Date(today.getFullYear(), today.getMonth(), 1);
        end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        break;
      case 'lastMonth':
        start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        end = new Date(today.getFullYear(), today.getMonth(), 0);
        break;
      case 'thisYear':
        start = new Date(today.getFullYear(), 0, 1);
        end = new Date(today.getFullYear(), 11, 31);
        break;
    }

    const startStr = start.toISOString().split('T')[0];
    const endStr = end.toISOString().split('T')[0];

    setTempStart(startStr);
    setTempEnd(endStr);
    onDateChange(startStr, endStr);
    setIsOpen(false);
  };

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const monthName = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const days = getDaysInMonth(currentMonth);
  const weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  return (
    <div className="relative">
      <label className="block text-xs font-semibold text-blue-700 mb-2 uppercase tracking-wider">{label}</label>
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between gap-2 px-4 py-2.5 text-sm text-gray-700 bg-white/80 backdrop-blur-sm border-2 border-blue-200 rounded-xl hover:border-blue-300 shadow-sm transition-all duration-200"
      >
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-blue-600" />
          <span>
            {startDate && endDate
              ? `${formatDisplayDate(startDate)} - ${formatDisplayDate(endDate)}`
              : 'Select date range'}
          </span>
        </div>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-30"
            onClick={() => setIsOpen(false)}
          />
          <div
            ref={dropdownRef}
            className="fixed bg-white border border-gray-200 rounded-lg shadow-xl z-40 overflow-hidden"
            style={{
              top: `${dropdownPosition.top}px`,
              left: `${dropdownPosition.left}px`,
            }}
          >
            <div className="flex">
              <div className="w-48 border-r border-gray-200 p-3 bg-gray-50">
                <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Quick Select</p>
                <div className="space-y-1">
                  {[
                    { value: 'today', label: 'Today' },
                    { value: 'yesterday', label: 'Yesterday' },
                    { value: 'last7days', label: 'Last 7 Days' },
                    { value: 'last30days', label: 'Last 30 Days' },
                    { value: 'thisMonth', label: 'This Month' },
                    { value: 'lastMonth', label: 'Last Month' },
                    { value: 'thisYear', label: 'This Year' },
                  ].map((range) => (
                    <button
                      key={range.value}
                      onClick={() => handleQuickSelect(range.value)}
                      className="w-full text-left px-3 py-1.5 text-sm rounded-md text-gray-700 hover:bg-white hover:shadow-sm transition-all"
                    >
                      {range.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <button
                    onClick={previousMonth}
                    className="p-1 hover:bg-gray-100 rounded transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5 text-gray-600" />
                  </button>
                  <span className="text-sm font-semibold text-gray-900">{monthName}</span>
                  <button
                    onClick={nextMonth}
                    className="p-1 hover:bg-gray-100 rounded transition-colors"
                  >
                    <ChevronRight className="w-5 h-5 text-gray-600" />
                  </button>
                </div>

                <div className="grid grid-cols-7 gap-1 mb-2">
                  {weekDays.map((day) => (
                    <div
                      key={day}
                      className="text-xs font-medium text-gray-500 text-center w-8 h-8 flex items-center justify-center"
                    >
                      {day}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-1">
                  {days.map((day, index) => (
                    <div key={index} className="w-8 h-8">
                      {day !== null ? (
                        <button
                          onClick={() => handleDayClick(day)}
                          className={`
                            w-full h-full flex items-center justify-center text-sm rounded-md transition-colors
                            ${isDateSelected(day)
                              ? 'bg-blue-600 text-white font-semibold'
                              : isDateInRange(day)
                              ? 'bg-blue-100 text-blue-900'
                              : 'text-gray-700 hover:bg-gray-100'
                            }
                          `}
                        >
                          {day}
                        </button>
                      ) : (
                        <div />
                      )}
                    </div>
                  ))}
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between text-xs text-gray-600 mb-3">
                    <div>
                      <span className="font-medium">Start:</span> {tempStart ? formatDisplayDate(tempStart) : 'Select'}
                    </div>
                    <div>
                      <span className="font-medium">End:</span> {tempEnd ? formatDisplayDate(tempEnd) : 'Select'}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setIsOpen(false)}
                      className="flex-1 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleApply}
                      className="flex-1 px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
