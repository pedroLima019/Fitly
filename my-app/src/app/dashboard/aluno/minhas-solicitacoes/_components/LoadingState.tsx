"use client";

export function LoadingState() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="border-l-4 border-gray-200 bg-gray-100 rounded-lg p-4 animate-pulse"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3 flex-1">
              <div className="w-12 h-12 rounded-full bg-gray-300 flex-shrink-0" />
              <div className="flex-1">
                <div className="h-4 bg-gray-300 rounded mb-2 w-3/4" />
                <div className="h-3 bg-gray-300 rounded mb-2 w-full" />
                <div className="h-3 bg-gray-300 rounded w-1/2" />
              </div>
            </div>
            <div className="w-20 h-10 bg-gray-300 rounded-lg flex-shrink-0" />
          </div>
        </div>
      ))}
    </div>
  );
}
