import { Shield, Clock, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { clsx } from 'clsx';

const statusConfig = {
  pending: { icon: Clock, label: 'Awaiting Funding', color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200' },
  funded: { icon: Shield, label: 'Funds in Escrow', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
  submitted: { icon: Clock, label: 'Work Submitted', color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200' },
  approved: { icon: CheckCircle, label: 'Approved', color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' },
  released: { icon: CheckCircle, label: 'Payment Released', color: 'text-green-700', bg: 'bg-green-50', border: 'border-green-200' },
  disputed: { icon: AlertTriangle, label: 'Disputed', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' },
  refunded: { icon: XCircle, label: 'Refunded', color: 'text-gray-600', bg: 'bg-gray-50', border: 'border-gray-200' },
};

export default function EscrowBadge({ status, amount }) {
  const cfg = statusConfig[status] || statusConfig.pending;
  const Icon = cfg.icon;

  return (
    <div className={clsx('flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium', cfg.bg, cfg.border, cfg.color)}>
      <Icon size={16} />
      <span>{cfg.label}</span>
      {amount && <span className="ml-1 font-bold">${amount}</span>}
    </div>
  );
}
