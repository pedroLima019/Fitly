"use client";

export function LoadingState() {
  return (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className="border-l-4 border-gray-300 rounded-lg p-4 bg-gray-100 animate-pulse"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gray-300 rounded-full" />
            <div className="flex-1">
              <div className="h-4 bg-gray-300 rounded w-1/4 mb-2" />
              <div className="h-3 bg-gray-300 rounded w-3/4" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
