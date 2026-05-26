/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Building2, 
  User, 
  MapPin, 
  Phone, 
  Mail, 
  ShieldAlert, 
  Download, 
  Upload, 
  RotateCcw, 
  Check, 
  Sparkles,
  Database,
  Link2,
  Lock,
  Shield,
  Key,
  Eye,
  EyeOff,
  UserCheck,
  Edit2,
  Trash2,
  Plus
} from 'lucide-react';
import { ProfilKantor, Pegawai } from '../types';

interface AkunPengguna {
  id: string;
  role: string;
  roleName: string;
  username: string;
  sandu: string; // password
  canInput: boolean;
  colorClass: string;
  allowedModules: string[];
}

interface PengaturanViewProps {
  profil: ProfilKantor;
  pegawai: Pegawai[];
  onUpdateProfil: (newProfil: ProfilKantor) => void;
  onResetData: () => void;
  activeTheme: string;
  onChangeTheme: (theme: string) => void;
  onImportBackupData: (jsonStr: string) => boolean;
  onExportBackupData: () => void;
  akuns: AkunPengguna[];
  onAddAkun: (newAcc: AkunPengguna) => Promise<void>;
  onEditAkun: (updatedAcc: AkunPengguna) => Promise<void>;
  onDeleteAkun: (id: string) => Promise<void>;
}

