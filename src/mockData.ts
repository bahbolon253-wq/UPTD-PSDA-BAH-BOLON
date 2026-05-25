/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  SuratMasuk,
  SuratKeluar,
  Pegawai,
  TransaksiKeuangan,
  Aset,
  DaerahIrigasi,
  KegiatanPembangunan,
  ProfilKantor
} from './types';

export const initialProfil: ProfilKantor = {
  namaKantor: 'UPTD Pengelolaan Sumber Daya Air (PSDA) Bah Bolon',
  singkatan: 'UPTD PSDA Bah Bolon',
  alamat: 'Jl. Asahan Km. 4.5, Kota Pematangsiantar, Sumatera Utara, 21143',
  telepon: '(0622) 22345',
  email: 'uptd.psda.bahbolon@sumutprov.go.id',
  kepalaUptd: 'Ir. H. Syahrizal Pane, M.Si.',
  nipKepalaUptd: '19710814 199803 1 004',
  golonganKepalaUptd: 'Pembina Tingkat I (IV/b)',
  petaKoordinat: '2.9644° N, 99.0628° E'
};

export const initialSuratMasuk: SuratMasuk[] = [
  {
    id: 'SM-001',
    nomorSurat: '050/782/PSDA-SU/I/2026',
    tanggalSurat: '2026-05-10',
    tanggalTerima: '2026-05-12',
    pengirim: 'Dinas Sumber Daya Air, Cipta Karya dan Tata Ruang Provinsi Sumatera Utara',
    perihal: 'Koordinasi Penyusunan Rencana Kebutuhan Sarana Alat Berat O&P Irigasi',
    sifat: 'Penting',
    disposisiKepala: 'Seksi O&P koordinasikan kebutuhan ekskavator untuk pengerukan sedimen D.I. Kerasaan.',
    status: 'Didisposisikan'
  },
  {
    id: 'SM-002',
    nomorSurat: '220/104/Si/2026',
    tanggalSurat: '2026-05-14',
    tanggalTerima: '2026-05-15',
    pengirim: 'Pemerintah Kabupaten Simalungun - Bappeda',
    perihal: 'Rapat Koordinasi Sinkronisasi Daerah Irigasi Kewenangan Provinsi',
    sifat: 'Biasa',
    disposisiKepala: 'Kasi Pembangunan mendampingi kunker bersama Bappeda Simalungun.',
    status: 'Selesai'
  },
  {
    id: 'SM-003',
    nomorSurat: '10/KT-P3A/BB/V/2026',
    tanggalSurat: '2026-05-18',
    tanggalTerima: '2026-05-20',
    pengirim: 'Gabungan P3A (Perkumpulan Petani Pemakai Air) Bah Bolon Kanan',
    perihal: 'Permohonan Normalisasi Saluran Sekunder yang Tertimbun Longsoran',
    sifat: 'Penting',
    disposisiKepala: 'Seksi O&P cek lapangan segera, jadwalkan alat berat swakelola.',
    status: 'Baru'
  },
  {
    id: 'SM-004',
    nomorSurat: '800/1230/Kepeg/2026',
    tanggalSurat: '2026-05-21',
    tanggalTerima: '2026-05-22',
    pengirim: 'Badan Kepegawaian Daerah Provinsi Sumatera Utara',
    perihal: 'Undangan Workshop Penerapan Aplikasi E-Kinerja ASN Lingkup PemprovSU',
    sifat: 'Biasa',
    disposisiKepala: 'Kasubag TU tugas staf kepegawaian untuk hadir.',
    status: 'Didisposisikan'
  },
  {
    id: 'SM-005',
    nomorSurat: '005/334/TU-BB/2026',
    tanggalSurat: '2026-05-24',
    tanggalTerima: '2026-05-25',
    pengirim: 'Kementerian PUPR - Balai Wilayah Sungai (BWS) Sumatera II',
    perihal: 'Sosialisasi Alokasi Air Musim Tanam Gadu Wilayah Sungai Toba Asahan',
    sifat: 'Rahasia',
    disposisiKepala: 'Kasi OP & Koordinator Pengamat Pengairan harap hadir.',
    status: 'Baru'
  }
];

