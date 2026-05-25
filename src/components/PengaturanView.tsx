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
  Link2
} from 'lucide-react';
import { ProfilKantor, Pegawai } from '../types';

interface PengaturanViewProps {
  profil: ProfilKantor;
  pegawai: Pegawai[];
  onUpdateProfil: (newProfil: ProfilKantor) => void;
  onResetData: () => void;
  activeTheme: string;
  onChangeTheme: (theme: string) => void;
  onImportBackupData: (jsonStr: string) => boolean;
  onExportBackupData: () => void;
}

export default function PengaturanView({
  profil,
  pegawai = [],
  onUpdateProfil,
  onResetData,
  activeTheme,
  onChangeTheme,
  onImportBackupData,
  onExportBackupData
}: PengaturanViewProps) {
  
  // Local state for profile form
  const [formData, setFormData] = useState<ProfilKantor>({ ...profil });
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [resetCompleted, setResetCompleted] = useState(false);
  const [importCompleted, setImportCompleted] = useState(false);
  const [importError, setImportError] = useState(false);

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
    </div>
  );
}
