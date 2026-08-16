import { jsPDF } from 'jspdf';
import type { ROIInput, ROIOutput } from '../calculations/roi';

export const exportROIToPDF = (input: ROIInput, result: ROIOutput) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Header
  doc.setFillColor(30, 58, 138); // Dark blue
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('LAPORAN ANALISIS ROI PLTS', 20, 25);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Dicetak pada: ${new Date().toLocaleDateString('id-ID')}`, pageWidth - 70, 25);

  // Summary Box
  doc.setFillColor(243, 244, 246);
  doc.rect(15, 50, pageWidth - 30, 45, 'F');
  
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('RINGKASAN PROYEKSI', 20, 60);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Kapasitas Sistem: ${input.systemCapacity} kWp`, 25, 70);
  doc.text(`Investasi Awal: Rp ${input.investment.toLocaleString('id-ID')}`, 25, 75);
  doc.text(`Lokasi (PSH): ${input.psh} jam/hari`, 25, 80);
  
  doc.setFont('helvetica', 'bold');
  doc.text(`Break-even Point: ${result.paybackPeriod} Tahun`, 120, 70);
  doc.text(`Total Tabungan 25 Thn: Rp ${result.totalSavings.toLocaleString('id-ID')}`, 120, 75);
  doc.text(`ROI Estimasi: ${result.roi}%`, 120, 80);

  // Table Header
  const tableY = 110;
  doc.setFillColor(229, 231, 235);
  doc.rect(15, tableY, pageWidth - 30, 8, 'F');
  
  doc.setFontSize(9);
  doc.text('Tahun', 20, tableY + 6);
  doc.text('Tarif (Rp/kWh)', 40, tableY + 6);
  doc.text('Produksi (kWh)', 80, tableY + 6);
  doc.text('Tabungan/Thn (Rp)', 120, tableY + 6);
  doc.text('Net Cashflow (Rp)', 160, tableY + 6);

  // Table Content
  let y = tableY + 15;
  result.yearlyData.forEach((row) => {
    // Show only every 5 years to save space, or all if enough space
    if (row.year % 2 === 0 || row.year === 1 || row.year === 25) {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      
      doc.setFont('helvetica', 'normal');
      doc.text(row.year.toString(), 20, y);
      doc.text(row.tarif.toLocaleString('id-ID'), 40, y);
      doc.text(Math.round(row.production).toLocaleString('id-ID'), 80, y);
      doc.text(Math.round(row.annualSaving).toLocaleString('id-ID'), 120, y);
      
      if (row.net < 0) doc.setTextColor(220, 38, 38);
      else doc.setTextColor(22, 163, 74);
      
      doc.text(Math.round(row.net).toLocaleString('id-ID'), 160, y);
      doc.setTextColor(0, 0, 0);
      
      y += 8;
    }
  });

  // Footer
  const footerY = doc.internal.pageSize.getHeight() - 20;
  doc.setFontSize(8);
  doc.setTextColor(156, 163, 175);
  doc.text('Dibuat secara otomatis oleh PLTS Training Tools - WLDN Soft', pageWidth / 2, footerY, { align: 'center' });

  doc.save(`Laporan_ROI_PLTS_${input.systemCapacity}kWp.pdf`);
};

export const exportPVSizingToPDF = (
  input: { billAmount: number; tariff: number; systemType: string },
  result: {
    actualKwp: number;
    numPanels: number;
    roofArea: number;
    estimatedCost: number;
    monthlySaving: number;
    pricePerKwp: number;
    numBatteries?: number;
    batteryRequiredKwh?: number;
  },
  panelName: string,
  batteryName?: string
) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Header
  doc.setFillColor(37, 99, 235); // Blue
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('REKOMENDASI SISTEM PLTS (PV SIZING)', 20, 25);
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Tanggal: ${new Date().toLocaleDateString('id-ID')}`, pageWidth - 70, 25);

  // Input Parameter Box
  doc.setFillColor(243, 244, 246);
  doc.rect(15, 50, pageWidth - 30, 35, 'F');
  
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('PARAMETER BEBAN & SISTEM', 20, 58);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Tagihan Bulanan: Rp ${input.billAmount.toLocaleString('id-ID')}`, 25, 68);
  doc.text(`Tarif PLN: Rp ${input.tariff}/kWh`, 25, 75);
  
  doc.text(`Tipe Sistem: ${input.systemType}`, 120, 68);
  doc.text(`Model Panel: ${panelName}`, 120, 75);

  // Results Section
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('SPESIFIKASI HASIL PERHITUNGAN', 20, 98);

  const resultsList = [
    { label: 'Kapasitas Sistem (kWp)', val: `${result.actualKwp.toLocaleString('id-ID')} kWp` },
    { label: 'Jumlah Modul Panel', val: `${result.numPanels} Modul` },
    { label: 'Kebutuhan Luas Atap', val: `${result.roofArea.toLocaleString('id-ID')} m²` },
    { label: 'Estimasi Total Investasi', val: `Rp ${Math.round(result.estimatedCost).toLocaleString('id-ID')}` },
    { label: 'Estimasi Penghematan / Bulan', val: `± Rp ${Math.round(result.monthlySaving).toLocaleString('id-ID')}` },
    { label: 'Harga per kWp', val: `Rp ${Math.round(result.pricePerKwp).toLocaleString('id-ID')} / kWp` }
  ];

  if (result.numBatteries) {
    resultsList.push({ label: 'Model Baterai', val: batteryName || 'Standard' });
    resultsList.push({ label: 'Kebutuhan Baterai', val: `${result.numBatteries} Unit (±${result.batteryRequiredKwh?.toFixed(1)} kWh)` });
  }

  let y = 108;
  resultsList.forEach((item, idx) => {
    doc.setFillColor(idx % 2 === 0 ? 249 : 255, idx % 2 === 0 ? 250 : 255, idx % 2 === 0 ? 251 : 255);
    doc.rect(15, y - 5, pageWidth - 30, 9, 'F');
    doc.setFont('helvetica', 'normal');
    doc.text(item.label, 20, y + 1);
    doc.setFont('helvetica', 'bold');
    doc.text(item.val, 130, y + 1);
    y += 10;
  });

  // Disclaimer / Note Box
  y += 10;
  doc.setFillColor(254, 243, 199); // Amber
  doc.rect(15, y, pageWidth - 30, 25, 'F');
  doc.setTextColor(146, 64, 14);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('CATATAN TEKNIS:', 20, y + 8);
  doc.setFont('helvetica', 'normal');
  doc.text('Perhitungan di atas merupakan estimasi awal berdasarkan tarif PLN dan radiasi rata-rata.', 20, y + 14);
  doc.text('Lakukan survey lokasi nyata untuk kepastian tata letak, shading, dan kapasitas struktur atap.', 20, y + 20);

  // Footer
  const footerY = doc.internal.pageSize.getHeight() - 15;
  doc.setFontSize(8);
  doc.setTextColor(156, 163, 175);
  doc.text('Dibuat secara otomatis oleh PLTS Training Tools - WLDN Soft', pageWidth / 2, footerY, { align: 'center' });

  doc.save(`Rekomendasi_PLTS_${result.actualKwp}kWp.pdf`);
};

