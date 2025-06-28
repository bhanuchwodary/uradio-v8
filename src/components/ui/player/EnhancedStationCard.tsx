// ...imports remain unchanged...

export const EnhancedStationCard: React.FC<EnhancedStationCardProps> = memo(({
  // ...props...
}) => {
  // ...handlers and helpers...

  const getCardStyles = () => {
    const baseStyles = cn(
      // REDUCE RADIUS
      "relative overflow-hidden group transition-all duration-300 cursor-pointer rounded", // <<-- changed from rounded-md
      "transform hover:scale-105 active:scale-95 border-0 backdrop-blur-sm",
      "hover:shadow-xl hover:-translate-y-1",
      isDisabled && "hover:scale-100 cursor-default"
    );
    // ...rest unchanged...
    // (rest of getCardStyles)
  };

  // ...getStationIcon...

  return (
    <Card className={getCardStyles()} onClick={handlePlayClick}>
      <div className="h-full w-full p-2.5 flex flex-col">
        {variant === "featured" ? (
          // ...featured layout unchanged...
        ) : (
          <div className="flex flex-col h-full justify-between items-center space-y-1">
            {/* Station Name */}
            <div className="flex-shrink-0 w-full text-center px-0.5">
              <h3 className={cn(
                "font-medium text-xs leading-tight line-clamp-2 break-words",
                "min-h-[1.8rem] flex items-center justify-center",
                isSelected ? "text-primary font-semibold" 
                : inPlaylist && actionIcon === "add" ? "text-green-700 font-medium"
                : isProcessing ? "text-blue-700 font-medium"
                : "text-foreground"
              )}>
                {station.name}
              </h3>
            </div>
            {/* Language Badge */}
            <div className="flex-shrink-0">
              <span className={cn(
                "bg-gradient-to-r px-1.5 py-0.5 rounded-full text-[9px] font-medium border shadow-sm",
                "transition-all duration-200 whitespace-nowrap",
                isSelected 
                  ? "from-primary/20 to-primary/10 text-primary border-primary/30" 
                  : inPlaylist && actionIcon === "add"
                  ? "from-green-500/20 to-green-500/10 text-green-600 border-green-500/30"
                  : isProcessing
                  ? "from-blue-500/20 to-blue-500/10 text-blue-600 border-blue-500/30"
                  : "from-muted/60 to-muted/40 text-muted-foreground border-muted/50"
              )}>
                {station.language || "Unknown"}
                {inPlaylist && actionIcon === "add" && " ✓"}
                {isProcessing && " ..."}
              </span>
            </div>
            {/* Action Buttons - tight, aligned row */}
            <div className="flex flex-row items-center justify-center gap-0.5 w-full px-1">
              {/* Favorite Button */}
              {onToggleFavorite && (
                <button 
                  className="h-6 w-6 flex items-center justify-center transition-colors duration-200 hover:scale-110 active:scale-90 focus:outline-none"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite();
                  }}
                  aria-label={station.isFavorite ? "Remove from favorites" : "Add to favorites"}
                  style={{ background: "none", border: "none", padding: 0 }}
                >
                  <Star className={cn(
                    "h-4 w-4 transition-colors duration-200",
                    station.isFavorite ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground group-hover:text-yellow-500"
                  )} />
                </button>
              )}
              {/* Play Button */}
              <button
                className={cn(
                  "h-6 w-6 flex items-center justify-center rounded-full transition-colors duration-200",
                  isPlaying
                    ? "bg-primary text-primary-foreground shadow-md"
                    : inPlaylist && actionIcon === "add"
                    ? "bg-green-500/20 text-green-600 border border-green-500/30"
                    : isProcessing
                    ? "bg-blue-500/20 text-blue-600 border border-blue-500/30 animate-pulse"
                    : "bg-secondary/80 text-secondary-foreground hover:bg-primary/30",
                  isDisabled && "opacity-50 pointer-events-none"
                )}
                onClick={handlePlayClick}
                style={{ minWidth: 24, minHeight: 24, padding: 0 }}
                aria-label="Play station"
              >
                <StationCardButton
                  station={station}
                  isPlaying={isPlaying}
                  isSelected={isSelected}
                  actionIcon={actionIcon}
                  context={context}
                  inPlaylist={inPlaylist}
                  isAddingToPlaylist={isProcessing}
                  onClick={handlePlayClick}
                  isDisabled={isDisabled}
                  isProcessing={isProcessing}
                />
              </button>
              {/* Delete Button */}
              {onDelete && (
                <button 
                  className="h-6 w-6 flex items-center justify-center transition-colors duration-200 hover:scale-110 active:scale-90 focus:outline-none"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete();
                  }}
                  aria-label={context === "playlist" ? "Remove from playlist" : "Delete station"}
                  style={{ background: "none", border: "none", padding: 0 }}
                >
                  <svg className="h-4 w-4 text-destructive hover:text-destructive/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3m5 0H6" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}, /* ...memo equality ... */);
