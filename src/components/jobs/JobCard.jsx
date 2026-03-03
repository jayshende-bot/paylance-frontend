import { Link } from 'react-router-dom';
import { MapPin, Clock, DollarSign, Eye } from 'lucide-react';
import Badge from '../ui/Badge';
import { timeAgo } from '../../utils/dateHelpers';
import { formatCurrency } from '../../utils/formatCurrency';

export default function JobCard({ job }) {
  return (
    <div className="card hover:shadow-md transition-shadow group">
      <div className="flex justify-between items-start mb-3">
        <Link to={`/jobs/${job._id}`} className="flex-1">
          <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-2">
            {job.title}
          </h3>
        </Link>
        <div className="flex gap-2 ml-3">
          {job.isUrgent && <Badge status="open">Urgent</Badge>}
          <Badge status={job.status} />
        </div>
      </div>

      <p className="text-sm text-gray-600 line-clamp-2 mb-4">{job.description}</p>

      <div className="flex flex-wrap gap-1.5 mb-4">
        {job.skills?.slice(0, 4).map((skill) => (
          <span key={skill} className="bg-primary-50 text-primary-700 text-xs px-2.5 py-1 rounded-full font-medium">
            {skill}
          </span>
        ))}
        {job.skills?.length > 4 && (
          <span className="text-xs text-gray-400">+{job.skills.length - 4} more</span>
        )}
      </div>

      <div className="flex items-center justify-between text-sm text-gray-500 pt-3 border-t border-gray-50">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1 font-semibold text-gray-800">
            <DollarSign size={14} />
            {formatCurrency(job.budget.min)} – {formatCurrency(job.budget.max)}
          </span>
          {job.client?.location && (
            <span className="flex items-center gap-1">
              <MapPin size={13} /> {job.client.location}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <Eye size={13} /> {job.views}
          </span>
          <span className="flex items-center gap-1">
            <Clock size={13} /> {timeAgo(job.createdAt)}
          </span>
        </div>
      </div>
    </div>
  );
}
