
import React, { useState, useContext } from 'react';
import { Navigate } from 'react-router-dom';
// Fix: Use relative paths for local module imports.
import { AppContext } from '../context/AppContext';
import AdminProducts from '../components/AdminProducts';
import AdminUsers from '../components/AdminUsers';
import AdminOrders from '../components/AdminOrders';
import AdminCoupons from '../components/AdminCoupons';
import AdminHomepage from '../components/AdminHomepage';
import { useLocalization } from '../hooks/useLocalization';

type AdminTab = 'products' | 'users' | 'orders' | 'coupons' | 'homepage';

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
    ];

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-brand-dark mb-8">{t('adminDashboard')}</h1>

            <div className="flex border-b border-gray-200 mb-6 overflow-x-auto">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-4 py-2 font-semibold whitespace-nowrap ${
                            activeTab === tab.id
                                ? 'border-b-2 border-brand-gold text-brand-gold'
                                : 'text-gray-500 hover:text-brand-dark'
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>
            
            <div>
                {renderContent()}
            </div>
        </div>
    );
};

export default AdminPage;