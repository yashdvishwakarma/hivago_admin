import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import toast from 'react-hot-toast';

export function ProfileSettings() {
  const [formData, setFormData] = useState({
    fullName: 'Admin User',
    email: 'admin@hivago.com',
    phone: '+1 (555) 000-0000',
  });
  
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);
      toast.success('Profile updated successfully');
    }, 1000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Get initials for avatar
  const initials = formData.fullName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  return (
    <div className="max-w-xl">
      {/* Avatar Section */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-16 h-16 rounded-full bg-black text-white flex items-center justify-center text-xl font-bold">
          {initials}
        </div>
        <div>
          <h3 className="text-[15px] font-bold text-gray-900">{formData.fullName}</h3>
          <p className="text-[13px] text-gray-500">{formData.email}</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-1.5">
          <label className="text-[13px] font-semibold text-gray-900">Full Name</label>
          <input
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-lg text-[14px] text-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-300 focus:bg-white transition-colors"
            placeholder="Enter full name"
            required
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[13px] font-semibold text-gray-900">Email Address</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-lg text-[14px] text-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-300 focus:bg-white transition-colors"
            placeholder="admin@hivago.com"
            required
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[13px] font-semibold text-gray-900">Phone Number</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-lg text-[14px] text-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-300 focus:bg-white transition-colors"
            placeholder="+1 (555) 000-0000"
          />
        </div>

        <div className="pt-2">
          <Button 
            type="submit" 
            isLoading={isSaving}
            className="bg-[#16a34a] hover:bg-[#15803d] text-white font-medium px-6 py-2.5 rounded-lg shadow-sm"
          >
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
}
