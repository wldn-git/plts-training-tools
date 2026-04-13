import { jsPDF } from 'jspdf';
import { ROIInput, ROIOutput } from '../calculations/roi';

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
  result.yearlyData.forEach((row, index) => {
    // Show only every 5 years to save space, or all if enough space
    if (row.year % 2 === 0 || row.year === 1 || row.year === 25) {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      
      doc.setFont('helvetica', 'normal');
      doc.text(row.year.toString(), 20, y);
      doc.text(row.tarif.toLocaleString('id-ID'), 40, y);
      doc.text(row.production.toFixed(0).toLocaleString('id-ID'), 80, y);
      doc.text(row.annualSaving.toFixed(0).toLocaleString('id-ID'), 120, y);
      
      if (row.net < 0) doc.setTextColor(220, 38, 38);
      else doc.setTextColor(22, 163, 74);
      
      doc.text(row.net.toFixed(0).toLocaleString('id-ID'), 160, y);
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
