/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  FileText, 
  Users, 
  MapPin, 
  TrendingUp, 
  Wrench, 
  Calendar,
  AlertOctagon,
  ArrowRight,
  TrendingDown,
  Building,
  CheckCircle,
  Clock
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { 
  SuratMasuk, 
  SuratKeluar, 
  Pegawai, 
  TransaksiKeuangan, 
  DaerahIrigasi, 
  KegiatanPembangunan
} from '../types';

interface DashboardProps {
  suratMasuk: SuratMasuk[];
  suratKeluar: SuratKeluar[];
  pegawai: Pegawai[];
  keuangan: TransaksiKeuangan[];
  daerahIrigasi: DaerahIrigasi[];
  pembangunan: KegiatanPembangunan[];
  onNavigate: (page: string, subTab?: string) => void;
}

export default function DashboardView({
  suratMasuk,
  suratKeluar,
  pegawai,
  keuangan,
  daerahIrigasi,
  pembangunan,
  onNavigate
}: DashboardProps) {
  
  // Calculations
  const totalLetters = suratMasuk.length + suratKeluar.length;
  const totalPegawai = pegawai.length;
  
  // Total Ha of Irrigated Area fungsional
  const totalAreaHa = daerahIrigasi.reduce((acc, current) => acc + current.luasFungsionalHa, 0);
  
  // Total Construction Budget & Realization
  const totalPaguConst = pembangunan.reduce((acc, curr) => acc + curr.paguAnggaran, 0);
  const totalContractConst = pembangunan.reduce((acc, curr) => acc + curr.nilaiKontrak, 0);
  
  // Calculate average physical and financial progress
  const averagePhysicalProgress = pembangunan.length > 0 
    ? Math.round(pembangunan.reduce((acc, curr) => acc + curr.progresFisikPct, 0) / pembangunan.length) 
    : 0;

  const averageFinanceProgress = pembangunan.length > 0
    ? Math.round(pembangunan.reduce((acc, curr) => acc + curr.progresKeuanganPct, 0) / pembangunan.length)
    : 0;

  // Pie Chart Data: Irrigation Area Channel Conditions (Group by names/averages)
  const averageSaluranKondisi = daerahIrigasi.length > 0 
    ? Math.round(daerahIrigasi.reduce((acc, curr) => acc + curr.kondisiSaluranPct, 0) / daerahIrigasi.length) 
    : 0;

  const chartKondisiIrigasi = [
    { name: 'Baik & Berfungsi', value: averageSaluranKondisi, color: '#14b8a6' },
    { name: 'Rusak / Butuh Rehabilitasi', value: 100 - averageSaluranKondisi, color: '#f43f5e' }
  ];

  // Bar Chart Data: Realisasi vs Pagu Keuangan dari seksi konstruksi/pembangunan
  const chartPembangunanData = pembangunan.map(p => ({
    singkatan: p.namaKegiatan.length > 25 ? p.namaKegiatan.substring(0, 22) + '...' : p.namaKegiatan,
    'Nilai Kontrak (Jt)': Math.round(p.nilaiKontrak / 1000000),
    'Pagu (Jt)': Math.round(p.paguAnggaran / 1000000)
  }));

  // Bar Chart Data: Budget absorption from Transaction ledger
  const totalExpenses = keuangan
    .filter(t => t.tipe === 'Pengeluaran')
    .reduce((acc, curr) => acc + curr.jumlah, 0);

  const totalIncomes = keuangan
    .filter(t => t.tipe === 'Pemasukan')
    .reduce((acc, curr) => acc + curr.jumlah, 0);

  // Financial transactions chart by Categories
  const financeCategories = keuangan
    .filter(t => t.tipe === 'Pengeluaran')
    .reduce((acc: { [key: string]: number }, curr) => {
      acc[curr.kategori] = (acc[curr.kategori] || 0) + curr.jumlah;
      return acc;
    }, {});

  const chartFinanceCategoryData = Object.keys(financeCategories).map(cat => ({
    name: cat,
    value: Math.round(financeCategories[cat] / 1000000) // in Millions
  }));

  const COLORS = ['#2563eb', '#16a34a', '#db2777', '#ca8a04', '#7c3aed', '#ea580c'];

  // Critical Alerts list: projects behind or damaged channels
  const alerts = [];
  pembangunan.forEach(p => {
    if (p.status === 'Konstruksi' && p.progresFisikPct < 50 && p.kendalaAtauCatatan.toLowerCase().includes('teguran')) {
      alerts.push({
        type: 'Proyek Terhambat',
        message: `${p.namaKegiatan} mendapat teguran. Progres fisik baru ${p.progresFisikPct}%`,
        severity: 'tinggi'
      });
    }
  });

  daerahIrigasi.forEach(di => {
    if (di.kondisiSaluranPct < 70) {
      alerts.push({
        type: 'Irigasi Kritis',
        message: `${di.nama} memiliki tingkat kondisi saluran rendah (${di.kondisiSaluranPct}%)`,
        severity: 'sedang'
      });
    }
  });

  return (
    <div id="dashboard-view" className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-[#111114] via-[#16161b] to-[#121216] text-white rounded-2xl p-6 border border-white/5 relative overflow-hidden select-none">
        <div className="absolute right-0 top-0 -mr-16 -mt-16 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute left-1/3 bottom-0 w-48 h-48 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none"></div>
        
        <div className="relative z-10 space-y-2">
          <span className="text-blue-400 text-[11px] font-mono tracking-wider uppercase bg-blue-500/10 border border-blue-500/20 px-3 py-1 rounded-full">
            E-Kinerja & Sumber Daya Air
          </span>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white pt-2">
            Sistem Informasi Terpadu UPTD PSDA Bah Bolon
          </h1>
          <p className="text-slate-400 text-sm max-w-2xl leading-relaxed">
            Selamat datang di portal pelayanan internal. Memudahkan pemantauan administrasi Tata Usaha, kondisi fungsional Daerah Irigasi seksi Operasi & Pemeliharaan, serta realisasi proyek seksi Pembangunan.
          </p>
          <div className="pt-2 flex flex-wrap gap-4 text-xs font-medium text-slate-400">
            <div className="flex items-center gap-1.5 bg-white/5 border border-white/5 px-3 py-1.5 rounded-lg">
              <Clock className="w-3.5 h-3.5 text-blue-400" />
              <span>Waktu Server: 2026-05-25 01:58 UTC</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/5 border border-white/5 px-3 py-1.5 rounded-lg font-mono text-slate-300">
              <span>Provinsi Sumatera Utara</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid statistics metrics cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Tata Usaha */}
        <div 
          onClick={() => onNavigate('tata-usaha', 'surat-masuk')}
          className="bg-white p-5 rounded-xl border border-gray-100 hover:border-teal-500 hover:shadow-lg transition-all cursor-pointer group flex items-start gap-4"
        >
          <div className="p-3 rounded-lg bg-teal-50 text-teal-600 group-hover:bg-teal-600 group-hover:text-white transition-all">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium">Administrasi TU</p>
            <h3 className="text-2xl font-bold text-gray-800 mt-1">{totalLetters} Surat</h3>
            <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
              <span>{suratMasuk.length} Masuk</span>
              <span className="text-gray-300">•</span>
              <span>{suratKeluar.length} Keluar</span>
            </p>
          </div>
        </div>

        {/* Card 2: Kepegawaian */}
        <div 
          onClick={() => onNavigate('tata-usaha', 'kepegawaian')}
          className="bg-white p-5 rounded-xl border border-gray-100 hover:border-teal-500 hover:shadow-lg transition-all cursor-pointer group flex items-start gap-4"
        >
          <div className="p-3 rounded-lg bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium font-sans">Sumber Daya Kepegawaian</p>
            <h3 className="text-2xl font-bold text-gray-800 mt-1">{totalPegawai} Anggota</h3>
            <p className="text-xs text-indigo-600 mt-1 flex items-center gap-1 font-medium">
              <span>{pegawai.filter(p => p.statusKepegawaian === 'PNS').length} PNS ASN</span>
              <span className="text-gray-300">•</span>
              <span>{pegawai.filter(p => p.statusKepegawaian !== 'PNS').length} Kontrak/P3A</span>
            </p>
          </div>
        </div>

        {/* Card 3: Daerah Irigasi (O&P) */}
        <div 
          onClick={() => onNavigate('seksi-op')}
          className="bg-white p-5 rounded-xl border border-gray-100 hover:border-teal-500 hover:shadow-lg transition-all cursor-pointer group flex items-start gap-4"
        >
          <div className="p-3 rounded-lg bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all">
            <MapPin className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium">Jumlah Daer. Irigasi</p>
            <h3 className="text-2xl font-bold text-gray-800 mt-1">{daerahIrigasi.length} Daerah</h3>
            <p className="text-xs text-emerald-600 mt-1 font-medium">
              Sedang Terairi: {totalAreaHa.toLocaleString('id-ID')} Ha
            </p>
          </div>
        </div>

        {/* Card 4: Seksi Pembangunan */}
        <div 
          onClick={() => onNavigate('seksi-pembangunan')}
          className="bg-white p-5 rounded-xl border border-gray-100 hover:border-teal-500 hover:shadow-lg transition-all cursor-pointer group flex items-start gap-4"
        >
          <div className="p-3 rounded-lg bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium">Kinerja Pembangunan</p>
            <h3 className="text-2xl font-bold text-gray-800 mt-1">{pembangunan.length} Pekerjaan</h3>
            <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
              <span>Fisik: {averagePhysicalProgress}%</span>
              <span className="text-gray-300">•</span>
              <span>Keuangan: {averageFinanceProgress}%</span>
            </p>
          </div>
        </div>
      </div>

      {/* Main Charts & Analytics Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Chart Column 1: Financial and Budget Absorption */}
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm lg:col-span-2 space-y-4">
          <div className="flex flex-wrap justify-between items-center gap-2 pb-2 border-b border-gray-100">
            <div>
              <h3 className="font-bold text-gray-800 text-sm flex items-center gap-1.5">
                <Building className="w-4.5 h-4.5 text-teal-600" />
                Alokasi Pagu Pekerjaan Seksi Pembangunan Infrastruktur SDA
              </h3>
              <p className="text-xs text-gray-500">Nilai Pagu Anggaran vs Nilai Kontrak Pelaksana (dalam Juta Rupiah)</p>
            </div>
            <button 
              onClick={() => onNavigate('seksi-pembangunan')} 
              className="text-xs text-teal-600 hover:text-teal-700 font-medium flex items-center gap-1 group/btn"
            >
              Lihat Laporan <ArrowRight className="w-3 h-3 group-hover/btn:translate-x-0.5 transition-transform" />
            </button>
          </div>

          <div className="h-64 mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartPembangunanData}
                margin={{ top: 10, right: 10, left: -20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="singkatan" tick={{ fontSize: 10 }} stroke="#9ca3af" />
                <YAxis tick={{ fontSize: 10 }} stroke="#9ca3af" />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #f3f4f6' }}
                  labelStyle={{ fontWeight: 'bold', fontSize: 11, color: '#374151' }}
                  itemStyle={{ fontSize: 11 }}
                />
                <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
                <Bar dataKey="Pagu (Jt)" fill="#2563eb" radius={[4, 4, 0, 0]} barSize={25} />
                <Bar dataKey="Nilai Kontrak (Jt)" fill="#0ea5e9" radius={[4, 4, 0, 0]} barSize={25} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart Column 2: O&P Jaringan Irigasi Condition rate */}
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between">
          <div>
            <div className="pb-2 border-b border-gray-100 pb-3">
              <h3 className="font-bold text-gray-800 text-sm flex items-center gap-1.5">
                <Wrench className="w-4.5 h-4.5 text-teal-600" />
                Rata-rata Kondisi Saluran Irigasi
              </h3>
              <p className="text-xs text-gray-500">Status total seluruh Daerah Irigasi Bah Bolon</p>
            </div>

            <div className="h-44 relative flex items-center justify-center mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartKondisiIrigasi}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {chartKondisiIrigasi.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value}%`} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute text-center">
                <p className="text-3xl font-extrabold text-teal-600">{averageSaluranKondisi}%</p>
                <p className="text-[10px] uppercase font-bold tracking-wider text-gray-400">Kondisi Baik</p>
              </div>
            </div>
          </div>

          <div className="space-y-2 mt-4">
            {chartKondisiIrigasi.map((entry, idx) => (
              <div key={idx} className="flex justify-between items-center text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }}></div>
                  <span className="text-gray-600 font-medium">{entry.name}</span>
                </div>
                <span className="font-bold text-gray-800">{entry.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Bottom Section 1: Dynamic Alerts & Notices (Left 1 col) */}
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm space-y-4">
          <div className="pb-2 border-b border-gray-100">
            <h3 className="font-bold text-gray-800 text-sm flex items-center gap-1.5">
              <AlertOctagon className="w-4.5 h-4.5 text-rose-500" />
              Notifikasi & Tindakan Kritis
            </h3>
            <p className="text-xs text-gray-500">Isu lapangan & koordinasi segera</p>
          </div>

          <div className="space-y-3 max-h-[260px] overflow-y-auto pr-1">
            {alerts.length > 0 ? (
              alerts.map((alert, idx) => (
                <div 
                  key={idx} 
                  className={`p-3.5 rounded-lg border flex items-start gap-2.5 text-xs ${
                    alert.severity === 'tinggi' 
                      ? 'bg-rose-50 border-rose-100 text-rose-800' 
                      : 'bg-amber-50 border-amber-100 text-amber-800'
                  }`}
                >
                  <AlertOctagon className={`w-4 h-4 shrink-0 mt-0.5 ${alert.severity === 'tinggi' ? 'text-rose-600' : 'text-amber-600'}`} />
                  <div>
                    <h5 className="font-bold uppercase tracking-wider text-[10px] mb-1">{alert.type}</h5>
                    <p className="leading-relaxed">{alert.message}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-400 text-xs">
                Tidak ada peringatan kritis. Seluruh sistem dalam kondisi normal.
              </div>
            )}
          </div>
        </div>

        {/* Bottom Section 2: Anggaran Keuangan ledger category chart */}
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm space-y-4">
          <div className="pb-2 border-b border-gray-100 flex justify-between items-center">
            <div>
              <h3 className="font-bold text-gray-800 text-sm">Distribusi Pengeluaran</h3>
              <p className="text-xs text-gray-500">Buku kas seksi Administrasi (Juta Rp)</p>
            </div>
            <span className="text-[10px] font-mono bg-teal-50 text-teal-700 px-2 py-0.5 rounded-full font-bold">
              UP: {Math.round(totalIncomes / 1000000)} Jt Drop
            </span>
          </div>

          <div className="h-44 mt-2">
            {chartFinanceCategoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartFinanceCategoryData}
                  layout="vertical"
                  margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f3f4f6" />
                  <XAxis type="number" tick={{ fontSize: 9 }} stroke="#9ca3af" />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 9 }} stroke="#9ca3af" width={80} />
                  <Tooltip formatter={(value) => `${value} Jt`} />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={12}>
                    {chartFinanceCategoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-10 text-gray-400 text-xs">Belum ada pengeluaran dicatat</div>
            )}
          </div>

          <div className="bg-gray-50 px-3 py-2 rounded-lg flex justify-between items-center text-xs text-gray-600">
            <span>Total Pengeluaran Buku Kas:</span>
            <span className="font-bold text-gray-800">Rp {totalExpenses.toLocaleString('id-ID')}</span>
          </div>
        </div>

        {/* Bottom Section 3: Kepegawaian & Jajaran Staf (Right 1 col) */}
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm space-y-4">
          <div className="pb-2 border-b border-gray-100 flex justify-between items-center">
            <div>
              <h3 className="font-bold text-gray-800 text-sm flex items-center gap-1.5">
                <Users className="w-4.5 h-4.5 text-blue-500" />
                Jajaran Pegawai & Staf
              </h3>
              <p className="text-xs text-gray-500">Status & koordinasi sdm internal</p>
            </div>
            <button 
              onClick={() => onNavigate('tata-usaha', 'kepegawaian')}
              className="text-[10px] text-blue-500 hover:underline font-bold"
            >
              Kelola
            </button>
          </div>

          <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
            {pegawai.slice(0, 4).map((item, idx) => (
              <div key={idx} className="p-2.5 rounded-lg bg-gray-50 border border-gray-100 hover:bg-white hover:border-blue-500 transition-all text-xs flex items-center justify-between gap-2">
                <div className="space-y-1">
                  <h4 className="font-bold text-gray-800 line-clamp-1">{item.nama}</h4>
                  <p className="text-[10px] text-gray-500">{item.jabatan}</p>
                  <p className="text-[10px] font-mono text-gray-400">Gol: {item.golongan || 'Non-ASN'}</p>
                </div>
                <div className="shrink-0 text-right">
                  <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${
                    item.statusKepegawaian === 'PNS' 
                      ? 'bg-blue-500/10 text-blue-400' 
                      : item.statusKepegawaian === 'PPPK' ? 'bg-indigo-500/10 text-indigo-400' : 'bg-amber-500/10 text-amber-400'
                  }`}>
                    {item.statusKepegawaian}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
