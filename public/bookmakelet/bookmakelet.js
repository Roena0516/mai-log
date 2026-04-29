javascript: (async function () {
  const SERVER_URL = "http://localhost:3000"; // 배포 URL로 변경
  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  // ── 최소 오버레이 (팝업 차단 대비 폴백용) ──────────────────────────
  const overlay = document.createElement("div");
  overlay.style = `
    position: fixed; top: 20px; left: 50%; transform: translateX(-50%);
    background: rgba(10,10,20,0.93); color: #e8e8f0;
    padding: 14px 22px; z-index: 1000000;
    font-family: 'Segoe UI', sans-serif; border-radius: 10px;
    border: 1px solid rgba(120,100,255,0.4); font-size: 13px;
    text-align: center; pointer-events: none;
  `;
  overlay.textContent = "mai-log: 데이터 수집 준비 중...";
  document.body.appendChild(overlay);

  const setOverlay = (text) => {
    overlay.textContent = text;
  };
  const removeOverlay = () => overlay.remove();

  // ── 아이콘 파싱 ───────────────────────────────────────────────────
  const SYNC_KW = ["fdxp", "fdx", "sync", "fsdp", "fsd", "fsp", "fs"];
  const CLEAR_KW = ["app", "ap", "fcp", "fc"];

  const parseIcons = (row) => {
    const srcs = [...row.querySelectorAll('img[src*="music_icon_"]')].map(
      (i) => i.src,
    );
    const syncSrc = srcs.find((s) => SYNC_KW.some((k) => s.includes(k)));
    const clearSrc = srcs.find((s) => CLEAR_KW.some((k) => s.includes(k)));
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

  const PL_SYNC_KW = ["sync", "fsdplus", "fsd", "fsplus", "fs"];
  const PL_CLEAR_KW = ["applus", "ap", "fcplus", "fc"];

  const parsePlaylogIcons = (entry) => {
    const srcs = [
      ...entry.querySelectorAll(".playlog_result_innerblock img"),
    ].map((i) => i.src);
    const syncSrc = srcs.find((s) => PL_SYNC_KW.some((k) => s.includes(k)));
    const clearSrc = srcs.find((s) => PL_CLEAR_KW.some((k) => s.includes(k)));
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
    // ── ready 리스너를 먼저 등록한 뒤 페이지 열기 ──────────────────
    setOverlay("mai-log: 페이지 연결 중...");
    const readyPromise = new Promise((resolve, reject) => {
      const tid = setTimeout(() => reject(new Error("연결 타임아웃")), 12000);
      const handler = (e) => {
        if (e.data?.type === "ready") {
          clearTimeout(tid);
          window.removeEventListener("message", handler);
          resolve();
        }
      };
      window.addEventListener("message", handler);
    });

    const mailogWindow = window.open(SERVER_URL + "/sync");
    if (!mailogWindow) {
      throw new Error("팝업이 차단됐습니다. 팝업 허용 후 다시 실행해 주세요.");
    }

    const send = (msg) => {
      try {
        mailogWindow.postMessage(msg, SERVER_URL);
      } catch (_) {}
    };

    await readyPromise;

    const extractNum = (text) =>
      text ? parseInt(text.replace(/[^0-9]/g, ""), 10) : 0;

    // ── 1. 프로필 ───────────────────────────────────────────────────
    setOverlay("mai-log: 프로필 수집 중...");
    send({ type: "step", id: "profile", status: "progress" });

    const pRes = await fetch(
      "https://maimaidx-eng.com/maimai-mobile/playerData/",
    );
    const pHtml = await pRes.text();
    const pDoc = new DOMParser().parseFromString(pHtml, "text/html");

    const userProfile = {
      nickname: pDoc.querySelector(".name_block")?.textContent?.trim() ?? "",
      title:
        pDoc
          .querySelector(".trophy_inner_block.f_13 span")
          ?.textContent?.trim() ?? "",
      playCountTotal: (() => {
        const el = [...pDoc.querySelectorAll(".m_5.m_b_5.t_r.f_12")].find((e) =>
          e.textContent?.includes("maimaiDX total play count"),
        );
        return el ? extractNum(el.textContent?.split("：")[1]) : 0;
      })(),
      playCountVersion: (() => {
        const el = [...pDoc.querySelectorAll(".m_5.m_b_5.t_r.f_12")].find((e) =>
          e.textContent?.includes("play count of current version"),
        );
        return el ? extractNum(el.textContent?.split("：")[1]) : 0;
      })(),
    };

    send({ type: "step", id: "profile", status: "done", profile: userProfile });

    // ── 2~6. 난이도별 악보 ─────────────────────────────────────────
    const DIFFS = [
      { d: 0, id: "basic", name: "BASIC" },
      { d: 1, id: "advanced", name: "ADVANCED" },
      { d: 2, id: "expert", name: "EXPERT" },
      { d: 3, id: "master", name: "MASTER" },
      { d: 4, id: "remaster", name: "Re:MASTER" },
    ];
    const DIFF_TYPE = ["basic", "advanced", "expert", "master", "remaster"];

    let allRecords = [];

    for (const { d, id, name } of DIFFS) {
      setOverlay(`mai-log: ${name} 수집 중...`);
      send({ type: "step", id, status: "progress" });

      const res = await fetch(
        `https://maimaidx-eng.com/maimai-mobile/record/musicGenre/search/?genre=99&diff=${d}`,
      );
      const html = await res.text();
      const doc = new DOMParser().parseFromString(html, "text/html");

      const diffRecords = [];
      doc.querySelectorAll(".pointer").forEach((row) => {
        const title = row
          .querySelector(".music_name_block")
          ?.textContent?.trim();
        const scoreStr = row
          .querySelector(".music_score_block")
          ?.textContent?.trim();
        if (!title || !scoreStr) return;

        const achievement = Math.round(
          parseFloat(scoreStr.replace("%", "")) * 10000,
        );
        const { sync, clearMark } = parseIcons(row);
        diffRecords.push({
          title,
          achievement,
          difficulty_type: DIFF_TYPE[d],
          is_dx: !!row.parentElement?.querySelector('img[src*="music_dx.png"]'),
          sync,
          clear_mark: clearMark,
        });
      });

      allRecords = allRecords.concat(diffRecords);
      send({ type: "step", id, status: "done", count: diffRecords.length });
      await sleep(100);
    }

    // ── 7. 최근 플레이 기록 ────────────────────────────────────────
    setOverlay("mai-log: 최근 기록 수집 중...");
    send({ type: "step", id: "recentLogs", status: "progress" });

    const rRes = await fetch("https://maimaidx-eng.com/maimai-mobile/record/");
    const rHtml = await rRes.text();
    const rDoc = new DOMParser().parseFromString(rHtml, "text/html");

    const recentLogs = [...rDoc.querySelectorAll(".p_10.t_l.f_0.v_b")]
      .map((entry) => {
        const title = entry
          .querySelector(".basic_block")
          ?.textContent?.trim()
          .split("\n")
          .pop()
          ?.trim();

        const achDiv = entry.querySelector(".playlog_achievement_txt");
        const achInt = achDiv?.childNodes[0]?.textContent?.trim();
        const achDec = achDiv?.querySelector(".f_20")?.textContent?.trim();
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

    send({
      type: "step",
      id: "recentLogs",
      status: "done",
      count: recentLogs.length,
    });

    // ── 8. 서버 전송 (sync 페이지가 대신 처리) ────────────────────
    setOverlay("mai-log: 저장 중...");
    send({
      type: "save",
      userProfile,
      records: allRecords,
      recentLogs,
    });

    removeOverlay();
  } catch (err) {
    setOverlay(`mai-log 오류: ${err.message}`);
    try {
      window.opener?.postMessage(
        { type: "error", message: err.message },
        SERVER_URL,
      );
    } catch (_) {}
    setTimeout(removeOverlay, 5000);
    console.error("[mai-log]", err);
  }
})();
