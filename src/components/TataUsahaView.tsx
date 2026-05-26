/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Inbox, 
  Send, 
  Users, 
  Wallet, 
  HardDrive, 
  Calendar,
  Search,
  Filter,
  Plus,
  Trash2,
  Edit3,
  CheckCircle,
  Clock,
  AlertTriangle,
  FileText,
  UserCheck,
  TrendingDown,
  Building,
  CheckSquare,
  Bookmark,
  Eye,
  BookOpen,
  Award,
  Info,
  X,
  ChevronRight,
  GraduationCap,
  Briefcase,
  Cake,
  CalendarDays,
  ArrowUpRight,
  PieChart as LucidePieChart,
  BarChart2,
  TrendingUp as LucideTrendingUp
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
  Aset, 
  ProfilKantor
} from '../types';

interface TataUsahaViewProps {
  profil: ProfilKantor;
  
  suratMasuk: SuratMasuk[];
  onAddSuratMasuk: (item: SuratMasuk) => void;
  onEditSuratMasuk: (item: SuratMasuk) => void;
  onDeleteSuratMasuk: (id: string) => void;
  
  suratKeluar: SuratKeluar[];
  onAddSuratKeluar: (item: SuratKeluar) => void;
  onEditSuratKeluar: (item: SuratKeluar) => void;
  onDeleteSuratKeluar: (id: string) => void;

  pegawai: Pegawai[];
  onAddPegawai: (item: Pegawai) => void;
  onEditPegawai: (item: Pegawai) => void;
  onDeletePegawai: (id: string) => void;

  keuangan: TransaksiKeuangan[];
  onAddKeuangan: (item: TransaksiKeuangan) => void;
  onEditKeuangan: (item: TransaksiKeuangan) => void;
  onDeleteKeuangan: (id: string) => void;

  aset: Aset[];
  onAddAset: (item: Aset) => void;
  onEditAset: (item: Aset) => void;
  onDeleteAset: (id: string) => void;
  
  initialSubTab?: string;
  canInput?: boolean;
  allowedSubTabs?: string[];
}

