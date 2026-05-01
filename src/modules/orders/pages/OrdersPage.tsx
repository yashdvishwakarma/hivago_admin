import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Search, 
  Filter, 
  Download, 
  ShoppingBag, 
  Users, 
  XCircle, 
  Eye, 
  History,
  ChevronDown,
  AlertCircle
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { ordersService, type OrderStatus } from '@/core/api/orders';
import { cn } from '@/utils/cn';
import { format } from 'date-fns';
import OrderDetailsModal, { type OrderDetailsData } from '../../dashboard/components/OrderDetailsModal';

const TABS = [
  { id: 'all', label: 'All Orders', icon: ShoppingBag, activeColor: 'text-[#059669]', activeBg: 'bg-[#ecfdf5]', activeBorder: 'border-[#059669]' },
  { id: 'active', label: 'Active', icon: Users, activeColor: 'text-gray-900', activeBg: 'bg-gray-50', activeBorder: 'border-gray-900' },
  { id: 'escalated', label: 'Escalated', icon: AlertCircle, activeColor: 'text-gray-900', activeBg: 'bg-gray-50', activeBorder: 'border-gray-900' },
  { id: 'failed', label: 'Failed', icon: History, activeColor: 'text-gray-900', activeBg: 'bg-gray-50', activeBorder: 'border-gray-900' },
];

