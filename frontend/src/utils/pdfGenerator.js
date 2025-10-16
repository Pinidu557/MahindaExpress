// src/utils/pdfGenerator.js

import jsPDF from 'jspdf'; 

// --- Helpers (No changes needed to these functions) ---
const formatLKR = (amount) => `LKR. ${(Number(amount) || 0).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;

const amountToWordsWithCents = (amount) => {
    const units = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    
    const numToWordsLessThanOneThousand = (n) => {
        if (n === 0) return '';
        if (n < 10) return units[n];
        if (n < 20) return teens[n - 10];
        if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + units[n % 10] : '');
        return units[Math.floor(n / 100)] + ' Hundred' + (n % 100 !== 0 ? ' and ' + numToWordsLessThanOneThousand(n % 100) : '');
    };

    const convert = (n) => {
        if (n === 0) return '';
        let words = [];
        let temp = n;

        if (temp >= 10000000) { words.push(numToWordsLessThanOneThousand(Math.floor(temp / 10000000)) + ' Crore'); temp %= 10000000; }
        if (temp >= 100000) { words.push(numToWordsLessThanOneThousand(Math.floor(temp / 100000)) + ' Lakh'); temp %= 100000; }
        if (temp >= 1000) { words.push(numToWordsLessThanOneThousand(Math.floor(temp / 1000)) + ' Thousand'); temp %= 1000; }
        if (temp > 0) { words.push(numToWordsLessThanOneThousand(temp)); }
        
        return words.filter(Boolean).join(' ');
    };

    const num = Number(amount) || 0;
    const [rupees, cents] = num.toFixed(2).split('.').map(s => parseInt(s, 10));

    let rupeeText = convert(rupees).trim();
    if (rupeeText) {
        rupeeText += ' Rupees';
    } else {
        rupeeText = 'Zero Rupees';
    }

    let centText = '';
    if (cents > 0) {
        centText = convert(cents).trim();
        if (centText) {
            centText = ` and ${centText} Cents`;
        }
    }

    return `${rupeeText}${centText} Only`.replace(/\s\s+/g, ' '); 
};

const getPayPeriod = (monthYear) => {
    try {
        const [monthName, year] = monthYear.split(' ');
        const monthIndex = new Date(`${monthName} 1, ${year}`).getMonth();
        const date = new Date(year, monthIndex);
        
        const startDate = `01/${String(monthIndex + 1).padStart(2, '0')}/${year}`;
        const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
        const endDate = `${lastDay}/${String(monthIndex + 1).padStart(2, '0')}/${year}`;
        
        return `${startDate} - ${endDate}`;
    } catch (e) {
        return 'N/A';
    }
}


// --- MAIN REUSABLE FUNCTION ---
export const generateSalaryPDF = (salaryData) => {
    try {
        const doc = new jsPDF({ unit: 'pt', format: 'a4' });
        const docWidth = doc.internal.pageSize.getWidth();
        const docMargin = 40; 
        const contentWidth = docWidth - 2 * docMargin;
        let y = 40;
        
        const lineHeight = 18; 
        const colGap = 20;

        // --- Data Extraction (Using default values for safety) ---
        const { staff } = salaryData;
        const staffName = staff.name || 'N/A';
        const staffRole = staff.role || 'N/A';
        const monthYear = salaryData.monthYear || 'N/A 2025';
        const basicSalary = salaryData.staff.basicSalary || 0.00;
        const allowances = salaryData.allowances || 0.00;
        const bonus = salaryData.bonus || 0.00;
        const reimbursements = salaryData.reimbursements || 0.00;
        const otHours = salaryData.otHours || 0;
        const hourlyRate = (basicSalary / 28 )/ 8;
        const othourlyrate = hourlyRate * 1.5;
        const overtimePay = otHours * othourlyrate;
        const grossPay = basicSalary + allowances + bonus + reimbursements+ overtimePay;
        const employeeEpf = salaryData.employeeEpf || 0.00;
        const loan = salaryData.loan|| 0.00;
        const salaryAdvance = salaryData.salaryAdvance || 0.00;
        const totalDeductions = employeeEpf + loan + salaryAdvance;
        const netSalary = grossPay - totalDeductions;
        const payPeriod = salaryData.payPeriod || getPayPeriod(monthYear);
        const companyEmail = 'mahindaexpress@gmail.com'; 

        // --- Styling Helpers (Aligned with Tailwind defaults) ---
        const indigo = [79, 70, 229]; 
        const gray900 = [17, 24, 39]; 
        const gray800 = [31, 41, 55]; 
        const gray700 = [55, 65, 81]; 
        const gray600 = [75, 85, 99]; 
        const gray400 = [156, 163, 175]; 
        const gray300 = [209, 213, 219]; 
        const gray200 = [229, 231, 235]; 
        const gray100 = [243, 244, 246]; 

        const label = (t, x, y, font = 'bold', size = 10, color = gray900, align = 'left') => {
            doc.setFont('helvetica', font);
            doc.setFontSize(size);
            doc.setTextColor(...color);
            doc.text(t, x, y, { align: align });
        };
        
        const renderIfPositive = (desc, amount, currentY, startX, amountAlignX) => {
            if (Number(amount) > 0) {
                label(desc, startX, currentY, 'normal', 11, gray900);
                label(formatLKR(amount), amountAlignX, currentY, 'bold', 11, gray900, 'right');
                return currentY + lineHeight; 
            }
            return currentY;
        };
        
        // --- A. Header/Masthead Section ---
        doc.setDrawColor(...gray200);
        doc.setLineWidth(1);
        doc.line(docMargin, y + 45, docWidth - docMargin, y + 45); 

        // Logo 
        doc.setFillColor(...indigo);
        doc.circle(docMargin + 14, y + 10, 12, 'F'); 
        label('M', docMargin + 14, y + 14, 'bold', 16, [255, 255, 255], 'center'); 

        // Company Info
        label('Mahinda Express', docMargin + 40, y + 7, 'bold', 18, gray900); 
        label(`183/1, Galle Road, Colombo | Email: ${companyEmail}`, docMargin + 40, y + 24, 'normal', 10, gray600); 
        
        // Month
        // FIX: Change 'semibold' to 'bold'
        label(`Month: ${monthYear}`, docWidth - docMargin, y + 8, 'bold', 12, gray700, 'right'); 
        
        y += 65; 

        // --- B. Employee Info Section ---
        doc.setLineWidth(1);
        doc.setDrawColor(...gray300);
        doc.line(docMargin, y + 3 * 16 + 10, docWidth - docMargin, y + 3 * 16 + 10); 
        
        const infoCol1 = docMargin;
        const infoValX = infoCol1 + 90;

        label('Employee Name:', infoCol1, y, 'bold', 11, gray900);
        label(staffName, infoValX, y, 'normal', 11, gray900);
        
        label('Designation:', infoCol1, y + 16, 'bold', 11, gray900);
        label(staffRole, infoValX, y + 16, 'normal', 11, gray900);
        
        label('Pay Period:', infoCol1, y + 32, 'bold', 11, gray900);
        label(payPeriod, infoValX, y + 32, 'normal', 11, gray900);
        
        y += 3 * 16 + 30; 

        // --- C. Earnings and Deductions Columns ---
        const col1X = docMargin;
        const amount1X = docWidth / 2 - colGap / 2 - 10; 
        const col2X = docWidth / 2 + colGap / 2 + 10; 
        const amount2X = docWidth - docMargin; 
        const midLineX = docWidth / 2;

        // Headers
        doc.setDrawColor(...gray800); // Black underline
        doc.setLineWidth(1.5); 
        label('EARNINGS', col1X, y, 'bold', 14, gray800);
        doc.line(col1X, y + 4, amount1X + 10, y + 4); 
        label('DEDUCTIONS', col2X, y, 'bold', 14, gray800);
        doc.line(col2X, y + 4, amount2X, y + 4); 

        const headerY = y;
        y += 25;

        // Earnings List
        let eY = y;
        label('Basic Salary', col1X, eY, 'normal', 11, gray900);
        label(formatLKR(basicSalary), amount1X, eY, 'bold', 11, gray900, 'right');
        eY += lineHeight;
        
        eY = renderIfPositive('Allowances', allowances, eY, col1X, amount1X);
        eY = renderIfPositive('Bonus', bonus, eY, col1X, amount1X);
        eY = renderIfPositive('Reimbursements', reimbursements, eY, col1X, amount1X);
        eY = renderIfPositive('Overtime', overtimePay, eY, col1X, amount1X);
        // Deductions List
        let dY = y;
        label('EPF (8%)', col2X, dY, 'normal', 11, gray900);
        label(formatLKR(employeeEpf), amount2X, dY, 'bold', 11, gray900, 'right');
        dY += lineHeight;
        
        dY = renderIfPositive('Loan Deduction', loan, dY, col2X, amount2X);
        dY = renderIfPositive('Salary Advance', salaryAdvance, dY, col2X, amount2X);
        
        const contentMaxY = Math.max(eY, dY);
        const paddingBeforeTotals = 15;
        const lineY = contentMaxY + paddingBeforeTotals;

        // Vertical divider (from header to total line)
        doc.setDrawColor(...gray300);
        doc.setLineWidth(1);
        doc.line(midLineX, headerY, midLineX, lineY + lineHeight + 5); 
        
        // Horizontal lines for totals 
        doc.setDrawColor(...gray400); 
        doc.setLineWidth(1);
        doc.line(col1X, lineY, amount1X, lineY); 
        doc.line(col2X, lineY, amount2X, lineY); 
        
        const finalItemY = lineY + lineHeight;

        label('Gross Pay:', col1X, finalItemY, 'bold', 12, gray800);
        label(formatLKR(grossPay), amount1X, finalItemY, 'bold', 12, gray800, 'right');
        
        label('Total Deductions:', col2X, finalItemY, 'bold', 12, gray800);
        label(formatLKR(totalDeductions), amount2X, finalItemY, 'bold', 12, gray800, 'right');
        
        y = finalItemY + 40;

        // --- D. Net Salary Bar ---
        const barHeight = 50; 
        doc.setFillColor(...indigo);
        doc.rect(docMargin, y, contentWidth, barHeight, 'F');
        
        const barTextY = y + barHeight / 2 + 5; 

        label('Net Salary', docMargin + 10, barTextY, 'bold', 18, [255, 255, 255]); 
        label(formatLKR(netSalary), amount2X - 10, barTextY, 'bold', 22, [255, 255, 255], 'right'); 
        
        y += barHeight; 

        // --- E. Amount in Words ---
        y += 10; // Added gap before the grey box
        doc.setFillColor(...gray100); 
        
        // FIX 1: Change to 'let' and initialize here
        let amountInWordsBoxHeight = 40; 
        
        const prefix = 'Amount in Words: ';
        const words = amountToWordsWithCents(netSalary);
        const textFontSize = 11;
        
        // Set font/size before measuring text
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(textFontSize);

        // Calculate available width for the actual words (minus a small margin for safety)
        const safetyMargin = 30; // Added safety margin to prevent overflow
        const availableWidthForWords = contentWidth - doc.getStringUnitWidth(prefix) * textFontSize - safetyMargin; 
        
        // FIX 2: Declare variables for wrapping logic here (to fix ReferenceError)
        let lines = [];
        let currentLine = '';
        let currentLineWidth = 0;
        const wordsArray = words.split(' ');

        for (const word of wordsArray) {
            const wordWidth = doc.getStringUnitWidth(word) * textFontSize;
            const spaceWidth = currentLine ? doc.getStringUnitWidth(' ') * textFontSize : 0;

            // Check if the current line + a space + the next word exceeds the available width
            if (currentLineWidth + spaceWidth + wordWidth > availableWidthForWords && currentLine !== '') {
                lines.push(currentLine.trim());
                currentLine = word;
                currentLineWidth = wordWidth;
            } else {
                currentLine += (currentLine ? ' ' : '') + word;
                currentLineWidth += spaceWidth + wordWidth;
            }
        }
        if (currentLine) {
            lines.push(currentLine.trim());
        }

        // Draw the initial box (or redraw if height changes)
        doc.rect(docMargin, y, contentWidth, amountInWordsBoxHeight, 'F'); 

        // Adjust box height if more than one line
        if (lines.length > 1) {
             amountInWordsBoxHeight = 55; 
             doc.rect(docMargin, y, contentWidth, amountInWordsBoxHeight, 'F'); // Redraw with new height
        }
        
        // Render lines
        let currentTextY = y + (amountInWordsBoxHeight / 2) - ((lines.length - 1) * (lineHeight / 2)) + 5; 
        
        doc.setFont('helvetica', 'normal'); 
        doc.setFontSize(textFontSize);

        if (lines.length === 1) {
            const fullText = prefix + words;
            const fullTextWidth = doc.getStringUnitWidth(fullText) * textFontSize;
            const textStartX = docWidth / 2 - fullTextWidth / 2;

            label(prefix, textStartX, currentTextY, 'normal', textFontSize, gray800);
            doc.setFont('helvetica', 'bold'); 
            doc.text(words, textStartX + doc.getStringUnitWidth(prefix) * textFontSize, currentTextY, { align: 'left' });

        } else {
            // Render first line with prefix
            const firstLineFull = prefix + lines[0];
            const firstLineWidth = doc.getStringUnitWidth(firstLineFull) * textFontSize;
            const firstLineStartX = docWidth / 2 - firstLineWidth / 2;

            label(prefix, firstLineStartX, currentTextY, 'normal', textFontSize, gray800);
            doc.setFont('helvetica', 'bold');
            doc.text(lines[0], firstLineStartX + doc.getStringUnitWidth(prefix) * textFontSize, currentTextY, { align: 'left' });
            
            currentTextY += lineHeight - 3; 

            // Render subsequent lines (bold)
            for (let i = 1; i < lines.length; i++) {
                const line = lines[i];
                const lineWidth = doc.getStringUnitWidth(line) * textFontSize;
                const lineStartX = docWidth / 2 - lineWidth / 2;
                label(line, lineStartX, currentTextY, 'bold', textFontSize, gray800, 'left');
                currentTextY += lineHeight - 3;
            }
        }
        
        y += amountInWordsBoxHeight + 20; 
        
        // --- F. Signature Footer (Placeholders) ---
        const sigY = 750; 
        doc.setDrawColor(150, 150, 150);
        doc.line(docMargin + 50, sigY, docMargin + 180, sigY);
        doc.line(docWidth - docMargin - 180, sigY, docWidth - docMargin - 50, sigY);
        
        label('Employee Signature', docMargin + 115, sigY + 15, 'normal', 9, gray600, 'center');
        label('Authorized Signature', docWidth - docMargin - 115, sigY + 15, 'normal', 9, gray600, 'center');


        // --- Final Save ---
        const filename = `Salary_Slip_${staffName.replace(/\s/g, '_')}_${monthYear.replace(/\s/g, '-')}.pdf`;
       doc.save(filename);
       
    } catch (e) {
        console.error('jsPDF Generation Error:', e);
        alert('Failed to generate PDF. Check console for details.');
    }
};