import { useQuery } from 'react-query';
import { useAuth } from '../../hooks/useAuth';
import { fetchFreelancerAnalytics } from '../../api/analyticsApi';
import { fetchMyJobs } from '../../api/jobApi';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DollarSign, Briefcase, TrendingUp, Clock, ArrowUpRight, Plus } from 'lucide-react';
import { formatCurrency } from '../../utils/formatCurrency';
import { Link } from 'react-router-dom';
import Loader from '../../components/ui/Loader';

function StatCard({ title, value, icon: Icon, gradient, iconBg, sub, delay = '' }) {
  return (
    <div className={`card ${gradient} animate-fade-in-up ${delay}`}>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <div className={`p-2.5 rounded-xl ${iconBg}`}>
          <Icon size={18} />
        </div>
      </div>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
      {sub && <p className="text-xs text-gray-500 mt-1.5">{sub}</p>}
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-100 rounded-xl shadow-lg px-4 py-3">
        <p className="text-xs text-gray-500 mb-1">{label}</p>
        <p className="font-bold text-primary-700">{formatCurrency(payload[0].value)}</p>
      </div>
    );
  }
  return null;
};

function FreelancerDashboard() {
  const { user } = useAuth();
  const { data, isLoading } = useQuery('freelancer-analytics', () =>
    fetchFreelancerAnalytics().then((r) => r.data.data)
  );

  if (isLoading) return <Loader />;

  const chartData = (data?.monthlyEarnings || []).map((m) => ({
    name: `${m._id.month}/${m._id.year}`,
    earnings: m.total,
  }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard title="Total Earned" value={formatCurrency(data?.totalEarned || 0)} icon={DollarSign}
          gradient="stat-card-green" iconBg="bg-emerald-100 text-emerald-600" sub="All time earnings" delay="animate-delay-100" />
        <StatCard title="Pending Payout" value={formatCurrency(user?.earnings?.pending || 0)} icon={Clock}
          gradient="stat-card-amber" iconBg="bg-amber-100 text-amber-600" sub="Awaiting release" delay="animate-delay-200" />
        <StatCard title="Active Contracts" value={data?.activeContracts || 0} icon={Briefcase}
          gradient="stat-card-blue" iconBg="bg-blue-100 text-blue-600" sub="In progress" delay="animate-delay-300" />
      </div>

      <div className="card animate-fade-in-up animate-delay-300">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-semibold text-gray-900">Monthly Earnings</h3>
            <p className="text-xs text-gray-400 mt-0.5">Your income over time</p>
          </div>
          <span className="flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
            <ArrowUpRight size={12} /> Live
          </span>
        </div>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="earningsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="earnings" stroke="#6366f1" strokeWidth={2.5}
                fill="url(#earningsGrad)" dot={false} activeDot={{ r: 5, fill: '#6366f1' }} />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-4">
              <TrendingUp size={28} className="text-gray-300" />
            </div>
            <p className="text-gray-400 text-sm">No earnings yet</p>
            <p className="text-gray-300 text-xs mt-1">Complete milestones to see your chart</p>
          </div>
        )}
      </div>
    </div>
  );
}

function ClientDashboard() {
  const { data: myJobs, isLoading } = useQuery('my-jobs', () => fetchMyJobs().then((r) => r.data.data.jobs));

  if (isLoading) return <Loader />;

  const openJobs = myJobs?.filter((j) => j.status === 'open') || [];
  const activeJobs = myJobs?.filter((j) => j.status === 'in_progress') || [];
  const totalProposals = myJobs?.reduce((acc, j) => acc + (j.proposals?.length || 0), 0) || 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard title="Open Jobs" value={openJobs.length} icon={Briefcase}
          gradient="stat-card-blue" iconBg="bg-blue-100 text-blue-600" sub="Accepting proposals" delay="animate-delay-100" />
        <StatCard title="Active Contracts" value={activeJobs.length} icon={TrendingUp}
          gradient="stat-card-green" iconBg="bg-emerald-100 text-emerald-600" sub="Currently in progress" delay="animate-delay-200" />
        <StatCard title="Total Proposals" value={totalProposals} icon={Clock}
          gradient="stat-card-purple" iconBg="bg-violet-100 text-violet-600" sub="Across all jobs" delay="animate-delay-300" />
      </div>

      <div className="card animate-fade-in-up animate-delay-300">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-semibold text-gray-900">Recent Jobs</h3>
            <p className="text-xs text-gray-400 mt-0.5">Your latest postings</p>
          </div>
          <Link to="/jobs/post" className="flex items-center gap-1.5 text-xs font-semibold text-primary-600 bg-primary-50 hover:bg-primary-100 px-3 py-1.5 rounded-full transition-colors">
            <Plus size={13} /> Post Job
          </Link>
        </div>

        {myJobs?.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-4">
              <Briefcase size={28} className="text-gray-300" />
            </div>
            <p className="text-gray-400 text-sm mb-4">No jobs posted yet</p>
            <Link to="/jobs/post" className="btn-primary text-sm">Post Your First Job</Link>
          </div>
        ) : (
          <div className="space-y-0">
            {myJobs?.slice(0, 5).map((job, i) => (
              <div key={job._id} className={`flex items-center justify-between py-3.5 ${i < Math.min(myJobs.length, 5) - 1 ? 'border-b border-gray-50' : ''}`}>
                <div>
                  <a href={`/jobs/${job._id}`} className="font-medium text-sm text-gray-800 hover:text-primary-600 transition-colors">{job.title}</a>
                  <p className="text-xs text-gray-400 mt-0.5">{job.proposals?.length || 0} proposals</p>
                </div>
                <span className={`badge ${job.status === 'open' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
                  {job.status === 'in_progress' ? 'In Progress' : job.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user, isClient, isFreelancer } = useAuth();

  return (
    <div>
      <div className="mb-8 animate-fade-in-up">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, <span className="gradient-text">{user?.name?.split(' ')[0]}</span>! 👋
        </h1>
        <p className="text-gray-500 mt-1">
          {isClient ? 'Manage your projects and hire top talent.' : 'Track your work and manage your earnings.'}
        </p>
      </div>

      {isClient && <ClientDashboard />}
      {isFreelancer && <FreelancerDashboard />}
    </div>
  );
}
