import { useState } from 'react';
import { useQuery } from 'react-query';
import { fetchPaymentHistory } from '../../api/paymentApi';
import { useAuth } from '../../hooks/useAuth';
import Loader from '../../components/ui/Loader';
import { formatCurrency } from '../../utils/formatCurrency';
import { timeAgo } from '../../utils/dateHelpers';
import { ArrowDownLeft, ArrowUpRight, RefreshCw, Receipt, ChevronLeft, ChevronRight } from 'lucide-react';

// ── Transaction type config ────────────────────────────────────────────────────
const TYPE_CONFIG = {
  milestone_release: {
    label: 'Milestone Release',
    icon: ArrowUpRight,
    clientCls: 'text-red-600',
    freelancerCls: 'text-emerald-600',
    clientSign: '-',
    freelancerSign: '+',
  },
  refund: {
    label: 'Refund',
    icon: RefreshCw,
    clientCls: 'text-emerald-600',
    freelancerCls: 'text-red-600',
    clientSign: '+',
    freelancerSign: '-',
  },
  subscription: {
    label: 'Subscription',
    icon: Receipt,
    clientCls: 'text-red-600',
    freelancerCls: 'text-red-600',
    clientSign: '-',
    freelancerSign: '-',
  },
};

const FILTERS = [
  { label: 'All', value: '' },
  { label: 'Payments', value: 'milestone_release' },
  { label: 'Refunds', value: 'refund' },
  { label: 'Subscriptions', value: 'subscription' },
];

// ── Transaction row ────────────────────────────────────────────────────────────
function TxRow({ tx, userId }) {
  const cfg = TYPE_CONFIG[tx.type] || { label: tx.type, icon: Receipt, clientCls: 'text-gray-600', clientSign: '' };
  const isReceiver = tx.to?._id === userId || tx.to === userId;
  const Icon = cfg.icon;

  const amountCls = isReceiver ? 'text-emerald-600' : 'text-red-600';
  const sign = isReceiver ? '+' : '-';
  const displayAmount = tx.netAmount ?? tx.amount;

  return (
    <div className="flex items-center justify-between gap-4 py-3.5 border-b border-gray-50 last:border-0">
      <div className="flex items-center gap-3">
        <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
          isReceiver ? 'bg-emerald-50' : 'bg-red-50'
        }`}>
          <Icon size={15} className={isReceiver ? 'text-emerald-600' : 'text-red-500'} />
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-900">{cfg.label}</p>
          {tx.description && (
            <p className="text-xs text-gray-400 mt-0.5 max-w-xs truncate">{tx.description}</p>
          )}
          <p className="text-xs text-gray-400 mt-0.5">
            {isReceiver
              ? `From ${tx.from?.name || 'Client'}`
              : `To ${tx.to?.name || 'Freelancer'}`
            }
            {' · '}{timeAgo(tx.createdAt)}
          </p>
        </div>
      </div>

      <div className="text-right flex-shrink-0">
        <p className={`font-bold text-sm ${amountCls}`}>
          {sign}{formatCurrency(displayAmount)}
        </p>
        {tx.platformFee > 0 && !isReceiver && (
          <p className="text-xs text-gray-400">Fee: {formatCurrency(tx.platformFee)}</p>
        )}
        <p className={`text-xs mt-0.5 ${
          tx.status === 'completed' ? 'text-emerald-500' :
          tx.status === 'pending'   ? 'text-amber-500'   : 'text-gray-400'
        }`}>
          {tx.status}
        </p>
      </div>
    </div>
  );
}

// ── Main PaymentHistory page ───────────────────────────────────────────────────
export default function PaymentHistory() {
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState('');
  const LIMIT = 15;

  const { data, isLoading } = useQuery(
    ['paymentHistory', page, typeFilter],
    () => fetchPaymentHistory({ page, limit: LIMIT, ...(typeFilter && { type: typeFilter }) })
      .then((r) => r.data.data),
    { keepPreviousData: true }
  );

  const transactions = data?.transactions || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / LIMIT);

  // Summary stats from current page
  const received = transactions
    .filter((tx) => tx.to?._id === user?._id || tx.to === user?._id)
    .reduce((sum, tx) => sum + (tx.netAmount ?? tx.amount), 0);

  const sent = transactions
    .filter((tx) => tx.from?._id === user?._id || tx.from === user?._id)
    .reduce((sum, tx) => sum + (tx.amount ?? 0), 0);

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payment History</h1>
          <p className="text-sm text-gray-400 mt-0.5">{total} transaction{total !== 1 ? 's' : ''} total</p>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="card stat-card-green animate-fade-in-up">
          <div className="flex items-center gap-2 mb-1">
            <ArrowDownLeft size={15} className="text-emerald-600" />
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Received</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(received)}</p>
          <p className="text-xs text-gray-400 mt-1">This page</p>
        </div>
        <div className="card stat-card-blue animate-fade-in-up animate-delay-100">
          <div className="flex items-center gap-2 mb-1">
            <ArrowUpRight size={15} className="text-blue-600" />
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Sent</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(sent)}</p>
          <p className="text-xs text-gray-400 mt-1">This page</p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => { setTypeFilter(f.value); setPage(1); }}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              typeFilter === f.value
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Transaction list */}
      <div className="card animate-fade-in-up">
        {isLoading ? (
          <Loader />
        ) : transactions.length === 0 ? (
          <div className="text-center py-14">
            <Receipt size={36} className="text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No transactions yet</p>
            <p className="text-gray-400 text-sm mt-1">
              Transactions will appear here once payments are made.
            </p>
          </div>
        ) : (
          <div>
            {transactions.map((tx) => (
              <TxRow key={tx._id} tx={tx} userId={user?._id} />
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-gray-400">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
