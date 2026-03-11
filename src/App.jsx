import { useState, useRef, useEffect } from "react";

const fontLink = document.createElement("link");
fontLink.rel = "stylesheet";
fontLink.href = "https://fonts.googleapis.com/css2?family=Nunito:wght@300;400;500;600;700;800;900&family=Quicksand:wght@400;500;600;700&display=swap";
document.head.appendChild(fontLink);

const globalStyle = document.createElement("style");
globalStyle.textContent = `
  html, body { margin: 0; padding: 0; width: 100%; height: 100%; overflow-x: hidden; }
  #root { width: 100%; min-height: 100vh; display: flex; flex-direction: column; }
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Quicksand', sans-serif; background: #fce4f0; }
  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: #fde8f4; }
  ::-webkit-scrollbar-thumb { background: #f9a8d4; border-radius: 99px; }
  @keyframes fadeIn      { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
  @keyframes fadeInScale { from{opacity:0;transform:scale(0.95)} to{opacity:1;transform:scale(1)} }
  @keyframes float       { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
  @keyframes floatSlow   { 0%,100%{transform:translateY(0) rotate(-2deg)} 50%{transform:translateY(-14px) rotate(2deg)} }
  @keyframes sparkle     { 0%,100%{transform:scale(1) rotate(0deg);opacity:1} 50%{transform:scale(1.4) rotate(180deg);opacity:0.6} }
  @keyframes slideIn     { from{transform:translateX(-20px);opacity:0} to{transform:translateX(0);opacity:1} }
  @keyframes checkPop    { 0%{transform:scale(0.5);opacity:0} 60%{transform:scale(1.2)} 100%{transform:scale(1);opacity:1} }
  @keyframes modeSlide   { from{opacity:0;transform:translateY(-6px)} to{opacity:1;transform:translateY(0)} }
  .fadeIn      { animation: fadeIn 0.45s ease forwards; }
  .fadeInScale { animation: fadeInScale 0.4s ease forwards; }
  .float       { animation: float 3.5s ease-in-out infinite; }
  .floatSlow   { animation: floatSlow 5s ease-in-out infinite; }
  .modeSlide   { animation: modeSlide 0.25s ease forwards; }
  .sideItem:hover { background: rgba(244,114,182,0.12) !important; }
  .mailRow:hover  { background: rgba(249,168,212,0.15) !important; }
  .card-hover { transition: box-shadow 0.25s, transform 0.25s; cursor: pointer; }
  .card-hover:hover { box-shadow: 0 14px 40px rgba(244,114,182,0.28) !important; transform: translateY(-3px); }
  .receipt-btn { transition: all 0.18s; }
  .receipt-btn:hover { transform: scale(1.04); }
`;
document.head.appendChild(globalStyle);

const C = {
  glass:      "rgba(255,255,255,0.55)",
  glassStrong:"rgba(255,255,255,0.78)",
  border:     "rgba(249,168,212,0.4)",
  pink:       "#f472b6",
  pinkDark:   "#ec4899",
  pinkLight:  "#fda4cf",
  pinkPale:   "#fce7f3",
  purple:     "#c084fc",
  blue:       "#60a5fa",
  bluePale:   "#eff6ff",
  text:       "#6b21a8",
  textMid:    "#9d4edd",
  textLight:  "#c084fc",
  green:      "#34d399",
  greenPale:  "#ecfdf5",
  shadow:     "0 8px 32px rgba(244,114,182,0.18)",
};

