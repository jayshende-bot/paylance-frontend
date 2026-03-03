import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import StripeConnectBtn from '../../components/payment/StripeConnectBtn';
import { useStripeConnect } from '../../hooks/useStripeConnect';
import { CheckCircle, AlertCircle, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';

export default function StripeOnboarding() {
  const [searchParams] = useSearchParams();
  const { isVerified, chargesEnabled, payoutsEnabled, requirements, refetchStatus } = useStripeConnect();

  useEffect(() => {
    const returned = searchParams.get('returned');
    if (returned === 'true') {
      refetchStatus();
      toast.success('Stripe account updated! Checking verification status...');
    }
  }, [searchParams, refetchStatus]);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Stripe Account Setup</h1>

      <div className="card">
        <h2 className="font-semibold mb-4">Account Status</h2>
        <div className="space-y-3">
          {[
            { label: 'Accept Payments', ok: chargesEnabled },
            { label: 'Receive Payouts', ok: payoutsEnabled },
            { label: 'Fully Verified', ok: isVerified },
          ].map(({ label, ok }) => (
            <div key={label} className="flex items-center gap-3">
              {ok
                ? <CheckCircle size={18} className="text-green-500" />
                : <AlertCircle size={18} className="text-yellow-500" />}
              <span className="text-sm font-medium">{label}</span>
              <span className={`text-xs font-medium ${ok ? 'text-green-600' : 'text-yellow-600'}`}>
                {ok ? 'Enabled' : 'Pending'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {!isVerified && (
        <div className="card">
          <h2 className="font-semibold mb-2">Complete Verification</h2>
          <p className="text-sm text-gray-500 mb-4">
            Connect your Stripe account to start receiving payments. You'll need to provide your bank account details and identity verification.
          </p>
          <StripeConnectBtn />
        </div>
      )}

      {isVerified && (
        <div className="card bg-green-50 border border-green-100">
          <div className="flex items-center gap-3">
            <CheckCircle size={24} className="text-green-600" />
            <div>
              <h3 className="font-semibold text-green-800">Account Verified!</h3>
              <p className="text-sm text-green-700">You can now receive milestone payments and payouts.</p>
            </div>
          </div>
        </div>
      )}

      <div className="card">
        <h2 className="font-semibold mb-3">How Payments Work</h2>
        <ol className="space-y-3 text-sm text-gray-600">
          {[
            'Client funds a milestone → money held securely in escrow by Stripe',
            'You submit your work for client review',
            'Client approves → 90% transferred to your Stripe account (10% platform fee)',
            'Stripe pays out to your bank account automatically',
          ].map((step, i) => (
            <li key={i} className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-xs font-bold">
                {i + 1}
              </span>
              {step}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
