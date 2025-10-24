
import React, { useContext } from 'react';
// Fix: Use relative paths for local module imports.
import { AppContext } from '../context/AppContext';
import { useLocalization } from '../hooks/useLocalization';
import { useCurrency } from '../hooks/useCurrency';
import { Order, OrderStatus } from '../types';

const AdminOrders: React.FC = () => {
    const context = useContext(AppContext);
    const { t } = useLocalization();
    const { formatCurrency } = useCurrency();

    if (!context) return null;
    const { orders, setOrders } = context;

    const handleStatusChange = (orderId: string, status: OrderStatus) => {
        setOrders(orders.map(o => o.id === orderId ? { ...o, status } : o));
    };

    const getStatusClass = (status: OrderStatus) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'processing': return 'bg-blue-100 text-blue-800';
            case 'shipped': return 'bg-indigo-100 text-indigo-800';
            case 'delivered': return 'bg-green-100 text-green-800';
            case 'cancelled': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    }

    return (
        <div>
            <h2 className="text-2xl font-semibold text-brand-dark mb-6">{t('orderManagement')}</h2>
            <div className="bg-white shadow-md rounded-lg overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('orderId')}</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('customer')}</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('date')}</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('total')}</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('status')}</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {orders.map((order: Order) => (
                            <tr key={order.id}>
                                <td className="px-6 py-4 whitespace-nowrap font-mono text-sm text-gray-500">{order.id}</td>
                                <td className="px-6 py-4 whitespace-nowrap font-medium text-brand-dark">{order.userName}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-gray-500">{order.date}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-gray-500">{formatCurrency(order.total)}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <select
                                        value={order.status}
                                        onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                                        className={`p-1 rounded text-xs capitalize ${getStatusClass(order.status)}`}
                                    >
                                        <option value="pending">pending</option>
                                        <option value="processing">processing</option>
                                        <option value="shipped">shipped</option>
                                        <option value="delivered">delivered</option>
                                        <option value="cancelled">cancelled</option>
                                    </select>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminOrders;