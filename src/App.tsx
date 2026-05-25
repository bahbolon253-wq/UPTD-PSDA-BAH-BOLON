/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Building2, 
  Compass, 
  TrendingUp, 
  Settings, 
  Droplets, 
  Menu, 
  X, 
  ChevronRight,
  User,
  Calendar,
  Layers,
  MapPin,
  Clock,
  Phone,
  Bookmark,
  LogIn,
  Lock,
  CloudLightning,
  RefreshCw
} from 'lucide-react';

// Models
import { 
  ProfilKantor, 
  SuratMasuk, 
  SuratKeluar, 
  Pegawai, 
  TransaksiKeuangan, 
  Aset, 
  DaerahIrigasi, 
  KegiatanPembangunan 
} from './types';

// Mock Data
import { 
  initialProfil, 
  initialSuratMasuk, 
  initialSuratKeluar, 
  initialPegawai, 
  initialKeuangan, 
  initialAset, 
  initialDaerahIrigasi, 
  initialPembangunan 
} from './mockData';

// Component Views
import DashboardView from './components/DashboardView';
import TataUsahaView from './components/TataUsahaView';
import SeksiOPView from './components/SeksiOPView';
import SeksiPembangunanView from './components/SeksiPembangunanView';
import PengaturanView from './components/PengaturanView';

// Firebase Integrations
import { 
  auth, 
  db, 
  googleProvider, 
  handleFirestoreError, 
  OperationType 
} from './firebase';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  signOut, 
  User as FirebaseUser 
} from 'firebase/auth';
import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot 
} from 'firebase/firestore';

