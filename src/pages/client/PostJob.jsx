import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from 'react-query';
import { createJob } from '../../api/jobApi';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/ui/Button';
import toast from 'react-hot-toast';

// React Hook Form treats dot-notation keys as NESTED paths:
// register('budget.min') → data = { budget: { min: 500 } }
// So the Zod schema must be nested too, NOT use flat 'budget.min' string keys.
const schema = z.object({
  title: z.string().min(10, 'Title must be at least 10 characters'),
  description: z.string().min(50, 'Description must be at least 50 characters'),
  category: z.string().min(1, 'Category required'),
  budget: z.object({
    type: z.enum(['fixed', 'hourly']),
    min: z.coerce.number().min(5, 'Min budget must be at least $5'),
    max: z.coerce.number().min(5, 'Max budget required'),
  }),
  duration: z.enum(['short', 'medium', 'long']),
  experienceLevel: z.enum(['entry', 'intermediate', 'expert']),
  skills: z.string().optional(),
});

export default function PostJob() {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      budget: { type: 'fixed' },
      duration: 'medium',
      experienceLevel: 'intermediate',
    },
  });

  const mutation = useMutation(
    (data) => createJob({
      title: data.title,
      description: data.description,
      category: data.category,
      experienceLevel: data.experienceLevel,
      duration: data.duration,
      budget: data.budget, // already { type, min, max } from RHF
      skills: data.skills ? data.skills.split(',').map((s) => s.trim()).filter(Boolean) : [],
    }),
    {
      onSuccess: (res) => {
        toast.success('Job posted successfully!');
        navigate(`/jobs/${res.data.data.job._id}`);
      },
      onError: (err) => toast.error(err.response?.data?.message || 'Failed to post job'),
    }
  );

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Post a New Job</h1>
        <p className="text-gray-500 text-sm mt-1">Fill in the details to attract the best freelancers.</p>
      </div>

      <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-5">
        <div className="card space-y-5">
          <h2 className="font-semibold text-gray-700">Job Details</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
            <input {...register('title')} className="input" placeholder="e.g. Build a React dashboard with charts" />
            {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea {...register('description')} rows={6} className="input resize-none"
              placeholder="Describe the project, requirements, and deliverables..." />
            {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select {...register('category')} className="input">
                <option value="">Select...</option>
                {['Web Development', 'Mobile', 'Design', 'Writing', 'Marketing', 'Data Science', 'DevOps', 'Other']
                  .map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              {errors.category && <p className="text-xs text-red-500 mt-1">{errors.category.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Experience Level</label>
              <select {...register('experienceLevel')} className="input">
                <option value="entry">Entry Level</option>
                <option value="intermediate">Intermediate</option>
                <option value="expert">Expert</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Skills (comma-separated)</label>
            <input {...register('skills')} className="input" placeholder="React, Node.js, MongoDB, Tailwind" />
          </div>
        </div>

        <div className="card space-y-5">
          <h2 className="font-semibold text-gray-700">Budget & Timeline</h2>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select {...register('budget.type')} className="input">
                <option value="fixed">Fixed Price</option>
                <option value="hourly">Hourly Rate</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Min Budget ($)</label>
              <input {...register('budget.min')} type="number" className="input" placeholder="500" />
              {errors.budget?.min && <p className="text-xs text-red-500 mt-1">{errors.budget.min.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Budget ($)</label>
              <input {...register('budget.max')} type="number" className="input" placeholder="2000" />
              {errors.budget?.max && <p className="text-xs text-red-500 mt-1">{errors.budget.max.message}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Project Duration</label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: 'short', label: 'Short', desc: '< 1 month' },
                { value: 'medium', label: 'Medium', desc: '1-3 months' },
                { value: 'long', label: 'Long', desc: '3+ months' },
              ].map(({ value, label, desc }) => (
                <label key={value} className="cursor-pointer">
                  <input {...register('duration')} type="radio" value={value} className="sr-only" />
                  <div className="border-2 rounded-lg p-3 text-center text-sm hover:border-primary-300 transition-colors">
                    <div className="font-medium">{label}</div>
                    <div className="text-xs text-gray-400">{desc}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        <Button type="submit" loading={mutation.isLoading} className="w-full">
          Post Job
        </Button>
      </form>
    </div>
  );
}
