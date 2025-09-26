import React, { useEffect, useMemo, useState } from "react";
import { maintenanceApi, partsApi, fuelApi, vehiclesApi } from "../api/client";
import { toast } from "react-toastify";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export default function ReportsPage() {
  const [month, setMonth] = useState(() => new Date().toISOString().slice(0,7)); // YYYY-MM
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);

  const getRange = (yyyyMm) => {
    const [y, m] = yyyyMm.split("-").map(Number);
    const start = new Date(Date.UTC(y, m - 1, 1));
    const end = new Date(Date.UTC(y, m, 0, 23, 59, 59, 999));
    return { start: start.toISOString(), end: end.toISOString() };
  };

  const run = async () => {
    try {
      const { start, end } = getRange(month);
      const [vehicles, maintList, partsList, fuelList, maintSummary, fuelSummary, partsReport] = await Promise.all([
        vehiclesApi.list(),
        maintenanceApi.list({ startDate: start, endDate: end }),
        partsApi.list({}),
        fuelApi.list({ startDate: start, endDate: end }),
        maintenanceApi.report({ startDate: start, endDate: end }),
        fuelApi.report({ startDate: start, endDate: end }),
        partsApi.report()
      ]);

      // Organize maintenance and fuel data by vehicle
      const vehicleReports = vehicles.map(vehicle => {
        const vehicleMaintenance = maintList.filter(m => m.vehicleNumber === vehicle.vehicleNumber);
        const vehicleFuel = fuelList.filter(f => f.vehicleNumber === vehicle.vehicleNumber);
        
        return {
          ...vehicle,
          maintenance: vehicleMaintenance,
          fuel: vehicleFuel,
          maintenanceCount: vehicleMaintenance.length,
          fuelCount: vehicleFuel.length,
          totalMaintenanceCost: vehicleMaintenance.reduce((sum, m) => sum + (m.serviceCost || 0), 0),
          totalFuelCost: vehicleFuel.reduce((sum, f) => sum + (f.totalCost || 0), 0)
        };
      });

      setData({ 
        vehicles: vehicleReports,
        maintList, 
        partsList, 
        fuelList, 
        maintSummary, 
        fuelSummary,
        partsReport
      });
    } catch (e) {
      toast.error("Failed to generate reports");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    run();
  }, [month])

  const totalPartsValue = useMemo(() => {
    if (!data?.partsList) return 0;
    return data.partsList.reduce((s, p) => s + (p.cost || 0) * (p.stockQty || 0), 0);
  }, [data]);

  const generatePDF = async () => {
    if (!data) {
      toast.error("Please generate reports first");
      return;
    }

    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      let yPosition = 20;

      // Helper function to add a line
      const addLine = (y) => {
        pdf.setDrawColor(200, 200, 200);
        pdf.line(20, y, pageWidth - 20, y);
      };

      // Helper function to add a section header
      const addSectionHeader = (text, y) => {
        pdf.setFillColor(41, 128, 185);
        pdf.rect(20, y - 5, pageWidth - 40, 8, 'F');
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(12);
        pdf.setFont(undefined, 'bold');
        pdf.text(text, 25, y + 1);
        pdf.setTextColor(0, 0, 0);
        pdf.setFont(undefined, 'normal');
        return y + 10;
      };

      // Helper function to add a card-style box
      const addCard = (title, content, x, y, width, height) => {
        // Card background
        pdf.setFillColor(248, 249, 250);
        pdf.rect(x, y, width, height, 'F');
        
        // Card border
        pdf.setDrawColor(220, 220, 220);
        pdf.rect(x, y, width, height);
        
        // Title
        pdf.setFontSize(10);
        pdf.setFont(undefined, 'bold');
        pdf.setTextColor(52, 73, 94);
        pdf.text(title, x + 5, y + 7);
        
        // Content - ensure it's a string
        pdf.setFontSize(9);
        pdf.setFont(undefined, 'normal');
        pdf.setTextColor(0, 0, 0);
        pdf.text(String(content), x + 5, y + 15);
        
        return y + height + 5;
      };

      // Header with company branding
      pdf.setFillColor(41, 128, 185);
      pdf.rect(0, 0, pageWidth, 35, 'F');
      
      // Company name
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(24);
      pdf.setFont(undefined, 'bold');
      pdf.text('MAHINDA EXPRESS', pageWidth / 2, 15, { align: 'center' });
      
      // Report title
      pdf.setFontSize(16);
      pdf.setFont(undefined, 'normal');
      pdf.text('Fleet Management Report', pageWidth / 2, 25, { align: 'center' });
      
      // Report period
      pdf.setFontSize(12);
      pdf.text(`Report Period: ${month}`, pageWidth / 2, 30, { align: 'center' });
      
      // Reset colors
      pdf.setTextColor(0, 0, 0);
      yPosition = 50;

      // Executive Summary Section
      yPosition = addSectionHeader('EXECUTIVE SUMMARY', yPosition);
      
      // Summary cards in a grid
      const cardWidth = (pageWidth - 60) / 4;
      const cardHeight = 25;
      let cardY = yPosition;
      
      cardY = addCard('Total Vehicles', data.vehicles?.length || 0, 20, cardY, cardWidth, cardHeight);
      cardY = addCard('Maintenance Records', data.maintSummary?.summary?.records || 0, 20 + cardWidth + 5, cardY, cardWidth, cardHeight);
      cardY = addCard('Fuel Records', data.fuelSummary?.records || 0, 20 + (cardWidth + 5) * 2, cardY, cardWidth, cardHeight);
      cardY = addCard('Parts Inventory', data.partsList.length, 20 + (cardWidth + 5) * 3, cardY, cardWidth, cardHeight);
      
      yPosition = cardY + 10;

      // Financial Summary
      yPosition = addSectionHeader('FINANCIAL SUMMARY', yPosition);
      
      pdf.setFontSize(10);
      pdf.setFont(undefined, 'bold');
      pdf.text('Total Maintenance Cost:', 25, yPosition);
      pdf.setFont(undefined, 'normal');
      pdf.text(`$${data.maintSummary?.summary?.totalCost || 0}`, 80, yPosition);
      yPosition += 8;
      
      pdf.setFont(undefined, 'bold');
      pdf.text('Total Fuel Cost:', 25, yPosition);
      pdf.setFont(undefined, 'normal');
      pdf.text(`$${data.vehicles?.reduce((sum, v) => sum + v.totalFuelCost, 0) || 0}`, 80, yPosition);
      yPosition += 8;
      
      pdf.setFont(undefined, 'bold');
      pdf.text('Parts Inventory Value:', 25, yPosition);
      pdf.setFont(undefined, 'normal');
      pdf.text(`$${totalPartsValue}`, 80, yPosition);
      yPosition += 15;

      // Parts Inventory Summary
      yPosition = addSectionHeader('PARTS INVENTORY REPORT', yPosition);
      
      // Parts summary cards
      const partsCardWidth = (pageWidth - 60) / 4;
      let partsCardY = yPosition;
      
      partsCardY = addCard('Total Parts', data.partsList?.length || 0, 20, partsCardY, partsCardWidth, cardHeight);
      partsCardY = addCard('Low Stock', data.partsReport?.lowStockCount || 0, 20 + partsCardWidth + 5, partsCardY, partsCardWidth, cardHeight);
      partsCardY = addCard('Out of Stock', data.partsReport?.outOfStockCount || 0, 20 + (partsCardWidth + 5) * 2, partsCardY, partsCardWidth, cardHeight);
      partsCardY = addCard('Inventory Value', `$${totalPartsValue}`, 20 + (partsCardWidth + 5) * 3, partsCardY, partsCardWidth, cardHeight);
      
      yPosition = partsCardY + 10;

      // Parts Inventory Table
      if (data.partsList && data.partsList.length > 0) {
        yPosition = addSectionHeader('PARTS INVENTORY DETAILS REPORT', yPosition);
        
        // Table header
        pdf.setFillColor(52, 73, 94);
        pdf.rect(20, yPosition, pageWidth - 40, 8, 'F');
        pdf.setTextColor(255, 255, 255);
        pdf.setFont(undefined, 'bold');
        pdf.setFontSize(8);
        pdf.text('Part ID', 25, yPosition + 5);
        pdf.text('Name', 50, yPosition + 5);
        pdf.text('Category', 100, yPosition + 5);
        pdf.text('Stock', 130, yPosition + 5);
        pdf.text('Min', 145, yPosition + 5);
        pdf.text('Cost', 160, yPosition + 5);
        pdf.text('Value', 175, yPosition + 5);
        pdf.text('Status', 195, yPosition + 5);
        yPosition += 8;

        // Table rows
        pdf.setTextColor(0, 0, 0);
        pdf.setFont(undefined, 'normal');
        pdf.setFontSize(7);
        
        data.partsList.slice(0, 20).forEach((part, index) => {
          if (yPosition > pageHeight - 20) {
            pdf.addPage();
            yPosition = 20;
          }
          
          const totalValue = (part.cost || 0) * (part.stockQty || 0);
          const isLowStock = part.stockQty <= part.minThreshold;
          const isOutOfStock = part.stockQty <= 0;
          
          // Alternate row colors
          if (index % 2 === 0) {
            pdf.setFillColor(248, 249, 250);
            pdf.rect(20, yPosition, pageWidth - 40, 6, 'F');
          }
          
          pdf.text(part.partId || 'N/A', 25, yPosition + 4);
          pdf.text(part.name || 'N/A', 50, yPosition + 4);
          pdf.text(part.category || 'N/A', 100, yPosition + 4);
          pdf.text(String(part.stockQty || 0), 130, yPosition + 4);
          pdf.text(String(part.minThreshold || 0), 145, yPosition + 4);
          pdf.text(`$${part.cost || 0}`, 160, yPosition + 4);
          pdf.text(`$${totalValue}`, 175, yPosition + 4);
          
          // Status
          if (isOutOfStock) {
            pdf.setTextColor(220, 53, 69);
            pdf.text('OUT', 195, yPosition + 4);
          } else if (isLowStock) {
            pdf.setTextColor(255, 193, 7);
            pdf.text('LOW', 195, yPosition + 4);
          } else {
            pdf.setTextColor(40, 167, 69);
            pdf.text('OK', 195, yPosition + 4);
          }
          pdf.setTextColor(0, 0, 0);
          
          yPosition += 6;
        });
        
        yPosition += 10;
      }

      // Vehicle Reports
      yPosition = addSectionHeader('VEHICLE REPORTS', yPosition);

      data.vehicles?.forEach((vehicle, index) => {
        // Check if we need a new page
        if (yPosition > pageHeight - 80) {
          pdf.addPage();
          yPosition = 20;
        }

        // Vehicle header with background
        pdf.setFillColor(236, 240, 241);
        pdf.rect(20, yPosition, pageWidth - 40, 12, 'F');
        pdf.setDrawColor(189, 195, 199);
        pdf.rect(20, yPosition, pageWidth - 40, 12);
        
        pdf.setFontSize(12);
        pdf.setFont(undefined, 'bold');
        pdf.setTextColor(44, 62, 80);
        pdf.text(`${vehicle.vehicleNumber} - ${vehicle.model} (${vehicle.year})`, 25, yPosition + 8);
        
        yPosition += 18;

        // Vehicle stats in a table format
        pdf.setFontSize(9);
        pdf.setFont(undefined, 'normal');
        pdf.setTextColor(0, 0, 0);
        
        // Table header
        pdf.setFillColor(52, 73, 94);
        pdf.rect(25, yPosition, 150, 8, 'F');
        pdf.setTextColor(255, 255, 255);
        pdf.setFont(undefined, 'bold');
        pdf.text('Metric', 30, yPosition + 5);
        pdf.text('Value', 100, yPosition + 5);
        pdf.text('Cost', 130, yPosition + 5);
        yPosition += 8;

        // Table rows
        pdf.setTextColor(0, 0, 0);
        pdf.setFont(undefined, 'normal');
        
        // Maintenance row
        pdf.setFillColor(248, 249, 250);
        pdf.rect(25, yPosition, 150, 6, 'F');
        pdf.text('Maintenance Records', 30, yPosition + 4);
        pdf.text(String(vehicle.maintenanceCount || 0), 100, yPosition + 4);
        pdf.text(`$${vehicle.totalMaintenanceCost || 0}`, 130, yPosition + 4);
        yPosition += 6;

        // Fuel row
        pdf.rect(25, yPosition, 150, 6, 'F');
        pdf.text('Fuel Records', 30, yPosition + 4);
        pdf.text(String(vehicle.fuelCount || 0), 100, yPosition + 4);
        pdf.text(`$${vehicle.totalFuelCost || 0}`, 130, yPosition + 4);
        yPosition += 6;

        // Mileage row
        pdf.rect(25, yPosition, 150, 6, 'F');
        pdf.text('Current Mileage', 30, yPosition + 4);
        pdf.text(String(vehicle.mileage || 'N/A'), 100, yPosition + 4);
        pdf.text('-', 130, yPosition + 4);
        yPosition += 12;

        // Recent maintenance details
        if (vehicle.maintenance.length > 0) {
          pdf.setFontSize(9);
          pdf.setFont(undefined, 'bold');
          pdf.setTextColor(52, 73, 94);
          pdf.text('Recent Maintenance:', 30, yPosition);
          yPosition += 6;
          
          pdf.setFont(undefined, 'normal');
          pdf.setFontSize(8);
          vehicle.maintenance.slice(0, 3).forEach(maint => {
            pdf.text(`• ${String(maint.serviceType || 'N/A')}`, 35, yPosition);
            pdf.text(`$${String(maint.serviceCost || 0)}`, 120, yPosition);
            pdf.text(maint.serviceDate ? new Date(maint.serviceDate).toLocaleDateString() : 'N/A', 140, yPosition);
            yPosition += 5;
          });
          yPosition += 5;
        }

        // Recent fuel details
        if (vehicle.fuel.length > 0) {
          pdf.setFontSize(9);
          pdf.setFont(undefined, 'bold');
          pdf.setTextColor(52, 73, 94);
          pdf.text('Recent Fuel Records:', 30, yPosition);
          yPosition += 6;
          
          pdf.setFont(undefined, 'normal');
          pdf.setFontSize(8);
          vehicle.fuel.slice(0, 3).forEach(fuel => {
            pdf.text(`• ${String(fuel.liters || 0)}L`, 35, yPosition);
            pdf.text(`$${String(fuel.totalCost || 0)}`, 120, yPosition);
            pdf.text(fuel.date ? new Date(fuel.date).toLocaleDateString() : 'N/A', 140, yPosition);
            yPosition += 5;
          });
          yPosition += 10;
        }

        // Add separator line between vehicles
        if (index < data.vehicles.length - 1) {
          addLine(yPosition);
          yPosition += 5;
        }
      });

      // Footer
      const totalPages = pdf.internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setTextColor(128, 128, 128);
        pdf.text(`Page ${i} of ${totalPages}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
        pdf.text(`Generated on ${new Date().toLocaleDateString()}`, pageWidth / 2, pageHeight - 5, { align: 'center' });
      }

      // Save the PDF
      const fileName = `MahindaExpress-FleetReport-${month}.pdf`;
      pdf.save(fileName);
      toast.success("Professional PDF report generated successfully!");
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error("Failed to generate PDF report");
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Monthly Reports</h1>
      <div className="flex items-center gap-3">
        <input type="month" value={month} onChange={e=>setMonth(e.target.value)} className="border rounded px-3 py-2" />
        {/* <button onClick={run} disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded">{loading ? "Generating..." : "Generate Report"}</button> */}
        
        {data && (
          <button onClick={generatePDF} className="bg-red-600 text-white px-4 py-2 rounded flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export PDF
          </button>
        )}
      </div>

      {data && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded shadow">
              <h3 className="font-semibold text-gray-600">Total Vehicles</h3>
              <p className="text-2xl font-bold text-blue-600">{data.vehicles?.length || 0}</p>
            </div>
            <div className="bg-white p-4 rounded shadow">
              <h3 className="font-semibold text-gray-600">Maintenance Records</h3>
              <p className="text-2xl font-bold text-orange-600">{data.maintSummary?.summary?.records || 0}</p>
              <p className="text-sm text-gray-500">Total Cost: ${data.maintSummary?.summary?.totalCost || 0}</p>
            </div>
            <div className="bg-white p-4 rounded shadow">
              <h3 className="font-semibold text-gray-600">Fuel Records</h3>
              <p className="text-2xl font-bold text-green-600">{data.fuelSummary?.records || 0}</p>
              <p className="text-sm text-gray-500">KM/L: {data.fuelSummary?.kmPerL || 0}</p>
            </div>
            <div className="bg-white p-4 rounded shadow">
              <h3 className="font-semibold text-gray-600">Parts Inventory</h3>
              <p className="text-2xl font-bold text-purple-600">{data.partsList.length}</p>
              <p className="text-sm text-gray-500">Value: ${totalPartsValue}</p>
            </div>
          </div>

          {/* Vehicle Reports */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Vehicle Reports</h2>
            {data.vehicles?.map(vehicle => (
              <div key={vehicle._id} className="bg-white p-6 rounded shadow">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold">{vehicle.vehicleNumber}</h3>
                    <p className="text-gray-600">{vehicle.model} ({vehicle.year}) - Mileage: {vehicle.mileage || 'N/A'}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500">Maintenance: {vehicle.maintenanceCount} records</div>
                    <div className="text-sm text-gray-500">Fuel: {vehicle.fuelCount} records</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  {/* Maintenance Section */}
                  <div>
                    <h4 className="font-semibold mb-2 text-orange-600">Maintenance Records</h4>
                    <div className="text-sm mb-2">Total Cost: ${vehicle.totalMaintenanceCost}</div>
                    <div className="max-h-48 overflow-auto">
                      {vehicle.maintenance.length > 0 ? (
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b">
                              <th className="p-1 text-left">Service</th>
                              <th className="p-1 text-left">Date</th>
                              <th className="p-1 text-left">Cost</th>
                            </tr>
                          </thead>
                          <tbody>
                            {vehicle.maintenance.map(maint => (
                              <tr key={maint._id} className="border-b">
                                <td className="p-1">{maint.serviceType}</td>
                                <td className="p-1">{maint.serviceDate ? new Date(maint.serviceDate).toLocaleDateString() : ""}</td>
                                <td className="p-1">${maint.serviceCost || 0}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      ) : (
                        <p className="text-gray-500 text-sm">No maintenance records for this period</p>
                      )}
                    </div>
                  </div>

                  {/* Fuel Section */}
                  <div>
                    <h4 className="font-semibold mb-2 text-green-600">Fuel Records</h4>
                    <div className="text-sm mb-2">Total Cost: ${vehicle.totalFuelCost}</div>
                    <div className="max-h-48 overflow-auto">
                      {vehicle.fuel.length > 0 ? (
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b">
                              <th className="p-1 text-left">Liters</th>
                              <th className="p-1 text-left">Cost</th>
                              <th className="p-1 text-left">Date</th>
                            </tr>
                          </thead>
                          <tbody>
                            {vehicle.fuel.map(fuel => (
                              <tr key={fuel._id} className="border-b">
                                <td className="p-1">{fuel.liters || 0}L</td>
                                <td className="p-1">${fuel.totalCost || 0}</td>
                                <td className="p-1">{fuel.date ? new Date(fuel.date).toLocaleDateString() : ""}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      ) : (
                        <p className="text-gray-500 text-sm">No fuel records for this period</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Parts Inventory Reports */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Parts Inventory Report</h2>
            
            {/* Parts Summary Cards */}
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded shadow">
                <h3 className="font-semibold text-gray-600">Total Parts</h3>
                <p className="text-2xl font-bold text-purple-600">{data.partsList?.length || 0}</p>
              </div>
              <div className="bg-white p-4 rounded shadow">
                <h3 className="font-semibold text-gray-600">Low Stock</h3>
                <p className="text-2xl font-bold text-yellow-600">{data.partsReport?.lowStockCount || 0}</p>
                <p className="text-sm text-gray-500">Items below threshold</p>
              </div>
              <div className="bg-white p-4 rounded shadow">
                <h3 className="font-semibold text-gray-600">Out of Stock</h3>
                <p className="text-2xl font-bold text-red-600">{data.partsReport?.outOfStockCount || 0}</p>
                <p className="text-sm text-gray-500">Items with zero stock</p>
              </div>
              <div className="bg-white p-4 rounded shadow">
                <h3 className="font-semibold text-gray-600">Inventory Value</h3>
                <p className="text-2xl font-bold text-green-600">${totalPartsValue}</p>
                <p className="text-sm text-gray-500">Total stock value</p>
              </div>
            </div>

            {/* Parts Inventory Table */}
            <div className="bg-white p-6 rounded shadow">
              <h3 className="text-lg font-semibold mb-4">Complete Parts Inventory Report</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="p-3 text-left">Part ID</th>
                      <th className="p-3 text-left">Name</th>
                      <th className="p-3 text-left">Category</th>
                      <th className="p-3 text-left">Supplier</th>
                      <th className="p-3 text-left">Stock Qty</th>
                      <th className="p-3 text-left">Min Threshold</th>
                      <th className="p-3 text-left">Unit Cost</th>
                      <th className="p-3 text-left">Total Value</th>
                      <th className="p-3 text-left">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.partsList?.map(part => {
                      const totalValue = (part.cost || 0) * (part.stockQty || 0);
                      const isLowStock = part.stockQty <= part.minThreshold;
                      const isOutOfStock = part.stockQty <= 0;
                      
                      return (
                        <tr key={part._id} className={`border-b hover:bg-gray-50 ${isOutOfStock ? 'bg-red-50' : isLowStock ? 'bg-yellow-50' : ''}`}>
                          <td className="p-3 font-mono text-xs">{part.partId}</td>
                          <td className="p-3 font-medium">{part.name}</td>
                          <td className="p-3">{part.category || 'N/A'}</td>
                          <td className="p-3">{part.supplier || 'N/A'}</td>
                          <td className="p-3">
                            <span className={`px-2 py-1 rounded text-xs ${isOutOfStock ? 'bg-red-100 text-red-800' : isLowStock ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                              {part.stockQty || 0}
                            </span>
                          </td>
                          <td className="p-3">{part.minThreshold || 0}</td>
                          <td className="p-3">${part.cost || 0}</td>
                          <td className="p-3 font-medium">${totalValue}</td>
                          <td className="p-3">
                            {isOutOfStock ? (
                              <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs">Out of Stock</span>
                            ) : isLowStock ? (
                              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs">Low Stock</span>
                            ) : (
                              <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">In Stock</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Low Stock Alerts */}
            {data.partsReport?.lowStock && data.partsReport.lowStock.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 p-4 rounded shadow">
                <h3 className="text-lg font-semibold text-yellow-800 mb-3">⚠️ Low Stock Alerts</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {data.partsReport.lowStock.map(part => (
                    <div key={part._id} className="bg-white p-3 rounded border border-yellow-200">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">{part.name}</p>
                          <p className="text-sm text-gray-600">{part.partId} - {part.category}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-yellow-700">
                            Stock: {part.stockQty} / Min: {part.minThreshold}
                          </p>
                          <p className="text-xs text-gray-500">Need to reorder</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Out of Stock Alerts */}
            {data.partsReport?.outOfStock && data.partsReport.outOfStock.length > 0 && (
              <div className="bg-red-50 border border-red-200 p-4 rounded shadow">
                <h3 className="text-lg font-semibold text-red-800 mb-3">🚨 Out of Stock Alerts</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {data.partsReport.outOfStock.map(part => (
                    <div key={part._id} className="bg-white p-3 rounded border border-red-200">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">{part.name}</p>
                          <p className="text-sm text-gray-600">{part.partId} - {part.category}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-red-700">
                            Stock: {part.stockQty} - URGENT!
                          </p>
                          <p className="text-xs text-gray-500">Immediate reorder required</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}


