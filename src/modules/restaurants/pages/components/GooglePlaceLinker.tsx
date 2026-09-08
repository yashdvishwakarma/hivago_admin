import { useState } from 'react';
import { Search, MapPin, Loader2, CheckCircle2, RefreshCw, X, AlertCircle } from 'lucide-react';
import { useGooglePlaceSearch } from '../../hooks/useGooglePlaceSearch';
import { useLinkGooglePlace } from '../../hooks/useLinkGooglePlace';
import type { PlaceSuggestion } from '@/core/api/restaurants';

interface GooglePlaceLinkerProps {
  restaurantId: string;
  currentGooglePlaceId?: string | null;
  restaurantName?: string;
  onLinkSuccess?: () => void;
}

export function GooglePlaceLinker({
  restaurantId,
  currentGooglePlaceId,
  restaurantName,
  onLinkSuccess,
}: GooglePlaceLinkerProps) {
  const [query, setQuery] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);

  const { data, isLoading, isError, isEnabled } = useGooglePlaceSearch(query);
  const linkMutation = useLinkGooglePlace(restaurantId);

  const suggestions = data?.suggestions || [];
  const isLinked = !!currentGooglePlaceId && !isEditing;

  const handleSelectSuggestion = (suggestion: PlaceSuggestion) => {
    setSelectedPlaceId(suggestion.placeId);
    linkMutation.mutate(suggestion.placeId, {
      onSuccess: () => {
        setIsEditing(false);
        setQuery('');
        setSelectedPlaceId(null);
        if (onLinkSuccess) {
          onLinkSuccess();
        }
      },
      onError: () => {
        // Keep the typed query intact on error as per requirements
        setSelectedPlaceId(null);
      },
    });
  };

  const handleUnlink = () => {
    linkMutation.mutate(null, {
      onSuccess: () => {
        setIsEditing(true);
        setQuery('');
      },
    });
  };

  return (
    <div className="p-4 bg-gray-50/80 rounded-xl border border-gray-200/80 space-y-3">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg border border-blue-100">
            <MapPin className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Google Listing</h3>
            <p className="text-[12px] text-gray-500">Link restaurant to Google Place ID for ratings & reviews</p>
          </div>
        </div>

        {isLinked && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Linked
          </span>
        )}
      </div>

      {/* Linked View */}
      {isLinked ? (
        <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="space-y-0.5 max-w-[70%] truncate">
            <div className="text-xs font-medium text-gray-400 uppercase tracking-wider">Place ID</div>
            <div className="text-sm font-mono font-medium text-gray-800 truncate" title={currentGooglePlaceId}>
              {currentGooglePlaceId}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setIsEditing(true);
                if (restaurantName) {
                  setQuery(restaurantName);
                }
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-300 rounded-md transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5 text-gray-500" />
              Change
            </button>
            <button
              type="button"
              onClick={handleUnlink}
              disabled={linkMutation.isPending}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 border border-red-200 rounded-md transition-colors disabled:opacity-50"
            >
              {linkMutation.isPending ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                'Unlink'
              )}
            </button>
          </div>
        </div>
      ) : (
        /* Search View */
        <div className="space-y-2">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search Google Places by name & area..."
              className="w-full pl-9 pr-9 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Helper hint for short queries (< 2 chars) */}
          {query.trim().length > 0 && query.trim().length < 2 && (
            <p className="text-xs text-amber-600 flex items-center gap-1 px-1">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              Type at least 2 characters to search Google Places.
            </p>
          )}

          {/* Loading state */}
          {isLoading && isEnabled && (
            <div className="flex items-center justify-center py-4 text-gray-500 gap-2 text-xs bg-white rounded-lg border border-gray-200">
              <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
              Searching Google Places...
            </div>
          )}

          {/* No matches state */}
          {!isLoading && isEnabled && !isError && suggestions.length === 0 && (
            <div className="p-3 text-center text-xs text-gray-500 bg-white rounded-lg border border-gray-200">
              No matches, try a more specific search.
            </div>
          )}

          {/* Suggestions List (up to 5 items) */}
          {!isLoading && isEnabled && suggestions.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 shadow-lg divide-y divide-gray-100 overflow-hidden max-h-60 overflow-y-auto">
              {suggestions.slice(0, 5).map((suggestion) => {
                const isSelected = selectedPlaceId === suggestion.placeId;
                const isPendingThis = isSelected && linkMutation.isPending;

                const isLinkedToThis = currentGooglePlaceId === suggestion.placeId || suggestion.linkedRestaurantId === restaurantId;
                const linkedName = suggestion.linkedRestaurantName;
                const isLinkedToOther = !isLinkedToThis && (suggestion.isLinked || !!linkedName || (!!suggestion.linkedRestaurantId && suggestion.linkedRestaurantId !== restaurantId));

                return (
                  <button
                    key={suggestion.placeId}
                    type="button"
                    onClick={() => handleSelectSuggestion(suggestion)}
                    disabled={linkMutation.isPending || isLinkedToThis}
                    className={`w-full text-left p-3 hover:bg-blue-50/60 focus:bg-blue-50/60 focus:outline-none transition-colors flex items-start justify-between gap-3 group disabled:opacity-80 ${
                      isLinkedToThis ? 'bg-emerald-50/40' : ''
                    }`}
                  >
                    <div className="space-y-1 max-w-[75%]">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                          {suggestion.mainText || suggestion.description}
                        </span>
                        {isLinkedToThis && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
                            <CheckCircle2 className="w-3 h-3" />
                            Currently Linked
                          </span>
                        )}
                        {isLinkedToOther && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-800 border border-amber-300" title={`Linked to ${linkedName || 'another restaurant'}`}>
                            <AlertCircle className="w-3 h-3 text-amber-600" />
                            Linked to {linkedName || 'another restaurant'}
                          </span>
                        )}
                      </div>
                      {suggestion.secondaryText && (
                        <div className="text-xs text-gray-500 line-clamp-1">
                          {suggestion.secondaryText}
                        </div>
                      )}
                    </div>

                    {isPendingThis ? (
                      <Loader2 className="w-4 h-4 animate-spin text-blue-600 shrink-0 mt-0.5" />
                    ) : isLinkedToThis ? (
                      <span className="text-xs font-semibold text-emerald-700 shrink-0 mt-0.5">
                        Linked
                      </span>
                    ) : (
                      <span className="text-xs font-medium text-blue-600 group-hover:opacity-100 transition-opacity shrink-0 mt-0.5">
                        {isLinkedToOther ? 'Re-link' : 'Link'}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* Cancel Editing button if previously linked */}
          {currentGooglePlaceId && isEditing && (
            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setQuery('');
                }}
                className="text-xs text-gray-500 hover:text-gray-700 font-medium underline underline-offset-2"
              >
                Cancel change
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
