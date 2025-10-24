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
  const [discount, setDiscount] = useState(0);
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');

  if (!context) return null;
  const { cart, updateCartQuantity, removeFromCart, cartTotal, coupons, user } = context;

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError('');
    setCouponSuccess('');
    const coupon = coupons.find(c => c.code.toUpperCase() === couponCode.toUpperCase() && c.isActive);

    if (coupon) {
      const today = new Date().toISOString().split('T')[0];
      if (coupon.expiryDate >= today) {
        setDiscount(coupon.discountPercentage);
        setCouponSuccess(t('couponApplied'));
      } else {
        setCouponError(t('invalidCoupon'));
      }
    } else {
      setCouponError(t('invalidCoupon'));
    }
  };
  
  const discountedTotal = cartTotal * (1 - discount / 100);

  const handleCheckout = () => {
      if (user) {
          navigate('/checkout');
      } else {
          alert('Please log in to proceed to checkout.');
          // Or open login modal. For simplicity, using alert.
      }
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 min-h-[60vh]">
      <h1 className="text-3xl md:text-4xl font-serif font-bold text-center text-brand-dark mb-8">{t('shoppingCart')}</h1>
      
      {cart.length === 0 ? (
        <div className="text-center">
          <p className="text-brand-gray">{t('emptyCart')}</p>
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
          <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md">
            <div className="hidden md:grid md:grid-cols-6 gap-4 border-b pb-4 mb-4 font-semibold text-sm text-gray-600">
              <div className="col-span-3">{t('item')}</div>
              <div>{t('price')}</div>
              <div className="text-center">{t('quantity')}</div>
              <div className="text-right">{t('total')}</div>
            </div>
            {cart.map(item => (
              <div key={item.product.id} className="grid grid-cols-6 gap-4 items-center border-b py-4">
                <div className="col-span-6 md:col-span-3 flex items-center gap-4">
                  <img src={item.product.imageUrl} alt={getLocalized(item.product.name)} className="w-20 h-20 object-cover rounded" />
                  <div>
                    <Link to={`/product/${item.product.id}`} className="font-semibold text-brand-dark hover:text-brand-gold">{getLocalized(item.product.name)}</Link>
                    <button onClick={() => removeFromCart(item.product.id)} className="text-xs text-red-500 hover:underline mt-1">{t('deleteProduct')}</button>
                  </div>
                </div>
                <div className="col-span-2 md:col-span-1">{formatCurrency(item.product.price)}</div>
                <div className="col-span-2 md:col-span-1 flex justify-center">
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => updateCartQuantity(item.product.id, parseInt(e.target.value))}
                    className="w-16 p-1 border border-gray-300 rounded text-center"
                  />
                </div>
                <div className="col-span-2 md:col-span-1 text-right font-semibold">{formatCurrency(item.product.price * item.quantity)}</div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1 bg-white p-6 rounded-lg shadow-md h-fit">
            <h2 className="text-xl font-semibold border-b pb-4">{t('orderSummary')}</h2>
            <div className="space-y-4 my-4">
              <div className="flex justify-between">
                <span>{t('subtotal')}</span>
                <span>{formatCurrency(cartTotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>{t('discount')} ({discount}%)</span>
                  <span>- {formatCurrency(cartTotal - discountedTotal)}</span>
                </div>
              )}
               <div className="flex justify-between font-bold text-lg border-t pt-4">
                <span>{t('total')}</span>
                <span>{formatCurrency(discountedTotal)}</span>
              </div>
            </div>
            <form onSubmit={handleApplyCoupon} className="my-6">
              <label className="text-sm font-medium">{t('applyCoupon')}</label>
              <div className="flex mt-1">
                <input 
                    type="text" 
                    value={couponCode} 
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder={t('couponCode')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-1 focus:ring-brand-gold"
                />
                <button type="submit" className="px-4 bg-brand-dark text-white rounded-r-md hover:bg-opacity-90">{t('apply')}</button>
              </div>
              {couponError && <p className="text-red-500 text-xs mt-1">{couponError}</p>}
              {couponSuccess && <p className="text-green-600 text-xs mt-1">{couponSuccess}</p>}
            </form>
            <button
              onClick={handleCheckout}
              className="w-full py-3 bg-brand-gold text-white font-semibold rounded-md hover:bg-opacity-90 transition-colors"
            >
              {t('checkout')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;
