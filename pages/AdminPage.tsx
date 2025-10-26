import React, { useState, useContext } from 'react';
import { Navigate } from 'react-router-dom';
// Fix: Use relative paths for local module imports.
import { AppContext } from '../context/AppContext';
import AdminProducts from '../components/AdminProducts';
import AdminUsers from '../components/AdminUsers';
import AdminOrders from '../components/AdminOrders';
import AdminCoupons from '../components/AdminCoupons';
import AdminHomepage from '../components/AdminHomepage';
import AdminSiteSettings from '../components/AdminSiteSettings';
import AdminAboutUs from '../components/AdminAboutUs';
import AdminFaq from '../components/AdminFaq';
import { useLocalization } from '../hooks/useLocalization';

type AdminTab = 'products' | 'users' | 'orders' | 'coupons' | 'homepage' | 'siteSettings' | 'aboutUs' | 'faq';

const AdminPage: React.FC = () => {
    const context = useContext(AppContext);
    const { t } = useLocalization();
    const [activeTab, setActiveTab] = useState<AdminTab>('products');

    if (!context || context.user?.role !== 'admin') {
        return <Navigate to="/" />;
    }

    const renderContent = () => {
        switch (activeTab) {
            case 'products':
                return <AdminProducts />;
            case 'users':
                return <AdminUsers />;
            case 'orders':
                return <AdminOrders />;
            case 'coupons':
                return <AdminCoupons />;
            case 'homepage':
                return <AdminHomepage />;
            case 'siteSettings':
                return <AdminSiteSettings />;
            case 'aboutUs':
                return <AdminAboutUs />;
            case 'faq':
                return <AdminFaq />;
            default:
                return null;
        }
    };

    const tabs: { id: AdminTab; label: string }[] = [
        { id: 'products', label: t('manageProducts') },
        { id: 'users', label: t('manageUsers') },
        { id: 'orders', label: t('manageOrders') },
        { id: 'coupons', label: t('manageCoupons') },
        { id: 'homepage', label: t('manageHomepage') },
        { id: 'siteSettings', label: t('manageSiteSettings') },
        { id: 'aboutUs', label: t('manageAboutUs') },
        { id: 'faq', label: t('manageFaq') },
    ];

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-brand-dark mb-8">{t('adminDashboard')}</h1>

            <div className="border-b border-gray-200 mb-6">
                <div className="overflow-x-auto -mb-px">
                    <div className="flex space-x-4">
                         {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`px-3 py-2 font-semibold whitespace-nowrap text-sm sm:text-base ${
                                    activeTab === tab.id
                                        ? 'border-b-2 border-brand-gold text-brand-gold'
                                        : 'text-gray-500 hover:text-brand-dark'
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
            
            <div>
                {renderContent()}
            </div>
        </div>
    );
};

export default AdminPage;