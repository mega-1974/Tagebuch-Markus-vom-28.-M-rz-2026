/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { DiaryEntry, Mood } from '../types';
import { MOOD_COLORS, MOOD_EMOJIS } from '../constants';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
} from 'date-fns';
import { de } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';

interface MoodCalendarProps {
  entries: DiaryEntry[];
}

export const MoodCalendar: React.FC<MoodCalendarProps> = ({ entries }) => {
  const [currentMonth, setCurrentMonth] = React.useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const calendarDays = eachDayOfInterval({
    start: startDate,
    end: endDate,
  });

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  return (
    <div className="bg-white rounded-[40px] p-10 border border-stone-100 shadow-sm">
      <div className="flex justify-between items-center mb-10">
        <h3 className="font-serif text-2xl font-medium text-stone-800 tracking-tight capitalize">
          {format(currentMonth, 'MMMM yyyy', { locale: de })}
        </h3>
        <div className="flex gap-2">
          <button
            onClick={prevMonth}
            className="p-3 rounded-2xl hover:bg-stone-50 text-stone-400 hover:text-stone-600 transition-all border border-stone-50"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={nextMonth}
            className="p-3 rounded-2xl hover:bg-stone-50 text-stone-400 hover:text-stone-600 transition-all border border-stone-50"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-4">
        {['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'].map((day) => (
          <div
            key={day}
            className="text-center text-[10px] uppercase tracking-widest font-bold text-stone-300 py-2"
          >
            {day}
          </div>
        ))}

        {calendarDays.map((day, idx) => {
          const dayEntries = entries.filter((e) => isSameDay(new Date(e.date), day));
          const averageMood =
            dayEntries.length > 0
              ? Math.round(dayEntries.reduce((acc, curr) => acc + curr.mood, 0) / dayEntries.length)
              : null;

          return (
            <motion.div
              key={day.toString()}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.01 }}
              className={`aspect-square rounded-2xl flex flex-col items-center justify-center relative border ${
                !isSameMonth(day, monthStart)
                  ? 'bg-stone-50/30 border-transparent opacity-20'
                  : 'bg-white border-stone-50 shadow-sm'
              }`}
              style={{
                backgroundColor: averageMood ? `${MOOD_COLORS[averageMood as Mood]}15` : undefined,
                borderColor: averageMood ? `${MOOD_COLORS[averageMood as Mood]}40` : undefined,
              }}
            >
              <span
                className={`text-[10px] font-bold mb-1 ${
                  averageMood ? 'text-stone-800' : 'text-stone-300'
                }`}
              >
                {format(day, 'd')}
              </span>
              {averageMood && (
                <span className="text-lg animate-in fade-in zoom-in duration-500">
                  {MOOD_EMOJIS[averageMood as Mood]}
                </span>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
