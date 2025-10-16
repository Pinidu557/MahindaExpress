import React, { useState, useMemo, useEffect } from 'react';
// FIX: If you see "Failed to resolve import 'recharts'", please run: npm install recharts
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Calendar, TrendingUp, TrendingDown, DollarSign, Loader2, BarChart3, PieChartIcon } from 'lucide-react';

// --- REAL DATA FETCHING FUNCTION ---

/**
 * Fetches actual dashboard data from the backend API endpoint.
 * This assumes the endpoint /api/dashboard/finance is set up on your backend 
 * to aggregate data from bookingService.js and expenseService.js.
 *
 * @param {number} month - The selected month (1-12).
 * @param {number} year - The selected year.
 * @returns {Promise<object>} Dashboard metrics and expense breakdown.
 */
const fetchDashboardData = async (month, year) => {
  // --- REAL DATA RETRIEVAL ---
  // const API_ENDPOINT = `/api/dashboard/finance?month=${month}&year=${year}`;
  const API_ENDPOINT = `http://localhost:4000/api/dashboard/finance?month=${month}&year=${year}`;

  // You might need to adjust the prefix if running on different ports (e.g., 'http://localhost:4000')
  const response = await fetch(API_ENDPOINT); 
  
  if (!response.ok) {
    // Read the error message from the backend if available
    const errorData = await response.json().catch(() => ({ message: `HTTP error! Status: ${response.status}` }));
    throw new Error(errorData.message || `Failed to fetch data with status: ${response.status}`);
  }
  
  const data = await response.json();

  // The backend controller is expected to return the data in this shape:
  // { revenue, expenses, netIncome, expenseBreakdown: [{ name, value, color }, ...] }
  return data;
};

// --- COMPONENTS ---

/**
 * Custom hook for fetching and managing dashboard state
 */
