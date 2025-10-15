import React, { useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useReactToPrint } from 'react-to-print';
import jsPDF from 'jspdf'; 
import { generateSalaryPDF } from '../utils/pdfGenerator';

// --- DATE AND AMOUNT HELPERS (REMAINS CORRECT) ---

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


// --- PrintableSalarySlip Component (React View) ---
const PrintableSalarySlip = React.forwardRef(({ salary }, ref) => {
    const staff = salary.staff;
    const monthYear = salary.monthYear || 'October 2025';

    // Using example data from image_d669d6.png for consistency
    // const basicSalary = salary.staff.basicSalary || 29998.00;
    // const allowances = salary.allowances;
    // const bonus = salary.bonus;
    
    // const grossPay = (basicSalary + allowances + bonus); 
    
    // const employeeEpf = salary.employeeEpf;
    // const totalDeductions = employeeEpf;
    // const netSalary = grossPay - totalDeductions;
    
    // const payPeriod = salary.payPeriod || getPayPeriod(monthYear);
    // const companyEmail = 'mahindaexpress@gmail.com'; 

    const basicSalary = salary.staff.basicSalary || 0; // Use 0 default for safe math
    const allowances = salary.allowances || 0; // Ensure 0 if undefined
    const bonus = salary.bonus || 0;
    const reimbursements = salary.reimbursements || 0; // <-- NEW
    const otHours = salary.otHours || 0;
        const hourlyRate = (basicSalary / 28 )/ 8;
        const othourlyrate = hourlyRate * 1.5;
        const overtimePay = otHours * othourlyrate;
    // --- UPDATED Gross Pay CALCULATION ---
    const grossPay = (basicSalary + allowances + bonus + reimbursements + overtimePay); 
    
    const employeeEpf = salary.employeeEpf || 0; // Ensure 0 if undefined
    const loan = salary.loan || 0; // <-- NEW
    const salaryAdvance = salary.salaryAdvance || 0; // <-- NEW
    
    // --- UPDATED Total Deductions CALCULATION ---
    const totalDeductions = employeeEpf + loan + salaryAdvance;
    const netSalary = grossPay - totalDeductions;
    
    const payPeriod = salary.payPeriod || getPayPeriod(monthYear);
    const companyEmail = 'mahindaexpress@gmail.com'; 

    if (!staff) return <div className="p-5 text-center bg-white">Loading staff details...</div>;

    const LineItem = ({ label, value }) => (
        <div className="flex justify-between pb-3"> 
            <span className="text-gray-700">{label}</span>
            <span className="font-semibold">{value}</span>
        </div>
    );

    const ConditionalLineItem = ({ label, amount }) => {
        // Only render if amount is greater than zero
        if (Number(amount) <= 0) return null;
        return <LineItem label={label} value={formatLKR(amount)} />;
    };
    
    return (
        <div ref={ref} className="max-w-4xl mx-auto p-0 bg-white shadow-xl text-gray-800 border border-gray-200">
            {/* Header Section */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
                <div className="flex items-center">
                    <div className="w-8 h-8 bg-indigo-700 rounded-full flex items-center justify-center mr-3">
                         <span className="text-white text-xl font-bold">M</span>
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">Mahinda Express</h1>
                        <p className="text-sm text-gray-600">183/1, Galle Road, Colombo | Email: {companyEmail}</p>
                    </div>
                </div>
                <div className="text-sm font-semibold text-gray-700">
                    Month: {monthYear}
                </div>
            </div>

            {/* Employee Info Section */}
            <div className="px-6 py-6 border-b border-gray-300"> 
                <p className="text-base font-normal mb-2"><span className="font-bold">Employee Name:</span><span className="ml-1">{staff.name || 'jananga'}</span></p>
                <p className="text-base font-normal mb-2"><span className="font-bold">Designation:</span><span className="ml-1">{staff.role || 'Driver'}</span></p>
                <p className="text-base font-normal"><span className="font-bold">Pay Period:</span><span className="ml-1">{payPeriod}</span></p>
            </div>

            {/* Earnings and Deductions Columns */}
            <div className="flex flex-wrap p-6">
                <div className="w-full md:w-1/2 pr-6">
                    <h2 className="text-lg font-bold text-gray-800 mb-4 uppercase border-b-2 pb-1">EARNINGS</h2>
                    <div className="space-y-2">
                        <LineItem label="Basic Salary" value={formatLKR(basicSalary)} />
                        {/* <LineItem label="Allowances" value={formatLKR(allowances)} />
                        <LineItem label="Bonus" value={formatLKR(bonus)} />
                        <LineItem label="Reimbursements" value={formatLKR(reimbursements)} /> */}
                        {/* Use ConditionalLineItem for optional earnings */}
                        <ConditionalLineItem label="Overtime" amount= {overtimePay} />
                        <ConditionalLineItem label="Allowances" amount={allowances} />
                        <ConditionalLineItem label="Bonus" amount={bonus} />
                        <ConditionalLineItem label="Reimbursements" amount={reimbursements} />
                        <div className="h-6"></div> 
                        
                        <div className="flex justify-between pt-4 border-t border-gray-400"> 
                            <span className="text-lg font-bold text-gray-800">Gross Pay:</span>
                            <span className="text-lg font-bold text-gray-800">{formatLKR(grossPay)}</span>
                        </div>
                    </div>
                </div>
                
                <div className="w-full md:w-1/2 pl-6 mt-6 md:mt-0 md:border-l border-gray-300">
                    <h2 className="text-lg font-bold text-gray-800 mb-4 uppercase border-b-2 pb-1">DEDUCTIONS</h2>
                    <div className="space-y-2">
                        <LineItem label="EPF (8%)" value={formatLKR(employeeEpf)} />
                        {/* Use ConditionalLineItem for optional deductions */}
                        <ConditionalLineItem label="Loan Deduction" amount={loan} />
                        <ConditionalLineItem label="Salary Advance" amount={salaryAdvance} />
                        
                        <div className="h-14"></div> 

                        <div className="flex justify-between pt-4 border-t border-gray-400"> 
                            <span className="text-lg font-bold text-gray-800">Total Deductions:</span>
                            <span className="text-lg font-bold text-gray-800">{formatLKR(totalDeductions)}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Net Salary Bar */}
            <div className="bg-indigo-700 text-white px-6 py-5 mt-8"> 
                <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold">Net Salary</span>
                    <span className="text-3xl font-bold">{formatLKR(netSalary)}</span>
                </div>
            </div>

            {/* Amount in Words */}
            <div className="bg-gray-100 p-4 text-center">
                <p className="text-lg font-normal text-gray-800">
                    <span className="font-normal">Amount in Words:</span> 
                    <span className="font-bold ml-1">{amountToWordsWithCents(netSalary)}</span>
                </p>
            </div>
        </div>
    );
});


