import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Plus, Store, Edit, Power, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { restaurantService, type AdminRestaurant } from '@/core/api/restaurants';
import { AddRestaurantModal } from './components/AddRestaurantModal';
import { EditRestaurantModal } from './components/EditRestaurantModal';

export default function RestaurantsPage() {
  const queryClient = useQueryClient();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingRestaurant, setEditingRestaurant] = useState<AdminRestaurant | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['restaurants', searchQuery],
    queryFn: () => restaurantService.getRestaurants({ search: searchQuery }),
  });

  const restaurants = data?.restaurants || [];

  const toggleMutation = useMutation({
    mutationFn: ({ id, activate }: { id: string, activate: boolean }) => 
      restaurantService.toggleStatus(id, activate),
    onSuccess: (_, { activate }) => {
      toast.success(`Restaurant ${activate ? 'activated' : 'deactivated'} successfully!`);
      queryClient.invalidateQueries({ queryKey: ['restaurants'] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to update restaurant status.');
    }
  });

  const activeCount = restaurants.filter(r => r.isActive).length;

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-[28px] font-bold text-gray-900 tracking-tight">Restaurant Management</h1>
          <p className="text-[14px] text-gray-500 mt-1">Manage restaurant partners</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#8a1827] hover:bg-[#61111b] text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add Restaurant
        </button>
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-t-2xl border border-b-0 p-4 flex items-center justify-between shadow-sm mt-6">
        <div className="relative w-full max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border-0 bg-gray-50 rounded-lg text-sm text-gray-900 focus:ring-1 focus:ring-gray-200 placeholder:text-gray-400"
            placeholder="Search restaurants..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="px-3 py-1.5 bg-gray-50 border rounded-full text-xs font-semibold text-gray-700">
          {activeCount} Active
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border rounded-b-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b bg-white text-[13px] font-semibold text-gray-900">
                <th className="px-6 py-4 font-semibold whitespace-nowrap">Restaurant</th>
                <th className="px-6 py-4 font-semibold whitespace-nowrap">Contact</th>
                <th className="px-6 py-4 font-semibold whitespace-nowrap">Operating Hours</th>
                <th className="px-6 py-4 font-semibold whitespace-nowrap">Total Orders</th>
                <th className="px-6 py-4 font-semibold whitespace-nowrap">Status</th>
                <th className="px-6 py-4 font-semibold text-right whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-sm text-gray-500">
                    Loading restaurants...
                  </td>
                </tr>
              ) : restaurants.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-sm text-gray-500">
                    No restaurants found.
                  </td>
                </tr>
              ) : (
                restaurants.map((restaurant) => (
                  <tr key={restaurant.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center border border-gray-200 shrink-0">
                          <Store className="w-5 h-5 text-gray-500" />
                        </div>
                        <div>
                          <div className="font-semibold text-[14px] text-gray-900">{restaurant.name}</div>
                          <div className="text-[12px] text-gray-400 mt-0.5">{restaurant.rstCode}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-[13px] font-medium text-gray-900">{restaurant.phone}</div>
                      <div className="text-[12px] text-gray-400 mt-0.5">{restaurant.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[13px] text-gray-600 font-medium whitespace-nowrap">{restaurant.operatingHoursSummary}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[14px] font-semibold text-gray-900">{restaurant.totalOrderCount}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                        restaurant.isActive 
                          ? 'bg-green-50 text-green-700 border-green-200' 
                          : 'bg-gray-100 text-gray-600 border-gray-200'
                      }`}>
                        {restaurant.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <button 
                          className="text-gray-400 hover:text-gray-700 transition-colors" 
                          title="Edit"
                          onClick={() => setEditingRestaurant(restaurant)}
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          className={`transition-colors ${
                            restaurant.isActive ? 'text-[#d72b1f] hover:text-[#b91d13]' : 'text-green-600 hover:text-green-700'
                          } disabled:opacity-50`}
                          title={restaurant.isActive ? 'Deactivate' : 'Activate'}
                          onClick={() => toggleMutation.mutate({ id: restaurant.id, activate: !restaurant.isActive })}
                          disabled={toggleMutation.isPending && toggleMutation.variables?.id === restaurant.id}
                        >
                          {toggleMutation.isPending && toggleMutation.variables?.id === restaurant.id ? (
                            <Loader2 className="w-[18px] h-[18px] animate-spin" />
                          ) : (
                            <Power className="w-[18px] h-[18px]" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AddRestaurantModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
      />

      <EditRestaurantModal
        isOpen={!!editingRestaurant}
        onClose={() => setEditingRestaurant(null)}
        restaurant={editingRestaurant}
      />
    </div>
  );
}
