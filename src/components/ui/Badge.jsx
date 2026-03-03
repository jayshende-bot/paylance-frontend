import { clsx } from 'clsx';

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  funded: 'bg-blue-100 text-blue-800',
  submitted: 'bg-purple-100 text-purple-800',
  approved: 'bg-green-100 text-green-800',
  released: 'bg-success-100 text-green-800',
  disputed: 'bg-danger-100 text-red-800',
  refunded: 'bg-gray-100 text-gray-700',
  active: 'bg-green-100 text-green-800',
  completed: 'bg-blue-100 text-blue-800',
  cancelled: 'bg-gray-100 text-gray-600',
  open: 'bg-green-100 text-green-800',
  in_progress: 'bg-blue-100 text-blue-800',
  pro: 'bg-primary-100 text-primary-700',
  free: 'bg-gray-100 text-gray-600',
  client: 'bg-orange-100 text-orange-700',
  freelancer: 'bg-indigo-100 text-indigo-700',
};

export default function Badge({ children, status, className }) {
  return (
    <span className={clsx('badge', statusColors[status] || 'bg-gray-100 text-gray-700', className)}>
      {children || status?.replace(/_/g, ' ')}
    </span>
  );
}
