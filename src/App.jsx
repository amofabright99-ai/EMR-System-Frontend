import React from 'react';
import { BrowserRouter, Routes, Route, useNavigate, Link, useLocation } from 'react-router-dom';

const BASE_URL = 'https://emr-backend-production-5ebf.up.railway.app';

const clearSessionAndRedirect=(message='Your session expired. Please sign in again.')=>{
  if(window.__emrSessionRedirecting)return;
  window.__emrSessionRedirecting=true;
  const role=localStorage.getItem('role');
  sessionStorage.setItem('emr_session_notice',message);
  ['token','user','role','display_name'].forEach(key=>localStorage.removeItem(key));
  window.location.replace(role==='patient'?'/patient-login':'/login');
};

const tokenHasExpired=token=>{
  try{
    const encoded=token.split('.')[1].replace(/-/g,'+').replace(/_/g,'/');
    const padded=encoded.padEnd(Math.ceil(encoded.length/4)*4,'=');
    const payload=JSON.parse(atob(padded));
    return !payload.exp||(payload.exp*1000)<=Date.now();
  }catch{
    return true;
  }
};

const tk = () => {
  const token=localStorage.getItem('token');
  if(token&&tokenHasExpired(token)){
    clearSessionAndRedirect();
    return null;
  }
  return token;
};
const ah = () => ({ 'Content-Type': 'application/json', Authorization: `Bearer ${tk()}` });

const useSessionNotice=()=>{
  const [notice]=React.useState(()=>{
    const value=sessionStorage.getItem('emr_session_notice')||'';
    sessionStorage.removeItem('emr_session_notice');
    return value;
  });
  return notice;
};
const calcAge = dob => dob ? Math.floor((Date.now() - new Date(dob)) / (365.25*24*60*60*1000)) : '—';
const fmtDate = d => {
  if(!d) return '—';
  const date = new Date(d);
  if(isNaN(date.getTime())) return d;
  return date.toLocaleDateString('en-GB');
};
const fmtTime = d => d ? new Date(d).toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'}) : '—';
const fmtDT   = d => d ? new Date(d).toLocaleString('en-GB') : '—';
const fmtArrival = d => {
  if(!d) return '—';
  const date=new Date(d);
  if(isNaN(date.getTime())) return d;
  const includesTime=typeof d==='string'&&(/[T ]\d{2}:\d{2}/.test(d));
  return includesTime?`${fmtDate(d)} · ${fmtTime(d)}`:fmtDate(d);
};

const useDebouncedValue=(value,delay=350)=>{
  const [debounced,setDebounced]=React.useState(value);
  React.useEffect(()=>{
    const timer=setTimeout(()=>setDebounced(value),delay);
    return()=>clearTimeout(timer);
  },[value,delay]);
  return debounced;
};

const EMPTY_PATIENT_COUNTS={all:0,active:0,waiting:0,inactive:0,discharged:0,filtered:0};

const usePatientRegistrySearch=(search,status)=>{
  const [patients,setPatients]=React.useState([]);
  const [counts,setCounts]=React.useState(EMPTY_PATIENT_COUNTS);
  const [total,setTotal]=React.useState(0);
  const [loading,setLoading]=React.useState(true);
  const [searching,setSearching]=React.useState(false);
  const [error,setError]=React.useState('');
  const [refreshKey,setRefreshKey]=React.useState(0);
  const hasLoaded=React.useRef(false);
  const debouncedSearch=useDebouncedValue(search,350);

  React.useEffect(()=>{
    const controller=new AbortController();
    if(hasLoaded.current)setSearching(true);
    else setLoading(true);
    setError('');
    const params=new URLSearchParams({
      q:debouncedSearch.trim(),
      status,
      limit:'100'
    });
    fetch(`${BASE_URL}/api/search/patients?${params.toString()}`,{
      headers:ah(),
      signal:controller.signal
    })
      .then(async r=>{
        const body=await r.json().catch(()=>({}));
        const authFailure=r.status===401||
          (r.status===403&&/token|expired|authentication/i.test(body.message||''));
        if(authFailure){
          clearSessionAndRedirect('Your login session is no longer valid. Please sign in again.');
          const sessionError=new Error('Session expired');
          sessionError.name='SessionExpiredError';
          throw sessionError;
        }
        if(!r.ok)throw new Error(body.message||'Unable to search patient records.');
        return body;
      })
      .then(body=>{
        setPatients(Array.isArray(body.results)?body.results:[]);
        setCounts({...EMPTY_PATIENT_COUNTS,...(body.counts||{})});
        setTotal(Number(body.total||0));
        hasLoaded.current=true;
      })
      .catch(err=>{
        if(!['AbortError','SessionExpiredError'].includes(err.name)){
          setError(err.message||'Unable to search patient records.');
        }
      })
      .finally(()=>{
        if(!controller.signal.aborted){
          setLoading(false);
          setSearching(false);
        }
      });
    return()=>controller.abort();
  },[debouncedSearch,status,refreshKey]);

  return{
    patients,counts,total,loading,searching,error,
    refresh:()=>setRefreshKey(key=>key+1)
  };
};

// ── Helper: extract vitals & records from API response (handles different backend shapes)
const extractVitalsAndRecords = (data) => {
const recs = data.records || data.medical_records || data.vitals_records || [];  // vitals may come as a separate object OR live inside the first medical record
  const vit = (data.vitals && Object.keys(data.vitals).length > 0)
    ? data.vitals
    : (recs.length > 0 ? recs[0] : {});
  return { recs, vit };
};

const GH_LABS = [
  {id:'fbc',       cat:'Haematology',  label:'Full Blood Count (FBC)'},
  {id:'malaria',   cat:'Parasitology', label:'Malaria RDT / Blood Smear'},
  {id:'typhoid',   cat:'Microbiology', label:'Typhoid Test (Widal)'},
  {id:'hepb',      cat:'Serology',     label:'Hepatitis B Surface Antigen'},
  {id:'hiv',       cat:'Serology',     label:'HIV Screening'},
  {id:'bloodgroup',cat:'Haematology',  label:'Blood Group & Rh Factor'},
  {id:'rbs',       cat:'Biochemistry', label:'Random Blood Sugar (RBS)'},
  {id:'fbs',       cat:'Biochemistry', label:'Fasting Blood Sugar (FBS)'},
  {id:'hba1c',     cat:'Biochemistry', label:'HbA1c (Glycated Haemoglobin)'},
  {id:'kft',       cat:'Biochemistry', label:'Kidney Function Test (KFT)'},
  {id:'lft',       cat:'Biochemistry', label:'Liver Function Test (LFT)'},
  {id:'lipid',     cat:'Biochemistry', label:'Lipid Profile'},
  {id:'urine',     cat:'Urinalysis',   label:'Urine Routine & Microscopy'},
  {id:'stool',     cat:'Parasitology', label:'Stool Analysis'},
  {id:'xray',      cat:'Imaging',      label:'Chest X-Ray'},
  {id:'pregnancy', cat:'Serology',     label:'Pregnancy Test (Urine HCG)'},
  {id:'sickle',    cat:'Haematology',  label:'Sickle Cell Screening (HPLC)'},
  {id:'tft',       cat:'Biochemistry', label:'Thyroid Function Test (TFT)'},
  {id:'electro',   cat:'Biochemistry', label:'Serum Electrolytes'},
  {id:'vdrl',      cat:'Serology',     label:'VDRL / Syphilis Test'},
];

