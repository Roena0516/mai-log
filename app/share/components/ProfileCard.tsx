import Image from "next/image";
import { profileData } from "../../home/data/mockData";

export default function ProfileCard() {
  return (
    <div className="bg-[#cee8fb] border-[3px] border-[#2b2b2b] border-solid flex gap-9 items-center justify-center overflow-hidden p-9 rounded-lg shadow-[4px_8px_0px_0px_rgba(0,0,0,0.4)]">
      {/* UserProfile - Left Card */}
      <div className="bg-white flex gap-[15px] h-[300px] items-center overflow-hidden p-6 rounded-lg shadow-[4px_8px_0px_0px_rgba(0,0,0,0.4)] w-[850px]">
        {/* Profile Image */}
        <div className="aspect-square h-full relative shrink-0">
          <Image
            src="/share/assets/ProfileImage.png"
            alt="Profile"
            fill
            className="object-cover"
          />
        </div>

        {/* Detail Profile Section */}
        <div className="flex flex-1 flex-col h-full items-start justify-between overflow-hidden relative">
          {/* Title */}
          <div className="bg-[#f9b993] border-[3px] border-[#e1946d] border-solid flex h-[40px] items-center justify-center overflow-hidden p-[7.5px] rounded-lg shadow-[0px_3px_0px_0px_rgba(0,0,0,0.6)] w-full">
            <div className="flex flex-col justify-center leading-none text-[18px] text-white whitespace-nowrap font-regular [text-shadow:2px_0_0_#2b2b2b,-2px_0_0_#2b2b2b,0_2px_0_#2b2b2b,0_-2px_0_#2b2b2b,2px_2px_0_#2b2b2b,-2px_-2px_0_#2b2b2b,2px_-2px_0_#2b2b2b,-2px_2px_0_#2b2b2b]">
              <p className="leading-normal">{profileData.title}</p>
            </div>
          </div>

          {/* Name and Rating */}
          <div className="flex gap-3 items-start w-full">
            {/* Name */}
            <div className="bg-white border-[#dbdbdb] border-[3.75px] border-solid flex flex-1 h-14 items-center overflow-hidden p-2 rounded-lg shadow-[0px_3px_0px_0px_rgba(0,0,0,0.6)]">
              <div className="flex flex-col justify-center leading-none text-[30px] text-[#2b2b2b] whitespace-nowrap font-regular">
                <p className="leading-normal">{profileData.nickname}</p>
              </div>
            </div>

            {/* Rating Section */}
            <div className="flex gap-1 items-center">
              {/* Rating */}
              <div
                className="flex h-14 items-start p-1 rounded-lg w-[150px]"
                style={{
                  backgroundImage:
                    "linear-gradient(99.2704deg, rgb(182, 218, 255) 1.6753%, rgb(244, 255, 120) 29.583%, rgb(255, 192, 192) 53.769%, rgb(192, 255, 137) 76.56%)",
                }}
              >
                <div className="bg-gradient-to-b flex flex-1 from-[#5d5d5d] h-full items-center justify-between overflow-hidden relative rounded-[7.5px] to-[#6b6b6b]">
                  <div className="absolute bg-[#828282] h-[15px] left-0 top-[33.75px] w-[142.5px]" />
                  {profileData.rating.map((digit, index) => (
                    <div
                      key={index}
                      className="border-[#4f4a4a] border border-solid flex flex-1 flex-col h-full items-center justify-center overflow-hidden relative"
                    >
                      <div className="flex flex-col justify-center leading-none text-[#ffe788] text-[32px] text-center w-full font-semibold">
                        <p className="leading-normal">{digit}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Stars - 2x2 Grid */}
              <div className="grid grid-cols-2 grid-rows-2 gap-0.5 shrink-0 w-12 h-12">
                <div className="relative w-full h-full">
                  <Image
                    src="/share/assets/RatingStar.png"
                    alt="Star"
                    fill
                    className="object-contain"
                  />
                </div>
                <div className="relative w-full h-full">
                  <Image
                    src="/share/assets/RatingStar.png"
                    alt="Star"
                    fill
                    className="object-contain"
                  />
                </div>
                <div className="relative w-full h-full">
                  <Image
                    src="/share/assets/RatingStar.png"
                    alt="Star"
                    fill
                    className="object-contain"
                  />
                </div>
                <div className="relative w-full h-full">
                  <Image
                    src="/share/assets/RatingStar.png"
                    alt="Star"
                    fill
                    className="object-contain"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Sebu - Dan, Otomo, Star */}
          <div className="flex gap-4 items-center w-full">
            {/* Dan */}
            <div className="h-16 relative w-[170px]">
              <Image
                src="/share/assets/Dan.png"
                alt="Dan"
                fill
                className="object-contain"
              />
              {/* <div
                className="absolute flex flex-col justify-center leading-none left-[calc(50%-54px)] text-[#eedbff] text-[36px] top-1/2 -translate-y-1/2 whitespace-nowrap font-extrabold"
                style={{ textShadow: "0px 3px 0px rgba(0, 0, 0, 0.6)" }}
              >
                <p className="leading-normal">真初段</p>
              </div> */}
            </div>

            {/* Otomo */}
            <div className="h-16 relative w-[133px]">
              <Image
                src="/share/assets/Otomo.png"
                alt="Otomo"
                fill
                className="object-contain"
              />
              {/* <div
                className="absolute flex flex-col justify-center leading-none left-[calc(50%-34.5px)] text-[#bddfff] text-[36px] top-1/2 -translate-y-1/2 whitespace-nowrap font-extrabold"
                style={{ textShadow: "0px 3px 0px rgba(0, 0, 0, 0.6)" }}
              >
                <p className="leading-normal">SS5</p>
              </div> */}
            </div>

            {/* Star */}
            <div className="flex gap-2 items-center overflow-hidden px-3 py-2">
              <div className="relative shrink-0 w-12 h-12">
                <Image
                  src="/share/assets/Star.png"
                  alt="Star"
                  fill
                  className="object-contain"
                />
              </div>
              <div className="flex flex-col justify-center leading-none text-[30px] text-[#2b2b2b] whitespace-nowrap font-regular">
                <p className="leading-normal">× {profileData.starCount}</p>
              </div>
            </div>
          </div>

          {/* Play Count */}
          <div className="flex gap-2 items-center leading-none w-full">
            <div className="flex flex-col justify-center text-[24px] text-[#2b2b2b] whitespace-nowrap font-regular">
              <p className="leading-normal">
                PLAY COUNT : {profileData.playCount.toLocaleString()}
              </p>
            </div>
            <div className="flex flex-col h-full justify-center text-[#898989] text-[20px] w-[49px] font-regular">
              <p className="leading-normal">/ {profileData.currentPlayCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* TourLeader - Right Image */}
      <div className="h-[300px] relative w-[300px] shrink-0">
        <Image
          src="/share/assets/TourLeader.png"
          alt="Tour Leader"
          fill
          className="object-contain"
        />
      </div>
    </div>
  );
}