export const initialSuratKeluar: SuratKeluar[] = [
  {
    id: 'SK-001',
    nomorSurat: '503/120/UPTD-BB/V/2026',
    tanggalSurat: '2026-05-02',
    penerima: 'Dinas SDA, CK & TR Provinsi Sumatera Utara',
    perihal: 'Laporan Bulanan Realisasi Fisik & Keuangan Bulan April Angg. 2026',
    seksiAsal: 'Tata Usaha',
    status: 'Dikirim'
  },
  {
    id: 'SK-002',
    nomorSurat: '611/145/UPTD-BB/V/2026',
    tanggalSurat: '2026-05-08',
    penerima: 'Camat Bandar - Kabupaten Simalungun',
    perihal: 'Pemberitahuan Jadwal Pengeringan Saluran D.I. Kerasaan untuk O&P',
    seksiAsal: 'Seksi O&P',
    status: 'Dikirim'
  },
  {
    id: 'SK-003',
    nomorSurat: '602/201/UPTD-BB/V/2026',
    tanggalSurat: '2026-05-18',
    penerima: 'PT. Sumut Karya Mandiri (Kontraktor)',
    perihal: 'Surat Teguran I - Lambatnya Progres Fisik D.I. Silau',
    seksiAsal: 'Seksi Pembangunan',
    status: 'Ditandatangani'
  },
  {
    id: 'SK-004',
    nomorSurat: '005/211/UPTD-BB/V/2026',
    tanggalSurat: '2026-05-23',
    penerima: 'Seluruh Pengamat Irigasi dan Juru Pintu Air UPTD Bah Bolon',
    perihal: 'Undangan Rapat Evaluasi Kinerja Petugas Lapangan Triwulan II 2026',
    seksiAsal: 'Tata Usaha',
    status: 'Diajukan'
  }
];

