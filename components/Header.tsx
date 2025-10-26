import React, { useContext, useState, useEffect, useCallback } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
// Fix: Use relative paths for local module imports.
import { AppContext } from '../context/AppContext';
import { useLocalization } from '../hooks/useLocalization';
import { currencies } from '../data/currencies';
import { Language, CurrencyCode } from '../types';
import { CartIcon, HeartIcon, SearchIcon, ChevronDownIcon, MenuIcon, XIcon, UserIcon, CameraIcon, GlobeIcon, SpinnerIcon } from './Icons';
import Modal from './Modal';
import { translations } from '../data/localization';
import { findSimilarProductsByImage } from '../services/geminiService';

const Header: React.FC = () => {
    const context = useContext(AppContext);
    const { t, language, setLanguage, getLocalized } = useLocalization();
    const { currency, setCurrency, cartCount, wishlistCount, user, login, logout, signUp, products, logoUrl } = context!;
    
    const [searchTerm, setSearchTerm] = useState('');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [isSignUpModalOpen, setIsSignUpModalOpen] = useState(false);
    
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [authError, setAuthError] = useState('');
    const [authSuccess, setAuthSuccess] = useState('');
    const [isAuthLoading, setIsAuthLoading] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();
    
    const [isImageSearching, setIsImageSearching] = useState(false);

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        const file = acceptedFiles[0];
        if (!file) return;

        setIsImageSearching(true);
        const reader = new FileReader();
        reader.onload = async (e) => {
            const base64Image = (e.target?.result as string).split(',')[1];
            try {
                const resultIds = await findSimilarProductsByImage(base64Image, file.type, products);
                navigate(`/search?imageResults=${resultIds.join(',')}`);
            } catch (err) {
                console.error("Image search failed:", err);
                alert('Failed to analyze image. Please try again.');
            } finally {
                setIsImageSearching(false);
            }
        };
        reader.readAsDataURL(file);
    }, [products, navigate]);

    const { getRootProps, getInputProps, open } = useDropzone({
        onDrop,
        noClick: true,
        noKeyboard: true,
        accept: { 'image/*': ['.jpeg', '.png', '.jpg', '.webp'] },
        multiple: false,
    });

    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [location.pathname]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchTerm.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
            setSearchTerm('');
        }
    };
    
    const handleLanguageChange = (lang: Language) => {
        setLanguage(lang);
    };

    const handleCurrencyChange = (curr: CurrencyCode) => {
        setCurrency(curr);
    };

    const resetAuthForms = () => {
        setName('');
        setEmail('');
        setPassword('');
        setAuthError('');
        setAuthSuccess('');
    }

    const openLoginModal = () => {
        resetAuthForms();
        setIsSignUpModalOpen(false);
        setIsLoginModalOpen(true);
    };
    
    const openSignUpModal = () => {
        resetAuthForms();
        setIsLoginModalOpen(false);
        setIsSignUpModalOpen(true);
    };

    const handleLoginSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsAuthLoading(true);
        setAuthError('');
        const result = await login(email, password);
        if (result.success) {
            setIsLoginModalOpen(false);
            resetAuthForms();
        } else {
            setAuthError(result.message);
        }
        setIsAuthLoading(false);
    }

    const handleSignUpSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsAuthLoading(true);
        setAuthError('');
        setAuthSuccess('');
        const result = await signUp(name, email, password);
        setIsAuthLoading(false); // Stop loading indicator regardless of outcome
        if (result.success) {
            setAuthSuccess(result.message);
            // On success, the onAuthStateChange listener handles the session update.
            // We just need to close the modal after a brief delay for the user to see the success message.
            setTimeout(() => {
                setIsSignUpModalOpen(false); // This will trigger onClose which resets the form
            }, 2000);
        } else {
            setAuthError(result.message);
        }
    }

    const handleLogout = async () => {
        await logout();
    }
    
    const navLinks = [
        { to: "/", label: t('home') },
        { to: "/products", label: t('products') },
        ...(user?.role === 'admin' ? [{ to: "/admin", label: t('admin') }] : [])
    ];
    
    const NavLinksComponent: React.FC<{mobile?: boolean}> = ({mobile = false}) => (
        <>
            {navLinks.map(link => (
                <NavLink
                    key={link.to}
                    to={link.to}
                    className={({ isActive }) =>
                       mobile
                         ? `block px-4 py-3 text-lg font-semibold rounded-lg ${isActive ? 'bg-brand-light text-brand-gold' : 'text-brand-dark hover:bg-brand-light/50'}`
                         : `px-3 py-2 rounded-md text-base md:text-sm font-medium ${isActive ? 'text-brand-gold' : 'text-brand-dark hover:text-brand-gold'}`
                    }
                >
                    {link.label}
                </NavLink>
            ))}
        </>
    );

    return (
      <>
        <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-40">
            <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    <div className="flex items-center">
                        <Link to="/" className="flex-shrink-0 flex items-center">
                            {logoUrl && <img src={logoUrl} alt="Jewelry Umbrella Logo" className="h-10 w-auto" />}
                        </Link>
                        <div className="hidden md:block">
                            <div className="ml-10 flex items-baseline space-x-4 rtl:space-x-reverse">
                                <NavLinksComponent/>
                            </div>
                        </div>
                    </div>

                    <div className="hidden md:flex items-center gap-4">
                        <form onSubmit={handleSearch} {...getRootProps()} className="relative">
                            <input {...getInputProps()} />
                            <input
                                type="text"
                                placeholder={t('search')}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-48 bg-gray-100 rounded-full py-2 pl-10 pr-10 rtl:pl-4 rtl:pr-10 focus:outline-none focus:ring-2 focus:ring-brand-gold transition-all"
                            />
                            <SearchIcon className="absolute left-3 rtl:left-auto rtl:right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                             <button type="button" onClick={open} disabled={isImageSearching} className="absolute right-3 rtl:right-auto rtl:left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-brand-gold disabled:opacity-50">
                                {isImageSearching ? <SpinnerIcon className="w-5 h-5 animate-spin" /> : <CameraIcon className="w-5 h-5" />}
                            </button>
                        </form>
                        
                        {/* Language Selector */}
                        <div className="relative group">
                            <button className="flex items-center text-brand-dark hover:text-brand-gold p-2">
                                <GlobeIcon className="w-5 h-5" />
                                <ChevronDownIcon className="w-4 h-4 ml-1" />
                            </button>
                            <div className="absolute right-0 mt-2 w-32 bg-white rounded-xl shadow-lifted p-1 opacity-0 group-hover:opacity-100 transition-all duration-300 invisible group-hover:visible z-50">
                                <button onClick={() => handleLanguageChange('en')} className={`block w-full text-left px-3 py-2 text-sm rounded-lg ${language === 'en' ? 'bg-brand-light font-semibold' : 'hover:bg-brand-light'}`}>English</button>
                                <button onClick={() => handleLanguageChange('ar')} className={`block w-full text-left px-3 py-2 text-sm rounded-lg ${language === 'ar' ? 'bg-brand-light font-semibold' : 'hover:bg-brand-light'}`}>العربية</button>
                            </div>
                        </div>

                        {/* Currency Selector */}
                        <div className="relative group">
                            <button className="flex items-center text-brand-dark hover:text-brand-gold p-2 font-semibold text-sm">
                                {currency}
                                <ChevronDownIcon className="w-4 h-4 ml-1" />
                            </button>
                            <div className="absolute right-0 mt-2 w-40 bg-white rounded-xl shadow-lifted p-1 opacity-0 group-hover:opacity-100 transition-all duration-300 invisible group-hover:visible z-50 max-h-60 overflow-y-auto">
                                {Object.values(currencies).map(c => (
                                    <button key={c.code} onClick={() => handleCurrencyChange(c.code)} className={`block w-full text-left px-3 py-2 text-sm rounded-lg ${currency === c.code ? 'bg-brand-light font-semibold' : 'hover:bg-brand-light'}`}>
                                        {c.code} - {getLocalized(c.name)}
                                    </button>
                                ))}
                            </div>
                        </div>


                        <Link to="/wishlist" className="relative text-brand-dark hover:text-brand-gold p-2">
                            <HeartIcon className="w-6 h-6" />
                            {wishlistCount > 0 && <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-brand-gold rounded-full">{wishlistCount}</span>}
                        </Link>
                        <Link to="/cart" className="relative text-brand-dark hover:text-brand-gold p-2">
                            <CartIcon className="w-6 h-6" />
                            {cartCount > 0 && <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-brand-gold rounded-full">{cartCount}</span>}
                        </Link>

                        {user ? (
                             <div className="relative group">
                                <button className="flex items-center text-brand-dark hover:text-brand-gold">
                                    <UserIcon className="w-6 h-6" />
                                    <ChevronDownIcon className="w-4 h-4 ml-1" />
                                </button>
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lifted p-1 opacity-0 group-hover:opacity-100 transition-all duration-300 invisible group-hover:visible z-50">
                                    <div className="px-3 py-2 text-sm text-brand-dark">
                                        <div className="font-semibold">{t('welcomeUser', {name: user.name})}</div>
                                    </div>
                                    <div className="border-t my-1 border-gray-100"></div>
                                    <button onClick={handleLogout} className="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-brand-light hover:text-brand-dark rounded-lg">{t('logout')}</button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <button onClick={openLoginModal} className="px-4 py-2 text-sm font-medium text-brand-dark hover:text-brand-gold">{t('login')}</button>
                                <button onClick={openSignUpModal} className="px-4 py-2 text-sm font-medium bg-brand-gold text-white rounded-full hover:bg-opacity-90">{t('signUp')}</button>
                            </div>
                        )}
                    </div>
                    
                    <div className="md:hidden flex items-center">
                         <Link to="/cart" className="relative text-brand-dark hover:text-brand-gold p-2">
                            <CartIcon className="w-6 h-6" />
                            {cartCount > 0 && <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-brand-gold rounded-full">{cartCount}</span>}
                        </Link>
                        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="inline-flex items-center justify-center p-2 rounded-md text-brand-dark hover:text-brand-gold focus:outline-none">
                            {isMobileMenuOpen ? <XIcon className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
                        </button>
                    </div>
                </div>
            </nav>
            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div className="md:hidden fixed inset-0 z-50">
                    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}></div>
                    <div className={`relative w-4/5 max-w-sm h-full bg-white shadow-lg p-6 ${language === 'ar' ? 'animate-slide-in-from-right' : 'animate-slide-in-from-left'}`}>
                        <div className="flex flex-col h-full">
                            <div className="flex items-center justify-between mb-8">
                                <Link to="/" className="flex-shrink-0 flex items-center">
                                    {logoUrl && <img src={logoUrl} alt="Jewelry Umbrella Logo" className="h-9 w-auto" />}
                                </Link>
                                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2">
                                    <XIcon className="w-6 h-6"/>
                                </button>
                            </div>
                            <nav className="flex flex-col gap-4">
                                <NavLinksComponent mobile={true}/>
                            </nav>
                            <div className="mt-auto space-y-4">
                                <div className="border-t pt-4 space-y-2">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-medium text-gray-600">Language</span>
                                        <div className="flex gap-2">
                                            <button onClick={() => handleLanguageChange('en')} className={`px-3 py-1 text-sm rounded-full ${language === 'en' ? 'bg-brand-gold text-white' : 'bg-gray-200'}`}>EN</button>
                                            <button onClick={() => handleLanguageChange('ar')} className={`px-3 py-1 text-sm rounded-full ${language === 'ar' ? 'bg-brand-gold text-white' : 'bg-gray-200'}`}>AR</button>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center">
                                         <span className="text-sm font-medium text-gray-600">Currency</span>
                                          <select onChange={(e) => handleCurrencyChange(e.target.value as CurrencyCode)} value={currency} className="bg-gray-200 border-none rounded-full text-sm px-3 py-1">
                                            {Object.values(currencies).map(c => <option key={c.code} value={c.code}>{c.code}</option>)}
                                         </select>
                                    </div>
                                </div>
                                {user ? (
                                    <>
                                     <div className="text-center font-semibold">{t('welcomeUser', {name: user.name})}</div>
                                     <button onClick={handleLogout} className="w-full text-center px-4 py-3 text-sm font-medium bg-brand-dark text-white rounded-full hover:bg-opacity-90">{t('logout')}</button>
                                    </>
                                ) : (
                                    <div className="grid grid-cols-2 gap-2">
                                        <button onClick={openLoginModal} className="w-full px-4 py-3 text-sm font-medium text-brand-dark border border-gray-200 rounded-full">{t('login')}</button>
                                        <button onClick={openSignUpModal} className="w-full px-4 py-3 text-sm font-medium bg-brand-gold text-white rounded-full hover:bg-opacity-90">{t('signUp')}</button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </header>

        {/* Auth Modals */}
        <Modal isOpen={isLoginModalOpen} onClose={() => { setIsLoginModalOpen(false); resetAuthForms(); }} title={t('loginToAccount')}>
            <form onSubmit={handleLoginSubmit}>
                {authError && <p className="text-red-500 text-sm mb-4">{authError}</p>}
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">{t('email')}</label>
                        <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-gold focus:border-brand-gold"/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">{t('password')}</label>
                        <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-gold focus:border-brand-gold"/>
                    </div>
                </div>
                <button type="submit" disabled={isAuthLoading} className="w-full mt-6 py-2 px-4 bg-brand-gold text-white font-semibold rounded-md hover:bg-opacity-90 disabled:bg-gray-400">
                  {isAuthLoading ? <SpinnerIcon className="w-5 h-5 animate-spin mx-auto" /> : t('login')}
                </button>
                <p className="mt-4 text-sm text-center">
                    {t('noAccount')}{' '}
                    <button type="button" onClick={openSignUpModal} className="font-medium text-brand-gold hover:underline">{t('signUp')}</button>
                </p>
            </form>
        </Modal>

        <Modal isOpen={isSignUpModalOpen} onClose={() => { setIsSignUpModalOpen(false); resetAuthForms(); }} title={t('createAccount')}>
            <form onSubmit={handleSignUpSubmit}>
                {authError && <p className="text-red-500 text-sm mb-4">{authError}</p>}
                {authSuccess && <p className="text-green-600 text-sm mb-4">{authSuccess}</p>}
                <div className="space-y-4">
                     <div>
                        <label className="block text-sm font-medium text-gray-700">{t('name')}</label>
                        <input type="text" value={name} onChange={e => setName(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-gold focus:border-brand-gold"/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">{t('email')}</label>
                        <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-gold focus:border-brand-gold"/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">{t('password')}</label>
                        <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-gold focus:border-brand-gold"/>
                    </div>
                </div>
                 <button type="submit" disabled={isAuthLoading} className="w-full mt-6 py-2 px-4 bg-brand-gold text-white font-semibold rounded-md hover:bg-opacity-90 disabled:bg-gray-400">
                  {isAuthLoading ? <SpinnerIcon className="w-5 h-5 animate-spin mx-auto" /> : t('signUp')}
                </button>
                <p className="mt-4 text-sm text-center">
                    {t('haveAccount')}{' '}
                    <button type="button" onClick={openLoginModal} className="font-medium text-brand-gold hover:underline">{t('login')}</button>
                </p>
            </form>
        </Modal>
      </>
    );
};

export default Header;