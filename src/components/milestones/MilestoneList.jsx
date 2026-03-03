import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { fetchMilestones, submitMilestone, releaseMilestone } from '../../api/paymentApi';
import EscrowBadge from '../payment/EscrowBadge';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import Loader from '../ui/Loader';
import { formatCurrency } from '../../utils/formatCurrency';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';

export default function MilestoneList({ contractId, clientSecret, onFundNeeded }) {
  const queryClient = useQueryClient();
  const { isClient, isFreelancer } = useAuth();
  const [submitModal, setSubmitModal] = useState(null);
  const [note, setNote] = useState('');

  const { data, isLoading } = useQuery(
    ['milestones', contractId],
    () => fetchMilestones(contractId).then((r) => r.data.data.milestones)
  );

  const releaseMutation = useMutation(
    (milestoneId) => releaseMilestone(milestoneId),
    {
      onSuccess: () => {
        toast.success('Payment released to freelancer!');
        queryClient.invalidateQueries(['milestones', contractId]);
      },
      onError: (err) => toast.error(err.response?.data?.message || 'Release failed'),
    }
  );

  const submitMutation = useMutation(
    ({ milestoneId, note }) => submitMilestone(milestoneId, { note }),
    {
      onSuccess: () => {
        toast.success('Work submitted for review!');
        setSubmitModal(null);
        setNote('');
        queryClient.invalidateQueries(['milestones', contractId]);
      },
    }
  );

  if (isLoading) return <Loader size="sm" />;

  const milestones = data || [];

  return (
    <div className="space-y-4">
      {milestones.length === 0 && (
        <p className="text-gray-500 text-center py-8">No milestones created yet.</p>
      )}

      {milestones.map((m) => (
        <div key={m._id} className="card">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h4 className="font-semibold text-gray-900">{m.title}</h4>
              {m.description && <p className="text-sm text-gray-500 mt-1">{m.description}</p>}
            </div>
            <EscrowBadge status={m.status} />
          </div>

          <div className="text-2xl font-bold text-primary-700 mb-4">
            {formatCurrency(m.amount, m.currency)}
          </div>

          {/* Actions */}
          <div className="flex gap-3 flex-wrap">
            {isClient && m.status === 'pending' && (
              <Button size="sm" onClick={() => onFundNeeded(m._id)}>
                Fund Escrow
              </Button>
            )}
            {isClient && m.status === 'submitted' && (
              <Button
                size="sm"
                onClick={() => releaseMutation.mutate(m._id)}
                loading={releaseMutation.isLoading}
              >
                Approve & Release Payment
              </Button>
            )}
            {isFreelancer && m.status === 'funded' && (
              <Button size="sm" variant="outline" onClick={() => setSubmitModal(m._id)}>
                Submit Work
              </Button>
            )}
            {m.status === 'released' && (
              <a
                href={`/api/v1/invoices/${m._id}`}
                target="_blank"
                rel="noreferrer"
                className="btn-outline text-sm px-3 py-1.5"
              >
                Download Invoice
              </a>
            )}
          </div>
        </div>
      ))}

      <Modal isOpen={!!submitModal} onClose={() => setSubmitModal(null)} title="Submit Work">
        <div className="space-y-4">
          <textarea
            className="input h-32 resize-none"
            placeholder="Describe what you've completed..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
          <Button
            className="w-full"
            loading={submitMutation.isLoading}
            onClick={() => submitMutation.mutate({ milestoneId: submitModal, note })}
          >
            Submit for Review
          </Button>
        </div>
      </Modal>
    </div>
  );
}
