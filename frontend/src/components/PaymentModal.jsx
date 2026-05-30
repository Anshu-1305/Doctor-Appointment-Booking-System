import { CardElement, Elements, useElements, useStripe } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { FiCreditCard, FiGlobe, FiShoppingBag, FiSmartphone, FiX } from 'react-icons/fi';
import api from '../services/api';

const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
const isRealStripeKey = stripePublishableKey && !stripePublishableKey.includes('your_stripe');
const stripePromise = isRealStripeKey ? loadStripe(stripePublishableKey) : null;

const PAYMENT_METHODS = [
  {
    id: 'card',
    label: 'Credit/Debit Card',
    detail: 'Secure card payment',
    icon: FiCreditCard
  },
  {
    id: 'upi',
    label: 'UPI Transfer',
    detail: 'Scan UPI QR or use the UPI ID',
    icon: FiSmartphone,
    manual: true
  },
  {
    id: 'netbanking',
    label: 'Net Banking',
    detail: 'Use your bank app or internet banking',
    icon: FiGlobe,
    manual: true
  },
  {
    id: 'wallet',
    label: 'Wallet',
    detail: 'Pay with mobile wallets like Paytm or PhonePe',
    icon: FiShoppingBag,
    manual: true
  },
  {
    id: 'bank',
    label: 'Bank Transfer',
    detail: 'Direct hospital bank transfer',
    icon: FiCreditCard,
    manual: true
  }
];

const HOSPITAL_PAYMENT_DETAILS = {
  accountName: 'City Hospital Pvt Ltd',
  accountNumber: '12345678901234',
  ifsc: 'HOSP0001234',
  bankName: 'HealthCare Bank',
  branch: 'Main Branch',
  upiId: 'hospital@upi'
};

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      color: '#111827',
      fontFamily: 'Inter, system-ui, sans-serif',
      fontSize: '16px',
      '::placeholder': {
        color: '#9ca3af'
      }
    },
    invalid: {
      color: '#ef4444'
    }
  }
};

