import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { fetchJob, submitProposal, acceptProposal } from '../../api/jobApi';
import { useAuth } from '../../hooks/useAuth';
import Loader from '../../components/ui/Loader';
import Button from '../../components/ui/Button';
import toast from 'react-hot-toast';
import {
  DollarSign, Clock, Briefcase, User, MapPin,
  CheckCircle, Send, ChevronLeft, Eye, Star,
} from 'lucide-react';
import { formatCurrency } from '../../utils/formatCurrency';
import { timeAgo } from '../../utils/dateHelpers';

// ── Proposal submission form (freelancer) ─────────────────────────────────────
function ProposalForm({ jobId, onSuccess }) {
  const [bidAmount, setBidAmount] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [deliveryDays, setDeliveryDays] = useState('');

  const mutation = useMutation(
    () => submitProposal(jobId, {
      bidAmount: Number(bidAmount),
      coverLetter,
      deliveryDays: Number(deliveryDays),
    }),
    {
      onSuccess: () => {
        toast.success('Proposal submitted successfully!');
        onSuccess();
      },
      onError: (err) => toast.error(err.response?.data?.message || 'Failed to submit proposal'),
    }
  );

  return (
    <div className="card border-primary-100 animate-fade-in-up">
      <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Send size={16} className="text-primary-600" /> Submit a Proposal
      </h3>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Your Bid ($)</label>
            <input
              type="number"
              className="input"
              placeholder="e.g. 800"
              value={bidAmount}
              onChange={(e) => setBidAmount(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Delivery (days)</label>
            <input
              type="number"
              className="input"
              placeholder="e.g. 14"
              value={deliveryDays}
              onChange={(e) => setDeliveryDays(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Cover Letter</label>
          <textarea
            rows={5}
            className="input resize-none"
            placeholder="Introduce yourself, explain your approach, and why you're the right fit..."
            value={coverLetter}
            onChange={(e) => setCoverLetter(e.target.value)}
          />
        </div>

        <Button
          onClick={() => mutation.mutate()}
          loading={mutation.isLoading}
          disabled={!bidAmount || !coverLetter || !deliveryDays}
          className="w-full"
        >
          Submit Proposal
        </Button>
      </div>
    </div>
  );
}

// ── Proposals list (client view) ──────────────────────────────────────────────
function ProposalsList({ proposals, jobId, jobStatus }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const acceptMutation = useMutation(
    (proposalId) => acceptProposal(jobId, proposalId),
    {
      onSuccess: (res) => {
        toast.success('Proposal accepted! Contract created.');
        queryClient.invalidateQueries(['job', jobId]);
        navigate(`/contracts/${res.data.data.contract._id}`);
      },
      onError: (err) => toast.error(err.response?.data?.message || 'Failed to accept proposal'),
    }
  );

  if (!proposals?.length) {
    return (
      <div className="card text-center py-10 animate-fade-in-up">
        <User size={32} className="text-gray-200 mx-auto mb-3" />
        <p className="text-gray-400 text-sm">No proposals yet. Check back soon.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 animate-fade-in-up">
      <h3 className="font-semibold text-gray-900">{proposals.length} Proposal{proposals.length !== 1 ? 's' : ''}</h3>
      {proposals.map((p) => (
        <div key={p._id} className={`card transition-all ${p.status === 'accepted' ? 'border-emerald-200 bg-emerald-50/30' : ''}`}>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-indigo-500 flex items-center justify-center flex-shrink-0">
                {p.freelancer?.avatar
                  ? <img src={p.freelancer.avatar} alt="" className="w-10 h-10 rounded-full object-cover" />
                  : <User size={16} className="text-white" />
                }
              </div>
              <div>
                <div className="font-semibold text-sm text-gray-900">{p.freelancer?.name || 'Freelancer'}</div>
                <div className="text-xs text-gray-500 flex items-center gap-2 mt-0.5">
                  <span className="flex items-center gap-1"><DollarSign size={11} />{formatCurrency(p.bidAmount)}</span>
                  <span>·</span>
                  <span className="flex items-center gap-1"><Clock size={11} />{p.deliveryDays} days</span>
                </div>
              </div>
            </div>

            {p.status === 'accepted' ? (
              <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-100 px-2.5 py-1 rounded-full">
                <CheckCircle size={12} /> Accepted
              </span>
            ) : jobStatus === 'open' ? (
              <Button
                onClick={() => acceptMutation.mutate(p._id)}
                loading={acceptMutation.isLoading}
                className="text-xs px-3 py-1.5 flex-shrink-0"
              >
                Accept
              </Button>
            ) : null}
          </div>

          {p.coverLetter && (
            <p className="text-sm text-gray-600 mt-3 pt-3 border-t border-gray-50 line-clamp-3">
              {p.coverLetter}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

// ── Main JobDetail page ───────────────────────────────────────────────────────
export default function JobDetail() {
  const { id } = useParams();
  const { isClient, isFreelancer, user } = useAuth();
  const [proposalSubmitted, setProposalSubmitted] = useState(false);

  const { data, isLoading, refetch } = useQuery(
    ['job', id],
    () => fetchJob(id).then((r) => r.data.data.job),
    { refetchOnWindowFocus: false }
  );

  if (isLoading) return <Loader />;
  if (!data) return <div className="card text-center py-20 text-gray-400">Job not found.</div>;

  const job = data;
  const alreadyApplied = proposalSubmitted ||
    job.proposals?.some((p) => p.freelancer?._id === user?._id || p.freelancer === user?._id);

  const DURATION_LABEL = { short: '< 1 month', medium: '1–3 months', long: '3+ months' };
  const EXP_LABEL = { entry: 'Entry Level', intermediate: 'Intermediate', expert: 'Expert' };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Back button */}
      <button
        onClick={() => window.history.back()}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-5 transition-colors"
      >
        <ChevronLeft size={16} /> Back
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Left: Job details ── */}
        <div className="lg:col-span-2 space-y-5">
          {/* Header card */}
          <div className="card animate-fade-in-up">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h1 className="text-xl font-bold text-gray-900 leading-snug">{job.title}</h1>
                <p className="text-xs text-gray-400 mt-1 flex items-center gap-2">
                  <span>{job.category}</span>
                  <span>·</span>
                  <span className="flex items-center gap-1"><Eye size={11} />{job.views} views</span>
                  <span>·</span>
                  <span>Posted {timeAgo(job.createdAt)}</span>
                </p>
              </div>
              <span className={`badge flex-shrink-0 ${
                job.status === 'open' ? 'bg-emerald-100 text-emerald-700'
                : job.status === 'in_progress' ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-500'
              }`}>
                {job.status === 'in_progress' ? 'In Progress' : job.status.charAt(0).toUpperCase() + job.status.slice(1)}
              </span>
            </div>

            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{job.description}</p>

            {job.skills?.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-50">
                {job.skills.map((s) => (
                  <span key={s} className="bg-primary-50 text-primary-700 text-xs px-2.5 py-1 rounded-full font-medium">
                    {s}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Proposal section */}
          {isFreelancer && job.status === 'open' && (
            alreadyApplied ? (
              <div className="card border-emerald-200 bg-emerald-50/40 flex items-center gap-3 animate-fade-in-up">
                <CheckCircle size={20} className="text-emerald-600 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-emerald-800 text-sm">Proposal submitted!</p>
                  <p className="text-xs text-emerald-600 mt-0.5">The client will review and get back to you.</p>
                </div>
              </div>
            ) : (
              <ProposalForm jobId={id} onSuccess={() => { setProposalSubmitted(true); refetch(); }} />
            )
          )}

          {isFreelancer && job.status !== 'open' && (
            <div className="card bg-gray-50 text-center py-6">
              <p className="text-gray-400 text-sm">This job is no longer accepting proposals.</p>
            </div>
          )}

          {/* Client sees proposals */}
          {isClient && (
            <ProposalsList
              proposals={job.proposals}
              jobId={id}
              jobStatus={job.status}
            />
          )}
        </div>

        {/* ── Right: Job info sidebar ── */}
        <div className="space-y-4">
          {/* Budget */}
          <div className="card animate-fade-in-up stat-card-green">
            <p className="text-xs text-gray-500 mb-1">Budget</p>
            <p className="text-xl font-bold text-gray-900">
              {formatCurrency(job.budget?.min)} – {formatCurrency(job.budget?.max)}
            </p>
            <p className="text-xs text-gray-400 mt-0.5 capitalize">{job.budget?.type} price</p>
          </div>

          {/* Details */}
          <div className="card animate-fade-in-up animate-delay-100">
            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Job Details</h4>
            <div className="space-y-3">
              {[
                { icon: Clock,    label: 'Duration',    value: DURATION_LABEL[job.duration] || job.duration },
                { icon: Star,     label: 'Experience',  value: EXP_LABEL[job.experienceLevel] || job.experienceLevel },
                { icon: Briefcase,label: 'Proposals',   value: `${job.proposals?.length || 0} submitted` },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1.5 text-gray-500">
                    <Icon size={13} /> {label}
                  </span>
                  <span className="font-medium text-gray-800">{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Client info */}
          {job.client && (
            <div className="card animate-fade-in-up animate-delay-200">
              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Client</h4>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-indigo-500 flex items-center justify-center flex-shrink-0">
                  {job.client?.avatar
                    ? <img src={job.client.avatar} alt="" className="w-10 h-10 rounded-full object-cover" />
                    : <User size={16} className="text-white" />
                  }
                </div>
                <div>
                  <p className="font-semibold text-sm text-gray-900">{job.client?.name}</p>
                  {job.client?.location && (
                    <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                      <MapPin size={10} /> {job.client.location}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
