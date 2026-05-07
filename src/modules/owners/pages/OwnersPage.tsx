import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Plus, Users, ChevronDown, ChevronRight, Store } from 'lucide-react';
import { ownerService, type AdminOwner } from '@/core/api/owners';
import { restaurantService } from '@/core/api/restaurants';
import { AddOwnerModal } from '../components/AddOwnerModal';

function OwnerRow({ 
  owner, 
  associatedRestaurants 
}: { 
  owner: AdminOwner; 
  associatedRestaurants: any[] 
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <>
      <tr className="hover:bg-gray-50/50 transition-colors group border-b border-gray-100 last:border-0">
        <td className="px-6 py-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 rounded-md hover:bg-gray-200 text-gray-500 transition-colors"
            >
              {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
            <div className="w-10 h-10 rounded-full bg-[#fff5f5] text-[#d72b1f] flex items-center justify-center font-bold text-sm shrink-0">
              {owner.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="font-semibold text-[14px] text-gray-900">{owner.name}</div>
              <div className="text-[12px] text-gray-400 mt-0.5">ID: {owner.id.substring(0, 8)}...</div>
            </div>
          </div>
        </td>
        <td className="px-6 py-4">
          <div className="text-[13px] font-medium text-gray-900">{owner.phone}</div>
          <div className="text-[12px] text-gray-400 mt-0.5">{owner.email}</div>
        </td>
        <td className="px-6 py-4">
          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold border ${
            owner.isActive 
              ? 'bg-green-50 text-green-700 border-green-200' 
              : 'bg-gray-100 text-gray-600 border-gray-200'
          }`}>
            {owner.isActive ? 'Active' : 'Inactive'}
          </span>
        </td>
        <td className="px-6 py-4">
          <div className="flex items-center gap-1.5 bg-gray-100 px-3 py-1 rounded-full w-fit">
            <Store className="w-3.5 h-3.5 text-gray-600" />
            <span className="text-[12px] font-bold text-gray-700">{associatedRestaurants.length} Outlets</span>
          </div>
        </td>
      </tr>
      
      {/* Expanded Outlets View */}
      {isExpanded && (
        <tr className="bg-gray-50/50 border-b border-gray-100 last:border-0">
          <td colSpan={4} className="px-6 py-4 pl-[72px]">
            {associatedRestaurants.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {associatedRestaurants.map(rest => (
                  <div key={rest.id} className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm flex items-start gap-3">
                    <div className="p-2 bg-gray-50 rounded-md shrink-0 border border-gray-100">
                      <Store className="w-4 h-4 text-gray-500" />
                    </div>
                    <div>
                      <h4 className="text-[13px] font-bold text-gray-900">{rest.name}</h4>
                      <p className="text-[11px] text-gray-500 mt-0.5">{rest.rstCode} • {rest.isActive ? 'Active' : 'Inactive'}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-[13px] text-gray-500 py-2">
                No restaurants associated with this owner yet.
              </div>
            )}
          </td>
        </tr>
      )}
    </>
  );
}

export default function OwnersPage() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch Owners
  const { data: ownersData, isLoading: isLoadingOwners } = useQuery({
    queryKey: ['owners'],
    queryFn: () => ownerService.getOwners({ pageSize: 100 }), // Using 100 to get a full list for local filtering to bypass backend 500 error on search
  });

  // Fetch Restaurants to cross-reference outlets
  const { data: restaurantsData } = useQuery({
    queryKey: ['restaurants-all'],
    queryFn: () => restaurantService.getRestaurants({ pageSize: 500 }), // Large page size to get all
  });

  const allRestaurants = restaurantsData?.restaurants || [];
  let owners = ownersData?.owners || [];

  // Local filtering
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    owners = owners.filter(o => 
      o.name.toLowerCase().includes(q) || 
      o.email.toLowerCase().includes(q) || 
      o.phone.includes(q)
    );
  }

  const activeCount = owners.filter(o => o.isActive).length;

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-[28px] font-bold text-gray-900 tracking-tight">Owner Management</h1>
          <p className="text-[14px] text-gray-500 mt-1">Manage restaurant owners and their associated outlets</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#8a1827] hover:bg-[#61111b] text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add Owner
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
            placeholder="Search owners by name, email, or phone..."
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
              <tr className="border-b bg-gray-50/50 text-[13px] font-semibold text-gray-900">
                <th className="px-6 py-4 font-semibold whitespace-nowrap">Owner Details</th>
                <th className="px-6 py-4 font-semibold whitespace-nowrap">Contact Info</th>
                <th className="px-6 py-4 font-semibold whitespace-nowrap">Status</th>
                <th className="px-6 py-4 font-semibold whitespace-nowrap">Associated Outlets</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoadingOwners ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-sm text-gray-500">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mb-3"></div>
                      Loading owners...
                    </div>
                  </td>
                </tr>
              ) : owners.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-sm text-gray-500 flex flex-col items-center">
                    <Users className="w-8 h-8 text-gray-300 mb-3" />
                    No owners found matching your search.
                  </td>
                </tr>
              ) : (
                owners.map((owner) => {
                  const associatedRestaurants = allRestaurants.filter(r => r.ownerId === owner.id);
                  return (
                    <OwnerRow 
                      key={owner.id} 
                      owner={owner} 
                      associatedRestaurants={associatedRestaurants} 
                    />
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AddOwnerModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
      />
    </div>
  );
}