export default function PengaturanView({
  profil,
  pegawai = [],
  onUpdateProfil,
  onResetData,
  activeTheme,
  onChangeTheme,
  onImportBackupData,
  onExportBackupData,
  akuns = [],
  onAddAkun,
  onEditAkun,
  onDeleteAkun
}: PengaturanViewProps) {
  
  // Local state for profile form
  const [formData, setFormData] = useState<ProfilKantor>({ ...profil });
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [resetCompleted, setResetCompleted] = useState(false);
  const [importCompleted, setImportCompleted] = useState(false);
  const [importError, setImportError] = useState(false);

  const [editingAkun, setEditingAkun] = useState<AkunPengguna | null>(null);
  const [showPasswordMap, setShowPasswordMap] = useState<Record<string, boolean>>({});
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    setFormData({ ...profil });
  }, [profil]);

  // Find if currently filled head of office matches any pegawai (by name and NIP structure)
  const matchedPegawaiList = pegawai.find(
    (p) => 
      p.nama.toLowerCase().trim() === formData.kepalaUptd.toLowerCase().trim() ||
      (p.nip && p.nip !== '-' && p.nip.replace(/\s+/g, '') === formData.nipKepalaUptd.replace(/\s+/g, ''))
  );

  const handleSelectKepalaFromPegawai = (pegawaiId: string) => {
    if (!pegawaiId) {
      return;
    }
    const selected = pegawai.find(p => p.id === pegawaiId);
    if (selected) {
      setFormData({
        ...formData,
        kepalaUptd: selected.nama,
        nipKepalaUptd: selected.nip,
        golonganKepalaUptd: selected.golongan || '-'
      });
    }
  };

  // Theme presets
  const themes = [
    { id: 'hydro', name: 'Hydro Blue (Dinas SDA)', primaryColor: 'bg-teal-600', hoverColor: 'teal' },
    { id: 'emerald', name: 'Emerald Forest (Irigasi Subak)', primaryColor: 'bg-emerald-600', hoverColor: 'emerald' },
    { id: 'indigo', name: 'Ocean Indigo', primaryColor: 'bg-indigo-600', hoverColor: 'indigo' },
    { id: 'classic', name: 'Classic Slate', primaryColor: 'bg-slate-700', hoverColor: 'slate' }
  ];

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfil(formData);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
    }, 3000);
  };

  const handleResetClick = () => {
    if (confirm('Apakah Anda yakin ingin menyetel ulang semua database kegiatan, surat, dan irigasi kembali ke kondisi awal (default)? Seluruh inputan baru Anda akan terhapus.')) {
      onResetData();
      setResetCompleted(true);
      setTimeout(() => {
        setResetCompleted(false);
      }, 3000);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    const file = e.target.files?.[0];
    if (!file) return;

    fileReader.onload = (event) => {
      const text = event.target?.result as string;
      try {
        const success = onImportBackupData(text);
        if (success) {
          setImportCompleted(true);
          setImportError(false);
          setTimeout(() => setImportCompleted(false), 4000);
        } else {
          throw new Error('Invalid format');
        }
      } catch (err) {
        setImportError(true);
        setImportCompleted(false);
        setTimeout(() => setImportError(false), 4000);
      }
    };
    fileReader.readAsText(file);
  };

  return (
    <div id="pengaturan-view" className="space-y-6">
      
      {/* Title Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
          <Settings className="w-7 h-7 text-gray-700" />
          Pengaturan Sistem & Profil UPTD
        </h1>
        <p className="text-xs text-gray-500">
          Ubah konfigurasi kesekretariatan instansi, kustomisasi visual program, ekspor cadangan data lokal demi akurasi pelaporan
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Form Panel: Office Metadata Form (2 spans) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-6">
          <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2 pb-2 border-b border-gray-100">
            <Building2 className="w-4.5 h-4.5 text-gray-600" />
            Identitas Lembaga Kerja (UPTD)
          </h3>

          <form onSubmit={handleProfileSubmit} className="space-y-4 text-xs">
            {/* Row 1: Nama & Singkatan */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2 space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase">Nama Lengkap Satuan Kerja</label>
                <input
                  type="text"
                  className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-1 focus:ring-teal-500 focus:outline-none text-xs font-semibold text-gray-800"
                  value={formData.namaKantor}
                  onChange={(e) => setFormData({ ...formData, namaKantor: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase">Singkatan Kantor</label>
                <input
                  type="text"
                  className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-1 focus:ring-teal-500 focus:outline-none text-xs text-gray-800 font-mono"
                  value={formData.singkatan}
                  onChange={(e) => setFormData({ ...formData, singkatan: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* Row 2: Alamat Lengkap */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-500 uppercase">Situs Alamat Kantor Utama</label>
              <div className="relative">
                <MapPin className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-3" />
                <input
                  type="text"
                  className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-lg focus:ring-1 focus:ring-teal-500 focus:outline-none text-xs text-gray-800"
                  value={formData.alamat}
                  onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* Row 3: Kontak Telepon & Email */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase">Nomor Hubungan Telepon / Fax</label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-lg focus:ring-1 focus:ring-teal-500 focus:outline-none text-xs text-gray-800"
                    value={formData.telepon}
                    onChange={(e) => setFormData({ ...formData, telepon: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase">Surat Elektronik Resmi (E-Mail)</label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-lg focus:ring-1 focus:ring-teal-500 focus:outline-none text-xs text-gray-800 font-mono"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-4 mt-2">
              <h4 className="font-bold text-gray-700 mb-3 text-xs flex items-center gap-2">
                <User className="w-4 h-4 text-gray-600" />
                Pejabat Pengambil Keputusan (Kepala UPTD)
              </h4>
              
              {/* Koneksi Database Pegawai Option */}
              <div className="mb-4 p-3.5 bg-teal-50/40 rounded-xl border border-teal-100/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse"></span>
                    <span className="text-[10px] uppercase font-black text-teal-850 tracking-wider">Korelatif Database Kepegawaian</span>
                  </div>
                  <p className="text-[10px] text-teal-700 font-medium">Otomatisasi & sinkronisasi identitas pejabat Kepala UPTD langsung dari data pegawai.</p>
                </div>
                <div className="w-full sm:w-[280px]">
                  <select
                    className="w-full bg-white border border-teal-200 text-teal-900 rounded-lg py-1.5 px-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-teal-500 font-bold cursor-pointer"
                    value={matchedPegawaiList?.id || ''}
                    onChange={(e) => handleSelectKepalaFromPegawai(e.target.value)}
                  >
                    <option value="" className="text-gray-500 font-normal">-- Input Manual (Kustom / Non-Pegawai) --</option>
                    {pegawai.map((p) => (
                      <option key={p.id} value={p.id} className="text-gray-900 font-semibold">
                        {p.nama} ({p.jabatan || 'Staf'})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 4: Kepala UPTD & NIP */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2 space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold text-gray-500 uppercase">Nama Kepala Pelaksana Harian</label>
                    {matchedPegawaiList && (
                      <span className="text-[9px] text-teal-700 font-black bg-teal-50 border border-teal-100 px-1.5 py-0.5 rounded flex items-center gap-0.5 select-none">
                        <Link2 className="w-2.5 h-2.5" /> Terkoneksi
                      </span>
                    )}
                  </div>
                  <input
                    type="text"
                    className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-1 focus:ring-teal-500 focus:outline-none text-xs font-semibold text-gray-800"
                    value={formData.kepalaUptd}
                    onChange={(e) => setFormData({ ...formData, kepalaUptd: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase">NIP Kepala SKPD</label>
                  <input
                    type="text"
                    className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-1 focus:ring-teal-500 focus:outline-none text-xs text-gray-800 font-mono"
                    value={formData.nipKepalaUptd}
                    onChange={(e) => setFormData({ ...formData, nipKepalaUptd: e.target.value })}
                    required
                  />
                </div>
              </div>

              {/* Row 5: Golongan Pejabat */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase block">Pangkat / Golongan Ruang Kepala</label>
                  <input
                    type="text"
                    className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-1 focus:ring-teal-500 focus:outline-none text-xs text-gray-800"
                    value={formData.golonganKepalaUptd}
                    onChange={(e) => setFormData({ ...formData, golonganKepalaUptd: e.target.value })}
                    placeholder="Pembina Tingkat I (IV/b)"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase block">Titik Koordinat Geografis Pos AWLR Kantor</label>
                  <input
                    type="text"
                    className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-1 focus:ring-teal-500 focus:outline-none text-xs text-gray-800 font-mono"
                    value={formData.petaKoordinat}
                    onChange={(e) => setFormData({ ...formData, petaKoordinat: e.target.value })}
                    placeholder="2.9644° N, 99.0628° E"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Bottom Form Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <span className="text-[11px] text-gray-400 italic">
                * Data profil di atas disematkan pada lembaran cetak/PDF dan laporan administrasi tata usaha secara otomatis.
              </span>
              <button
                type="submit"
                className="bg-gray-800 hover:bg-gray-950 text-white font-bold px-5 py-2 rounded-lg hover:shadow-md transition-all flex items-center gap-1.5"
              >
                {saveSuccess ? (
                  <>
                    <Check className="w-4 h-4 text-teal-400" /> Profil Tersimpan!
                  </>
                ) : (
                  <>Simpan Perubahan Identitas</>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Right Panel: Themes & Backup Configuration (1 span) */}
        <div className="space-y-6">
          
          {/* Theme Selection */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-4">
            <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2 pb-2 border-b border-gray-100">
              <Sparkles className="w-4.5 h-4.5 text-amber-500" />
              Skema Warna Antarmuka (Tema)
            </h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Pilih warna khas dinas yang relevan dengan kepribadian UPTD daerah aliran sungai Bah Bolon.
            </p>

            <div className="grid grid-cols-1 gap-2.5">
              {themes.map((t) => (
                <div 
                  key={t.id}
                  onClick={() => onChangeTheme(t.id)}
                  className={`p-3 rounded-lg border flex items-center justify-between cursor-pointer transition-all ${
                    activeTheme === t.id 
                      ? 'border-gray-800 bg-gray-50 ring-1 ring-gray-600 font-medium' 
                      : 'border-gray-100 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full ${t.primaryColor}`}></div>
                    <span className="text-xs text-gray-800">{t.name}</span>
                  </div>
                  {activeTheme === t.id && (
                    <Check className="w-4 h-4 text-gray-800 font-extrabold" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Backup Database & Restore Management */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-4 select-none">
            <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2 pb-2 border-b border-gray-100">
              <Database className="w-4.5 h-4.5 text-indigo-600" />
              Keamanan Data & Cadangan
            </h3>
            <p className="text-[11px] text-gray-500 leading-relaxed">
              Seluruh rekapitulasi data (Surat TU, Keuangan, Inventarisasi Daerah Irigasi, Laporan Pembangunan) tersimpan aman di peramban lokal Anda. Amankan data secara berkala.
            </p>

            <div className="space-y-2.5 pt-1">
              {/* Export Button */}
              <button
                onClick={onExportBackupData}
                className="w-full flex items-center justify-center gap-2 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 font-bold py-2 px-3 rounded-lg text-xs transition-all"
              >
                <Download className="w-4 h-4" /> Unduh Cadangan Data (.JSON)
              </button>

              {/* Import Upload */}
              <div className="relative">
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full"
                  id="import-backup-file"
                />
                <label
                  htmlFor="import-backup-file"
                  className="w-full flex items-center justify-center gap-2 bg-teal-50 hover:bg-teal-100 border border-teal-200 text-teal-700 font-bold py-2 px-3 rounded-lg text-xs cursor-pointer transition-all"
                >
                  <Upload className="w-4 h-4" /> Unggah Pulihkan Data (.JSON)
                </label>
              </div>

              {/* Status messages for backup */}
              {importCompleted && (
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-[10px] text-center font-bold">
                  ✓ Database Dipulihkan! Layar dimuat ulang...
                </div>
              )}
              {importError && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg text-[10px] text-center font-bold">
                  ⚠️ Gagal membaca berkas! Format JSON salah.
                </div>
              )}

              {/* Reset to Factory Button */}
              <div className="border-t border-gray-100 pt-3 mt-1.5 space-y-2">
                <p className="text-[10px] text-rose-600 flex items-center gap-1.5 leading-relaxed bg-red-50/50 p-2 border border-red-100 rounded-lg">
                  <ShieldAlert className="w-4 h-4 shrink-0 text-rose-600" />
                  Mereset database akan mengembalikan seluruh records surat dan proyek sekunder ke data sampel baku.
                </p>
                <button
                  onClick={handleResetClick}
                  className="w-full flex items-center justify-center gap-2 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-medium py-2 px-3 rounded-lg text-xs transition-all"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  {resetCompleted ? 'Berhasil Disetel Ulang!' : 'Ulangi Kebutuhan Awal'}
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>

            {/* SECTION: AKUN PENGGUNA & KEWENANGAN INPUT DATA */}
      <div className="bg-white rounded-xl border border-gray-150 shadow-sm p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-150 pb-4">
          <div className="space-y-1">
            <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
              <Shield className="w-5 h-5 text-indigo-600" />
              Kredensial & Hak Akses Penginputan Data (Multi-Role Admin)
            </h3>
            <p className="text-xs text-gray-500">
              Setiap penugasan admin memiliki wewenang menginput/mengubah data sektoral menurut peran tanggung jawab masing-masing.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] bg-indigo-50 text-indigo-700 border border-indigo-150 rounded-full font-black px-3 py-1 uppercase select-none font-mono">
              {akuns.length} Peran Aktif
            </span>
            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-750 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Daftar Akun</span>
            </button>
          </div>
        </div>

        {/* Informative Help Box */}
        <div className="bg-indigo-50/40 p-3 rounded-lg border border-indigo-150/50 text-[11px] text-indigo-900 flex gap-2">
          <UserCheck className="w-4 h-4 shrink-0 mt-0.5 text-indigo-600" />
          <span>Hubungi bidang Kepegawaian & Tata Usaha atau gunakan tombol di atas untuk mendaftarkan personil admin tambahan di luar unit UPTD Bah Bolon. Anda juga dapat menonaktifkan izin input atau memodifikasi kredensial kapan saja.</span>
        </div>

        {/* Accounts Table Mode */}
        <div className="overflow-x-auto border border-gray-200 rounded-xl bg-white shadow-xs">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Peran Sektoral</th>
                <th className="py-3 px-4">Nama Pengguna (Username)</th>
                <th className="py-3 px-4">Kata Sandi (Password)</th>
                <th className="py-3 px-4 hidden lg:table-cell">Modul Yang Diizinkan</th>
                <th className="py-3 px-4 text-center">Status Izin Input</th>
                <th className="py-3 px-4 text-right">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-150">
              {akuns.map((acc) => {
                const isPassVisible = !!showPasswordMap[acc.id];
                return (
                  <tr key={acc.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="py-3 px-4">
                      <span className={`text-[10px] font-black uppercase font-mono px-2.5 py-1 rounded-full border ${acc.colorClass}`}>
                        {acc.roleName}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-gray-800 select-all">
                      {acc.username}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5 font-mono">
                        <span className="text-gray-800 text-[11px] select-all font-bold">
                          {isPassVisible ? acc.sandu : '••••••••'}
                        </span>
                        <button 
                          type="button"
                          onClick={() => setShowPasswordMap(prev => ({ ...prev, [acc.id]: !prev[acc.id] }))}
                          className="p-1 hover:bg-gray-200 text-gray-500 rounded-md focus:outline-none transition-colors"
                          title={isPassVisible ? 'Sembunyikan' : 'Tampilkan'}
                        >
                          {isPassVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </td>
                    <td className="py-3 px-4 hidden lg:table-cell">
                      <div className="flex flex-wrap gap-1 max-w-sm">
                        {acc.allowedModules.map((mod, mIdx) => (
                          <span key={mIdx} className="bg-gray-100 text-gray-650 px-1.5 py-0.5 rounded text-[10px] font-medium border border-gray-150/40">
                            {mod}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => {
                          onEditAkun({ ...acc, canInput: !acc.canInput });
                        }}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-bold border transition-colors ${
                          acc.canInput 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' 
                            : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                        }`}
                      >
                        <div className={`w-1.5 h-1.5 rounded-full ${acc.canInput ? 'bg-emerald-600 animate-pulse' : 'bg-rose-600'}`}></div>
                        <span>{acc.canInput ? 'Bisa Input Data' : 'Hanya Lihat'}</span>
                      </button>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => setEditingAkun(acc)}
                          className="p-1.5 text-teal-600 hover:bg-teal-50 hover:text-teal-700 rounded-lg transition-colors border border-transparent hover:border-teal-150"
                          title="Ubah Akses/Sandi"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        {acc.role !== 'super_admin' && (
                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm(`Hapus kredensial akses untuk pengguna "${acc.username}" (${acc.roleName})?`)) {
                                onDeleteAkun(acc.id);
                              }
                            }}
                            className="p-1.5 text-rose-500 hover:bg-rose-50 hover:text-rose-600 rounded-lg transition-colors border border-transparent hover:border-rose-150"
                            title="Hapus Akun"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* POPUP MODAL: TAMBAH AKUN BARU (KECUALI SUPER ADMIN) */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden border border-gray-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-indigo-750 p-4 text-white flex justify-between items-center">
              <h3 className="font-bold text-xs uppercase tracking-wider flex items-center gap-1.5">
                <Shield className="w-4 h-4" /> Daftarkan Admin Sektoral Baru
              </h3>
              <button 
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-white hover:text-indigo-200 font-bold text-lg px-1 focus:outline-none"
              >
                ×
              </button>
            </div>
            
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.currentTarget;
                const roleKey = (form.elements.namedItem('roleSelect') as HTMLSelectElement).value;
                const userVal = (form.elements.namedItem('username') as HTMLInputElement).value.trim();
                const passVal = (form.elements.namedItem('password') as HTMLInputElement).value.trim();
                
                if (!userVal || !passVal) {
                  alert('Username dan password tidak boleh kosong!');
                  return;
                }

                // Check for duplicate username
                if (akuns.some(acc => acc.username.toLowerCase() === userVal.toLowerCase())) {
                  alert(`Username "${userVal}" sudah terpakai. Silakan gunakan nama pengguna yang berbeda.`);
                  return;
                }

                // Mappings setup
                const colorMap: Record<string, string> = {
                  admin_tu: "bg-blue-100 text-blue-700 border-blue-200",
                  admin_pegawai: "bg-emerald-100 text-emerald-800 border-emerald-200",
                  admin_uang: "bg-amber-100 text-amber-800 border-amber-200",
                  admin_aset: "bg-orange-100 text-orange-850 border-orange-200",
                  surveyor: "bg-teal-100 text-teal-850 border-teal-200"
                };

                const nameMap: Record<string, string> = {
                  admin_tu: "Admin TU",
                  admin_pegawai: "Admin Pegawai",
                  admin_uang: "Admin Uang",
                  admin_aset: "Admin Aset",
                  surveyor: "Surveyor OP"
                };

                const moduleMap: Record<string, string[]> = {
                  admin_tu: ["Arsip Surat Masuk/Keluar", "Memo Disposisi Sekretaris"],
                  admin_pegawai: ["Database Kepegawaian", "Daftar Riwayat Kerja", "KGB/Kenaikan Pangkat"],
                  admin_uang: ["Pemasukan & Pengeluaran", "Cetak Laporan Keuangan"],
                  admin_aset: ["Katalog Aset KIB A-F", "Inventaris Peralatan & Mesin"],
                  surveyor: ["Pencatatan D.I.", "Data Kondisi Bangunan Pendukung"]
                };

                const newAcc: AkunPengguna = {
                  id: `u-${Date.now()}`,
                  role: roleKey,
                  roleName: nameMap[roleKey] || "Sektoral Admin",
                  username: userVal,
                  sandu: passVal,
                  canInput: true,
                  colorClass: colorMap[roleKey] || "bg-gray-100 text-gray-700 border-gray-200",
                  allowedModules: moduleMap[roleKey] || ["Spesifik Modul"]
                };

                onAddAkun(newAcc);
                setShowAddModal(false);
              }}
              className="p-5 space-y-4 text-xs"
            >
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase">Bagian / Peran Sektoral</label>
                <select
                  name="roleSelect"
                  className="w-full p-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 font-bold text-gray-800 bg-white"
                  required
                >
                  <option value="admin_tu">Admin TU (Sekretariat / Tata Usaha)</option>
                  <option value="admin_pegawai">Admin Pegawai (Urusan Kepegawaian)</option>
                  <option value="admin_uang">Admin Keuangan (Aset / Anggaran)</option>
                  <option value="admin_aset">Admin Aset (Inventarisasi KIB A-F)</option>
                  <option value="surveyor">Surveyor OP (Penginputan Daerah Irigasi & Bangunan OP)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase">Nama Pengguna (Username)</label>
                <input
                  type="text"
                  name="username"
                  placeholder="contoh: dicky.tatausaha"
                  className="w-full p-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 font-bold"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase">Kata Sandi Default</label>
                <input
                  type="text"
                  name="password"
                  placeholder="contoh: BahBolon_TU2026"
                  className="w-full p-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                  required
                />
              </div>

              <div className="bg-indigo-50/50 p-3 rounded-lg border border-indigo-150/45 text-[10px] text-indigo-900">
                ⭐ <strong>Hak Akses Penginputan:</strong> Secara default, akun baru yang didaftarkan akan langsung diberikan wewenang penuh untuk melakukan penginputan & modifikasi data sesuai dengan bagian masing-masing.
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-gray-200 rounded-lg text-gray-500 font-medium hover:bg-gray-50 transition-colors bg-white hover:text-gray-700"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg hover:shadow transition-colors"
                >
                  Daftarkan Akun
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* POPUP MODAL: EDIT AKUN KREDENSIAL */}
      {editingAkun && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full overflow-hidden border border-gray-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-gradient-to-r from-teal-600 to-indigo-700 p-4 text-white flex justify-between items-center">
              <h3 className="font-bold text-xs uppercase tracking-wider flex items-center gap-1.5">
                <Lock className="w-4 h-4" /> Edit Akun {editingAkun.roleName}
              </h3>
              <button 
                type="button"
                onClick={() => setEditingAkun(null)}
                className="text-white hover:text-teal-200 font-bold text-lg px-1 focus:outline-none"
              >
                ×
              </button>
            </div>
            
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.currentTarget;
                const userVal = (form.elements.namedItem('username') as HTMLInputElement).value;
                const passVal = (form.elements.namedItem('password') as HTMLInputElement).value;
                
                if (!userVal.trim() || !passVal.trim()) {
                  alert('Username dan Password tidak boleh kosong!');
                  return;
                }
                
                onEditAkun({ ...editingAkun, username: userVal, sandu: passVal });
                setEditingAkun(null);
              }}
              className="p-5 space-y-4 text-xs bg-white"
            >
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase">Nama Pengguna (Username)</label>
                <input
                  type="text"
                  name="username"
                  defaultValue={editingAkun.username}
                  className="w-full p-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500 font-bold"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-550 uppercase">Kata Sandi Baru</label>
                <input
                  type="text"
                  name="password"
                  defaultValue={editingAkun.sandu}
                  className="w-full p-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500 font-mono"
                  required
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingAkun(null)}
                  className="px-4 py-2 border border-gray-200 rounded-lg text-gray-500 font-medium hover:bg-gray-50 transition-colors bg-white hover:text-gray-700"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg hover:shadow transition-colors"
                >
                  Simpan Kredensial
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
