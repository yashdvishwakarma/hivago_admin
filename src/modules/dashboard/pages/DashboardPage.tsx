import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Package,
  CheckCircle2,
  Bike,
  IdCard,
  Store,
  Clock,
  X,
  Eye
} from 'lucide-react';
import { dashboardService } from '@/core/api/dashboard';
import SplashBg from '@/assets/splash_bg.svg';
import AlertResolutionModal, { type AlertData } from '../components/AlertResolutionModal';
import AssignRiderModal from '../components/AssignRiderModal';
import OrderDetailsModal, { type OrderDetailsData } from '../components/OrderDetailsModal';
import RefundModal from '../components/RefundModal';

export default function DashboardPage() {
  const [selectedAlert, setSelectedAlert] = useState<AlertData | null>(null);
  const [isAssignRiderOpen, setIsAssignRiderOpen] = useState(false);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<OrderDetailsData | null>(null);
  const [refundOrderNumber, setRefundOrderNumber] = useState<string | null>(null);

  const { data: stats, isLoading: isStatsLoading } = useQuery({
    queryKey: ['adminStats'],
    queryFn: dashboardService.getStats,
    refetchInterval: 30000,
  });

  const { data: alerts, isLoading: isAlertsLoading } = useQuery({
    queryKey: ['adminAlerts'],
    queryFn: () => dashboardService.getAlerts(),
    refetchInterval: 15000,
  });

  const { data: liveOrdersData, isLoading: isLiveOrdersLoading } = useQuery({
    queryKey: ['adminLiveOrders'],
    queryFn: () => dashboardService.getLiveOrders(),
    refetchInterval: 15000,
  });

  // Use live stats if available
  const displayStats = {
    activeOrders: stats?.activeOrders ?? 23,
    ordersToday: stats?.todayOrders ?? 147,
    ridersOnline: stats?.onlineRiders ?? 18,
    pendingKyc: stats?.pendingKyc ?? 5,
    activeRestaurants: stats?.activeRestaurants ?? 42
  };

  const alertsArray = Array.isArray(alerts) ? alerts : ((alerts as any)?.items || (alerts as any)?.alerts);

  const displayAlerts = alertsArray ? alertsArray : [
    {
      id: '1',
      type: 'escalated',
      title: 'Order Escalated',
      message: 'Order #OR-8821 is delayed by 18 minutes',
      actionText: 'View Order',
      orderNumber: '#OR-8821'
    },
    {
      id: '2',
      type: 'failed',
      title: 'Dispatch Failed',
      message: 'Delivery status = Failed for #OR-8804',
      actionText: 'View Order',
      orderNumber: '#OR-8804'
    },
    {
      id: '3',
      type: 'stuck',
      title: 'Stuck in Dispatch',
      message: 'Order confirmed but no rider assigned for 12 min - #OR-8819',
      actionText: 'View + Manual Assign',
      orderNumber: '#OR-8819'
    },
    {
      id: '4',
      type: 'awaiting',
      title: 'Awaiting Restaurant Confirmation',
      message: 'Order placed but not yet accepted by the restaurant.',
      actionText: 'Contact Restaurant',
      orderNumber: '#OR-8819'
    }
  ];

  const liveOrdersArray = Array.isArray(liveOrdersData) ? liveOrdersData : ((liveOrdersData as any)?.items || (liveOrdersData as any)?.orders);

  const liveOrders = liveOrdersArray ? liveOrdersArray.map((order: any) => ({
    id: order.orderNumber || order.id || 'Unknown',
    time: order.createdAt ? new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '14:32',
    price: `₹${order.totalAmount || order.total || 0}`,
    delay: order.delayMinutes ? `+${order.delayMinutes}m delay` : null,
    tags: order.tags || [order.status || 'Active'],
    customer: order.customerName || 'Customer',
    items: `${order.totalItems || order.itemCount || 1} items`,
    restaurant: order.restaurantName || 'Restaurant',
    rider: order.riderName || 'Unassigned',
    originalOrder: order
  })) : [
    {
      id: 'OR-8821',
      time: '14:32',
      price: '₹850',
      delay: '+18m delay',
      tags: ['escalated', 'Escalated'],
      customer: 'Priya Deshmukh',
      items: '3 items',
      restaurant: 'Pizza Paradise',
      rider: 'Rohit M.'
    },
    {
      id: 'OR-8820',
      time: '14:35',
      price: '₹560',
      delay: null,
      tags: ['delivering'],
      customer: 'Amit Singh',
      items: '2 items',
      restaurant: 'Burger Hub',
      rider: 'Kavita P.'
    }
  ];

  return (
    <div className="w-full">
      <AlertResolutionModal
        isOpen={!!selectedAlert}
        onClose={() => setSelectedAlert(null)}
        alert={selectedAlert}
        onAssignRider={() => setIsAssignRiderOpen(true)}
      />

      <AssignRiderModal
        isOpen={isAssignRiderOpen}
        onClose={() => setIsAssignRiderOpen(false)}
        orderNumber={selectedAlert?.orderNumber || 'OR-0000'}
      />

      <OrderDetailsModal
        isOpen={!!selectedOrderDetails}
        onClose={() => setSelectedOrderDetails(null)}
        order={selectedOrderDetails}
        onInitiateRefund={() => {
          if (selectedOrderDetails) {
            setRefundOrderNumber(selectedOrderDetails.orderNumber);
            setSelectedOrderDetails(null);
          }
        }}
      />

      <RefundModal
        isOpen={!!refundOrderNumber}
        onClose={() => setRefundOrderNumber(null)}
        orderNumber={refundOrderNumber}
        onConfirm={(reason) => {
          console.log(`Refund initiated for ${refundOrderNumber} with reason: ${reason}`);
        }}
      />

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-[28px] font-bold text-gray-900 tracking-tight">Live Operations</h1>
          <p className="text-[13px] text-gray-500 mt-1 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            {new Date().toLocaleTimeString('en-US', { hour12: false })} • Real-time monitoring
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-xs font-semibold">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          Live
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        {isStatsLoading ? (
          <>
            <KpiCardSkeleton />
            <KpiCardSkeleton />
            <KpiCardSkeleton />
            <KpiCardSkeleton />
            <KpiCardSkeleton />
          </>
        ) : (
          <>
            <KpiCard title="Active Orders" value={displayStats.activeOrders} icon={<Package className="w-[18px] h-[18px]" />} />
            <KpiCard title="Orders Today" value={displayStats.ordersToday} icon={<CheckCircle2 className="w-[18px] h-[18px]" />} />
            <KpiCard title="Riders Online" value={displayStats.ridersOnline} icon={<Bike className="w-[18px] h-[18px]" />} />
            <KpiCard title="Pending KYC" value={displayStats.pendingKyc} icon={<IdCard className="w-[18px] h-[18px]" />} />
            <KpiCard title="Active Restaurants" value={displayStats.activeRestaurants} icon={<Store className="w-[18px] h-[18px]" />} />
          </>
        )}
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Alerts */}
        <div>
          <div className="mb-4">
            <h2 className="text-[17px] font-bold text-gray-900">Alerts</h2>
            <p className="text-[13px] text-[#d72b1f] font-medium mt-0.5">{displayAlerts.length} active alerts</p>
          </div>

          <div className="space-y-4">
            {isAlertsLoading ? (
              <>
                <AlertSkeleton />
                <AlertSkeleton />
                <AlertSkeleton />
              </>
            ) : displayAlerts.map((alert: any) => (
              <div
                key={alert.id}
                onClick={() => setSelectedAlert(alert)}
                className={`relative rounded-2xl p-5 border shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition-shadow ${alert.type === 'stuck' ? 'bg-[#fffdf5] border-orange-100' :
                    alert.type === 'awaiting' ? 'bg-[#fff5eb] border-orange-200' :
                      alert.type === 'pending_kyc' ? 'bg-[#f5f3ff] border-purple-100' :
                        'bg-[#fff5f5] border-red-50'
                  }`}
              >
                {/* Splash background */}
                <img
                  src={SplashBg}
                  alt=""
                  className="absolute bottom-0 left-0 w-6 h-6 object-contain opacity-40 pointer-events-none"
                />

                <button
                  className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 z-10"
                  onClick={(e) => {
                    e.stopPropagation();
                    // Handle dismiss logic if needed
                  }}
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="relative z-10">
                  <h3 className={`font-bold text-[15px] mb-1 ${alert.type === 'stuck' || alert.type === 'awaiting' ? 'text-orange-700' :
                      alert.type === 'pending_kyc' ? 'text-purple-700' :
                        'text-[#d72b1f]'
                    }`}>
                    {alert.title}
                  </h3>
                  <p className={`text-[13px] mb-4 ${alert.type === 'stuck' || alert.type === 'awaiting' ? 'text-orange-800/80' :
                      alert.type === 'pending_kyc' ? 'text-purple-800/80' :
                        'text-[#d72b1f]/80'
                    }`}>
                    {alert.message}
                  </p>
                  <button className={`px-4 py-1.5 rounded-full text-[13px] font-semibold bg-white shadow-sm border ${alert.type === 'stuck' || alert.type === 'awaiting' ? 'border-orange-200 text-orange-700 hover:bg-orange-50' :
                      alert.type === 'pending_kyc' ? 'border-purple-200 text-purple-700 hover:bg-purple-50' :
                        'border-red-100 text-[#d72b1f] hover:bg-red-50'
                    }`}>
                    {alert.actionText}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column - Live Order Feed */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-[17px] font-bold text-gray-900">Live Order Feed</h2>
              <p className="text-[13px] text-gray-500 mt-0.5">Real-time order updates</p>
            </div>
            <div className="px-2.5 py-1 rounded-full border bg-white text-[11px] font-semibold text-gray-600">
              7 Active
            </div>
          </div>

          <div className="bg-white rounded-2xl border shadow-sm divide-y">
            {isLiveOrdersLoading ? (
              <>
                <LiveOrderSkeleton />
                <LiveOrderSkeleton />
                <LiveOrderSkeleton />
              </>
            ) : liveOrders.map((order: any) => (
              <div key={order.id} className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-[15px] text-gray-900">{order.id}</h3>
                      <button
                        onClick={() => {
                          const og = order.originalOrder || {};
                          setSelectedOrderDetails({
                            id: order.id,
                            orderId: og.orderId,
                            originalOrder: og,
                            orderNumber: order.id,
                            time: og.createdAt ? new Date(og.createdAt).toLocaleString() : new Date().toLocaleString(),
                            statusType: og.isEscalated || og.status === 'Failed' ? 'critical' : 'warning',
                            statusTitle: og.status || 'Active',
                            statusDescription: og.delayMinutes ? `Delayed by ${og.delayMinutes} minutes` : 'Order processing',
                            customerName: order.customer,
                            customerPhone: og.customerPhone || "+91 88888 12345",
                            customerAddress: og.customerAddress || "Address details not provided by API",
                            restaurantName: order.restaurant,
                            restaurantAddress: og.restaurantAddress || "Address details not provided by API",
                            items: og.items || Array.from({ length: og.itemCount || og.totalItems || 1 }).map((_, i) => ({
                              name: `Item ${i + 1}`,
                              quantity: 1
                            })),
                            totalAmount: order.price,
                            timeline: og.timeline || [
                              { status: "Placed", time: og.createdAt ? new Date(og.createdAt).toLocaleString() : new Date().toLocaleString() }
                            ]
                          });
                        }}
                        className="text-gray-400 hover:text-blue-600 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-[12px] text-gray-500 mt-0.5">{order.time}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-[15px] text-gray-900">{order.price}</p>
                    <p className="text-[12px] text-gray-500 mt-0.5">{order.time}</p>
                    {order.delay && <p className="text-[12px] font-semibold text-[#d72b1f] mt-0.5">{order.delay}</p>}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {order.tags.map((tag: string, idx: number) => (
                    <span
                      key={idx}
                      className={`px-2 py-0.5 rounded-full text-[11px] font-bold border ${tag.toLowerCase() === 'escalated'
                          ? 'bg-[#fff5f5] text-[#d72b1f] border-red-100'
                          : 'bg-green-50 text-green-700 border-green-100'
                        }`}
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[13px]">
                    <span className="font-medium text-gray-900">{order.customer}</span>
                    <span className="text-gray-500">{order.items}</span>
                  </div>
                  <div className="flex items-center justify-between text-[13px]">
                    <span className="text-gray-600">{order.restaurant}</span>
                    <span className="font-medium text-green-600">{order.rider}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function KpiCard({ title, value, icon }: { title: string; value: number | string; icon: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl p-5 border shadow-sm flex flex-col relative overflow-hidden group">
      <div className="text-[13px] font-semibold text-gray-500 mb-2">{title}</div>
      <div className="text-[32px] font-bold text-gray-900 leading-none tracking-tight">{value}</div>
      <div className="absolute top-5 right-5 w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-600 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
        {icon}
      </div>
    </div>
  );
}

function KpiCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-5 border shadow-sm flex flex-col relative overflow-hidden animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-24 mb-3"></div>
      <div className="h-8 bg-gray-200 rounded w-16 mt-1"></div>
      <div className="absolute top-5 right-5 w-10 h-10 rounded-full bg-gray-100"></div>
    </div>
  );
}

function AlertSkeleton() {
  return (
    <div className="relative rounded-2xl p-5 border shadow-sm overflow-hidden bg-gray-50/50 animate-pulse">
      <div className="w-6 h-6 absolute bottom-0 left-0 bg-gray-200 opacity-40 rounded-tr-xl"></div>
      <div className="w-4 h-4 absolute top-4 right-4 bg-gray-200 rounded-full"></div>
      <div className="relative z-10">
        <div className="h-4 bg-gray-200 rounded w-1/3 mb-3"></div>
        <div className="h-3 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-3 bg-gray-200 rounded w-1/2 mb-5"></div>
        <div className="h-7 bg-gray-200 rounded-full w-28"></div>
      </div>
    </div>
  );
}

function LiveOrderSkeleton() {
  return (
    <div className="p-5 animate-pulse">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-12"></div>
        </div>
        <div className="text-right flex flex-col items-end">
          <div className="h-4 bg-gray-200 rounded w-16 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-12"></div>
        </div>
      </div>
      <div className="flex gap-2 mb-4">
        <div className="h-5 bg-gray-200 rounded-full w-16"></div>
        <div className="h-5 bg-gray-200 rounded-full w-20"></div>
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="h-3 bg-gray-200 rounded w-24"></div>
          <div className="h-3 bg-gray-200 rounded w-16"></div>
        </div>
        <div className="flex items-center justify-between">
          <div className="h-3 bg-gray-200 rounded w-32"></div>
          <div className="h-3 bg-gray-200 rounded w-20"></div>
        </div>
      </div>
    </div>
  );
}
