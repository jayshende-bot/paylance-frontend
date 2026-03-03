import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useMutation } from 'react-query';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { fundEscrow } from '../../api/paymentApi';
import CheckoutForm from '../../components/payment/CheckoutForm';
import Loader from '../../components/ui/Loader';
import { Shield, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

export default function FundEscrow() {
  const { milestoneId } = useParams();
  const [clientSecret, setClientSecret] = useState(null);
  const [amount, setAmount] = useState(null);
  const [devFunded, setDevFunded] = useState(false);

  const fundMutation = useMutation(
    () => fundEscrow(milestoneId).then((r) => r.data.data),
    {
      onSuccess: (data) => {
        if (data.devBypass) {
          // Dev mode: Stripe skipped, milestone already marked funded
          toast.success('Milestone funded! (dev mode — no real payment)');
          setDevFunded(true);
          setTimeout(() => { window.location.href = '/contracts'; }, 1500);
        } else {
          setClientSecret(data.clientSecret);
          setAmount(data.amount);
        }
      },
      onError: (err) => toast.error(err.response?.data?.message || 'Failed to initiate payment'),
    }
  );

  if (devFunded) {
    return (
      <div className="max-w-lg mx-auto">
        <div className="card text-center py-10">
          <CheckCircle size={48} className="text-emerald-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Milestone Funded!</h2>
          <p className="text-gray-500 text-sm">Redirecting to contracts...</p>
        </div>
      </div>
    );
  }

  if (!clientSecret && !fundMutation.isLoading) {
    return (
      <div className="max-w-lg mx-auto">
        <div className="card text-center">
          <Shield size={48} className="text-primary-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Fund Milestone Escrow</h2>
          <p className="text-gray-500 mb-6">
            Your payment will be held securely until you approve the freelancer's work.
          </p>
          <button
            onClick={() => fundMutation.mutate()}
            className="btn-primary w-full"
          >
            Proceed to Payment
          </button>
        </div>
      </div>
    );
  }

  if (fundMutation.isLoading) return <Loader text="Preparing payment..." />;

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-6">Fund Milestone</h1>
      {clientSecret && (
        <div className="card">
          <Elements stripe={stripePromise} options={{ clientSecret }}>
            <CheckoutForm
              amount={amount}
              onSuccess={() => window.location.href = '/contracts'}
            />
          </Elements>
        </div>
      )}
    </div>
  );
}
