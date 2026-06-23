import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Store, 
  Bike, 
  Calendar, 
  ChevronDown, 
  MoreVertical,
  Pause,
  Send,
  TrendingDown,
  DollarSign,
  Clock
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { payoutService, type PayoutStatus } from '@/core/api/payouts';
import OrderLevelBreakdown from '../components/OrderLevelBreakdown';
import toast from 'react-hot-toast';

export default function PayoutsPage() {
  const [primaryTab, setPrimaryTab] = useState<'restaurant' | 'rider'>('restaurant');
  const [secondaryTab, setSecondaryTab] = useState<PayoutStatus | ''>('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  const [selectedPayoutId, setSelectedPayoutId] = useState<string | null>(null);
  const [selectedRestaurantForDetails, setSelectedRestaurantForDetails] = useState<{ id: string; name: string } | null>(null);
  const [dropdownState, setDropdownState] = useState<{
    isOpen: boolean;
    rowId: string | null;
    rect: DOMRect | null;
  }>({ isOpen: false, rowId: null, rect: null });

  const queryClient = useQueryClient();

  // Summary Query
  const { data: summary } = useQuery({
    queryKey: ['payoutSummary'],
    queryFn: payoutService.getRestaurantPayoutSummary,
    enabled: primaryTab === 'restaurant',
  });

  // Payouts List Query
  const { data: payoutsData, isLoading: isLoadingPayouts } = useQuery({
    queryKey: ['restaurantPayouts', secondaryTab, currentPage],
    queryFn: () => payoutService.getRestaurantPayouts({
      status: secondaryTab || undefined,
      page: currentPage,
      pageSize
    }),
    enabled: primaryTab === 'restaurant',
  });

  const payNowMutation = useMutation({
    mutationFn: payoutService.payNow,
    onSuccess: (data) => {
      toast.success(`Payout triggered! Txn Ref: ${data.transactionReference}`);
      queryClient.invalidateQueries({ queryKey: ['payoutSummary'] });
      queryClient.invalidateQueries({ queryKey: ['restaurantPayouts'] });
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to trigger payout'),
  });

  const holdMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) => payoutService.holdPayout(id, reason),
    onSuccess: () => {
      toast.success('Payout placed on hold');
      queryClient.invalidateQueries({ queryKey: ['payoutSummary'] });
      queryClient.invalidateQueries({ queryKey: ['restaurantPayouts'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to place payout on hold');
    }
  });

  const releaseHoldMutation = useMutation({
    mutationFn: payoutService.releaseHold,
    onSuccess: () => {
      toast.success('Hold released');
      queryClient.invalidateQueries({ queryKey: ['payoutSummary'] });
      queryClient.invalidateQueries({ queryKey: ['restaurantPayouts'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to release hold');
    }
  });

  const retryMutation = useMutation({
    mutationFn: payoutService.retryPayout,
    onSuccess: () => {
      toast.success('Payout re-queued for retry');
      queryClient.invalidateQueries({ queryKey: ['payoutSummary'] });
      queryClient.invalidateQueries({ queryKey: ['restaurantPayouts'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to retry payout');
    }
  });

  const stats = useMemo(() => {
    if (!summary) return [];

    const nextDate = new Date(summary.nextAutoRunAtUtc);

    if (primaryTab === 'rider') {
      return [
        { label: 'Total Riders Pending', value: '28', type: 'neutral', icon: <Clock className="w-4 h-4 text-[#ea580c]" /> },
        { label: 'Total Earnings', value: '₹1,12,340', type: 'neutral', icon: <DollarSign className="w-4 h-4 text-[#059669]" /> },
        { label: 'Subsidy Impact', value: '₹28,972', type: 'danger', icon: <TrendingDown className="w-4 h-4 text-[#d72b1f]" /> },
        { label: 'Next Auto-run', value: `Apr 17, 2026`, type: 'neutral', icon: null },
        { label: 'Last Auto-run', value: `Apr 14 • Paid`, type: 'neutral', icon: null }
      ];
    }

    return [
      { label: 'Pending Payouts', value: summary.pendingCount.toString(), type: 'neutral', icon: null },
      { label: 'Total Pending', value: `₹${summary.totalPendingAmount.toLocaleString()}`, type: 'info', icon: '₹' },
      { label: 'Failed Amount', value: `₹${summary.failedAmount.toLocaleString()}`, type: 'danger', icon: '!' },
      { label: 'On Hold', value: summary.onHoldCount.toString(), type: 'neutral', icon: <Pause className="w-4 h-4" /> },
      { label: 'Platform Profit', value: `₹${summary.platformProfit.toLocaleString()}`, type: 'success', icon: '↗' },
      { 
        label: 'Next Auto-run', 
        value: nextDate.toLocaleString('default', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }), 
        type: 'neutral', 
        icon: null 
      },
    ];
  }, [summary, primaryTab]);

  if (selectedRestaurantForDetails) {
    return (
      <OrderLevelBreakdown 
        restaurantId={selectedRestaurantForDetails.id}
        restaurantName={selectedRestaurantForDetails.name}
        onBack={() => setSelectedRestaurantForDetails(null)} 
      />
    );
  }

  const payouts = payoutsData?.items || [];
  const isLoading = isLoadingPayouts;

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
              ? "bg-white text-gray-900 border-gray-200 shadow-sm"
              : "bg-transparent text-gray-500 border-transparent hover:bg-white/50"
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
              ? "bg-[#ecfdf5] text-[#059669] border border-[#059669] shadow-sm"
              : "bg-transparent text-gray-500 border-transparent hover:bg-white/50"
          )}
        >
          <Bike className="w-5 h-5" />
          Rider Payouts
        </button>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5 mb-6">
        {/* Secondary Tabs (Status Filters) */}
        <div className="flex flex-wrap items-center gap-2 mb-5">
          <button
            onClick={() => { setSecondaryTab(''); setCurrentPage(1); }}
            className={cn(
              "px-4 py-2 rounded-full text-[13px] font-semibold transition-all",
              secondaryTab === ''
                ? "bg-[#d72b1f] text-white shadow-md shadow-red-100"
                : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
            )}
          >
            All Payouts
          </button>
          {[
            { id: 'Pending', label: 'Pending Batch' },
            { id: 'Processing', label: 'Processing' },
            { id: 'OnHold', label: 'On Hold' },
            { id: 'Failed', label: 'Failed' },
            { id: 'Paid', label: 'History (Paid)' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => { setSecondaryTab(tab.id as PayoutStatus); setCurrentPage(1); }}
              className={cn(
                "px-4 py-2 rounded-full text-[13px] font-semibold transition-all",
                secondaryTab === tab.id
                  ? "bg-[#d72b1f] text-white shadow-md shadow-red-100"
                  : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <div className="flex items-center gap-2 pl-3 pr-8 py-2.5 bg-gray-50 border border-gray-100 rounded-lg text-[13px] font-medium text-gray-700 min-w-[180px] cursor-pointer hover:bg-gray-100 transition-colors">
              <Calendar className="w-4 h-4 text-gray-400" />
              All Cycles
            </div>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>

          <div className="relative">
            <input 
              type="text"
              placeholder="Filter by Owner ID..."
              className="pl-4 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-lg text-[13px] font-medium text-gray-700 min-w-[200px] hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-200"
            />
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        {stats.map((stat, i) => (
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
                typeof stat.icon === 'string' ? (
                  <span className={cn(
                    "flex items-center justify-center w-4 h-4 rounded-full text-[10px] font-bold",
                    stat.type === 'danger' ? 'text-red-500 bg-red-100 border border-red-200' :
                    stat.type === 'success' ? 'text-green-600 bg-green-100 border border-green-200' :
                    'text-blue-600 bg-blue-100'
                  )}>
                    {stat.icon}
                  </span>
                ) : (
                  stat.icon
                )
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
              {primaryTab === 'restaurant' ? (
                <>
                  <TableHead className="py-4 px-6 text-gray-900 font-bold">Restaurant Name</TableHead>
                  <TableHead className="py-4 px-6 text-gray-900 font-bold">Orders</TableHead>
                  <TableHead className="py-4 px-6 text-gray-900 font-bold">GMV</TableHead>
                  <TableHead className="py-4 px-6 text-gray-900 font-bold">Net Payable</TableHead>
                  <TableHead className="py-4 px-6 text-gray-900 font-bold">Status</TableHead>
                  <TableHead className="py-4 px-6 text-gray-900 font-bold text-right">Actions</TableHead>
                </>
              ) : (
                <>
                  <TableHead className="py-4 px-6 text-gray-900 font-bold">Rider Name</TableHead>
                  <TableHead className="py-4 px-6 text-gray-900 font-bold">Deliveries</TableHead>
                  <TableHead className="py-4 px-6 text-gray-900 font-bold">Earnings</TableHead>
                  <TableHead className="py-4 px-6 text-gray-900 font-bold">Incentives</TableHead>
                  <TableHead className="py-4 px-6 text-gray-900 font-bold">Final Payout</TableHead>
                  <TableHead className="py-4 px-6 text-gray-900 font-bold">Status</TableHead>
                  <TableHead className="py-4 px-6 text-gray-900 font-bold text-right">Actions</TableHead>
                </>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && primaryTab === 'restaurant' ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i} className="animate-pulse">
                  {Array.from({ length: 6 }).map((_, j) => (
                    <TableCell key={j}><div className="h-4 bg-gray-100 rounded w-full"></div></TableCell>
                  ))}
                </TableRow>
              ))
            ) : primaryTab === 'restaurant' ? (
              payouts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                    No payout data available
                  </TableCell>
                </TableRow>
              ) : payouts.map((row) => {
              const isExpanded = selectedPayoutId === row.payoutId;
              return (
                <React.Fragment key={row.payoutId}>
                  <TableRow 
                    className="hover:bg-gray-50/50 group cursor-pointer border-b border-gray-100 last:border-0"
                    onClick={() => setSelectedPayoutId(isExpanded ? null : row.payoutId)}
                  >
                    <TableCell className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <ChevronDown className={cn(
                          "w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-transform duration-200",
                          isExpanded && "rotate-180"
                        )} />
                        <span className="text-[14px] font-bold text-gray-900">{row.displayName}</span>
                      </div>
                    </TableCell>
                    <TableCell className="py-4 px-6 text-[14px] text-gray-700">{row.orderCount}</TableCell>
                    <TableCell className="py-4 px-6 text-[14px] font-bold text-gray-900">₹{row.gmv.toLocaleString()}</TableCell>
                    <TableCell className="py-4 px-6 text-[15px] font-bold text-[#059669]">₹{row.netPayable.toLocaleString()}</TableCell>
                    <TableCell className="py-4 px-6">
                      <div className="flex flex-col items-start gap-1">
                        <span className={cn(
                          "px-2.5 py-0.5 rounded-md text-[11px] font-bold border",
                          row.status === 'Pending' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                          row.status === 'Failed' ? 'bg-red-50 text-red-600 border-red-200' :
                          row.status === 'Processing' ? 'bg-blue-50 text-blue-600 border-blue-200' :
                          row.status === 'OnHold' ? 'bg-gray-100 text-gray-600 border-gray-200' :
                          'bg-green-50 text-green-700 border-green-200'
                        )}>
                          {row.status}
                        </span>
                        <span className="text-[11px] text-gray-400 whitespace-nowrap">
                          {row.status === 'Pending' ? 'Next: Monday 6 AM' : 
                           row.status === 'Paid' ? `Paid: ${new Date(row.paidAtUtc!).toLocaleDateString()}` :
                           row.statusNote || row.status}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="py-4 px-6 text-right relative">
                      <button 
                        disabled={row.status === 'Processing'}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (dropdownState.isOpen && dropdownState.rowId === row.payoutId) {
                            setDropdownState({ isOpen: false, rowId: null, rect: null });
                          } else {
                            const rect = e.currentTarget.getBoundingClientRect();
                            setDropdownState({ isOpen: true, rowId: row.payoutId, rect });
                          }
                        }} 
                        className="p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors ml-auto flex items-center justify-center relative z-10 disabled:opacity-30"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </TableCell>
                  </TableRow>

                  {/* Expanded Summary */}
                  {isExpanded && (
                    <TableRow className="bg-gray-50/30 border-b border-gray-100">
                      <TableCell colSpan={6} className="p-0">
                        <div className="p-6 pt-4 animate-in fade-in duration-200 text-center">
                          <p className="text-gray-500 text-sm italic">Batch ID: {row.payoutId} • Created: {new Date(row.createdAtUtc).toLocaleString()}</p>
                          <Button 
                            className="mt-3 text-xs h-8 bg-gray-900"
                            onClick={() => setSelectedRestaurantForDetails({ id: row.ownerId, name: row.displayName })}
                          >
                            View Order Level Breakdown
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              );
            })
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12">
                  <div className="flex flex-col items-center gap-2 text-gray-400">
                    <Bike className="w-8 h-8 opacity-20" />
                    <p className="text-sm">Rider Payout interface is currently in maintenance.</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Global Dropdown Portal */}
      {dropdownState.isOpen && dropdownState.rect && createPortal(
        <>
          <div 
            className="fixed inset-0 z-[100]" 
            onClick={(e) => {
              e.stopPropagation();
              setDropdownState({ isOpen: false, rowId: null, rect: null });
            }}
          />
          <div 
            className="fixed z-[110] w-52 bg-white rounded-lg shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 py-1 flex flex-col text-left overflow-hidden animate-in fade-in zoom-in-95 duration-100"
            style={{
              top: Math.min(dropdownState.rect.bottom + 4, window.innerHeight - 200),
              left: dropdownState.rect.right - 208,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {(() => {
              const row = payouts.find(r => r.payoutId === dropdownState.rowId);
              if (!row) return null;

              return (
                <>
                  {(row.status === 'Pending' || row.status === 'OnHold') && (
                    <button 
                      onClick={() => {
                        payNowMutation.mutate(row.payoutId);
                        setDropdownState({ isOpen: false, rowId: null, rect: null });
                      }}
                      className="px-4 py-2.5 text-[13px] font-bold text-[#059669] hover:bg-green-50 text-left transition-colors flex items-center gap-2"
                    >
                      <Send className="w-3.5 h-3.5" />
                      Pay Now
                    </button>
                  )}

                  {row.status === 'Pending' && (
                    <button 
                      onClick={() => {
                        const reason = window.prompt('Reason for hold:');
                        if (reason !== null) holdMutation.mutate({ id: row.payoutId, reason });
                        setDropdownState({ isOpen: false, rowId: null, rect: null });
                      }}
                      className="px-4 py-2.5 text-[13px] font-medium text-amber-700 hover:bg-amber-50 text-left transition-colors flex items-center gap-2"
                    >
                      <Pause className="w-3.5 h-3.5" />
                      Hold Payout
                    </button>
                  )}

                  {row.status === 'OnHold' && (
                    <button 
                      onClick={() => {
                        releaseHoldMutation.mutate(row.payoutId);
                        setDropdownState({ isOpen: false, rowId: null, rect: null });
                      }}
                      className="px-4 py-2.5 text-[13px] font-medium text-blue-700 hover:bg-blue-50 text-left transition-colors flex items-center gap-2"
                    >
                      <Send className="w-3.5 h-3.5" />
                      Release Hold
                    </button>
                  )}

                  {row.status === 'Failed' && (
                    <button 
                      onClick={() => {
                        retryMutation.mutate(row.payoutId);
                        setDropdownState({ isOpen: false, rowId: null, rect: null });
                      }}
                      className="px-4 py-2.5 text-[13px] font-medium text-gray-700 hover:bg-gray-50 text-left transition-colors flex items-center gap-2"
                    >
                      <Clock className="w-3.5 h-3.5" />
                      Retry Payout
                    </button>
                  )}

                  <div className="h-[1px] bg-gray-100 my-1" />
                  
                  <button 
                    onClick={() => {
                      setSelectedRestaurantForDetails({ id: row.ownerId, name: row.displayName });
                      setDropdownState({ isOpen: false, rowId: null, rect: null });
                    }}
                    className="px-4 py-2.5 text-[13px] font-medium text-gray-700 hover:bg-gray-50 text-left transition-colors"
                  >
                    View Breakdown
                  </button>
                </>
              );
            })()}
          </div>
        </>,
        document.body
      )}
    </div>
  );
}
