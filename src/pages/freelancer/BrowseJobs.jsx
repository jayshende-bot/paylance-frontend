import { useState } from 'react';
import { useQuery } from 'react-query';
import { fetchJobs } from '../../api/jobApi';
import JobCard from '../../components/jobs/JobCard';
import Loader from '../../components/ui/Loader';
import { Search, Filter } from 'lucide-react';

const categories = ['Web Development', 'Mobile', 'Design', 'Writing', 'Marketing', 'Data Science', 'DevOps', 'Other'];

export default function BrowseJobs() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery(
    ['jobs', { search, category, page }],
    () => fetchJobs({ search, category, page, limit: 10 }).then((r) => r.data.data),
    { keepPreviousData: true }
  );

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Browse Jobs</h1>

      {/* Filters */}
      <div className="card mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              className="input pl-9"
              placeholder="Search jobs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className="input md:w-48"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {isLoading ? <Loader /> : (
        <>
          <p className="text-sm text-gray-500 mb-4">
            {data?.pagination?.total || 0} jobs found
          </p>
          <div className="space-y-4">
            {data?.jobs?.map((job) => <JobCard key={job._id} job={job} />)}
          </div>

          {/* Pagination */}
          {data?.pagination && data.pagination.pages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              {Array.from({ length: data.pagination.pages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                    page === p ? 'bg-primary-600 text-white' : 'bg-white border border-gray-200 hover:border-primary-300'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
