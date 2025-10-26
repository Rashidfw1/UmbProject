import React, { useContext, useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useLocalization } from '../hooks/useLocalization';
import { AppContext } from '../context/AppContext';
import { Order } from '../types';
import { useCurrency } from '../hooks/useCurrency';
import { countries } from '../data/countries';
import { governorates, wilayats } from '../data/omanGeography';

const OrderConfirmationPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { t, getLocalized, language } = useLocalization();
    const { formatCurrency } = useCurrency();
    const context = useContext(AppContext);
    const [order, setOrder] = useState<Order | null>(null);

    useEffect(() => {
        if (context && id) {
            const foundOrder = context.orders.find(o => o.id === id);
            setOrder(foundOrder || null);
        }
    }, [context, id]);

    const getAddressString = () => {
        if (!order) return '';
        if (order.country === 'oman') {
            const gov = governorates.find(g => g.key === order.governorate);
            const wil = wilayats[order.governorate || '']?.find(w => w.key === order.wilayah);
            const country = countries.find(c => c.key === order.country);
            return `${wil?.[language]}, ${gov?.[language]}, ${country?.[language]}`;
        } else {
             const country = countries.find(c => c.key === order.country);
            return `${order.addressLine1}, ${country?.[language]}`;
        }
    };

    if (!order) {
        return (
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center min-h-[60vh]">
                <h1 className="text-2xl font-semibold">Order not found.</h1>
            </div>
        )
    }

    return (
        <div className="container mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-12 min-h-[60vh]">
            <div className="bg-white p-8 rounded-xl shadow-subtle text-center">
                <h1 className="text-3xl md:text-4xl font-serif font-bold text-brand-dark mb-4">{t('thankYou')}</h1>
                <p className="text-lg text-gray-600 mb-2">{t('orderSuccess')}</p>
                 <p className="text-gray-800">
                    {t('yourOrderId')} <span className="font-semibold font-mono text-brand-gold">{order.id}</span>
                </p>
                
                <div className="text-left my-8 border-t border-b py-6 space-y-4">
                    <h2 className="text-xl font-semibold font-serif text-center mb-4">Order Summary</h2>
                    <div>
                        <strong>{t('customer')}:</strong> {order.customerName}
                    </div>
                     <div>
                        <strong>{t('shippingAddress')}:</strong> {getAddressString()}
                    </div>
                    {order.items.map(item => (
                        <div key={item.product.id} className="flex justify-between text-sm border-t pt-2 mt-2">
                            <span>{getLocalized(item.product.name)} x{item.quantity}</span>
                            <span>{formatCurrency(item.product.price * item.quantity)}</span>
                        </div>
                    ))}
                    <div className="space-y-2 font-medium pt-2 border-t mt-2">
                         <div className="flex justify-between"><span>{t('subtotal')}</span><span>{formatCurrency(order.total - (order.deliveryFee || 0) + (order.discountAmount || 0) - (order.addCard ? 0.100 : 0))}</span></div>
                         {order.discountAmount && <div className="flex justify-between text-green-600"><span>{t('discountApplied')}</span><span>-{formatCurrency(order.discountAmount)}</span></div>}
                         {order.addCard && <div className="flex justify-between"><span>{t('addCard')}</span><span>{formatCurrency(0.100)}</span></div>}
                         {order.deliveryFee && <div className="flex justify-between"><span>{t('deliveryFee')}</span><span>{formatCurrency(order.deliveryFee)}</span></div>}
                         <div className="flex justify-between text-lg font-bold border-t pt-2 mt-2"><span>{t('total')}</span><span>{formatCurrency(order.total)}</span></div>
                    </div>
                </div>

                 <Link
                    to="/products"
                    className="mt-4 inline-block px-8 py-3 bg-brand-gold text-white font-semibold rounded-full hover:bg-opacity-90"
                 >
                    {t('continueShopping')}
                </Link>
            </div>
        </div>
    );
};

export default OrderConfirmationPage;