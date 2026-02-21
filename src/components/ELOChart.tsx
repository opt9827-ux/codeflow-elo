"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

const data = [
    { name: 'Mon', elo: 800 },
    { name: 'Tue', elo: 845 },
    { name: 'Wed', elo: 830 },
    { name: 'Thu', elo: 910 },
    { name: 'Fri', elo: 1050 },
    { name: 'Sat', elo: 1100 },
    { name: 'Sun', elo: 1200 },
];

export default function ELOChart() {
    return (
        <div className="h-[300px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                    <defs>
                        <linearGradient id="colorElo" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#00E5FF" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#00E5FF" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis
                        dataKey="name"
                        stroke="#64748b"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                    />
                    <YAxis
                        stroke="#64748b"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => `${value}`}
                    />
                    <Tooltip
                        contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px' }}
                        itemStyle={{ color: '#00E5FF' }}
                    />
                    <Area
                        type="monotone"
                        dataKey="elo"
                        stroke="#00E5FF"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorElo)"
                        animationDuration={2000}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}