// --- Wrapper Component (jsPDF Implementation - FINAL SPACING FIXES) ---
const SalarySlipView = () => {
    const location = useLocation();
    const componentRef = useRef();
    const salary = location.state?.salary || {}; 

    if (!salary.staff) {
        return (
            <div className="p-8 text-center text-white bg-gray-900 min-h-screen">
                No salary data found to display. Please return to the payroll page.
            </div>
        );
    }

    const { staff } = salary;
    const staffName = staff.name || 'jananga';
    const staffRole = staff.role || 'Driver';
    const monthYear = salary.monthYear || 'October 2025';
    
    
    const basicSalary = salary.staff.basicSalary || 29998.00;
    const allowances = salary.allowances;
    const bonus = salary.bonus;
    const otHours = salary.otHours;
    const hourlyRate = (basicSalary / 28 )/ 8;
        const othourlyrate = hourlyRate * 1.5;
        const overtimePay = otHours * othourlyrate;
    const reimbursements = salary.reimbursements;
    const grossPay = basicSalary + allowances + bonus + reimbursements + overtimePay;
    
    const employeeEpf = salary.employeeEpf;
    const loan = salary.loan;
    const salaryAdvance = salary.salaryAdvance;
    const totalDeductions = employeeEpf + loan + salaryAdvance;
    const netSalary = grossPay - totalDeductions;
    
    const payPeriod = salary.payPeriod || getPayPeriod(monthYear);
    const companyEmail = 'mahindaexpress@gmail.com'; 


    const handlePrint = useReactToPrint({
        content: () => componentRef.current,
        documentTitle: `Salary_Slip_${staffName.replace(/\s/g, '_')}_${monthYear.replace(/\s/g, '-')}`,
        pageStyle: '@page { size: A4; margin: 0; }',
    });

    const handleDownloadSlip = (salary) => {
    // salary is the full record object (which includes staff info, monthYear, and calculated values)
    generateSalaryPDF(salary); 
};
    // --- jsPDF Download Function (FINAL SPACING RECONCILIATION) ---
    // const handleDownloadPDF = () => {
    //     try {
    //         const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    //         const docWidth = doc.internal.pageSize.getWidth();
    //         const docMargin = 40;
    //         const contentWidth = docWidth - 2 * docMargin;
    //         let y = 40;
            
    //         // Re-tuned line height for gaps like image_d669d6.png
    //         const lineHeight = 18; 
    //         const colGap = 20;

    //         // --- Styling Helpers ---
    //         const indigo = [74, 58, 255]; 
    //         const grayText = [107, 114, 128];
    //         const blackText = [17, 24, 39];

    //         const label = (t, x, y, font = 'bold', size = 10, color = blackText, align = 'left') => {
    //             doc.setFont('helvetica', font);
    //             doc.setFontSize(size);
    //             doc.setTextColor(...color);
    //             doc.text(t, x, y, { align: align });
    //         };

    //         // --- A. Header/Masthead Section ---
    //         // Draw bottom separator line
    //         doc.setDrawColor(200, 200, 200);
    //         doc.setLineWidth(1);
    //         doc.line(docMargin, y + 45, docWidth - docMargin, y + 45); 

    //         // Logo Placeholder (A in a circle)
    //         doc.setFillColor(...indigo);
    //         doc.circle(docMargin + 10, y + 10, 10, 'F');
    //         label('A', docMargin + 10, y + 13, 'bold', 12, [255, 255, 255], 'center');

    //         // Company Name
    //         label('Mahinda Express', docMargin + 28, y + 8, 'bold', 14, blackText);
            
    //         // Company Address/Info
    //         label(`183/1, Galle Road, Colombo | Email: mahindaexpress@gmail.com`, docMargin + 28, y + 22, 'normal', 10, grayText);
            
    //         // Month
    //         label(`Month: ${monthYear}`, docWidth - docMargin, y + 8, 'bold', 10, blackText, 'right');
            
    //         y += 60; // Final spacing after header line (60pt)


    //         // --- B. Employee Info Section ---
    //         doc.setLineWidth(1);
    //         // Draw bottom separator line for info section (Total height: 3*16 + 20 = 68pt)
    //         doc.line(docMargin, y + 3 * 16 + 20, docWidth - docMargin, y + 3 * 16 + 20); 
            
    //         const infoCol1 = docMargin;

    //         label('Employee Name:', infoCol1, y, 'bold', 11);
    //         label(staffName, infoCol1 + 90, y, 'normal', 11, blackText);
            
    //         label('Designation:', infoCol1, y + 16);
    //         label(staffRole, infoCol1 + 90, y + 16, 'normal', 11, blackText);
            
    //         label('Pay Period:', infoCol1, y + 32);
    //         label(payPeriod, infoCol1 + 90, y + 32, 'normal', 11, blackText);
            
    //         y += 3 * 16 + 35; // Final spacing after info section (83pt total height for section)


    //         // --- C. Earnings and Deductions Columns ---
    //         const col1X = docMargin;
    //         const amount1X = docWidth / 2 - 10; 
    //         const col2X = docWidth / 2 + colGap;
    //         const amount2X = docWidth - docMargin; 

    //         // Column Headers
    //         label('EARNINGS', col1X, y, 'bold', 12, blackText);
    //         doc.line(col1X, y + 2, contentWidth / 2 - 10, y + 2); 
            
    //         label('DEDUCTIONS', col2X, y, 'bold', 12, blackText);
    //         doc.line(col2X, y + 2, docWidth - docMargin, y + 2); 
    //         y += 30; // Final spacing after header line (30pt)


    //         // Function to add a list item
    //         const addItem = (desc, amount, currentY, startX, amountAlignX) => {
    //             label(desc, startX, currentY, 'normal', 11, blackText);
    //             label(formatLKR(amount), amountAlignX, currentY, 'bold', 11, blackText, 'right');
    //             return currentY + lineHeight; 
    //         };

    //         // Earnings List
    //         let eY = y;
    //         eY = addItem('Basic Salary', basicSalary, eY, col1X, amount1X);
    //         eY = addItem('Allowances', allowances, eY, col1X, amount1X);
    //         eY = addItem('Bonus', bonus, eY, col1X, amount1X);
            
    //         // Gap before Gross Pay line (3*18pt items + 2*18pt gap before line)
    //         eY += lineHeight * 2; 

    //         // Deductions List
    //         let dY = y;
    //         dY = addItem('EPF (8%)', employeeEpf, dY, col2X, amount2X);
    //         // Gap for alignment with Gross Pay
    //         dY += lineHeight * 4; 


    //         // Gross Pay & Total Deductions Footer
    //         const lineY = Math.max(eY, dY);
    //         doc.setDrawColor(100, 100, 100); 
    //         doc.line(col1X, lineY, amount1X, lineY); 
    //         doc.line(col2X, lineY, amount2X, lineY); 
            
    //         eY = lineY + lineHeight;
    //         dY = lineY + lineHeight;

    //         label('Gross Pay:', col1X, eY, 'bold', 12, blackText);
    //         label(formatLKR(grossPay), amount1X, eY, 'bold', 12, blackText, 'right');
            
    //         label('Total Deductions:', col2X, dY, 'bold', 12, blackText);
    //         label(formatLKR(totalDeductions), amount2X, dY, 'bold', 12, blackText, 'right');
            
    //         y = Math.max(eY, dY) + 30; // Final spacing before Net Salary bar (30pt)


    //         // --- D. Net Salary Bar ---
    //         const barHeight = 45; 
    //         doc.setFillColor(...indigo);
    //         doc.rect(docMargin, y, contentWidth, barHeight, 'F');
    //         y += barHeight / 2 + 5; 

    //         label('Net Salary', docMargin + colGap, y, 'bold', 18, [255, 255, 255]); 
    //         label(formatLKR(netSalary), amount2X - colGap, y, 'bold', 20, [255, 255, 255], 'right'); 
    //         y += barHeight / 2 + 5; 


    //         // --- E. Amount in Words ---
    //         doc.setFillColor(243, 244, 246); 
    //         doc.rect(docMargin, y, contentWidth, 30, 'F'); 
    //         y += 18;
            
    //         const wordsText = `Amount in Words: ${amountToWordsWithCents(netSalary)}`;
    //         label(wordsText, docWidth / 2, y, 'bold', 10, blackText, 'center');
    //         y += 30; 


    //         // --- F. Signature Footer (Omitted for brevity in image comparison, but kept for full slip) ---
    //         const sigY = 750;
    //         doc.setDrawColor(150, 150, 150);
    //         doc.line(docMargin + 50, sigY, docMargin + 180, sigY);
    //         doc.line(docWidth - docMargin - 180, sigY, docWidth - docMargin - 50, sigY);
            
    //         label('Employee Signature', docMargin + 115, sigY + 15, 'normal', 9, grayText, 'center');
    //         label('Authorized Signature', docWidth - docMargin - 115, sigY + 15, 'normal', 9, grayText, 'center');


    //         // --- Final Save ---
    //         const filename = `Salary_Slip_${staffName.replace(/\s/g, '_')}_${monthYear.replace(/\s/g, '-')}.pdf`;
    //         doc.save(filename);
    //     } catch (e) {
    //         console.error('jsPDF Generation Error:', e);
    //         alert('Failed to generate PDF. Check console for details.');
    //     }
    // };

    const formatLKR = (amount) => {
    // This function formats a number to the LKR. 50,000.00 format
    if (typeof amount !== 'number') {
        amount = Number(amount) || 0;
    }
    return `LKR. ${amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
};

const amountToWordsWithCents = (amount) => {
    const num = Number(amount);
    if (isNaN(num) || num === 0) {
        return 'Zero Rupees Only';
    }

    const units = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    const scales = ['', 'Thousand', 'Million', 'Billion'];

    const convertChunk = (n) => {
        let chunk = '';
        if (n >= 100) {
            chunk += units[Math.floor(n / 100)] + ' Hundred ';
            n %= 100;
        }
        if (n >= 20) {
            chunk += tens[Math.floor(n / 10)] + ' ';
            n %= 10;
        } else if (n >= 10) {
            chunk += teens[n - 10] + ' ';
            n = 0;
        }
        if (n > 0) {
            chunk += units[n] + ' ';
        }
        return chunk;
    };

    let rupees = Math.floor(num);
    let cents = Math.round((num - rupees) * 100);
    let words = '';

    if (rupees === 0) {
        words = 'Zero';
    } else {
        let count = 0;
        while (rupees > 0) {
            let chunk = rupees % 1000;
            if (chunk > 0) {
                words = convertChunk(chunk) + scales[count] + ' ' + words;
            }
            rupees = Math.floor(rupees / 1000);
            count++;
        }
    }
    
    words = words.trim() + ' Rupees';

    if (cents > 0) {
        // Convert cents to words
        let centsWords = convertChunk(cents).trim();
        words += ` and ${centsWords} Cents`;
    }

    return words + ' Only';
};

    const handleDownloadPDF = () => {
    try {
        const doc = new jsPDF({ unit: 'pt', format: 'a4' });
        const docWidth = doc.internal.pageSize.getWidth();
        const docMargin = 40;
        const contentWidth = docWidth - 2 * docMargin;
        let y = 40;
        
        // Re-tuned line height for gaps
        const lineHeight = 18; 
        const colGap = 20;

        // --- Styling Helpers ---
        const indigo = [74, 58, 255]; 
        const grayText = [107, 114, 128];
        const blackText = [17, 24, 39];

        const label = (t, x, y, font = 'bold', size = 10, color = blackText, align = 'left') => {
            doc.setFont('helvetica', font);
            doc.setFontSize(size);
            doc.setTextColor(...color);
            doc.text(t, x, y, { align: align });
        };

        // --- NEW HELPER FUNCTION FOR CONDITIONAL PDF ITEM ---
        // Returns the new Y position if rendered, or the old Y position if not.
        const renderIfPositive = (desc, amount, currentY, startX, amountAlignX) => {
            if (Number(amount) > 0) {
                label(desc, startX, currentY, 'normal', 11, blackText);
                label(formatLKR(amount), amountAlignX, currentY, 'bold', 11, blackText, 'right');
                return currentY + lineHeight; 
            }
            return currentY;
        };

        // --- A. Header/Masthead Section ---
        // ... (Header code remains the same) ...
        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(1);
        doc.line(docMargin, y + 45, docWidth - docMargin, y + 45); 
        doc.setFillColor(...indigo);
        doc.circle(docMargin + 10, y + 10, 10, 'F');
        label('A', docMargin + 10, y + 13, 'bold', 12, [255, 255, 255], 'center');
        label('Mahinda Express', docMargin + 28, y + 8, 'bold', 14, blackText);
        label(`183/1, Galle Road, Colombo | Email: mahindaexpress@gmail.com`, docMargin + 28, y + 22, 'normal', 10, grayText);
        label(`Month: ${monthYear}`, docWidth - docMargin, y + 8, 'bold', 10, blackText, 'right');
        y += 60; 


        // --- B. Employee Info Section ---
        // ... (Employee Info code remains the same) ...
        doc.setLineWidth(1);
        doc.line(docMargin, y + 3 * 16 + 20, docWidth - docMargin, y + 3 * 16 + 20); 
        
        const infoCol1 = docMargin;
        label('Employee Name:', infoCol1, y, 'bold', 11);
        label(staffName, infoCol1 + 90, y, 'normal', 11, blackText);
        label('Designation:', infoCol1, y + 16);
        label(staffRole, infoCol1 + 90, y + 16, 'normal', 11, blackText);
        label('Pay Period:', infoCol1, y + 32);
        label(payPeriod, infoCol1 + 90, y + 32, 'normal', 11, blackText);
        
        y += 3 * 16 + 35;


        // --- C. Earnings and Deductions Columns (UPDATED LOGIC) ---
        const col1X = docMargin;
        const amount1X = docWidth / 2 - 10; 
        const col2X = docWidth / 2 + colGap;
        const amount2X = docWidth - docMargin; 

        // Column Headers
        label('EARNINGS', col1X, y, 'bold', 12, blackText);
        doc.line(col1X, y + 2, contentWidth / 2 - 10, y + 2); 
        
        label('DEDUCTIONS', col2X, y, 'bold', 12, blackText);
        doc.line(col2X, y + 2, docWidth - docMargin, y + 2); 
        y += 30; // Final spacing after header line (30pt)


        // Earnings List
        let eY = y;
        // Basic Salary is typically always shown
        eY = renderIfPositive('Basic Salary', basicSalary, eY, col1X, amount1X);
        
        // --- Apply Conditional Rendering for Optional Earnings ---
        eY = renderIfPositive('Allowances', allowances, eY, col1X, amount1X);
        eY = renderIfPositive('Bonus', bonus, eY, col1X, amount1X);
        eY = renderIfPositive('Reimbursements', reimbursements, eY, col1X, amount1X); // Added reimbursements


        // Deductions List
        let dY = y;
        // --- Apply Conditional Rendering for Optional Deductions ---
        dY = renderIfPositive('EPF (8%)', employeeEpf, dY, col2X, amount2X);
        dY = renderIfPositive('Loan Deduction', loan, dY, col2X, amount2X);         // Added loans
        dY = renderIfPositive('Salary Advance', salaryAdvance, dY, col2X, amount2X); // Added salary advance


        // --- DYNAMIC ALIGNMENT FOR FOOTER ---
        // Find the maximum Y position reached by either column
        const contentMaxY = Math.max(eY, dY);

        // Add a vertical gap before the separating line
        const gapBeforeLine = lineHeight; 
        const lineY = contentMaxY + gapBeforeLine; 

        doc.setDrawColor(100, 100, 100); 
        // Draw separating lines for Gross Pay / Total Deductions
        doc.line(col1X, lineY, amount1X, lineY); 
        doc.line(col2X, lineY, amount2X, lineY); 
        
        // Position Gross Pay / Total Deductions labels below the line
        const finalItemY = lineY + lineHeight;

        label('Gross Pay:', col1X, finalItemY, 'bold', 12, blackText);
        label(formatLKR(grossPay), amount1X, finalItemY, 'bold', 12, blackText, 'right');
        
        label('Total Deductions:', col2X, finalItemY, 'bold', 12, blackText);
        label(formatLKR(totalDeductions), amount2X, finalItemY, 'bold', 12, blackText, 'right');
        
        y = finalItemY + 30; // Final spacing before Net Salary bar (30pt)


        // --- D. Net Salary Bar ---
        const barHeight = 45; 
        doc.setFillColor(...indigo);
        doc.rect(docMargin, y, contentWidth, barHeight, 'F');
        y += barHeight / 2 + 5; 

        label('Net Salary', docMargin + colGap, y, 'bold', 18, [255, 255, 255]); 
        label(formatLKR(netSalary), amount2X - colGap, y, 'bold', 20, [255, 255, 255], 'right'); 
        y += barHeight / 2 + 5; 


        // --- E. Amount in Words ---
        // ... (Amount in Words code remains the same) ...
        doc.setFillColor(243, 244, 246); 
        doc.rect(docMargin, y, contentWidth, 30, 'F'); 
        y += 18;
        
        const wordsText = `Amount in Words: ${amountToWordsWithCents(netSalary)}`;
        label(wordsText, docWidth / 2, y, 'bold', 10, blackText, 'center');
        y += 30; 


        // --- F. Signature Footer ---
        const sigY = 750;
        doc.setDrawColor(150, 150, 150);
        doc.line(docMargin + 50, sigY, docMargin + 180, sigY);
        doc.line(docWidth - docMargin - 180, sigY, docWidth - docMargin - 50, sigY);
        
        label('Employee Signature', docMargin + 115, sigY + 15, 'normal', 9, grayText, 'center');
        label('Authorized Signature', docWidth - docMargin - 115, sigY + 15, 'normal', 9, grayText, 'center');


        // --- Final Save ---
        const filename = `Salary_Slip_${staffName.replace(/\s/g, '_')}_${monthYear.replace(/\s/g, '-')}.pdf`;
        doc.save(filename);
    } catch (e) {
        console.error('jsPDF Generation Error:', e);
        alert('Failed to generate PDF. Check console for details.');
    }
};

    return (
        <div className="p-8 bg-gray-900 min-h-screen">
            <div className="max-w-4xl mx-auto mb-5 flex justify-end space-x-4">
                
                {/* <button
                    onClick={handleDownloadPDF}
                    className="px-6 py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition duration-150 shadow-lg"
                >
                    Download Branded PDF
                </button> */}



                <button onClick={() => handleDownloadSlip(salary)}
                className="px-6 py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition duration-150 shadow-lg"
                >
                    Download Branded PDF
                </button>


                {/* <button
                    onClick={handlePrint}
                    className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition duration-150 shadow-lg"
                >
                    Print View / Local PDF
                </button> */}
            </div>
            
            <PrintableSalarySlip ref={componentRef} salary={salary} />
        </div>
    );
};

export default SalarySlipView;