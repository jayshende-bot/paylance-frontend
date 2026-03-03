import { useQuery } from 'react-query';
import { fetchPaymentHistory } from '../../api/paymentApi';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/dateHelpers';
import Badge from '../ui/Badge';
import Loader from '../ui/Loader';

const typeLabels = {
  escrow_fund: 'Escrow Funded',
  milestone_release: 'Payment Released',
  refund: 'Refund',
  subscription: 'Subscription',
  payout: 'Payout',
};

export default function PaymentHistory() {
  const { data, isLoading } = useQuery('payment-history', () =>
    fetchPaymentHistory().then((r) => r.data.data)
  );

  if (isLoading) return <Loader />;

  const transactions = data?.transactions || [];

  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-4">Payment History</h3>
      {transactions.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No transactions yet</p>
      ) : (
        <div className="space-y-3">
          {transactions.map((tx) => (
            <div key={tx._id} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
              <div>
                <p className="font-medium text-sm">{typeLabels[tx.type] || tx.type}</p>
                {tx.milestone && (
                  <p className="text-xs text-gray-500">{tx.milestone.title}</p>
                )}
                <p className="text-xs text-gray-400">{formatDate(tx.createdAt)}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-sm">{formatCurrency(tx.netAmount, tx.currency)}</p>
                {tx.platformFee > 0 && (
                  <p className="text-xs text-gray-400">Fee: {formatCurrency(tx.platformFee)}</p>
                )}
                <Badge status={tx.status} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
