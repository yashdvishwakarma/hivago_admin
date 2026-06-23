import { useState } from 'react';
import { X, Star, Bike, MapPin } from 'lucide-react';
import { cn } from '@/utils/cn';
import toast from 'react-hot-toast';

interface Rider {
  id: string;
  name: string;
  badge: 'Hivago Rider' | '3PL Rider';
  rating: number;
  deliveries: number;
  distance: string;
  isBusy: boolean;
}

const mockRiders: Rider[] = [
  { id: 'RD-2847', name: 'Rohit Marathe', badge: 'Hivago Rider', rating: 4.8, deliveries: 1247, distance: '0.8 km away', isBusy: false },
  { id: 'RD-2901', name: 'Kavita Pawar', badge: 'Hivago Rider', rating: 4.9, deliveries: 892, distance: '1.2 km away', isBusy: false },
  { id: 'RD-3024', name: 'Suresh Kamble', badge: '3PL Rider', rating: 4.7, deliveries: 654, distance: '0.5 km away', isBusy: false },
  { id: 'RD-3189', name: 'Deepak Shinde', badge: 'Hivago Rider', rating: 4.8, deliveries: 423, distance: '1.5 km away', isBusy: false },
  { id: 'RD-3205', name: 'Prakash Joshi', badge: '3PL Rider', rating: 4.6, deliveries: 567, distance: '2.1 km away', isBusy: false },
  { id: 'RD-3178', name: 'Amit Bhosale', badge: 'Hivago Rider', rating: 4.9, deliveries: 789, distance: '1.8 km away', isBusy: true },
];

interface AssignRiderModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderNumber: string;
}

export default function AssignRiderModal({ isOpen, onClose, orderNumber }: AssignRiderModalProps) {
  const [selectedRiderId, setSelectedRiderId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (selectedRiderId) {
      console.log(`Assigned rider ${selectedRiderId} to order ${orderNumber}`);
      toast.success("Rider assigned successfully!");
      onClose();
      setSelectedRiderId(null);
    }
  };

  const handleClose = () => {
    onClose();
    setSelectedRiderId(null);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-[600px] flex flex-col h-[85vh] max-h-[750px]">
        
        {/* Header */}
        <div className="flex items-start justify-between p-5 pb-4 border-b border-gray-100 shrink-0">
          <div>
            <h2 className="text-xl font-bold text-gray-900 leading-none mb-1.5">Assign Rider</h2>
            <p className="text-[13px] text-gray-500">Order {orderNumber.replace('#', '')}</p>
          </div>
          <button 
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-md hover:bg-gray-100 transition-colors mt-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List Header */}
        <div className="px-5 py-4 border-b border-gray-100 shrink-0">
          <p className="text-[13px] text-gray-600">{mockRiders.filter(r => !r.isBusy).length} riders available nearby</p>
        </div>

        {/* Rider List (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-5 custom-scrollbar bg-gray-50/30">
          <div className="space-y-3">
            {mockRiders.map((rider) => {
              const isSelected = selectedRiderId === rider.id;
              
              return (
                <div 
                  key={rider.id}
                  onClick={() => !rider.isBusy && setSelectedRiderId(rider.id)}
                  className={cn(
                    "bg-white border rounded-xl p-4 flex items-center gap-4 transition-all",
                    rider.isBusy ? "opacity-50 cursor-not-allowed border-gray-200" : "cursor-pointer hover:shadow-sm",
                    isSelected ? "border-[#d72b1f] ring-1 ring-[#d72b1f]/20" : "border-gray-200"
                  )}
                >
                  {/* Radio Button */}
                  <div className="shrink-0 flex items-center justify-center">
                    <div className={cn(
                      "w-[18px] h-[18px] rounded-full border-2 flex items-center justify-center transition-colors",
                      isSelected ? "border-[#d72b1f]" : "border-gray-300",
                      rider.isBusy && "border-gray-200"
                    )}>
                      {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-[#d72b1f]" />}
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-[15px] text-gray-900 leading-none">{rider.name}</h3>
                      <span className={cn(
                        "text-[10px] font-bold px-2 py-0.5 rounded-full border",
                        rider.badge === 'Hivago Rider' 
                          ? "text-[#d72b1f] border-red-200 bg-red-50/50" 
                          : "text-indigo-600 border-indigo-200 bg-indigo-50/50",
                        rider.isBusy && "text-gray-400 border-gray-200 bg-gray-50"
                      )}>
                        {rider.badge}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="text-[12px] text-gray-500 font-medium">{rider.id}</p>
                      {rider.isBusy && (
                        <span className="text-[11px] font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                          Currently Busy
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-4 text-[13px] text-gray-600 shrink-0">
                    <div className="flex items-center gap-1.5 font-medium">
                      <Star className="w-[14px] h-[14px] text-yellow-400 fill-yellow-400" />
                      {rider.rating}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Bike className="w-[14px] h-[14px] text-gray-400" />
                      {rider.deliveries} deliveries
                    </div>
                    <div className="flex items-center gap-1.5 w-[100px] justify-end">
                      <MapPin className="w-[14px] h-[14px] text-gray-400" />
                      {rider.distance}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-gray-100 flex justify-end gap-3 shrink-0 bg-white">
          <button 
            onClick={handleClose}
            className="px-6 py-2.5 rounded-xl text-[14px] font-bold text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleConfirm}
            disabled={!selectedRiderId}
            className="px-6 py-2.5 rounded-xl text-[14px] font-bold text-white bg-[#75c69b] hover:bg-[#65b38a] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Confirm
          </button>
        </div>

      </div>
    </div>
  );
}
