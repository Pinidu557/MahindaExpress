import jsPDF from "jspdf";
import autoTable from "jspdf-autotable"; 
// Utility function for formatting currency
const formatLKR = (amount) => (amount || 0).toFixed(2);

/**
 * Generates a PDF payroll report based on the currently filtered and displayed table data.
 * @param {Array} displayData - The array of payroll records currently displayed in the table (sorted and filtered).
 * @param {object} totals - The payroll summary totals (totalGross, totalDeductions, totalNetPay).
 * @param {Date} selectedDate - The currently selected month/year.
 * @param {string} currentSort - The current sort configuration (e.g., "Sort By Name, ASC").
 * @param {string} searchTerm - The current search term.
 */
export const generatePayrollReport = (displayData, totals, selectedDate, currentSort, searchTerm) => {
    // 1. Initialize jsPDF
    const doc = new jsPDF('l', 'mm', 'a4'); // 'l' for landscape, 'mm' units, 'a4' size
    let y = 10; // Starting Y position

    // --- Utility: Format Month/Year for Title ---
    const monthYear = selectedDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
    });

    // --- 2. Header (Mahinda Express - Corporate Branding) ---
    
    // Title: MAHINDA EXPRESS (Using a dark blue color: RGB 0, 0, 150)
    doc.setFontSize(28);
    doc.setTextColor(0, 0, 150); // Dark Blue for MAHINDA EXPRESS
    doc.setFont('helvetica', 'bold');
    doc.text('MAHINDA EXPRESS', 10, y + 10);
    
    // Reset Y position after title
    y += 20;

    // Contact Information
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100); // Gray color
    
    // Address and Email
    doc.text('183/1, Galle Road, Colombo | Email: mahindaexpress@gmail.com', 10, y);
    y += 5;
    
    // Website
    doc.text('Website: www.mahindaexpress.com', 10, y);
    y += 5;

    // --- 3. Horizontal Line ---
    doc.setDrawColor(0, 0, 0); // Black line
    doc.line(10, y, 287, y); // Draw a line from X=10 to X=287 (A4 landscape width - margins)
    y += 8; // Move down after the line


    // --- 4. Report Title ---
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0); // Black
    doc.setFont('helvetica', 'bold');
    doc.text(`Employee Payroll Report - ${monthYear}`, 10, y);
    y += 8;
    
    // --- 5. Filtering/Sorting Context ---
    doc.setFontSize(9);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(80, 80, 80); 
    
    const filterText = `Filters: ${searchTerm ? `Search: "${searchTerm}"` : 'None'} | ${currentSort}`;
    doc.text(filterText, 10, y);
    y += 8;


    // --- 6. AutoTable (Payroll Data) ---

    const tableHeaders = [
        'Staff Name', 'Designation', 'Email', 
        'Basic Salary (LKR)', 'Gross Salary (LKR)', 
        'Deductions (LKR)', 'Net Salary (LKR)', 'Status'
    ];
    
    // Map the display data to the table rows
    const tableRows = displayData.map(record => {
        const staff = record.staff || {};
        const netSalary = formatLKR(record.netSalary);

        let netSalaryText = `LKR ${netSalary}`;
        let statusText = record.status || 'Pending';

        return [
            staff.name || 'N/A',
            staff.role || 'N/A',
            staff.email || 'N/A',
            formatLKR(record.basicSalary),
            formatLKR(record.grossSalary),
            formatLKR(record.totalDeductions),
            netSalaryText,
            statusText
        ];
    });


    // AutoTable configuration
    autoTable(doc, {
        head: [tableHeaders],
        body: tableRows,
        startY: y,
        theme: 'striped',
        styles: { fontSize: 8, cellPadding: 2, textColor: [30, 30, 30], overflow: 'linebreak' },
        headStyles: { fillColor: [40, 50, 60], textColor: [255, 255, 255], fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [240, 240, 240] },
        margin: { top: 10, left: 10, right: 10, bottom: 10 },
        // Column styles for aligning numbers
        columnStyles: {
            3: { halign: 'right' }, // Basic Salary
            4: { halign: 'right' }, // Gross Salary
            5: { halign: 'right' }, // Deductions
            6: { halign: 'right', fontStyle: 'bold', textColor: [0, 150, 0] }, // Net Salary (Bold Green)
        },
        didDrawPage: function (data) {
            // Footer (Page Number)
            doc.setFontSize(8);
            doc.text(`Page ${data.pageNumber} of ${doc.internal.pages.length - 1}`, data.settings.margin.left, doc.internal.pageSize.height - 5);
        },
    });

    // Get the final Y position after the table
    // FIX: Use doc.lastAutoTable.finalY instead of doc.autoTable.previous.finalY
    if (doc.lastAutoTable) {
        y = doc.lastAutoTable.finalY + 10;
    } else {
        // Fallback if no table was drawn (e.g., empty displayData)
        y = y + 10;
    }


    // --- 7. Summary Totals Footer ---
    
    // Set background for the totals box
    doc.setFillColor(230, 230, 230); // Light Gray background
    // Calculate position relative to the right edge (A4 landscape is 297mm wide)
    const boxWidth = 87;
    const rightMargin = 10;
    const boxX = doc.internal.pageSize.width - rightMargin - boxWidth;
    
    doc.rect(boxX, y - 2, boxWidth, 28, 'F'); // Draw rectangle

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);

    // Total Gross
    const innerRightAlignX = boxX + boxWidth - 5; // 5mm padding from the right of the box
    doc.text('Total Gross Salary:', boxX + 5, y + 4); // 5mm padding from the left of the box
    doc.text(`LKR ${totals.totalGross}`, innerRightAlignX, y + 4, null, null, 'right');
    y += 7;

    // Total Deductions
    doc.text('Total Deductions:', boxX + 5, y + 4);
    doc.text(`LKR ${totals.totalDeductions}`, innerRightAlignX, y + 4, null, null, 'right');
    y += 7;

    // Total Net Pay (Highlight)
    doc.setFontSize(12);
    doc.setTextColor(0, 150, 0); // Green color
    doc.text('TOTAL NET PAY:', boxX + 5, y + 4);
    doc.text(`LKR ${totals.totalNetPay}`, innerRightAlignX, y + 4, null, null, 'right');
    y += 7;

    // --- 8. Save the PDF ---
    const filename = `Payroll_Report_${monthYear.replace(/\s/g, '_')}.pdf`;
    doc.save(filename);
};
