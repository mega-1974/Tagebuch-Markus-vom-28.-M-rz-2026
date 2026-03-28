/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import { DiaryEntry, Mood } from '../types';
import { MOOD_LABELS, MOOD_COLORS } from '../constants';
import { format, subDays, isSameDay } from 'date-fns';
import { de } from 'date-fns/locale';

interface MoodTrendChartProps {
  entries: DiaryEntry[];
  days?: number;
}

export const MoodTrendChart: React.FC<MoodTrendChartProps> = ({ entries, days = 7 }) => {
  const data = Array.from({ length: days }).map((_, i) => {
    const date = subDays(new Date(), days - 1 - i);
    const dayEntries = entries.filter((e) => isSameDay(new Date(e.date), date));
    const averageMood =
      dayEntries.length > 0
        ? dayEntries.reduce((acc, curr) => acc + curr.mood, 0) / dayEntries.length
        : null;

    return {
      date: format(date, 'd. MMM', { locale: de }),
      mood: averageMood,
      fullDate: format(date, 'EEEE, d. MMMM', { locale: de }),
    };
  });

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const moodValue = Math.round(payload[0].value);
      return (
        <div className="bg-white p-3 rounded-2xl shadow-lg border border-stone-100 text-xs">
          <p className="font-semibold text-stone-800 mb-1">{payload[0].payload.fullDate}</p>
          <div className="flex items-center gap-2">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: MOOD_COLORS[moodValue as Mood] }}
            />
            <span className="text-stone-600">
              Stimmung: {MOOD_LABELS[moodValue as Mood] || 'Keine Daten'}
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-64 bg-white rounded-3xl p-6 border border-stone-100 shadow-sm">
      <h3 className="font-serif text-lg font-medium text-stone-800 mb-6">Stimmungsverlauf</h3>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorMood" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#5A5A40" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#5A5A40" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f0" />
          <XAxis
            dataKey="date"
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#a8a29e', fontSize: 10 }}
            dy={10}
          />
          <YAxis
            domain={[1, 5]}
            ticks={[1, 2, 3, 4, 5]}
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#a8a29e', fontSize: 10 }}
            dx={-10}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="mood"
            stroke="#5A5A40"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#colorMood)"
            connectNulls
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
