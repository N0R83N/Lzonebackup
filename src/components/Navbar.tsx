import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, query, orderBy, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { LogOut, User, Shield, Menu, X, ChevronDown, Zap, Search, LogIn } from 'lucide-react';
import { cn } from '../lib/utils';
import { Category } from '../types';
import { categoryUrl } from '../lib/categories';

export default function Navbar() {
  const [user, setUser] = useState(auth.currentUser);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [nickname, setNickname] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setNickname(data.nickname || null);
          const role = data.role || (user.email === 'nijatemiraslanov@gmail.com' ? 'admin' : 'user');
          setUserRole(role);
          if (role === 'admin' || role === 'moderator') {
            setIsAdmin(true);
          } else {
            setIsAdmin(false);
          }
        } else {
          setNickname(null);
          const role = user.email === 'nijatemiraslanov@gmail.com' ? 'admin' : 'user';
          setUserRole(role);
          setIsAdmin(role === 'admin');
        }
      } else {
        setIsAdmin(false);
        setNickname(null);
        setUserRole(null);
      }
    });

    const catQ = query(collection(db, 'categories'), orderBy('order', 'asc'));
    const catUnsubscribe = onSnapshot(catQ, (snapshot) => {
      setCategories(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category)));
    });

    return () => {
      unsubscribe();
      catUnsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsMenuOpen(false);
    }
  };

  return (
    <nav className="bg-black/80 backdrop-blur-md border-b border-blue-900/30 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-[#e80000] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">L</span>
              </div>
              <span className="text-white font-bold text-2xl tracking-tighter flex items-baseline">
                L9<span className="text-3xl ml-0.5">Z</span>one
              </span>
            </Link>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="ml-6 flex-grow max-w-xs relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="İçerik ara..."
                className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl pl-10 pr-4 py-1.5 text-sm text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
              />
            </form>
          </div>

          {/* Desktop Menu */}
          <div className="hidden xl:flex items-center space-x-2">
            <Link to="/" className="px-3 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-zinc-900 rounded-xl transition-all">Ana Sayfa</Link>
            
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="relative group"
                onMouseEnter={() => setActiveDropdown(cat.id)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <button type="button" aria-expanded={activeDropdown === cat.id} onClick={() => setActiveDropdown(activeDropdown === cat.id ? null : cat.id)} className="px-3 py-2 text-sm font-medium text-gray-300 group-hover:text-white group-hover:bg-zinc-900 rounded-xl transition-all flex items-center space-x-1">
                  <span>{cat.name}</span>
                  <ChevronDown className="w-3 h-3 group-hover:rotate-180 transition-transform" />
                </button>

                {/* Dropdown */}
                <div className={cn(
                  "absolute top-full left-0 w-64 pt-2 transition-all duration-200 origin-top-left",
                  activeDropdown === cat.id ? "opacity-100 scale-100 visible" : "opacity-0 scale-95 invisible"
                )}>
                  <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3 shadow-2xl shadow-black max-h-[70vh] overflow-y-auto">
                    <div className="grid grid-cols-1 gap-1">
                      <div className="px-3 py-2 text-[10px] font-bold text-zinc-600 uppercase tracking-widest border-b border-zinc-800 mb-2">
                        {cat.name} - Alt Kategoriler
                      </div>
                      {cat.subcategories.map((sub) => (
                        <Link
                          key={sub}
                          to={categoryUrl(cat.name, sub)}
                          className="px-3 py-2 text-sm text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-all flex items-center justify-between group/item"
                        >
                          <span>{sub}</span>
                          <Zap className="w-3 h-3 opacity-0 group-hover/item:opacity-100 text-blue-500 transition-all" />
                        </Link>
                      ))}
                      {cat.subcategories.length === 0 && (
                        <div className="px-3 py-4 text-xs text-zinc-600 italic text-center">
                          Alt kategori bulunmuyor
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {isAdmin && (
              <Link to="/admin" className="px-3 py-2 text-sm font-medium text-blue-400 hover:text-blue-300 hover:bg-blue-900/10 rounded-xl transition-all flex items-center space-x-1">
                <Shield className="w-4 h-4" />
                <span className="capitalize">{userRole === 'admin' ? 'Admin' : userRole === 'moderator' ? 'Moderator' : 'Panel'}</span>
              </Link>
            )}
            {user ? (
              <div className="flex items-center space-x-4">
                <Link to="/profile" className="text-gray-400 hover:text-white text-sm flex items-center space-x-1 transition-colors group">
                  <User className="w-4 h-4 group-hover:text-blue-500 transition-colors" />
                  <span>{nickname || user.displayName || user.email?.split('@')[0]}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 text-red-400 hover:text-red-300 transition-colors text-sm"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Çıkış</span>
                </button>
              </div>
            ) : (
              <Link
                to="/auth"
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-blue-900/30 ring-1 ring-blue-500/30"
              >
                <LogIn className="w-4 h-4" />
                Giriş Yap
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="xl:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-400 hover:text-white p-2"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="xl:hidden bg-black border-b border-blue-900/30 px-4 pt-2 pb-4 space-y-2 max-h-[80vh] overflow-y-auto">
          {/* Mobile Search */}
          <form onSubmit={handleSearch} className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="İçerik ara..."
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:border-blue-500 outline-none"
            />
          </form>

          <Link to="/" className="block text-gray-300 hover:text-blue-400 py-2" onClick={() => setIsMenuOpen(false)}>Ana Sayfa</Link>
          
          {categories.map((cat) => (
            <div key={cat.id} className="space-y-1">
              <div className="text-zinc-600 text-[10px] font-bold uppercase tracking-widest pt-2 px-2">
                {cat.name}
              </div>
              {cat.subcategories.map((sub) => (
                <Link
                  key={sub}
                  to={categoryUrl(cat.name, sub)}
                  className="block text-gray-400 hover:text-white py-2 pl-4 text-sm"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {sub}
                </Link>
              ))}
            </div>
          ))}

          {isAdmin && (
            <Link to="/admin" className="block text-blue-400 hover:text-blue-300 py-2 border-t border-zinc-800 mt-2" onClick={() => setIsMenuOpen(false)}>
              {userRole === 'admin' ? 'Admin Paneli' : userRole === 'moderator' ? 'Moderator Paneli' : 'Yönetim Paneli'}
            </Link>
          )}
          {user ? (
            <>
              <Link
                to="/profile"
                className="block text-gray-400 hover:text-white py-2 border-t border-gray-800 mt-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Profil: {nickname || user.displayName || user.email?.split('@')[0]}
              </Link>
              <button
                onClick={() => { handleLogout(); setIsMenuOpen(false); }}
                className="block w-full text-left text-red-400 hover:text-red-300 py-2"
              >
                Çıkış Yap
              </button>
            </>
          ) : (
            <Link
              to="/auth"
              className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-3 rounded-xl text-sm font-semibold text-center mt-4 transition-all"
              onClick={() => setIsMenuOpen(false)}
            >
              <LogIn className="w-4 h-4" />
              Giriş Yap
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
