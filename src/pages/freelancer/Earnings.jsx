import { useState } from 'react';
import { useQuery, useMutation } from 'react-query';
import { fetchFreelancerAnalytics } from '../../api/analyticsApi';
import { triggerPayout } from '../../api/paymentApi';
import PaymentHistory from '../../components/payment/PaymentHistory';
import { formatCurrency } from '../../utils/formatCurrency';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Loader from '../../components/ui/Loader';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';

export default function Earnings() {
  const { user } = useAuth();
  const [payoutModal, setPayoutModal] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState('');

  const { data, isLoading } = useQuery('freelancer-analytics', () =>
    fetchFreelancerAnalytics().then((r) => r.data.data)
  );

  const payoutMutation = useMutation(
    (amount) => triggerPayout(amount),
    {
      onSuccess: () => {
        toast.success('Payout initiated! Arrives in 2-3 business days.');
        setPayoutModal(false);
      },
      onError: (err) => toast.error(err.response?.data?.message || 'Payout failed'),
    }
  );

  if (isLoading) return <Loader />;

  const chartData = (data?.monthlyEarnings || []).map((m) => ({
    name: `${m._id.month}/${m._id.year}`,
    earnings: m.total,
    count: m.count,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Earnings</h1>
        <Button onClick={() => setPayoutModal(true)} disabled={!user?.stripeAccountVerified || (user?.earnings?.pending || 0) <= 0}>
          Request Payout
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Total Earned', value: formatCurrency(data?.totalEarned || 0), color: 'text-green-600' },
          { label: 'Pending Payout', value: formatCurrency(user?.earnings?.pending || 0), color: 'text-yellow-600' },
          { label: 'Total Withdrawn', value: formatCurrency(user?.earnings?.withdrawn || 0), color: 'text-blue-600' },
        ].map(({ label, value, color }) => (
          <div key={label} className="card text-center">
            <p className="text-sm text-gray-500 mb-1">{label}</p>
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      <div className="card">
        <h3 className="font-semibold mb-4">Monthly Earnings Chart</h3>
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `$${v}`} />
            <Tooltip formatter={(v) => formatCurrency(v)} />
            <Area type="monotone" dataKey="earnings" stroke="#6366f1" fill="#e0e7ff" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <PaymentHistory />

      <Modal isOpen={payoutModal} onClose={() => setPayoutModal(false)} title="Request Payout">
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Available: <strong>{formatCurrency(user?.earnings?.pending || 0)}</strong>
          </p>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Payout Amount ($)</label>
            <input
              type="number"
              className="input"
              value={payoutAmount}
              onChange={(e) => setPayoutAmount(e.target.value)}
              placeholder="Enter amount"
              max={user?.earnings?.pending || 0}
            />
          </div>
          <Button
            className="w-full"
            loading={payoutMutation.isLoading}
            onClick={() => payoutMutation.mutate(Number(payoutAmount))}
          >
            Request Payout
          </Button>
        </div>
      </Modal>
    </div>
  );
}
