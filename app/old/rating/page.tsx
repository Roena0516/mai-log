import ProfileCard from "../../share/components/ProfileCard";
import Navigation from "../../share/components/Navigation";
import SongCard from "../../share/components/SongCard";
import { ratingSongs } from "../../home/data/mockData";

export default function RatingPage() {
  return (
    <div className="bg-[#9bd5fc] flex flex-col items-center min-h-screen relative w-full">
      {/* Header */}
      <div className="absolute bg-white border-2 border-[#ababab] border-solid h-[110px] left-1/2 top-0 -translate-x-1/2 w-full" />

      {/* Profile Section */}
      <div className="flex h-[530px] items-center justify-center pb-6 pt-[134px] relative shrink-0 z-10">
        <ProfileCard />
      </div>

      {/* Navigation */}
      <div className="flex flex-col items-center relative shrink-0 z-10">
        <Navigation />
      </div>

      {/* Rating List */}
      <div className="flex flex-col gap-[30px] items-center overflow-hidden py-9 relative shrink-0 w-[1258px] z-10">
        {/* Title Panel */}
        <div className="bg-white flex h-[80px] items-center justify-center overflow-hidden rounded-lg shadow-[4px_8px_0px_0px_rgba(0,0,0,0.4)] w-[300px]">
          <div className="flex flex-col justify-center leading-none text-[30px] text-[#2b2b2b] whitespace-nowrap font-normal">
            <p className="leading-normal">레이팅 대상곡</p>
          </div>
        </div>

        {/* Song List */}
        <div className="flex flex-col gap-5 items-start w-full">
          {ratingSongs.map((song, index) => (
            <SongCard key={index} {...song} />
          ))}
        </div>
      </div>
    </div>
  );
}
