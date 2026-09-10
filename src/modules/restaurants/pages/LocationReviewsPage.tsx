import React, { useState } from 'react';
import { 
  MapPin, 
  Check, 
  X, 
  AlertTriangle, 
  RefreshCw, 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  Copy, 
  ExternalLink, 
  Navigation, 
  Compass, 
  ShieldCheck, 
  Building2,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Maximize2
} from 'lucide-react';
import toast from 'react-hot-toast';
import type { LocationReviewItem } from '@/core/api/locationReviews';
import { 
  useLocationReviews, 
  useApproveReview, 
  useRejectReview 
} from '@/hooks/useLocationReviews';

// Component for rendering an interactive/visual Pin Comparator Map
function PinComparatorModal({ 
  review, 
  onClose 
}: { 
  review: LocationReviewItem; 
  onClose: () => void; 
}) {
  const isDeleted = !review.restaurantName;
  const displayName = review.restaurantName || '(deleted restaurant)';

  // Generate OpenStreetMap embed URL
  const osmUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${Math.min(review.currentLongitude, review.suggestedLongitude) - 0.005}%2C${Math.min(review.currentLatitude, review.suggestedLatitude) - 0.005}%2C${Math.max(review.currentLongitude, review.suggestedLongitude) + 0.005}%2C${Math.max(review.currentLatitude, review.suggestedLatitude) + 0.005}&layer=mapnik&marker=${review.suggestedLatitude}%2C${review.suggestedLongitude}`;

  const copyCoords = (lat: number, lng: number, label: string) => {
    navigator.clipboard.writeText(`${lat}, ${lng}`);
    toast.success(`Copied ${label} coordinates: ${lat}, ${lng}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-red-50 text-red-600 rounded-xl">
              <MapPin className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                {displayName}
                {isDeleted && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-medium">
                    Deleted Restaurant
                  </span>
                )}
              </h3>
              <p className="text-xs text-gray-500 font-mono">ID: {review.id}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Top Metrics Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-red-50/70 border border-red-100 rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-red-600 font-semibold uppercase tracking-wider">Average Drift</p>
                <p className="text-2xl font-black text-red-700 mt-1">{review.averageDriftMeters.toFixed(1)} <span className="text-sm font-normal">meters</span></p>
              </div>
              <Navigation className="h-8 w-8 text-red-400 opacity-60" />
            </div>

            <div className="bg-blue-50/70 border border-blue-100 rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-blue-600 font-semibold uppercase tracking-wider">Arrival Samples</p>
                <p className="text-2xl font-black text-blue-700 mt-1">{review.sampleSize} <span className="text-sm font-normal">/ 10 arrivals</span></p>
              </div>
              <ShieldCheck className="h-8 w-8 text-blue-400 opacity-60" />
            </div>

            <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Detected At</p>
                <p className="text-sm font-bold text-gray-800 mt-1">
                  {new Date(review.detectedAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                </p>
              </div>
              <Compass className="h-8 w-8 text-gray-400 opacity-60" />
            </div>
          </div>

          {/* Coordinate Comparison Table */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Current Stored Pin */}
            <div className="border border-red-200 bg-red-50/30 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                  <span className="font-bold text-sm text-red-900">Current Pin (Stored in DB)</span>
                </div>
                <button 
                  onClick={() => copyCoords(review.currentLatitude, review.currentLongitude, 'Current')}
                  className="text-xs text-red-600 hover:text-red-800 font-medium flex items-center gap-1 hover:underline"
                >
                  <Copy className="h-3.5 w-3.5" /> Copy
                </button>
              </div>
              <div className="font-mono text-sm bg-white p-3 rounded-lg border border-red-100 text-gray-700 space-y-1">
                <p><span className="text-gray-400">Lat:</span> {review.currentLatitude}</p>
                <p><span className="text-gray-400">Lng:</span> {review.currentLongitude}</p>
              </div>
              <p className="text-xs text-red-600/80 italic">
                Riders navigating to this pin drift average {review.averageDriftMeters.toFixed(1)}m away.
              </p>
            </div>

            {/* Suggested Pin */}
            <div className="border border-emerald-200 bg-emerald-50/30 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span className="font-bold text-sm text-emerald-900">Suggested Pin (Arrival Centroid)</span>
                </div>
                <button 
                  onClick={() => copyCoords(review.suggestedLatitude, review.suggestedLongitude, 'Suggested')}
                  className="text-xs text-emerald-600 hover:text-emerald-800 font-medium flex items-center gap-1 hover:underline"
                >
                  <Copy className="h-3.5 w-3.5" /> Copy
                </button>
              </div>
              <div className="font-mono text-sm bg-white p-3 rounded-lg border border-emerald-100 text-gray-700 space-y-1">
                <p><span className="text-gray-400">Lat:</span> {review.suggestedLatitude}</p>
                <p><span className="text-gray-400">Lng:</span> {review.suggestedLongitude}</p>
              </div>
              <p className="text-xs text-emerald-700 font-medium">
                Computed centroid of last {review.sampleSize} rider arrivals.
              </p>
            </div>
          </div>

          {/* Embedded OpenStreetMap View */}
          <div className="relative rounded-xl border border-gray-200 overflow-hidden h-72 bg-gray-100">
            <iframe
              title="Pin Drift Map"
              width="100%"
              height="100%"
              frameBorder="0"
              scrolling="no"
              src={osmUrl}
              className="w-full h-full"
            />
            <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-xs px-3 py-1.5 rounded-lg shadow-xs border border-gray-200 text-xs font-semibold text-gray-700 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500" /> Current Pin vs 
              <span className="w-2 h-2 rounded-full bg-emerald-500" /> Suggested Pin
            </div>
            <a 
              href={`https://www.google.com/maps/dir/${review.currentLatitude},${review.currentLongitude}/${review.suggestedLatitude},${review.suggestedLongitude}`}
              target="_blank" 
              rel="noreferrer"
              className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-xs hover:bg-white px-3 py-1.5 rounded-lg shadow-xs border border-gray-200 text-xs font-medium text-gray-700 flex items-center gap-1.5 transition-all"
            >
              <ExternalLink className="h-3.5 w-3.5 text-gray-500" /> Open in Google Maps
            </a>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default function LocationReviewsPage() {
  const [statusFilter, setStatusFilter] = useState<'Pending' | 'Approved' | 'Rejected' | 'All'>('Pending');
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(20);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedReview, setSelectedReview] = useState<LocationReviewItem | null>(null);

  // Queries & Mutations
  const { data, isLoading, isError, refetch } = useLocationReviews({
    status: statusFilter === 'All' ? undefined : statusFilter,
    page,
    pageSize,
  });

  const approveMutation = useApproveReview();
  const rejectMutation = useRejectReview();

  const reviews = data?.items || [];
  const totalCount = data?.totalCount ?? reviews.length;
  const totalPages = Math.ceil(totalCount / pageSize) || 1;

  // Local Search Filtering
  const filteredReviews = reviews.filter((item) => {
    const name = item.restaurantName || '(deleted restaurant)';
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    return (
      name.toLowerCase().includes(query) ||
      item.restaurantId.toLowerCase().includes(query) ||
      item.id.toLowerCase().includes(query)
    );
  });

  const handleApprove = (review: LocationReviewItem, e: React.MouseEvent) => {
    e.stopPropagation();
    if (approveMutation.isPending || rejectMutation.isPending) return;
    approveMutation.mutate(review.id);
  };

  const handleReject = (review: LocationReviewItem, e: React.MouseEvent) => {
    e.stopPropagation();
    if (approveMutation.isPending || rejectMutation.isPending) return;
    rejectMutation.mutate(review.id);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-red-50 text-[#d72b1f] rounded-xl shadow-xs">
              <MapPin className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                Restaurant Pin-Drift Reviews
              </h1>
              <p className="text-sm text-gray-500 mt-0.5">
                Review and rectify inaccurate restaurant GPS pins flagged by rider arrival sweeps
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => refetch()}
            className="flex items-center space-x-2 px-3.5 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all shadow-2xs"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin text-[#d72b1f]' : 'text-gray-500'}`} />
            <span>Refresh Queue</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Pending Reviews</span>
            <span className="p-1.5 bg-amber-50 text-amber-600 rounded-lg">
              <AlertTriangle className="h-4 w-4" />
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {statusFilter === 'Pending' ? totalCount : reviews.filter(r => r.status === 'Pending').length}
          </p>
          <p className="text-xs text-amber-600 font-medium flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Needs admin action
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Sweep Threshold</span>
            <span className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
              <Navigation className="h-4 w-4" />
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900">&gt; 75 meters</p>
          <p className="text-xs text-gray-500 font-medium">Across last 10 own-fleet arrivals</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Sweep Interval</span>
            <span className="p-1.5 bg-purple-50 text-purple-600 rounded-lg">
              <Compass className="h-4 w-4" />
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900">Every 30m</p>
          <p className="text-xs text-gray-500 font-medium">Automatic background signal</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Target Fleet</span>
            <span className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
              <ShieldCheck className="h-4 w-4" />
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900">Own-Fleet</p>
          <p className="text-xs text-emerald-600 font-medium">High accuracy GPS telemetry</p>
        </div>
      </div>

      {/* Main Queue & Controls Container */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-2xs overflow-hidden">
        {/* Filters and Search Bar */}
        <div className="p-4 border-b border-gray-100 bg-gray-50/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Status Filter Tabs */}
          <div className="flex items-center space-x-1 bg-gray-100/80 p-1 rounded-xl">
            {(['Pending', 'Approved', 'Rejected', 'All'] as const).map((tab) => {
              const isActive = statusFilter === tab;
              return (
                <button
                  key={tab}
                  onClick={() => {
                    setStatusFilter(tab);
                    setPage(1);
                  }}
                  className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    isActive
                      ? 'bg-white text-gray-900 shadow-xs'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                  }`}
                >
                  {tab}
                  {tab === 'Pending' && totalCount > 0 && (
                    <span className="ml-1.5 px-1.5 py-0.5 text-[10px] bg-red-100 text-[#d72b1f] rounded-full font-bold">
                      {totalCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Search & Page Size */}
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search restaurant..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-1.5 text-xs bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d72b1f]/20 focus:border-[#d72b1f] w-56 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
              className="py-1.5 px-3 text-xs bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d72b1f]/20 focus:border-[#d72b1f] text-gray-700 font-medium"
            >
              <option value={20}>20 / page</option>
              <option value={50}>50 / page</option>
              <option value={100}>100 / page</option>
            </select>
          </div>
        </div>

        {/* Findings List */}
        {isLoading ? (
          <div className="p-12 text-center space-y-3">
            <div className="h-8 w-8 animate-spin rounded-full border-3 border-[#d72b1f] border-t-transparent mx-auto" />
            <p className="text-sm font-medium text-gray-500">Loading pin-drift findings...</p>
          </div>
        ) : isError ? (
          <div className="p-12 text-center space-y-3">
            <div className="p-3 bg-red-50 text-red-600 rounded-full w-fit mx-auto">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-gray-900">Failed to load findings</h3>
            <p className="text-xs text-gray-500 max-w-md mx-auto">
              Unable to communicate with the review queue backend. Please check permissions or try again.
            </p>
            <button
              onClick={() => refetch()}
              className="px-4 py-2 text-xs font-semibold text-white bg-[#d72b1f] hover:bg-[#b82318] rounded-lg transition-all shadow-xs"
            >
              Retry
            </button>
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="p-16 text-center space-y-4">
            <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl w-fit mx-auto">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">
                {statusFilter === 'Pending' 
                  ? 'All Restaurant Pins match reality!' 
                  : `No ${statusFilter} location findings found`}
              </h3>
              <p className="text-xs text-gray-500 max-w-sm mx-auto mt-1">
                {statusFilter === 'Pending'
                  ? 'There are currently zero pending location findings requiring admin attention.'
                  : 'No findings match the current filter and search criteria.'}
              </p>
            </div>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="px-3.5 py-1.5 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all"
              >
                Clear Search Filter
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredReviews.map((review) => {
              const isDeleted = !review.restaurantName;
              const displayName = review.restaurantName || '(deleted restaurant)';
              const isPending = review.status === 'Pending';
              const isApproved = review.status === 'Approved';
              const isRejected = review.status === 'Rejected';

              return (
                <div
                  key={review.id}
                  className="p-5 hover:bg-gray-50/60 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-6 group"
                >
                  {/* Left Column: Restaurant Info & Distance */}
                  <div className="space-y-3 flex-1 min-w-0">
                    <div className="flex items-center space-x-3 flex-wrap gap-y-1">
                      <h3 className="text-base font-bold text-gray-900 flex items-center gap-2 truncate">
                        <Building2 className="h-4 w-4 text-gray-400 shrink-0" />
                        <span className="truncate">{displayName}</span>
                      </h3>

                      {isDeleted && (
                        <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-semibold flex items-center gap-1">
                          <HelpCircle className="h-3 w-3" /> (deleted restaurant)
                        </span>
                      )}

                      {/* Status Badge */}
                      <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1 ${
                        isPending
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : isApproved
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : isRejected
                          ? 'bg-slate-100 text-slate-700 border border-slate-200'
                          : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                      }`}>
                        {isPending && <AlertTriangle className="h-3 w-3 text-amber-500" />}
                        {isApproved && <CheckCircle2 className="h-3 w-3 text-emerald-500" />}
                        {isRejected && <XCircle className="h-3 w-3 text-slate-400" />}
                        {review.status}
                      </span>
                    </div>

                    {/* Coordinates & Drift Specs */}
                    <div className="flex items-center space-x-4 text-xs flex-wrap gap-y-2">
                      <div className="flex items-center space-x-1.5 text-red-600 bg-red-50/80 px-2.5 py-1 rounded-md border border-red-100 font-semibold">
                        <Navigation className="h-3.5 w-3.5" />
                        <span>Drift: {review.averageDriftMeters.toFixed(1)}m</span>
                      </div>

                      <div className="flex items-center space-x-1 text-gray-600 bg-gray-100 px-2.5 py-1 rounded-md font-medium">
                        <ShieldCheck className="h-3.5 w-3.5 text-gray-500" />
                        <span>Sample: {review.sampleSize} / 10 arrivals</span>
                      </div>

                      <div className="text-gray-400 font-mono text-[11px]">
                        Detected: {new Date(review.detectedAt).toLocaleDateString()} {new Date(review.detectedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>

                    {/* Coordinates Comparison Preview */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono pt-1">
                      <div className="p-2 bg-gray-50 rounded-lg border border-gray-100 flex items-center justify-between">
                        <span className="text-gray-500 font-sans text-[11px] flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-red-500" /> Current Pin:
                        </span>
                        <span className="text-gray-800 font-medium">
                          {review.currentLatitude.toFixed(4)}, {review.currentLongitude.toFixed(4)}
                        </span>
                      </div>

                      <div className="p-2 bg-emerald-50/50 rounded-lg border border-emerald-100/80 flex items-center justify-between">
                        <span className="text-emerald-700 font-sans text-[11px] flex items-center gap-1 font-semibold">
                          <span className="w-2 h-2 rounded-full bg-emerald-500" /> Suggested Pin:
                        </span>
                        <span className="text-emerald-900 font-bold">
                          {review.suggestedLatitude.toFixed(4)}, {review.suggestedLongitude.toFixed(4)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Actions & View Map Button */}
                  <div className="flex items-center space-x-3 shrink-0 self-end lg:self-center">
                    <button
                      onClick={() => setSelectedReview(review)}
                      className="px-3 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 rounded-lg transition-all flex items-center gap-1.5 shadow-2xs"
                    >
                      <Maximize2 className="h-3.5 w-3.5 text-gray-500" /> Compare Map
                    </button>

                    {isPending && (
                      <>
                        <button
                          onClick={(e) => handleReject(review, e)}
                          disabled={rejectMutation.isPending || approveMutation.isPending}
                          className="px-3.5 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200 rounded-lg transition-all disabled:opacity-50 flex items-center gap-1.5 shadow-2xs"
                        >
                          <X className="h-3.5 w-3.5" /> Reject
                        </button>

                        <button
                          onClick={(e) => handleApprove(review, e)}
                          disabled={approveMutation.isPending || rejectMutation.isPending}
                          className="px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 rounded-lg transition-all disabled:opacity-50 flex items-center gap-1.5 shadow-xs"
                        >
                          {approveMutation.isPending ? (
                            <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Check className="h-3.5 w-3.5" />
                          )}
                          Approve Pin
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer Pagination */}
        {!isLoading && !isError && filteredReviews.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-600">
            <div>
              Showing page <span className="font-bold text-gray-900">{page}</span> of{' '}
              <span className="font-bold text-gray-900">{totalPages}</span> ({totalCount} total findings)
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="px-3 py-1.5 font-medium bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-white transition-all flex items-center gap-1"
              >
                <ChevronLeft className="h-3.5 w-3.5" /> Previous
              </button>

              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="px-3 py-1.5 font-medium bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-white transition-all flex items-center gap-1"
              >
                Next <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Map Comparator Modal */}
      {selectedReview && (
        <PinComparatorModal
          review={selectedReview}
          onClose={() => setSelectedReview(null)}
        />
      )}
    </div>
  );
}
