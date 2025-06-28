
import React from "react";
import { EmptyState } from "./EmptyState";
import { Music, Heart, Star, Plus, Search, Radio } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const NoStationsEmptyState: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <EmptyState
      icon={Radio}
      title="No Stations Yet"
      description="Start building your radio collection by adding your first station. Discover music from around the world!"
      actionLabel="Add First Station"
      onAction={() => navigate("/add")}
      variant="illustrated"
    />
  );
};

export const NoFavoritesEmptyState: React.FC = () => {
  return (
    <EmptyState
      icon={Heart}
      title="No Favorite Stations"
      description="Mark stations as favorites by tapping the heart icon. Your favorite stations will appear here for quick access."
      variant="minimal"
    />
  );
};

export const NoSearchResultsEmptyState: React.FC<{ searchQuery: string }> = ({ searchQuery }) => {
  return (
    <EmptyState
      icon={Search}
      title="No Results Found"
      description={`We couldn't find any stations matching "${searchQuery}". Try adjusting your search terms or browse our featured stations.`}
      variant="minimal"
    />
  );
};

export const NoFeaturedStationsEmptyState: React.FC = () => {
  return (
    <EmptyState
      icon={Star}
      title="Featured Stations Loading"
      description="We're preparing some amazing radio stations for you. This usually takes just a moment."
      variant="minimal"
    />
  );
};

export const PlaylistEmptyState: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <EmptyState
      icon={Plus}
      title="Your Playlist is Empty"
      description="Add some radio stations to your playlist to start listening. Browse our collection or add your own custom stations."
      actionLabel="Browse Stations"
      onAction={() => navigate("/station-list")}
      variant="illustrated"
    />
  );
};
