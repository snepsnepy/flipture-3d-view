import { Background, getBackgroundTheme } from "./Background";

export const FlipbookLoader = ({
  backgroundGradient,
  loading,
  isConverting,
  conversionProgress,
  pagesReady,
}) => {
  const isDark = getBackgroundTheme(backgroundGradient) === "dark";
  const textColor = isDark ? "text-white" : "text-black";
  const textColorMuted = isDark ? "text-white/80" : "text-black/60";

  const progressPercent =
    conversionProgress.total > 0
      ? Math.round(
          (conversionProgress.completed / conversionProgress.total) * 100,
        )
      : 0;

  return (
    <div className="fixed inset-0 z-50">
      <Background style={backgroundGradient} animate={false} />

      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          {/* Spinner */}
          <div className="relative mb-8">
            <div className="w-24 h-24 mx-auto relative">
              <div
                className={`absolute inset-0 border-4 rounded-full animate-spin ${
                  isDark ? "border-white/20" : "border-black/20"
                }`}
              />
              <div
                className={`absolute inset-2 border-4 rounded-full animate-pulse ${
                  isDark ? "border-white" : "border-black"
                }`}
              />
              <div
                className={`absolute top-1/2 left-1/2 w-3 h-3 rounded-full -translate-x-1/2 -translate-y-1/2 ${
                  isDark ? "bg-white" : "bg-black"
                }`}
              />
            </div>
          </div>

          {/* Status text */}
          <h2 className={`text-3xl font-bold mb-4 font-poppins ${textColor}`}>
            {loading
              ? "Loading Flipbook Data..."
              : isConverting
                ? "Preparing Your Flipbook"
                : "Loading..."}
          </h2>

          {/* PDF conversion progress */}
          {isConverting && (
            <div className="max-w-md mx-auto">
              <div
                className={`flex justify-between text-sm mb-2 ${textColorMuted}`}
              >
                <span>Converting PDF</span>
                <span>
                  {conversionProgress.total > 0
                    ? `${conversionProgress.completed}/${conversionProgress.total}`
                    : "Loading..."}
                </span>
              </div>

              <div
                className={`w-full rounded-full h-2 mb-4 ${
                  isDark ? "bg-white/20" : "bg-black/15"
                }`}
              >
                <div
                  className="bg-gradient-to-r from-[#FFCC00] to-purple-400 h-2 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              <p
                className={`text-sm ${isDark ? "text-white/60" : "text-black/50"}`}
              >
                {conversionProgress.total > 0
                  ? `${progressPercent}% complete`
                  : "Preparing conversion..."}
              </p>
            </div>
          )}

          {/* Bouncing dots — waiting before conversion starts */}
          {!isConverting && !pagesReady && (
            <div className="flex justify-center space-x-1">
              {[0, 150, 300].map((delay) => (
                <div
                  key={delay}
                  className={`w-2 h-2 rounded-full animate-bounce ${
                    isDark ? "bg-white" : "bg-black"
                  }`}
                  style={{ animationDelay: `${delay}ms` }}
                />
              ))}
            </div>
          )}

          {/* Finalizing state */}
          {!isConverting && pagesReady && (
            <p
              className={`text-sm ${isDark ? "text-white/60" : "text-black/50"}`}
            >
              Finalizing your experience...
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