export const initialPegawai: Pegawai[] = [
  {
    id: 'PEG-001',
    nama: 'Ir. H. Syahrizal Pane, M.Si.',
    nip: '19710814 199803 1 004',
    jabatan: 'Kepala UPTD PSDA Bah Bolon',
    golongan: 'Pembina Tingkat I (IV/b)',
    statusKepegawaian: 'PNS',
    telepon: '0812-6543-9988',
    email: 'syahrizal.pane@sumutprov.go.id',
    tempatLahir: 'Medan',
    tanggalLahir: '1971-08-14',
    jenisKelamin: 'Laki-laki',
    agama: 'Islam',
    statusPerkawinan: 'Kawin',
    alamat: 'Jl. STM No. 24, Suka Maju, Kec. Medan Johor, Kota Medan, Sumatera Utara 20143',
    riwayatPendidikan: [
      { jenjang: 'SD', namaSekolah: 'SD Negeri 060843 Medan', alamatSekolah: 'Medan', tahunLulus: '1983' },
      { jenjang: 'SMP', namaSekolah: 'SMP Negeri 1 Medan', alamatSekolah: 'Medan', tahunLulus: '1986' },
      { jenjang: 'SMA', namaSekolah: 'SMA Negeri 1 Medan', alamatSekolah: 'Medan', tahunLulus: '1989' },
      { jenjang: 'S1', namaSekolah: 'Universitas Sumatera Utara', alamatSekolah: 'Kampus USU, Medan', tahunLulus: '1995' },
      { jenjang: 'S2', namaSekolah: 'Institut Teknologi Bandung', alamatSekolah: 'Bandung', tahunLulus: '2004' }
    ],
    riwayatKepegawaianDetail: [
      { skPangkat: '800/12/SK/2015', tanggalSkPangkat: '2015-04-01', skGajiBerkala: '800/314/KGB/2015', tanggalSkGajiBerkala: '2015-05-01' },
      { skPangkat: '821/204/SK/2019', tanggalSkPangkat: '2019-10-01', skGajiBerkala: '822/105/KGB/2021', tanggalSkGajiBerkala: '2021-10-01' }
    ]
  },
  {
    id: 'PEG-002',
    nama: 'Murni Hartati, S.E., M.Si.',
    nip: '19761102 200501 2 003',
    jabatan: 'Kepala Sub Bagian Tata Usaha (KTU)',
    golongan: 'Pembina (IV/a)',
    statusKepegawaian: 'PNS',
    telepon: '0811-6234-1100',
    email: 'murni.hartati@sumutprov.go.id',
    tempatLahir: 'Pematangsiantar',
    tanggalLahir: '1976-11-02',
    jenisKelamin: 'Perempuan',
    agama: 'Islam',
    statusPerkawinan: 'Kawin',
    alamat: 'Jl. Merdeka No. 88, Pematangsiantar, Sumatera Utara',
    riwayatPendidikan: [
      { jenjang: 'SD', namaSekolah: 'SD Sederhana Siantar', alamatSekolah: 'Pematangsiantar', tahunLulus: '1988' },
      { jenjang: 'SMP', namaSekolah: 'SMP Negeri 2 Siantar', alamatSekolah: 'Pematangsiantar', tahunLulus: '1991' },
      { jenjang: 'SMA', namaSekolah: 'SMA Negeri 1 Siantar', alamatSekolah: 'Pematangsiantar', tahunLulus: '1994' },
      { jenjang: 'S1', namaSekolah: 'Universitas Muhammadiyah Sumatera Utara', alamatSekolah: 'Medan', tahunLulus: '1999' }
    ],
    riwayatKepegawaianDetail: [
      { skPangkat: '811/44/SK-KPG/2018', tanggalSkPangkat: '2018-04-01', skGajiBerkala: '812/91/KGB/2020', tanggalSkGajiBerkala: '2020-05-15' }
    ]
  },
  {
    id: 'PEG-003',
    nama: 'Zulfikar Ginting, S.T., M.Eng.',
    nip: '19680715 199303 1 002',
    jabatan: 'Kepala Seksi Operasi dan Pemeliharaan (Kasi O&P)',
    golongan: 'Penata Tingkat I (III/d)',
    statusKepegawaian: 'PNS',
    telepon: '0813-7055-1234',
    email: 'zulfikar.ginting@sumutprov.go.id',
    tempatLahir: 'Kabanjahe',
    tanggalLahir: '1968-07-15',
    jenisKelamin: 'Laki-laki',
    agama: 'Protestan',
    statusPerkawinan: 'Kawin',
    alamat: 'Jl. Parapat No. 12, Kel. Simarito, Kec. Siantar Barat, Kota Pematangsiantar',
    riwayatPendidikan: [
      { jenjang: 'SD', namaSekolah: 'SD Negeri Kabanjahe', alamatSekolah: 'Kabanjahe', tahunLulus: '1980' },
      { jenjang: 'SMP', namaSekolah: 'SMP Negeri 1 Kabanjahe', alamatSekolah: 'Kabanjahe', tahunLulus: '1983' },
      { jenjang: 'SMA', namaSekolah: 'SMA Negeri 1 Kabanjahe', alamatSekolah: 'Kabanjahe', tahunLulus: '1986' },
      { jenjang: 'S1', namaSekolah: 'Universitas Sumatera Utara', alamatSekolah: 'Medan', tahunLulus: '1991' },
      { jenjang: 'S2', namaSekolah: 'Gadjah Mada University', alamatSekolah: 'Yogyakarta', tahunLulus: '2001' }
    ],
    riwayatKepegawaianDetail: [
      { skPangkat: '821/204/O&P/2018', tanggalSkPangkat: '2018-04-01', skGajiBerkala: '822/105/KGB/2020', tanggalSkGajiBerkala: '2020-04-01' },
      { skPangkat: '821/305/OP-SDA/2022', tanggalSkPangkat: '2022-04-01', skGajiBerkala: '822/502/KGB/2024', tanggalSkGajiBerkala: '2024-04-01' }
    ]
  },
  {
    id: 'PEG-004',
    nama: 'Hendry Saragih, S.T.',
    nip: '19850920 201101 1 005',
    jabatan: 'Kepala Seksi Pembangunan & Rehabilitasi',
    golongan: 'Penata (III/c)',
    statusKepegawaian: 'PNS',
    telepon: '0852-9600-4567',
    email: 'hendry.saragih@sumutprov.go.id',
    tempatLahir: 'Raya',
    tanggalLahir: '1985-09-20',
    jenisKelamin: 'Laki-laki',
    agama: 'Katolik',
    statusPerkawinan: 'Kawin',
    alamat: 'Jl. Melanthon Siregar No. 4, Pematangsiantar, Sumatera Utara',
    riwayatPendidikan: [
      { jenjang: 'SD', namaSekolah: 'SD Katolik Raya', alamatSekolah: 'Raya', tahunLulus: '1997' },
      { jenjang: 'SMP', namaSekolah: 'SMP Negeri 1 Raya', alamatSekolah: 'Raya', tahunLulus: '2000' },
      { jenjang: 'SMA', namaSekolah: 'SMA Masehi Pematangsiantar', alamatSekolah: 'Pematangsiantar', tahunLulus: '2003' },
      { jenjang: 'S1', namaSekolah: 'Institut Teknologi Medan', alamatSekolah: 'Medan', tahunLulus: '2008' }
    ],
    riwayatKepegawaianDetail: [
      { skPangkat: '800/100/SK-KPG/2018', tanggalSkPangkat: '2018-06-15', skGajiBerkala: '800/220/KGB-SDA/2020', tanggalSkGajiBerkala: '2020-06-15' },
      { skPangkat: '800/150/SK-KPG/2022', tanggalSkPangkat: '2022-06-15', skGajiBerkala: '800/310/KGB-SDA/2024', tanggalSkGajiBerkala: '2024-06-10' }
    ]
  },
  {
    id: 'PEG-005',
    nama: 'Dewi Sartika Simanjuntak, A.Md.',
    nip: '19910515 201704 2 001',
    jabatan: 'Bendahara Pengeluaran Pembantu',
    golongan: 'Penata Muda (III/a)',
    statusKepegawaian: 'PNS',
    telepon: '0821-6450-4499',
    email: 'dewi.sartika@sumutprov.go.id',
    tempatLahir: 'Tarutung',
    tanggalLahir: '1991-05-15',
    jenisKelamin: 'Perempuan',
    agama: 'Protestan',
    statusPerkawinan: 'Belum Kawin',
    alamat: 'Jl. Kartini No. 42, Pematangsiantar, Sumatera Utara',
    riwayatPendidikan: [
      { jenjang: 'SD', namaSekolah: 'SD Negeri 1 Tarutung', alamatSekolah: 'Tarutung', tahunLulus: '2003' },
      { jenjang: 'SMP', namaSekolah: 'SMP Negeri 1 Tarutung', alamatSekolah: 'Tarutung', tahunLulus: '2006' },
      { jenjang: 'SMA', namaSekolah: 'SMA Negeri 1 Tarutung', alamatSekolah: 'Tarutung', tahunLulus: '2009' },
      { jenjang: 'D3', namaSekolah: 'Politeknik Negeri Medan', alamatSekolah: 'Medan', tahunLulus: '2012' }
    ],
    riwayatKepegawaianDetail: [
      { skPangkat: '811/15/PANGKAT/2017', tanggalSkPangkat: '2017-04-01', skGajiBerkala: '811/320/KGB/2019', tanggalSkGajiBerkala: '2019-04-01' },
      { skPangkat: '811/84/PANGKAT/2021', tanggalSkPangkat: '2021-04-01', skGajiBerkala: '811/440/KGB/2023', tanggalSkGajiBerkala: '2023-04-01' }
    ]
  },
  {
    id: 'PEG-006',
    nama: 'Budi Hartono Sinaga',
    nip: '-',
    jabatan: 'Staf Administrasi & Operator Komputer',
    golongan: 'Non-ASN',
    statusKepegawaian: 'PPPK',
    telepon: '0823-7711-2099',
    email: 'budi.hartono@gmail.com',
    tempatLahir: 'Simalungun',
    tanggalLahir: '1994-02-18',
    jenisKelamin: 'Laki-laki',
    agama: 'Katolik',
    statusPerkawinan: 'Belum Kawin',
    alamat: 'Jl. Asahan Km. 4, Kab. Simalungun, Sumatera Utara',
    riwayatPendidikan: [
      { jenjang: 'SD', namaSekolah: 'SD Inpres Simalungun', alamatSekolah: 'Simalungun', tahunLulus: '2006' },
      { jenjang: 'SMP', namaSekolah: 'SMP Negeri 1 Siantar', alamatSekolah: 'Pematangsiantar', tahunLulus: '2009' },
      { jenjang: 'SMA', namaSekolah: 'SMK Negeri 2 Pematangsiantar', alamatSekolah: 'Pematangsiantar', tahunLulus: '2012' },
      { jenjang: 'S1', namaSekolah: 'Universitas Efarina', alamatSekolah: 'Simalungun', tahunLulus: '2017' }
    ],
    riwayatKepegawaianDetail: [
      { skPangkat: '800/10/PPPK/2023', tanggalSkPangkat: '2023-01-01', skGajiBerkala: '800/50/PPPK-KGB/2025', tanggalSkGajiBerkala: '2025-01-01' }
    ]
  },
  {
    id: 'PEG-007',
    nama: 'Togu Ambarita',
    nip: '-',
    jabatan: 'Koordinator Pengamat Daerah Irigasi Bah Bolon',
    golongan: 'Non-ASN',
    statusKepegawaian: 'Tenaga Kontrak O&P',
    telepon: '0853-6677-8899',
    email: 'togu.ambarita@gmail.com',
    tempatLahir: 'Ambarita',
    tanggalLahir: '1980-04-20',
    jenisKelamin: 'Laki-laki',
    agama: 'Protestan',
    statusPerkawinan: 'Kawin',
    alamat: 'Jl. Sisingamangaraja No. 100, Pematangsiantar, Sumatera Utara',
    riwayatPendidikan: [
      { jenjang: 'SD', namaSekolah: 'SD Ambarita', alamatSekolah: 'Samosir', tahunLulus: '1992' },
      { jenjang: 'SMP', namaSekolah: 'SMP Negeri Tomok', alamatSekolah: 'Samosir', tahunLulus: '1995' },
      { jenjang: 'SMA', namaSekolah: 'SMA Negeri Pangururan', alamatSekolah: 'Samosir', tahunLulus: '1998' }
    ],
    riwayatKepegawaianDetail: [
      { skPangkat: '034/SPK/SDA-BB/2024', tanggalSkPangkat: '2024-01-02', skGajiBerkala: '034/SPK-GAJI/SDA-BB/2024', tanggalSkGajiBerkala: '2024-01-02' }
    ]
  },
  {
    id: 'PEG-008',
    nama: 'Ahmad Dahlan Lubis',
    nip: '-',
    jabatan: 'Petugas Juru Pintu Air Bendung Kerasaan',
    golongan: 'Non-ASN',
    statusKepegawaian: 'Tenaga Kontrak O&P',
    telepon: '0812-9900-8811',
    email: 'dahlan.lubis@gmail.com',
    tempatLahir: 'Mandailing Natal',
    tanggalLahir: '1988-12-10',
    jenisKelamin: 'Laki-laki',
    agama: 'Islam',
    statusPerkawinan: 'Kawin',
    alamat: 'Jl. Seram No. 7, Pematangsiantar, Sumatera Utara',
    riwayatPendidikan: [
      { jenjang: 'SD', namaSekolah: 'SD Panyabungan', alamatSekolah: 'Mandailing Natal', tahunLulus: '2000' },
      { jenjang: 'SMP', namaSekolah: 'SMP Negeri 1 Panyabungan', alamatSekolah: 'Mandailing Natal', tahunLulus: '2003' },
      { jenjang: 'SMA', namaSekolah: 'SMA Negeri 1 Panyabungan', alamatSekolah: 'Mandailing Natal', tahunLulus: '2006' }
    ],
    riwayatKepegawaianDetail: [
      { skPangkat: '089/SPK/SDA-BB/2024', tanggalSkPangkat: '2024-01-02', skGajiBerkala: '089/SPK-GAJI/SDA-BB/2024', tanggalSkGajiBerkala: '2024-01-02' }
    ]
  }
];

