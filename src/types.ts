/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface SuratMasuk {
  id: string;
  nomorSurat: string;
  tanggalSurat: string;
  tanggalTerima: string;
  pengirim: string;
  perihal: string;
  sifat: 'Biasa' | 'Penting' | 'Rahasia';
  disposisiKepala: string;
  status: 'Baru' | 'Didisposisikan' | 'Selesai';
}

export interface SuratKeluar {
  id: string;
  nomorSurat: string;
  tanggalSurat: string;
  penerima: string;
  perihal: string;
  seksiAsal: 'Tata Usaha' | 'Seksi O&P' | 'Seksi Pembangunan';
  status: 'Draf' | 'Diajukan' | 'Ditandatangani' | 'Dikirim';
}

export interface PendidikanHistory {
  jenjang: string;
  namaSekolah: string;
  alamatSekolah: string;
  tahunLulus: string;
}

export interface KepegawaianHistory {
  skPangkat: string;
  tanggalSkPangkat: string;
  skGajiBerkala: string;
  tanggalSkGajiBerkala: string;
}

export interface Pegawai {
  id: string;
  nama: string;
  nip: string; // "-" for non-PNS/honorary
  jabatan: string;
  golongan: string; // e.g. IV/a, III/d, or "Non-ASN"
  statusKepegawaian: 'PNS' | 'PPPK' | 'Honorer' | 'Tenaga Kontrak O&P';
  telepon: string;
  email: string;
  fotoUrl?: string;
  tempatLahir?: string;
  tanggalLahir?: string;
  jenisKelamin?: 'Laki-laki' | 'Perempuan';
  agama?: string;
  statusPerkawinan?: string;
  alamat?: string;
  riwayatPendidikan?: PendidikanHistory[];
  riwayatKepegawaianDetail?: KepegawaianHistory[];
}

export interface TransaksiKeuangan {
  id: string;
  tanggal: string;
  keterangan: string;
  jumlah: number;
  tipe: 'Pemasukan' | 'Pengeluaran';
  kategori: 'Belanja Pegawai' | 'Belanja Barang' | 'Belanja Modal' | 'Pemeliharaan Irigasi' | 'Dana Darurat' | 'Lain-lain';
  nomorSPDOrSPM: string;
}

export interface Aset {
  id: string;
  kodeAset: string;
  namaAset: string;
  kategori: 'KIB A - Tanah' | 'KIB B - Peralatan dan Mesin' | 'KIB C - Gedung dan Bangunan' | 'KIB D - Jalan, Irigasi, dan Jaringan' | 'KIB E - Aset Tetap Lainnya' | 'KIB F - Konstruksi dalam Pengerjaan';
  jumlah: number;
  satuan: string;
  kondisi: 'Baik' | 'Rusak Ringan' | 'Rusak Berat';
  lokasiPenyimpanan: string;
}

export interface DaerahIrigasi {
  id: string;
  nama: string;
  luasFungsionalHa: number; // in Hectares
  luasRencanaHa: number;
  kabupatenKota: string;
  kecamatan: string;
  panjangSaluranPrimerM: number;
  panjangSaluranSekunderM: number;
  jumlahBendung: number;
  jumlahBangunanBagiSadap: number;
  kondisiSaluranPct: number; // percentage in good condition
  statusKewenangan: 'Provinsi' | 'Pusat' | 'Kabupaten';
  keteranganOP: string;  // notes of operation
}

export interface KegiatanPembangunan {
  id: string;
  namaKegiatan: string;
  lokasi: string;
  tahunAnggaran: number;
  paguAnggaran: number;
  nilaiKontrak: number;
  kontraktor: string;
  noKontrak: string;
  progresFisikPct: number;
  progresKeuanganPct: number;
  tanggalMulai: string;
  tanggalSelesai: string;
  status: 'Persiapan' | 'Konstruksi' | 'Show Cause Meeting' | 'Selesai' | 'Masa Pemeliharaan';
  kendalaAtauCatatan: string;
}

export interface ProfilKantor {
  namaKantor: string;
  singkatan: string;
  alamat: string;
  telepon: string;
  email: string;
  kepalaUptd: string;
  nipKepalaUptd: string;
  golonganKepalaUptd: string;
  petaKoordinat: string;
}
