import React from 'react';
import { BrowserRouter, Routes, Route, useNavigate, Link, useLocation } from 'react-router-dom';

const BASE_URL = 'https://emr-backend-production-5ebf.up.railway.app';
const tk = () => localStorage.getItem('token');
const ah = () => ({ 'Content-Type': 'application/json', Authorization: `Bearer ${tk()}` });
const calcAge = dob => dob ? Math.floor((Date.now() - new Date(dob)) / (365.25*24*60*60*1000)) : '—';
const fmtDate = d => {
  if(!d) return '—';
  const date = new Date(d);
  if(isNaN(date.getTime())) return d;
  return date.toLocaleDateString('en-GB');
};
const fmtTime = d => d ? new Date(d).toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'}) : '—';
const fmtDT   = d => d ? new Date(d).toLocaleString('en-GB') : '—';

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
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
    *{box-sizing:border-box;margin:0;padding:0;}
    body{font-family:'Inter',sans-serif;background:#F1F5F9;}
    input,textarea,select,button{font-family:'Inter',sans-serif;}
    ::-webkit-scrollbar{width:4px;}
    ::-webkit-scrollbar-thumb{background:#CBD5E1;border-radius:4px;}
  `}</style>
);

/* ── TOAST ── */
function useToast(){
  const [t,setT]=React.useState({msg:'',type:'success'});
  const show=(msg,type='success')=>{setT({msg,type});setTimeout(()=>setT({msg:'',type:'success'}),3500);};
  return {...t,show};
}
const Toast=({msg,type})=>!msg?null:(
  <div style={{position:'fixed',top:22,left:'50%',transform:'translateX(-50%)',
    backgroundColor:type==='error'?'#FEF2F2':'#F0FDF4',
    border:`1px solid ${type==='error'?'#FECACA':'#BBF7D0'}`,
    color:type==='error'?'#DC2626':'#16A34A',
    padding:'11px 22px',borderRadius:10,boxShadow:'0 8px 24px rgba(0,0,0,.12)',
    display:'flex',alignItems:'center',gap:10,zIndex:9999,fontWeight:700,fontSize:14}}>
    {type==='error'?'🚫':'✅'} {msg}
  </div>
);

/* ── PRIMITIVES ── */
const inp={width:'100%',padding:'11px 14px',border:'1px solid #E2E8F0',borderRadius:8,fontSize:14,outline:'none',backgroundColor:'white'};

const Btn=({onClick,disabled,v='primary',sz='md',children,style={}})=>{
  const S={sm:{padding:'7px 14px',fontSize:12},md:{padding:'11px 22px',fontSize:14},lg:{padding:'14px 30px',fontSize:15}};
  const V={
    primary:{backgroundColor:disabled?'#94A3B8':'#1E293B',color:'white',border:'none'},
    blue:   {backgroundColor:disabled?'#94A3B8':'#3B82F6',color:'white',border:'none'},
    green:  {backgroundColor:disabled?'#94A3B8':'#22C55E',color:'white',border:'none'},
    ghost:  {backgroundColor:'white',color:'#475569',border:'1px solid #E2E8F0'},
    outline:{backgroundColor:'transparent',color:'#3B82F6',border:'1px solid #3B82F6'},
    danger: {backgroundColor:disabled?'#94A3B8':'#EF4444',color:'white',border:'none'},
  };
  return(
    <button onClick={disabled?undefined:onClick}
      style={{cursor:disabled?'not-allowed':'pointer',borderRadius:8,fontWeight:700,
        display:'inline-flex',alignItems:'center',gap:6,...S[sz],...V[v],...style}}>
      {children}
    </button>
  );
};

const Field=({label,required,children})=>(
  <div style={{display:'flex',flexDirection:'column',gap:6}}>
    <label style={{fontSize:13,fontWeight:600,color:'#374151'}}>{label}{required&&<span style={{color:'#EF4444'}}> *</span>}</label>
    {children}
  </div>
);

const Badge=({text,color='gray'})=>{
  const C={green:{bg:'#DCFCE7',tc:'#16A34A'},blue:{bg:'#DBEAFE',tc:'#1D4ED8'},
    yellow:{bg:'#FEF3C7',tc:'#B45309'},red:{bg:'#FEE2E2',tc:'#DC2626'},
    gray:{bg:'#F1F5F9',tc:'#475569'},purple:{bg:'#EDE9FE',tc:'#7C3AED'}}[color]||{bg:'#F1F5F9',tc:'#475569'};
  return(<span style={{padding:'3px 12px',borderRadius:20,backgroundColor:C.bg,color:C.tc,fontSize:12,fontWeight:700,whiteSpace:'nowrap'}}>{text}</span>);
};

const statusBadge=s=>{
  const v=(s||'').toLowerCase();
  if(['active','completed','dispensed','normal'].includes(v)) return <Badge text={s} color="green"/>;
  if(['waiting','pending','scheduled'].includes(v)) return <Badge text={s} color="yellow"/>;
  if(['cancelled','abnormal','critical','inactive'].includes(v)) return <Badge text={s} color="red"/>;
  return <Badge text={s||'—'}/>;
};

/* ── MODAL ── */
const Modal=({open,onClose,title,width=480,children})=>{
  if(!open)return null;
  return(
    <div style={{position:'fixed',inset:0,backgroundColor:'rgba(0,0,0,.5)',display:'flex',
      alignItems:'center',justifyContent:'center',zIndex:500,padding:16}}>
      <div style={{width:`min(${width}px,96vw)`,backgroundColor:'white',borderRadius:16,
        boxShadow:'0 24px 48px rgba(0,0,0,.18)',overflow:'hidden',maxHeight:'92vh',display:'flex',flexDirection:'column'}}>
        <div style={{padding:'20px 26px',borderBottom:'1px solid #F1F5F9',
          display:'flex',justifyContent:'space-between',alignItems:'center',flexShrink:0}}>
          <h3 style={{fontSize:17,fontWeight:800,color:'#1E293B'}}>{title}</h3>
          <button onClick={onClose} style={{background:'none',border:'none',cursor:'pointer',fontSize:22,color:'#94A3B8',lineHeight:1}}>×</button>
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
  <div style={{backgroundColor:'white',borderRadius:12,border:'1px solid #E2E8F0',overflow:'hidden'}}>
    <div style={{display:'grid',gridTemplateColumns:cols.map(c=>c.w||'1fr').join(' '),
      padding:'11px 18px',backgroundColor:'#F8FAFC',borderBottom:'1px solid #E2E8F0'}}>
      {cols.map(c=><div key={c.key} style={{fontSize:11,fontWeight:800,color:'#94A3B8',textTransform:'uppercase',letterSpacing:.6}}>{c.label}</div>)}
    </div>
    {rows.length===0
      ?<div style={{textAlign:'center',padding:'36px 18px',color:'#94A3B8',fontSize:14}}>{empty}</div>
      :rows.map((row,i)=>(
        <div key={i} onClick={row._onClick}
          style={{display:'grid',gridTemplateColumns:cols.map(c=>c.w||'1fr').join(' '),
            padding:'15px 18px',borderBottom:i<rows.length-1?'1px solid #F1F5F9':'none',
            cursor:row._onClick?'pointer':'default',transition:'background .1s'}}
          onMouseEnter={e=>{if(row._onClick)e.currentTarget.style.backgroundColor='#F8FAFC';}}
          onMouseLeave={e=>e.currentTarget.style.backgroundColor='white'}>
          {cols.map(c=><div key={c.key} style={{fontSize:14,fontWeight:500,color:'#374151',display:'flex',alignItems:'center'}}>{row[c.key]}</div>)}
        </div>
      ))
    }
  </div>
);

/* ── STAT CARD ── */
const SC=({label,value,icon,color='#1E293B',bg='white',border='#E2E8F0'})=>(
  <div style={{padding:'20px 22px',borderRadius:14,backgroundColor:bg,border:`1px solid ${border}`,flex:1,minWidth:130}}>
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
      <p style={{fontSize:13,fontWeight:600,color:'#64748B',margin:0}}>{label}</p>
      {icon&&<span style={{fontSize:20}}>{icon}</span>}
    </div>
    <h2 style={{fontSize:'clamp(26px,3vw,40px)',fontWeight:900,color,margin:'10px 0 0'}}>{value}</h2>
  </div>
);

/* ── SIDEBAR ── */
const Sidebar=({nav})=>{
  const loc=useLocation();
  const nv=useNavigate();
  const logout=()=>{['token','user','role','display_name'].forEach(k=>localStorage.removeItem(k));nv('/',{replace:true});};
  const dn=localStorage.getItem('display_name')||'';
  return(
    <div style={{width:216,flexShrink:0,backgroundColor:'#0F172A',color:'white',
      display:'flex',flexDirection:'column',justifyContent:'space-between',height:'100vh',position:'sticky',top:0}}>
      <div>
        <div style={{padding:'26px 20px 18px',display:'flex',alignItems:'center',gap:10}}>
          <div style={{width:36,height:36,borderRadius:10,backgroundColor:'#3B82F6',
            display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,fontWeight:300,color:'white'}}>+</div>
          <div style={{fontSize:13,fontWeight:900,color:'white',letterSpacing:.5,lineHeight:1.2}}>HEALTHCARE<br/>EMR</div>
        </div>
        <div style={{padding:'0 10px',marginBottom:8}}>
          <p style={{fontSize:10,fontWeight:700,color:'#475569',padding:'0 10px',marginBottom:6,textTransform:'uppercase',letterSpacing:.8}}>Navigation</p>
          {nav.map(item=>{
            const active=loc.pathname===item.path;
            return(
              <Link key={item.path} to={item.path} style={{display:'flex',alignItems:'center',gap:10,
                padding:'9px 12px',borderRadius:8,marginBottom:2,textDecoration:'none',
                backgroundColor:active?'rgba(59,130,246,.15)':'transparent',
                color:active?'#93C5FD':'rgba(255,255,255,.55)',fontWeight:active?700:500,fontSize:14}}>
                <span style={{fontSize:15}}>{item.icon}</span>{item.label}
              </Link>
            );
          })}
        </div>
      </div>
      <div>
        <div style={{margin:'0 10px 10px',padding:'10px 12px',borderRadius:8,backgroundColor:'rgba(255,255,255,.05)'}}>
          <p style={{fontSize:11,color:'rgba(255,255,255,.35)',margin:'0 0 2px'}}>Logged in as</p>
          <p style={{fontSize:13,fontWeight:700,color:'white',margin:0,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{dn}</p>
        </div>
        <button onClick={logout} style={{width:'100%',padding:'13px 20px',background:'none',border:'none',
          borderTop:'1px solid rgba(255,255,255,.07)',color:'rgba(255,255,255,.45)',
          cursor:'pointer',display:'flex',alignItems:'center',gap:10,fontSize:14,fontWeight:600}}>
          🚪 Logout
        </button>
      </div>
    </div>
  );
};

/* ── APP LAYOUT ── */
const AL=({nav,title,searchText,setSearchText,children})=>{
  const dn=localStorage.getItem('display_name')||'';
  return(
    <div style={{display:'flex',minHeight:'100vh'}}>
      <Sidebar nav={nav}/>
      <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden',minWidth:0}}>
        <div style={{padding:'14px 28px',backgroundColor:'white',borderBottom:'1px solid #E2E8F0',
          display:'flex',alignItems:'center',justifyContent:'space-between',flexShrink:0}}>
          <h1 style={{fontSize:20,fontWeight:800,color:'#0F172A'}}>{title}</h1>
          <div style={{display:'flex',alignItems:'center',gap:14}}>
            {setSearchText&&(
              <div style={{position:'relative'}}>
                <span style={{position:'absolute',left:11,top:'50%',transform:'translateY(-50%)',color:'#94A3B8'}}>🔍</span>
                <input value={searchText||''} onChange={e=>setSearchText(e.target.value)}
                  placeholder="Search..." style={{...inp,width:230,paddingLeft:36,fontSize:13}}/>
              </div>
            )}
            <div style={{display:'flex',alignItems:'center',gap:8}}>
              <div style={{width:34,height:34,borderRadius:'50%',backgroundColor:'#DBEAFE',
                display:'flex',alignItems:'center',justifyContent:'center',fontSize:14,fontWeight:800,color:'#1D4ED8'}}>
                {dn.charAt(0).toUpperCase()}
              </div>
              <span style={{fontSize:13,fontWeight:600,color:'#475569'}}>{dn}</span>
            </div>
          </div>
        </div>
        <div style={{flex:1,overflowY:'auto',padding:'24px 28px'}}>{children}</div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════
   LANDING
══════════════════════════════════════ */
const Landing=()=>{
  const nv=useNavigate();
  return(
    <div style={{minHeight:'100vh',display:'flex',fontFamily:'Inter,sans-serif'}}>
      <div style={{width:'45%',backgroundColor:'#0F172A',display:'flex',flexDirection:'column',
        justifyContent:'center',padding:'60px 52px',position:'relative',overflow:'hidden'}}>
        <div style={{position:'absolute',width:380,height:380,borderRadius:'50%',
          backgroundColor:'rgba(59,130,246,.12)',filter:'blur(80px)',top:'-8%',left:'-8%'}}/>
        <div style={{position:'absolute',width:280,height:280,borderRadius:'50%',
          backgroundColor:'rgba(16,185,129,.08)',filter:'blur(60px)',bottom:'10%',right:'5%'}}/>
        <div style={{position:'relative',zIndex:1}}>
          <div style={{display:'flex',alignItems:'center',gap:14,marginBottom:36}}>
            <div style={{width:50,height:50,borderRadius:13,backgroundColor:'#3B82F6',
              display:'flex',alignItems:'center',justifyContent:'center',fontSize:26,fontWeight:300,color:'white'}}>+</div>
            <div style={{fontSize:22,fontWeight:900,color:'white',letterSpacing:.5,lineHeight:1.2}}>HEALTHCARE<br/>EMR</div>
          </div>
          <h1 style={{fontSize:38,fontWeight:900,color:'white',lineHeight:1.25,marginBottom:14}}>
            Empowering<br/>Healthcare<br/>Through Data
          </h1>
          <p style={{fontSize:15,color:'rgba(255,255,255,.45)',lineHeight:1.7}}>
            An electronic medical records system built for Ghanaian hospitals.
          </p>
        </div>
      </div>
      <div style={{flex:1,display:'flex',flexDirection:'column',justifyContent:'center',
        alignItems:'center',backgroundColor:'white',padding:60}}>
        <div style={{maxWidth:360,width:'100%'}}>
          <h2 style={{fontSize:28,fontWeight:800,color:'#0F172A',marginBottom:8,textAlign:'center'}}>Welcome back</h2>
          <p style={{fontSize:15,color:'#64748B',marginBottom:36,textAlign:'center'}}>Select your portal to continue.</p>
          <div style={{display:'flex',flexDirection:'column',gap:12}}>
            <button onClick={()=>nv('/patient-login')} style={{padding:'17px',
  backgroundColor:'#0F172A',color:'white',border:'none',borderRadius:12,
  fontSize:16,fontWeight:700,cursor:'pointer',width:'100%',
  display:'flex',alignItems:'center',justifyContent:'center',gap:10}}>
  👤 Access Patient Portal
</button>
<p style={{marginTop:28,textAlign:'center',fontSize:12,color:'#94A3B8'}}>
  Hospital staff?{' '}
  <span onClick={()=>nv('/login')} 
    style={{color:'#64748B',cursor:'pointer',textDecoration:'underline'}}>
    Staff login
  </span>
</p>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════
   STAFF LOGIN
══════════════════════════════════════ */
const Login=()=>{
  const nv=useNavigate();
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
    <div style={{minHeight:'100vh',display:'flex',fontFamily:'Inter,sans-serif'}}>
      <div style={{width:'45%',backgroundColor:'#0F172A',display:'flex',flexDirection:'column',
        justifyContent:'center',padding:'60px 52px'}}>
        <div style={{display:'flex',alignItems:'center',gap:14,marginBottom:36}}>
          <div style={{width:50,height:50,borderRadius:13,backgroundColor:'#3B82F6',
            display:'flex',alignItems:'center',justifyContent:'center',fontSize:26,fontWeight:300,color:'white'}}>+</div>
          <div style={{fontSize:22,fontWeight:900,color:'white',letterSpacing:.5,lineHeight:1.2}}>HEALTHCARE<br/>EMR</div>
        </div>
        <h2 style={{fontSize:32,fontWeight:900,color:'white',marginBottom:12}}>Staff Sign-In</h2>
        <p style={{color:'rgba(255,255,255,.45)',fontSize:15,lineHeight:1.6}}>Secure access to the hospital electronic medical records system.</p>
      </div>
      <div style={{flex:1,display:'flex',justifyContent:'center',alignItems:'center',backgroundColor:'white',padding:60}}>
        <div style={{maxWidth:380,width:'100%'}}>
          <h2 style={{fontSize:24,fontWeight:800,color:'#0F172A',marginBottom:24}}>Select your role to sign in</h2>
          {err&&<div style={{padding:'11px 14px',backgroundColor:'#FEF2F2',border:'1px solid #FECACA',
            borderRadius:8,color:'#DC2626',fontSize:13,fontWeight:600,marginBottom:16}}>🚫 {err}</div>}
          <div style={{display:'flex',flexDirection:'column',gap:14}}>
            <select value={role} onChange={e=>{setRole(e.target.value);setErr('');}}
              style={{...inp,color:role?'#0F172A':'#94A3B8'}}>
              <option value="">— Select Role —</option>
              <option value="doctor">Doctor</option>
              <option value="nurse">Nurse</option>
              <option value="pharmacist">Pharmacist</option>
              <option value="lab_technician">Lab Technician</option>
              <option value="admin">Admin</option>
            </select>
            <Field label="Email Address">
              <input type="email" value={email} onChange={e=>{setEmail(e.target.value);setErr('');}}
                onKeyDown={e=>e.key==='Enter'&&go()} placeholder="e.g. bright@hospital.com" style={inp}/>
            </Field>
            <Field label="Password">
              <div style={{position:'relative'}}>
  <input type={showPass?'text':'password'} value={pass} onChange={e=>{setPass(e.target.value);setErr('');}}
    onKeyDown={e=>e.key==='Enter'&&go()} placeholder="Enter password" style={{...inp,paddingRight:44}}/>
  <button type="button" onClick={()=>setShowPass(p=>!p)}
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
            Patient? <span onClick={()=>nv('/patient-login')} style={{color:'#3B82F6',cursor:'pointer',fontWeight:600}}>Patient Portal</span>
          </p>
        </div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════
   PATIENT LOGIN
══════════════════════════════════════ */
const PatientLogin=()=>{
  const nv=useNavigate();
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
    <div style={{minHeight:'100vh',display:'flex',fontFamily:'Inter,sans-serif'}}>
      <div style={{width:'45%',backgroundColor:'#0F172A',display:'flex',flexDirection:'column',
        justifyContent:'center',padding:'60px 52px'}}>
        <div style={{display:'flex',alignItems:'center',gap:14,marginBottom:36}}>
          <div style={{width:50,height:50,borderRadius:13,backgroundColor:'#3B82F6',
            display:'flex',alignItems:'center',justifyContent:'center',fontSize:26,fontWeight:300,color:'white'}}>+</div>
          <div style={{fontSize:22,fontWeight:900,color:'white',letterSpacing:.5,lineHeight:1.2}}>HEALTHCARE<br/>EMR</div>
        </div>
        <h2 style={{fontSize:32,fontWeight:900,color:'white',marginBottom:12}}>Patient Portal</h2>
        <p style={{color:'rgba(255,255,255,.45)',fontSize:15,lineHeight:1.6}}>Access your health records, appointments and prescriptions anytime.</p>
      </div>
      <div style={{flex:1,display:'flex',justifyContent:'center',alignItems:'center',backgroundColor:'white',padding:60}}>
        <div style={{maxWidth:380,width:'100%'}}>
          <h2 style={{fontSize:24,fontWeight:800,color:'#0F172A',marginBottom:24}}>Sign in to your account</h2>
          {err&&<div style={{padding:'11px 14px',backgroundColor:'#FEF2F2',border:'1px solid #FECACA',
            borderRadius:8,color:'#DC2626',fontSize:13,fontWeight:600,marginBottom:16}}>🚫 {err}</div>}
          <div style={{display:'flex',flexDirection:'column',gap:14}}>
            <Field label="Email Address">
              <input type="email" value={email} onChange={e=>{setEmail(e.target.value);setErr('');}}
                onKeyDown={e=>e.key==='Enter'&&go()} placeholder="e.g. abena@email.com" style={inp}/>
            </Field>
            <Field label="Password">
              <div style={{position:'relative'}}>
                <input type={showPass?'text':'password'} value={pass} onChange={e=>{setPass(e.target.value);setErr('');}}
                  onKeyDown={e=>e.key==='Enter'&&go()} placeholder="Enter password" style={{...inp,paddingRight:44}}/>
                <button type="button" onClick={()=>setShowPass(p=>!p)}
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
            Staff? <span onClick={()=>nv('/login')} style={{color:'#3B82F6',cursor:'pointer',fontWeight:600}}>Staff Login</span>
          </p>
        </div>
      </div>
    </div>
  );
};

const LogoutPage=()=>{
  const nv=useNavigate();
  return(
    <div style={{minHeight:'100vh',display:'flex',justifyContent:'center',alignItems:'center',backgroundColor:'#F1F5F9',fontFamily:'Inter,sans-serif'}}>
      <div style={{textAlign:'center',maxWidth:380}}>
        <div style={{fontSize:56,marginBottom:16}}>👋</div>
        <h2 style={{fontSize:26,fontWeight:800,color:'#0F172A',marginBottom:10}}>Session Ended</h2>
        <p style={{color:'#64748B',marginBottom:24,lineHeight:1.6}}>Your session has ended securely. Please log in again to continue.</p>
        <Btn onClick={()=>nv('/',{replace:true})} v="primary" sz="lg" style={{justifyContent:'center'}}>Return to Login</Btn>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════
   NURSE MODULE
══════════════════════════════════════ */
const nurseNav=[
  {path:'/nurse-dashboard', label:'Dashboard',    icon:'🏠'},
  {path:'/nurse-patients',  label:'Patients',     icon:'👥'},
  {path:'/nurse-triage',    label:'Triage Queue', icon:'🩺'},
  {path:'/nurse-schedule',  label:'Schedule',     icon:'📅'},
];

const NurseDashboard=()=>{
  const nv=useNavigate();
  const toast=useToast();
  const [stats,setStats]=React.useState({waiting:'—',captured:'—',emergency:'—'});
  const [showReg,setShowReg]=React.useState(false);
  const [f,setF]=React.useState({fn:'',ln:'',email:'',dob:'',phone:'',gender:'',regDate:''});
  const [sub,setSub]=React.useState(false);

  const loadStats=()=>{
    fetch(`${BASE_URL}/api/patients/stats/nurse`,{headers:ah()})
      .then(r=>r.json()).then(d=>setStats({waiting:String(d.waiting??0),captured:String(d.captured??0),emergency:String(d.emergency??0)}))
      .catch(()=>{});
  };
  React.useEffect(loadStats,[]);

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

  return(
    <AL nav={nurseNav} title="Nurse Dashboard">
      <Toast {...toast}/>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}>
        <p style={{color:'#64748B'}}>Welcome, {localStorage.getItem('display_name')||'Nurse'}. Here's today's summary.</p>
        <Btn onClick={()=>setShowReg(true)} v="blue">+ Register New Patient</Btn>
      </div>
      <div style={{display:'flex',gap:14,marginBottom:24,flexWrap:'wrap'}}>
        <SC label="Patients Waiting"      value={stats.waiting}   icon="⏳" color="#B45309" bg="#FFFBEB" border="#FDE68A"/>
        <SC label="Vitals Captured Today" value={stats.captured}  icon="💉" color="#16A34A" bg="#F0FDF4" border="#BBF7D0"/>
        <SC label="Emergency Triage"      value={stats.emergency} icon="🚨" color="#DC2626" bg="#FEF2F2" border="#FECACA"/>
      </div>
      <div style={{display:'flex',gap:10}}>
        <Btn onClick={()=>nv('/nurse-triage')} v="primary">Go to Triage Queue →</Btn>
        <Btn onClick={()=>nv('/nurse-patients')} v="ghost">View All Patients →</Btn>
      </div>

      <Modal open={showReg} onClose={()=>setShowReg(false)} title="Register New Patient" width={520}>
        <MB>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
            <Field label="First Name" required><input value={f.fn} onChange={e=>setF({...f,fn:e.target.value})} placeholder="e.g. Kwame" style={inp}/></Field>
            <Field label="Last Name"  required><input value={f.ln} onChange={e=>setF({...f,ln:e.target.value})} placeholder="e.g. Mensah" style={inp}/></Field>
          </div>
          <Field label="Email (optional)"><input type="email" value={f.email} onChange={e=>setF({...f,email:e.target.value})} placeholder="e.g. kwame@email.com" style={inp}/></Field>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
            <Field label="Date of Birth (DD/MM/YYYY)"><input value={f.dob} onChange={e=>setF({...f,dob:e.target.value})} placeholder="e.g. 12/05/1990" style={inp}/></Field>
            <Field label="Phone"><input value={f.phone} onChange={e=>setF({...f,phone:e.target.value})} placeholder="e.g. 0244123456" style={inp}/></Field>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
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

const NursePatients=()=>{
  const nv=useNavigate();
  const toast=useToast();
  const [patients,setPatients]=React.useState([]);
  const [loading,setLoading]=React.useState(true);
  const [search,setSearch]=React.useState('');

  React.useEffect(()=>{
    fetch(`${BASE_URL}/api/patients`,{headers:ah()})
      .then(r=>r.json()).then(d=>setPatients(Array.isArray(d)?d:[]))
      .catch(()=>{}).finally(()=>setLoading(false));
  },[]);

  const readmit=async(p)=>{
    const r=await fetch(`${BASE_URL}/api/patients/${p.patient_id}/status`,{method:'PATCH',headers:ah(),body:JSON.stringify({
  status:'waiting',
  registration_date: new Date().toISOString().split('T')[0]})});
    if(r.ok){setPatients(prev=>prev.map(x=>x.patient_id===p.patient_id?{...x,status:'waiting'}:x));toast.show(`${p.full_name} added to triage queue.`);}
    else toast.show('Failed.','error');``
  };

  const filtered=patients.filter(p=>(p.full_name||'').toLowerCase().includes(search.toLowerCase())||(p.national_patient_id||'').toLowerCase().includes(search.toLowerCase()));

  return(
    <AL nav={nurseNav} title="Patient Database" searchText={search} setSearchText={setSearch}>
      <Toast {...toast}/>
      {loading?<p style={{textAlign:'center',padding:40,color:'#94A3B8'}}>Loading...</p>:
        <Table cols={[
          {key:'name',label:'Patient Name',w:'24%'},
          {key:'id',  label:'Patient ID',  w:'14%'},
          {key:'gen', label:'Gender',      w:'10%'},
          {key:'dob', label:'Date of Birth',w:'14%'},
          {key:'stat',label:'Status',      w:'12%'},
          {key:'act', label:'Actions',     w:'26%'},
        ]} rows={filtered.map(p=>({
          name:<span style={{fontWeight:700,color:'#0F172A'}}>{p.full_name||'—'}</span>,
          id:  <span style={{color:'#64748B',fontFamily:'monospace',fontSize:13}}>{p.national_patient_id||p.patient_id}</span>,
          gen: <span style={{color:'#64748B'}}>{p.gender||'—'}</span>,
          dob: <span style={{color:'#64748B'}}>{fmtDate(p.date_of_birth)}</span>,
          stat:statusBadge(p.status||'active'),
          act: <div style={{display:'flex',gap:8}}>
            <Btn onClick={()=>nv('/nurse-patient-profile',{state:{patientId:p.patient_id}})} v="ghost" sz="sm">View</Btn>
            <Btn onClick={()=>readmit(p)} v="ghost" sz="sm" style={{color:'#B45309',borderColor:'#FDE68A'}}>Re-admit</Btn>
          </div>
        }))} empty="No patients found."/>
      }
    </AL>
  );
};

const NurseTriage=()=>{
  const toast=useToast();
  const [queue,setQueue]=React.useState([]);
  const [loading,setLoading]=React.useState(true);
  const [sel,setSel]=React.useState(null);
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

  return(
    <AL nav={nurseNav} title="Triage & Vitals Queue">
      <Toast {...toast}/>
      <div style={{display:'flex',gap:14,marginBottom:20,flexWrap:'wrap'}}>
        <SC label="Patients Waiting" value={loading?'—':String(queue.length)} icon="⏳" color="#B45309" bg="#FFFBEB" border="#FDE68A"/>
      </div>
      {loading?<p style={{textAlign:'center',padding:40,color:'#94A3B8'}}>Loading queue...</p>:
        <Table cols={[
          {key:'name', label:'Patient Name',      w:'24%'},
          {key:'id',   label:'Patient ID',        w:'14%'},
          {key:'reg',  label:'Registration Time', w:'22%'},
          {key:'stat', label:'Status',            w:'14%'},
          {key:'act',  label:'Action',            w:'26%'},
        ]} rows={queue.map(p=>({
          name:<span style={{fontWeight:700,color:'#0F172A'}}>{p.full_name||<em style={{color:'#94A3B8'}}>No name</em>}</span>,
          id:  <span style={{color:'#64748B',fontFamily:'monospace',fontSize:13}}>{p.national_patient_id||p.patient_id}</span>,
          reg: <span style={{color:'#64748B'}}>{fmtDT(p.registration_date)}</span>,
          stat:<Badge text="Waiting" color="yellow"/>,
act: <div style={{display:'flex',gap:8}}>
  <Btn onClick={()=>setSel(p)} v="blue" sz="sm">Start Triage</Btn>
  <Btn onClick={async()=>{
    const r=await fetch(`${BASE_URL}/api/patients/${p.patient_id}/status`,{method:'PATCH',headers:ah(),body:JSON.stringify({status:'inactive'})});
    if(r.ok) setQueue(prev=>prev.filter(x=>x.patient_id!==p.patient_id));
  }} v="danger" sz="sm">Remove</Btn>
</div>
        }))} empty="No patients in triage queue."/>
      }
      <Modal open={!!sel} onClose={()=>{setSel(null);setV({temp:'',weight:'',bp:'',hr:'',chief:''}); }} title={`Record Vitals — ${sel?.full_name||''}`} width={500}>
        <MB>
          <div style={{padding:'11px 14px',backgroundColor:'#EFF6FF',borderRadius:8,border:'1px solid #BFDBFE',fontSize:13,color:'#1D4ED8',fontWeight:600}}>
            📋 Patient: <strong>{sel?.full_name||'—'}</strong> &nbsp;|&nbsp; ID: {sel?.national_patient_id||sel?.patient_id}
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
            <Field label="Temperature (°C)"><input value={v.temp} onChange={e=>setV({...v,temp:e.target.value})} placeholder="e.g. 36.8" style={inp}/></Field>
            <Field label="Weight (kg)"><input value={v.weight} onChange={e=>setV({...v,weight:e.target.value})} placeholder="e.g. 70" style={inp}/></Field>
            <Field label="Blood Pressure (mmHg)" required><input value={v.bp} onChange={e=>setV({...v,bp:e.target.value})} placeholder="e.g. 120/80" style={inp}/></Field>
            <Field label="Heart Rate (BPM)" required><input value={v.hr} onChange={e=>setV({...v,hr:e.target.value})} placeholder="e.g. 72" style={inp}/></Field>
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

  return(
    <AL nav={nurseNav} title="Patient Queue / Schedule">
      <Toast {...toast}/>
      <p style={{color:'#64748B',marginBottom:18}}>Patients currently waiting for vitals capture.</p>
      {loading?<p style={{textAlign:'center',padding:40,color:'#94A3B8'}}>Loading...</p>:
        <Table cols={[
          {key:'name',label:'Patient Name', w:'22%'},
          {key:'id',  label:'ID',           w:'14%'},
          {key:'reg', label:'Reg. Date',    w:'18%'},
          {key:'stat',label:'Status',       w:'16%'},
          {key:'act', label:'Actions',      w:'30%'},
        ]} rows={queue.map(p=>({
          name:<span style={{fontWeight:700,color:p.full_name?'#0F172A':'#94A3B8'}}>
            {p.full_name||<em>No name on record</em>}
          </span>,
          id:  <span style={{color:'#64748B',fontFamily:'monospace',fontSize:13}}>{p.national_patient_id||p.patient_id||'—'}</span>,
          reg: <span style={{color:'#64748B'}}>{fmtDate(p.registration_date)}</span>,
          stat:<Badge text="Waiting for Vitals" color="yellow"/>,
          act: <div style={{display:'flex',gap:8}}>
            <Btn onClick={()=>nv('/nurse-triage')} v="ghost" sz="sm">Go to Triage →</Btn>
            <Btn onClick={()=>setShowConfirm(p)} v="danger" sz="sm">Remove</Btn>
          </div>
        }))} empty="No patients in queue."/>
      }

      {/* Confirm dismiss modal */}
      <Modal open={!!showConfirm} onClose={()=>setShowConfirm(null)} title="Remove from Queue?" width={420}>
        <MB>
          <div style={{padding:'14px 16px',backgroundColor:'#FEF2F2',borderRadius:8,border:'1px solid #FECACA',fontSize:14,color:'#7F1D1D',lineHeight:1.6}}>
            {showConfirm?.full_name
              ? <>You are about to remove <strong>{showConfirm.full_name}</strong> (ID: {showConfirm.national_patient_id||showConfirm.patient_id}) from the triage queue. Their status will be set to <strong>Inactive</strong>.</>
              : <>This patient has no name on record (ID: {showConfirm?.national_patient_id||showConfirm?.patient_id}). Removing them will set their status to <strong>Inactive</strong>.</>
            }
          </div>
          <p style={{fontSize:13,color:'#64748B'}}>You can re-admit them later from the Patient Database if needed.</p>
        </MB>
        <MF>
          <Btn onClick={()=>setShowConfirm(null)} v="ghost">Cancel</Btn>
          <Btn onClick={()=>dismiss(showConfirm)} v="danger">Yes, Remove</Btn>
        </MF>
      </Modal>
    </AL>
  );
};

/* ── FIX: NursePatientProfile — vitals now fall back to medical_records[0] ── */
const NursePatientProfile=()=>{
  const nv=useNavigate();
  const loc=useLocation();
  const {patientId}=loc.state||{};
  const [data,setData]=React.useState(null);
  const [loading,setLoading]=React.useState(true);
  const [tab,setTab]=React.useState('Overview');

  React.useEffect(()=>{
    if(!patientId)return;
    fetch(`${BASE_URL}/api/patients/${patientId}/full`,{headers:ah()})
      .then(r=>r.json()).then(d=>setData(d)).catch(()=>{}).finally(()=>setLoading(false));
  },[patientId]);

  if(loading)return<AL nav={nurseNav} title="Patient Profile"><p style={{textAlign:'center',padding:60,color:'#94A3B8'}}>Loading...</p></AL>;
  if(!data)return<AL nav={nurseNav} title="Patient Profile"><p style={{textAlign:'center',padding:60,color:'#94A3B8'}}>Not found.</p></AL>;

const pt = data.patient || data || {};
  // FIX: vitals fall back to first medical record if the vitals object is empty
  const { recs, vit } = extractVitalsAndRecords(data);

  return(
    <AL nav={nurseNav} title="Patient Profile">
      <div style={{display:'flex',alignItems:'center',gap:16,marginBottom:20,padding:'18px 22px',
        backgroundColor:'white',borderRadius:14,border:'1px solid #E2E8F0',justifyContent:'space-between'}}>
        <div style={{display:'flex',alignItems:'center',gap:14}}>
          <div style={{width:50,height:50,borderRadius:'50%',backgroundColor:'#DBEAFE',
            display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,fontWeight:800,color:'#1D4ED8'}}>
            {(pt.full_name||'?').charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 style={{fontSize:20,fontWeight:800,color:'#0F172A',marginBottom:4}}>{pt.full_name||'—'}</h2>
            <p style={{color:'#64748B',fontSize:13}}>
              ID: {pt.national_patient_id||pt.patient_id||'—'} &nbsp;|&nbsp; {pt.gender||'—'} &nbsp;|&nbsp; Age: {calcAge(pt.date_of_birth)}
              {pt.phone&&<> &nbsp;|&nbsp; 📞 {pt.phone}</>}
            </p>
          </div>
        </div>
        {statusBadge(pt.status||'active')}
      </div>

      {/* Vitals cards */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12,marginBottom:20}}>
        {[{l:'Blood Pressure',v:vit.blood_pressure||'—',u:'mmHg'},
          {l:'Heart Rate',v:vit.pulse_rate||'—',u:'bpm'},
          {l:'Temperature',v:vit.temperature||'—',u:'°C'},
          {l:'Weight',v:vit.weight||'—',u:'kg'}].map((x,i)=>(
          <div key={i} style={{backgroundColor:'white',padding:'16px 18px',borderRadius:12,border:'1px solid #E2E8F0',textAlign:'center',position:'relative'}}>
            <p style={{fontSize:11,color:'#94A3B8',fontWeight:700,marginBottom:8,textTransform:'uppercase'}}>{x.l}</p>
            <h3 style={{fontSize:24,fontWeight:800,color: x.v==='—'?'#CBD5E1':'#0F172A'}}>{x.v}</h3>
            <span style={{position:'absolute',bottom:7,right:10,fontSize:11,color:'#CBD5E1'}}>{x.u}</span>
          </div>
        ))}
      </div>

      {/* Patient info row */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12,marginBottom:20}}>
        {[{l:'Date of Birth',v:fmtDate(pt.date_of_birth)},
          {l:'Phone',v:pt.phone||'—'},
          {l:'Email',v:pt.email||'—'}].map((x,i)=>(
          <div key={i} style={{backgroundColor:'white',padding:'14px 18px',borderRadius:12,border:'1px solid #E2E8F0'}}>
            <p style={{fontSize:11,color:'#94A3B8',fontWeight:700,marginBottom:4,textTransform:'uppercase'}}>{x.l}</p>
            <p style={{fontSize:14,fontWeight:600,color:'#0F172A'}}>{x.v}</p>
          </div>
        ))}
      </div>

      <div style={{display:'flex',gap:4,marginBottom:16,borderBottom:'2px solid #E2E8F0'}}>
        {['Overview','History'].map(t=>(
          <button key={t} onClick={()=>setTab(t)} style={{padding:'9px 18px',border:'none',background:'none',cursor:'pointer',
            fontWeight:700,fontSize:13,color:tab===t?'#3B82F6':'#64748B',
            borderBottom:tab===t?'2px solid #3B82F6':'2px solid transparent',marginBottom:-2}}>
            {t}
          </button>
        ))}
      </div>
      {tab==='Overview'&&(
        <div style={{backgroundColor:'white',padding:'18px 22px',borderRadius:12,border:'1px solid #E2E8F0'}}>
          <h4 style={{fontSize:13,fontWeight:700,color:'#64748B',marginBottom:8}}>Chief Complaint</h4>
          <p style={{fontSize:15,color:'#0F172A'}}>{vit.chief_complaint||recs[0]?.chief_complaint||'Not recorded.'}</p>
          <h4 style={{fontSize:13,fontWeight:700,color:'#64748B',marginBottom:8,marginTop:18}}>Primary Diagnosis</h4>
          <p style={{fontSize:15,color:'#0F172A',fontWeight:700}}>{recs[0]?.diagnosis||'—'}</p>
        </div>
      )}
      {tab==='History'&&(
        <Table cols={[{key:'date',label:'Date',w:'14%'},{key:'diag',label:'Diagnosis',w:'24%'},{key:'notes',label:'Notes',w:'38%'},{key:'dr',label:'Doctor',w:'24%'}]}
          rows={recs.map(r=>({date:fmtDate(r.created_at),diag:<span style={{fontWeight:600}}>{r.diagnosis||'—'}</span>,notes:r.clinical_notes||r.notes||'—',dr:r.doctor_name||'—'}))}
          empty="No history yet."/>
      )}
      <div style={{marginTop:20,display:'flex',justifyContent:'flex-end'}}>
        <Btn onClick={()=>nv(-1)} v="ghost">← Back</Btn>
      </div>
    </AL>
  );
};

/* ══════════════════════════════════════
   DOCTOR MODULE
══════════════════════════════════════ */
const doctorNav=[
  {path:'/doctor-dashboard',    label:'Dashboard',   icon:'🏠'},
  {path:'/doctor-patients',     label:'Patients',    icon:'👥'},
  {path:'/doctor-schedule',     label:'Schedule',    icon:'📅'},
  {path:'/doctor-lab',          label:'Lab Results', icon:'🔬'},
];

const DoctorDashboard=()=>{
  const nv=useNavigate();
  const [queue,setQueue]=React.useState([]);
  const [stats,setStats]=React.useState({total_patients:'—',appointments_today:'—',pending_labs:'—'});
  const [loading,setLoading]=React.useState(true);

  React.useEffect(()=>{
    Promise.all([
      fetch(`${BASE_URL}/api/patients/stats/doctor`,{headers:ah()}).then(r=>r.json()),
      fetch(`${BASE_URL}/api/patients/queue/doctor`,{headers:ah()}).then(r=>r.json())
    ]).then(([s,q])=>{setStats(s);setQueue(Array.isArray(q)?q:[]);})
    .catch(()=>{}).finally(()=>setLoading(false));
  },[]);

  return(
    <AL nav={doctorNav} title="Doctor Dashboard">
      <p style={{color:'#64748B',marginBottom:20}}>Welcome, Dr. {localStorage.getItem('display_name')}. Today's patients are listed below.</p>
      <div style={{display:'flex',gap:14,marginBottom:24,flexWrap:'wrap'}}>
        <SC label="Total Patients"       value={loading?'—':String(stats.total_patients||0)}    icon="👥"/>
        <SC label="Appointments Today"   value={loading?'—':String(stats.appointments_today||0)} icon="📅" color="#3B82F6" bg="#EFF6FF" border="#BFDBFE"/>
        <SC label="Pending Lab Requests" value={loading?'—':String(stats.pending_labs||0)}       icon="🔬" color="#B45309" bg="#FFFBEB" border="#FDE68A"/>
      </div>
      <h3 style={{fontSize:15,fontWeight:700,color:'#374151',marginBottom:12}}>Today's Patient Queue</h3>
      {loading?<p style={{textAlign:'center',padding:40,color:'#94A3B8'}}>Loading...</p>:
        <Table cols={[
          {key:'name',  label:'Patient Name',    w:'20%'},
          {key:'id',    label:'Patient ID',      w:'13%'},
          {key:'time',  label:'Arrival Time',    w:'11%'},
          {key:'reason',label:'Reason for Visit',w:'26%'},
          {key:'bp',    label:'BP',              w:'10%'},
          {key:'hr',    label:'HR',              w:'8%'},
          {key:'act',   label:'Action',          w:'12%'},
        ]} rows={queue.map(p=>({
          name:  <span style={{fontWeight:700,color:'#0F172A'}}>{p.full_name}</span>,
          id:    <span style={{color:'#64748B',fontFamily:'monospace',fontSize:12}}>{p.national_patient_id||p.patient_id}</span>,
          time:  <span style={{color:'#64748B',fontSize:13}}>{fmtTime(p.registration_date)}</span>,
          reason:<span style={{color:'#374151'}}>{p.chief_complaint||'Walk-in'}</span>,
          bp:    <span style={{fontWeight:700,color:p.blood_pressure?'#0F172A':'#94A3B8'}}>{p.blood_pressure||'—'}</span>,
          hr:    <span style={{fontWeight:700,color:p.pulse_rate?'#0F172A':'#94A3B8'}}>{p.pulse_rate||'—'}</span>,
          act:   <Btn onClick={()=>nv('/doctor-patient-view',{state:{patientId:p.patient_id}})} v="ghost" sz="sm">View →</Btn>
        }))} empty="No patients in queue today."/>
      }
    </AL>
  );
};

const DoctorPatients=()=>{
  const nv=useNavigate();
  const [patients,setPatients]=React.useState([]);
  const [loading,setLoading]=React.useState(true);
  const [search,setSearch]=React.useState('');

  React.useEffect(()=>{
    fetch(`${BASE_URL}/api/patients`,{headers:ah()})
      .then(r=>r.json()).then(d=>setPatients(Array.isArray(d)?d:[]))
      .catch(()=>{}).finally(()=>setLoading(false));
  },[]);

  const filtered=patients.filter(p=>(p.full_name||'').toLowerCase().includes(search.toLowerCase())||(p.national_patient_id||'').toLowerCase().includes(search.toLowerCase()));

  return(
    <AL nav={doctorNav} title="Patient Database" searchText={search} setSearchText={setSearch}>
      {loading?<p style={{textAlign:'center',padding:40,color:'#94A3B8'}}>Loading...</p>:
        <Table cols={[
          {key:'name',label:'Patient Name',  w:'22%'},
          {key:'id',  label:'Patient ID',    w:'13%'},
          {key:'gen', label:'Gender',        w:'9%'},
          {key:'dob', label:'Date of Birth', w:'13%'},
          {key:'stat',label:'Status',        w:'12%'},
          {key:'act', label:'Actions',       w:'31%'},
        ]} rows={filtered.map(p=>({
          name:<span style={{fontWeight:700,color:'#0F172A'}}>{p.full_name}</span>,
          id:  <span style={{color:'#64748B',fontFamily:'monospace',fontSize:12}}>{p.national_patient_id||p.patient_id}</span>,
          gen: <span style={{color:'#64748B'}}>{p.gender||'—'}</span>,
          dob: <span style={{color:'#64748B'}}>{fmtDate(p.date_of_birth)}</span>,
          stat:statusBadge(p.status||'active'),
          act: <div style={{display:'flex',gap:8}}>
            <Btn onClick={()=>nv('/doctor-patient-view',{state:{patientId:p.patient_id}})} v="ghost" sz="sm">View Record</Btn>
            <Btn onClick={()=>nv('/doctor-consultation',{state:{patientId:p.patient_id}})} v="blue" sz="sm">Consult</Btn>
          </div>
        }))} empty="No patients found."/>
      }
    </AL>
  );
};

/* ── FIX: DoctorPatientView — vitals now fall back to medical_records[0] ── */
const DoctorPatientView=()=>{
  const nv=useNavigate();
  const loc=useLocation();
  const {patientId}=loc.state||{};
  const [data,setData]=React.useState(null);
  const [loading,setLoading]=React.useState(true);
  const [tab,setTab]=React.useState('Overview');

  React.useEffect(()=>{
    if(!patientId)return;
    fetch(`${BASE_URL}/api/patients/${patientId}/full`,{headers:ah()})
      .then(r=>r.json()).then(d=>setData(d)).catch(()=>{}).finally(()=>setLoading(false));
  },[patientId]);

  if(loading)return<AL nav={doctorNav} title="Patient Record"><p style={{textAlign:'center',padding:60,color:'#94A3B8'}}>Loading...</p></AL>;
  if(!data)return<AL nav={doctorNav} title="Patient Record"><p style={{textAlign:'center',padding:60,color:'#94A3B8'}}>Not found.</p></AL>;

const pt = data.patient || data || {};
  // FIX: vitals fall back to first medical record
  const { recs, vit } = extractVitalsAndRecords(data);
  const presc = data.prescriptions || [];
  const labs  = data.lab_results   || [];

  return(
    <AL nav={doctorNav} title="Patient Record">
      <div style={{display:'flex',alignItems:'center',gap:16,marginBottom:18,padding:'18px 22px',
        backgroundColor:'white',borderRadius:14,border:'1px solid #E2E8F0',justifyContent:'space-between'}}>
        <div style={{display:'flex',alignItems:'center',gap:14}}>
          <div style={{width:50,height:50,borderRadius:'50%',backgroundColor:'#DBEAFE',
            display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,fontWeight:800,color:'#1D4ED8'}}>
            {(pt.full_name||'?').charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 style={{fontSize:20,fontWeight:800,color:'#0F172A',marginBottom:4}}>{pt.full_name||'—'}</h2>
            <p style={{color:'#64748B',fontSize:13}}>
              ID: {pt.national_patient_id||pt.patient_id||'—'} &nbsp;|&nbsp; {pt.gender||'—'} &nbsp;|&nbsp;
              Age: {calcAge(pt.date_of_birth)} &nbsp;|&nbsp; {statusBadge(pt.status||'active')}
            </p>
          </div>
        </div>
        <Btn onClick={()=>nv('/doctor-consultation',{state:{patientId}})} v="blue">Start / Continue Consultation →</Btn>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12,marginBottom:18}}>
        {[{l:'Blood Pressure',v:vit.blood_pressure||'—',u:'mmHg'},
          {l:'Heart Rate',v:vit.pulse_rate||'—',u:'bpm'},
          {l:'Temperature',v:vit.temperature||'—',u:'°C'},
          {l:'Weight',v:vit.weight||'—',u:'kg'}].map((x,i)=>(
          <div key={i} style={{backgroundColor:'white',padding:'14px 16px',borderRadius:12,border:'1px solid #E2E8F0',textAlign:'center'}}>
            <p style={{fontSize:11,color:'#94A3B8',fontWeight:700,marginBottom:6,textTransform:'uppercase'}}>{x.l}</p>
            <h3 style={{fontSize:22,fontWeight:800,color:x.v==='—'?'#CBD5E1':'#0F172A'}}>
              {x.v}<span style={{fontSize:11,color:'#CBD5E1',marginLeft:4}}>{x.u}</span>
            </h3>
          </div>
        ))}
      </div>
      <div style={{display:'flex',gap:4,marginBottom:14,borderBottom:'2px solid #E2E8F0'}}>
        {['Overview','History','Lab Results','Prescriptions'].map(t=>(
          <button key={t} onClick={()=>setTab(t)} style={{padding:'8px 16px',border:'none',background:'none',cursor:'pointer',
            fontWeight:700,fontSize:13,color:tab===t?'#3B82F6':'#64748B',
            borderBottom:tab===t?'2px solid #3B82F6':'2px solid transparent',marginBottom:-2}}>
            {t}
          </button>
        ))}
      </div>
      {tab==='Overview'&&<div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
        <div style={{backgroundColor:'white',padding:'16px 20px',borderRadius:12,border:'1px solid #E2E8F0'}}>
          <h4 style={{fontSize:13,fontWeight:700,color:'#64748B',marginBottom:8}}>Chief Complaint</h4>
          <p style={{fontSize:14,color:'#0F172A'}}>{vit.chief_complaint||recs[0]?.chief_complaint||'—'}</p>
        </div>
        <div style={{backgroundColor:'white',padding:'16px 20px',borderRadius:12,border:'1px solid #E2E8F0'}}>
          <h4 style={{fontSize:13,fontWeight:700,color:'#64748B',marginBottom:8}}>Primary Diagnosis</h4>
          <p style={{fontSize:14,fontWeight:700,color:'#0F172A'}}>{recs[0]?.diagnosis||'—'}</p>
        </div>
        <div style={{backgroundColor:'white',padding:'16px 20px',borderRadius:12,border:'1px solid #E2E8F0',gridColumn:'1/-1'}}>
          <h4 style={{fontSize:13,fontWeight:700,color:'#64748B',marginBottom:8}}>Clinical Notes</h4>
          <p style={{fontSize:14,color:'#374151',lineHeight:1.7}}>{recs[0]?.clinical_notes||recs[0]?.notes||'No notes recorded.'}</p>
        </div>
      </div>}
      {tab==='History'&&<Table cols={[{key:'date',label:'Date',w:'14%'},{key:'diag',label:'Diagnosis',w:'22%'},{key:'notes',label:'Notes',w:'40%'},{key:'dr',label:'Doctor',w:'24%'}]}
        rows={recs.map(r=>({date:fmtDate(r.created_at),diag:<span style={{fontWeight:600}}>{r.diagnosis||'—'}</span>,notes:r.clinical_notes||r.notes||'—',dr:r.doctor_name||'—'}))}
        empty="No history."/>}
      {tab==='Lab Results'&&<Table cols={[{key:'test',label:'Test',w:'24%'},{key:'res',label:'Result',w:'18%'},{key:'ref',label:'Reference',w:'18%'},{key:'date',label:'Date',w:'14%'},{key:'stat',label:'Status',w:'26%'}]}
        rows={labs.map(r=>({test:<span style={{fontWeight:600}}>{r.test_name||r.test_type||'—'}</span>,res:r.result_value||'—',ref:r.reference_range||'—',date:fmtDate(r.created_at),stat:statusBadge(r.result_status||'normal')}))}
        empty="No lab results yet."/>}
      {tab==='Prescriptions'&&<Table cols={[{key:'med',label:'Medication',w:'24%'},{key:'dose',label:'Dosage',w:'13%'},{key:'freq',label:'Frequency',w:'15%'},{key:'dur',label:'Duration',w:'13%'},{key:'date',label:'Date',w:'13%'},{key:'stat',label:'Status',w:'22%'}]}
        rows={presc.map(p=>({med:<span style={{fontWeight:700}}>{p.medication_name}</span>,dose:p.dosage||'—',freq:p.frequency||'—',dur:p.duration||'—',date:fmtDate(p.issued_at),stat:statusBadge(p.status||'pending')}))}
        empty="No prescriptions yet."/>}
      <div style={{marginTop:18,display:'flex',justifyContent:'flex-end'}}>
        <Btn onClick={()=>nv(-1)} v="ghost">← Back</Btn>
      </div>
    </AL>
  );
};

const DoctorSchedule=()=>{
  const nv=useNavigate();
  const [queue,setQueue]=React.useState([]);
  const [loading,setLoading]=React.useState(true);
  const [search,setSearch]=React.useState('');
  React.useEffect(()=>{
    fetch(`${BASE_URL}/api/patients/queue/doctor`,{headers:ah()})
      .then(r=>r.json()).then(d=>setQueue(Array.isArray(d)?d:[]))
      .catch(()=>{}).finally(()=>setLoading(false));
  },[]);
  const filtered=queue.filter(p=>(p.full_name||'').toLowerCase().includes(search.toLowerCase()));
  return(
    <AL nav={doctorNav} title="Today's Schedule" searchText={search} setSearchText={setSearch}>
      <p style={{color:'#64748B',marginBottom:18}}>Click "Consult" to begin or continue a patient consultation. You can return to a patient at any time.</p>
      {loading?<p style={{textAlign:'center',padding:40,color:'#94A3B8'}}>Loading...</p>:
        <Table cols={[
          {key:'name',  label:'Patient Name',    w:'20%'},
          {key:'id',    label:'ID',              w:'12%'},
          {key:'time',  label:'Arrival',         w:'10%'},
          {key:'reason',label:'Reason for Visit',w:'24%'},
          {key:'bp',    label:'BP',              w:'9%'},
          {key:'hr',    label:'HR',              w:'8%'},
          {key:'act',   label:'Action',          w:'17%'},
        ]} rows={filtered.map(p=>({
          name:  <span style={{fontWeight:700,color:'#0F172A'}}>{p.full_name}</span>,
          id:    <span style={{color:'#64748B',fontFamily:'monospace',fontSize:12}}>{p.national_patient_id||p.patient_id}</span>,
          time:  <span style={{color:'#64748B',fontSize:13}}>{fmtTime(p.registration_date)}</span>,
          reason:<span>{p.chief_complaint||'Walk-in'}</span>,
          bp:    <span style={{fontWeight:700}}>{p.blood_pressure||'—'}</span>,
          hr:    <span style={{fontWeight:700}}>{p.pulse_rate||'—'}</span>,
          act:   <Btn onClick={()=>nv('/doctor-consultation',{state:{patientId:p.patient_id}})} v="blue" sz="sm">Consult</Btn>
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
  const [saving,setSaving]=React.useState(false);
  const [saved,setSaved]=React.useState(false);

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
        // FIX: use extractVitalsAndRecords helper, pre-fill notes/diag from existing record
        const existingRecs = d.records || d.medical_records || [];
        // Find the most recent record that has clinical notes or diagnosis (doctor's work)
        const doctorRec = existingRecs.find(r => r.clinical_notes || r.diagnosis) || existingRecs[0];
        if(doctorRec){
          setNotes(doctorRec.clinical_notes || doctorRec.notes || '');
          setDiag(doctorRec.diagnosis || '');
          // Store the record ID so we can PATCH it on save
          const rid = doctorRec.record_id || doctorRec.medical_record_id || null;
          setRecordId(rid);
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
        })});
      if(r.ok){
        // If we just created a new record, grab its ID for future updates
        if(!isUpdate){
          const created = await r.json().catch(()=>({}));
          const newId = created.record_id || created.medical_record_id || created.id || null;
          if(newId) setRecordId(newId);
        }
        toast.show(isUpdate ? 'Record updated!' : 'Record saved!');
        setSaved(true);
      }
      else toast.show('Failed to save.','error');
    }catch{toast.show('Network error.','error');}finally{setSaving(false);}
  };

  const sendLab=async()=>{
    const sel=Object.entries(labChecks).filter(([,v])=>v).map(([k])=>k);
    if(!sel.length){toast.show('Select at least one test.','error');return;}
    setSendingLab(true);
    try{
      const results = await Promise.all(sel.map(testId=>{
  const test = GH_LABS.find(t=>t.id===testId);
  return fetch(`${BASE_URL}/api/lab-requests`,{method:'POST',headers:ah(),
    body:JSON.stringify({
      patient_id:patientId,
      test_type:testId,
      test_category:test?.cat||'',
      clinical_indications:labNotes
    })});
}));
const allOk = results.every(r=>r.ok);
if(allOk){toast.show(`${sel.length} lab request(s) sent!`);setShowLab(false);setLabChecks({});setLabNotes('');}
else toast.show('Some requests failed.','error');
    }catch{toast.show('Network error.','error');}finally{setSendingLab(false);}
  };

  const sendRx=async()=>{
    if(!rx.med){toast.show('Please enter medication name.','error');return;}
    setSendingRx(true);
    try{
      const r=await fetch(`${BASE_URL}/api/prescriptions`,{method:'POST',headers:ah(),
        body:JSON.stringify({patient_id:patientId,medication_name:rx.med,dosage:rx.dose,frequency:rx.freq,duration:rx.dur})});
      if(r.ok){toast.show('Prescription sent to pharmacy!');setShowRx(false);setRx({med:'',dose:'',freq:'',dur:''});load();}
      else toast.show('Failed.','error');
    }catch{toast.show('Network error.','error');}finally{setSendingRx(false);}
  };

  if(loading)return<AL nav={doctorNav} title="Consultation"><p style={{textAlign:'center',padding:60,color:'#94A3B8'}}>Loading patient data...</p></AL>;
  if(!data)return<AL nav={doctorNav} title="Consultation"><p style={{textAlign:'center',padding:60,color:'#94A3B8'}}>Patient not found.</p></AL>;

const pt = data.patient || data || {};
  // FIX: vitals fall back to records[0]
  const { recs, vit } = extractVitalsAndRecords(data);
  const labs  = data.lab_results   || [];
  const presc = data.prescriptions || [];
  const labByCat=GH_LABS.reduce((a,t)=>{if(!a[t.cat])a[t.cat]=[];a[t.cat].push(t);return a;},{});

  return(
    <AL nav={doctorNav} title={`Consultation — ${pt.full_name||''}`}>
      <Toast {...toast}/>

      {/* Patient banner */}
      <div style={{padding:'14px 20px',backgroundColor:'#0F172A',borderRadius:12,marginBottom:18,
        display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          <div style={{width:40,height:40,borderRadius:'50%',backgroundColor:'rgba(255,255,255,.1)',
            display:'flex',alignItems:'center',justifyContent:'center',fontSize:16,fontWeight:800,color:'white'}}>
            {(pt.full_name||'?').charAt(0)}
          </div>
          <div>
            <p style={{color:'white',fontWeight:800,fontSize:15,margin:0}}>{pt.full_name||'—'}</p>
            <p style={{color:'rgba(255,255,255,.45)',fontSize:12,margin:0}}>
              {pt.national_patient_id||pt.patient_id||'—'} · {pt.gender||'—'} · Age {calcAge(pt.date_of_birth)} · Chief complaint: {vit.chief_complaint||recs[0]?.chief_complaint||'—'}
            </p>
          </div>
        </div>
        <div style={{display:'flex',gap:8,alignItems:'center'}}>
          {statusBadge(pt.status||'active')}
          {/* Show a "continuing" badge if this is a resumed consultation */}
          {recordId&&<Badge text="Continuing consultation" color="blue"/>}
          <Btn onClick={()=>nv('/doctor-patient-view',{state:{patientId}})} v="ghost" sz="sm"
            style={{color:'white',borderColor:'rgba(255,255,255,.2)'}}>Full Record</Btn>
        </div>
      </div>

      {/* Vitals */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:10,marginBottom:18}}>
        {[{l:'Blood Pressure',v:vit.blood_pressure||'—',u:'mmHg',bg:'#F0FDF4',tc:'#15803D'},
          {l:'Heart Rate',v:vit.pulse_rate||'—',u:'bpm',bg:'#EFF6FF',tc:'#1D4ED8'},
          {l:'Temperature',v:vit.temperature||'—',u:'°C',bg:'#FFFBEB',tc:'#B45309'},
          {l:'Weight',v:vit.weight||'—',u:'kg',bg:'#F5F3FF',tc:'#7C3AED'}].map((x,i)=>(
          <div key={i} style={{backgroundColor:x.bg,padding:'12px 16px',borderRadius:12,textAlign:'center'}}>
            <p style={{fontSize:10,color:x.tc,fontWeight:700,marginBottom:4,textTransform:'uppercase',opacity:.7}}>{x.l}</p>
            <h3 style={{fontSize:20,fontWeight:900,color:x.v==='—'?'#CBD5E1':x.tc}}>
              {x.v}<span style={{fontSize:10,marginLeft:3,opacity:.6}}>{x.u}</span>
            </h3>
          </div>
        ))}
      </div>

      {/* Notes + Diagnosis */}
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,marginBottom:16}}>
        <div style={{backgroundColor:'white',padding:'18px 20px',borderRadius:12,border:'1px solid #E2E8F0'}}>
          <h3 style={{fontSize:14,fontWeight:800,color:'#0F172A',marginBottom:10}}>Clinical Notes & Observations</h3>
          <textarea value={notes} onChange={e=>{setNotes(e.target.value);setSaved(false);}}
            placeholder="Type clinical findings, symptoms, examination results..."
            style={{...inp,height:150,resize:'none'}}/>
        </div>
        <div style={{backgroundColor:'white',padding:'18px 20px',borderRadius:12,border:'1px solid #E2E8F0'}}>
          <h3 style={{fontSize:14,fontWeight:800,color:'#0F172A',marginBottom:10}}>Primary Diagnosis</h3>
          <input value={diag} onChange={e=>{setDiag(e.target.value);setSaved(false);}}
            placeholder="e.g. Malaria, Hypertension stage 2, Typhoid fever..."
            style={{...inp,marginBottom:12}}/>
          <Btn onClick={saveRecord} disabled={saving} v="green" style={{width:'100%',justifyContent:'center'}}>
            {saving?'Saving...':(recordId?'💾 Update Record':'💾 Save Record')}
          </Btn>
          {saved&&(
            <p style={{marginTop:8,fontSize:12,color:'#16A34A',textAlign:'center',fontWeight:600}}>
              ✓ {recordId?'Record updated.':'Record saved.'} You can close and return to this patient later — your notes will be here.
            </p>
          )}
        </div>
      </div>

      {/* Lab results received */}
      {labs.length>0&&(
        <div style={{backgroundColor:'white',padding:'16px 20px',borderRadius:12,border:'1px solid #E2E8F0',marginBottom:16}}>
          <h3 style={{fontSize:14,fontWeight:800,color:'#0F172A',marginBottom:12}}>🔬 Lab Results Received</h3>
          <Table cols={[{key:'test',label:'Test',w:'25%'},{key:'res',label:'Result',w:'20%'},{key:'ref',label:'Reference',w:'20%'},{key:'date',label:'Date',w:'15%'},{key:'stat',label:'Status',w:'20%'}]}
            rows={labs.map(r=>({test:<span style={{fontWeight:600}}>{r.test_name||r.test_type}</span>,
              res:<span style={{fontWeight:700,color:r.result_status==='abnormal'?'#DC2626':'#15803D'}}>{r.result_value||'—'}</span>,
              ref:r.reference_range||'—',date:fmtDate(r.result_date||r.created_at),stat:statusBadge(r.result_status||'normal')}))}/>
        </div>
      )}

      {/* Prescriptions given */}
      {presc.length>0&&(
        <div style={{backgroundColor:'white',padding:'16px 20px',borderRadius:12,border:'1px solid #E2E8F0',marginBottom:16}}>
          <h3 style={{fontSize:14,fontWeight:800,color:'#0F172A',marginBottom:12}}>💊 Prescriptions Given</h3>
          <Table cols={[{key:'med',label:'Medication',w:'28%'},{key:'dose',label:'Dosage',w:'14%'},{key:'freq',label:'Frequency',w:'16%'},{key:'dur',label:'Duration',w:'14%'},{key:'stat',label:'Status',w:'28%'}]}
            rows={presc.map(p=>({med:<span style={{fontWeight:700}}>{p.medication_name}</span>,dose:p.dosage||'—',freq:p.frequency||'—',dur:p.duration||'—',stat:statusBadge(p.status||'pending')}))}/>
        </div>
      )}

      {/* Action buttons */}
      <div style={{display:'flex',gap:10,padding:'16px 0',borderTop:'2px solid #E2E8F0',alignItems:'center'}}>
        <Btn onClick={()=>setShowLab(true)} v="ghost">🔬 Request Lab Test</Btn>
        <Btn onClick={()=>setShowRx(true)} v="blue">💊 Prescribe Medication</Btn>
        <div style={{flex:1}}/>
        <Btn onClick={()=>nv(-1)} v="ghost">← Close & Return</Btn>
      </div>

      {/* LAB MODAL — FIX: show actual patient ID */}
      <Modal open={showLab} onClose={()=>{setShowLab(false);setLabChecks({});setLabNotes('');}} title="Request Laboratory Tests" width={580}>
        <MB>
          <div style={{padding:'10px 14px',backgroundColor:'#EFF6FF',borderRadius:8,border:'1px solid #BFDBFE',fontSize:13,color:'#1D4ED8',fontWeight:600}}>
            Patient: <strong>{pt.full_name||'—'}</strong> &nbsp;|&nbsp; ID: <strong>{pt.national_patient_id||pt.patient_id||'—'}</strong>
          </div>
          {Object.entries(labByCat).map(([cat,tests])=>(
            <div key={cat}>
              <p style={{fontSize:10,fontWeight:800,color:'#94A3B8',textTransform:'uppercase',letterSpacing:.8,marginBottom:8}}>{cat}</p>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
                {tests.map(t=>(
                  <label key={t.id} style={{display:'flex',alignItems:'center',gap:10,padding:'8px 12px',
                    borderRadius:8,border:`1px solid ${labChecks[t.id]?'#3B82F6':'#E2E8F0'}`,
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
          <Btn onClick={sendLab} disabled={sendingLab} v="blue">{sendingLab?'Sending...':'Send to Lab'}</Btn>
        </MF>
      </Modal>

      {/* RX MODAL */}
      <Modal open={showRx} onClose={()=>{setShowRx(false);setRx({med:'',dose:'',freq:'',dur:''});}} title="Prescribe Medication" width={480}>
        <MB>
          <div style={{padding:'10px 14px',backgroundColor:'#F0FDF4',borderRadius:8,border:'1px solid #BBF7D0',fontSize:13,color:'#16A34A',fontWeight:600}}>
            Patient: <strong>{pt.full_name||'—'}</strong> &nbsp;|&nbsp; Diagnosis: {diag||'Not yet recorded'}
          </div>
          <Field label="Medication Name" required>
            <input value={rx.med} onChange={e=>setRx({...rx,med:e.target.value})}
              placeholder="e.g. Artemether-Lumefantrine 20/120mg" style={inp}/>
          </Field>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
            <Field label="Dosage"><input value={rx.dose} onChange={e=>setRx({...rx,dose:e.target.value})} placeholder="e.g. 4 tablets" style={inp}/></Field>
            <Field label="Frequency"><input value={rx.freq} onChange={e=>setRx({...rx,freq:e.target.value})} placeholder="e.g. Twice daily" style={inp}/></Field>
          </div>
          <Field label="Duration"><input value={rx.dur} onChange={e=>setRx({...rx,dur:e.target.value})} placeholder="e.g. 3 days" style={inp}/></Field>
          <div style={{padding:'10px 14px',backgroundColor:'#FFFBEB',borderRadius:8,border:'1px solid #FDE68A',fontSize:13,color:'#B45309'}}>
            ⚠️ This will be sent directly to the pharmacy. Please verify before submitting.
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
  React.useEffect(()=>{
    fetch(`${BASE_URL}/api/lab-results`,{headers:ah()})
      .then(r=>r.json()).then(d=>setResults(Array.isArray(d)?d:[]))
      .catch(()=>{}).finally(()=>setLoading(false));
  },[]);
  const filtered=results.filter(r=>(r.patient_name||'').toLowerCase().includes(search.toLowerCase())||(r.test_type||r.test_name||'').toLowerCase().includes(search.toLowerCase()));
  return(
    <AL nav={doctorNav} title="Lab Results" searchText={search} setSearchText={setSearch}>
      {loading?<p style={{textAlign:'center',padding:40,color:'#94A3B8'}}>Loading...</p>:
        <Table cols={[{key:'pt',label:'Patient',w:'20%'},{key:'test',label:'Test',w:'22%'},{key:'res',label:'Result',w:'16%'},{key:'ref',label:'Reference',w:'16%'},{key:'date',label:'Date',w:'12%'},{key:'stat',label:'Status',w:'14%'}]}
          rows={filtered.map(r=>({
            pt:<span style={{fontWeight:700}}>{r.patient_name||'—'}</span>,
            test:<span style={{fontWeight:600}}>{r.test_type||r.test_name||'—'}</span>,
            res:<span style={{fontWeight:700,color:r.result_status==='abnormal'?'#DC2626':r.result_status==='critical'?'#991B1B':'#15803D'}}>{r.result_value||'—'}</span>,
            ref:<span style={{color:'#94A3B8',fontSize:13}}>{r.reference_range||'—'}</span>,
            date:<span style={{color:'#64748B'}}>{fmtDate(r.result_date||r.created_at)}</span>,
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
  {path:'/lab-dashboard',label:'Dashboard', icon:'🏠'},
  {path:'/lab-queue',    label:'Lab Queue', icon:'🔬'},
];

const LabDashboard=()=>{
  const nv=useNavigate();
  const [stats,setStats]=React.useState({pending:'—',completed:'—'});
  React.useEffect(()=>{
    fetch(`${BASE_URL}/api/lab-requests`,{headers:ah()})
      .then(r=>r.json()).then(d=>{
        const l=Array.isArray(d)?d:[];
        setStats({pending:String(l.filter(x=>(x.status||'').toLowerCase()==='pending').length),
          completed:String(l.filter(x=>(x.status||'').toLowerCase()==='completed').length)});
      }).catch(()=>{});
  },[]);
  return(
    <AL nav={labNav} title="Lab Technician Dashboard">
      <p style={{color:'#64748B',marginBottom:20}}>Welcome, {localStorage.getItem('display_name')}.</p>
      <div style={{display:'flex',gap:14,marginBottom:24,flexWrap:'wrap'}}>
        <SC label="Pending Requests" value={stats.pending}   icon="⏳" color="#B45309" bg="#FFFBEB" border="#FDE68A"/>
        <SC label="Completed Today"  value={stats.completed} icon="✅" color="#16A34A" bg="#F0FDF4" border="#BBF7D0"/>
      </div>
      <Btn onClick={()=>nv('/lab-queue')} v="primary">Go to Lab Queue →</Btn>
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

  const filtered=requests.filter(r=>(r.patient_name||'').toLowerCase().includes(search.toLowerCase())||(r.test_type||'').toLowerCase().includes(search.toLowerCase()));

  return(
    <AL nav={labNav} title="Laboratory Queue" searchText={search} setSearchText={setSearch}>
      <Toast {...toast}/>
      <div style={{display:'flex',gap:14,marginBottom:20,flexWrap:'wrap'}}>
        <SC label="Pending"   value={String(filtered.filter(r=>(r.status||'').toLowerCase()==='pending').length)}   icon="⏳" color="#B45309" bg="#FFFBEB" border="#FDE68A"/>
        <SC label="Completed" value={String(filtered.filter(r=>(r.status||'').toLowerCase()==='completed').length)} icon="✅" color="#16A34A" bg="#F0FDF4" border="#BBF7D0"/>
      </div>
      {loading?<p style={{textAlign:'center',padding:40,color:'#94A3B8'}}>Loading...</p>:
        <Table cols={[
          {key:'pt',    label:'Patient',          w:'20%'},
          {key:'test',  label:'Test Requested',   w:'30%'},
          {key:'notes', label:'Clinical Notes',   w:'25%'},
          {key:'stat',  label:'Status',           w:'12%'},
          {key:'act',   label:'Action',           w:'13%'},
        ]} rows={filtered.map(r=>({
          pt:   <span style={{fontWeight:700}}>{r.patient_name||'—'}</span>,
          test: <span style={{fontWeight:600,color:'#374151'}}>{r.test_type||'—'}</span>,
          notes:<span style={{color:'#64748B',fontSize:13}}>{r.clinical_indications||'—'}</span>,
          stat: statusBadge(r.status||'pending'),
          act:  (r.status||'').toLowerCase()==='pending'
            ?<Btn onClick={()=>{setSel(r);setForm({testName:r.test_type||'',resultValue:'',refRange:'',resultStatus:'normal',details:''});}} v="blue" sz="sm">Enter Results</Btn>
            :<Badge text="Done" color="green"/>
        }))} empty="No lab requests found."/>
      }
      <Modal open={!!sel} onClose={()=>{setSel(null);setForm({testName:'',resultValue:'',refRange:'',resultStatus:'normal',details:''}); }} title={`Enter Results — ${sel?.patient_name||''}`} width={500}>
        <MB>
          <div style={{padding:'10px 14px',backgroundColor:'#EFF6FF',borderRadius:8,border:'1px solid #BFDBFE',fontSize:13,color:'#1D4ED8',fontWeight:600}}>
            Test Requested: <strong>{sel?.test_type}</strong>
          </div>
          <Field label="Test Name" required><input value={form.testName} onChange={e=>setForm({...form,testName:e.target.value})} placeholder="e.g. Full Blood Count" style={inp}/></Field>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
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
            <select value={form.resultStatus} onChange={e=>setForm({...form,resultStatus:e.target.value})} style={inp}>
              <option value="normal">Normal</option>
              <option value="abnormal">Abnormal</option>
              <option value="critical">Critical</option>
            </select>
          </Field>
          <Field label="Additional Notes">
            <textarea value={form.details} onChange={e=>setForm({...form,details:e.target.value})}
              placeholder="Any additional observations..." style={{...inp,height:75,resize:'none'}}/>
          </Field>
        </MB>
        <MF>
          <Btn onClick={()=>setSel(null)} v="ghost">Cancel</Btn>
          <Btn onClick={submit} disabled={sub} v="green">{sub?'Submitting...':'Submit & Send to Doctor'}</Btn>
        </MF>
      </Modal>
    </AL>
  );
};

/* ══════════════════════════════════════
   PHARMACIST MODULE
══════════════════════════════════════ */
const pharmNav=[
  {path:'/pharm-dashboard',label:'Dashboard', icon:'🏠'},
  {path:'/pharm-inventory',label:'Inventory', icon:'💊'},
];

const PharmDashboard=()=>{
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

  const load=()=>{
    Promise.all([
      fetch(`${BASE_URL}/api/prescriptions`,{headers:ah()}).then(r=>r.json()),
      fetch(`${BASE_URL}/api/inventory`,{headers:ah()}).then(r=>r.json())
    ]).then(([p,inv])=>{setPrescriptions(Array.isArray(p)?p:[]);setInventory(Array.isArray(inv)?inv:[]); })
    .catch(()=>{}).finally(()=>setLoading(false));
  };
  React.useEffect(load,[]);

  const dispense=async()=>{
    if(!medicineId||!qty){toast.show('Please select medicine and enter quantity.','error');return;}
    setSub(true);
    try{
      const med=inventory.find(m=>String(m.medicine_id)===String(medicineId));
      const r=await fetch(`${BASE_URL}/api/dispensed`,{method:'POST',headers:ah(),
        body:JSON.stringify({prescription_id:sel.prescription_id,medicine_id:parseInt(medicineId),
          dispensed_by:user.user_id,batch_number:med?.batch_number||'',quantity_dispensed:parseInt(qty)})});
      if(r.ok){toast.show(`Dispensed to ${sel.patient_name}!`);setSel(null);setMedicineId('');setQty('');load();}
      else{const e=await r.json().catch(()=>({}));toast.show(e.message||'Failed.','error');}
    }catch{toast.show('Network error.','error');}finally{setSub(false);}
  };

  const filtered=prescriptions.filter(p=>(p.patient_name||'').toLowerCase().includes(search.toLowerCase())||(p.medication_name||'').toLowerCase().includes(search.toLowerCase()));

  return(
    <AL nav={pharmNav} title="Pharmacy Dashboard" searchText={search} setSearchText={setSearch}>
      <Toast {...toast}/>
      <p style={{color:'#64748B',marginBottom:18}}>Welcome, {localStorage.getItem('display_name')||'Pharmacist'}. Here are today's prescriptions.</p>
      <div style={{display:'flex',gap:14,marginBottom:22,flexWrap:'wrap'}}>
        <SC label="Total Prescriptions" value={loading?'—':String(prescriptions.length)} icon="📋"/>
        <SC label="Pending Dispensing"  value={loading?'—':String(prescriptions.filter(p=>(p.status||'').toLowerCase()!=='dispensed').length)} icon="⏳" color="#B45309" bg="#FFFBEB" border="#FDE68A"/>
        <SC label="Dispensed Today"     value={loading?'—':String(prescriptions.filter(p=>(p.status||'').toLowerCase()==='dispensed').length)} icon="✅" color="#16A34A" bg="#F0FDF4" border="#BBF7D0"/>
      </div>
      {loading?<p style={{textAlign:'center',padding:40,color:'#94A3B8'}}>Loading...</p>:
        <Table cols={[
          {key:'pt',   label:'Patient',    w:'18%'},
          {key:'med',  label:'Medication', w:'22%'},
          {key:'dose', label:'Dosage',     w:'12%'},
          {key:'freq', label:'Frequency',  w:'13%'},
          {key:'dur',  label:'Duration',   w:'10%'},
          {key:'stat', label:'Status',     w:'12%'},
          {key:'act',  label:'Action',     w:'13%'},
        ]} rows={filtered.map(p=>({
          pt:  <div><p style={{fontWeight:700,color:'#0F172A',margin:0,fontSize:14}}>{p.patient_name||'—'}</p></div>,
          med: <span style={{fontWeight:700}}>{p.medication_name||'—'}</span>,
          dose:<span style={{color:'#64748B'}}>{p.dosage||'—'}</span>,
          freq:<span style={{color:'#64748B'}}>{p.frequency||'—'}</span>,
          dur: <span style={{color:'#64748B'}}>{p.duration||'—'}</span>,
          stat:statusBadge(p.status||'pending'),
          act: (p.status||'').toLowerCase()==='dispensed'
            ?<Badge text="✓ Done" color="green"/>
            :<Btn onClick={()=>setSel(p)} v="blue" sz="sm">Dispense</Btn>
        }))} empty="No prescriptions."/>
      }
      <Modal open={!!sel} onClose={()=>{setSel(null);setMedicineId('');setQty(''); }} title="Dispense Prescription" width={500}>
        <MB>
          <div style={{padding:'12px 14px',backgroundColor:'#F0FDF4',borderRadius:8,border:'1px solid #BBF7D0'}}>
            <p style={{margin:0,fontSize:14,fontWeight:700,color:'#0F172A'}}>{sel?.patient_name}</p>
            <p style={{margin:0,fontSize:13,color:'#64748B'}}>Medication: <strong>{sel?.medication_name}</strong> &nbsp;·&nbsp; {sel?.dosage} &nbsp;·&nbsp; {sel?.frequency} &nbsp;·&nbsp; {sel?.duration}</p>
          </div>
          <Field label="Select Medicine from Inventory">
            <select value={medicineId} onChange={e=>setMedicineId(e.target.value)} style={{...inp,color:medicineId?'#0F172A':'#94A3B8'}}>
              <option value="">— Choose medicine —</option>
              {inventory.filter(m=>parseInt(m.quantity)>0).map(m=>(
                <option key={m.medicine_id} value={m.medicine_id}>
                  {m.medicine_name} | Batch: {m.batch_number} | Stock: {m.quantity} units
                </option>
              ))}
            </select>
          </Field>
          <Field label="Quantity to Dispense">
            <input type="number" min="1" value={qty} onChange={e=>setQty(e.target.value)} placeholder="e.g. 21" style={inp}/>
          </Field>
        </MB>
        <MF>
          <Btn onClick={()=>{setSel(null);setMedicineId('');setQty(''); }} v="ghost">Cancel</Btn>
          <Btn onClick={dispense} disabled={sub} v="green">{sub?'Dispensing...':'Confirm & Dispense'}</Btn>
        </MF>
      </Modal>
    </AL>
  );
};

const PharmInventory=()=>{
  const toast=useToast();
  const [inventory,setInventory]=React.useState([]);
  const [summary,setSummary]=React.useState({total_items:0,out_of_stock:0,expiring_soon:0});
  const [loading,setLoading]=React.useState(true);
  const [showAdd,setShowAdd]=React.useState(false);
  const [f,setF]=React.useState({medicine_name:'',category:'',batch_number:'',quantity:'',expiry_date:''});
  const [sub,setSub]=React.useState(false);
  const [search,setSearch]=React.useState('');

  const load=()=>{
    setLoading(true);
    Promise.all([
      fetch(`${BASE_URL}/api/inventory`,{headers:ah()}).then(r=>r.json()),
      fetch(`${BASE_URL}/api/inventory/summary`,{headers:ah()}).then(r=>r.json())
    ]).then(([inv,sum])=>{setInventory(Array.isArray(inv)?inv:[]);setSummary(sum||{});})
    .catch(()=>{}).finally(()=>setLoading(false));
  };
  React.useEffect(load,[]);

  const add=async()=>{
    if(!f.medicine_name||!f.batch_number||!f.quantity){toast.show('Please fill required fields.','error');return;}
    setSub(true);
    try{
      const r=await fetch(`${BASE_URL}/api/inventory`,{method:'POST',headers:ah(),
        body:JSON.stringify({medicine_name:f.medicine_name,category:f.category||'General',
          batch_number:f.batch_number,quantity:parseInt(f.quantity),expiry_date:f.expiry_date})});
      if(r.ok){toast.show('Batch added!');setShowAdd(false);setF({medicine_name:'',category:'',batch_number:'',quantity:'',expiry_date:''});load();}
      else toast.show('Failed.','error');
    }catch{toast.show('Network error.','error');}finally{setSub(false);}
  };

  const filtered=inventory.filter(i=>(i.medicine_name||'').toLowerCase().includes(search.toLowerCase())||(i.category||'').toLowerCase().includes(search.toLowerCase()));
  const stockBadge=(qty, expiryDate)=>{
  const now = new Date();
  const expiry = expiryDate ? new Date(expiryDate) : null;
  const thirtyDays = new Date(Date.now() + 30*24*60*60*1000);

  if(parseInt(qty)===0)
    return <span style={{padding:'3px 12px',borderRadius:20,backgroundColor:'#FEE2E2',color:'#DC2626',fontSize:12,fontWeight:700}}>Out of Stock</span>;
  if(expiry && expiry < now)
    return <span style={{padding:'3px 12px',borderRadius:20,backgroundColor:'#FEE2E2',color:'#DC2626',fontSize:12,fontWeight:700}}>Expired</span>;
  if(expiry && expiry < thirtyDays)
    return <span style={{padding:'3px 12px',borderRadius:20,backgroundColor:'#FFF7ED',color:'#EA580C',fontSize:12,fontWeight:700}}>Expiring Soon</span>;
  if(parseInt(qty)<=10)
    return <span style={{padding:'3px 12px',borderRadius:20,backgroundColor:'#FEF3C7',color:'#B45309',fontSize:12,fontWeight:700}}>Low Stock</span>;
  return <span style={{padding:'3px 12px',borderRadius:20,backgroundColor:'#DCFCE7',color:'#16A34A',fontSize:12,fontWeight:700}}>In Stock</span>;
};

  return(
    <AL nav={pharmNav} title="Medicine Inventory" searchText={search} setSearchText={setSearch}>
      <Toast {...toast}/>
      <div style={{display:'flex',justifyContent:'flex-end',marginBottom:18}}>
        <Btn onClick={()=>setShowAdd(true)} v="blue">+ Add New Batch</Btn>
      </div>
      <div style={{display:'flex',gap:14,marginBottom:22,flexWrap:'wrap'}}>
        <SC label="Total Items"    value={String(summary.total_items||0)}   icon="💊"/>
        <SC label="Out of Stock"   value={String(summary.out_of_stock||0)}  icon="❌" color="#DC2626" bg="#FEF2F2" border="#FECACA"/>
        <SC label="Expiring Soon"  value={String(summary.expiring_soon||0)} icon="⚠️" color="#B45309" bg="#FFFBEB" border="#FDE68A"/>
      </div>
      {loading?<p style={{textAlign:'center',padding:40,color:'#94A3B8'}}>Loading...</p>:
        <Table cols={[
          {key:'name', label:'Medicine Name', w:'26%'},
          {key:'cat',  label:'Category',      w:'16%'},
          {key:'batch',label:'Batch Number',  w:'16%'},
          {key:'qty',  label:'Stock',         w:'12%'},
          {key:'exp',  label:'Expiry Date',   w:'14%'},
          {key:'stat', label:'Status',        w:'16%'},
        ]} rows={filtered.map(m=>({
          name: <span style={{fontWeight:700,color:'#0F172A'}}>{m.medicine_name}</span>,
          cat:  <span style={{color:'#64748B'}}>{m.category||'General'}</span>,
          batch:<span style={{color:'#64748B',fontFamily:'monospace',fontSize:13}}>{m.batch_number}</span>,
          qty:  <span style={{fontWeight:700,color:parseInt(m.quantity)<=10?'#DC2626':'#15803D'}}>{m.quantity} units</span>,
          exp:  <span style={{color:'#64748B'}}>{fmtDate(m.expiry_date)}</span>,
          stat: stockBadge(m.quantity, m.expiry_date)
        }))} empty="No inventory items."/>
      }
      <Modal open={showAdd} onClose={()=>setShowAdd(false)} title="Add New Medication Batch" width={480}>
        <MB>
          <Field label="Medicine Name" required><input value={f.medicine_name} onChange={e=>setF({...f,medicine_name:e.target.value})} placeholder="e.g. Artemether-Lumefantrine 20/120mg" style={inp}/></Field>
          <Field label="Category"><input value={f.category} onChange={e=>setF({...f,category:e.target.value})} placeholder="e.g. Antimalarial, Antibiotic..." style={inp}/></Field>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
            <Field label="Batch Number" required><input value={f.batch_number} onChange={e=>setF({...f,batch_number:e.target.value})} placeholder="e.g. GH-2026-001" style={inp}/></Field>
            <Field label="Quantity" required><input type="number" min="1" value={f.quantity} onChange={e=>setF({...f,quantity:e.target.value})} placeholder="e.g. 100" style={inp}/></Field>
          </div>
          <Field label="Expiry Date"><input type="date" value={f.expiry_date} onChange={e=>setF({...f,expiry_date:e.target.value})} style={inp}/></Field>
        </MB>
        <MF>
          <Btn onClick={()=>setShowAdd(false)} v="ghost">Cancel</Btn>
          <Btn onClick={add} disabled={sub} v="blue">{sub?'Adding...':'Add Batch'}</Btn>
        </MF>
      </Modal>
    </AL>
  );
};

/* ══════════════════════════════════════
   ADMIN MODULE
══════════════════════════════════════ */
const adminNav=[
  {path:'/admin-dashboard',label:'Dashboard',       icon:'🏠'},
  {path:'/admin-users',    label:'User Management', icon:'👥'},
  {path:'/admin-logs',     label:'Audit Logs',      icon:'📋'},
];

const AdminDashboard=()=>{
  const nv=useNavigate();
  const [stats,setStats]=React.useState({staff:'—',patients:'—',waiting:'—'});
  React.useEffect(()=>{
    Promise.all([
      fetch(`${BASE_URL}/api/users`,{headers:ah()}).then(r=>r.json()),
      fetch(`${BASE_URL}/api/patients`,{headers:ah()}).then(r=>r.json())
    ]).then(([u,p])=>{
      const ul=Array.isArray(u)?u:[];const pl=Array.isArray(p)?p:[];
      setStats({staff:String(ul.length),patients:String(pl.length),
        waiting:String(pl.filter(x=>(x.status||'').toLowerCase()==='waiting').length)});
    }).catch(()=>{});
  },[]);
  return(
    <AL nav={adminNav} title="Admin Dashboard">
      <p style={{color:'#64748B',marginBottom:20}}>Welcome, {localStorage.getItem('display_name')}.</p>
      <div style={{display:'flex',gap:14,marginBottom:24,flexWrap:'wrap'}}>
        <SC label="Total Staff"     value={stats.staff}    icon="👤"/>
        <SC label="Total Patients"  value={stats.patients} icon="👥" color="#3B82F6" bg="#EFF6FF" border="#BFDBFE"/>
        <SC label="Patients Waiting"value={stats.waiting}  icon="⏳" color="#B45309" bg="#FFFBEB" border="#FDE68A"/>
      </div>
      <div style={{display:'flex',gap:10}}>
        <Btn onClick={()=>nv('/admin-users')} v="primary">User Management →</Btn>
        <Btn onClick={()=>nv('/admin-logs')}  v="ghost">Audit Logs →</Btn>
      </div>
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

  const del=async(id,name)=>{
    const r=await fetch(`${BASE_URL}/api/users/${id}`,{method:'DELETE',headers:ah()});
    if(r.ok){setStaff(prev=>prev.filter(s=>s.user_id!==id));toast.show(`${name} removed.`);}
    else toast.show('Failed.','error');
  };

  const filtered=staff.filter(s=>(s.full_name||'').toLowerCase().includes(search.toLowerCase())||(s.role||'').toLowerCase().includes(search.toLowerCase()));

  return(
    <AL nav={adminNav} title="User Management" searchText={search} setSearchText={setSearch}>
      <Toast {...toast}/>
      <div style={{display:'flex',justifyContent:'flex-end',marginBottom:18}}>
        <Btn onClick={()=>setShowAdd(true)} v="blue">+ Add Staff Member</Btn>
      </div>
      {loading?<p style={{textAlign:'center',padding:40,color:'#94A3B8'}}>Loading...</p>:
        <Table cols={[
          {key:'name', label:'Name',     w:'22%'},
          {key:'sid',  label:'Staff ID', w:'13%'},
          {key:'role', label:'Role',     w:'14%'},
          {key:'email',label:'Email',    w:'22%'},
          {key:'stat', label:'Status',   w:'12%'},
          {key:'act',  label:'Actions',  w:'17%'},
        ]} rows={filtered.map(s=>({
          name: <span style={{fontWeight:700}}>{s.full_name}</span>,
          sid:  <span style={{color:'#64748B',fontFamily:'monospace',fontSize:12}}>{s.staff_id||'—'}</span>,
          role: <Badge text={s.role||'—'} color="blue"/>,
          email:<span style={{color:'#64748B',fontSize:13}}>{s.email||'—'}</span>,
          stat: statusBadge(s.staff_status||'active'),
          act:  <button onClick={()=>del(s.user_id,s.full_name)}
                  style={{background:'none',border:'none',color:'#EF4444',cursor:'pointer',fontWeight:700,fontSize:13}}>
                  Delete
                </button>
        }))} empty="No staff found."/>
      }
      <Modal open={showAdd} onClose={()=>setShowAdd(false)} title="Add New Staff Member" width={460}>
        <MB>
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
        </MB>
        <MF>
          <Btn onClick={()=>setShowAdd(false)} v="ghost">Cancel</Btn>
          <Btn onClick={addStaff} disabled={sub} v="blue">{sub?'Adding...':'Add Staff'}</Btn>
        </MF>
      </Modal>
    </AL>
  );
};

const AdminLogs=()=>{
  const [logs,setLogs]=React.useState([]);
  const [loading,setLoading]=React.useState(true);
  const [search,setSearch]=React.useState('');
  React.useEffect(()=>{
    fetch(`${BASE_URL}/api/activity-logs`,{headers:ah()})
      .then(r=>r.json()).then(d=>setLogs(Array.isArray(d)?d:[]))
      .catch(()=>{}).finally(()=>setLoading(false));
  },[]);
  const filtered=logs.filter(l=>(l.staff_name||'').toLowerCase().includes(search.toLowerCase())||(l.action||'').toLowerCase().includes(search.toLowerCase()));
  return(
    <AL nav={adminNav} title="Audit Logs" searchText={search} setSearchText={setSearch}>
      {loading?<p style={{textAlign:'center',padding:40,color:'#94A3B8'}}>Loading...</p>:
        <Table cols={[
          {key:'ts',   label:'Timestamp',     w:'20%'},
          {key:'staff',label:'Staff',         w:'20%'},
          {key:'role', label:'Role',          w:'12%'},
          {key:'act',  label:'Action',        w:'22%'},
          {key:'pt',   label:'Patient',       w:'20%'},
          {key:'stat', label:'Status',        w:'6%'},
        ]} rows={filtered.map(l=>({
          ts:   <span style={{color:'#64748B',fontSize:12}}>{fmtDT(l.created_at)}</span>,
          staff:<span style={{fontWeight:700}}>{l.staff_name||'—'}</span>,
          role: <Badge text={l.role_name||'—'} color="blue"/>,
          act:  <Badge text={l.action||'—'}/>,
          pt:   <span style={{color:'#64748B'}}>{l.patient_name||'—'}</span>,
          stat: <span style={{color:'#16A34A',fontWeight:700,fontSize:13}}>✓</span>
        }))} empty="No logs."/>
      }
    </AL>
  );
};

/* ══════════════════════════════════════
   PATIENT PORTAL
══════════════════════════════════════ */
const patientNav=[
  {path:'/patient-dashboard',label:'My Dashboard',icon:'🏠'},
  {path:'/patient-history',  label:'My History',  icon:'📋'},
];

const PatientDashboard=()=>{
  const toast=useToast();
  const user=JSON.parse(localStorage.getItem('user')||'{}');
  const [data,setData]=React.useState(null);
  const [loading,setLoading]=React.useState(true);
  const [showBook,setShowBook]=React.useState(false);
  const [showSuccess,setShowSuccess]=React.useState(false);
  const [booking,setBooking]=React.useState({specialty:'General Consultation',appointment_date:'',symptoms_reason:''});
  const [sub,setSub]=React.useState(false);

  React.useEffect(()=>{
    fetch(`${BASE_URL}/api/patients/me`,{headers:ah()})
      .then(r=>r.json()).then(d=>setData(d)).catch(()=>{}).finally(()=>setLoading(false));
  },[]);

  const book=async()=>{
    if(!booking.appointment_date){toast.show('Please select a date.','error');return;}
    setSub(true);
    try{
      const r=await fetch(`${BASE_URL}/api/appointments`,{method:'POST',headers:ah(),
        body:JSON.stringify({patient_id:data?.profile?.patient_id,
          appointment_date:booking.appointment_date,
          symptoms_reason:booking.symptoms_reason||booking.specialty,status:'scheduled'})});
      if(r.ok){setShowBook(false);setShowSuccess(true);setBooking({specialty:'General Consultation',appointment_date:'',symptoms_reason:''});}
      else toast.show('Failed.','error');
    }catch{toast.show('Network error.','error');}finally{setSub(false);}
  };

  if(loading)return<AL nav={patientNav} title="My Dashboard"><p style={{textAlign:'center',padding:60,color:'#94A3B8'}}>Loading your health data...</p></AL>;

  const profile=data?.profile||{};
  const appts=data?.appointments||[];
  const presc=data?.prescriptions||[];
  const labs=data?.lab_results||[];
  const patientName=profile.full_name||user.full_name||'Patient';

  return(
    <AL nav={patientNav} title={`Welcome, ${patientName}`}>
      <Toast {...toast}/>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}>
        <p style={{color:'#64748B'}}>Your personal health summary. Book appointments and view your records here.</p>
        <Btn onClick={()=>setShowBook(true)} v="blue">+ Book Appointment</Btn>
      </div>
      <div style={{display:'flex',gap:14,marginBottom:24,flexWrap:'wrap'}}>
        <SC label="Upcoming Appointments"  value={String(appts.filter(a=>(a.status||'').toLowerCase()==='scheduled').length)} icon="📅" color="#3B82F6" bg="#EFF6FF" border="#BFDBFE"/>
        <SC label="Active Prescriptions"   value={String(presc.filter(p=>(p.status||'').toLowerCase()!=='dispensed').length)} icon="💊" color="#7C3AED" bg="#F5F3FF" border="#DDD6FE"/>
        <SC label="Lab Results Available"  value={String(labs.length)} icon="🔬" color="#16A34A" bg="#F0FDF4" border="#BBF7D0"/>
      </div>
      {appts.length>0&&<>
        <h3 style={{fontSize:15,fontWeight:700,color:'#374151',marginBottom:10}}>Appointments</h3>
        <div style={{marginBottom:20}}>
          <Table cols={[{key:'date',label:'Date',w:'18%'},{key:'reason',label:'Reason',w:'40%'},{key:'stat',label:'Status',w:'42%'}]}
            rows={appts.slice(0,5).map(a=>({date:fmtDate(a.appointment_date),reason:a.symptoms_reason||a.reason||'—',stat:statusBadge(a.status||'scheduled')}))}/>
        </div>
      </>}
      {presc.length>0&&<>
        <h3 style={{fontSize:15,fontWeight:700,color:'#374151',marginBottom:10}}>Active Prescriptions</h3>
        <Table cols={[{key:'med',label:'Medication',w:'28%'},{key:'dose',label:'Dosage',w:'16%'},{key:'freq',label:'Frequency',w:'18%'},{key:'dur',label:'Duration',w:'16%'},{key:'stat',label:'Status',w:'22%'}]}
          rows={presc.map(p=>({med:<span style={{fontWeight:700}}>{p.medication_name}</span>,dose:p.dosage||'—',freq:p.frequency||'—',dur:p.duration||'—',stat:statusBadge(p.status||'pending')}))}/>
      </>}
      <Modal open={showBook} onClose={()=>setShowBook(false)} title="Book Appointment" width={480}>
        <MB>
          <Field label="Select Specialty">
            <select value={booking.specialty} onChange={e=>setBooking({...booking,specialty:e.target.value})} style={inp}>
              <option>General Consultation</option>
              <option>Follow-up Visit</option>
              <option>Lab Review</option>
              <option>Specialist Referral</option>
              <option>Dental</option>
              <option>Antenatal</option>
            </select>
          </Field>
          <Field label="Preferred Date">
            <input type="date" value={booking.appointment_date} onChange={e=>setBooking({...booking,appointment_date:e.target.value})} style={inp}/>
          </Field>
          <Field label="Symptoms / Reason for Visit">
            <textarea value={booking.symptoms_reason} onChange={e=>setBooking({...booking,symptoms_reason:e.target.value})}
              placeholder="Briefly describe your symptoms or reason..." style={{...inp,height:90,resize:'none'}}/>
          </Field>
        </MB>
        <MF>
          <Btn onClick={()=>setShowBook(false)} v="ghost">Cancel</Btn>
          <Btn onClick={book} disabled={sub} v="blue">{sub?'Booking...':'Confirm Booking'}</Btn>
        </MF>
      </Modal>
      {showSuccess&&(
        <div style={{position:'fixed',inset:0,backgroundColor:'rgba(0,0,0,.5)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:500}}>
          <div style={{backgroundColor:'white',borderRadius:16,padding:'40px',maxWidth:400,width:'90%',textAlign:'center'}}>
            <div style={{fontSize:52,marginBottom:14}}>🎉</div>
            <h3 style={{fontSize:20,fontWeight:800,color:'#0F172A',marginBottom:10}}>Appointment Booked!</h3>
            <p style={{color:'#64748B',fontSize:14,lineHeight:1.7,marginBottom:22}}>
              Your appointment has been scheduled. Please arrive on time and let the nurse know you have an online appointment.
            </p>
            <Btn onClick={()=>setShowSuccess(false)} v="blue" style={{justifyContent:'center',width:'100%'}}>Back to Dashboard</Btn>
          </div>
        </div>
      )}
    </AL>
  );
};

const PatientHistory=()=>{
  const [data,setData]=React.useState(null);
  const [loading,setLoading]=React.useState(true);
  const [tab,setTab]=React.useState('Medical Records');
  React.useEffect(()=>{
    fetch(`${BASE_URL}/api/patients/me`,{headers:ah()})
      .then(r=>r.json()).then(d=>setData(d)).catch(()=>{}).finally(()=>setLoading(false));
  },[]);
  const recs=data?.medical_records||[];const labs=data?.lab_results||[];const presc=data?.prescriptions||[];
  return(
    <AL nav={patientNav} title="My Medical History">
      {loading?<p style={{textAlign:'center',padding:60,color:'#94A3B8'}}>Loading...</p>:<>
        <div style={{display:'flex',gap:4,marginBottom:16,borderBottom:'2px solid #E2E8F0'}}>
          {['Medical Records','Lab Results','Prescriptions'].map(t=>(
            <button key={t} onClick={()=>setTab(t)} style={{padding:'8px 16px',border:'none',background:'none',cursor:'pointer',
              fontWeight:700,fontSize:13,color:tab===t?'#3B82F6':'#64748B',
              borderBottom:tab===t?'2px solid #3B82F6':'2px solid transparent',marginBottom:-2}}>
              {t}
            </button>
          ))}
        </div>
        {tab==='Medical Records'&&<Table cols={[{key:'date',label:'Date',w:'13%'},{key:'diag',label:'Diagnosis',w:'22%'},{key:'notes',label:'Clinical Notes',w:'37%'},{key:'vitals',label:'Vitals',w:'28%'}]}
          rows={recs.map(r=>({date:fmtDate(r.created_at),diag:<span style={{fontWeight:700}}>{r.diagnosis||'—'}</span>,notes:r.clinical_notes||r.notes||'—',vitals:<span style={{fontSize:12,color:'#64748B'}}>BP: {r.blood_pressure||'—'} | HR: {r.pulse_rate||'—'}</span>}))}
          empty="No medical records yet."/>}
        {tab==='Lab Results'&&<Table cols={[{key:'test',label:'Test',w:'22%'},{key:'res',label:'Result',w:'18%'},{key:'ref',label:'Reference',w:'18%'},{key:'date',label:'Date',w:'14%'},{key:'stat',label:'Status',w:'28%'}]}
          rows={labs.map(r=>({test:<span style={{fontWeight:600}}>{r.test_type||r.test_name||'—'}</span>,res:r.result_value||'—',ref:r.reference_range||'—',date:fmtDate(r.result_date||r.created_at),stat:statusBadge(r.result_status||'normal')}))}
          empty="No lab results yet."/>}
        {tab==='Prescriptions'&&<Table cols={[{key:'med',label:'Medication',w:'24%'},{key:'dose',label:'Dosage',w:'13%'},{key:'freq',label:'Frequency',w:'15%'},{key:'dur',label:'Duration',w:'13%'},{key:'date',label:'Date',w:'13%'},{key:'stat',label:'Status',w:'22%'}]}
          rows={presc.map(p=>({med:<span style={{fontWeight:700}}>{p.medication_name}</span>,dose:p.dosage||'—',freq:p.frequency||'—',dur:p.duration||'—',date:fmtDate(p.issued_at),stat:statusBadge(p.status||'pending')}))}
          empty="No prescriptions yet."/>}
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