export const initialKeuangan: TransaksiKeuangan[] = [
  {
    id: 'TX-101',
    tanggal: '2026-05-02',
    keterangan: 'Belanja Gaji & Tunjangan ASN Bulan Mei 2026',
    jumlah: 135400000,
    tipe: 'Pengeluaran',
    kategori: 'Belanja Pegawai',
    nomorSPDOrSPM: 'SPM-00344/1.02/V/2026'
  },
  {
    id: 'TX-102',
    tanggal: '2026-05-04',
    keterangan: 'Penerimaan Droping Dana Sisa Uang Persediaan (UP) Triwulan II',
    jumlah: 50000000,
    tipe: 'Pemasukan',
    kategori: 'Lain-lain',
    nomorSPDOrSPM: 'SP2D-91044/2026'
  },
  {
    id: 'TX-103',
    tanggal: '2026-05-06',
    keterangan: 'Pembelian Solar Alat Berat Ekskavator D.I. Kerasaan (Swakelola)',
    jumlah: 18500000,
    tipe: 'Pengeluaran',
    kategori: 'Pemeliharaan Irigasi',
    nomorSPDOrSPM: 'SP2D-65239/O&P/2026'
  },
  {
    id: 'TX-104',
    tanggal: '2026-05-12',
    keterangan: 'Pembayaran Belanja Alat Tulis Kantor (ATK) Triwulan II',
    jumlah: 9500000,
    tipe: 'Pengeluaran',
    kategori: 'Belanja Barang',
    nomorSPDOrSPM: 'SPM-00366/1.02/V/2026'
  },
  {
    id: 'TX-105',
    tanggal: '2026-05-19',
    keterangan: 'Pembayaran Sertifikasi Termin I Rehabilitasi Jaringan Irigasi D.I. Raya',
    jumlah: 245000000,
    tipe: 'Pengeluaran',
    kategori: 'Belanja Modal',
    nomorSPDOrSPM: 'SP2D-93822/PEMB/2026'
  }
];

