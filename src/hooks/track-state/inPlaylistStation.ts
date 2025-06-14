
import { Track } from "@/types/track";

// Toggle a station’s inPlaylist status (add/remove from playlist)
export const toggleTrackInPlaylist = (
  tracks: Track[],
  index: number
): Track[] => {
  const newTracks = JSON.parse(JSON.stringify(tracks));
  if (newTracks[index]) {
    const newInPlaylistStatus = !newTracks[index].inPlaylist;
    newTracks[index] = {
      ...newTracks[index],
      inPlaylist: newInPlaylistStatus,
    };
    console.log(
      `Toggled inPlaylist for station at index ${index} to ${newInPlaylistStatus}`
    );
  }
  return newTracks;
};
