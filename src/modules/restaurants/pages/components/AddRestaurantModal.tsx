import { useState, useEffect, useRef } from 'react';
import { X, Search, Check, AlertCircle } from 'lucide-react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { z } from 'zod';
import { restaurantService, type CreateRestaurantPayload } from '@/core/api/restaurants';
import { ownerService, type AdminOwner } from '@/core/api/owners';
import { Button } from '@/components/ui/Button';

interface AddRestaurantModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const addRestaurantSchema = z.object({
  ownerId: z.string().min(1, 'Owner selection is mandatory'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().min(10, 'Phone must be at least 10 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  addressLine: z.string().min(5, 'Address is required'),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

export function AddRestaurantModal({ isOpen, onClose }: AddRestaurantModalProps) {
  const queryClient = useQueryClient();
  const ownerDropdownRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState<CreateRestaurantPayload>({
    ownerId: '',
    name: '',
    phone: '',
    email: '',
    password: '',
    addressLine: '',
    latitude: 0,
    longitude: 0,
    commissionPercentage: 0,
    avgPrepTimeMins: 30,
    cuisineTypes: [],
    fssaiNumber: '',
    minOrderAmount: 0,
    isPureVeg: false,
    isVeganFriendly: false,
    hasJainOptions: false
  });

  const [errorMsg, setErrorMsg] = useState('');
  const [ownerSearchQuery, setOwnerSearchQuery] = useState('');
  const [debouncedOwnerQuery, setDebouncedOwnerQuery] = useState('');
  const [isOwnerDropdownOpen, setIsOwnerDropdownOpen] = useState(false);
  const [selectedOwner, setSelectedOwner] = useState<AdminOwner | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedOwnerQuery(ownerSearchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [ownerSearchQuery]);

  const { data: ownersData, isLoading: isSearchingOwners } = useQuery({
    queryKey: ['ownersSearch', debouncedOwnerQuery],
    queryFn: async () => {
      // Workaround: Backend throws 500 error when using the 'search' query parameter.
      // Fetch a larger page size and filter locally for now.
      const res = await ownerService.getOwners({ pageSize: 100 });
      if (debouncedOwnerQuery && res?.owners) {
        const lowerQ = debouncedOwnerQuery.toLowerCase();
        return {
          ...res,
          owners: res.owners.filter(o => 
            o.name.toLowerCase().includes(lowerQ) || 
            o.email.toLowerCase().includes(lowerQ) || 
            o.id.toLowerCase().includes(lowerQ)
          )
        };
      }
      return res;
    },
    enabled: isOwnerDropdownOpen,
  });

  // Handle click outside dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ownerDropdownRef.current && !ownerDropdownRef.current.contains(event.target as Node)) {
        setIsOwnerDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const mutation = useMutation({
    mutationFn: (payload: CreateRestaurantPayload) => restaurantService.createRestaurant(payload),
    onSuccess: () => {
      toast.success('Restaurant created successfully!');
      queryClient.invalidateQueries({ queryKey: ['restaurants'] });
      onClose();
      // Reset form
      setFormData({
        ownerId: '', name: '', phone: '', email: '', password: '', addressLine: '', latitude: 0, longitude: 0
      });
      setSelectedOwner(null);
      setOwnerSearchQuery('');
      setErrorMsg('');
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || 'Failed to create restaurant. Please try again.';
      setErrorMsg(msg);
      toast.error(msg);
    }
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    try {
      addRestaurantSchema.parse(formData);
      mutation.mutate(formData);
    } catch (err) {
      if (err instanceof z.ZodError) {
        const msg = (err as any).errors[0].message;
        setErrorMsg(msg);
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    if (name === 'cuisineTypes') {
      setFormData(prev => ({ ...prev, cuisineTypes: value.split(',').map(s => s.trim()).filter(Boolean) }));
      return;
    }
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? (value ? parseFloat(value) : '') : value
    }));
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">Add New Restaurant</h2>
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

          <form id="add-restaurant-form" onSubmit={handleSubmit} className="space-y-5">
            
            {/* Owner Selection */}
            <div className="space-y-1.5 relative" ref={ownerDropdownRef}>
              <label className="text-[13px] font-semibold text-gray-700">Assign Owner <span className="text-red-500">*</span></label>
              
              {!selectedOwner ? (
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={ownerSearchQuery}
                    onChange={(e) => {
                      setOwnerSearchQuery(e.target.value);
                      setIsOwnerDropdownOpen(true);
                    }}
                    onFocus={() => setIsOwnerDropdownOpen(true)}
                    className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-lg bg-gray-50/50 text-sm focus:ring-1 focus:ring-primary focus:bg-white transition-colors placeholder:text-gray-400"
                    placeholder="Search owner by name, email, or ID..."
                  />
                  {isSearchingOwners && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-between px-3 py-2.5 border border-primary/30 bg-primary/5 rounded-lg">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-900">{selectedOwner.name}</span>
                    <span className="text-xs text-gray-500">{selectedOwner.email} • ID: {selectedOwner.id.substring(0, 8)}...</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedOwner(null);
                      setFormData(prev => ({ ...prev, ownerId: '' }));
                      setOwnerSearchQuery('');
                      setTimeout(() => setIsOwnerDropdownOpen(true), 100);
                    }}
                    className="text-xs font-semibold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-2 py-1 rounded-md transition-colors"
                  >
                    Change
                  </button>
                </div>
              )}

              {/* Dropdown Results */}
              {isOwnerDropdownOpen && !selectedOwner && (
                <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden max-h-60 overflow-y-auto">
                  {ownersData?.owners && ownersData.owners.length > 0 ? (
                    <ul className="py-1">
                      {ownersData.owners.map(owner => (
                        <li key={owner.id}>
                          <button
                            type="button"
                            className="w-full text-left px-4 py-2.5 hover:bg-gray-50 flex items-start gap-3 transition-colors"
                            onClick={() => {
                              setSelectedOwner(owner);
                              setFormData(prev => ({ ...prev, ownerId: owner.id }));
                              setIsOwnerDropdownOpen(false);
                              setErrorMsg(''); // Clear any owner error
                            }}
                          >
                            <div className="flex-shrink-0 mt-0.5">
                              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                                {owner.name.charAt(0).toUpperCase()}
                              </div>
                            </div>
                            <div className="flex flex-col flex-1 min-w-0">
                              <span className="text-sm font-medium text-gray-900 truncate">{owner.name}</span>
                              <span className="text-xs text-gray-500 truncate">{owner.email}</span>
                            </div>
                            {formData.ownerId === owner.id && (
                              <Check className="w-4 h-4 text-primary flex-shrink-0" />
                            )}
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="p-4 text-center text-sm text-gray-500 flex flex-col items-center">
                      <AlertCircle className="w-5 h-5 text-gray-400 mb-1.5" />
                      {ownerSearchQuery.length > 0 ? "No owners found matching your search." : "Type to search for an owner."}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 border-t border-gray-100 pt-5 mt-5">
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

            {/* Business Settings */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
              <div className="space-y-1.5">
                <label className="text-[13px] font-semibold text-gray-700">Commission %</label>
                <input type="number" step="any" name="commissionPercentage" value={formData.commissionPercentage} onChange={handleChange} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg bg-gray-50/50 text-sm focus:ring-1 focus:ring-primary focus:bg-white transition-colors placeholder:text-gray-400" placeholder="0" />
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
                <input name="cuisineTypes" value={formData.cuisineTypes?.join(', ') || ''} onChange={handleChange} className="w-full px-3 py-2.5 border border-gray-200 rounded-lg bg-gray-50/50 text-sm focus:ring-1 focus:ring-primary focus:bg-white transition-colors placeholder:text-gray-400" placeholder="Indian, Chinese" />
              </div>
            </div>

            {/* Dietary Options */}
            <div className="flex flex-wrap items-center gap-6 pt-2 pb-2">
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

            {/* Hidden fields required by API but not in the screenshot UI, kept minimal */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
              <div className="space-y-1.5">
                <label className="text-[12px] font-semibold text-gray-500">Initial Password</label>
                <input 
                  type="password" 
                  name="password" 
                  value={formData.password} 
                  onChange={handleChange} 
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50/50 text-xs" 
                  placeholder="••••••••"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[12px] font-semibold text-gray-500">Lat</label>
                <input 
                  type="number" step="any" name="latitude" 
                  value={formData.latitude} onChange={handleChange} 
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50/50 text-xs" 
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[12px] font-semibold text-gray-500">Lng</label>
                <input 
                  type="number" step="any" name="longitude" 
                  value={formData.longitude} onChange={handleChange} 
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50/50 text-xs" 
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
            className="px-5 py-2 text-[13px] font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
          >
            Cancel
          </button>
          <Button 
            type="submit" 
            form="add-restaurant-form"
            className="px-6 py-2 text-[13px] font-semibold bg-[#16a34a] hover:bg-[#15803d] text-white rounded-lg shadow-sm"
            isLoading={mutation.isPending}
          >
            Add Restaurant
          </Button>
        </div>

      </div>
    </div>
  );
}