export const initialAset: Aset[] = [
  {
    id: 'AST-001',
    kodeAset: '1.01.01.01.002',
    namaAset: 'Tanah Pekarangan Kompleks Kantor Induk UPTD',
    kategori: 'KIB A - Tanah',
    jumlah: 2400,
    satuan: 'm²',
    kondisi: 'Baik',
    lokasiPenyimpanan: 'Jl. Asahan Km. 4.5, Kota Pematangsiantar'
  },
  {
    id: 'AST-002',
    kodeAset: '1.02.01.03.001',
    namaAset: 'Ekskavator Standard Kobelco SK200',
    kategori: 'KIB B - Peralatan dan Mesin',
    jumlah: 1,
    satuan: 'Unit',
    kondisi: 'Baik',
    lokasiPenyimpanan: 'Pool Alat Berat Dinas SDA Sumut / Kantor Induk'
  },
  {
    id: 'AST-003',
    kodeAset: '1.02.01.03.002',
    namaAset: 'Ekskavator Mini Hitachi ZX48U',
    kategori: 'KIB B - Peralatan dan Mesin',
    jumlah: 1,
    satuan: 'Unit',
    kondisi: 'Rusak Ringan',
    lokasiPenyimpanan: 'Pekarangan Kantor UPTD PSDA Bah Bolon P.Siantar'
  },
  {
    id: 'AST-004',
    kodeAset: '1.02.01.04.015',
    namaAset: 'Mobil Dinas Toyota Hilux BK 8092 W (O&P Lapangan)',
    kategori: 'KIB B - Peralatan dan Mesin',
    jumlah: 1,
    satuan: 'Unit',
    kondisi: 'Baik',
    lokasiPenyimpanan: 'Garasi Kantor UPTD'
  },
  {
    id: 'AST-005',
    kodeAset: '1.02.01.04.044',
    namaAset: 'Sepeda Motor Lapangan Kawasaki KLX 150 (Petugas Juru)',
    kategori: 'KIB B - Peralatan dan Mesin',
    jumlah: 6,
    satuan: 'Unit',
    kondisi: 'Baik',
    lokasiPenyimpanan: 'Kantor Pengamat Pengairan Masing-masing DI'
  },
  {
    id: 'AST-006',
    kodeAset: '1.02.03.02.001',
    namaAset: 'Alat Ukur Debit Air Otomatis (AWLR) Hidrologi',
    kategori: 'KIB B - Peralatan dan Mesin',
    jumlah: 4,
    satuan: 'Set',
    kondisi: 'Rusak Ringan',
    lokasiPenyimpanan: 'Pos Hidrologi Sungai Bah Bolon & Sungai Silau'
  },
  {
    id: 'AST-007',
    kodeAset: '1.03.01.01.001',
    namaAset: 'Gedung Kantor Induk Permanen (Dua Lantai)',
    kategori: 'KIB C - Gedung dan Bangunan',
    jumlah: 1,
    satuan: 'Unit',
    kondisi: 'Baik',
    lokasiPenyimpanan: 'Jl. Asahan Km. 4.5, Kota Pematangsiantar'
  },
  {
    id: 'AST-008',
    kodeAset: '1.04.03.01.001',
    namaAset: 'Konstruksi Bendung Utama D.I. Kerasaan',
    kategori: 'KIB D - Jalan, Irigasi, dan Jaringan',
    jumlah: 1,
    satuan: 'Unit',
    kondisi: 'Baik',
    lokasiPenyimpanan: 'D.I. Kerasaan, Kec. Pematang Bandar'
  },
  {
    id: 'AST-009',
    kodeAset: '1.05.02.01.015',
    namaAset: 'Peta Citra Spasial Digital Catchment Area Sungai Bah Bolon',
    kategori: 'KIB E - Aset Tetap Lainnya',
    jumlah: 1,
    satuan: 'Dokumen',
    kondisi: 'Baik',
    lokasiPenyimpanan: 'Arsip Data Seksi O&P'
  },
  {
    id: 'AST-010',
    kodeAset: '1.06.01.01.004',
    namaAset: 'Konstruksi Tanggul Pengaman Tebing Saluran D.I. Silau',
    kategori: 'KIB F - Konstruksi dalam Pengerjaan',
    jumlah: 1,
    satuan: 'Paket',
    kondisi: 'Baik',
    lokasiPenyimpanan: 'Saluran Sekunder D.I. Silau Simalungun'
  }
];

