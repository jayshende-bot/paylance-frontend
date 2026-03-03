import { useState } from 'react';
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import Button from '../ui/Button';
import { formatCurrency } from '../../utils/formatCurrency';
import toast from 'react-hot-toast';

export default function CheckoutForm({ amount, currency = 'USD', onSuccess, onError }) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setProcessing(true);
    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment/success`,
        },
        redirect: 'if_required',
      });

      if (error) {
        toast.error(error.message || 'Payment failed');
        onError?.(error);
      } else if (paymentIntent?.status === 'requires_capture') {
        // This is correct for escrow — manual capture
        toast.success('Funds secured in escrow!');
        onSuccess?.(paymentIntent);
      }
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-primary-50 rounded-lg p-4 text-center">
        <p className="text-sm text-gray-600">Amount to escrow</p>
        <p className="text-3xl font-bold text-primary-700">{formatCurrency(amount, currency)}</p>
        <p className="text-xs text-gray-500 mt-1">
          Funds held securely until milestone approved
        </p>
      </div>

      <PaymentElement
        options={{
          layout: 'tabs',
          wallets: { applePay: 'never', googlePay: 'auto' },
        }}
      />

      <Button type="submit" loading={processing} disabled={!stripe || processing} className="w-full">
        Fund Escrow — {formatCurrency(amount, currency)}
      </Button>

      <p className="text-center text-xs text-gray-400">
        Secured by Stripe. Your payment info is never stored on our servers.
      </p>
    </form>
  );
}
