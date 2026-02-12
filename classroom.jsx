import { useState, useMemo, useCallback } from "react";

const INITIAL_ROWS = [
  {
    left: ["Ciumete Rebeca", "Hurmuzache Sara-Antonia", "Olaru Eduard-Vasilică"],
    right: ["Goarză Luca", "Muscă Ana-Maria", "Șimon Maria"],
  },
  {
    left: ["Ardeleanu Adelina-Maria", "Primicheru Ana-Maria", "Pruteanu Thea-Dannia"],
    right: ["Spînache Nectarie", "Maftei Luca-Eduard", "Mititelu Denis-Andrei"],
  },
  {
    left: ["Purcaru-Condrat Ioan-Alexandru", "Boișteanu Alexandru", "Gnandt Raul-Francisc"],
    right: ["Cosma Diana-Elena", "Bobeică Sofia-Maria", "Stărparu Rebecca-Maria"],
  },
  {
    left: ["Spînu Ștefan-Bogdan", null, "Constantin Rareș-Ștefan"],
    right: ["Popa Mircea-Vladimir", null, "Balan Valent"],
  },
];

const START_DATE = new Date(2026, 1, 13);
const END_DATE = new Date(2026, 5, 19);

const ROMANIAN_DAYS = ["Duminică", "Luni", "Marți", "Miercuri", "Joi", "Vineri", "Sâmbătă"];
const ROMANIAN_MONTHS = [
  "Ianuarie", "Februarie", "Martie", "Aprilie", "Mai", "Iunie",
  "Iulie", "August", "Septembrie", "Octombrie", "Noiembrie", "Decembrie",
];

