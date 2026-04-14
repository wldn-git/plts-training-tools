import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { calculateROI, type ROIInput, type ROIOutput } from '../../lib/calculations/roi';
import { pshData } from '../../lib/data/pshData';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Slider } from '../ui/slider';
import { Button } from '../ui/button';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  Title, 
  Tooltip, 
  Legend,
  Filler 
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { 
  TrendingUp, Calendar,
  Percent, Save,
  DollarSign, Download
} from 'lucide-react';
import { SaveToProjectDialog } from '../ui/save-to-project-dialog';
import { exportROIToPDF } from '../../lib/utils/pdfExport';
import { FileText } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export function ROICalculator() {
  const [input, setInput] = useState<ROIInput>({
    investment: 24000000,
    systemCapacity: 2,
    psh: 4.5,
    tarif: 1444,
    escalationRate: 5,
    degradationRate: 0.5,
    selfConsumptionRatio: 80,
    exportCredit: 65,
    years: 25
  });

  const location = useLocation();

  useEffect(() => {
    if (location.state) {
      const { investment, capacity, tariff } = location.state;
      setInput(prev => ({
        ...prev,
        investment: investment || prev.investment,
        systemCapacity: capacity || prev.systemCapacity,
        tarif: tariff || prev.tarif
      }));
    }
  }, [location.state]);

  const [result, setResult] = useState<ROIOutput | null>(null);
  const [showSaveDialog, setShowSaveDialog] = useState(false);

  useEffect(() => {
    const output = calculateROI(input);
    setResult(output);
  }, [input]);

  const exportToCSV = () => {
    if (!result) return;
    
    const headers = ['Tahun', 'Tarif PLN (Rp/kWh)', 'Produksi (kWh)', 'Tabungan/Tahun (Rp)', 'Kumulatif (Rp)', 'Net (Rp)'];
    const rows = result.yearlyData.map(d => [
      d.year,
      d.tarif,
      d.production.toFixed(0),
      d.annualSaving.toFixed(0),
      d.cumulative.toFixed(0),
      d.net.toFixed(0),
    ]);
    
    const csvContent = [
      ['PLTS Training Tools - ROI Analysis'],
      [`Kapasitas Sistem: ${input.systemCapacity} kWp`],
      [`Investasi Awal: Rp ${input.investment.toLocaleString('id-ID')}`],
      [`Break-even: ${result.paybackPeriod} Tahun`],
      [`Total Tabungan 25 Thn: Rp ${result.totalSavings.toLocaleString('id-ID')}`],
      [],
      headers,
      ...rows,
    ]
      .map(row => row.join(','))
      .join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ROI_PLTS_${input.systemCapacity}kWp_${new Date().getFullYear()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const chartData = result ? {
    labels: result.yearlyData.map(d => `Tahun ${d.year}`),
    datasets: [
      {
        label: 'Investasi Awal',
        data: Array(result.yearlyData.length).fill(-input.investment),
        borderColor: '#E24B4A',
        backgroundColor: 'rgba(226, 75, 74, 0.1)',
        borderWidth: 2,
        borderDash: [5, 5],
        pointRadius: 0,
        fill: false
      },
      {
        label: 'Kumulatif Net Saving',
        data: result.yearlyData.map(d => d.net),
        borderColor: '#1D9E75',
        backgroundColor: 'rgba(29, 158, 117, 0.1)',
        borderWidth: 3,
        pointRadius: 0,
        fill: true,
        tension: 0.1
      },
      {
        label: 'Break-even (Rp 0)',
        data: Array(result.yearlyData.length).fill(0),
        borderColor: '#888780',
        borderWidth: 1,
        borderDash: [3, 3],
        pointRadius: 0,
        fill: false
      }
    ]
  } : null;

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: 'index' as const
    },
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const value = context.parsed.y;
            const label = context.dataset.label;
            return `${label}: Rp ${(value/1000000).toFixed(1)} jt`;
          }
        }
      }
    },
    scales: {
      y: {
        ticks: {
          callback: function(value: any) {
            return `Rp ${(value/1000000).toFixed(0)} jt`;
          }
        },
        grid: {
          color: 'rgba(0,0,0,0.05)'
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Kalkulator ROI</h2>
        <p className="text-gray-600 mt-1">
          Hitung Return on Investment untuk sistem PLTS Anda
        </p>
      </div>

      {/* Summary Cards */}
      {result && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Investasi Awal</p>
                  <p className="text-2xl font-bold mt-1">
                    Rp {(input.investment/1000000).toFixed(0)} jt
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Break-even</p>
                  <p className="text-2xl font-bold mt-1 text-green-600">
                    {result.paybackPeriod} tahun
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">ROI 25 Tahun</p>
                  <p className="text-2xl font-bold mt-1 text-blue-600">
                    {result.roi}%
                  </p>
                </div>
                <Percent className="h-8 w-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Tabungan</p>
                  <p className="text-2xl font-bold mt-1 text-green-600">
                    Rp {(result.totalSavings/1000000).toFixed(0)} jt
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-400" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {result && (
        <div className="flex justify-end gap-3">
          <Button 
            variant="outline"
            onClick={() => exportROIToPDF(input, result)}
            className="border-blue-200 text-blue-700 hover:bg-blue-50"
          >
            <FileText className="h-4 w-4 mr-2" /> Cetak PDF
          </Button>
          <Button 
            onClick={() => setShowSaveDialog(true)}
            className="bg-blue-600"
          >
            <Save className="h-4 w-4 mr-2" /> Simpan ke Portfolio
          </Button>
        </div>
      )}

      {result && (
        <SaveToProjectDialog
          open={showSaveDialog}
          onClose={() => setShowSaveDialog(false)}
          sourceLabel={`ROI PLTS ${input.systemCapacity}kWp`}
          projectData={{
            systemType: 'ON_GRID',
            capacity: input.systemCapacity,
            numPanels: Math.ceil((input.systemCapacity * 1000) / 520),
            investment: input.investment,
            roiYears: result.paybackPeriod,
            annualSaving: result.yearlyData[0]?.annualSaving || 0,
          }}
        />
      )}

      {/* Input Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Parameter Input</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Investasi (Rp)</Label>
              <Input
                type="number"
                value={input.investment}
                onChange={(e) => setInput({...input, investment: parseInt(e.target.value)})}
              />
            </div>

            <div className="space-y-2">
              <Label>Kapasitas Sistem (kWp)</Label>
              <Input
                type="number"
                step="0.1"
                value={input.systemCapacity}
                onChange={(e) => setInput({...input, systemCapacity: parseFloat(e.target.value)})}
              />
            </div>

            <div className="space-y-2">
              <Label>Lokasi (PSH)</Label>
              <Select 
                value={input.psh.toString()}
                onValueChange={(val: string) => setInput({...input, psh: parseFloat(val)})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {pshData.map(prov => (
                    <SelectItem key={prov.province} value={prov.avgPsh.toString()}>
                      {prov.province} ({prov.avgPsh} PSH)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Tarif PLN (Rp/kWh)</Label>
              <Input
                type="number"
                value={input.tarif}
                onChange={(e) => setInput({...input, tarif: parseInt(e.target.value)})}
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Kenaikan Tarif/Tahun</Label>
                <span className="text-sm font-medium">{input.escalationRate}%</span>
              </div>
              <Slider
                value={[input.escalationRate]}
                onValueChange={(val: number[]) => setInput({...input, escalationRate: val[0]})}
                min={0}
                max={15}
                step={1}
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Degradasi Panel/Tahun</Label>
                <span className="text-sm font-medium">{input.degradationRate}%</span>
              </div>
              <Slider
                value={[input.degradationRate * 10]}
                onValueChange={(val: number[]) => setInput({...input, degradationRate: val[0] / 10})}
                min={0}
                max={10}
                step={1}
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Konsumsi Sendiri</Label>
                <span className="text-sm font-medium">{input.selfConsumptionRatio}%</span>
              </div>
              <Slider
                value={[input.selfConsumptionRatio]}
                onValueChange={(val: number[]) => setInput({...input, selfConsumptionRatio: val[0]})}
                min={0}
                max={100}
                step={5}
              />
            </div>
          </CardContent>
        </Card>

        {/* Chart Section */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Proyeksi ROI</CardTitle>
          </CardHeader>
          <CardContent>
            {chartData && (
              <div style={{ height: '400px' }}>
                <Line data={chartData} options={chartOptions} />
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Yearly Breakdown Table */}
      {result && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Detail Per Tahun</CardTitle>
              <Button variant="outline" size="sm" onClick={exportToCSV}>
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b">
                  <tr>
                    <th className="text-left p-2">Tahun</th>
                    <th className="text-right p-2">Tarif PLN</th>
                    <th className="text-right p-2">Produksi (kWh)</th>
                    <th className="text-right p-2">Tabungan/Tahun</th>
                    <th className="text-right p-2">Kumulatif</th>
                    <th className="text-right p-2">Net</th>
                  </tr>
                </thead>
                <tbody>
                  {result.yearlyData
                    .filter(d => [1, 3, 5, 7, 10, 15, 20, 25].includes(d.year))
                    .map(data => {
                      const isBreakEven = data.net >= 0 && 
                        (data.year === 1 || result.yearlyData[data.year - 2].net < 0);
                      
                      return (
                        <tr 
                          key={data.year} 
                          className={`border-b ${isBreakEven ? 'bg-green-50' : ''}`}
                        >
                          <td className="p-2 font-medium">{data.year}</td>
                          <td className="p-2 text-right">
                            Rp {data.tarif.toLocaleString('id-ID')}
                          </td>
                          <td className="p-2 text-right">
                            {data.production.toLocaleString('id-ID')}
                          </td>
                          <td className="p-2 text-right">
                            Rp {(data.annualSaving/1000000).toFixed(1)} jt
                          </td>
                          <td className="p-2 text-right">
                            Rp {(data.cumulative/1000000).toFixed(1)} jt
                          </td>
                          <td className={`p-2 text-right font-semibold ${
                            data.net >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {data.net >= 0 ? '+' : ''}Rp {(data.net/1000000).toFixed(1)} jt
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
