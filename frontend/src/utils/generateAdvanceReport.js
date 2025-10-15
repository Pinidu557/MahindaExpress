import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import moment from 'moment'; // Ensure moment is imported for reliable date formatting

// Utility function for formatting currency
const formatLKR = (amount) => (amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 });


/**
 * Generates a PDF advance history report based on the currently filtered and displayed table data.
 * @param {Array} displayData - The array of advance records currently displayed in the table (sorted and filtered).
 * @param {object} totals - The advance summary totals ({ totalAdvanceAmount }).
 * @param {string} currentSort - The current sort configuration (e.g., "Sort By Date, DESC").
 * @param {string} searchTerm - The current search term.
 */
export const generateAdvanceReport = (displayData, totals, currentSort, searchTerm) => {
    // 1. Initialize jsPDF
    // Using 'l' for landscape, 'mm' units, 'a4' size (same as payroll report)
    const doc = new jsPDF('l', 'mm', 'a4'); 
    let y = 10; // Starting Y position

    // --- Utility: Get Current Date for Title ---
    const reportDate = moment().format('MMMM Do, YYYY');

    // --- 2. Header (Mahinda Express - Corporate Branding) ---
    
    // Title: MAHINDA EXPRESS (Dark Blue: RGB 0, 0, 150)
    doc.setFontSize(28);
    doc.setTextColor(0, 0, 150); 
    doc.setFont('helvetica', 'bold');
    doc.text('MAHINDA EXPRESS', 10, y + 10);
    
    y += 20;

    // Contact Information (Gray color)
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100); 
    
    doc.text('183/1, Galle Road, Colombo | Email: mahindaexpress@gmail.com', 10, y);
    y += 5;
    
    doc.text('Website: www.mahindaexpress.com', 10, y);
    y += 5;

    // --- 3. Horizontal Line ---
    doc.setDrawColor(0, 0, 0); // Black line
    doc.line(10, y, 287, y); // Draw a line across the width
    y += 8; 

    // --- 4. Report Title ---
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0); // Black
    doc.setFont('helvetica', 'bold');
    doc.text(`Employee Advance History Report (As of ${reportDate})`, 10, y);
    y += 8;
    
    // --- 5. Filtering/Sorting Context ---
    doc.setFontSize(9);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(80, 80, 80); 
    
    const filterText = `Filters: ${searchTerm ? `Search: "${searchTerm}"` : 'None'} | ${currentSort}`;
    doc.text(filterText, 10, y);
    y += 8;


    // --- 6. AutoTable (Advance Data) ---

    // Define table headers based on your Advance table columns
    const tableHeaders = [
        'Staff Name', 
        'Basic Salary (LKR)', 
        'Advance Amount (LKR)', 
        'Reason',
        'Processed Date', 
        'Deduction Month', 
        'Status'
    ];
    
    // Map the display data to the table rows
    const tableRows = displayData.map(record => {
        // Use moment for robust date formatting from ISO string
        const processedDateStr = record.processedDate 
            ? moment(record.processedDate).format('YYYY-MM-DD') 
            : 'N/A';

        return [
            record.staffName || 'N/A',
            formatLKR(record.basicSalarySnapshot), // Use basicSalarySnapshot if available
            formatLKR(record.advanceAmount),
            record.reason || 'N/A',
            processedDateStr,
            record.deductionMonth || 'N/A',
            record.status || 'Pending'
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
        // Column styles for aligning numbers and highlighting the amount
        columnStyles: {
            // Index 1: Basic Salary
            1: { halign: 'right' }, 
            // Index 2: Advance Amount (Bold Green)
            2: { halign: 'right', fontStyle: 'bold', textColor: [0, 150, 0] }, 
            // Index 4: Processed Date
            4: { halign: 'center' }, 
            // Index 5: Deduction Month
            5: { halign: 'center' }, 
            // Index 6: Status
            6: { halign: 'center' }, 
        },
        didDrawPage: function (data) {
            // Footer (Page Number)
            doc.setFontSize(8);
            doc.text(`Page ${data.pageNumber} of ${doc.internal.pages.length - 1}`, data.settings.margin.left, doc.internal.pageSize.height - 5);
        },
    });

    // Get the final Y position after the table
    y = doc.lastAutoTable ? doc.lastAutoTable.finalY + 10 : y + 10;


    // --- 7. Summary Totals Footer ---
    
    // Set background for the totals box
    doc.setFillColor(230, 230, 230); // Light Gray background
    // Position on the right side
    const boxWidth = 87;
    const rightMargin = 10;
    const boxX = doc.internal.pageSize.width - rightMargin - boxWidth;
    
    doc.rect(boxX, y - 2, boxWidth, 15, 'F'); // Draw rectangle (smaller box for one total)

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);

    // Total Advance Amount (Highlight)
    const innerRightAlignX = boxX + boxWidth - 5; 
    doc.setFontSize(12);
    doc.setTextColor(150, 0, 0); // Use Red for total advances (liability)
    doc.text('TOTAL ADVANCE SUM:', boxX + 5, y + 4); 
    // The totals object is expected to have { totalAdvanceAmount }
    doc.text(`LKR ${totals.totalAdvanceAmount}`, innerRightAlignX, y + 4, null, null, 'right');
    y += 7;

    // --- 8. Save the PDF ---
    const filename = `Advance_History_Report_${moment().format('YYYY_MM_DD')}.pdf`;
    doc.save(filename);
};