export const initialDaerahIrigasi: DaerahIrigasi[] = [
  {
    id: 'DI-001',
    nama: 'D.I. Bah Bolon',
    luasFungsionalHa: 6511,
    luasRencanaHa: 7300,
    kabupatenKota: 'Simalungun',
    kecamatan: 'Tanah Jawa, Hatonduhan, Pematang Tanah Jawa',
    panjangSaluranPrimerM: 14500,
    panjangSaluranSekunderM: 28400,
    jumlahBendung: 1,
    jumlahBangunanBagiSadap: 38,
    kondisiSaluranPct: 82,
    statusKewenangan: 'Provinsi',
    keteranganOP: 'Air mengalir kontinu, terdapat penumpukan sampah di Saluran Sekunder Sekip.'
  },
  {
    id: 'DI-002',
    nama: 'D.I. Kerasaan',
    luasFungsionalHa: 4850,
    luasRencanaHa: 5000,
    kabupatenKota: 'Simalungun',
    kecamatan: 'Bandar, Pematang Bandar',
    panjangSaluranPrimerM: 9800,
    panjangSaluranSekunderM: 18200,
    jumlahBendung: 1,
    jumlahBangunanBagiSadap: 24,
    kondisiSaluranPct: 74,
    statusKewenangan: 'Provinsi',
    keteranganOP: 'Pintu bendung utama berfungsi normal, sedimen di hilir bendung setinggi 0.8 meter memerlukan pengerukan.'
  },
  {
    id: 'DI-003',
    nama: 'D.I. Raya',
    luasFungsionalHa: 1240,
    luasRencanaHa: 1500,
    kabupatenKota: 'Simalungun',
    kecamatan: 'Raya, Pamatang Raya',
    panjangSaluranPrimerM: 5400,
    panjangSaluranSekunderM: 7100,
    jumlahBendung: 1,
    jumlahBangunanBagiSadap: 11,
    kondisiSaluranPct: 90,
    statusKewenangan: 'Provinsi',
    keteranganOP: 'Daerah irigasi dataran tinggi, debit air lancar, bangunan bagi sadap dalam kondisi terpelihara.'
  },
  {
    id: 'DI-004',
    nama: 'D.I. Bandar',
    luasFungsionalHa: 2280,
    luasRencanaHa: 2500,
    kabupatenKota: 'Simalungun',
    kecamatan: 'Bandar, Perdagangan',
    panjangSaluranPrimerM: 8200,
    panjangSaluranSekunderM: 12500,
    jumlahBendung: 1,
    jumlahBangunanBagiSadap: 18,
    kondisiSaluranPct: 68,
    statusKewenangan: 'Provinsi',
    keteranganOP: 'Ada kebocoran pada tanggul saluran sekunder B6, sedang diusulkan penanganan darurat.'
  },
  {
    id: 'DI-005',
    nama: 'D.I. Silau',
    luasFungsionalHa: 1890,
    luasRencanaHa: 2000,
    kabupatenKota: 'Asahan / Simalungun',
    kecamatan: 'Bosar Maligas, Silau Laut',
    panjangSaluranPrimerM: 7600,
    panjangSaluranSekunderM: 11200,
    jumlahBendung: 1,
    jumlahBangunanBagiSadap: 14,
    kondisiSaluranPct: 62,
    statusKewenangan: 'Provinsi',
    keteranganOP: 'Saluran primer mengalami erosi lereng tebing di km 3, memerlukan konstruksi dinding penahan tanah.'
  }
];

