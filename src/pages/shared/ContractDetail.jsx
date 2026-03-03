import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { fetchContract } from '../../api/contractApi';
import { fetchMilestones, createMilestone, submitMilestone, disputeMilestone, releaseMilestone } from '../../api/paymentApi';
import { useAuth } from '../../hooks/useAuth';
import Loader from '../../components/ui/Loader';
import Button from '../../components/ui/Button';
import toast from 'react-hot-toast';
import { formatCurrency } from '../../utils/formatCurrency';
import { timeAgo } from '../../utils/dateHelpers';
import {
  ChevronLeft, User, DollarSign, Calendar, CheckCircle2,
  Clock, AlertTriangle, Plus, Send, Unlock, FileText,
} from 'lucide-react';

// ── Milestone status config ────────────────────────────────────────────────────
const MS_STATUS = {
  pending:   { label: 'Pending',   cls: 'bg-gray-100 text-gray-600' },
  funded:    { label: 'Funded',    cls: 'bg-blue-100 text-blue-700' },
  submitted: { label: 'Submitted', cls: 'bg-amber-100 text-amber-700' },
  released:  { label: 'Released',  cls: 'bg-emerald-100 text-emerald-700' },
  disputed:  { label: 'Disputed',  cls: 'bg-red-100 text-red-700' },
  refunded:  { label: 'Refunded',  cls: 'bg-purple-100 text-purple-700' },
};

// ── Create Milestone form (client) ────────────────────────────────────────────
function CreateMilestoneForm({ contractId, onSuccess }) {
  const [form, setForm] = useState({ title: '', description: '', amount: '', dueDate: '', order: 1 });
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const mutation = useMutation(
    () => createMilestone({ contractId, ...form, amount: Number(form.amount), order: Number(form.order) }),
    {
      onSuccess: () => { toast.success('Milestone created!'); onSuccess(); },
      onError: (err) => toast.error(err.response?.data?.message || 'Failed to create milestone'),
    }
  );

  return (
    <div className="card border-primary-100 animate-fade-in-up">
      <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Plus size={16} className="text-primary-600" /> New Milestone
      </h3>
      <div className="space-y-3">
        <input
          className="input"
          placeholder="Milestone title"
          value={form.title}
          onChange={set('title')}
        />
        <textarea
          rows={2}
          className="input resize-none"
          placeholder="Description (optional)"
          value={form.description}
          onChange={set('description')}
        />
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Amount ($)</label>
            <input type="number" className="input" placeholder="500" value={form.amount} onChange={set('amount')} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Due Date</label>
            <input type="date" className="input" value={form.dueDate} onChange={set('dueDate')} />
          </div>
        </div>
        <Button
          onClick={() => mutation.mutate()}
          loading={mutation.isLoading}
          disabled={!form.title || !form.amount}
          className="w-full"
        >
          Create Milestone
        </Button>
      </div>
    </div>
  );
}

// ── Submit work form (freelancer) ─────────────────────────────────────────────
function SubmitWorkForm({ milestoneId, onSuccess }) {
  const [note, setNote] = useState('');
  const mutation = useMutation(
    () => submitMilestone(milestoneId, { note }),
    {
      onSuccess: () => { toast.success('Work submitted!'); onSuccess(); },
      onError: (err) => toast.error(err.response?.data?.message || 'Failed to submit work'),
    }
  );

  return (
    <div className="mt-3 pt-3 border-t border-gray-50 space-y-2">
      <textarea
        rows={2}
        className="input resize-none text-sm"
        placeholder="Describe what you've delivered..."
        value={note}
        onChange={(e) => setNote(e.target.value)}
      />
      <Button size="sm" onClick={() => mutation.mutate()} loading={mutation.isLoading} disabled={!note}>
        <Send size={13} className="mr-1" /> Submit Work
      </Button>
    </div>
  );
}