const useDashboardData = (selectedDate) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      setError(null);
      const month = selectedDate.getMonth() + 1;
      const year = selectedDate.getFullYear();
      try {
        const result = await fetchDashboardData(month, year);
        setData(result);
      } catch (err) {
        setError(err.message || "Failed to fetch dashboard data. Check API endpoint and server logs.");
        console.error("Dashboard Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [selectedDate]);

  return { data, loading, error };
};

/**
 * Card view for displaying key metrics
 */
const MetricCard = ({ title, value, icon: Icon, colorClass, loading }) => {
  const formattedValue = value ? `LKR.${value.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : 'LKR.0.00';

  return (
    <div className={`flex flex-col p-5 bg-gray-800 rounded-xl shadow-xl border-l-4 ${colorClass}`}>
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-gray-400">{title}</p>
        <Icon className={`w-5 h-5 ${colorClass.replace('border-l-4 ', 'text-')}`} />
      </div>
      <div className="mt-4 flex items-end">
        {loading ? (
          <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
        ) : (
          <p className="text-3xl font-bold text-white">{formattedValue}</p>
        )}
      </div>
    </div>
  );
};

/**
 * Component for comparing Income vs. Expense
 */
const IncomeExpenseBarChart = ({ revenue, expenses }) => {
  const chartData = [
    { category: 'Income', Amount: revenue, color: '#10B981' }, // Emerald Green
    { category: 'Expense', Amount: expenses, color: '#EF4444' }, // Red (for outcome)
  ];
  
  const expensePercentage = revenue > 0 ? ((expenses / revenue) * 100).toFixed(1) : 0;
  
  return (
    <div className="bg-gray-800 p-6 rounded-xl shadow-xl h-full flex flex-col">
      <h3 className="text-xl font-semibold text-gray-200 flex items-center mb-4">
        <BarChart3 className="w-5 h-5 mr-2 text-indigo-400" />
        Total Income vs. Expense
      </h3>
      <div className="flex-grow">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 30, left: 80, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="category" stroke="#9CA3AF" tickLine={false} />
            <YAxis
              tickFormatter={(value) => `LKR.${(value / 1000).toFixed(0)}k`}
              stroke="#9CA3AF"
              tickLine={false}
              //label={{ value: 'Amount (LKR.)', angle: -90, position: 'outerLeft', fill: '#9CA3AF', style: { textAnchor: 'middle' } }}
//               label={{ 
//                 value: 'Amount (LKR.)', 
//                 angle: -90, 
//                 // --- FIX: Change position from 'insideLeft' to 'outerLeft' ---
//                 position: 'outerLeft', 
//                 fill: '#9CA3AF', 
//                 style: { textAnchor: 'middle' } 
//               }}
            />
            <Tooltip 
              formatter={(value) => [`LKR.${value.toLocaleString()}`, 'Amount']}
              labelFormatter={(label) => label}
              contentStyle={{ borderRadius: '8px', border: '1px solid #4B5563', background: '#1F2937', color: 'white' }}
            />
            <Bar dataKey="Amount" isAnimationActive={false}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} radius={[10, 10, 0, 0]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <p className="mt-4 text-center text-sm text-gray-400">
        Expense Ratio: **{expensePercentage}%** of the total income.
      </p>
    </div>
  );
};

/**
 * Component for Pie Chart showing Expense Categories
 */
const ExpenseDistributionPieChart = ({ data, totalExpenses }) => {
  const RADIAN = Math.PI / 180;
  
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    if (percent < 0.05) return null;

    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text x={x} y={y} fill="#111827" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" className="font-bold text-xs">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="bg-gray-800 p-6 rounded-xl shadow-xl h-full flex flex-col">
      <h3 className="text-xl font-semibold text-gray-200 flex items-center mb-4">
        <PieChartIcon className="w-5 h-5 mr-2 text-indigo-400" />
        Expense Category Distribution
      </h3>
      <div className="flex-grow">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              fill="#8884d8"
              paddingAngle={5}
              dataKey="value"
              labelLine={false}
              label={renderCustomizedLabel}
              isAnimationActive={false}
            >
              {data.map((entry, index) => (
                // Use colors provided by the backend data
                <Cell key={`cell-${index}`} fill={entry.color} /> 
              ))}
            </Pie>
            <Tooltip 
              formatter={(value, name, props) => [`LKR.${value.toLocaleString()}`, props.payload.name]}
              contentStyle={{ borderRadius: '8px', border: '1px solid #4B5563', background: '#1F2937', color: 'white' }}
            />
            <Legend layout="horizontal" verticalAlign="bottom" align="center" iconType="circle" wrapperStyle={{ paddingTop: '10px' }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <p className="mt-4 text-center text-sm text-gray-400">
        Total Expenses: **LKR.{totalExpenses ? totalExpenses.toLocaleString() : '0.00'}**
      </p>
    </div>
  );
};

/**
 * Main Dashboard Component
 */
const FinanceDashboardPage = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const { data, loading, error } = useDashboardData(selectedDate);

  const netIncomeColorClass = useMemo(() => {
    if (loading || !data) return 'border-l-4 border-gray-600';
    return data.netIncome >= 0 ? 'border-l-4 border-emerald-400' : 'border-l-4 border-red-400';
  }, [data, loading]);

  const handleDateChange = (event) => {
    setSelectedDate(new Date(event.target.value));
  };
  
  const dateDisplay = selectedDate.toLocaleString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className="min-h-screen bg-gray-900 p-4 md:p-8 font-sans">
      
      {/* --- Top Bar: Title and DatePicker --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-gray-800 p-6 rounded-xl shadow-2xl mb-6">
        <div className="flex items-center">
          <h1 className="text-3xl md:text-4xl font-extrabold text-blue-400 whitespace-nowrap">
            Finance Dashboard
          </h1>
          <span className="text-xl font-medium text-gray-400 ml-4 hidden sm:inline-block">
            {dateDisplay}
          </span>
        </div>
        
        <div className="mt-4 md:mt-0 flex items-center space-x-2">
          <Calendar className="w-5 h-5 text-gray-400" />
          <input
            type="month"
            value={`${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}`}
            onChange={handleDateChange}
            className="p-2 border border-gray-600 bg-gray-700 text-white rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
          />
        </div>
      </div>

      {/* --- 3 Metric Card Views --- */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <MetricCard
          title="Total Revenue"
          value={data?.revenue}
          icon={DollarSign}
          colorClass="border-l-4 border-emerald-400"
          loading={loading}
        />
        <MetricCard
          title="Total Outcome (Expenses)"
          value={data?.expenses}
          icon={TrendingDown}
          colorClass="border-l-4 border-red-400"
          loading={loading}
        />
        <MetricCard
          title="Net Income"
          value={data?.netIncome}
          icon={TrendingUp}
          colorClass={netIncomeColorClass}
          loading={loading}
        />
      </div>

      {/* --- Charts: Split Page View (Bar Chart Left, Pie Chart Right) --- */}
      {error && (
        <div className="p-4 bg-red-800 text-red-200 rounded-lg mb-4">
          **Data Error:** {error}
        </div>
      )}

      {loading && (
        <div className="flex justify-center items-center h-64 bg-gray-800 rounded-xl shadow-xl">
          <Loader2 className="w-10 h-10 animate-spin text-blue-400" />
          <p className="ml-3 text-lg text-gray-400">Loading Financial Data...</p>
        </div>
      )}

      {!loading && data && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[450px]">
          {/* Left Side: Income vs. Expense Bar Chart */}
          <IncomeExpenseBarChart revenue={data.revenue} expenses={data.expenses} />

          {/* Right Side: Expense Categories Pie Chart */}
          <ExpenseDistributionPieChart data={data.expenseBreakdown} totalExpenses={data.expenses} />
        </div>
      )}
      
      <div className='mt-8 p-4 text-sm text-gray-500 text-center'>
        
      </div>

    </div>
  );
};

export default FinanceDashboardPage;