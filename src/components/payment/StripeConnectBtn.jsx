import { CreditCard, CheckCircle, ExternalLink } from 'lucide-react';
import Button from '../ui/Button';
import { useStripeConnect } from '../../hooks/useStripeConnect';

export default function StripeConnectBtn() {
  const { isVerified, chargesEnabled, payoutsEnabled, startOnboarding, isOnboarding } = useStripeConnect();

  if (isVerified) {
    return (
      <div className="flex items-center gap-2 text-green-600 font-medium">
        <CheckCircle size={18} />
        <span>Stripe Connected & Verified</span>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {chargesEnabled === false && (
        <p className="text-sm text-yellow-700 bg-yellow-50 p-3 rounded-lg">
          Your Stripe account needs additional verification before you can receive payments.
        </p>
      )}
      <Button
        onClick={startOnboarding}
        loading={isOnboarding}
        icon={<CreditCard size={16} />}
      >
        {chargesEnabled ? 'Complete Verification' : 'Connect Stripe Account'}
        <ExternalLink size={14} />
      </Button>
    </div>
  );
}
