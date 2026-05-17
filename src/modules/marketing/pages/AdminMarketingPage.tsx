import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Download, Users, Store, Calendar, Globe, Phone, Mail } from 'lucide-react';
import { marketingApi } from '../api/marketingApi';

const DAILY_ORDER_OPTIONS = [
  { value: 50,   label: "Up to 50 orders/day" },
  { value: 200,  label: "50–200 orders/day" },
  { value: 500,  label: "200–500 orders/day" },
  { value: 1000, label: "500+ orders/day" },
];

export default function AdminMarketingPage() {
  const [activeTab, setActiveTab] = useState<'waitlist' | 'leads'>('waitlist');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 20;

  // Filters for Leads
  const [cityFilter, setCityFilter] = useState('');
  const [dailyOrdersFilter, setDailyOrdersFilter] = useState<number | undefined>(undefined);

  const { data: waitlistData, isLoading: isLoadingWaitlist } = useQuery({
    queryKey: ['marketing-waitlist', search, page],
    queryFn: () => marketingApi.getWaitlist({ search, page, pageSize }),
    enabled: activeTab === 'waitlist',
  });

  const { data: leadsData, isLoading: isLoadingLeads } = useQuery({
    queryKey: ['marketing-leads', search, cityFilter, dailyOrdersFilter, page],
    queryFn: () => marketingApi.getRestaurantLeads({ search, city: cityFilter, dailyOrders: dailyOrdersFilter, page, pageSize }),
    enabled: activeTab === 'leads',
  });

  const handleExport = async () => {
    try {
      const response = activeTab === 'waitlist' 
        ? await marketingApi.exportWaitlist() 
        : await marketingApi.exportRestaurantLeads();
      
      const blob = new Blob([response as any], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${activeTab}-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-[28px] font-bold text-gray-900 tracking-tight">Marketing Dashboard</h1>
          <p className="text-[14px] text-gray-500 mt-1">Monitor waitlist signups and restaurant partnership leads</p>
        </div>
        <button 
          onClick={handleExport}
          className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 hover:bg-black text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-gray-100 rounded-xl w-fit mb-6">
        <button
          onClick={() => { setActiveTab('waitlist'); setPage(1); }}
          className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
            activeTab === 'waitlist' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Waitlist
        </button>
        <button
          onClick={() => { setActiveTab('leads'); setPage(1); }}
          className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
            activeTab === 'leads' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Restaurant Leads
        </button>
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-t-2xl border border-b-0 p-4 flex flex-wrap items-center gap-4 shadow-sm">
        <div className="relative flex-1 min-w-[300px]">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border-0 bg-gray-50 rounded-lg text-sm text-gray-900 focus:ring-1 focus:ring-gray-200 placeholder:text-gray-400"
            placeholder={activeTab === 'waitlist' ? "Search name, email, or phone..." : "Search restaurant or owner..."}
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>

        {activeTab === 'leads' && (
          <>
            <input
              type="text"
              className="px-3 py-2 bg-gray-50 border-0 rounded-lg text-sm text-gray-900 focus:ring-1 focus:ring-gray-200 placeholder:text-gray-400 min-w-[150px]"
              placeholder="Filter by city..."
              value={cityFilter}
              onChange={(e) => { setCityFilter(e.target.value); setPage(1); }}
            />
            <select
              className="px-3 py-2 bg-gray-50 border-0 rounded-lg text-sm text-gray-900 focus:ring-1 focus:ring-gray-200"
              value={dailyOrdersFilter ?? ''}
              onChange={(e) => { setDailyOrdersFilter(e.target.value ? Number(e.target.value) : undefined); setPage(1); }}
            >
              <option value="">All Volumes</option>
              {DAILY_ORDER_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </>
        )}
      </div>

      {/* Table */}
      <div className="bg-white border rounded-b-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b bg-gray-50/50 text-[13px] font-semibold text-gray-900">
                <th className="px-6 py-4">{activeTab === 'waitlist' ? 'Customer' : 'Restaurant & Owner'}</th>
                <th className="px-6 py-4">Contact Info</th>
                {activeTab === 'leads' && <th className="px-6 py-4">Business Info</th>}
                <th className="px-6 py-4">Source</th>
                <th className="px-6 py-4 whitespace-nowrap">Joined Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {(activeTab === 'waitlist' ? isLoadingWaitlist : isLoadingLeads) ? (
                <tr>
                  <td colSpan={activeTab === 'leads' ? 5 : 4} className="px-6 py-12 text-center text-sm text-gray-500">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mb-3"></div>
                      Loading data...
                    </div>
                  </td>
                </tr>
              ) : (activeTab === 'waitlist' ? waitlistData?.entries : leadsData?.entries)?.length === 0 ? (
                <tr>
                  <td colSpan={activeTab === 'leads' ? 5 : 4} className="px-6 py-12 text-center text-sm text-gray-500 flex flex-col items-center">
                    <Users className="w-8 h-8 text-gray-300 mb-3" />
                    No entries found.
                  </td>
                </tr>
              ) : (
                (activeTab === 'waitlist' ? waitlistData?.entries : leadsData?.entries)?.map((e: any) => (
                  <tr key={e.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-bold text-xs uppercase">
                          {(e.name || e.restaurantName)?.charAt(0)}
                        </div>
                        <div>
                          <div className="font-semibold text-[14px] text-gray-900">{e.name || e.restaurantName}</div>
                          {e.ownerName && <div className="text-[12px] text-gray-400">Owner: {e.ownerName}</div>}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5 text-[13px] text-gray-900">
                          <Phone className="w-3.5 h-3.5 text-gray-400" />
                          {e.phone}
                        </div>
                        {e.email && (
                          <div className="flex items-center gap-1.5 text-[12px] text-gray-500">
                            <Mail className="w-3.5 h-3.5 text-gray-400" />
                            {e.email}
                          </div>
                        )}
                      </div>
                    </td>
                    {activeTab === 'leads' && (
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-1.5 text-[13px] text-gray-900 font-medium">
                            <Globe className="w-3.5 h-3.5 text-gray-400" />
                            {e.city}
                          </div>
                          <div className="flex items-center gap-1.5 text-[12px] text-gray-500">
                            <Store className="w-3.5 h-3.5 text-gray-400" />
                            {DAILY_ORDER_OPTIONS.find(o => o.value === e.dailyOrders)?.label || e.dailyOrders}
                          </div>
                        </div>
                      </td>
                    )}
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-100">
                        {e.source || 'Direct'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-[13px] text-gray-500">
                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                        {new Date(e.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 bg-gray-50/50 border-t flex items-center justify-between">
          <p className="text-[13px] text-gray-500 font-medium">
            Showing <span className="text-gray-900">{(activeTab === 'waitlist' ? waitlistData : leadsData)?.entries?.length || 0}</span> of <span className="text-gray-900">{(activeTab === 'waitlist' ? waitlistData : leadsData)?.totalCount || 0}</span> entries
          </p>
          <div className="flex items-center gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className="px-3 py-1 text-xs font-bold text-gray-600 bg-white border rounded-md disabled:opacity-50 hover:bg-gray-50 transition-colors"
            >
              Previous
            </button>
            <span className="text-[13px] font-bold text-gray-900 mx-2">Page {page}</span>
            <button
              disabled={page * pageSize >= ((activeTab === 'waitlist' ? waitlistData : leadsData)?.totalCount || 0)}
              onClick={() => setPage(page + 1)}
              className="px-3 py-1 text-xs font-bold text-gray-600 bg-white border rounded-md disabled:opacity-50 hover:bg-gray-50 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
