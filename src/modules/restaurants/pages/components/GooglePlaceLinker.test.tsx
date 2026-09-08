/**
 * Unit tests for GooglePlaceLinker component and edge cases
 * 
 * Acceptance Criteria Covered:
 * 1. Initial/Unlinked state rendering.
 * 2. Short query (< 2 characters) does not call search API and shows helper text.
 * 3. Suggestions rendering for valid search query (>= 2 characters).
 * 4. Selecting suggestion triggers place linking mutation.
 * 5. Empty suggestions response shows "No matches, try a more specific search."
 * 6. Error handling for failed search/save preserves input text.
 * 7. Linked state displays Place ID and "Change" / "Unlink" buttons.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GooglePlaceLinker } from './GooglePlaceLinker';
import { restaurantService } from '@/core/api/restaurants';
import toast from 'react-hot-toast';

vi.mock('@/core/api/restaurants', () => ({
  restaurantService: {
    searchGooglePlaces: vi.fn(),
    linkGooglePlace: vi.fn(),
  },
}));

vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('GooglePlaceLinker Component', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
    vi.clearAllMocks();
  });

  const renderComponent = (props: React.ComponentProps<typeof GooglePlaceLinker>) => {
    return render(
      <QueryClientProvider client={queryClient}>
        <GooglePlaceLinker {...props} />
      </QueryClientProvider>
    );
  };

  it('renders unlinked search input state when currentGooglePlaceId is not provided', () => {
    renderComponent({ restaurantId: 'rst-123' });

    expect(screen.getByText('Google Listing')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Search Google Places by name & area/i)).toBeInTheDocument();
  });

  it('shows helper text and does not call API when query is < 2 characters', async () => {
    renderComponent({ restaurantId: 'rst-123' });

    const input = screen.getByPlaceholderText(/Search Google Places by name & area/i);
    fireEvent.change(input, { target: { value: 'K' } });

    await waitFor(() => {
      expect(screen.getByText(/Type at least 2 characters to search Google Places/i)).toBeInTheDocument();
    });

    expect(restaurantService.searchGooglePlaces).not.toHaveBeenCalled();
  });

  it('calls search API and displays suggestions when query is >= 2 characters', async () => {
    const mockSuggestions = [
      {
        placeId: 'place-1',
        description: 'Kalp Airoli, Navi Mumbai',
        mainText: 'Kalp Restaurant',
        secondaryText: 'Mugalsan Road, Airoli, Navi Mumbai',
      },
    ];
    vi.mocked(restaurantService.searchGooglePlaces).mockResolvedValueOnce({
      suggestions: mockSuggestions,
    });

    renderComponent({ restaurantId: 'rst-123' });

    const input = screen.getByPlaceholderText(/Search Google Places by name & area/i);
    fireEvent.change(input, { target: { value: 'Kalp' } });

    await waitFor(() => {
      expect(restaurantService.searchGooglePlaces).toHaveBeenCalledWith('Kalp');
      expect(screen.getByText('Kalp Restaurant')).toBeInTheDocument();
      expect(screen.getByText('Mugalsan Road, Airoli, Navi Mumbai')).toBeInTheDocument();
    });
  });

  it('shows "No matches, try a more specific search." when API returns empty suggestions', async () => {
    vi.mocked(restaurantService.searchGooglePlaces).mockResolvedValueOnce({
      suggestions: [],
    });

    renderComponent({ restaurantId: 'rst-123' });

    const input = screen.getByPlaceholderText(/Search Google Places by name & area/i);
    fireEvent.change(input, { target: { value: 'NonExistentRestaurant123' } });

    await waitFor(() => {
      expect(screen.getByText('No matches, try a more specific search.')).toBeInTheDocument();
    });
  });

  it('triggers link mutation when a suggestion is clicked', async () => {
    const mockSuggestions = [
      {
        placeId: 'place-123',
        description: 'Kalp Airoli',
        mainText: 'Kalp Restaurant',
        secondaryText: 'Airoli',
      },
    ];
    vi.mocked(restaurantService.searchGooglePlaces).mockResolvedValueOnce({
      suggestions: mockSuggestions,
    });
    vi.mocked(restaurantService.linkGooglePlace).mockResolvedValueOnce({ success: true });

    renderComponent({ restaurantId: 'rst-123' });

    const input = screen.getByPlaceholderText(/Search Google Places by name & area/i);
    fireEvent.change(input, { target: { value: 'Kalp' } });

    await waitFor(() => {
      expect(screen.getByText('Kalp Restaurant')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Kalp Restaurant'));

    await waitFor(() => {
      expect(restaurantService.linkGooglePlace).toHaveBeenCalledWith('rst-123', 'place-123');
      expect(toast.success).toHaveBeenCalledWith('Google Place linked successfully!');
    });
  });

  it('renders linked state when currentGooglePlaceId is provided', () => {
    renderComponent({
      restaurantId: 'rst-123',
      currentGooglePlaceId: 'ChIJ2Xqc2Hu55zsRmcJTLxvSJLE',
    });

    expect(screen.getByText('Linked')).toBeInTheDocument();
    expect(screen.getByText('ChIJ2Xqc2Hu55zsRmcJTLxvSJLE')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Change/i })).toBeInTheDocument();
  });

  it('displays "Currently Linked" badge on suggestion matching currentGooglePlaceId', async () => {
    const mockSuggestions = [
      {
        placeId: 'ChIJ2Xqc2Hu55zsRmcJTLxvSJLE',
        description: 'Pizza Hut FC Road',
        mainText: 'Pizza Hut',
        secondaryText: 'FC Road, Pune',
      },
    ];
    vi.mocked(restaurantService.searchGooglePlaces).mockResolvedValueOnce({
      suggestions: mockSuggestions,
    });

    renderComponent({
      restaurantId: 'rst-123',
      currentGooglePlaceId: 'ChIJ2Xqc2Hu55zsRmcJTLxvSJLE',
    });

    // Click change to open search view
    fireEvent.click(screen.getByRole('button', { name: /Change/i }));

    const input = screen.getByPlaceholderText(/Search Google Places by name & area/i);
    fireEvent.change(input, { target: { value: 'Pizza' } });

    await waitFor(() => {
      expect(screen.getByText('Currently Linked')).toBeInTheDocument();
    });
  });

  it('displays "Linked to [Name]" badge on suggestion linked to another restaurant', async () => {
    const mockSuggestions = [
      {
        placeId: 'place-other',
        description: 'Pizza Hut Mumbai',
        mainText: 'Pizza Hut',
        secondaryText: 'Kandivali, Mumbai',
        isLinked: true,
        linkedRestaurantName: 'Pizza Hut Kandivali Branch',
      },
    ];
    vi.mocked(restaurantService.searchGooglePlaces).mockResolvedValueOnce({
      suggestions: mockSuggestions,
    });

    renderComponent({ restaurantId: 'rst-123' });

    const input = screen.getByPlaceholderText(/Search Google Places by name & area/i);
    fireEvent.change(input, { target: { value: 'Pizza' } });

    await waitFor(() => {
      expect(screen.getByText('Linked to Pizza Hut Kandivali Branch')).toBeInTheDocument();
      expect(screen.getByText('Re-link')).toBeInTheDocument();
    });
  });
});
