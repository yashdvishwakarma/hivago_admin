import React from 'react';
import {
  X,
  AlertTriangle,
  UserPlus,
  Phone,
  Store,
  AlertCircle,
  RefreshCw,
  Headphones,
  Clock,
  Bike
} from 'lucide-react';
import { cn } from '@/utils/cn';

export interface AlertData {
  id: string;
  type: 'escalated' | 'failed' | 'stuck' | 'awaiting' | string;
  title: string;
  message: string;
  orderNumber: string;
  customerName?: string;
  restaurantName?: string;
  riderName?: string;
  customerPhone?: string;
  restaurantPhone?: string;
  time?: string;
  actionText?: string;
}

interface AlertResolutionModalProps {
  isOpen: boolean;
  onClose: () => void;
  alert: AlertData | null;
  onAction?: (action: string, data?: any) => void;
  onAssignRider?: () => void;
}

export default function AlertResolutionModal({ 
  isOpen, 
  onClose, 
  alert, 
  onAction,
  onAssignRider 
}: AlertResolutionModalProps) {
  if (!isOpen || !alert) return null;

  // Configuration for different alert types based on designs
  const getConfig = () => {
    const orderDisplayNumber = alert.orderNumber.startsWith('#') ? alert.orderNumber : `#${alert.orderNumber}`;
    
    switch (alert.type) {
      case 'escalated': {
        const isRestaurantUnconfirmed = 
          alert.message?.toLowerCase().includes('not confirmed') || 
          alert.message?.toLowerCase().includes('unconfirmed') ||
          alert.message?.toLowerCase().includes('awaiting confirmation') ||
          alert.title?.toLowerCase().includes('confirm') ||
          alert.title?.toLowerCase().includes('awaiting');

        return {
          icon: AlertTriangle,
          headerColor: 'text-[#d72b1f]',
          badgeText: null,
          title: alert.title || `Order Escalated – Delayed`,
          subtitle: `Order ${orderDisplayNumber.replace('#', '')}`,
          recommendation: {
            icon: isRestaurantUnconfirmed ? Clock : Bike,
            title: 'Smart Recommendation',
            message: alert.message,
            actionPrefix: 'Suggested action:',
            actionText: isRestaurantUnconfirmed ? 'Contact Restaurant' : 'Assign New Rider',
            actionSuffix: isRestaurantUnconfirmed ? 'to confirm the order.' : 'to ensure timely delivery.'
          },
          context: {
            leftLabel: 'Current Rider',
            leftValue: alert.riderName || 'Not Assigned',
            leftPhone: null,
            rightLabel: 'Restaurant',
            rightValue: alert.restaurantName || 'Unknown',
            rightPhone: alert.restaurantPhone
          },
          urgentAction: {
            label: isRestaurantUnconfirmed ? 'Contact Restaurant' : 'Assign New Rider',
            icon: isRestaurantUnconfirmed ? Phone : UserPlus,
            color: 'bg-[#059669] hover:bg-[#047857] text-white',
            badge: 'Recommended'
          },
          investigateButtons: isRestaurantUnconfirmed ? [] : [
            { label: 'Contact Restaurant', icon: Store, color: 'text-[#059669] border-[#059669] hover:bg-[#ecfdf5]', action: 'contact_restaurant' }
          ]
        };
      }

      case 'failed':
        return {
          icon: AlertTriangle,
          headerColor: 'text-[#d72b1f]',
          badgeText: null,
          title: 'Dispatch Failed',
          subtitle: `Order ${orderDisplayNumber.replace('#', '')}`,
          recommendation: {
            icon: Bike,
            title: 'Critical Issue – No riders available for dispatch',
            message: alert.message,
            actionPrefix: 'Suggested action:',
            actionText: 'Manually assign rider',
            actionSuffix: 'or retry dispatch.'
          },
          context: {
            leftLabel: 'Last Rider',
            leftValue: alert.riderName || 'None',
            leftPhone: null,
            rightLabel: 'Restaurant',
            rightValue: alert.restaurantName || 'Unknown',
            rightPhone: alert.restaurantPhone
          },
          urgentAction: {
            label: 'Assign New Rider',
            icon: UserPlus,
            color: 'bg-[#059669] hover:bg-[#047857] text-white',
            badge: 'Recommended'
          },
          investigateButtons: [
            { label: 'Retry Dispatch', icon: RefreshCw, color: 'text-blue-600 border-blue-200 hover:bg-blue-50', action: 'retry_dispatch' },
            { label: 'Contact Support / Ops', icon: Headphones, color: 'text-[#059669] border-[#059669] hover:bg-[#ecfdf5]', action: 'contact_support' }
          ],
          moreActionsGrid: [
            { label: 'Cancel Order', action: 'cancel_order' },
            { label: 'Initiate Refund', icon: RefreshCw, action: 'refund' },
            { label: 'Add Notes', action: 'add_notes' }
          ]
        };

      case 'stuck':
        return {
          icon: AlertTriangle,
          headerColor: 'text-[#ea580c]',
          badgeText: 'WARNING',
          badgeColor: 'bg-orange-100 text-orange-700',
          title: alert.title || 'Warning - Stuck in Dispatch',
          subtitle: `Order ${orderDisplayNumber.replace('#', '')} • Time sensitive`,
          recommendation: {
            icon: Clock,
            title: 'Recommended Action',
            message: alert.message,
            actionPrefix: 'Suggested action:',
            actionText: 'Assign rider before delay increases',
            actionSuffix: ''
          },
          context: {
            leftLabel: 'Customer',
            leftValue: alert.customerName || 'Unknown',
            leftPhone: alert.customerPhone,
            rightLabel: 'Restaurant',
            rightValue: alert.restaurantName || 'Unknown',
            rightPhone: alert.restaurantPhone
          },
          urgentAction: {
            label: 'Assign Rider',
            icon: UserPlus,
            color: 'bg-[#059669] hover:bg-[#047857] text-white',
            badge: 'Recommended'
          },
          investigateButtons: [
            { label: 'Retry Dispatch', icon: RefreshCw, color: 'text-blue-600 border-blue-200 hover:bg-blue-50', action: 'retry_dispatch' },
            { label: 'Contact Rider Pool', icon: Headphones, color: 'text-orange-500 border-orange-200 hover:bg-orange-50', action: 'contact_riders' }
          ],
          investigateLabel: 'ALTERNATIVE SOLUTIONS'
        };

      case 'awaiting':
        return {
          icon: AlertTriangle,
          headerColor: 'text-[#ea580c]',
          badgeText: 'WARNING',
          badgeColor: 'bg-orange-100 text-orange-700',
          title: 'Awaiting Restaurant Confirmation',
          subtitle: `Order ${orderDisplayNumber.replace('#', '')} • Time sensitive`,
          recommendation: {
            icon: Clock,
            title: null,
            message: alert.message || 'Order placed but not yet accepted by the restaurant.',
            actionPrefix: 'Suggested action:',
            actionText: 'Contact restaurant or wait before auto-cancel.',
            actionSuffix: ''
          },
          context: {
            leftLabel: 'Customer',
            leftValue: alert.customerName || 'Unknown',
            leftPhone: alert.customerPhone,
            rightLabel: 'Restaurant',
            rightValue: alert.restaurantName || 'Unknown',
            rightPhone: alert.restaurantPhone
          },
          urgentAction: {
            label: 'Contact Restaurant',
            icon: Phone,
            color: 'bg-[#059669] hover:bg-[#047857] text-white',
            badge: 'Recommended'
          },
          investigateButtons: []
        };

      default:
        return {
          icon: AlertTriangle,
          headerColor: 'text-gray-900',
          badgeText: null,
          title: alert.title,
          subtitle: `Order ${orderDisplayNumber.replace('#', '')}`,
          recommendation: {
            icon: AlertCircle,
            title: 'Action Required',
            message: alert.message,
            actionPrefix: '',
            actionText: alert.actionText || 'Review order details',
            actionSuffix: ''
          },
          context: {
            leftLabel: 'Customer',
            leftValue: alert.customerName || 'Unknown',
            leftPhone: alert.customerPhone,
            rightLabel: 'Restaurant',
            rightValue: alert.restaurantName || 'Unknown',
            rightPhone: alert.restaurantPhone
          },
          urgentAction: {
            label: alert.actionText || 'Take Action',
            icon: alert.actionText?.toLowerCase().includes('assign') ? UserPlus : AlertCircle,
            color: 'bg-[#059669] hover:bg-[#047857] text-white',
            badge: 'Recommended'
          },
          investigateButtons: []
        };
    }
  };

  const config = getConfig();
  const HeaderIcon = config.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-[500px] overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-start justify-between p-5 pb-4 border-b border-gray-100">
          <div className="flex items-start gap-3">
            <HeaderIcon className={cn("w-6 h-6 mt-0.5", config.headerColor)} />
            <div>
              <div className="flex items-center gap-2 mb-1">
                {config.badgeText && (
                  <span className={cn("px-2 py-0.5 text-[10px] font-bold rounded", config.badgeColor)}>
                    {config.badgeText}
                  </span>
                )}
                <h2 className={cn("text-lg font-bold leading-none", config.headerColor)}>
                  {config.title}
                </h2>
              </div>
              <p className={cn("text-sm", alert.type === 'stuck' || alert.type === 'awaiting' ? 'text-orange-500' : 'text-gray-500')}>
                {config.subtitle}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-md hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto custom-scrollbar">
          
          {/* Recommendation Box */}
          <div className="bg-[#eff6ff] border border-blue-100 rounded-xl p-4 flex gap-3 mb-5">
            <div className="mt-0.5 text-blue-500 bg-white p-1 rounded-full shadow-sm">
              {React.createElement(config.recommendation.icon, { className: "w-4 h-4" })}
            </div>
            <div>
              {config.recommendation.title && (
                <p className="text-[13.5px] font-medium text-blue-600 mb-0.5">
                  {config.recommendation.title}
                </p>
              )}
              {config.recommendation.message && (
                <p className="text-[13.5px] text-blue-600 mb-0.5">
                  {config.recommendation.message}
                </p>
              )}
              <p className="text-[13.5px] text-blue-600">
                <span className="font-bold">{config.recommendation.actionPrefix}</span>{' '}
                <span className="font-bold">{config.recommendation.actionText}</span>{' '}
                {config.recommendation.actionSuffix}
              </p>
            </div>
          </div>

          {/* Context Box */}
          <div className="border border-gray-200 rounded-xl p-4 flex justify-between mb-6 bg-gray-50/50">
            <div>
              <p className="text-[12px] text-gray-500 mb-1">{config.context.leftLabel}</p>
              <div className="flex items-center gap-2">
                <p className="text-[14px] font-bold text-gray-900">{config.context.leftValue}</p>
                {config.context.leftPhone && (
                  <button 
                    onClick={() => onAction?.('call', config.context.leftPhone)}
                    className="p-1 rounded-full hover:bg-gray-200 text-blue-600 transition-colors"
                  >
                    <Phone className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
            <div className="text-right">
              <p className="text-[12px] text-gray-500 mb-1">{config.context.rightLabel}</p>
              <div className="flex items-center justify-end gap-2">
                {config.context.rightPhone && (
                  <button 
                    onClick={() => onAction?.('call', config.context.rightPhone)}
                    className="p-1 rounded-full hover:bg-gray-200 text-green-600 transition-colors"
                  >
                    <Phone className="w-3 h-3" />
                  </button>
                )}
                <p className="text-[14px] font-bold text-gray-900">{config.context.rightValue}</p>
              </div>
            </div>
          </div>

          {/* Urgent Action */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-[11px] font-bold text-gray-400 tracking-wider uppercase">Urgent Action</h3>
              {config.urgentAction.badge && (
                <span className="text-[11px] font-bold text-[#d72b1f] bg-red-50 px-2 py-0.5 rounded border border-red-100">
                  {config.urgentAction.badge}
                </span>
              )}
            </div>
             <button 
              onClick={() => {
                if (config.urgentAction.label.includes('Assign') && onAssignRider) {
                  onAssignRider();
                } else if (config.urgentAction.label.includes('Contact Restaurant') && onAction) {
                  onAction('contact_restaurant', { phone: alert.restaurantPhone });
                } else if (onAction) {
                  onAction('urgent', { label: config.urgentAction.label });
                }
              }}
              className={cn(
              "w-full py-3.5 rounded-xl font-bold text-[14px] flex items-center justify-center gap-2 transition-colors shadow-sm",
              config.urgentAction.color
            )}>
              {React.createElement(config.urgentAction.icon, { className: "w-4 h-4" })}
              {config.urgentAction.label}
            </button>
          </div>

          {/* Investigate & Resolve */}
          {config.investigateButtons.length > 0 && (
            <div className="mb-6">
              <h3 className="text-[11px] font-bold text-gray-400 tracking-wider uppercase mb-3">
                {config.investigateLabel || 'Investigate & Resolve'}
              </h3>
              <div className="flex gap-3">
                {config.investigateButtons.map((btn, idx) => (
                  <button 
                    key={idx}
                    onClick={() => onAction?.(btn.action, btn)}
                    className={cn(
                      "flex-1 py-2.5 rounded-xl font-semibold text-[13px] flex items-center justify-center gap-2 border bg-white transition-colors shadow-sm",
                      btn.color
                    )}
                  >
                    {btn.icon && React.createElement(btn.icon, { className: "w-4 h-4" })}
                    {btn.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* More Actions Grid (only for failed type based on design) */}
          {config.moreActionsGrid && (
            <div className="mb-6">
              <h3 className="text-[11px] font-bold text-gray-400 tracking-wider uppercase mb-3">
                More Actions
              </h3>
              <div className="flex gap-3">
                {config.moreActionsGrid.map((btn, idx) => (
                  <button 
                    key={idx}
                    onClick={() => onAction?.(btn.action, btn)}
                    className="flex-1 py-2.5 rounded-xl font-medium text-[13px] text-gray-600 flex items-center justify-center gap-2 border border-gray-200 border-dashed hover:bg-gray-50 transition-colors"
                  >
                    {btn.icon && React.createElement(btn.icon, { className: "w-4 h-4" })}
                    {btn.label}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {/* Default More Actions (for others) */}
          {!config.moreActionsGrid && (
            <div className="mb-6">
              <h3 className="text-[11px] font-bold text-gray-400 tracking-wider uppercase mb-3">
                More Actions
              </h3>
              <button className="w-full py-3 rounded-xl font-medium text-[13px] text-gray-500 border border-gray-200 border-dashed hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                <span className="font-bold tracking-widest leading-none mb-1">...</span>
                Additional Options
              </button>
            </div>
          )}

          {/* Footer Warning */}
          <div className="bg-gray-50 rounded-xl p-4 flex items-start gap-2 border border-gray-100">
            <AlertCircle className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
            <p className="text-[12px] text-gray-500 leading-relaxed">
              <span className="font-bold text-gray-700">Priority:</span> Recovery actions are emphasized. Cancellation and refund options are available as last resort.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