const PaymentModalContent = ({ appointment, onClose, onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState(PAYMENT_METHODS[0]);
  const [transactionRef, setTransactionRef] = useState('');
  const [stripeReady, setStripeReady] = useState(false);

  useEffect(() => {
    setStripeReady(isRealStripeKey);
  }, []);

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  const getQrCodeUrl = () => {
    const data = `upi://pay?pa=${encodeURIComponent(HOSPITAL_PAYMENT_DETAILS.upiId)}&pn=${encodeURIComponent(
      HOSPITAL_PAYMENT_DETAILS.accountName
    )}&am=${appointment.amount}&cu=INR`;
    return `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(data)}`;
  };

  const handleConfirmPayment = async (paymentId, paymentMethodId, paymentLabel, transactionNo) => {
    try {
      const { data } = await api.post('/payments/confirm', {
        appointmentId: appointment._id,
        paymentId,
        paymentMethod: paymentMethodId,
        paymentLabel,
        transactionNo
      });

      if (data.success) {
        toast.success(`${paymentLabel} payment successful!`);
        onSuccess();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Payment confirmation failed');
    }
  };

  const handleCardPayment = async () => {
    // Demo mode: Stripe not configured
    if (!stripeReady) {
      setProcessing(true);
      try {
        const demoPaymentId = `demo_card_${Date.now()}`;
        await handleConfirmPayment(demoPaymentId, 'card', 'Debit/Credit Card (Demo)', demoPaymentId);
      } finally {
        setProcessing(false);
      }
      return;
    }

    if (!stripe || !elements) {
      toast.error('Stripe is not ready yet. Please wait a moment and try again.');
      return;
    }

    setProcessing(true);
    try {
      const { data } = await api.post('/payments/create-payment-intent', {
        appointmentId: appointment._id
      });

      if (!data.success || !data.clientSecret) {
        throw new Error(data.message || 'Unable to start card payment');
      }

      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        throw new Error('Card details are not available');
      }

      const result = await stripe.confirmCardPayment(data.clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: appointment.userData?.name || 'Patient',
            email: appointment.userData?.email
          }
        }
      });

      if (result.error) {
        throw new Error(result.error.message || 'Card payment failed');
      }

      if (result.paymentIntent?.status !== 'succeeded') {
        throw new Error('Card payment did not complete successfully');
      }

      await handleConfirmPayment(
        result.paymentIntent.id,
        'card',
        'Debit/Credit Card',
        result.paymentIntent.id
      );
    } catch (err) {
      toast.error(err.message || 'Card payment failed');
    } finally {
      setProcessing(false);
    }
  };

  const handleManualPayment = async () => {
    if (!transactionRef.trim()) {
      toast.error('Enter the transaction reference number');
      return;
    }

    setProcessing(true);
    try {
      const paymentId = `manual_${paymentMethod.id}_${Date.now()}`;
      const paymentLabel = `${paymentMethod.label} transfer`;
      await handleConfirmPayment(paymentId, paymentMethod.id, paymentLabel, transactionRef.trim());
    } finally {
      setProcessing(false);
    }
  };

  const handlePayment = async () => {
    if (paymentMethod.id === 'card') {
      return handleCardPayment();
    }
    return handleManualPayment();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl p-6 w-full max-w-lg max-h-[calc(100vh-2rem)] overflow-y-auto"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Complete Payment</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <FiX size={24} />
          </button>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="flex justify-between mb-2">
            <span className="text-gray-600">Doctor</span>
            <span className="font-medium">{appointment.docData?.name}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="text-gray-600">Date</span>
            <span className="font-medium">{appointment.slotDate}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="text-gray-600">Time</span>
            <span className="font-medium">{appointment.slotTime}</span>
          </div>
          <div className="flex justify-between border-t pt-2 mt-2">
            <span className="font-semibold">Total Amount</span>
            <span className="font-bold text-primary text-lg">Rs.{appointment.amount}</span>
          </div>
        </div>

        <div className="mb-6">
          <p className="font-medium mb-3">Choose payment method</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {PAYMENT_METHODS.map((method) => {
              const Icon = method.icon;
              const selected = paymentMethod.id === method.id;

              return (
                <button
                  key={method.id}
                  type="button"
                  onClick={() => setPaymentMethod(method)}
                  className={`border rounded-lg p-4 text-left transition-all ${
                    selected ? 'border-primary bg-primary/5 shadow-sm' : 'border-gray-200 hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-10 h-10 rounded-lg flex items-center justify-center ${selected ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'}`}>
                      <Icon size={20} />
                    </span>
                    <span>
                      <span className="block font-semibold">{method.label}</span>
                      <span className="block text-xs text-gray-500">{method.detail}</span>
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {paymentMethod.id === 'card' && (
          <div className="mb-6 rounded-2xl border border-gray-200 bg-gray-50 p-5">
            <p className="font-semibold mb-3">Debit/Credit Card</p>
            {!stripeReady ? (
              <p className="text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-lg p-3">
                ⚠️ Running in demo mode — no real card will be charged.
              </p>
            ) : (
              <div className="rounded-xl border border-gray-200 bg-white p-4">
                <CardElement options={CARD_ELEMENT_OPTIONS} />
              </div>
            )}
          </div>
        )}

        {paymentMethod.manual && (
          <div className="mb-6 rounded-2xl border border-gray-200 bg-gray-50 p-5">
            <p className="font-semibold mb-3">Hospital account details</p>
            <div className="space-y-2 text-sm text-gray-700">
              <div className="flex justify-between">
                <span>Account Name</span>
                <span className="font-medium">{HOSPITAL_PAYMENT_DETAILS.accountName}</span>
              </div>
              <div className="flex justify-between">
                <span>Account Number</span>
                <span className="font-medium">{HOSPITAL_PAYMENT_DETAILS.accountNumber}</span>
              </div>
              <div className="flex justify-between">
                <span>Bank / Branch</span>
                <span className="font-medium">{HOSPITAL_PAYMENT_DETAILS.bankName}, {HOSPITAL_PAYMENT_DETAILS.branch}</span>
              </div>
              <div className="flex justify-between">
                <span>IFSC</span>
                <span className="font-medium">{HOSPITAL_PAYMENT_DETAILS.ifsc}</span>
              </div>
              <div className="flex justify-between">
                <span>UPI ID</span>
                <span className="font-medium">{HOSPITAL_PAYMENT_DETAILS.upiId}</span>
              </div>
            </div>

            {paymentMethod.id === 'upi' && (
              <div className="mt-5">
                <p className="font-medium mb-2">Scan to pay</p>
                <img
                  src={getQrCodeUrl()}
                  alt="UPI QR code"
                  className="mx-auto w-40 h-40 rounded-xl border border-gray-200"
                />
              </div>
            )}

            <div className="mt-5">
              <label className="block text-sm font-medium text-gray-700">Transaction reference number</label>
              <input
                value={transactionRef}
                onChange={(e) => setTransactionRef(e.target.value)}
                className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 focus:border-primary focus:outline-none"
                placeholder={
                  paymentMethod.id === 'upi'
                    ? 'Enter UPI transaction reference'
                    : paymentMethod.id === 'netbanking'
                    ? 'Enter netbanking transaction reference'
                    : paymentMethod.id === 'wallet'
                    ? 'Enter wallet transaction reference'
                    : 'Enter bank transfer transaction reference'
                }
              />
            </div>
          </div>
        )}

        <button
          onClick={handlePayment}
          disabled={processing}
          className="w-full btn-primary disabled:opacity-50"
        >
          {processing
            ? 'Processing...'
            : paymentMethod.id === 'card'
            ? 'Pay by Card'
            : `Confirm ${paymentMethod.label} Payment`}
        </button>
      </motion.div>
    </div>
  );
};

const PaymentModal = (props) => (
  <Elements stripe={stripePromise}>
    <PaymentModalContent {...props} />
  </Elements>
);

export default PaymentModal;