export const initialPembangunan: KegiatanPembangunan[] = [
  {
    id: 'PROJ-001',
    namaKegiatan: 'Dredging dan Normalisasi Sedimen Lumpur D.I. Kerasaan',
    lokasi: 'Kec. Pematang Bandar, Kab. Simalungun',
    tahunAnggaran: 2026,
    paguAnggaran: 450000000,
    nilaiKontrak: 432500000,
    kontraktor: 'CV. Sinar Tapanuli Jaya',
    noKontrak: '602/445/KTR/PSDA-SU/III/2026',
    progresFisikPct: 100,
    progresKeuanganPct: 100,
    tanggalMulai: '2026-03-05',
    tanggalSelesai: '2026-05-04',
    status: 'Selesai',
    kendalaAtauCatatan: 'Pekerjaan selesai 100% tepat waktu. Volume sedimen terangkat 4500 m3.'
  },
  {
    id: 'PROJ-002',
    namaKegiatan: 'Rehabilitasi Saluran Sekunder & Perkuatan Tebing Beton D.I. Silau',
    lokasi: 'Kec. Bosar Maligas, Kab. Simalungun',
    tahunAnggaran: 2026,
    paguAnggaran: 1200000000,
    nilaiKontrak: 1115200000,
    kontraktor: 'PT. Sumut Karya Mandiri',
    noKontrak: '602/478/KTR/PSDA-SU/IV/2026',
    progresFisikPct: 42.5,
    progresKeuanganPct: 30,
    tanggalMulai: '2026-04-10',
    tanggalSelesai: '2026-08-08',
    status: 'Konstruksi',
    kendalaAtauCatatan: 'Keterlambatan suplai beton precast akibat akses jalan berlumpur pasca hujan deras. Sudah dilayangkan surat teguran I.'
  },
  {
    id: 'PROJ-003',
    namaKegiatan: 'Pembangunan Pintu Air & Paving Jalan Inspeksi D.I. Raya',
    lokasi: 'Kec. Raya, Kab. Simalungun',
    tahunAnggaran: 2026,
    paguAnggaran: 850000000,
    nilaiKontrak: 820600000,
    kontraktor: 'CV. Siantar Prima Konstruksi',
    noKontrak: '602/490/KTR/PSDA-SU/IV/2026',
    progresFisikPct: 78.0,
    progresKeuanganPct: 40,
    tanggalMulai: '2026-04-12',
    tanggalSelesai: '2026-07-11',
    status: 'Konstruksi',
    kendalaAtauCatatan: 'Sektor perakitan pintu besi gear-box selesai, pengerjaan paving sisa 200 meter.'
  },
  {
    id: 'PROJ-004',
    namaKegiatan: 'Rehabilitasi Mercu Bendung & Sayap Bendung D.I. Bandar',
    lokasi: 'Kec. Bandar, Kab. Simalungun',
    tahunAnggaran: 2026,
    paguAnggaran: 1500000000,
    nilaiKontrak: 1465000000,
    kontraktor: 'PT. Citra Silau Perkasa',
    noKontrak: '602/520/KTR/PSDA-SU/V/2026',
    progresFisikPct: 5.0,
    progresKeuanganPct: 0,
    tanggalMulai: '2026-05-15',
    tanggalSelesai: '2026-10-12',
    status: 'Persiapan',
    kendalaAtauCatatan: 'Pemasangan kistdam pintu darurat pembendung dan koordinasi penutupan sementara aliran air.'
  }
];
