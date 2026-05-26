/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  TrendingUp, 
  Plus, 
  Edit3, 
  Trash2, 
  Calendar, 
  MapPin, 
  DollarSign, 
  Briefcase, 
  FileCheck, 
  AlertTriangle, 
  CheckCircle2, 
  HardDrive, 
  Image, 
  Play, 
  X,
  Gauge,
  Sliders,
  Award
} from 'lucide-react';
import { KegiatanPembangunan } from '../types';

interface SeksiPembangunanViewProps {
  pembangunan: KegiatanPembangunan[];
  onAddProject: (project: KegiatanPembangunan) => void;
  onEditProject: (project: KegiatanPembangunan) => void;
  onDeleteProject: (id: string) => void;
}

export default function SeksiPembangunanView({
  pembangunan,
  onAddProject,
  onEditProject,
  onDeleteProject
}: SeksiPembangunanViewProps) {
  // UI State
  const [selectedProjectId, setSelectedProjectId] = useState<string>(pembangunan[0]?.id || '');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<KegiatanPembangunan | null>(null);

  // Custom Delete Confirm State
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; name: string } | null>(null);

  // Form Fields State
  const [formFields, setFormFields] = useState({
    namaKegiatan: '',
    lokasi: '',
    tahunAnggaran: 2026,
    paguAnggaran: 500000000,
    nilaiKontrak: 480000000,
    kontraktor: '',
    noKontrak: '',
    progresFisikPct: 0,
    progresKeuanganPct: 0,
    tanggalMulai: '',
    tanggalSelesai: '',
    status: 'Persiapan' as any,
    kendalaAtauCatatan: ''
  });

  const selectedProject = pembangunan.find(p => p.id === selectedProjectId) || pembangunan[0];

  // Filters
  const filteredProjects = pembangunan.filter(p => {
    const matchesSearch = p.namaKegiatan.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.kontraktor.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.lokasi.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // KPI Calculations
  const totalPaguMatched = filteredProjects.reduce((sum, p) => sum + p.paguAnggaran, 0);
  const totalNilaiKontrakMatched = filteredProjects.reduce((sum, p) => sum + p.nilaiKontrak, 0);
  const averagePhysicalPct = filteredProjects.length > 0
    ? Math.round(filteredProjects.reduce((sum, p) => sum + p.progresFisikPct, 0) / filteredProjects.length)
    : 0;

  const urgentProjectsCount = filteredProjects.filter(p => p.status === 'Show Cause Meeting' || (p.status === 'Konstruksi' && p.progresFisikPct < p.progresKeuanganPct)).length;

  const handleOpenAddModal = () => {
    setEditingProject(null);
    setFormFields({
      namaKegiatan: '',
      lokasi: '',
      tahunAnggaran: 2026,
      paguAnggaran: 500000000,
      nilaiKontrak: 450000000,
      kontraktor: '',
      noKontrak: `602/${Math.floor(Math.random() * 800) + 200}/KTR/PSDA-SU/2026`,
      progresFisikPct: 0,
      progresKeuanganPct: 0,
      tanggalMulai: '2026-05-01',
      tanggalSelesai: '2026-09-30',
      status: 'Persiapan',
      kendalaAtauCatatan: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (p: KegiatanPembangunan) => {
    setEditingProject(p);
    setFormFields({
      namaKegiatan: p.namaKegiatan,
      lokasi: p.lokasi,
      tahunAnggaran: p.tahunAnggaran,
      paguAnggaran: p.paguAnggaran,
      nilaiKontrak: p.nilaiKontrak,
      kontraktor: p.kontraktor,
      noKontrak: p.noKontrak,
      progresFisikPct: p.progresFisikPct,
      progresKeuanganPct: p.progresKeuanganPct,
      tanggalMulai: p.tanggalMulai,
      tanggalSelesai: p.tanggalSelesai,
      status: p.status,
      kendalaAtauCatatan: p.kendalaAtauCatatan
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formFields.namaKegiatan.trim()) return alert('Nama Kegiatan harus diisi!');
    if (!formFields.kontraktor.trim()) return alert('Nama Kontraktor harus diisi!');

    if (editingProject) {
      onEditProject({
        ...editingProject,
        ...formFields
      });
    } else {
      const newProject: KegiatanPembangunan = {
        id: `PROJ-${Date.now()}`,
        ...formFields
      };
      onAddProject(newProject);
      setSelectedProjectId(newProject.id);
    }
    setIsModalOpen(false);
  };

  // Simulated Slider progress changer inside main view for selected item to feel interactive!
  const handleInlineProgressChange = (physicsPct: number) => {
    if (!selectedProject) return;
    let autoStatus = selectedProject.status;
    if (physicsPct === 100) autoStatus = 'Selesai';
    else if (physicsPct > 0 && selectedProject.status === 'Persiapan') autoStatus = 'Konstruksi';
    
    // Simulate updating financial progress along physical in some sensible proportional logic
    const autoFinancePct = Math.min(100, Math.round(physicsPct * 0.9));

    onEditProject({
      ...selectedProject,
      progresFisikPct: physicsPct,
      progresKeuanganPct: autoFinancePct,
      status: autoStatus
    });
  };

  return (
    <div id="seksi-pembangunan-view" className="space-y-6">
      
      {/* Header Info Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <TrendingUp className="w-7 h-7 text-indigo-600" />
            Seksi Pembangunan Infrastruktur SDA
          </h1>
          <p className="text-xs text-gray-500">
            Pemantauan fisik, kepekaan keuangan, dokumentasi konstruksi dan pelaporan berkala program infrastruktur
          </p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 bg-indigo-600 text-white font-medium px-4 py-2 rounded-lg hover:bg-indigo-700 hover:shadow-md transition-all text-xs"
        >
          <Plus className="w-4 h-4" /> Input Laporan Proyek Baru
        </button>
      </div>

      {/* KPI Section */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
          <p className="text-[10px] font-bold text-gray-400 uppercase">Jumlah Kontrak Aktivitas</p>
          <h3 className="text-2xl font-bold text-gray-800 mt-1">{filteredProjects.length} Proyek</h3>
          <p className="text-[10px] text-gray-500 mt-0.5">Tahun Anggaran {new Date().getFullYear()}</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
          <p className="text-[10px] font-bold text-gray-400 uppercase">Total Komitmen Kontrak</p>
          <h3 className="text-2xl font-bold text-indigo-600 mt-1">Rp {(totalNilaiKontrakMatched / 1000000).toFixed(1)} Jt</h3>
          <p className="text-[10px] text-gray-500 mt-0.5">Pagu: Rp {(totalPaguMatched / 1000000).toFixed(1)} Jt</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
          <p className="text-[10px] font-bold text-gray-400 uppercase">Rerata Progres Kemajuan Fisik</p>
          <div className="flex items-center gap-2 mt-1">
            <h3 className="text-2xl font-bold text-gray-800">{averagePhysicalPct}%</h3>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold font-mono">
              On-Target
            </span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-1 mt-1.5 overflow-hidden">
            <div className="h-full bg-emerald-500" style={{ width: `${averagePhysicalPct}%` }}></div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
          <p className="text-[10px] font-bold text-gray-400 uppercase">Proyek Selesai / Terkendala</p>
          <div className="flex items-center gap-2 mt-1">
            <h3 className="text-2xl font-bold text-gray-800">
              {filteredProjects.filter(p => p.status === 'Selesai').length}
            </h3>
            <span className="text-gray-400 font-bold text-lg">/</span>
            <span className={`text-2xl font-bold ${urgentProjectsCount > 0 ? 'text-red-500' : 'text-gray-500'}`}>
              {urgentProjectsCount}
            </span>
            <span className={`text-[9px] px-1.5 rounded uppercase font-bold py-0.5 ${
              urgentProjectsCount > 0 ? 'bg-amber-50 text-amber-600 animate-pulse' : 'bg-gray-100 text-gray-600'
            }`}>
              {urgentProjectsCount > 0 ? 'Teguran' : 'Aman'}
            </span>
          </div>
          <p className="text-[10px] text-gray-500 mt-0.5">Status evaluasi berkala</p>
        </div>
      </div>

      {/* Main Section Content Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Columns: Project table listing and Quick Search Filters */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col justify-between">
          <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h3 className="font-bold text-gray-800 text-sm">Laporan Kegiatan Konstruksi Fisik</h3>
              <p className="text-xs text-gray-500">Mencatat data kontrak dan kemajuan fisik mingguan</p>
            </div>

            <div className="flex gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:max-w-[200px]">
                <input
                  type="text"
                  placeholder="Cari kegiatan/mitra..."
                  className="w-full pl-3 pr-3 py-1.5 border border-gray-200 rounded-lg text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <select
                className="bg-white border border-gray-200 rounded-lg py-1.5 px-2.5 text-xs focus:ring-1 focus:ring-indigo-500 text-gray-600 focus:outline-none"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">Sifat (Semua)</option>
                <option value="Persiapan">Persiapan</option>
                <option value="Konstruksi">Konstruksi</option>
                <option value="Show Cause Meeting">Show Cause (SCM)</option>
                <option value="Selesai">Selesai</option>
                <option value="Masa Pemeliharaan">Masa Pemeliharaan</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[650px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-gray-400 text-[10px] font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">Nama Kegiatan & Lokasi</th>
                  <th className="py-3 px-4">No Kontrak & Kontraktor</th>
                  <th className="py-3 px-4">Progres Kemajuan</th>
                  <th className="py-3 px-4">Status Kerja</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-xs text-gray-600">
                {filteredProjects.length > 0 ? (
                  filteredProjects.map((p) => (
                    <tr 
                      key={p.id} 
                      className={`hover:bg-indigo-50/20 transition-all cursor-pointer ${selectedProjectId === p.id ? 'bg-indigo-50/30 font-medium' : ''}`}
                      onClick={() => setSelectedProjectId(p.id)}
                    >
                      <td className="py-4 px-4 max-w-[260px]">
                        <div>
                          <p className="font-bold text-gray-800 line-clamp-2">{p.namaKegiatan}</p>
                          <p className="text-[10px] text-gray-500 mt-1 flex items-center gap-1.5">
                            <MapPin className="w-3 h-3 text-indigo-500" />
                            {p.lokasi}
                          </p>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div>
                          <p className="font-bold text-gray-700">{p.kontraktor}</p>
                          <p className="text-[10px] font-mono text-gray-400 mt-0.5">{p.noKontrak}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4 w-[160px]">
                        <div className="space-y-1.5">
                          {/* Physical Progress */}
                          <div>
                            <div className="flex justify-between items-center text-[10px] mb-0.5">
                              <span className="text-gray-400">Fisik:</span>
                              <span className="font-extrabold text-indigo-700">{p.progresFisikPct}%</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-1 overflow-hidden" title="Progres Fisik">
                              <div className="h-full bg-indigo-600" style={{ width: `${p.progresFisikPct}%` }}></div>
                            </div>
                          </div>

                          {/* Financial Progress */}
                          <div>
                            <div className="flex justify-between items-center text-[10px] mb-0.5">
                              <span className="text-gray-400">Bayar:</span>
                              <span className="font-extrabold text-emerald-700">{p.progresKeuanganPct}%</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-1 overflow-hidden" title="Realisasi Keuangan">
                              <div className="h-full bg-emerald-500" style={{ width: `${p.progresKeuanganPct}%` }}></div>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider block w-fit ${
                          p.status === 'Selesai' 
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                            : p.status === 'Konstruksi' 
                              ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                              : p.status === 'Show Cause Meeting' 
                                ? 'bg-rose-50 text-rose-700 border border-rose-200 animate-pulse' 
                                : 'bg-gray-100 text-gray-700 border border-gray-200'
                        }`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEditModal(p)}
                            className="p-1.5 text-blue-600 rounded hover:bg-blue-50"
                            title="Edit"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              setDeleteConfirm({ id: p.id, name: p.namaKegiatan });
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
                    <td colSpan={5} className="py-12 text-center text-gray-400 text-xs">
                      Tidak ada laporan konstruksi terdaftar.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          <div className="bg-gray-50 px-5 py-3 border-t border-gray-100 text-xs text-indigo-700 flex items-center gap-1.5 font-medium">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Pemeriksaan berkala memastikan mutu pekerjaan sesuai SNI dan Rencana Anggaran Biaya (RAB).</span>
          </div>
        </div>

        {/* Right 1 Column: Selected Project Detail & Interactive Documentation Sim */}
        <div className="space-y-6">
          {selectedProject ? (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-4">
              <div className="pb-3 border-b border-gray-100">
                <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider inline-block mb-1.5">
                  ID: {selectedProject.id}
                </span>
                <h3 className="font-extrabold text-gray-800 text-sm leading-tight">{selectedProject.namaKegiatan}</h3>
                <p className="text-[11px] text-gray-500 mt-1">{selectedProject.kontraktor}</p>
              </div>

              {/* Slider for physical changes in state layout */}
              <div className="space-y-2 p-3 bg-indigo-50/50 rounded-xl border border-indigo-100">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-gray-700 flex items-center gap-1">
                    <Sliders className="w-3.5 h-3.5 text-indigo-600" />
                    Atur Kemajuan Fisik (Simulasi):
                  </span>
                  <span className="font-mono font-extrabold text-indigo-700 text-sm">{selectedProject.progresFisikPct}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  className="w-full accent-indigo-600 cursor-pointer h-1.5 bg-gray-200 rounded-lg"
                  value={selectedProject.progresFisikPct}
                  onChange={(e) => handleInlineProgressChange(Number(e.target.value))}
                />
                <p className="text-[9px] text-gray-500 text-center italic">
                  * Seret slider untuk memicu simulasi foto perubahan fisik konstruksi di bawah!
                </p>
              </div>

              {/* Before vs After Photo Documentation Simulator */}
              <div className="space-y-3">
                <h4 className="font-extrabold text-gray-700 text-xs flex items-center gap-1.5">
                  <Image className="w-4 h-4 text-indigo-600" />
                  Simulasi Kamera Lapangan (Dokumentasi)
                </h4>

                <div className="grid grid-cols-2 gap-3">
                  {/* Photo Before */}
                  <div className="border border-gray-100 rounded-lg overflow-hidden bg-slate-900 aspect-[4/3] relative flex flex-col justify-between p-2">
                    <div className="absolute inset-0 opacity-20 bg-emerald-950 flex items-center justify-center p-4">
                      {/* Generates a simple symbolic line sketch of a damaged embankment */}
                      <span className="text-[20px] filter saturate-50 select-none">🏚️ 🪵 🌊</span>
                    </div>

                    <span className="z-10 bg-black/60 text-white font-mono text-[8px] px-1.5 py-0.5 rounded w-fit uppercase font-bold text-rose-300">
                      Sebelum (0%)
                    </span>
                    <div className="z-10 text-[9px] text-red-100 bg-red-950/40 p-1 rounded font-mono">
                      Embankment retak, sedimentasi tinggi.
                    </div>
                  </div>

                  {/* Photo Current / After */}
                  <div className="border border-gray-100 rounded-lg overflow-hidden bg-slate-900 aspect-[4/3] relative flex flex-col justify-between p-2">
                    {/* Simulated visual state of site based on progress */}
                    <div className="absolute inset-0 flex items-center justify-center transition-all bg-sky-950/50">
                      {selectedProject.progresFisikPct < 30 ? (
                        <div className="text-center space-y-1">
                          <span className="text-[20px] block opacity-40">🚜 🏗️</span>
                          <span className="text-[8px] font-mono text-gray-400">Persiapan lahan</span>
                        </div>
                      ) : selectedProject.progresFisikPct < 75 ? (
                        <div className="text-center space-y-1">
                          <span className="text-[20px] block opacity-70">🧱 🚧 🏗️</span>
                          <span className="text-[8px] font-mono text-cyan-200">Konstruksi Beton Cor</span>
                        </div>
                      ) : (
                        <div className="text-center space-y-1">
                          <span className="text-[24px] block">🏢 ⭐ 🌊</span>
                          <span className="text-[8px] font-mono text-emerald-400">Selesai Berfungsi</span>
                        </div>
                      )}
                    </div>

                    <span className="z-10 bg-black/60 text-white font-mono text-[8px] px-1.5 py-0.5 rounded w-fit uppercase font-bold text-teal-300">
                      KONDISI ({selectedProject.progresFisikPct}%)
                    </span>
                    <div className="z-10 text-[9px] text-indigo-100 bg-indigo-950/40 p-1 rounded font-mono">
                      {selectedProject.progresFisikPct < 30 
                        ? 'Excavator meratakan pondasi.' 
                        : selectedProject.progresFisikPct < 75 
                          ? 'Konstruksi beton precast m3.' 
                          : 'Beton kokoh, air terarah.'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Data Specifications summary list */}
              <div className="divide-y divide-gray-100 text-xs">
                <div className="py-2 flex justify-between">
                  <span className="text-gray-400">Pagu Anggaran:</span>
                  <span className="font-bold text-gray-800">Rp {selectedProject.paguAnggaran.toLocaleString('id-ID')}</span>
                </div>
                <div className="py-2 flex justify-between">
                  <span className="text-gray-400">Nilai Kontrak:</span>
                  <span className="font-bold text-indigo-700">Rp {selectedProject.nilaiKontrak.toLocaleString('id-ID')}</span>
                </div>
                <div className="py-2 flex justify-between">
                  <span className="text-gray-400">Tanggal Mulai:</span>
                  <span className="font-medium text-gray-700">{selectedProject.tanggalMulai}</span>
                </div>
                <div className="py-2 flex justify-between">
                  <span className="text-gray-400">Target Selesai:</span>
                  <span className="font-medium text-gray-700">{selectedProject.tanggalSelesai}</span>
                </div>
                <div className="py-2.5 flex flex-col gap-1">
                  <span className="text-gray-400 block font-bold text-[10px] uppercase">Hambatan / Kendala Lapangan:</span>
                  <p className="text-[11px] text-rose-700 leading-relaxed italic bg-rose-50/50 p-2 border border-rose-100/50 rounded-lg">
                    "{selectedProject.kendalaAtauCatatan || 'Lancar, belum ada hambatan kritis teridentifikasi.'}"
                  </p>
                </div>
              </div>

            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-100 p-8 text-center text-gray-400 text-xs">
              Pilih satu proyek dari tabel laporan untuk menampilkan data detail dokumentasi fisiknya.
            </div>
          )}
        </div>

      </div>

      {/* Add/Edit Modal Form Drawer block */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="bg-gradient-to-r from-indigo-700 to-indigo-900 p-4 text-white flex justify-between items-center">
              <h3 className="font-bold text-sm">
                {editingProject ? 'Edit Laporan Proyek Pembangunan' : 'Input Kegiatan Pembangunan Baru'}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-white hover:text-indigo-200 text-xl font-bold px-2 focus:outline-none"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
              {/* Row 1: Nama Kegiatan */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase block">Nama Kegiatan / Proyek Konstruksi</label>
                <input
                  type="text"
                  placeholder="Contoh: Rehabilitasi Tanggul Sungai Bah Bolon"
                  className="w-full p-2 border border-gray-200 rounded-lg text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  value={formFields.namaKegiatan}
                  onChange={(e) => setFormFields({ ...formFields, namaKegiatan: e.target.value })}
                  required
                />
              </div>

              {/* Row 2: Lokasi & Kontraktor */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase block">Lokasi Sawah/DI/Kecamatan</label>
                  <input
                    type="text"
                    placeholder="Contoh: Kec. Raya, Simalungun"
                    className="w-full p-2 border border-gray-200 rounded-lg text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                    value={formFields.lokasi}
                    onChange={(e) => setFormFields({ ...formFields, lokasi: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase block">Kontraktor Pelaksana</label>
                  <input
                    type="text"
                    placeholder="Contoh: PT. Citra Silau Mandiri"
                    className="w-full p-2 border border-gray-200 rounded-lg text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                    value={formFields.kontraktor}
                    onChange={(e) => setFormFields({ ...formFields, kontraktor: e.target.value })}
                    required
                  />
                </div>
              </div>

              {/* Row 3: Pagu vs Nilai Kontrak */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase block">Pagu Anggaran (Rp)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="Nilai Pagu"
                    className="w-full p-2 border border-gray-200 rounded-lg text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                    value={formFields.paguAnggaran}
                    onChange={(e) => setFormFields({ ...formFields, paguAnggaran: Number(e.target.value) })}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase block">Nilai Kontrak Kerja (Rp)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="Nilai Kontrak"
                    className="w-full p-2 border border-gray-200 rounded-lg text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                    value={formFields.nilaiKontrak}
                    onChange={(e) => setFormFields({ ...formFields, nilaiKontrak: Number(e.target.value) })}
                    required
                  />
                </div>
              </div>

              {/* Row 4: No Kontrak & Tahun */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase block">Nomor SK/Kontrak Dinas</label>
                  <input
                    type="text"
                    className="w-full p-2 border border-gray-200 rounded-lg text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                    value={formFields.noKontrak}
                    onChange={(e) => setFormFields({ ...formFields, noKontrak: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase block">Tahun Anggaran</label>
                  <input
                    type="number"
                    className="w-full p-2 border border-gray-200 rounded-lg text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                    value={formFields.tahunAnggaran}
                    onChange={(e) => setFormFields({ ...formFields, tahunAnggaran: Number(e.target.value) })}
                    required
                  />
                </div>
              </div>

              {/* Row 5: Tanggal Mulai vs Selesai */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase block">Tanggal Surat Mulai (SPMK)</label>
                  <input
                    type="date"
                    className="w-full p-2 border border-gray-200 rounded-lg text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                    value={formFields.tanggalMulai}
                    onChange={(e) => setFormFields({ ...formFields, tanggalMulai: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase block">Target PHO / Selesai</label>
                  <input
                    type="date"
                    className="w-full p-2 border border-gray-200 rounded-lg text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                    value={formFields.tanggalSelesai}
                    onChange={(e) => setFormFields({ ...formFields, tanggalSelesai: e.target.value })}
                    required
                  />
                </div>
              </div>

              {/* Row 6: Progres Fisik vs Keuangan & Status */}
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase block">Progres Fisik(%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    className="w-full p-2 border border-gray-200 rounded-lg text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                    value={formFields.progresFisikPct}
                    onChange={(e) => setFormFields({ ...formFields, progresFisikPct: Number(e.target.value) })}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase block">Keuangan(%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    className="w-full p-2 border border-gray-200 rounded-lg text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                    value={formFields.progresKeuanganPct}
                    onChange={(e) => setFormFields({ ...formFields, progresKeuanganPct: Number(e.target.value) })}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase block">Status</label>
                  <select
                    className="w-full p-2 border border-gray-200 rounded-lg text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none text-gray-700"
                    value={formFields.status}
                    onChange={(e) => setFormFields({ ...formFields, status: e.target.value as any })}
                  >
                    <option value="Persiapan">Persiapan</option>
                    <option value="Konstruksi">Konstruksi</option>
                    <option value="Show Cause Meeting">SCM (Terkendala)</option>
                    <option value="Selesai">Selesai</option>
                    <option value="Masa Pemeliharaan">Masa Pemeliharaan</option>
                  </select>
                </div>
              </div>

              {/* Row 7: Kendala / Catatan */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase block">Hambatan Lapangan / Keterangan SCM</label>
                <textarea
                  rows={2}
                  placeholder="Misalnya: Keterlambatan material, pembebasan tanah saluran sekunder nomor 4, curah hujan tinggi..."
                  className="w-full p-2 border border-gray-200 rounded-lg text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none resize-none"
                  value={formFields.kendalaAtauCatatan}
                  onChange={(e) => setFormFields({ ...formFields, kendalaAtauCatatan: e.target.value })}
                />
              </div>

              {/* Actions Footer */}
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
                  className="px-5 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-all"
                >
                  {editingProject ? 'Simpan' : 'Tambahkan'}
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
              <h3 className="font-bold text-gray-900 text-sm">Hapus Proyek Pembangunan</h3>
              <p className="text-xs text-gray-500 mt-1">
                Apakah Anda yakin ingin menghapus proyek <strong className="text-gray-800">{deleteConfirm.name}</strong>? Tindakan ini tidak bisa dibatalkan.
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
                  onDeleteProject(deleteConfirm.id);
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
