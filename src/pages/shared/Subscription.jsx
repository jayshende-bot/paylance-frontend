import { useMutation, useQuery } from 'react-query';
import { createSubscription, cancelSubscription, getSubscriptionStatus } from '../../api/paymentApi';
import { useAuth } from '../../hooks/useAuth';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { CheckCircle, Star } from 'lucide-react';
import toast from 'react-hot-toast';

const proFeatures = [
  'Unlimited proposals per month',
  'Featured profile listing',
  'Priority in search results',
  'Advanced analytics & insights',
  'Custom portfolio page',
  'Direct client messaging',
];

export default function Subscription() {
  const { user, isPro } = useAuth();

  const { data, refetch } = useQuery('subscription-status', () =>
    getSubscriptionStatus().then((r) => r.data.data)
  );

  const subscribeMutation = useMutation(() => createSubscription(), {
    onSuccess: () => {
      toast.success('Pro subscription activated!');
      refetch();
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Subscription failed'),
  });

  const cancelMutation = useMutation(() => cancelSubscription(), {
    onSuccess: () => {
      toast.success('Subscription cancelled. Access until end of billing period.');
      refetch();
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Cancellation failed'),
  });

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Subscription Plans</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Free */}
        <div className="card border-2 border-gray-200">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="font-bold text-lg">Free</h3>
              <p className="text-3xl font-bold mt-2">$0<span className="text-sm font-normal text-gray-500">/mo</span></p>
            </div>
            {!isPro && <Badge status="free">Current</Badge>}
          </div>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-center gap-2"><CheckCircle size={14} className="text-green-500" /> 5 proposals/month</li>
            <li className="flex items-center gap-2"><CheckCircle size={14} className="text-green-500" /> Basic profile</li>
            <li className="flex items-center gap-2"><CheckCircle size={14} className="text-green-500" /> Standard support</li>
          </ul>
        </div>

        {/* Pro */}
        <div className="card border-2 border-primary-500 relative">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary-600 text-white text-xs font-bold px-3 py-1 rounded-full">
            MOST POPULAR
          </div>
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="font-bold text-lg flex items-center gap-2">
                Pro <Star size={16} className="text-yellow-500 fill-yellow-400" />
              </h3>
              <p className="text-3xl font-bold mt-2">$29<span className="text-sm font-normal text-gray-500">/mo</span></p>
            </div>
            {isPro && <Badge status="pro">Active</Badge>}
          </div>
          <ul className="space-y-2 text-sm text-gray-600 mb-6">
            {proFeatures.map((f) => (
              <li key={f} className="flex items-center gap-2">
                <CheckCircle size={14} className="text-primary-500 flex-shrink-0" /> {f}
              </li>
            ))}
          </ul>

          {!isPro ? (
            <Button className="w-full" loading={subscribeMutation.isLoading} onClick={() => subscribeMutation.mutate()}>
              Upgrade to Pro
            </Button>
          ) : (
            <Button
              variant="danger"
              size="sm"
              className="w-full"
              loading={cancelMutation.isLoading}
              onClick={() => cancelMutation.mutate()}
            >
              Cancel Subscription
            </Button>
          )}
        </div>
      </div>

      {data?.subscription && (
        <div className="card text-sm text-gray-600">
          <p><strong>Status:</strong> {data.subscription.status}</p>
          {data.subscription.currentPeriodEnd && (
            <p><strong>Next billing:</strong> {new Date(data.subscription.currentPeriodEnd).toLocaleDateString()}</p>
          )}
        </div>
      )}
    </div>
  );
}
