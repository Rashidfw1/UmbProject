import React, { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { useLocalization } from '../hooks/useLocalization';
import { useCurrency } from '../hooks/useCurrency';
import { Order, OrderStatus } from '../types';
import Modal from './Modal';
import { countries } from '../data/countries';
import { governorates, wilayats } from '../data/omanGeography';

const AdminOrders: React.FC = () => {
    const context = useContext(AppContext);
    const { t } = useLocalization();
    const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

    if (!context) return null;
    const { orders } = context;

    const filteredOrders = statusFilter === 'all'
        ? orders
        : orders.filter(order => order.status === statusFilter);

    const openModal = (order: Order) => {
        setSelectedOrder(order);
        setIsModalOpen(true);
    };

    const getStatusClass = (status: OrderStatus) => {
        switch (status) {
            case 'Pending':
            case 'Pending Payment':
                return 'bg-yellow-100 text-yellow-800';
            case 'Processing':
                return 'bg-blue-100 text-blue-800';
            case 'Shipped':
                return 'bg-indigo-100 text-indigo-800';
            case 'Delivered':
                return 'bg-green-100 text-green-800';
            case 'Cancelled':
            case 'Payment Failed':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };
    
    const statuses: OrderStatus[] = ['Pending', 'Pending Payment', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Payment Failed'];

    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
                <h2 className="text-2xl font-semibold text-brand-dark">{t('manageOrders')}</h2>
                <div>
                     <select 
                        value={statusFilter} 
                        onChange={(e) => setStatusFilter(e.target.value as OrderStatus | 'all')}
                        className="px-3 py-2 border border-gray-300 rounded-md w-full sm:w-auto"
                    >
                        <option value="all">{t('all')}</option>
                        {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
            </div>
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('orderId')}</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('customer')}</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('date')}</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('total')}</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('orderStatus')}</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('actions')}</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredOrders.map(order => (
                                <OrderRow key={order.id} order={order} onSelect={openModal} getStatusClass={getStatusClass}/>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Card List */}
                <div className="md:hidden">
                    <div className="space-y-4 p-4">
                        {filteredOrders.map(order => (
                            <div key={order.id} className="bg-white p-4 rounded-lg shadow border border-gray-100">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-bold font-mono text-brand-dark">{order.id}</p>
                                        <p className="text-sm text-gray-600">{order.customerName}</p>
                                    </div>
                                    <span className={`px-2 py-1 text-xs leading-5 font-semibold rounded-full ${getStatusClass(order.status)}`}>
                                        {order.status}
                                    </span>
                                </div>
                                <div className="mt-4 flex justify-between items-center text-sm">
                                    <span className="text-gray-500">{new Date(order.date).toLocaleDateString()}</span>
                                    <span className="font-semibold text-brand-gold">
                                        <OrderTotal order={order} />
                                    </span>
                                </div>
                                <div className="mt-4 pt-4 border-t text-center">
                                     <button onClick={() => openModal(order)} className="text-indigo-600 hover:text-indigo-900 font-semibold">{t('viewDetails')}</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            {isModalOpen && selectedOrder && <OrderDetailsModal order={selectedOrder} onClose={() => setIsModalOpen(false)} getStatusClass={getStatusClass} statuses={statuses}/>}
        </div>
    );
};

const OrderTotal: React.FC<{ order: Order }> = ({ order }) => {
    const { formatCurrency } = useCurrency();
    return <>{formatCurrency(order.total)}</>;
}

const OrderRow: React.FC<{ order: Order, onSelect: (order: Order) => void, getStatusClass: (status: OrderStatus) => string }> = ({ order, onSelect, getStatusClass }) => {
    const { formatCurrency } = useCurrency();
    const { t } = useLocalization();

    return (
        <tr>
            <td className="px-6 py-4 whitespace-nowrap font-mono text-sm text-brand-dark">{order.id}</td>
            <td className="px-6 py-4 whitespace-nowrap font-medium text-brand-dark">{order.customerName}</td>
            <td className="px-6 py-4 whitespace-nowrap text-gray-500">{new Date(order.date).toLocaleDateString()}</td>
            <td className="px-6 py-4 whitespace-nowrap text-gray-500">{formatCurrency(order.total)}</td>
            <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(order.status)}`}>
                    {order.status}
                </span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button onClick={() => onSelect(order)} className="text-indigo-600 hover:text-indigo-900">{t('viewDetails')}</button>
            </td>
        </tr>
    );
};

const OrderDetailsModal: React.FC<{ order: Order, onClose: () => void, getStatusClass: (status: OrderStatus) => string, statuses: OrderStatus[] }> = ({ order, onClose, getStatusClass, statuses }) => {
    const { t, getLocalized, language } = useLocalization();
    const { formatCurrency } = useCurrency();
    const context = useContext(AppContext);
    
    if (!context) return null;
    const { updateOrderStatus } = context;

    const [currentStatus, setCurrentStatus] = useState(order.status);
    
    const handleStatusUpdate = async () => {
        await updateOrderStatus(order.id, currentStatus);
    };
    
    const getAddressDisplay = () => {
        if (order.country === 'oman') {
             const gov = governorates.find(g => g.key === order.governorate);
             const wil = wilayats[order.governorate || '']?.find(w => w.key === order.wilayah);
             const country = countries.find(c => c.key === order.country);
             return (
                 <>
                    <p><strong>{t('country')}:</strong> {country?.[language]}</p>
                    <p><strong>{t('deliveryType')}:</strong> {order.deliveryType ? t(order.deliveryType === 'home' ? 'homeDelivery' : 'officeDelivery') : 'N/A'}</p>
                    <p><strong>{t('governorate')}:</strong> {gov?.[language]}</p>
                    <p><strong>{t('wilayah')}:</strong> {wil?.[language]}</p>
                 </>
             )
        } else {
             const country = countries.find(c => c.key === order.country);
            return (
                 <>
                    <p><strong>{t('country')}:</strong> {country?.[language]}</p>
                    <p><strong>{t('address')}:</strong> {order.addressLine1}</p>
                 </>
            )
        }
    }
    
    return (
        <Modal isOpen={true} onClose={onClose} title={`${t('orderDetails')} - ${order.id}`}>
            <div className="space-y-4 max-h-[70vh] overflow-y-auto p-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div><strong>{t('customer')}:</strong> {order.customerName}</div>
                    <div><strong>{t('contact')}:</strong> {order.customerContact}</div>
                    <div><strong>{t('date')}:</strong> {new Date(order.date).toLocaleString()}</div>
                     <div><strong>{t('orderStatus')}:</strong> <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusClass(order.status)}`}>{order.status}</span></div>
                </div>
                {order.isGift && (
                    <div className="border-t pt-4">
                        <h4 className="font-semibold">{t('giftDetails')}</h4>
                        <p><strong>{t('recipientName')}:</strong> {order.recipientName}</p>
                        {order.recipientContact && <p><strong>{t('recipientContact')}:</strong> {order.recipientContact}</p>}
                    </div>
                )}
                 <div className="border-t pt-4">
                    <h4 className="font-semibold">{t('shippingAddress')}</h4>
                    {getAddressDisplay()}
                </div>
                {order.additionalNotes && <div className="border-t pt-4"><h4 className="font-semibold">{t('additionalNotes')}</h4><p>{order.additionalNotes}</p></div>}
                
                <div className="border-t pt-4">
                    <h4 className="font-semibold">{t('items')}</h4>
                     {order.items.map(item => (
                        <div key={item.product.id} className="flex justify-between text-sm py-1">
                            <span className="pr-2">{getLocalized(item.product.name)} x{item.quantity}</span>
                            <span className="flex-shrink-0">{formatCurrency(item.product.price * item.quantity)}</span>
                        </div>
                    ))}
                </div>

                <div className="border-t pt-4 space-y-2 font-medium">
                     <div className="flex justify-between"><span>{t('subtotal')}</span><span>{formatCurrency(order.total - (order.deliveryFee || 0) + (order.discountAmount || 0) - (order.addCard ? 0.100 : 0))}</span></div>
                     {order.discountAmount && <div className="flex justify-between text-green-600"><span>{t('discountApplied')} ({order.couponCode})</span><span>-{formatCurrency(order.discountAmount)}</span></div>}
                     {order.addCard && <div className="flex justify-between"><span>{t('addCard')}</span><span>{formatCurrency(0.100)}</span></div>}
                     {order.deliveryFee && <div className="flex justify-between"><span>{t('deliveryFee')}</span><span>{formatCurrency(order.deliveryFee)}</span></div>}
                     <div className="flex justify-between text-lg font-bold border-t pt-2 mt-2"><span>{t('total')}</span><span>{formatCurrency(order.total)}</span></div>
                </div>

                <div className="border-t pt-4">
                    <label className="font-semibold block mb-2">{t('updateStatus')}</label>
                    <div className="flex flex-col sm:flex-row gap-2">
                        <select value={currentStatus} onChange={e => setCurrentStatus(e.target.value as OrderStatus)} className="flex-grow p-2 border border-gray-300 rounded-md">
                            {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <button onClick={handleStatusUpdate} className="px-4 py-2 bg-brand-gold text-white rounded-md">{t('save')}</button>
                    </div>
                </div>
            </div>
             <div className="mt-6 flex justify-end gap-4 border-t pt-4">
                <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md">{t('close')}</button>
            </div>
        </Modal>
    );
};

export default AdminOrders;