import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { useLocalization } from '../hooks/useLocalization';
import { useCurrency } from '../hooks/useCurrency';
import { TrashIcon } from '../components/Icons';

const CartPage: React.FC = () => {
  const context = useContext(AppContext);
  const { t, getLocalized } = useLocalization();
  const { formatCurrency } = useCurrency();
  const navigate = useNavigate();
  const [couponCode, setCouponCode] = useState('');
  const [couponMessage, setCouponMessage] = useState({ text: '', success: false });

  if (!context) return null;
  const { cart, cartSubtotal, updateCartQuantity, removeFromCart, appliedCoupon, applyCoupon, removeCoupon } = context;

  const handleApplyCoupon = (e: React.FormEvent) => {
      e.preventDefault();
      const result = applyCoupon(couponCode);
      setCouponMessage({ text: t(result.message as any), success: result.success });
      if (result.success) {
          setCouponCode('');
      }
  };
  
  const handleRemoveCoupon = () => {
    removeCoupon();
    setCouponMessage({ text: '', success: false });
  };

  const discountAmount = appliedCoupon ? cartSubtotal * (appliedCoupon.discountPercentage / 100) : 0;
  const finalTotal = cartSubtotal - discountAmount;

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl md:text-4xl font-serif font-bold text-center text-brand-dark mb-8">{t('yourCart')}</h1>
      
      {cart.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-brand-gray text-lg">{t('emptyCart')}</p>
          <Link
            to="/products"
            className="mt-6 inline-block px-8 py-3 bg-brand-gold text-white font-semibold rounded-full hover:bg-opacity-90 transition-colors duration-300"
          >
            {t('continueShopping')}
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 bg-white p-4 sm:p-6 rounded-xl shadow-subtle">
            <div className="space-y-6">
              {cart.map(item => (
                <div key={item.product.id} className="flex flex-col sm:flex-row items-start sm:items-center gap-4 border-b pb-6 last:border-b-0">
                  <img src={item.product.imageUrl} alt={getLocalized(item.product.name)} className="w-24 h-24 sm:w-28 sm:h-28 object-cover rounded-lg flex-shrink-0" />
                  <div className="flex-grow w-full">
                    <div className="flex justify-between items-start">
                        <Link to={`/product/${item.product.id}`} className="font-semibold hover:text-brand-gold pr-4">{getLocalized(item.product.name)}</Link>
                        <button onClick={() => removeFromCart(item.product.id)} className="text-red-500 hover:text-red-700 sm:hidden">
                            <TrashIcon className="w-5 h-5"/>
                        </button>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{formatCurrency(item.product.price)}</p>
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center gap-2">
                        <label htmlFor={`quantity-${item.product.id}`} className="text-sm font-medium">{t('quantity')}:</label>
                        <input
                          id={`quantity-${item.product.id}`}
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateCartQuantity(item.product.id, parseInt(e.target.value))}
                          className="w-20 p-2 border border-gray-300 rounded text-center"
                        />
                      </div>
                      <p className="font-semibold text-right">{formatCurrency(item.product.price * item.quantity)}</p>
                    </div>
                  </div>
                   <button onClick={() => removeFromCart(item.product.id)} className="text-red-500 hover:text-red-700 hidden sm:block">
                    <TrashIcon className="w-5 h-5"/>
                  </button>
                </div>
              ))}
            </div>
          </div>
          
          {/* Order Summary */}
          <div className="lg:col-span-1">
             <div className="bg-white p-6 rounded-xl shadow-subtle sticky top-24">
                <h2 className="text-xl font-semibold font-serif mb-4">{t('orderSummary')}</h2>
                <div className="space-y-2">
                    <div className="flex justify-between">
                        <span>{t('subtotal')}</span>
                        <span>{formatCurrency(cartSubtotal)}</span>
                    </div>
                    {appliedCoupon && (
                        <div className="flex justify-between text-green-600">
                            <span>{t('discountApplied')} ({appliedCoupon.code})</span>
                            <span>-{formatCurrency(discountAmount)}</span>
                        </div>
                    )}
                    <div className="flex justify-between text-lg font-bold border-t pt-2 mt-2">
                        <span>{t('total')}</span>
                        <span>{formatCurrency(finalTotal)}</span>
                    </div>
                </div>
                
                <div className="mt-6">
                    {appliedCoupon ? (
                        <div className="text-center">
                            <p className="text-sm text-green-600 mb-2">{couponMessage.text}</p>
                            <button onClick={handleRemoveCoupon} className="text-sm text-red-500 hover:underline">{t('remove')}</button>
                        </div>
                    ) : (
                         <form onSubmit={handleApplyCoupon}>
                            <label className="text-sm font-medium">{t('applyCoupon')}</label>
                            <div className="flex mt-1">
                                <input 
                                    type="text" 
                                    value={couponCode}
                                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                    placeholder="COUPONCODE"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-l-md uppercase focus:ring-brand-gold focus:border-brand-gold"
                                />
                                <button type="submit" className="px-4 py-2 bg-brand-dark text-white rounded-r-md hover:bg-black">{t('applyCoupon')}</button>
                            </div>
                             {couponMessage.text && !couponMessage.success && <p className="text-red-500 text-sm mt-1">{couponMessage.text}</p>}
                        </form>
                    )}
                </div>

                <button onClick={() => navigate('/checkout')} className="w-full mt-6 py-3 bg-brand-gold text-white font-semibold rounded-lg hover:bg-opacity-90">
                    {t('proceedToCheckout')}
                </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;