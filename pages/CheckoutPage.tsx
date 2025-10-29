import React, { useState, useContext, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { useLocalization } from '../hooks/useLocalization';
import { useCurrency } from '../hooks/useCurrency';
import { governorates, wilayats } from '../data/omanGeography';
import { countries } from '../data/countries';
import { getDeliveryFee } from '../data/deliveryFees';
import { Order } from '../types';
import { WhatsAppIcon } from '../components/Icons';

const CheckoutPage: React.FC = () => {
  const context = useContext(AppContext);
  // Fix: Destructure `getLocalized` from useLocalization hook.
  const { t, language, getLocalized } = useLocalization();
  const { formatCurrency } = useCurrency();
  const navigate = useNavigate();

  // Form State
  const [customerName, setCustomerName] = useState('');
  const [customerContact, setCustomerContact] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('oman');
  const [deliveryType, setDeliveryType] = useState<'home' | 'office'>('home');
  const [selectedGovernorate, setSelectedGovernorate] = useState('');
  const [selectedWilayah, setSelectedWilayah] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [isGift, setIsGift] = useState(false);
  const [recipientName, setRecipientName] = useState('');
  const [recipientContact, setRecipientContact] = useState('');
  const [addCard, setAddCard] = useState(false);
  const [cardMessage, setCardMessage] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'WhatsApp' | 'Thawani'>('WhatsApp');
  const [isLoading, setIsLoading] = useState(false);

  if (!context) return null;
  // Fix: Removed `getLocalized` from context destructuring.
  const { cart, cartSubtotal, appliedCoupon, addOrder, user } = context;

  // Fee & Total Calculation
  const cardFee = useMemo(() => addCard ? 0.100 : 0, [addCard]);
  const discountAmount = useMemo(() => {
    if (!appliedCoupon) return 0;
    return cartSubtotal * (appliedCoupon.discountPercentage / 100);
  }, [cartSubtotal, appliedCoupon]);

  const deliveryFee = useMemo(() => {
    return getDeliveryFee(selectedCountry, deliveryType, selectedWilayah);
  }, [selectedCountry, deliveryType, selectedWilayah]);

  const finalTotal = useMemo(() => {
    return cartSubtotal - discountAmount + cardFee + deliveryFee;
  }, [cartSubtotal, discountAmount, cardFee, deliveryFee]);

  useEffect(() => {
    if (user) {
      setCustomerName(user.name);
    }
  }, [user]);

  const initiateThawaniPayment = async (orderDetails: Omit<Order, 'id'>) => {
      const newOrder = await addOrder({ ...orderDetails, status: 'Pending Payment' });
      if (!newOrder) {
        setIsLoading(false);
        alert('Failed to create order. Please try again.');
        return;
      }
      const successUrl = `${window.location.origin}/#/thawani/callback?status=success&order_id=${newOrder.id}`;
      console.log("Redirecting to mock Thawani payment page...");
      setTimeout(() => {
        window.location.href = successUrl;
      }, 2000);
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    let isFormValid = false;
    if (selectedCountry === 'oman') {
        isFormValid = !!(customerName && customerContact && selectedGovernorate && selectedWilayah);
    } else {
        isFormValid = !!(customerName && customerContact && addressLine1);
    }

    if (cart.length === 0 || !isFormValid) {
        alert("Please fill all required fields and ensure your cart is not empty.");
        return;
    }
    
    setIsLoading(true);

    const orderDetails: Omit<Order, 'id'> = {
      userId: user?.id,
      customerName,
      customerContact,
      items: cart,
      total: finalTotal,
      date: new Date().toISOString(),
      status: 'Pending',
      discountAmount: discountAmount > 0 ? discountAmount : undefined,
      couponCode: appliedCoupon?.code,
      paymentMethod,
      isGift,
      recipientName: isGift ? recipientName : undefined,
      recipientContact: isGift ? recipientContact : undefined,
      country: selectedCountry,
      deliveryType: selectedCountry === 'oman' ? deliveryType : undefined,
      governorate: selectedCountry === 'oman' ? selectedGovernorate : undefined,
      wilayah: selectedCountry === 'oman' ? selectedWilayah : undefined,
      addressLine1: selectedCountry !== 'oman' ? addressLine1 : undefined,
      addCard,
      cardMessage: addCard ? cardMessage : undefined,
      additionalNotes,
      deliveryFee,
    };
    
    if (paymentMethod === 'Thawani') {
      await initiateThawaniPayment(orderDetails);
    } else { // WhatsApp
      const newOrder = await addOrder(orderDetails);
      if (!newOrder) {
        setIsLoading(false);
        alert('Failed to create order. Please try again.');
        return;
      }
      const itemsSummary = cart.map(item => `${getLocalized(item.product.name)} (x${item.quantity})`).join('\n');
      const message = `*New Order: #${newOrder.id}*\n\n*Name:*\n${customerName}\n\n*Contact:*\n${customerContact}\n\n*Items:*\n${itemsSummary}\n\n*Total:*\n${formatCurrency(finalTotal)}`;
      const whatsappUrl = `https://wa.me/96877044795?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
      navigate(`/order-confirmation/${newOrder.id}`);
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl md:text-4xl font-serif font-bold text-center text-brand-dark mb-8">{t('checkoutTitle')}</h1>
      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Fields */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-subtle">
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold font-serif mb-4">{t('guestDetails')}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium">{t('name')}</label>
                  <input type="text" value={customerName} onChange={e => setCustomerName(e.target.value)} required className="mt-1 block w-full input" />
                </div>
                <div>
                  <label className="block text-sm font-medium">WhatsApp Number</label>
                  <input type="tel" value={customerContact} onChange={e => setCustomerContact(e.target.value)} required className="mt-1 block w-full input" placeholder="e.g., 9689xxxxxxx" />
                </div>
              </div>
               <div className="mt-4">
                <label className="flex items-center space-x-2 rtl:space-x-reverse cursor-pointer">
                  <input type="checkbox" checked={isGift} onChange={e => setIsGift(e.target.checked)} className="h-4 w-4 rounded" />
                  <span className="text-sm font-medium">{t('isGift')}</span>
                </label>
                {isGift && (
                  <div className="mt-2 animate-fade-in-down grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium">{t('recipientName')}</label>
                      <input type="text" value={recipientName} onChange={e => setRecipientName(e.target.value)} required={isGift} className="mt-1 block w-full input" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium">{t('recipientContactNumber')}</label>
                      <input type="tel" value={recipientContact} onChange={e => setRecipientContact(e.target.value)} required={isGift} className="mt-1 block w-full input" placeholder="e.g., 9689xxxxxxx" />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold font-serif mb-4">{t('shippingDetails')}</h2>
                <div>
                    <label className="block text-sm font-medium">{t('country')}</label>
                    <select value={selectedCountry} onChange={e => setSelectedCountry(e.target.value)} required className="mt-1 block w-full input">
                        {countries.map(c => <option key={c.key} value={c.key}>{t(c.key as any)}</option>)}
                    </select>
                </div>
                
                {selectedCountry === 'oman' ? (
                    <div className="mt-4 space-y-4 animate-fade-in-down">
                        <div>
                            <label className="block text-sm font-medium">{t('deliveryType')}</label>
                            <div className="mt-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                              <label className={`flex items-center p-3 border rounded-lg cursor-pointer ${deliveryType === 'home' ? 'border-brand-gold ring-2 ring-brand-gold' : ''}`}>
                                    <input type="radio" name="deliveryType" value="home" checked={deliveryType === 'home'} onChange={() => setDeliveryType('home')} className="h-4 w-4" />
                                    <span className="ml-3 text-sm font-semibold">{t('homeDelivery')}</span>
                                </label>
                                <label className={`flex items-center p-3 border rounded-lg cursor-pointer ${deliveryType === 'office' ? 'border-brand-gold ring-2 ring-brand-gold' : ''}`}>
                                    <input type="radio" name="deliveryType" value="office" checked={deliveryType === 'office'} onChange={() => setDeliveryType('office')} className="h-4 w-4" />
                                    <span className="ml-3 text-sm font-semibold">{t('officeDelivery')}</span>
                                </label>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                            <label className="block text-sm font-medium">{t('governorate')}</label>
                            <select value={selectedGovernorate} onChange={e => { setSelectedGovernorate(e.target.value); setSelectedWilayah(''); }} required className="mt-1 block w-full input">
                                <option value="">{t('selectGovernorate')}</option>
                                {governorates.map(gov => <option key={gov.key} value={gov.key}>{language === 'ar' ? gov.ar : gov.en}</option>)}
                            </select>
                            </div>
                            <div>
                            <label className="block text-sm font-medium">{t('wilayah')}</label>
                            <select value={selectedWilayah} onChange={e => setSelectedWilayah(e.target.value)} required disabled={!selectedGovernorate} className="mt-1 block w-full input">
                                <option value="">{t('selectWilayah')}</option>
                                {selectedGovernorate && wilayats[selectedGovernorate]?.map(wil => <option key={wil.key} value={wil.key}>{language === 'ar' ? wil.ar : wil.en}</option>)}
                            </select>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="mt-4 animate-fade-in-down">
                        <label className="block text-sm font-medium">{t('address')}</label>
                        <textarea value={addressLine1} onChange={e => setAddressLine1(e.target.value)} required rows={3} placeholder={t('addressLine1')} className="mt-1 block w-full input" />
                    </div>
                )}
            </div>
            
            <div>
              <h2 className="text-xl font-semibold font-serif mb-4">Extras</h2>
              <div className="space-y-4">
                <div>
                    <label className="flex items-center space-x-2 rtl:space-x-reverse cursor-pointer">
                    <input type="checkbox" checked={addCard} onChange={e => setAddCard(e.target.checked)} className="h-4 w-4 rounded" />
                    <span className="text-sm font-medium">{t('addCard')}</span>
                    </label>
                    {addCard && (
                    <div className="mt-2 animate-fade-in-down">
                        <label className="block text-sm font-medium">{t('cardMessage')}</label>
                        <textarea value={cardMessage} onChange={e => setCardMessage(e.target.value)} rows={3} className="mt-1 block w-full input" />
                    </div>
                    )}
                </div>
                <div>
                    <label className="block text-sm font-medium">{t('additionalNotes')}</label>
                    <textarea value={additionalNotes} onChange={e => setAdditionalNotes(e.target.value)} rows={3} className="mt-1 block w-full input" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-xl shadow-subtle sticky top-24">
            <h2 className="text-xl font-semibold font-serif mb-4">{t('orderSummary')}</h2>
            <div className="space-y-2">
              {cart.map(item => (
                <div key={item.product.id} className="flex justify-between text-sm">
                  <span className="pr-2">{getLocalized(item.product.name)} x{item.quantity}</span>
                  <span className="text-right flex-shrink-0">{formatCurrency(item.product.price * item.quantity)}</span>
                </div>
              ))}
            </div>
            <hr className="my-4"/>
            <div className="space-y-2 font-medium">
              <div className="flex justify-between"><span>{t('subtotal')}</span><span>{formatCurrency(cartSubtotal)}</span></div>
              {appliedCoupon && <div className="flex justify-between text-green-600"><span>{t('discountApplied')} ({appliedCoupon.code})</span><span>-{formatCurrency(discountAmount)}</span></div>}
              {addCard && <div className="flex justify-between"><span>{t('addCard')}</span><span>{formatCurrency(cardFee)}</span></div>}
              {deliveryFee > 0 && <div className="flex justify-between"><span>{t('deliveryFee')}</span><span>{formatCurrency(deliveryFee)}</span></div>}
              <div className="flex justify-between text-lg font-bold border-t pt-2 mt-2"><span>{t('total')}</span><span>{formatCurrency(finalTotal)}</span></div>
            </div>
            
            <hr className="my-4"/>
            
            <h3 className="text-lg font-semibold font-serif mb-3">{t('paymentMethod')}</h3>
            <div className="space-y-3">
                 <label className={`flex items-center p-3 border rounded-lg cursor-pointer ${paymentMethod === 'WhatsApp' ? 'border-brand-gold ring-2 ring-brand-gold' : ''}`}>
                    <input type="radio" name="paymentMethod" value="WhatsApp" checked={paymentMethod === 'WhatsApp'} onChange={() => setPaymentMethod('WhatsApp')} className="h-4 w-4" />
                    <span className="ml-3 font-semibold flex items-center gap-2"><WhatsAppIcon className="w-5 h-5 text-green-500" />{t('whatsApp')}</span>
                </label>
                 <label className={`flex items-center p-3 border rounded-lg cursor-pointer ${paymentMethod === 'Thawani' ? 'border-brand-gold ring-2 ring-brand-gold' : ''}`}>
                    <input type="radio" name="paymentMethod" value="Thawani" checked={paymentMethod === 'Thawani'} onChange={() => setPaymentMethod('Thawani')} className="h-4 w-4" />
                    <span className="ml-3 font-semibold">{t('thawani')}</span>
                </label>
            </div>
            
            <button type="submit" disabled={isLoading} className="w-full mt-6 py-3 bg-brand-gold text-white font-semibold rounded-lg hover:bg-opacity-90 disabled:bg-gray-400">
                {isLoading ? 'Processing...' : t('placeOrder')}
            </button>
          </div>
        </div>
      </form>
      <style>{`.input { padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 0.375rem; -webkit-appearance: none; }`}</style>
    </div>
  );
};

export default CheckoutPage;