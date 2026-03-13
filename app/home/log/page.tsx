import ProfileCard from "../../share/components/ProfileCard";
import Navigation from "../../share/components/Navigation";
import SongCard from "../../share/components/SongCard";
import FilterPanel from "../../share/components/FilterPanel";
import { playLogSongs } from "../data/mockData";

export default function LogPage() {
  return (
    <div className="bg-[#9bd5fc] flex flex-col items-center min-h-screen relative w-full">
      {/* Header */}
      <div className="absolute bg-white border-2 border-[#ababab] border-solid h-[110px] left-1/2 top-0 -translate-x-1/2 w-[2560px]" />

      {/* Profile Section */}
      <div className="flex h-[530px] items-center justify-center pb-6 pt-[134px] relative shrink-0 z-10">
        <ProfileCard />
      </div>

      {/* Navigation */}
      <div className="flex flex-col items-center relative shrink-0 z-10">
        <Navigation />
      </div>

      {/* Content Section */}
      <div className="flex flex-col gap-[30px] items-center overflow-hidden py-9 relative shrink-0 w-[1258px] z-10">
        {/* Filter Panel */}
        <FilterPanel />

        {/* Song List */}
        <div className="flex flex-col gap-5 items-start w-full">
          {playLogSongs.map((song, index) => (
            <SongCard key={index} {...song} />
          ))}
        </div>
      </div>
    </div>
  );
}
