import  { useMemo } from 'react';
import { Eye } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/Table';
import { restaurantService } from '@/core/api/restaurants';
import { ordersService } from '@/core/api/orders';

export function RevenueByRestaurantTable() {
  const { data: restaurantsResponse, isLoading: isLoadingRestaurants } = useQuery({
    queryKey: ['restaurants-analytics'],
    queryFn: () => restaurantService.getRestaurants({ pageSize: 100 }),
  });

  const { data: ordersResponse, isLoading: isLoadingOrders } = useQuery({
    queryKey: ['orders-analytics'],
    queryFn: () => ordersService.getOrders({ pageSize: 1000 }),
  });

  const tableData = useMemo(() => {
    if (!restaurantsResponse?.restaurants || !ordersResponse?.items) return [];

    const restaurants = restaurantsResponse.restaurants;
    const orders = ordersResponse.items;

    return restaurants.map(restaurant => {
      const restaurantOrders = orders.filter(
        o => o.restaurantName === restaurant.name && !['Cancelled', 'Failed', 'escalated'].includes(o.status)
      );
      
      const ordersCount = restaurantOrders.length;
      const gmv = restaurantOrders.reduce((acc, order) => acc + (order.total || 0), 0);
      const commissionPercentage = restaurant.commissionPercentage || 15;
      const earned = gmv * (commissionPercentage / 100);
      const aov = ordersCount > 0 ? gmv / ordersCount : 0;

      return {
        name: restaurant.name,
        orders: ordersCount,
        gmv: `₹${gmv.toFixed(0)}`,
        commission: `${commissionPercentage}%`,
        earned: `₹${earned.toFixed(0)}`,
        aov: `₹${aov.toFixed(0)}`,
        rawEarned: earned
      };
    }).sort((a, b) => b.rawEarned - a.rawEarned);
  }, [restaurantsResponse, ordersResponse]);

  const isLoading = isLoadingRestaurants || isLoadingOrders;

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-gray-100">
        <h3 className="text-base font-semibold text-gray-900">Revenue by Restaurant</h3>
        <p className="text-sm text-gray-500">Performance breakdown by partner</p>
      </div>
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50/50">
            <TableHead className="font-semibold text-gray-600">Restaurant Name</TableHead>
            <TableHead className="font-semibold text-gray-600">Orders</TableHead>
            <TableHead className="font-semibold text-gray-600">GMV</TableHead>
            <TableHead className="font-semibold text-gray-600">Commission</TableHead>
            <TableHead className="font-semibold text-gray-600">Commission Earned</TableHead>
            <TableHead className="font-semibold text-gray-600">Avg Order Value</TableHead>
            <TableHead className="font-semibold text-gray-600 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i} className="animate-pulse">
                {Array.from({ length: 7 }).map((_, j) => (
                  <TableCell key={j}><div className="h-4 bg-gray-100 rounded w-full"></div></TableCell>
                ))}
              </TableRow>
            ))
          ) : tableData.length > 0 ? (
            tableData.map((row, idx) => (
              <TableRow key={idx}>
                <TableCell className="font-medium text-gray-900">{row.name}</TableCell>
                <TableCell className="text-gray-600">{row.orders}</TableCell>
                <TableCell className="font-medium text-gray-900">{row.gmv}</TableCell>
                <TableCell className="text-gray-500">
                  <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-md text-xs">{row.commission}</span>
                </TableCell>
                <TableCell className="font-medium text-green-600">{row.earned}</TableCell>
                <TableCell className="text-gray-600">{row.aov}</TableCell>
                <TableCell className="text-right">
                  <button className="text-gray-400 hover:text-gray-600 transition-colors">
                    <Eye className="h-4 w-4 inline-block" />
                  </button>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                No revenue data available
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
