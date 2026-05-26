/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Building, 
  MapPin, 
  Search, 
  Filter, 
  Plus, 
  Trash2, 
  Edit3, 
  Droplets, 
  Compass, 
  CheckCircle, 
  AlertTriangle, 
  Layers, 
  BookOpen,
  ArrowRight,
  Info,
  Camera,
  Video,
  X,
  Sparkles,
  Waves
} from 'lucide-react';
import { DaerahIrigasi, Sungai } from '../types';

const compressAndResizeImage = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width = Math.round((width * MAX_HEIGHT) / height);
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(event.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        // Reduce quality to 0.6 and use JPEG format to get extremely lightweight payload
        const dataUrl = canvas.toDataURL('image/jpeg', 0.6);
        resolve(dataUrl);
      };
      img.onerror = () => {
        resolve(event.target?.result as string);
      };
    };
    reader.onerror = (err) => {
      reject(err);
    };
    reader.readAsDataURL(file);
  });
};

interface SeksiOPViewProps {
  daerahIrigasi: DaerahIrigasi[];
  onAddDI: (di: DaerahIrigasi) => void;
  onEditDI: (di: DaerahIrigasi) => void;
  onDeleteDI: (id: string) => void;
  sungai?: Sungai[];
  onAddSungai?: (s: Sungai) => void;
  onEditSungai?: (s: Sungai) => void;
  onDeleteSungai?: (id: string) => void;
  canInput?: boolean;
}