const ME   = { id:"lala1102", pw:"dotori1102@@", name:"Space Nari", email:"nari@spacenarimail.me" };
const NOW  = () => new Date().toLocaleString("ko-KR",{year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit"});

const SEED = [
  { id:1, from:"me", to:ME.email,         subject:"✨ 오늘 하루도 수고했어!",  body:"하루가 끝났어. 정말 잘 해냈어 🐰\n오늘도 반짝반짝 빛났어!", date:"2026.03.11 22:10", read:false, starred:true,  folder:"tome", attachments:[], receipt:null },
  { id:2, from:"me", to:ME.email,         subject:"🎀 내일 할 일 메모",        body:"- 우유 사기\n- 운동 30분\n- 일기 쓰기\n- 별 바라보기 🌟",      date:"2026.03.10 20:00", read:true,  starred:false, folder:"tome", attachments:[], receipt:null },
  { id:3, from:"me", to:ME.email,         subject:"💭 꿈에서 만난 우주 토끼",  body:"오늘 꿈에서 우주를 날아다니는 토끼를 만났어. 너무 귀여웠다ㅠ",   date:"2026.03.09 07:30", read:true,  starred:true,  folder:"tome", attachments:[], receipt:null },
  { id:4, from:"me", to:"star@galaxy.me", subject:"🌙 안녕, 우주 친구!",       body:"잘 지내고 있어? 요즘 날씨가 너무 예뻐서 생각났어!",               date:"2026.03.08 15:00", read:true,  starred:false, folder:"sent", attachments:[], receipt:{ confirmed:false, readAt:null } },
  { id:5, from:"me", to:"moon@cosmos.io", subject:"🪐 다음 달 약속",           body:"다음 달에 같이 별 보러 가자! 날짜 맞춰봐 🔭",                    date:"2026.03.07 11:20", read:true,  starred:false, folder:"sent", attachments:[], receipt:{ confirmed:true,  readAt:"2026.03.07 14:05" } },
];

const FOLDERS = [
  { key:"home",    label:"홈",           icon:"🏠" },
  { key:"tome",    label:"내게 쓴 메일함", icon:"💌" },
  { key:"inbox",   label:"받은 편지함",   icon:"📥" },
  { key:"starred", label:"중요 편지함",   icon:"⭐" },
  { key:"sent",    label:"보낸 편지함",   icon:"📤" },
  { key:"trash",   label:"휴지통",        icon:"🗑️" },
];

const fmtSize = b => b<1024?b+"B":b<1048576?(b/1024).toFixed(1)+"KB":(b/1048576).toFixed(1)+"MB";
const fileIcon = name => {
  const ext = name.split(".").pop().toLowerCase();
  if (["jpg","jpeg","png","gif","webp","svg"].includes(ext)) return "🖼️";
  if (ext==="pdf") return "📄";
  if (["zip","rar","7z"].includes(ext)) return "📦";
  if (["mp3","wav","ogg"].includes(ext)) return "🎵";
  if (["mp4","mov","avi"].includes(ext)) return "🎬";
  if (["doc","docx"].includes(ext)) return "📝";
  if (["xls","xlsx","csv"].includes(ext)) return "📊";
  return "📎";
};

// ── BG ─────────────────────────────────────────────────────────────────────────
const BgBlobs = () => (
  <div style={{ position:"fixed", inset:0, overflow:"hidden", zIndex:0, pointerEvents:"none" }}>
    <div style={{ position:"absolute", width:520, height:520, borderRadius:"50%", background:"radial-gradient(circle,rgba(240,171,252,0.42),transparent 70%)", top:-120, left:-120, animation:"float 7s ease-in-out infinite" }} />
    <div style={{ position:"absolute", width:440, height:440, borderRadius:"50%", background:"radial-gradient(circle,rgba(249,168,212,0.38),transparent 70%)", bottom:-90, right:-90, animation:"float 9s ease-in-out infinite reverse" }} />
    <div style={{ position:"absolute", width:320, height:320, borderRadius:"50%", background:"radial-gradient(circle,rgba(196,181,253,0.28),transparent 70%)", top:"38%", right:"18%", animation:"float 6s ease-in-out infinite" }} />
    {["✦","✧","✦","✧","✦","✧"].map((s,i)=>(
      <div key={i} style={{ position:"absolute", top:`${10+i*16}%`, left:`${4+i*18}%`, fontSize:10+i*2, color:C.pinkLight, opacity:0.55, animation:`sparkle ${2+i*0.4}s ease-in-out infinite`, animationDelay:`${i*0.35}s` }}>{s}</div>
    ))}
  </div>
);

const Glass = ({ children, style, onClick, className="" }) => (
  <div className={className} onClick={onClick} style={{ background:C.glassStrong, backdropFilter:"blur(18px)", WebkitBackdropFilter:"blur(18px)", border:`1.5px solid ${C.border}`, borderRadius:24, boxShadow:C.shadow, ...style }}>
    {children}
  </div>
);

const Btn = ({ children, onClick, variant="primary", style, disabled }) => {
  const base = { border:"none", borderRadius:99, padding:"11px 26px", fontFamily:"'Quicksand',sans-serif", fontWeight:700, fontSize:14, cursor:disabled?"not-allowed":"pointer", transition:"all 0.2s", opacity:disabled?0.55:1, display:"inline-flex", alignItems:"center", gap:6, ...style };
  const v = {
    primary: { background:`linear-gradient(135deg,${C.pink},${C.purple})`,   color:"#fff", boxShadow:"0 4px 18px rgba(244,114,182,0.35)" },
    ghost:   { background:C.glass, border:`1.5px solid ${C.border}`,          color:C.text },
    danger:  { background:"linear-gradient(135deg,#fb7185,#f43f5e)",          color:"#fff", boxShadow:"0 4px 16px rgba(251,113,133,0.35)" },
    soft:    { background:C.pinkPale, color:C.pinkDark, border:`1.5px solid ${C.pinkLight}` },
    purple:  { background:`linear-gradient(135deg,${C.purple},#818cf8)`,      color:"#fff", boxShadow:"0 4px 18px rgba(192,132,252,0.35)" },
    blue:    { background:`linear-gradient(135deg,${C.blue},#3b82f6)`,        color:"#fff", boxShadow:"0 4px 18px rgba(96,165,250,0.35)" },
    green:   { background:`linear-gradient(135deg,${C.green},#059669)`,       color:"#fff", boxShadow:"0 4px 18px rgba(52,211,153,0.35)" },
  };
  return <button onClick={onClick} disabled={disabled} style={{ ...base, ...v[variant] }}>{children}</button>;
};

const Field = ({ label, type="text", value, onChange, placeholder, icon, readOnly }) => {
  const composing = useRef(false);
  return (
    <div style={{ marginBottom:14 }}>
      {label && <label style={{ display:"block", fontSize:12, fontWeight:700, color:C.textMid, marginBottom:5, letterSpacing:"0.04em" }}>{label}</label>}
      <div style={{ position:"relative" }}>
        {icon && <span style={{ position:"absolute", left:13, top:"50%", transform:"translateY(-50%)", fontSize:16 }}>{icon}</span>}
        <input
          type={type}
          defaultValue={value}
          key={undefined}
          onChange={e=>{ if(!composing.current && onChange) onChange(e.target.value); }}
          onCompositionStart={()=>{ composing.current=true; }}
          onCompositionEnd={e=>{ composing.current=false; if(onChange) onChange(e.target.value); }}
          placeholder={placeholder}
          readOnly={readOnly}
          style={{ width:"100%", padding:icon?"11px 14px 11px 40px":"11px 14px", borderRadius:13, border:`1.5px solid ${C.border}`, background:"rgba(255,255,255,0.72)", fontFamily:"'Quicksand',sans-serif", fontSize:14, color:C.text, outline:"none", transition:"border 0.2s", opacity:readOnly?0.7:1 }}
          onFocus={e=>!readOnly&&(e.target.style.borderColor=C.pink)}
          onBlur={e=>e.target.style.borderColor=C.border}
        />
      </div>
    </div>
  );
};

const TArea = ({ label, value, onChange, placeholder, rows=8 }) => {
  const composing = useRef(false);
  return (
    <div style={{ marginBottom:14 }}>
      {label && <label style={{ display:"block", fontSize:12, fontWeight:700, color:C.textMid, marginBottom:5, letterSpacing:"0.04em" }}>{label}</label>}
      <textarea
        defaultValue={value}
        onChange={e=>{ if(!composing.current) onChange(e.target.value); }}
        onCompositionStart={()=>{ composing.current=true; }}
        onCompositionEnd={e=>{ composing.current=false; onChange(e.target.value); }}
        placeholder={placeholder}
        rows={rows}
        style={{ width:"100%", padding:"11px 14px", borderRadius:13, border:`1.5px solid ${C.border}`, background:"rgba(255,255,255,0.72)", fontFamily:"'Quicksand',sans-serif", fontSize:14, color:C.text, outline:"none", resize:"vertical", lineHeight:1.75 }}
        onFocus={e=>e.target.style.borderColor=C.pink}
        onBlur={e=>e.target.style.borderColor=C.border}
      />
    </div>
  );
};

const ErrBox = ({ msg }) => msg ? (
  <div style={{ background:"#fce7f3", border:`1px solid ${C.pinkLight}`, borderRadius:12, padding:"10px 14px", fontSize:13, color:C.pinkDark, marginBottom:14 }}>{msg}</div>
) : null;

// ── AUTH ───────────────────────────────────────────────────────────────────────
const Login = ({ onLogin, onGo }) => {
  const [id,setId]=useState(""); const [pw,setPw]=useState(""); const [err,setErr]=useState("");
  const go = () => { if(id===ME.id&&pw===ME.pw) onLogin(); else { setErr("아이디 또는 비밀번호가 맞지 않아요 🐰"); setTimeout(()=>setErr(""),3000); }};
  return (
    <div style={{ minHeight:"100vh", width:"100vw", display:"flex", alignItems:"center", justifyContent:"center", padding:20, position:"relative", zIndex:1, margin:0 }}>
      <BgBlobs />
      <Glass style={{ width:"100%", maxWidth:520, padding:"60px 52px", animation:"fadeInScale 0.5s ease", margin:"0 auto" }}>
        <div style={{ textAlign:"center", marginBottom:36 }}>
          <div className="floatSlow" style={{ fontSize:56, marginBottom:10 }}>🐰</div>
          <h1 style={{ fontFamily:"'Nunito',sans-serif", fontWeight:900, fontSize:26, color:C.text, marginBottom:4 }}>Space Nari Mail</h1>
          <p style={{ fontSize:13, color:C.textLight }}>나만의 비밀 우주 편지함 ✦</p>
        </div>
        <Field label="아이디" icon="🐾" value={id} onChange={setId} placeholder="아이디를 입력해요" />
        <Field label="비밀번호" type="password" icon="🔐" value={pw} onChange={setPw} placeholder="비밀번호를 입력해요" />
        <ErrBox msg={err} />
        <Btn onClick={go} style={{ width:"100%", padding:"14px", fontSize:15, marginBottom:16, justifyContent:"center" }}>✨ 로그인</Btn>
        <div style={{ display:"flex", justifyContent:"center", gap:16, fontSize:12, color:C.textLight }}>
          {[["findId","아이디 찾기"],["findPw","비밀번호 찾기"],["signup","회원가입"]].map(([k,l],i,a)=>(
            <span key={k} style={{ display:"flex", alignItems:"center", gap:16 }}>
              <span style={{ cursor:"pointer", textDecoration:"underline" }} onClick={()=>onGo(k)}>{l}</span>
              {i<a.length-1&&<span style={{ opacity:0.4 }}>|</span>}
            </span>
          ))}
        </div>

      </Glass>
    </div>
  );
};

const Signup = ({ onGo }) => {
  const [f,setF]=useState({id:"",pw:"",pw2:"",name:"",email:""}); const [done,setDone]=useState(false); const [err,setErr]=useState("");
  const set = k=>v=>setF(x=>({...x,[k]:v}));
  const go = () => { if(!f.id||!f.pw||!f.name||!f.email) return setErr("모든 항목을 입력해주세요 🌸"); if(f.pw!==f.pw2) return setErr("비밀번호가 일치하지 않아요 🐰"); setDone(true); };
  if (done) return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", position:"relative", zIndex:1 }}>
      <BgBlobs />
      <Glass style={{ padding:"50px 40px", maxWidth:420, width:"100%", textAlign:"center", animation:"fadeInScale 0.5s ease" }}>
        <div className="float" style={{ fontSize:60, marginBottom:14 }}>🎀</div>
        <h2 style={{ fontFamily:"'Nunito',sans-serif", fontWeight:900, fontSize:22, color:C.text, marginBottom:8 }}>가입 완료!</h2>
        <p style={{ fontSize:13, color:C.textLight, marginBottom:28 }}>우주 편지함에 오신 걸 환영해요 ✦</p>
        <Btn onClick={()=>onGo("login")} style={{ justifyContent:"center" }}>로그인하러 가기 🐰</Btn>
      </Glass>
    </div>
  );
  return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", padding:20, position:"relative", zIndex:1 }}>
      <BgBlobs />
      <Glass style={{ width:"100%", maxWidth:440, padding:"42px 40px", animation:"fadeInScale 0.5s ease" }}>
        <div style={{ textAlign:"center", marginBottom:26 }}>
          <div style={{ fontSize:42, marginBottom:6 }}>✨</div>
          <h2 style={{ fontFamily:"'Nunito',sans-serif", fontWeight:900, fontSize:22, color:C.text }}>회원가입</h2>
        </div>
        <Field label="이름 / 닉네임" icon="🐰" value={f.name} onChange={set("name")} placeholder="Space Nari" />
        <Field label="아이디"         icon="🪐" value={f.id}   onChange={set("id")}   placeholder="영문+숫자" />
        <Field label="이메일"         icon="📧" type="email" value={f.email} onChange={set("email")} placeholder="nari@spacenarimail.me" />
        <Field label="비밀번호"       icon="🔒" type="password" value={f.pw}  onChange={set("pw")}  placeholder="비밀번호" />
        <Field label="비밀번호 확인"  icon="🔑" type="password" value={f.pw2} onChange={set("pw2")} placeholder="비밀번호 다시 입력" />
        <ErrBox msg={err} />
        <Btn onClick={go} style={{ width:"100%", padding:"14px", fontSize:15, marginBottom:12, justifyContent:"center" }}>🎀 가입하기</Btn>
        <div style={{ textAlign:"center", fontSize:12, color:C.textLight, cursor:"pointer" }} onClick={()=>onGo("login")}>← 로그인으로 돌아가기</div>
      </Glass>
    </div>
  );
};

