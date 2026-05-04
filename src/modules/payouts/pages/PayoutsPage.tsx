import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useQuery } from '@tanstack/react-query';
import { restaurantService } from '@/core/api/restaurants';
import { ordersService } from '@/core/api/orders';
import { 
  Store, 
  Bike, 
  Calendar, 
  ChevronDown, 
  MoreVertical,
  X,
  Pause,
  Send,
  TrendingDown,
  DollarSign,
  Clock
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import OrderLevelBreakdown from '../components/OrderLevelBreakdown';

// The stats are computed dynamically within the component now.

export default function PayoutsPage() {
  const [primaryTab, setPrimaryTab] = useState<'restaurant' | 'rider'>('restaurant');
  const [secondaryTab, setSecondaryTab] = useState<'current' | 'pending' | 'history'>('current');
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);
  const [selectedRestaurantForDetails, setSelectedRestaurantForDetails] = useState<{ id: string; name: string } | null>(null);
  const [dropdownState, setDropdownState] = useState<{
    isOpen: boolean;
    rowId: string | null;
    rect: DOMRect | null;
  }>({ isOpen: false, rowId: null, rect: null });
  const [holdModalRestaurant, setHoldModalRestaurant] = useState<{ id: string; name: string } | null>(null);
  const [reinitiateModalRestaurant, setReinitiateModalRestaurant] = useState<{ id: string; name: string; amount: string } | null>(null);

  const { data: restaurantsResponse, isLoading: isLoadingRestaurants } = useQuery({
    queryKey: ['restaurants-payouts'],
    queryFn: () => restaurantService.getRestaurants({ pageSize: 100 }),
  });

  const { data: ordersResponse, isLoading: isLoadingOrders } = useQuery({
    queryKey: ['orders-payouts'],
    queryFn: () => ordersService.getOrders({ pageSize: 1000 }),
  });

  const tableData = useMemo(() => {
    if (!restaurantsResponse?.restaurants || !ordersResponse?.items) return [];

    const restaurants = restaurantsResponse.restaurants;
    const orders = ordersResponse.items;

    return restaurants.map((restaurant, idx) => {
      const restaurantOrders = orders.filter(
        o => o.restaurantName === restaurant.name && !['Cancelled', 'Failed', 'escalated'].includes(o.status)
      );
      
      const ordersCount = restaurantOrders.length;
      if (ordersCount === 0) return null;

      const gmv = restaurantOrders.reduce((acc, order) => acc + (order.total || 0), 0);
      const deliveryFee = ordersCount * 40;
      const foodRevenue = Math.max(0, gmv - deliveryFee);
      const gstOnFood = foodRevenue * 0.05;
      const deliveryGst = deliveryFee * 0.18;
      
      const commissionPercentage = restaurant.commissionPercentage || 15;
      const commissionAmount = foodRevenue * (commissionPercentage / 100);
      const riderEarnings = deliveryFee * 0.8;
      const deliverySubsidy = ordersCount * 10;
      const netPayable = foodRevenue - commissionAmount;
      const platformProfit = commissionAmount - deliverySubsidy;

      const refundedOrders = orders.filter(
        o => o.restaurantName === restaurant.name && o.status === 'Cancelled'
      );
      const refundAmount = refundedOrders.reduce((acc, order) => acc + (order.total || 0), 0);

      const statusOptions: any = [
        { status: 'Pending', substatus: 'Waiting for next auto-run', statusType: 'warning' },
        { status: 'Processing', substatus: 'Amount not debited and not credited', statusType: 'info' },
        { status: 'Paid', substatus: 'Completed successfully', statusType: 'success' },
        { status: 'Failed', substatus: 'Bank issue during transaction', statusType: 'danger' }
      ];
      const randomStatus = statusOptions[idx % statusOptions.length];

      return {
        id: restaurant.id,
        name: restaurant.name,
        orders: ordersCount,
        gmv: `₹${gmv.toFixed(0)}`,
        net: `₹${netPayable.toFixed(0)}`,
        status: randomStatus.status,
        substatus: randomStatus.substatus,
        statusType: randomStatus.statusType,
        details: {
          foodRevenue: `₹${foodRevenue.toFixed(0)}`,
          gstOnFood: `₹${gstOnFood.toFixed(0)}`,
          deliveryFee: `₹${deliveryFee.toFixed(0)}`,
          deliveryGst: `₹${deliveryGst.toFixed(0)}`,
          commissionPercentage: `${commissionPercentage}%`,
          commissionAmount: `₹${commissionAmount.toFixed(0)}`,
          riderEarnings: `₹${riderEarnings.toFixed(0)}`,
          deliverySubsidy: `₹${deliverySubsidy.toFixed(0)}`,
          restaurantPayout: `₹${netPayable.toFixed(0)}`,
          platformProfit: `₹${platformProfit.toFixed(0)}`,
          refunds: `₹${refundAmount.toFixed(0)}`,
          refundOrders: refundedOrders.length
        }
      };
    }).filter(Boolean) as any[];
  }, [restaurantsResponse, ordersResponse]);

  const riderTableData = useMemo(() => {
    return [
      {
        id: 'r1',
        name: 'Rohit Mehta',
        deliveries: 87,
        earnings: 13940,
        incentives: 1740,
        status: 'Pending',
        details: {
          totalDeliveryFees: 8700,
          baseAndDistance: 11310,
          platformSubsidy: 890
        }
      },
      {
        id: 'r2',
        name: 'Kavita Patil',
        deliveries: 92,
        earnings: 14900,
        incentives: 1820,
        status: 'Pending',
        details: {
          totalDeliveryFees: 9200,
          baseAndDistance: 12100,
          platformSubsidy: 980
        }
      }
    ];
  }, []);

  const stats = useMemo(() => {
    let pendingCount = 0;
    let pendingAmount = 0;
    let failedAmount = 0;
    let totalPlatformProfit = 0;

    tableData.forEach(row => {
      const netVal = parseFloat(row.net.replace(/[^0-9.-]+/g, "")) || 0;
      const profitVal = parseFloat(row.details.platformProfit.replace(/[^0-9.-]+/g, "")) || 0;

      totalPlatformProfit += profitVal;

      if (row.status === 'Pending') {
        pendingCount++;
        pendingAmount += netVal;
      } else if (row.status === 'Failed') {
        failedAmount += netVal;
      }
    });

    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + ((1 + 7 - nextDate.getDay()) % 7 || 7));
    const lastDate = new Date(nextDate);
    lastDate.setDate(lastDate.getDate() - 7);

    if (primaryTab === 'rider') {
      return [
        { label: 'Total Riders Pending', value: '28', type: 'neutral', icon: <Clock className="w-4 h-4 text-[#ea580c]" /> },
        { label: 'Total Earnings', value: '₹1,12,340', type: 'neutral', icon: <DollarSign className="w-4 h-4 text-[#059669]" /> },
        { label: 'Subsidy Impact', value: '₹28,972', type: 'danger', icon: <TrendingDown className="w-4 h-4 text-[#d72b1f]" /> },
        { 
          label: 'Next Auto-run', 
          value: `Apr 17, 2026 at 11:00 PM`, 
          type: 'neutral', 
          icon: null 
        },
        { 
          label: 'Last Auto-run', 
          value: `Apr 14 • ₹3,87,450\npaid`, 
          type: 'neutral', 
          icon: null 
        }
      ];
    }

    return [
      { label: 'Pending Payouts', value: pendingCount.toString(), type: 'neutral', icon: null },
      { label: 'Total Pending Amount', value: `₹${pendingAmount.toLocaleString()}`, type: 'info', icon: '₹' },
      { label: 'Failed Payments', value: `₹${failedAmount.toLocaleString()}`, type: 'danger', icon: '!' },
      { label: 'Platform Profit', value: `₹${totalPlatformProfit.toLocaleString()}`, type: 'success', icon: '↗' },
      { label: 'Next Auto-run', value: `${nextDate.toLocaleString('default', { month: 'short' })} ${nextDate.getDate()}, 9:00 AM`, type: 'neutral', icon: null },
      { label: 'Last Auto-run', value: `${lastDate.toLocaleString('default', { month: 'short' })} ${lastDate.getDate()} • Paid`, type: 'neutral', icon: null },
    ];
  }, [tableData, primaryTab]);

  const isLoading = isLoadingRestaurants || isLoadingOrders;

  if (selectedRestaurantForDetails) {
    return (
      <OrderLevelBreakdown 
        restaurantId={selectedRestaurantForDetails.id}
        restaurantName={selectedRestaurantForDetails.name}
        onBack={() => setSelectedRestaurantForDetails(null)} 
      />
    );
  }

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
                  <TableHead className="py-4 px-6 text-gray-900 font-bold">GMV (Customer Payment)</TableHead>
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
              tableData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                    No payout data available for current cycle
                  </TableCell>
                </TableRow>
              ) : tableData.map((row, index) => {
              const isExpanded = expandedRowId === row.id;
              const isLastRows = index >= tableData.length - 2 && tableData.length > 2;

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
                    <TableCell className="py-4 px-6 text-right relative">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          if (dropdownState.isOpen && dropdownState.rowId === row.id) {
                            setDropdownState({ isOpen: false, rowId: null, rect: null });
                          } else {
                            const rect = e.currentTarget.getBoundingClientRect();
                            setDropdownState({ isOpen: true, rowId: row.id, rect });
                          }
                        }} 
                        className="p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors ml-auto flex items-center justify-center relative z-10"
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
                                <p className="text-[18px] font-bold text-[#059669]">{row.gmv}</p>
                              </div>
                            </div>

                            {/* BREAKDOWN */}
                            <div>
                              <h4 className="text-[10px] font-bold text-gray-400 tracking-wider uppercase mb-2">Breakdown</h4>
                              <div className="space-y-2 text-[12px]">
                                <div className="flex justify-between items-center text-gray-600 font-medium">
                                  <span>Food Revenue</span>
                                  <span className="text-gray-900 font-bold">{row.details.foodRevenue}</span>
                                </div>
                                <div className="flex justify-between items-center text-purple-600 font-medium">
                                  <span className="flex items-center gap-1">GST on Food (5%) <span className="w-3 h-3 rounded-full border border-purple-200 flex items-center justify-center text-[8px]">i</span></span>
                                  <span className="font-bold">{row.details.gstOnFood}</span>
                                </div>
                                <div className="flex justify-between items-center text-gray-600 font-medium pt-1">
                                  <span>Delivery Fee</span>
                                  <span className="text-gray-900 font-bold">{row.details.deliveryFee}</span>
                                </div>
                                <div className="flex justify-between items-center text-purple-600 font-medium">
                                  <span className="flex items-center gap-1">Delivery GST (18%) <span className="w-3 h-3 rounded-full border border-purple-200 flex items-center justify-center text-[8px]">i</span></span>
                                  <span className="font-bold">{row.details.deliveryGst}</span>
                                </div>
                              </div>
                            </div>

                            {/* EARNINGS & COSTS */}
                            <div>
                              <h4 className="text-[10px] font-bold text-gray-400 tracking-wider uppercase mb-2">Earnings & Costs</h4>
                              <div className="space-y-2 text-[12px]">
                                <div className="flex justify-between items-center text-gray-600 font-medium">
                                  <span className="flex items-center gap-1">Commission ({row.details.commissionPercentage}) <span className="w-3 h-3 rounded-full border border-gray-300 flex items-center justify-center text-[8px]">i</span></span>
                                  <span className="text-[#059669] font-bold">{row.details.commissionAmount}</span>
                                </div>
                                <div className="flex justify-between items-center text-gray-600 font-medium">
                                  <span>Rider Earnings</span>
                                  <span className="text-gray-900 font-bold">{row.details.riderEarnings}</span>
                                </div>
                                <div className="flex justify-between items-center text-[#d72b1f] font-medium pt-1">
                                  <span className="flex items-center gap-1">Delivery Subsidy <span className="w-3 h-3 rounded-full border border-red-200 flex items-center justify-center text-[8px]">i</span></span>
                                  <span className="font-bold">{row.details.deliverySubsidy}</span>
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
                              <p className="text-[20px] font-bold text-[#ea580c] mb-1">{row.details.restaurantPayout}</p>
                              <p className="text-[11px] text-orange-600/70 font-medium">Food Revenue - Commission</p>
                            </div>

                            {/* Platform Profit */}
                            <div className="bg-[#ecfdf5] border border-green-100 rounded-lg p-4">
                              <p className="text-[11px] font-bold text-[#059669] mb-0.5">Platform Profit</p>
                              <p className="text-[20px] font-bold text-[#059669] mb-1">{row.details.platformProfit}</p>
                              <p className="text-[11px] text-[#059669]/70 font-medium">Commission - Subsidy</p>
                            </div>
                          </div>

                          {/* Bottom Section: Refunds */}
                          <div className="bg-[#fff5f5] border border-red-100 rounded-lg p-4 flex justify-between items-center">
                            <div>
                              <p className="text-[12px] font-bold text-[#d72b1f]">Refunds</p>
                              <p className="text-[11px] text-[#d72b1f]/70 font-medium">{row.details.refundOrders} orders refunded</p>
                            </div>
                            <p className="text-[16px] font-bold text-[#d72b1f]">{row.details.refunds}</p>
                          </div>

                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              );
            })
            ) : (
              riderTableData.map((row) => {
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
                      <TableCell className="py-4 px-6 text-[14px] text-gray-600 font-medium">{row.deliveries}</TableCell>
                      <TableCell className="py-4 px-6 text-[14px] text-gray-600 font-medium">₹{row.earnings.toLocaleString()}</TableCell>
                      <TableCell className="py-4 px-6 text-[14px] text-gray-600 font-medium">₹{row.incentives.toLocaleString()}</TableCell>
                      <TableCell className="py-4 px-6 text-[14px] font-bold text-[#059669]">₹{(row.earnings + row.incentives).toLocaleString()}</TableCell>
                      <TableCell className="py-4 px-6">
                        <div className="flex flex-col items-start gap-1">
                          <span className={cn(
                            "px-2.5 py-0.5 rounded-md text-[11px] font-bold border",
                            row.status === 'Pending' ? "bg-orange-50 text-orange-600 border-orange-200" :
                            row.status === 'Paid' ? "bg-green-50 text-green-600 border-green-200" :
                            "bg-red-50 text-red-600 border-red-200"
                          )}>
                            {row.status}
                          </span>
                          <span className="text-[11px] text-gray-500 font-medium whitespace-nowrap">
                            {row.status === 'Pending' ? 'Waiting for next auto-run' : 'Processed successfully'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="py-4 px-4 text-right">
                        <button className="p-1.5 text-gray-400 hover:text-gray-900 rounded-md transition-colors ml-auto flex items-center justify-center">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </TableCell>
                    </TableRow>
                    
                    {isExpanded && (
                      <TableRow className="bg-gray-50/30">
                        <TableCell colSpan={7} className="p-0 border-b border-gray-100">
                          <div className="p-6 pt-2 pb-6 animate-in fade-in slide-in-from-top-2 duration-200">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              
                              <div className="bg-[#f0f9ff] border border-[#bae6fd] rounded-lg p-4">
                                <p className="text-[11px] font-bold text-[#0284c7] mb-0.5">Total Delivery Fees</p>
                                <p className="text-[20px] font-bold text-[#0369a1]">₹{row.details.totalDeliveryFees.toLocaleString()}</p>
                              </div>

                              <div className="bg-[#ecfdf5] border border-[#a7f3d0] rounded-lg p-4">
                                <p className="text-[11px] font-bold text-[#059669] mb-0.5">Base + Distance</p>
                                <p className="text-[20px] font-bold text-[#047857]">₹{row.details.baseAndDistance.toLocaleString()}</p>
                              </div>

                              <div className="bg-[#fff1f2] border border-[#fecdd3] rounded-lg p-4">
                                <p className="text-[11px] font-bold text-[#e11d48] mb-0.5">Platform Subsidy</p>
                                <p className="text-[20px] font-bold text-[#be123c]">₹{row.details.platformSubsidy.toLocaleString()}</p>
                              </div>

                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                );
              })
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
              top: Math.min(dropdownState.rect.bottom + 4, window.innerHeight - 150),
              left: dropdownState.rect.right - 208,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={() => {
                const restaurant = tableData.find(r => r.id === dropdownState.rowId);
                if (restaurant) {
                  setHoldModalRestaurant({ id: restaurant.id, name: restaurant.name });
                  setDropdownState({ isOpen: false, rowId: null, rect: null });
                }
              }}
              className="px-4 py-2.5 text-[13px] font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700 text-left transition-colors"
            >
              Hold Payment
            </button>
            <button 
              onClick={() => {
                const restaurant = tableData.find(r => r.id === dropdownState.rowId);
                if (restaurant) {
                  setSelectedRestaurantForDetails({ id: restaurant.id, name: restaurant.name });
                  setDropdownState({ isOpen: false, rowId: null, rect: null });
                }
              }}
              className="px-4 py-2.5 text-[13px] font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700 text-left transition-colors"
            >
              View Order Level Breakdown
            </button>
            <button 
              onClick={() => {
                const restaurant = tableData.find(r => r.id === dropdownState.rowId);
                if (restaurant) {
                  setReinitiateModalRestaurant({ id: restaurant.id, name: restaurant.name, amount: restaurant.net });
                  setDropdownState({ isOpen: false, rowId: null, rect: null });
                }
              }}
              className="px-4 py-2.5 text-[13px] font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700 text-left transition-colors"
            >
              Reinitiate Payment
            </button>
          </div>
        </>,
        document.body
      )}

      {/* Hold Payout Modal */}
      {holdModalRestaurant && createPortal(
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-[500px] overflow-hidden flex flex-col scale-in-center">
            
            <div className="flex items-start justify-between p-6 pb-4">
              <div>
                <h2 className="text-[18px] font-bold text-gray-900">Hold Payout</h2>
                <p className="text-[13px] text-gray-500 mt-1">Place payout on hold for {holdModalRestaurant.name}</p>
              </div>
              <button 
                onClick={() => setHoldModalRestaurant(null)}
                className="p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-6 pb-6 flex flex-col gap-5">
              <div>
                <label className="block text-[13px] font-bold text-gray-900 mb-2">Reason for Hold (Required)</label>
                <textarea 
                  placeholder="Enter reason for holding this payout..." 
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-[14px] text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all min-h-[100px] resize-none"
                />
              </div>

              <div className="bg-[#fffdf5] border border-orange-200 rounded-xl p-4">
                <p className="text-[12px] leading-relaxed text-[#d97706]">
                  <span className="font-bold">Note:</span> This payout will be skipped from automatic runs until hold is released.
                </p>
              </div>
            </div>

            <div className="p-6 pt-0 flex items-center justify-center gap-3">
              <button 
                onClick={() => setHoldModalRestaurant(null)}
                className="px-6 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-[14px] font-bold rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button 
                className="flex items-center gap-2 px-6 py-2.5 bg-[#ea580c] hover:bg-[#c2410c] text-white text-[14px] font-bold rounded-xl transition-colors shadow-sm"
              >
                <Pause className="w-4 h-4 fill-white" />
                Confirm Hold
              </button>
            </div>

          </div>
        </div>,
        document.body
      )}

      {/* Reinitiate Payment Modal */}
      {reinitiateModalRestaurant && createPortal(
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-[500px] overflow-hidden flex flex-col scale-in-center">
            
            <div className="flex items-start justify-between p-6 pb-4">
              <div>
                <h2 className="text-[18px] font-bold text-gray-900">Reinitiate Payment</h2>
                <p className="text-[13px] text-gray-500 mt-1">Re-initiate payment for {reinitiateModalRestaurant.name}</p>
              </div>
              <button 
                onClick={() => setReinitiateModalRestaurant(null)}
                className="p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-6 pb-6 flex flex-col gap-5">
              <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <span className="text-[13px] text-gray-500 font-medium">Amount to Pay:</span>
                  <span className="text-[16px] font-bold text-[#059669]">{reinitiateModalRestaurant.amount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[13px] text-gray-500 font-medium">Account:</span>
                  <span className="text-[14px] font-bold text-gray-900">****4532</span>
                </div>
              </div>
            </div>

            <div className="p-6 pt-0 flex items-center justify-center gap-3">
              <button 
                onClick={() => setReinitiateModalRestaurant(null)}
                className="px-6 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-[14px] font-bold rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button 
                className="flex items-center gap-2 px-6 py-2.5 bg-[#8a1827] hover:bg-[#6b131e] text-white text-[14px] font-bold rounded-xl transition-colors shadow-sm"
              >
                <Send className="w-4 h-4" />
                Reinitiate Payment
              </button>
            </div>

          </div>
        </div>,
        document.body
      )}

    </div>
  );
}
