import React, { useState } from 'react';
import { 
  Store, 
  Bike, 
  Calendar, 
  ChevronDown, 
  MoreVertical
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';

// Mock Data
const MOCK_STATS = [
  { label: 'Pending Payouts', value: '12', type: 'neutral', icon: null },
  { label: 'Total Pending Amount', value: '₹4,23,890', type: 'info', icon: '₹' },
  { label: 'Failed Payments', value: '₹38,972', type: 'danger', icon: '!' },
  { label: 'Platform Profit', value: '₹44,004', type: 'success', icon: '↗' },
  { label: 'Next Auto-run', value: 'Apr 21, 9:00 AM', type: 'neutral', icon: null },
  { label: 'Last Auto-run', value: 'Apr 14 • ₹3,87,450\npaid', type: 'neutral', icon: null },
];

const MOCK_TABLE_DATA = [
  { id: 1, name: 'Pizza Paradise', orders: 156, gmv: '₹87,450', net: '₹70,793', status: 'Pending', substatus: 'Waiting for next auto-run', statusType: 'warning' },
  { id: 2, name: 'Burger Hub', orders: 134, gmv: '₹64,230', net: '₹51,996', status: 'Failed - Insufficient Balance', substatus: 'Auto payout could not be processed', statusType: 'danger' },
  { id: 3, name: 'Sushi Express', orders: 98, gmv: '₹92,340', net: '₹74,752', status: 'On Hold', substatus: 'Admin intervention', statusType: 'warning' },
  { id: 4, name: 'Taco Fiesta', orders: 87, gmv: '₹56,780', net: '₹45,982', status: 'Failed - Bank Issue', substatus: 'Transaction failed during processing', statusType: 'danger' },
  { id: 5, name: 'Thai Spice', orders: 143, gmv: '₹78,950', net: '₹63,926', status: 'Processing / Stuck', substatus: 'Amount not debited and not credited', statusType: 'info' },
  { id: 6, name: 'Indian Curry House', orders: 201, gmv: '₹1,12,340', net: '₹90,955', status: 'Paid', substatus: 'Completed successfully', statusType: 'success' },
];

export default function PayoutsPage() {
  const [primaryTab, setPrimaryTab] = useState<'restaurant' | 'rider'>('restaurant');
  const [secondaryTab, setSecondaryTab] = useState<'current' | 'pending' | 'history'>('current');
  const [expandedRowId, setExpandedRowId] = useState<number | null>(1);

  return (
    <div className="w-full max-w-7xl pb-10">
      
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-[28px] font-bold text-gray-900 tracking-tight">Payouts</h1>
          <p className="text-[14px] text-gray-500 mt-1">Manage automated payouts and handle exceptions</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg border border-gray-200 shadow-sm">
            <span className="text-[13px] font-medium text-gray-600">Auto Payout:</span>
            <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[12px] font-bold rounded-md">ON</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg border border-gray-200 shadow-sm">
            <span className="text-[13px] font-medium text-gray-600">Manual Override:</span>
            <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[12px] font-bold rounded-md">Enabled</span>
          </div>
        </div>
      </div>

      {/* Main Tabs */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => setPrimaryTab('restaurant')}
          className={cn(
            "flex items-center gap-2.5 px-6 py-3 rounded-xl font-bold transition-all",
            primaryTab === 'restaurant'
              ? "bg-[#ecfdf5] text-[#059669] border border-[#059669]"
              : "bg-white text-gray-600 border border-transparent hover:bg-gray-50"
          )}
        >
          <Store className="w-5 h-5" />
          Restaurant Payouts
        </button>
        <button
          onClick={() => setPrimaryTab('rider')}
          className={cn(
            "flex items-center gap-2.5 px-6 py-3 rounded-xl font-bold transition-all",
            primaryTab === 'rider'
              ? "bg-[#ecfdf5] text-[#059669] border border-[#059669]"
              : "bg-white text-gray-500 border border-transparent hover:bg-gray-50"
          )}
        >
          <Bike className="w-5 h-5" />
          Rider Payouts
        </button>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5 mb-6">
        {/* Secondary Tabs */}
        <div className="flex items-center gap-2 mb-5">
          <button
            onClick={() => setSecondaryTab('current')}
            className={cn(
              "px-4 py-2 rounded-full text-[13px] font-semibold transition-all",
              secondaryTab === 'current'
                ? "bg-[#d72b1f] text-white"
                : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
            )}
          >
            Current Cycle
          </button>
          <button
            onClick={() => setSecondaryTab('pending')}
            className={cn(
              "px-4 py-2 rounded-full text-[13px] font-semibold transition-all",
              secondaryTab === 'pending'
                ? "bg-[#d72b1f] text-white"
                : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
            )}
          >
            Pending (Last Cycle Issues)
          </button>
          <button
            onClick={() => setSecondaryTab('history')}
            className={cn(
              "px-4 py-2 rounded-full text-[13px] font-semibold transition-all",
              secondaryTab === 'history'
                ? "bg-[#d72b1f] text-white"
                : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
            )}
          >
            History
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <div className="flex items-center gap-2 pl-3 pr-8 py-2.5 bg-gray-50 border border-gray-100 rounded-lg text-[13px] font-medium text-gray-700 min-w-[180px] cursor-pointer hover:bg-gray-100 transition-colors">
              <Calendar className="w-4 h-4 text-gray-400" />
              Last 7 days
            </div>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>

          <div className="relative">
            <select className="appearance-none pl-4 pr-10 py-2.5 bg-gray-50 border border-gray-100 rounded-lg text-[13px] font-medium text-gray-700 min-w-[200px] cursor-pointer hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-200">
              <option>All Restaurants</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>

          <div className="relative">
            <select className="appearance-none pl-4 pr-10 py-2.5 bg-gray-50 border border-gray-100 rounded-lg text-[13px] font-medium text-gray-700 min-w-[180px] cursor-pointer hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-200">
              <option>All Status</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        {MOCK_STATS.map((stat, i) => (
          <div 
            key={i} 
            className={cn(
              "bg-white border rounded-xl p-4 flex flex-col justify-between shadow-sm min-h-[100px]",
              stat.type === 'danger' ? 'border-red-200 bg-red-50/10' : 
              stat.type === 'success' ? 'border-green-200 bg-green-50/10' : 'border-gray-100'
            )}
          >
            <div className="flex items-center gap-1.5 text-gray-500 mb-2">
              {stat.icon && (
                <span className={cn(
                  "flex items-center justify-center w-4 h-4 rounded-full text-[10px] font-bold",
                  stat.type === 'danger' ? 'text-red-500 bg-red-100 border border-red-200' :
                  stat.type === 'success' ? 'text-green-600 bg-green-100 border border-green-200' :
                  'text-blue-600 bg-blue-100'
                )}>
                  {stat.icon}
                </span>
              )}
              <span className="text-[12px] font-medium">{stat.label}</span>
            </div>
            <div className={cn(
              "text-[20px] font-bold leading-tight whitespace-pre-line",
              stat.type === 'danger' ? 'text-red-600' :
              stat.type === 'success' ? 'text-[#059669]' : 'text-gray-900'
            )}>
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100">
          <h2 className="text-[16px] font-bold text-gray-900">Restaurant Payouts</h2>
          <p className="text-[13px] text-gray-500 mt-0.5">Click any row to view full breakdown</p>
        </div>
        
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent bg-gray-50/50">
              <TableHead className="py-4 px-6 text-gray-900 font-bold">Restaurant Name</TableHead>
              <TableHead className="py-4 px-6 text-gray-900 font-bold">Orders</TableHead>
              <TableHead className="py-4 px-6 text-gray-900 font-bold">GMV (Customer Payment)</TableHead>
              <TableHead className="py-4 px-6 text-gray-900 font-bold">Net Payable</TableHead>
              <TableHead className="py-4 px-6 text-gray-900 font-bold">Status</TableHead>
              <TableHead className="py-4 px-6 text-gray-900 font-bold text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {MOCK_TABLE_DATA.map((row) => {
              const isExpanded = expandedRowId === row.id;

              return (
                <React.Fragment key={row.id}>
                  <TableRow 
                    className="hover:bg-gray-50/50 group cursor-pointer border-b border-gray-100 last:border-0"
                    onClick={() => setExpandedRowId(isExpanded ? null : row.id)}
                  >
                    <TableCell className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <ChevronDown className={cn(
                          "w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-transform duration-200",
                          isExpanded && "rotate-180"
                        )} />
                        <span className="text-[14px] font-bold text-gray-900">{row.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="py-4 px-6 text-[14px] text-gray-700">{row.orders}</TableCell>
                    <TableCell className="py-4 px-6 text-[14px] font-bold text-gray-900">{row.gmv}</TableCell>
                    <TableCell className="py-4 px-6 text-[15px] font-bold text-[#059669]">{row.net}</TableCell>
                    <TableCell className="py-4 px-6">
                      <div className="flex flex-col items-start gap-1">
                        <span className={cn(
                          "px-2.5 py-0.5 rounded-md text-[11px] font-bold border",
                          row.statusType === 'warning' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                          row.statusType === 'danger' ? 'bg-red-50 text-red-600 border-red-200' :
                          row.statusType === 'info' ? 'bg-blue-50 text-blue-600 border-blue-200' :
                          'bg-green-50 text-green-700 border-green-200'
                        )}>
                          {row.status}
                        </span>
                        <span className="text-[11px] text-gray-400">{row.substatus}</span>
                      </div>
                    </TableCell>
                    <TableCell className="py-4 px-6 text-right">
                      <button 
                        onClick={(e) => e.stopPropagation()} 
                        className="p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors ml-auto flex items-center justify-center"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </TableCell>
                  </TableRow>

                  {/* Expanded Breakdown */}
                  {isExpanded && (
                    <TableRow className="bg-gray-50/30 border-b border-gray-100">
                      <TableCell colSpan={6} className="p-0">
                        <div className="p-6 pt-4 animate-in fade-in duration-200">
                          
                          {/* Top 3 Columns */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-6">
                            {/* CUSTOMER PAYMENT */}
                            <div>
                              <h4 className="text-[10px] font-bold text-gray-400 tracking-wider uppercase mb-2">Customer Payment</h4>
                              <div className="bg-[#ecfdf5] border border-green-200 rounded-lg p-3">
                                <p className="text-[11px] font-bold text-[#059669] mb-0.5">GMV</p>
                                <p className="text-[18px] font-bold text-[#059669]">₹87,450</p>
                              </div>
                            </div>

                            {/* BREAKDOWN */}
                            <div>
                              <h4 className="text-[10px] font-bold text-gray-400 tracking-wider uppercase mb-2">Breakdown</h4>
                              <div className="space-y-2 text-[12px]">
                                <div className="flex justify-between items-center text-gray-600 font-medium">
                                  <span>Food Revenue</span>
                                  <span className="text-gray-900 font-bold">₹83,286</span>
                                </div>
                                <div className="flex justify-between items-center text-purple-600 font-medium">
                                  <span className="flex items-center gap-1">GST on Food (5%) <span className="w-3 h-3 rounded-full border border-purple-200 flex items-center justify-center text-[8px]">i</span></span>
                                  <span className="font-bold">₹4,164</span>
                                </div>
                                <div className="flex justify-between items-center text-gray-600 font-medium pt-1">
                                  <span>Delivery Fee</span>
                                  <span className="text-gray-900 font-bold">₹3,744</span>
                                </div>
                                <div className="flex justify-between items-center text-purple-600 font-medium">
                                  <span className="flex items-center gap-1">Delivery GST (18%) <span className="w-3 h-3 rounded-full border border-purple-200 flex items-center justify-center text-[8px]">i</span></span>
                                  <span className="font-bold">₹674</span>
                                </div>
                              </div>
                            </div>

                            {/* EARNINGS & COSTS */}
                            <div>
                              <h4 className="text-[10px] font-bold text-gray-400 tracking-wider uppercase mb-2">Earnings & Costs</h4>
                              <div className="space-y-2 text-[12px]">
                                <div className="flex justify-between items-center text-gray-600 font-medium">
                                  <span className="flex items-center gap-1">Commission (15%) <span className="w-3 h-3 rounded-full border border-gray-300 flex items-center justify-center text-[8px]">i</span></span>
                                  <span className="text-[#059669] font-bold">₹12,493</span>
                                </div>
                                <div className="flex justify-between items-center text-gray-600 font-medium">
                                  <span>Rider Earnings</span>
                                  <span className="text-gray-900 font-bold">₹8,249</span>
                                </div>
                                <div className="flex justify-between items-center text-[#d72b1f] font-medium pt-1">
                                  <span className="flex items-center gap-1">Delivery Subsidy <span className="w-3 h-3 rounded-full border border-red-200 flex items-center justify-center text-[8px]">i</span></span>
                                  <span className="font-bold">₹4,505</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="border-t border-gray-100 my-4 border-dashed" />

                          {/* Middle Section: Payout and Profit */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            {/* Restaurant Payout */}
                            <div className="bg-[#fffdf5] border border-orange-100 rounded-lg p-4">
                              <p className="text-[11px] font-bold text-[#ea580c] mb-0.5">Restaurant Payout</p>
                              <p className="text-[20px] font-bold text-[#ea580c] mb-1">₹70,793</p>
                              <p className="text-[11px] text-orange-600/70 font-medium">Food Revenue - Commission</p>
                            </div>

                            {/* Platform Profit */}
                            <div className="bg-[#ecfdf5] border border-green-100 rounded-lg p-4">
                              <p className="text-[11px] font-bold text-[#059669] mb-0.5">Platform Profit</p>
                              <p className="text-[20px] font-bold text-[#059669] mb-1">₹7,988</p>
                              <p className="text-[11px] text-[#059669]/70 font-medium">Commission - Subsidy</p>
                            </div>
                          </div>

                          {/* Bottom Section: Refunds */}
                          <div className="bg-[#fff5f5] border border-red-100 rounded-lg p-4 flex justify-between items-center">
                            <div>
                              <p className="text-[12px] font-bold text-[#d72b1f]">Refunds</p>
                              <p className="text-[11px] text-[#d72b1f]/70 font-medium">2 orders refunded</p>
                            </div>
                            <p className="text-[16px] font-bold text-[#d72b1f]">₹850</p>
                          </div>

                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              );
            })}
          </TableBody>
        </Table>
      </div>

    </div>
  );
}
