import React from 'react';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/Table';

const refundsData = [
  { id: 'OR-8765', customer: 'Anjali Patil', restaurant: 'Sushi Express', amount: '₹420', reason: 'Order cancelled by customer', date: 'Apr 16, 13:20' },
  { id: 'OR-8723', customer: 'Rahul Sharma', restaurant: 'Pizza Paradise', amount: '₹850', reason: 'Food quality issue', date: 'Apr 15, 18:45' },
  { id: 'OR-8698', customer: 'Priya Singh', restaurant: 'Burger Hub', amount: '₹560', reason: 'Delayed delivery', date: 'Apr 15, 14:20' },
];

export function RefundsBreakdownTable() {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-gray-100 flex justify-between items-center">
        <div>
          <h3 className="text-base font-semibold text-gray-900">Refunds Breakdown</h3>
          <p className="text-sm text-gray-500">Recent refund transactions</p>
        </div>
        <div className="flex gap-6 text-right">
          <div>
            <p className="text-xs text-gray-500">Total Refunds</p>
            <p className="font-semibold text-gray-900">3 orders</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Total Amount</p>
            <p className="font-semibold text-red-600">₹1,830</p>
          </div>
        </div>
      </div>
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50/50">
            <TableHead className="font-semibold text-gray-600">Order ID</TableHead>
            <TableHead className="font-semibold text-gray-600">Customer Name</TableHead>
            <TableHead className="font-semibold text-gray-600">Restaurant</TableHead>
            <TableHead className="font-semibold text-gray-600">Refund Amount</TableHead>
            <TableHead className="font-semibold text-gray-600">Reason</TableHead>
            <TableHead className="font-semibold text-gray-600 text-right">Refunded At</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {refundsData.map((row, idx) => (
            <TableRow key={idx}>
              <TableCell className="font-medium text-gray-900">{row.id}</TableCell>
              <TableCell className="text-gray-600">{row.customer}</TableCell>
              <TableCell className="text-gray-600">{row.restaurant}</TableCell>
              <TableCell className="font-medium text-red-600">{row.amount}</TableCell>
              <TableCell className="text-gray-500 text-sm">{row.reason}</TableCell>
              <TableCell className="text-right text-gray-500 text-sm">{row.date}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
