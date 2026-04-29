javascript: (async function () {
  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const statusDiv = document.createElement("div");
  statusDiv.style = `
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(10, 10, 20, 0.97);
    color: #e8e8f0;
    padding: 20px 28px;
    z-index: 1000000;
    font-family: 'Segoe UI', sans-serif;
    border-radius: 14px;
    border: 1.5px solid rgba(120, 100, 255, 0.5);
    font-size: 13px;
    line-height: 1.8;
    box-shadow: 0 8px 32px rgba(80, 60, 200, 0.25);
    min-width: 280px;
    text-align: center;
  `;
  document.body.appendChild(statusDiv);

  const setStatus = (icon, title, sub = "") => {
    statusDiv.innerHTML = `
      <div style="font-size:22px; margin-bottom:6px;">${icon}</div>
      <div style="font-weight:600; font-size:14px; color:#c8bfff;">${title}</div>
      ${sub ? `<div style="font-size:12px; color:#888; margin-top:4px;">${sub}</div>` : ""}
    `;
  };

  // 전체 기록 아이콘 파싱 (music_icon_ 기반)
  const RECORD_SYNC_KEYWORDS = [
    "fdxp",
    "fdx",
    "sync",
    "fsdp",
    "fsd",
    "fsp",
    "fs",
  ];
  const RECORD_CLEAR_KEYWORDS = ["app", "ap", "fcp", "fc"];

  const parseIcons = (row) => {
    const srcs = [...row.querySelectorAll('img[src*="music_icon_"]')].map(
      (img) => img.src,
    );
    const syncSrc = srcs.find((src) =>
      RECORD_SYNC_KEYWORDS.some((k) => src.includes(k)),
    );
    const clearSrc = srcs.find((src) =>
      RECORD_CLEAR_KEYWORDS.some((k) => src.includes(k)),
    );
    const sync = syncSrc?.match(/music_icon_(\w+)\.png/)?.[1] ?? null;
    const clearMark = clearSrc?.includes("app")
      ? "app"
      : clearSrc?.includes("ap")
        ? "ap"
        : clearSrc?.includes("fcp")
          ? "fcp"
          : clearSrc?.includes("fc")
            ? "fc"
            : "clear";
    return { sync, clearMark };
  };

  // 플레이로그 아이콘 파싱 (playlog/ 기반)
  const PLAYLOG_SYNC_KEYWORDS = ["sync", "fsdplus", "fsd", "fsplus", "fs"];
  const PLAYLOG_CLEAR_KEYWORDS = ["applus", "ap", "fcplus", "fc"];

  const parsePlaylogIcons = (entry) => {
    const srcs = [
      ...entry.querySelectorAll(".playlog_result_innerblock img"),
    ].map((img) => img.src);
    const syncSrc = srcs.find((src) =>
      PLAYLOG_SYNC_KEYWORDS.some((k) => src.includes(k)),
    );
    const clearSrc = srcs.find((src) =>
      PLAYLOG_CLEAR_KEYWORDS.some((k) => src.includes(k)),
    );
    const sync = syncSrc?.match(/playlog\/(\w+)\.png/)?.[1] ?? null;
    const clearMark = clearSrc?.includes("dummy")
      ? "clear"
      : clearSrc?.includes("applus")
        ? "app"
        : clearSrc?.includes("ap")
          ? "ap"
          : clearSrc?.includes("fcplus")
            ? "fcp"
            : clearSrc?.includes("fc")
              ? "fc"
              : "clear";
    return { sync, clearMark };
  };

  try {
    setStatus("👤", "프로필 불러오는 중...");

    const pRes = await fetch(
      "https://maimaidx-eng.com/maimai-mobile/playerData/",
    );
    const pHtml = await pRes.text();
    const pDoc = new DOMParser().parseFromString(pHtml, "text/html");

    const extractNum = (text) =>
      text ? parseInt(text.replace(/[^0-9]/g, "")) : 0;

    const userProfile = {
      nickname: pDoc.querySelector(".name_block")?.innerText.trim() || "",
      title:
        pDoc.querySelector(".trophy_inner_block.f_13 span")?.innerText.trim() ||
        "",
      playCountTotal: (function () {
        const elements = [...pDoc.querySelectorAll(".m_5.m_b_5.t_r.f_12")];
        const target = elements.find((e) =>
          e.innerText.includes("maimaiDX total play count"),
        );
        return target ? extractNum(target.innerText.split("：")[1]) : 0;
      })(),
      playCountVersion: (function () {
        const elements = [...pDoc.querySelectorAll(".m_5.m_b_5.t_r.f_12")];
        const target = elements.find((e) =>
          e.innerText.includes("play count of current version"),
        );
        return target ? extractNum(target.innerText.split("：")[1]) : 0;
      })(),
    };

    // 플레이 로그 수집
    setStatus("🕐", "최근 플레이 기록 불러오는 중...");
    const rRes = await fetch("https://maimaidx-eng.com/maimai-mobile/record/");
    const rHtml = await rRes.text();
    const rDoc = new DOMParser().parseFromString(rHtml, "text/html");

    const recentLogs = [...rDoc.querySelectorAll(".p_10.t_l.f_0.v_b")]
      .map((entry) => {
        const title = entry
          .querySelector(".basic_block")
          ?.innerText.trim()
          .split("\n")
          .pop()
          .trim();
        const achDiv = entry.querySelector(".playlog_achievement_txt");
        const achInt = achDiv?.childNodes[0]?.textContent?.trim();
        const achDec = achDiv?.querySelector(".f_20")?.innerText?.trim();
        const achievement =
          achInt && achDec
            ? Math.round(
                parseFloat(`${achInt}${achDec}`.replace("%", "")) * 10000,
              )
            : null;
        const diffSrc = entry.querySelector(".playlog_diff")?.src ?? "";
        const difficulty_type = diffSrc.includes("remaster")
          ? "remaster"
          : diffSrc.includes("master")
            ? "master"
            : diffSrc.includes("expert")
              ? "expert"
              : diffSrc.includes("advanced")
                ? "advanced"
                : "basic";
        const { sync, clearMark } = parsePlaylogIcons(entry);
        const is_dx = !!entry.querySelector(
          'img.playlog_music_kind_icon[src*="music_dx.png"]',
        );

        return {
          title,
          achievement,
          difficulty_type,
          is_dx,
          sync,
          clear_mark: clearMark,
        };
      })
      .filter((r) => r.title && r.achievement !== null);

    // 악보 수집
    const diffNames = {
      0: "Basic",
      1: "Advanced",
      2: "Expert",
      3: "Master",
      4: "Re:MASTER",
    };
    const diffTypes = {
      0: "basic",
      1: "advanced",
      2: "expert",
      3: "master",
      4: "remaster",
    };
    const diffColors = {
      0: "#4caf50",
      1: "#ff9800",
      2: "#f44336",
      3: "#9c27b0",
      4: "#e0b0ff",
    };
    const diffs = [0, 1, 2, 3, 4];
    let allRecords = [];

    for (let d of diffs) {
      setStatus(
        "🎵",
        `악보 수집 중...`,
        `<span style="color:${diffColors[d]}; font-weight:600;">${diffNames[d]}</span> · 지금까지 ${allRecords.length}개`,
      );

      const res = await fetch(
        `https://maimaidx-eng.com/maimai-mobile/record/musicGenre/search/?genre=99&diff=${d}`,
      );
      const html = await res.text();
      const doc = new DOMParser().parseFromString(html, "text/html");

      doc.querySelectorAll(".pointer").forEach((row) => {
        const title = row.querySelector(".music_name_block")?.innerText.trim();
        const scoreStr = row
          .querySelector(".music_score_block")
          ?.innerText.trim();

        if (title && scoreStr) {
          const achievement = Math.round(
            parseFloat(scoreStr.replace("%", "")) * 10000,
          );
          const { sync, clearMark } = parseIcons(row);

          allRecords.push({
            title,
            achievement,
            difficulty_type: diffTypes[d],
            is_dx: !!row.parentElement?.querySelector(
              'img[src*="music_dx.png"]',
            ),
            sync,
            clear_mark: clearMark,
          });
        }
      });

      await sleep(100);
    }

    setStatus(
      "✅",
      "수집 완료!",
      `악보 ${allRecords.length}개 · 최근 플레이 ${recentLogs.length}개`,
    );
    console.log("[mai-log] records", allRecords);
    console.log("[mai-log] recentLogs", recentLogs);
    console.log("[mai-log] profile", userProfile);
    setTimeout(() => statusDiv.remove(), 3000);
  } catch (err) {
    statusDiv.style.border = "1.5px solid rgba(255, 80, 80, 0.6)";
    setStatus("❌", "오류가 발생했습니다", err.message);
    console.error("[mai-log] error", err);
  }
})();
