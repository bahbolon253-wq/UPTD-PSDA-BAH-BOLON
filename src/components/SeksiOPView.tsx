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
  Info
} from 'lucide-react';
import { DaerahIrigasi } from '../types';

interface SeksiOPViewProps {
  daerahIrigasi: DaerahIrigasi[];
  onAddDI: (di: DaerahIrigasi) => void;
  onEditDI: (di: DaerahIrigasi) => void;
  onDeleteDI: (id: string) => void;
}

export default function SeksiOPView({
  daerahIrigasi,
  onAddDI,
  onEditDI,
  onDeleteDI
}: SeksiOPViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [conditionFilter, setConditionFilter] = useState('all');
  const [sizeFilter, setSizeFilter] = useState('all');
  
  // Selected DI for Interactive Schema / Flow simulation
  const [selectedDIId, setSelectedDIId] = useState<string>(daerahIrigasi[0]?.id || '');
  const [riverFlowLevel, setRiverFlowLevel] = useState<'Normal' | 'Banjir' | 'Kering'>('Normal');
  const [gateOpenState, setGateOpenState] = useState<boolean>(true);

  // Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDI, setEditingDI] = useState<DaerahIrigasi | null>(null);
  
  // Custom Delete Confirm State
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; name: string } | null>(null);
  
  const [formFields, setFormFields] = useState({
    nama: '',
    luasFungsionalHa: 1000,
    luasRencanaHa: 1000,
    kabupatenKota: 'Simalungun',
    kecamatan: '',
    panjangSaluranPrimerM: 5000,
    panjangSaluranSekunderM: 10000,
    jumlahBendung: 1,
    jumlahBangunanBagiSadap: 10,
    kondisiSaluranPct: 80,
    statusKewenangan: 'Provinsi' as 'Provinsi' | 'Pusat' | 'Kabupaten',
    keteranganOP: ''
  });

  const selectedDI = daerahIrigasi.find(di => di.id === selectedDIId) || daerahIrigasi[0];

  // Filtering logic
  const filteredDIs = daerahIrigasi.filter(di => {
    const matchesSearch = di.nama.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          di.kecamatan.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesCondition = true;
    if (conditionFilter === 'baik') matchesCondition = di.kondisiSaluranPct >= 80;
    else if (conditionFilter === 'sedang') matchesCondition = di.kondisiSaluranPct >= 70 && di.kondisiSaluranPct < 80;
    else if (conditionFilter === 'kritis') matchesCondition = di.kondisiSaluranPct < 70;

    let matchesSize = true;
    if (sizeFilter === 'kecil') matchesSize = di.luasFungsionalHa < 1500;
    else if (sizeFilter === 'menengah') matchesSize = di.luasFungsionalHa >= 1500 && di.luasFungsionalHa <= 3000;
    else if (sizeFilter === 'besar') matchesSize = di.luasFungsionalHa > 3000;

    return matchesSearch && matchesCondition && matchesSize;
  });

  // Calculate quick metrics for current matches
  const totalFungsionalHa = filteredDIs.reduce((sum, item) => sum + item.luasFungsionalHa, 0);
  const totalBendung = filteredDIs.reduce((sum, item) => sum + item.jumlahBendung, 0);
  const averageConditionPct = filteredDIs.length > 0 
    ? Math.round(filteredDIs.reduce((sum, item) => sum + item.kondisiSaluranPct, 0) / filteredDIs.length) 
    : 0;

  // Open modal for adding
  const handleOpenAddModal = () => {
    setEditingDI(null);
    setFormFields({
      nama: '',
      luasFungsionalHa: 1500,
      luasRencanaHa: 1500,
      kabupatenKota: 'Simalungun',
      kecamatan: '',
      panjangSaluranPrimerM: 6000,
      panjangSaluranSekunderM: 12000,
      jumlahBendung: 1,
      jumlahBangunanBagiSadap: 15,
      kondisiSaluranPct: 80,
      statusKewenangan: 'Provinsi',
      keteranganOP: ''
    });
    setIsModalOpen(true);
  };

  // Open modal for editing
  const handleOpenEditModal = (di: DaerahIrigasi) => {
    setEditingDI(di);
    setFormFields({
      nama: di.nama,
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
    setIsModalOpen(true);
  };

  // Submit modal form
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formFields.nama.trim()) return alert('Nama Daerah Irigasi harus diisi!');

    if (editingDI) {
      onEditDI({
        ...editingDI,
        ...formFields
      });
    } else {
      const newDI: DaerahIrigasi = {
        id: `DI-${Date.now()}`,
        ...formFields
      };
      onAddDI(newDI);
      // set selected di to the newly created one
      setSelectedDIId(newDI.id);
    }
    setIsModalOpen(false);
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
            Daftar Inventarisasi Daerah Irigasi (D.I.) kewenangan UPTD PSDA Bah Bolon Provinsi Sumatera Utara
          </p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 bg-teal-600 text-white font-medium px-4 py-2 rounded-lg hover:bg-teal-700 hover:shadow-md transition-all text-xs"
        >
          <Plus className="w-4 h-4" /> Tambah Daerah Irigasi (D.I)
        </button>
      </div>

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
                  <th className="py-3 px-4">Nama D.I.</th>
                  <th className="py-3 px-4">Luas Fungsional</th>
                  <th className="py-3 px-4">Kecamatan</th>
                  <th className="py-3 px-4">Saluran (P/S)</th>
                  <th className="py-3 px-4 text-center">Bendung/Sadap</th>
                  <th className="py-3 px-4">Kondisi Fisik</th>
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
                            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                            {di.nama}
                          </p>
                          <span className="text-[10px] text-gray-400">Kewenangan: {di.statusKewenangan}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div>
                          <p className="font-bold text-gray-700">{di.luasFungsionalHa.toLocaleString('id-ID')} Ha</p>
                          <span className="text-[10px] text-gray-400">Rencana: {di.luasRencanaHa.toLocaleString('id-ID')} Ha</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-normal text-gray-500 max-w-[120px] truncate" title={di.kecamatan}>
                        {di.kecamatan}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[10px]">
                        P: {(di.panjangSaluranPrimerM / 1000).toFixed(1)} km<br/>
                        S: {(di.panjangSaluranSekunderM / 1000).toFixed(1)} km
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="bg-gray-100 font-bold text-gray-800 px-2 py-0.5 rounded mr-1" title="Jumlah Bendung">
                          {di.jumlahBendung} B
                        </span>
                        <span className="bg-blue-50 font-bold text-blue-700 px-2 py-0.5 rounded" title="Jumlah Bangunan Sadap">
                          {di.jumlahBangunanBagiSadap} S
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <span className={`font-bold ${
                            di.kondisiSaluranPct >= 80 ? 'text-emerald-600' : di.kondisiSaluranPct >= 70 ? 'text-amber-600' : 'text-rose-600'
                          }`}>
                            {di.kondisiSaluranPct}%
                          </span>
                          <span className="text-[10px] text-gray-400">
                            ({di.kondisiSaluranPct >= 80 ? 'Sgt Baik' : di.kondisiSaluranPct >= 70 ? 'Cukup' : 'Kritis'})
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
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
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-100 p-8 text-center text-gray-400 text-xs">
              Pilih Daerah Irigasi untuk menampilkan visualisasi hidrolis.
            </div>
          )}
        </div>
      </div>

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

            <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
              {/* Row 1: Nama */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-gray-500 uppercase">Nama Daerah Irigasi (D.I.)</label>
                <input
                  type="text"
                  placeholder="Contoh: D.I. Kerasaan"
                  className="w-full p-2 border border-gray-200 rounded-lg text-xs focus:ring-1 focus:ring-teal-500 focus:outline-none"
                  value={formFields.nama}
                  onChange={(e) => setFormFields({ ...formFields, nama: e.target.value })}
                  required
                />
              </div>

              {/* Row 2: Luas Fungsional & Rencana */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-gray-500 uppercase">Luas Fungsional (Ha)</label>
                  <input
                    type="number"
                    min="0"
                    className="w-full p-2 border border-gray-200 rounded-lg text-xs focus:ring-1 focus:ring-teal-500 focus:outline-none"
                    value={formFields.luasFungsionalHa}
                    onChange={(e) => setFormFields({ ...formFields, luasFungsionalHa: Number(e.target.value) })}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-gray-500 uppercase">Luas Rencana (Ha)</label>
                  <input
                    type="number"
                    min="0"
                    className="w-full p-2 border border-gray-200 rounded-lg text-xs focus:ring-1 focus:ring-teal-500 focus:outline-none"
                    value={formFields.luasRencanaHa}
                    onChange={(e) => setFormFields({ ...formFields, luasRencanaHa: Number(e.target.value) })}
                    required
                  />
                </div>
              </div>

              {/* Row 3: Kabupaten & Kecamatan */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-gray-500 uppercase">Kabupaten/Kota</label>
                  <input
                    type="text"
                    className="w-full p-2 border border-gray-200 rounded-lg text-xs focus:ring-1 focus:ring-teal-500 focus:outline-none bg-gray-50 text-gray-500"
                    value={formFields.kabupatenKota}
                    disabled
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-gray-500 uppercase">Kecamatan (Simalungun)</label>
                  <input
                    type="text"
                    placeholder="Contoh: Bandar, Pematang Bandar"
                    className="w-full p-2 border border-gray-200 rounded-lg text-xs focus:ring-1 focus:ring-teal-500 focus:outline-none"
                    value={formFields.kecamatan}
                    onChange={(e) => setFormFields({ ...formFields, kecamatan: e.target.value })}
                    required
                  />
                </div>
              </div>

              {/* Row 4: Panjang Saluran Primer & Sekunder */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-gray-500 uppercase">Saluran Primer (Meter)</label>
                  <input
                    type="number"
                    min="0"
                    className="w-full p-2 border border-gray-200 rounded-lg text-xs focus:ring-1 focus:ring-teal-500 focus:outline-none"
                    value={formFields.panjangSaluranPrimerM}
                    onChange={(e) => setFormFields({ ...formFields, panjangSaluranPrimerM: Number(e.target.value) })}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-gray-500 uppercase">Saluran Sekunder (Meter)</label>
                  <input
                    type="number"
                    min="0"
                    className="w-full p-2 border border-gray-200 rounded-lg text-xs focus:ring-1 focus:ring-teal-500 focus:outline-none"
                    value={formFields.panjangSaluranSekunderM}
                    onChange={(e) => setFormFields({ ...formFields, panjangSaluranSekunderM: Number(e.target.value) })}
                    required
                  />
                </div>
              </div>

              {/* Row 5: Bendung & Bangunan Sadap */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-gray-500 uppercase">Jumlah Bendung Utama</label>
                  <input
                    type="number"
                    min="1"
                    className="w-full p-2 border border-gray-200 rounded-lg text-xs focus:ring-1 focus:ring-teal-500 focus:outline-none"
                    value={formFields.jumlahBendung}
                    onChange={(e) => setFormFields({ ...formFields, jumlahBendung: Number(e.target.value) })}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-gray-500 uppercase">Bangunan Sadap/Bagi</label>
                  <input
                    type="number"
                    min="0"
                    className="w-full p-2 border border-gray-200 rounded-lg text-xs focus:ring-1 focus:ring-teal-500 focus:outline-none"
                    value={formFields.jumlahBangunanBagiSadap}
                    onChange={(e) => setFormFields({ ...formFields, jumlahBangunanBagiSadap: Number(e.target.value) })}
                    required
                  />
                </div>
              </div>

              {/* Row 6: Kondisi Saluran & Kewenangan */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-gray-500 uppercase">Kondisi Fisik Saluran (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    className="w-full p-2 border border-gray-200 rounded-lg text-xs focus:ring-1 focus:ring-teal-500 focus:outline-none"
                    value={formFields.kondisiSaluranPct}
                    onChange={(e) => setFormFields({ ...formFields, kondisiSaluranPct: Number(e.target.value) })}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-gray-500 uppercase">Status Kewenangan</label>
                  <select
                    className="w-full p-2 border border-gray-200 rounded-lg text-xs focus:ring-1 focus:ring-teal-500 focus:outline-none"
                    value={formFields.statusKewenangan}
                    onChange={(e) => setFormFields({ ...formFields, statusKewenangan: e.target.value as any })}
                  >
                    <option value="Provinsi">Provinsi</option>
                    <option value="Pusat">Pusat/Nasional</option>
                    <option value="Kabupaten">Kabupaten</option>
                  </select>
                </div>
              </div>

              {/* Row 7: Keterangan O&P */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-gray-500 uppercase">Keterangan / Laporan Kondisi O&P</label>
                <textarea
                  rows={2}
                  placeholder="Catatan pengerukan lumpur, kerusakan tebing, kebocoran pintu air, atau debit mengalir..."
                  className="w-full p-2 border border-gray-200 rounded-lg text-xs focus:ring-1 focus:ring-teal-500 focus:outline-none resize-none"
                  value={formFields.keteranganOP}
                  onChange={(e) => setFormFields({ ...formFields, keteranganOP: e.target.value })}
                />
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-gray-100 flex justify-end gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-200 text-gray-500 font-medium rounded-lg hover:bg-gray-50 transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-600 text-white font-bold rounded-lg hover:bg-teal-700 transition-all"
                >
                  {editingDI ? 'Simpan Perubahan' : 'Daftarkan Unit'}
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
    </div>
  );
}