export default function SeksiOPView({
  daerahIrigasi,
  onAddDI,
  onEditDI,
  onDeleteDI,
  sungai = [],
  onAddSungai,
  onEditSungai,
  onDeleteSungai,
  canInput = true
}: SeksiOPViewProps) {
  const [activeSubTab, setActiveSubTab] = useState<'irigasi' | 'sungai'>('irigasi');
  const [searchTerm, setSearchTerm] = useState('');
  const [conditionFilter, setConditionFilter] = useState('all');
  const [sizeFilter, setSizeFilter] = useState('all');
  
  // Selected DI for Interactive Schema / Flow simulation
  const [selectedDIId, setSelectedDIId] = useState<string>(daerahIrigasi[0]?.id || '');
  const [riverFlowLevel, setRiverFlowLevel] = useState<'Normal' | 'Banjir' | 'Kering'>('Normal');
  const [gateOpenState, setGateOpenState] = useState<boolean>(true);

  // Selected Sungai state
  const [selectedSungaiId, setSelectedSungaiId] = useState<string>(sungai[0]?.id || '');
  const [riverInteractiveFlow, setRiverInteractiveFlow] = useState<string>('Normal');
  const [waterGateMannedCount, setWaterGateMannedCount] = useState<number>(3);

  // Form State Daerah Irigasi
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDI, setEditingDI] = useState<DaerahIrigasi | null>(null);
  
  // Custom Delete Confirm State
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; name: string } | null>(null);

  // Form State Sungai
  const [isSungaiModalOpen, setIsSungaiModalOpen] = useState(false);
  const [editingSungai, setEditingSungai] = useState<Sungai | null>(null);
  const [deleteSungaiConfirm, setDeleteSungaiConfirm] = useState<{ id: string; name: string } | null>(null);

  const [sungaiSearchTerm, setSungaiSearchTerm] = useState('');
  const [sungaiStatusFilter, setSungaiStatusFilter] = useState('all');
  const [sungaiTanggulFilter, setSungaiTanggulFilter] = useState('all');

  const [sungaiFormFields, setSungaiFormFields] = useState({
    nama: '',
    panjangKm: 30,
    luasDasKm2: 150,
    debitRerataM3s: 5,
    statusAliran: 'Normal',
    lokasiSeksi: '',
    koordinatHulu: '',
    koordinatHilir: '',
    jumlahPintuAir: 2,
    kondisiTanggul: 'Baik',
    keterangan: ''
  });
  
  const [formFields, setFormFields] = useState({
    nama: '',
    kodeRegistrasi: '',
    luasArealHa: 1000,
    sumberAir: '',
    lokasi: '',
    kondisi: 80,
    kewenangan: 'Provinsi',
    bangunanPendukung: [] as any[],

    // Compatibility properties
    luasFungsionalHa: 1000,
    luasRencanaHa: 1000,
    kabupatenKota: 'Simalungun',
    kecamatan: '',
    panjangSaluranPrimerM: 5000,
    panjangSaluranSekunderM: 10000,
    jumlahBendung: 1,
    jumlahBangunanBagiSadap: 10,
    kondisiSaluranPct: 80,
    statusKewenangan: 'Provinsi' as any,
    keteranganOP: ''
  });

  // Temporary state for the building item being added inline
  const [newBp, setNewBp] = useState({
    nama: '',
    kategori: 'Pintu Sadap',
    kondisiFisik: 'Baik',
    keterangan: '',
    koordinat: '',
    fotoUrl: ''
  });

  // Geolocation locking tracker
  const [gpsLoading, setGpsLoading] = useState(false);

  const getRealGPSLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolokasi tidak didukung oleh browser Anda.");
      return;
    }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setGpsLoading(false);
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        const latDirection = lat >= 0 ? "N" : "S";
        const lngDirection = lng >= 0 ? "E" : "W";
        const formatted = `${Math.abs(lat).toFixed(6)}° ${latDirection}, ${Math.abs(lng).toFixed(6)}° ${lngDirection}`;
        setNewBp(prev => ({ ...prev, koordinat: formatted }));
      },
      (error) => {
        setGpsLoading(false);
        console.error("Error getting geolocation:", error);
        let errorMsg = "Gagal mengambil GPS.";
        if (error.code === error.PERMISSION_DENIED) {
          errorMsg = "Akses lokasi ditolak! Silakan aktifkan izin GPS pada peramban Anda.";
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          errorMsg = "Informasi lokasi GPS tidak terdeteksi atau perangkat offline.";
        } else if (error.code === error.TIMEOUT) {
          errorMsg = "Permintaan mengunci sinyal GPS timeout.";
        }
        alert(errorMsg + "\n\nMenyediakan koordinat regional Simalungun sebagai simulasi.");
        
        const fallbackCoord = `${(2.91 + Math.random() * 0.1).toFixed(6)}° N, ${(99.06 + Math.random() * 0.1).toFixed(6)}° E`;
        setNewBp(prev => ({ ...prev, koordinat: fallbackCoord }));
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
    );
  };

  const selectedDI = daerahIrigasi.find(di => di.id === selectedDIId) || daerahIrigasi[0];

  // Filtering logic
  const filteredDIs = daerahIrigasi.filter(di => {
    const searchVal = searchTerm.toLowerCase();
    const diNama = di.nama.toLowerCase();
    const diKec = (di.lokasi || di.kecamatan || '').toLowerCase();
    const diSumber = (di.sumberAir || '').toLowerCase();
    const diKode = (di.kodeRegistrasi || '').toLowerCase();
    
    const matchesSearch = diNama.includes(searchVal) || 
                          diKec.includes(searchVal) || 
                          diSumber.includes(searchVal) ||
                          diKode.includes(searchVal);
    
    const currentKondisi = di.kondisi || di.kondisiSaluranPct || 0;
    const currentLuas = di.luasArealHa || di.luasFungsionalHa || 0;
    
    let matchesCondition = true;
    if (conditionFilter === 'baik') matchesCondition = currentKondisi >= 80;
    else if (conditionFilter === 'sedang') matchesCondition = currentKondisi >= 70 && currentKondisi < 80;
    else if (conditionFilter === 'kritis') matchesCondition = currentKondisi < 70;

    let matchesSize = true;
    if (sizeFilter === 'kecil') matchesSize = currentLuas < 1500;
    else if (sizeFilter === 'menengah') matchesSize = currentLuas >= 1500 && currentLuas <= 3000;
    else if (sizeFilter === 'besar') matchesSize = currentLuas > 3000;

    return matchesSearch && matchesCondition && matchesSize;
  });

  // Calculate quick metrics for current matches
  const totalFungsionalHa = filteredDIs.reduce((sum, item) => sum + (item.luasArealHa || item.luasFungsionalHa || 0), 0);
  
  // count total bendung utama
  const totalBendung = filteredDIs.reduce((sum, item) => {
    if (item.bangunanPendukung && item.bangunanPendukung.length > 0) {
      return sum + item.bangunanPendukung.filter(b => b.kategori?.toLowerCase().includes('bendung')).length;
    }
    return sum + (item.jumlahBendung || 0);
  }, 0);

  const averageConditionPct = filteredDIs.length > 0 
    ? Math.round(filteredDIs.reduce((sum, item) => sum + (item.kondisi || item.kondisiSaluranPct || 0), 0) / filteredDIs.length) 
    : 0;

  // River filtering and selection logic
  const filteredSungai = (sungai || []).filter(s => {
    const searchVal = sungaiSearchTerm.toLowerCase();
    const sNama = (s.nama || '').toLowerCase();
    const sSeksi = (s.lokasiSeksi || '').toLowerCase();
    const sKet = (s.keterangan || '').toLowerCase();
    
    const matchesSearch = sNama.includes(searchVal) || 
                          sSeksi.includes(searchVal) || 
                          sKet.includes(searchVal);
    
    const matchesStatus = sungaiStatusFilter === 'all' || s.statusAliran === sungaiStatusFilter;
    const matchesTanggul = sungaiTanggulFilter === 'all' || s.kondisiTanggul === sungaiTanggulFilter;
    
    return matchesSearch && matchesStatus && matchesTanggul;
  });

  const selectedSungai = (sungai || []).find(s => s.id === selectedSungaiId) || (sungai || [])[0] || null;

  // Open modal for adding
  const handleOpenAddModal = () => {
    setEditingDI(null);
    setFormFields({
      nama: '',
      kodeRegistrasi: `DI-REG-${Math.floor(Math.random() * 900000) + 100000}`,
      luasArealHa: 1500,
      sumberAir: 'Sungai Bah Bolon',
      lokasi: 'Kec. Tanah Jawa',
      kondisi: 80,
      kewenangan: 'Provinsi',
      bangunanPendukung: [],

      // Comp
      luasFungsionalHa: 1500,
      luasRencanaHa: 1500,
      kabupatenKota: 'Simalungun',
      kecamatan: 'Kec. Tanah Jawa',
      panjangSaluranPrimerM: 6000,
      panjangSaluranSekunderM: 12000,
      jumlahBendung: 1,
      jumlahBangunanBagiSadap: 15,
      kondisiSaluranPct: 80,
      statusKewenangan: 'Provinsi',
      keteranganOP: ''
    });
    setNewBp({
      nama: '',
      kategori: 'Pintu Sadap',
      kondisiFisik: 'Baik',
      keterangan: '',
      koordinat: '',
      fotoUrl: ''
    });
    setIsModalOpen(true);
  };

  // Open modal for editing
  const handleOpenEditModal = (di: DaerahIrigasi) => {
    setEditingDI(di);
    setFormFields({
      nama: di.nama,
      kodeRegistrasi: di.kodeRegistrasi || `DI-REG-${Math.floor(Math.random() * 900000) + 100000}`,
      luasArealHa: di.luasArealHa || di.luasFungsionalHa,
      sumberAir: di.sumberAir || 'Sungai Bah Bolon',
      lokasi: di.lokasi || di.kecamatan,
      kondisi: di.kondisi || di.kondisiSaluranPct || 80,
      kewenangan: di.kewenangan || di.statusKewenangan || 'Provinsi',
      bangunanPendukung: di.bangunanPendukung || [],

      // Comp
      luasFungsionalHa: di.luasFungsionalHa,
      luasRencanaHa: di.luasRencanaHa,
      kabupatenKota: di.kabupatenKota,
      kecamatan: di.kecamatan,
      panjangSaluranPrimerM: di.panjangSaluranPrimerM,
      panjangSaluranSekunderM: di.panjangSaluranSekunderM,
      jumlahBendung: di.jumlahBendung,
      jumlahBangunanBagiSadap: di.jumlahBangunanBagiSadap,
      kondisiSaluranPct: di.kondisiSaluranPct,
      statusKewenangan: di.statusKewenangan,
      keteranganOP: di.keteranganOP
    });
    setNewBp({
      nama: '',
      kategori: 'Pintu Sadap',
      kondisiFisik: 'Baik',
      keterangan: '',
      koordinat: '',
      fotoUrl: ''
    });
    setIsModalOpen(true);
  };

  // Submit modal form
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formFields.nama.trim()) return alert('Nama Daerah Irigasi harus diisi!');

    const currentBps = formFields.bangunanPendukung || [];
    const payload: DaerahIrigasi = {
      ...(editingDI || {}),
      id: editingDI ? editingDI.id : `DI-${Date.now()}`,
      nama: formFields.nama,
      kodeRegistrasi: formFields.kodeRegistrasi,
      luasArealHa: Number(formFields.luasArealHa),
      sumberAir: formFields.sumberAir,
      lokasi: formFields.lokasi,
      kondisi: Number(formFields.kondisi),
      kewenangan: formFields.kewenangan,
      bangunanPendukung: currentBps,

      // Sync compatibility properties for charts, maps and simulations
      luasFungsionalHa: Number(formFields.luasArealHa),
      luasRencanaHa: Number(formFields.luasArealHa),
      kabupatenKota: 'Simalungun',
      kecamatan: formFields.lokasi,
      panjangSaluranPrimerM: formFields.panjangSaluranPrimerM || 5000,
      panjangSaluranSekunderM: formFields.panjangSaluranSekunderM || 10000,
      jumlahBendung: currentBps.filter(b => b.kategori?.toLowerCase().includes('bendung')).length || 1,
      jumlahBangunanBagiSadap: currentBps.filter(b => !b.kategori?.toLowerCase().includes('bendung')).length || 10,
      kondisiSaluranPct: Number(formFields.kondisi),
      statusKewenangan: (formFields.kewenangan === 'Pusat' || formFields.kewenangan === 'Provinsi' || formFields.kewenangan === 'Kabupaten') ? formFields.kewenangan : 'Provinsi',
      keteranganOP: `Sumber Air: ${formFields.sumberAir}. Memiliki ${currentBps.length} bangunan pendukung terdaftar.`
    };

    if (editingDI) {
      onEditDI(payload);
    } else {
      onAddDI(payload);
      setSelectedDIId(payload.id);
    }
    setIsModalOpen(false);
  };

  // Submit Sungai Form
  const handleSungaiSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sungaiFormFields.nama.trim()) return alert('Nama Sungai harus diisi!');
    const payload: Sungai = {
      id: editingSungai ? editingSungai.id : `S-${Date.now()}`,
      nama: sungaiFormFields.nama,
      panjangKm: Number(sungaiFormFields.panjangKm),
      luasDasKm2: Number(sungaiFormFields.luasDasKm2),
      debitRerataM3s: Number(sungaiFormFields.debitRerataM3s),
      statusAliran: sungaiFormFields.statusAliran,
      lokasiSeksi: sungaiFormFields.lokasiSeksi,
      koordinatHulu: sungaiFormFields.koordinatHulu,
      koordinatHilir: sungaiFormFields.koordinatHilir,
      jumlahPintuAir: Number(sungaiFormFields.jumlahPintuAir),
      kondisiTanggul: sungaiFormFields.kondisiTanggul,
      keterangan: sungaiFormFields.keterangan || ''
    };
    if (editingSungai) {
      onEditSungai?.(payload);
    } else {
      onAddSungai?.(payload);
      setSelectedSungaiId(payload.id);
    }
    setIsSungaiModalOpen(false);
  };

  const handleOpenAddSungaiModal = () => {
    setEditingSungai(null);
    setSungaiFormFields({
      nama: '',
      panjangKm: 30,
      luasDasKm2: 150,
      debitRerataM3s: 5,
      statusAliran: 'Normal',
      lokasiSeksi: 'Kec. Siantar',
      koordinatHulu: '2°52\'10" N, 98°50\'25" E',
      koordinatHilir: '2°59\'45" N, 99°05\'30" E',
      jumlahPintuAir: 2,
      kondisiTanggul: 'Baik',
      keterangan: ''
    });
    setIsSungaiModalOpen(true);
  };

  const handleOpenEditSungaiModal = (s: Sungai) => {
    setEditingSungai(s);
    setSungaiFormFields({
      nama: s.nama,
      panjangKm: s.panjangKm,
      luasDasKm2: s.luasDasKm2,
      debitRerataM3s: s.debitRerataM3s,
      statusAliran: s.statusAliran,
      lokasiSeksi: s.lokasiSeksi || 'Kec. Siantar',
      koordinatHulu: s.koordinatHulu || '2°52\'10" N, 98°50\'25" E',
      koordinatHilir: s.koordinatHilir || '2°59\'45" N, 99°05\'30" E',
      jumlahPintuAir: s.jumlahPintuAir || 2,
      kondisiTanggul: s.kondisiTanggul || 'Baik',
      keterangan: s.keterangan || ''
    });
    setIsSungaiModalOpen(true);
  };

  return (
    <div id="seksi-op-view" className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <Compass className="w-7 h-7 text-teal-600" />
            Seksi Operasi & Pemeliharaan (O&P)
          </h1>
          <p className="text-xs text-gray-500">
            {activeSubTab === 'irigasi' 
              ? "Daftar Inventarisasi Daerah Irigasi (D.I.) kewenangan UPTD PSDA Bah Bolon Provinsi Sumatera Utara"
              : "Daftar Inventarisasi Aliran Sungai kewenangan UPTD PSDA Bah Bolon Provinsi Sumatera Utara"
            }
          </p>
        </div>
        {canInput && (
          <button
            onClick={activeSubTab === 'irigasi' ? handleOpenAddModal : handleOpenAddSungaiModal}
            className="flex items-center gap-2 bg-teal-600 text-white font-medium px-4 py-2 rounded-lg hover:bg-teal-700 hover:shadow-md transition-all text-xs"
          >
            <Plus className="w-4 h-4" /> 
            {activeSubTab === 'irigasi' ? "Tambah Daerah Irigasi (D.I)" : "+ Daftarkan Sungai Baru"}
          </button>
        )}
      </div>

      {/* Subtab Navigation */}
      <div className="flex bg-slate-100 p-1.5 rounded-xl border border-gray-200/60 max-w-md">
        <button
          onClick={() => setActiveSubTab('irigasi')}
          className={`flex-1 py-2 px-4 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${
            activeSubTab === 'irigasi'
              ? 'bg-white text-teal-700 shadow-sm border border-gray-200/40'
              : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          Daerah Irigasi
        </button>
        <button
          onClick={() => setActiveSubTab('sungai')}
          className={`flex-1 py-2 px-4 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${
            activeSubTab === 'sungai'
              ? 'bg-white text-teal-700 shadow-sm border border-gray-200/40'
              : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          <Waves className="w-4 h-4" />
          Daftar Sungai
        </button>
      </div>

      {activeSubTab === 'irigasi' ? (
        <>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-100 flex items-center gap-4 shadow-sm">
          <div className="p-3 bg-teal-50 text-teal-600 rounded-lg">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">Total Luas Fungsional</p>
            <h4 className="text-xl font-bold text-gray-800 mt-0.5">{totalFungsionalHa.toLocaleString('id-ID')} Ha</h4>
            <p className="text-[10px] text-gray-500">Dari {filteredDIs.length} D.I. terfilter</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-100 flex items-center gap-4 shadow-sm">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
            <Building className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">Total Bendung Utama</p>
            <h4 className="text-xl font-bold text-gray-800 mt-0.5">{totalBendung} Bendung</h4>
            <p className="text-[10px] text-indigo-600 font-medium">Beban kerja pemeliharaan swakelola</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-100 flex items-center gap-4 shadow-sm">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
            <Droplets className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">Rerata Kondisi Saluran</p>
            <h4 className="text-xl font-bold text-gray-800 mt-0.5">{averageConditionPct}% Baik</h4>
            <div className="w-24 bg-gray-100 rounded-full h-1.5 mt-1.5 overflow-hidden">
              <div 
                className={`h-full transition-all duration-500 ${
                  averageConditionPct >= 80 ? 'bg-emerald-500' : averageConditionPct >= 70 ? 'bg-amber-500' : 'bg-red-500'
                }`}
                style={{ width: `${averageConditionPct}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Split Pane: List & Search vs Interactive Simulation Schema */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: DI List Table (8 columns) */}
        <div className="lg:col-span-8 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col justify-between">
          <div className="p-5 border-b border-gray-100 space-y-4">
            <h3 className="font-bold text-gray-800 text-sm">Inventarisasi Fisik Jaringan Irigasi</h3>
            
            {/* Filter controls */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Cari D.I. atau Kecamatan..."
                  className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-xs focus:ring-1 focus:ring-teal-500 focus:outline-none"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="flex gap-2">
                {/* Condition Filter */}
                <select
                  className="bg-white border border-gray-200 rounded-lg py-2 px-3 text-xs focus:ring-1 focus:ring-teal-500 text-gray-600 focus:outline-none"
                  value={conditionFilter}
                  onChange={(e) => setConditionFilter(e.target.value)}
                >
                  <option value="all">Kondisi (Semua)</option>
                  <option value="baik">Sangat Baik (≥80%)</option>
                  <option value="sedang">Sedang (70% - 79%)</option>
                  <option value="kritis">Kritis (&lt;70%)</option>
                </select>

                {/* Size Filter */}
                <select
                  className="bg-white border border-gray-200 rounded-lg py-2 px-3 text-xs focus:ring-1 focus:ring-teal-500 text-gray-600 focus:outline-none"
                  value={sizeFilter}
                  onChange={(e) => setSizeFilter(e.target.value)}
                >
                  <option value="all">Luas Ha (Semua)</option>
                  <option value="kecil">Kecil (&lt;1.500 Ha)</option>
                  <option value="menengah">Sedang (1.500-3.000 Ha)</option>
                  <option value="besar">Besar (&gt;3.000 Ha)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-gray-400 text-[10px] font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">Nama D.I. / Kode</th>
                  <th className="py-3 px-4">Luas Areal</th>
                  <th className="py-3 px-4">Sumber Air</th>
                  <th className="py-3 px-4">Lokasi</th>
                  <th className="py-3 px-4 text-center">Bangunan Pendukung</th>
                  <th className="py-3 px-4">Kondisi</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-xs text-gray-600">
                {filteredDIs.length > 0 ? (
                  filteredDIs.map((di) => (
                    <tr 
                      key={di.id} 
                      className={`hover:bg-teal-50/20 transition-all cursor-pointer ${selectedDIId === di.id ? 'bg-teal-50/40 font-medium' : ''}`}
                      onClick={() => setSelectedDIId(di.id)}
                    >
                      <td className="py-3.5 px-4">
                        <div>
                          <p className="font-bold text-gray-800 flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-teal-500"></span>
                            {di.nama}
                          </p>
                          <span className="text-[10px] text-gray-400">Kode: {di.kodeRegistrasi || 'N/A'} • {di.kewenangan || di.statusKewenangan || 'Provinsi'}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-gray-700">{(di.luasArealHa || di.luasFungsionalHa)?.toLocaleString('id-ID')} Ha</p>
                      </td>
                      <td className="py-3.5 px-4 text-gray-600 font-medium whitespace-nowrap">
                        {di.sumberAir || 'Sungai Bah Bolon'}
                      </td>
                      <td className="py-3.5 px-4 text-gray-500 max-w-[140px] truncate" title={di.lokasi || di.kecamatan}>
                        {di.lokasi || di.kecamatan}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="bg-indigo-55/70 text-indigo-700 font-bold px-2 py-0.5 rounded text-[10px] border border-indigo-100">
                          {di.bangunanPendukung?.length || 0} Unit
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <span className={`font-bold ${
                            (di.kondisi || di.kondisiSaluranPct) >= 80 ? 'text-emerald-600' : (di.kondisi || di.kondisiSaluranPct) >= 70 ? 'text-amber-600' : 'text-rose-600'
                          }`}>
                            {di.kondisi || di.kondisiSaluranPct}%
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        {canInput ? (
                          <div className="flex justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenEditModal(di)}
                              className="p-1.5 text-blue-600 rounded hover:bg-blue-50"
                              title="Edit"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                setDeleteConfirm({ id: di.id, name: di.nama });
                              }}
                              className="p-1.5 text-rose-600 rounded hover:bg-rose-50"
                              title="Hapus"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-[10px] bg-gray-100 text-gray-500 font-bold px-2 py-0.5 rounded">Hanya Lihat</span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-gray-400">
                      Tidak ada Daerah Irigasi yang cocok dengan kriteria filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          <div className="border-t border-gray-100 bg-gray-50 px-5 py-3.5 text-xs text-gray-500">
            * Klik baris Daerah Irigasi untuk menampilkan simulasi skematis dan debit aliran air di sebelah kanan.
          </div>
        </div>

        {/* Right Side: Interactive Flow Schema (4 columns) */}
        <div className="lg:col-span-4 space-y-6">
          {selectedDI ? (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-4">
              <div className="pb-3 border-b border-gray-100">
                <span className="text-[10px] font-bold text-teal-600 uppercase tracking-widest block mb-0.5">Simulasi Skema Hidrolika</span>
                <h3 className="font-extrabold text-gray-800 text-lg">{selectedDI.nama}</h3>
                <p className="text-[11px] text-gray-400 mt-0.5 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-teal-500" /> Kecamatan {selectedDI.kecamatan.split(',')[0]}
                </p>
              </div>

              {/* Dynamic Interactive Controls */}
              <div className="p-3 bg-teal-50/50 rounded-xl space-y-3 border border-teal-100 text-xs">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-700">Level Aliran Sungai Utama:</span>
                  <div className="flex gap-1.5">
                    {(['Kering', 'Normal', 'Banjir'] as const).map(f => (
                      <button
                        key={f}
                        onClick={() => setRiverFlowLevel(f)}
                        className={`px-2.5 py-1 rounded font-bold uppercase text-[9px] transition-all ${
                          riverFlowLevel === f 
                            ? 'bg-teal-600 text-white' 
                            : 'bg-white text-teal-700 border border-teal-200 hover:bg-teal-50'
                        }`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-700">Status Pintu Intake Utama:</span>
                  <button
                    onClick={() => setGateOpenState(!gateOpenState)}
                    className={`px-3 py-1 rounded font-bold text-[10px] border flex items-center gap-1 transition-all ${
                      gateOpenState 
                        ? 'bg-emerald-500 border-emerald-600 text-white' 
                        : 'bg-rose-500 border-rose-600 text-white'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
                    {gateOpenState ? 'PINTU BUKA' : 'PINTU TUTUP'}
                  </button>
                </div>
              </div>

              {/* Graphical Schematic Representation using beautiful CSS */}
              <div className="border border-gray-100 rounded-xl bg-slate-950 p-4 relative min-h-[300px] flex flex-col justify-between overflow-hidden">
                {/* River Basin Grid flow simulation */}
                <div className="absolute inset-0 opacity-10 flex flex-col justify-around pointer-events-none">
                  <div className="border-b border-white border-dashed w-full h-0"></div>
                  <div className="border-b border-white border-dashed w-full h-0"></div>
                  <div className="border-b border-white border-dashed w-full h-0"></div>
                </div>

                {/* Simulated Elements */}
                {/* 1. River Line (Sungai Bah Bolon) */}
                <div className="flex justify-between items-center">
                  <div className="text-left">
                    <span className="text-[9px] text-gray-400 font-mono block">HULU SUNGAI</span>
                    <span className="font-bold text-sky-400 text-xs">Sungai Bah Bolon</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] text-gray-400 font-mono block">DEBIT ALIRAN</span>
                    <span className={`text-xs font-bold ${
                      riverFlowLevel === 'Banjir' ? 'text-red-400' : riverFlowLevel === 'Kering' ? 'text-amber-400' : 'text-emerald-400'
                    }`}>
                      {riverFlowLevel === 'Banjir' ? '⚠️ TINGGI / REAPEAT' : riverFlowLevel === 'Kering' ? '⚠️ RENDAH' : 'NORMAL (12 m3/s)'}
                    </span>
                  </div>
                </div>

                {/* River stream visually flowing */}
                <div className="h-6 bg-slate-900 border-y border-sky-900/30 w-full relative flex items-center overflow-hidden my-3 rounded">
                  <div className={`h-full absolute left-0 bottom-0 bg-blue-600 transition-all duration-700 ${
                    riverFlowLevel === 'Banjir' ? 'w-full bg-indigo-600 opacity-90' : riverFlowLevel === 'Kering' ? 'w-full opacity-30 bg-blue-400' : 'w-full opacity-60'
                  }`}></div>
                  <div className="absolute z-10 w-full px-3 text-[9px] font-mono text-cyan-300 flex justify-between">
                    <span>⚡ ALIRAN SUNGAI</span>
                    <span className="animate-pulse">▶ ▶ ▶ ▶</span>
                  </div>
                </div>

                {/* 1. Bendung & Pintu Intake */}
                <div className="border-t border-slate-800 pt-3 relative flex justify-between items-center gap-3">
                  <div className="p-2 border border-blue-500/20 bg-blue-950/40 rounded text-[10px] flex-1">
                    <h5 className="font-bold text-white text-[11px] mb-0.5"> {selectedDI.jumlahBendung} Bendung Utama</h5>
                    <p className="text-gray-400 text-[10px]">Tinggi Mercu: 1.8m</p>
                  </div>

                  <div className={`px-2 py-3 rounded border text-center font-bold text-[9px] w-24 relative overflow-hidden transition-all duration-300 ${
                    gateOpenState 
                      ? 'bg-teal-950/50 border-teal-500/40 text-teal-400' 
                      : 'bg-rose-950/50 border-rose-500/40 text-rose-400'
                  }`}>
                    {gateOpenState ? 'INTAKE TERBUKA' : 'INTAKE DIKUNCI'}
                  </div>
                </div>

                {/* 2. Saluran Primer */}
                <div className="my-3 relative flex flex-col items-center">
                  <div className="w-1.5 h-10 bg-slate-800 relative">
                    <div className={`w-full absolute top-0 left-0 transition-all duration-500 ${
                      gateOpenState 
                        ? riverFlowLevel === 'Banjir' 
                          ? 'h-full bg-blue-500 shadow-md' 
                          : 'h-full bg-emerald-500' 
                        : 'h-0'
                    }`}></div>
                  </div>
                  <span className="text-[10px] text-gray-100 font-mono mt-1">
                    Saluran Primer ({(selectedDI.panjangSaluranPrimerM / 1000).toFixed(1)} Km)
                  </span>
                </div>

                {/* 3. Bangunan Sadap & Saluran Sekunder */}
                <div className="border-t border-slate-800 pt-3 flex justify-between items-start gap-2">
                  <div className="flex-1 p-2 bg-slate-900 border border-slate-800 rounded">
                    <span className="text-[8px] text-teal-400 font-bold block uppercase tracking-wider">SALURAN SEKUNDER</span>
                    <h6 className="text-[11px] font-bold text-white mb-0.5">Distribusi Air Sawah</h6>
                    <p className="text-[9px] text-gray-400">Total sadap: {selectedDI.jumlahBangunanBagiSadap} Pintu Sadap</p>
                  </div>

                  <div className="p-2 bg-slate-900 border border-slate-800 rounded text-right min-w-[100px]">
                    <span className="text-[8px] text-gray-400 block uppercase">SUPLAY AIR</span>
                    <span className={`text-[11px] font-bold ${
                      !gateOpenState 
                        ? 'text-rose-400' 
                        : riverFlowLevel === 'Kering' 
                          ? 'text-amber-400' 
                          : 'text-emerald-400'
                    }`}>
                      {!gateOpenState 
                        ? '0% Air Mengalir' 
                        : riverFlowLevel === 'Kering' 
                          ? 'Defisit (Minimal)' 
                          : 'Lancar / Maksimal'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Selected DI extra descriptions */}
              <div className="p-3 bg-gray-50 rounded-lg text-[11px] text-gray-600 flex gap-2 border border-gray-100">
                <Info className="w-4.5 h-4.5 text-blue-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold text-gray-800">Catatan Kondisi Lapangan:</p>
                  <p className="italic leading-relaxed">"{selectedDI.keteranganOP || 'Tidak ada catatan khusus operasional.'}"</p>
                </div>
              </div>

              {/* Bangunan Pendukung Gallery Listing */}
              <div className="border-t border-gray-100 pt-4 space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-[11px] text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Building className="w-4 h-4 text-emerald-600" />
                    Bangunan Pendukung ({selectedDI.bangunanPendukung?.length || 0})
                  </h4>
                </div>

                {selectedDI.bangunanPendukung && selectedDI.bangunanPendukung.length > 0 ? (
                  <div className="grid grid-cols-1 gap-2.5 max-h-[300px] overflow-y-auto pr-1">
                    {selectedDI.bangunanPendukung.map((bp) => (
                      <div key={bp.id} className="p-3 bg-gray-50 border border-gray-150 rounded-lg space-y-2 text-[11px]">
                        <div className="flex justify-between items-start gap-2">
                          <div>
                            <p className="font-bold text-gray-800">{bp.nama}</p>
                            <span className="text-[9px] text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded font-mono font-semibold">
                              {bp.kategori}
                            </span>
                          </div>
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                            bp.kondisiFisik === 'Baik' 
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                              : bp.kondisiFisik === 'Rusak Ringan'
                              ? 'bg-amber-50 text-amber-700 border border-amber-100'
                              : 'bg-rose-50 text-rose-700 border border-rose-100'
                          }`}>
                            {bp.kondisiFisik}
                          </span>
                        </div>

                        {bp.keterangan && (
                          <p className="text-gray-500 italic">"{bp.keterangan}"</p>
                        )}

                        <div className="flex items-center gap-1 text-[9px] text-gray-400 font-mono">
                          <MapPin className="w-3 h-3 text-red-400 shrink-0" />
                          <span>{bp.koordinat || 'Tanpa Koordinat'}</span>
                        </div>

                        {bp.fotoUrl ? (
                          <div className="rounded-md overflow-hidden border border-gray-200 mt-1.5">
                            <img 
                              src={bp.fotoUrl} 
                              alt={bp.nama}
                              className="w-full h-28 object-cover object-center"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                        ) : (
                          <div className="border border-dashed border-gray-200 rounded-md p-1.5 text-center text-[10px] text-gray-400 bg-white flex items-center justify-center gap-1 mt-1">
                            <Camera className="w-3.5 h-3.5" />
                            <span>Tidak ada dokumentasi foto</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-[11px] text-gray-400 py-4 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                    Belum ada data bangunan pendukung untuk D.I. ini.
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-100 p-8 text-center text-gray-400 text-xs">
              Pilih Daerah Irigasi untuk menampilkan visualisasi hidrolis.
            </div>
          )}
        </div>
      </div>
      </>
      ) : (
      <>
        {/* Sungai Summary Cards */}
        <div id="sungai-summary-cards" className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-xl border border-gray-100 flex items-center gap-4 shadow-sm">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
              <Waves className="w-5 h-5 bg-transparent" />
            </div>
            <div>
              <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">Total Sungai Terpantau</p>
              <h4 className="text-xl font-bold text-gray-800 mt-0.5">{(sungai || []).length} Sungai</h4>
              <p className="text-[10px] text-gray-500">Kewenangan UPTD Bah Bolon</p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-gray-100 flex items-center gap-4 shadow-sm">
            <div className="p-3 bg-cyan-50 text-cyan-600 rounded-lg">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">Total Panjang Aliran</p>
              <h4 className="text-xl font-bold text-gray-800 mt-0.5">{(sungai || []).reduce((sum, s) => sum + (s.panjangKm || 0), 0)} Km</h4>
              <p className="text-[10px] text-cyan-600 font-medium">Melintasi Kab. Simalungun</p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-gray-100 flex items-center gap-4 shadow-sm">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
              <Droplets className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">Total Pintu Air Utama</p>
              <h4 className="text-xl font-bold text-gray-800 mt-0.5">{(sungai || []).reduce((sum, s) => sum + (s.jumlahPintuAir || 0), 0)} Unit Pintu</h4>
              <p className="text-[10px] text-emerald-600 font-medium">Terintegrasi kendali pintu otomatis</p>
            </div>
          </div>
        </div>

        {/* Sungai Split Pane */}
        <div id="sungai-split-pane" className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Side: Sungai List Table */}
          <div className="lg:col-span-8 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col justify-between">
            <div className="p-5 border-b border-gray-100 space-y-4">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2">
                  <Waves className="w-4 h-4 text-teal-600 shrink-0" />
                  Daftar Inventaris & Pemantauan Hidrologi Sungai
                </h3>
                <span className="text-[10px] bg-teal-50 border border-teal-100 text-teal-700 px-2 py-0.5 rounded-full font-bold">
                  {filteredSungai.length} Terfilter
                </span>
              </div>

              {/* Filtering bar for Sungai */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400 shrink-0" />
                  <input
                    type="text"
                    placeholder="Cari sungai atau lokasi..."
                    className="w-full pl-9 pr-3 py-2 bg-gray-50/60 border border-gray-200 rounded-lg text-xs focus:ring-1 focus:ring-teal-500 focus:outline-none transition-all"
                    value={sungaiSearchTerm}
                    onChange={(e) => setSungaiSearchTerm(e.target.value)}
                  />
                </div>

                <div className="relative">
                  <select
                    className="w-full px-3 py-2 bg-gray-50/60 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-teal-500 cursor-pointer text-gray-600 font-semibold"
                    value={sungaiStatusFilter}
                    onChange={(e) => setSungaiStatusFilter(e.target.value)}
                  >
                    <option value="all">Semua Status Aliran</option>
                    <option value="Normal">Normal</option>
                    <option value="Siaga">Siaga</option>
                    <option value="Banjir">Banjir</option>
                    <option value="Kering">Kering</option>
                  </select>
                </div>

                <div className="relative">
                  <select
                    className="w-full px-3 py-2 bg-gray-50/60 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-teal-500 cursor-pointer text-gray-600 font-semibold"
                    value={sungaiTanggulFilter}
                    onChange={(e) => setSungaiTanggulFilter(e.target.value)}
                  >
                    <option value="all">Semua Kondisi Tanggul</option>
                    <option value="Sangat Baik">Sangat Baik</option>
                    <option value="Baik">Baik</option>
                    <option value="Cukup">Cukup</option>
                    <option value="Kritis">Kritis</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-[10px] font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100">
                    <th className="py-3 px-4">Nama Sungai</th>
                    <th className="py-3 px-3">Specs Aliran</th>
                    <th className="py-3 px-3">Debit Rerata</th>
                    <th className="py-3 px-3">Status TMA</th>
                    <th className="py-3 px-3">Tanggul</th>
                    <th className="py-3 px-3">Pintu</th>
                    {canInput && <th className="py-3 px-4 text-right">Aksi</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs">
                  {filteredSungai.length > 0 ? (
                    filteredSungai.map((s) => (
                      <tr 
                        key={s.id} 
                        onClick={() => {
                          setSelectedSungaiId(s.id);
                          setRiverInteractiveFlow(s.statusAliran);
                        }}
                        className={`hover:bg-teal-50/20 cursor-pointer transition-colors ${
                          selectedSungaiId === s.id ? 'bg-teal-50/40 font-medium' : ''
                        }`}
                      >
                        <td className="py-3 px-4">
                          <div className="font-bold text-gray-800 flex items-center gap-1.5 text-sm">
                            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                            {s.nama}
                          </div>
                          <div className="text-[10px] text-gray-400 mt-0.5 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-red-400 shrink-0" />
                            <span className="truncate max-w-[180px]">{s.lokasiSeksi}</span>
                          </div>
                        </td>
                        <td className="py-3 px-3 whitespace-nowrap">
                          <div className="font-semibold text-gray-700">{s.panjangKm} Km panjang</div>
                          <div className="text-[10px] text-gray-400 mt-0.5">DAS: {s.luasDasKm2} Km²</div>
                        </td>
                        <td className="py-3 px-3 whitespace-nowrap">
                          <div className="font-bold text-teal-600">{s.debitRerataM3s} M³/s</div>
                          <div className="text-[10px] text-gray-400 mt-0.5">Aliran Rerata</div>
                        </td>
                        <td className="py-3 px-3">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            s.statusAliran === 'Normal' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                            s.statusAliran === 'Siaga' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                            s.statusAliran === 'Banjir' ? 'bg-rose-50 text-rose-700 border-rose-100' :
                            'bg-orange-50 text-orange-700 border-orange-100'
                          }`}>
                            {s.statusAliran}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <span className={`inline-flex px-2 py-0.5 rounded-sm text-[10px] font-semibold ${
                            s.kondisiTanggul === 'Sangat Baik' ? 'bg-cyan-50 text-cyan-700' :
                            s.kondisiTanggul === 'Baik' ? 'bg-emerald-50 text-emerald-700' :
                            s.kondisiTanggul === 'Cukup' ? 'bg-amber-50 text-amber-700' :
                            'bg-rose-50 text-rose-700 font-bold border border-rose-200'
                          }`}>
                            {s.kondisiTanggul}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <span className="font-mono bg-gray-100 text-gray-700 font-bold text-xs p-1 px-2 rounded-full border border-gray-200">
                            {s.jumlahPintuAir} Pintu
                          </span>
                        </td>
                        {canInput && (
                          <td className="py-3 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                            <div className="flex justify-end items-center gap-1.5">
                              <button
                                onClick={() => handleOpenEditSungaiModal(s)}
                                className="p-1 text-gray-500 hover:text-teal-600 hover:bg-teal-50 rounded transition-all"
                                title="Edit data Sungai"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setDeleteSungaiConfirm({ id: s.id, name: s.nama })}
                                className="p-1 text-gray-500 hover:text-rose-600 hover:bg-rose-50 rounded transition-all"
                                title="Hapus data Sungai"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="text-center py-12 text-gray-400">
                        Tidak ada data Sungai yang cocok dengan filter pencarian.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex justify-between items-center text-[11px] text-gray-400">
              <span>Menampilkan {filteredSungai.length} dari {(sungai || []).length} Sungai terdaftar</span>
              <span className="font-mono">Koordinat referensi: EPSG:4326 - WGS 84</span>
            </div>
          </div>

          {/* Right Side: Interactive Hydrology details & Simulator */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-4">
              <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                <h4 className="font-bold text-gray-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <Waves className="w-4 h-4 text-blue-500" />
                  Visualisasi Tinggi Muka Air SMA
                </h4>
                <span className="text-[10px] bg-blue-50 text-blue-700 font-bold px-2 py-0.5 rounded border border-blue-100">
                  REAL-TIME SIM
                </span>
              </div>

              {selectedSungai ? (
                <div className="space-y-4">
                  <div>
                    <h5 className="font-extrabold text-sm text-gray-800">{selectedSungai.nama}</h5>
                    <p className="text-[11px] text-gray-450 mt-1 line-clamp-2 italic">"{selectedSungai.keterangan || 'Tidak ada keterangan tambahan.'}"</p>
                  </div>

                  {/* Lat/Long Specs list */}
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 space-y-1.5 text-[11px] font-mono">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Hulu GPS:</span>
                      <span className="text-gray-700 font-medium truncate max-w-[150px]">{selectedSungai.koordinatHulu || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Hilir GPS:</span>
                      <span className="text-gray-700 font-medium truncate max-w-[150px]">{selectedSungai.koordinatHilir || 'N/A'}</span>
                    </div>
                  </div>

                  {/* Interactive Status Modifiers */}
                  <div className="space-y-2 pt-1 border-t border-gray-100">
                    <label className="text-[10px] font-bold text-gray-500 uppercase block">Uji Status Aliran (Simulasi):</label>
                    <div className="grid grid-cols-4 gap-1.5 text-[10px]">
                      {['Kering', 'Normal', 'Siaga', 'Banjir'].map((lvl) => (
                        <button
                          key={lvl}
                          type="button"
                          onClick={() => setRiverInteractiveFlow(lvl)}
                          className={`py-1 rounded-md font-bold text-center border transition-all ${
                            riverInteractiveFlow === lvl
                              ? lvl === 'Normal' ? 'bg-emerald-500 border-emerald-600 text-white shadow-xs' :
                                lvl === 'Siaga' ? 'bg-amber-500 border-amber-600 text-white shadow-xs' :
                                lvl === 'Banjir' ? 'bg-rose-500 border-rose-600 text-white shadow-xs' :
                                'bg-orange-500 border-orange-600 text-white shadow-xs'
                              : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          {lvl}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Visual Wave Container */}
                  <div className="relative h-44 border border-gray-150 rounded-xl overflow-hidden bg-sky-950 flex flex-col justify-between p-4 text-white">
                    {/* Floating water representation */}
                    <div 
                      className={`absolute bottom-0 left-0 right-0 transition-all duration-700 overflow-hidden ${
                        riverInteractiveFlow === 'Banjir' ? 'h-4/5 bg-gradient-to-t from-red-650/90 to-red-400/85' :
                        riverInteractiveFlow === 'Siaga' ? 'h-3/5 bg-gradient-to-t from-amber-650/90 to-amber-400/85' :
                        riverInteractiveFlow === 'Kering' ? 'h-[25%] bg-gradient-to-t from-orange-700/80 to-yellow-600/70' :
                        'h-[45%] bg-gradient-to-t from-blue-700/80 to-cyan-500/70'
                      }`}
                    >
                      {/* Interactive CSS Wave animation */}
                      <svg className="w-full h-8 absolute -top-4 left-0 fill-current opacity-80" viewBox="0 0 120 28" preserveAspectRatio="none">
                        <defs>
                          <path id="wave" d="M0,15 C30,15 30,5 60,5 C90,5 90,15 120,15 L120,30 L0,30 Z" />
                        </defs>
                        <use href="#wave" x="0" y="0" className="animate-pulse duration-[3s]" />
                        <use href="#wave" x="30" y="2" className="animate-pulse duration-[4s] delay-100" />
                      </svg>
                    </div>

                    {/* Safe warning indicator text */}
                    <div className="z-10 bg-slate-900/40 p-1.5 px-2.5 rounded-lg border border-white/10 self-start text-[10px] backdrop-blur-xs font-semibold">
                      Tinggi Muka Air (TMA) Referensi
                    </div>

                    <div className="z-10 flex justify-between items-end">
                      <div className="bg-slate-905/65 p-2 rounded border border-white/5 backdrop-blur-xs">
                        <p className="text-[9px] text-gray-300 font-mono tracking-wide uppercase">Estimasi TMA</p>
                        <p className="text-lg font-black font-mono mt-0.5">
                          {riverInteractiveFlow === 'Banjir' ? '4.85 m' :
                           riverInteractiveFlow === 'Siaga' ? '2.92 m' :
                           riverInteractiveFlow === 'Kering' ? '0.35 m' :
                           '1.48 m'}
                        </p>
                      </div>

                      <div className={`px-2 py-1 rounded text-[10px] font-black tracking-wider uppercase backdrop-blur-xs flex items-center gap-1 border ${
                        riverInteractiveFlow === 'Normal' ? 'bg-emerald-500/80 border-emerald-400 text-white' :
                        riverInteractiveFlow === 'Siaga' ? 'bg-amber-500/85 border-amber-400 text-white' :
                        riverInteractiveFlow === 'Banjir' ? 'bg-rose-600/90 border-rose-500 text-white animate-bounce' :
                        'bg-orange-500/80 border-orange-400 text-white'
                      }`}>
                        {riverInteractiveFlow === 'Banjir' && <AlertTriangle className="w-3 h-3 shrink-0" />}
                        {riverInteractiveFlow === 'Normal' && <CheckCircle className="w-3 h-3 shrink-0" />}
                        {riverInteractiveFlow}
                      </div>
                    </div>
                  </div>

                  {/* Simulated Gate Actuator Panel */}
                  <div className="border border-indigo-100 p-3.5 bg-indigo-50/20 rounded-xl space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wide block">
                        Kontrol Gerbang Pintu Air Elektronik
                      </span>
                      <span className="text-[9px] bg-indigo-100 text-indigo-800 font-extrabold px-1.5 py-0.5 rounded">
                        API SCADA
                      </span>
                    </div>

                    <div className="flex justify-between text-xs font-bold text-gray-800">
                      <span>Bukaan Katup Motorik:</span>
                      <span className="font-mono text-indigo-700">{waterGateMannedCount * 20}%</span>
                    </div>

                    <div className="pt-0.5">
                      <input 
                        type="range" 
                        min="0" 
                        max="5" 
                        step="1"
                        value={waterGateMannedCount} 
                        onChange={(e) => setWaterGateMannedCount(Number(e.target.value))}
                        className="w-full accent-indigo-600 cursor-pointer h-1.5 bg-gray-200 rounded-lg appearance-none"
                      />
                      <div className="flex justify-between text-[9px] font-bold text-gray-400 mt-1 uppercase font-mono">
                        <span>Tutup (0%)</span>
                        <span>Separuh</span>
                        <span>Penuh (100%)</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-indigo-100/40 flex justify-between items-center text-xs">
                      <div>
                        <p className="text-[9px] text-gray-400 font-mono">Simulasi Pelepasan Air</p>
                        <p className="font-mono font-black text-indigo-700 text-sm mt-0.5">
                          {((selectedSungai.debitRerataM3s || 10) * (waterGateMannedCount / 5)).toFixed(2)} M³/Detik
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-[9px] text-gray-400 font-mono">Rerata Aliran Dasar</p>
                        <p className="font-mono text-gray-700 font-semibold">{selectedSungai.debitRerataM3s} M³/s</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-400 text-xs text-dashed">
                  Pilih salah satu Sungai untuk memicu panel monitor hidrologi terpadu.
                </div>
              )}
            </div>
          </div>
        </div>
      </>
      )}

      {/* Add / Edit Modal Drawer */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="bg-gradient-to-r from-teal-600 to-indigo-700 p-4 text-white flex justify-between items-center">
              <h3 className="font-bold text-sm tracking-tight">
                {editingDI ? 'Edit Data Inventori Daerah Irigasi' : 'Daftarkan Daerah Irigasi Baru'}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-white hover:text-teal-200 text-xl font-bold px-2 focus:outline-none"
              >
                ×
              </button>
            </div>

             <form onSubmit={handleSubmit} className="p-5 space-y-5 max-h-[75vh] overflow-y-auto">
              <div className="bg-teal-50/60 p-3 rounded-lg border border-teal-100/50 text-[11px] text-teal-850 flex gap-2">
                <Sparkles className="w-4 h-4 shrink-0 mt-0.5 text-teal-600" />
                <span>Formulir disesuaikan menurut standar Seksi Operasi & Pemeliharaan SDA Simalungun.</span>
              </div>

              {/* 1. Nama D.I. */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Nama Daerah Irigasi (D.I.)</label>
                <input
                  type="text"
                  placeholder="Contoh: D.I. Bah Bolon"
                  className="w-full p-2 border border-gray-200 rounded-lg text-xs focus:ring-1 focus:ring-teal-500 focus:outline-none"
                  value={formFields.nama}
                  onChange={(e) => setFormFields({ ...formFields, nama: e.target.value })}
                  required
                />
              </div>

              {/* 2. Kode Registrasi & 3. Luas Areal */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Kode Registrasi</label>
                  <input
                    type="text"
                    placeholder="Contoh: REG-BB-001"
                    className="w-full p-2 border border-gray-200 rounded-lg text-xs focus:ring-1 focus:ring-teal-500 focus:outline-none"
                    value={formFields.kodeRegistrasi}
                    onChange={(e) => setFormFields({ ...formFields, kodeRegistrasi: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Luas Areal (Ha)</label>
                  <input
                     type="number"
                     min="0"
                     placeholder="Contoh: 1240"
                     className="w-full p-2 border border-gray-200 rounded-lg text-xs focus:ring-1 focus:ring-teal-500 focus:outline-none"
                     value={formFields.luasArealHa}
                     onChange={(e) => {
                       const val = Number(e.target.value);
                       setFormFields({ ...formFields, luasArealHa: val, luasFungsionalHa: val, luasRencanaHa: val });
                     }}
                     required
                  />
                </div>
              </div>

              {/* 4. Sumber Air & 5. Lokasi */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Sumber Air</label>
                  <input
                    type="text"
                    placeholder="Contoh: Sungai Bah Bolon"
                    className="w-full p-2 border border-gray-200 rounded-lg text-xs focus:ring-1 focus:ring-teal-500 focus:outline-none"
                    value={formFields.sumberAir}
                    onChange={(e) => setFormFields({ ...formFields, sumberAir: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Lokasi Kecamatan/Kab.</label>
                  <input
                    type="text"
                    placeholder="Contoh: Kec. Raya, Simalungun"
                    className="w-full p-2 border border-gray-200 rounded-lg text-xs focus:ring-1 focus:ring-teal-500 focus:outline-none"
                    value={formFields.lokasi}
                    onChange={(e) => setFormFields({ ...formFields, lokasi: e.target.value, kecamatan: e.target.value })}
                    required
                  />
                </div>
              </div>

              {/* 6. Kondisi (%) & 7. Kewenangan */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Kondisi Fisik Saluran (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    placeholder="Contoh: 85"
                    className="w-full p-2 border border-gray-200 rounded-lg text-xs focus:ring-1 focus:ring-teal-500 focus:outline-none"
                    value={formFields.kondisi}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setFormFields({ ...formFields, kondisi: val, kondisiSaluranPct: val });
                    }}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Wewenang / Status</label>
                  <select
                    className="w-full p-2 border border-gray-200 rounded-lg text-xs focus:ring-1 focus:ring-teal-500 focus:outline-none bg-white"
                    value={formFields.kewenangan}
                    onChange={(e) => setFormFields({ ...formFields, kewenangan: e.target.value, statusKewenangan: e.target.value as any })}
                  >
                    <option value="Provinsi">Provinsi</option>
                    <option value="Pusat">Pusat/Nasional</option>
                    <option value="Kabupaten">Kabupaten</option>
                  </select>
                </div>
              </div>

              {/* --- 8. SECTION: BANGUNAN PENDUKUNG --- */}
              <div className="border-t border-gray-150 pt-4 space-y-3">
                <div className="flex items-center gap-1.5 justify-between">
                  <h4 className="text-[11px] font-bold text-indigo-700 uppercase tracking-wider flex items-center gap-1">
                    <Building className="w-4 h-4 text-indigo-600" />
                    Bangunan Pendukung ({formFields.bangunanPendukung?.length || 0})
                  </h4>
                  <span className="text-[9px] text-gray-400">Dapat ditambah lebih dari satu item</span>
                </div>

                {/* List Already Added BP */}
                {formFields.bangunanPendukung && formFields.bangunanPendukung.length > 0 && (
                  <div className="bg-gray-50 rounded-lg p-2.5 space-y-2 border border-gray-150/60 max-h-[160px] overflow-y-auto">
                    {formFields.bangunanPendukung.map((bp: any, idx: number) => (
                      <div key={bp.id || idx} className="flex items-center justify-between text-[11px] bg-white p-2 rounded border border-gray-200 shadow-xs">
                        <div className="flex items-center gap-2">
                          {bp.fotoUrl ? (
                            <img src={bp.fotoUrl} className="w-8 h-8 rounded object-cover shrink-0 border border-gray-150" alt="" referrerPolicy="no-referrer" />
                          ) : (
                            <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center shrink-0 border border-gray-150 text-gray-400">
                              <Camera className="w-3.5 h-3.5" />
                            </div>
                          )}
                          <div className="truncate max-w-[200px]">
                            <p className="font-bold text-gray-800 line-clamp-1">{bp.nama}</p>
                            <span className="text-[9px] text-gray-400 font-medium font-mono">
                              {bp.kategori} • {bp.kondisiFisik}
                            </span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const updated = [...formFields.bangunanPendukung];
                            updated.splice(idx, 1);
                            setFormFields({ ...formFields, bangunanPendukung: updated });
                          }}
                          className="p-1 text-rose-500 hover:bg-rose-50 rounded"
                          title="Hapus"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Inline Form to Add a BP */}
                <div className="p-3 bg-indigo-50/40 border border-indigo-100 rounded-xl space-y-3">
                  <span className="text-[10px] font-bold text-indigo-800 uppercase tracking-wider block">
                    + Tambah Bagunan Pendukung Baru
                  </span>

                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-gray-500 uppercase">Nama Bangunan Pendukung</label>
                    <input
                      type="text"
                      placeholder="Contoh: Pintu Intake Utama Bah Bolon"
                      className="w-full p-2 bg-white border border-gray-200 rounded-lg text-xs focus:ring-1 focus:ring-teal-500 focus:outline-none"
                      value={newBp.nama}
                      onChange={(e) => setNewBp({ ...newBp, nama: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-gray-500 uppercase">Kategori</label>
                      <select
                        className="w-full p-2 bg-white border border-gray-200 rounded-lg text-xs focus:outline-none"
                        value={newBp.kategori}
                        onChange={(e) => setNewBp({ ...newBp, kategori: e.target.value })}
                      >
                        <option value="Pintu Intake">Pintu Intake</option>
                        <option value="Pintu Air Sekunder">Pintu Air Sekunder</option>
                        <option value="Mercu Bendung">Mercu Bendung</option>
                        <option value="Kantong Lumpur">Kantong Lumpur</option>
                        <option value="Talang Air">Talang Air</option>
                        <option value="Syphon">Syphon</option>
                        <option value="Bangunan Bagi">Bangunan Bagi/Sadap</option>
                        <option value="Tanggul Saluran">Tanggul Saluran</option>
                        <option value="Lainnya">Lainnya</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-gray-500 uppercase">Kondisi Fisik</label>
                      <select
                        className="w-full p-2 bg-white border border-gray-200 rounded-lg text-xs focus:outline-none"
                        value={newBp.kondisiFisik}
                        onChange={(e) => setNewBp({ ...newBp, kondisiFisik: e.target.value })}
                      >
                        <option value="Baik">Baik</option>
                        <option value="Rusak Ringan">Rusak Ringan</option>
                        <option value="Rusak Berat">Rusak Berat</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <label className="text-[9px] font-bold text-gray-500 uppercase">Koordinat Lokasi (GPS Lock)</label>
                      <button
                        type="button"
                        onClick={getRealGPSLocation}
                        disabled={gpsLoading}
                        className="text-[9.5px] text-teal-700 hover:text-teal-800 disabled:opacity-50 flex items-center gap-1 font-bold bg-teal-50 hover:bg-teal-100/80 p-1 px-2 rounded border border-teal-150 transition-all shadow-2xs"
                      >
                        {gpsLoading ? (
                          <span className="flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-teal-600 animate-ping"></span>
                            <span>Menghubungkan GPS...</span>
                          </span>
                        ) : (
                          <span>🎯 Kunci Posisi GPS Presisi</span>
                        )}
                      </button>
                    </div>
                    <input
                      type="text"
                      placeholder="Contoh: 02.952345° N, 99.103421° E"
                      className="w-full p-2 bg-white border border-gray-200 rounded-lg text-xs focus:ring-1 focus:ring-teal-500 focus:outline-none font-mono"
                      value={newBp.koordinat}
                      onChange={(e) => setNewBp({ ...newBp, koordinat: e.target.value })}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-gray-500 uppercase">Keterangan Tambahan</label>
                    <input
                      type="text"
                      placeholder="Contoh: Dinding sayap retak ringan, debit lancar"
                      className="w-full p-2 bg-white border border-gray-200 rounded-lg text-xs focus:ring-1 focus:ring-teal-500 focus:outline-none"
                      value={newBp.keterangan}
                      onChange={(e) => setNewBp({ ...newBp, keterangan: e.target.value })}
                    />
                  </div>

                  {/* Camera Upload integration / Native section */}
                  <div className="space-y-2 border-t border-indigo-100/50 pt-2 text-xs">
                    <label className="text-[9px] font-bold text-gray-500 uppercase block">Input Dokumentasi Foto</label>
                    
                    <div className="relative border-2 border-dashed border-indigo-200 bg-white rounded-xl flex flex-col items-center justify-center p-4 text-center hover:bg-indigo-50/50 text-indigo-700 cursor-pointer transition-all shadow-xs group">
                      <input 
                        type="file" 
                        accept="image/*" 
                        capture="environment" 
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            compressAndResizeImage(file)
                              .then((compressedBase64) => {
                                setNewBp(prev => ({ ...prev, fotoUrl: compressedBase64 }));
                              })
                              .catch((err) => {
                                console.error("Error compressing image:", err);
                                // Fallback to raw FileReader if compression fails
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                  setNewBp(prev => ({ ...prev, fotoUrl: reader.result as string }));
                                };
                                reader.readAsDataURL(file);
                              });
                          }
                        }}
                      />
                      <div className="w-10 h-10 bg-indigo-50 group-hover:bg-indigo-100 rounded-full flex items-center justify-center mb-1.5 transition-colors">
                        <Camera className="w-5 h-5 text-indigo-600" />
                      </div>
                      <span className="text-[11px] font-bold text-gray-800">Ambil Foto / Pilih Berkas Dokumentasi</span>
                      <span className="text-[9px] text-gray-400 mt-0.5">Klik di sini untuk membuka kamera smartphone/unggahan berkas</span>
                    </div>

                    {newBp.fotoUrl && (
                      <div className="flex items-center gap-3 p-2 bg-white rounded-lg border border-indigo-150">
                        <img 
                          src={newBp.fotoUrl} 
                          className="w-14 h-14 object-cover rounded border" 
                          alt="Captured thumbnail"
                          referrerPolicy="no-referrer"
                        />
                        <div className="flex-1">
                          <span className="text-[9px] text-emerald-600 font-bold flex items-center gap-1">
                            ✓ Foto Tersimpan (Base64)
                          </span>
                          <button
                            type="button"
                            onClick={() => setNewBp({ ...newBp, fotoUrl: '' })}
                            className="text-[9px] text-rose-500 font-bold hover:underline mt-0.5 block"
                          >
                            Hapus Foto
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (!newBp.nama.trim()) return alert('Nama bangunan pendukung wajib diisi!');
                      const item = {
                        id: `BP-${Date.now()}`,
                        ...newBp
                      };
                      setFormFields({
                        ...formFields,
                        bangunanPendukung: [...(formFields.bangunanPendukung || []), item]
                      });
                      setNewBp({
                        nama: '',
                        kategori: 'Pintu Sadap',
                        kondisiFisik: 'Baik',
                        keterangan: '',
                        koordinat: '',
                        fotoUrl: ''
                      });
                    }}
                    className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-xs transition-all flex items-center justify-center gap-1 shadow-sm mt-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tambahkan ke Daftar Bangunan Pendukung</span>
                  </button>
                </div>
              </div>

              {/* Actions submit entire form */}
              <div className="pt-3 border-t border-gray-150 flex justify-end gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-200 text-gray-500 font-medium rounded-lg hover:bg-gray-50 transition-all font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-lg transition-all shadow-sm"
                >
                  {editingDI ? 'Simpan Perubahan' : 'Daftarkan Unit Daerah'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Dynamic Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 text-center">
              <div className="w-12 h-12 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-3">
                <Trash2 className="w-5 h-5 text-rose-600" />
              </div>
              <h3 className="font-bold text-gray-900 text-sm">Hapus Daerah Irigasi</h3>
              <p className="text-xs text-gray-500 mt-1">
                Apakah Anda yakin ingin menghapus data <strong className="text-gray-800">{deleteConfirm.name}</strong>? Tindakan ini tidak bisa dibatalkan.
              </p>
            </div>
            <div className="bg-gray-50 px-5 py-3.5 flex justify-end gap-2 text-xs">
              <button 
                type="button" 
                onClick={() => setDeleteConfirm(null)} 
                className="py-1.5 px-4 text-gray-600 hover:text-gray-900 font-medium bg-white border border-gray-200 rounded-lg hover:bg-gray-100 transition-all"
              >
                Batal
              </button>
              <button 
                type="button" 
                onClick={() => {
                  onDeleteDI(deleteConfirm.id);
                  setDeleteConfirm(null);
                }} 
                className="py-1.5 px-4 text-white font-extrabold bg-rose-600 hover:bg-rose-700 rounded-lg transition-all shadow-sm"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Sungai Modal */}
      {isSungaiModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-md shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="bg-gradient-to-r from-teal-600 to-indigo-700 p-4 text-white flex justify-between items-center">
              <h3 className="font-bold text-sm tracking-tight">
                {editingSungai ? 'Edit Inventaris Aliran Sungai' : 'Daftarkan Aliran Sungai Baru'}
              </h3>
              <button 
                onClick={() => setIsSungaiModalOpen(false)}
                className="p-1 rounded-full hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSungaiSubmit} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Nama Sungai</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Sungai Bah Bolon Raya"
                  className="w-full p-2 border border-gray-250 rounded-lg text-xs focus:ring-1 focus:ring-teal-500 focus:outline-none"
                  value={sungaiFormFields.nama}
                  onChange={(e) => setSungaiFormFields({ ...sungaiFormFields, nama: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Panjang Aliran (Km)</label>
                  <input
                    type="number"
                    min="1"
                    placeholder="Contoh: 120"
                    className="w-full p-2 border border-gray-255 rounded-lg text-xs focus:ring-1 focus:ring-teal-500 focus:outline-none"
                    value={sungaiFormFields.panjangKm}
                    onChange={(e) => setSungaiFormFields({ ...sungaiFormFields, panjangKm: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Luas DAS (Km²)</label>
                  <input
                    type="number"
                    min="1"
                    placeholder="Contoh: 950"
                    className="w-full p-2 border border-gray-255 rounded-lg text-xs focus:ring-1 focus:ring-teal-500 focus:outline-none"
                    value={sungaiFormFields.luasDasKm2}
                    onChange={(e) => setSungaiFormFields({ ...sungaiFormFields, luasDasKm2: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Debit Rerata (m³/detik)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    placeholder="Contoh: 24.5"
                    className="w-full p-2 border border-gray-255 rounded-lg text-xs focus:ring-1 focus:ring-teal-500 focus:outline-none"
                    value={sungaiFormFields.debitRerataM3s}
                    onChange={(e) => setSungaiFormFields({ ...sungaiFormFields, debitRerataM3s: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Jumlah Pintu Air</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="Contoh: 14"
                    className="w-full p-2 border border-gray-255 rounded-lg text-xs focus:ring-1 focus:ring-teal-500 focus:outline-none"
                    value={sungaiFormFields.jumlahPintuAir}
                    onChange={(e) => setSungaiFormFields({ ...sungaiFormFields, jumlahPintuAir: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Status Aliran Air</label>
                  <select
                    className="w-full p-2 border border-gray-255 rounded-lg text-xs focus:outline-none"
                    value={sungaiFormFields.statusAliran}
                    onChange={(e) => setSungaiFormFields({ ...sungaiFormFields, statusAliran: e.target.value })}
                  >
                    <option value="Normal">Normal</option>
                    <option value="Siaga">Siaga</option>
                    <option value="Banjir">Banjir</option>
                    <option value="Kering">Kering</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Kondisi Tanggul</label>
                  <select
                    className="w-full p-2 border border-gray-255 rounded-lg text-xs focus:outline-none"
                    value={sungaiFormFields.kondisiTanggul}
                    onChange={(e) => setSungaiFormFields({ ...sungaiFormFields, kondisiTanggul: e.target.value })}
                  >
                    <option value="Sangat Baik">Sangat Baik</option>
                    <option value="Baik">Baik</option>
                    <option value="Cukup">Cukup</option>
                    <option value="Kritis">Kritis</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Lokasi / Wilayah Seksi Kecamatan</label>
                <input
                  type="text"
                  placeholder="Contoh: Kec. Siantar, Kec. Tanah Jawa, Kec. Bosar Maligas"
                  className="w-full p-2 border border-gray-250 rounded-lg text-xs focus:ring-1 focus:ring-teal-500 focus:outline-none"
                  value={sungaiFormFields.lokasiSeksi}
                  onChange={(e) => setSungaiFormFields({ ...sungaiFormFields, lokasiSeksi: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Koordinat Hulu GPS</label>
                  <input
                    type="text"
                    placeholder="Contoh: 2°54'12' N, 98°51'30' E"
                    className="w-full p-2 border border-gray-250 rounded-lg text-xs focus:ring-1 focus:ring-teal-500 focus:outline-none font-mono"
                    value={sungaiFormFields.koordinatHulu}
                    onChange={(e) => setSungaiFormFields({ ...sungaiFormFields, koordinatHulu: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Koordinat Hilir GPS</label>
                  <input
                    type="text"
                    placeholder="Contoh: 3°08'45' N, 99°18'22' E"
                    className="w-full p-2 border border-gray-250 rounded-lg text-xs focus:ring-1 focus:ring-teal-500 focus:outline-none font-mono"
                    value={sungaiFormFields.koordinatHilir}
                    onChange={(e) => setSungaiFormFields({ ...sungaiFormFields, koordinatHilir: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Keterangan / Deskripsi Operasional</label>
                <textarea
                  rows={2}
                  placeholder="Karakteristik aliran sungai, kendala lapangan, sarpras pemantauan..."
                  className="w-full p-2 border border-gray-250 rounded-lg text-xs focus:ring-1 focus:ring-teal-500 focus:outline-none"
                  value={sungaiFormFields.keterangan}
                  onChange={(e) => setSungaiFormFields({ ...sungaiFormFields, keterangan: e.target.value })}
                />
              </div>

              <div className="pt-2 border-t border-gray-150 flex justify-end gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setIsSungaiModalOpen(false)}
                  className="px-4 py-2 border border-gray-200 text-gray-500 font-medium rounded-lg hover:bg-gray-50 transition-all font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-lg transition-all shadow-sm"
                >
                  {editingSungai ? 'Simpan Perubahan' : 'Daftarkan Sungai'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Sungai Confirmation Modal */}
      {deleteSungaiConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 text-center">
              <div className="w-12 h-12 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-3">
                <Trash2 className="w-5 h-5 text-rose-600" />
              </div>
              <h3 className="font-bold text-gray-900 text-sm">Hapus Data Sungai</h3>
              <p className="text-xs text-gray-500 mt-1">
                Apakah Anda yakin ingin menghapus data sungai <strong className="text-gray-800">{deleteSungaiConfirm.name}</strong>? Tindakan ini akan menghapus semua records hidrologinya secara permanen.
              </p>
            </div>
            <div className="bg-gray-50 px-5 py-3.5 flex justify-end gap-2 text-xs">
              <button 
                type="button" 
                onClick={() => setDeleteSungaiConfirm(null)} 
                className="py-1.5 px-4 text-gray-600 hover:text-gray-900 font-medium bg-white border border-gray-200 rounded-lg hover:bg-gray-100 transition-all"
              >
                Batal
              </button>
              <button 
                type="button" 
                onClick={() => {
                  onDeleteSungai?.(deleteSungaiConfirm.id);
                  setDeleteSungaiConfirm(null);
                }} 
                className="py-1.5 px-4 text-white font-extrabold bg-rose-600 hover:bg-rose-700 rounded-lg transition-all shadow-sm"
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