const FindAccount = ({ type, onGo }) => {
  const [email,setEmail]=useState(""); const [found,setFound]=useState(false);
  return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", padding:20, position:"relative", zIndex:1 }}>
      <BgBlobs />
      <Glass style={{ width:"100%", maxWidth:420, padding:"48px 40px", animation:"fadeInScale 0.5s ease" }}>
        <div style={{ textAlign:"center", marginBottom:28 }}>
          <div style={{ fontSize:44, marginBottom:6 }}>{type==="findId"?"🔍":"🗝️"}</div>
          <h2 style={{ fontFamily:"'Nunito',sans-serif", fontWeight:900, fontSize:22, color:C.text }}>{type==="findId"?"아이디 찾기":"비밀번호 찾기"}</h2>
        </div>
        {!found ? <>
          <Field label="가입 시 이메일" icon="📧" type="email" value={email} onChange={setEmail} placeholder="nari@spacenarimail.me" />
          <Btn onClick={()=>{ if(email===ME.email) setFound(true); }} style={{ width:"100%", padding:"14px", marginBottom:12, justifyContent:"center" }}>
            {type==="findId"?"아이디 찾기 ✦":"비밀번호 찾기 ✦"}
          </Btn>
        </> : (
          <div style={{ background:"rgba(249,168,212,0.15)", border:`1.5px solid ${C.border}`, borderRadius:16, padding:22, marginBottom:20, textAlign:"center" }}>
            {type==="findId"
              ? <><p style={{ fontSize:13, color:C.textLight, marginBottom:6 }}>회원님의 아이디는</p><p style={{ fontSize:22, fontWeight:800, color:C.text }}>🐾 {ME.id}</p></>
              : <><p style={{ fontSize:13, color:C.textLight, marginBottom:6 }}>임시 비밀번호를 발송했어요 📬</p><p style={{ fontSize:13, color:C.textMid }}>이메일을 확인해주세요 🌸</p></>}
          </div>
        )}
        <div style={{ textAlign:"center", fontSize:12, color:C.textLight, cursor:"pointer" }} onClick={()=>onGo("login")}>← 로그인으로 돌아가기</div>
      </Glass>
    </div>
  );
};