function dateToStr(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function isExcluded(d) {
  const day = d.getDay();
  if (day === 0 || day === 6) return true;
  const ds = dateToStr(d);
  if (ds >= "2026-02-23" && ds <= "2026-02-27") return true;
  if (ds >= "2026-04-06" && ds <= "2026-04-14") return true;
  if (ds === "2026-05-01" || ds === "2026-06-01" || ds === "2026-06-05") return true;
  return false;
}

function getAllSchoolDays() {
  const days = [];
  const d = new Date(START_DATE);
  while (d <= END_DATE) {
    if (!isExcluded(d)) days.push(new Date(d));
    d.setDate(d.getDate() + 1);
  }
  return days;
}

function getSchoolDayIndex(date, schoolDays) {
  const ds = dateToStr(date);
  return schoolDays.findIndex((d) => dateToStr(d) === ds);
}

function getRowsForDay(dayIndex) {
  const rotation = dayIndex % 4;
  const rows = [];
  for (let i = 0; i < 4; i++) {
    rows[i] = INITIAL_ROWS[(i - rotation + 4) % 4];
  }
  return rows;
}

function formatShort(d) {
  return `${d.getDate()} ${ROMANIAN_MONTHS[d.getMonth()].substring(0, 3)}`;
}

function formatFull(d) {
  return `${ROMANIAN_DAYS[d.getDay()]}, ${d.getDate()} ${ROMANIAN_MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

const FEMALE_HINTS = ["Rebeca", "Sara", "Ana", "Maria", "Thea", "Diana", "Sofia", "Rebecca", "Adelina", "Elena"];
function isFemale(name) {
  return name && FEMALE_HINTS.some((h) => name.includes(h));
}

const RC = [
  { bg: "rgba(59,130,246,0.10)", bd: "#3b82f6", lb: "#3b82f6", gw: "rgba(59,130,246,0.22)" },
  { bg: "rgba(16,185,129,0.10)", bd: "#10b981", lb: "#10b981", gw: "rgba(16,185,129,0.22)" },
  { bg: "rgba(245,158,11,0.10)", bd: "#f59e0b", lb: "#f59e0b", gw: "rgba(245,158,11,0.22)" },
  { bg: "rgba(239,68,68,0.10)", bd: "#ef4444", lb: "#ef4444", gw: "rgba(239,68,68,0.22)" },
];

export default function ClassroomSeating() {
  const schoolDays = useMemo(() => getAllSchoolDays(), []);

  const initialIndex = useMemo(() => {
    const today = new Date();
    const idx = getSchoolDayIndex(today, schoolDays);
    return idx >= 0 ? idx : 0;
  }, [schoolDays]);

  const [ci, setCi] = useState(initialIndex);
  const cur = schoolDays[ci];
  const rows = useMemo(() => getRowsForDay(ci), [ci]);
  const prev = ci > 0 ? schoolDays[ci - 1] : null;
  const next = ci < schoolDays.length - 1 ? schoolDays[ci + 1] : null;

  const goPrev = useCallback(() => setCi((i) => Math.max(0, i - 1)), []);
  const goNext = useCallback(() => setCi((i) => Math.min(schoolDays.length - 1, i + 1)), [schoolDays.length]);
  const goToday = useCallback(() => {
    const idx = getSchoolDayIndex(new Date(), schoolDays);
    setCi(idx >= 0 ? idx : 0);
  }, [schoolDays]);

  function renderSeat(name) {
    if (!name) {
      return (
        <div className="seat empty-seat">
          <div className="seat-ico">💺</div>
        </div>
      );
    }
    return (
      <div className="seat">
        <div className="seat-ico">{isFemale(name) ? "👩‍🎓" : "👨‍🎓"}</div>
        <div className="seat-fam">{name.split(" ")[0]}</div>
        <div className="seat-first">{name.split(" ").slice(1).join(" ")}</div>
      </div>
    );
  }

  function renderDesk(seats, c) {
    return (
      <div
        className="dk desk"
        style={{
          borderColor: c.bd,
          background: c.bg,
          boxShadow: `0 4px 20px ${c.gw}, inset 0 1px 0 rgba(255,255,255,.04)`,
        }}
      >
        {seats.map((s, i) => (
          <div key={i}>{renderSeat(s)}</div>
        ))}
      </div>
    );
  }

  return (
    <div className="page">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;700&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        body{background:#060a14}

        @keyframes slideIn{
          from{opacity:0;transform:translateY(14px) scale(.98)}
          to{opacity:1;transform:translateY(0) scale(1)}
        }

        .page{
          min-height:100vh;
          background:linear-gradient(160deg,#060a14 0%,#0c1222 50%,#0a0f1e 100%);
          font-family:'Outfit',sans-serif;
          color:#e2e8f0;
          padding:24px 16px 40px;
        }
        .wrap{max-width:1100px;margin:0 auto}

        /* Header */
        .hdr{text-align:center;margin-bottom:28px}
        .title{
          font-size:38px;font-weight:900;letter-spacing:-0.03em;
          background:linear-gradient(135deg,#818cf8,#6366f1,#a78bfa);
          -webkit-background-clip:text;-webkit-text-fill-color:transparent;
          margin-bottom:4px;
        }
        .sub{
          font-size:14px;color:#475569;
          font-family:'JetBrains Mono',monospace;font-weight:500;
        }

        /* Navigation */
        .nav{
          display:flex;justify-content:center;align-items:stretch;
          gap:10px;margin-bottom:32px;flex-wrap:wrap;
        }
        .nav-side{
          background:rgba(255,255,255,.04);
          border:1px solid rgba(255,255,255,.08);
          border-radius:14px;padding:14px 22px;
          text-align:center;min-width:130px;
          display:flex;flex-direction:column;align-items:center;gap:2px;
          transition:all .2s cubic-bezier(.4,0,.2,1);
          cursor:pointer;user-select:none;
        }
        .nav-side:hover{transform:translateY(-2px);filter:brightness(1.15)}
        .nav-side:active{transform:scale(.97)}
        .nav-arr{font-size:24px;font-weight:300;color:#6366f1;line-height:1}
        .nav-lbl{font-size:11px;font-weight:600;color:#94a3b8;text-transform:uppercase;letter-spacing:.06em}
        .nav-dt{font-size:13px;font-family:'JetBrains Mono',monospace;color:#64748b;margin-top:2px}

        .nav-center{
          background:linear-gradient(135deg,rgba(99,102,241,.15),rgba(139,92,246,.10));
          border:1px solid rgba(99,102,241,.3);
          border-radius:16px;padding:14px 28px;
          text-align:center;min-width:200px;
          display:flex;flex-direction:column;align-items:center;gap:2px;
          box-shadow:0 4px 24px rgba(99,102,241,.15);
          transition:all .2s cubic-bezier(.4,0,.2,1);
          cursor:pointer;user-select:none;
        }
        .nav-center:hover{transform:translateY(-2px);filter:brightness(1.15)}
        .nav-center:active{transform:scale(.97)}
        .nav-icon{font-size:18px;color:#818cf8;line-height:1}
        .nav-clbl{font-size:13px;font-weight:700;color:#c7d2fe;text-transform:uppercase;letter-spacing:.08em}
        .nav-cdt{font-size:13px;font-weight:600;color:#e0e7ff;font-family:'JetBrains Mono',monospace;margin-top:2px}

        /* Boards */
        .boards{
          display:flex;justify-content:center;gap:24px;
          margin-bottom:20px;
          transform:rotateX(2deg);transform-origin:center bottom;
        }
        .bb-frame{
          background:linear-gradient(180deg,#6b5a3e,#8B7355,#6b5a3e);
          border-radius:6px;padding:6px;
          box-shadow:0 8px 32px rgba(0,0,0,.5);
          flex:1;max-width:340px;
        }
        .bb-surf{
          background:linear-gradient(170deg,#1a3a2a,#1f4a33,#17352a);
          border-radius:3px;padding:14px 32px;
          display:flex;align-items:center;justify-content:center;
        }
        .bb-txt{
          font-size:20px;font-weight:700;
          color:rgba(255,255,255,.6);letter-spacing:.35em;
          text-shadow:0 0 8px rgba(255,255,255,.08);
        }

        /* Scene */
        .scene{margin-bottom:24px;overflow-x:auto;-webkit-overflow-scrolling:touch}
        .persp{perspective:1400px;perspective-origin:50% 25%;min-width:680px}

        /* Rows */
        .rows-area{
          display:flex;flex-direction:column;gap:12px;
          transform:rotateX(4deg);transform-origin:center top;
          padding:0 4px;
        }
        .row-strip{
          display:flex;align-items:center;gap:10px;
          justify-content:center;
        }
        .badge{
          width:38px;height:38px;border-radius:10px;
          border:1.5px solid;display:flex;
          align-items:center;justify-content:center;flex-shrink:0;
        }
        .badge-n{font-size:18px;font-weight:900}

        .desks-wrap{
          display:flex;gap:20px;justify-content:center;
        }

        .desk{
          display:flex;gap:2px;padding:10px 6px;
          border-radius:12px;border:1px solid;position:relative;
          transition:transform .3s cubic-bezier(.4,0,.2,1),box-shadow .3s ease;
        }
        .dk:hover{transform:translateY(-3px)!important}

        .seat{
          display:flex;flex-direction:column;align-items:center;
          padding:4px 6px;min-width:68px;
        }
        .seat-ico{font-size:17px;margin-bottom:2px}
        .seat-fam{
          font-size:10px;font-weight:800;color:#f1f5f9;
          text-transform:uppercase;text-align:center;
          letter-spacing:.02em;line-height:1.2;
        }
        .seat-first{
          font-size:9px;font-weight:400;color:#94a3b8;
          text-align:center;line-height:1.15;margin-top:1px;
        }
        .empty-seat{opacity:0.25}

        .floor{
          height:14px;
          background:repeating-linear-gradient(90deg,transparent,transparent 80px,rgba(255,255,255,.015) 80px,rgba(255,255,255,.015) 81px);
          margin-top:10px;
        }

        /* Legend */
        .leg{
          display:flex;flex-direction:column;align-items:center;
          gap:6px;padding:14px 20px;
          background:rgba(255,255,255,.02);
          border:1px solid rgba(255,255,255,.05);
          border-radius:14px;
        }
        .leg-cycle{font-size:15px;font-family:'JetBrains Mono',monospace}
        .leg-h{font-size:12px;color:#475569;text-align:center}

        /* Scrollbar */
        ::-webkit-scrollbar{width:5px;height:5px}
        ::-webkit-scrollbar-track{background:rgba(255,255,255,.03)}
        ::-webkit-scrollbar-thumb{background:rgba(99,102,241,.35);border-radius:3px}

        /* ========== TABLET ========== */
        @media(max-width:768px){
          .title{font-size:28px}
          .sub{font-size:12px}
          .nav{gap:6px}
          .nav-side{padding:10px 14px;min-width:90px;border-radius:10px}
          .nav-center{padding:10px 16px;min-width:150px;border-radius:12px}
          .nav-lbl,.nav-clbl{font-size:10px}
          .nav-dt,.nav-cdt{font-size:11px}
          .nav-arr{font-size:20px}
          .persp{min-width:0;perspective:none}
          .rows-area{transform:none}
          .boards{transform:none;gap:12px}
          .bb-frame{max-width:260px}
          .bb-surf{padding:10px 20px}
          .bb-txt{font-size:16px;letter-spacing:.2em}
          .desks-wrap{gap:10px}
          .seat{min-width:58px;padding:3px 4px}
          .seat-fam{font-size:9px}
          .seat-first{font-size:8px}
          .seat-ico{font-size:15px}
          .desk{padding:8px 4px}
        }

        /* ========== MOBILE ========== */
        @media(max-width:520px){
          .page{padding:16px 6px 24px}
          .hdr{margin-bottom:18px}
          .title{font-size:22px}
          .sub{font-size:11px}
          .nav{gap:5px;margin-bottom:20px}
          .nav-side{padding:8px 8px;min-width:70px;border-radius:8px}
          .nav-center{padding:8px 10px;min-width:110px;border-radius:10px}
          .nav-arr{font-size:16px}
          .nav-lbl{font-size:8px}
          .nav-dt{font-size:9px}
          .nav-icon{font-size:13px}
          .nav-clbl{font-size:9px}
          .nav-cdt{font-size:10px}
          .boards{gap:6px;margin-bottom:14px}
          .bb-frame{max-width:170px;padding:4px}
          .bb-surf{padding:8px 12px}
          .bb-txt{font-size:12px;letter-spacing:.12em}
          .scene{margin-bottom:16px}
          .rows-area{gap:8px}
          .row-strip{gap:6px}
          .badge{width:28px;height:28px;border-radius:7px}
          .badge-n{font-size:13px}
          .desks-wrap{gap:6px;flex-wrap:wrap;justify-content:center}
          .desk{padding:5px 3px;border-radius:8px;gap:0px}
          .seat{min-width:46px;padding:2px 2px}
          .seat-ico{font-size:12px;margin-bottom:1px}
          .seat-fam{font-size:7.5px;letter-spacing:0}
          .seat-first{font-size:6.5px}
          .leg{padding:10px 10px}
          .leg-cycle{font-size:12px}
          .leg-h{font-size:10px}
        }

        /* ========== VERY SMALL ========== */
        @media(max-width:380px){
          .title{font-size:20px}
          .nav-side{min-width:60px;padding:6px 6px}
          .nav-center{min-width:90px;padding:6px 8px}
          .nav-clbl{font-size:8px}
          .nav-cdt{font-size:9px}
          .bb-frame{max-width:140px}
          .bb-txt{font-size:10px;letter-spacing:.08em}
          .seat{min-width:40px;padding:2px 1px}
          .seat-ico{font-size:11px}
          .seat-fam{font-size:7px}
          .seat-first{font-size:6px}
          .desk{padding:4px 2px;border-radius:6px}
          .desks-wrap{gap:4px}
          .badge{width:24px;height:24px;border-radius:6px}
          .badge-n{font-size:11px}
        }

        /* ========== LARGE DESKTOP (1440p+) ========== */
        @media(min-width:1440px){
          .wrap{max-width:1400px}
          .page{padding:40px 32px 60px}
          .hdr{margin-bottom:40px}
          .title{font-size:52px;margin-bottom:8px}
          .sub{font-size:18px}
          .nav{gap:16px;margin-bottom:44px}
          .nav-side{padding:20px 32px;min-width:180px;border-radius:18px}
          .nav-arr{font-size:32px}
          .nav-lbl{font-size:14px}
          .nav-dt{font-size:16px}
          .nav-center{padding:20px 40px;min-width:280px;border-radius:20px}
          .nav-icon{font-size:24px}
          .nav-clbl{font-size:16px}
          .nav-cdt{font-size:16px}
          .boards{gap:40px;margin-bottom:32px}
          .bb-frame{max-width:480px;padding:8px;border-radius:10px}
          .bb-surf{padding:20px 48px;border-radius:5px}
          .bb-txt{font-size:28px}
          .rows-area{gap:18px}
          .row-strip{gap:16px}
          .badge{width:52px;height:52px;border-radius:14px;border-width:2px}
          .badge-n{font-size:24px}
          .desks-wrap{gap:32px}
          .desk{padding:16px 12px;border-radius:16px;gap:4px;border-width:2px}
          .seat{min-width:100px;padding:8px 10px}
          .seat-ico{font-size:26px;margin-bottom:4px}
          .seat-fam{font-size:15px;letter-spacing:.03em}
          .seat-first{font-size:12px;margin-top:2px}
          .floor{height:20px;margin-top:16px}
          .leg{padding:20px 32px;border-radius:18px;gap:10px}
          .leg-cycle{font-size:20px}
          .leg-h{font-size:15px}
        }

        /* ========== 2K / QHD (2560p+) ========== */
        @media(min-width:2200px){
          .wrap{max-width:1800px}
          .page{padding:56px 48px 80px}
          .hdr{margin-bottom:52px}
          .title{font-size:68px;margin-bottom:12px}
          .sub{font-size:22px}
          .nav{gap:20px;margin-bottom:56px}
          .nav-side{padding:26px 40px;min-width:220px;border-radius:22px}
          .nav-arr{font-size:40px}
          .nav-lbl{font-size:17px}
          .nav-dt{font-size:19px}
          .nav-center{padding:26px 52px;min-width:360px;border-radius:24px}
          .nav-icon{font-size:30px}
          .nav-clbl{font-size:20px}
          .nav-cdt{font-size:20px}
          .boards{gap:56px;margin-bottom:40px}
          .bb-frame{max-width:600px;padding:10px;border-radius:12px}
          .bb-surf{padding:26px 60px;border-radius:6px}
          .bb-txt{font-size:36px}
          .rows-area{gap:24px}
          .row-strip{gap:20px}
          .badge{width:66px;height:66px;border-radius:18px;border-width:2.5px}
          .badge-n{font-size:30px}
          .desks-wrap{gap:44px}
          .desk{padding:22px 16px;border-radius:20px;gap:6px;border-width:2.5px}
          .seat{min-width:130px;padding:10px 14px}
          .seat-ico{font-size:34px;margin-bottom:6px}
          .seat-fam{font-size:19px;letter-spacing:.04em}
          .seat-first{font-size:15px;margin-top:3px}
          .floor{height:28px;margin-top:20px}
          .leg{padding:26px 40px;border-radius:22px;gap:12px}
          .leg-cycle{font-size:24px}
          .leg-h{font-size:18px}
        }

        /* ========== 4K (3840p+) ========== */
        @media(min-width:3200px){
          .wrap{max-width:2600px}
          .page{padding:72px 64px 100px}
          .hdr{margin-bottom:64px}
          .title{font-size:88px;margin-bottom:16px}
          .sub{font-size:28px}
          .nav{gap:28px;margin-bottom:72px}
          .nav-side{padding:34px 52px;min-width:280px;border-radius:28px;border-width:2px}
          .nav-arr{font-size:52px}
          .nav-lbl{font-size:21px}
          .nav-dt{font-size:24px}
          .nav-center{padding:34px 64px;min-width:460px;border-radius:30px;border-width:2px;box-shadow:0 8px 48px rgba(99,102,241,.2)}
          .nav-icon{font-size:38px}
          .nav-clbl{font-size:26px}
          .nav-cdt{font-size:26px}
          .boards{gap:72px;margin-bottom:52px}
          .bb-frame{max-width:800px;padding:14px;border-radius:16px}
          .bb-surf{padding:34px 80px;border-radius:8px}
          .bb-txt{font-size:46px}
          .persp{min-width:1200px}
          .rows-area{gap:32px}
          .row-strip{gap:28px}
          .badge{width:86px;height:86px;border-radius:22px;border-width:3px}
          .badge-n{font-size:40px}
          .desks-wrap{gap:60px}
          .desk{padding:28px 22px;border-radius:24px;gap:8px;border-width:3px}
          .seat{min-width:170px;padding:14px 18px}
          .seat-ico{font-size:44px;margin-bottom:8px}
          .seat-fam{font-size:24px;letter-spacing:.04em}
          .seat-first{font-size:19px;margin-top:4px}
          .floor{height:36px;margin-top:28px}
          .leg{padding:34px 52px;border-radius:28px;gap:16px;border-width:2px}
          .leg-cycle{font-size:32px}
          .leg-h{font-size:22px}
        }
      `}</style>

      <div className="wrap">
        {/* Header */}
        <div className="hdr">
          <h1 className="title">Harta Clasei</h1>
          <p className="sub">
            Ziua {ci + 1} / {schoolDays.length} · Rotația {(ci % 4) + 1}/4
          </p>
        </div>

        {/* Navigation */}
        <div className="nav">
          <div
            className="nav-side"
            style={{ opacity: prev ? 1 : 0.3, pointerEvents: prev ? "auto" : "none" }}
            onClick={goPrev}
          >
            <div className="nav-arr">‹</div>
            <div className="nav-lbl">Ziua anterioară</div>
            <div className="nav-dt">{prev ? formatShort(prev) : "—"}</div>
          </div>

          <div className="nav-center" onClick={goToday}>
            <div className="nav-icon">◉</div>
            <div className="nav-clbl">Astăzi</div>
            <div className="nav-cdt">{cur ? formatFull(cur) : ""}</div>
          </div>

          <div
            className="nav-side"
            style={{ opacity: next ? 1 : 0.3, pointerEvents: next ? "auto" : "none" }}
            onClick={goNext}
          >
            <div className="nav-arr">›</div>
            <div className="nav-lbl">Ziua următoare</div>
            <div className="nav-dt">{next ? formatShort(next) : "—"}</div>
          </div>
        </div>

        {/* Classroom */}
        <div className="scene">
          <div className="persp">
            {/* Two blackboards */}
            <div className="boards">
              <div className="bb-frame">
                <div className="bb-surf">
                  <span className="bb-txt">T A B L Ă</span>
                </div>
              </div>
              <div className="bb-frame">
                <div className="bb-surf">
                  <span className="bb-txt">T A B L Ă</span>
                </div>
              </div>
            </div>

            {/* Rows */}
            <div className="rows-area">
              {rows.map((row, ri) => {
                const c = RC[ri];
                return (
                  <div
                    key={`${ci}-${ri}`}
                    className="row-strip"
                    style={{
                      animation: `slideIn .45s cubic-bezier(.4,0,.2,1) ${ri * 0.08}s both`,
                    }}
                  >
                    <div
                      className="badge"
                      style={{ background: c.bg, borderColor: c.bd, color: c.lb }}
                    >
                      <span className="badge-n">{ri + 1}</span>
                    </div>

                    <div className="desks-wrap">
                      {renderDesk(row.left, c)}
                      {renderDesk(row.right, c)}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="floor" />
          </div>
        </div>

        {/* Legend */}
        <div className="leg">
          <span className="leg-cycle">
            {RC.map((c, i) => (
              <span key={i}>
                <span style={{ color: c.lb, fontWeight: 800 }}>R{i + 1}</span>
                {i < 3 && (
                  <span style={{ color: "#334155", margin: "0 6px" }}>→</span>
                )}
              </span>
            ))}
            <span style={{ color: "#334155", margin: "0 6px" }}>→</span>
            <span style={{ color: RC[0].lb, fontWeight: 800 }}>R1</span>
          </span>
          <span className="leg-h">
            Rândurile se rotesc zilnic · 13 Feb – 19 Iun 2026
          </span>
        </div>
      </div>
    </div>
  );
}
