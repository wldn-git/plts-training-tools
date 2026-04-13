import { useState, useRef } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../lib/db';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Plus, Trash2, Download, Printer } from 'lucide-react';

interface QuoteItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export function QuoteGenerator() {
  const [items, setItems] = useState<QuoteItem[]>([]);
  const [customerName, setCustomerName] = useState('');
  const quoteRef = useRef<HTMLDivElement>(null);

  const panels = useLiveQuery(() => db.solarPanels.toArray());
  const inverters = useLiveQuery(() => db.inverters.toArray());

  const addItem = (desc: string, price: number, qty: number = 1) => {
    setItems(prev => {
      const existingIndex = prev.findIndex(item => item.description === desc && item.unitPrice === price);
      
      if (existingIndex !== -1) {
        const updatedItems = [...prev];
        const existingItem = updatedItems[existingIndex];
        const newQty = existingItem.quantity + qty;
        updatedItems[existingIndex] = {
          ...existingItem,
          quantity: newQty,
          total: newQty * existingItem.unitPrice
        };
        return updatedItems;
      }

      const newItem: QuoteItem = {
        id: Math.random().toString(36).substr(2, 9),
        description: desc,
        quantity: qty,
        unitPrice: price,
        total: price * qty
      };
      return [...prev, newItem];
    });
  };

  const removeItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const updateQty = (id: string, qty: number) => {
    setItems(prev => prev.map(it =>
      it.id === id ? { ...it, quantity: qty, total: qty * it.unitPrice } : it
    ));
  };

