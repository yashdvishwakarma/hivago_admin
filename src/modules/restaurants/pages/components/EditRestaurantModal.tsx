import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { z } from 'zod';
import { restaurantService, type AdminRestaurant } from '@/core/api/restaurants';
import { Button } from '@/components/ui/Button';

interface EditRestaurantModalProps {
  isOpen: boolean;
  onClose: () => void;
  restaurant: AdminRestaurant | null;
}

const editRestaurantSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().min(10, 'Phone must be at least 10 characters'),
  email: z.string().email('Invalid email address'),
  addressLine: z.string().min(5, 'Address is required'),
  commissionFlatFee: z.number().min(0, 'Commission must be positive'),
});

export function EditRestaurantModal({ isOpen, onClose, restaurant }: EditRestaurantModalProps) {
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    addressLine: '',
    operatingHours: '',
    commissionFlatFee: 0,
    avgPrepTimeMins: 30,
    cuisineTypes: [] as string[],
    fssaiNumber: '',
    minOrderAmount: 0,
    isPureVeg: false,
    isVeganFriendly: false,
    hasJainOptions: false,
    latitude: 0,
    longitude: 0
  });

  const [latInput, setLatInput] = useState('0');
  const [lngInput, setLngInput] = useState('0');

  const [cuisineInput, setCuisineInput] = useState('');

  useEffect(() => {
    if (restaurant && isOpen) {
      setFormData({
        name: restaurant.name || '',
        phone: restaurant.phone !== 'Not Available' ? restaurant.phone : '',
        email: restaurant.email !== 'Not Available' ? restaurant.email : '',
        addressLine: restaurant.addressLine || '',
        operatingHours: restaurant.operatingHoursSummary !== 'N/A - N/A' ? restaurant.operatingHoursSummary : '',
        commissionFlatFee: restaurant.commissionFlatFee || 0,
        avgPrepTimeMins: restaurant.avgPrepTimeMins ?? 30,
        cuisineTypes: restaurant.cuisineTypes || [],
        fssaiNumber: '', 
        minOrderAmount: restaurant.minOrderAmount ?? 0,
        isPureVeg: restaurant.isPureVeg || false,
        isVeganFriendly: restaurant.isVeganFriendly || false,
        hasJainOptions: restaurant.hasJainOptions || false,
        latitude: (restaurant as any).latitude || 0,
        longitude: (restaurant as any).longitude || 0
      });
      setLatInput(((restaurant as any).latitude || 0).toString());
      setLngInput(((restaurant as any).longitude || 0).toString());
      setCuisineInput(restaurant.cuisineTypes?.join(', ') || '');
      setErrorMsg('');
    }
  }, [restaurant, isOpen]);

  const [errorMsg, setErrorMsg] = useState('');

  const mutation = useMutation({
    mutationFn: (payload: any) => restaurantService.updateRestaurant(restaurant!.id, payload),
    onSuccess: () => {
      toast.success('Restaurant updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['restaurants'] });
      onClose();
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || 'Failed to update restaurant. Please try again.';
      setErrorMsg(msg);
      toast.error(msg);
    }
  });

  if (!isOpen || !restaurant) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    try {
      editRestaurantSchema.parse(formData);
      
        // The backend PUT /api/admins/restaurants/{id} accepts specific fields.
        // We must strip 'email' and 'operatingHours' as they aren't in the schema
        const payload = {
          name: formData.name,
          phone: formData.phone,
          addressLine: formData.addressLine,
          operatingHours: formData.operatingHours,
          commissionFlatFee: formData.commissionFlatFee,
          avgPrepTimeMins: formData.avgPrepTimeMins,
          cuisineTypes: formData.cuisineTypes,
          isPureVeg: formData.isPureVeg,
          isVeganFriendly: formData.isVeganFriendly,
          hasJainOptions: formData.hasJainOptions,
          minOrderAmount: formData.minOrderAmount,
          fssaiNumber: formData.fssaiNumber,
          latitude: formData.latitude,
          longitude: formData.longitude
        };
        
        mutation.mutate(payload);
      } catch (err) {
      if (err instanceof z.ZodError) {
        const msg = err.errors?.[0]?.message || 'Validation error. Please check your inputs.';
        setErrorMsg(msg);
      } else {
        setErrorMsg('An unexpected error occurred.');
      }
    }
    };
  
      const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        
        if (name === 'cuisineInput') {
          setCuisineInput(value);
          setFormData(prev => ({ 
            ...prev, 
            cuisineTypes: value.split(',').map(s => s.trim()).filter(Boolean) 
          }));
          return;
        }

        if (name === 'latitude') {
          setLatInput(value);
          const parsed = parseFloat(value);
          if (!isNaN(parsed)) {
            setFormData(prev => ({ ...prev, latitude: parsed }));
          }
          return;
        }
        if (name === 'longitude') {
          setLngInput(value);
          const parsed = parseFloat(value);
          if (!isNaN(parsed)) {
            setFormData(prev => ({ ...prev, longitude: parsed }));
          }
          return;
        }

        if (name === 'selectAllDietary') {
          setFormData(prev => ({
            ...prev,
            isPureVeg: checked,
            isVeganFriendly: checked,
            hasJainOptions: checked
          }));
          return;
        }

        setFormData(prev => ({
          ...prev,
          [name]: type === 'checkbox' ? checked : type === 'number' ? (value === '' ? 0 : parseFloat(value)) : value
        }));
      };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">Edit Restaurant - {restaurant.rstCode}</h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto">
          {errorMsg && (
            <div className="mb-6 p-3 rounded-lg bg-red-50 text-red-600 text-sm font-medium text-center">
              {errorMsg}
            </div>
          )}

          <form id="edit-restaurant-form" onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[13px] font-semibold text-gray-700">Restaurant Name</label>
                <input 
                  name="name" 
                  value={formData.name} 
                  onChange={handleChange} 
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg bg-gray-50/50 text-sm focus:ring-1 focus:ring-primary focus:bg-white transition-colors placeholder:text-gray-400" 
                  placeholder="Enter restaurant name"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[13px] font-semibold text-gray-700">Contact Number</label>
                <input 
                  name="phone" 
                  value={formData.phone} 
                  onChange={handleChange} 
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg bg-gray-50/50 text-sm focus:ring-1 focus:ring-primary focus:bg-white transition-colors placeholder:text-gray-400" 
                  placeholder="+91 98765 00000"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[13px] font-semibold text-gray-700">Email Address</label>
              <input 
                type="email" 
                name="email" 
                value={formData.email} 
                onChange={handleChange} 
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg bg-gray-50/50 text-sm focus:ring-1 focus:ring-primary focus:bg-white transition-colors placeholder:text-gray-400" 
                placeholder="contact@restaurant.com"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[13px] font-semibold text-gray-700">Operating Hours</label>
              <input 
                name="operatingHours" 
                value={formData.operatingHours}
                onChange={handleChange}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg bg-gray-50/50 text-sm focus:ring-1 focus:ring-primary focus:bg-white transition-colors placeholder:text-gray-400" 
                placeholder="10:00 AM - 11:00 PM"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[13px] font-semibold text-gray-700">Address</label>
              <input 
                name="addressLine" 
                value={formData.addressLine} 
                onChange={handleChange} 
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg bg-gray-50/50 text-sm focus:ring-1 focus:ring-primary focus:bg-white transition-colors placeholder:text-gray-400" 
                placeholder="Full restaurant address"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[13px] font-semibold text-gray-700">Latitude</label>
                <input 
                  type="text" name="latitude" 
                  value={latInput} onChange={handleChange} 
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg bg-gray-50/50 text-sm focus:ring-1 focus:ring-primary focus:bg-white transition-colors" 
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[13px] font-semibold text-gray-700">Longitude</label>
                <input 
                  type="text" name="longitude" 
                  value={lngInput} onChange={handleChange} 
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg bg-gray-50/50 text-sm focus:ring-1 focus:ring-primary focus:bg-white transition-colors" 
                />
              </div>
            </div>
            {/* Business Settings */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
              <div className="space-y-1.5">
                <label className="text-[13px] font-semibold text-gray-700">Commission (Flat Fee)</label>
                <input type="number" step="any" name="commissionFlatFee" value={formData.commissionFlatFee} onChange={handleChange} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg bg-gray-50/50 text-sm focus:ring-1 focus:ring-primary focus:bg-white transition-colors placeholder:text-gray-400" placeholder="0" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[13px] font-semibold text-gray-700">Avg Prep Time (mins)</label>
                <input type="number" name="avgPrepTimeMins" value={formData.avgPrepTimeMins} onChange={handleChange} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg bg-gray-50/50 text-sm focus:ring-1 focus:ring-primary focus:bg-white transition-colors placeholder:text-gray-400" placeholder="30" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[13px] font-semibold text-gray-700">Min Order Amount</label>
                <input type="number" step="any" name="minOrderAmount" value={formData.minOrderAmount} onChange={handleChange} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg bg-gray-50/50 text-sm focus:ring-1 focus:ring-primary focus:bg-white transition-colors placeholder:text-gray-400" placeholder="0" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[13px] font-semibold text-gray-700">FSSAI Number</label>
                <input name="fssaiNumber" value={formData.fssaiNumber} onChange={handleChange} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg bg-gray-50/50 text-sm focus:ring-1 focus:ring-primary focus:bg-white transition-colors placeholder:text-gray-400" placeholder="Optional" />
              </div>
              <div className="space-y-1.5 col-span-2">
                <label className="text-[13px] font-semibold text-gray-700">Cuisine Types (comma separated)</label>
                <input name="cuisineInput" value={cuisineInput} onChange={handleChange} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg bg-gray-50/50 text-sm focus:ring-1 focus:ring-primary focus:bg-white transition-colors placeholder:text-gray-400" placeholder="Indian, Chinese" />
              </div>
            </div>

            {/* Dietary Options */}
            <div className="flex flex-wrap items-center gap-6 pt-2 pb-2">
              <label className="flex items-center gap-2 text-[13px] font-bold text-primary cursor-pointer border-r border-gray-200 pr-6">
                <input 
                  type="checkbox" 
                  name="selectAllDietary" 
                  checked={formData.isPureVeg && formData.isVeganFriendly && formData.hasJainOptions} 
                  onChange={handleChange} 
                  className="rounded border-gray-300 text-primary focus:ring-primary w-4 h-4" 
                />
                Select All
              </label>
              <label className="flex items-center gap-2 text-[13px] font-medium text-gray-700 cursor-pointer">
                <input type="checkbox" name="isPureVeg" checked={formData.isPureVeg} onChange={handleChange} className="rounded border-gray-300 text-[#d72b1f] focus:ring-[#d72b1f] w-4 h-4" />
                Pure Veg
              </label>
              <label className="flex items-center gap-2 text-[13px] font-medium text-gray-700 cursor-pointer">
                <input type="checkbox" name="isVeganFriendly" checked={formData.isVeganFriendly} onChange={handleChange} className="rounded border-gray-300 text-[#d72b1f] focus:ring-[#d72b1f] w-4 h-4" />
                Vegan Friendly
              </label>
              <label className="flex items-center gap-2 text-[13px] font-medium text-gray-700 cursor-pointer">
                <input type="checkbox" name="hasJainOptions" checked={formData.hasJainOptions} onChange={handleChange} className="rounded border-gray-300 text-[#d72b1f] focus:ring-[#d72b1f] w-4 h-4" />
                Jain Options
              </label>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-3">
          <button 
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-[13px] font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
          >
            Cancel
          </button>
          <Button 
            type="submit" 
            form="edit-restaurant-form"
            className="px-6 py-2 text-[13px] font-semibold bg-[#16a34a] hover:bg-[#15803d] text-white rounded-lg shadow-sm"
            isLoading={mutation.isPending}
          >
            Save Changes
          </Button>
        </div>

      </div>
    </div>
  );
}