export default function TataUsahaView({
  profil,
  suratMasuk,
  onAddSuratMasuk,
  onEditSuratMasuk,
  onDeleteSuratMasuk,
  suratKeluar,
  onAddSuratKeluar,
  onEditSuratKeluar,
  onDeleteSuratKeluar,
  pegawai,
  onAddPegawai,
  onEditPegawai,
  onDeletePegawai,
  keuangan,
  onAddKeuangan,
  onEditKeuangan,
  onDeleteKeuangan,
  aset,
  onAddAset,
  onEditAset,
  onDeleteAset,
  initialSubTab = 'persuratan',
  canInput = true,
  allowedSubTabs
}: TataUsahaViewProps) {
  
  const [activeSubTab, setActiveSubTab] = useState(() => {
    if (allowedSubTabs && allowedSubTabs.length > 0) {
      return allowedSubTabs[0];
    }
    return initialSubTab;
  });

  // Common Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCriteria, setFilterCriteria] = useState('all');

  // Modal control
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);

  // Unified Delete Confirmation State
  const [deleteConfirm, setDeleteConfirm] = useState<{
    id: string;
    name: string;
    type: 'surat-masuk' | 'surat-keluar' | 'pegawai' | 'keuangan' | 'aset';
  } | null>(null);

  // Selected details simulation
  const [selectedLetterId, setSelectedLetterId] = useState<string>(suratMasuk[0]?.id || '');
  const selectedLetter = suratMasuk.find(sm => sm.id === selectedLetterId) || suratMasuk[0];

  // Combined Persuratan inner Tab
  const [activePersuratanTab, setActivePersuratanTab] = useState<'surat-masuk' | 'surat-keluar'>('surat-masuk');

  // KIB Category Filter
  const [kibFilter, setKibFilter] = useState<string>('Semua');

  // Specific Form states
  const [formSuratMasuk, setFormSuratMasuk] = useState<Partial<SuratMasuk>>({});
  const [formSuratKeluar, setFormSuratKeluar] = useState<Partial<SuratKeluar>>({});
  const [formPegawai, setFormPegawai] = useState<Partial<Pegawai>>({});
  const [formKeuangan, setFormKeuangan] = useState<Partial<TransaksiKeuangan>>({});
  const [formAset, setFormAset] = useState<Partial<Aset>>({});

  // Employee detail and inner form tab states
  const [selectedPegawaiDetail, setSelectedPegawaiDetail] = useState<Pegawai | null>(null);
  const [formKepegawaianTab, setFormKepegawaianTab] = useState<'profil_dasar' | 'profil_pribadi' | 'pendidikan' | 'kepegawaian'>('profil_dasar');
  const [showHRDashboard, setShowHRDashboard] = useState(true);

  // --- ANALISIS KEPEGAWAIAN PROSESOR (REAL-TIME) ---
  const CURRENT_DATE = new Date('2026-05-25');

  const getBirthDateOfPegawai = (p: Pegawai): Date | null => {
    if (p.tanggalLahir && p.tanggalLahir.trim() !== '') {
      const d = new Date(p.tanggalLahir);
      if (!isNaN(d.getTime())) return d;
    }
    if (p.nip && p.nip.trim() !== '') {
      const cleanNip = p.nip.replace(/\s+/g, '');
      if (/^\d{18}$/.test(cleanNip)) {
        const yearStr = cleanNip.substring(0, 4);
        const monthStr = cleanNip.substring(4, 6);
        const dayStr = cleanNip.substring(6, 8);
        const d = new Date(`${yearStr}-${monthStr}-${dayStr}`);
        if (!isNaN(d.getTime())) return d;
      }
    }
    return null;
  };

  // 1. Pensiun (Masa pensiun 58 Tahun)
  const listPensiun = pegawai
    .map(p => {
      const birthDate = getBirthDateOfPegawai(p);
      if (!birthDate) return null;

      const pensionDate = new Date(birthDate);
      pensionDate.setFullYear(birthDate.getFullYear() + 58);

      const diffTime = pensionDate.getTime() - CURRENT_DATE.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      const rawAgeYears = CURRENT_DATE.getFullYear() - birthDate.getFullYear();
      let age = rawAgeYears;
      const mDiff = CURRENT_DATE.getMonth() - birthDate.getMonth();
      if (mDiff < 0 || (mDiff === 0 && CURRENT_DATE.getDate() < birthDate.getDate())) {
        age--;
      }

      return {
        pegawai: p,
        birthDate,
        pensionDate,
        diffDays,
        age,
        yearsRemaining: (diffDays / 365.25).toFixed(1)
      };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null && x.diffDays <= 2 * 365.25)
    .sort((a, b) => a.diffDays - b.diffDays);

  // 2. Kenaikan Pangkat (SK pangkat terakhir + 4)
  const listNaikPangkat = pegawai
    .map(p => {
      if (!p.riwayatKepegawaianDetail || p.riwayatKepegawaianDetail.length === 0) return null;
      const validEntries = p.riwayatKepegawaianDetail.filter(car => car.tanggalSkPangkat && car.tanggalSkPangkat.trim() !== '');
      if (validEntries.length === 0) return null;

      const sorted = [...validEntries].sort((a,b) => new Date(b.tanggalSkPangkat).getTime() - new Date(a.tanggalSkPangkat).getTime());
      const latestSk = sorted[0];
      const latestDate = new Date(latestSk.tanggalSkPangkat);

      const targetDate = new Date(latestDate);
      targetDate.setFullYear(latestDate.getFullYear() + 4);

      const diffTime = targetDate.getTime() - CURRENT_DATE.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      return {
        pegawai: p,
        latestDate,
        latestSkNumber: latestSk.skPangkat,
        targetDate,
        diffDays,
        yearsRemaining: (diffDays / 365.25).toFixed(1)
      };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null && x.diffDays <= 365.25)
    .sort((a, b) => a.diffDays - b.diffDays);

  // 3. Kenaikan Gaji Berkala (SK KGB terakhir + 2)
  const listKgb = pegawai
    .map(p => {
      if (!p.riwayatKepegawaianDetail || p.riwayatKepegawaianDetail.length === 0) return null;
      const validEntries = p.riwayatKepegawaianDetail.filter(car => car.tanggalSkGajiBerkala && car.tanggalSkGajiBerkala.trim() !== '');
      if (validEntries.length === 0) return null;

      const sorted = [...validEntries].sort((a,b) => new Date(b.tanggalSkGajiBerkala).getTime() - new Date(a.tanggalSkGajiBerkala).getTime());
      const latestSk = sorted[0];
      const latestDate = new Date(latestSk.tanggalSkGajiBerkala);

      const targetDate = new Date(latestDate);
      targetDate.setFullYear(latestDate.getFullYear() + 2);

      const diffTime = targetDate.getTime() - CURRENT_DATE.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      return {
        pegawai: p,
        latestDate,
        latestSkNumber: latestSk.skGajiBerkala,
        targetDate,
        diffDays,
        monthsRemaining: (diffDays / 30.4).toFixed(1)
      };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null && x.diffDays <= 365.25)
    .sort((a, b) => a.diffDays - b.diffDays);

  // --- ACCRUED CHARTS PREPARATION ---
  const statusCounts = pegawai.reduce((acc: any, p) => {
    const s = p.statusKepegawaian || 'Lainnya';
    acc[s] = (acc[s] || 0) + 1;
    return acc;
  }, {});
  const statusChartData = [
    { name: 'PNS', jumlah: statusCounts['PNS'] || 0, fill: '#0ea5e9' },
    { name: 'PPPK', jumlah: statusCounts['PPPK'] || 0, fill: '#6366f1' },
    { name: 'Honorer', jumlah: statusCounts['Honorer'] || 0, fill: '#f59e0b' },
    { name: 'Tenaga Kontrak', jumlah: statusCounts['Tenaga Kontrak O&P'] || 0, fill: '#14b8a6' },
  ];

  const genderCounts = pegawai.reduce((acc: any, p) => {
    const g = p.jenisKelamin || 'Belum Diisi';
    acc[g] = (acc[g] || 0) + 1;
    return acc;
  }, {});
  const genderChartData = [
    { name: 'Laki-laki', value: genderCounts['Laki-laki'] || 0, color: '#0d9488' },
    { name: 'Perempuan', value: genderCounts['Perempuan'] || 0, color: '#ec4899' },
  ].filter(x => x.value > 0);

  const religionCounts = pegawai.reduce((acc: any, p) => {
    const religions = p.agama || 'Belum Diisi';
    acc[religions] = (acc[religions] || 0) + 1;
    return acc;
  }, {});
  const religionChartData = Object.keys(religionCounts).map((key, idx) => {
    const colors = ['#0f766e', '#2563eb', '#4f46e5', '#ca8a04', '#9333ea', '#db2777', '#4b5563'];
    return {
      name: key,
      value: religionCounts[key],
      color: colors[idx % colors.length]
    };
  });

  // Reset search on tab change
  const handleTabChange = (tab: string) => {
    setActiveSubTab(tab);
    setSearchTerm('');
    setFilterCriteria('all');
    setKibFilter('Semua');
    setIsModalOpen(false);
    setEditingItem(null);
  };

  // Switch block helper to open additions modals
  const handleOpenAddModal = () => {
    setEditingItem(null);
    const currentDateStr = new Date().toISOString().split('T')[0];
    
    if (activeSubTab === 'persuratan') {
      if (activePersuratanTab === 'surat-masuk') {
        setFormSuratMasuk({
          nomorSurat: '',
          tanggalSurat: currentDateStr,
          tanggalTerima: currentDateStr,
          pengirim: '',
          perihal: '',
          sifat: 'Biasa',
          disposisiKepala: '',
          status: 'Baru'
        });
      } else {
        setFormSuratKeluar({
          nomorSurat: '',
          tanggalSurat: currentDateStr,
          penerima: '',
          perihal: '',
          seksiAsal: 'Tata Usaha',
          status: 'Draf'
        });
      }
    } else if (activeSubTab === 'kepegawaian') {
      setFormPegawai({
        nama: '',
        nip: '',
        jabatan: '',
        golongan: 'III/a',
        statusKepegawaian: 'PNS',
        telepon: '',
        email: '',
        tempatLahir: '',
        tanggalLahir: '',
        jenisKelamin: 'Laki-laki',
        agama: 'Islam',
        statusPerkawinan: 'Belum Kawin',
        alamat: '',
        riwayatPendidikan: [],
        riwayatKepegawaianDetail: []
      });
      setFormKepegawaianTab('profil_dasar');
    } else if (activeSubTab === 'keuangan') {
      setFormKeuangan({
        tanggal: currentDateStr,
        keterangan: '',
        jumlah: 0,
        tipe: 'Pengeluaran',
        kategori: 'Belanja Barang',
        nomorSPDOrSPM: `SPM-${Math.floor(Math.random() * 800) + 100}/1.02/V/${new Date().getFullYear()}`
      });
    } else if (activeSubTab === 'aset') {
      setFormAset({
        kodeAset: `AST-${Math.floor(Math.random() * 900) + 100}`,
        namaAset: '',
        kategori: 'KIB B - Peralatan dan Mesin',
        jumlah: 1,
        satuan: 'Unit',
        kondisi: 'Baik',
        lokasiPenyimpanan: 'Kantor Induk UPTD PSDA Bah Bolon'
      });
    }
    setIsModalOpen(true);
  };

  // Switch block helper to open edit modal
  const handleOpenEditModal = (item: any) => {
    setEditingItem(item);
    if (activeSubTab === 'persuratan') {
      if (activePersuratanTab === 'surat-masuk') {
        setFormSuratMasuk({ ...item });
      } else {
        setFormSuratKeluar({ ...item });
      }
    } else if (activeSubTab === 'kepegawaian') {
      setFormPegawai({ 
        ...item,
        riwayatPendidikan: item.riwayatPendidikan || [],
        riwayatKepegawaianDetail: item.riwayatKepegawaianDetail || []
      });
      setFormKepegawaianTab('profil_dasar');
    } else if (activeSubTab === 'keuangan') {
      setFormKeuangan({ ...item });
    } else if (activeSubTab === 'aset') {
      setFormAset({ ...item });
    }
    setIsModalOpen(true);
  };

  // Trigger form submit handlers
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (activeSubTab === 'persuratan') {
      if (activePersuratanTab === 'surat-masuk') {
        if (editingItem) {
          onEditSuratMasuk({ ...editingItem, ...formSuratMasuk } as SuratMasuk);
        } else {
          onAddSuratMasuk({ id: `SM-${Date.now()}`, ...formSuratMasuk } as SuratMasuk);
        }
      } else {
        if (editingItem) {
          onEditSuratKeluar({ ...editingItem, ...formSuratKeluar } as SuratKeluar);
        } else {
          onAddSuratKeluar({ id: `SK-${Date.now()}`, ...formSuratKeluar } as SuratKeluar);
        }
      }
    } else if (activeSubTab === 'kepegawaian') {
      if (editingItem) {
        onEditPegawai({ ...editingItem, ...formPegawai } as Pegawai);
      } else {
        onAddPegawai({ id: `PEG-${Date.now()}`, ...formPegawai } as Pegawai);
      }
    } else if (activeSubTab === 'keuangan') {
      if (editingItem) {
        onEditKeuangan({ ...editingItem, ...formKeuangan } as TransaksiKeuangan);
      } else {
        onAddKeuangan({ id: `TX-${Date.now()}`, ...formKeuangan } as TransaksiKeuangan);
      }
    } else if (activeSubTab === 'aset') {
      if (editingItem) {
        onEditAset({ ...editingItem, ...formAset } as Aset);
      } else {
        onAddAset({ id: `AST-${Date.now()}`, ...formAset } as Aset);
      }
    }
    
    setIsModalOpen(false);
    setEditingItem(null);
  };

  return (
    <div id="tata-usaha-view" className="space-y-6">
      
      {/* Sub tabs navigation */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-100 pb-3 gap-4 select-none">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <Building className="w-7 h-7 text-teal-600" />
            Seksi Tata Usaha & Urusan Kepegawaian
          </h1>
          <p className="text-xs text-gray-500">
            Pusat pelayanan bagian umum, bendahara pengeluaran pembantu, inventarisasi data kearsipan dan aset internal
          </p>
        </div>

        {/* Buttons and actions */}
        {canInput && activeSubTab !== 'persuratan' && activeSubTab !== 'kepegawaian' && (
          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-1.5 bg-teal-600 text-white font-bold p-2 px-3.5 rounded-lg hover:bg-teal-700 hover:shadow shadow-sm transition-all text-xs"
          >
            <Plus className="w-4 h-4" /> Masukkan Data Baru
          </button>
        )}
      </div>

      {/* Under-header subtab deck buttons */}
      <div className="flex flex-wrap gap-1 bg-gray-50 p-1 rounded-xl w-fit border border-gray-100 select-none">
        {[
          { id: 'persuratan', label: 'Bagian Umum', icon: Inbox },
          { id: 'kepegawaian', label: 'Kepegawaian', icon: Users },
          { id: 'keuangan', label: 'Bendahara Pengeluaran Pembantu', icon: Wallet },
          { id: 'aset', label: 'Aset & Inventaris', icon: HardDrive }
        ].filter(tab => !allowedSubTabs || allowedSubTabs.includes(tab.id)).map((tab) => {
          const IconComp = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`flex items-center gap-1.5 py-2 px-3.5 rounded-lg text-xs font-bold transition-all ${
                activeSubTab === tab.id 
                  ? 'bg-white text-teal-700 shadow-sm border border-gray-200/50' 
                  : 'text-gray-500 hover:text-teal-600 hover:bg-white/50'
              }`}
            >
              <IconComp className="w-4 h-4 shrink-0" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* --- RENDER INDIVIDUAL SUBTABS --- */}

      {/* 1. SUBTAB: PERSURATAN (COMBINED SURAT MASUK & SURAT KELUAR) */}
      {activeSubTab === 'persuratan' && (
        <div className="space-y-4">
          
          {/* Inner Subtab switcher for Persuratan */}
          <div className="flex gap-1.5 bg-gray-100 p-1 rounded-xl w-fit border border-gray-200/50 select-none">
            <button
              onClick={() => {
                setActivePersuratanTab('surat-masuk');
                setSearchTerm('');
              }}
              className={`flex items-center gap-1.5 py-1.5 px-3.5 rounded-lg text-xs font-bold transition-all ${
                activePersuratanTab === 'surat-masuk'
                  ? 'bg-white text-teal-700 shadow-sm border border-gray-200/50'
                  : 'text-gray-500 hover:text-teal-600'
              }`}
            >
              <Inbox className="w-3.5 h-3.5 shrink-0" />
              Surat Masuk
            </button>
            <button
              onClick={() => {
                setActivePersuratanTab('surat-keluar');
                setSearchTerm('');
              }}
              className={`flex items-center gap-1.5 py-1.5 px-3.5 rounded-lg text-xs font-bold transition-all ${
                activePersuratanTab === 'surat-keluar'
                  ? 'bg-white text-teal-700 shadow-sm border border-gray-200/50'
                  : 'text-gray-500 hover:text-teal-600'
              }`}
            >
              <Send className="w-3.5 h-3.5 shrink-0" />
              Surat Keluar
            </button>
          </div>

          {activePersuratanTab === 'surat-masuk' ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-200_custom">
              {/* Incoming letter table layout list (Left 2 cols) */}
              <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col justify-between">
                <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-3 items-center justify-between">
                  <span className="text-xs font-bold text-gray-700">Kearsipan Surat Masuk</span>
                  <div className="flex flex-wrap gap-2 w-full sm:w-auto items-center">
                    <input
                      type="text"
                      placeholder="Cari pengirim, nomor, perihal..."
                      className="p-1 px-3 py-1.5 border border-gray-200 rounded-lg text-xs focus:ring-1 focus:ring-teal-500 focus:outline-none w-full sm:w-[220px]"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <select
                      className="bg-white border border-gray-200 rounded-lg py-1.5 px-2 text-xs text-gray-600 focus:outline-none"
                      value={filterCriteria}
                      onChange={(e) => setFilterCriteria(e.target.value)}
                    >
                      <option value="all">Sifat (Semua)</option>
                      <option value="Penting">Penting</option>
                      <option value="Biasa">Biasa</option>
                      <option value="Rahasia">Rahasia</option>
                    </select>
                    <button
                      onClick={handleOpenAddModal}
                      className="flex items-center gap-1.5 bg-teal-600 text-white font-bold py-1.5 px-3 rounded-lg hover:bg-teal-700 hover:shadow shadow-sm transition-all text-xs shrink-0"
                    >
                      <Plus className="w-3.5 h-3.5" /> Masukkan Surat Masuk
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[500px]">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100 text-gray-400 text-[10px] font-bold uppercase tracking-wider">
                        <th className="py-2.5 px-4 w-[160px]">Nomor Surat</th>
                        <th className="py-2.5 px-4">Pengirim & Perihal</th>
                        <th className="py-2.5 px-4 w-[100px] text-center">Sifat</th>
                        <th className="py-2.5 px-4 w-[110px]">Tanggal</th>
                        <th className="py-2.5 px-4 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 text-xs text-gray-600">
                      {suratMasuk
                        .filter(sm => {
                          const matchesSearch = sm.pengirim.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                                sm.nomorSurat.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                                sm.perihal.toLowerCase().includes(searchTerm.toLowerCase());
                          const matchesFilter = filterCriteria === 'all' || sm.sifat === filterCriteria;
                          return matchesSearch && matchesFilter;
                        })
                        .map((sm) => (
                          <tr 
                            key={sm.id} 
                            className={`hover:bg-teal-50/20 cursor-pointer transition-all ${selectedLetterId === sm.id ? 'bg-teal-50/10 font-medium' : ''}`}
                            onClick={() => setSelectedLetterId(sm.id)}
                          >
                            <td className="py-3 px-4 font-mono text-[10px] text-gray-500 font-bold max-w-[150px] truncate" title={sm.nomorSurat}>
                              {sm.nomorSurat}
                            </td>
                            <td className="py-3 px-4 max-w-[240px]">
                              <div>
                                <p className="font-bold text-gray-800 truncate">{sm.pengirim}</p>
                                <p className="text-[10px] text-gray-500 mt-0.5 line-clamp-1">{sm.perihal}</p>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                                sm.sifat === 'Penting' 
                                  ? 'bg-rose-50 text-rose-600' 
                                  : sm.sifat === 'Rahasia' ? 'bg-purple-50 text-purple-600' : 'bg-gray-100 text-gray-600'
                              }`}>
                                {sm.sifat}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-gray-500 text-[10.5px]">
                              Terima: {sm.tanggalTerima}<br/>
                              <span className="text-[9px] text-gray-400">Surat: {sm.tanggalSurat}</span>
                            </td>
                            <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                              <div className="flex justify-end gap-1">
                                <button
                                  onClick={() => handleOpenEditModal(sm)}
                                  className="p-1 text-blue-600 rounded hover:bg-blue-50"
                                  title="Edit / Disposisi"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => {
                                    setDeleteConfirm({
                                      id: sm.id,
                                      name: `Surat Masuk No. ${sm.nomorSurat}`,
                                      type: 'surat-masuk'
                                    });
                                  }}
                                  className="p-1 text-rose-600 rounded hover:bg-rose-50"
                                  title="Hapus"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Simulated Disposisi Sheet View (Right 1 col) */}
              <div className="space-y-4">
                {selectedLetter ? (
                  <div className="bg-amber-50/40 border border-amber-200/60 rounded-xl p-5 shadow-sm space-y-4">
                    <div className="pb-3 border-b border-amber-200 flex justify-between items-center">
                      <span className="text-[9px] font-extrabold text-amber-800 uppercase tracking-widest font-mono">
                        Lembar Disposisi Kepala UPTD
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[8px] font-extrabold uppercase font-mono ${
                        selectedLetter.status === 'Selesai' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {selectedLetter.status}
                      </span>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div>
                        <span className="text-[9px] uppercase font-bold text-gray-400">PENGIRIM</span>
                        <p className="font-bold text-gray-800">{selectedLetter.pengirim}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <div>
                          <span className="text-[9px] uppercase font-bold text-gray-400">TANGGAL TERIMA</span>
                          <p className="font-semibold text-gray-700">{selectedLetter.tanggalTerima}</p>
                        </div>
                        <div>
                          <span className="text-[9px] uppercase font-bold text-gray-400">NOMOR SURAT</span>
                          <p className="font-mono text-gray-700 truncate" title={selectedLetter.nomorSurat}>{selectedLetter.nomorSurat}</p>
                        </div>
                      </div>
                      <div className="pt-1.5">
                        <span className="text-[9px] uppercase font-bold text-gray-400">PERIHAL/ISI RINGKAS</span>
                        <p className="text-gray-700 leading-relaxed font-medium">{selectedLetter.perihal}</p>
                      </div>

                      {/* Disposisi message */}
                      <div className="pt-3 border-t border-dashed border-amber-200 space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-bold text-amber-800">PETUNJUK / DISPOSISI:</span>
                          <span className="text-[9px] text-gray-500 italic">Ir. H. Syahrizal Pane</span>
                        </div>
                        
                        <p className="p-3 bg-white rounded-lg border border-amber-200 font-serif italic text-gray-800 leading-relaxed shadow-sm">
                          "{selectedLetter.disposisiKepala || 'Belum ada disposisi dicatat. Silakan klik edit untuk memberikan arahan pimpinan.'}"
                        </p>
                      </div>
                    </div>

                  </div>
                ) : (
                  <div className="bg-white rounded-xl border border-gray-100 p-8 text-center text-gray-400 text-xs">
                    Silakan pilih surat masuk untuk melihat detail lembar disposisi.
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col justify-between">
              <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-3 items-center justify-between">
                <span className="text-xs font-bold text-gray-700">Manajemen Surat Keluar</span>
                <div className="flex flex-wrap gap-2 w-full sm:w-auto items-center">
                  <input
                    type="text"
                    placeholder="Cari nomor, perihal, tujuan..."
                    className="p-1 px-3 py-1.5 border border-gray-200 rounded-lg text-xs focus:ring-1 focus:ring-teal-500 focus:outline-none w-full sm:w-[250px]"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <button
                    onClick={handleOpenAddModal}
                    className="flex items-center gap-1.5 bg-teal-600 text-white font-bold py-1.5 px-3 rounded-lg hover:bg-teal-700 hover:shadow shadow-sm transition-all text-xs shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" /> Masukkan Surat Keluar
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[600px]">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100 text-gray-400 text-[10px] font-bold uppercase tracking-wider">
                      <th className="py-2.5 px-4 w-[160px]">Nomor Surat</th>
                      <th className="py-2.5 px-4">Tujuan / Penerima</th>
                      <th className="py-2.5 px-4">Perihal Surat</th>
                      <th className="py-2.5 px-4 w-[130px]">Asal Unit Pengonsep</th>
                      <th className="py-2.5 px-4 w-[110px]">Status</th>
                      <th className="py-2.5 px-4 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 text-xs text-gray-600">
                    {suratKeluar
                      .filter(sk => {
                        const matches = sk.penerima.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                        sk.nomorSurat.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                        sk.perihal.toLowerCase().includes(searchTerm.toLowerCase());
                        return matches;
                      })
                      .map((sk) => (
                        <tr key={sk.id} className="hover:bg-gray-50/50">
                          <td className="py-3 px-4 font-mono font-bold text-gray-700 text-[10px]">
                            {sk.nomorSurat || 'DRAF-SYSTEM-BLM-NO'}
                          </td>
                          <td className="py-3 px-4 font-bold text-gray-800">{sk.penerima}</td>
                          <td className="py-3 px-4 max-w-[200px] truncate" title={sk.perihal}>
                            {sk.perihal}
                          </td>
                          <td className="py-3 px-4 text-teal-700 font-medium">{sk.seksiAsal}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-serif uppercase tracking-wider font-bold ${
                              sk.status === 'Dikirim' 
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                                : sk.status === 'Ditandatangani' ? 'bg-blue-50 text-blue-700 border border-blue-100' : 'bg-gray-100 text-gray-700'
                            }`}>
                              {sk.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex justify-end gap-1">
                              <button
                                onClick={() => handleOpenEditModal(sk)}
                                className="p-1.5 text-blue-600 rounded hover:bg-blue-50"
                                title="Edit"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => {
                                  setDeleteConfirm({
                                    id: sk.id,
                                    name: `Surat Keluar No. ${sk.nomorSurat || '(Draf)'}`,
                                    type: 'surat-keluar'
                                  });
                                }}
                                className="p-1.5 text-rose-600 rounded hover:bg-rose-50"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      )}

      {/* 3. SUBTAB: KEPEGAWAIAN */}
      {activeSubTab === 'kepegawaian' && (
        <div className="space-y-6">
          {/* CONTROL HEADER & STATS SUMMARY */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 sm:p-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-gray-100 pb-4 gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-teal-50 rounded-xl text-teal-600">
                  <LucideTrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-gray-900 tracking-tight">Analisis & Antrean Kepegawaian SISDA</h3>
                  <p className="text-[10px] text-gray-500 font-medium">Pemantauan real-time demografi, masa pensiun (58 Thn), kenaikan pangkat (4 Thn), & KGB (2 Thn)</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowHRDashboard(!showHRDashboard)}
                className="w-full sm:w-auto text-xs font-bold text-teal-700 hover:text-teal-800 bg-teal-50 hover:bg-teal-100/70 px-3.5 py-1.5 rounded-lg transition-all border border-teal-100 flex items-center justify-center gap-1.5"
              >
                <LucidePieChart className="w-3.5 h-3.5" />
                {showHRDashboard ? 'Sembunyikan Analisis & Antrean' : 'Tampilkan Analisis & Antrean'}
              </button>
            </div>

            {/* Quick Summary Cards (Always Visible) */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
              <div className="bg-gradient-to-br from-gray-50 to-gray-100/40 p-3.5 rounded-xl border border-gray-150/70 flex items-center gap-3">
                <div className="w-9 h-9 bg-teal-600 text-white rounded-lg flex items-center justify-center shadow">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider block">Total Pegawai</span>
                  <span className="text-sm font-black text-gray-900">{pegawai.length} <span className="text-[10px] text-gray-400 font-normal">Aktif</span></span>
                </div>
              </div>

              <div className="bg-gradient-to-br from-gray-50 to-gray-100/40 p-3.5 rounded-xl border border-gray-150/70 flex items-center gap-3">
                <div className="w-9 h-9 bg-sky-600 text-white rounded-lg flex items-center justify-center shadow">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider block">Pegawai PNS</span>
                  <span className="text-sm font-black text-gray-900">{statusCounts['PNS'] || 0} <span className="text-[10px] text-gray-400 font-normal">Orang</span></span>
                </div>
              </div>

              <div className="bg-gradient-to-br from-gray-50 to-gray-100/40 p-3.5 rounded-xl border border-gray-150/70 flex items-center gap-3">
                <div className="w-9 h-9 bg-indigo-600 text-white rounded-lg flex items-center justify-center shadow">
                  <Briefcase className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider block">Pegawai PPPK</span>
                  <span className="text-sm font-black text-gray-900">{statusCounts['PPPK'] || 0} <span className="text-[10px] text-gray-400 font-normal">Orang</span></span>
                </div>
              </div>

              <div className="bg-gradient-to-br from-gray-50 to-gray-100/40 p-3.5 rounded-xl border border-gray-150/70 flex items-center gap-3">
                <div className="w-9 h-9 bg-amber-600 text-white rounded-lg flex items-center justify-center shadow">
                  <CalendarDays className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider block">Pegawai Lapangan</span>
                  <span className="text-sm font-black text-gray-900">{(statusCounts['Tenaga Kontrak O&P'] || 0) + (statusCounts['Honorer'] || 0)} <span className="text-[10px] text-gray-400 font-normal">O&P</span></span>
                </div>
              </div>
            </div>
          </div>

          {showHRDashboard && (
            <>
              {/* CHARTS ROW (Agama, Jenis Kelamin, Detail Status) */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* 1. Hubungan Kerja Status */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex flex-col justify-between">
                  <div className="flex items-center justify-between border-b border-gray-50 pb-2">
                    <span className="font-extrabold text-gray-900 text-xs uppercase tracking-wider">Suku Kerja & Status Tipe</span>
                    <BarChart2 className="w-4 h-4 text-sky-600" />
                  </div>
                  <div className="h-[180px] w-full mt-3">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={statusChartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#64748b' }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 9, fill: '#64748b' }} axisLine={false} tickLine={false} />
                        <Tooltip 
                          contentStyle={{ fontSize: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }} 
                          labelClassName="font-extrabold text-gray-900"
                        />
                        <Bar dataKey="jumlah" fill="#0ea5e9" radius={[4, 4, 0, 0]} barSize={26}>
                          {statusChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex flex-wrap gap-2 justify-center text-[10px] mt-2 border-t border-gray-50 pt-2 font-medium">
                    {statusChartData.map((e, idx) => (
                      <div key={idx} className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: e.fill }} />
                        <span className="text-gray-500">{e.name}: <strong className="text-gray-800">{e.jumlah}</strong></span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 2. Demografi Gender */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex flex-col justify-between">
                  <div className="flex items-center justify-between border-b border-gray-50 pb-2">
                    <span className="font-extrabold text-gray-900 text-xs uppercase tracking-wider">Demografi Jenis Kelamin</span>
                    <Users className="w-4 h-4 text-teal-600" />
                  </div>
                  
                  <div className="h-[180px] w-full mt-3 relative flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={genderChartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={45}
                          outerRadius={65}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {genderChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ fontSize: '10px', borderRadius: '8px' }} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute text-center select-none pointer-events-none">
                      <span className="text-xs font-black text-gray-900 block">{pegawai.length}</span>
                      <span className="text-[8px] text-gray-400 uppercase font-extrabold">Total Staff</span>
                    </div>
                  </div>

                  <div className="flex justify-around text-[10px] border-t border-gray-50 pt-2 font-medium">
                    {genderChartData.map((e, idx) => (
                      <div key={idx} className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: e.color }} />
                        <span className="text-gray-500">{e.name}: <strong className="text-gray-950">{e.value}</strong> ({((e.value / pegawai.length) * 100).toFixed(0)}%)</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 3. Distribusi Agama */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex flex-col justify-between">
                  <div className="flex items-center justify-between border-b border-gray-50 pb-2">
                    <span className="font-extrabold text-gray-900 text-xs uppercase tracking-wider">Distribusi Klasifikasi Agama</span>
                    <Bookmark className="w-4 h-4 text-indigo-600" />
                  </div>
                  <div className="h-[180px] w-full mt-3">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={religionChartData}
                          cx="50%"
                          cy="50%"
                          outerRadius={65}
                          dataKey="value"
                          label={({ name, percent }) => percent > 0.05 ? `${name}` : ''}
                          labelLine={false}
                        >
                          {religionChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ fontSize: '10px', borderRadius: '8px' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex flex-wrap gap-x-3 gap-y-1.5 justify-center text-[10px] border-t border-gray-50 pt-2 max-h-[44px] overflow-y-auto font-medium">
                    {religionChartData.map((e, idx) => (
                      <div key={idx} className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: e.color }} />
                        <span className="text-gray-500">{e.name}: <strong className="text-gray-900">{e.value}</strong></span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* ACTION QUEUE GRID (Pensiun, Kenaikan Pangkat, KGB) */}
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

                {/* COLUMN 1: ANTRIAN RENCANA PENSIUN (Batas Usia 58 Tahun) */}
                <div className="bg-white rounded-xl border border-rose-100 shadow-xs flex flex-col">
                  <div className="p-3.5 border-b border-rose-50 bg-rose-50/50 flex justify-between items-center rounded-t-xl animate-pulse">
                    <div className="flex items-center gap-2">
                      <div className="p-1 px-1.5 bg-rose-500 text-white rounded-lg text-xs font-black">58</div>
                      <div>
                        <h4 className="font-extrabold text-rose-950 text-[11px] uppercase tracking-wider">Rencana Masa Pensiun</h4>
                        <p className="text-[9px] text-rose-800 font-medium">Usia Pensiun 58 Thn (Sisa ≤ 2 Tahun)</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full font-mono">
                      {listPensiun.length} Staff
                    </span>
                  </div>

                  <div className="p-4 space-y-3 flex-1 max-h-[300px] overflow-y-auto">
                    {listPensiun.length === 0 ? (
                      <div className="text-center py-6 text-gray-400 text-xs">Belum ada staff di batas usia pensiun (≤ 2 Tahun) terdaftar.</div>
                    ) : (
                      listPensiun.map((item, idx) => {
                        const daysLeft = item.diffDays;
                        const isOverdue = daysLeft <= 0;
                        const isClose = daysLeft > 0 && daysLeft <= 365 * 2; // within 2 years

                        return (
                          <div key={idx} className={`p-3 rounded-lg border ${
                            isOverdue 
                              ? 'bg-rose-50/20 border-rose-100 shadow-sm' 
                              : isClose ? 'bg-amber-50/10 border-amber-100' : 'bg-gray-50/50 border-gray-150'
                          } space-y-1.5`}>
                            <div className="flex justify-between items-start gap-2">
                              <div>
                                <h5 className="font-extrabold text-gray-900 text-xs leading-tight">{item.pegawai.nama}</h5>
                                <span className="text-[9.5px] font-mono text-gray-400 block">NIP: {item.pegawai.nip || '-'}</span>
                              </div>
                              <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase text-right leading-none ${
                                isOverdue 
                                  ? 'bg-rose-600 text-white' 
                                  : isClose ? 'bg-amber-100 text-amber-955' : 'bg-gray-200 text-gray-700'
                              }`}>
                                {isOverdue 
                                  ? 'Sudah Memasuki Pensiun' 
                                  : `Sisa ${item.yearsRemaining} Thn`}
                              </span>
                            </div>

                            <div className="flex justify-between items-center text-[10px] text-gray-500 font-medium pt-1 border-t border-gray-100/50">
                              <div>Tgl Lahir: <strong className="text-gray-800">{item.birthDate.toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' })}</strong></div>
                              <div className="font-mono text-[9px] text-teal-800" title="Rencana tgl Pensiun">
                                Pensiun: {item.pensionDate.toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' })}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* COLUMN 2: PLANS FOR PROMOTION (Siklus 4 Tahunan) */}
                <div className="bg-white rounded-xl border border-blue-100 shadow-xs flex flex-col">
                  <div className="p-3.5 border-b border-blue-50 bg-blue-50/50 flex justify-between items-center rounded-t-xl animate-pulse">
                    <div className="flex items-center gap-2">
                      <div className="p-1 px-1.5 bg-blue-600 text-white rounded-lg text-xs font-black">UKP</div>
                      <div>
                        <h4 className="font-extrabold text-blue-950 text-[11px] uppercase tracking-wider">Rencana Kenaikan Pangkat</h4>
                        <p className="text-[9px] text-blue-800 font-medium">+4 Thn Dari SK (Sisa ≤ 1 Tahun)</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full font-mono">
                      {listNaikPangkat.length} Staff
                    </span>
                  </div>

                  <div className="p-4 space-y-3 flex-1 max-h-[300px] overflow-y-auto">
                    {listNaikPangkat.length === 0 ? (
                      <div className="text-center py-8 text-gray-400 text-xs">Belum ada rencana kenaikan pangkat (≤ 1 Tahun) terdaftar.</div>
                    ) : (
                      listNaikPangkat.map((item, idx) => {
                        const daysLeft = item.diffDays;
                        const isOverdue = daysLeft <= 0;
                        const isTargetSoon = daysLeft > 0 && daysLeft <= 365;

                        return (
                          <div key={idx} className={`p-3 rounded-lg border ${
                            isOverdue 
                              ? 'bg-red-50/20 border-red-150 shadow-sm' 
                              : isTargetSoon ? 'bg-orange-50/10 border-orange-100' : 'bg-blue-50/20 border-blue-100/40'
                          } space-y-1.5`}>
                            <div className="flex justify-between items-start gap-2">
                              <div>
                                <h5 className="font-extrabold text-gray-900 text-xs leading-tight">{item.pegawai.nama}</h5>
                                <span className="text-[9.5px] font-mono text-gray-400 block">Gol: {item.pegawai.golongan || 'Non-ASN'}</span>
                              </div>
                              <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase text-right leading-none ${
                                isOverdue 
                                  ? 'bg-red-600 text-white font-black' 
                                  : isTargetSoon ? 'bg-orange-100 text-orange-900' : 'bg-blue-100 text-blue-950'
                              }`}>
                                {isOverdue 
                                  ? 'Wajib Naik Pangkat' 
                                  : `Sisa ${item.yearsRemaining} Thn`}
                              </span>
                            </div>

                            <div className="text-[10px] text-gray-500 font-medium space-y-0.5">
                              <div>SK Pangkat: <strong className="font-mono text-gray-700 text-[9px]">{item.latestSkNumber || '-'}</strong> ({item.latestDate.toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' })})</div>
                              <div className="flex justify-between items-center text-teal-850 font-mono text-[9px] pt-1 border-t border-gray-100/50">
                                <span>Rencana Tanggal:</span>
                                <strong className="text-teal-900">{item.targetDate.toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' })}</strong>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* COLUMN 3: PLANS FOR KGB (Siklus 2 Tahunan) */}
                <div className="bg-white rounded-xl border border-emerald-100 shadow-xs flex flex-col">
                  <div className="p-3.5 border-b border-emerald-50 bg-emerald-50/50 flex justify-between items-center rounded-t-xl animate-pulse">
                    <div className="flex items-center gap-2">
                      <div className="p-1 px-1.5 bg-emerald-600 text-white rounded-lg text-xs font-black font-mono">KGB</div>
                      <div>
                        <h4 className="font-extrabold text-emerald-950 text-[11px] uppercase tracking-wider">Kenaikan Gaji Berkala</h4>
                        <p className="text-[9px] text-emerald-800 font-medium">+2 Thn Dari SK (Sisa ≤ 1 Tahun)</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full font-mono">
                      {listKgb.length} Staff
                    </span>
                  </div>

                  <div className="p-4 space-y-3 flex-1 max-h-[300px] overflow-y-auto">
                    {listKgb.length === 0 ? (
                      <div className="text-center py-8 text-gray-400 text-xs">Belum ada rencana KGB (≤ 1 Tahun) terdaftar.</div>
                    ) : (
                      listKgb.map((item, idx) => {
                        const daysLeft = item.diffDays;
                        const isOverdue = daysLeft <= 0;
                        const isTargetSoon = daysLeft > 0 && daysLeft <= 180; // dynamic 6 months

                        return (
                          <div key={idx} className={`p-3 rounded-lg border ${
                            isOverdue 
                              ? 'bg-rose-50/10 border-rose-150 shadow-sm' 
                              : isTargetSoon ? 'bg-amber-50/10 border-amber-100' : 'bg-emerald-50/10 border-emerald-100/40'
                          } space-y-1.5`}>
                            <div className="flex justify-between items-start gap-2">
                              <div>
                                <h5 className="font-extrabold text-gray-900 text-xs leading-tight">{item.pegawai.nama}</h5>
                                <span className="text-[9.5px] font-mono text-gray-400 block">NIP: {item.pegawai.nip || '-'}</span>
                              </div>
                              <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase text-right leading-none ${
                                isOverdue 
                                  ? 'bg-rose-600 text-white' 
                                  : isTargetSoon ? 'bg-amber-100 text-amber-955' : 'bg-emerald-100 text-emerald-950'
                              }`}>
                                {isOverdue 
                                  ? 'Wajib KGB Berkala' 
                                  : `Sisa ${item.monthsRemaining} Bln`}
                              </span>
                            </div>

                            <div className="text-[10px] text-gray-500 font-medium space-y-0.5">
                              <div>SK KGB: <strong className="font-mono text-gray-700 text-[9px]">{item.latestSkNumber || '-'}</strong> ({item.latestDate.toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' })})</div>
                              <div className="flex justify-between items-center text-teal-855 font-mono text-[9px] pt-1 border-t border-gray-100/50">
                                <span>Rencana Tanggal:</span>
                                <strong className="text-teal-900">{item.targetDate.toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' })}</strong>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

              </div>
            </>
          )}

          {/* MAIN LISTING TABLE (THE ORIGINAL COMPONENT) */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col justify-between">
            <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-3 items-center justify-between">
              <span className="text-xs font-extrabold text-gray-800 uppercase tracking-widest bg-gray-50/90 py-1 px-2.5 rounded border border-gray-100">Daftar Pegawai & Petugas Lapangan</span>
              <div className="flex gap-2 w-full sm:w-auto">
                <input
                  type="text"
                  placeholder="Cari nama, nip, Gol..."
                  className="p-1 px-3 py-1.5 border border-gray-200 rounded-lg text-xs w-full sm:w-[220px] focus:ring-1 focus:ring-teal-500 focus:outline-none"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <select
                  className="bg-white border border-gray-200 rounded-lg py-1.5 px-2 text-xs text-gray-600 focus:outline-none font-medium cursor-pointer"
                  value={filterCriteria}
                  onChange={(e) => setFilterCriteria(e.target.value)}
                >
                  <option value="all">Kepegawaian (Semua)</option>
                  <option value="PNS">Pegawai Negeri Sipil (PNS)</option>
                  <option value="PPPK">PPPK</option>
                  <option value="Tenaga Kontrak O&P">Tenaga Kontrak Lapangan</option>
                </select>
                <button
                  type="button"
                  onClick={handleOpenAddModal}
                  className="flex items-center gap-1.5 bg-teal-600 text-white font-bold py-1.5 px-3 rounded-lg hover:bg-teal-700 hover:shadow shadow-sm transition-all text-xs shrink-0"
                  title="Tambah Data Pegawai Baru"
                >
                  <Plus className="w-3.5 h-3.5" /> Data Baru
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className="bg-gray-50/80 border-b border-gray-100 text-gray-400 text-[10px] font-bold uppercase tracking-wider">
                    <th className="py-2.5 px-4">Nama Pegawai / ASN</th>
                    <th className="py-2.5 px-4">NIP Sireg</th>
                    <th className="py-2.5 px-4 font-mono">Jabatan Kerja</th>
                    <th className="py-2.5 px-4">Pangkat / Golongan</th>
                    <th className="py-2.5 px-4 text-center">Tipe Reg</th>
                    <th className="py-2.5 px-4 w-[110px]">Kontak Satuan</th>
                    <th className="py-2.5 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-xs text-gray-600">
                  {pegawai
                    .filter(p => {
                      const matchesSearch = p.nama.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                            p.jabatan.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                            p.nip.toLowerCase().includes(searchTerm.toLowerCase());
                      const matchesFilter = filterCriteria === 'all' || p.statusKepegawaian === filterCriteria;
                      return matchesSearch && matchesFilter;
                    })
                    .map((p) => (
                      <tr key={p.id} className="hover:bg-gray-50/50">
                        <td className="py-3.5 px-4 font-bold text-gray-800">
                          {p.nama}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-[10px] text-gray-500">
                          {p.nip}
                        </td>
                        <td className="py-3.5 px-4 font-medium text-gray-700 max-w-[200px]" title={p.jabatan}>
                          {p.jabatan}
                        </td>
                        <td className="py-3.5 px-4 text-gray-500">{p.golongan || '-'}</td>
                        <td className="py-3.5 px-4 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                            p.statusKepegawaian === 'PNS' 
                              ? 'bg-blue-50 text-blue-700 border border-blue-100' 
                              : p.statusKepegawaian === 'PPPK' ? 'bg-indigo-50 text-indigo-700' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {p.statusKepegawaian}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-[10.5px]">
                          {p.telepon}<br/>
                          <span className="text-[9.5px] font-mono text-gray-400">{p.email}</span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => setSelectedPegawaiDetail(p)}
                              className="p-1 text-teal-600 rounded hover:bg-teal-50"
                              title="Tampilkan Detail Lengkap"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenEditModal(p)}
                              className="p-1 text-blue-600 rounded hover:bg-blue-50"
                              title="Ubah Data"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setDeleteConfirm({
                                  id: p.id,
                                  name: `Kepegawaian ${p.nama}`,
                                  type: 'pegawai'
                                });
                              }}
                              className="p-1 text-rose-600 rounded hover:bg-rose-50"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 4. SUBTAB: KEUANGAN */}
      {activeSubTab === 'keuangan' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Financial Ledger book (2 cols) */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col justify-between">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="font-bold text-gray-800 text-xs">Jurnal Pengeluaran & Penerimaan Buku Kas</h3>
              <input
                type="text"
                placeholder="Cari transaksi ledger..."
                className="p-1 px-3 py-1.5 border border-gray-200 rounded-lg text-xs w-[180px] sm:w-[220px] focus:ring-1 focus:ring-teal-500 bg-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 text-gray-400 text-[10px] font-bold uppercase tracking-wider">
                    <th className="py-2.5 px-4 w-[110px]">Tanggal</th>
                    <th className="py-2.5 px-4">No Dokumen / SPM</th>
                    <th className="py-2.5 px-4">Uraian Keterangan</th>
                    <th className="py-2.5 px-4 w-[120px]">Kategori Belanja</th>
                    <th className="py-2.5 px-4 text-right w-[110px]">Jumlah (Rupiah)</th>
                    <th className="py-2.5 px-4 text-right w-[80px]">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-xs text-gray-600">
                  {keuangan
                    .filter(tx => tx.keterangan.toLowerCase().includes(searchTerm.toLowerCase()) || tx.nomorSPDOrSPM.toLowerCase().includes(searchTerm.toLowerCase()))
                    .map((tx) => (
                      <tr key={tx.id} className="hover:bg-gray-50/40">
                        <td className="py-3 px-4 text-gray-500 font-mono text-[10px]">{tx.tanggal}</td>
                        <td className="py-3 px-4 font-mono text-[9.5px] text-gray-600" title={tx.nomorSPDOrSPM}>
                          {tx.nomorSPDOrSPM}
                        </td>
                        <td className="py-3 px-4 font-medium text-gray-800">{tx.keterangan}</td>
                        <td className="py-3 px-4">
                          <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full font-medium">
                            {tx.kategori}
                          </span>
                        </td>
                        <td className={`py-3 px-4 text-right font-bold font-mono ${tx.tipe === 'Pemasukan' ? 'text-emerald-700' : 'text-rose-700'}`}>
                          {tx.tipe === 'Pemasukan' ? '+' : '-'} {tx.jumlah.toLocaleString('id-ID')}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex justify-end gap-1">
                            <button
                              onClick={() => handleOpenEditModal(tx)}
                              className="p-1 text-blue-600 rounded hover:bg-blue-50"
                            >
                              <Edit3 className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => {
                                 setDeleteConfirm({
                                   id: tx.id,
                                   name: `Transaksi ${tx.keterangan}`,
                                   type: 'keuangan'
                                 });
                              }}
                              className="p-1 text-rose-600 rounded hover:bg-rose-50"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick Realisasi Metrics (Right 1 col) */}
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-teal-900 to-indigo-950 text-white rounded-xl p-5 shadow-sm space-y-4 select-none">
              <span className="text-[9px] uppercase tracking-wider bg-white/10 text-teal-200 px-2 py-0.5 rounded font-mono font-bold block w-fit">
                Realisasi Anggaran SKPD
              </span>
              
              <div className="space-y-1">
                <span className="text-[10px] text-teal-100">Pemasukan Droping UP</span>
                <h3 className="text-2xl font-extrabold text-white">
                  Rp {keuangan.filter(t => t.tipe === 'Pemasukan').reduce((s, c) => s + c.jumlah, 0).toLocaleString('id-ID')}
                </h3>
              </div>

              <div className="space-y-1 border-t border-white/10 pt-3">
                <span className="text-[10px] text-rose-200">Total Pengeluaran Kas (SPM)</span>
                <h3 className="text-xl font-bold text-rose-400">
                  Rp {keuangan.filter(t => t.tipe === 'Pengeluaran').reduce((s, c) => s + c.jumlah, 0).toLocaleString('id-ID')}
                </h3>
              </div>

              {/* Progress of absorption of visual bar */}
              <div className="pt-2">
                <div className="flex justify-between items-center text-[10px] mb-1 text-teal-200">
                  <span>Persentase Penyerapan UP</span>
                  <span className="font-bold">68%</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                  <div className="h-full bg-teal-400" style={{ width: '68%' }}></div>
                </div>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* 5. SUBTAB: ASET */}
      {activeSubTab === 'aset' && (
        <div className="space-y-4">
          
          {/* KIB Category Selection Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2 select-none">
            {[
              { id: 'Semua', label: 'Semua KIB', desc: 'Seluruh Aset' },
              { id: 'KIB A - Tanah', label: 'KIB A', desc: 'Tanah & Lahan' },
              { id: 'KIB B - Peralatan dan Mesin', label: 'KIB B', desc: 'Alat & Mesin' },
              { id: 'KIB C - Gedung dan Bangunan', label: 'KIB C', desc: 'Gedung' },
              { id: 'KIB D - Jalan, Irigasi, dan Jaringan', label: 'KIB D', desc: 'Sal. Irigasi' },
              { id: 'KIB E - Aset Tetap Lainnya', label: 'KIB E', desc: 'Aset Lain' },
              { id: 'KIB F - Konstruksi dalam Pengerjaan', label: 'KIB F', desc: 'Konstruksi' }
            ].map((cat) => {
              const count = cat.id === 'Semua' 
                ? aset.length 
                : aset.filter(a => a.kategori === cat.id).length;
              const isActive = kibFilter === cat.id;
              
              return (
                <button
                  key={cat.id}
                  onClick={() => setKibFilter(cat.id)}
                  className={`flex flex-col items-start p-3 rounded-xl border text-left transition-all relative overflow-hidden ${
                    isActive 
                      ? 'bg-teal-50 border-teal-200 shadow-sm' 
                      : 'bg-white border-gray-100 hover:border-gray-200'
                  }`}
                >
                  <span className={`text-xs font-bold ${isActive ? 'text-teal-700' : 'text-gray-700'}`}>
                    {cat.label}
                  </span>
                  <span className="text-[9px] text-gray-400 font-medium mt-0.5 line-clamp-1">
                    {cat.desc}
                  </span>
                  <span className={`absolute top-2 right-2 text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                    isActive ? 'bg-teal-600 text-white' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Asset main list */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col justify-between">
            <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-3 items-center justify-between">
              <div className="flex flex-col">
                <span className="text-xs font-bold text-gray-700">Daftar Peralatan Daerah & Aset Milik Negara</span>
                <span className="text-[10px] text-gray-400 mt-0.5">Klasifikasi: {kibFilter}</span>
              </div>
              <input
                type="text"
                placeholder="Cari kode aset, nama barang..."
                className="p-1 px-3 py-1.5 border border-gray-200 text-xs rounded-lg focus:ring-1 focus:ring-teal-500 focus:outline-none w-full sm:w-[250px]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 text-gray-400 text-[10px] font-bold uppercase tracking-wider">
                    <th className="py-2.5 px-4 w-[140px]">Kode Registrasi</th>
                    <th className="py-2.5 px-4">Nama Barang Aset</th>
                    <th className="py-2.5 px-4">Klasifikasi Kartu (KIB)</th>
                    <th className="py-2.5 px-4 text-center">Jumlah Vol</th>
                    <th className="py-2.5 px-4 text-center w-[120px]">Kondisi Fisik</th>
                    <th className="py-2.5 px-4">Tempat Penyimpanan</th>
                    <th className="py-2.5 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-xs text-gray-600">
                  {aset
                    .filter(a => {
                      const matchesSearch = a.namaAset.toLowerCase().includes(searchTerm.toLowerCase()) || a.kodeAset.toLowerCase().includes(searchTerm.toLowerCase());
                      const matchesKib = kibFilter === 'Semua' || a.kategori === kibFilter;
                      return matchesSearch && matchesKib;
                    })
                    .map((a) => (
                      <tr key={a.id} className="hover:bg-gray-50/50">
                        <td className="py-3 px-4 font-mono text-[10px] text-gray-500 font-bold">{a.kodeAset}</td>
                        <td className="py-3 px-4 font-bold text-gray-800">{a.namaAset}</td>
                        <td className="py-3 px-4 text-teal-700 font-medium">
                          <span className="bg-teal-50 text-teal-800 px-2 py-0.5 rounded text-[10px] font-bold">
                            {a.kategori}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center font-mono font-bold">
                          {a.jumlah} {a.satuan}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`px-2.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider block w-fit mx-auto ${
                            a.kondisi === 'Baik' 
                              ? 'bg-emerald-50 text-emerald-700' 
                              : a.kondisi === 'Rusak Ringan' ? 'bg-amber-50 text-amber-700' : 'bg-rose-50 text-rose-700 font-bold text-[8.5px]'
                          }`}>
                            {a.kondisi}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-500 max-w-[150px] truncate" title={a.lokasiPenyimpanan}>
                          {a.lokasiPenyimpanan}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex justify-end gap-1">
                            <button
                              onClick={() => handleOpenEditModal(a)}
                              className="p-1 px-1.5 text-blue-600 rounded hover:bg-blue-50"
                              title="Edit Kondisi"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                 setDeleteConfirm({
                                   id: a.id,
                                   name: `Aset ${a.namaAset}`,
                                   type: 'aset'
                                 });
                              }}
                              className="p-1 text-rose-600 rounded hover:bg-rose-50"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* --- MASTER MULTI-FORM MODAL IN TATA USAHA --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="bg-gradient-to-r from-teal-600 to-teal-800 p-4 text-white flex justify-between items-center select-none">
              <h3 className="font-bold text-sm tracking-tight uppercase">
                {editingItem ? 'Ubah Lembaran Record' : 'Input Pembukuan Elektronik'}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-white hover:text-teal-200 text-lg font-bold px-2 focus:outline-none"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
              
              {/* Conditional Inputs Block 1: SURAT MASUK */}
              {(activeSubTab === 'surat-masuk' || (activeSubTab === 'persuratan' && activePersuratanTab === 'surat-masuk')) && (
                <div className="space-y-4 text-xs">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase font-sans">Nomor Surat Masuk Utama</label>
                    <input
                      type="text"
                      className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500"
                      value={formSuratMasuk.nomorSurat || ''}
                      onChange={(e) => setFormSuratMasuk({ ...formSuratMasuk, nomorSurat: e.target.value })}
                      placeholder="Contoh: 050/123/PSDA-SU/2026"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase font-sans">Instansi Pengirim Surat</label>
                    <input
                      type="text"
                      className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500"
                      value={formSuratMasuk.pengirim || ''}
                      onChange={(e) => setFormSuratMasuk({ ...formSuratMasuk, pengirim: e.target.value })}
                      placeholder="Contoh: Balai Sungai Wilayah II"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase font-sans">Perihal / Pokok Isi Surat</label>
                    <input
                      type="text"
                      className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500"
                      value={formSuratMasuk.perihal || ''}
                      onChange={(e) => setFormSuratMasuk({ ...formSuratMasuk, perihal: e.target.value })}
                      placeholder="Contoh: Undangan Rapat Alokasi Air"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase">Tgl Surat Keluar</label>
                      <input
                        type="date"
                        className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none"
                        value={formSuratMasuk.tanggalSurat || ''}
                        onChange={(e) => setFormSuratMasuk({ ...formSuratMasuk, tanggalSurat: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase">Tgl Terima Kantor</label>
                      <input
                        type="date"
                        className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none"
                        value={formSuratMasuk.tanggalTerima || ''}
                        onChange={(e) => setFormSuratMasuk({ ...formSuratMasuk, tanggalTerima: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase">Sifat Surat</label>
                      <select
                        className="w-full p-2 border border-gray-200 rounded-lg text-gray-700"
                        value={formSuratMasuk.sifat || 'Biasa'}
                        onChange={(e) => setFormSuratMasuk({ ...formSuratMasuk, sifat: e.target.value as any })}
                      >
                        <option value="Biasa">Biasa</option>
                        <option value="Penting">Penting</option>
                        <option value="Rahasia">Rahasia</option>
                      </select>
                    </div>

                    <div className="space-y-1 col-span-2">
                      <label className="text-[10px] font-bold text-gray-400 uppercase">Status Tindak Lanjut</label>
                      <select
                        className="w-full p-2 border border-gray-200 rounded-lg text-gray-700"
                        value={formSuratMasuk.status || 'Baru'}
                        onChange={(e) => setFormSuratMasuk({ ...formSuratMasuk, status: e.target.value as any })}
                      >
                        <option value="Baru">Baru - Belum di Disposisi</option>
                        <option value="Didisposisikan">Didisposisikan ke Seksi</option>
                        <option value="Selesai">Selesai / Diarsipkan</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1 pt-1.5 border-t border-dashed border-gray-100">
                    <label className="text-[10px] font-bold text-teal-800 uppercase flex items-center gap-1">
                      <span>✒️ Tulisan Catatan Disposisi Kepala</span>
                    </label>
                    <textarea
                      rows={2}
                      className="w-full p-2.5 border border-amber-200 bg-amber-50/20 rounded-lg font-serif italic text-gray-800"
                      value={formSuratMasuk.disposisiKepala || ''}
                      onChange={(e) => setFormSuratMasuk({ ...formSuratMasuk, disposisiKepala: e.target.value })}
                      placeholder="Contoh: Seksi O&P segera koordinasikan dan buat laporan tanggap darurat..."
                    />
                  </div>
                </div>
              )}

              {/* Conditional Inputs Block 2: SURAT KELUAR */}
              {(activeSubTab === 'surat-keluar' || (activeSubTab === 'persuratan' && activePersuratanTab === 'surat-keluar')) && (
                <div className="space-y-4 text-xs">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Nomor Registrasi Surat Keluar</label>
                    <input
                      type="text"
                      className="w-full p-2 border border-gray-200 rounded-lg"
                      value={formSuratKeluar.nomorSurat || ''}
                      onChange={(e) => setFormSuratKeluar({ ...formSuratKeluar, nomorSurat: e.target.value })}
                      placeholder="Contoh: 602/404/UPTD-BB/2026"
                    />
                    <span className="text-[9px] text-gray-400 italic">* Kosongkan jika masih draf (nomor otomatis)</span>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Tujuan / Nama Instansi Penerima</label>
                    <input
                      type="text"
                      className="w-full p-2 border border-gray-200 rounded-lg"
                      value={formSuratKeluar.penerima || ''}
                      onChange={(e) => setFormSuratKeluar({ ...formSuratKeluar, penerima: e.target.value })}
                      placeholder="Contoh: Camat Bandar Kabupaten Simalungun"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Perihal / Keperluan Surat</label>
                    <input
                      type="text"
                      className="w-full p-2 border border-gray-200 rounded-lg"
                      value={formSuratKeluar.perihal || ''}
                      onChange={(e) => setFormSuratKeluar({ ...formSuratKeluar, perihal: e.target.value })}
                      placeholder="Contoh: Pengumuman Pengeringan Saluran Air"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase">Unit Pengonsep Asal</label>
                      <select
                        className="w-full p-2 border border-gray-200 rounded-lg text-gray-700"
                        value={formSuratKeluar.seksiAsal || 'Tata Usaha'}
                        onChange={(e) => setFormSuratKeluar({ ...formSuratKeluar, seksiAsal: e.target.value as any })}
                      >
                        <option value="Tata Usaha">Unit Tata Usaha (KTU)</option>
                        <option value="Seksi O&P">Seksi Operasi & Pemeliharaan</option>
                        <option value="Seksi Pembangunan">Seksi Pembangunan Infrastruktur SDA</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase">Status Surat</label>
                      <select
                        className="w-full p-2 border border-gray-200 rounded-lg text-gray-700"
                        value={formSuratKeluar.status || 'Draf'}
                        onChange={(e) => setFormSuratKeluar({ ...formSuratKeluar, status: e.target.value as any })}
                      >
                        <option value="Draf">Draf Konseptor</option>
                        <option value="Diajukan">Diajukan ke Kasubag TU</option>
                        <option value="Ditandatangani">Ditandatangani Kasi/KUPTD</option>
                        <option value="Dikirim">Terkirim ke Penerima resmi</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Conditional Inputs Block 3: KEPEGAWAIAN */}
              {activeSubTab === 'kepegawaian' && (
                <div className="space-y-4 text-xs">
                  {/* Dynamic Sub-tab Navigation inside Form */}
                  <div className="flex border-b border-gray-200 mb-4 select-none">
                    {[
                      { id: 'profil_dasar', label: 'Data Pokok' },
                      { id: 'profil_pribadi', label: 'Info Pribadi' },
                      { id: 'pendidikan', label: 'Pendidikan' },
                      { id: 'kepegawaian', label: 'SK Kepegawaian' }
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setFormKepegawaianTab(tab.id as any)}
                        className={`flex-1 pb-2 border-b-2 text-[11px] font-bold text-center transition-all ${
                          formKepegawaianTab === tab.id
                            ? 'border-teal-650 text-teal-700'
                            : 'border-transparent text-gray-400 hover:text-gray-600'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {formKepegawaianTab === 'profil_dasar' && (
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-400 uppercase">Nama Lengkap & Gelar ASN/Tenaga Kerja</label>
                        <input
                          type="text"
                          className="w-full p-2 border border-gray-200 rounded-lg"
                          value={formPegawai.nama || ''}
                          onChange={(e) => setFormPegawai({ ...formPegawai, nama: e.target.value })}
                          placeholder="Contoh: Ir. Zulkifli Harahap, M.Si."
                          required
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-gray-400 uppercase">NIP Kepegawaian (Bila PNS)</label>
                          <input
                            type="text"
                            className="w-full p-2 border border-gray-200 rounded-lg font-mono"
                            value={formPegawai.nip || ''}
                            onChange={(e) => setFormPegawai({ ...formPegawai, nip: e.target.value })}
                            placeholder="19820110 2008..."
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-gray-400 uppercase">Status Hub. Kerja</label>
                          <select
                            className="w-full p-2 border border-gray-200 rounded-lg text-gray-700 bg-white"
                            value={formPegawai.statusKepegawaian || 'PNS'}
                            onChange={(e) => setFormPegawai({ ...formPegawai, statusKepegawaian: e.target.value as any })}
                          >
                            <option value="PNS">Aparatur Sipil Negara (PNS)</option>
                            <option value="PPPK">Pegawai Pemerintah PPPK</option>
                            <option value="Honorer">Honorer Dinas/Administrasi</option>
                            <option value="Tenaga Kontrak O&P">Tenaga Lapangan Juru Pintu Air</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-gray-400 uppercase">Jabatan Struktural/Fungsional</label>
                          <input
                            type="text"
                            className="w-full p-2 border border-gray-200 rounded-lg"
                            value={formPegawai.jabatan || ''}
                            onChange={(e) => setFormPegawai({ ...formPegawai, jabatan: e.target.value })}
                            placeholder="Contoh: Pengamat Jaringan D.I. Raya"
                            required
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-gray-400 uppercase">Golongan Pangkat</label>
                          <select
                            className="w-full p-2 border border-gray-200 rounded-lg text-gray-700 bg-white"
                            value={formPegawai.golongan || 'III/a'}
                            onChange={(e) => setFormPegawai({ ...formPegawai, golongan: e.target.value })}
                          >
                            <option value="I/a">I/a - Juru Muda</option>
                            <option value="I/b">I/b - Juru Muda Tingkat I</option>
                            <option value="I/c">I/c - Juru</option>
                            <option value="I/d">I/d - Juru Tingkat I</option>
                            <option value="II/a">II/a - Pengatur Muda</option>
                            <option value="II/b">II/b - Pengatur Muda Tingkat I</option>
                            <option value="II/c">II/c - Pengatur</option>
                            <option value="II/d">II/d - Pengatur Tingkat I</option>
                            <option value="III/a">III/a - Penata Muda</option>
                            <option value="III/b">III/b - Penata Muda Tingkat I</option>
                            <option value="III/c">III/c - Penata</option>
                            <option value="III/d">III/d - Penata Tingkat I</option>
                            <option value="IV/a">IV/a - Pembina</option>
                            <option value="IV/b">IV/b - Pembina Tingkat I</option>
                            <option value="IV/c">IV/c - Pembina Utama Muda</option>
                            <option value="IV/d">IV/d - Pembina Utama Madya</option>
                            <option value="IV/e">IV/e - Pembina Utama</option>
                            <option value="Non-ASN">Non-ASN / Tenaga Honorer</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-gray-400 uppercase">Nomor HP / WA</label>
                          <input
                            type="text"
                            className="w-full p-2 border border-gray-200 rounded-lg"
                            value={formPegawai.telepon || ''}
                            onChange={(e) => setFormPegawai({ ...formPegawai, telepon: e.target.value })}
                            placeholder="0812-..."
                            required
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-gray-400 uppercase">Alamat Email Aktif</label>
                          <input
                            type="email"
                            className="w-full p-2 border border-gray-200 rounded-lg font-mono"
                            value={formPegawai.email || ''}
                            onChange={(e) => setFormPegawai({ ...formPegawai, email: e.target.value })}
                            placeholder="pegawai@gmail.com"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {formKepegawaianTab === 'profil_pribadi' && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-gray-400 uppercase">Tempat Lahir</label>
                          <input
                            type="text"
                            className="w-full p-2 border border-gray-200 rounded-lg"
                            value={formPegawai.tempatLahir || ''}
                            onChange={(e) => setFormPegawai({ ...formPegawai, tempatLahir: e.target.value })}
                            placeholder="Kota Lahir (eg. Medan)"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-gray-400 uppercase">Tanggal Lahir</label>
                          <input
                            type="date"
                            className="w-full p-2 border border-gray-200 rounded-lg"
                            value={formPegawai.tanggalLahir || ''}
                            onChange={(e) => setFormPegawai({ ...formPegawai, tanggalLahir: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-gray-400 uppercase">Jenis Kelamin</label>
                          <select
                            className="w-full p-2 border border-gray-200 rounded-lg text-gray-700 bg-white"
                            value={formPegawai.jenisKelamin || 'Laki-laki'}
                            onChange={(e) => setFormPegawai({ ...formPegawai, jenisKelamin: e.target.value as any })}
                          >
                            <option value="Laki-laki">Laki-laki</option>
                            <option value="Perempuan">Perempuan</option>
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-gray-400 uppercase">Agama</label>
                          <select
                            className="w-full p-2 border border-gray-200 rounded-lg text-gray-700 bg-white"
                            value={formPegawai.agama || 'Islam'}
                            onChange={(e) => setFormPegawai({ ...formPegawai, agama: e.target.value })}
                          >
                            <option value="Islam">Islam</option>
                            <option value="Protestan">K. Protestan</option>
                            <option value="Katolik">K. Katolik</option>
                            <option value="Hindu">Hindu</option>
                            <option value="Buddha">Buddha</option>
                            <option value="Konghucu">Konghucu</option>
                            <option value="Lainnya">Lainnya</option>
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-gray-400 uppercase">Status Pernikahan</label>
                          <select
                            className="w-full p-2 border border-gray-200 rounded-lg text-gray-700 bg-white"
                            value={formPegawai.statusPerkawinan || 'Belum Kawin'}
                            onChange={(e) => setFormPegawai({ ...formPegawai, statusPerkawinan: e.target.value })}
                          >
                            <option value="Belum Kawin">Belum Kawin</option>
                            <option value="Kawin">Kawin</option>
                            <option value="Cerai Hidup">Cerai Hidup</option>
                            <option value="Cerai Mati">Cerai Mati</option>
                          </select>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-400 uppercase">Alamat Lengkap Tempat Tinggal</label>
                        <textarea
                          rows={3}
                          className="w-full p-2 border border-gray-200 rounded-lg"
                          value={formPegawai.alamat || ''}
                          onChange={(e) => setFormPegawai({ ...formPegawai, alamat: e.target.value })}
                          placeholder="Jalan, RT/RW, Kelurahan, Kecamatan, Kabupaten/Kota..."
                        />
                      </div>
                    </div>
                  )}

                  {formKepegawaianTab === 'pendidikan' && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between border-b pb-1">
                        <span className="font-bold text-gray-700">Riwayat Pendidikan (Awal s/d Akhir)</span>
                        <button
                          type="button"
                          onClick={() => {
                            const list = formPegawai.riwayatPendidikan || [];
                            setFormPegawai({
                              ...formPegawai,
                              riwayatPendidikan: [...list, { jenjang: 'SD', namaSekolah: '', alamatSekolah: '', tahunLulus: '' }]
                            });
                          }}
                          className="flex items-center gap-1 text-[11px] font-bold text-teal-600 hover:text-teal-700 hover:underline"
                        >
                          <Plus className="w-3.5 h-3.5" /> Tambah Jenjang
                        </button>
                      </div>

                      {(formPegawai.riwayatPendidikan || []).length === 0 ? (
                        <div className="p-4 border border-dashed border-gray-200 rounded-lg text-center text-gray-400 bg-gray-50/50">
                          Belum ada riwayat pendidikan. Silakan klik tombol "Tambah Jenjang" di atas.
                        </div>
                      ) : (
                        <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                          {(formPegawai.riwayatPendidikan || []).map((edu, idx) => (
                            <div key={idx} className="p-3 border border-gray-200 rounded-xl bg-gray-50/40 space-y-2 relative">
                              <button
                                type="button"
                                onClick={() => {
                                  const list = (formPegawai.riwayatPendidikan || []).filter((_, i) => i !== idx);
                                  setFormPegawai({ ...formPegawai, riwayatPendidikan: list });
                                }}
                                className="absolute top-2.5 right-2.5 text-red-500 hover:text-red-700 text-[10px] font-bold uppercase transition"
                              >
                                Hapus
                              </button>
                              
                              <div className="grid grid-cols-12 gap-2 text-xs">
                                <div className="col-span-3 space-y-0.5">
                                  <label className="text-[9px] font-bold text-gray-400 uppercase">Jenjang</label>
                                  <select
                                    value={edu.jenjang || 'SD'}
                                    onChange={(e) => {
                                      const list = [...(formPegawai.riwayatPendidikan || [])];
                                      list[idx] = { ...list[idx], jenjang: e.target.value };
                                      setFormPegawai({ ...formPegawai, riwayatPendidikan: list });
                                    }}
                                    className="w-full p-1.5 border border-gray-200 rounded text-xs bg-white text-gray-700"
                                  >
                                    <option value="SD">SD</option>
                                    <option value="SMP">SMP</option>
                                    <option value="SMA">SMA/SMK</option>
                                    <option value="D3">Diploma 3 (D3)</option>
                                    <option value="S1">Sarjana (S1)</option>
                                    <option value="S2">Magister (S2)</option>
                                    <option value="S3">Doktor (S3)</option>
                                  </select>
                                </div>
                                <div className="col-span-6 space-y-0.5">
                                  <label className="text-[9px] font-bold text-gray-400 uppercase">Nama Sekolah / Kampus</label>
                                  <input
                                    type="text"
                                    value={edu.namaSekolah || ''}
                                    onChange={(e) => {
                                      const list = [...(formPegawai.riwayatPendidikan || [])];
                                      list[idx] = { ...list[idx], namaSekolah: e.target.value };
                                      setFormPegawai({ ...formPegawai, riwayatPendidikan: list });
                                    }}
                                    placeholder="eg. Universitas Sumatera Utara"
                                    className="w-full p-1.5 border border-gray-200 rounded text-xs bg-white"
                                    required
                                  />
                                </div>
                                <div className="col-span-3 space-y-0.5">
                                  <label className="text-[9px] font-bold text-gray-400 uppercase">Thn Lulus</label>
                                  <input
                                    type="text"
                                    maxLength={4}
                                    value={edu.tahunLulus || ''}
                                    onChange={(e) => {
                                      const list = [...(formPegawai.riwayatPendidikan || [])];
                                      list[idx] = { ...list[idx], tahunLulus: e.target.value };
                                      setFormPegawai({ ...formPegawai, riwayatPendidikan: list });
                                    }}
                                    placeholder="2018"
                                    className="w-full p-1.5 border border-gray-200 rounded text-xs text-center bg-white font-mono"
                                    required
                                  />
                                </div>
                              </div>

                              <div className="space-y-0.5">
                                <label className="text-[9px] font-bold text-gray-400 uppercase">Alamat Sekolah / Instansi Pendidikan</label>
                                <input
                                  type="text"
                                  value={edu.alamatSekolah || ''}
                                  onChange={(e) => {
                                    const list = [...(formPegawai.riwayatPendidikan || [])];
                                    list[idx] = { ...list[idx], alamatSekolah: e.target.value };
                                    setFormPegawai({ ...formPegawai, riwayatPendidikan: list });
                                  }}
                                  placeholder="eg. Jl. Biologi No.1, Medan"
                                  className="w-full p-1.5 border border-gray-200 rounded text-xs bg-white"
                                  required
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {formKepegawaianTab === 'kepegawaian' && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between border-b pb-1">
                        <span className="font-bold text-gray-700">Pangkat, KGB & Riwayat Administrasi</span>
                        <button
                          type="button"
                          onClick={() => {
                            const list = formPegawai.riwayatKepegawaianDetail || [];
                            setFormPegawai({
                              ...formPegawai,
                              riwayatKepegawaianDetail: [...list, { skPangkat: '', tanggalSkPangkat: '', skGajiBerkala: '', tanggalSkGajiBerkala: '' }]
                            });
                          }}
                          className="flex items-center gap-1 text-[11px] font-bold text-teal-600 hover:text-teal-700 hover:underline"
                        >
                          <Plus className="w-3.5 h-3.5" /> Tambah SK
                        </button>
                      </div>

                      {(formPegawai.riwayatKepegawaianDetail || []).length === 0 ? (
                        <div className="p-4 border border-dashed border-gray-200 rounded-lg text-center text-gray-400 bg-gray-50/50">
                          Belum ada entri SK kepegawaian. Silakan klik "Tambah SK" di atas.
                        </div>
                      ) : (
                        <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                          {(formPegawai.riwayatKepegawaianDetail || []).map((car, idx) => (
                            <div key={idx} className="p-3 border border-gray-200 rounded-xl bg-gray-50/40 space-y-2 relative">
                              <button
                                type="button"
                                onClick={() => {
                                  const list = (formPegawai.riwayatKepegawaianDetail || []).filter((_, i) => i !== idx);
                                  setFormPegawai({ ...formPegawai, riwayatKepegawaianDetail: list });
                                }}
                                className="absolute top-2.5 right-2.5 text-red-500 hover:text-red-700 text-[10px] font-bold uppercase transition"
                              >
                                Hapus
                              </button>

                              <div className="grid grid-cols-2 gap-2 text-xs">
                                <div className="space-y-0.5">
                                  <label className="text-[9px] font-bold text-gray-400 uppercase">SK Pangkat / Golongan</label>
                                  <input
                                    type="text"
                                    value={car.skPangkat || ''}
                                    onChange={(e) => {
                                      const list = [...(formPegawai.riwayatKepegawaianDetail || [])];
                                      list[idx] = { ...list[idx], skPangkat: e.target.value };
                                      setFormPegawai({ ...formPegawai, riwayatKepegawaianDetail: list });
                                    }}
                                    placeholder="800/104/SK-KPG/..."
                                    className="w-full p-1.5 border border-gray-200 rounded text-xs bg-white"
                                    required
                                  />
                                </div>
                                <div className="space-y-0.5">
                                  <label className="text-[9px] font-bold text-gray-400 uppercase">Tgl SK Pangkat</label>
                                  <input
                                    type="date"
                                    value={car.tanggalSkPangkat || ''}
                                    onChange={(e) => {
                                      const list = [...(formPegawai.riwayatKepegawaianDetail || [])];
                                      list[idx] = { ...list[idx], tanggalSkPangkat: e.target.value };
                                      setFormPegawai({ ...formPegawai, riwayatKepegawaianDetail: list });
                                    }}
                                    className="w-full p-1.5 border border-gray-200 rounded text-xs bg-white"
                                    required
                                  />
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-2 text-xs">
                                <div className="space-y-0.5">
                                  <label className="text-[9px] font-bold text-gray-400 uppercase">SK Gaji Berkala (KGB)</label>
                                  <input
                                    type="text"
                                    value={car.skGajiBerkala || ''}
                                    onChange={(e) => {
                                      const list = [...(formPegawai.riwayatKepegawaianDetail || [])];
                                      list[idx] = { ...list[idx], skGajiBerkala: e.target.value };
                                      setFormPegawai({ ...formPegawai, riwayatKepegawaianDetail: list });
                                    }}
                                    placeholder="800/220/KGB-SDA/..."
                                    className="w-full p-1.5 border border-gray-200 rounded text-xs bg-white"
                                    required
                                  />
                                </div>
                                <div className="space-y-0.5">
                                  <label className="text-[9px] font-bold text-gray-400 uppercase">Tgl SK Gaji Berkala</label>
                                  <input
                                    type="date"
                                    value={car.tanggalSkGajiBerkala || ''}
                                    onChange={(e) => {
                                      const list = [...(formPegawai.riwayatKepegawaianDetail || [])];
                                      list[idx] = { ...list[idx], tanggalSkGajiBerkala: e.target.value };
                                      setFormPegawai({ ...formPegawai, riwayatKepegawaianDetail: list });
                                    }}
                                    className="w-full p-1.5 border border-gray-200 rounded text-xs bg-[#ffffff]"
                                    required
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Conditional Inputs Block 4: KEUANGAN */}
              {activeSubTab === 'keuangan' && (
                <div className="space-y-4 text-xs">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Uraian / Keterangan Transaksi Kas</label>
                    <input
                      type="text"
                      className="w-full p-2 border border-gray-200 rounded-lg"
                      value={formKeuangan.keterangan || ''}
                      onChange={(e) => setFormKeuangan({ ...formKeuangan, keterangan: e.target.value })}
                      placeholder="Contoh: Pembayaran Belanja ATK Kantor"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase">Jumlah Uang (Rupiah)</label>
                      <input
                        type="number"
                        min="1"
                        className="w-full p-2 border border-gray-200 rounded-lg font-mono font-bold text-indigo-700"
                        value={formKeuangan.jumlah || 0}
                        onChange={(e) => setFormKeuangan({ ...formKeuangan, jumlah: Number(e.target.value) })}
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase">Nomor SPD / SPM atau SP2D</label>
                      <input
                        type="text"
                        className="w-full p-2 border border-gray-200 rounded-lg font-mono"
                        value={formKeuangan.nomorSPDOrSPM || ''}
                        onChange={(e) => setFormKeuangan({ ...formKeuangan, nomorSPDOrSPM: e.target.value })}
                        placeholder="Contoh: SPM-00344/V/..."
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase">Jenis Alur Dana</label>
                      <select
                        className="w-full p-2 border border-gray-200 rounded-lg text-gray-700 font-bold"
                        value={formKeuangan.tipe || 'Pengeluaran'}
                        onChange={(e) => setFormKeuangan({ ...formKeuangan, tipe: e.target.value as any })}
                      >
                        <option value="Pengeluaran">🔴 Pengeluaran / SPM Din.</option>
                        <option value="Pemasukan">🟢 Pemasukan / Droping UP</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase">Kategori Belanja</label>
                      <select
                        className="w-full p-2 border border-gray-200 rounded-lg text-gray-600"
                        value={formKeuangan.kategori || 'Belanja Barang'}
                        onChange={(e) => setFormKeuangan({ ...formKeuangan, kategori: e.target.value as any })}
                      >
                        <option value="Belanja Pegawai">Belanja Pegawai/Gaji</option>
                        <option value="Belanja Barang">Belanja Barang/ATK</option>
                        <option value="Belanja Modal">Belanja Konstruksi Modal</option>
                        <option value="Pemeliharaan Irigasi">Pemeliharaan Saluran O&P</option>
                        <option value="Dana Darurat">Penanganan Bencana Alam</option>
                        <option value="Lain-lain">Lain-lain</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Tanggal Pencatatan Jurnal</label>
                    <input
                      type="date"
                      className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none"
                      value={formKeuangan.tanggal || ''}
                      onChange={(e) => setFormKeuangan({ ...formKeuangan, tanggal: e.target.value })}
                      required
                    />
                  </div>
                </div>
              )}

              {/* Conditional Inputs Block 5: ASET */}
              {activeSubTab === 'aset' && (
                <div className="space-y-4 text-xs">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Nama Barang / Inventaris Kantor</label>
                    <input
                      type="text"
                      className="w-full p-2 border border-gray-200 rounded-lg"
                      value={formAset.namaAset || ''}
                      onChange={(e) => setFormAset({ ...formAset, namaAset: e.target.value })}
                      placeholder="Contoh: Air AWLR Debit Gauge"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase">Kode Aset Penanda</label>
                      <input
                        type="text"
                        className="w-full p-2 border border-gray-200 rounded-lg font-mono text-gray-600"
                        value={formAset.kodeAset || ''}
                        onChange={(e) => setFormAset({ ...formAset, kodeAset: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase">Klasifikasi Kartu Inventaris Barang (KIB)</label>
                      <select
                        className="w-full p-2 border border-gray-200 rounded-lg text-gray-700 font-bold bg-white"
                        value={formAset.kategori || 'KIB B - Peralatan dan Mesin'}
                        onChange={(e) => setFormAset({ ...formAset, kategori: e.target.value as any })}
                      >
                        <option value="KIB A - Tanah">KIB A - Tanah & Lahan Kerja</option>
                        <option value="KIB B - Peralatan dan Mesin">KIB B - Peralatan dan Mesin</option>
                        <option value="KIB C - Gedung dan Bangunan">KIB C - Gedung dan Bangunan</option>
                        <option value="KIB D - Jalan, Irigasi, dan Jaringan">KIB D - Jalan, Irigasi, dan Jaringan</option>
                        <option value="KIB E - Aset Tetap Lainnya">KIB E - Aset Tetap Lainnya</option>
                        <option value="KIB F - Konstruksi dalam Pengerjaan">KIB F - Konstruksi dalam Pengerjaan</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase">Volume Jumlah</label>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          min="1"
                          className="w-full p-2 border border-gray-200 rounded-lg font-bold w-1/2"
                          value={formAset.jumlah || 1}
                          onChange={(e) => setFormAset({ ...formAset, jumlah: Number(e.target.value) })}
                          required
                        />
                        <input
                          type="text"
                          className="w-full p-2 border border-gray-200 rounded-lg w-1/2"
                          value={formAset.satuan || 'Unit'}
                          onChange={(e) => setFormAset({ ...formAset, satuan: e.target.value })}
                          placeholder="Unit / Set"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase">Status Kelayakan Kondisi</label>
                      <select
                        className="w-full p-2 border border-gray-200 rounded-lg text-gray-700 font-bold"
                        value={formAset.kondisi || 'Baik'}
                        onChange={(e) => setFormAset({ ...formAset, kondisi: e.target.value as any })}
                      >
                        <option value="Baik">Baik - Layak Jalan</option>
                        <option value="Rusak Ringan">Rusak Ringan - Perlu Perbaikan</option>
                        <option value="Rusak Berat">Rusak Berat - Non-Fungsional</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Lokasi Penempatan / Gudang</label>
                    <input
                      type="text"
                      className="w-full p-2 border border-gray-200 rounded-lg"
                      value={formAset.lokasiPenyimpanan || ''}
                      onChange={(e) => setFormAset({ ...formAset, lokasiPenyimpanan: e.target.value })}
                      placeholder="Contoh: Pool Alat Berat Dinas Asahan"
                      required
                    />
                  </div>
                </div>
              )}



              {/* Form Footer Action control buttons */}
              <div className="pt-3 border-t border-gray-100 flex justify-end gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-200 text-gray-500 font-medium rounded-lg hover:bg-gray-50 transition-all focus:outline-none"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-lg hover:shadow transition-all focus:outline-none"
                >
                  {editingItem ? 'Simpan' : 'Tambahkan'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Employee Detail Dossier Modal View */}
      {selectedPegawaiDetail && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden border border-gray-100 flex flex-col animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-5 border-b border-gray-100 bg-teal-50 flex justify-between items-center select-none">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-teal-600 rounded-full flex items-center justify-center text-white font-extrabold text-base shadow">
                  {selectedPegawaiDetail.nama.charAt(0)}
                </div>
                <div>
                  <h3 className="font-extrabold text-gray-950 text-sm tracking-tight">{selectedPegawaiDetail.nama}</h3>
                  <p className="text-[10px] font-mono text-gray-500">NIP: {selectedPegawaiDetail.nip || '-'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                  selectedPegawaiDetail.statusKepegawaian === 'PNS' 
                    ? 'bg-blue-100 text-blue-800' 
                    : selectedPegawaiDetail.statusKepegawaian === 'PPPK' ? 'bg-indigo-100 text-indigo-800' : 'bg-amber-100 text-amber-950'
                }`}>
                  {selectedPegawaiDetail.statusKepegawaian}
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedPegawaiDetail(null)}
                  className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-200/50 rounded-lg transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Scrollable Content */}
            <div className="p-6 overflow-y-auto space-y-6 text-xs text-gray-700 flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 leading-relaxed">
                {/* Left side: Personal details */}
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-155 space-y-3">
                  <h4 className="font-bold text-gray-905 border-b pb-1 text-[11px] uppercase tracking-wide text-teal-800">
                    Informasi Pribadi & Kontak
                  </h4>
                  <div className="space-y-2">
                    <div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase block">Tempat, Tanggal Lahir</span>
                      <span className="font-medium text-gray-800">
                        {selectedPegawaiDetail.tempatLahir || '-'}, {selectedPegawaiDetail.tanggalLahir || '-'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase block">Jenis Kelamin</span>
                      <span className="font-medium text-gray-800">{selectedPegawaiDetail.jenisKelamin || '-'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase block">Agama</span>
                      <span className="font-medium text-gray-800">{selectedPegawaiDetail.agama || '-'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase block">Status Perkawinan</span>
                      <span className="font-medium text-gray-800">{selectedPegawaiDetail.statusPerkawinan || '-'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase block">Alamat Tinggal</span>
                      <span className="font-medium text-gray-800 text-[11px] leading-tight block whitespace-pre-line">
                        {selectedPegawaiDetail.alamat || '-'}
                      </span>
                    </div>
                    <div className="pt-2 border-t border-gray-200/60 grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-[9px] font-bold text-gray-400 uppercase block">Telepon</span>
                        <span className="font-mono text-gray-800">{selectedPegawaiDetail.telepon || '-'}</span>
                      </div>
                      <div>
                        <span className="text-[9px] font-bold text-gray-400 uppercase block">Email</span>
                        <span className="font-mono text-gray-800 text-[10px] truncate block" title={selectedPegawaiDetail.email}>
                          {selectedPegawaiDetail.email || '-'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right side: Jabatan Detail */}
                <div className="space-y-4">
                  <div className="bg-teal-50/20 p-4 rounded-xl border border-teal-100/50 space-y-2">
                    <h4 className="font-bold text-teal-900 border-b border-teal-100/65 pb-1 text-[11px] uppercase tracking-wide">
                      Posisi & Golongan
                    </h4>
                    <div>
                      <span className="text-[10px] font-bold text-teal-600 uppercase block">Jabatan</span>
                      <span className="font-extrabold text-gray-900 text-[11.5px] whitespace-pre-line leading-snug">{selectedPegawaiDetail.jabatan}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-teal-600 uppercase block">Pangkat / Golongan</span>
                      <span className="font-bold text-gray-850 font-mono text-[11px]">{selectedPegawaiDetail.golongan || 'Non-ASN'}</span>
                    </div>
                  </div>

                  {/* Riwayat Pendidikan Timeline */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5 font-bold text-gray-900 text-[11px] uppercase tracking-wide border-b pb-1">
                      <GraduationCap className="w-4 h-4 text-teal-700" />
                      <span>Riwayat Pendidikan</span>
                    </div>
                    
                    {(!selectedPegawaiDetail.riwayatPendidikan || selectedPegawaiDetail.riwayatPendidikan.length === 0) ? (
                      <p className="text-gray-400 text-center py-2 bg-gray-50 rounded-lg">Belum ada riwayat pendidikan.</p>
                    ) : (
                      <div className="space-y-2.5 max-h-[160px] overflow-y-auto pr-1">
                        {selectedPegawaiDetail.riwayatPendidikan.map((edu, idx) => (
                          <div key={idx} className="relative pl-4 border-l border-teal-300">
                            <div className="absolute -left-1.5 top-1 w-3 h-3 bg-teal-500 rounded-full border-2 border-white shadow" />
                            <div className="text-[11.5px] font-extrabold text-gray-900 leading-none">
                              {edu.jenjang} - {edu.namaSekolah}
                            </div>
                            <div className="text-[10px] text-gray-500 mt-0.5">
                              Tahun Lulus: <strong className="font-mono text-gray-700">{edu.tahunLulus}</strong>
                            </div>
                            {edu.alamatSekolah && (
                              <div className="text-[9.5px] text-gray-400 italic font-medium leading-tight">
                                {edu.alamatSekolah}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Bottom Row - Riwayat SK Detail */}
              <div className="space-y-2 border-t pt-4">
                <div className="flex items-center gap-1.5 font-bold text-gray-900 text-[11px] uppercase tracking-wide border-b pb-1">
                  <Briefcase className="w-4 h-4 text-teal-700" />
                  <span>Riwayat SK Pangkat & Gaji Berkala</span>
                </div>

                {(!selectedPegawaiDetail.riwayatKepegawaianDetail || selectedPegawaiDetail.riwayatKepegawaianDetail.length === 0) ? (
                  <p className="text-gray-400 text-center py-4 bg-gray-50 rounded-lg">Belum ada riwayat SK kepegawaian.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-gray-600 border border-gray-150 rounded-lg">
                      <thead>
                        <tr className="bg-gray-100/70 border-b border-gray-150 font-bold text-gray-800 text-[10px] uppercase">
                          <th className="p-2">No.</th>
                          <th className="p-2">SK Pangkat</th>
                          <th className="p-2">Tgl SK Pangkat</th>
                          <th className="p-2">SK Gaji Berkala</th>
                          <th className="p-2">Tgl Gaji Berkala</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {selectedPegawaiDetail.riwayatKepegawaianDetail.map((car, idx) => (
                          <tr key={idx} className="hover:bg-gray-50/50">
                            <td className="p-2 font-bold text-gray-400">{idx + 1}</td>
                            <td className="p-2 font-mono text-gray-800 break-all">{car.skPangkat}</td>
                            <td className="p-2 text-gray-650 whitespace-nowrap">{car.tanggalSkPangkat || '-'}</td>
                            <td className="p-2 font-mono text-gray-800 break-all">{car.skGajiBerkala}</td>
                            <td className="p-2 text-gray-650 whitespace-nowrap">{car.tanggalSkGajiBerkala || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 p-4 border-t border-gray-100 flex justify-end select-none">
              <button
                type="button"
                onClick={() => setSelectedPegawaiDetail(null)}
                className="py-1.5 px-5 bg-teal-600 hover:bg-teal-700 text-white font-extrabold rounded-lg transition shadow focus:outline-none text-xs"
              >
                Tutup Dossier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dynamic Unified Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 text-center">
              <div className="w-12 h-12 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-3">
                <Trash2 className="w-5 h-5 text-rose-600" />
              </div>
              <h3 className="font-bold text-gray-900 text-sm">Konfirmasi Hapus Data</h3>
              <p className="text-xs text-gray-500 mt-1">
                Apakah Anda yakin ingin menghapus <strong className="text-gray-800">{deleteConfirm.name}</strong>? Tindakan ini tidak bisa dibatalkan.
              </p>
            </div>
            <div className="bg-gray-50 px-5 py-3.5 flex justify-end gap-2 text-xs">
              <button 
                type="button" 
                onClick={() => setDeleteConfirm(null)} 
                className="py-1.5 px-4 text-gray-600 hover:text-gray-900 font-medium bg-white border border-gray-200 rounded-lg hover:bg-gray-100 transition-all focus:outline-none"
              >
                Batal
              </button>
              <button 
                type="button" 
                onClick={() => {
                  if (deleteConfirm.type === 'surat-masuk') onDeleteSuratMasuk(deleteConfirm.id);
                  else if (deleteConfirm.type === 'surat-keluar') onDeleteSuratKeluar(deleteConfirm.id);
                  else if (deleteConfirm.type === 'pegawai') onDeletePegawai(deleteConfirm.id);
                  else if (deleteConfirm.type === 'keuangan') onDeleteKeuangan(deleteConfirm.id);
                  else if (deleteConfirm.type === 'aset') onDeleteAset(deleteConfirm.id);
                  setDeleteConfirm(null);
                }} 
                className="py-1.5 px-4 text-white font-extrabold bg-rose-600 hover:bg-rose-700 rounded-lg transition-all shadow-sm focus:outline-none"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
