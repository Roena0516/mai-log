export default function Navigation() {
  return (
    <div className="bg-white flex flex-col h-[80px] items-start overflow-hidden py-2 shadow-[4px_8px_0px_0px_rgba(0,0,0,0.4)] w-[1258px]">
      <div className="bg-[#ff9fa7] flex flex-1 gap-1 items-center overflow-hidden p-1 w-full">
        {/* 레이팅 - Active */}
        <div className="bg-[#f4868f] flex flex-1 h-full items-center justify-center overflow-hidden rounded-lg">
          <div className="flex flex-col justify-center leading-none text-[30px] text-white whitespace-nowrap font-bold [text-shadow:1px_0_0_#000,-1px_0_0_#000,0_1px_0_#000,0_-1px_0_#000,1px_1px_0_#000,-1px_-1px_0_#000,1px_-1px_0_#000,-1px_1px_0_#000]">
            <p className="leading-normal">레이팅</p>
          </div>
        </div>

        {/* Partition */}
        <div className="bg-[#f4868f] h-[54px] rounded-lg w-[6px]" />

        {/* 플레이 기록 */}
        <div className="flex flex-1 h-full items-center justify-center overflow-hidden rounded-lg">
          <div className="flex flex-col justify-center leading-none text-[30px] text-white whitespace-nowrap font-bold [text-shadow:1px_0_0_#000,-1px_0_0_#000,0_1px_0_#000,0_-1px_0_#000,1px_1px_0_#000,-1px_-1px_0_#000,1px_-1px_0_#000,-1px_1px_0_#000]">
            <p className="leading-normal">플레이 기록</p>
          </div>
        </div>

        {/* Partition */}
        <div className="bg-[#f4868f] h-[54px] rounded-lg w-[6px]" />

        {/* 악곡 리스트 */}
        <div className="flex flex-1 h-full items-center justify-center overflow-hidden rounded-lg">
          <div className="flex flex-col justify-center leading-none text-[30px] text-white whitespace-nowrap font-bold [text-shadow:1px_0_0_#000,-1px_0_0_#000,0_1px_0_#000,0_-1px_0_#000,1px_1px_0_#000,-1px_-1px_0_#000,1px_-1px_0_#000,-1px_1px_0_#000]">
            <p className="leading-normal">악곡 리스트</p>
          </div>
        </div>

        {/* Partition */}
        <div className="bg-[#f4868f] h-[54px] rounded-lg w-[6px]" />

        {/* 다운로드 */}
        <div className="flex flex-1 h-full items-center justify-center overflow-hidden rounded-lg">
          <div className="flex flex-col justify-center leading-none text-[30px] text-white whitespace-nowrap font-bold [text-shadow:1px_0_0_#000,-1px_0_0_#000,0_1px_0_#000,0_-1px_0_#000,1px_1px_0_#000,-1px_-1px_0_#000,1px_-1px_0_#000,-1px_1px_0_#000]">
            <p className="leading-normal">다운로드</p>
          </div>
        </div>
      </div>
    </div>
  );
}