// ── Single milestone card ─────────────────────────────────────────────────────
function MilestoneCard({ milestone, isClient, isFreelancer, contractId, onRefresh }) {
  const [showSubmit, setShowSubmit] = useState(false);
  const navigate = useNavigate();

  const releaseMut = useMutation(() => releaseMilestone(milestone._id), {
    onSuccess: () => { toast.success('Payment released to freelancer!'); onRefresh(); },
    onError: (err) => toast.error(err.response?.data?.message || 'Release failed'),
  });

  const disputeMut = useMutation(() => disputeMilestone(milestone._id), {
    onSuccess: () => { toast.success('Dispute opened. Admin will review.'); onRefresh(); },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to open dispute'),
  });

  const st = MS_STATUS[milestone.status] || MS_STATUS.pending;

  return (
    <div className={`card transition-all ${milestone.status === 'released' ? 'opacity-70' : ''}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className={`mt-0.5 w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
            milestone.status === 'released' ? 'bg-emerald-100' : 'bg-gray-100'
          }`}>
            {milestone.status === 'released'
              ? <CheckCircle2 size={14} className="text-emerald-600" />
              : <Clock size={14} className="text-gray-400" />
            }
          </div>
          <div>
            <p className="font-semibold text-sm text-gray-900">{milestone.title}</p>
            {milestone.description && (
              <p className="text-xs text-gray-500 mt-0.5">{milestone.description}</p>
            )}
            {milestone.dueDate && (
              <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                <Calendar size={11} /> Due {timeAgo(milestone.dueDate)}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="font-semibold text-sm text-gray-900">{formatCurrency(milestone.amount)}</span>
          <span className={`badge text-xs ${st.cls}`}>{st.label}</span>
        </div>
      </div>

      {/* Submission note */}
      {milestone.submissions?.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-50">
          <p className="text-xs font-medium text-gray-500 mb-1">Freelancer's note:</p>
          <p className="text-sm text-gray-700">{milestone.submissions[milestone.submissions.length - 1].note}</p>
        </div>
      )}

      {/* Actions */}
      <div className="mt-3 pt-3 border-t border-gray-50 flex flex-wrap gap-2">
        {/* Client: fund pending milestone */}
        {isClient && milestone.status === 'pending' && (
          <Button
            size="sm"
            onClick={() => navigate(`/fund/${milestone._id}`)}
          >
            <DollarSign size={13} className="mr-1" /> Fund Escrow
          </Button>
        )}

        {/* Client: release funded/submitted milestone */}
        {isClient && ['funded', 'submitted'].includes(milestone.status) && (
          <>
            <Button
              size="sm"
              onClick={() => releaseMut.mutate()}
              loading={releaseMut.isLoading}
            >
              <Unlock size={13} className="mr-1" /> Release Payment
            </Button>
            <Button
              size="sm"
              variant="danger"
              onClick={() => disputeMut.mutate()}
              loading={disputeMut.isLoading}
            >
              <AlertTriangle size={13} className="mr-1" /> Dispute
            </Button>
          </>
        )}

        {/* Freelancer: submit funded milestone */}
        {isFreelancer && milestone.status === 'funded' && (
          <Button size="sm" variant="secondary" onClick={() => setShowSubmit((v) => !v)}>
            <FileText size={13} className="mr-1" /> {showSubmit ? 'Cancel' : 'Submit Work'}
          </Button>
        )}
      </div>

      {showSubmit && (
        <SubmitWorkForm
          milestoneId={milestone._id}
          onSuccess={() => { setShowSubmit(false); onRefresh(); }}
        />
      )}
    </div>
  );
}

// ── Main ContractDetail page ───────────────────────────────────────────────────
export default function ContractDetail() {
  const { id } = useParams();
  const { isClient, isFreelancer } = useAuth();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const queryClient = useQueryClient();

  const { data: contract, isLoading: contractLoading } = useQuery(
    ['contract', id],
    () => fetchContract(id).then((r) => r.data.data.contract),
    { refetchOnWindowFocus: false }
  );

  const { data: milestones = [], isLoading: msLoading, refetch: refetchMs } = useQuery(
    ['milestones', id],
    () => fetchMilestones(id).then((r) => r.data.data.milestones),
    { refetchOnWindowFocus: false }
  );

  if (contractLoading) return <Loader />;
  if (!contract) return <div className="card text-center py-20 text-gray-400">Contract not found.</div>;

  const handleMilestoneRefresh = () => {
    refetchMs();
    queryClient.invalidateQueries(['contract', id]);
  };

  const completedMs = milestones.filter((m) => m.status === 'released').length;
  const progress = milestones.length > 0 ? Math.round((completedMs / milestones.length) * 100) : 0;

  return (
    <div className="max-w-4xl mx-auto">
      <button
        onClick={() => window.history.back()}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-5 transition-colors"
      >
        <ChevronLeft size={16} /> Back to Contracts
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Left: Milestones ── */}
        <div className="lg:col-span-2 space-y-5">
          {/* Contract header */}
          <div className="card animate-fade-in-up">
            <div className="flex items-start justify-between gap-4 mb-3">
              <h1 className="text-xl font-bold text-gray-900 leading-snug">{contract.title}</h1>
              <span className={`badge flex-shrink-0 ${
                contract.status === 'active'    ? 'bg-emerald-100 text-emerald-700' :
                contract.status === 'completed' ? 'bg-blue-100 text-blue-700'      :
                contract.status === 'disputed'  ? 'bg-red-100 text-red-700'        :
                'bg-gray-100 text-gray-500'
              }`}>
                {contract.status.charAt(0).toUpperCase() + contract.status.slice(1)}
              </span>
            </div>

            {/* Progress bar */}
            {milestones.length > 0 && (
              <div>
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>{completedMs} / {milestones.length} milestones released</span>
                  <span>{progress}%</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary-500 to-indigo-500 rounded-full transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Milestones */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-gray-900">
                Milestones {milestones.length > 0 && <span className="text-gray-400 font-normal">({milestones.length})</span>}
              </h2>
              {isClient && contract.status === 'active' && (
                <button
                  onClick={() => setShowCreateForm((v) => !v)}
                  className="flex items-center gap-1 text-sm text-primary-600 hover:text-primary-800 font-medium"
                >
                  <Plus size={15} /> {showCreateForm ? 'Cancel' : 'Add Milestone'}
                </button>
              )}
            </div>

            {showCreateForm && (
              <CreateMilestoneForm
                contractId={id}
                onSuccess={() => { setShowCreateForm(false); handleMilestoneRefresh(); }}
              />
            )}

            {msLoading ? <Loader /> : milestones.length === 0 ? (
              <div className="card text-center py-10 text-gray-400">
                <Clock size={28} className="mx-auto mb-3 text-gray-200" />
                <p className="text-sm">
                  {isClient ? 'Add a milestone to get started.' : 'Waiting for client to create milestones.'}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {milestones.map((m) => (
                  <MilestoneCard
                    key={m._id}
                    milestone={m}
                    isClient={isClient}
                    isFreelancer={isFreelancer}
                    contractId={id}
                    onRefresh={handleMilestoneRefresh}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Right: Contract info ── */}
        <div className="space-y-4">
          {/* Total */}
          <div className="card animate-fade-in-up stat-card-green">
            <p className="text-xs text-gray-500 mb-1">Contract Value</p>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(contract.totalAmount)}</p>
          </div>

          {/* Parties */}
          <div className="card animate-fade-in-up animate-delay-100">
            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Parties</h4>
            {[
              { label: 'Client', person: contract.client },
              { label: 'Freelancer', person: contract.freelancer },
            ].map(({ label, person }) => (
              <div key={label} className="flex items-center gap-3 mb-3 last:mb-0">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-indigo-500 flex items-center justify-center flex-shrink-0">
                  {person?.avatar
                    ? <img src={person.avatar} alt="" className="w-8 h-8 rounded-full object-cover" />
                    : <User size={13} className="text-white" />
                  }
                </div>
                <div>
                  <p className="text-xs text-gray-400">{label}</p>
                  <p className="text-sm font-semibold text-gray-900">{person?.name}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Job link */}
          {contract.job && (
            <div className="card animate-fade-in-up animate-delay-200">
              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Job</h4>
              <Link
                to={`/jobs/${contract.job._id}`}
                className="text-sm font-medium text-primary-600 hover:text-primary-800 flex items-center gap-1"
              >
                <FileText size={13} /> {contract.job.title}
              </Link>
              {contract.job.category && (
                <p className="text-xs text-gray-400 mt-1">{contract.job.category}</p>
              )}
            </div>
          )}

          {/* Started */}
          <div className="card animate-fade-in-up animate-delay-200">
            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Started</h4>
            <p className="text-sm text-gray-700">{timeAgo(contract.createdAt)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
