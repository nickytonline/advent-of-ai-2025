import { useState, useEffect } from 'react';
import { useFlightData } from '../hooks/useFlightData';
import { FlightCard } from './FlightCard';
import { FlightDetailModal } from './FlightDetailModal';
import { GestureType } from '../utils/gestureDetection';

interface FlightBoardProps {
  onFlightSelect?: (flightId: string) => void;
  onGestureNavigate?: (direction: 'up' | 'down') => void;
  gesture?: GestureType | null;
  onGestureProcessed?: () => void;
}

export function FlightBoard({ onFlightSelect, onGestureNavigate, gesture, onGestureProcessed }: FlightBoardProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const {
    data: flights,
    isLoading,
    error,
    refetch,
    dataUpdatedAt,
    isFetching
  } = useFlightData({
    refetchInterval: 30000, // 30 seconds
  });

  // Reset selected index if flights change
  useEffect(() => {
    if (flights && selectedIndex >= flights.length) {
      setSelectedIndex(Math.max(0, flights.length - 1));
    }
  }, [flights, selectedIndex]);

  // Handle gesture input from parent
  useEffect(() => {
    console.log('🎮 Gesture effect triggered - gesture:', gesture, 'flights:', flights?.length);

    if (!gesture) {
      console.log('  ⏭️ No gesture, skipping');
      return;
    }

    if (!flights || flights.length === 0) {
      console.log('  ⏭️ No flights, skipping');
      return;
    }

    console.log('  ✅ Processing gesture:', gesture);

    // Map gestures to navigation actions
    if (gesture === GestureType.CLOSED_FIST) {
      console.log('  ✊ Closed fist - checking modal state');
      // If modal is open, close it first
      if (isModalOpen) {
        console.log('  🔒 Modal open, closing it');
        setIsModalOpen(false);
      } else {
        console.log('  📍 Modal closed, calling handleNavigate(down)');
        handleNavigate('down');
      }
    } else if (gesture === GestureType.OPEN_PALM) {
      console.log('  ✋ Open palm - checking modal state');
      // If modal is open, close it first
      if (isModalOpen) {
        console.log('  🔒 Modal open, closing it');
        setIsModalOpen(false);
      } else {
        console.log('  📍 Modal closed, calling handleNavigate(up)');
        handleNavigate('up');
      }
    } else if (gesture === GestureType.THUMBS_UP) {
      console.log('  👍 Thumbs up - opening modal for selected flight');
      // Open the modal for the currently selected flight
      if (flights && flights[selectedIndex]) {
        setIsModalOpen(true);
      }
    } else {
      console.log('  ❓ Unknown gesture type:', gesture);
    }

    // Mark gesture as processed
    console.log('  🧹 Calling onGestureProcessed');
    onGestureProcessed?.();
  }, [gesture, flights, selectedIndex, isModalOpen, refetch, onGestureProcessed]);

  // Navigate between flights
  const handleNavigate = (direction: 'up' | 'down') => {
    console.log('  📍 handleNavigate called with direction:', direction);
    console.log('  📍 Current selectedIndex:', selectedIndex);
    console.log('  📍 Total flights:', flights?.length);

    if (!flights || flights.length === 0) {
      console.log('  ❌ No flights available');
      return;
    }

    let newIndex = selectedIndex;
    if (direction === 'down') {
      newIndex = Math.min(selectedIndex + 1, flights.length - 1);
      console.log('  ⬇️ Scrolling DOWN: from', selectedIndex, 'to', newIndex);
    } else {
      newIndex = Math.max(selectedIndex - 1, 0);
      console.log('  ⬆️ Scrolling UP: from', selectedIndex, 'to', newIndex);
    }

    setSelectedIndex(newIndex);
    onGestureNavigate?.(direction);
  };

  // Expose navigation to parent via callback
  useEffect(() => {
    // Handle keyboard input
    const handleKeyboard = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        // ESC closes modal
        if (isModalOpen) {
          setIsModalOpen(false);
        }
      } else if (e.key === 'ArrowDown') {
        handleNavigate('down');
      } else if (e.key === 'ArrowUp') {
        handleNavigate('up');
      }
    };

    window.addEventListener('keydown', handleKeyboard);
    return () => window.removeEventListener('keydown', handleKeyboard);
  }, [flights, isModalOpen]);

  // Loading State
  if (isLoading) {
    return (
      <div className="w-full bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-xl border-2 border-slate-700 p-12">
        <div className="flex flex-col items-center justify-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-cyan-500 border-t-transparent"></div>
            <div className="absolute inset-0 flex items-center justify-center text-4xl">
              ✈️
            </div>
          </div>
          <p className="mt-6 text-xl text-gray-300 font-semibold">
            Loading flight data...
          </p>
          <p className="mt-2 text-sm text-gray-500">
            Fetching from OpenSky Network
          </p>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="w-full bg-gradient-to-br from-red-900/20 to-slate-900/50 backdrop-blur-sm rounded-xl border-2 border-red-700/50 p-8">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h3 className="text-2xl font-bold text-red-400 mb-2">
            Failed to Load Flight Data
          </h3>
          <p className="text-gray-300 mb-4">{error.message}</p>
          <button
            onClick={() => refetch()}
            className="bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
          >
            🔄 Retry
          </button>
        </div>
      </div>
    );
  }

  // Empty State
  if (!flights || flights.length === 0) {
    return (
      <div className="w-full bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-xl border-2 border-slate-700 p-12">
        <div className="text-center">
          <div className="text-6xl mb-4">✈️</div>
          <h3 className="text-2xl font-bold text-gray-300 mb-2">
            No Flights in Area
          </h3>
          <p className="text-gray-500 mb-4">
            No aircraft detected in the JFK area at this time
          </p>
          <button
            onClick={() => refetch()}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
          >
            🔄 Refresh
          </button>
        </div>
      </div>
    );
  }

  // Success State - Display Flights
  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-6 bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-xl border-2 border-slate-700 p-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1 flex items-center gap-2">
              <span>✈️</span>
              <span>Live Flights</span>
              {isFetching && (
                <span className="text-sm text-cyan-400 animate-pulse">
                  (updating...)
                </span>
              )}
            </h2>
            <p className="text-sm text-gray-400">
              {flights.length} {flights.length === 1 ? 'flight' : 'flights'} detected near JFK
            </p>
          </div>

          <div className="text-right">
            <p className="text-xs text-gray-500">Last Updated</p>
            <p className="text-sm text-gray-300 font-mono">
              {dataUpdatedAt ? new Date(dataUpdatedAt).toLocaleTimeString() : 'Never'}
            </p>
            <button
              onClick={() => refetch()}
              className="mt-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
            >
              🔄 Refresh
            </button>
          </div>
        </div>

        {/* Navigation Hint */}
        <div className="mt-4 pt-4 border-t border-slate-700/50 flex flex-wrap items-center gap-4 text-xs text-gray-400">
          <div className="flex items-center gap-2">
            <kbd className="px-2 py-1 bg-slate-700 rounded border border-slate-600">↑</kbd>
            <kbd className="px-2 py-1 bg-slate-700 rounded border border-slate-600">↓</kbd>
            <span>Navigate</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-cyan-400">✋ Open Palm</span>
            <span>/</span>
            <span className="text-cyan-400">✊ Closed Fist</span>
            <span>Navigate</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-green-400">👍 Thumbs Up</span>
            <span>View Details</span>
          </div>
        </div>
      </div>

      {/* Flight Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {flights.map((flight, index) => (
          <FlightCard
            key={flight.id}
            flight={flight}
            isSelected={index === selectedIndex}
            onClick={() => {
              setSelectedIndex(index);
              onFlightSelect?.(flight.id);
            }}
          />
        ))}
      </div>

      {/* Flight Counter */}
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-500">
          Showing flight {selectedIndex + 1} of {flights.length}
        </p>
      </div>

      {/* Flight Detail Modal */}
      <FlightDetailModal
        flight={flights[selectedIndex]}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
      />
    </div>
  );
}
