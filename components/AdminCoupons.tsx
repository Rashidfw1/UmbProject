import React, { useContext, useState } from 'react';
// Fix: Use relative paths for local module imports.
import { AppContext } from '../context/AppContext';
import { useLocalization } from '../hooks/useLocalization';
import { Coupon } from '../types';
import Modal from './Modal';
import { PlusIcon, EditIcon, TrashIcon } from './Icons';
import { translations } from '../data/localization';

const AdminCoupons: React.FC = () => {
    const context = useContext(AppContext);
    const { t } = useLocalization();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [currentCoupon, setCurrentCoupon] = useState<Coupon | null>(null);
    const [couponToDelete, setCouponToDelete] = useState<Coupon | null>(null);
    const [feedback, setFeedback] = useState({ message: '', type: '' });

    if (!context) return null;
    const { coupons, addCoupon, updateCoupon, deleteCoupon } = context;

    const openModal = (coupon: Coupon | null) => {
        setCurrentCoupon(coupon);
        setFeedback({ message: '', type: '' });
        setIsModalOpen(true);
    };

    const openDeleteModal = (coupon: Coupon) => {
        setCouponToDelete(coupon);
        setIsDeleteModalOpen(true);
    };

    const handleSave = async (couponData: Coupon) => {
        const result = await (couponData.id ? updateCoupon(couponData) : addCoupon(couponData));
        if (result.success) {
            setIsModalOpen(false);
        } else {
            setFeedback({ message: t(result.message as keyof typeof translations['en']), type: 'error' });
        }
    };
    
    const handleDelete = async () => {
        if (couponToDelete) {
            await deleteCoupon(couponToDelete.id);
            setIsDeleteModalOpen(false);
            setCouponToDelete(null);
        }
    };

    const getStatusClass = (isActive: boolean) => {
        return isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800';
    };

    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
                <h2 className="text-2xl font-semibold text-brand-dark">{t('couponManagement')}</h2>
                <button
                    onClick={() => openModal(null)}
                    className="flex items-center justify-center gap-2 bg-brand-gold text-white px-4 py-2 rounded-md hover:bg-opacity-90 transition-colors w-full sm:w-auto"
                >
                    <PlusIcon className="w-5 h-5" />
                    {t('addNewCoupon')}
                </button>
            </div>
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('couponCode')}</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('discount')}</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('expiryDate')}</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('status')}</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('actions')}</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {coupons.map((coupon: Coupon) => (
                                <tr key={coupon.id}>
                                    <td className="px-6 py-4 whitespace-nowrap font-mono text-sm text-brand-dark">{coupon.code}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">{coupon.discountPercentage}%</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">{coupon.expiryDate}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(coupon.isActive)}`}>
                                            {coupon.isActive ? t('active') : t('inactive')}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button onClick={() => openModal(coupon)} className="text-indigo-600 hover:text-indigo-900 mr-4" title={t('editCoupon')}><EditIcon className="w-5 h-5" /></button>
                                        <button onClick={() => openDeleteModal(coupon)} className="text-red-600 hover:text-red-900" title={t('deleteCoupon')}><TrashIcon className="w-5 h-5" /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                 {/* Mobile Card List */}
                <div className="md:hidden">
                     <div className="space-y-4 p-4">
                        {coupons.map((coupon: Coupon) => (
                             <div key={coupon.id} className="bg-white p-4 rounded-lg shadow border border-gray-100">
                                 <div className="flex justify-between items-start">
                                     <div>
                                         <p className="font-bold font-mono text-brand-dark">{coupon.code}</p>
                                         <p className="text-sm text-brand-gold font-semibold">{coupon.discountPercentage}% {t('discount')}</p>
                                     </div>
                                     <span className={`px-2 py-1 text-xs leading-5 font-semibold rounded-full ${getStatusClass(coupon.isActive)}`}>
                                         {coupon.isActive ? t('active') : t('inactive')}
                                     </span>
                                 </div>
                                 <div className="mt-2 text-sm text-gray-600">
                                     <strong>{t('expiryDate')}:</strong> {coupon.expiryDate}
                                 </div>
                                 <div className="mt-4 pt-4 border-t flex justify-end gap-2">
                                      <button onClick={() => openModal(coupon)} className="flex items-center gap-1 text-sm text-indigo-600 font-semibold p-2 rounded-md hover:bg-indigo-50"><EditIcon className="w-4 h-4" /> {t('editCoupon')}</button>
                                      <button onClick={() => openDeleteModal(coupon)} className="flex items-center gap-1 text-sm text-red-600 font-semibold p-2 rounded-md hover:bg-red-50"><TrashIcon className="w-4 h-4" /> {t('deleteCoupon')}</button>
                                 </div>
                             </div>
                        ))}
                    </div>
                </div>
            </div>

            {isModalOpen && <CouponFormModal coupon={currentCoupon} onSave={handleSave} onClose={() => setIsModalOpen(false)} feedback={feedback} />}
            {isDeleteModalOpen && (
                 <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title={t('deleteCoupon')}>
                    <div>
                        <p>{t('areYouSureDeleteCoupon')}</p>
                        <div className="mt-6 flex justify-end gap-4">
                            <button onClick={() => setIsDeleteModalOpen(false)} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md">{t('cancel')}</button>
                            <button onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white rounded-md">{t('deleteCoupon')}</button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
};

interface CouponFormModalProps {
    coupon: Coupon | null;
    onSave: (coupon: Coupon) => void;
    onClose: () => void;
    feedback: { message: string, type: string };
}

const CouponFormModal: React.FC<CouponFormModalProps> = ({ coupon, onSave, onClose, feedback }) => {
    const { t } = useLocalization();
    const [formData, setFormData] = useState<Omit<Coupon, 'id'>>({
        code: coupon?.code || '',
        discountPercentage: coupon?.discountPercentage || 10,
        expiryDate: coupon?.expiryDate || new Date().toISOString().split('T')[0],
        isActive: coupon?.isActive ?? true,
    });
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        if (type === 'checkbox') {
            setFormData(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
        } else {
            setFormData(prev => ({ ...prev, [name]: name === 'discountPercentage' ? parseInt(value) : value }));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ ...formData, id: coupon?.id || '' });
    };

    return (
        <Modal isOpen={true} onClose={onClose} title={coupon ? t('editCoupon') : t('addNewCoupon')}>
             <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                    {feedback.message && <p className={`${feedback.type === 'error' ? 'text-red-500' : 'text-green-600'} text-sm`}>{feedback.message}</p>}
                    <div>
                        <label className="block text-sm font-medium">{t('couponCode')}</label>
                        <input type="text" name="code" value={formData.code} onChange={handleChange} required className="mt-1 block w-full input uppercase"/>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                         <div>
                            <label className="block text-sm font-medium">{t('discountPercentage')}</label>
                            <input type="number" name="discountPercentage" value={formData.discountPercentage} onChange={handleChange} required min="1" max="100" className="mt-1 block w-full input"/>
                        </div>
                         <div>
                            <label className="block text-sm font-medium">{t('expiryDate')}</label>
                            <input type="date" name="expiryDate" value={formData.expiryDate} onChange={handleChange} required className="mt-1 block w-full input"/>
                        </div>
                    </div>
                    <div>
                        <label className="flex items-center">
                            <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleChange} className="h-4 w-4 text-brand-gold border-gray-300 rounded"/>
                            <span className="ml-2 text-sm text-gray-600">{t('active')}</span>
                        </label>
                    </div>
                </div>
                <div className="mt-6 flex justify-end gap-4 border-t pt-4">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md">{t('cancel')}</button>
                    <button type="submit" className="px-4 py-2 bg-brand-gold text-white rounded-md">{t('save')}</button>
                </div>
            </form>
            <style>{`.input { padding: 0.5rem 0.75rem; border: 1px solid #d1d5db; border-radius: 0.375rem; }`}</style>
        </Modal>
    )
};

export default AdminCoupons;