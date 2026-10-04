import { useState } from 'react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

function HoursTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return <div className="chart-tooltip"><strong>{payload[0].value}h</strong><span>{label}</span></div>
}

export default function ProgressChart({ data }) {
  const [period, setPeriod] = useState('This week')
  const total = data.reduce((sum, day) => sum + day.hours, 0).toFixed(1)

  return (
    <section className="panel progress-panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">YOUR MOMENTUM</p>
          <h2>Learning hours</h2>
        </div>
        <select aria-label="Learning hours time period" value={period} onChange={(event) => setPeriod(event.target.value)}>
          <option>This week</option>
          <option>Last week</option>
        </select>
      </div>
      <div className="chart-summary"><strong>{period === 'This week' ? total : '6.4'}<span> hrs</span></strong><span className="chart-trend">↑ 12% <small>vs last week</small></span></div>
      <div className="chart-wrap">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 7, bottom: 0, left: -23 }}>
            <defs>
              <linearGradient id="hoursFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#5d9677" stopOpacity={0.23} />
                <stop offset="95%" stopColor="#5d9677" stopOpacity={0.015} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="#e9eee9" strokeDasharray="3 5" />
            <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#89948c', fontSize: 11 }} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#a1aaa3', fontSize: 10 }} tickFormatter={(value) => `${value}h`} />
            <Tooltip content={<HoursTooltip />} cursor={{ stroke: '#9bbda8', strokeDasharray: '4 4' }} />
            <Area type="monotone" dataKey="hours" stroke="#397455" strokeWidth={2.5} fill="url(#hoursFill)" activeDot={{ r: 5, fill: '#397455', stroke: '#fff', strokeWidth: 2 }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="chart-footer"><span><i className="legend-dot" /> Daily focus time</span><span>Goal: 8 hrs / week</span></div>
    </section>
  )
}