/* ── GLOBAL STYLES ── */
const GStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Manrope:wght@600;700;800&display=swap');
    :root{
      font-family:'DM Sans',sans-serif;color:#172033;background:#f4f7fb;
      --navy:#101b32;--brand:#0f766e;--surface:#fff;--line:#e5eaf1;--muted:#68758a;
      --shadow-sm:0 1px 2px rgba(16,27,50,.04),0 6px 18px rgba(16,27,50,.05);
      --shadow-lg:0 24px 70px rgba(16,27,50,.18);
    }
    *{box-sizing:border-box;margin:0;padding:0;}
    html{scroll-behavior:smooth;}
    body{min-width:320px;min-height:100vh;font-family:'DM Sans',sans-serif;background:#f4f7fb;color:#172033;}
    h1,h2,h3,h4{font-family:'Manrope',sans-serif;letter-spacing:-.025em;}
    input,textarea,select,button{font-family:'DM Sans',sans-serif;}
    button,a,input,textarea,select{transition:border-color .18s ease,box-shadow .18s ease,background-color .18s ease,color .18s ease,transform .18s ease;}
    button:focus-visible,a:focus-visible,input:focus-visible,textarea:focus-visible,select:focus-visible{outline:3px solid rgba(20,184,166,.2);outline-offset:2px;}
    input:focus,textarea:focus,select:focus{border-color:#5eead4 !important;box-shadow:0 0 0 4px rgba(20,184,166,.1);}
    input::placeholder,textarea::placeholder{color:#9aa5b5;}
    ::selection{background:#ccfbf1;color:#134e4a;}
    ::-webkit-scrollbar{width:7px;height:7px;}
    ::-webkit-scrollbar-track{background:transparent;}
    ::-webkit-scrollbar-thumb{background:#cbd5e1;border-radius:10px;}
    .emr-btn:hover:not(:disabled){transform:translateY(-1px);filter:brightness(.98);box-shadow:0 8px 18px rgba(16,27,50,.12);}
    .emr-btn:active:not(:disabled){transform:translateY(0);}
    .emr-table-shell{box-shadow:var(--shadow-sm);}
    .emr-table-scroll{overflow-x:auto;}
    .emr-table-row:hover{background:#f8fafc !important;}
    .emr-stat-card{position:relative;overflow:hidden;box-shadow:var(--shadow-sm);transition:transform .2s ease,box-shadow .2s ease;}
    .emr-stat-card::after{content:'';position:absolute;width:90px;height:90px;border-radius:50%;right:-38px;bottom:-48px;background:currentColor;opacity:.045;}
    .emr-stat-card:hover{transform:translateY(-2px);box-shadow:0 12px 30px rgba(16,27,50,.08);}
    .emr-sidebar{width:248px;flex-shrink:0;background:linear-gradient(180deg,#101b32 0%,#0c1629 100%);color:white;display:flex;flex-direction:column;justify-content:space-between;height:100vh;position:sticky;top:0;z-index:120;border-right:1px solid rgba(255,255,255,.06);}
    .sidebar-brand{padding:25px 20px 22px;display:flex;align-items:center;gap:12px;}
    .brand-mark{width:42px;height:42px;border-radius:13px;background:linear-gradient(145deg,#2dd4bf,#0f766e);display:flex;align-items:center;justify-content:center;color:white;font:500 27px/1 'Manrope',sans-serif;box-shadow:0 10px 24px rgba(20,184,166,.24);}
    .sidebar-link:hover{background:rgba(255,255,255,.06) !important;color:#fff !important;}
    .sidebar-link-active::before{content:'';position:absolute;left:0;top:10px;bottom:10px;width:3px;border-radius:0 4px 4px 0;background:#2dd4bf;}
    .sidebar-logout:hover{background:rgba(239,68,68,.08) !important;color:#fecaca !important;}
    .app-main{flex:1;display:flex;flex-direction:column;overflow:hidden;min-width:0;}
    .app-topbar{min-height:78px;padding:14px 32px;background:rgba(255,255,255,.92);backdrop-filter:blur(12px);border-bottom:1px solid var(--line);display:flex;align-items:center;justify-content:space-between;flex-shrink:0;position:sticky;top:0;z-index:80;}
    .app-content{flex:1;overflow-y:auto;padding:30px 32px 42px;}
    .app-content-inner{width:100%;max-width:1540px;margin:0 auto;}
    .encounter-timeline{position:relative;display:grid;gap:14px;padding-left:25px;}
    .encounter-timeline::before{content:'';position:absolute;left:7px;top:8px;bottom:8px;width:2px;background:linear-gradient(#5eead4,#dbeafe 65%,#e2e8f0);}
    .encounter-card{position:relative;padding:17px 18px;border:1px solid #e5eaf1;border-radius:15px;background:#fff;box-shadow:0 5px 18px rgba(16,27,50,.045);}
    .encounter-card::before{content:'';position:absolute;left:-23px;top:22px;width:11px;height:11px;border-radius:50%;background:#0f766e;border:3px solid #ccfbf1;box-shadow:0 0 0 3px #fff;}
    .encounter-card-grid{display:grid;grid-template-columns:minmax(0,1.2fr) minmax(0,1fr) minmax(0,1fr);gap:12px;margin-top:14px;}
    .encounter-detail{padding:11px 12px;border-radius:11px;background:#f8fafc;border:1px solid #eef2f6;}
    .encounter-detail-label{font-size:9.5px;font-weight:800;text-transform:uppercase;letter-spacing:.07em;color:#94a3b8;margin-bottom:5px;}
    .encounter-detail-value{font-size:11.8px;line-height:1.55;color:#475569;}
    .menu-btn{display:none;}
    .sidebar-backdrop{display:none;}
    .topbar-date{font-size:12px;color:#8490a3;margin-top:3px;}
    .search-wrap{position:relative;}
    .search-wrap input{width:250px;padding-left:40px !important;background:#f8fafc !important;}
    .user-chip{display:flex;align-items:center;gap:10px;padding:6px 9px 6px 7px;border:1px solid var(--line);border-radius:13px;background:white;}
    .user-meta{display:flex;flex-direction:column;line-height:1.15;}
    .auth-shell{min-height:100vh;display:grid;grid-template-columns:minmax(390px,44%) 1fr;background:#fff;}
    .auth-brand{position:relative;overflow:hidden;display:flex;flex-direction:column;justify-content:space-between;padding:42px clamp(38px,5vw,72px);background:radial-gradient(circle at 18% 13%,rgba(45,212,191,.20),transparent 32%),radial-gradient(circle at 90% 82%,rgba(59,130,246,.18),transparent 34%),linear-gradient(150deg,#0d1b31 0%,#122844 55%,#0f3d3b 125%);color:white;}
    .auth-brand::after{content:'';position:absolute;inset:0;opacity:.14;pointer-events:none;background-image:radial-gradient(rgba(255,255,255,.8) .7px,transparent .7px);background-size:22px 22px;}
    .auth-brand-content,.auth-brand-footer{position:relative;z-index:1;}
    .auth-brand-content{margin:auto 0;}
    .auth-kicker{display:inline-flex;align-items:center;gap:7px;padding:7px 11px;border:1px solid rgba(153,246,228,.24);border-radius:99px;background:rgba(15,118,110,.22);color:#99f6e4;font-size:12px;font-weight:700;margin-bottom:25px;}
    .auth-title{font-size:clamp(36px,4.5vw,62px);line-height:1.08;max-width:620px;margin-bottom:20px;}
    .auth-copy{max-width:520px;color:rgba(255,255,255,.66);font-size:16px;line-height:1.75;}
    .auth-points{display:flex;flex-wrap:wrap;gap:10px;margin-top:30px;}
    .auth-point{padding:8px 11px;border:1px solid rgba(255,255,255,.11);background:rgba(255,255,255,.06);border-radius:10px;color:rgba(255,255,255,.76);font-size:12px;font-weight:600;}
    .auth-form-side{display:flex;align-items:center;justify-content:center;padding:48px clamp(24px,7vw,100px);background:linear-gradient(180deg,#fff,#fbfdff);}
    .auth-form-card{width:100%;max-width:440px;}
    .auth-form-card h2{font-size:30px;color:#111c31;margin-bottom:9px;}
    .auth-form-copy{font-size:14px;color:#748197;line-height:1.6;margin-bottom:28px;}
    .portal-card{width:100%;border:1px solid #dce5ee;background:white;padding:18px 19px;border-radius:16px;cursor:pointer;display:flex;align-items:center;gap:14px;text-align:left;box-shadow:var(--shadow-sm);}
    .portal-card:hover{transform:translateY(-2px);border-color:#99f6e4;box-shadow:0 14px 32px rgba(15,118,110,.1);}
    .portal-icon{width:45px;height:45px;border-radius:13px;display:grid;place-items:center;background:#ecfdf5;font-size:21px;}
    .portal-arrow{margin-left:auto;font-size:20px;color:#0f766e;}
    .nurse-hero{
      position:relative;overflow:hidden;display:flex;align-items:center;justify-content:space-between;gap:24px;
      padding:28px 30px;border-radius:20px;color:white;margin-bottom:20px;
      background:radial-gradient(circle at 80% 20%,rgba(45,212,191,.26),transparent 28%),
        linear-gradient(135deg,#101b32 0%,#17304b 58%,#0f766e 140%);
      box-shadow:0 18px 45px rgba(16,27,50,.14);
    }
    .nurse-hero::after{content:'';position:absolute;width:230px;height:230px;border:1px solid rgba(255,255,255,.09);border-radius:50%;right:-70px;top:-115px;box-shadow:0 0 0 35px rgba(255,255,255,.025),0 0 0 70px rgba(255,255,255,.018);}
    .nurse-hero-content,.nurse-hero-actions{position:relative;z-index:1;}
    .nurse-hero-actions{display:flex;align-items:center;gap:10px;flex-shrink:0;}
    .nurse-kpi-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px;margin-bottom:20px;}
    .nurse-kpi{
      min-height:145px;padding:19px 20px;border:1px solid #e5eaf1;border-radius:17px;background:white;
      box-shadow:var(--shadow-sm);position:relative;overflow:hidden;
    }
    .nurse-kpi::after{content:'';position:absolute;width:90px;height:90px;border-radius:50%;right:-42px;bottom:-42px;background:var(--kpi-color,#0f766e);opacity:.07;}
    .nurse-kpi-top{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;}
    .nurse-icon-tile{width:38px;height:38px;border-radius:11px;display:grid;place-items:center;background:var(--icon-bg,#ecfdf5);color:var(--icon-color,#0f766e);font:800 18px/1 'Manrope',sans-serif;border:1px solid rgba(148,163,184,.14);}
    .nurse-kpi-value{font:800 34px/1 'Manrope',sans-serif;color:#172033;margin-top:17px;}
    .nurse-kpi-meta{font-size:11px;color:#8490a3;margin-top:7px;}
    .nurse-dashboard-grid{display:grid;grid-template-columns:minmax(0,1.75fr) minmax(280px,.75fr);gap:18px;align-items:start;}
    .clinical-panel{border:1px solid #e5eaf1;border-radius:18px;background:#fff;box-shadow:var(--shadow-sm);overflow:hidden;}
    .clinical-panel-header{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:20px 22px;border-bottom:1px solid #eef2f6;}
    .clinical-panel-body{padding:20px 22px;}
    .queue-preview-row{display:grid;grid-template-columns:minmax(0,1.4fr) minmax(110px,.65fr) minmax(100px,.55fr) auto;align-items:center;gap:14px;padding:14px 0;border-bottom:1px solid #eef2f6;}
    .queue-preview-row:last-child{border-bottom:0;padding-bottom:0;}
    .queue-preview-row:first-child{padding-top:0;}
    .patient-avatar{width:38px;height:38px;border-radius:12px;display:grid;place-items:center;background:#ecfdf5;color:#0f766e;font-weight:800;flex-shrink:0;}
    .quick-action-card{width:100%;display:flex;align-items:center;gap:12px;padding:14px;border:1px solid #e5eaf1;border-radius:14px;background:#fff;cursor:pointer;text-align:left;}
    .quick-action-card:hover{border-color:#99f6e4;background:#fbfffe;transform:translateY(-1px);box-shadow:0 8px 20px rgba(15,118,110,.08);}
    .quick-action-card+.quick-action-card{margin-top:9px;}
    .shift-progress-track{height:7px;border-radius:99px;background:#e8eef5;overflow:hidden;margin:13px 0 8px;}
    .shift-progress-fill{height:100%;border-radius:inherit;background:linear-gradient(90deg,#0f766e,#2dd4bf);}
    .form-grid-2{display:grid;grid-template-columns:1fr 1fr;gap:14px;}
    .nurse-page-intro{
      display:flex;align-items:center;justify-content:space-between;gap:24px;padding:23px 25px;margin-bottom:17px;
      border:1px solid #dfe7ef;border-radius:18px;background:
        radial-gradient(circle at 91% 10%,rgba(20,184,166,.11),transparent 22%),
        linear-gradient(135deg,#fff,#f8fffd);box-shadow:var(--shadow-sm);
    }
    .nurse-page-kicker{font-size:10px;font-weight:800;color:#0f766e;text-transform:uppercase;letter-spacing:1px;margin-bottom:7px;}
    .nurse-page-intro h2{font-size:21px;color:#172033;margin-bottom:5px;}
    .nurse-page-intro p{font-size:12.5px;color:#748197;line-height:1.55;max-width:690px;}
    .nurse-page-actions{display:flex;align-items:center;gap:9px;flex-shrink:0;}
    .nurse-mini-stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;margin-bottom:17px;}
    .nurse-mini-stat{display:flex;align-items:center;gap:12px;padding:14px 16px;border:1px solid #e5eaf1;border-radius:14px;background:#fff;box-shadow:var(--shadow-sm);}
    .nurse-mini-value{font:800 21px/1 'Manrope',sans-serif;color:#172033;}
    .nurse-mini-label{font-size:10.5px;color:#8490a3;margin-top:4px;}
    .nurse-toolbar{display:flex;align-items:center;justify-content:space-between;gap:16px;margin-bottom:12px;}
    .filter-pills{display:flex;align-items:center;gap:6px;flex-wrap:wrap;}
    .filter-pill{padding:7px 11px;border:1px solid #dfe6ee;border-radius:9px;background:#fff;color:#68758a;font-size:11px;font-weight:700;cursor:pointer;}
    .filter-pill:hover{border-color:#99f6e4;color:#0f766e;}
    .filter-pill.is-active{background:#0f766e;border-color:#0f766e;color:#fff;box-shadow:0 6px 15px rgba(15,118,110,.18);}
    .workflow-strip{display:grid;grid-template-columns:repeat(3,1fr);gap:1px;margin-bottom:17px;border:1px solid #e5eaf1;border-radius:15px;background:#e5eaf1;overflow:hidden;box-shadow:var(--shadow-sm);}
    .workflow-step{display:flex;align-items:center;gap:11px;padding:15px 17px;background:#fff;}
    .workflow-number{width:29px;height:29px;border-radius:9px;display:grid;place-items:center;background:#ecfdf5;color:#0f766e;font-size:11px;font-weight:800;flex-shrink:0;}
    .nurse-empty-state{padding:48px 24px;text-align:center;border:1px dashed #d6e0ea;border-radius:18px;background:linear-gradient(180deg,#fff,#fbfdfd);}
    .nurse-empty-icon{width:60px;height:60px;border-radius:18px;display:grid;place-items:center;margin:0 auto 15px;background:#ecfdf5;color:#0f766e;font:800 25px/1 'Manrope',sans-serif;border:1px solid #ccfbf1;}
    .patient-name-cell{display:flex;align-items:center;gap:10px;min-width:0;}
    .patient-name-cell .patient-avatar{width:34px;height:34px;border-radius:10px;}
    .queue-alert{display:flex;align-items:center;justify-content:space-between;gap:18px;padding:15px 17px;margin-bottom:17px;border-radius:14px;border:1px solid #fde68a;background:#fffbeb;}
    .vitals-patient-card{display:flex;align-items:center;gap:12px;padding:13px 14px;background:#f0fdfa;border-radius:12px;border:1px solid #ccfbf1;}
    .consult-patient-banner{
      position:relative;overflow:hidden;display:flex;align-items:center;justify-content:space-between;gap:22px;
      padding:20px 22px;margin-bottom:14px;border-radius:18px;color:#fff;
      background:radial-gradient(circle at 88% 10%,rgba(96,165,250,.25),transparent 24%),linear-gradient(135deg,#111c31,#193b68 70%,#3730a3 145%);
      box-shadow:0 14px 35px rgba(17,28,49,.13);
    }
    .consult-patient-banner::after{content:'';position:absolute;width:150px;height:150px;border:1px solid rgba(255,255,255,.08);border-radius:50%;right:-45px;top:-83px;box-shadow:0 0 0 28px rgba(255,255,255,.025);}
    .consult-banner-content,.consult-banner-actions{position:relative;z-index:1;}
    .consult-banner-actions{display:flex;align-items:center;gap:8px;flex-wrap:wrap;justify-content:flex-end;}
    .consult-vitals-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;margin-bottom:16px;}
    .consult-vital-card{display:flex;align-items:center;gap:12px;padding:14px 15px;border:1px solid #e5eaf1;border-radius:14px;background:#fff;box-shadow:var(--shadow-sm);}
    .consult-vital-value{font:800 20px/1 'Manrope',sans-serif;color:#263247;}
    .consult-vital-label{font-size:9.5px;font-weight:800;text-transform:uppercase;letter-spacing:.65px;color:#8490a3;margin-bottom:5px;}
    .consult-workspace-grid{display:grid;grid-template-columns:minmax(0,1.35fr) minmax(330px,.75fr);gap:16px;margin-bottom:16px;align-items:stretch;}
    .consult-card{padding:20px;border:1px solid #e5eaf1;border-radius:17px;background:#fff;box-shadow:var(--shadow-sm);}
    .consult-section-heading{display:flex;align-items:flex-start;justify-content:space-between;gap:15px;margin-bottom:15px;}
    .consult-section-heading h3{font-size:15px;color:#172033;}
    .consult-section-heading p{font-size:11px;color:#8490a3;line-height:1.5;margin-top:4px;}
    .consult-action-grid{display:grid;grid-template-columns:1fr 1fr;gap:9px;margin-top:14px;}
    .consult-plan-action{display:flex;align-items:center;gap:10px;padding:12px;border:1px solid #e5eaf1;border-radius:12px;background:#fff;cursor:pointer;text-align:left;}
    .consult-plan-action:hover{border-color:#bfdbfe;background:#f8fbff;transform:translateY(-1px);}
    .consult-records-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px;}
    .consult-footer-actions{position:sticky;bottom:12px;z-index:40;display:flex;align-items:center;gap:10px;padding:12px;border:1px solid #dfe6ee;border-radius:15px;background:rgba(255,255,255,.94);backdrop-filter:blur(12px);box-shadow:0 14px 35px rgba(16,27,50,.12);}
    .lab-test-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;}
    @media(max-width:900px){
      .emr-sidebar{position:fixed;left:0;top:0;transform:translateX(-105%);box-shadow:var(--shadow-lg);transition:transform .25s ease;}
      .emr-sidebar.is-open{transform:translateX(0);}
      .sidebar-backdrop{display:block;position:fixed;inset:0;background:rgba(8,15,29,.45);backdrop-filter:blur(2px);z-index:110;border:0;}
      .menu-btn{display:grid;width:40px;height:40px;place-items:center;border:1px solid var(--line);border-radius:11px;background:white;color:#344056;font-size:20px;cursor:pointer;}
      .app-topbar{padding:12px 18px;min-height:70px;}
      .app-content{padding:22px 18px 36px;}
      .topbar-date,.user-meta{display:none;}
      .user-chip{border:0;padding:0;}
      .search-wrap input{width:min(230px,36vw);}
      .auth-shell{grid-template-columns:1fr;}
      .auth-brand{min-height:330px;padding:32px 26px;}
      .auth-brand-content{margin:44px 0 20px;}
      .auth-title{font-size:40px;}
      .auth-form-side{padding:42px 24px 54px;}
      .nurse-kpi-grid{grid-template-columns:repeat(2,minmax(0,1fr));}
      .nurse-dashboard-grid{grid-template-columns:1fr;}
      .nurse-mini-stats{grid-template-columns:repeat(2,minmax(0,1fr));}
      .consult-workspace-grid,.consult-records-grid{grid-template-columns:1fr;}
      .encounter-card-grid{grid-template-columns:1fr;}
    }
    @media(max-width:600px){
      .app-topbar{align-items:flex-start;flex-wrap:wrap;gap:12px;}
      .topbar-right{width:100%;display:flex !important;}
      .search-wrap{flex:1;}
      .search-wrap input{width:100%;}
      .app-content{padding:18px 14px 32px;}
      .auth-brand{min-height:300px;}
      .auth-title{font-size:34px;}
      .auth-points{display:none;}
      .auth-form-side{align-items:flex-start;padding-top:36px;}
      .auth-form-card h2{font-size:26px;}
      .nurse-hero{align-items:flex-start;flex-direction:column;padding:23px 20px;}
      .nurse-hero-actions{width:100%;flex-wrap:wrap;}
      .nurse-kpi-grid{grid-template-columns:1fr 1fr;gap:10px;}
      .nurse-kpi{min-height:135px;padding:16px;}
      .queue-preview-row{grid-template-columns:1fr auto;}
      .queue-preview-secondary{display:none;}
      .form-grid-2{grid-template-columns:1fr;}
      .nurse-page-intro{align-items:flex-start;flex-direction:column;padding:20px;}
      .nurse-page-actions{width:100%;flex-wrap:wrap;}
      .nurse-mini-stats{grid-template-columns:1fr 1fr;}
      .nurse-mini-stat{padding:12px;}
      .nurse-toolbar{align-items:flex-start;flex-direction:column;}
      .workflow-strip{grid-template-columns:1fr;}
      .queue-alert{align-items:flex-start;flex-direction:column;}
      .consult-patient-banner{align-items:flex-start;flex-direction:column;padding:19px;}
      .consult-banner-actions{justify-content:flex-start;}
      .consult-vitals-grid{grid-template-columns:1fr 1fr;}
      .consult-vital-card{padding:12px;gap:9px;}
      .consult-card{padding:17px;}
      .consult-action-grid,.lab-test-grid{grid-template-columns:1fr;}
      .consult-footer-actions{align-items:stretch;flex-direction:column;bottom:7px;}
      .consult-footer-actions>*{width:100%;}
    }
    @media(prefers-reduced-motion:reduce){*,*::before,*::after{scroll-behavior:auto !important;transition:none !important;animation:none !important;}}
  `}</style>
);

/* ── TOAST ── */
function useToast(){
  const [t,setT]=React.useState({msg:'',type:'success'});
  const show=(msg,type='success')=>{setT({msg,type});setTimeout(()=>setT({msg:'',type:'success'}),3500);};
  return {...t,show};
}
const Toast=({msg,type})=>!msg?null:(
  <div role={type==='error'?'alert':'status'} aria-live="polite" style={{position:'fixed',top:22,left:'50%',transform:'translateX(-50%)',
    backgroundColor:type==='error'?'#FEF2F2':'#F0FDF4',
    border:`1px solid ${type==='error'?'#FECACA':'#BBF7D0'}`,
    color:type==='error'?'#DC2626':'#16A34A',
    padding:'12px 18px',borderRadius:12,boxShadow:'0 12px 32px rgba(16,27,50,.16)',
    display:'flex',alignItems:'center',gap:10,zIndex:9999,fontWeight:700,fontSize:14}}>
    {type==='error'?'🚫':'✅'} {msg}
  </div>
);

/* ── PRIMITIVES ── */
const inp={width:'100%',padding:'12px 14px',border:'1px solid #DDE4ED',borderRadius:10,fontSize:14,outline:'none',backgroundColor:'white',color:'#172033'};

const Btn=({onClick,disabled,v='primary',sz='md',children,style={},type='button'})=>{
  const S={sm:{padding:'7px 14px',fontSize:12},md:{padding:'11px 22px',fontSize:14},lg:{padding:'14px 30px',fontSize:15}};
  const V={
    primary:{backgroundColor:disabled?'#94A3B8':'#101B32',color:'white',border:'1px solid transparent'},
    blue:   {backgroundColor:disabled?'#94A3B8':'#0F766E',color:'white',border:'1px solid transparent'},
    green:  {backgroundColor:disabled?'#94A3B8':'#22C55E',color:'white',border:'none'},
    ghost:  {backgroundColor:'white',color:'#475569',border:'1px solid #E2E8F0'},
    outline:{backgroundColor:'transparent',color:'#0F766E',border:'1px solid #0F766E'},
    danger: {backgroundColor:disabled?'#94A3B8':'#EF4444',color:'white',border:'none'},
  };
  return(
    <button type={type} disabled={disabled} onClick={onClick} className={`emr-btn emr-btn-${v}`}
      style={{cursor:disabled?'not-allowed':'pointer',borderRadius:10,fontWeight:700,
        display:'inline-flex',alignItems:'center',gap:6,...S[sz],...V[v],...style}}>
      {children}
    </button>
  );
};

const Field=({label,required,children})=>(
  <div style={{display:'flex',flexDirection:'column',gap:7}}>
    <label style={{fontSize:13,fontWeight:700,color:'#344056'}}>{label}{required&&<span style={{color:'#EF4444'}}> *</span>}</label>
    {children}
  </div>
);

const Badge=({text,color='gray'})=>{
  const C={green:{bg:'#DCFCE7',tc:'#16A34A'},blue:{bg:'#DBEAFE',tc:'#1D4ED8'},
    yellow:{bg:'#FEF3C7',tc:'#B45309'},red:{bg:'#FEE2E2',tc:'#DC2626'},
    gray:{bg:'#F1F5F9',tc:'#475569'},purple:{bg:'#EDE9FE',tc:'#7C3AED'}}[color]||{bg:'#F1F5F9',tc:'#475569'};
  return(<span style={{padding:'4px 10px',borderRadius:20,backgroundColor:C.bg,color:C.tc,fontSize:11,fontWeight:700,whiteSpace:'nowrap',letterSpacing:.15}}>{text}</span>);
};

const statusBadge=s=>{
  const v=(s||'').toLowerCase();
  const label=String(s||'—').replaceAll('_',' ');
  if(['active','completed','dispensed','normal','success'].includes(v)) return <Badge text={label} color="green"/>;
  if(['waiting','pending','scheduled','awaiting_results'].includes(v)) return <Badge text={label} color="yellow"/>;
  if(['cancelled','abnormal','critical','inactive','failure','failed'].includes(v)) return <Badge text={label} color="red"/>;
  if(['registered','triaged','in_consultation'].includes(v)) return <Badge text={label} color="blue"/>;
  return <Badge text={label}/>;
};

/* ── MODAL ── */
const Modal=({open,onClose,title,width=480,children})=>{
  React.useEffect(()=>{
    if(!open)return undefined;
    const close=e=>e.key==='Escape'&&onClose();
    const previousOverflow=document.body.style.overflow;
    document.body.style.overflow='hidden';
    window.addEventListener('keydown',close);
    return()=>{window.removeEventListener('keydown',close);document.body.style.overflow=previousOverflow;};
  },[open,onClose]);
  if(!open)return null;
  return(
    <div onMouseDown={e=>e.target===e.currentTarget&&onClose()} style={{position:'fixed',inset:0,backgroundColor:'rgba(8,15,29,.58)',backdropFilter:'blur(4px)',display:'flex',
      alignItems:'center',justifyContent:'center',zIndex:500,padding:16}}>
      <div role="dialog" aria-modal="true" aria-label={title} style={{width:`min(${width}px,96vw)`,backgroundColor:'white',borderRadius:18,
        boxShadow:'0 30px 80px rgba(8,15,29,.25)',overflow:'hidden',maxHeight:'92vh',display:'flex',flexDirection:'column'}}>
        <div style={{padding:'21px 26px',borderBottom:'1px solid #EDF1F5',
          display:'flex',justifyContent:'space-between',alignItems:'center',flexShrink:0}}>
          <h3 style={{fontSize:18,fontWeight:800,color:'#172033'}}>{title}</h3>
          <button type="button" aria-label="Close dialog" onClick={onClose} style={{width:34,height:34,display:'grid',placeItems:'center',background:'#F8FAFC',border:'1px solid #E5EAF1',borderRadius:9,cursor:'pointer',fontSize:20,color:'#64748B',lineHeight:1}}>×</button>
        </div>
        <div style={{overflowY:'auto',flex:1}}>{children}</div>
      </div>
    </div>
  );
};
const MB=({children})=><div style={{padding:'20px 26px',display:'flex',flexDirection:'column',gap:16}}>{children}</div>;
const MF=({children})=>(
  <div style={{padding:'14px 26px 20px',borderTop:'1px solid #F1F5F9',display:'flex',justifyContent:'flex-end',gap:10,flexShrink:0}}>{children}</div>
);

/* ── TABLE ── */
const Table=({cols,rows,empty='No records found.'})=>(
  <div className="emr-table-shell" style={{backgroundColor:'white',borderRadius:14,border:'1px solid #E5EAF1',overflow:'hidden'}}>
    <div className="emr-table-scroll">
      <div style={{minWidth:cols.length>4?820:620}}>
        <div style={{display:'grid',gridTemplateColumns:cols.map(c=>c.w||'1fr').join(' '),
          padding:'13px 18px',backgroundColor:'#F8FAFC',borderBottom:'1px solid #E5EAF1'}}>
          {cols.map(c=><div key={c.key} style={{fontSize:10,fontWeight:800,color:'#8490A3',textTransform:'uppercase',letterSpacing:.75}}>{c.label}</div>)}
        </div>
        {rows.length===0
          ?<div style={{textAlign:'center',padding:'44px 18px',color:'#8490A3',fontSize:14}}><div style={{fontSize:23,marginBottom:7}}>⌁</div>{empty}</div>
          :rows.map((row,i)=>(
            <div key={i} onClick={row._onClick} className="emr-table-row"
              role={row._onClick?'button':undefined} tabIndex={row._onClick?0:undefined}
              onKeyDown={e=>row._onClick&&(['Enter',' '].includes(e.key))&&row._onClick()}
              style={{display:'grid',gridTemplateColumns:cols.map(c=>c.w||'1fr').join(' '),
                padding:'16px 18px',borderBottom:i<rows.length-1?'1px solid #EEF2F6':'none',
                cursor:row._onClick?'pointer':'default',background:'white'}}>
              {cols.map(c=><div key={c.key} style={{fontSize:13.5,fontWeight:500,color:'#344056',display:'flex',alignItems:'center',paddingRight:10}}>{row[c.key]}</div>)}
            </div>
          ))
        }
      </div>
    </div>
  </div>
);

/* ── STAT CARD ── */
const SC=({label,value,icon,color='#1E293B',bg='white',border='#E2E8F0'})=>(
  <div className="emr-stat-card" style={{padding:'20px 22px',borderRadius:15,backgroundColor:bg,border:`1px solid ${border}`,flex:1,minWidth:180,color}}>
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
      <p style={{fontSize:12,fontWeight:700,color:'#68758A',margin:0,letterSpacing:.15}}>{label}</p>
      {icon&&<span style={{width:37,height:37,borderRadius:11,display:'grid',placeItems:'center',fontSize:18,background:'rgba(255,255,255,.65)',border:'1px solid rgba(148,163,184,.14)'}}>{icon}</span>}
    </div>
    <h2 style={{fontSize:'clamp(28px,3vw,38px)',fontWeight:800,color,margin:'7px 0 0'}}>{value}</h2>
  </div>
);

/* ── SIDEBAR ── */
const Sidebar=({nav,open,onClose})=>{
  const loc=useLocation();
  const nv=useNavigate();
  const logout=()=>{['token','user','role','display_name'].forEach(k=>localStorage.removeItem(k));nv('/',{replace:true});};
  const dn=localStorage.getItem('display_name')||'';
  const role=(localStorage.getItem('role')||'Staff').replace('_',' ');
  return(
    <>
    {open&&<button type="button" className="sidebar-backdrop" aria-label="Close navigation" onClick={onClose}/>}
    <aside className={`emr-sidebar${open?' is-open':''}`} aria-label="Main navigation">
      <div>
        <div className="sidebar-brand">
          <div className="brand-mark">+</div>
          <div>
            <div style={{fontFamily:'Manrope',fontSize:14,fontWeight:800,color:'white',letterSpacing:.2,lineHeight:1.15}}>HEALTHCARE EMR</div>
            <div style={{fontSize:10,color:'rgba(255,255,255,.42)',marginTop:4}}>Clinical workspace</div>
          </div>
        </div>
        <div style={{padding:'5px 12px',marginBottom:8}}>
          <p style={{fontSize:10,fontWeight:700,color:'rgba(255,255,255,.28)',padding:'0 12px',marginBottom:9,textTransform:'uppercase',letterSpacing:1.1}}>Workspace</p>
          {nav.map(item=>{
            const active=loc.pathname===item.path;
            return(
              <Link key={item.path} to={item.path} onClick={onClose}
                className={`sidebar-link${active?' sidebar-link-active':''}`}
                style={{position:'relative',display:'flex',alignItems:'center',gap:11,
                  padding:'11px 13px',borderRadius:10,marginBottom:3,textDecoration:'none',
                  backgroundColor:active?'rgba(20,184,166,.13)':'transparent',
                  color:active?'#99F6E4':'rgba(255,255,255,.55)',fontWeight:active?700:500,fontSize:13.5}}>
                <span style={{width:20,textAlign:'center',fontSize:15,filter:active?'none':'grayscale(.35)'}}>{item.icon}</span>{item.label}
              </Link>
            );
          })}
        </div>
      </div>
      <div>
        <div style={{margin:'0 12px 12px',padding:'13px',borderRadius:12,backgroundColor:'rgba(255,255,255,.055)',border:'1px solid rgba(255,255,255,.06)'}}>
          <p style={{fontSize:12,fontWeight:700,color:'white',margin:'0 0 3px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{dn||'Healthcare user'}</p>
          <p style={{fontSize:10,color:'#5EEAD4',margin:0,textTransform:'capitalize'}}>{role}</p>
        </div>
        <button type="button" className="sidebar-logout" onClick={logout} style={{width:'100%',padding:'15px 22px',background:'none',border:'none',
          borderTop:'1px solid rgba(255,255,255,.07)',color:'rgba(255,255,255,.45)',
          cursor:'pointer',display:'flex',alignItems:'center',gap:10,fontSize:14,fontWeight:600}}>
          🚪 Logout
        </button>
      </div>
    </aside>
    </>
  );
};

/* ── APP LAYOUT ── */
const AL=({nav,title,searchText,setSearchText,searchPlaceholder='Search records...',searchBusy=false,children})=>{
  const dn=localStorage.getItem('display_name')||'';
  const role=(localStorage.getItem('role')||'Staff').replace('_',' ');
  const [menuOpen,setMenuOpen]=React.useState(false);
  const today=new Intl.DateTimeFormat('en-GB',{weekday:'short',day:'2-digit',month:'short',year:'numeric'}).format(new Date());
  return(
    <div style={{display:'flex',minHeight:'100vh'}}>
      <Sidebar nav={nav} open={menuOpen} onClose={()=>setMenuOpen(false)}/>
      <div className="app-main">
        <header className="app-topbar">
          <div style={{display:'flex',alignItems:'center',gap:12,minWidth:0}}>
            <button type="button" className="menu-btn" aria-label="Open navigation" onClick={()=>setMenuOpen(true)}>☰</button>
            <div style={{minWidth:0}}>
              <h1 style={{fontSize:'clamp(18px,2vw,22px)',fontWeight:800,color:'#111C31',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{title}</h1>
              <p className="topbar-date">{today}</p>
            </div>
          </div>
          <div className="topbar-right" style={{display:'flex',alignItems:'center',gap:13}}>
            {setSearchText&&(
              <div className="search-wrap">
                <span style={{position:'absolute',left:13,top:'50%',transform:'translateY(-50%)',color:'#8490A3',fontSize:14}}>⌕</span>
                <input value={searchText||''} onChange={e=>setSearchText(e.target.value)}
                  aria-label="Search records" aria-busy={searchBusy} placeholder={searchPlaceholder}
                  style={{...inp,fontSize:13,paddingRight:searchBusy?42:13}}/>
                {searchBusy&&<span aria-label="Searching" style={{position:'absolute',right:13,top:'50%',transform:'translateY(-50%)',color:'#0F766E',fontWeight:800}}>…</span>}
              </div>
            )}
            <div className="user-chip">
              <div style={{width:35,height:35,borderRadius:10,background:'linear-gradient(145deg,#CCFBF1,#DDEAFE)',
                display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,fontWeight:800,color:'#0F766E'}}>
                {(dn||'H').charAt(0).toUpperCase()}
              </div>
              <div className="user-meta">
                <span style={{fontSize:12,fontWeight:700,color:'#344056',maxWidth:135,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{dn||'Healthcare user'}</span>
                <span style={{fontSize:10,color:'#8490A3',textTransform:'capitalize'}}>{role}</span>
              </div>
            </div>
          </div>
        </header>
        <main className="app-content"><div className="app-content-inner">{children}</div></main>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════
   LANDING
══════════════════════════════════════ */
const BrandIdentity=()=>(
  <div style={{display:'flex',alignItems:'center',gap:11,position:'relative',zIndex:1}}>
    <div className="brand-mark">+</div>
    <div>
      <div style={{fontFamily:'Manrope',fontWeight:800,fontSize:14,letterSpacing:.25}}>HEALTHCARE EMR</div>
      <div style={{fontSize:10,color:'rgba(255,255,255,.5)',marginTop:3}}>Care connected</div>
    </div>
  </div>
);

const AuthBrand=({kicker='Secure digital care',title,copy})=>(
  <section className="auth-brand">
    <BrandIdentity/>
    <div className="auth-brand-content">
      <div className="auth-kicker"><span>●</span>{kicker}</div>
      <h1 className="auth-title">{title}</h1>
      <p className="auth-copy">{copy}</p>
      <div className="auth-points">
        <span className="auth-point">✓ One patient record</span>
        <span className="auth-point">✓ Role-based access</span>
        <span className="auth-point">✓ Built for Ghana</span>
      </div>
    </div>
    <p className="auth-brand-footer" style={{fontSize:11,color:'rgba(255,255,255,.35)'}}>Confidential • Reliable • Connected</p>
  </section>
);

const Landing=()=>{
  const nv=useNavigate();
  return(
    <div className="auth-shell">
      <AuthBrand
        kicker="Modern healthcare operations"
        title={<>Better records.<br/>Better decisions.<br/>Better care.</>}
        copy="A connected electronic medical record built to help Ghanaian care teams work faster, safer, and with the complete patient story in view."
      />
      <section className="auth-form-side">
        <div className="auth-form-card">
          <div style={{display:'inline-flex',alignItems:'center',gap:7,color:'#0F766E',fontSize:12,fontWeight:700,marginBottom:14}}><span>●</span> System online</div>
          <h2>Welcome to your care workspace</h2>
          <p className="auth-form-copy">Choose the right portal to securely continue.</p>
          <div style={{display:'flex',flexDirection:'column',gap:12}}>
            <button type="button" className="portal-card" onClick={()=>nv('/patient-login')}>
              <span className="portal-icon">👤</span>
              <span><strong style={{display:'block',fontSize:14,color:'#172033'}}>Patient portal</strong><span style={{fontSize:12,color:'#7A879A',marginTop:3,display:'block'}}>Appointments, results and prescriptions</span></span>
              <span className="portal-arrow">→</span>
            </button>
            <button type="button" className="portal-card" onClick={()=>nv('/login')}>
              <span className="portal-icon" style={{background:'#EFF6FF'}}>🏥</span>
              <span><strong style={{display:'block',fontSize:14,color:'#172033'}}>Hospital staff</strong><span style={{fontSize:12,color:'#7A879A',marginTop:3,display:'block'}}>Clinical and administrative workspace</span></span>
              <span className="portal-arrow">→</span>
            </button>
          </div>
          <p style={{marginTop:28,fontSize:11,color:'#9AA5B5',lineHeight:1.6,textAlign:'center'}}>Authorised access only. Activity within the system may be recorded for patient safety and compliance.</p>
        </div>
      </section>
    </div>
  );
};

/* ══════════════════════════════════════
   STAFF LOGIN
══════════════════════════════════════ */
const Login=()=>{
  const nv=useNavigate();
  const sessionNotice=useSessionNotice();
  const [role,setRole]=React.useState('');
  const [email,setEmail]=React.useState('');
  const [pass,setPass]=React.useState('');
  const [showPass,setShowPass]=React.useState(false);
  const [loading,setLoading]=React.useState(false);
  const [err,setErr]=React.useState('');
  const routes={admin:'/admin-dashboard',doctor:'/doctor-dashboard',nurse:'/nurse-dashboard',
    lab_technician:'/lab-dashboard',pharmacist:'/pharm-dashboard'};

  const go=async()=>{
    if(!email||!pass||!role){setErr('Please fill all fields.');return;}
    setLoading(true);setErr('');
    try{
      const r=await fetch(`${BASE_URL}/api/auth/login`,{method:'POST',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({email,password:pass,role})});
      const d=await r.json();
      if(!r.ok){setErr(d.message||'Invalid credentials.');return;}
      localStorage.setItem('token',d.token);
      localStorage.setItem('user',JSON.stringify(d.user));
      localStorage.setItem('role',d.user.role);
      localStorage.setItem('display_name',d.user.full_name||'');
      nv(routes[d.user.role]||'/doctor-dashboard');
    }catch{setErr('Network error.');}finally{setLoading(false);}
  };

  return(
    <div className="auth-shell">
      <AuthBrand title={<>One workspace for every care team.</>} copy="Securely review patient records, coordinate care, and complete your role-specific tasks from one connected clinical system."/>
      <section className="auth-form-side">
        <div className="auth-form-card">
          <button type="button" onClick={()=>nv('/')} style={{border:0,background:'none',color:'#0F766E',fontWeight:700,fontSize:12,cursor:'pointer',marginBottom:22}}>← Back to portal selection</button>
          <h2>Staff sign in</h2>
          <p className="auth-form-copy">Use your hospital credentials and select your assigned role.</p>
          {sessionNotice&&<div style={{padding:'11px 14px',backgroundColor:'#FFFBEB',border:'1px solid #FDE68A',
            borderRadius:10,color:'#92400E',fontSize:13,fontWeight:600,marginBottom:16}} role="status">⏱ {sessionNotice}</div>}
          {err&&<div style={{padding:'11px 14px',backgroundColor:'#FEF2F2',border:'1px solid #FECACA',
            borderRadius:10,color:'#DC2626',fontSize:13,fontWeight:600,marginBottom:16}} role="alert">🚫 {err}</div>}
          <div style={{display:'flex',flexDirection:'column',gap:16}}>
            <Field label="Your role" required>
              <select value={role} onChange={e=>{setRole(e.target.value);setErr('');}}
                style={{...inp,color:role?'#0F172A':'#94A3B8'}}>
                <option value="">— Select Role —</option>
                <option value="doctor">Doctor</option>
                <option value="nurse">Nurse</option>
                <option value="pharmacist">Pharmacist</option>
                <option value="lab_technician">Lab Technician</option>
                <option value="admin">Admin</option>
              </select>
            </Field>
            <Field label="Email Address">
              <input type="email" value={email} onChange={e=>{setEmail(e.target.value);setErr('');}}
                autoComplete="email" onKeyDown={e=>e.key==='Enter'&&go()} placeholder="e.g. bright@hospital.com" style={inp}/>
            </Field>
            <Field label="Password">
              <div style={{position:'relative'}}>
                <input type={showPass?'text':'password'} value={pass} onChange={e=>{setPass(e.target.value);setErr('');}}
                  autoComplete="current-password" onKeyDown={e=>e.key==='Enter'&&go()} placeholder="Enter password" style={{...inp,paddingRight:44}}/>
                <button type="button" aria-label={showPass?'Hide password':'Show password'} onClick={()=>setShowPass(p=>!p)}
                  style={{position:'absolute',right:12,top:'50%',transform:'translateY(-50%)',
                    background:'none',border:'none',cursor:'pointer',fontSize:18,color:'#94A3B8',padding:0}}>
                  {showPass?'👁️':'🙈'}
                </button>
              </div>
            </Field>
            <Btn onClick={go} disabled={loading} v="primary" sz="lg" style={{width:'100%',justifyContent:'center'}}>
              {loading?'Signing in...':'Login to Dashboard'}
            </Btn>
          </div>
          <p style={{marginTop:14,textAlign:'center',fontSize:13,color:'#94A3B8'}}>
            Patient? <button type="button" onClick={()=>nv('/patient-login')} style={{border:0,background:'none',color:'#0F766E',cursor:'pointer',fontWeight:700}}>Patient Portal</button>
          </p>
        </div>
      </section>
    </div>
  );
};

/* ══════════════════════════════════════
   PATIENT LOGIN
══════════════════════════════════════ */
const PatientLogin=()=>{
  const nv=useNavigate();
  const sessionNotice=useSessionNotice();
  const [email,setEmail]=React.useState('');
  const [pass,setPass]=React.useState('');
  const [showPass,setShowPass]=React.useState(false);
  const [loading,setLoading]=React.useState(false);
  const [err,setErr]=React.useState('');

  const go=async()=>{
    if(!email||!pass){setErr('Please enter email and password.');return;}
    setLoading(true);setErr('');
    try{
      const r=await fetch(`${BASE_URL}/api/auth/login`,{method:'POST',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({email,password:pass,role:'patient'})});
      const d=await r.json();
      if(!r.ok){setErr(d.message||'Invalid credentials.');return;}
      localStorage.setItem('token',d.token);
      localStorage.setItem('user',JSON.stringify(d.user));
      localStorage.setItem('role',d.user.role);
      localStorage.setItem('display_name',d.user.full_name||'');
      nv('/patient-dashboard');
    }catch{setErr('Network error.');}finally{setLoading(false);}
  };

  return(
    <div className="auth-shell">
      <AuthBrand kicker="Your health, connected" title={<>Your care journey in one secure place.</>} copy="View your records, keep track of prescriptions, review lab results, and book your next appointment whenever you need to."/>
      <section className="auth-form-side">
        <div className="auth-form-card">
          <button type="button" onClick={()=>nv('/')} style={{border:0,background:'none',color:'#0F766E',fontWeight:700,fontSize:12,cursor:'pointer',marginBottom:22}}>← Back to portal selection</button>
          <h2>Patient sign in</h2>
          <p className="auth-form-copy">Enter the email and password linked to your patient account.</p>
          {sessionNotice&&<div style={{padding:'11px 14px',backgroundColor:'#FFFBEB',border:'1px solid #FDE68A',
            borderRadius:10,color:'#92400E',fontSize:13,fontWeight:600,marginBottom:16}} role="status">⏱ {sessionNotice}</div>}
          {err&&<div style={{padding:'11px 14px',backgroundColor:'#FEF2F2',border:'1px solid #FECACA',
            borderRadius:10,color:'#DC2626',fontSize:13,fontWeight:600,marginBottom:16}} role="alert">🚫 {err}</div>}
          <div style={{display:'flex',flexDirection:'column',gap:16}}>
            <Field label="Email Address">
              <input type="email" value={email} onChange={e=>{setEmail(e.target.value);setErr('');}}
                autoComplete="email" onKeyDown={e=>e.key==='Enter'&&go()} placeholder="e.g. abena@email.com" style={inp}/>
            </Field>
            <Field label="Password">
              <div style={{position:'relative'}}>
                <input type={showPass?'text':'password'} value={pass} onChange={e=>{setPass(e.target.value);setErr('');}}
                  autoComplete="current-password" onKeyDown={e=>e.key==='Enter'&&go()} placeholder="Enter password" style={{...inp,paddingRight:44}}/>
                <button type="button" aria-label={showPass?'Hide password':'Show password'} onClick={()=>setShowPass(p=>!p)}
                  style={{position:'absolute',right:12,top:'50%',transform:'translateY(-50%)',
                    background:'none',border:'none',cursor:'pointer',fontSize:18,color:'#94A3B8',padding:0}}>
                  {showPass?'👁️':'🙈'}
                </button>
              </div>
            </Field>
            <Btn onClick={go} disabled={loading} v="primary" sz="lg" style={{width:'100%',justifyContent:'center'}}>
              {loading?'Signing in...':'Sign In'}
            </Btn>
          </div>
          <p style={{marginTop:14,textAlign:'center',fontSize:13,color:'#94A3B8'}}>
            Hospital staff? <button type="button" onClick={()=>nv('/login')} style={{border:0,background:'none',color:'#0F766E',cursor:'pointer',fontWeight:700}}>Staff Login</button>
          </p>
        </div>
      </section>
    </div>
  );
};

const LogoutPage=()=>{
  const nv=useNavigate();
  return(
    <div style={{minHeight:'100vh',display:'flex',justifyContent:'center',alignItems:'center',background:'radial-gradient(circle at top,#E6FFFA,#F4F7FB 45%)',padding:24}}>
      <div style={{textAlign:'center',maxWidth:400,background:'white',padding:'42px 38px',borderRadius:20,border:'1px solid #E5EAF1',boxShadow:'var(--shadow-lg)'}}>
        <div style={{width:70,height:70,display:'grid',placeItems:'center',margin:'0 auto 18px',fontSize:34,background:'#ECFDF5',borderRadius:20}}>👋</div>
        <h2 style={{fontSize:26,fontWeight:800,color:'#0F172A',marginBottom:10}}>Session ended</h2>
        <p style={{color:'#64748B',marginBottom:24,lineHeight:1.65,fontSize:14}}>You have been signed out securely. Sign in again whenever you’re ready to continue.</p>
        <Btn onClick={()=>nv('/',{replace:true})} v="primary" sz="lg" style={{justifyContent:'center'}}>Return to Login</Btn>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════
   NURSE MODULE
══════════════════════════════════════ */
const nurseNav=[
  {path:'/nurse-dashboard', label:'Dashboard',    icon:'▦'},
  {path:'/nurse-patients',  label:'Patients',     icon:'◉'},
  {path:'/nurse-triage',    label:'Triage Queue', icon:'✚'},
  {path:'/nurse-schedule',  label:'Schedule',     icon:'◷'},
];

const NurseDashboard=()=>{
  const nv=useNavigate();
  const toast=useToast();
  const [stats,setStats]=React.useState({waiting:'—',captured:'—',emergency:'—'});
  const [queue,setQueue]=React.useState([]);
  const [loading,setLoading]=React.useState(true);
  const [now,setNow]=React.useState(new Date());
  const [showReg,setShowReg]=React.useState(false);
  const [f,setF]=React.useState({fn:'',ln:'',email:'',dob:'',phone:'',gender:'',regDate:''});
  const [sub,setSub]=React.useState(false);

  const loadStats=()=>{
    setLoading(true);
    Promise.allSettled([
      fetch(`${BASE_URL}/api/patients/stats/nurse`,{headers:ah()}).then(r=>r.json()),
      fetch(`${BASE_URL}/api/patients/triage/queue`,{headers:ah()}).then(r=>r.json())
    ]).then(([statsResult,queueResult])=>{
      if(statsResult.status==='fulfilled'){
        const d=statsResult.value||{};
        setStats({waiting:String(d.waiting??0),captured:String(d.captured??0),emergency:String(d.emergency??0)});
      }
      if(queueResult.status==='fulfilled'){
        setQueue(Array.isArray(queueResult.value)?queueResult.value:[]);
      }
    }).finally(()=>setLoading(false));
  };
  React.useEffect(()=>{
    loadStats();
    const timer=setInterval(()=>setNow(new Date()),60000);
    return()=>clearInterval(timer);
  },[]);

  const register=async()=>{
    if(!f.fn||!f.ln){toast.show('First and last name required.','error');return;}
    setSub(true);
    try{
      const r=await fetch(`${BASE_URL}/api/patients`,{method:'POST',headers:ah(),
        body:JSON.stringify({full_name:`${f.fn} ${f.ln}`,email:f.email||undefined,
          date_of_birth:f.dob,phone:f.phone,gender:f.gender,
          registration_date:f.regDate||new Date().toLocaleDateString('en-GB')})});
      const d=await r.json();
      if(r.ok){toast.show('Patient registered!');setShowReg(false);setF({fn:'',ln:'',email:'',dob:'',phone:'',gender:'',regDate:''});loadStats();}
      else toast.show(d.message||'Failed.','error');
    }catch{toast.show('Network error.','error');}finally{setSub(false);}
  };

  const hour=now.getHours();
  const greeting=hour<12?'Good morning':hour<18?'Good afternoon':'Good evening';
  const shift=hour<14?'Morning shift':hour<20?'Afternoon shift':'Night shift';
  const captured=Number(stats.captured)||0;
  const waiting=Number(stats.waiting)||0;
  const emergency=Number(stats.emergency)||0;
  const shiftTotal=captured+waiting;
  const completion=shiftTotal?Math.round((captured/shiftTotal)*100):0;
  const nurseName=localStorage.getItem('display_name')||'Nurse';
  const waitLabel=p=>{
    const raw=p.registration_date||p.created_at;
    if(!raw)return 'Recently';
    const mins=Math.max(0,Math.floor((Date.now()-new Date(raw).getTime())/60000));
    if(Number.isNaN(mins))return 'Recently';
    if(mins<1)return 'Just arrived';
    if(mins<60)return `${mins} min`;
    return `${Math.floor(mins/60)}h ${mins%60}m`;
  };

  const Kpi=({label,value,symbol,color,bg,meta})=>(
    <div className="nurse-kpi" style={{'--kpi-color':color}}>
      <div className="nurse-kpi-top">
        <div>
          <p style={{fontSize:12,fontWeight:700,color:'#68758A'}}>{label}</p>
          <p className="nurse-kpi-value" style={{color}}>{loading?'—':value}</p>
        </div>
        <span className="nurse-icon-tile" style={{'--icon-bg':bg,'--icon-color':color}}>{symbol}</span>
      </div>
      <p className="nurse-kpi-meta">{meta}</p>
    </div>
  );

  return(
    <AL nav={nurseNav} title="Nurse Dashboard">
      <Toast {...toast}/>
      <section className="nurse-hero">
        <div className="nurse-hero-content">
          <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:11}}>
            <span style={{width:7,height:7,borderRadius:'50%',background:'#5EEAD4',boxShadow:'0 0 0 5px rgba(94,234,212,.12)'}}/>
            <span style={{fontSize:11,fontWeight:700,color:'#99F6E4',textTransform:'uppercase',letterSpacing:.85}}>{shift} • Nursing command centre</span>
          </div>
          <h2 style={{fontSize:'clamp(25px,3vw,36px)',fontWeight:800,marginBottom:7}}>{greeting}, {nurseName.split(' ')[0]}.</h2>
          <p style={{fontSize:13,color:'rgba(255,255,255,.62)',lineHeight:1.6}}>Keep patient flow moving and respond quickly to clinical priorities.</p>
        </div>
        <div className="nurse-hero-actions">
          <button type="button" onClick={()=>nv('/nurse-triage')} style={{padding:'12px 16px',borderRadius:11,border:'1px solid rgba(255,255,255,.18)',background:'rgba(255,255,255,.08)',color:'white',fontWeight:700,cursor:'pointer'}}>Open triage queue →</button>
          <button type="button" onClick={()=>setShowReg(true)} style={{padding:'12px 16px',borderRadius:11,border:'1px solid #5EEAD4',background:'#F0FDFA',color:'#0F766E',fontWeight:800,cursor:'pointer'}}>+ Register patient</button>
        </div>
      </section>

      <div className="nurse-kpi-grid">
        <Kpi label="Waiting for triage" value={stats.waiting} symbol="◷" color="#B45309" bg="#FFFBEB" meta={waiting===1?'1 patient needs attention':`${waiting} patients need attention`}/>
        <Kpi label="Vitals completed" value={stats.captured} symbol="✓" color="#15803D" bg="#F0FDF4" meta="Captured during today's shift"/>
        <Kpi label="Emergency cases" value={stats.emergency} symbol="!" color="#DC2626" bg="#FEF2F2" meta={emergency?'Priority review required':'No critical cases reported'}/>
        <Kpi label="Triage progress" value={`${completion}%`} symbol="↗" color="#0F766E" bg="#ECFDF5" meta={`${captured} of ${shiftTotal} patients completed`}/>
      </div>

      <div className="nurse-dashboard-grid">
        <section className="clinical-panel">
          <div className="clinical-panel-header">
            <div>
              <h3 style={{fontSize:16,fontWeight:800,color:'#172033'}}>Live triage queue</h3>
              <p style={{fontSize:12,color:'#8490A3',marginTop:4}}>Patients currently waiting for vitals assessment</p>
            </div>
            <button type="button" onClick={()=>nv('/nurse-triage')} style={{border:0,background:'none',color:'#0F766E',fontSize:12,fontWeight:800,cursor:'pointer'}}>View full queue →</button>
          </div>
          <div className="clinical-panel-body">
            {loading?(
              <div style={{padding:'34px 10px',textAlign:'center',color:'#8490A3',fontSize:13}}>Loading current queue...</div>
            ):queue.length===0?(
              <div style={{padding:'31px 15px',textAlign:'center'}}>
                <div style={{width:50,height:50,borderRadius:15,display:'grid',placeItems:'center',margin:'0 auto 13px',background:'#ECFDF5',color:'#0F766E',fontSize:23,fontWeight:800}}>✓</div>
                <h4 style={{fontSize:15,color:'#344056',marginBottom:5}}>Triage queue is clear</h4>
                <p style={{fontSize:12,color:'#8490A3',lineHeight:1.6}}>Newly registered patients awaiting vitals will appear here automatically.</p>
              </div>
            ):queue.slice(0,5).map((p,index)=>(
              <div className="queue-preview-row" key={p.patient_id||index}>
                <div style={{display:'flex',alignItems:'center',gap:11,minWidth:0}}>
                  <span className="patient-avatar">{(p.full_name||'P').charAt(0).toUpperCase()}</span>
                  <div style={{minWidth:0}}>
                    <p style={{fontSize:13,fontWeight:800,color:'#263247',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{p.full_name||'Unnamed patient'}</p>
                    <p style={{fontSize:10.5,color:'#8490A3',marginTop:3,fontFamily:'monospace'}}>{p.national_patient_id||`Patient #${p.patient_id}`}</p>
                  </div>
                </div>
                <div className="queue-preview-secondary">
                  <p style={{fontSize:10,color:'#9AA5B5',textTransform:'uppercase',fontWeight:700,letterSpacing:.5}}>Waiting</p>
                  <p style={{fontSize:12,fontWeight:700,color:'#56647A',marginTop:3}}>{waitLabel(p)}</p>
                </div>
                <div className="queue-preview-secondary"><Badge text={index===0?'Next':'Waiting'} color={index===0?'yellow':'gray'}/></div>
                <Btn onClick={()=>nv('/nurse-triage')} v={index===0?'blue':'ghost'} sz="sm">{index===0?'Start triage':'Open'}</Btn>
              </div>
            ))}
          </div>
        </section>

        <aside style={{display:'flex',flexDirection:'column',gap:18}}>
          <section className="clinical-panel">
            <div className="clinical-panel-header">
              <div>
                <h3 style={{fontSize:16,fontWeight:800,color:'#172033'}}>Quick actions</h3>
                <p style={{fontSize:12,color:'#8490A3',marginTop:4}}>Common nursing tasks</p>
              </div>
            </div>
            <div className="clinical-panel-body">
              <button type="button" className="quick-action-card" onClick={()=>setShowReg(true)}>
                <span className="nurse-icon-tile">+</span>
                <span><strong style={{display:'block',fontSize:13,color:'#263247'}}>Register new patient</strong><span style={{fontSize:11,color:'#8490A3',marginTop:3,display:'block'}}>Create a patient record</span></span>
                <span style={{marginLeft:'auto',color:'#0F766E'}}>→</span>
              </button>
              <button type="button" className="quick-action-card" onClick={()=>nv('/nurse-triage')}>
                <span className="nurse-icon-tile" style={{'--icon-bg':'#EFF6FF','--icon-color':'#2563EB'}}>✚</span>
                <span><strong style={{display:'block',fontSize:13,color:'#263247'}}>Capture patient vitals</strong><span style={{fontSize:11,color:'#8490A3',marginTop:3,display:'block'}}>Open the triage queue</span></span>
                <span style={{marginLeft:'auto',color:'#0F766E'}}>→</span>
              </button>
              <button type="button" className="quick-action-card" onClick={()=>nv('/nurse-patients')}>
                <span className="nurse-icon-tile" style={{'--icon-bg':'#F5F3FF','--icon-color':'#7C3AED'}}>◎</span>
                <span><strong style={{display:'block',fontSize:13,color:'#263247'}}>Find a patient</strong><span style={{fontSize:11,color:'#8490A3',marginTop:3,display:'block'}}>Search patient records</span></span>
                <span style={{marginLeft:'auto',color:'#0F766E'}}>→</span>
              </button>
            </div>
          </section>

          <section className="clinical-panel">
            <div className="clinical-panel-body">
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:12}}>
                <div>
                  <p style={{fontSize:10,fontWeight:800,color:'#8490A3',textTransform:'uppercase',letterSpacing:.7}}>Shift progress</p>
                  <h3 style={{fontSize:16,color:'#263247',marginTop:5}}>{shift}</h3>
                </div>
                <span style={{padding:'5px 9px',borderRadius:99,background:emergency?'#FEF2F2':'#ECFDF5',color:emergency?'#DC2626':'#0F766E',fontSize:10,fontWeight:800}}>{emergency?`${emergency} urgent`:'On track'}</span>
              </div>
              <div className="shift-progress-track"><div className="shift-progress-fill" style={{width:`${completion}%`}}/></div>
              <div style={{display:'flex',justifyContent:'space-between',fontSize:11,color:'#8490A3'}}>
                <span>{captured} completed</span><span>{waiting} remaining</span>
              </div>
            </div>
          </section>
        </aside>
      </div>

      <Modal open={showReg} onClose={()=>setShowReg(false)} title="Register New Patient" width={520}>
        <MB>
          <div className="form-grid-2">
            <Field label="First Name" required><input value={f.fn} onChange={e=>setF({...f,fn:e.target.value})} placeholder="e.g. Kwame" style={inp}/></Field>
            <Field label="Last Name"  required><input value={f.ln} onChange={e=>setF({...f,ln:e.target.value})} placeholder="e.g. Mensah" style={inp}/></Field>
          </div>
          <Field label="Email (optional)"><input type="email" value={f.email} onChange={e=>setF({...f,email:e.target.value})} placeholder="e.g. kwame@email.com" style={inp}/></Field>
          <div className="form-grid-2">
            <Field label="Date of Birth (DD/MM/YYYY)"><input value={f.dob} onChange={e=>setF({...f,dob:e.target.value})} placeholder="e.g. 12/05/1990" style={inp}/></Field>
            <Field label="Phone"><input value={f.phone} onChange={e=>setF({...f,phone:e.target.value})} placeholder="e.g. 0244123456" style={inp}/></Field>
          </div>
          <div className="form-grid-2">
            <Field label="Gender">
              <select value={f.gender} onChange={e=>setF({...f,gender:e.target.value})} style={{...inp,color:f.gender?'#0F172A':'#94A3B8'}}>
                <option value="">Select...</option><option>Male</option><option>Female</option><option>Other</option>
              </select>
            </Field>
            <Field label="Registration Date (DD/MM/YYYY)"><input value={f.regDate} onChange={e=>setF({...f,regDate:e.target.value})} placeholder="e.g. 26/05/2026" style={inp}/></Field>
          </div>
        </MB>
        <MF>
          <Btn onClick={()=>setShowReg(false)} v="ghost">Cancel</Btn>
          <Btn onClick={register} disabled={sub} v="blue">{sub?'Registering...':'Register Patient'}</Btn>
        </MF>
      </Modal>
    </AL>
  );
};

const NursePageIntro=({kicker,title,description,children})=>(
  <section className="nurse-page-intro">
    <div>
      <p className="nurse-page-kicker">{kicker}</p>
      <h2>{title}</h2>
      <p>{description}</p>
    </div>
    {children&&<div className="nurse-page-actions">{children}</div>}
  </section>
);

const NurseMiniStat=({symbol,value,label,color='#0F766E',bg='#ECFDF5'})=>(
  <div className="nurse-mini-stat">
    <span className="nurse-icon-tile" style={{'--icon-bg':bg,'--icon-color':color,width:35,height:35,fontSize:15}}>{symbol}</span>
    <div><p className="nurse-mini-value" style={{color}}>{value}</p><p className="nurse-mini-label">{label}</p></div>
  </div>
);

const NurseEmptyState=({symbol='✓',title,description,children})=>(
  <div className="nurse-empty-state">
    <div className="nurse-empty-icon">{symbol}</div>
    <h3 style={{fontSize:16,color:'#263247',marginBottom:6}}>{title}</h3>
    <p style={{fontSize:12.5,color:'#8490A3',lineHeight:1.65,maxWidth:470,margin:'0 auto'}}>{description}</p>
    {children&&<div style={{display:'flex',justifyContent:'center',gap:9,marginTop:17,flexWrap:'wrap'}}>{children}</div>}
  </div>
);

const NursePatients=()=>{
  const nv=useNavigate();
  const toast=useToast();
  const [search,setSearch]=React.useState('');
  const [filter,setFilter]=React.useState('all');
  const {patients,counts,total,loading,searching,error,refresh}=usePatientRegistrySearch(search,filter);

  const readmit=async(p)=>{
    const r=await fetch(`${BASE_URL}/api/patients/${p.patient_id}/status`,{method:'PATCH',headers:ah(),body:JSON.stringify({
  status:'waiting',
  registration_date: new Date().toISOString().split('T')[0]})});
    if(r.ok){refresh();toast.show(`${p.full_name||'Patient'} added to triage queue.`);}
    else toast.show('Failed.','error');
  };

  const statusOf=p=>(p.status||'active').toLowerCase();

  return(
    <AL nav={nurseNav} title="Patient Registry" searchText={search} setSearchText={setSearch}
      searchBusy={searching} searchPlaceholder="Name, ID, phone, diagnosis...">
      <Toast {...toast}/>
      <NursePageIntro kicker="Records & admissions" title="Manage the patient registry"
        description="Search the full hospital record by patient details or historical clinical information, then review or re-admit the patient.">
        <Btn onClick={refresh} v="ghost">↻ Refresh records</Btn>
        <Btn onClick={()=>nv('/nurse-triage')} v="ghost">Open triage queue →</Btn>
      </NursePageIntro>
      <div className="nurse-mini-stats">
        <NurseMiniStat symbol="◎" value={loading?'—':counts.all} label={search?'Matching patient records':'Total patient records'}/>
        <NurseMiniStat symbol="✓" value={loading?'—':counts.active} label="Active patients" color="#15803D" bg="#F0FDF4"/>
        <NurseMiniStat symbol="◷" value={loading?'—':counts.waiting} label="Awaiting triage" color="#B45309" bg="#FFFBEB"/>
        <NurseMiniStat symbol="—" value={loading?'—':counts.inactive} label="Inactive records" color="#64748B" bg="#F1F5F9"/>
      </div>
      <div className="nurse-toolbar">
        <div className="filter-pills" aria-label="Filter patients by status">
          {[
            ['all','All patients',counts.all],
            ['active','Active',counts.active],
            ['waiting','Waiting',counts.waiting],
            ['inactive','Inactive',counts.inactive]
          ].map(([value,label,count])=>(
            <button type="button" key={value} onClick={()=>setFilter(value)} className={`filter-pill${filter===value?' is-active':''}`}>{label} · {count}</button>
          ))}
        </div>
        <p style={{fontSize:11,color:'#8490A3'}}>{searching?'Searching hospital records…':`${total} record${total===1?'':'s'} found`}</p>
      </div>
      {error?<NurseEmptyState symbol="!" title="Patient search unavailable" description={error}><Btn onClick={refresh} v="ghost">Try again</Btn></NurseEmptyState>:
       loading?<div className="clinical-panel"><p style={{textAlign:'center',padding:45,color:'#94A3B8'}}>Loading patient registry...</p></div>:
        <Table cols={[
          {key:'name',label:'Patient',     w:'25%'},
          {key:'id',  label:'Patient ID',  w:'12%'},
          {key:'history',label:'Latest Clinical Context',w:'29%'},
          {key:'stat',label:'Status',      w:'12%'},
          {key:'act', label:'Actions',     w:'22%'},
        ]} rows={patients.map(p=>({
          name:<div className="patient-name-cell">
            <span className="patient-avatar">{(p.full_name||'P').charAt(0).toUpperCase()}</span>
            <div><span style={{fontWeight:800,color:'#172033'}}>{p.full_name||'Unnamed patient'}</span><span style={{fontSize:10.5,color:'#8490A3',display:'block',marginTop:2}}>{p.phone||'No phone'} · {fmtDate(p.date_of_birth)}</span></div>
          </div>,
          id:  <span style={{color:'#64748B',fontFamily:'monospace',fontSize:13}}>{p.national_patient_id||p.patient_id}</span>,
          history:<div><span style={{fontWeight:700,color:'#344056',fontSize:12.5}}>{p.last_visit_date?fmtDate(p.last_visit_date):'No clinical encounters'}</span><span style={{fontSize:10.5,color:'#8490A3',display:'block',marginTop:3}}>{p.last_diagnosis||p.last_chief_complaint||p.last_medication||'No diagnosis or medication recorded'}{p.last_doctor_name?` · ${p.last_doctor_name}`:''}</span></div>,
          stat:statusBadge(p.status||'active'),
          act: <div style={{display:'flex',gap:8}}>
            <Btn onClick={()=>nv('/nurse-patient-profile',{state:{patientId:p.patient_id}})} v="ghost" sz="sm">View record</Btn>
            {statusOf(p)!=='waiting'&&<Btn onClick={()=>readmit(p)} v="outline" sz="sm">Re-admit</Btn>}
          </div>
        }))} empty={search||filter!=='all'?'No patients match this search and status filter.':'No patient records found.'}/>
      }
    </AL>
  );
};

const NurseTriage=()=>{
  const nv=useNavigate();
  const toast=useToast();
  const [queue,setQueue]=React.useState([]);
  const [loading,setLoading]=React.useState(true);
  const [sel,setSel]=React.useState(null);
  const [removeSel,setRemoveSel]=React.useState(null);
  const [v,setV]=React.useState({temp:'',weight:'',bp:'',hr:'',chief:''});
  const [sub,setSub]=React.useState(false);

  const load=()=>{
    setLoading(true);
    fetch(`${BASE_URL}/api/patients/triage/queue`,{headers:ah()})
      .then(r=>r.json()).then(d=>setQueue(Array.isArray(d)?d:[]))
      .catch(()=>setQueue([])).finally(()=>setLoading(false));
  };
  React.useEffect(load,[]);

  const saveVitals=async()=>{
    if(!v.bp||!v.hr){toast.show('Blood pressure and heart rate are required.','error');return;}
    setSub(true);
    try{
      const r1=await fetch(`${BASE_URL}/api/medical-records`,{method:'POST',headers:ah(),
        body:JSON.stringify({patient_id:sel.patient_id,temperature:v.temp,weight:v.weight,
          blood_pressure:v.bp,pulse_rate:v.hr,chief_complaint:v.chief})});
      if(r1.ok){
        await fetch(`${BASE_URL}/api/patients/${sel.patient_id}/status`,{method:'PATCH',headers:ah(),body:JSON.stringify({status:'active'})});
        toast.show(`${sel.full_name} sent to doctor queue.`);
        setSel(null);setV({temp:'',weight:'',bp:'',hr:'',chief:''});load();
      }else toast.show('Failed to save vitals.','error');
    }catch{toast.show('Network error.','error');}finally{setSub(false);}
  };

  const waitMinutes=p=>{
    const date=new Date(p.registration_date||p.created_at);
    if(Number.isNaN(date.getTime()))return 0;
    return Math.max(0,Math.floor((Date.now()-date.getTime())/60000));
  };
  const avgWait=queue.length?Math.round(queue.reduce((sum,p)=>sum+waitMinutes(p),0)/queue.length):0;
  const longestWait=queue.length?Math.max(...queue.map(waitMinutes)):0;
  const formatWait=mins=>mins<1?'Just arrived':mins<60?`${mins} min`:`${Math.floor(mins/60)}h ${mins%60}m`;
  const remove=async p=>{
    try{
      const r=await fetch(`${BASE_URL}/api/patients/${p.patient_id}/status`,{method:'PATCH',headers:ah(),body:JSON.stringify({status:'inactive'})});
      if(r.ok){setQueue(prev=>prev.filter(x=>x.patient_id!==p.patient_id));toast.show('Patient removed from the triage queue.');}
      else toast.show('Unable to remove patient.','error');
    }catch{toast.show('Network error.','error');}
    setRemoveSel(null);
  };

  return(
    <AL nav={nurseNav} title="Triage & Vitals Queue">
      <Toast {...toast}/>
      <NursePageIntro kicker="Clinical intake" title="Assess, record and route"
        description="Work through the waiting list, capture essential observations, and safely send each patient to the doctor queue.">
        <Btn onClick={()=>load()} v="ghost">↻ Refresh queue</Btn>
        <Btn onClick={()=>nv('/nurse-patients')} v="blue">Find patient</Btn>
      </NursePageIntro>

      <div className="nurse-mini-stats">
        <NurseMiniStat symbol="◷" value={loading?'—':queue.length} label="Waiting for assessment" color="#B45309" bg="#FFFBEB"/>
        <NurseMiniStat symbol="≈" value={loading?'—':`${avgWait}m`} label="Average waiting time" color="#2563EB" bg="#EFF6FF"/>
        <NurseMiniStat symbol="!" value={loading?'—':`${longestWait}m`} label="Longest current wait" color={longestWait>30?'#DC2626':'#0F766E'} bg={longestWait>30?'#FEF2F2':'#ECFDF5'}/>
        <NurseMiniStat symbol="→" value="Doctor" label="Next stage of care" color="#7C3AED" bg="#F5F3FF"/>
      </div>

      <div className="workflow-strip" aria-label="Triage workflow">
        <div className="workflow-step"><span className="workflow-number">01</span><div><strong style={{fontSize:12,color:'#263247'}}>Select patient</strong><span style={{display:'block',fontSize:10.5,color:'#8490A3',marginTop:3}}>Prioritise by waiting time</span></div></div>
        <div className="workflow-step"><span className="workflow-number">02</span><div><strong style={{fontSize:12,color:'#263247'}}>Capture vitals</strong><span style={{display:'block',fontSize:10.5,color:'#8490A3',marginTop:3}}>Record observations and complaint</span></div></div>
        <div className="workflow-step"><span className="workflow-number">03</span><div><strong style={{fontSize:12,color:'#263247'}}>Send to doctor</strong><span style={{display:'block',fontSize:10.5,color:'#8490A3',marginTop:3}}>Complete clinical handoff</span></div></div>
      </div>

      {!loading&&longestWait>30&&(
        <div className="queue-alert">
          <div><strong style={{display:'block',fontSize:12.5,color:'#92400E'}}>Waiting-time attention required</strong><span style={{fontSize:11.5,color:'#B45309',marginTop:3,display:'block'}}>At least one patient has waited longer than 30 minutes. Consider assessing them next.</span></div>
          <Badge text={`${formatWait(longestWait)} longest wait`} color="yellow"/>
        </div>
      )}

      {loading?<div className="clinical-panel"><p style={{textAlign:'center',padding:45,color:'#94A3B8'}}>Loading current triage queue...</p></div>:
       queue.length===0?(
        <NurseEmptyState symbol="✓" title="The triage queue is clear"
          description="There are no patients waiting for vitals. Re-admitted and newly registered patients will appear here automatically.">
          <Btn onClick={()=>nv('/nurse-patients')} v="ghost">Open patient registry</Btn>
          <Btn onClick={()=>nv('/nurse-dashboard')} v="blue">Return to dashboard</Btn>
        </NurseEmptyState>
       ):
        <Table cols={[
          {key:'name', label:'Patient',          w:'26%'},
          {key:'id',   label:'Patient ID',       w:'14%'},
          {key:'reg',  label:'Arrival',          w:'17%'},
          {key:'wait', label:'Waiting Time',     w:'15%'},
          {key:'stat', label:'Priority',         w:'12%'},
          {key:'act',  label:'Action',           w:'16%'},
        ]} rows={queue.map(p=>({
          name:<div className="patient-name-cell"><span className="patient-avatar">{(p.full_name||'P').charAt(0).toUpperCase()}</span><div><span style={{fontWeight:800,color:'#172033'}}>{p.full_name||'Unnamed patient'}</span><span style={{fontSize:10.5,color:'#8490A3',display:'block',marginTop:2}}>{p.gender||'Gender not recorded'}</span></div></div>,
          id:  <span style={{color:'#64748B',fontFamily:'monospace',fontSize:13}}>{p.national_patient_id||p.patient_id}</span>,
          reg: <span style={{color:'#64748B'}}>{fmtArrival(p.registration_date)}</span>,
          wait:<span style={{fontWeight:700,color:waitMinutes(p)>30?'#DC2626':'#56647A'}}>{formatWait(waitMinutes(p))}</span>,
          stat:<Badge text={waitMinutes(p)>30?'Review next':'Waiting'} color={waitMinutes(p)>30?'red':'yellow'}/>,
          act:<div style={{display:'flex',gap:7}}>
            <Btn onClick={()=>setSel(p)} v="blue" sz="sm">Start</Btn>
            <Btn onClick={()=>setRemoveSel(p)} v="ghost" sz="sm">Remove</Btn>
          </div>
        }))} empty="No patients in triage queue."/>
      }
      <Modal open={!!sel} onClose={()=>{setSel(null);setV({temp:'',weight:'',bp:'',hr:'',chief:''}); }} title={`Record Vitals — ${sel?.full_name||''}`} width={500}>
        <MB>
          <div className="vitals-patient-card">
            <span className="patient-avatar">{(sel?.full_name||'P').charAt(0).toUpperCase()}</span>
            <div><strong style={{display:'block',fontSize:13,color:'#134E4A'}}>{sel?.full_name||'Unnamed patient'}</strong><span style={{fontSize:11,color:'#5F7C78',marginTop:2,display:'block'}}>Patient ID: {sel?.national_patient_id||sel?.patient_id}</span></div>
          </div>
          <div>
            <p style={{fontSize:10,fontWeight:800,color:'#8490A3',textTransform:'uppercase',letterSpacing:.7,marginBottom:11}}>Clinical observations</p>
            <div className="form-grid-2">
              <Field label="Temperature (°C)"><input inputMode="decimal" value={v.temp} onChange={e=>setV({...v,temp:e.target.value})} placeholder="e.g. 36.8" style={inp}/></Field>
              <Field label="Weight (kg)"><input inputMode="decimal" value={v.weight} onChange={e=>setV({...v,weight:e.target.value})} placeholder="e.g. 70" style={inp}/></Field>
              <Field label="Blood Pressure (mmHg)" required><input value={v.bp} onChange={e=>setV({...v,bp:e.target.value})} placeholder="e.g. 120/80" style={inp}/></Field>
              <Field label="Heart Rate (BPM)" required><input inputMode="numeric" value={v.hr} onChange={e=>setV({...v,hr:e.target.value})} placeholder="e.g. 72" style={inp}/></Field>
            </div>
          </div>
          <Field label="Chief Complaint / Reason for Visit">
            <textarea value={v.chief} onChange={e=>setV({...v,chief:e.target.value})}
              placeholder="e.g. Patient complains of persistent headache and fever for 3 days..."
              style={{...inp,height:90,resize:'none'}}/>
          </Field>
        </MB>
        <MF>
          <Btn onClick={()=>{setSel(null);setV({temp:'',weight:'',bp:'',hr:'',chief:''}); }} v="ghost">Cancel</Btn>
          <Btn onClick={saveVitals} disabled={sub} v="green">{sub?'Saving...':'Save & Send to Doctor'}</Btn>
        </MF>
      </Modal>
      <Modal open={!!removeSel} onClose={()=>setRemoveSel(null)} title="Remove from triage queue?" width={430}>
        <MB>
          <div style={{padding:'14px 16px',backgroundColor:'#FEF2F2',borderRadius:12,border:'1px solid #FECACA',fontSize:13,color:'#7F1D1D',lineHeight:1.65}}>
            <strong>{removeSel?.full_name||'This patient'}</strong> will be removed from the queue and marked inactive.
          </div>
          <p style={{fontSize:12,color:'#68758A',lineHeight:1.6}}>The patient can be re-admitted later from the Patient Registry.</p>
        </MB>
        <MF>
          <Btn onClick={()=>setRemoveSel(null)} v="ghost">Cancel</Btn>
          <Btn onClick={()=>remove(removeSel)} v="danger">Remove patient</Btn>
        </MF>
      </Modal>
    </AL>
  );
};

/* ── FIX: NurseSchedule — dismiss nameless/stuck patients ── */
const NurseSchedule=()=>{
  const nv=useNavigate();
  const toast=useToast();
  const [queue,setQueue]=React.useState([]);
  const [loading,setLoading]=React.useState(true);
  const [showConfirm,setShowConfirm]=React.useState(null);

  const load=()=>{
    setLoading(true);
    fetch(`${BASE_URL}/api/patients/triage/queue`,{headers:ah()})
      .then(r=>r.json()).then(d=>setQueue(Array.isArray(d)?d:[]))
      .catch(()=>{}).finally(()=>setLoading(false));
  };
  React.useEffect(load,[]);

  // Remove a patient from the queue by setting their status to inactive
  const dismiss=async(p)=>{
    try{
      const r=await fetch(`${BASE_URL}/api/patients/${p.patient_id}/status`,{method:'PATCH',headers:ah(),
        body:JSON.stringify({status:'inactive'})});
      if(r.ok){
        setQueue(prev=>prev.filter(x=>x.patient_id!==p.patient_id));
        toast.show('Patient removed from queue.');
      } else toast.show('Failed to remove patient.','error');
    } catch{ toast.show('Network error.','error'); }
    setShowConfirm(null);
  };

  const waitMinutes=p=>{
    const date=new Date(p.registration_date||p.created_at);
    if(Number.isNaN(date.getTime()))return 0;
    return Math.max(0,Math.floor((Date.now()-date.getTime())/60000));
  };
  const formatWait=mins=>mins<1?'Just arrived':mins<60?`${mins} min`:`${Math.floor(mins/60)}h ${mins%60}m`;
  const longestWait=queue.length?Math.max(...queue.map(waitMinutes)):0;
  const recent=queue.filter(p=>waitMinutes(p)<=60).length;
  const hour=new Date().getHours();
  const shift=hour<14?'Morning':hour<20?'Afternoon':'Night';

  return(
    <AL nav={nurseNav} title="Nursing Queue Board">
      <Toast {...toast}/>
      <NursePageIntro kicker="Shift coordination" title={`${shift} shift queue`}
        description="Monitor patients entering the nursing workflow and keep the waiting list moving in the right order.">
        <Btn onClick={load} v="ghost">↻ Refresh board</Btn>
        <Btn onClick={()=>nv('/nurse-triage')} v="blue">Open triage →</Btn>
      </NursePageIntro>

      <div className="nurse-mini-stats">
        <NurseMiniStat symbol="◷" value={loading?'—':queue.length} label="Total waiting" color="#B45309" bg="#FFFBEB"/>
        <NurseMiniStat symbol="+" value={loading?'—':recent} label="Arrived within 1 hour" color="#2563EB" bg="#EFF6FF"/>
        <NurseMiniStat symbol="!" value={loading?'—':formatWait(longestWait)} label="Longest waiting time" color={longestWait>30?'#DC2626':'#0F766E'} bg={longestWait>30?'#FEF2F2':'#ECFDF5'}/>
        <NurseMiniStat symbol="→" value="Vitals" label="Current workflow stage" color="#7C3AED" bg="#F5F3FF"/>
      </div>

      {!loading&&queue.length>0&&(
        <div className="queue-alert" style={longestWait>30?undefined:{background:'#F0FDFA',borderColor:'#CCFBF1'}}>
          <div>
            <strong style={{display:'block',fontSize:12.5,color:longestWait>30?'#92400E':'#115E59'}}>{longestWait>30?'Queue needs attention':'Patient flow is on track'}</strong>
            <span style={{fontSize:11.5,color:longestWait>30?'#B45309':'#0F766E',marginTop:3,display:'block'}}>{longestWait>30?'Prioritise the longest-waiting patient to reduce delays.':'All current patients have been waiting for 30 minutes or less.'}</span>
          </div>
          <Badge text={`${queue.length} in queue`} color={longestWait>30?'yellow':'green'}/>
        </div>
      )}

      {loading?<div className="clinical-panel"><p style={{textAlign:'center',padding:45,color:'#94A3B8'}}>Loading the shift queue...</p></div>:
       queue.length===0?(
        <NurseEmptyState symbol="◷" title="No patients are waiting"
          description="The queue is clear for this shift. Patients who are registered or re-admitted will appear here automatically.">
          <Btn onClick={()=>nv('/nurse-patients')} v="ghost">Open patient registry</Btn>
          <Btn onClick={()=>nv('/nurse-dashboard')} v="blue">Return to dashboard</Btn>
        </NurseEmptyState>
       ):
        <Table cols={[
          {key:'pos', label:'Queue',        w:'8%'},
          {key:'name',label:'Patient',      w:'25%'},
          {key:'id',  label:'Patient ID',   w:'14%'},
          {key:'reg', label:'Arrival',      w:'15%'},
          {key:'wait',label:'Waiting',      w:'14%'},
          {key:'stat',label:'Stage',        w:'12%'},
          {key:'act', label:'Actions',      w:'12%'},
        ]} rows={queue.map(p=>({
          pos:<span style={{width:28,height:28,borderRadius:9,display:'grid',placeItems:'center',background:'#F1F5F9',color:'#56647A',fontSize:11,fontWeight:800}}>{queue.indexOf(p)+1}</span>,
          name:<div className="patient-name-cell"><span className="patient-avatar">{(p.full_name||'P').charAt(0).toUpperCase()}</span><div><span style={{fontWeight:800,color:p.full_name?'#172033':'#8490A3'}}>{p.full_name||'Unnamed patient'}</span><span style={{fontSize:10.5,color:'#8490A3',display:'block',marginTop:2}}>{p.gender||'Patient record'}</span></div></div>,
          id:  <span style={{color:'#64748B',fontFamily:'monospace',fontSize:13}}>{p.national_patient_id||p.patient_id||'—'}</span>,
          reg: <span style={{color:'#64748B'}}>{fmtArrival(p.registration_date)}</span>,
          wait:<span style={{fontWeight:700,color:waitMinutes(p)>30?'#DC2626':'#56647A'}}>{formatWait(waitMinutes(p))}</span>,
          stat:<Badge text="Awaiting vitals" color="yellow"/>,
          act: <div style={{display:'flex',gap:8}}>
            <Btn onClick={()=>nv('/nurse-triage')} v="blue" sz="sm">Triage</Btn>
            <Btn onClick={()=>setShowConfirm(p)} v="ghost" sz="sm">Remove</Btn>
          </div>
        }))} empty="No patients in queue."/>
      }

      <Modal open={!!showConfirm} onClose={()=>setShowConfirm(null)} title="Remove from Queue?" width={420}>
        <MB>
          <div style={{padding:'14px 16px',backgroundColor:'#FEF2F2',borderRadius:12,border:'1px solid #FECACA',fontSize:13,color:'#7F1D1D',lineHeight:1.65}}>
            {showConfirm?.full_name
              ? <>You are about to remove <strong>{showConfirm.full_name}</strong> (ID: {showConfirm.national_patient_id||showConfirm.patient_id}) from the triage queue. Their status will be set to <strong>Inactive</strong>.</>
              : <>This patient has no name on record (ID: {showConfirm?.national_patient_id||showConfirm?.patient_id}). Removing them will set their status to <strong>Inactive</strong>.</>
            }
          </div>
          <p style={{fontSize:12,color:'#64748B',lineHeight:1.6}}>You can re-admit this patient later from the Patient Registry if needed.</p>
        </MB>
        <MF>
          <Btn onClick={()=>setShowConfirm(null)} v="ghost">Cancel</Btn>
          <Btn onClick={()=>dismiss(showConfirm)} v="danger">Remove patient</Btn>
        </MF>
      </Modal>
    </AL>
  );
};

const ClinicalPatientProfile=({mode,nav})=>{
  const nv=useNavigate();
  const loc=useLocation();
  const {patientId}=loc.state||{};
  const [data,setData]=React.useState(null);
  const [loading,setLoading]=React.useState(true);
  const [tab,setTab]=React.useState('summary');
  const isDoctor=mode==='doctor';

  React.useEffect(()=>{
    if(!patientId){setLoading(false);return;}
    fetch(`${BASE_URL}/api/patients/${patientId}/full`,{headers:ah()})
      .then(r=>r.json()).then(d=>setData(d)).catch(()=>{}).finally(()=>setLoading(false));
  },[patientId]);

  const title=isDoctor?'Patient Record':'Patient Profile';
  if(loading)return<AL nav={nav} title={title}><div className="clinical-panel"><p style={{textAlign:'center',padding:60,color:'#94A3B8'}}>Loading patient record...</p></div></AL>;
  if(!data)return<AL nav={nav} title={title}><NurseEmptyState symbol="!" title={patientId?'Patient record unavailable':'No patient selected'} description={patientId?'The requested patient record could not be loaded.':'Return to the patient list and select a patient to open their profile.'}><Btn onClick={()=>nv(-1)} v="ghost">← Return</Btn></NurseEmptyState></AL>;

  const pt=data.patient||data||{};
  const {recs,vit}=extractVitalsAndRecords(data);
  const presc=data.prescriptions||[];
  const labs=data.lab_results||[];
  const encounters=data.encounters||[];
  const latest=recs[0]||{};
  const tabs=isDoctor?[
    {key:'summary',label:'Clinical summary',count:null},
    {key:'history',label:'Visit timeline',count:encounters.length},
    {key:'labs',label:'Lab results',count:labs.length},
    {key:'prescriptions',label:'Prescriptions',count:presc.length},
  ]:[
    {key:'summary',label:'Patient overview',count:null},
    {key:'history',label:'Visit timeline',count:encounters.length},
  ];
  const vitalItems=[
    {label:'Blood pressure',value:vit.blood_pressure||'—',unit:'mmHg',symbol:'BP',color:'#15803D',bg:'#F0FDF4'},
    {label:'Heart rate',value:vit.pulse_rate||'—',unit:'bpm',symbol:'HR',color:'#2563EB',bg:'#EFF6FF'},
    {label:'Temperature',value:vit.temperature||'—',unit:'°C',symbol:'T',color:'#B45309',bg:'#FFFBEB'},
    {label:'Weight',value:vit.weight||'—',unit:'kg',symbol:'W',color:'#7C3AED',bg:'#F5F3FF'},
  ];

  return(
    <AL nav={nav} title={title}>
      <section className="consult-patient-banner" style={{background:isDoctor?'radial-gradient(circle at 88% 10%,rgba(96,165,250,.25),transparent 24%),linear-gradient(135deg,#111C31,#193B68 70%,#3730A3 145%)':'radial-gradient(circle at 88% 10%,rgba(45,212,191,.24),transparent 24%),linear-gradient(135deg,#102237,#12504E 78%,#0F766E 145%)'}}>
        <div className="consult-banner-content" style={{display:'flex',alignItems:'center',gap:14}}>
          <span style={{width:48,height:48,borderRadius:15,display:'grid',placeItems:'center',background:'rgba(255,255,255,.12)',border:'1px solid rgba(255,255,255,.12)',fontSize:19,fontWeight:800,color:'#fff'}}>{(pt.full_name||'P').charAt(0).toUpperCase()}</span>
          <div>
            <p style={{fontSize:10.5,fontWeight:800,letterSpacing:'.1em',textTransform:'uppercase',color:isDoctor?'#93C5FD':'#99F6E4',marginBottom:5}}>Patient record</p>
            <h2 style={{fontSize:22,fontWeight:800,color:'#fff',marginBottom:5}}>{pt.full_name||'Unnamed patient'}</h2>
            <p style={{color:'rgba(255,255,255,.62)',fontSize:12.5}}>
              {pt.national_patient_id||pt.patient_id||'No ID'} · {pt.gender||'Gender not recorded'} · {pt.date_of_birth?`Age ${calcAge(pt.date_of_birth)}`:'Age not recorded'}
            </p>
          </div>
        </div>
        <div className="consult-banner-actions">
          {statusBadge(pt.status||'active')}
          <Btn onClick={()=>nv(-1)} v="ghost" sz="sm">← Back</Btn>
          {isDoctor&&<Btn onClick={()=>nv('/doctor-consultation',{state:{patientId}})} v="blue" sz="sm">Open consultation →</Btn>}
        </div>
      </section>

      <div className="consult-vitals-grid">
        {vitalItems.map(item=>(
          <div className="consult-vital-card" key={item.label}>
            <span className="nurse-icon-tile" style={{'--icon-bg':item.bg,'--icon-color':item.color}}>{item.symbol}</span>
            <div>
              <p className="consult-vital-label">{item.label}</p>
              <p className="consult-vital-value" style={{color:item.value==='—'?'#94A3B8':'#263247'}}>{item.value} <span style={{fontSize:10.5,color:'#94A3B8'}}>{item.unit}</span></p>
            </div>
          </div>
        ))}
      </div>

      <section className="clinical-panel">
        <div className="clinical-panel-header">
          <div>
            <h3 style={{fontSize:17,color:'#1E293B'}}>{isDoctor?'Longitudinal clinical record':'Nursing patient record'}</h3>
            <p style={{fontSize:12.5,color:'#8490A3',marginTop:4}}>{isDoctor?'Review clinical history, investigations, and medication orders before consultation.':'Review the latest observations, patient details, and documented care history.'}</p>
          </div>
          <div className="filter-pills" role="tablist" aria-label="Patient record sections">
            {tabs.map(item=>(
              <button key={item.key} role="tab" aria-selected={tab===item.key} className={`filter-pill ${tab===item.key?'is-active':''}`} onClick={()=>setTab(item.key)}>
                {item.label}{item.count!==null?` · ${item.count}`:''}
              </button>
            ))}
          </div>
        </div>
        <div style={{padding:18}}>
          {tab==='summary'&&(
            <div className="nurse-dashboard-grid">
              <div style={{display:'grid',gap:14}}>
                <div className="consult-card" style={{boxShadow:'none'}}>
                  <div className="consult-section-heading"><div><h3>Current presentation</h3><p>Latest reason for visit and documented assessment.</p></div>{latest.created_at&&<Badge text={fmtDate(latest.created_at)} color="blue"/>}</div>
                  <div className="form-grid-2">
                    <div style={{padding:'13px 14px',borderRadius:12,background:'#F8FAFC',border:'1px solid #E5EAF1'}}>
                      <p style={{fontSize:10.5,fontWeight:800,textTransform:'uppercase',letterSpacing:'.08em',color:'#8490A3',marginBottom:6}}>Chief complaint</p>
                      <p style={{fontSize:13.5,color:'#344056',lineHeight:1.55}}>{vit.chief_complaint||latest.chief_complaint||'Not recorded'}</p>
                    </div>
                    <div style={{padding:'13px 14px',borderRadius:12,background:'#EFF6FF',border:'1px solid #DBEAFE'}}>
                      <p style={{fontSize:10.5,fontWeight:800,textTransform:'uppercase',letterSpacing:'.08em',color:'#64748B',marginBottom:6}}>Primary diagnosis</p>
                      <p style={{fontSize:13.5,fontWeight:750,color:'#1E3A8A',lineHeight:1.55}}>{latest.diagnosis||'Not documented'}</p>
                    </div>
                  </div>
                </div>
                <div className="consult-card" style={{boxShadow:'none'}}>
                  <div className="consult-section-heading"><div><h3>Clinical notes</h3><p>Most recent observations shared by the care team.</p></div></div>
                  <p style={{fontSize:13,color:'#64748B',lineHeight:1.75}}>{latest.clinical_notes||latest.notes||'No clinical notes have been recorded for the latest visit.'}</p>
                </div>
              </div>

              <div className="consult-card" style={{boxShadow:'none'}}>
                <div className="consult-section-heading"><div><h3>Patient details</h3><p>Demographic and contact information.</p></div></div>
                {[
                  ['Date of birth',fmtDate(pt.date_of_birth)],
                  ['Age',pt.date_of_birth?`${calcAge(pt.date_of_birth)} years`:'Not recorded'],
                  ['Gender',pt.gender||'Not recorded'],
                  ['Phone',pt.phone||'Not recorded'],
                  ['Email',pt.email||'Not recorded'],
                  ['Patient ID',pt.national_patient_id||pt.patient_id||'Not recorded'],
                ].map(([label,value])=>(
                  <div key={label} style={{padding:'10px 0',borderBottom:'1px solid #EEF2F6',display:'flex',justifyContent:'space-between',gap:16}}>
                    <span style={{fontSize:11.5,color:'#8490A3'}}>{label}</span><strong style={{fontSize:11.8,color:'#475569',textAlign:'right'}}>{value}</strong>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab==='history'&&(encounters.length===0?
            <NurseEmptyState symbol="≡" title="No documented visit history" description="Each hospital encounter will appear here with its clinician, assessment, laboratory work, and medications."/>:
            <div className="encounter-timeline">
              {encounters.map(encounter=>{
                const record=encounter.medical_records?.[0]||{};
                const medicines=encounter.prescriptions||[];
                const requests=encounter.lab_requests||[];
                const completed=['completed','cancelled'].includes(encounter.status);
                return(
                  <article className="encounter-card" key={encounter.encounter_id}>
                    <div style={{display:'flex',justifyContent:'space-between',gap:14,alignItems:'flex-start',flexWrap:'wrap'}}>
                      <div>
                        <p style={{fontSize:10,fontWeight:800,color:'#0F766E',textTransform:'uppercase',letterSpacing:'.08em'}}>{encounter.encounter_number||`Visit ${encounter.encounter_id}`}</p>
                        <h4 style={{fontSize:15,color:'#263247',marginTop:5}}>{fmtDate(encounter.opened_at)} <span style={{fontSize:11,fontFamily:'DM Sans',fontWeight:600,color:'#8490A3'}}>at {fmtTime(encounter.opened_at)}</span></h4>
                        <p style={{fontSize:11.5,color:'#64748B',marginTop:4}}>{encounter.doctor_name?`Attending clinician: ${encounter.doctor_name}`:'Attending clinician not yet assigned'}</p>
                      </div>
                      <div style={{display:'flex',gap:7,alignItems:'center'}}>
                        <Badge text={(encounter.encounter_type||'walk_in').replaceAll('_',' ')} color="blue"/>
                        {statusBadge(encounter.status||'registered')}
                      </div>
                    </div>
                    <div className="encounter-card-grid">
                      <div className="encounter-detail">
                        <p className="encounter-detail-label">Presentation & diagnosis</p>
                        <p className="encounter-detail-value"><strong style={{color:'#344056'}}>{encounter.chief_complaint||record.chief_complaint||'Reason not recorded'}</strong><br/>{record.diagnosis||(!completed?'Assessment in progress':'No diagnosis recorded')}</p>
                      </div>
                      <div className="encounter-detail">
                        <p className="encounter-detail-label">Medications</p>
                        <p className="encounter-detail-value">{medicines.length?medicines.map(item=>item.medication_name).join(', '):'No medication ordered for this visit'}</p>
                      </div>
                      <div className="encounter-detail">
                        <p className="encounter-detail-label">Investigations</p>
                        <p className="encounter-detail-value">{requests.length?requests.map(item=>`${item.test_type} (${item.status})`).join(', '):'No laboratory tests requested'}</p>
                      </div>
                    </div>
                    {(record.notes||record.clinical_notes||encounter.disposition)&&<p style={{fontSize:11.5,color:'#64748B',lineHeight:1.65,marginTop:11,paddingTop:11,borderTop:'1px solid #EEF2F6'}}>{record.clinical_notes||record.notes}{encounter.disposition?` · Outcome: ${encounter.disposition}`:''}</p>}
                  </article>
                );
              })}
            </div>
          )}

          {isDoctor&&tab==='labs'&&(labs.length===0?
            <NurseEmptyState symbol="L" title="No laboratory results" description="Verified investigation results will appear here when they become available."/>:
            <Table cols={[{key:'test',label:'Investigation',w:'28%'},{key:'res',label:'Result',w:'18%'},{key:'ref',label:'Reference',w:'20%'},{key:'date',label:'Date',w:'16%'},{key:'stat',label:'Status',w:'18%'}]}
              rows={labs.map(r=>({
                test:<div className="patient-name-cell"><span className="patient-avatar" style={{background:'#EFF6FF',color:'#2563EB'}}>L</span><div><strong>{r.test_name||r.test_type||'Laboratory test'}</strong><small>Verified investigation</small></div></div>,
                res:<strong style={{fontSize:13.5,color:'#1E293B'}}>{r.result_value||'Not stated'}</strong>,
                ref:<span style={{fontSize:12.5,color:'#64748B'}}>{r.reference_range||'Not provided'}</span>,
                date:<span style={{fontSize:12.5,color:'#64748B'}}>{fmtDate(r.result_date||r.created_at)}</span>,
                stat:r.result_status?statusBadge(r.result_status):<Badge text="Recorded" color="blue"/>
              }))}/>
          )}

          {isDoctor&&tab==='prescriptions'&&(presc.length===0?
            <NurseEmptyState symbol="Rx" title="No prescriptions recorded" description="Medication orders issued for this patient will appear here."/>:
            <Table cols={[{key:'med',label:'Medication',w:'29%'},{key:'directions',label:'Directions',w:'31%'},{key:'dur',label:'Duration',w:'14%'},{key:'date',label:'Issued',w:'14%'},{key:'stat',label:'Status',w:'12%'}]}
              rows={presc.map(p=>({
                med:<div className="patient-name-cell"><span className="patient-avatar" style={{background:'#F5F3FF',color:'#7C3AED'}}>Rx</span><div><strong>{p.medication_name||'Medication'}</strong><small>Prescription order</small></div></div>,
                directions:<span style={{fontSize:12.5,color:'#475569'}}>{p.dosage||'Dose not stated'} · {p.frequency||'Frequency not stated'}</span>,
                dur:<span style={{fontSize:12.5,color:'#64748B'}}>{p.duration||'Not stated'}</span>,
                date:<span style={{fontSize:12.5,color:'#64748B'}}>{fmtDate(p.issued_at||p.created_at)}</span>,
                stat:statusBadge(p.status||'pending')
              }))}/>
          )}
        </div>
      </section>
    </AL>
  );
};

const NursePatientProfile=()=><ClinicalPatientProfile mode="nurse" nav={nurseNav}/>;

/* ══════════════════════════════════════
   DOCTOR MODULE
══════════════════════════════════════ */
const doctorNav=[
  {path:'/doctor-dashboard',    label:'Dashboard',   icon:'▦'},
  {path:'/doctor-patients',     label:'Patients',    icon:'◎'},
  {path:'/doctor-schedule',     label:'Schedule',    icon:'◷'},
  {path:'/doctor-lab',          label:'Lab Results', icon:'◇'},
];

const RoleKpi=({label,value,symbol,color='#2563EB',bg='#EFF6FF',meta,loading})=>(
  <div className="nurse-kpi" style={{'--kpi-color':color}}>
    <div className="nurse-kpi-top">
      <div>
        <p style={{fontSize:12,fontWeight:700,color:'#68758A'}}>{label}</p>
        <p className="nurse-kpi-value" style={{color}}>{loading?'—':value}</p>
      </div>
      <span className="nurse-icon-tile" style={{'--icon-bg':bg,'--icon-color':color}}>{symbol}</span>
    </div>
    <p className="nurse-kpi-meta">{meta}</p>
  </div>
);

const DoctorDashboard=()=>{
  const nv=useNavigate();
  const [queue,setQueue]=React.useState([]);
  const [stats,setStats]=React.useState({total_patients:'—',appointments_today:'—',pending_labs:'—'});
  const [loading,setLoading]=React.useState(true);

  const load=()=>{
    setLoading(true);
    Promise.allSettled([
      fetch(`${BASE_URL}/api/patients/stats/doctor`,{headers:ah()}).then(r=>r.json()),
      fetch(`${BASE_URL}/api/patients/queue/doctor`,{headers:ah()}).then(r=>r.json())
    ]).then(([statsResult,queueResult])=>{
      if(statsResult.status==='fulfilled')setStats(statsResult.value||{});
      if(queueResult.status==='fulfilled')setQueue(Array.isArray(queueResult.value)?queueResult.value:[]);
    }).finally(()=>setLoading(false));
  };
  React.useEffect(load,[]);

  const rawName=localStorage.getItem('display_name')||'Doctor';
  const doctorName=/^dr\.?\s/i.test(rawName)?rawName:`Dr. ${rawName}`;
  const firstName=doctorName.replace(/^dr\.?\s*/i,'').split(' ')[0];
  const hour=new Date().getHours();
  const greeting=hour<12?'Good morning':hour<18?'Good afternoon':'Good evening';
  const withVitals=queue.filter(p=>p.blood_pressure||p.pulse_rate).length;

  return(
    <AL nav={doctorNav} title="Doctor Dashboard">
      <section className="nurse-hero" style={{background:'radial-gradient(circle at 80% 20%,rgba(125,211,252,.25),transparent 28%),linear-gradient(135deg,#111C31 0%,#173B68 62%,#3730A3 145%)'}}>
        <div className="nurse-hero-content">
          <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:11}}>
            <span style={{width:7,height:7,borderRadius:'50%',background:'#7DD3FC',boxShadow:'0 0 0 5px rgba(125,211,252,.12)'}}/>
            <span style={{fontSize:11,fontWeight:700,color:'#BAE6FD',textTransform:'uppercase',letterSpacing:.85}}>Clinical workspace • {queue.length} waiting</span>
          </div>
          <h2 style={{fontSize:'clamp(25px,3vw,36px)',fontWeight:800,marginBottom:7}}>{greeting}, Dr. {firstName}.</h2>
          <p style={{fontSize:13,color:'rgba(255,255,255,.65)',lineHeight:1.6}}>Review today’s patient flow, continue consultations, and follow up on investigations.</p>
        </div>
        <div className="nurse-hero-actions">
          <button type="button" onClick={()=>nv('/doctor-lab')} style={{padding:'12px 16px',borderRadius:11,border:'1px solid rgba(255,255,255,.18)',background:'rgba(255,255,255,.08)',color:'white',fontWeight:700,cursor:'pointer'}}>Review lab results</button>
          <button type="button" onClick={()=>nv('/doctor-schedule')} style={{padding:'12px 16px',borderRadius:11,border:'1px solid #BAE6FD',background:'#F0F9FF',color:'#1D4ED8',fontWeight:800,cursor:'pointer'}}>Open schedule →</button>
        </div>
      </section>

      <div className="nurse-kpi-grid">
        <RoleKpi label="Waiting to consult" value={queue.length} symbol="◷" color="#B45309" bg="#FFFBEB" meta={`${withVitals} with recorded observations`} loading={loading}/>
        <RoleKpi label="Appointments today" value={String(stats.appointments_today||0)} symbol="□" color="#2563EB" bg="#EFF6FF" meta="Scheduled for the current day" loading={loading}/>
        <RoleKpi label="Pending lab requests" value={String(stats.pending_labs||0)} symbol="◇" color="#7C3AED" bg="#F5F3FF" meta="Awaiting laboratory completion" loading={loading}/>
        <RoleKpi label="Patient records" value={String(stats.total_patients||0)} symbol="◎" color="#0F766E" bg="#ECFDF5" meta="Available across the EMR" loading={loading}/>
      </div>

      <div className="nurse-dashboard-grid">
        <section className="clinical-panel">
          <div className="clinical-panel-header">
            <div><h3 style={{fontSize:16,color:'#172033'}}>Today’s consultation queue</h3><p style={{fontSize:12,color:'#8490A3',marginTop:4}}>Patients handed over after nursing assessment</p></div>
            <button type="button" onClick={()=>nv('/doctor-schedule')} style={{border:0,background:'none',color:'#2563EB',fontSize:12,fontWeight:800,cursor:'pointer'}}>View full schedule →</button>
          </div>
          <div className="clinical-panel-body">
            {loading?<div style={{padding:'34px 10px',textAlign:'center',color:'#8490A3',fontSize:13}}>Loading patient queue...</div>:
             queue.length===0?<NurseEmptyState symbol="✓" title="Consultation queue is clear" description="Patients sent by the nursing team will appear here with their recorded observations."/>:
             queue.slice(0,5).map((p,index)=>(
              <div className="queue-preview-row" key={p.patient_id||index}>
                <div className="patient-name-cell">
                  <span className="patient-avatar" style={{background:'#EFF6FF',color:'#2563EB'}}>{(p.full_name||'P').charAt(0).toUpperCase()}</span>
                  <div><p style={{fontSize:13,fontWeight:800,color:'#263247'}}>{p.full_name||'Unnamed patient'}</p><p style={{fontSize:10.5,color:'#8490A3',marginTop:3}}>{p.chief_complaint||'Reason not recorded'}</p></div>
                </div>
                <div className="queue-preview-secondary"><p style={{fontSize:10,color:'#9AA5B5',textTransform:'uppercase',fontWeight:700}}>Arrival</p><p style={{fontSize:11.5,fontWeight:700,color:'#56647A',marginTop:3}}>{fmtArrival(p.registration_date)}</p></div>
                <div className="queue-preview-secondary"><p style={{fontSize:10,color:'#9AA5B5',textTransform:'uppercase',fontWeight:700}}>Observations</p><p style={{fontSize:11.5,fontWeight:700,color:'#56647A',marginTop:3}}>BP {p.blood_pressure||'—'} · HR {p.pulse_rate||'—'}</p></div>
                <Btn onClick={()=>nv('/doctor-consultation',{state:{patientId:p.patient_id}})} v={index===0?'blue':'ghost'} sz="sm">{index===0?'Consult':'Open'}</Btn>
              </div>
             ))}
          </div>
        </section>

        <aside style={{display:'flex',flexDirection:'column',gap:18}}>
          <section className="clinical-panel">
            <div className="clinical-panel-header"><div><h3 style={{fontSize:16,color:'#172033'}}>Quick actions</h3><p style={{fontSize:12,color:'#8490A3',marginTop:4}}>Common clinical tasks</p></div></div>
            <div className="clinical-panel-body">
              <button type="button" className="quick-action-card" onClick={()=>nv('/doctor-schedule')}><span className="nurse-icon-tile" style={{'--icon-bg':'#EFF6FF','--icon-color':'#2563EB'}}>◷</span><span><strong style={{display:'block',fontSize:13,color:'#263247'}}>Continue consultation</strong><span style={{fontSize:11,color:'#8490A3',marginTop:3,display:'block'}}>Open today’s queue</span></span><span style={{marginLeft:'auto',color:'#2563EB'}}>→</span></button>
              <button type="button" className="quick-action-card" onClick={()=>nv('/doctor-patients')}><span className="nurse-icon-tile" style={{'--icon-bg':'#ECFDF5','--icon-color':'#0F766E'}}>◎</span><span><strong style={{display:'block',fontSize:13,color:'#263247'}}>Find patient record</strong><span style={{fontSize:11,color:'#8490A3',marginTop:3,display:'block'}}>Search the patient registry</span></span><span style={{marginLeft:'auto',color:'#2563EB'}}>→</span></button>
              <button type="button" className="quick-action-card" onClick={()=>nv('/doctor-lab')}><span className="nurse-icon-tile" style={{'--icon-bg':'#F5F3FF','--icon-color':'#7C3AED'}}>◇</span><span><strong style={{display:'block',fontSize:13,color:'#263247'}}>Review lab results</strong><span style={{fontSize:11,color:'#8490A3',marginTop:3,display:'block'}}>{stats.pending_labs||0} requests pending</span></span><span style={{marginLeft:'auto',color:'#2563EB'}}>→</span></button>
            </div>
          </section>
          <section className="clinical-panel"><div className="clinical-panel-body">
            <p style={{fontSize:10,fontWeight:800,color:'#8490A3',textTransform:'uppercase',letterSpacing:.7}}>Clinical handover</p>
            <h3 style={{fontSize:16,color:'#263247',marginTop:6}}>{queue.length?`${queue.length} patient${queue.length===1?'':'s'} ready`:'No handovers waiting'}</h3>
            <p style={{fontSize:11.5,color:'#8490A3',lineHeight:1.6,marginTop:6}}>{queue.length?`${withVitals} patient record${withVitals===1?' has':'s have'} nursing observations available.`:'The queue will update as nurses complete triage.'}</p>
          </div></section>
        </aside>
      </div>
    </AL>
  );
};

const DoctorPatients=()=>{
  const nv=useNavigate();
  const [search,setSearch]=React.useState('');
  const [filter,setFilter]=React.useState('all');
  const {patients,counts,total,loading,searching,error,refresh}=usePatientRegistrySearch(search,filter);

  return(
    <AL nav={doctorNav} title="Patient Registry" searchText={search} setSearchText={setSearch}
      searchBusy={searching} searchPlaceholder="Name, ID, doctor, diagnosis...">
      <NursePageIntro kicker="Longitudinal records" title="Find and review any patient"
        description="Search patient identity and historical visits, doctors, diagnoses, medications, laboratory requests, and visit dates from one registry.">
        <Btn onClick={refresh} v="ghost">↻ Refresh records</Btn>
        <Btn onClick={()=>nv('/doctor-schedule')} v="blue">Open today’s queue →</Btn>
      </NursePageIntro>
      <div className="nurse-mini-stats">
        <NurseMiniStat symbol="◎" value={loading?'—':counts.all} label={search?'Matching patient records':'Patient records'} color="#2563EB" bg="#EFF6FF"/>
        <NurseMiniStat symbol="✓" value={loading?'—':counts.active} label="Active patients" color="#15803D" bg="#F0FDF4"/>
        <NurseMiniStat symbol="◷" value={loading?'—':counts.waiting} label="Awaiting consultation" color="#B45309" bg="#FFFBEB"/>
        <NurseMiniStat symbol="—" value={loading?'—':counts.inactive} label="Inactive records" color="#64748B" bg="#F1F5F9"/>
      </div>
      <div className="nurse-toolbar">
        <div className="filter-pills" aria-label="Filter patient records">
          {[['all','All',counts.all],['active','Active',counts.active],['waiting','Waiting',counts.waiting],['inactive','Inactive',counts.inactive]].map(([value,label,count])=>(
            <button type="button" key={value} onClick={()=>setFilter(value)} className={`filter-pill${filter===value?' is-active':''}`} style={filter===value?{background:'#2563EB',borderColor:'#2563EB'}:undefined}>{label} · {count}</button>
          ))}
        </div>
        <p style={{fontSize:11,color:'#8490A3'}}>{searching?'Searching longitudinal records…':`${total} record${total===1?'':'s'} found`}</p>
      </div>
      {error?<NurseEmptyState symbol="!" title="Patient search unavailable" description={error}><Btn onClick={refresh} v="ghost">Try again</Btn></NurseEmptyState>:
       loading?<div className="clinical-panel"><p style={{textAlign:'center',padding:45,color:'#94A3B8'}}>Loading patient records...</p></div>:
        <Table cols={[
          {key:'name',label:'Patient',       w:'24%'},
          {key:'id',  label:'Patient ID',    w:'11%'},
          {key:'history',label:'Longitudinal Snapshot',w:'31%'},
          {key:'stat',label:'Status',        w:'11%'},
          {key:'act', label:'Actions',       w:'23%'},
        ]} rows={patients.map(p=>({
          name:<div className="patient-name-cell"><span className="patient-avatar" style={{background:'#EFF6FF',color:'#2563EB'}}>{(p.full_name||'P').charAt(0).toUpperCase()}</span><div><span style={{fontWeight:800,color:'#172033'}}>{p.full_name||'Unnamed patient'}</span><span style={{fontSize:10.5,color:'#8490A3',display:'block',marginTop:2}}>{p.gender||'Gender not recorded'} · {p.date_of_birth?`${calcAge(p.date_of_birth)} yrs`:'DOB unavailable'}</span></div></div>,
          id:  <span style={{color:'#64748B',fontFamily:'monospace',fontSize:12}}>{p.national_patient_id||p.patient_id}</span>,
          history:<div><span style={{fontWeight:700,color:'#344056',fontSize:12.5}}>{p.last_visit_date?`Last visit ${fmtDate(p.last_visit_date)}`:'No visits recorded'}</span><span style={{fontSize:10.5,color:'#8490A3',display:'block',marginTop:3}}>{p.last_diagnosis||p.last_chief_complaint||'No diagnosis recorded'}{p.last_doctor_name?` · ${p.last_doctor_name}`:''}</span>{p.last_medication&&<span style={{fontSize:10.5,color:'#2563EB',display:'block',marginTop:3}}>Latest medication: {p.last_medication}</span>}</div>,
          stat:statusBadge(p.status||'active'),
          act: <div style={{display:'flex',gap:8}}>
            <Btn onClick={()=>nv('/doctor-patient-view',{state:{patientId:p.patient_id}})} v="ghost" sz="sm">View record</Btn>
            <Btn onClick={()=>nv('/doctor-consultation',{state:{patientId:p.patient_id}})} v="blue" sz="sm">Consult</Btn>
          </div>
        }))} empty={search||filter!=='all'?'No patient records match this search and status filter.':'No patients found.'}/>
      }
    </AL>
  );
};

const DoctorPatientView=()=><ClinicalPatientProfile mode="doctor" nav={doctorNav}/>;

const DoctorSchedule=()=>{
  const nv=useNavigate();
  const [queue,setQueue]=React.useState([]);
  const [loading,setLoading]=React.useState(true);
  const [search,setSearch]=React.useState('');
  const load=()=>{
    setLoading(true);
    fetch(`${BASE_URL}/api/patients/queue/doctor`,{headers:ah()})
      .then(r=>r.json()).then(d=>setQueue(Array.isArray(d)?d:[]))
      .catch(()=>{}).finally(()=>setLoading(false));
  };
  React.useEffect(load,[]);
  const filtered=queue.filter(p=>(p.full_name||'').toLowerCase().includes(search.toLowerCase())||(p.chief_complaint||'').toLowerCase().includes(search.toLowerCase()));
  const withVitals=queue.filter(p=>p.blood_pressure||p.pulse_rate).length;
  const withReason=queue.filter(p=>p.chief_complaint).length;
  return(
    <AL nav={doctorNav} title="Consultation Schedule" searchText={search} setSearchText={setSearch}>
      <NursePageIntro kicker="Today’s clinical list" title="Consultation queue"
        description="Review nursing observations, open the patient record, and begin or continue each consultation.">
        <Btn onClick={load} v="ghost">↻ Refresh queue</Btn>
        <Btn onClick={()=>nv('/doctor-patients')} v="blue">Find patient</Btn>
      </NursePageIntro>
      <div className="nurse-mini-stats">
        <NurseMiniStat symbol="◷" value={loading?'—':queue.length} label="Waiting to consult" color="#B45309" bg="#FFFBEB"/>
        <NurseMiniStat symbol="✓" value={loading?'—':withVitals} label="With observations" color="#15803D" bg="#F0FDF4"/>
        <NurseMiniStat symbol="≡" value={loading?'—':withReason} label="Reason documented" color="#2563EB" bg="#EFF6FF"/>
        <NurseMiniStat symbol="→" value={loading?'—':(queue[0]?.full_name||'None').split(' ')[0]} label="Next patient" color="#7C3AED" bg="#F5F3FF"/>
      </div>
      <div className="workflow-strip" aria-label="Consultation workflow">
        <div className="workflow-step"><span className="workflow-number" style={{background:'#EFF6FF',color:'#2563EB'}}>01</span><div><strong style={{fontSize:12,color:'#263247'}}>Review handover</strong><span style={{display:'block',fontSize:10.5,color:'#8490A3',marginTop:3}}>Check complaint and observations</span></div></div>
        <div className="workflow-step"><span className="workflow-number" style={{background:'#EFF6FF',color:'#2563EB'}}>02</span><div><strong style={{fontSize:12,color:'#263247'}}>Assess patient</strong><span style={{display:'block',fontSize:10.5,color:'#8490A3',marginTop:3}}>Open or continue consultation</span></div></div>
        <div className="workflow-step"><span className="workflow-number" style={{background:'#EFF6FF',color:'#2563EB'}}>03</span><div><strong style={{fontSize:12,color:'#263247'}}>Complete plan</strong><span style={{display:'block',fontSize:10.5,color:'#8490A3',marginTop:3}}>Document, prescribe or request labs</span></div></div>
      </div>
      {loading?<div className="clinical-panel"><p style={{textAlign:'center',padding:45,color:'#94A3B8'}}>Loading today’s consultation queue...</p></div>:
       filtered.length===0?(
        <NurseEmptyState symbol="✓" title={search?'No matching consultations':'No patients are waiting'} description={search?'Try a different patient name or reason for visit.':'Patients will appear here after the nursing team completes triage.'}>
          {search?<Btn onClick={()=>setSearch('')} v="ghost">Clear search</Btn>:<Btn onClick={()=>nv('/doctor-dashboard')} v="blue">Return to dashboard</Btn>}
        </NurseEmptyState>
       ):
        <Table cols={[
          {key:'pos',   label:'Queue',           w:'7%'},
          {key:'name',  label:'Patient',         w:'22%'},
          {key:'time',  label:'Arrival',         w:'13%'},
          {key:'reason',label:'Reason for Visit',w:'20%'},
          {key:'vitals',label:'Observations',    w:'18%'},
          {key:'act',   label:'Action',          w:'20%'},
        ]} rows={filtered.map(p=>({
          pos:<span style={{width:28,height:28,borderRadius:9,display:'grid',placeItems:'center',background:'#EFF6FF',color:'#2563EB',fontSize:11,fontWeight:800}}>{filtered.indexOf(p)+1}</span>,
          name:<div className="patient-name-cell"><span className="patient-avatar" style={{background:'#EFF6FF',color:'#2563EB'}}>{(p.full_name||'P').charAt(0).toUpperCase()}</span><div><span style={{fontWeight:800,color:'#172033'}}>{p.full_name||'Unnamed patient'}</span><span style={{fontSize:10.5,color:'#8490A3',display:'block',marginTop:2,fontFamily:'monospace'}}>{p.national_patient_id||p.patient_id}</span></div></div>,
          time:<span style={{color:'#64748B',fontSize:12}}>{fmtArrival(p.registration_date)}</span>,
          reason:<span style={{color:p.chief_complaint?'#344056':'#8490A3'}}>{p.chief_complaint||'Reason not recorded'}</span>,
          vitals:<div><span style={{fontWeight:700,color:'#344056'}}>BP {p.blood_pressure||'—'}</span><span style={{fontSize:10.5,color:'#8490A3',display:'block',marginTop:2}}>Heart rate {p.pulse_rate||'—'} bpm</span></div>,
          act:<div style={{display:'flex',gap:7}}><Btn onClick={()=>nv('/doctor-patient-view',{state:{patientId:p.patient_id}})} v="ghost" sz="sm">Record</Btn><Btn onClick={()=>nv('/doctor-consultation',{state:{patientId:p.patient_id}})} v="blue" sz="sm">Consult</Btn></div>
        }))} empty="No patients scheduled today."/>
      }
    </AL>
  );
};

/* ══════════════════════════════════════
   DOCTOR CONSULTATION
   FIX: vitals from records fallback
   FIX: recordId tracking so doctor can continue where they left off
   FIX: lab modal shows correct patient ID
══════════════════════════════════════ */
const DoctorConsultation=()=>{
  const nv=useNavigate();
  const loc=useLocation();
  const {patientId}=loc.state||{};
  const toast=useToast();
  const user=JSON.parse(localStorage.getItem('user')||'{}');

  const [data,setData]=React.useState(null);
  const [loading,setLoading]=React.useState(true);
  const [notes,setNotes]=React.useState('');
  const [diag,setDiag]=React.useState('');
  // FIX: track existing record ID so we PATCH instead of POST when continuing
  const [recordId,setRecordId]=React.useState(null);
  const [encounterId,setEncounterId]=React.useState(null);
  const [saving,setSaving]=React.useState(false);
  const [saved,setSaved]=React.useState(false);
  const [closing,setClosing]=React.useState(false);

  const [showLab,setShowLab]=React.useState(false);
  const [labChecks,setLabChecks]=React.useState({});
  const [labNotes,setLabNotes]=React.useState('');
  const [sendingLab,setSendingLab]=React.useState(false);

  const [showRx,setShowRx]=React.useState(false);
  const [rx,setRx]=React.useState({med:'',dose:'',freq:'',dur:''});
  const [sendingRx,setSendingRx]=React.useState(false);

  const load=()=>{
    if(!patientId)return;
    setLoading(true);
    fetch(`${BASE_URL}/api/patients/${patientId}/full`,{headers:ah()})
      .then(r=>r.json()).then(d=>{
        setData(d);
        // Only continue the current visit. Historical records must remain immutable.
        const activeEncounter=d.active_encounter||null;
        const doctorRec=activeEncounter?.medical_records?.[0]||null;
        setEncounterId(activeEncounter?.encounter_id||null);
        setRecordId(null);
        setNotes('');
        setDiag('');
        setSaved(false);
        if(doctorRec){
          setNotes(doctorRec.clinical_notes || doctorRec.notes || '');
          setDiag(doctorRec.diagnosis || '');
          const rid = doctorRec.record_id || doctorRec.medical_record_id || null;
          setRecordId(rid);
          setSaved(true);
        }
      }).catch(()=>{}).finally(()=>setLoading(false));
  };
  React.useEffect(load,[patientId]);

  // FIX: if recordId exists → PATCH (update), else → POST (create new)
  const saveRecord=async()=>{
    setSaving(true);
    try{
      const { vit } = extractVitalsAndRecords(data || {});
      const isUpdate = !!recordId;
      const url = isUpdate
        ? `${BASE_URL}/api/medical-records/${recordId}`
        : `${BASE_URL}/api/medical-records`;
      const method = isUpdate ? 'PATCH' : 'POST';

      const r=await fetch(url,{method,headers:ah(),
        body:JSON.stringify({
          patient_id: patientId,
          notes: notes,
          diagnosis: diag,
          blood_pressure: vit.blood_pressure,
          pulse_rate: vit.pulse_rate,
          temperature: vit.temperature,
          weight: vit.weight,
          encounter_id: encounterId,
        })});
      const body=await r.json().catch(()=>({}));
      if(r.ok){
        if(!isUpdate){
          const newId = body.record_id || body.medical_record_id || body.id || null;
          if(newId) setRecordId(newId);
        }
        if(body.encounter_id)setEncounterId(body.encounter_id);
        toast.show(isUpdate ? 'Record updated!' : 'Record saved!');
        setSaved(true);
      }
      else toast.show(body.message||'Failed to save.','error');
    }catch{toast.show('Network error.','error');}finally{setSaving(false);}
  };

  const sendLab=async()=>{
    const sel=Object.entries(labChecks).filter(([,v])=>v).map(([k])=>k);
    if(!sel.length){toast.show('Select at least one test.','error');return;}
    setSendingLab(true);
    try{
      let currentEncounterId=encounterId;
      let allOk=true;
      for(const testId of sel){
        const test=GH_LABS.find(item=>item.id===testId);
        const response=await fetch(`${BASE_URL}/api/lab-requests`,{method:'POST',headers:ah(),
          body:JSON.stringify({
            patient_id:patientId,
            encounter_id:currentEncounterId,
            test_type:testId,
            test_category:test?.cat||'',
            clinical_indications:labNotes
          })});
        const body=await response.json().catch(()=>({}));
        if(!response.ok){allOk=false;break;}
        currentEncounterId=body.encounter_id||currentEncounterId;
      }
      if(currentEncounterId)setEncounterId(currentEncounterId);
      if(allOk){toast.show(`${sel.length} lab request(s) sent!`);setShowLab(false);setLabChecks({});setLabNotes('');load();}
      else toast.show('Some requests failed.','error');
    }catch{toast.show('Network error.','error');}finally{setSendingLab(false);}
  };

  const sendRx=async()=>{
    if(!rx.med){toast.show('Please enter medication name.','error');return;}
    setSendingRx(true);
    try{
      const r=await fetch(`${BASE_URL}/api/prescriptions`,{method:'POST',headers:ah(),
        body:JSON.stringify({patient_id:patientId,encounter_id:encounterId,medication_name:rx.med,dosage:rx.dose,frequency:rx.freq,duration:rx.dur})});
      const body=await r.json().catch(()=>({}));
      if(r.ok){if(body.encounter_id)setEncounterId(body.encounter_id);toast.show('Prescription sent to pharmacy!');setShowRx(false);setRx({med:'',dose:'',freq:'',dur:''});load();}
      else toast.show(body.message||'Failed.','error');
    }catch{toast.show('Network error.','error');}finally{setSendingRx(false);}
  };

  const closeConsultation=async()=>{
    if(!recordId||!saved){
      toast.show('Save the consultation record before closing this visit.','error');
      return;
    }
    if(!encounterId){
      toast.show('This visit has no encounter number yet. Save the record and try again.','error');
      return;
    }
    setClosing(true);
    try{
      const response=await fetch(`${BASE_URL}/api/encounters/${encounterId}/complete`,{
        method:'POST',
        headers:ah(),
        body:JSON.stringify({disposition:diag?'Consultation completed':'Closed by attending doctor'})
      });
      const body=await response.json().catch(()=>({}));
      if(!response.ok){
        toast.show(body.message||'Unable to close this visit.','error');
        return;
      }
      toast.show('Visit completed and added to the patient timeline.');
      nv('/doctor-schedule');
    }catch{
      toast.show('Network error.','error');
    }finally{
      setClosing(false);
    }
  };

  if(loading)return<AL nav={doctorNav} title="Consultation"><p style={{textAlign:'center',padding:60,color:'#94A3B8'}}>Loading patient data...</p></AL>;
  if(!data)return<AL nav={doctorNav} title="Consultation"><p style={{textAlign:'center',padding:60,color:'#94A3B8'}}>Patient not found.</p></AL>;

const pt = data.patient || data || {};
  // FIX: vitals fall back to records[0]
  const { recs, vit } = extractVitalsAndRecords(data);
  const labs  = data.lab_results   || [];
  const presc = data.prescriptions || [];
  const labByCat=GH_LABS.reduce((a,t)=>{if(!a[t.cat])a[t.cat]=[];a[t.cat].push(t);return a;},{});
  const selectedLabCount=Object.values(labChecks).filter(Boolean).length;

  return(
    <AL nav={doctorNav} title="Patient Consultation">
      <Toast {...toast}/>

      <section className="consult-patient-banner">
        <div className="consult-banner-content" style={{display:'flex',alignItems:'center',gap:13,minWidth:0}}>
          <div style={{width:48,height:48,borderRadius:14,backgroundColor:'rgba(255,255,255,.11)',border:'1px solid rgba(255,255,255,.1)',
            display:'flex',alignItems:'center',justifyContent:'center',fontSize:17,fontWeight:800,color:'white',flexShrink:0}}>
            {(pt.full_name||'?').charAt(0)}
          </div>
          <div style={{minWidth:0}}>
            <p style={{fontSize:10,fontWeight:800,color:'#BAE6FD',textTransform:'uppercase',letterSpacing:.8,marginBottom:4}}>Active consultation</p>
            <h2 style={{color:'white',fontWeight:800,fontSize:19,margin:0,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{pt.full_name||'Unnamed patient'}</h2>
            <p style={{color:'rgba(255,255,255,.58)',fontSize:11.5,marginTop:4,lineHeight:1.5}}>
              {pt.national_patient_id||pt.patient_id||'—'} · {pt.gender||'Gender not recorded'} · {pt.date_of_birth?`Age ${calcAge(pt.date_of_birth)}`:'Age not recorded'}
            </p>
            <p style={{color:'rgba(255,255,255,.76)',fontSize:11.5,marginTop:3,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>Presenting complaint: {vit.chief_complaint||recs[0]?.chief_complaint||'Not recorded'}</p>
          </div>
        </div>
        <div className="consult-banner-actions">
          {statusBadge(pt.status||'active')}
          {recordId&&<span style={{padding:'5px 10px',borderRadius:99,background:'rgba(191,219,254,.16)',border:'1px solid rgba(191,219,254,.18)',color:'#DBEAFE',fontSize:10.5,fontWeight:800}}>Continuing consultation</span>}
          <button type="button" onClick={()=>nv('/doctor-patient-view',{state:{patientId}})}
            style={{padding:'8px 12px',borderRadius:9,border:'1px solid rgba(255,255,255,.22)',background:'rgba(255,255,255,.09)',color:'white',fontSize:11,fontWeight:800,cursor:'pointer'}}>View full record →</button>
        </div>
      </section>

      <div className="consult-vitals-grid">
        {[{l:'Blood pressure',v:vit.blood_pressure||'—',u:'mmHg',symbol:'BP',bg:'#F0FDF4',tc:'#15803D'},
          {l:'Heart rate',v:vit.pulse_rate||'—',u:'bpm',symbol:'HR',bg:'#EFF6FF',tc:'#2563EB'},
          {l:'Temperature',v:vit.temperature||'—',u:'°C',symbol:'T',bg:'#FFFBEB',tc:'#B45309'},
          {l:'Weight',v:vit.weight||'—',u:'kg',symbol:'W',bg:'#F5F3FF',tc:'#7C3AED'}].map((x,i)=>(
          <div className="consult-vital-card" key={i}>
            <span className="nurse-icon-tile" style={{'--icon-bg':x.bg,'--icon-color':x.tc,width:38,height:38,fontSize:12}}>{x.symbol}</span>
            <div>
              <p className="consult-vital-label">{x.l}</p>
              <p className="consult-vital-value" style={{color:x.v==='—'?'#94A3B8':x.tc}}>{x.v}<span style={{fontSize:10,marginLeft:4,fontFamily:'DM Sans',fontWeight:700,opacity:.65}}>{x.u}</span></p>
            </div>
          </div>
        ))}
      </div>

      <div className="consult-workspace-grid">
        <section className="consult-card">
          <div className="consult-section-heading">
            <div><h3>Clinical documentation</h3><p>Record history, examination findings, observations, and relevant clinical context.</p></div>
            <span style={{padding:'5px 8px',borderRadius:8,background:'#F1F5F9',color:'#64748B',fontSize:10,fontWeight:800}}>SOAP notes</span>
          </div>
          <textarea value={notes} onChange={e=>{setNotes(e.target.value);setSaved(false);}}
            aria-label="Clinical notes and observations" placeholder="Document presenting history, examination findings, clinical observations and assessment..."
            style={{...inp,height:224,resize:'vertical',lineHeight:1.65}}/>
        </section>
        <section className="consult-card" style={{display:'flex',flexDirection:'column'}}>
          <div className="consult-section-heading">
            <div><h3>Assessment & plan</h3><p>Record the primary diagnosis, save the consultation, and add the next care actions.</p></div>
          </div>
          <Field label="Primary diagnosis">
          <input value={diag} onChange={e=>{setDiag(e.target.value);setSaved(false);}}
            placeholder="Enter the recorded clinical diagnosis..." style={inp}/>
          </Field>
          <Btn onClick={saveRecord} disabled={saving} v="green" style={{width:'100%',justifyContent:'center',marginTop:12}}>
            {saving?'Saving consultation...':(recordId?'Update consultation record':'Save consultation record')}
          </Btn>
          {saved&&(
            <div role="status" style={{marginTop:9,padding:'9px 10px',fontSize:11,color:'#15803D',background:'#F0FDF4',border:'1px solid #BBF7D0',borderRadius:9,fontWeight:700}}>✓ Consultation record saved successfully.</div>
          )}
          {!saved&&recordId&&<p style={{fontSize:10.5,color:'#8490A3',marginTop:8}}>Changes are saved to the patient’s existing consultation record.</p>}
          <div className="consult-action-grid" style={{marginTop:'auto',paddingTop:14}}>
            <button type="button" className="consult-plan-action" onClick={()=>setShowLab(true)}>
              <span className="nurse-icon-tile" style={{'--icon-bg':'#F5F3FF','--icon-color':'#7C3AED',width:34,height:34,fontSize:13}}>◇</span>
              <span><strong style={{display:'block',fontSize:11.5,color:'#263247'}}>Request tests</strong><span style={{display:'block',fontSize:9.5,color:'#8490A3',marginTop:2}}>Send to laboratory</span></span>
            </button>
            <button type="button" className="consult-plan-action" onClick={()=>setShowRx(true)}>
              <span className="nurse-icon-tile" style={{'--icon-bg':'#ECFDF5','--icon-color':'#0F766E',width:34,height:34,fontSize:13}}>Rx</span>
              <span><strong style={{display:'block',fontSize:11.5,color:'#263247'}}>Prescribe</strong><span style={{display:'block',fontSize:9.5,color:'#8490A3',marginTop:2}}>Send to pharmacy</span></span>
            </button>
          </div>
        </section>
      </div>

      {(labs.length>0||presc.length>0)&&<div className="consult-records-grid">
        {labs.length>0&&<section className="consult-card">
          <div className="consult-section-heading"><div><h3>Laboratory results</h3><p>{labs.length} result{labs.length===1?'':'s'} available for this patient.</p></div><Badge text={`${labs.length} available`} color="purple"/></div>
          <Table cols={[{key:'test',label:'Test',w:'28%'},{key:'res',label:'Result',w:'20%'},{key:'ref',label:'Reference',w:'20%'},{key:'date',label:'Date',w:'14%'},{key:'stat',label:'Status',w:'18%'}]}
            rows={labs.map(r=>({test:<span style={{fontWeight:700,textTransform:'capitalize'}}>{r.test_name||r.test_type}</span>,
              res:<span style={{fontWeight:700,color:(r.result_status||'').toLowerCase()==='abnormal'?'#DC2626':'#15803D'}}>{r.result_value||'—'}</span>,
              ref:r.reference_range||'—',date:fmtDate(r.result_date||r.created_at),stat:statusBadge(r.result_status||'normal')}))}/>
        </section>}
        {presc.length>0&&<section className="consult-card">
          <div className="consult-section-heading"><div><h3>Current prescriptions</h3><p>{presc.length} medication order{presc.length===1?'':'s'} recorded.</p></div><Badge text={`${presc.length} order${presc.length===1?'':'s'}`} color="green"/></div>
          <Table cols={[{key:'med',label:'Medication',w:'29%'},{key:'dose',label:'Dosage',w:'17%'},{key:'freq',label:'Frequency',w:'18%'},{key:'dur',label:'Duration',w:'16%'},{key:'stat',label:'Status',w:'20%'}]}
            rows={presc.map(p=>({med:<span style={{fontWeight:700}}>{p.medication_name}</span>,dose:p.dosage||'—',freq:p.frequency||'—',dur:p.duration||'—',stat:statusBadge(p.status||'pending')}))}/>
        </section>}
      </div>}

      <div className="consult-footer-actions">
        <Btn onClick={()=>setShowLab(true)} v="ghost"><span style={{color:'#7C3AED'}}>◇</span> Request laboratory tests</Btn>
        <Btn onClick={()=>setShowRx(true)} v="outline">Rx&nbsp; Prescribe medication</Btn>
        <div style={{flex:1}}/>
        <span style={{fontSize:10.5,color:saved?'#15803D':'#8490A3',fontWeight:700}}>{saved?'✓ Latest changes saved':recordId?'Existing record loaded':'New consultation'}</span>
        <Btn onClick={closeConsultation} disabled={closing} v="primary">{closing?'Closing visit...':'Complete visit & return'}</Btn>
      </div>

      <Modal open={showLab} onClose={()=>{setShowLab(false);setLabChecks({});setLabNotes('');}} title="Request Laboratory Tests" width={580}>
        <MB>
          <div className="vitals-patient-card" style={{background:'#EFF6FF',borderColor:'#BFDBFE'}}>
            <span className="patient-avatar" style={{background:'#DBEAFE',color:'#2563EB'}}>{(pt.full_name||'P').charAt(0).toUpperCase()}</span>
            <div style={{flex:1}}><strong style={{display:'block',fontSize:13,color:'#1E3A8A'}}>{pt.full_name||'Unnamed patient'}</strong><span style={{fontSize:10.5,color:'#64748B',marginTop:2,display:'block'}}>Patient ID: {pt.national_patient_id||pt.patient_id||'—'}</span></div>
            <Badge text={`${selectedLabCount} selected`} color={selectedLabCount?'blue':'gray'}/>
          </div>
          {Object.entries(labByCat).map(([cat,tests])=>(
            <div key={cat}>
              <p style={{fontSize:10,fontWeight:800,color:'#94A3B8',textTransform:'uppercase',letterSpacing:.8,marginBottom:8}}>{cat}</p>
              <div className="lab-test-grid">
                {tests.map(t=>(
                  <label key={t.id} style={{display:'flex',alignItems:'center',gap:10,padding:'8px 12px',
                    borderRadius:9,border:`1px solid ${labChecks[t.id]?'#60A5FA':'#E2E8F0'}`,
                    backgroundColor:labChecks[t.id]?'#EFF6FF':'white',cursor:'pointer'}}>
                    <input type="checkbox" checked={!!labChecks[t.id]}
                      onChange={()=>setLabChecks(prev=>({...prev,[t.id]:!prev[t.id]}))}
                      style={{accentColor:'#3B82F6'}}/>
                    <span style={{fontSize:13,fontWeight:600,color:'#374151'}}>{t.label}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
          <Field label="Clinical Indications / Notes">
            <textarea value={labNotes} onChange={e=>setLabNotes(e.target.value)}
              placeholder="Reason for requesting these tests..."
              style={{...inp,height:75,resize:'none'}}/>
          </Field>
        </MB>
        <MF>
          <Btn onClick={()=>{setShowLab(false);setLabChecks({});setLabNotes('');}} v="ghost">Cancel</Btn>
          <Btn onClick={sendLab} disabled={sendingLab} v="blue">{sendingLab?'Sending requests...':selectedLabCount?`Send ${selectedLabCount} to Lab`:'Send to Lab'}</Btn>
        </MF>
      </Modal>

      <Modal open={showRx} onClose={()=>{setShowRx(false);setRx({med:'',dose:'',freq:'',dur:''});}} title="Prescribe Medication" width={480}>
        <MB>
          <div className="vitals-patient-card">
            <span className="patient-avatar">{(pt.full_name||'P').charAt(0).toUpperCase()}</span>
            <div><strong style={{display:'block',fontSize:13,color:'#134E4A'}}>{pt.full_name||'Unnamed patient'}</strong><span style={{fontSize:10.5,color:'#5F7C78',marginTop:2,display:'block'}}>Diagnosis: {diag||'Not yet recorded'}</span></div>
          </div>
          <Field label="Medication Name" required>
            <input value={rx.med} onChange={e=>setRx({...rx,med:e.target.value})}
              placeholder="e.g. Artemether-Lumefantrine 20/120mg" style={inp}/>
          </Field>
          <div className="form-grid-2">
            <Field label="Dosage"><input value={rx.dose} onChange={e=>setRx({...rx,dose:e.target.value})} placeholder="e.g. 4 tablets" style={inp}/></Field>
            <Field label="Frequency"><input value={rx.freq} onChange={e=>setRx({...rx,freq:e.target.value})} placeholder="e.g. Twice daily" style={inp}/></Field>
          </div>
          <Field label="Duration"><input value={rx.dur} onChange={e=>setRx({...rx,dur:e.target.value})} placeholder="e.g. 3 days" style={inp}/></Field>
          <div style={{padding:'11px 14px',backgroundColor:'#FFFBEB',borderRadius:10,border:'1px solid #FDE68A',fontSize:12,color:'#92400E',lineHeight:1.55}}>
            <strong>Verify before sending.</strong> This medication order will be sent directly to the pharmacy queue.
          </div>
        </MB>
        <MF>
          <Btn onClick={()=>{setShowRx(false);setRx({med:'',dose:'',freq:'',dur:''}); }} v="ghost">Cancel</Btn>
          <Btn onClick={sendRx} disabled={sendingRx} v="blue">{sendingRx?'Sending...':'Send to Pharmacy'}</Btn>
        </MF>
      </Modal>
    </AL>
  );
};

const DoctorLab=()=>{
  const [results,setResults]=React.useState([]);
  const [loading,setLoading]=React.useState(true);
  const [search,setSearch]=React.useState('');
  const [filter,setFilter]=React.useState('all');
  const load=()=>{
    setLoading(true);
    fetch(`${BASE_URL}/api/lab-results`,{headers:ah()})
      .then(r=>r.json()).then(d=>setResults(Array.isArray(d)?d:[]))
      .catch(()=>{}).finally(()=>setLoading(false));
  };
  React.useEffect(load,[]);
  const statusOf=r=>(r.result_status||'normal').toLowerCase();
  const counts={
    normal:results.filter(r=>statusOf(r)==='normal').length,
    abnormal:results.filter(r=>statusOf(r)==='abnormal').length,
    critical:results.filter(r=>statusOf(r)==='critical').length,
    pending:results.filter(r=>statusOf(r)==='pending').length
  };
  const filtered=results.filter(r=>{
    const matchesSearch=(r.patient_name||'').toLowerCase().includes(search.toLowerCase())||(r.test_type||r.test_name||'').toLowerCase().includes(search.toLowerCase());
    return matchesSearch&&(filter==='all'||statusOf(r)===filter);
  });
  return(
    <AL nav={doctorNav} title="Laboratory Results" searchText={search} setSearchText={setSearch}>
      <NursePageIntro kicker="Investigations" title="Review laboratory findings"
        description="Search completed investigations, compare recorded reference ranges, and identify results flagged by the laboratory.">
        <Btn onClick={load} v="ghost">↻ Refresh results</Btn>
      </NursePageIntro>
      <div className="nurse-mini-stats">
        <NurseMiniStat symbol="◇" value={loading?'—':results.length} label="Results available" color="#2563EB" bg="#EFF6FF"/>
        <NurseMiniStat symbol="✓" value={loading?'—':counts.normal} label="Marked normal" color="#15803D" bg="#F0FDF4"/>
        <NurseMiniStat symbol="!" value={loading?'—':counts.abnormal+counts.critical} label="Flagged results" color="#DC2626" bg="#FEF2F2"/>
        <NurseMiniStat symbol="◷" value={loading?'—':counts.pending} label="Pending status" color="#B45309" bg="#FFFBEB"/>
      </div>
      <div className="nurse-toolbar">
        <div className="filter-pills" aria-label="Filter laboratory results">
          {[['all','All',results.length],['normal','Normal',counts.normal],['abnormal','Abnormal',counts.abnormal],['critical','Critical',counts.critical],['pending','Pending',counts.pending]].map(([value,label,count])=>(
            <button type="button" key={value} onClick={()=>setFilter(value)} className={`filter-pill${filter===value?' is-active':''}`} style={filter===value?{background:'#2563EB',borderColor:'#2563EB'}:undefined}>{label} · {count}</button>
          ))}
        </div>
        <p style={{fontSize:11,color:'#8490A3'}}>{filtered.length} result{filtered.length===1?'':'s'} shown</p>
      </div>
      {loading?<div className="clinical-panel"><p style={{textAlign:'center',padding:45,color:'#94A3B8'}}>Loading laboratory results...</p></div>:
       filtered.length===0?(
        <NurseEmptyState symbol="◇" title={search||filter!=='all'?'No matching laboratory results':'No laboratory results available'} description={search||filter!=='all'?'Adjust the search or status filter to view other results.':'Completed investigations will appear here once results are entered by the laboratory team.'}>
          {(search||filter!=='all')&&<Btn onClick={()=>{setSearch('');setFilter('all');}} v="ghost">Clear filters</Btn>}
        </NurseEmptyState>
       ):
        <Table cols={[{key:'pt',label:'Patient',w:'24%'},{key:'test',label:'Investigation',w:'22%'},{key:'res',label:'Recorded Result',w:'17%'},{key:'ref',label:'Reference Range',w:'16%'},{key:'date',label:'Result Date',w:'11%'},{key:'stat',label:'Lab Status',w:'10%'}]}
          rows={filtered.map(r=>({
            pt:<div className="patient-name-cell"><span className="patient-avatar" style={{background:'#F5F3FF',color:'#7C3AED'}}>{(r.patient_name||'P').charAt(0).toUpperCase()}</span><div><span style={{fontWeight:800,color:'#172033'}}>{r.patient_name||'Unnamed patient'}</span><span style={{fontSize:10.5,color:'#8490A3',display:'block',marginTop:2}}>Laboratory result</span></div></div>,
            test:<span style={{fontWeight:700,color:'#344056',textTransform:'capitalize'}}>{r.test_type||r.test_name||'—'}</span>,
            res:<span style={{fontWeight:700,color:statusOf(r)==='abnormal'?'#DC2626':statusOf(r)==='critical'?'#991B1B':'#15803D'}}>{r.result_value||'—'}</span>,
            ref:<span style={{color:'#68758A',fontSize:12.5}}>{r.reference_range||'Not supplied'}</span>,
            date:<span style={{color:'#64748B',fontSize:12}}>{fmtDate(r.result_date||r.created_at)}</span>,
            stat:statusBadge(r.result_status||'normal')
          }))} empty="No lab results yet."/>
      }
    </AL>
  );
};

/* ══════════════════════════════════════
   LAB TECHNICIAN MODULE
══════════════════════════════════════ */
const labNav=[
  {path:'/lab-dashboard',label:'Dashboard', icon:'▦'},
  {path:'/lab-queue',    label:'Lab Queue', icon:'◇'},
];

const LabDashboard=()=>{
  const nv=useNavigate();
  const [requests,setRequests]=React.useState([]);
  const [loading,setLoading]=React.useState(true);
  const load=()=>{
    setLoading(true);
    fetch(`${BASE_URL}/api/lab-requests`,{headers:ah()})
      .then(r=>r.json()).then(d=>setRequests(Array.isArray(d)?d:[]))
      .catch(()=>{}).finally(()=>setLoading(false));
  };
  React.useEffect(load,[]);
  const pending=requests.filter(x=>(x.status||'').toLowerCase()==='pending');
  const completed=requests.filter(x=>(x.status||'').toLowerCase()==='completed');
  const uniquePatients=new Set(requests.map(x=>x.patient_id||x.patient_name).filter(Boolean)).size;
  const technician=localStorage.getItem('display_name')||'Lab Technician';
  const hour=new Date().getHours();
  const greeting=hour<12?'Good morning':hour<18?'Good afternoon':'Good evening';
  return(
    <AL nav={labNav} title="Laboratory Dashboard">
      <section className="nurse-hero" style={{background:'radial-gradient(circle at 82% 17%,rgba(196,181,253,.27),transparent 28%),linear-gradient(135deg,#111C31 0%,#2E316C 64%,#5B21B6 145%)'}}>
        <div className="nurse-hero-content">
          <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:11}}>
            <span style={{width:7,height:7,borderRadius:'50%',background:'#C4B5FD',boxShadow:'0 0 0 5px rgba(196,181,253,.12)'}}/>
            <span style={{fontSize:11,fontWeight:700,color:'#DDD6FE',textTransform:'uppercase',letterSpacing:.85}}>Laboratory operations • {pending.length} pending</span>
          </div>
          <h2 style={{fontSize:'clamp(25px,3vw,36px)',fontWeight:800,marginBottom:7}}>{greeting}, {technician.split(' ')[0]}.</h2>
          <p style={{fontSize:13,color:'rgba(255,255,255,.65)',lineHeight:1.6}}>Process investigation requests accurately and return verified results to the clinical team.</p>
        </div>
        <div className="nurse-hero-actions">
          <button type="button" onClick={load} style={{padding:'12px 16px',borderRadius:11,border:'1px solid rgba(255,255,255,.18)',background:'rgba(255,255,255,.08)',color:'white',fontWeight:700,cursor:'pointer'}}>↻ Refresh</button>
          <button type="button" onClick={()=>nv('/lab-queue')} style={{padding:'12px 16px',borderRadius:11,border:'1px solid #DDD6FE',background:'#F5F3FF',color:'#6D28D9',fontWeight:800,cursor:'pointer'}}>Open laboratory queue →</button>
        </div>
      </section>

      <div className="nurse-kpi-grid">
        <RoleKpi label="Pending requests" value={pending.length} symbol="◷" color="#B45309" bg="#FFFBEB" meta="Awaiting result entry" loading={loading}/>
        <RoleKpi label="Completed requests" value={completed.length} symbol="✓" color="#15803D" bg="#F0FDF4" meta="Results returned to clinicians" loading={loading}/>
        <RoleKpi label="Total requests" value={requests.length} symbol="◇" color="#7C3AED" bg="#F5F3FF" meta="Current laboratory workload" loading={loading}/>
        <RoleKpi label="Patients represented" value={uniquePatients} symbol="◎" color="#2563EB" bg="#EFF6FF" meta="Across all current requests" loading={loading}/>
      </div>

      <div className="nurse-dashboard-grid">
        <section className="clinical-panel">
          <div className="clinical-panel-header">
            <div><h3 style={{fontSize:16,color:'#172033'}}>Pending worklist</h3><p style={{fontSize:12,color:'#8490A3',marginTop:4}}>Requests ready for laboratory processing</p></div>
            <button type="button" onClick={()=>nv('/lab-queue')} style={{border:0,background:'none',color:'#7C3AED',fontSize:12,fontWeight:800,cursor:'pointer'}}>View full queue →</button>
          </div>
          <div className="clinical-panel-body">
            {loading?<div style={{padding:'34px 10px',textAlign:'center',color:'#8490A3',fontSize:13}}>Loading laboratory worklist...</div>:
             pending.length===0?<NurseEmptyState symbol="✓" title="No pending laboratory requests" description="New investigation requests from doctors will appear here automatically."/>:
             pending.slice(0,5).map((r,index)=>(
              <div className="queue-preview-row" key={r.lab_request_id||index}>
                <div className="patient-name-cell"><span className="patient-avatar" style={{background:'#F5F3FF',color:'#7C3AED'}}>{(r.patient_name||'P').charAt(0).toUpperCase()}</span><div><p style={{fontSize:13,fontWeight:800,color:'#263247'}}>{r.patient_name||'Unnamed patient'}</p><p style={{fontSize:10.5,color:'#8490A3',marginTop:3}}>Request #{r.lab_request_id||index+1}</p></div></div>
                <div className="queue-preview-secondary"><p style={{fontSize:10,color:'#9AA5B5',textTransform:'uppercase',fontWeight:700}}>Investigation</p><p style={{fontSize:11.5,fontWeight:700,color:'#56647A',marginTop:3,textTransform:'capitalize'}}>{r.test_type||'Not specified'}</p></div>
                <div className="queue-preview-secondary"><Badge text={index===0?'Next':'Pending'} color="yellow"/></div>
                <Btn onClick={()=>nv('/lab-queue')} v={index===0?'blue':'ghost'} sz="sm">{index===0?'Process':'Open'}</Btn>
              </div>
             ))}
          </div>
        </section>
        <aside style={{display:'flex',flexDirection:'column',gap:18}}>
          <section className="clinical-panel">
            <div className="clinical-panel-header"><div><h3 style={{fontSize:16,color:'#172033'}}>Laboratory workflow</h3><p style={{fontSize:12,color:'#8490A3',marginTop:4}}>Standard request cycle</p></div></div>
            <div className="clinical-panel-body">
              {[['01','Review request','Confirm test and indication'],['02','Process specimen','Perform the requested investigation'],['03','Report result','Record status and return to doctor']].map(([n,title,copy],i)=>(
                <div key={n} style={{display:'flex',gap:11,padding:i?'13px 0 0':'0',marginTop:i?13:0,borderTop:i?'1px solid #EEF2F6':'none'}}>
                  <span className="workflow-number" style={{background:'#F5F3FF',color:'#7C3AED'}}>{n}</span>
                  <div><strong style={{display:'block',fontSize:12,color:'#263247'}}>{title}</strong><span style={{fontSize:10.5,color:'#8490A3',marginTop:3,display:'block'}}>{copy}</span></div>
                </div>
              ))}
            </div>
          </section>
          <section className="clinical-panel"><div className="clinical-panel-body">
            <p style={{fontSize:10,fontWeight:800,color:'#8490A3',textTransform:'uppercase',letterSpacing:.7}}>Worklist status</p>
            <h3 style={{fontSize:16,color:'#263247',marginTop:6}}>{pending.length?`${pending.length} request${pending.length===1?'':'s'} remaining`:'Queue completed'}</h3>
            <div className="shift-progress-track"><div className="shift-progress-fill" style={{width:`${requests.length?Math.round((completed.length/requests.length)*100):0}%`,background:'linear-gradient(90deg,#7C3AED,#A78BFA)'}}/></div>
            <div style={{display:'flex',justifyContent:'space-between',fontSize:11,color:'#8490A3'}}><span>{completed.length} completed</span><span>{requests.length} total</span></div>
          </div></section>
        </aside>
      </div>
    </AL>
  );
};

const LabQueue=()=>{
  const toast=useToast();
  const user=JSON.parse(localStorage.getItem('user')||'{}');
  const [requests,setRequests]=React.useState([]);
  const [loading,setLoading]=React.useState(true);
  const [sel,setSel]=React.useState(null);
  const [form,setForm]=React.useState({testName:'',resultValue:'',refRange:'',resultStatus:'normal',details:''});
  const [sub,setSub]=React.useState(false);
  const [search,setSearch]=React.useState('');
  const [filter,setFilter]=React.useState('all');

  const load=()=>{
    setLoading(true);
    fetch(`${BASE_URL}/api/lab-requests`,{headers:ah()})
      .then(r=>r.json()).then(d=>setRequests(Array.isArray(d)?d:[]))
      .catch(()=>{}).finally(()=>setLoading(false));
  };
  React.useEffect(load,[]);

  const submit=async()=>{
    if(!form.testName||!form.resultValue){toast.show('Test name and result value are required.','error');return;}
    setSub(true);
    try{
      const r=await fetch(`${BASE_URL}/api/lab-results`,{method:'POST',headers:ah(),
        body:JSON.stringify({lab_request_id:sel.lab_request_id,uploaded_by:user.user_id,
          test_name:form.testName,result_value:form.resultValue,reference_range:form.refRange,
          result_status:form.resultStatus,result_details:form.details})});
      if(r.ok){toast.show(`Results for ${sel.patient_name} submitted!`);setSel(null);setForm({testName:'',resultValue:'',refRange:'',resultStatus:'normal',details:''});load();}
      else toast.show('Failed.','error');
    }catch{toast.show('Network error.','error');}finally{setSub(false);}
  };

  const statusOf=r=>(r.status||'pending').toLowerCase();
  const pendingCount=requests.filter(r=>statusOf(r)==='pending').length;
  const completedCount=requests.filter(r=>statusOf(r)==='completed').length;
  const uniquePatients=new Set(requests.map(r=>r.patient_id||r.patient_name).filter(Boolean)).size;
  const filtered=requests.filter(r=>{
    const matchesSearch=(r.patient_name||'').toLowerCase().includes(search.toLowerCase())||(r.test_type||'').toLowerCase().includes(search.toLowerCase());
    return matchesSearch&&(filter==='all'||statusOf(r)===filter);
  });
  const openResult=r=>{
    setSel(r);
    setForm({testName:r.test_type||'',resultValue:'',refRange:'',resultStatus:'normal',details:''});
  };

  return(
    <AL nav={labNav} title="Laboratory Worklist" searchText={search} setSearchText={setSearch}>
      <Toast {...toast}/>
      <NursePageIntro kicker="Specimen & result workflow" title="Process laboratory requests"
        description="Review clinical indications, record investigation results, and return completed reports to the requesting clinical team.">
        <Btn onClick={load} v="ghost">↻ Refresh worklist</Btn>
      </NursePageIntro>
      <div className="nurse-mini-stats">
        <NurseMiniStat symbol="◷" value={loading?'—':pendingCount} label="Pending requests" color="#B45309" bg="#FFFBEB"/>
        <NurseMiniStat symbol="✓" value={loading?'—':completedCount} label="Completed requests" color="#15803D" bg="#F0FDF4"/>
        <NurseMiniStat symbol="◇" value={loading?'—':requests.length} label="Total worklist" color="#7C3AED" bg="#F5F3FF"/>
        <NurseMiniStat symbol="◎" value={loading?'—':uniquePatients} label="Patients represented" color="#2563EB" bg="#EFF6FF"/>
      </div>
      <div className="workflow-strip" aria-label="Laboratory workflow">
        <div className="workflow-step"><span className="workflow-number" style={{background:'#F5F3FF',color:'#7C3AED'}}>01</span><div><strong style={{fontSize:12,color:'#263247'}}>Review request</strong><span style={{display:'block',fontSize:10.5,color:'#8490A3',marginTop:3}}>Confirm test and indication</span></div></div>
        <div className="workflow-step"><span className="workflow-number" style={{background:'#F5F3FF',color:'#7C3AED'}}>02</span><div><strong style={{fontSize:12,color:'#263247'}}>Perform test</strong><span style={{display:'block',fontSize:10.5,color:'#8490A3',marginTop:3}}>Process the investigation</span></div></div>
        <div className="workflow-step"><span className="workflow-number" style={{background:'#F5F3FF',color:'#7C3AED'}}>03</span><div><strong style={{fontSize:12,color:'#263247'}}>Enter & release</strong><span style={{display:'block',fontSize:10.5,color:'#8490A3',marginTop:3}}>Submit result to the doctor</span></div></div>
      </div>
      <div className="nurse-toolbar">
        <div className="filter-pills" aria-label="Filter laboratory requests">
          {[['all','All requests',requests.length],['pending','Pending',pendingCount],['completed','Completed',completedCount]].map(([value,label,count])=>(
            <button type="button" key={value} onClick={()=>setFilter(value)} className={`filter-pill${filter===value?' is-active':''}`} style={filter===value?{background:'#7C3AED',borderColor:'#7C3AED'}:undefined}>{label} · {count}</button>
          ))}
        </div>
        <p style={{fontSize:11,color:'#8490A3'}}>{filtered.length} request{filtered.length===1?'':'s'} shown</p>
      </div>
      {loading?<div className="clinical-panel"><p style={{textAlign:'center',padding:45,color:'#94A3B8'}}>Loading laboratory worklist...</p></div>:
       filtered.length===0?(
        <NurseEmptyState symbol="◇" title={search||filter!=='all'?'No matching laboratory requests':'Laboratory worklist is clear'} description={search||filter!=='all'?'Adjust the search or status filter to view other requests.':'New investigation requests from clinicians will appear here automatically.'}>
          {(search||filter!=='all')&&<Btn onClick={()=>{setSearch('');setFilter('all');}} v="ghost">Clear filters</Btn>}
        </NurseEmptyState>
       ):
        <Table cols={[
          {key:'pt',    label:'Patient',          w:'25%'},
          {key:'test',  label:'Investigation',    w:'23%'},
          {key:'notes', label:'Clinical Indication',w:'26%'},
          {key:'stat',  label:'Request Status',   w:'12%'},
          {key:'act',   label:'Action',           w:'14%'},
        ]} rows={filtered.map(r=>({
          pt:<div className="patient-name-cell"><span className="patient-avatar" style={{background:'#F5F3FF',color:'#7C3AED'}}>{(r.patient_name||'P').charAt(0).toUpperCase()}</span><div><span style={{fontWeight:800,color:'#172033'}}>{r.patient_name||'Unnamed patient'}</span><span style={{fontSize:10.5,color:'#8490A3',display:'block',marginTop:2}}>Request #{r.lab_request_id||'—'}</span></div></div>,
          test:<div><span style={{fontWeight:700,color:'#344056',textTransform:'capitalize'}}>{r.test_type||'Not specified'}</span><span style={{fontSize:10.5,color:'#8490A3',display:'block',marginTop:2}}>{r.test_category||'Laboratory investigation'}</span></div>,
          notes:<span style={{color:r.clinical_indications?'#56647A':'#94A3B8',fontSize:12.5,lineHeight:1.5}}>{r.clinical_indications||'No clinical indication supplied'}</span>,
          stat: statusBadge(r.status||'pending'),
          act:statusOf(r)==='pending'
            ?<Btn onClick={()=>openResult(r)} v="blue" sz="sm">Enter result</Btn>
            :<Badge text="Released" color="green"/>
        }))} empty="No lab requests found."/>
      }
      <Modal open={!!sel} onClose={()=>{setSel(null);setForm({testName:'',resultValue:'',refRange:'',resultStatus:'normal',details:''}); }} title="Enter Laboratory Result" width={520}>
        <MB>
          <div className="vitals-patient-card" style={{background:'#F5F3FF',borderColor:'#DDD6FE'}}>
            <span className="patient-avatar" style={{background:'#EDE9FE',color:'#7C3AED'}}>{(sel?.patient_name||'P').charAt(0).toUpperCase()}</span>
            <div style={{flex:1,minWidth:0}}><strong style={{display:'block',fontSize:13,color:'#4C1D95'}}>{sel?.patient_name||'Unnamed patient'}</strong><span style={{fontSize:10.5,color:'#6B7280',marginTop:2,display:'block'}}>Request #{sel?.lab_request_id||'—'} · {sel?.test_type||'Investigation not specified'}</span></div>
            <Badge text="Pending" color="yellow"/>
          </div>
          {sel?.clinical_indications&&<div style={{padding:'11px 13px',background:'#F8FAFC',border:'1px solid #E5EAF1',borderRadius:10}}><p style={{fontSize:9.5,fontWeight:800,color:'#8490A3',textTransform:'uppercase',letterSpacing:.7,marginBottom:4}}>Clinical indication</p><p style={{fontSize:12,color:'#56647A',lineHeight:1.55}}>{sel.clinical_indications}</p></div>}
          <Field label="Test Name" required><input value={form.testName} onChange={e=>setForm({...form,testName:e.target.value})} placeholder="e.g. Full Blood Count" style={inp}/></Field>
          <div className="form-grid-2">
<Field label="Result Value" required>
  {['malaria','hiv','pregnancy','hepb','vdrl','typhoid'].includes(sel?.test_type) ? (
    <select value={form.resultValue} onChange={e=>setForm({...form,resultValue:e.target.value})} style={inp}>
      <option value="">— Select result —</option>
      {sel?.test_type==='bloodgroup' 
        ? ['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(o=><option key={o}>{o}</option>)
        : ['Positive','Negative','Reactive','Non-Reactive'].map(o=><option key={o}>{o}</option>)
      }
    </select>
  ) : sel?.test_type==='bloodgroup' ? (
    <select value={form.resultValue} onChange={e=>setForm({...form,resultValue:e.target.value})} style={inp}>
      <option value="">— Select blood group —</option>
      {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(o=><option key={o} value={o}>{o}</option>)}
    </select>
  ) : sel?.test_type==='sickle' ? (
    <select value={form.resultValue} onChange={e=>setForm({...form,resultValue:e.target.value})} style={inp}>
      <option value="">— Select result —</option>
      {['AA (Normal)','AS (Sickle Cell Trait)','SS (Sickle Cell Disease)','AC','SC'].map(o=><option key={o} value={o}>{o}</option>)}
    </select>
  ) : (
    <input value={form.resultValue} onChange={e=>setForm({...form,resultValue:e.target.value})} 
      placeholder={
        sel?.test_type==='fbc'?'e.g. Hb: 14.2 g/dL, WBC: 6.5':
        sel?.test_type==='rbs'||sel?.test_type==='fbs'?'e.g. 5.4 mmol/L':
        sel?.test_type==='lipid'?'e.g. Total Chol: 4.2 mmol/L':
        'Enter result value'
      } style={inp}/>
  )}
</Field>        
{!['malaria','hiv','pregnancy','hepb','vdrl','typhoid','sickle','bloodgroup'].includes(sel?.test_type) && (
  <Field label="Reference Range">
    <input value={form.refRange} onChange={e=>setForm({...form,refRange:e.target.value})} 
      placeholder="e.g. 12.0–16.0 g/dL" style={inp}/>
  </Field>
)}        
  </div>
          <Field label="Result Status">
            <select value={form.resultStatus} onChange={e=>setForm({...form,resultStatus:e.target.value})} style={{...inp,color:form.resultStatus==='critical'?'#991B1B':form.resultStatus==='abnormal'?'#DC2626':'#15803D',fontWeight:700}}>
              <option value="normal">Normal</option>
              <option value="abnormal">Abnormal</option>
              <option value="critical">Critical</option>
            </select>
          </Field>
          <Field label="Additional Notes">
            <textarea value={form.details} onChange={e=>setForm({...form,details:e.target.value})}
              placeholder="Document methodology, observations, comments, or verification notes..." style={{...inp,height:88,resize:'vertical',lineHeight:1.55}}/>
          </Field>
          <div style={{padding:'10px 13px',background:'#FFFBEB',border:'1px solid #FDE68A',borderRadius:10,fontSize:11.5,color:'#92400E',lineHeight:1.55}}><strong>Verify before release.</strong> Submitting this form makes the result available to the requesting clinical team.</div>
        </MB>
        <MF>
          <Btn onClick={()=>{setSel(null);setForm({testName:'',resultValue:'',refRange:'',resultStatus:'normal',details:''});}} v="ghost">Cancel</Btn>
          <Btn onClick={submit} disabled={sub} v="green">{sub?'Releasing result...':'Release result to doctor'}</Btn>
        </MF>
      </Modal>
    </AL>
  );
};

/* ══════════════════════════════════════
   PHARMACIST MODULE
══════════════════════════════════════ */
const pharmNav=[
  {path:'/pharm-dashboard',label:'Dispensing', icon:'Rx'},
  {path:'/pharm-inventory',label:'Inventory', icon:'▦'},
];

const pharmacyInventoryState=(item)=>{
  const quantity=Number(item.quantity||0);
  const expiry=item.expiry_date?new Date(item.expiry_date):null;
  const today=new Date();
  const thirtyDays=new Date(Date.now()+30*24*60*60*1000);
  if(quantity<=0)return 'out';
  if(expiry&&!Number.isNaN(expiry.getTime())&&expiry<today)return 'expired';
  if(expiry&&!Number.isNaN(expiry.getTime())&&expiry<thirtyDays)return 'expiring';
  if(quantity<=10)return 'low';
  return 'in';
};

const PharmacyStockBadge=({state})=>{
  const badges={
    in:{text:'In stock',color:'green'},
    low:{text:'Low stock',color:'amber'},
    out:{text:'Out of stock',color:'red'},
    expiring:{text:'Expiring soon',color:'amber'},
    expired:{text:'Expired',color:'red'},
  };
  const badge=badges[state]||badges.in;
  return <Badge text={badge.text} color={badge.color}/>;
};

const PharmDashboard=()=>{
  const nv=useNavigate();
  const toast=useToast();
  const user=JSON.parse(localStorage.getItem('user')||'{}');
  const [prescriptions,setPrescriptions]=React.useState([]);
  const [inventory,setInventory]=React.useState([]);
  const [loading,setLoading]=React.useState(true);
  const [sel,setSel]=React.useState(null);
  const [medicineId,setMedicineId]=React.useState('');
  const [qty,setQty]=React.useState('');
  const [sub,setSub]=React.useState(false);
  const [search,setSearch]=React.useState('');
  const [filter,setFilter]=React.useState('pending');

  const load=()=>{
    setLoading(true);
    Promise.all([
      fetch(`${BASE_URL}/api/prescriptions`,{headers:ah()}).then(r=>r.json()),
      fetch(`${BASE_URL}/api/inventory`,{headers:ah()}).then(r=>r.json())
    ]).then(([p,inv])=>{setPrescriptions(Array.isArray(p)?p:[]);setInventory(Array.isArray(inv)?inv:[]); })
    .catch(()=>{}).finally(()=>setLoading(false));
  };
  React.useEffect(load,[]);

  const dispense=async()=>{
    if(!medicineId||!qty){toast.show('Please select medicine and enter quantity.','error');return;}
    const med=inventory.find(m=>String(m.medicine_id)===String(medicineId));
    if(!med){toast.show('The selected inventory batch is unavailable.','error');return;}
    if(Number(qty)<=0){toast.show('Quantity must be greater than zero.','error');return;}
    if(Number(qty)>Number(med.quantity||0)){toast.show(`Only ${med.quantity||0} units are available in this batch.`,'error');return;}
    setSub(true);
    try{
      const r=await fetch(`${BASE_URL}/api/dispensed`,{method:'POST',headers:ah(),
        body:JSON.stringify({prescription_id:sel.prescription_id,medicine_id:parseInt(medicineId),
          dispensed_by:user.user_id,batch_number:med?.batch_number||'',quantity_dispensed:parseInt(qty)})});
      if(r.ok){toast.show(`Dispensed to ${sel.patient_name}!`);setSel(null);setMedicineId('');setQty('');load();}
      else{const e=await r.json().catch(()=>({}));toast.show(e.message||'Failed.','error');}
    }catch{toast.show('Network error.','error');}finally{setSub(false);}
  };

  const statusOf=p=>(p.status||'pending').toLowerCase();
  const pending=prescriptions.filter(p=>statusOf(p)!=='dispensed');
  const dispensed=prescriptions.filter(p=>statusOf(p)==='dispensed');
  const stockAlerts=inventory.filter(m=>pharmacyInventoryState(m)!=='in');
  const availableInventory=inventory.filter(m=>!['out','expired'].includes(pharmacyInventoryState(m)));
  const selectedMedicine=inventory.find(m=>String(m.medicine_id)===String(medicineId));
  const filtered=prescriptions.filter(p=>{
    const matchesSearch=(p.patient_name||'').toLowerCase().includes(search.toLowerCase())||
      (p.medication_name||'').toLowerCase().includes(search.toLowerCase())||
      (p.doctor_name||'').toLowerCase().includes(search.toLowerCase());
    const matchesFilter=filter==='all'||(filter==='pending'?statusOf(p)!=='dispensed':statusOf(p)==='dispensed');
    return matchesSearch&&matchesFilter;
  });
  const hour=new Date().getHours();
  const greeting=hour<12?'Good morning':hour<18?'Good afternoon':'Good evening';
  const pharmacist=localStorage.getItem('display_name')||'Pharmacist';

  return(
    <AL nav={pharmNav} title="Pharmacy Dashboard" searchText={search} setSearchText={setSearch}>
      <Toast {...toast}/>
      <section className="nurse-hero" style={{background:'radial-gradient(circle at 82% 18%,rgba(52,211,153,.25),transparent 29%),linear-gradient(125deg,#062D2B 0%,#0F5F57 58%,#0F766E 100%)'}}>
        <div className="nurse-hero-content">
          <p style={{fontSize:11,fontWeight:800,letterSpacing:'.12em',textTransform:'uppercase',color:'#6EE7D0',marginBottom:8}}>Medication operations</p>
          <h2 style={{fontSize:'clamp(25px,3vw,36px)',fontWeight:800,marginBottom:7}}>{greeting}, {pharmacist.split(' ')[0]}.</h2>
          <p style={{fontSize:13,color:'rgba(255,255,255,.65)',lineHeight:1.6}}>Verify prescriptions, select the correct batch, and keep every dispense traceable.</p>
        </div>
        <div className="nurse-hero-actions">
          <Btn onClick={load} v="ghost">↻ Refresh</Btn>
          <Btn onClick={()=>nv('/pharm-inventory')} v="green">Open inventory →</Btn>
        </div>
      </section>

      <div className="nurse-kpi-grid">
        <RoleKpi label="Pending dispensing" value={pending.length} symbol="Rx" color="#B45309" bg="#FFFBEB" meta="Prescriptions requiring action" loading={loading}/>
        <RoleKpi label="Dispensed records" value={dispensed.length} symbol="✓" color="#15803D" bg="#F0FDF4" meta="All completed prescriptions returned" loading={loading}/>
        <RoleKpi label="Inventory batches" value={inventory.length} symbol="▦" color="#2563EB" bg="#EFF6FF" meta="Batches available for review" loading={loading}/>
        <RoleKpi label="Stock alerts" value={stockAlerts.length} symbol="!" color="#DC2626" bg="#FEF2F2" meta="Low, expired or expiring stock" loading={loading}/>
      </div>

      <section className="clinical-panel">
        <div className="clinical-panel-header">
          <div>
            <p style={{fontSize:11,fontWeight:800,letterSpacing:'.1em',textTransform:'uppercase',color:'#0F766E',marginBottom:5}}>Prescription worklist</p>
            <h3 style={{fontSize:18,color:'#1E293B'}}>Dispensing queue</h3>
            <p style={{fontSize:12.5,color:'#8490A3',marginTop:4}}>Review the prescribed regimen before selecting a stock batch.</p>
          </div>
          <div className="filter-pills">
            {[['pending','Pending',pending.length],['dispensed','Dispensed',dispensed.length],['all','All',prescriptions.length]].map(([key,label,count])=>(
              <button key={key} className={`filter-pill ${filter===key?'is-active':''}`} onClick={()=>setFilter(key)}>{label} · {count}</button>
            ))}
          </div>
        </div>
        <div style={{padding:18}}>
      {loading?<p style={{textAlign:'center',padding:40,color:'#94A3B8'}}>Loading...</p>:
        <Table cols={[
          {key:'pt',label:'Patient',w:'18%'},
          {key:'med',label:'Medication',w:'23%'},
          {key:'regimen',label:'Regimen',w:'23%'},
          {key:'dr',label:'Prescriber',w:'15%'},
          {key:'stat',label:'Status',w:'11%'},
          {key:'act',label:'Action',w:'10%'},
]} rows={filtered.map(p=>({
          pt:<div className="patient-name-cell"><span className="patient-avatar">{(p.patient_name||'P').charAt(0).toUpperCase()}</span><div><strong>{p.patient_name||'Unknown patient'}</strong><small>Prescription #{p.prescription_id||'—'}</small></div></div>,
          med:<div><p style={{fontWeight:750,color:'#1E293B',fontSize:13.5,margin:0}}>{p.medication_name||'—'}</p><p style={{fontSize:11.5,color:'#94A3B8',marginTop:3}}>Medication order</p></div>,
          regimen:<div><p style={{fontWeight:700,color:'#475569',fontSize:12.5,margin:0}}>{p.dosage||'Dose not stated'} · {p.frequency||'Frequency not stated'}</p><p style={{fontSize:11.5,color:'#94A3B8',marginTop:3}}>{p.duration||'Duration not stated'}</p></div>,
          dr:<span style={{color:'#64748B',fontSize:12.5}}>{p.doctor_name||'Not recorded'}</span>,
          stat:statusBadge(p.status||'pending'),
          act: (p.status||'').toLowerCase()==='dispensed'
            ?<span style={{fontSize:12,color:'#15803D',fontWeight:750}}>Completed</span>
            :<Btn onClick={()=>setSel(p)} v="blue" sz="sm">Review</Btn>
        }))} empty={search?'No prescriptions match your search.':'No prescriptions in this view.'}/>
      }
        </div>
      </section>

      <Modal open={!!sel} onClose={()=>{setSel(null);setMedicineId('');setQty(''); }} title="Dispense Prescription" width={500}>
        <MB>
          <div className="vitals-patient-card">
            <div className="patient-name-cell">
              <span className="patient-avatar">{(sel?.patient_name||'P').charAt(0).toUpperCase()}</span>
              <div><strong>{sel?.patient_name}</strong><small>Prescription #{sel?.prescription_id||'—'}</small></div>
            </div>
            <Badge text="Awaiting dispense" color="amber"/>
          </div>
          <div style={{padding:'13px 14px',background:'#F8FAFC',border:'1px solid #E5EAF1',borderRadius:12}}>
            <p style={{fontSize:11,fontWeight:800,textTransform:'uppercase',letterSpacing:'.08em',color:'#8490A3',marginBottom:6}}>Prescribed regimen</p>
            <p style={{margin:0,fontSize:14,fontWeight:750,color:'#1E293B'}}>{sel?.medication_name||'Medication not recorded'}</p>
            <p style={{margin:'4px 0 0',fontSize:12.5,color:'#64748B'}}>{sel?.dosage||'Dose not stated'} · {sel?.frequency||'Frequency not stated'} · {sel?.duration||'Duration not stated'}</p>
          </div>
          <Field label="Select Medicine from Inventory">
            <select value={medicineId} onChange={e=>setMedicineId(e.target.value)} style={{...inp,color:medicineId?'#0F172A':'#94A3B8'}}>
              <option value="">Choose an available batch</option>
              {availableInventory.map(m=>(
                <option key={m.medicine_id} value={m.medicine_id}>
                  {m.medicine_name} | Batch: {m.batch_number} | Stock: {m.quantity} units
                </option>
              ))}
            </select>
          </Field>
          {selectedMedicine&&<div style={{display:'flex',justifyContent:'space-between',gap:12,padding:'11px 13px',background:'#ECFDF5',border:'1px solid #A7F3D0',borderRadius:11}}>
            <div><p style={{fontSize:11,fontWeight:800,color:'#047857',marginBottom:3}}>BATCH {selectedMedicine.batch_number||'—'}</p><p style={{fontSize:12,color:'#47605D'}}>{selectedMedicine.quantity||0} units available · Expires {fmtDate(selectedMedicine.expiry_date)}</p></div>
            <PharmacyStockBadge state={pharmacyInventoryState(selectedMedicine)}/>
          </div>}
          <Field label="Quantity to Dispense">
            <input type="number" min="1" value={qty} onChange={e=>setQty(e.target.value)} placeholder="e.g. 21" style={inp}/>
          </Field>
          <p style={{fontSize:11.5,color:'#8490A3',lineHeight:1.55,margin:0}}>Confirm the medicine, strength, batch, quantity, and patient identity before completing this dispense.</p>
        </MB>
        <MF>
          <Btn onClick={()=>{setSel(null);setMedicineId('');setQty(''); }} v="ghost">Cancel</Btn>
          <Btn onClick={dispense} disabled={sub} v="green">{sub?'Dispensing...':'Confirm dispense'}</Btn>
        </MF>
      </Modal>
    </AL>
  );
};

const PharmInventory=()=>{
  const toast=useToast();
  const [inventory,setInventory]=React.useState([]);
  const [loading,setLoading]=React.useState(true);
  const [showAdd,setShowAdd]=React.useState(false);
  const [f,setF]=React.useState({medicine_name:'',category:'',batch_number:'',quantity:'',expiry_date:''});
  const [sub,setSub]=React.useState(false);
  const [search,setSearch]=React.useState('');
  const [filter,setFilter]=React.useState('all');

  const load=()=>{
    setLoading(true);
    fetch(`${BASE_URL}/api/inventory`,{headers:ah()}).then(r=>r.json())
    .then(inv=>setInventory(Array.isArray(inv)?inv:[]))
    .catch(()=>{}).finally(()=>setLoading(false));
  };
  React.useEffect(load,[]);

  const add=async()=>{
    if(!f.medicine_name||!f.batch_number||!f.quantity||!f.expiry_date){toast.show('Please fill required fields.','error');return;}
    setSub(true);
    try{
      const r=await fetch(`${BASE_URL}/api/inventory`,{method:'POST',headers:ah(),
        body:JSON.stringify({medicine_name:f.medicine_name,category:f.category||'General',
          batch_number:f.batch_number,quantity:parseInt(f.quantity),expiry_date:f.expiry_date})});
      if(r.ok){toast.show('Batch added!');setShowAdd(false);setF({medicine_name:'',category:'',batch_number:'',quantity:'',expiry_date:''});load();}
      else toast.show('Failed.','error');
    }catch{toast.show('Network error.','error');}finally{setSub(false);}
  };

  const counts=inventory.reduce((acc,item)=>{acc[pharmacyInventoryState(item)]++;return acc;},{in:0,low:0,out:0,expiring:0,expired:0});
  const alertCount=counts.low+counts.out+counts.expiring+counts.expired;
  const filtered=inventory.filter(item=>{
    const matchesSearch=(item.medicine_name||'').toLowerCase().includes(search.toLowerCase())||
      (item.category||'').toLowerCase().includes(search.toLowerCase())||
      (item.batch_number||'').toLowerCase().includes(search.toLowerCase());
    return matchesSearch&&(filter==='all'||pharmacyInventoryState(item)===filter);
  });
  const filterOptions=[
    ['all','All batches',inventory.length],
    ['in','In stock',counts.in],
    ['low','Low',counts.low],
    ['out','Out',counts.out],
    ['expiring','Expiring',counts.expiring],
    ['expired','Expired',counts.expired],
  ];

  return(
    <AL nav={pharmNav} title="Medicine Inventory" searchText={search} setSearchText={setSearch}>
      <Toast {...toast}/>
      <NursePageIntro kicker="Stock control" title="Medication batches" description="Track stock levels, expiry risk, and batch details before medicines reach the dispensing counter.">
        <Btn onClick={load} v="ghost">↻ Refresh</Btn>
        <Btn onClick={()=>setShowAdd(true)} v="blue">+ Add new batch</Btn>
      </NursePageIntro>

      <div className="nurse-mini-stats">
        <NurseMiniStat symbol="▦" value={loading?'—':inventory.length} label="Total batches" color="#2563EB" bg="#EFF6FF"/>
        <NurseMiniStat symbol="✓" value={loading?'—':counts.in} label="Healthy stock" color="#15803D" bg="#F0FDF4"/>
        <NurseMiniStat symbol="!" value={loading?'—':alertCount} label="Stock alerts" color="#B45309" bg="#FFFBEB"/>
        <NurseMiniStat symbol="×" value={loading?'—':counts.expired+counts.out} label="Unavailable batches" color="#DC2626" bg="#FEF2F2"/>
      </div>

      <section className="clinical-panel">
        <div className="clinical-panel-header">
          <div>
            <h3 style={{fontSize:17,color:'#1E293B'}}>Inventory register</h3>
            <p style={{fontSize:12.5,color:'#8490A3',marginTop:4}}>Use the filters to isolate stock requiring attention.</p>
          </div>
          <div className="filter-pills">
            {filterOptions.map(([key,label,count])=>(
              <button key={key} className={`filter-pill ${filter===key?'is-active':''}`} onClick={()=>setFilter(key)}>{label} · {count}</button>
            ))}
          </div>
        </div>
        <div style={{padding:18}}>
      {loading?<p style={{textAlign:'center',padding:40,color:'#94A3B8'}}>Loading...</p>:
        <Table cols={[
          {key:'name',label:'Medication',w:'29%'},
          {key:'cat',label:'Category',w:'16%'},
          {key:'batch',label:'Batch',w:'17%'},
          {key:'qty',label:'Available stock',w:'14%'},
          {key:'exp',label:'Expiry',w:'13%'},
          {key:'stat',label:'Status',w:'11%'},
        ]} rows={filtered.map(m=>({
          name:<div className="patient-name-cell"><span className="patient-avatar">Rx</span><div><strong>{m.medicine_name||'Unnamed medication'}</strong><small>Inventory item #{m.medicine_id||'—'}</small></div></div>,
          cat:<span style={{color:'#64748B',fontSize:12.5}}>{m.category||'General'}</span>,
          batch:<span style={{color:'#475569',fontFamily:'monospace',fontSize:12.5,fontWeight:700}}>{m.batch_number||'—'}</span>,
          qty:<div><strong style={{fontSize:13.5,color:['low','out'].includes(pharmacyInventoryState(m))?'#DC2626':'#1E293B'}}>{Number(m.quantity||0).toLocaleString()} units</strong><p style={{fontSize:11,color:'#94A3B8',marginTop:3}}>{Number(m.quantity||0)>0?'Available to allocate':'No units available'}</p></div>,
          exp:<div><span style={{color:'#475569',fontSize:12.5,fontWeight:650}}>{fmtDate(m.expiry_date)}</span><p style={{fontSize:11,color:'#94A3B8',marginTop:3}}>Batch expiry</p></div>,
          stat:<PharmacyStockBadge state={pharmacyInventoryState(m)}/>
        }))} empty={search?'No inventory batches match your search.':'No batches in this stock view.'}/>
      }
        </div>
      </section>

      <Modal open={showAdd} onClose={()=>setShowAdd(false)} title="Add New Medication Batch" width={480}>
        <MB>
          <div style={{padding:'12px 14px',background:'#F0FDFA',border:'1px solid #CCFBF1',borderRadius:12}}>
            <p style={{fontSize:12,fontWeight:800,color:'#0F766E',marginBottom:3}}>Batch registration</p>
            <p style={{fontSize:11.5,color:'#5F7470',lineHeight:1.5}}>Enter the label details exactly as supplied so the batch remains traceable during dispensing.</p>
          </div>
          <Field label="Medicine Name" required><input value={f.medicine_name} onChange={e=>setF({...f,medicine_name:e.target.value})} placeholder="e.g. Amoxicillin 500mg" style={inp}/></Field>
          <Field label="Category"><input value={f.category} onChange={e=>setF({...f,category:e.target.value})} placeholder="e.g. Antibiotic" style={inp}/></Field>
          <div className="form-grid-2">
            <Field label="Batch Number" required><input value={f.batch_number} onChange={e=>setF({...f,batch_number:e.target.value})} placeholder="e.g. GH-2026-001" style={inp}/></Field>
            <Field label="Quantity" required><input type="number" min="1" value={f.quantity} onChange={e=>setF({...f,quantity:e.target.value})} placeholder="e.g. 100" style={inp}/></Field>
          </div>
          <Field label="Expiry Date" required><input type="date" value={f.expiry_date} onChange={e=>setF({...f,expiry_date:e.target.value})} style={inp}/></Field>
        </MB>
        <MF>
          <Btn onClick={()=>setShowAdd(false)} v="ghost">Cancel</Btn>
          <Btn onClick={add} disabled={sub} v="blue">{sub?'Adding...':'Register batch'}</Btn>
        </MF>
      </Modal>
    </AL>
  );
};

/* ══════════════════════════════════════
   ADMIN MODULE
══════════════════════════════════════ */
const adminNav=[
  {path:'/admin-dashboard',label:'Overview',         icon:'▦'},
  {path:'/admin-users',    label:'Users & Access',   icon:'◎'},
  {path:'/admin-logs',     label:'Audit Trail',      icon:'≡'},
];

const adminRoleOf=user=>String(user?.role||user?.role_name||'Unknown').trim();

const AdminRoleBadge=({role})=>{
  const value=String(role||'Unknown');
  const key=value.toLowerCase();
  const color=key.includes('admin')?'red':
    key.includes('doctor')?'blue':
    key.includes('nurse')?'green':
    key.includes('lab')?'purple':
    key.includes('pharm')?'yellow':'gray';
  return <Badge text={value} color={color}/>;
};

const auditCategory=action=>{
  const value=String(action||'').toLowerCase();
  if(/login|logout|auth|user|account|staff|password|delete/.test(value))return 'Access';
  if(/lab|test|result|sample/.test(value))return 'Laboratory';
  if(/dispens|prescri|medic|pharm|inventory|stock/.test(value))return 'Medication';
  if(/patient|triage|vital|consult|admit|record|encounter|appointment/.test(value))return 'Clinical';
  return 'System';
};

const AuditCategoryBadge=({action})=>{
  const category=auditCategory(action);
  const colors={Access:'purple',Laboratory:'blue',Medication:'yellow',Clinical:'green',System:'gray'};
  return <Badge text={category} color={colors[category]}/>;
};

const AdminDashboard=()=>{
  const nv=useNavigate();
  const [users,setUsers]=React.useState([]);
  const [patients,setPatients]=React.useState([]);
  const [logs,setLogs]=React.useState([]);
  const [loading,setLoading]=React.useState(true);

  const load=()=>{
    setLoading(true);
    Promise.allSettled([
      fetch(`${BASE_URL}/api/users`,{headers:ah()}).then(r=>r.json()),
      fetch(`${BASE_URL}/api/patients`,{headers:ah()}).then(r=>r.json()),
      fetch(`${BASE_URL}/api/activity-logs`,{headers:ah()}).then(r=>r.json())
    ]).then(([u,p,l])=>{
      setUsers(u.status==='fulfilled'&&Array.isArray(u.value)?u.value:[]);
      setPatients(p.status==='fulfilled'&&Array.isArray(p.value)?p.value:[]);
      setLogs(l.status==='fulfilled'
        ?(Array.isArray(l.value)?l.value:(l.value?.logs||[]))
        :[]);
    }).finally(()=>setLoading(false));
  };
  React.useEffect(load,[]);

  const staff=users.filter(u=>adminRoleOf(u).toLowerCase()!=='patient');
  const activeAccounts=users.filter(u=>String(u.staff_status||u.status||'active').toLowerCase()!=='inactive');
  const waiting=patients.filter(p=>String(p.status||'').toLowerCase()==='waiting').length;
  const roleCounts=staff.reduce((acc,user)=>{
    const role=adminRoleOf(user);
    acc[role]=(acc[role]||0)+1;
    return acc;
  },{});
  const recentLogs=[...logs].sort((a,b)=>new Date(b.created_at||0)-new Date(a.created_at||0)).slice(0,5);
  const hour=new Date().getHours();
  const greeting=hour<12?'Good morning':hour<18?'Good afternoon':'Good evening';
  const adminName=localStorage.getItem('display_name')||'Administrator';

  return(
    <AL nav={adminNav} title="Admin Dashboard">
      <section className="nurse-hero" style={{background:'radial-gradient(circle at 82% 18%,rgba(129,140,248,.28),transparent 29%),linear-gradient(125deg,#11162D 0%,#253260 58%,#3730A3 115%)'}}>
        <div className="nurse-hero-content">
          <p style={{fontSize:11,fontWeight:800,letterSpacing:'.12em',textTransform:'uppercase',color:'#C7D2FE',marginBottom:8}}>Hospital administration</p>
          <h2 style={{fontSize:'clamp(25px,3vw,36px)',fontWeight:800,marginBottom:7}}>{greeting}, {adminName.split(' ')[0]}.</h2>
          <p style={{fontSize:13,color:'rgba(255,255,255,.66)',lineHeight:1.6}}>Monitor access, staffing coverage, patient flow, and accountable system activity.</p>
        </div>
        <div className="nurse-hero-actions">
          <Btn onClick={load} v="ghost">↻ Refresh</Btn>
          <Btn onClick={()=>nv('/admin-users')} v="blue">Manage access →</Btn>
        </div>
      </section>

      <div className="nurse-kpi-grid">
        <RoleKpi label="Clinical staff" value={staff.length} symbol="◎" color="#4F46E5" bg="#EEF2FF" meta="Non-patient user accounts" loading={loading}/>
        <RoleKpi label="Registered patients" value={patients.length} symbol="P" color="#2563EB" bg="#EFF6FF" meta="Patient records in the EMR" loading={loading}/>
        <RoleKpi label="Active accounts" value={activeAccounts.length} symbol="✓" color="#15803D" bg="#F0FDF4" meta="Users currently enabled" loading={loading}/>
        <RoleKpi label="Waiting patients" value={waiting} symbol="!" color="#B45309" bg="#FFFBEB" meta="Patients awaiting clinical flow" loading={loading}/>
      </div>

      <div className="nurse-dashboard-grid">
        <section className="clinical-panel">
          <div className="clinical-panel-header">
            <div><h3 style={{fontSize:17,color:'#1E293B'}}>Staff coverage by role</h3><p style={{fontSize:12.5,color:'#8490A3',marginTop:4}}>Current distribution of workforce accounts.</p></div>
            <Badge text={`${staff.length} staff`} color="purple"/>
          </div>
          <div className="clinical-panel-body">
            {loading?<p style={{padding:30,textAlign:'center',color:'#94A3B8'}}>Loading workforce...</p>:
              Object.keys(roleCounts).length===0?<NurseEmptyState symbol="◎" title="No staff accounts found" description="Add staff members to begin building the hospital workforce directory."/>:
              Object.entries(roleCounts).sort((a,b)=>b[1]-a[1]).map(([role,count])=>(
                <div key={role} style={{padding:'11px 0',borderBottom:'1px solid #EEF2F6'}}>
                  <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:14,marginBottom:8}}>
                    <AdminRoleBadge role={role}/><strong style={{fontSize:13,color:'#344056'}}>{count} account{count===1?'':'s'}</strong>
                  </div>
                  <div className="shift-progress-track" style={{margin:0}}>
                    <div className="shift-progress-fill" style={{width:`${Math.max(8,Math.round((count/Math.max(staff.length,1))*100))}%`,background:'linear-gradient(90deg,#4F46E5,#818CF8)'}}/>
                  </div>
                </div>
              ))
            }
          </div>
        </section>

        <section className="clinical-panel">
          <div className="clinical-panel-header"><div><h3 style={{fontSize:17,color:'#1E293B'}}>Administrative actions</h3><p style={{fontSize:12.5,color:'#8490A3',marginTop:4}}>Common access and oversight tasks.</p></div></div>
          <div className="clinical-panel-body">
            <button className="quick-action-card" onClick={()=>nv('/admin-users')}>
              <span className="nurse-icon-tile" style={{'--icon-bg':'#EEF2FF','--icon-color':'#4F46E5'}}>◎</span>
              <span><strong style={{display:'block',fontSize:13,color:'#263247'}}>Users and access</strong><small style={{color:'#8490A3'}}>Create or remove staff access</small></span>
              <span style={{marginLeft:'auto',color:'#4F46E5'}}>→</span>
            </button>
            <button className="quick-action-card" onClick={()=>nv('/admin-logs')}>
              <span className="nurse-icon-tile" style={{'--icon-bg':'#F0FDF4','--icon-color':'#15803D'}}>≡</span>
              <span><strong style={{display:'block',fontSize:13,color:'#263247'}}>Audit trail</strong><small style={{color:'#8490A3'}}>Review recorded system activity</small></span>
              <span style={{marginLeft:'auto',color:'#0F766E'}}>→</span>
            </button>
            <div style={{marginTop:14,padding:'13px 14px',borderRadius:12,background:'#F8FAFC',border:'1px solid #E5EAF1'}}>
              <p style={{fontSize:11,fontWeight:800,textTransform:'uppercase',letterSpacing:'.08em',color:'#8490A3',marginBottom:7}}>System snapshot</p>
              <p style={{fontSize:12,color:'#64748B',lineHeight:1.65}}>{users.length} total accounts · {logs.length} audit entries returned · {waiting} waiting patients</p>
            </div>
          </div>
        </section>
      </div>

      <section className="clinical-panel" style={{marginTop:18}}>
        <div className="clinical-panel-header">
          <div><h3 style={{fontSize:17,color:'#1E293B'}}>Recent system activity</h3><p style={{fontSize:12.5,color:'#8490A3',marginTop:4}}>Latest entries available from the audit service.</p></div>
          <Btn onClick={()=>nv('/admin-logs')} v="ghost" sz="sm">View full trail →</Btn>
        </div>
        <div className="clinical-panel-body">
          {loading?<p style={{padding:22,textAlign:'center',color:'#94A3B8'}}>Loading activity...</p>:
            recentLogs.length===0?<NurseEmptyState symbol="≡" title="No audit entries returned" description="The audit service has not returned any recorded system activity yet."/>:
            recentLogs.map(log=>(
              <div key={log.log_id||log.activity_id||`${log.created_at}-${log.action}`} className="queue-preview-row" style={{gridTemplateColumns:'minmax(0,1.3fr) minmax(120px,.5fr) minmax(140px,.7fr) auto'}}>
                <div className="patient-name-cell"><span className="patient-avatar">{(log.staff_name||'S').charAt(0).toUpperCase()}</span><div><strong>{log.staff_name||'System'}</strong><small>{log.action||'Activity recorded'}</small></div></div>
                <AdminRoleBadge role={log.role_name||'System'}/>
                <span className="queue-preview-secondary" style={{fontSize:12,color:'#8490A3'}}>{fmtDT(log.created_at)}</span>
                <AuditCategoryBadge action={log.action}/>
              </div>
            ))
          }
        </div>
      </section>
    </AL>
  );
};

const AdminUsers=()=>{
  const toast=useToast();
  const [staff,setStaff]=React.useState([]);
  const [loading,setLoading]=React.useState(true);
  const [search,setSearch]=React.useState('');
  const [showAdd,setShowAdd]=React.useState(false);
  const [f,setF]=React.useState({full_name:'',email:'',password:'',role_id:''});
  const [sub,setSub]=React.useState(false);
  const [filter,setFilter]=React.useState('all');
  const [removeTarget,setRemoveTarget]=React.useState(null);
  const [removing,setRemoving]=React.useState(false);
  const currentUser=JSON.parse(localStorage.getItem('user')||'{}');

  const load=()=>{
    setLoading(true);
    fetch(`${BASE_URL}/api/users`,{headers:ah()})
      .then(r=>r.json()).then(d=>setStaff(Array.isArray(d)?d:[]))
      .catch(()=>{}).finally(()=>setLoading(false));
  };
  React.useEffect(load,[]);

  const addStaff=async()=>{
    if(!f.full_name||!f.email||!f.password||!f.role_id){toast.show('All fields required.','error');return;}
    setSub(true);
    try{
      const r=await fetch(`${BASE_URL}/api/auth/register`,{method:'POST',headers:ah(),
        body:JSON.stringify({full_name:f.full_name,email:f.email,password:f.password,role_id:parseInt(f.role_id)})});
      const d=await r.json();
      if(r.ok){toast.show(`${f.full_name} added!`);setShowAdd(false);setF({full_name:'',email:'',password:'',role_id:''});setTimeout(load,1000);}
      else toast.show(d.message||'Failed.','error');
    }catch{toast.show('Network error.','error');}finally{setSub(false);}
  };

  const del=async()=>{
    if(!removeTarget)return;
    setRemoving(true);
    try{
      const r=await fetch(`${BASE_URL}/api/users/${removeTarget.user_id}`,{method:'DELETE',headers:ah()});
      if(r.ok){
        setStaff(prev=>prev.filter(s=>String(s.user_id)!==String(removeTarget.user_id)));
        toast.show(`${removeTarget.full_name} removed.`);
        setRemoveTarget(null);
      }else toast.show('Failed to remove this account.','error');
    }catch{toast.show('Network error.','error');}
    finally{setRemoving(false);}
  };

  const staffAccounts=staff.filter(s=>adminRoleOf(s).toLowerCase()!=='patient');
  const patientAccounts=staff.filter(s=>adminRoleOf(s).toLowerCase()==='patient');
  const activeAccounts=staff.filter(s=>String(s.staff_status||s.status||'active').toLowerCase()!=='inactive');
  const filtered=staff.filter(s=>{
    const query=search.toLowerCase();
    const matchesSearch=(s.full_name||'').toLowerCase().includes(query)||
      adminRoleOf(s).toLowerCase().includes(query)||
      (s.email||'').toLowerCase().includes(query)||
      (s.staff_id||'').toLowerCase().includes(query);
    const role=adminRoleOf(s).toLowerCase();
    const matchesFilter=filter==='all'||(filter==='staff'?role!=='patient':filter==='patient'?role==='patient':
      String(s.staff_status||s.status||'active').toLowerCase()==='inactive');
    return matchesSearch&&matchesFilter;
  });

  return(
    <AL nav={adminNav} title="Users & Access" searchText={search} setSearchText={setSearch}>
      <Toast {...toast}/>
      <NursePageIntro kicker="Identity administration" title="User and access directory" description="Review hospital accounts, distinguish staff from patients, and control who can access clinical workflows.">
        <Btn onClick={load} v="ghost">↻ Refresh</Btn>
        <Btn onClick={()=>setShowAdd(true)} v="blue">+ Add staff member</Btn>
      </NursePageIntro>

      <div className="nurse-mini-stats">
        <NurseMiniStat symbol="◎" value={loading?'—':staff.length} label="Total accounts" color="#4F46E5" bg="#EEF2FF"/>
        <NurseMiniStat symbol="S" value={loading?'—':staffAccounts.length} label="Staff accounts" color="#2563EB" bg="#EFF6FF"/>
        <NurseMiniStat symbol="P" value={loading?'—':patientAccounts.length} label="Patient accounts" color="#0F766E" bg="#ECFDF5"/>
        <NurseMiniStat symbol="✓" value={loading?'—':activeAccounts.length} label="Active accounts" color="#15803D" bg="#F0FDF4"/>
      </div>

      <section className="clinical-panel">
        <div className="clinical-panel-header">
          <div><h3 style={{fontSize:17,color:'#1E293B'}}>Account register</h3><p style={{fontSize:12.5,color:'#8490A3',marginTop:4}}>Patient portal accounts are shown separately from workforce access.</p></div>
          <div className="filter-pills">
            {[['all','All',staff.length],['staff','Staff',staffAccounts.length],['patient','Patients',patientAccounts.length],['inactive','Inactive',staff.length-activeAccounts.length]].map(([key,label,count])=>(
              <button key={key} className={`filter-pill ${filter===key?'is-active':''}`} onClick={()=>setFilter(key)}>{label} · {count}</button>
            ))}
          </div>
        </div>
        <div style={{padding:18}}>
      {loading?<p style={{textAlign:'center',padding:40,color:'#94A3B8'}}>Loading...</p>:
        <Table cols={[
          {key:'name',label:'Account holder',w:'26%'},
          {key:'sid',label:'Identifier',w:'14%'},
          {key:'role',label:'Access role',w:'15%'},
          {key:'email',label:'Email address',w:'24%'},
          {key:'stat',label:'Status',w:'11%'},
          {key:'act',label:'Access',w:'10%'},
        ]} rows={filtered.map(s=>({
          name:<div className="patient-name-cell"><span className="patient-avatar" style={{background:'#EEF2FF',color:'#4F46E5'}}>{(s.full_name||'U').charAt(0).toUpperCase()}</span><div><strong>{s.full_name||'Unnamed account'}</strong><small>User #{s.user_id||'—'}</small></div></div>,
          sid:<span style={{color:'#64748B',fontFamily:'monospace',fontSize:12,fontWeight:650}}>{s.staff_id||'Portal account'}</span>,
          role:<AdminRoleBadge role={adminRoleOf(s)}/>,
          email:<span style={{color:'#64748B',fontSize:12.5}}>{s.email||'No email recorded'}</span>,
          stat:statusBadge(s.staff_status||s.status||'active'),
          act:String(s.user_id)===String(currentUser.user_id)
            ?<Badge text="Current account" color="blue"/>
            :<Btn onClick={()=>setRemoveTarget(s)} v="ghost" sz="sm" style={{color:'#DC2626'}}>Remove</Btn>
        }))} empty={search?'No accounts match your search.':'No accounts in this view.'}/>
      }
        </div>
      </section>

      <Modal open={showAdd} onClose={()=>setShowAdd(false)} title="Add New Staff Member" width={460}>
        <MB>
          <div style={{padding:'12px 14px',background:'#EEF2FF',border:'1px solid #C7D2FE',borderRadius:12}}>
            <p style={{fontSize:12,fontWeight:800,color:'#4338CA',marginBottom:3}}>Workforce access</p>
            <p style={{fontSize:11.5,color:'#5B5F79',lineHeight:1.5}}>Create only the access level required for this staff member’s hospital responsibilities.</p>
          </div>
          <Field label="Full Name" required><input value={f.full_name} onChange={e=>setF({...f,full_name:e.target.value})} placeholder="e.g. Dr. Kwame Asante" style={inp}/></Field>
          <Field label="Email" required><input type="email" value={f.email} onChange={e=>setF({...f,email:e.target.value})} placeholder="e.g. kwame@hospital.com" style={inp}/></Field>
          <Field label="Password" required><input type="password" value={f.password} onChange={e=>setF({...f,password:e.target.value})} placeholder="Temporary password" style={inp}/></Field>
          <Field label="Role" required>
            <select value={f.role_id} onChange={e=>setF({...f,role_id:e.target.value})} style={{...inp,color:f.role_id?'#0F172A':'#94A3B8'}}>
              <option value="">— Select role —</option>
              <option value="2">Doctor</option>
              <option value="3">Nurse</option>
              <option value="5">Pharmacist</option>
              <option value="4">Lab Technician</option>
              <option value="1">Admin</option>
            </select>
          </Field>
          <p style={{fontSize:11.5,color:'#8490A3',lineHeight:1.55,margin:0}}>Share the temporary password securely and ask the staff member to protect their credentials.</p>
        </MB>
        <MF>
          <Btn onClick={()=>setShowAdd(false)} v="ghost">Cancel</Btn>
          <Btn onClick={addStaff} disabled={sub} v="blue">{sub?'Creating...':'Create staff account'}</Btn>
        </MF>
      </Modal>

      <Modal open={!!removeTarget} onClose={()=>setRemoveTarget(null)} title="Remove User Access" width={440}>
        <MB>
          <div className="vitals-patient-card" style={{background:'#FEF2F2',borderColor:'#FECACA'}}>
            <span className="patient-avatar" style={{background:'#FEE2E2',color:'#DC2626'}}>{(removeTarget?.full_name||'U').charAt(0).toUpperCase()}</span>
            <div><strong style={{display:'block',color:'#1E293B'}}>{removeTarget?.full_name}</strong><small style={{color:'#64748B'}}>{removeTarget?.email||'No email'} · {adminRoleOf(removeTarget)}</small></div>
          </div>
          <p style={{fontSize:13,color:'#64748B',lineHeight:1.65}}>This removes the account from the EMR. The user may immediately lose access to their assigned workflows.</p>
          <div style={{padding:'11px 13px',borderRadius:10,background:'#FFFBEB',border:'1px solid #FDE68A',fontSize:11.5,color:'#92400E'}}><strong>Important:</strong> confirm this is the correct account before continuing.</div>
        </MB>
        <MF>
          <Btn onClick={()=>setRemoveTarget(null)} v="ghost">Cancel</Btn>
          <Btn onClick={del} disabled={removing} v="danger">{removing?'Removing...':'Remove account'}</Btn>
        </MF>
      </Modal>
    </AL>
  );
};

const AdminLogs=()=>{
  const [logs,setLogs]=React.useState([]);
  const [summary,setSummary]=React.useState({total:0,today:0,unique_staff:0,affected_patients:0,failed:0});
  const [loading,setLoading]=React.useState(true);
  const [search,setSearch]=React.useState('');
  const [filter,setFilter]=React.useState('all');
  const [selectedLog,setSelectedLog]=React.useState(null);

  const load=()=>{
    setLoading(true);
    fetch(`${BASE_URL}/api/activity-logs?limit=500`,{headers:ah()})
      .then(r=>r.json()).then(d=>{
        setLogs(Array.isArray(d)?d:(d.logs||[]));
        if(d?.summary)setSummary(d.summary);
      })
      .catch(()=>{}).finally(()=>setLoading(false));
  };
  React.useEffect(load,[]);

  const categories=['Clinical','Access','Laboratory','Medication','System'];
  const todayCount=Number(summary.today||logs.filter(l=>l.created_at&&new Date(l.created_at).toDateString()===new Date().toDateString()).length);
  const uniqueStaff=Number(summary.unique_staff||new Set(logs.map(l=>l.staff_name).filter(Boolean)).size);
  const affectedPatients=Number(summary.affected_patients||new Set(logs.map(l=>l.patient_name).filter(Boolean)).size);
  const failedCount=Number(summary.failed||logs.filter(l=>String(l.status||'success').toLowerCase()!=='success').length);
  const filtered=logs.filter(l=>{
    const query=search.toLowerCase();
    const matchesSearch=(l.staff_name||'').toLowerCase().includes(query)||
      (l.action||'').toLowerCase().includes(query)||
      (l.role_name||'').toLowerCase().includes(query)||
      (l.patient_name||'').toLowerCase().includes(query);
    return matchesSearch&&(filter==='all'||auditCategory(l.action)===filter);
  });

  return(
    <AL nav={adminNav} title="Audit Trail" searchText={search} setSearchText={setSearch}>
      <NursePageIntro kicker="Accountability & oversight" title="System activity trail" description="Trace automatically recorded access and changes back to the responsible staff member, patient, visit, device, and request.">
        <Btn onClick={load} v="ghost">↻ Refresh logs</Btn>
      </NursePageIntro>

      <div className="nurse-mini-stats">
        <NurseMiniStat symbol="≡" value={loading?'—':Number(summary.total||logs.length)} label="Total entries" color="#4F46E5" bg="#EEF2FF"/>
        <NurseMiniStat symbol="D" value={loading?'—':todayCount} label="Recorded today" color="#2563EB" bg="#EFF6FF"/>
        <NurseMiniStat symbol="S" value={loading?'—':uniqueStaff} label="Staff represented" color="#0F766E" bg="#ECFDF5"/>
        <NurseMiniStat symbol="!" value={loading?'—':failedCount} label="Failed events" color="#DC2626" bg="#FEF2F2"/>
      </div>

      <section className="clinical-panel">
        <div className="clinical-panel-header">
          <div><h3 style={{fontSize:17,color:'#1E293B'}}>Recorded activity</h3><p style={{fontSize:12.5,color:'#8490A3',marginTop:4}}>{affectedPatients} patient record{affectedPatients===1?'':'s'} referenced · select Details for the complete event.</p></div>
          <div className="filter-pills">
            <button className={`filter-pill ${filter==='all'?'is-active':''}`} onClick={()=>setFilter('all')}>All · {logs.length}</button>
            {categories.map(category=>{
              const count=logs.filter(log=>auditCategory(log.action)===category).length;
              return <button key={category} className={`filter-pill ${filter===category?'is-active':''}`} onClick={()=>setFilter(category)}>{category} · {count}</button>;
            })}
          </div>
        </div>
        <div style={{padding:18}}>
      {loading?<p style={{textAlign:'center',padding:40,color:'#94A3B8'}}>Loading activity trail...</p>:
        filtered.length===0?<NurseEmptyState symbol="≡" title={logs.length?'No matching audit entries':'No audit entries returned'} description={logs.length?'Try another category or search term.':'The audit endpoint is available, but it has not returned any recorded actions yet.'}/>:
        <Table cols={[
          {key:'ts',label:'Timestamp',w:'16%'},
          {key:'staff',label:'Actor',w:'18%'},
          {key:'role',label:'Role',w:'11%'},
          {key:'act',label:'Recorded action',w:'23%'},
          {key:'pt',label:'Patient reference',w:'14%'},
          {key:'stat',label:'Category',w:'9%'},
          {key:'detail',label:'',w:'9%'},
        ]} rows={filtered.map(l=>({
          ts:<div><span style={{color:'#475569',fontSize:12,fontWeight:650}}>{fmtDT(l.created_at)}</span><p style={{fontSize:10.5,color:'#94A3B8',marginTop:3}}>Server timestamp</p></div>,
          staff:<div className="patient-name-cell"><span className="patient-avatar" style={{background:'#EEF2FF',color:'#4F46E5'}}>{(l.staff_name||'S').charAt(0).toUpperCase()}</span><div><strong>{l.staff_name||'System'}</strong><small>Recorded actor</small></div></div>,
          role:<AdminRoleBadge role={l.role_name||'System'}/>,
          act:<div><p style={{fontWeight:700,color:'#344056',fontSize:12.5,margin:0}}>{l.action||'Activity recorded'}</p><p style={{fontSize:10.5,color:String(l.status||'success').toLowerCase()==='success'?'#15803D':'#DC2626',marginTop:3,fontWeight:700}}>{l.status||'success'}</p></div>,
          pt:<span style={{color:'#64748B',fontSize:12.5}}>{l.patient_name||'Not patient-specific'}</span>,
          stat:<AuditCategoryBadge action={l.action}/>,
          detail:<Btn onClick={()=>setSelectedLog(l)} v="ghost" sz="sm">Details</Btn>
        }))}/>
      }
        </div>
      </section>

      <Modal open={!!selectedLog} onClose={()=>setSelectedLog(null)} title={`Audit Event #${selectedLog?.log_id||'—'}`} width={650}>
        <MB>
          <div className="vitals-patient-card" style={{background:'#F8FAFC'}}>
            <span className="patient-avatar" style={{background:'#EEF2FF',color:'#4F46E5'}}>{(selectedLog?.staff_name||'S').charAt(0).toUpperCase()}</span>
            <div style={{flex:1}}><strong style={{display:'block',color:'#263247'}}>{selectedLog?.staff_name||'System'}</strong><small style={{color:'#64748B'}}>{selectedLog?.role_name||'System'} · {fmtDT(selectedLog?.created_at)}</small></div>
            {selectedLog&&statusBadge(selectedLog.status||'success')}
          </div>
          <div className="form-grid-2">
            {[
              ['Action',selectedLog?.action||'—'],
              ['Category',selectedLog?auditCategory(selectedLog.action):'—'],
              ['Patient',selectedLog?.patient_name||'Not patient-specific'],
              ['Patient ID',selectedLog?.national_patient_id||'—'],
              ['Entity',selectedLog?.entity_type?`${selectedLog.entity_type} · ${selectedLog.entity_id||'—'}`:'—'],
              ['Encounter',selectedLog?.encounter_id||'—'],
              ['Request ID',selectedLog?.request_id||'—'],
              ['IP address',selectedLog?.ip_address||'—'],
              ['HTTP request',selectedLog?.http_method?`${selectedLog.http_method} ${selectedLog.request_path||''}`:'—'],
              ['Device',selectedLog?.device||'—'],
            ].map(([label,value])=>(
              <div key={label} style={{padding:'11px 12px',borderRadius:10,border:'1px solid #E5EAF1',background:'#fff',minWidth:0}}>
                <p style={{fontSize:9.5,fontWeight:800,textTransform:'uppercase',letterSpacing:'.07em',color:'#94A3B8',marginBottom:5}}>{label}</p>
                <p style={{fontSize:11.5,color:'#475569',lineHeight:1.5,wordBreak:'break-word'}}>{value}</p>
              </div>
            ))}
          </div>
          {(selectedLog?.old_value||selectedLog?.new_value)&&<div className="form-grid-2">
            <div><p style={{fontSize:10,fontWeight:800,color:'#8490A3',marginBottom:6,textTransform:'uppercase'}}>Before</p><pre style={{whiteSpace:'pre-wrap',wordBreak:'break-word',fontSize:10.5,lineHeight:1.55,padding:12,borderRadius:10,background:'#FEF2F2',border:'1px solid #FEE2E2',color:'#7F1D1D',maxHeight:180,overflow:'auto'}}>{selectedLog.old_value||'Not recorded'}</pre></div>
            <div><p style={{fontSize:10,fontWeight:800,color:'#8490A3',marginBottom:6,textTransform:'uppercase'}}>After</p><pre style={{whiteSpace:'pre-wrap',wordBreak:'break-word',fontSize:10.5,lineHeight:1.55,padding:12,borderRadius:10,background:'#F0FDF4',border:'1px solid #DCFCE7',color:'#14532D',maxHeight:180,overflow:'auto'}}>{selectedLog.new_value||'Not recorded'}</pre></div>
          </div>}
        </MB>
        <MF><Btn onClick={()=>setSelectedLog(null)} v="blue">Close details</Btn></MF>
      </Modal>
    </AL>
  );
};

/* ══════════════════════════════════════
   PATIENT PORTAL
══════════════════════════════════════ */
const patientNav=[
  {path:'/patient-dashboard',label:'My Health',  icon:'⌂'},
  {path:'/patient-history',  label:'My Records', icon:'≡'},
];

const PatientDashboard=()=>{
  const nv=useNavigate();
  const toast=useToast();
  const user=JSON.parse(localStorage.getItem('user')||'{}');
  const [data,setData]=React.useState(null);
  const [loading,setLoading]=React.useState(true);
  const [showBook,setShowBook]=React.useState(false);
  const [showSuccess,setShowSuccess]=React.useState(false);
  const [booking,setBooking]=React.useState({specialty:'General Consultation',appointment_date:'',symptoms_reason:''});
  const [sub,setSub]=React.useState(false);

  const load=()=>{
    setLoading(true);
    fetch(`${BASE_URL}/api/patients/me`,{headers:ah()})
      .then(r=>r.json()).then(d=>setData(d)).catch(()=>{}).finally(()=>setLoading(false));
  };
  React.useEffect(load,[]);

  const book=async()=>{
    if(!booking.appointment_date){toast.show('Please select a date.','error');return;}
    setSub(true);
    try{
      const r=await fetch(`${BASE_URL}/api/appointments`,{method:'POST',headers:ah(),
        body:JSON.stringify({patient_id:data?.profile?.patient_id,
          appointment_date:booking.appointment_date,
          symptoms_reason:booking.symptoms_reason||booking.specialty,status:'scheduled'})});
      if(r.ok){
        setShowBook(false);
        setShowSuccess(true);
        setBooking({specialty:'General Consultation',appointment_date:'',symptoms_reason:''});
        load();
      }else{
        const error=await r.json().catch(()=>({}));
        toast.show(error.message||'We could not book this appointment.','error');
      }
    }catch{toast.show('Network error.','error');}finally{setSub(false);}
  };

  if(loading&&!data)return<AL nav={patientNav} title="My Health"><p style={{textAlign:'center',padding:60,color:'#94A3B8'}}>Loading your health information...</p></AL>;

  const profile=data?.profile||{};
  const appts=data?.appointments||[];
  const presc=data?.prescriptions||[];
  const labs=data?.lab_results||[];
  const records=data?.medical_records||[];
  const patientName=profile.full_name||user.full_name||'Patient';
  const upcoming=appts.filter(a=>['scheduled','pending'].includes(String(a.status||'scheduled').toLowerCase()))
    .sort((a,b)=>new Date(a.appointment_date||0)-new Date(b.appointment_date||0));
  const pendingMedication=presc.filter(p=>String(p.status||'pending').toLowerCase()!=='dispensed');
  const firstName=patientName.split(' ')[0];
  const hour=new Date().getHours();
  const greeting=hour<12?'Good morning':hour<18?'Good afternoon':'Good evening';
  const todayInput=(()=>{
    const date=new Date();
    date.setMinutes(date.getMinutes()-date.getTimezoneOffset());
    return date.toISOString().slice(0,10);
  })();

  return(
    <AL nav={patientNav} title="My Health">
      <Toast {...toast}/>
      <section className="nurse-hero" style={{background:'radial-gradient(circle at 82% 18%,rgba(125,211,252,.26),transparent 29%),linear-gradient(125deg,#0B2942 0%,#124E63 58%,#0F766E 118%)'}}>
        <div className="nurse-hero-content">
          <p style={{fontSize:11,fontWeight:800,letterSpacing:'.12em',textTransform:'uppercase',color:'#A5F3FC',marginBottom:8}}>Your personal health portal</p>
          <h2 style={{fontSize:'clamp(25px,3vw,36px)',fontWeight:800,marginBottom:7}}>{greeting}, {firstName}.</h2>
          <p style={{fontSize:13,color:'rgba(255,255,255,.68)',lineHeight:1.6}}>Keep track of appointments, medication orders, test results, and your care history in one place.</p>
          {profile.national_patient_id&&<p style={{fontSize:11.5,color:'rgba(255,255,255,.48)',marginTop:10}}>Patient ID · {profile.national_patient_id}</p>}
        </div>
        <div className="nurse-hero-actions">
          <Btn onClick={()=>nv('/patient-history')} v="ghost">View my records</Btn>
          <Btn onClick={()=>setShowBook(true)} v="blue">+ Book appointment</Btn>
        </div>
      </section>

      <div className="nurse-kpi-grid">
        <RoleKpi label="Upcoming appointments" value={upcoming.length} symbol="D" color="#2563EB" bg="#EFF6FF" meta="Scheduled or awaiting confirmation" loading={loading}/>
        <RoleKpi label="Medication orders" value={presc.length} symbol="Rx" color="#7C3AED" bg="#F5F3FF" meta={`${pendingMedication.length} awaiting dispensing`} loading={loading}/>
        <RoleKpi label="Lab results" value={labs.length} symbol="L" color="#15803D" bg="#F0FDF4" meta="Results available in your record" loading={loading}/>
        <RoleKpi label="Care records" value={records.length} symbol="≡" color="#0F766E" bg="#ECFDF5" meta="Documented clinical visits" loading={loading}/>
      </div>

      <div className="nurse-dashboard-grid">
        <section className="clinical-panel">
          <div className="clinical-panel-header">
            <div><h3 style={{fontSize:17,color:'#1E293B'}}>Upcoming appointments</h3><p style={{fontSize:12.5,color:'#8490A3',marginTop:4}}>Your next scheduled visits and appointment requests.</p></div>
            <Btn onClick={()=>setShowBook(true)} v="ghost" sz="sm">Book another</Btn>
          </div>
          <div className="clinical-panel-body">
            {upcoming.length===0?<NurseEmptyState symbol="D" title="No upcoming appointments" description="When you need care, you can request an appointment directly from this portal."><Btn onClick={()=>setShowBook(true)} v="blue" sz="sm">Book an appointment</Btn></NurseEmptyState>:
              upcoming.slice(0,5).map((appointment,index)=>(
                <div className="queue-preview-row" key={appointment.appointment_id||index} style={{gridTemplateColumns:'minmax(150px,.65fr) minmax(0,1.35fr) auto'}}>
                  <div><strong style={{fontSize:13,color:'#1E293B'}}>{fmtDate(appointment.appointment_date)}</strong><p style={{fontSize:10.5,color:'#94A3B8',marginTop:3}}>Appointment date</p></div>
                  <div><p style={{fontSize:12.5,fontWeight:700,color:'#475569'}}>{appointment.symptoms_reason||appointment.reason||'General consultation'}</p><p style={{fontSize:10.5,color:'#94A3B8',marginTop:3}}>Reason for visit</p></div>
                  {statusBadge(appointment.status||'scheduled')}
                </div>
              ))
            }
          </div>
        </section>

        <section className="clinical-panel">
          <div className="clinical-panel-header"><div><h3 style={{fontSize:17,color:'#1E293B'}}>My health record</h3><p style={{fontSize:12.5,color:'#8490A3',marginTop:4}}>Open the part of your history you need.</p></div></div>
          <div className="clinical-panel-body">
            <button className="quick-action-card" onClick={()=>nv('/patient-history',{state:{tab:'records'}})}>
              <span className="nurse-icon-tile" style={{'--icon-bg':'#ECFDF5','--icon-color':'#0F766E'}}>≡</span>
              <span><strong style={{display:'block',fontSize:13,color:'#263247'}}>Visit history</strong><small style={{color:'#8490A3'}}>{records.length} care record{records.length===1?'':'s'}</small></span>
              <span style={{marginLeft:'auto',color:'#0F766E'}}>→</span>
            </button>
            <button className="quick-action-card" onClick={()=>nv('/patient-history',{state:{tab:'labs'}})}>
              <span className="nurse-icon-tile" style={{'--icon-bg':'#EFF6FF','--icon-color':'#2563EB'}}>L</span>
              <span><strong style={{display:'block',fontSize:13,color:'#263247'}}>Laboratory results</strong><small style={{color:'#8490A3'}}>{labs.length} result{labs.length===1?'':'s'} available</small></span>
              <span style={{marginLeft:'auto',color:'#2563EB'}}>→</span>
            </button>
            <button className="quick-action-card" onClick={()=>nv('/patient-history',{state:{tab:'prescriptions'}})}>
              <span className="nurse-icon-tile" style={{'--icon-bg':'#F5F3FF','--icon-color':'#7C3AED'}}>Rx</span>
              <span><strong style={{display:'block',fontSize:13,color:'#263247'}}>Prescriptions</strong><small style={{color:'#8490A3'}}>{presc.length} medication order{presc.length===1?'':'s'}</small></span>
              <span style={{marginLeft:'auto',color:'#7C3AED'}}>→</span>
            </button>
          </div>
        </section>
      </div>

      <section className="clinical-panel" style={{marginTop:18}}>
        <div className="clinical-panel-header">
          <div><h3 style={{fontSize:17,color:'#1E293B'}}>Medication overview</h3><p style={{fontSize:12.5,color:'#8490A3',marginTop:4}}>Your latest prescription instructions and dispensing status.</p></div>
          <Btn onClick={()=>nv('/patient-history',{state:{tab:'prescriptions'}})} v="ghost" sz="sm">View all →</Btn>
        </div>
        <div style={{padding:18}}>
          {presc.length===0?<NurseEmptyState symbol="Rx" title="No prescriptions available" description="Prescriptions issued by your care team will appear here with dosage and dispensing information."/>:
            <Table cols={[
              {key:'med',label:'Medication',w:'29%'},
              {key:'directions',label:'How to take it',w:'35%'},
              {key:'dur',label:'Duration',w:'16%'},
              {key:'stat',label:'Status',w:'20%'},
            ]} rows={presc.slice(0,5).map(p=>({
              med:<div className="patient-name-cell"><span className="patient-avatar" style={{background:'#F5F3FF',color:'#7C3AED'}}>Rx</span><div><strong>{p.medication_name||'Medication'}</strong><small>Prescription order</small></div></div>,
              directions:<span style={{fontSize:12.5,color:'#475569'}}>{p.dosage||'Dose not stated'} · {p.frequency||'Frequency not stated'}</span>,
              dur:<span style={{fontSize:12.5,color:'#64748B'}}>{p.duration||'Not stated'}</span>,
              stat:statusBadge(p.status||'pending')
            }))}/>
          }
        </div>
      </section>

      <Modal open={showBook} onClose={()=>setShowBook(false)} title="Book an Appointment" width={500}>
        <MB>
          <div className="vitals-patient-card">
            <span className="patient-avatar">{patientName.charAt(0).toUpperCase()}</span>
            <div><strong style={{display:'block',color:'#1E293B'}}>{patientName}</strong><small style={{color:'#64748B'}}>Patient ID: {profile.national_patient_id||profile.patient_id||'—'}</small></div>
          </div>
          <Field label="Type of visit" required>
            <select value={booking.specialty} onChange={e=>setBooking({...booking,specialty:e.target.value})} style={inp}>
              <option>General Consultation</option>
              <option>Follow-up Visit</option>
              <option>Lab Review</option>
              <option>Specialist Referral</option>
              <option>Dental</option>
              <option>Antenatal</option>
            </select>
          </Field>
          <Field label="Preferred date" required>
            <input type="date" min={todayInput} value={booking.appointment_date} onChange={e=>setBooking({...booking,appointment_date:e.target.value})} style={inp}/>
          </Field>
          <Field label="Symptoms or reason for visit">
            <textarea value={booking.symptoms_reason} onChange={e=>setBooking({...booking,symptoms_reason:e.target.value})}
              placeholder="Briefly describe what you would like help with..." style={{...inp,height:100,resize:'vertical'}}/>
          </Field>
          <p style={{fontSize:11.5,color:'#8490A3',lineHeight:1.55,margin:0}}>If your symptoms are severe or life-threatening, seek emergency care instead of waiting for an online appointment.</p>
        </MB>
        <MF>
          <Btn onClick={()=>setShowBook(false)} v="ghost">Cancel</Btn>
          <Btn onClick={book} disabled={sub} v="blue">{sub?'Booking...':'Confirm appointment'}</Btn>
        </MF>
      </Modal>
      <Modal open={showSuccess} onClose={()=>setShowSuccess(false)} title="Appointment Booked" width={420}>
        <MB>
          <NurseEmptyState symbol="✓" title="Your appointment is scheduled" description="It has been added to your health portal. Please arrive on time and tell the nurse that you booked online."/>
        </MB>
        <MF><Btn onClick={()=>setShowSuccess(false)} v="blue" style={{justifyContent:'center',width:'100%'}}>Return to my health</Btn></MF>
      </Modal>
    </AL>
  );
};

const PatientHistory=()=>{
  const location=useLocation();
  const [data,setData]=React.useState(null);
  const [loading,setLoading]=React.useState(true);
  const [tab,setTab]=React.useState(location.state?.tab||'records');
  React.useEffect(()=>{
    fetch(`${BASE_URL}/api/patients/me`,{headers:ah()})
      .then(r=>r.json()).then(d=>setData(d)).catch(()=>{}).finally(()=>setLoading(false));
  },[]);
  const profile=data?.profile||{};
  const recs=data?.medical_records||[];
  const labs=data?.lab_results||[];
  const presc=data?.prescriptions||[];
  const encounters=data?.encounters||[];
  const tabs=[
    {key:'records',label:'Visit timeline',count:encounters.length,symbol:'≡'},
    {key:'labs',label:'Lab results',count:labs.length,symbol:'L'},
    {key:'prescriptions',label:'Prescriptions',count:presc.length,symbol:'Rx'},
  ];

  return(
    <AL nav={patientNav} title="My Health Records">
      {loading?<p style={{textAlign:'center',padding:60,color:'#94A3B8'}}>Loading your records...</p>:<>
        <NursePageIntro kicker="Personal health record" title="Your care history, in one place" description="Review the information your care team has made available through your patient account.">
          {profile.national_patient_id&&<Badge text={`Patient ID · ${profile.national_patient_id}`} color="blue"/>}
        </NursePageIntro>

        <div className="nurse-mini-stats">
          <NurseMiniStat symbol="≡" value={encounters.length} label="Hospital visits" color="#0F766E" bg="#ECFDF5"/>
          <NurseMiniStat symbol="L" value={labs.length} label="Lab results" color="#2563EB" bg="#EFF6FF"/>
          <NurseMiniStat symbol="Rx" value={presc.length} label="Prescriptions" color="#7C3AED" bg="#F5F3FF"/>
          <NurseMiniStat symbol="✓" value={labs.filter(l=>String(l.result_status||'').toLowerCase()==='normal').length} label="Normal lab results" color="#15803D" bg="#F0FDF4"/>
        </div>

        <div style={{padding:'12px 14px',marginBottom:16,border:'1px solid #BAE6FD',borderRadius:12,background:'#F0F9FF',fontSize:11.8,color:'#075985',lineHeight:1.55}}>
          <strong>About your record:</strong> Lab ranges and clinical terms can vary. Discuss results or treatment questions with a qualified member of your care team.
        </div>

        <section className="clinical-panel">
          <div className="clinical-panel-header">
            <div><h3 style={{fontSize:17,color:'#1E293B'}}>Health record library</h3><p style={{fontSize:12.5,color:'#8490A3',marginTop:4}}>Choose a section to review the information available to you.</p></div>
            <div className="filter-pills" role="tablist" aria-label="Health record sections">
              {tabs.map(item=>(
                <button key={item.key} role="tab" aria-selected={tab===item.key} className={`filter-pill ${tab===item.key?'is-active':''}`} onClick={()=>setTab(item.key)}>
                  {item.label} · {item.count}
                </button>
              ))}
            </div>
          </div>
          <div style={{padding:18}}>
        {tab==='records'&&(encounters.length===0?
          <NurseEmptyState symbol="≡" title="No hospital visits available yet" description="Completed and ongoing visits will appear here with the doctor, diagnosis, tests, and medication linked together."/>:
          <div className="encounter-timeline">
            {encounters.map(encounter=>{
              const record=encounter.medical_records?.[0]||{};
              const medicines=encounter.prescriptions||[];
              const requests=encounter.lab_requests||[];
              return(
                <article className="encounter-card" key={encounter.encounter_id}>
                  <div style={{display:'flex',justifyContent:'space-between',gap:14,alignItems:'flex-start',flexWrap:'wrap'}}>
                    <div>
                      <p style={{fontSize:10,fontWeight:800,color:'#0F766E',textTransform:'uppercase',letterSpacing:'.08em'}}>{encounter.encounter_number||'Hospital visit'}</p>
                      <h4 style={{fontSize:15,color:'#263247',marginTop:5}}>{fmtDate(encounter.opened_at)} <span style={{fontSize:11,fontFamily:'DM Sans',fontWeight:600,color:'#8490A3'}}>at {fmtTime(encounter.opened_at)}</span></h4>
                      <p style={{fontSize:11.5,color:'#64748B',marginTop:4}}>{encounter.doctor_name?`Seen by ${encounter.doctor_name}`:'Clinician not yet assigned'}</p>
                    </div>
                    {statusBadge(encounter.status||'registered')}
                  </div>
                  <div className="encounter-card-grid">
                    <div className="encounter-detail">
                      <p className="encounter-detail-label">Reason & assessment</p>
                      <p className="encounter-detail-value"><strong style={{color:'#344056'}}>{encounter.chief_complaint||record.chief_complaint||'Reason not recorded'}</strong><br/>{record.diagnosis||'No diagnosis recorded'}</p>
                    </div>
                    <div className="encounter-detail">
                      <p className="encounter-detail-label">Medication</p>
                      <p className="encounter-detail-value">{medicines.length?medicines.map(item=>`${item.medication_name} ${item.dosage||''}`.trim()).join(', '):'No medication ordered'}</p>
                    </div>
                    <div className="encounter-detail">
                      <p className="encounter-detail-label">Laboratory</p>
                      <p className="encounter-detail-value">{requests.length?requests.map(item=>`${item.test_type} · ${item.status}`).join(', '):'No tests requested'}</p>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
        {tab==='labs'&&(labs.length===0?
          <NurseEmptyState symbol="L" title="No laboratory results available yet" description="Verified investigation results shared by the laboratory will appear in this section."/>:
          <Table cols={[{key:'test',label:'Investigation',w:'27%'},{key:'res',label:'Your result',w:'20%'},{key:'ref',label:'Reference range',w:'19%'},{key:'date',label:'Result date',w:'16%'},{key:'stat',label:'Interpretation',w:'18%'}]}
            rows={labs.map(r=>({
              test:<div className="patient-name-cell"><span className="patient-avatar" style={{background:'#EFF6FF',color:'#2563EB'}}>L</span><div><strong>{r.test_type||r.test_name||'Laboratory test'}</strong><small>Verified investigation</small></div></div>,
              res:<strong style={{fontSize:13.5,color:'#1E293B'}}>{r.result_value||'Not stated'}</strong>,
              ref:<span style={{fontSize:12.5,color:'#64748B'}}>{r.reference_range||'Not provided'}</span>,
              date:<span style={{fontSize:12.5,color:'#64748B'}}>{fmtDate(r.result_date||r.created_at)}</span>,
              stat:r.result_status?statusBadge(r.result_status):<Badge text="Recorded" color="blue"/>
            }))}/>
        )}
        {tab==='prescriptions'&&(presc.length===0?
          <NurseEmptyState symbol="Rx" title="No prescriptions available yet" description="Medication orders issued by your doctor will appear here with dosage and dispensing information."/>:
          <Table cols={[{key:'med',label:'Medication',w:'29%'},{key:'directions',label:'Directions',w:'32%'},{key:'dur',label:'Duration',w:'14%'},{key:'date',label:'Issued',w:'13%'},{key:'stat',label:'Status',w:'12%'}]}
            rows={presc.map(p=>({
              med:<div className="patient-name-cell"><span className="patient-avatar" style={{background:'#F5F3FF',color:'#7C3AED'}}>Rx</span><div><strong>{p.medication_name||'Medication'}</strong><small>Prescription order</small></div></div>,
              directions:<span style={{fontSize:12.5,color:'#475569'}}>{p.dosage||'Dose not stated'} · {p.frequency||'Frequency not stated'}</span>,
              dur:<span style={{fontSize:12.5,color:'#64748B'}}>{p.duration||'Not stated'}</span>,
              date:<span style={{fontSize:12.5,color:'#64748B'}}>{fmtDate(p.issued_at||p.created_at)}</span>,
              stat:statusBadge(p.status||'pending')
            }))}/>
        )}
          </div>
        </section>
      </>}
    </AL>
  );
};

/* ══════════════════════════════════════
   APP ROUTER
══════════════════════════════════════ */
export default function App(){
  return(
    <BrowserRouter>
      <GStyles/>
      <Routes>
        <Route path="/"                      element={<Landing/>}/>
        <Route path="/login"                 element={<Login/>}/>
        <Route path="/patient-login"         element={<PatientLogin/>}/>
        <Route path="/logout"                element={<LogoutPage/>}/>
        {/* Nurse */}
        <Route path="/nurse-dashboard"       element={<NurseDashboard/>}/>
        <Route path="/nurse-patients"        element={<NursePatients/>}/>
        <Route path="/nurse-triage"          element={<NurseTriage/>}/>
        <Route path="/nurse-schedule"        element={<NurseSchedule/>}/>
        <Route path="/nurse-patient-profile" element={<NursePatientProfile/>}/>
        {/* Doctor */}
        <Route path="/doctor-dashboard"      element={<DoctorDashboard/>}/>
        <Route path="/doctor-patients"       element={<DoctorPatients/>}/>
        <Route path="/doctor-schedule"       element={<DoctorSchedule/>}/>
        <Route path="/doctor-patient-view"   element={<DoctorPatientView/>}/>
        <Route path="/doctor-consultation"   element={<DoctorConsultation/>}/>
        <Route path="/doctor-lab"            element={<DoctorLab/>}/>
        {/* Lab */}
        <Route path="/lab-dashboard"         element={<LabDashboard/>}/>
        <Route path="/lab-queue"             element={<LabQueue/>}/>
        {/* Pharmacist */}
        <Route path="/pharm-dashboard"       element={<PharmDashboard/>}/>
        <Route path="/pharm-inventory"       element={<PharmInventory/>}/>
        {/* Admin */}
        <Route path="/admin-dashboard"       element={<AdminDashboard/>}/>
        <Route path="/admin-users"           element={<AdminUsers/>}/>
        <Route path="/admin-logs"            element={<AdminLogs/>}/>
        {/* Patient */}
        <Route path="/patient-dashboard"     element={<PatientDashboard/>}/>
        <Route path="/patient-history"       element={<PatientHistory/>}/>
      </Routes>
    </BrowserRouter>
  );
}