  const grandTotal = items.reduce((acc, item) => acc + item.total, 0);
  const ppn = grandTotal * 0.11;
  const totalAkhir = grandTotal + ppn;

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);

  const refNo = `QTN-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

  const handlePrint = () => {
    const printContent = quoteRef.current?.innerHTML;
    if (!printContent) return;
    const win = window.open('', '_blank', 'width=900,height=700');
    win?.document.write(`
      <html><head>
        <title>Quotation - PLTS Training Tools</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; color: #111; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th { background: #f3f4f6; padding: 8px; text-align: left; font-size: 12px; }
          td { padding: 8px; border-bottom: 1px solid #e5e7eb; font-size: 12px; }
          .total-row td { font-weight: bold; border-top: 2px solid #111; }
          .header { display: flex; justify-content: space-between; margin-bottom: 30px; }
          .grand-total { color: #2563eb; font-size: 18px; }
          .footer { margin-top: 60px; display: grid; grid-template-columns: 1fr 1fr; gap: 20px; font-size: 11px; color: #6b7280; }
          .signature { text-align: center; border-top: 1px solid #e5e7eb; padding-top: 8px; font-weight: bold; color: #374151; }
        </style>
      </head><body>
        ${printContent}
      </body></html>
    `);
    win?.document.close();
    win?.print();
  };

  const handleExportPDF = () => {
    // Trigger browser's save-as-PDF via print dialog
    handlePrint();
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Quote Generator</h2>
          <p className="text-gray-600 mt-1">Buat penawaran harga profesional dalam hitungan detik.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePrint} disabled={items.length === 0}>
            <Printer className="h-4 w-4 mr-2" /> Print
          </Button>
          <Button className="bg-blue-600" onClick={handleExportPDF} disabled={items.length === 0}>
            <Download className="h-4 w-4 mr-2" /> Export PDF
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Component Picker */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm uppercase text-gray-400">Pilih Komponen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase block mb-2">Panel Surya</label>
                <div className="space-y-2">
                  {panels?.map(p => (
                    <button
                      key={p.id}
                      onClick={() => addItem(`${p.brand} ${p.model} ${p.power}Wp`, p.price)}
                      className="w-full text-left p-2 text-xs border rounded hover:bg-blue-50 transition-colors flex justify-between items-center"
                    >
                      <span>{p.brand} {p.power}Wp</span>
                      <Plus className="h-3 w-3 text-blue-500" />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase block mb-2">Inverter</label>
                <div className="space-y-2">
                  {inverters?.map(i => (
                    <button
                      key={i.id}
                      onClick={() => addItem(`${i.brand} ${i.model} ${i.power}W`, i.price)}
                      className="w-full text-left p-2 text-xs border rounded hover:bg-green-50 transition-colors flex justify-between items-center"
                    >
                      <span>{i.brand} {i.power}W</span>
                      <Plus className="h-3 w-3 text-green-500" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="border-t pt-4 space-y-2">
                <label className="text-[10px] font-bold text-gray-500 uppercase block">Biaya Jasa</label>
                <button
                  onClick={() => addItem('Biaya Instalasi & Jasa', 1500000)}
                  className="w-full text-left p-2 text-xs border rounded hover:bg-orange-50 transition-colors flex justify-between items-center"
                >
                  <span>Biaya Instalasi & Jasa</span>
                  <Plus className="h-3 w-3 text-orange-500" />
                </button>
                <button
                  onClick={() => addItem('Biaya Survey Lokasi', 500000)}
                  className="w-full text-left p-2 text-xs border rounded hover:bg-orange-50 transition-colors flex justify-between items-center"
                >
                  <span>Biaya Survey Lokasi</span>
                  <Plus className="h-3 w-3 text-orange-500" />
                </button>
                <button
                  onClick={() => addItem('Material Kabel & Instalasi', 800000)}
                  className="w-full text-left p-2 text-xs border rounded hover:bg-orange-50 transition-colors flex justify-between items-center"
                >
                  <span>Material Kabel & Panel AC/DC</span>
                  <Plus className="h-3 w-3 text-orange-500" />
                </button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quote Document */}
        <div className="lg:col-span-2">
          <Card className="border-none shadow-2xl overflow-hidden">
            <div className="h-2 bg-blue-600"></div>
            <div ref={quoteRef}>
              <CardHeader className="bg-white pb-0">
                <div className="header flex justify-between items-start">
                  <div>
                    <CardTitle className="text-2xl font-black text-gray-800 tracking-tighter">QUOTATION</CardTitle>
                    <CardDescription>Ref: {refNo}</CardDescription>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-blue-600">PLTS Training Tools</div>
                    <div className="text-[10px] text-gray-400">Indonesia Energy Solutions</div>
                  </div>
                </div>

                <div className="mt-8 grid grid-cols-2 gap-8">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Kepada Yth:</label>
                    <Input
                      placeholder="Nama Pelanggan / Perusahaan"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="h-8 border-none bg-gray-50 font-bold"
                    />
                  </div>
                  <div className="text-right space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Tanggal:</label>
                    <div className="text-sm font-medium">{new Date().toLocaleDateString('id-ID', { dateStyle: 'long' })}</div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-8">
                <Table>
                  <TableHeader className="bg-gray-50">
                    <TableRow>
                      <TableHead className="w-[45%]">Deskripsi Komponen</TableHead>
                      <TableHead className="w-16">Qty</TableHead>
                      <TableHead>Harga Satuan</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead className="w-8 print:hidden"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium text-gray-700">{item.description}</TableCell>
                        <TableCell>
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updateQty(item.id, parseInt(e.target.value) || 1)}
                            className="w-12 bg-transparent focus:outline-none focus:ring-1 focus:ring-blue-100 rounded text-center"
                          />
                        </TableCell>
                        <TableCell className="text-xs">{formatCurrency(item.unitPrice)}</TableCell>
                        <TableCell className="text-right font-bold">{formatCurrency(item.total)}</TableCell>
                        <TableCell className="print:hidden">
                          <button onClick={() => removeItem(item.id)} className="text-red-400 hover:text-red-600 transition-colors">
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {items.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-10 text-gray-300 italic">
                          Daftar belanja masih kosong. Pilih komponen di panel kiri.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>

                <div className="mt-8 flex justify-end">
                  <div className="w-72 space-y-2">
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>Subtotal</span>
                      <span>{formatCurrency(grandTotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>PPN (11%)</span>
                      <span>{formatCurrency(ppn)}</span>
                    </div>
                    <div className="flex justify-between pt-3 border-t-2 border-gray-800">
                      <span className="font-black text-gray-800 text-base">TOTAL AKHIR</span>
                      <span className="font-black text-blue-600 text-xl">{formatCurrency(totalAkhir)}</span>
                    </div>
                  </div>
                </div>

                <div className="footer mt-12 pt-8 border-t border-dashed border-gray-200 grid grid-cols-2 gap-4">
                  <div className="text-[10px] text-gray-400 leading-relaxed italic">
                    * Penawaran berlaku selama 14 hari sejak tanggal terbit.<br />
                    * Harga sudah termasuk estimasi PPN 11%.<br />
                    * Biaya pengiriman dihitung terpisah berdasarkan lokasi.<br />
                    * Garansi sesuai dengan ketentuan produsen masing-masing.
                  </div>
                  <div className="text-center space-y-16">
                    <div className="text-[10px] font-bold text-gray-400">Hormat Kami,</div>
                    <div className="signature border-t border-gray-200 pt-1 text-xs font-bold text-gray-700">
                      PLTS Training Tools Admin
                    </div>
                  </div>
                </div>
              </CardContent>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