export default function App() {
  // Mobile sidebar control
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Router layout pages: 'dashboard' | 'tata-usaha' | 'seksi-op' | 'seksi-pembangunan' | 'pengaturan'
  const [currentPage, setCurrentPage] = useState<string>('dashboard');
  
  // Specific internal Tata Usaha subtab redirect parameter
  const [tuSubTab, setTuSubTab] = useState<string>('persuratan');

  // Application Theme state
  const [activeTheme, setActiveTheme] = useState<string>('hydro');

  // Core system databases loaded with fallback values
  const [profil, setProfil] = useState<ProfilKantor>(initialProfil);
  const [suratMasuk, setSuratMasuk] = useState<SuratMasuk[]>(initialSuratMasuk);
  const [suratKeluar, setSuratKeluar] = useState<SuratKeluar[]>(initialSuratKeluar);
  const [pegawai, setPegawai] = useState<Pegawai[]>(initialPegawai);
  const [keuangan, setKeuangan] = useState<TransaksiKeuangan[]>(initialKeuangan);
  const [aset, setAset] = useState<Aset[]>(initialAset);
  const [daerahIrigasi, setDaerahIrigasi] = useState<DaerahIrigasi[]>(initialDaerahIrigasi);
  const [pembangunan, setPembangunan] = useState<KegiatanPembangunan[]>(initialPembangunan);

  // Authentication states
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Subscribe to Auth state changes
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setAuthLoading(false);
    });
    return () => unsub();
  }, []);

  // Sync with Firestore when logged in
  useEffect(() => {
    if (!currentUser) return;

    // Sync Profil
    const unsubProfil = onSnapshot(doc(db, 'profil', 'kantor'), (snapshot) => {
      if (snapshot.exists()) {
        setProfil(snapshot.data() as ProfilKantor);
      } else {
        setDoc(doc(db, 'profil', 'kantor'), initialProfil).catch(error => {
          handleFirestoreError(error, OperationType.WRITE, 'profil/kantor');
        });
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'profil/kantor');
    });

    // Sync SuratMasuk
    const unsubSM = onSnapshot(collection(db, 'surat-masuk'), (snapshot) => {
      if (snapshot.empty) {
        initialSuratMasuk.forEach(sm => {
          setDoc(doc(db, 'surat-masuk', sm.id), sm).catch(error => {
            handleFirestoreError(error, OperationType.WRITE, `surat-masuk/${sm.id}`);
          });
        });
      } else {
        const items: SuratMasuk[] = [];
        snapshot.forEach(d => items.push(d.data() as SuratMasuk));
        setSuratMasuk(items);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'surat-masuk');
    });

    // Sync SuratKeluar
    const unsubSK = onSnapshot(collection(db, 'surat-keluar'), (snapshot) => {
      if (snapshot.empty) {
        initialSuratKeluar.forEach(sk => {
          setDoc(doc(db, 'surat-keluar', sk.id), sk).catch(error => {
            handleFirestoreError(error, OperationType.WRITE, `surat-keluar/${sk.id}`);
          });
        });
      } else {
        const items: SuratKeluar[] = [];
        snapshot.forEach(d => items.push(d.data() as SuratKeluar));
        setSuratKeluar(items);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'surat-keluar');
    });

    // Sync Pegawai
    const unsubPegawai = onSnapshot(collection(db, 'pegawai'), (snapshot) => {
      if (snapshot.empty) {
        initialPegawai.forEach(p => {
          setDoc(doc(db, 'pegawai', p.id), p).catch(error => {
            handleFirestoreError(error, OperationType.WRITE, `pegawai/${p.id}`);
          });
        });
      } else {
        const items: Pegawai[] = [];
        snapshot.forEach(d => items.push(d.data() as Pegawai));
        setPegawai(items);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'pegawai');
    });

    // Sync Keuangan
    const unsubKeuangan = onSnapshot(collection(db, 'keuangan'), (snapshot) => {
      if (snapshot.empty) {
        initialKeuangan.forEach(k => {
          setDoc(doc(db, 'keuangan', k.id), k).catch(error => {
            handleFirestoreError(error, OperationType.WRITE, `keuangan/${k.id}`);
          });
        });
      } else {
        const items: TransaksiKeuangan[] = [];
        snapshot.forEach(d => items.push(d.data() as TransaksiKeuangan));
        setKeuangan(items);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'keuangan');
    });

    // Sync Aset
    const unsubAset = onSnapshot(collection(db, 'aset'), (snapshot) => {
      if (snapshot.empty) {
        initialAset.forEach(a => {
          setDoc(doc(db, 'aset', a.id), a).catch(error => {
            handleFirestoreError(error, OperationType.WRITE, `aset/${a.id}`);
          });
        });
      } else {
        const items: Aset[] = [];
        snapshot.forEach(d => items.push(d.data() as Aset));
        setAset(items);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'aset');
    });

    // Sync Daerah Irigasi
    const unsubDI = onSnapshot(collection(db, 'daerah-irigasi'), (snapshot) => {
      if (snapshot.empty) {
        initialDaerahIrigasi.forEach(di => {
          setDoc(doc(db, 'daerah-irigasi', di.id), di).catch(error => {
            handleFirestoreError(error, OperationType.WRITE, `daerah-irigasi/${di.id}`);
          });
        });
      } else {
        const items: DaerahIrigasi[] = [];
        snapshot.forEach(d => items.push(d.data() as DaerahIrigasi));
        setDaerahIrigasi(items);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'daerah-irigasi');
    });

    // Sync Pembangunan
    const unsubPembangunan = onSnapshot(collection(db, 'pembangunan'), (snapshot) => {
      if (snapshot.empty) {
        initialPembangunan.forEach(p => {
          setDoc(doc(db, 'pembangunan', p.id), p).catch(error => {
            handleFirestoreError(error, OperationType.WRITE, `pembangunan/${p.id}`);
          });
        });
      } else {
        const items: KegiatanPembangunan[] = [];
        snapshot.forEach(d => items.push(d.data() as KegiatanPembangunan));
        setPembangunan(items);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'pembangunan');
    });

    return () => {
      unsubProfil();
      unsubSM();
      unsubSK();
      unsubPegawai();
      unsubKeuangan();
      unsubAset();
      unsubDI();
      unsubPembangunan();
    };
  }, [currentUser]);

  // Synchronize Active Theme local state
  useEffect(() => {
    localStorage.setItem('psda_theme', activeTheme);
  }, [activeTheme]);

  const updateProfil = async (newProfil: ProfilKantor) => {
    setProfil(newProfil);
    if (currentUser) {
      try {
        await setDoc(doc(db, 'profil', 'kantor'), newProfil);
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, 'profil/kantor');
      }
    }
  };

  // Master Data Reset routine
  const resetToFactoryDefaults = async () => {
    if (currentUser) {
      try {
        for (const item of suratMasuk) {
          await deleteDoc(doc(db, 'surat-masuk', item.id));
        }
        for (const item of suratKeluar) {
          await deleteDoc(doc(db, 'surat-keluar', item.id));
        }
        for (const item of pegawai) {
          await deleteDoc(doc(db, 'pegawai', item.id));
        }
        for (const item of keuangan) {
          await deleteDoc(doc(db, 'keuangan', item.id));
        }
        for (const item of aset) {
          await deleteDoc(doc(db, 'aset', item.id));
        }
        for (const item of daerahIrigasi) {
          await deleteDoc(doc(db, 'daerah-irigasi', item.id));
        }
        for (const item of pembangunan) {
          await deleteDoc(doc(db, 'pembangunan', item.id));
        }
        await setDoc(doc(db, 'profil', 'kantor'), initialProfil);
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, 'reset-data');
      }
    }
    setProfil(initialProfil);
    setSuratMasuk(initialSuratMasuk);
    setSuratKeluar(initialSuratKeluar);
    setPegawai(initialPegawai);
    setKeuangan(initialKeuangan);
    setAset(initialAset);
    setDaerahIrigasi(initialDaerahIrigasi);
    setPembangunan(initialPembangunan);
    setActiveTheme('hydro');
  };

  // Export JSON string file
  const exportBackupJson = () => {
    const backupObj = {
      profil,
      suratMasuk,
      suratKeluar,
      pegawai,
      keuangan,
      aset,
      daerahIrigasi,
      pembangunan,
      activeTheme,
      version: '1.0.0',
      timestamp: new Date().toISOString()
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupObj, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `BACKUP_UPTD_PSDA_BAH_BOLON_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Import JSON string backup
  const importBackupJson = (jsonText: string): boolean => {
    try {
      const parsed = JSON.parse(jsonText);
      if (!parsed.profil || !parsed.suratMasuk || !parsed.daerahIrigasi) {
        return false;
      }
      
      setProfil(parsed.profil);
      setSuratMasuk(parsed.suratMasuk);
      setSuratKeluar(parsed.suratKeluar || []);
      setPegawai(parsed.pegawai || []);
      setKeuangan(parsed.keuangan || []);
      setAset(parsed.aset || []);
      setDaerahIrigasi(parsed.daerahIrigasi);
      setPembangunan(parsed.pembangunan || []);
      if (parsed.activeTheme) setActiveTheme(parsed.activeTheme);

      if (currentUser) {
        setDoc(doc(db, 'profil', 'kantor'), parsed.profil).catch(e => handleFirestoreError(e, OperationType.WRITE, 'profil/kantor'));
        
        const smList = parsed.suratMasuk || [];
        smList.forEach((item: any) => {
          setDoc(doc(db, 'surat-masuk', item.id), item).catch(e => handleFirestoreError(e, OperationType.WRITE, `surat-masuk/${item.id}`));
        });

        const skList = parsed.suratKeluar || [];
        skList.forEach((item: any) => {
          setDoc(doc(db, 'surat-keluar', item.id), item).catch(e => handleFirestoreError(e, OperationType.WRITE, `surat-keluar/${item.id}`));
        });

        const pegList = parsed.pegawai || [];
        pegList.forEach((item: any) => {
          setDoc(doc(db, 'pegawai', item.id), item).catch(e => handleFirestoreError(e, OperationType.WRITE, `pegawai/${item.id}`));
        });

        const keuList = parsed.keuangan || [];
        keuList.forEach((item: any) => {
          setDoc(doc(db, 'keuangan', item.id), item).catch(e => handleFirestoreError(e, OperationType.WRITE, `keuangan/${item.id}`));
        });

        const astList = parsed.aset || [];
        astList.forEach((item: any) => {
          setDoc(doc(db, 'aset', item.id), item).catch(e => handleFirestoreError(e, OperationType.WRITE, `aset/${item.id}`));
        });

        const diList = parsed.daerahIrigasi || [];
        diList.forEach((item: any) => {
          setDoc(doc(db, 'daerah-irigasi', item.id), item).catch(e => handleFirestoreError(e, OperationType.WRITE, `daerah-irigasi/${item.id}`));
        });

        const pemList = parsed.pembangunan || [];
        pemList.forEach((item: any) => {
          setDoc(doc(db, 'pembangunan', item.id), item).catch(e => handleFirestoreError(e, OperationType.WRITE, `pembangunan/${item.id}`));
        });
      }

      setTimeout(() => {
        window.location.reload();
      }, 1000);

      return true;
    } catch (e) {
      return false;
    }
  };

  // Page switcher navigation (handles subtab redirects)
  const handleNavigate = (page: string, subTab?: string) => {
    setCurrentPage(page);
    if (subTab) {
      setTuSubTab(subTab);
    }
    setIsSidebarOpen(false); // Close mobile menu drawer on actions
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 text-white selection:bg-teal-500/20">
        <div className="flex flex-col items-center gap-4 text-center max-w-md">
          <Droplets className="w-12 h-12 text-blue-400 animate-bounce" />
          <h1 className="text-xl font-extrabold tracking-tight">SISTED UPTD PSDA</h1>
          <p className="text-xs text-slate-400 font-mono animate-pulse">Menghubungkan ke Google Cloud Firebase...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-white selection:bg-teal-500/20 relative overflow-hidden">
        {/* Ambient glow backgrounds */}
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-500/10 blur-3xl" />
        
        <div className="w-full max-w-md bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-2xl flex flex-col gap-8 relative z-10">
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="p-4 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-500/20">
              <Droplets className="w-8 h-8 animate-pulse" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight text-white uppercase mt-2">UPTD PSDA Bah Bolon</h1>
              <p className="text-[10px] text-blue-400 tracking-widest font-mono font-bold uppercase mt-1">SISTEM INTEGRASI TU-OP CLOUD</p>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-6 flex flex-col gap-4 text-center">
            <p className="text-xs text-slate-400 leading-relaxed">
              Selamat datang di Sistem Integrasi Data UPTD PSDA Bah Bolon berbasis Google Cloud Firestore. Silakan sambungkan akun Google terafiliasi Anda untuk menyinkronkan seluruh data secara real-time.
            </p>
            
            <button 
              onClick={async () => {
                try {
                  await signInWithPopup(auth, googleProvider);
                } catch (error) {
                  console.error("Login failed: ", error);
                }
              }}
              className="mt-4 w-full flex items-center justify-center gap-3 bg-white hover:bg-slate-50 text-slate-900 font-extrabold px-6 py-4 rounded-2xl cursor-pointer transition-all active:scale-[0.98] shadow-lg shadow-white/5 text-xs uppercase border-none outline-none"
            >
              <LogIn className="w-4 h-4 text-blue-600 shrink-0" />
              <span>Masuk dengan Google</span>
            </button>
            
            <div className="flex items-center justify-center gap-1.5 text-[9px] text-slate-500 font-mono mt-2">
              <Lock className="w-3 h-3" />
              <span>DIAMANKAN OLEH FIREBASE AUTH & RULES</span>
            </div>
          </div>
        </div>

        <p className="text-[10px] text-slate-600 mt-12 font-mono">
          Hak Cipta © 2026 Dinas Sumber Daya Air ProvSU
        </p>
      </div>
    );
  }

  // Get active menu CSS style depending on selected theme
  const getThemeThemeClass = () => {
    switch (activeTheme) {
      case 'emerald':
        return {
          primaryText: 'text-emerald-400',
          primaryBg: 'bg-emerald-600',
          gradientBg: 'from-emerald-990 via-emerald-950 to-slate-950',
          accentBorder: 'border-emerald-500/20',
          pillBg: 'bg-emerald-500/10 text-emerald-400',
          hoverBgClass: 'hover:bg-white/5 hover:text-white',
          activeMenuClass: 'bg-emerald-500/10 text-emerald-400 font-semibold md:border-l-2 border-emerald-500 rounded-none md:rounded-r-lg'
        };
      case 'indigo':
        return {
          primaryText: 'text-indigo-400',
          primaryBg: 'bg-indigo-600',
          gradientBg: 'from-indigo-990 via-slate-900 to-zinc-950',
          accentBorder: 'border-indigo-500/20',
          pillBg: 'bg-indigo-500/10 text-indigo-400',
          hoverBgClass: 'hover:bg-white/5 hover:text-white',
          activeMenuClass: 'bg-indigo-500/10 text-indigo-400 font-semibold md:border-l-2 border-indigo-500 rounded-none md:rounded-r-lg'
        };
      case 'classic':
        return {
          primaryText: 'text-slate-300',
          primaryBg: 'bg-slate-700',
          gradientBg: 'from-zinc-800 via-slate-900 to-stone-950',
          accentBorder: 'border-slate-700',
          pillBg: 'bg-slate-500/10 text-slate-300',
          hoverBgClass: 'hover:bg-white/5 hover:text-white',
          activeMenuClass: 'bg-slate-500/10 text-slate-300 font-semibold md:border-l-2 border-slate-550 rounded-none md:rounded-r-lg'
        };
      case 'hydro':
      default:
        return {
          primaryText: 'text-blue-400',
          primaryBg: 'bg-blue-600',
          gradientBg: 'from-blue-990 via-slate-950 to-indigo-950',
          accentBorder: 'border-blue-500/20',
          pillBg: 'bg-blue-500/10 text-blue-400',
          hoverBgClass: 'hover:bg-white/5 hover:text-white',
          activeMenuClass: 'bg-blue-600/10 text-blue-400 font-semibold md:border-l-2 border-blue-500 rounded-none md:rounded-r-lg'
        };
    }
  };

  const currentThemeStyles = getThemeThemeClass();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-gray-900 selection:bg-teal-500/20 antialiased overflow-x-hidden md:flex-row">
      
      {/* 1. SIDEBAR Navigation Layout */}
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-100 shrink-0 select-none">
        
        {/* Sidebar Brand Logo */}
        <div className="p-6 border-b border-gray-100 flex items-center gap-3">
          <div className={`p-2.5 rounded-xl ${currentThemeStyles.primaryBg} text-white`}>
            <Droplets className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h2 className="font-extrabold text-sm text-gray-800 leading-tight">PSDA Bah Bolon</h2>
            <span className="text-[10px] text-gray-400 font-mono">SISTEM INTEGRASI TU-OP</span>
          </div>
        </div>

        {/* Navigation Section */}
        <nav className="p-4 space-y-1.5 flex-1 mt-3">
          {[
            { id: 'dashboard', label: 'E-Dashboard', icon: LayoutDashboard },
            { id: 'tata-usaha', label: 'Tata Usaha / Urusan TU', icon: Building2 },
            { id: 'seksi-op', label: 'Seksi O&P (Irigasi)', icon: Compass },
            { id: 'seksi-pembangunan', label: 'Seksi Pembangunan', icon: TrendingUp },
            { id: 'pengaturan', label: 'Pengaturan', icon: Settings }
          ].map((menu) => {
            const MenuIcon = menu.icon;
            const isSelected = currentPage === menu.id;
            return (
              <button
                key={menu.id}
                onClick={() => handleNavigate(menu.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-bold transition-all ${
                  isSelected 
                    ? currentThemeStyles.activeMenuClass 
                    : `text-gray-500 ${currentThemeStyles.hoverBgClass}`
                }`}
              >
                <MenuIcon className="w-4 h-4 shrink-0" />
                <span>{menu.label}</span>
                {isSelected && <ChevronRight className="w-3.5 h-3.5 ml-auto" />}
              </button>
            );
          })}
        </nav>

        {/* Corporate footer info */}
        <div className="p-4 border-t border-gray-100 bg-slate-50/50 space-y-2">
          <div className="flex items-center gap-1.5 text-[10px] text-gray-400">
            <Clock className="w-3.5 h-3.5" />
            <span>2026-05-25 01:50 UTC</span>
          </div>
          <p className="text-[9px] text-gray-400 leading-relaxed italic">
            Hak Cipta © UPTD PSDA Bah Bolon Sumut
          </p>
        </div>

      </aside>

      {/* Mobile Top Navbar with Burger menu Toggle */}
      <header className="md:hidden bg-white border-b border-gray-100 p-4 px-6 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-2.5">
          <div className={`p-2 rounded-lg ${currentThemeStyles.primaryBg} text-white`}>
            <Droplets className="w-4.5 h-4.5" />
          </div>
          <h2 className="font-extrabold text-sm text-gray-800">SISTED PSDA</h2>
        </div>
        
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-1 text-gray-600 stroke-2 outline-none focus:outline-none"
        >
          {isSidebarOpen ? <X className="w-5.5 h-5.5" /> : <Menu className="w-5.5 h-5.5" />}
        </button>
      </header>

      {/* Mobile Sidebar overlay Menu Drawer */}
      {isSidebarOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-black/50 select-none">
          <div className="bg-white w-64 h-full flex flex-col p-5 space-y-6 slide-in-from-left duration-200">
            <div className="flex justify-between items-center border-b pb-4">
              <span className="font-extrabold text-gray-800 text-xs uppercase tracking-wider">Navigasi Sistem (SISTED)</span>
              <button onClick={() => setIsSidebarOpen(false)} className="text-gray-500">×</button>
            </div>

            <nav className="space-y-2 flex-1 text-xs">
              {[
                { id: 'dashboard', label: 'Dashboard Utama', icon: LayoutDashboard },
                { id: 'tata-usaha', label: 'Tata Usaha / Umum', icon: Building2 },
                { id: 'seksi-op', label: 'Operasi & Pemeliharaan', icon: Compass },
                { id: 'seksi-pembangunan', label: 'Seksi Pembangunan', icon: TrendingUp },
                { id: 'pengaturan', label: 'Pengaturan & Profil', icon: Settings }
              ].map((menu) => {
                const isSelected = currentPage === menu.id;
                return (
                  <button
                    key={menu.id}
                    onClick={() => handleNavigate(menu.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-bold transition-all ${
                      isSelected 
                        ? currentThemeStyles.activeMenuClass 
                        : 'text-gray-500 hover:bg-gray-100'
                    }`}
                  >
                    {React.createElement(menu.icon, { className: 'w-4 h-4' })}
                    <span>{menu.label}</span>
                  </button>
                );
              })}
            </nav>

            <span className="text-[10px] text-gray-400">UPTD PSDA Bah Bolon v1.0</span>
          </div>
        </div>
      )}

      {/* 2. CHIEF CONTENT VIEWPORT */}
      <main className="flex-1 flex flex-col min-w-0">
        
        {/* Main Application Global Bar: Address, metadata parameters */}
        <header className="bg-white border-b border-gray-100 hidden md:flex items-center justify-between p-4 px-8 select-none">
          <div className="flex items-center gap-6 text-2xs text-gray-400 font-medium font-sans">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-gray-400" />
              {profil.alamat.split(',')[1]}
            </span>
            <span className="text-gray-300">|</span>
            <span className="flex items-center gap-1 font-mono">
              <Clock className="w-3.5 h-3.5 text-teal-600" />
              Waktu Server: 2026-05-25 01:50 UTC
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-2.5">
              {currentUser?.photoURL ? (
                <img 
                  src={currentUser.photoURL} 
                  alt={currentUser.displayName || ''} 
                  className="w-7 h-7 rounded-full border border-gray-100 object-cover" 
                  referrerPolicy="no-referrer" 
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-blue-500 text-white flex items-center justify-center text-[10px] font-bold">
                  {currentUser?.displayName ? currentUser.displayName[0] : 'O'}
                </div>
              )}
              <div className="text-right hidden sm:block">
                <p className="font-extrabold text-xs text-gray-700 leading-none">{currentUser?.displayName || 'Operator'}</p>
                <p className="text-[9px] text-gray-400 font-medium leading-none mt-1">{currentUser?.email}</p>
              </div>
            </div>
            <button 
              onClick={() => signOut(auth)}
              className="text-[10px] bg-red-50 text-red-700 hover:bg-red-100 font-extrabold px-3 py-1.5 rounded-lg border border-red-200 transition-all cursor-pointer"
            >
              Keluar
            </button>
          </div>
        </header>

        {/* Dynamic Inner Component Panel with light animation */}
        <div id="content-container" className="flex-1 p-4 md:p-8 overflow-y-auto max-w-[1400px] mx-auto w-full">
          
          {currentPage === 'dashboard' && (
            <DashboardView
              suratMasuk={suratMasuk}
              suratKeluar={suratKeluar}
              pegawai={pegawai}
              keuangan={keuangan}
              daerahIrigasi={daerahIrigasi}
              pembangunan={pembangunan}
              onNavigate={handleNavigate}
            />
          )}

          {currentPage === 'tata-usaha' && (
            <TataUsahaView
              profil={profil}
              suratMasuk={suratMasuk}
              onAddSuratMasuk={async (item) => {
                try {
                  await setDoc(doc(db, 'surat-masuk', item.id), item);
                } catch (e) {
                  handleFirestoreError(e, OperationType.WRITE, `surat-masuk/${item.id}`);
                }
              }}
              onEditSuratMasuk={async (item) => {
                try {
                  await setDoc(doc(db, 'surat-masuk', item.id), item);
                } catch (e) {
                  handleFirestoreError(e, OperationType.WRITE, `surat-masuk/${item.id}`);
                }
              }}
              onDeleteSuratMasuk={async (id) => {
                try {
                  await deleteDoc(doc(db, 'surat-masuk', id));
                } catch (e) {
                  handleFirestoreError(e, OperationType.DELETE, `surat-masuk/${id}`);
                }
              }}
              
              suratKeluar={suratKeluar}
              onAddSuratKeluar={async (item) => {
                try {
                  await setDoc(doc(db, 'surat-keluar', item.id), item);
                } catch (e) {
                  handleFirestoreError(e, OperationType.WRITE, `surat-keluar/${item.id}`);
                }
              }}
              onEditSuratKeluar={async (item) => {
                try {
                  await setDoc(doc(db, 'surat-keluar', item.id), item);
                } catch (e) {
                  handleFirestoreError(e, OperationType.WRITE, `surat-keluar/${item.id}`);
                }
              }}
              onDeleteSuratKeluar={async (id) => {
                try {
                  await deleteDoc(doc(db, 'surat-keluar', id));
                } catch (e) {
                  handleFirestoreError(e, OperationType.DELETE, `surat-keluar/${id}`);
                }
              }}

              pegawai={pegawai}
              onAddPegawai={async (item) => {
                try {
                  await setDoc(doc(db, 'pegawai', item.id), item);
                } catch (e) {
                  handleFirestoreError(e, OperationType.WRITE, `pegawai/${item.id}`);
                }
              }}
              onEditPegawai={async (item) => {
                try {
                  await setDoc(doc(db, 'pegawai', item.id), item);
                } catch (e) {
                  handleFirestoreError(e, OperationType.WRITE, `pegawai/${item.id}`);
                }
              }}
              onDeletePegawai={async (id) => {
                try {
                  await deleteDoc(doc(db, 'pegawai', id));
                } catch (e) {
                  handleFirestoreError(e, OperationType.DELETE, `pegawai/${id}`);
                }
              }}

              keuangan={keuangan}
              onAddKeuangan={async (item) => {
                try {
                  await setDoc(doc(db, 'keuangan', item.id), item);
                } catch (e) {
                  handleFirestoreError(e, OperationType.WRITE, `keuangan/${item.id}`);
                }
              }}
              onEditKeuangan={async (item) => {
                try {
                  await setDoc(doc(db, 'keuangan', item.id), item);
                } catch (e) {
                  handleFirestoreError(e, OperationType.WRITE, `keuangan/${item.id}`);
                }
              }}
              onDeleteKeuangan={async (id) => {
                try {
                  await deleteDoc(doc(db, 'keuangan', id));
                } catch (e) {
                  handleFirestoreError(e, OperationType.DELETE, `keuangan/${id}`);
                }
              }}

              aset={aset}
              onAddAset={async (item) => {
                try {
                  await setDoc(doc(db, 'aset', item.id), item);
                } catch (e) {
                  handleFirestoreError(e, OperationType.WRITE, `aset/${item.id}`);
                }
              }}
              onEditAset={async (item) => {
                try {
                  await setDoc(doc(db, 'aset', item.id), item);
                } catch (e) {
                  handleFirestoreError(e, OperationType.WRITE, `aset/${item.id}`);
                }
              }}
              onDeleteAset={async (id) => {
                try {
                  await deleteDoc(doc(db, 'aset', id));
                } catch (e) {
                  handleFirestoreError(e, OperationType.DELETE, `aset/${id}`);
                }
              }}
              
              initialSubTab={tuSubTab}
            />
          )}

          {currentPage === 'seksi-op' && (
            <SeksiOPView
              daerahIrigasi={daerahIrigasi}
              onAddDI={async (item) => {
                try {
                  await setDoc(doc(db, 'daerah-irigasi', item.id), item);
                } catch (e) {
                  handleFirestoreError(e, OperationType.WRITE, `daerah-irigasi/${item.id}`);
                }
              }}
              onEditDI={async (item) => {
                try {
                  await setDoc(doc(db, 'daerah-irigasi', item.id), item);
                } catch (e) {
                  handleFirestoreError(e, OperationType.WRITE, `daerah-irigasi/${item.id}`);
                }
              }}
              onDeleteDI={async (id) => {
                try {
                  await deleteDoc(doc(db, 'daerah-irigasi', id));
                } catch (e) {
                  handleFirestoreError(e, OperationType.DELETE, `daerah-irigasi/${id}`);
                }
              }}
            />
          )}

          {currentPage === 'seksi-pembangunan' && (
            <SeksiPembangunanView
              pembangunan={pembangunan}
              onAddProject={async (item) => {
                try {
                  await setDoc(doc(db, 'pembangunan', item.id), item);
                } catch (e) {
                  handleFirestoreError(e, OperationType.WRITE, `pembangunan/${item.id}`);
                }
              }}
              onEditProject={async (item) => {
                try {
                  await setDoc(doc(db, 'pembangunan', item.id), item);
                } catch (e) {
                  handleFirestoreError(e, OperationType.WRITE, `pembangunan/${item.id}`);
                }
              }}
              onDeleteProject={async (id) => {
                try {
                  await deleteDoc(doc(db, 'pembangunan', id));
                } catch (e) {
                  handleFirestoreError(e, OperationType.DELETE, `pembangunan/${id}`);
                }
              }}
            />
          )}

          {currentPage === 'pengaturan' && (
            <PengaturanView
              profil={profil}
              pegawai={pegawai}
              onUpdateProfil={updateProfil}
              onResetData={resetToFactoryDefaults}
              activeTheme={activeTheme}
              onChangeTheme={setActiveTheme}
              onImportBackupData={importBackupJson}
              onExportBackupData={exportBackupJson}
            />
          )}

        </div>
      </main>

    </div>
  );
}
