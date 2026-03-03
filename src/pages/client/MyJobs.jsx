import { useQuery } from 'react-query';
import { fetchMyJobs } from '../../api/jobApi';
import { Link } from 'react-router-dom';
import Loader from '../../components/ui/Loader';
import { Briefcase, Plus, Clock, Users, CheckCircle, XCircle, TrendingUp } from 'lucide-react';

const STATUS_CONFIG = {
  open:        { label: 'Open',        bg: 'bg-emerald-100', text: 'text-emerald-700', icon: TrendingUp },
  in_progress: { label: 'In Progress', bg: 'bg-blue-100',    text: 'text-blue-700',    icon: Clock },
  completed:   { label: 'Completed',   bg: 'bg-gray-100',    text: 'text-gray-600',    icon: CheckCircle },
  cancelled:   { label: 'Cancelled',   bg: 'bg-red-100',     text: 'text-red-600',     icon: XCircle },
};

function JobRow({ job }) {
  const cfg = STATUS_CONFIG[job.status] || STATUS_CONFIG.open;
  const StatusIcon = cfg.icon;
  const proposalCount = job.proposals?.length || 0;

  return (
    <div className="card hover:shadow-md transition-shadow duration-200 animate-fade-in-up">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className={`badge ${cfg.bg} ${cfg.text} flex items-center gap-1`}>
              <StatusIcon size={11} />
              {cfg.label}
            </span>
            <span className="badge bg-gray-100 text-gray-500">{job.category}</span>
            {job.isUrgent && (
              <span className="badge bg-red-100 text-red-600">🔥 Urgent</span>
            )}
          </div>

          <h3 className="font-semibold text-gray-900 text-base truncate">{job.title}</h3>
          <p className="text-sm text-gray-400 mt-0.5 line-clamp-1">{job.description}</p>

          <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <Users size={12} />
              {proposalCount} proposal{proposalCount !== 1 ? 's' : ''}
            </span>
            <span className="flex items-center gap-1">
              <Clock size={12} />
              {new Date(job.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
            <span className="font-medium text-gray-700">
              ${job.budget?.min} – ${job.budget?.max}
            </span>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2 flex-shrink-0">
          {job.status === 'open' && proposalCount > 0 && (
            <span className="text-xs font-semibold text-primary-600 bg-primary-50 px-2.5 py-1 rounded-full">
              {proposalCount} new
            </span>
          )}
          <Link
            to={`/jobs/${job._id}`}
            className="btn-outline text-xs px-3 py-1.5"
          >
            View
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function MyJobs() {
  const { data: jobs, isLoading } = useQuery(
    'my-jobs',
    () => fetchMyJobs().then((r) => r.data.data.jobs)
  );

  const open       = jobs?.filter((j) => j.status === 'open') || [];
  const active     = jobs?.filter((j) => j.status === 'in_progress') || [];
  const completed  = jobs?.filter((j) => j.status === 'completed') || [];

  if (isLoading) return <Loader />;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6 animate-fade-in-up">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Jobs</h1>
          <p className="text-gray-500 text-sm mt-1">All jobs you have posted</p>
        </div>
        <Link to="/jobs/post" className="btn-primary flex items-center gap-2 text-sm">
          <Plus size={16} /> Post New Job
        </Link>
      </div>

      {/* Stats row */}
      {jobs?.length > 0 && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Open',        count: open.length,      color: 'stat-card-green' },
            { label: 'In Progress', count: active.length,    color: 'stat-card-blue' },
            { label: 'Completed',   count: completed.length, color: 'stat-card-purple' },
          ].map((s) => (
            <div key={s.label} className={`card ${s.color} text-center py-4 animate-fade-in-up`}>
              <div className="text-2xl font-bold text-gray-900">{s.count}</div>
              <div className="text-xs text-gray-500 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Job list */}
      {jobs?.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-20 text-center animate-fade-in-up">
          <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-4">
            <Briefcase size={28} className="text-gray-300" />
          </div>
          <h3 className="font-semibold text-gray-700 mb-1">No jobs yet</h3>
          <p className="text-gray-400 text-sm mb-6">Post your first job and start finding great talent.</p>
          <Link to="/jobs/post" className="btn-primary">Post a Job</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => <JobRow key={job._id} job={job} />)}
        </div>
      )}
    </div>
  );
}
