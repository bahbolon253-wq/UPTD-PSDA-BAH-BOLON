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
  RefreshCw,
  Eye,
  EyeOff,
  Shield
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
  KegiatanPembangunan,
  AkunPengguna,
  Sungai
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
  initialPembangunan,
  initialAkuns,
  initialSungai
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
  const [sungai, setSungai] = useState<Sungai[]>(initialSungai);
  const [pembangunan, setPembangunan] = useState<KegiatanPembangunan[]>(initialPembangunan);

  // Administrative User Accounts State based on User request
  const [akuns, setAkuns] = useState<AkunPengguna[]>(() => {
    const local = localStorage.getItem('psda_accounts');
    return local ? JSON.parse(local) : initialAkuns;
  });

  // Custom multi-role Session state
  const [sessionUser, setSessionUser] = useState<any>(() => {
    const local = localStorage.getItem('psda_session_user');
    return local ? JSON.parse(local) : null;
  });

  // Local Form states for Login
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Keep accounts local state in sync with localStorage
  useEffect(() => {
    localStorage.setItem('psda_accounts', JSON.stringify(akuns));
  }, [akuns]);

  // Handler functions for managing accounts via child Pengaturan props
  const handleAddAkun = async (newAcc: AkunPengguna) => {
    setAkuns(prev => [...prev, newAcc]);
    try {
      await setDoc(doc(db, 'akun-pengguna', newAcc.id), newAcc);
    } catch (err) {
      console.error("Failed to write to firestore:", err);
    }
  };

  const handleEditAkun = async (updatedAcc: AkunPengguna) => {
    setAkuns(prev => prev.map(a => a.id === updatedAcc.id ? updatedAcc : a));
    try {
      await setDoc(doc(db, 'akun-pengguna', updatedAcc.id), updatedAcc);
    } catch (err) {
      console.error("Failed to update firestore:", err);
    }
  };

  const handleDeleteAkun = async (id: string) => {
    setAkuns(prev => prev.filter(a => a.id !== id));
    try {
      await deleteDoc(doc(db, 'akun-pengguna', id));
    } catch (err) {
      console.error("Failed to delete from firestore:", err);
    }
  };

  // Authentication states
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Subscribe to Auth state changes
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (user) {
        const mappedUser = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || 'Google Super Admin',
          photoURL: user.photoURL,
          role: 'super_admin',
          roleName: 'Super Admin',
          allowedModules: ["Semua Modul", "Sekretariat", "Kepegawaian", "Keuangan", "Aset", "O&P Lapangan"],
          canInput: true,
          isFirebaseUser: true
        };
        setSessionUser(mappedUser);
        localStorage.setItem('psda_session_user', JSON.stringify(mappedUser));
      } else {
        setSessionUser((prev: any) => {
          if (prev?.isFirebaseUser) {
            localStorage.removeItem('psda_session_user');
            return null;
          }
          return prev;
        });
      }
      setAuthLoading(false);
    });
    return () => unsub();
  }, []);

  // Sync Accounts database with Firestore in background when active session is present
  useEffect(() => {
    if (!sessionUser) return;

    const unsubAkun = onSnapshot(collection(db, 'akun-pengguna'), (snapshot) => {
      if (snapshot.empty) {
        akuns.forEach(acc => {
          setDoc(doc(db, 'akun-pengguna', acc.id), acc).catch(err => {
            console.warn("Failed to seed account inside listener:", err);
          });
        });
      } else {
        const items: AkunPengguna[] = [];
        snapshot.forEach(d => items.push(d.data() as AkunPengguna));
        setAkuns(items);
      }
    }, (error) => {
      console.warn("Firestore akun-pengguna listen failed (normal if rules restrict unauth):", error);
    });

    return () => unsubAkun();
  }, [sessionUser]);

  // Sync with Firestore when logged in
  useEffect(() => {
    if (!sessionUser) return;

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

    // Sync Sungai
    const unsubSungai = onSnapshot(collection(db, 'sungai'), (snapshot) => {
      if (snapshot.empty) {
        initialSungai.forEach(s => {
          setDoc(doc(db, 'sungai', s.id), s).catch(error => {
            handleFirestoreError(error, OperationType.WRITE, `sungai/${s.id}`);
          });
        });
      } else {
        const items: Sungai[] = [];
        snapshot.forEach(d => items.push(d.data() as Sungai));
        setSungai(items);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'sungai');
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
      unsubSungai();
    };
  }, [sessionUser]);

  // Synchronize Active Theme local state
  useEffect(() => {
    localStorage.setItem('psda_theme', activeTheme);
  }, [activeTheme]);

  const updateProfil = async (newProfil: ProfilKantor) => {
    setProfil(newProfil);
    if (sessionUser) {
      try {
        await setDoc(doc(db, 'profil', 'kantor'), newProfil);
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, 'profil/kantor');
      }
    }
  };

  // Master Data Reset routine
  const resetToFactoryDefaults = async () => {
    if (sessionUser) {
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

  if (!sessionUser) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-white selection:bg-blue-500/20 relative overflow-hidden">
        {/* Ambient glow backgrounds */}
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-500/10 blur-3xl" />
        
        <div className="w-full max-w-lg bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-2xl flex flex-col gap-6 relative z-10 my-8">
          
          {/* Header Branding */}
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-500/25">
              <Droplets className="w-7 h-7 animate-pulse" />
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tight text-white uppercase mt-1 animate-pulse">UPTD PSDA Bah Bolon</h1>
              <p className="text-[9px] text-blue-400 tracking-wider font-mono font-bold uppercase mt-0.5">SISTEM INTEGRASI HAK AKSES TU-OP CLOUD</p>
            </div>
          </div>

          <div className="border-t border-slate-800/80 pt-5 space-y-4">
            <p className="text-2xs text-slate-400 text-center leading-relaxed max-w-sm mx-auto">
              Silakan masuk menggunakan akun kredensial hak akses sektoral Anda atau sambungkan via akun Google terafiliasi.
            </p>

            {/* Error Message Alert */}
            {loginError && (
              <div className="bg-rose-950/40 border border-rose-800/50 text-rose-300 p-3 rounded-xl text-[11px] text-center font-bold">
                ⚠️ {loginError}
              </div>
            )}

            {/* Credentials Login Form */}
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                const found = akuns.find(a => a.username.toLowerCase() === loginUsername.trim().toLowerCase() && a.sandu === loginPassword.trim());
                if (found) {
                  const mapped = {
                    uid: found.id,
                    username: found.username,
                    email: `${found.username}@sda.go.id`,
                    displayName: found.roleName,
                    photoURL: null,
                    role: found.role,
                    roleName: found.roleName,
                    allowedModules: found.allowedModules,
                    canInput: found.canInput,
                    isCustomAdmin: true
                  };
                  setSessionUser(mapped);
                  localStorage.setItem('psda_session_user', JSON.stringify(mapped));
                  setLoginError('');
                } else {
                  setLoginError('Kombinasi Nama Pengguna atau Kata Sandi salah!');
                }
              }}
              className="space-y-3 pt-1 text-xs"
            >
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">ID Pengguna (Username)</label>
                <input
                  type="text"
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  placeholder="contoh: super.admin"
                  className="w-full p-3 bg-slate-950/65 border border-slate-800 hover:border-slate-75 focus:outline-none focus:border-blue-500 text-slate-100 rounded-xl font-bold font-sans transition-all text-xs outline-none"
                  required
                />
              </div>

              <div className="space-y-1 relative">
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Kata Sandi (Password)</label>
                </div>
                <div className="relative">
                  <input
                    type={showLoginPassword ? "text" : "password"}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Sandi Rahasia"
                    className="w-full p-3 bg-slate-950/65 border border-slate-800 hover:border-slate-75 focus:outline-none focus:border-blue-500 text-slate-100 rounded-xl font-mono transition-all text-xs pr-10 outline-none"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-3.5 top-3.5 text-slate-400 hover:text-white"
                  >
                    {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold p-3.5 rounded-xl transition-all active:scale-[0.98] shadow-lg shadow-blue-500/15 text-xs text-center uppercase tracking-wider border-none outline-none mt-4 cursor-pointer"
              >
                Masuk Sistem
              </button>
            </form>

            {/* Alternatif Login: Google Provider */}
            <div className="pt-2 flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <div className="h-[1px] bg-slate-800/80 flex-1"></div>
                <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest font-mono">Pilihan Alternatif</span>
                <div className="h-[1px] bg-slate-800/80 flex-1"></div>
              </div>

              <button 
                onClick={async () => {
                  try {
                    await signInWithPopup(auth, googleProvider);
                  } catch (error) {
                    console.error("Login failed: ", error);
                    setLoginError('Sambungan Google Auth Gagal: silakan periksa kredensial.');
                  }
                }}
                className="w-full flex items-center justify-center gap-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold px-4 py-3 rounded-xl cursor-pointer transition-all active:scale-[0.98] border border-slate-700/60 text-xs"
              >
                <LogIn className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span>Masuk dengan Google (Super Admin)</span>
              </button>
            </div>
          </div>

          {/* Helper Quick Accounts Card for easy test review */}
          <div className="bg-slate-950/55 border border-slate-800/60 p-4 rounded-2xl space-y-2.5">
            <div className="flex items-center gap-1.5 text-[10px] text-blue-400 font-extrabold uppercase font-mono tracking-wider">
              <Shield className="w-3.5 h-3.5 text-blue-400" />
              <span>Daftar Akun & Peran Hak Akses (Uji Coba Cepat):</span>
            </div>
            
            <p className="text-[10px] text-slate-400 leading-normal">
              Klik salah satu akun sektoral di bawah ini untuk mengisi kredensial secara instan:
            </p>

            <div className="grid grid-cols-2 gap-1.5 text-[9px]">
              {akuns.map((acc) => (
                <button
                  key={acc.id}
                  type="button"
                  onClick={() => {
                    setLoginUsername(acc.username);
                    setLoginPassword(acc.sandu);
                    setLoginError('');
                  }}
                  className="bg-slate-905 hover:bg-slate-850 border border-slate-800 text-slate-300 p-2 rounded-lg text-left transition-colors flex flex-col justify-between hover:border-slate-700 cursor-pointer"
                >
                  <span className="font-extrabold text-[9px] text-blue-400 leading-tight block">{acc.roleName}</span>
                  <span className="font-mono text-[9px] text-slate-500 mt-1 block">User: <strong className="text-slate-300">{acc.username}</strong></span>
                  <span className="font-mono text-[9px] text-slate-500 block">Sandi: <strong className="text-slate-300">{acc.sandu}</strong></span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-center gap-1.5 text-[8.5px] text-slate-500 font-mono">
            <Lock className="w-3 h-3" />
            <span>SISTEM DIINTEGRASIKAN VIA CLOUD FIRESTORE & HAK AKSES PERAN</span>
          </div>

        </div>

        <p className="text-[10px] text-slate-600 font-mono text-center">
          Hak Cipta © UPTD PSDA Bah Bolon Sumut
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
            { id: 'seksi-pembangunan', label: 'Seksi Pembangunan Infrastruktur SDA', icon: TrendingUp },
            { id: 'pengaturan', label: 'Pengaturan & Profil', icon: Settings }
          ].filter(menu => {
            if (!sessionUser) return false;
            if (sessionUser.role === 'super_admin') return true;
            if (menu.id === 'dashboard') return true;
            
            if (sessionUser.role === 'admin_tu') return menu.id === 'tata-usaha';
            if (sessionUser.role === 'admin_pegawai') return menu.id === 'tata-usaha';
            if (sessionUser.role === 'admin_uang') return menu.id === 'tata-usaha';
            if (sessionUser.role === 'admin_aset') return menu.id === 'tata-usaha';
            
            if (sessionUser.role === 'surveyor') return menu.id === 'seksi-op';
            return false;
          }).map((menu) => {
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
                { id: 'seksi-pembangunan', label: 'Seksi Pembangunan Infrastruktur SDA', icon: TrendingUp },
                { id: 'pengaturan', label: 'Pengaturan & Profil', icon: Settings }
              ].filter(menu => {
                if (!sessionUser) return false;
                if (sessionUser.role === 'super_admin') return true;
                if (menu.id === 'dashboard') return true;
                
                if (sessionUser.role === 'admin_tu') return menu.id === 'tata-usaha';
                if (sessionUser.role === 'admin_pegawai') return menu.id === 'tata-usaha';
                if (sessionUser.role === 'admin_uang') return menu.id === 'tata-usaha';
                if (sessionUser.role === 'admin_aset') return menu.id === 'tata-usaha';
                
                if (sessionUser.role === 'surveyor') return menu.id === 'seksi-op';
                return false;
              }).map((menu) => {
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
              {sessionUser?.photoURL ? (
                <img 
                  src={sessionUser.photoURL} 
                  alt={sessionUser.displayName || ''} 
                  className="w-7 h-7 rounded-full border border-gray-100 object-cover" 
                  referrerPolicy="no-referrer" 
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold">
                  {sessionUser?.displayName ? sessionUser.displayName[0] : 'O'}
                </div>
              )}
              <div className="text-right hidden sm:block">
                <p className="font-extrabold text-xs text-gray-750 leading-none">{sessionUser?.displayName || 'Operator'}</p>
                <div className="flex items-center gap-1.5 mt-0.5 justify-end">
                  <span className="text-[9px] bg-indigo-50 text-indigo-700 px-1 py-0.2 rounded font-bold">{sessionUser?.roleName || 'Sektoral'}</span>
                  <span className="text-[8px] text-gray-400 font-mono leading-none">{sessionUser?.email}</span>
                </div>
              </div>
            </div>
            <button 
              onClick={async () => {
                try {
                  await signOut(auth);
                } catch (e) {
                  // silent
                }
                localStorage.removeItem('psda_session_user');
                setSessionUser(null);
                setLoginUsername('');
                setLoginPassword('');
                setLoginError('');
              }}
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
              canInput={sessionUser?.canInput !== false}
              allowedSubTabs={(() => {
                if (!sessionUser) return [];
                if (sessionUser.role === 'super_admin') return ['persuratan', 'kepegawaian', 'keuangan', 'aset'];
                const tabs: string[] = [];
                if (sessionUser.role === 'admin_tu') tabs.push('persuratan');
                if (sessionUser.role === 'admin_pegawai') tabs.push('kepegawaian');
                if (sessionUser.role === 'admin_uang') tabs.push('keuangan');
                if (sessionUser.role === 'admin_aset') tabs.push('aset');
                return tabs;
              })()}
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
              sungai={sungai}
              onAddSungai={async (item) => {
                try {
                  await setDoc(doc(db, 'sungai', item.id), item);
                } catch (e) {
                  handleFirestoreError(e, OperationType.WRITE, `sungai/${item.id}`);
                }
              }}
              onEditSungai={async (item) => {
                try {
                  await setDoc(doc(db, 'sungai', item.id), item);
                } catch (e) {
                  handleFirestoreError(e, OperationType.WRITE, `sungai/${item.id}`);
                }
              }}
              onDeleteSungai={async (id) => {
                try {
                  await deleteDoc(doc(db, 'sungai', id));
                } catch (e) {
                  handleFirestoreError(e, OperationType.DELETE, `sungai/${id}`);
                }
              }}
              canInput={sessionUser?.canInput !== false}
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
              akuns={akuns}
              onAddAkun={handleAddAkun}
              onEditAkun={handleEditAkun}
              onDeleteAkun={handleDeleteAkun}
            />
          )}

        </div>
      </main>

    </div>
  );
}
