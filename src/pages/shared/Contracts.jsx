import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { fetchContracts } from '../../api/contractApi';
import { useAuth } from '../../hooks/useAuth';
import Loader from '../../components/ui/Loader';
import { formatCurrency } from '../../utils/formatCurrency';
import { timeAgo } from '../../utils/dateHelpers';
import { Briefcase, User, ChevronRight, FileText } from 'lucide-react';

const STATUS_STYLES = {
  active:    'bg-emerald-100 text-emerald-700',
  completed: 'bg-blue-100 text-blue-700',
  disputed:  'bg-red-100 text-red-700',
  cancelled: 'bg-gray-100 text-gray-500',
};

export default function Contracts() {
  const { isClient } = useAuth();
  const { data, isLoading } = useQuery('contracts', fetchContracts, {
    select: (r) => r.data.data.contracts,
  });

  if (isLoading) return <Loader />;

  const contracts = data || [];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Contracts</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {contracts.length} active contract{contracts.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {contracts.length === 0 ? (
        <div className="card text-center py-16">
          <FileText size={40} className="text-gray-200 mx-auto mb-4" />
          <p className="text-gray-500 font-medium">No contracts yet</p>
          <p className="text-gray-400 text-sm mt-1">
            {isClient
              ? 'Post a job and accept a proposal to get started.'
              : 'Apply to jobs to start working on contracts.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {contracts.map((c) => {
            const other = isClient ? c.freelancer : c.client;
            return (
              <Link
                key={c._id}
                to={`/contracts/${c._id}`}
                className="card flex items-center justify-between gap-4 hover:shadow-md transition-shadow group"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-indigo-500 flex items-center justify-center flex-shrink-0">
                    {other?.avatar
                      ? <img src={other.avatar} alt="" className="w-10 h-10 rounded-full object-cover" />
                      : <User size={16} className="text-white" />
                    }
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors truncate">
                      {c.title}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-2">
                      <span className="flex items-center gap-1">
                        <Briefcase size={11} /> {c.job?.category || 'Contract'}
                      </span>
                      <span>·</span>
                      <span>{isClient ? 'with' : 'for'} {other?.name}</span>
                      <span>·</span>
                      <span>{timeAgo(c.createdAt)}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 flex-shrink-0">
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-semibold text-gray-900">{formatCurrency(c.totalAmount)}</p>
                    <p className="text-xs text-gray-400">{c.milestones?.length || 0} milestones</p>
                  </div>
                  <span className={`badge text-xs ${STATUS_STYLES[c.status] || STATUS_STYLES.cancelled}`}>
                    {c.status.charAt(0).toUpperCase() + c.status.slice(1)}
                  </span>
                  <ChevronRight size={16} className="text-gray-300 group-hover:text-primary-400 transition-colors" />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
