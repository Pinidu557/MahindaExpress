import React from 'react';
import moment from 'moment';
import { MIN_DATE, MAX_DATE } from '../utils/dateUtils';

const DatePicker = ({ selectedDate, onChange }) => {
    const startYear = MIN_DATE.year();
    const endYear = MAX_DATE.year();
    const years = [];
    for (let y = startYear; y <= endYear; y++) {
        years.push(y);
    }

    // moment.months() returns the full month names (January, February, October, etc.)
    //// moment.monthsShort() returns the month names (Jan, Feb, Oct, etc.)
    const months = moment.months();

    const handleMonthChange = (e) => {
        //const newMonthIndex = moment.monthsShort().indexOf(e.target.value);
        const newMonthIndex = months.indexOf(e.target.value); // match with full name
        const newDate = selectedDate.clone().month(newMonthIndex).startOf('month');
        if (newDate.isBetween(MIN_DATE, MAX_DATE, 'month', '[]')) {
            onChange(newDate);
        }
    };

    const handleYearChange = (e) => {
        const newYear = parseInt(e.target.value);
        const newDate = selectedDate.clone().year(newYear).startOf('month');
        if (newDate.isBetween(MIN_DATE, MAX_DATE, 'month', '[]')) {
            onChange(newDate);
        }
    };

    return (
        <div className="flex items-center space-x-2 bg-gray-700 p-2 rounded-lg">
            <select
                value={selectedDate.format('MMMM')}
                onChange={handleMonthChange}
                className="bg-gray-800 text-white p-1 rounded focus:ring-blue-500 focus:border-blue-500"
            >
                {months.map((month, index) => {
                    const monthMoment = selectedDate.clone().month(index).startOf('month');
                    if (monthMoment.isBetween(MIN_DATE, MAX_DATE, 'month', '[]')) {
                        return <option key={month} value={month}>{month}</option>;
                    }
                    return null;
                })}
            </select>
            <select
                value={selectedDate.year()}
                onChange={handleYearChange}
                className="bg-gray-800 text-white p-1 rounded focus:ring-blue-500 focus:border-blue-500"
            >
                {years.map(year => (
                    <option key={year} value={year}>{year}</option>
                ))}
            </select>
        </div>
    );
};

export default DatePicker;