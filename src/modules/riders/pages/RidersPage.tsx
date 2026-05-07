import { useState } from 'react';
import { Search, Filter, Eye } from 'lucide-react';

const mockRiders = [
  {
    id: 'RD-2847',
    name: 'Rohit Marathe',
    phone: '+91 98765 11122',
    email: 'rohit.m@hivago.com',
    status: 'Online',
    kycStatus: 'approved',
    deliveries: 1247,
    rating: 4.8,
    joinDate: 'Jan 15, 2026',
    initials: 'RM'
  },
  {
    id: 'RD-2901',
    name: 'Kavita Pawar',
    phone: '+91 98765 22233',
    email: 'kavita.p@hivago.com',
    status: 'Online',
    kycStatus: 'approved',
    deliveries: 892,
    rating: 4.9,
    joinDate: 'Feb 3, 2026',
    initials: 'KP'
  },
  {
    id: 'RD-3024',
    name: 'Suresh Kamble',
    phone: '+91 98765 33344',
    email: 'suresh.k@hivago.com',
    status: 'Offline',
    kycStatus: 'approved',
    deliveries: 654,
    rating: 4.7,
    joinDate: 'Mar 12, 2026',
    initials: 'SK'
  },
  {
    id: 'RD-3156',
    name: 'Anil Desai',
    phone: '+91 98765 44455',
    email: 'anil.d@hivago.com',
    status: 'Online',
    kycStatus: 'pending',
    deliveries: 0,
    rating: 'N/A',
    joinDate: 'Apr 5, 2026',
    initials: 'AD'
  },
  {
    id: 'RD-3189',
    name: 'Deepak Shinde',
    phone: '+91 98765 55566',
    email: 'deepak.s@hivago.com',
    status: 'Online',
    kycStatus: 'approved',
    deliveries: 423,
    rating: 4.8,
    joinDate: 'Mar 28, 2026',
    initials: 'DS'
  },
  {
    id: 'RD-3201',
    name: 'Ravi Jadhav',
    phone: '+91 98765 66677',
    email: 'ravi.j@hivago.com',
    status: 'Offline',
    kycStatus: 'pending',
    deliveries: 0,
    rating: 'N/A',
    joinDate: 'Apr 7, 2026',
    initials: 'RJ'
  }
];

export default function RidersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');

  return (
    <div className="w-full">
      <div className="mb-6">
        <h1 className="text-[22px] font-bold text-gray-900 tracking-tight">Rider Management</h1>
        <p className="text-[14px] text-gray-500 mt-1">Manage delivery riders and KYC verification</p>
      </div>

      <div className="bg-white rounded-xl border shadow-[0_1px_2px_rgba(0,0,0,0.02)] overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-gray-400" />
            <input
              type="text"
              placeholder="Search riders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-gray-50/80 border border-gray-100 rounded-lg text-[13px] placeholder:text-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#d72b1f]/20 focus:border-[#d72b1f] transition-all"
            />
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-gray-50/80 border border-gray-100 text-gray-700 text-[13px] rounded-lg focus:ring-2 focus:ring-[#d72b1f]/20 focus:border-[#d72b1f] focus:bg-white block px-3 py-2.5 outline-none w-full sm:w-[140px] appearance-none"
            >
              <option>All Status</option>
              <option>Online</option>
              <option>Offline</option>
            </select>
            <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-100 rounded-lg text-[13px] font-medium text-gray-700 hover:bg-gray-50 whitespace-nowrap shadow-sm">
              <Filter className="w-4 h-4" />
              More Filters
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-[13px] text-left">
            <thead className="text-[12px] font-semibold text-gray-900 bg-gray-50/50 border-b border-gray-100">
              <tr>
                <th scope="col" className="px-6 py-4">Rider</th>
                <th scope="col" className="px-6 py-4">Contact</th>
                <th scope="col" className="px-6 py-4">Status</th>
                <th scope="col" className="px-6 py-4">KYC Status</th>
                <th scope="col" className="px-6 py-4">Deliveries</th>
                <th scope="col" className="px-6 py-4">Rating</th>
                <th scope="col" className="px-6 py-4">Join Date</th>
                <th scope="col" className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {mockRiders.map((rider) => (
                <tr key={rider.id} className="bg-white hover:bg-gray-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-[38px] h-[38px] rounded-full bg-[#1a1a1a] text-white flex items-center justify-center font-semibold text-[13px]">
                        {rider.initials}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">{rider.name}</div>
                        <div className="text-gray-500 text-[12px] mt-0.5">{rider.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-gray-900 font-medium">{rider.phone}</div>
                    <div className="text-gray-400 text-[12px] mt-0.5">{rider.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full ${rider.status === 'Online' ? 'bg-[#10b981]' : 'bg-gray-400'}`}></div>
                      <span className="text-gray-700">{rider.status}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {rider.kycStatus === 'approved' ? (
                      <span className="inline-flex px-2.5 py-1 bg-[#ecfdf5] text-[#059669] border border-[#a7f3d0] rounded-full text-[12px] font-medium">
                        approved
                      </span>
                    ) : (
                      <span className="inline-flex px-2.5 py-1 bg-[#fff7ed] text-[#ea580c] border border-[#fed7aa] rounded-full text-[12px] font-medium">
                        pending
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-gray-900 font-medium">
                    {rider.deliveries}
                  </td>
                  <td className="px-6 py-4 text-gray-900 font-medium">
                    {rider.rating}
                  </td>
                  <td className="px-6 py-4 text-gray-700">
                    {rider.joinDate}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {rider.kycStatus === 'pending' && (
                      <button className="text-gray-400 hover:text-gray-900 transition-colors">
                        <Eye className="w-4 h-4 inline-block" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
