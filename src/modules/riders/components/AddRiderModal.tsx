import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { riderService, type CreateRiderPayload } from '@/core/api/riders';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import toast from 'react-hot-toast';

interface AddRiderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddRiderModal({ isOpen, onClose }: AddRiderModalProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<CreateRiderPayload>({
    name: '',
    phone: '',
    vehicleType: 'Bike',
    vehicleNumber: '',
  });

  const mutation = useMutation({
    mutationFn: riderService.createRider,
    onSuccess: () => {
      toast.success('Rider added successfully');
      queryClient.invalidateQueries({ queryKey: ['riders'] });
      onClose();
      setFormData({
        name: '',
        phone: '',
        vehicleType: 'Bike',
        vehicleNumber: '',
      });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to add rider');
    },
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Full Name is required');
      return;
    }
    if (!formData.phone.trim()) {
      toast.error('Phone Number is required');
      return;
    }
    if (!formData.vehicleNumber.trim()) {
      toast.error('Vehicle Number is required');
      return;
    }
    mutation.mutate({
      ...formData,
      name: formData.name.trim(),
      phone: formData.phone.trim(),
      vehicleNumber: formData.vehicleNumber.trim(),
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-[16px] font-bold text-gray-900">Add New Rider</h2>
            <p className="text-[12px] text-gray-500 mt-0.5">Register a new delivery rider in the system</p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          <form id="add-rider-form" onSubmit={handleSubmit} className="space-y-5">
            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="text-[13px] font-semibold text-gray-900">Full Name</label>
              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-lg text-[14px] text-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-300 focus:bg-white transition-colors"
                placeholder="Enter full name"
                required
              />
            </div>

            {/* Phone Number */}
            <div className="space-y-1.5">
              <label className="text-[13px] font-semibold text-gray-900">Phone Number</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-lg text-[14px] text-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-300 focus:bg-white transition-colors"
                placeholder="Enter phone number (e.g. +919999999999)"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Vehicle Type */}
              <div className="space-y-1.5">
                <label className="text-[13px] font-semibold text-gray-900">Vehicle Type</label>
                <div className="relative">
                  <select
                    name="vehicleType"
                    value={formData.vehicleType}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-lg text-[14px] text-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-300 focus:bg-white transition-colors appearance-none pr-10"
                    required
                  >
                    <option value="Bike">Bike</option>
                    <option value="Scooter">Scooter</option>
                    <option value="Cycle">Cycle</option>
                    <option value="Car">Car</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                      <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Vehicle Number */}
              <div className="space-y-1.5">
                <label className="text-[13px] font-semibold text-gray-900">Vehicle Number</label>
                <input
                  name="vehicleNumber"
                  value={formData.vehicleNumber}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-lg text-[14px] text-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-300 focus:bg-white transition-colors uppercase"
                  placeholder="e.g. MH-12-AB-1234"
                  required
                />
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-3">
          <button 
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 text-[13px] font-semibold text-gray-700 bg-white hover:bg-gray-50 transition-colors rounded-lg"
          >
            Cancel
          </button>
          <Button 
            type="submit" 
            form="add-rider-form"
            className="bg-[#d72b1f] hover:bg-[#b82218] text-white font-medium px-6 py-2.5 rounded-lg shadow-sm"
            isLoading={mutation.isPending}
          >
            Add Rider
          </Button>
        </div>

      </div>
    </div>
  );
}
