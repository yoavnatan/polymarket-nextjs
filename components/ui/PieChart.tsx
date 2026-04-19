'use client';

import React from 'react';
import { Pie, PieChart as RechartsPieChart } from 'recharts';

interface PieChartProps {
    yes: number; // percentage (e.g., 67 for 67%)
    no: number; // percentage (e.g., 33 for 33%)
    isAnimationActive?: boolean;
}

export function PieChart({ yes, no, isAnimationActive = false }: PieChartProps) {
    const fillColor = (yes < 30)
        ? 'var(--button-red-hover)'
        : (yes < 50)
            ? 'var(--pie-orange)'
            : 'var(--button-green-hover)';

    const data = [
        { name: 'Yes', value: +yes, fill: fillColor },
        { name: 'No', value: +no, fill: 'var(--border-gray)' }
    ];

    return (
        <RechartsPieChart style={{ width: '70px', maxWidth: '200px', maxHeight: '100vh', aspectRatio: 1 }}>
            <Pie
                data={data}
                innerRadius="85%"
                outerRadius="100%"
                startAngle={190}
                endAngle={-10}
                stroke="none"
                cx="50%"
                cy="70%"
                cornerRadius="50%"
                fill="#8884d8"
                paddingAngle={2}
                dataKey="value"
                isAnimationActive={isAnimationActive}
            />
        </RechartsPieChart>
    );
}

export default PieChart;