// ── MAIN APP ───────────────────────────────────────────────────────────────────
const MailApp = ({ onLogout }) => {
  const [mails,  setMails]    = useState(SEED);
  const [folder, setFolder]   = useState("home");
  const [view,   setView]     = useState("home");
  const [selected,setSelected]= useState(null);
  // composeMode: "self" | "other"
  const [compose, setCompose] = useState({ mode:"self", to:"", subject:"", body:"", attachments:[] });
  const [search,  setSearch]  = useState("");
  const [sideOpen,setSideOpen]= useState(true);
  const [toast,   setToast]   = useState("");
  const nextId  = useRef(SEED.length+1);
  const fileRef = useRef();

  // ── Browser back/forward history ──────────────────────────────────────────
  const pushHistory = (newView, newFolder) => {
    window.history.pushState({ view: newView, folder: newFolder }, "");
  };

  useEffect(() => {
    // Set initial history state
    window.history.replaceState({ view: "home", folder: "home" }, "");

    const handlePop = (e) => {
      if (e.state) {
        setView(e.state.view);
        setFolder(e.state.folder);
        setSelected(null);
      }
    };
    window.addEventListener("popstate", handlePop);
    return () => window.removeEventListener("popstate", handlePop);
  }, []);

  const showToast = msg => { setToast(msg); setTimeout(()=>setToast(""),2800); };

  const unreadTome  = mails.filter(m=>m.folder==="tome"&&!m.read).length;
  const unreadInbox = mails.filter(m=>m.folder==="inbox"&&!m.read).length;
  const unconfirmed = mails.filter(m=>m.folder==="sent"&&m.receipt&&!m.receipt.confirmed).length;

  const getFiltered = () => {
    let base = mails;
    if      (folder==="starred") base = base.filter(m=>m.starred&&m.folder!=="trash");
    else if (folder==="trash")   base = base.filter(m=>m.folder==="trash");
    else if (folder==="home")    base = base.filter(m=>m.folder!=="trash");
    else                         base = base.filter(m=>m.folder===folder);
    if (search) base = base.filter(m=>m.subject.toLowerCase().includes(search.toLowerCase())||m.body.toLowerCase().includes(search.toLowerCase()));
    return base;
  };

  const sendMail = () => {
    if (!compose.subject||!compose.body) return;
    const isSelf = compose.mode==="self";
    const to     = isSelf ? ME.email : compose.to;
    if (!isSelf && !to) return showToast("받는 사람 이메일을 입력해주세요 📬");
    const nm = {
      id: nextId.current++,
      from: "me", to,
      subject: compose.subject,
      body: compose.body,
      date: NOW(),
      read: false, starred: false,
      folder: isSelf ? "tome" : "sent",
      attachments: compose.attachments,
      receipt: isSelf ? null : { confirmed:false, readAt:null },
    };
    const destFolder = isSelf?"tome":"sent";
    setMails(ms=>[nm,...ms]);
    setCompose({ mode:"self", to:"", subject:"", body:"", attachments:[] });
    setFolder(destFolder);
    setView("list");
    pushHistory("list", destFolder);
    showToast(isSelf?"💌 내게 편지를 보냈어요!":"📤 편지를 보냈어요!");
  };

  // 수신확인 simulate: 50% chance read, always marks confirmed
  const checkReceipt = (id, e) => {
    e.stopPropagation();
    const isRead = Math.random() > 0.3;
    const readAt = isRead ? NOW() : null;
    setMails(ms=>ms.map(m=>m.id===id ? { ...m, receipt:{ confirmed:true, readAt } } : m));
    showToast(isRead ? "✅ 상대방이 편지를 읽었어요!" : "📨 아직 읽지 않은 것 같아요");
  };

  const toggleStar = (id,e) => { e&&e.stopPropagation(); setMails(ms=>ms.map(m=>m.id===id?{...m,starred:!m.starred}:m)); };
  const deleteMail = id => { setMails(ms=>ms.map(m=>m.id===id?{...m,folder:m.folder==="trash"?"tome":"trash"}:m)); showToast("🗑️ 이동됐어요"); };
  const readMail   = m => {
    setMails(ms=>ms.map(x=>x.id===m.id?{...x,read:true}:x));
    setSelected({...m,read:true});
    setView("read");
    pushHistory("read", folder);
  };
  const navTo      = key => {
    const newView = key==="home" ? "home" : "list";
    setFolder(key); setView(newView); setSearch("");
    pushHistory(newView, key);
  };
  const goCompose  = (preset={}) => {
    setCompose({ mode:"self", to:"", subject:"", body:"", attachments:[], ...preset });
    setView("compose");
    pushHistory("compose", folder);
  };
  const addFiles   = e => { const files=Array.from(e.target.files).map(f=>({name:f.name,size:f.size,type:f.type})); setCompose(c=>({...c,attachments:[...c.attachments,...files]})); e.target.value=""; };

  // ── RECEIPT BADGE ───────────────────────────────────────────────────────────
  const ReceiptBadge = ({ m, onClick }) => {
    if (!m.receipt) return null;
    if (!m.receipt.confirmed) return (
      <button className="receipt-btn" onClick={onClick}
        style={{ display:"inline-flex", alignItems:"center", gap:5, background:"rgba(96,165,250,0.12)", border:`1.5px solid rgba(96,165,250,0.35)`, borderRadius:99, padding:"4px 12px", fontSize:11, fontWeight:700, color:"#2563eb", cursor:"pointer" }}>
        <span>📨</span> 수신확인
      </button>
    );
    if (m.receipt.readAt) return (
      <div style={{ display:"inline-flex", alignItems:"center", gap:5, background:C.greenPale, border:`1.5px solid rgba(52,211,153,0.4)`, borderRadius:99, padding:"4px 12px", fontSize:11, fontWeight:700, color:"#059669" }}>
        <span style={{ animation:"checkPop 0.4s ease" }}>✅</span> 읽음 · {m.receipt.readAt}
      </div>
    );
    return (
      <div style={{ display:"inline-flex", alignItems:"center", gap:5, background:"rgba(249,168,212,0.12)", border:`1.5px solid ${C.border}`, borderRadius:99, padding:"4px 12px", fontSize:11, fontWeight:700, color:C.textMid }}>
        <span>📭</span> 아직 안 읽음
      </div>
    );
  };

  // ── HOME ────────────────────────────────────────────────────────────────────
  const HomeView = () => {
    const recent = mails.filter(m=>m.folder!=="trash").slice(0,5);
    const stats = [
      { label:"내게 쓴 편지", val:mails.filter(m=>m.folder==="tome").length,                   icon:"💌", col:C.pink,   nav:"tome"    },
      { label:"받은 편지",    val:mails.filter(m=>m.folder==="inbox").length,                  icon:"📥", col:C.purple, nav:"inbox"   },
      { label:"보낸 편지",    val:mails.filter(m=>m.folder==="sent").length,                   icon:"📤", col:C.blue,   nav:"sent"    },
      { label:"중요 편지",    val:mails.filter(m=>m.starred&&m.folder!=="trash").length,        icon:"⭐", col:"#fbbf24",nav:"starred" },
    ];
    const hour  = new Date().getHours();
    const greet = hour<6?"🌙 새벽에도 반짝이고 있네요":hour<12?"🌅 좋은 아침이에요!":hour<18?"☀️ 오늘 하루도 화이팅!":"🌙 오늘 하루도 수고했어요";
    return (
      <div className="fadeIn">
        <div style={{ background:`linear-gradient(135deg,rgba(244,114,182,0.2),rgba(192,132,252,0.2))`, border:`1.5px solid ${C.border}`, borderRadius:28, padding:"38px 40px", marginBottom:22, backdropFilter:"blur(16px)", position:"relative", overflow:"hidden" }}>
          <div style={{ position:"absolute", right:40, top:10, fontSize:100, opacity:0.15, animation:"float 5s ease-in-out infinite", pointerEvents:"none" }}>🐰</div>
          <p style={{ fontSize:12, color:C.textLight, marginBottom:6, fontWeight:600 }}>✦ {new Date().toLocaleDateString("ko-KR",{year:"numeric",month:"long",day:"numeric",weekday:"long"})}</p>
          <h2 style={{ fontFamily:"'Nunito',sans-serif", fontWeight:900, fontSize:28, color:C.text, marginBottom:6 }}>안녕, {ME.name}! 🌸</h2>
          <p style={{ fontSize:14, color:C.textMid, marginBottom:18 }}>{greet}</p>
          <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:18 }}>
            {(unreadInbox+unreadTome)>0&&<div style={{ display:"inline-flex", alignItems:"center", gap:6, background:`linear-gradient(135deg,${C.pink},${C.purple})`, borderRadius:99, padding:"7px 16px", color:"#fff", fontSize:12, fontWeight:700, boxShadow:"0 4px 16px rgba(244,114,182,0.35)" }}>💌 읽지 않은 편지 {unreadInbox+unreadTome}통</div>}
            {unconfirmed>0&&<div style={{ display:"inline-flex", alignItems:"center", gap:6, background:`linear-gradient(135deg,${C.blue},#3b82f6)`, borderRadius:99, padding:"7px 16px", color:"#fff", fontSize:12, fontWeight:700, boxShadow:"0 4px 16px rgba(96,165,250,0.3)" }}>📨 수신확인 대기 {unconfirmed}통</div>}
          </div>
          <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
            <Btn onClick={()=>goCompose({mode:"other"})}>✏️ 편지 쓰기</Btn>
            <Btn variant="purple" onClick={()=>goCompose({mode:"self"})}>💌 내게 편지 쓰기</Btn>
            <Btn variant="ghost"  onClick={()=>navTo("tome")}>내게 쓴 메일함 →</Btn>
          </div>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14, marginBottom:22 }}>
          {stats.map(s=>(
            <Glass key={s.label} className="card-hover" style={{ padding:"22px 18px", textAlign:"center" }} onClick={()=>navTo(s.nav)}>
              <div style={{ fontSize:34, marginBottom:8 }}>{s.icon}</div>
              <div style={{ fontFamily:"'Nunito',sans-serif", fontWeight:900, fontSize:30, color:s.col, marginBottom:4 }}>{s.val}</div>
              <div style={{ fontSize:12, color:C.textLight, fontWeight:600 }}>{s.label}</div>
            </Glass>
          ))}
        </div>
        <Glass style={{ padding:"26px 28px" }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:18 }}>
            <h3 style={{ fontFamily:"'Nunito',sans-serif", fontWeight:800, fontSize:17, color:C.text }}>📬 최근 편지</h3>
            <span style={{ fontSize:12, color:C.textLight, cursor:"pointer", textDecoration:"underline" }} onClick={()=>navTo("tome")}>더보기 →</span>
          </div>
          {recent.length===0 ? <div style={{ textAlign:"center", padding:"28px 0", color:C.textLight, fontSize:13 }}><div className="float" style={{ fontSize:40, marginBottom:10 }}>📭</div>아직 편지가 없어요</div>
          : recent.map((m,i)=>(
            <div key={m.id} className="mailRow" onClick={()=>readMail(m)}
              style={{ display:"flex", alignItems:"center", gap:12, padding:"11px 12px", borderRadius:13, cursor:"pointer", background:!m.read?"rgba(249,168,212,0.09)":"transparent", marginBottom:i<recent.length-1?3:0, transition:"background 0.2s" }}>
              <div style={{ width:7, height:7, borderRadius:"50%", background:!m.read?C.pink:"transparent", flexShrink:0, boxShadow:!m.read?`0 0 6px ${C.pink}`:"none" }} />
              <span style={{ fontSize:15, flexShrink:0 }}>{FOLDERS.find(f=>f.key===m.folder)?.icon||"📧"}</span>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:2 }}>
                  <span style={{ fontWeight:m.read?500:700, fontSize:13, color:C.text, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{m.subject}</span>
                  {m.attachments?.length>0&&<span style={{ fontSize:11 }}>📎</span>}
                </div>
                <p style={{ fontSize:11, color:C.textLight, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{m.body.slice(0,60)}...</p>
              </div>
              <span style={{ fontSize:10, color:C.textLight, flexShrink:0 }}>{m.date}</span>
            </div>
          ))}
        </Glass>
      </div>
    );
  };

  // ── COMPOSE ─────────────────────────────────────────────────────────────────
  const ComposeView = () => {
    const isSelf  = compose.mode === "self";
    const isOther = compose.mode === "other";

    // Dynamic accent colors per mode
    const accent = isSelf
      ? { from:C.pink,  to:C.purple, pale:"rgba(244,114,182,0.08)", label:"내게 쓰기",      icon:"💌", desc:`내 편지함(${ME.email})에 저장돼요`, borderCol:"rgba(244,114,182,0.5)" }
      : { from:C.blue,  to:"#6366f1", pale:"rgba(96,165,250,0.07)",  label:"다른 사람에게", icon:"📤", desc:compose.to?`${compose.to} 에게 보내요`:"받는 사람 이메일을 입력해주세요", borderCol:"rgba(96,165,250,0.4)" };

    return (
      <div style={{ animation:"fadeIn 0.4s ease" }}>
        {/* ── Mode Switcher ── */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:20 }}>
          {[
            { mode:"self",  icon:"💌", title:"내게 쓰기",      sub:"나만 볼 수 있는 나의 편지",     grad:`linear-gradient(135deg,${C.pink},${C.purple})`, shadow:"rgba(244,114,182,0.4)" },
            { mode:"other", icon:"📤", title:"다른 사람에게",   sub:"상대방에게 편지를 전달해요",      grad:`linear-gradient(135deg,${C.blue},#6366f1)`,    shadow:"rgba(96,165,250,0.35)" },
          ].map(opt=>{
            const active = compose.mode===opt.mode;
            return (
              <div key={opt.mode} onClick={()=>setCompose(c=>({...c,mode:opt.mode,to:opt.mode==="self"?ME.email:""}))}
                style={{
                  borderRadius:20, padding:"20px 22px", cursor:"pointer",
                  background: active ? opt.grad : "rgba(255,255,255,0.6)",
                  border: active ? "2px solid transparent" : `2px solid ${C.border}`,
                  boxShadow: active ? `0 6px 24px ${opt.shadow}` : C.shadow,
                  transition:"all 0.25s",
                  backdropFilter:"blur(12px)",
                  position:"relative", overflow:"hidden",
                }}>
                {active && <div style={{ position:"absolute", top:-20, right:-20, fontSize:60, opacity:0.15 }}>{opt.icon}</div>}
                <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:6 }}>
                  <div style={{ fontSize:28, filter: active?"drop-shadow(0 2px 6px rgba(0,0,0,0.2))":"none" }}>{opt.icon}</div>
                  <span style={{ fontFamily:"'Nunito',sans-serif", fontWeight:900, fontSize:16, color: active?"#fff":C.text }}>{opt.title}</span>
                  {active&&<span style={{ marginLeft:"auto", background:"rgba(255,255,255,0.3)", borderRadius:99, padding:"3px 10px", fontSize:11, color:"#fff", fontWeight:700 }}>선택됨 ✓</span>}
                </div>
                <p style={{ fontSize:12, color: active?"rgba(255,255,255,0.85)":C.textLight, lineHeight:1.5 }}>{opt.sub}</p>
              </div>
            );
          })}
        </div>

        {/* ── Form ── */}
        <Glass style={{ padding:32, border:`2px solid ${accent.borderCol}`, transition:"border 0.3s" }}>
          {/* Mode banner */}
          <div className="modeSlide" key={compose.mode} style={{ display:"flex", alignItems:"center", gap:10, padding:"12px 16px", borderRadius:14, marginBottom:22, background:`linear-gradient(135deg,${accent.from}22,${accent.to}22)`, border:`1px solid ${accent.borderCol}` }}>
            <span style={{ fontSize:20 }}>{accent.icon}</span>
            <div>
              <span style={{ fontWeight:700, fontSize:13, color:C.text }}>{accent.label} 모드</span>
              <span style={{ fontSize:12, color:C.textMid, marginLeft:8 }}>{accent.desc}</span>
            </div>
          </div>

          {/* To field — only shown for "other" mode */}
          {isOther && (
            <div className="modeSlide">
              <Field label="받는 사람" icon="📬" value={compose.to} onChange={v=>setCompose(c=>({...c,to:v}))} placeholder="상대방 이메일 주소를 입력해요" />
            </div>
          )}

          {isSelf && (
            <div style={{ marginBottom:14, padding:"10px 14px", background:"rgba(244,114,182,0.08)", borderRadius:12, fontSize:12, color:C.textMid, display:"flex", alignItems:"center", gap:8 }}>
              <span>🐰</span> 받는 사람: <strong>{ME.email}</strong> (나)
            </div>
          )}

          <Field label="제목" icon="✦" value={compose.subject} onChange={v=>setCompose(c=>({...c,subject:v}))} placeholder="편지 제목을 써줘요 🌸" />
          <TArea label="내용" value={compose.body} onChange={v=>setCompose(c=>({...c,body:v}))} placeholder={isSelf?"오늘의 기분, 메모, 다짐... 뭐든 적어봐요 ✨":"소중한 마음을 담아 써봐요... ✨"} rows={9} />

          {/* Attachments */}
          <div style={{ marginBottom:20 }}>
            <label style={{ display:"block", fontSize:12, fontWeight:700, color:C.textMid, marginBottom:8 }}>📎 파일 첨부</label>
            <input ref={fileRef} type="file" multiple onChange={addFiles} style={{ display:"none" }} />
            <div style={{ border:`2px dashed ${C.border}`, borderRadius:14, padding:"14px 18px", cursor:"pointer", background:"rgba(255,255,255,0.4)", transition:"border 0.2s", textAlign:"center" }}
              onClick={()=>fileRef.current.click()}
              onMouseEnter={e=>e.currentTarget.style.borderColor=C.pink}
              onMouseLeave={e=>e.currentTarget.style.borderColor=C.border}>
              <div style={{ fontSize:24, marginBottom:4 }}>📎</div>
              <p style={{ fontSize:12, color:C.textMid, fontWeight:600 }}>클릭해서 파일 추가</p>
              <p style={{ fontSize:11, color:C.textLight }}>모든 형식 · 여러 파일 가능</p>
            </div>
            {compose.attachments.length>0&&(
              <div style={{ marginTop:10, display:"flex", flexWrap:"wrap", gap:8 }}>
                {compose.attachments.map((f,i)=>(
                  <div key={i} style={{ display:"flex", alignItems:"center", gap:7, background:"rgba(249,168,212,0.15)", border:`1px solid ${C.border}`, borderRadius:10, padding:"6px 12px", fontSize:12, color:C.text }}>
                    <span style={{ fontSize:15 }}>{fileIcon(f.name)}</span>
                    <span style={{ maxWidth:120, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", fontWeight:600 }}>{f.name}</span>
                    <span style={{ color:C.textLight, fontSize:10 }}>{fmtSize(f.size)}</span>
                    <button onClick={()=>setCompose(c=>({...c,attachments:c.attachments.filter((_,idx)=>idx!==i)}))} style={{ background:"none", border:"none", cursor:"pointer", color:C.pinkDark, fontSize:15, padding:0 }}>×</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ display:"flex", gap:12 }}>
            <Btn onClick={sendMail} disabled={!compose.subject||!compose.body} variant={isSelf?"primary":"blue"}>
              {isSelf?"💌 내게 보내기":"📤 보내기"}
            </Btn>
            <Btn variant="ghost" onClick={()=>window.history.back()}>취소</Btn>
          </div>
        </Glass>
      </div>
    );
  };

  // ── READ ─────────────────────────────────────────────────────────────────────
  const ReadView = () => {
    if (!selected) return null;
    const m = mails.find(x=>x.id===selected.id)||selected;
    return (
      <Glass style={{ padding:36, animation:"fadeIn 0.4s ease" }}>
        <Btn variant="ghost" onClick={()=>window.history.back()} style={{ marginBottom:20, fontSize:12, padding:"8px 16px" }}>← 목록으로</Btn>
        <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:12, marginBottom:8 }}>
          <h2 style={{ fontFamily:"'Nunito',sans-serif", fontWeight:900, fontSize:22, color:C.text, flex:1 }}>{m.subject}</h2>
          <div style={{ display:"flex", gap:8, flexShrink:0 }}>
            <button onClick={e=>toggleStar(m.id,e)} style={{ background:"none", border:"none", cursor:"pointer", fontSize:22 }}>{m.starred?"⭐":"☆"}</button>
            <Btn variant="danger" onClick={()=>{ deleteMail(m.id); window.history.back(); }} style={{ padding:"8px 16px", fontSize:12 }}>🗑️ 삭제</Btn>
          </div>
        </div>
        <div style={{ display:"flex", flexWrap:"wrap", gap:12, fontSize:12, color:C.textLight, marginBottom:m.receipt?16:22, alignItems:"center" }}>
          <span>📅 {m.date}</span>
          <span>📬 {m.to}</span>
          {m.attachments?.length>0&&<span>📎 첨부 {m.attachments.length}개</span>}
        </div>
        {m.receipt&&(
          <div style={{ marginBottom:20 }}>
            <ReceiptBadge m={m} onClick={e=>checkReceipt(m.id,e)} />
          </div>
        )}
        <div style={{ borderTop:`1px solid ${C.border}`, paddingTop:22, marginBottom:24 }}>
          <p style={{ fontSize:15, color:C.text, lineHeight:1.9, whiteSpace:"pre-wrap" }}>{m.body}</p>
        </div>
        {m.attachments?.length>0&&(
          <div style={{ marginBottom:24, padding:"16px 18px", background:"rgba(249,168,212,0.08)", borderRadius:14 }}>
            <p style={{ fontSize:12, fontWeight:700, color:C.textMid, marginBottom:12 }}>📎 첨부 파일 ({m.attachments.length}개)</p>
            <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
              {m.attachments.map((f,i)=>(
                <div key={i} style={{ display:"flex", alignItems:"center", gap:10, background:"rgba(255,255,255,0.7)", border:`1px solid ${C.border}`, borderRadius:12, padding:"10px 16px" }}>
                  <span style={{ fontSize:24 }}>{fileIcon(f.name)}</span>
                  <div>
                    <div style={{ fontSize:13, fontWeight:700, color:C.text, maxWidth:160, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{f.name}</div>
                    <div style={{ fontSize:11, color:C.textLight }}>{fmtSize(f.size)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        <div style={{ display:"flex", gap:12 }}>
          <Btn onClick={()=>goCompose({mode:"self", subject:`Re: ${m.subject}`})}>↩️ 답장</Btn>
          <Btn variant="ghost" onClick={()=>goCompose({mode:m.folder==="sent"?"other":"self", to:m.to, subject:`Fwd: ${m.subject}`, body:m.body, attachments:m.attachments||[]})}>↗️ 전달</Btn>
        </div>
      </Glass>
    );
  };

  // ── LIST ─────────────────────────────────────────────────────────────────────
  const ListView = () => {
    const items = getFiltered();
    const finfo = FOLDERS.find(f=>f.key===folder);
    const isSentFolder = folder==="sent";
    const unconfirmedInList = items.filter(m=>m.receipt&&!m.receipt.confirmed).length;

    return (
      <div className="fadeIn">
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <span style={{ fontSize:24 }}>{finfo?.icon}</span>
            <h2 style={{ fontFamily:"'Nunito',sans-serif", fontWeight:900, fontSize:20, color:C.text }}>{finfo?.label}</h2>
            <span style={{ fontSize:12, color:C.textLight }}>{items.length}통</span>
            {isSentFolder&&unconfirmedInList>0&&(
              <span style={{ background:`linear-gradient(135deg,${C.blue},#3b82f6)`, color:"#fff", borderRadius:99, fontSize:11, fontWeight:700, padding:"3px 10px" }}>
                📨 미확인 {unconfirmedInList}
              </span>
            )}
          </div>
          {folder==="tome"&&<Btn variant="purple" onClick={()=>goCompose({mode:"self"})} style={{ fontSize:13, padding:"9px 18px" }}>💌 내게 편지 쓰기</Btn>}
        </div>

        {/* Sent folder: summary bar */}
        {isSentFolder&&items.length>0&&(
          <div style={{ display:"flex", gap:10, marginBottom:14, padding:"12px 18px", background:C.glassStrong, borderRadius:16, border:`1px solid ${C.border}`, backdropFilter:"blur(10px)", flexWrap:"wrap", alignItems:"center" }}>
            <span style={{ fontSize:12, fontWeight:700, color:C.textMid }}>📊 수신 현황</span>
            <span style={{ fontSize:12, color:"#059669", fontWeight:600 }}>✅ 읽음 {items.filter(m=>m.receipt?.readAt).length}</span>
            <span style={{ fontSize:12, color:C.textMid, fontWeight:600 }}>📭 안읽음 {items.filter(m=>m.receipt&&!m.receipt.readAt&&m.receipt.confirmed).length}</span>
            <span style={{ fontSize:12, color:"#2563eb", fontWeight:600 }}>📨 미확인 {items.filter(m=>m.receipt&&!m.receipt.confirmed).length}</span>
          </div>
        )}

        <Glass style={{ overflow:"hidden" }}>
          {items.length===0 ? (
            <div style={{ padding:64, textAlign:"center" }}>
              <div className="float" style={{ fontSize:52, marginBottom:12 }}>📭</div>
              <p style={{ color:C.textLight, fontSize:14 }}>아직 편지가 없어요</p>
            </div>
          ) : items.map((m,i)=>(
            <div key={m.id} className="mailRow" onClick={()=>readMail(m)}
              style={{ display:"flex", alignItems:"center", gap:14, padding:"15px 20px", borderBottom:i<items.length-1?`1px solid ${C.border}`:"none", cursor:"pointer", background:!m.read?"rgba(249,168,212,0.08)":"transparent", transition:"background 0.2s" }}>
              <div style={{ width:8, height:8, borderRadius:"50%", background:!m.read?C.pink:"transparent", flexShrink:0, boxShadow:!m.read?`0 0 7px ${C.pink}`:"none" }} />
              <button onClick={e=>toggleStar(m.id,e)} style={{ background:"none", border:"none", cursor:"pointer", fontSize:16, flexShrink:0 }}>{m.starred?"⭐":"☆"}</button>

              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:4 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8, overflow:"hidden", minWidth:0 }}>
                    <span style={{ fontWeight:m.read?500:700, fontSize:14, color:C.text, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{m.subject}</span>
                    {m.attachments?.length>0&&<span style={{ fontSize:12, flexShrink:0 }}>📎</span>}
                  </div>
                  <span style={{ fontSize:11, color:C.textLight, flexShrink:0, marginLeft:12 }}>{m.date}</span>
                </div>

                <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                  <p style={{ fontSize:12, color:C.textLight, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", flex:1 }}>
                    {isSentFolder ? `→ ${m.to}` : m.body.slice(0,60)+"..."}
                  </p>
                  {/* Receipt badge inline in sent list */}
                  {m.receipt&&(
                    <div onClick={e=>e.stopPropagation()}>
                      {!m.receipt.confirmed ? (
                        <button className="receipt-btn" onClick={e=>checkReceipt(m.id,e)}
                          style={{ display:"inline-flex", alignItems:"center", gap:4, background:"rgba(96,165,250,0.13)", border:`1.5px solid rgba(96,165,250,0.4)`, borderRadius:99, padding:"3px 10px", fontSize:11, fontWeight:700, color:"#2563eb", cursor:"pointer", whiteSpace:"nowrap" }}>
                          📨 수신확인
                        </button>
                      ) : m.receipt.readAt ? (
                        <span style={{ display:"inline-flex", alignItems:"center", gap:4, background:C.greenPale, border:`1.5px solid rgba(52,211,153,0.4)`, borderRadius:99, padding:"3px 10px", fontSize:11, fontWeight:700, color:"#059669", whiteSpace:"nowrap" }}>
                          ✅ 읽음
                        </span>
                      ) : (
                        <span style={{ display:"inline-flex", alignItems:"center", gap:4, background:"rgba(249,168,212,0.1)", border:`1.5px solid ${C.border}`, borderRadius:99, padding:"3px 10px", fontSize:11, fontWeight:700, color:C.textMid, whiteSpace:"nowrap" }}>
                          📭 안읽음
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <button onClick={e=>{ e.stopPropagation(); deleteMail(m.id); }} style={{ background:"none", border:"none", cursor:"pointer", fontSize:14, opacity:0.4, flexShrink:0 }}>🗑️</button>
            </div>
          ))}
        </Glass>
      </div>
    );
  };

  // ── SHELL ────────────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight:"100vh", width:"100%", display:"flex", flexDirection:"column", position:"relative", zIndex:1 }}>
      <BgBlobs />

      {toast&&(
        <div style={{ position:"fixed", bottom:28, left:"50%", transform:"translateX(-50%)", background:`linear-gradient(135deg,${C.pink},${C.purple})`, color:"#fff", borderRadius:99, padding:"12px 28px", fontWeight:700, fontSize:14, zIndex:999, animation:"fadeInScale 0.3s ease", boxShadow:"0 6px 24px rgba(244,114,182,0.4)", whiteSpace:"nowrap" }}>
          {toast}
        </div>
      )}

      <header style={{ background:"rgba(255,255,255,0.68)", backdropFilter:"blur(20px)", WebkitBackdropFilter:"blur(20px)", borderBottom:`1px solid ${C.border}`, padding:"0 32px", height:64, display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, zIndex:100, width:"100%" }}>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <button onClick={()=>setSideOpen(o=>!o)} style={{ background:"none", border:"none", cursor:"pointer", fontSize:20, padding:4, color:C.text }}>☰</button>
          <div style={{ display:"flex", alignItems:"center", gap:8, cursor:"pointer" }} onClick={()=>navTo("home")}>
            <div className="float" style={{ fontSize:26 }}>🐰</div>
            <span style={{ fontFamily:"'Nunito',sans-serif", fontWeight:900, fontSize:18, color:C.text }}>Space Nari Mail</span>
          </div>
          {view!=="home"&&(
            <div style={{ display:"flex", alignItems:"center", gap:6, fontSize:12, color:C.textLight }}>
              <span style={{ cursor:"pointer" }} onClick={()=>navTo("home")}>홈</span>
              <span>›</span>
              {view==="compose"&&<span style={{ color:C.textMid }}>편지 쓰기</span>}
              {view==="list"  &&<span style={{ color:C.textMid }}>{FOLDERS.find(f=>f.key===folder)?.label}</span>}
              {view==="read"  &&<><span style={{ cursor:"pointer" }} onClick={()=>setView("list")}>{FOLDERS.find(f=>f.key===folder)?.label}</span><span>›</span><span style={{ color:C.textMid }}>읽기</span></>}
            </div>
          )}
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="🔍 편지 검색..."
            style={{ padding:"8px 16px", borderRadius:99, border:`1.5px solid ${C.border}`, background:"rgba(255,255,255,0.72)", fontFamily:"'Quicksand',sans-serif", fontSize:13, color:C.text, outline:"none", width:200 }}
            onFocus={e=>e.target.style.borderColor=C.pink} onBlur={e=>e.target.style.borderColor=C.border} />
          <Btn variant="soft"  onClick={()=>navTo("home")}  style={{ padding:"8px 16px", fontSize:12 }}>🏠 홈</Btn>
          <div style={{ fontSize:13, color:C.textMid, fontWeight:700 }}>{ME.name} 🌸</div>
          <Btn variant="ghost" onClick={onLogout} style={{ padding:"8px 16px", fontSize:12 }}>로그아웃</Btn>
        </div>
      </header>

      <div style={{ display:"flex", flex:1, padding:"24px", gap:16, width:"100%" }}>
        {sideOpen&&(
          <aside style={{ width:236, flexShrink:0, animation:"slideIn 0.3s ease" }}>
            <Btn onClick={()=>goCompose({mode:"other"})} style={{ width:"100%", padding:"13px", fontSize:14, marginBottom:10, justifyContent:"center" }}>✏️ 편지 쓰기</Btn>
            <Btn variant="purple" onClick={()=>goCompose({mode:"self"})} style={{ width:"100%", padding:"12px", fontSize:13, marginBottom:16, justifyContent:"center" }}>💌 내게 편지 쓰기</Btn>
            <Glass style={{ padding:"10px 8px", marginBottom:14 }}>
              {FOLDERS.map(f=>{
                const cnt     = f.key==="inbox"?unreadInbox:f.key==="tome"?unreadTome:f.key==="sent"?unconfirmed:0;
                const active  = folder===f.key&&(view==="list"||view==="home");
                const isSentF = f.key==="sent";
                return (
                  <div key={f.key} className="sideItem" onClick={()=>navTo(f.key)}
                    style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 13px", borderRadius:13, cursor:"pointer", background:active?"rgba(244,114,182,0.18)":"transparent", marginBottom:2, transition:"background 0.2s" }}>
                    <span style={{ fontSize:17 }}>{f.icon}</span>
                    <span style={{ fontSize:13, fontWeight:active?700:500, color:active?C.pinkDark:C.text, flex:1 }}>{f.label}</span>
                    {cnt>0&&<span style={{ background: isSentF?`linear-gradient(135deg,${C.blue},#3b82f6)`:`linear-gradient(135deg,${C.pink},${C.purple})`, color:"#fff", borderRadius:99, fontSize:10, fontWeight:700, padding:"2px 7px" }}>{cnt}</span>}
                  </div>
                );
              })}
            </Glass>
            <Glass style={{ padding:18, textAlign:"center" }}>
              <div className="float" style={{ fontSize:28, marginBottom:8 }}>🌙</div>
              <p style={{ fontSize:11, color:C.textLight, lineHeight:1.7 }}>오늘도 반짝이는<br/>하루 보내요 ✦</p>
              <div style={{ marginTop:10, padding:"8px", background:"rgba(249,168,212,0.12)", borderRadius:10 }}>
                <p style={{ fontSize:11, fontWeight:700, color:C.textMid }}>{ME.name}</p>
                <p style={{ fontSize:10, color:C.textLight }}>{ME.email}</p>
              </div>
            </Glass>
          </aside>
        )}

        <main style={{ flex:1, minWidth:0 }}>
          {view==="home"    &&<HomeView />}
          {view==="compose" &&<ComposeView />}
          {view==="read"    &&<ReadView />}
          {view==="list"    &&<ListView />}
        </main>
      </div>
    </div>
  );
};

// ── ROOT ───────────────────────────────────────────────────────────────────────
export default function App() {
  const [page,setPage]         = useState("login");
  const [loggedIn,setLoggedIn] = useState(false);
  if (loggedIn) return <MailApp onLogout={()=>{ setLoggedIn(false); setPage("login"); }} />;
  if (page==="signup") return <Signup onGo={setPage} />;
  if (page==="findId") return <FindAccount type="findId" onGo={setPage} />;
  if (page==="findPw") return <FindAccount type="findPw" onGo={setPage} />;
  return (
    <div style={{ minHeight:"100vh", width:"100vw", display:"flex", alignItems:"center", justifyContent:"center", background:"linear-gradient(135deg,#fce4f0 0%,#ede9fe 50%,#fce4f0 100%)" }}>
      <Login onLogin={()=>setLoggedIn(true)} onGo={setPage} />
    </div>
  );
}