export default function OrdersPage() {
  const [activeTab, setActiveTab] = useState<OrderStatus>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<OrderDetailsData | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['orders', activeTab, searchTerm, statusFilter],
    queryFn: () => ordersService.getOrders({ 
      status: activeTab === 'all' ? (statusFilter === 'all' ? undefined : statusFilter) : activeTab, 
      search: searchTerm || undefined,
      page: 1,
      pageSize: 20
    }),
  });

  const orders = data?.items || [];
  const counts = data?.counts || { all: 0, active: 0, escalated: 0, failed: 0 };

  const handleExport = async () => {
    try {
      const blob = await ordersService.exportOrders({ status: activeTab, search: searchTerm });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `orders-export-${format(new Date(), 'yyyy-MM-dd')}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed', error);
    }
  };

  const getStatusBadgeVariant = (status: string): any => {
    switch (status.toLowerCase()) {
      case 'escalated': return 'escalated';
      case 'delivering': return 'delivering';
      case 'preparing': return 'preparing';
      case 'completed': return 'completed';
      case 'failed':
      case 'cancelled': return 'failed';
      case 'readyforpickup':
      case 'ready': return 'success';
      default: return 'secondary';
    }
  };

  return (
    <div className="space-y-6 pb-10">
      <OrderDetailsModal
        isOpen={!!selectedOrderDetails}
        onClose={() => setSelectedOrderDetails(null)}
        order={selectedOrderDetails}
      />

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Orders Management</h1>
        <p className="text-gray-500 mt-1">View and manage all orders</p>
      </div>

      {/* Filter Row */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
        <div className="relative flex-1 w-full max-w-xl">
          <Input 
            placeholder="Search by order ID, customer, or restaurant..." 
            className="bg-gray-50 border-none h-11"
            icon={<Search className="h-4 w-4" />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative min-w-[140px]">
            <select 
              className="w-full h-11 pl-4 pr-10 bg-gray-50 border-none rounded-lg text-sm font-medium appearance-none cursor-pointer focus:ring-2 focus:ring-primary/20"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="Preparing">Preparing</option>
              <option value="Delivering">Delivering</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
              <option value="Escalated">Escalated</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>

          <Button variant="outline" className="h-11 border-gray-200 text-gray-700 font-medium px-4">
            <Filter className="h-4 w-4 mr-2" />
            More Filters
          </Button>

          <Button 
            variant="outline" 
            className="h-11 border-gray-200 text-gray-700 font-medium px-4"
            onClick={handleExport}
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          const count = counts[tab.id as keyof typeof counts] || 0;
          
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as OrderStatus)}
              className={cn(
                "flex items-center gap-2.5 px-6 py-3 rounded-xl text-sm font-semibold transition-all min-w-max",
                isActive 
                  ? `${tab.activeBg} ${tab.activeColor} border-b-2 ${tab.activeBorder} rounded-b-none` 
                  : "bg-gray-50 text-gray-500 hover:bg-gray-100"
              )}
            >
              <tab.icon className={cn("h-[18px] w-[18px]", isActive ? tab.activeColor : "text-gray-400")} />
              <span>{tab.label}</span>
              <span className={cn(
                "ml-1 px-2 py-0.5 rounded-full text-xs",
                isActive ? "bg-green-600 text-white" : "bg-gray-200 text-gray-600"
              )}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Table Area */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-gray-50/50">
            <TableRow className="hover:bg-transparent border-b border-gray-100">
              <TableHead className="text-gray-900 font-bold py-4">Order ID</TableHead>
              <TableHead className="text-gray-900 font-bold py-4">Date & Time</TableHead>
              <TableHead className="text-gray-900 font-bold py-4">Customer</TableHead>
              <TableHead className="text-gray-900 font-bold py-4">Restaurant</TableHead>
              <TableHead className="text-gray-900 font-bold py-4">Total</TableHead>
              <TableHead className="text-gray-900 font-bold py-4">Status</TableHead>
              <TableHead className="text-gray-900 font-bold py-4">Rider</TableHead>
              <TableHead className="text-gray-900 font-bold py-4 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i} className="animate-pulse">
                  {Array.from({ length: 8 }).map((_, j) => (
                    <TableCell key={j}><div className="h-4 bg-gray-100 rounded w-full"></div></TableCell>
                  ))}
                </TableRow>
              ))
            ) : orders.length > 0 ? (
              orders.map((order) => (
                <TableRow key={order.orderId} className="hover:bg-gray-50/50 border-b border-gray-50 last:border-0 transition-colors">
                  <TableCell className="font-semibold text-gray-900 py-4">{order.orderNumber}</TableCell>
                  <TableCell className="py-4">
                    <div className="flex flex-col">
                      <span className="text-gray-900 text-sm">{format(new Date(order.createdAt), 'MMM d, yyyy')}</span>
                      <span className="text-gray-400 text-xs">{format(new Date(order.createdAt), 'HH:mm')}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-700 py-4">{order.customerName}</TableCell>
                  <TableCell className="text-gray-700 py-4">{order.restaurantName}</TableCell>
                  <TableCell className="font-bold text-gray-900 py-4">₹{order.total}</TableCell>
                  <TableCell className="py-4">
                    <Badge variant={getStatusBadgeVariant(order.status)} className="capitalize border px-3">
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-gray-700 py-4">{order.riderName || 'Unassigned'}</TableCell>
                  <TableCell className="py-4">
                    <div className="flex items-center justify-end gap-3 text-gray-500">
                      <button 
                        onClick={() => {
                          setSelectedOrderDetails({
                            id: order.orderId,
                            orderNumber: order.orderNumber,
                            time: format(new Date(order.createdAt), 'dd/MM/yyyy, HH:mm:ss'),
                            statusType: ['escalated', 'failed', 'cancelled'].includes(order.status.toLowerCase()) ? 'critical' : ['preparing', 'delivering'].includes(order.status.toLowerCase()) ? 'warning' : 'normal',
                            statusTitle: order.status,
                            statusDescription: "Live tracking & updates enabled",
                            customerName: order.customerName,
                            customerPhone: "+91 88888 12345",
                            customerAddress: "Flat 204, Aundh Society, Pune, MH 411007",
                            restaurantName: order.restaurantName,
                            restaurantAddress: "Koregaon Park, Pune, MH 411001",
                            items: [
                              { name: "Sample Menu Item", quantity: 2 },
                              { name: "Extra Add-on", quantity: 1 }
                            ],
                            totalAmount: `₹${order.total}`,
                            timeline: [
                              { status: "Placed", time: format(new Date(order.createdAt), 'HH:mm:ss - dd/MM/yyyy') },
                              { status: order.status, time: format(new Date(), 'HH:mm:ss - dd/MM/yyyy') }
                            ]
                          });
                        }}
                        className="hover:text-primary transition-colors cursor-pointer p-1"
                      >
                        <Eye className="h-[18px] w-[18px]" />
                      </button>
                      <button className="hover:text-primary transition-colors cursor-pointer p-1">
                        <History className="h-[18px] w-[18px]" />
                      </button>
                      <button className="hover:text-red-600 transition-colors cursor-pointer p-1">
                        <XCircle className="h-[18px] w-[18px]" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="h-32 text-center text-gray-500">
                  No orders found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
