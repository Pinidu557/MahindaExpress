import React from 'react';
import { Pie } from 'react-chartjs-2';
// ⚠️ Import and register all necessary Chart.js elements
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

// Helper function to generate visually distinct colors
const generateColors = (count) => {
    // Tailwind-inspired colors for a dark theme
    const colors = [
        '#3b82f6', // blue-500
        '#ef4444', // red-500
        '#10b981', // emerald-500
        '#f59e0b', // amber-500
        '#8b5cf6', // violet-500
        '#ec4899', // pink-500
        '#06b6d4', // cyan-500
        '#64748b', // slate-500
        '#22c55e', // green-500
        '#a855f7', // purple-500
    ];
    // Repeat and cycle through colors if count > 10
    return Array.from({ length: count }, (_, i) => colors[i % colors.length]);
};

/**
 * Renders a Pie Chart of spending by category.
 * @param {Array<{budgetCategory: string, actualAmount: number}>} categoryData 
 */
const CategoryPieChart = ({ categoryData }) => {
    
    // Filter out categories with 0 actual spending
    const filteredData = categoryData.filter(item => item.actualAmount > 0);

    // 1. Prepare Chart Data
    const labels = filteredData.map(item => item.budgetCategory);
    const dataValues = filteredData.map(item => item.actualAmount);
    const backgroundColors = generateColors(labels.length);

    const data = {
        labels: labels,
        datasets: [
            {
                label: 'Actual Spending (LKR)',
                data: dataValues,
                backgroundColor: backgroundColors,
                borderColor: '#1e293b', // slate-800 border for contrast
                borderWidth: 2,
            },
        ],
    };

    // 2. Define Chart Options
    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'right', // Place the legend on the right side
                labels: {
                    color: '#e2e8f0', // Light text for dark background
                    font: { size: 14 }
                }
            },
            tooltip: {
                callbacks: {
                    // Format the tooltip label to show currency
                    label: function(context) {
                        let label = context.label || '';
                        const value = context.parsed;
                        const formattedValue = value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                        
                        // Calculate percentage of total spending shown in the chart
                        const totalSpent = dataValues.reduce((sum, val) => sum + val, 0);
                        const percentage = totalSpent > 0 ? (value / totalSpent * 100).toFixed(1) : 0;

                        return `${label}: LKR ${formattedValue} (${percentage}%)`;
                    }
                }
            },
            title: {
                display: false,
                // text: 'Monthly Spending Distribution',
            }
        },
        maintainAspectRatio: false, 
    };

    if (filteredData.length === 0) {
        return <p className="text-center text-slate-400 p-8">No actual spending to display for this month.</p>;
    }
    
    // 3. Render Chart
    return (
        <div className="w-full h-96 p-4"> 
            <Pie data={data} options={options} />
        </div>
    );
};

export default CategoryPieChart;