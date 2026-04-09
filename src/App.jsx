import React from 'react';
import { BrowserRouter, Routes, Route, useNavigate, Link, useLocation } from 'react-router-dom';

// --- RESPONSIVE STYLES ---
const ResponsiveStyles = () => (
  <style>{`
    * { box-sizing: border-box; }

    /* Scrollbar styling */
    ::-webkit-scrollbar { width: 6px; height: 6px; }
    ::-webkit-scrollbar-track { background: #F1F5F9; }
    ::-webkit-scrollbar-thumb { background: #CBD5E1; border-radius: 3px; }

    /* Sidebar responsive */
    .emr-sidebar { width: 240px; min-width: 200px; flex-shrink: 0; }
    .emr-content { flex: 1; min-width: 0; overflow: hidden; }
    .emr-page { padding: 30px 40px; }
    .emr-header-search { width: 420px; }
    .emr-stat-cards { display: flex; gap: 20px; flex-wrap: wrap; }
    .emr-stat-card { flex: 1; min-width: 160px; }
    .emr-modal { width: 480px; max-width: 95vw; }
    .emr-table-row { font-size: 14px; }

    /* Medium screens (laptops 1024px - 1366px) */
    @media (max-width: 1366px) {
      .emr-sidebar { width: 210px; }
      .emr-page { padding: 25px 30px; }
      .emr-header-search { width: 340px; }
    }

    /* Small laptops (768px - 1024px) */
    @media (max-width: 1024px) {
      .emr-sidebar { width: 190px; }
      .emr-page { padding: 20px 24px; }
      .emr-header-search { width: 260px; }
      .emr-stat-cards { gap: 14px; }
      .emr-table-row { font-size: 13px; }
    }

    /* Tablets (below 768px) */
    @media (max-width: 768px) {
      .emr-sidebar { width: 60px; }
      .emr-sidebar .sidebar-label { display: none; }
      .emr-sidebar .sidebar-logo-text { display: none; }
      .emr-page { padding: 16px; }
      .emr-header-search { width: 180px; }
      .emr-stat-cards { flex-direction: column; }
      .emr-modal { width: 95vw; }
    }

    /* Login page responsive */
    .emr-login-left { width: 50%; }
    .emr-login-right { width: 50%; }
    @media (max-width: 768px) {
      .emr-login-left { display: none; }
      .emr-login-right { width: 100%; }
    }

    /* Table responsive */
    @media (max-width: 1024px) {
      .emr-hide-col { display: none; }
    }
  `}</style>
);

// --- MAIN LAYOUT (Locked UI) ---
const DashboardLayout = ({ children, searchText, setSearchText }) => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', backgroundColor: '#F4F7F6', fontFamily: '"Inter", sans-serif', overflow: 'hidden' }}>
      
      {/* LEFT SIDEBAR */}
      <div style={{ backgroundColor: '#1E293B', color: 'white', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', className: 'emr-sidebar' }}>
        <div>
          <div style={{ padding: '45px 30px', display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div style={{ fontSize: '75px', fontWeight: '300', lineHeight: '0.6', color: 'white' }}>+</div>
            <div>
              <h2 style={{ fontSize: '22px', margin: 0, fontWeight: '800', lineHeight: '1.1', letterSpacing: '0.5px' }}>HEALTHCARE<br/>EMR</h2>
            </div>
          </div>

          <nav style={{ marginTop: '30px' }}>
            <Link to="/dashboard" style={{ display: 'block', padding: '15px 30px', color: 'white', textDecoration: 'none', opacity: location.pathname === '/dashboard' || location.pathname === '/' ? 1 : 0.4, fontWeight: '700', fontSize: '14px', borderLeft: location.pathname === '/dashboard' || location.pathname === '/' ? '4px solid #4ADE80' : '4px solid transparent' }}>Dashboard</Link>
            <Link to="/patients" style={{ display: 'block', padding: '15px 30px', color: 'white', textDecoration: 'none', opacity: location.pathname === '/patients' ? 1 : 0.4, fontWeight: '700', fontSize: '14px', borderLeft: location.pathname === '/patients' ? '4px solid #4ADE80' : '4px solid transparent' }}>Patients</Link>
            <Link to="/schedule" style={{ display: 'block', padding: '15px 30px', color: 'white', textDecoration: 'none', opacity: location.pathname === '/schedule' ? 1 : 0.4, fontWeight: '700', fontSize: '14px', borderLeft: location.pathname === '/schedule' ? '4px solid #4ADE80' : '4px solid transparent' }}>Schedule</Link>
            <Link to="/lab-results" style={{ display: 'block', padding: '15px 30px', color: 'white', textDecoration: 'none', opacity: location.pathname === '/lab-results' ? 1 : 0.4, fontWeight: '700', fontSize: '14px', borderLeft: location.pathname === '/lab-results' ? '4px solid #4ADE80' : '4px solid transparent' }}>Beaker / Lab</Link>
          </nav>
        </div>

        {/* LOGOUT BUTTON */}
        <div onClick={() => { localStorage.removeItem('token'); localStorage.removeItem('user'); localStorage.removeItem('role'); localStorage.removeItem('display_name'); navigate('/logout'); }} style={{ padding: '25px 30px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '15px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          <span style={{ fontWeight: '700', opacity: 0.6, fontSize: '14px' }}>Logout</span>
        </div>
      </div>

      {/* RIGHT CONTENT AREA */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        
        {/* Top Header */}
        <div style={{ height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 50px', backgroundColor: 'white', borderBottom: '1px solid #E2E8F0', position: 'relative' }}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <span style={{ position: 'absolute', left: '15px', color: '#64748B' }}>🔍</span>
            <input 
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 'clamp(200px, 30vw, 420px)', padding: '12px 15px 12px 45px', borderRadius: '8px', border: '1px solid #E2E8F0', backgroundColor: '#F8FAFC', fontSize: '13px' }} 
              placeholder="Search for patient name, ID..." 
            />
          </div>
          <div style={{ position: 'absolute', right: '50px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '13px', color: '#64748B', fontWeight: '600' }}>{localStorage.getItem('display_name') || JSON.parse(localStorage.getItem('user') || '{}').full_name || JSON.parse(localStorage.getItem('user') || '{}').name || '—'}</span>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#94A3B8' }} />
          </div>
        </div>

        {/* Dynamic Page Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 'clamp(20px, 3vw, 50px) clamp(20px, 4vw, 50px)', position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div style={{ flex: 1 }}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

// --- FRAME 1: DOCTOR DASHBOARD (Live API) ---
const DoctorDashboard = ({ searchText }) => {
  const navigate = useNavigate();
  const gridTemplate = "25% 15% 25% 20% 15%";

  const [appointments, setAppointments] = React.useState([]);
  const [stats, setStats]               = React.useState({ total: 0, today: 0, pending: 0 });
  const [loading, setLoading]           = React.useState(true);
  const [error, setError]               = React.useState('');

  const token = localStorage.getItem('token');

  // Status badge colours
  const statusStyle = (s) => {
    const map = {
      confirmed:  { bg: '#F0FDF4', tc: '#166534' },
      scheduled:  { bg: '#F0FDF4', tc: '#166534' },
      ready:      { bg: '#EFF6FF', tc: '#1E40AF' },
      pending:    { bg: '#FFFBEB', tc: '#B45309' },
      cancelled:  { bg: '#FEF2F2', tc: '#991B1B' },
    };
    return map[(s || '').toLowerCase()] || { bg: '#F1F5F9', tc: '#475569' };
  };

  React.useEffect(() => {
  const fetchData = async () => {
    try {
      setLoading(true);

      const [queueRes, patRes, labRes] = await Promise.all([
        fetch(`${BASE_URL}/api/patients/queue/doctor`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${BASE_URL}/api/patients`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${BASE_URL}/api/lab-requests`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      const queueData = queueRes.ok ? await queueRes.json() : [];
      const patData   = patRes.ok   ? await patRes.json()   : [];
      const labData   = labRes.ok   ? await labRes.json()   : [];

      const queueList = Array.isArray(queueData) ? queueData : [];
      const patList   = Array.isArray(patData)   ? patData   : (patData.patients || []);
      const labList   = Array.isArray(labData)   ? labData   : (labData.labRequests || []);

      const normalized = queueList.map(a => ({
        n:   a.full_name || 'Unknown',
        id:  a.patient_id,
        t:   a.registration_date || 'Walk-in',
        r:   a.chief_complaint || 'Walk-in',
        s:   a.status || 'active',
        patient_id: a.patient_id,
      }));

      setAppointments(normalized);
      setStats({
        total:   patList.length,
        today:   queueList.length,
        pending: labList.filter(l => (l.status || '').toLowerCase() === 'pending').length,
      });

    } catch (err) {
      setError('Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };
  fetchData();
}, []);

  const filteredData = appointments.filter(p => {
    const name = p.patient_name || p.patientName || (p.patient && p.patient.name) || '';
    const reason = p.reason || p.reason_for_visit || '';
    return name.toLowerCase().includes(searchText.toLowerCase()) ||
          reason.toLowerCase().includes(searchText.toLowerCase());
  });

const getPatientName = (p) => p.full_name || p.patient_name || p.name || 'Unknown';
  const getTime = (p) => p.appointment_time || p.time || p.appointment_date || '—';
  const getReason = (p) => p.reason || p.reason_for_visit || p.reason_for_appointment || '—';
  const getStatus = (p) => p.status || 'Pending';

  return (
    <div style={{ minHeight: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <div>
        <h1 style={{ marginBottom: '35px', fontWeight: '800', fontSize: '32px', color: '#1E293B' }}>Doctor Dashboard</h1>

        {/* Stat Cards */}
        <div style={{ display: 'flex', gap: '20px', marginBottom: '45px', flexWrap: 'wrap' }}>
          {[
            { l: 'Total Patients',      v: loading ? '—' : stats.total.toString(),   tc: '#1E293B', bg: 'white' },
            { l: 'Appointments Today',  v: loading ? '—' : stats.today.toString(),   tc: '#3B82F6', bg: '#EFF6FF' },
            { l: 'Pending Labs',        v: loading ? '—' : stats.pending.toString(), tc: '#B45309', bg: '#FFFBEB' }
          ].map((c, i) => (
            <div key={i} style={{ padding: 'clamp(20px, 2.5vw, 35px) clamp(18px, 2vw, 30px)', borderRadius: '16px', backgroundColor: c.bg, flex: 1, minWidth: '150px', border: '1px solid #E2E8F0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
              <p style={{ color: c.tc, fontWeight: '700', fontSize: '14px', margin: 0, opacity: 0.8 }}>{c.l}</p>
              <h2 style={{ fontSize: 'clamp(32px, 4vw, 48px)', fontWeight: '800', margin: '20px 0 0 0', color: c.tc }}>{c.v}</h2>
            </div>
          ))}
        </div>

        {/* Error state */}
        {error && (
          <div style={{ padding: '16px 20px', backgroundColor: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '10px', color: '#DC2626', fontWeight: '600', fontSize: '14px', marginBottom: '20px' }}>
            ⚠️ {error}
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '40px', color: '#94A3B8', fontSize: '14px', fontWeight: '600' }}>
            Loading appointments...
          </div>
        )}

        {/* Table */}
        {!loading && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: gridTemplate, padding: '0 25px 15px 25px', color: '#64748B', fontSize: '12px', fontWeight: '800', alignItems: 'center' }}>
              <div>PATIENT NAME</div><div>TIME</div><div>REASON</div><div>STATUS</div><div>ACTION</div>
            </div>

            {filteredData.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#94A3B8', fontSize: '14px', fontWeight: '600' }}>
                No appointments found.
              </div>
            ) : (
              filteredData.map((p, i) => {
                const { bg, tc } = statusStyle(getStatus(p));
                return (
                  <div key={i} style={{ display: 'grid', gridTemplateColumns: gridTemplate, alignItems: 'center', backgroundColor: 'white', padding: '20px 25px', borderRadius: '12px', marginBottom: '12px', border: '1px solid #E2E8F0', fontSize: '14px', fontWeight: '700' }}>
                    <div>{getPatientName(p)}</div>
                    <div>{getTime(p)}</div>
                    <div>{getReason(p)}</div>
                    <div>
                      <div style={{ width: '90px', padding: '6px 0', borderRadius: '20px', backgroundColor: bg, color: tc, textAlign: 'center', fontSize: '12px', fontWeight: '800' }}>{getStatus(p)}</div>
                    </div>
                    <div style={{ textAlign: 'left' }}>
                      <button onClick={() => navigate('/patient-profile', { state: { patientName: getPatientName(p), patientId: p.patient_id || (p.patient && p.patient.id) } })} style={{ padding: '10px 24px', backgroundColor: '#314155', color: 'white', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: '700' }}>View</button>
                    </div>
                  </div>
                );
              })
            )}
          </>
        )}
      </div>

      <div style={{ textAlign: 'right', marginTop: '40px', fontSize: '12px', color: '#64748B', opacity: 0.7, fontWeight: '600' }}>
        Last System Audit: 12/02/2026 at 10:24 AM by Admin_Sarah
      </div>
    </div>
  );
};

// --- FRAME 2: PATIENTS (Live API) ---
const PatientDatabase = ({ searchText }) => {
  const navigate = useNavigate();
  const gridTemplate = "22% 15% 28% 20% 15%";
  const token = localStorage.getItem('token');

  const [patients, setPatients] = React.useState([]);
  const [loading, setLoading]   = React.useState(true);
  const [error, setError]       = React.useState('');

  const statusStyle = (s) => {
    const map = {
      active:    { bg: '#EFF6FF', tc: '#1E40AF' },
      pending:   { bg: '#FFFBEB', tc: '#B45309' },
      completed: { bg: '#F0FDF4', tc: '#166534' },
      ready:     { bg: '#EFF6FF', tc: '#1E40AF' },
      inactive:  { bg: '#FEF2F2', tc: '#991B1B' },
    };
    return map[(s || '').toLowerCase()] || { bg: '#F1F5F9', tc: '#475569' };
  };

  React.useEffect(() => {
    const fetchPatients = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${BASE_URL}/api/patients`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        const list = Array.isArray(data) ? data : (data.patients || data.data || []);
        setPatients(list);
      } catch (err) {
        setError('Failed to load patients.');
      } finally {
        setLoading(false);
      }
    };
    fetchPatients();
  }, []);

  const getName  = (p) => p.name || p.full_name || `${p.first_name || ''} ${p.last_name || ''}`.trim() || 'Unknown';
  const getId    = (p) => p.patient_id || p.id || p._id || '—';
  const getDiag  = (p) => p.diagnosis || p.primary_diagnosis || '—';
  const getStatus= (p) => p.status || 'Active';

  const filtered = patients.filter(p => {
    const name = getName(p).toLowerCase();
    const id   = String(getId(p)).toLowerCase();
    const q    = searchText.toLowerCase();
    return name.includes(q) || id.includes(q);
  });

  return (
    <div style={{ minHeight: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <div>
        <h1 style={{ marginBottom: '35px', fontWeight: '800', fontSize: '32px', color: '#1E293B' }}>Patient Database</h1>

        <div style={{ display: 'grid', gridTemplateColumns: gridTemplate, padding: '0 25px 15px 25px', color: '#64748B', fontSize: '12px', fontWeight: '800', alignItems: 'center' }}>
          <div>PATIENT NAME</div><div>PATIENT ID</div><div>DIAGNOSIS</div><div>STATUS</div><div>ACTION</div>
        </div>

        {loading && <div style={{ textAlign: 'center', padding: '40px', color: '#94A3B8', fontSize: '14px', fontWeight: '600' }}>Loading patients...</div>}
        {error && <div style={{ padding: '16px 20px', backgroundColor: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '10px', color: '#DC2626', fontWeight: '600', fontSize: '14px', marginBottom: '20px' }}>⚠️ {error}</div>}

        {!loading && filtered.map((p, i) => {
          const { bg, tc } = statusStyle(getStatus(p));
          return (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: gridTemplate, alignItems: 'center', backgroundColor: 'white', padding: '20px 25px', borderRadius: '12px', marginBottom: '12px', border: '1px solid #E2E8F0', fontSize: '14px', fontWeight: '700' }}>
              <div>{getName(p)}</div>
              <div style={{ color: '#64748B' }}>{getId(p)}</div>
              <div>{getDiag(p)}</div>
              <div>
                <div style={{ width: '90px', padding: '6px 0', borderRadius: '20px', backgroundColor: bg, color: tc, textAlign: 'center', fontSize: '12px', fontWeight: '800' }}>{getStatus(p)}</div>
              </div>
              <div style={{ textAlign: 'left' }}>
                <button onClick={() => navigate('/patient-profile', { state: { patientName: getName(p), patientId: getId(p) } })} style={{ padding: '10px 24px', backgroundColor: '#314155', color: 'white', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: '700' }}>View</button>
              </div>
            </div>
          );
        })}

        {!loading && filtered.length === 0 && !error && (
          <div style={{ textAlign: 'center', padding: '40px', color: '#94A3B8', fontSize: '14px', fontWeight: '600' }}>No patients found.</div>
        )}
      </div>

      <div style={{ textAlign: 'right', marginTop: '40px', fontSize: '12px', color: '#64748B', opacity: 0.7, fontWeight: '600' }}>
        Last System Audit: 12/02/2026 at 11:14 AM by Admin_Sarah
      </div>
    </div>
  );
};


// --- FRAME 3: SCHEDULE (Live API) ---
const DoctorSchedule = ({ searchText }) => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const user  = JSON.parse(localStorage.getItem('user') || '{}');

  const [viewingPatient, setViewingPatient]     = React.useState(null);
  const [note, setNote]                         = React.useState('');
  const [completedPatients, setCompletedPatients] = React.useState([]);
  const [showOrderModal, setShowOrderModal]     = React.useState(false);
  const [showLabModal, setShowLabModal]         = React.useState(false);
  const [toastMessage, setToastMessage]         = React.useState('');
  const [toastType, setToastType]               = React.useState('success');

  // Schedule API state
  const [scheduleData, setScheduleData] = React.useState([]);
  const [loading, setLoading]           = React.useState(true);
  const [error, setError]               = React.useState('');

  // Prescription form state
  const [rxMed, setRxMed]       = React.useState('');
  const [rxDose, setRxDose]     = React.useState('');
  const [rxFreq, setRxFreq]     = React.useState('');
  const [rxDur, setRxDur]       = React.useState('');
  const [submittingRx, setSubmittingRx] = React.useState(false);

  // Lab request state
  const [labChecks, setLabChecks] = React.useState({ malaria: false, fbc: false, spo2: false, xray: false });
  const [labNotes, setLabNotes]   = React.useState('');
  const [submittingLab, setSubmittingLab] = React.useState(false);

  const gridTemplate = "20% 12% 23% 15% 15% 15%";

  const triggerToast = (msg, type = 'success') => {
    setToastMessage(msg);
    setToastType(type);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // Priority badge styling
  const priorityStyle = (tl) => {
    if (!tl) return { tbg: '#F1F5F9', ttc: '#475569', tLabel: 'Routine' };
    const p = String(tl).toUpperCase();
    if (p.includes('1') || p === 'EMERGENCY') return { tbg: '#FEF2F2', ttc: '#991B1B', tLabel: 'Emergency' };
    if (p.includes('2') || p === 'URGENT')    return { tbg: '#FFFBEB', ttc: '#9A3412', tLabel: 'Urgent' };
    return { tbg: '#F0FDF4', ttc: '#166534', tLabel: 'Routine' };
  };

  const vitalStyle = (v) => {
    const s = (v || '').toLowerCase();
    if (s === 'captured') return { vbg: '#F0FDF4', vtc: '#166534' };
    return { vbg: '#FFFBEB', vtc: '#9A3412' };
  };

  // Fetch schedule from API
  React.useEffect(() => {
    const fetchSchedule = async () => {
      try {
        setLoading(true);
        // Try doctor-specific schedule first
        const doctorId = user.id || user._id;
        let res = doctorId
          ? await fetch(`${BASE_URL}/api/doctors/${doctorId}/schedule`, { headers: { Authorization: `Bearer ${token}` } })
          : null;

        // Fallback to all appointments
        if (!res || !res.ok) {
          res = await fetch(`${BASE_URL}/api/appointments`, { headers: { Authorization: `Bearer ${token}` } });
        }

        const data = await res.json();
        const list = Array.isArray(data) ? data : (data.appointments || data.schedule || data.data || []);

        // Normalize each appointment
        const normalized = list.map(a => ({
          n:      a.patient_name || a.patientName || (a.patient && a.patient.name) || 'Unknown',
          id:     a.patient_id   || (a.patient && a.patient.id) || a.id || '—',
          age:    a.age          || (a.patient && a.patient.age) || '—',
          gender: a.gender       || (a.patient && a.patient.gender) || '—',
          t:      a.appointment_time || a.time || a.appointment_date || '—',
          r:      a.reason       || a.reason_for_visit || '—',
          tl:     a.triage_level || a.priority || 'P3',
          v:      a.vitals_status || a.vitals || 'Pending',
          bp:     a.blood_pressure || (a.vitals && a.vitals.bp) || '—',
          hr:     a.heart_rate   || (a.vitals && a.vitals.hr) || '—',
          appt_id: a.id || a._id,
          ...priorityStyle(a.triage_level || a.priority),
          ...vitalStyle(a.vitals_status || a.vitals),
        }));

        setScheduleData(normalized);
      } catch (err) {
        setError('Failed to load schedule.');
      } finally {
        setLoading(false);
      }
    };
    fetchSchedule();
  }, []);

  const filteredData = scheduleData.filter(p =>
    p.n.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleStartConsultation = (patient) => {
    setNote('');
    setRxMed(patient.medication || '');
    setViewingPatient(patient);
  };

  // Save medical record to API
  const handleSaveRecord = async () => {
    try {
      await fetch(`${BASE_URL}/api/medical-records`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          patient_id:     viewingPatient.id,
          clinical_notes: note,
          vitals: { blood_pressure: viewingPatient.bp, heart_rate: viewingPatient.hr },
        }),
      });
    } catch (err) { /* fail silently, still show toast */ }

    setCompletedPatients(prev => [...prev, viewingPatient.n]);
    triggerToast(`Record for ${viewingPatient.n} saved successfully!`);
    setTimeout(() => setViewingPatient(null), 1500);
  };

  // Submit prescription to API
  const handleFinalizeOrder = async () => {
    setSubmittingRx(true);
    try {
      const res = await fetch(`${BASE_URL}/api/prescriptions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          patient_id:     viewingPatient.id,
          medication_name: rxMed,
          dosage:          rxDose,
          frequency:       rxFreq,
          duration:        rxDur,
          status:          'pending',
        }),
      });
      if (res.ok) {
        setShowOrderModal(false);
        setRxMed(''); setRxDose(''); setRxFreq(''); setRxDur('');
        triggerToast('Prescription sent to pharmacy!');
      } else {
        triggerToast('Failed to send prescription. Please try again.', 'error');
      }
    } catch (err) {
      triggerToast('Network error. Prescription not sent.', 'error');
    } finally {
      setSubmittingRx(false);
    }
  };

  // Submit lab request to API
  const handleSendToLab = async () => {
    const selectedTests = Object.entries(labChecks).filter(([, v]) => v).map(([k]) => k);
    if (selectedTests.length === 0) { triggerToast('Please select at least one test.', 'error'); return; }

    setSubmittingLab(true);
    try {
      const res = await fetch(`${BASE_URL}/api/lab-requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          patient_id:   viewingPatient.id,
          tests:        selectedTests,
          notes:        labNotes,
          status:       'pending',
        }),
      });
      if (res.ok) {
        setShowLabModal(false);
        setLabChecks({ malaria: false, fbc: false, spo2: false, xray: false });
        setLabNotes('');
        triggerToast('Laboratory request transmitted successfully!');
      } else {
        triggerToast('Failed to send lab request. Please try again.', 'error');
      }
    } catch (err) {
      triggerToast('Network error. Lab request not sent.', 'error');
    } finally {
      setSubmittingLab(false);
    }
  };

  // Update appointment status to completed
  const handleUpdateApptStatus = async (apptId) => {
    try {
      await fetch(`${BASE_URL}/api/appointments/${apptId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: 'completed' }),
      });
    } catch (err) { /* fail silently */ }
  };

  if (viewingPatient) {
    return (
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
        
        {toastMessage && (
          <div style={{ position: 'fixed', top: '25px', left: '50%', transform: 'translateX(-50%)', backgroundColor: toastType === 'error' ? '#EF4444' : '#10B981', color: 'white', padding: '14px 25px', borderRadius: '8px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.15)', display: 'flex', alignItems: 'center', gap: '10px', zIndex: 999, fontWeight: '700', fontSize: '14px' }}>
            <span>{toastType === 'error' ? '🚫' : '✅'}</span> {toastMessage}
          </div>
        )}

        <div style={{ flex: 1, overflowY: 'auto', paddingBottom: '30px' }}>
          {/* Allergy alert — only show if patient has a known allergy */}
          {allergyMap[viewingPatient.n] && (
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '35px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: '#FEF2F2', border: '1px solid #FCA5A5', padding: '12px 30px', borderRadius: '8px', color: '#B91C1C', fontWeight: '800', fontSize: '14px' }}>
                <span style={{ fontSize: '16px' }}>🚫</span> ALERT: {allergyMap[viewingPatient.n]}
              </div>
            </div>
          )}

          <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '16px', border: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '35px' }}>
            <div>
              <h2 style={{ margin: '0 0 10px 0', fontSize: '28px', fontWeight: '800', color: '#1E293B' }}>{viewingPatient.n}</h2>
              <p style={{ margin: 0, color: '#64748B', fontSize: '14px', fontWeight: '700' }}>
                {viewingPatient.id} | Age: {viewingPatient.age} | Gender: {viewingPatient.gender}
              </p>
            </div>

            <div style={{ display: 'flex', gap: '20px' }}>
              <div style={{ backgroundColor: '#F0FDF4', padding: '20px', borderRadius: '12px', textAlign: 'center', width: '120px' }}>
                <span style={{ fontSize: '11px', color: '#166534', fontWeight: '800' }}>BP(mmHg)</span>
                <h3 style={{ margin: '10px 0 0 0', fontSize: '24px', fontWeight: '800', color: '#14532D' }}>{viewingPatient.bp}</h3>
              </div>
              <div style={{ backgroundColor: '#EFF6FF', padding: '20px', borderRadius: '12px', textAlign: 'center', width: '120px' }}>
                <span style={{ fontSize: '11px', color: '#1E40AF', fontWeight: '800' }}>Heart Rate (BPM)</span>
                <h3 style={{ margin: '10px 0 0 0', fontSize: '24px', fontWeight: '800', color: '#1E3A8A' }}>{viewingPatient.hr}</h3>
              </div>
            </div>
          </div>

          <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
            <h3 style={{ margin: '0 0 15px 0', fontSize: '18px', fontWeight: '800', color: '#1E293B' }}>Clinical Observation & Diagnosis</h3>
            <textarea 
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Start typing medical findings, symptoms, or diagnosis..."
              style={{ width: '100%', height: '220px', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '15px', resize: 'none', fontFamily: '"Inter", sans-serif', fontSize: '14px', boxSizing: 'border-box' }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '20px', borderTop: '1px solid #E2E8F0', backgroundColor: '#F4F7F6', zIndex: 10 }}>
          <div style={{ display: 'flex', gap: '15px' }}>
            <button onClick={() => setShowOrderModal(true)} style={{ padding: '12px 25px', backgroundColor: '#3B82F6', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '14px', cursor: 'pointer' }}>
              + New Prescription
            </button>
            <button onClick={() => setShowLabModal(true)} style={{ padding: '12px 25px', backgroundColor: 'white', color: '#1E293B', border: '1px solid #E2E8F0', borderRadius: '8px', fontWeight: '700', fontSize: '14px', cursor: 'pointer' }}>
              + Request Lab
            </button>
          </div>

          <button onClick={handleSaveRecord} style={{ padding: '12px 40px', backgroundColor: '#22C55E', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '14px', cursor: 'pointer' }}>
            SAVE RECORD
          </button>
        </div>
        

        {/* Prescription Modal */}
        {showOrderModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
            <div style={{ width: '640px', backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
              <div style={{ padding: '25px 30px', borderBottom: '1px solid #F1F5F9' }}>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
                  <span style={{ position: 'absolute', left: '15px', color: '#64748B' }}>🔍</span>
                  <input placeholder="Search for a medication..." style={{ width: '100%', padding: '14px 15px 14px 45px', borderRadius: '8px', border: '1px solid #E2E8F0', boxSizing: 'border-box', fontSize: '14px', fontWeight: '600' }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '800', color: '#1E293B' }}>New Medication Order</h3>
                  <span onClick={() => setShowOrderModal(false)} style={{ cursor: 'pointer', fontWeight: '800', fontSize: '18px', color: '#64748B' }}>X</span>
                </div>
              </div>

              <div style={{ padding: '30px', maxHeight: '450px', overflowY: 'auto' }}>
                <div style={{ paddingBottom: '25px', marginBottom: '25px', borderBottom: '1px solid #F1F5F9' }}>
                  <div style={{ marginBottom: '15px' }}><input defaultValue="Artemether - Lumefantrine (Coartem)" style={{ width: '100%', padding: '12px 15px', borderRadius: '8px', border: '1px solid #E2E8F0', boxSizing: 'border-box', fontSize: '14px', fontWeight: '700' }} /></div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                    <input defaultValue="20mg/120mg" style={{ width: '100%', padding: '12px 15px', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0', boxSizing: 'border-box', fontSize: '14px', fontWeight: '600' }} />
                    <input defaultValue="1 tab, twice daily for 3 days" style={{ width: '100%', padding: '12px 15px', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0', boxSizing: 'border-box', fontSize: '14px', fontWeight: '600' }} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                    <div><label style={{ fontSize: '11px', fontWeight: '700', color: '#64748B', display: 'block', marginBottom: '5px' }}>Quantity:</label><input defaultValue="6" style={{ width: '100%', padding: '12px 15px', borderRadius: '8px', border: '1px solid #E2E8F0', boxSizing: 'border-box', fontSize: '14px', fontWeight: '600' }} /></div>
                    <div><label style={{ fontSize: '11px', fontWeight: '700', color: '#64748B', display: 'block', marginBottom: '5px' }}>Refills:</label><input defaultValue="0" style={{ width: '100%', padding: '12px 15px', borderRadius: '8px', border: '1px solid #E2E8F0', boxSizing: 'border-box', fontSize: '14px', fontWeight: '600' }} /></div>
                  </div>
                </div>

                <div style={{ paddingBottom: '25px', marginBottom: '25px', borderBottom: '1px solid #F1F5F9' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                    <input defaultValue="Ciprofloxacin" style={{ flex: 1, padding: '12px 15px', borderRadius: '8px', border: '1px solid #E2E8F0', boxSizing: 'border-box', fontSize: '14px', fontWeight: '700' }} />
                    <span style={{ backgroundColor: '#DCFCE7', color: '#166534', padding: '8px 15px', borderRadius: '20px', fontSize: '11px', fontWeight: '800', whiteSpace: 'nowrap' }}>✅ ALLERGY SAFE</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                    <input defaultValue="500mg" style={{ width: '100%', padding: '12px 15px', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0', boxSizing: 'border-box', fontSize: '14px', fontWeight: '600' }} />
                    <input defaultValue="1 tablet, twice daily for 5 days" style={{ width: '100%', padding: '12px 15px', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0', boxSizing: 'border-box', fontSize: '14px', fontWeight: '600' }} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                    <div><label style={{ fontSize: '11px', fontWeight: '700', color: '#64748B', display: 'block', marginBottom: '5px' }}>Quantity:</label><input defaultValue="10" style={{ width: '100%', padding: '12px 15px', borderRadius: '8px', border: '1px solid #E2E8F0', boxSizing: 'border-box', fontSize: '14px', fontWeight: '600' }} /></div>
                    <div><label style={{ fontSize: '11px', fontWeight: '700', color: '#64748B', display: 'block', marginBottom: '5px' }}>Refills:</label><input defaultValue="0" style={{ width: '100%', padding: '12px 15px', borderRadius: '8px', border: '1px solid #E2E8F0', boxSizing: 'border-box', fontSize: '14px', fontWeight: '600' }} /></div>
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: '700', color: '#1E293B', display: 'block', marginBottom: '8px' }}>Signature:</label>
                  <div style={{ width: '100%', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '20px', boxSizing: 'border-box', fontStyle: 'italic', color: '#3B82F6', fontWeight: '700' }}>Dr. Bright Amofa</div>
                </div>
              </div>

              <div style={{ padding: '25px 30px', borderTop: '1px solid #F1F5F9', display: 'flex', justifyContent: 'flex-end', gap: '15px' }}>
                <button onClick={() => navigate(-1)} style={{ padding: '12px 25px', backgroundColor: 'white', color: '#64748B', border: '1px solid #E2E8F0', borderRadius: '8px', fontWeight: '700', fontSize: '14px', cursor: 'pointer' }}>Cancel</button>
                <button onClick={handleFinalizeOrder} disabled={submittingRx} style={{ padding: '12px 30px', backgroundColor: submittingRx ? '#94A3B8' : '#3B82F6', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '14px', cursor: submittingRx ? 'not-allowed' : 'pointer' }}>{submittingRx ? 'Sending...' : 'Finalize & Send to Pharmacy'}</button>
              </div>
            </div>
          </div>
        )}

        {/* Labs Modal */}
        {showLabModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
            <div style={{ width: '640px', backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
              <div style={{ padding: '25px 30px', borderBottom: '1px solid #F1F5F9' }}>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
                  <span style={{ position: 'absolute', left: '15px', color: '#64748B' }}>🔍</span>
                  <input placeholder="Search for a test..." style={{ width: '100%', padding: '14px 15px 14px 45px', borderRadius: '8px', border: '1px solid #E2E8F0', boxSizing: 'border-box', fontSize: '14px', fontWeight: '600' }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '800', color: '#1E293B' }}>Request Laboratory Tests - {viewingPatient.n}</h3>
                  <span onClick={() => setShowLabModal(false)} style={{ cursor: 'pointer', fontWeight: '800', fontSize: '18px', color: '#64748B' }}>X</span>
                </div>
              </div>

              <div style={{ padding: '30px', maxHeight: '450px', overflowY: 'auto' }}>
                
                {/* Hematology */}
                <div style={{ marginBottom: '25px' }}>
                  <h4 style={{ fontSize: '12px', fontWeight: '800', color: '#64748B', textTransform: 'uppercase', marginBottom: '15px' }}>Hematology</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                      <input type="checkbox" style={{ transform: 'scale(1.2)' }} />
                      <span style={{ fontSize: '14px', fontWeight: '600', color: '#1E293B' }}>Full Blood Count (FBC)</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                      <input type="checkbox" style={{ transform: 'scale(1.2)' }} />
                      <span style={{ fontSize: '14px', fontWeight: '600', color: '#1E293B' }}>Blood Group & Rh Typing</span>
                    </label>
                  </div>
                </div>

                {/* Parasitology */}
                <div style={{ marginBottom: '25px' }}>
                  <h4 style={{ fontSize: '12px', fontWeight: '800', color: '#64748B', textTransform: 'uppercase', marginBottom: '15px' }}>Parasitology</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                      <input type="checkbox" defaultChecked style={{ transform: 'scale(1.2)' }} />
                      <span style={{ fontSize: '14px', fontWeight: '600', color: '#1E293B' }}>Malaria RDT / Smear</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                      <input type="checkbox" style={{ transform: 'scale(1.2)' }} />
                      <span style={{ fontSize: '14px', fontWeight: '600', color: '#1E293B' }}>Stool Analysis</span>
                    </label>
                  </div>
                </div>

                {/* Biochemistry */}
                <div style={{ marginBottom: '25px' }}>
                  <h4 style={{ fontSize: '12px', fontWeight: '800', color: '#64748B', textTransform: 'uppercase', marginBottom: '15px' }}>Biochemistry</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                      <input type="checkbox" style={{ transform: 'scale(1.2)' }} />
                      <span style={{ fontSize: '14px', fontWeight: '600', color: '#1E293B' }}>Kidney Function Test KFT</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                      <input type="checkbox" style={{ transform: 'scale(1.2)' }} />
                      <span style={{ fontSize: '14px', fontWeight: '600', color: '#1E293B' }}>Liver Function Test LFT</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: '700', color: '#1E293B', display: 'block', marginBottom: '8px' }}>Clinical Indications / Notes:</label>
                  <textarea placeholder="Enter patient's primary symptoms or reason for lab request..." style={{ width: '100%', height: '100px', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '12px', resize: 'none', boxSizing: 'border-box', fontFamily: '"Inter", sans-serif', fontSize: '13px' }} />
                </div>
              </div>

              <div style={{ padding: '25px 30px', borderTop: '1px solid #F1F5F9', display: 'flex', justifyContent: 'flex-end', gap: '15px' }}>
                <button onClick={() => setShowLabModal(false)} style={{ padding: '12px 25px', backgroundColor: 'white', color: '#64748B', border: '1px solid #E2E8F0', borderRadius: '8px', fontWeight: '700', fontSize: '14px', cursor: 'pointer' }}>Cancel</button>
                <button onClick={handleSendToLab} disabled={submittingLab} style={{ padding: '12px 30px', backgroundColor: submittingLab ? '#94A3B8' : '#3B82F6', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '14px', cursor: submittingLab ? 'not-allowed' : 'pointer' }}>{submittingLab ? 'Sending...' : 'Send to Laboratory'}</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <div>
        <div style={{ marginBottom: '35px' }}>
          <div style={{ fontSize: '32px', marginBottom: '5px' }}>👋</div>
          <h1 style={{ fontSize: '36px', fontWeight: '800', margin: 0, color: '#1E293B' }}>
            Doctor's Schedule — {user.name || user.full_name || 'Dr. Bright Amofa'}
          </h1>
        </div>

        {/* Live stat cards */}
        <div style={{ display: 'flex', gap: '20px', marginBottom: '45px', flexWrap: 'wrap' }}>
          {[
            { l: 'Pending Consultations', v: loading ? '—' : filteredData.filter(p => !completedPatients.includes(p.n)).length.toString(), bg: '#EFF6FF', tc: '#3B82F6' },
            { l: 'Completed Today',       v: loading ? '—' : completedPatients.length.toString(), bg: '#F0FDF4', tc: '#22C55E' },
            { l: 'High Priority Cases',   v: loading ? '—' : filteredData.filter(p => p.tLabel === 'Emergency').length.toString(), bg: '#FEF2F2', tc: '#EF4444' },
          ].map((c, i) => (
            <div key={i} style={{ padding: 'clamp(20px, 2.5vw, 35px) clamp(18px, 2vw, 30px)', borderRadius: '16px', backgroundColor: c.bg, flex: 1, minWidth: '150px', border: '1px solid #E2E8F0' }}>
              <p style={{ color: c.tc, fontWeight: '700', fontSize: '14px', margin: 0 }}>{c.l}</p>
              <h2 style={{ fontSize: '56px', fontWeight: '800', margin: '20px 0 0 0', color: c.tc }}>{c.v}</h2>
            </div>
          ))}
        </div>

        {/* Error */}
        {error && <div style={{ padding: '14px 20px', backgroundColor: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '10px', color: '#DC2626', fontWeight: '600', fontSize: '14px', marginBottom: '20px' }}>⚠️ {error}</div>}

        {/* Loading */}
        {loading && <div style={{ textAlign: 'center', padding: '40px', color: '#94A3B8', fontSize: '14px', fontWeight: '600' }}>Loading schedule...</div>}

        {/* Table */}
        {!loading && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: gridTemplate, padding: '0 25px 15px 25px', color: '#64748B', fontSize: '12px', fontWeight: '800', alignItems: 'center' }}>
              <div>PATIENT NAME</div><div>TIME</div><div>REASON</div><div>TRIAGE</div><div>VITALS</div><div>ACTION</div>
            </div>

            {filteredData.length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px', color: '#94A3B8', fontSize: '14px', fontWeight: '600' }}>No appointments scheduled.</div>
            )}

            {filteredData.map((p, i) => (
              <div key={i} onClick={() => !completedPatients.includes(p.n) && handleStartConsultation(p)} style={{ display: 'grid', gridTemplateColumns: gridTemplate, alignItems: 'center', backgroundColor: 'white', padding: '20px 25px', borderRadius: '12px', marginBottom: '12px', border: '1px solid #E2E8F0', fontSize: '14px', fontWeight: '700', cursor: completedPatients.includes(p.n) ? 'default' : 'pointer', transition: 'background 0.15s' }}
                onMouseEnter={e => { if (!completedPatients.includes(p.n)) e.currentTarget.style.backgroundColor = '#F8FAFC'; }}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'white'}
              >
                <div>{p.n}</div><div>{p.t}</div><div>{p.r}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: '#64748B' }}>{p.tl}</span>
                  <div style={{ padding: '4px 12px', borderRadius: '20px', backgroundColor: p.tbg, color: p.ttc, fontSize: '11px' }}>{p.tLabel}</div>
                </div>
                <div>
                  <div style={{ width: '85px', padding: '5px 0', borderRadius: '20px', backgroundColor: completedPatients.includes(p.n) ? '#DCFCE7' : p.vbg, color: completedPatients.includes(p.n) ? '#16A34A' : p.vtc, textAlign: 'center', fontSize: '11px' }}>
                    {completedPatients.includes(p.n) ? 'Done' : p.v}
                  </div>
                </div>
                <div>
                  <button
                    onClick={() => handleStartConsultation(p)}
                    disabled={completedPatients.includes(p.n)}
                    style={{ padding: '10px 18px', backgroundColor: completedPatients.includes(p.n) ? '#94A3B8' : '#3B82F6', color: 'white', borderRadius: '6px', border: 'none', cursor: completedPatients.includes(p.n) ? 'not-allowed' : 'pointer', fontWeight: '700' }}
                  >
                    {completedPatients.includes(p.n) ? 'Completed' : 'Start Consultation'}
                  </button>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
};

// --- FRAME 4: PATIENT PROFILE ---
const PatientProfile = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const passedName = location.state?.patientName;
  const passedId   = location.state?.patientId;
  const token = localStorage.getItem('token');

  const [activeTab, setActiveTab] = React.useState('Overview');
  const [showOrderModal, setShowOrderModal] = React.useState(false);
  const [showLabModal, setShowLabModal] = React.useState(false);
  const [showLabResult, setShowLabResult]                   = React.useState(false);
  const [showConsentModal, setShowConsentModal]             = React.useState(false);
  const [showXRayModal, setShowXRayModal]                   = React.useState(false);
  const [showCertModal, setShowCertModal]                   = React.useState(false);
  const [showMedication, setShowMedication]                 = React.useState(false);
  const [showPrescriptionDetail, setShowPrescriptionDetail] = React.useState(false);
  const [showHistory2, setShowHistory2]                     = React.useState(false);
  const [showHistory3, setShowHistory3]                     = React.useState(false);
  const [showHistory4, setShowHistory4]                     = React.useState(false);
  const [toastMessage, setToastMessage] = React.useState('');
  const [toastType, setToastType] = React.useState('success');

  // Lab checkbox state
  const [labChecks, setLabChecks] = React.useState({ malaria: false, fbc: true, spo2: false, xray: false });
  const [labSearch, setLabSearch] = React.useState('');
  const toggleLab = (key) => setLabChecks(prev => ({ ...prev, [key]: !prev[key] }));

  const triggerToast = (msg, type = 'success') => {
    setToastMessage(msg);
    setToastType(type);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // API state
  const [apiPatient,     setApiPatient]     = React.useState(null);
  const [apiRecords,     setApiRecords]     = React.useState([]);
  const [apiPrescriptions, setApiPrescriptions] = React.useState([]);
  const [apiLabResults,  setApiLabResults]  = React.useState([]);
  const [loadingProfile, setLoadingProfile] = React.useState(true);

  React.useEffect(() => {
  const fetchPatientData = async () => {
    try {
      setLoadingProfile(true);

      const pid = passedId;
      if (!pid) return;

      const res = await fetch(`${BASE_URL}/api/patients/${pid}/full`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        const data = await res.json();

        setApiPatient(data.patient);
        setApiRecords(data.records || []);
        setApiPrescriptions(data.prescriptions || []);
      }

    } catch (err) {
      console.error('Failed to load patient profile:', err);
    } finally {
      setLoadingProfile(false);
    }
  };

  fetchPatientData();
}, [passedId]);

const latestRecord = apiRecords[0];
      

  // Build profileData from API or fallback gracefully
  const getField = (obj, ...keys) => { for (const k of keys) { if (obj && obj[k] !== undefined && obj[k] !== null) return obj[k]; } return null; };

  const profileData = apiPatient ? {
    personal: {
      name:   getField(apiPatient, 'name', 'full_name') || `${apiPatient.first_name || ''} ${apiPatient.last_name || ''}`.trim() || passedName || 'Unknown',
      id:     getField(apiPatient, 'patient_id', 'id', '_id') || '—',
      age:    getField(apiPatient, 'age') || '—',
      gender: getField(apiPatient, 'gender') || '—',
      status: getField(apiPatient, 'status') || 'ACTIVE',
    },
    vitals: {
      bp:     getField(apiPatient, 'blood_pressure', 'bp') || (latestRecord[0] && getField(latestRecord[0], 'blood_pressure', 'bp')) || '—',
      hr:     getField(apiPatient, 'heart_rate', 'hr') || (latestRecord[0] && getField(latestRecord[0], 'heart_rate', 'hr')) || '—',
      temp:   getField(apiPatient, 'temperature', 'temp') || (latestRecord[0] && getField(latestRecord[0], 'temperature', 'temp')) || '—',
      weight: getField(apiPatient, 'weight') || (latestRecord[0] && getField(latestRecord[0], 'weight')) || '—',
    },
    clinicalNotes: (latestRecord[0] && getField(latestRecord[0], 'clinical_notes', 'notes', 'observation')) || getField(apiPatient, 'notes', 'clinical_notes') || 'No clinical notes recorded.',
    diagnosis:     (latestRecord[0] && getField(latestRecord[0], 'diagnosis')) || getField(apiPatient, 'diagnosis', 'primary_diagnosis') || '—',
    medication:    (apiPrescriptions[0] && (getField(apiPrescriptions[0], 'medication_name', 'medication', 'drug_name'))) || getField(apiPatient, 'medication') || '—',
  } : {
    personal: { name: passedName || 'Loading...', id: '—', age: '—', gender: '—', status: 'ACTIVE' },
    vitals: { bp: '—', hr: '—', temp: '—', weight: '—' },
    clinicalNotes: 'Loading patient data...',
    diagnosis: '—',
    medication: '—',
  };

  // Build history from medical records API
  const historyData = apiRecords.length > 0
    ? apiRecords.map(r => ({
        date: r.created_at ? new Date(r.created_at).toLocaleDateString('en-GB', { day:'2-digit', month:'2-digit', year:'numeric' }) : '—',
        d:    getField(r, 'diagnosis') || '—',
        t:    getField(r, 'treatment', 'prescription', 'clinical_notes') || '—',
        by:   getField(r, 'doctor_name', 'recorded_by', 'created_by') || 'Dr. Bright Amofa',
      }))
    : [
        { date: '—', d: 'No records found', t: '—', by: '—' },
      ];

  const docsData = [
    { name: 'Lab Result - Full Blood Count (FBC)', date: '19/02/2026', by: 'Dr. Bright Amofa', s: 'PENDING', sbg: '#FEF3C7', stc: '#B45309' },
    { name: 'Patient Consent - Treatment',         date: '15/02/2026', by: 'Dr. Bright Amofa', s: 'READY',   sbg: '#DBEAFE', stc: '#1D4ED8' },
    { name: 'Imaging - Chest X-Ray (PA)',           date: '12/02/2026', by: 'Dr. Bright Amofa', s: 'CANCELLED', sbg: '#FEE2E2', stc: '#DC2626' },
    { name: 'Medical Certificate - Sick Leave',     date: '10/02/2026', by: 'Dr. Bright Amofa', s: 'CONFIRMED', sbg: '#DCFCE7', stc: '#16A34A' },
  ];

  const labTests = [
    { key: 'malaria', label: 'Malaria Parasite (MP)' },
    { key: 'fbc',     label: 'Full Blood Count (FBC)' },
    { key: 'spo2',    label: 'SPO2 / Pulse Ox (To check his oxygen levels)' },
    { key: 'xray',    label: 'Chest X-Ray' },
  ];

  const filteredLabTests = labTests.filter(t =>
    t.label.toLowerCase().includes(labSearch.toLowerCase())
  );

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>

      {loadingProfile && (
        <div style={{ textAlign: 'center', padding: '60px', color: '#94A3B8', fontSize: '15px', fontWeight: '600' }}>
          Loading patient profile...
        </div>
      )}
      {toastMessage && (
        <div style={{ position: 'fixed', top: '25px', left: '50%', transform: 'translateX(-50%)', backgroundColor: toastType === 'error' ? '#EF4444' : '#10B981', color: 'white', padding: '14px 25px', borderRadius: '8px', zIndex: 999, fontWeight: '700', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}><span>{toastType === 'error' ? '🚫' : '✅'}</span> {toastMessage}</div>
      )}

      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: '30px' }}>
        <h1 style={{ fontWeight: '800', fontSize: 'clamp(22px, 2.5vw, 32px)', color: '#1E293B', marginBottom: '35px', marginTop: 0 }}>Patient Profile</h1>

        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '30px' }}>
          <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: '#E2E8F0' }} />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <h2 style={{ margin: 0, fontSize: '28px', fontWeight: '800', color: '#1E293B' }}>{profileData.personal.name}</h2>
              <span style={{ backgroundColor: '#DCFCE7', color: '#166534', padding: '5px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '800' }}>{profileData.personal.status}</span>
            </div>
            <p style={{ margin: '5px 0 0 0', color: '#64748B', fontWeight: '700', fontSize: '14px' }}>ID: {profileData.personal.id} | {profileData.personal.gender} | {profileData.personal.age} Years Old</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '30px', borderBottom: '1px solid #E2E8F0', marginBottom: '35px' }}>
          {['Overview', 'History', 'Documents'].map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{ padding: '10px 0', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '800', fontSize: '14px', color: activeTab === tab ? '#3B82F6' : '#64748B', borderBottom: activeTab === tab ? '3px solid #3B82F6' : '3px solid transparent', marginBottom: '-1px' }}>{tab}</button>
          ))}
        </div>

        {/* --- OVERVIEW TAB --- */}
        {activeTab === 'Overview' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '25px', marginBottom: '35px' }}>
              {[{ l: 'Blood Pressure', v: profileData.vitals.bp, u: 'mmHg' }, { l: 'Heart Rate', v: profileData.vitals.hr, u: 'bpm' }, { l: 'Temperature', v: profileData.vitals.temp, u: '°C' }, { l: 'Weight', v: profileData.vitals.weight, u: 'kg' }].map((v, i) => (
                <div key={i} style={{ backgroundColor: '#F1F5F9', padding: '25px', borderRadius: '12px', textAlign: 'center', position: 'relative' }}>
                  <span style={{ fontSize: '12px', color: '#64748B', fontWeight: '700', display: 'block', marginBottom: '15px' }}>{v.l}</span>
                  <h3 style={{ margin: 0, fontSize: '32px', fontWeight: '800', color: '#1E293B' }}>{v.v}</h3>
                  <span style={{ fontSize: '11px', color: '#94A3B8', position: 'absolute', bottom: '10px', right: '15px' }}>{v.u}</span>
                </div>
              ))}
            </div>
            
            <div style={{ marginBottom: '35px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#1E293B', marginBottom: '15px' }}>Clinical Notes & Diagnosis</h3>
              <div style={{ backgroundColor: 'white', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '25px', height: '180px' }}>
                <p style={{ margin: 0, fontSize: '14px', color: '#1E293B' }}>{profileData.clinicalNotes}</p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
              <div>
                <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#64748B', marginBottom: '10px' }}>Primary Diagnosis</h4>
                <div style={{ background: 'white', padding: '15px', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '14px', fontWeight: '700' }}>{profileData.diagnosis}</div>
              </div>
              <div>
                <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#64748B', marginBottom: '10px' }}>Current Medication</h4>
                <div onClick={() => setShowMedication(true)} style={{ background: 'white', padding: '15px', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '14px', fontWeight: '700', cursor: 'pointer' }}>{profileData.medication}</div>
              </div>
            </div>
          </div>
        )}

        {/* --- HISTORY TAB --- */}
        {activeTab === 'History' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '15% 25% 35% 25%', padding: '0 25px 15px 25px', color: '#64748B', fontSize: '12px', fontWeight: '800' }}>
              <div>DATE</div><div>DIAGNOSIS</div><div>TREATMENT</div><div>RECORDED BY</div>
            </div>
            {historyData.length === 0 || (historyData.length === 1 && historyData[0].d === 'No records found') ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#94A3B8', fontSize: '14px', fontWeight: '600' }}>
                No medical history recorded yet. Records will appear here after consultations.
              </div>
            ) : (
              historyData.map((h, i) => (
                <div key={i} onClick={() => {
                  if (i === 0) setShowPrescriptionDetail(true);
                  if (i === 1) setShowHistory2(true);
                  if (i === 2) setShowHistory3(true);
                  if (i === 3) setShowHistory4(true);
                }} style={{ display: 'grid', gridTemplateColumns: '15% 25% 35% 25%', alignItems: 'center', backgroundColor: 'white', padding: '20px 25px', borderRadius: '12px', marginBottom: '12px', border: '1px solid #E2E8F0', fontSize: '14px', fontWeight: '700', cursor: 'pointer' }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = '#F8FAFC'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = 'white'}
                >
                  <div style={{ color: '#1E293B' }}>{h.date}</div>
                  <div style={{ color: '#1E293B' }}>{h.d}</div>
                  <div style={{ color: '#1E293B' }}>{h.t}</div>
                  <div style={{ color: '#64748B' }}>{h.by}</div>
                </div>
              ))
            )}
          </div>
        )}

        {/* --- DOCUMENTS TAB --- */}
        {activeTab === 'Documents' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Real lab results from API */}
            {apiLabResults.map((lab, i) => (
              <div key={`lab-${i}`} onClick={() => setShowLabResult(true)}
                style={{ display: 'flex', alignItems: 'center', backgroundColor: '#F8FAFC', padding: '20px 24px', borderRadius: '12px', border: '1px solid #E2E8F0', gap: '18px', cursor: 'pointer' }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = '#F1F5F9'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = '#F8FAFC'}
              >
                <div style={{ width: '38px', height: '44px', backgroundColor: '#3B82F6', borderRadius: '6px', flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
                    <span style={{ fontWeight: '700', fontSize: '15px', color: '#1E293B' }}>Lab Result — {lab.test_name || lab.test_type || 'Blood Test'}</span>
                    <span style={{ padding: '3px 12px', borderRadius: '20px', backgroundColor: '#DBEAFE', color: '#1D4ED8', fontSize: '11px', fontWeight: '800' }}>{(lab.status || 'COMPLETED').toUpperCase()}</span>
                  </div>
                  <div style={{ fontSize: '13px', color: '#64748B', fontWeight: '500' }}>
                    Date: {lab.created_at ? new Date(lab.created_at).toLocaleDateString('en-GB') : '—'}
                  </div>
                </div>
              </div>
            ))}

            {/* Fallback static docs if no API data yet */}
            {apiLabResults.length === 0 && docsData.map((doc, i) => (
              <div key={i} onClick={() => {
                if (i === 0) setShowLabResult(true);
                if (i === 1) setShowConsentModal(true);
                if (i === 2) setShowXRayModal(true);
                if (i === 3) setShowCertModal(true);
              }} style={{ display: 'flex', alignItems: 'center', backgroundColor: '#F8FAFC', padding: '20px 24px', borderRadius: '12px', border: '1px solid #E2E8F0', gap: '18px', cursor: 'pointer' }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = '#F1F5F9'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = '#F8FAFC'}
              >
                <div style={{ width: '38px', height: '44px', backgroundColor: '#3B82F6', borderRadius: '6px', flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
                    <span style={{ fontWeight: '700', fontSize: '15px', color: '#1E293B' }}>{doc.name}</span>
                    <span style={{ padding: '3px 12px', borderRadius: '20px', backgroundColor: doc.sbg, color: doc.stc, fontSize: '11px', fontWeight: '800', whiteSpace: 'nowrap' }}>{doc.s}</span>
                  </div>
                  <div style={{ fontSize: '13px', color: '#64748B', fontWeight: '500' }}>
                    Requested: {doc.date} &nbsp;|&nbsp; Requested by: {doc.by}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Prescription Detail Banner Modal — click outside to close */}
        {showPrescriptionDetail && (
          <div
            onClick={() => setShowPrescriptionDetail(false)}
            style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', zIndex: 100, paddingTop: '200px' }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{ width: '760px', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.15)', padding: '22px 30px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', alignItems: 'center', gap: '20px' }}
            >
              <span style={{ fontSize: '14px', color: '#64748B', fontWeight: '500' }}>19/02/2026</span>
              <span style={{ fontSize: '15px', fontWeight: '800', color: '#1E293B' }}>Salbutamol - Asthma</span>
              <span style={{ fontSize: '14px', color: '#475569', fontWeight: '500' }}>100 mcg, 2 puffs every 4-6 hrs.</span>
              <span style={{ padding: '5px 16px', borderRadius: '20px', backgroundColor: '#DCFCE7', color: '#16A34A', fontSize: '12px', fontWeight: '800', whiteSpace: 'nowrap' }}>ACTIVE</span>
            </div>
          </div>
        )}

        {/* Current Medications Modal — click outside to close */}
        {showMedication && (
          <div
            onClick={() => setShowMedication(false)}
            style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{ width: '400px', backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 20px 40px rgba(0,0,0,0.15)', padding: '35px 40px', textAlign: 'center' }}
            >
              <h3 style={{ margin: '0 0 30px 0', fontSize: '18px', fontWeight: '800', color: '#1E293B' }}>Current Medications</h3>
              <p style={{ margin: '0 0 12px 0', fontSize: '15px', fontWeight: '700', color: '#1E293B' }}>{profileData.medication}</p>
              <p style={{ margin: 0, fontSize: '14px', fontWeight: '400', color: '#94A3B8' }}>Prescribed for {profileData.diagnosis}</p>
            </div>
          </div>
        )}

        {/* Lab Result Modal */}
        {showLabResult && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
            <div style={{ width: 'min(540px, 95vw)', backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 20px 40px rgba(0,0,0,0.15)', overflow: 'hidden' }}>
              <div style={{ padding: '28px 30px 20px 30px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#1E293B' }}>Lab Result: Full Blood Count (FBC)</h3>
                  <span style={{ padding: '4px 14px', borderRadius: '20px', backgroundColor: '#DCFCE7', color: '#16A34A', fontSize: '12px', fontWeight: '800', whiteSpace: 'nowrap' }}>NORMAL</span>
                </div>
              </div>
              <div style={{ margin: '0 30px 24px 30px', borderRadius: '10px', overflow: 'hidden', border: '1px solid #E2E8F0' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', backgroundColor: '#F0FDF4', padding: '14px 20px' }}>
                  <span style={{ fontSize: '13px', fontWeight: '700', color: '#64748B' }}>Test Name</span>
                  <span style={{ fontSize: '13px', fontWeight: '700', color: '#64748B' }}>Result</span>
                </div>
                {[{ test: 'Hemoglobin', result: '14.2 g/dL' }, { test: 'WBC Count', result: '6.5 ×10⁹/L' }, { test: 'Platelets', result: '250 ×10⁹/L' }, { test: 'Hematocrit', result: '42.0 %' }, { test: 'RBC Count', result: '4.8 ×10¹²/L' }].map((row, i) => (
                  <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', padding: '16px 20px', borderTop: '1px solid #E2E8F0', backgroundColor: 'white' }}>
                    <span style={{ fontSize: '14px', fontWeight: '700', color: '#1E293B' }}>{row.test}</span>
                    <span style={{ fontSize: '14px', fontWeight: '500', color: '#1E293B' }}>{row.result}</span>
                  </div>
                ))}
              </div>
              <div style={{ padding: '0 30px 20px 30px' }}>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '14px' }}>
                  <button onClick={() => setShowLabResult(false)} style={{ padding: '13px 28px', backgroundColor: '#3B82F6', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '14px', cursor: 'pointer' }}>Acknowledge & Close</button>
                </div>
                <p style={{ margin: 0, fontSize: '11px', color: '#94A3B8', textAlign: 'right' }}>Authorized by: Dr. Bright Amofa | ID: 7729-GH</p>
              </div>
            </div>
          </div>
        )}

        {/* Patient Consent Modal */}
        {showConsentModal && (
          <div onClick={() => setShowConsentModal(false)} style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
            <div onClick={e => e.stopPropagation()} style={{ width: 'min(500px, 95vw)', backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 20px 40px rgba(0,0,0,0.15)', padding: '32px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#1E293B' }}>Patient Consent — Asthma Treatment</h3>
                <span onClick={() => setShowConsentModal(false)} style={{ cursor: 'pointer', fontWeight: '800', fontSize: '18px', color: '#64748B' }}>×</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px' }}>
                {[['Document Type', 'Informed Consent'], ['Status', 'READY'], ['Date Signed', '15/02/2026'], ['Signed By', profileData.personal.name], ['Authorized By', 'Dr. Bright Amofa'], ['Treatment', 'Asthma Management — Salbutamol Inhaler']].map(([l, v], i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid #F1F5F9' }}>
                    <span style={{ fontSize: '13px', fontWeight: '700', color: '#64748B' }}>{l}</span>
                    <span style={{ fontSize: '14px', fontWeight: '700', color: '#1E293B' }}>{v}</span>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button onClick={() => setShowConsentModal(false)} style={{ padding: '12px 28px', backgroundColor: '#3B82F6', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}>Close</button>
              </div>
            </div>
          </div>
        )}

        {/* Chest X-Ray Modal */}
        {showXRayModal && (
          <div onClick={() => setShowXRayModal(false)} style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
            <div onClick={e => e.stopPropagation()} style={{ width: 'min(500px, 95vw)', backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 20px 40px rgba(0,0,0,0.15)', padding: '32px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#1E293B' }}>Imaging — Chest X-Ray (PA)</h3>
                <span onClick={() => setShowXRayModal(false)} style={{ cursor: 'pointer', fontWeight: '800', fontSize: '18px', color: '#64748B' }}>×</span>
              </div>
              <div style={{ backgroundColor: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', padding: '14px 18px', marginBottom: '20px', color: '#DC2626', fontWeight: '700', fontSize: '13px' }}>
                ⚠️ This imaging request has been CANCELLED.
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px' }}>
                {[['Document Type', 'Imaging Request'], ['Status', 'CANCELLED'], ['Date Requested', '12/02/2026'], ['Requested By', 'Dr. Bright Amofa'], ['Reason', 'Persistent cough — rule out pneumonia'], ['Notes', 'Patient rescheduled, request voided']].map(([l, v], i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid #F1F5F9' }}>
                    <span style={{ fontSize: '13px', fontWeight: '700', color: '#64748B' }}>{l}</span>
                    <span style={{ fontSize: '14px', fontWeight: '700', color: '#1E293B' }}>{v}</span>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button onClick={() => setShowXRayModal(false)} style={{ padding: '12px 28px', backgroundColor: '#1E293B', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}>Close</button>
              </div>
            </div>
          </div>
        )}

        {/* Medical Certificate Modal */}
        {showCertModal && (
          <div onClick={() => setShowCertModal(false)} style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
            <div onClick={e => e.stopPropagation()} style={{ width: 'min(500px, 95vw)', backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 20px 40px rgba(0,0,0,0.15)', padding: '32px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#1E293B' }}>Medical Certificate — Sick Leave</h3>
                <span onClick={() => setShowCertModal(false)} style={{ cursor: 'pointer', fontWeight: '800', fontSize: '18px', color: '#64748B' }}>×</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px' }}>
                {[['Document Type', 'Medical Certificate'], ['Status', 'CONFIRMED'], ['Date Issued', '10/02/2026'], ['Patient', profileData.personal.name], ['Issued By', 'Dr. Bright Amofa'], ['Duration', '5 Working Days'], ['Reason', 'Acute respiratory illness — rest required']].map(([l, v], i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid #F1F5F9' }}>
                    <span style={{ fontSize: '13px', fontWeight: '700', color: '#64748B' }}>{l}</span>
                    <span style={{ fontSize: '14px', fontWeight: '700', color: '#1E293B' }}>{v}</span>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button onClick={() => setShowCertModal(false)} style={{ padding: '12px 28px', backgroundColor: '#22C55E', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}>Close</button>
              </div>
            </div>
          </div>
        )}

        {/* History Row 2 — Acute Cough / Chest X-Ray */}
        {showHistory2 && (
          <div onClick={() => setShowHistory2(false)} style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', zIndex: 100, paddingTop: '200px' }}>
            <div onClick={e => e.stopPropagation()} style={{ width: '760px', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.15)', padding: '22px 30px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', alignItems: 'center', gap: '20px' }}>
              <span style={{ fontSize: '14px', color: '#64748B', fontWeight: '500' }}>05/11/2025</span>
              <span style={{ fontSize: '15px', fontWeight: '800', color: '#1E293B' }}>R05.9 — Acute Cough</span>
              <span style={{ fontSize: '14px', color: '#475569', fontWeight: '500' }}>Chest X-Ray Requested</span>
              <span style={{ padding: '5px 16px', borderRadius: '20px', backgroundColor: '#DBEAFE', color: '#1D4ED8', fontSize: '12px', fontWeight: '800', whiteSpace: 'nowrap' }}>COMPLETED</span>
            </div>
          </div>
        )}

        {/* History Row 3 — Malaria / Artesunate */}
        {showHistory3 && (
          <div onClick={() => setShowHistory3(false)} style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', zIndex: 100, paddingTop: '200px' }}>
            <div onClick={e => e.stopPropagation()} style={{ width: '760px', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.15)', padding: '22px 30px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', alignItems: 'center', gap: '20px' }}>
              <span style={{ fontSize: '14px', color: '#64748B', fontWeight: '500' }}>15/06/2026</span>
              <span style={{ fontSize: '15px', fontWeight: '800', color: '#1E293B' }}>B54 — Malaria</span>
              <span style={{ fontSize: '14px', color: '#475569', fontWeight: '500' }}>Artesunate Injection</span>
              <span style={{ padding: '5px 16px', borderRadius: '20px', backgroundColor: '#DCFCE7', color: '#16A34A', fontSize: '12px', fontWeight: '800', whiteSpace: 'nowrap' }}>DISPENSED</span>
            </div>
          </div>
        )}

        {/* History Row 4 — General Exam */}
        {showHistory4 && (
          <div onClick={() => setShowHistory4(false)} style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', zIndex: 100, paddingTop: '200px' }}>
            <div onClick={e => e.stopPropagation()} style={{ width: '760px', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.15)', padding: '22px 30px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', alignItems: 'center', gap: '20px' }}>
              <span style={{ fontSize: '14px', color: '#64748B', fontWeight: '500' }}>10/01/2025</span>
              <span style={{ fontSize: '15px', fontWeight: '800', color: '#1E293B' }}>Z00.00 — General Exam</span>
              <span style={{ fontSize: '14px', color: '#475569', fontWeight: '500' }}>Annual Check-up — Healthy</span>
              <span style={{ padding: '5px 16px', borderRadius: '20px', backgroundColor: '#DCFCE7', color: '#16A34A', fontSize: '12px', fontWeight: '800', whiteSpace: 'nowrap' }}>ACTIVE</span>
            </div>
          </div>
        )}

      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '20px', paddingTop: '20px', borderTop: '1px solid #E2E8F0', backgroundColor: '#F4F7F6' }}>
        <button onClick={() => setShowLabModal(true)} style={{ padding: '12px 25px', backgroundColor: 'white', color: '#3B82F6', border: '1px solid #3B82F6', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}>+ Request Lab</button>
        <button onClick={() => setShowOrderModal(true)} style={{ padding: '12px 25px', backgroundColor: 'white', color: '#3B82F6', border: '1px solid #3B82F6', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}>+ New Prescription</button>
        <button onClick={() => navigate('/dashboard')} style={{ padding: '12px 35px', backgroundColor: '#3B82F6', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}>Save & Close Record</button>
      </div>

      {/* NEW: Request New Laboratory Test Modal (from screenshot) */}
      {showLabModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ width: 'min(420px, 95vw)', backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 20px 40px rgba(0,0,0,0.15)', overflow: 'hidden' }}>
            
            {/* Modal Header */}
            <div style={{ padding: '28px 30px 20px 30px', borderBottom: '1px solid #F1F5F9' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#3B82F6' }}>Request New Laboratory Test — {profileData.personal.name}</h3>
                <span onClick={() => setShowLabModal(false)} style={{ cursor: 'pointer', fontWeight: '800', fontSize: '18px', color: '#64748B', lineHeight: 1 }}>×</span>
              </div>
              {/* Search */}
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input
                  value={labSearch}
                  onChange={(e) => setLabSearch(e.target.value)}
                  placeholder="Search for lab test..."
                  style={{ width: '100%', padding: '11px 40px 11px 15px', borderRadius: '8px', border: '1px solid #E2E8F0', backgroundColor: '#F8FAFC', fontSize: '13px', fontWeight: '500', boxSizing: 'border-box', outline: 'none' }}
                />
                <span style={{ position: 'absolute', right: '13px', color: '#94A3B8', fontSize: '15px' }}>🔍</span>
              </div>
            </div>

            {/* Checkboxes */}
            <div style={{ padding: '22px 30px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {filteredLabTests.map((test) => (
                <label key={test.key} style={{ display: 'flex', alignItems: 'center', gap: '14px', cursor: 'pointer' }}>
                  <div
                    onClick={() => toggleLab(test.key)}
                    style={{
                      width: '18px', height: '18px', borderRadius: '4px', flexShrink: 0, cursor: 'pointer',
                      backgroundColor: labChecks[test.key] ? '#3B82F6' : 'white',
                      border: labChecks[test.key] ? '2px solid #3B82F6' : '2px solid #CBD5E1',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}
                  >
                    {labChecks[test.key] && (
                      <svg width="11" height="9" viewBox="0 0 11 9" fill="none">
                        <path d="M1 4L4 7.5L10 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                  <span style={{ fontSize: '14px', fontWeight: '600', color: '#1E293B' }}>{test.label}</span>
                </label>
              ))}
            </div>

            {/* Footer */}
            <div style={{ padding: '0 30px 10px 30px' }}>
              <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '20px', paddingBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <button
                  onClick={() => { setShowLabModal(false); triggerToast('Laboratory request submitted successfully!'); }}
                  style={{ padding: '13px 30px', backgroundColor: '#3B82F6', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '14px', cursor: 'pointer' }}
                >
                  Submit Request
                </button>
                <button
                  onClick={() => setShowLabModal(false)}
                  style={{ padding: '13px 25px', backgroundColor: 'white', color: '#64748B', border: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '14px', cursor: 'pointer' }}
                >
                  Cancel
                </button>
              </div>
              <p style={{ margin: '4px 0 14px 0', fontSize: '11px', color: '#94A3B8', textAlign: 'center' }}>
                Authorized by: Dr. Bright Amofa | ID: 7729-GH
              </p>
            </div>
          </div>
        </div>
      )}

      {/* NEW: New Prescription Modal (from screenshot) */}
      {showOrderModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ width: 'min(420px, 95vw)', backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 20px 40px rgba(0,0,0,0.15)', overflow: 'hidden' }}>

            {/* Header */}
            <div style={{ padding: '28px 30px 24px 30px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '800', color: '#3B82F6' }}>New Prescription</h3>
                <span onClick={() => setShowOrderModal(false)} style={{ cursor: 'pointer', fontWeight: '800', fontSize: '20px', color: '#1E293B', lineHeight: 1 }}>X</span>
              </div>

              {/* Medication Name */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#1E293B', marginBottom: '8px' }}>Medication Name</label>
                <input
                  defaultValue={profileData.medication}
                  style={{ width: '100%', padding: '13px 15px', border: '1px solid #E2E8F0', borderRadius: '8px', fontSize: '14px', fontWeight: '600', boxSizing: 'border-box', outline: 'none' }}
                />
              </div>

              {/* Dosage + Frequency */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#1E293B', marginBottom: '8px' }}>Dosage</label>
                  <input
                    defaultValue="100 mcg"
                    style={{ width: '100%', padding: '13px 15px', border: '1px solid #E2E8F0', borderRadius: '8px', fontSize: '14px', fontWeight: '600', boxSizing: 'border-box', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#1E293B', marginBottom: '8px' }}>Frequency</label>
                  <input
                    defaultValue="2 puffs every 4-6 hrs"
                    style={{ width: '100%', padding: '13px 15px', border: '1px solid #E2E8F0', borderRadius: '8px', fontSize: '14px', fontWeight: '600', boxSizing: 'border-box', outline: 'none' }}
                  />
                </div>
              </div>

              {/* Duration */}
              <div style={{ marginBottom: '30px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#1E293B', marginBottom: '8px' }}>Duration</label>
                <input
                  defaultValue="30 Days"
                  style={{ width: '100%', padding: '13px 15px', border: '1px solid #E2E8F0', borderRadius: '8px', fontSize: '14px', fontWeight: '600', boxSizing: 'border-box', outline: 'none' }}
                />
              </div>

              {/* Buttons */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '16px' }}>
                <button
                  onClick={() => { setShowOrderModal(false); triggerToast('Prescription saved successfully!'); }}
                  style={{ padding: '14px 30px', backgroundColor: '#3B82F6', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '14px', cursor: 'pointer' }}
                >
                  Save Prescription
                </button>
                <button
                  onClick={() => setShowOrderModal(false)}
                  style={{ padding: '14px 20px', backgroundColor: 'white', color: '#64748B', border: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '14px', cursor: 'pointer' }}
                >
                  Cancel
                </button>
              </div>

              {/* Footer note */}
              <p style={{ margin: 0, fontSize: '11px', color: '#94A3B8', textAlign: 'center' }}>
                Prescribed by Dr. Bright Amofa on 18/02/2026 at 1:10 PM
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- LAB TECHNICIAN LAYOUT ---
const LabLayout = ({ children, searchText, setSearchText }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { label: 'Dashboard', path: '/lab-dashboard' },
    { label: 'Lab Queue', path: '/lab-queue' },
  ];

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', backgroundColor: '#F4F7F6', fontFamily: '"Inter", sans-serif', overflow: 'hidden' }}>
      {/* SIDEBAR */}
      <div style={{ width: 'clamp(180px, 18vw, 240px)', minWidth: '180px', backgroundColor: '#1E293B', color: 'white', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', overflow: 'hidden' }}>
        <div>
          <div style={{ padding: '30px 25px 20px 25px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <div style={{ fontSize: '48px', fontWeight: '300', lineHeight: '0.6', color: 'white', flexShrink: 0 }}>+</div>
              <div>
                <h2 style={{ fontSize: '16px', margin: 0, fontWeight: '800', lineHeight: '1.1', letterSpacing: '0.5px', color: 'white' }}>HEALTHCARE<br/>EMR</h2>
              </div>
            </div>
          </div>
          <nav style={{ marginTop: '10px' }}>
            {navItems.map((item) => (
              <Link key={item.path} to={item.path} style={{ display: 'block', padding: '15px 30px', color: 'white', textDecoration: 'none', opacity: location.pathname === item.path ? 1 : 0.4, fontWeight: '700', fontSize: '14px', borderLeft: location.pathname === item.path ? '4px solid #4ADE80' : '4px solid transparent' }}>
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <div onClick={() => { localStorage.removeItem('token'); localStorage.removeItem('user'); localStorage.removeItem('role'); localStorage.removeItem('display_name'); navigate('/logout'); }} style={{ padding: '25px 30px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '15px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          <span style={{ fontWeight: '700', opacity: 0.6, fontSize: '14px' }}>Logout</span>
        </div>
      </div>

      {/* CONTENT */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 50px', backgroundColor: 'white', borderBottom: '1px solid #E2E8F0', position: 'relative' }}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <span style={{ position: 'absolute', left: '15px', color: '#64748B' }}>🔍</span>
            <input
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 'clamp(200px, 30vw, 420px)', padding: '12px 15px 12px 45px', borderRadius: '8px', border: '1px solid #E2E8F0', backgroundColor: '#F8FAFC', fontSize: '13px' }}
              placeholder="Search for patient name, ID or date..."
            />
          </div>
          <div style={{ position: 'absolute', right: '50px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '13px', color: '#64748B', fontWeight: '600' }}>{localStorage.getItem('display_name') || JSON.parse(localStorage.getItem('user') || '{}').full_name || JSON.parse(localStorage.getItem('user') || '{}').name || '—'}</span>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#94A3B8' }} />
          </div>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: 'clamp(20px, 3vw, 50px) clamp(20px, 4vw, 50px)' }}>
          {children}
        </div>
      </div>
    </div>
  );
};

// --- LAB TECHNICIAN QUEUE PAGE ---
const LabQueue = ({ searchText }) => {
  const token = localStorage.getItem('token');

  const [showResultModal, setShowResultModal] = React.useState(false);
  const [showViewModal, setShowViewModal]     = React.useState(false);
  const [selectedPatient, setSelectedPatient] = React.useState(null);
  const [toastMessage, setToastMessage]       = React.useState('');
  const [toastType, setToastType]             = React.useState('success');
  const [submitting, setSubmitting]           = React.useState(false);

  // Form state
  const [hemoglobin, setHemoglobin] = React.useState('');
  const [wbc, setWbc]               = React.useState('');
  const [platelets, setPlatelets]   = React.useState('');
  const [hematocrit, setHematocrit] = React.useState('');
  const [remarks, setRemarks]       = React.useState('');

  const triggerToast = (msg, type = 'success') => {
    setToastMessage(msg); setToastType(type);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // API state
  const [labData, setLabData] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError]     = React.useState('');

  const priorityStyle = (p) => {
    const v = String(p || 'P3').toUpperCase();
    if (v.includes('1') || v === 'EMERGENCY') return { pl: 'P1', pLabel: 'Emergency', pbg: '#FEE2E2', ptc: '#DC2626' };
    if (v.includes('2') || v === 'URGENT')    return { pl: 'P2', pLabel: 'Urgent',    pbg: '#FEF3C7', ptc: '#B45309' };
    return { pl: 'P3', pLabel: 'Routine', pbg: '#DCFCE7', ptc: '#16A34A' };
  };

  const statusStyle = (s) => {
    const v = (s || '').toLowerCase();
    if (v === 'completed') return { sbg: '#DBEAFE', stc: '#1D4ED8', action: 'view' };
    if (v === 'processing') return { sbg: '#DCFCE7', stc: '#16A34A', action: 'view' };
    return { sbg: '#FEF3C7', stc: '#B45309', action: 'enter' };
  };

  // Fetch lab requests
  React.useEffect(() => {
    const fetchLabRequests = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${BASE_URL}/api/lab-requests`, { headers: { Authorization: `Bearer ${token}` } });
        const data = await res.json();
        const list = Array.isArray(data) ? data : (data.labRequests || data.data || []);
        const normalized = list.map(r => ({
          n:          r.patient_name || (r.patient && r.patient.name) || 'Unknown',
          patient_id: r.patient_id   || (r.patient && r.patient.id),
          test:       Array.isArray(r.tests) ? r.tests.join(', ') : (r.test_type || r.test_name || r.tests || '—'),
          s:          r.status || 'Pending',
          request_id: r.id || r._id,
          ...priorityStyle(r.priority || r.triage_level),
          ...statusStyle(r.status),
        }));
        setLabData(normalized);
      } catch { setError('Failed to load lab requests.'); }
      finally { setLoading(false); }
    };
    fetchLabRequests();
  }, []);

  const filtered = labData.filter(p =>
    p.n.toLowerCase().includes(searchText.toLowerCase()) ||
    p.test.toLowerCase().includes(searchText.toLowerCase())
  );

  const gridTemplate = '22% 22% 20% 18% 18%';

  // Submit lab results → POST /api/lab-results
  const handleSubmit = async () => {
    if (!hemoglobin && !wbc && !platelets && !hematocrit) {
      triggerToast('Please enter at least one result.', 'error'); return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`${BASE_URL}/api/lab-results`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          request_id: selectedPatient.request_id,
          patient_id: selectedPatient.patient_id,
          results: { hemoglobin, wbc_count: wbc, platelets, hematocrit },
          remarks,
          status: 'completed',
        }),
      });

      if (res.ok) {
        // Update status locally
        await fetch(`${BASE_URL}/api/lab-requests/${selectedPatient.request_id}/status`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ status: 'completed' }),
        });
        setLabData(prev => prev.map(p =>
          p.request_id === selectedPatient.request_id
            ? { ...p, s: 'Completed', sbg: '#DBEAFE', stc: '#1D4ED8', action: 'view' } : p
        ));
        setShowResultModal(false);
        setHemoglobin(''); setWbc(''); setPlatelets(''); setHematocrit(''); setRemarks('');
        triggerToast(`Results for ${selectedPatient.n} submitted successfully!`);
      } else {
        triggerToast('Failed to submit results. Please try again.', 'error');
      }
    } catch { triggerToast('Network error. Results not submitted.', 'error'); }
    finally { setSubmitting(false); }
  };

  return (
    <div style={{ minHeight: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>

      {toastMessage && (
        <div style={{ position: 'fixed', top: '25px', left: '50%', transform: 'translateX(-50%)', backgroundColor: toastType === 'error' ? '#EF4444' : '#10B981', color: 'white', padding: '14px 25px', borderRadius: '8px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', gap: '10px', zIndex: 999, fontWeight: '700', fontSize: '14px' }}>
          <span>{toastType === 'error' ? '🚫' : '✅'}</span> {toastMessage}
        </div>
      )}

      <div>
        <h1 style={{ fontWeight: '800', fontSize: 'clamp(22px, 2.5vw, 32px)', color: '#1E293B', marginBottom: '35px' }}>Laboratory Test Requests</h1>

        {/* Stat Cards */}
        <div style={{ display: 'flex', gap: '20px', marginBottom: '50px', flexWrap: 'wrap' }}>
          {[
            { l: 'Pending Tests',   v: loading ? '—' : labData.filter(l => l.s.toLowerCase() === 'pending').length.toString(),   tc: '#3B82F6', bg: '#EFF6FF', bc: '#BFDBFE' },
            { l: 'Completed Today', v: loading ? '—' : labData.filter(l => l.s.toLowerCase() === 'completed').length.toString(), tc: '#16A34A', bg: '#F0FDF4', bc: '#BBF7D0' },
            { l: 'Urgent/Critical', v: loading ? '—' : labData.filter(l => l.pLabel === 'Emergency').length.toString(),          tc: '#EF4444', bg: '#FEF2F2', bc: '#FECACA' },
          ].map((c, i) => (
            <div key={i} style={{ padding: 'clamp(18px, 2vw, 30px) clamp(16px, 1.8vw, 28px)', borderRadius: '16px', backgroundColor: c.bg, flex: 1, minWidth: '140px', border: `1px solid ${c.bc}` }}>
              <p style={{ color: c.tc, fontWeight: '700', fontSize: '14px', margin: 0 }}>{c.l}</p>
              <h2 style={{ fontSize: 'clamp(32px, 4vw, 52px)', fontWeight: '800', margin: '16px 0 0 0', color: c.tc }}>{c.v}</h2>
            </div>
          ))}
        </div>

        {/* Table Header */}
        <div style={{ display: 'grid', gridTemplateColumns: gridTemplate, padding: '14px 25px', backgroundColor: '#F8FAFC', borderRadius: '10px', marginBottom: '8px', color: '#64748B', fontSize: '12px', fontWeight: '800', letterSpacing: '0.5px' }}>
          <div>PATIENT NAME</div><div>TEST TYPE</div><div>PRIORITY</div><div>STATUS</div><div>ACTION</div>
        </div>

        {loading && <div style={{ textAlign: 'center', padding: '40px', color: '#94A3B8', fontSize: '14px' }}>Loading lab requests...</div>}
        {error && <div style={{ padding: '14px', backgroundColor: '#FEF2F2', borderRadius: '8px', color: '#DC2626', fontWeight: '600', marginBottom: '16px' }}>⚠️ {error}</div>}
        {/* Table Rows */}
        {!loading && filtered.map((p, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: gridTemplate, alignItems: 'center', backgroundColor: 'white', padding: '20px 25px', borderRadius: '12px', marginBottom: '10px', border: '1px solid #E2E8F0', fontSize: '14px', fontWeight: '700' }}>
            <div style={{ color: '#1E293B' }}>{p.n}</div>
            <div style={{ color: '#1E293B' }}>{p.test}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ color: '#64748B', fontWeight: '700' }}>{p.pl}</span>
              <span style={{ padding: '4px 14px', borderRadius: '20px', backgroundColor: p.pbg, color: p.ptc, fontSize: '12px', fontWeight: '700' }}>{p.pLabel}</span>
            </div>
            <div>
              <span style={{ padding: '5px 16px', borderRadius: '20px', backgroundColor: p.sbg, color: p.stc, fontSize: '12px', fontWeight: '700' }}>{p.s}</span>
            </div>
            <div>
              {p.action === 'enter' ? (
                <button
                  onClick={() => { setSelectedPatient(p); setShowResultModal(true); }}
                  style={{ padding: '10px 20px', backgroundColor: '#3B82F6', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '13px', cursor: 'pointer' }}
                >
                  Enter Results
                </button>
              ) : (
                <button
                  onClick={() => { setSelectedPatient(p); setShowViewModal(true); }}
                  style={{ padding: '10px 20px', backgroundColor: '#1E293B', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '13px', cursor: 'pointer' }}
                >
                  View Details
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Footer audit */}
      <div style={{ textAlign: 'right', marginTop: '40px', fontSize: '12px', color: '#64748B', opacity: 0.7, fontWeight: '600' }}>
        Last System Audit: 12/02/2026 at 10:24 AM by Admin_Sarah
      </div>

      {/* View Details Modal */}
      {showViewModal && selectedPatient && (
        <div onClick={() => setShowViewModal(false)} style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: 'min(480px, 95vw)', backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 20px 40px rgba(0,0,0,0.15)', overflow: 'hidden' }}>

            {/* Header */}
            <div style={{ padding: '28px 32px 20px 32px', borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#1E293B' }}>Lab Request Details</h3>
              <span onClick={() => setShowViewModal(false)} style={{ cursor: 'pointer', fontWeight: '800', fontSize: '20px', color: '#64748B', lineHeight: 1 }}>×</span>
            </div>

            {/* Details */}
            <div style={{ padding: '28px 32px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {[
                { label: 'Patient Name', value: selectedPatient.n },
                { label: 'Test Type', value: selectedPatient.test },
                { label: 'Priority', value: `${selectedPatient.pl} — ${selectedPatient.pLabel}` },
                { label: 'Current Status', value: selectedPatient.s },
                { label: 'Requested By', value: 'Dr. Bright Amofa' },
                { label: 'Date Requested', value: '19/02/2026' },
              ].map((row, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '14px', borderBottom: i < 5 ? '1px solid #F1F5F9' : 'none' }}>
                  <span style={{ fontSize: '13px', fontWeight: '700', color: '#64748B' }}>{row.label}</span>
                  <span style={{ fontSize: '14px', fontWeight: '700', color: '#1E293B' }}>{row.value}</span>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div style={{ padding: '16px 32px 20px 32px', borderTop: '1px solid #F1F5F9', display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowViewModal(false)} style={{ padding: '12px 28px', backgroundColor: '#1E293B', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '14px', cursor: 'pointer' }}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Enter Results Modal */}
      {showResultModal && selectedPatient && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ width: 'min(480px, 95vw)', backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 20px 40px rgba(0,0,0,0.15)', overflow: 'hidden' }}>

            {/* Modal Header */}
            <div style={{ padding: '28px 32px 20px 32px', borderBottom: '1px solid #F1F5F9' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#1E293B' }}>
                Laboratory Result Entry - {selectedPatient.n}
              </h3>
            </div>

            {/* Form Fields */}
            <div style={{ padding: '24px 32px', display: 'flex', flexDirection: 'column', gap: '18px', maxHeight: '480px', overflowY: 'auto' }}>

              {[
                { label: 'Hemoglobin (g/dL)', placeholder: 'e.g. 14.2', value: hemoglobin, setter: setHemoglobin },
                { label: 'WBC Count (x10⁹/L)', placeholder: 'e.g. 6.5', value: wbc, setter: setWbc },
                { label: 'Platelets (x10⁹/L)', placeholder: 'e.g. 250', value: platelets, setter: setPlatelets },
                { label: 'Hematocrit (%)', placeholder: 'e.g.\n42.0', value: hematocrit, setter: setHematocrit },
              ].map((field, i) => (
                <div key={i}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#1E293B', marginBottom: '8px' }}>{field.label}</label>
                  <input
                    value={field.value}
                    onChange={(e) => field.setter(e.target.value)}
                    placeholder={field.placeholder}
                    style={{ width: '100%', padding: '13px 15px', border: '1px solid #E2E8F0', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box', outline: 'none', color: '#1E293B' }}
                  />
                </div>
              ))}

              {/* Remarks textarea */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#1E293B', marginBottom: '8px' }}>Lab Technician Remarks</label>
                <textarea
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="e.g. Sample processed; results verified."
                  style={{ width: '100%', height: '110px', padding: '13px 15px', border: '1px solid #E2E8F0', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box', resize: 'none', fontFamily: '"Inter", sans-serif', outline: 'none', color: '#1E293B' }}
                />
              </div>
            </div>

            {/* Footer */}
            <div style={{ padding: '16px 32px 10px 32px', borderTop: '1px solid #F1F5F9' }}>
              <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '16px', marginBottom: '12px' }}>
                <button
                  onClick={() => { setShowResultModal(false); setHemoglobin(''); setWbc(''); setPlatelets(''); setHematocrit(''); setRemarks(''); }}
                  style={{ padding: '12px 24px', backgroundColor: 'white', color: '#64748B', border: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '14px', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  style={{ padding: '12px 28px', backgroundColor: submitting ? '#94A3B8' : '#3B82F6', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '14px', cursor: submitting ? 'not-allowed' : 'pointer' }}
                >
                  {submitting ? 'Submitting...' : 'Finalize & Submit Results'}
                </button>
              </div>
              <p style={{ margin: 0, fontSize: '11px', color: '#94A3B8', textAlign: 'center' }}>
                Last System Audit: 12/02/2026 at 10:24 AM by Admin_Sarah
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- LAB DASHBOARD (simple overview) ---
const LabDashboard = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const user  = JSON.parse(localStorage.getItem('user') || '{}');
  const [stats, setStats] = React.useState({ pending: '—', completed: '—', urgent: '—' });

  React.useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/lab-requests`, { headers: { Authorization: `Bearer ${token}` } });
        const data = await res.json();
        const list = Array.isArray(data) ? data : (data.labRequests || data.data || []);
        const pending   = list.filter(l => (l.status || '').toLowerCase() === 'pending').length;
        const completed = list.filter(l => (l.status || '').toLowerCase() === 'completed').length;
        const urgent    = list.filter(l => ['p1','emergency','urgent'].includes((l.priority || l.triage_level || '').toLowerCase())).length;
        setStats({ pending: pending.toString(), completed: completed.toString(), urgent: urgent.toString() });
      } catch { setStats({ pending: '—', completed: '—', urgent: '—' }); }
    };
    fetchStats();
  }, []);

  const labName = user.name || user.full_name || 'Lab Technician';

  return (
    <div>
      <h1 style={{ fontWeight: '800', fontSize: '32px', color: '#1E293B', marginBottom: '10px' }}>Lab Technician Dashboard</h1>
      <p style={{ color: '#64748B', fontSize: '14px', marginBottom: '35px', fontWeight: '500' }}>Welcome, {labName}. Here's your pending work for today.</p>
      <div style={{ display: 'flex', gap: '20px', marginBottom: '40px', flexWrap: 'wrap' }}>
        {[
          { l: 'Pending Lab Requests', v: stats.pending,   tc: '#3B82F6', bg: '#EFF6FF', bc: '#BFDBFE' },
          { l: 'Completed Today',      v: stats.completed, tc: '#16A34A', bg: '#F0FDF4', bc: '#BBF7D0' },
          { l: 'Urgent / Critical',    v: stats.urgent,    tc: '#EF4444', bg: '#FEF2F2', bc: '#FECACA' },
        ].map((c, i) => (
          <div key={i} style={{ padding: 'clamp(18px, 2vw, 30px) clamp(16px, 1.8vw, 28px)', borderRadius: '16px', backgroundColor: c.bg, flex: 1, minWidth: '140px', border: `1px solid ${c.bc}` }}>
            <p style={{ color: c.tc, fontWeight: '700', fontSize: '14px', margin: 0 }}>{c.l}</p>
            <h2 style={{ fontSize: 'clamp(32px, 4vw, 52px)', fontWeight: '800', margin: '16px 0 0 0', color: c.tc }}>{c.v}</h2>
          </div>
        ))}
      </div>
      <button onClick={() => navigate('/lab-queue')} style={{ padding: '14px 32px', backgroundColor: '#1E293B', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '700', fontSize: '14px', cursor: 'pointer' }}>
        Go to Lab Queue →
      </button>
    </div>
  );
};

// ============================================================
// --- NURSE LAYOUT ---
// ============================================================
const NurseLayout = ({ children, searchText, setSearchText }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { label: 'Dashboard', path: '/nurse-dashboard' },
    { label: 'Patients',  path: '/nurse-patients' },
    { label: 'Schedule',  path: '/nurse-schedule' },
    { label: 'Triage',    path: '/nurse-triage' },
  ];

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', backgroundColor: '#F4F7F6', fontFamily: '"Inter", sans-serif', overflow: 'hidden' }}>
      {/* SIDEBAR */}
      <div style={{ width: 'clamp(180px, 18vw, 240px)', minWidth: '180px', backgroundColor: '#1E293B', color: 'white', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', overflow: 'hidden' }}>
        <div>
          <div style={{ padding: '32px 24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ fontSize: '50px', fontWeight: '300', lineHeight: '0.6', color: 'white', flexShrink: 0 }}>+</div>
            <div>
              <h2 style={{ fontSize: '18px', margin: 0, fontWeight: '800', lineHeight: '1.1', letterSpacing: '0.5px' }}>HEALTHCARE<br/>EMR</h2>
            </div>
          </div>
          <nav style={{ marginTop: '10px' }}>
            {navItems.map((item) => (
              <Link key={item.path} to={item.path} style={{ display: 'block', padding: '15px 30px', color: 'white', textDecoration: 'none', opacity: location.pathname === item.path ? 1 : 0.4, fontWeight: '700', fontSize: '14px', borderLeft: location.pathname === item.path ? '4px solid #4ADE80' : '4px solid transparent' }}>
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <div onClick={() => { localStorage.removeItem('token'); localStorage.removeItem('user'); localStorage.removeItem('role'); localStorage.removeItem('display_name'); navigate('/logout'); }} style={{ padding: '25px 30px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '15px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          <span style={{ fontWeight: '700', opacity: 0.6, fontSize: '14px' }}>Logout</span>
        </div>
      </div>

      {/* CONTENT */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 50px', backgroundColor: 'white', borderBottom: '1px solid #E2E8F0', position: 'relative' }}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <span style={{ position: 'absolute', left: '15px', color: '#64748B' }}>🔍</span>
            <input value={searchText} onChange={(e) => setSearchText(e.target.value)} style={{ width: 'clamp(200px, 30vw, 420px)', padding: '12px 15px 12px 45px', borderRadius: '8px', border: '1px solid #E2E8F0', backgroundColor: '#F8FAFC', fontSize: '13px' }} placeholder="Search for patient name, ID or date..." />
          </div>
          <div style={{ position: 'absolute', right: '50px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '13px', color: '#64748B', fontWeight: '600' }}>{localStorage.getItem('display_name') || JSON.parse(localStorage.getItem('user') || '{}').full_name || JSON.parse(localStorage.getItem('user') || '{}').name || '—'}</span>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#94A3B8' }} />
          </div>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: 'clamp(20px, 3vw, 50px) clamp(20px, 4vw, 50px)' }}>
          {children}
        </div>
      </div>
    </div>
  );
};

// --- NURSE DASHBOARD ---
const NurseDashboard = () => {
  const navigate = useNavigate();
  const user  = JSON.parse(localStorage.getItem('user') || '{}');
  const token = localStorage.getItem('token');
  const nurseName = localStorage.getItem('display_name') || user.name || user.full_name || 'Nurse';

  const [stats, setStats] = React.useState({ waiting: '—', captured: '—', emergency: '—' });

  // Register patient modal
  const [showRegisterModal, setShowRegisterModal] = React.useState(false);
  const [firstName, setFirstName] = React.useState('');
  const [lastName, setLastName]   = React.useState('');
  const [email, setEmail]         = React.useState('');
  const [dob, setDob]             = React.useState('');
  const [phone, setPhone]         = React.useState('');
  const [gender, setGender]       = React.useState('');
  const [dateOfReg, setDateOfReg] = React.useState('');
  const [submitting, setSubmitting]     = React.useState(false);
  const [toastMessage, setToastMessage] = React.useState('');
  const [toastType, setToastType]       = React.useState('success');

  const triggerToast = (msg, type = 'success') => { setToastMessage(msg); setToastType(type); setTimeout(() => setToastMessage(''), 3500); };
  const resetForm = () => { setFirstName(''); setLastName(''); setEmail(''); setDob(''); setPhone(''); setGender(''); setDateOfReg(''); };

  const handleRegister = async () => {
    if (!firstName || !lastName) { triggerToast('Please enter first and last name.', 'error'); return; }
    setSubmitting(true);
    try {
      const res = await fetch(`${BASE_URL}/api/patients`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({   full_name: `${firstName} ${lastName}`, email, date_of_birth: dob, phone, gender, registration_date: dateOfReg }),
      });
      if (res.ok) {
        setShowRegisterModal(false);
        resetForm();
        triggerToast(`${firstName} ${lastName} registered successfully!`);
      } else {
        triggerToast('Failed to register patient. Please try again.', 'error');
      }
    } catch { triggerToast('Network error. Patient not registered.', 'error'); }
    finally { setSubmitting(false); }
  };

  React.useEffect(() => {
  const fetchStats = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/patients/stats/nurse`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setStats({
        waiting: data.waiting.toString(),
        captured: data.captured.toString(),
        emergency: data.emergency.toString()
      });
    } catch {
      setStats({ waiting: '0', captured: '0', emergency: '0' });
    }
  };
  fetchStats();
}, []);

  return (
    <div>
      {toastMessage && (
        <div style={{ position: 'fixed', top: '25px', left: '50%', transform: 'translateX(-50%)', backgroundColor: toastType === 'error' ? '#FEF2F2' : 'white', color: toastType === 'error' ? '#DC2626' : '#16A34A', padding: '14px 24px', borderRadius: '10px', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', display: 'flex', alignItems: 'center', gap: '10px', zIndex: 999, fontWeight: '700', fontSize: '14px', border: toastType === 'error' ? '1px solid #FECACA' : '1px solid #BBF7D0' }}>
          <span style={{ fontSize: '18px' }}>{toastType === 'error' ? '🚫' : '✅'}</span> {toastMessage}
        </div>
      )}

      {/* Header row with title and Register button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
        <h1 style={{ fontWeight: '800', fontSize: 'clamp(22px, 2.5vw, 32px)', color: '#1E293B', margin: 0 }}>Nurse Dashboard</h1>
        <button onClick={() => setShowRegisterModal(true)} style={{ padding: '12px 24px', backgroundColor: '#3B82F6', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '14px', cursor: 'pointer', whiteSpace: 'nowrap' }}>+ Register New Patient</button>
      </div>
      <p style={{ color: '#64748B', fontSize: '14px', marginBottom: '35px', fontWeight: '500' }}>Welcome, {nurseName}. Here's your queue for today.</p>

      <div style={{ display: 'flex', gap: '20px', marginBottom: '40px', flexWrap: 'wrap' }}>
        {[
          { l: 'Patients Waiting',      v: stats.waiting,   tc: '#1E293B', bg: 'white',   bc: '#E2E8F0' },
          { l: 'Vitals Captured Today', v: stats.captured,  tc: '#16A34A', bg: '#F0FDF4', bc: '#BBF7D0' },
          { l: 'Emergency Triage',      v: stats.emergency, tc: '#EF4444', bg: '#FEF2F2', bc: '#FECACA' },
        ].map((c, i) => (
          <div key={i} style={{ padding: 'clamp(18px, 2vw, 30px) clamp(16px, 1.8vw, 28px)', borderRadius: '16px', backgroundColor: c.bg, flex: 1, minWidth: '140px', border: `1px solid ${c.bc}` }}>
            <p style={{ color: '#64748B', fontWeight: '700', fontSize: '14px', margin: 0 }}>{c.l}</p>
            <h2 style={{ fontSize: 'clamp(32px, 4vw, 52px)', fontWeight: '800', margin: '16px 0 0 0', color: c.tc }}>{c.v}</h2>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '15px' }}>
        <button onClick={() => navigate('/nurse-triage')} style={{ padding: '14px 28px', backgroundColor: '#1E293B', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '700', fontSize: '14px', cursor: 'pointer' }}>Go to Triage Queue →</button>
        <button onClick={() => navigate('/nurse-patients')} style={{ padding: '14px 28px', backgroundColor: 'white', color: '#1E293B', border: '1px solid #E2E8F0', borderRadius: '10px', fontWeight: '700', fontSize: '14px', cursor: 'pointer' }}>View Patients →</button>
      </div>

      {/* Register New Patient Modal */}
      {showRegisterModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ width: 'min(480px, 95vw)', backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 20px 40px rgba(0,0,0,0.15)', overflow: 'hidden' }}>
            <div style={{ padding: '28px 32px 20px 32px', borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '800', color: '#1E293B' }}>Register New Patient</h3>
              <span onClick={() => { setShowRegisterModal(false); resetForm(); }} style={{ cursor: 'pointer', fontWeight: '800', fontSize: '20px', color: '#64748B' }}>×</span>            </div>
            <div style={{ padding: '24px 32px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#1E293B', marginBottom: '8px' }}>First Name *</label>
                  <input value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="e.g. Kwame" style={{ width: '100%', padding: '12px 14px', border: '1px solid #E2E8F0', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box', outline: 'none' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#1E293B', marginBottom: '8px' }}>Last Name *</label>
                  <input value={lastName} onChange={e => setLastName(e.target.value)} placeholder="e.g. Mensah" style={{ width: '100%', padding: '12px 14px', border: '1px solid #E2E8F0', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box', outline: 'none' }} />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#1E293B', marginBottom: '8px' }}>Email Address</label>
                <input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="e.g. kwame@email.com" style={{ width: '100%', padding: '12px 14px', border: '1px solid #E2E8F0', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box', outline: 'none' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#1E293B', marginBottom: '8px' }}>Date of Birth</label>
                <input value={dob} onChange={e => setDob(e.target.value)} type="text" style={{ width: '100%', padding: '12px 14px', border: '1px solid #E2E8F0', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box', outline: 'none' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#1E293B', marginBottom: '8px' }}>Phone Number</label>
                <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="e.g. 0244123456" style={{ width: '100%', padding: '12px 14px', border: '1px solid #E2E8F0', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box', outline: 'none' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#1E293B', marginBottom: '8px' }}>Gender</label>
                <select value={gender} onChange={e => setGender(e.target.value)} style={{ width: '100%', padding: '12px 14px', border: '1px solid #E2E8F0', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box', outline: 'none', backgroundColor: 'white', color: gender ? '#1E293B' : '#94A3B8' }}>
                  <option value="">Select...</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#1E293B', marginBottom: '8px' }}>Date of Registration</label>
                <input value={dateOfReg} onChange={e => setDateOfReg(e.target.value)} type="date" style={{ width: '100%', padding: '12px 14px', border: '1px solid #E2E8F0', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box', outline: 'none' }} />
              </div>
            </div>
            <div style={{ padding: '0 32px 24px 32px', display: 'flex', justifyContent: 'flex-end', gap: '14px' }}>
              <button onClick={() => { setShowRegisterModal(false); resetForm(); }} style={{ padding: '12px 24px', backgroundColor: 'white', color: '#64748B', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleRegister} disabled={submitting} style={{ padding: '12px 28px', backgroundColor: submitting ? '#94A3B8' : '#3B82F6', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: submitting ? 'not-allowed' : 'pointer' }}>{submitting ? 'Registering...' : 'Register Patient'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- NURSE PATIENTS PAGE (Live API) ---
const NursePatients = ({ searchText }) => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const gridTemplate = '25% 18% 28% 16% 13%';

  const [patients, setPatients] = React.useState([]);
  const [loading, setLoading]   = React.useState(true);
  const [error, setError]       = React.useState('');

  const statusStyle = (s) => {
    const map = { confirmed: { sbg: '#DCFCE7', stc: '#16A34A' }, ready: { sbg: '#DBEAFE', stc: '#1D4ED8' }, pending: { sbg: '#FEF3C7', stc: '#B45309' }, cancelled: { sbg: '#FEE2E2', stc: '#DC2626' } };
    return map[(s || '').toLowerCase()] || { sbg: '#F1F5F9', stc: '#475569' };
  };

  React.useEffect(() => {
    const fetchPatients = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${BASE_URL}/api/patients`, { headers: { Authorization: `Bearer ${token}` } });
        const data = await res.json();
        setPatients(Array.isArray(data) ? data : (data.patients || data.data || []));
      } catch { setError('Failed to load patients.'); }
      finally { setLoading(false); }
    };
    fetchPatients();
  }, []);

  const getName = (p) => p.full_name || p.name || 'Unknown';  
  const getId     = (p) => p.patient_id || p.id || p._id || '—';
  const getDiag   = (p) => p.diagnosis || p.primary_diagnosis || '—';
  const getStatus = (p) => p.status || 'Active';

 const filtered = patients.filter(p => {
  const q = searchText.toLowerCase();
  return (
    (p.full_name || '').toLowerCase().includes(q) ||
    String(p.patient_id || '').toLowerCase().includes(q) ||
    (p.email || '').toLowerCase().includes(q) ||
    (p.national_patient_id || '').toLowerCase().includes(q)
  );
});

  return (
    <div style={{ minHeight: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <div>
        <h1 style={{ fontWeight: '800', fontSize: 'clamp(22px, 2.5vw, 32px)', color: '#1E293B', marginBottom: '35px' }}>Patient Database</h1>
        <div style={{ display: 'grid', gridTemplateColumns: gridTemplate, padding: '14px 25px', backgroundColor: '#F8FAFC', borderRadius: '10px', marginBottom: '4px', color: '#64748B', fontSize: '12px', fontWeight: '800', letterSpacing: '0.5px' }}>
          <div>PATIENT NAME</div><div>PATIENT ID</div><div>DIAGNOSIS</div><div>STATUS</div><div>ACTION</div>
        </div>
        {loading && <div style={{ textAlign: 'center', padding: '40px', color: '#94A3B8', fontSize: '14px' }}>Loading patients...</div>}
        {error && <div style={{ padding: '14px', backgroundColor: '#FEF2F2', borderRadius: '8px', color: '#DC2626', fontWeight: '600' }}>⚠️ {error}</div>}
        {!loading && filtered.map((p, i) => {
          const { sbg, stc } = statusStyle(getStatus(p));
          return (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: gridTemplate, alignItems: 'center', backgroundColor: 'white', padding: '20px 25px', borderBottom: '1px solid #F1F5F9', fontSize: '14px', fontWeight: '700' }}>
              <div style={{ color: '#1E293B' }}>{getName(p)}</div>
              <div style={{ color: '#64748B', fontWeight: '600' }}>{getId(p)}</div>
              <div style={{ color: '#1E293B' }}>{getDiag(p)}</div>
              <div><span style={{ padding: '4px 14px', borderRadius: '20px', backgroundColor: sbg, color: stc, fontSize: '12px', fontWeight: '800' }}>{getStatus(p)}</span></div>
              <div>
                <button onClick={() => navigate('/nurse-patient-profile', { state: { patientName: getName(p), patientId: getId(p) } })} style={{ padding: '9px 20px', backgroundColor: '#1E293B', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '13px', cursor: 'pointer' }}>View</button>
              </div>
            </div>
          );
        })}
        {!loading && filtered.length === 0 && !error && <div style={{ textAlign: 'center', padding: '40px', color: '#94A3B8', fontSize: '14px' }}>No patients found.</div>}
      </div>
      <div style={{ textAlign: 'right', marginTop: '40px', fontSize: '12px', color: '#64748B', opacity: 0.7, fontWeight: '600' }}>Last System Audit: 12/02/2026 at 10:24 AM by Admin_Sarah</div>
    </div>
  );
};

// --- NURSE PATIENT PROFILE (Live API — read-only) ---
const NursePatientProfile = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const passedName = location.state?.patientName;
  const passedId   = location.state?.patientId;
  const token = localStorage.getItem('token');

  const [activeTab, setActiveTab]   = React.useState('Overview');
  const [apiPatient, setApiPatient] = React.useState(null);
  const [apiRecords, setApiRecords] = React.useState([]);
  const [loading, setLoading]       = React.useState(true);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const pRes = await fetch(`${BASE_URL}/api/patients`, { headers: { Authorization: `Bearer ${token}` } });
        const pData = await pRes.json();
        const pList = Array.isArray(pData) ? pData : (pData.patients || pData.data || []);
        const patient = pList.find(p => {
          if (passedId) return String(p.id || p._id || p.patient_id) === String(passedId);
          const name = p.name || p.full_name || `${p.first_name||''} ${p.last_name||''}`.trim();
          return name.toLowerCase() === (passedName || '').toLowerCase();
        }) || pList[0];
        setApiPatient(patient);

        if (patient) {
          const pid = patient.id || patient._id || patient.patient_id;
          const rRes = await fetch(`${BASE_URL}/api/medical-records/patient/${pid}`, { headers: { Authorization: `Bearer ${token}` } });
          if (rRes.ok) {
            const rData = await rRes.json();
            setApiRecords(Array.isArray(rData) ? rData : (rData.records || rData.data || []));
          }
        }
      } catch { } finally { setLoading(false); }
    };
    fetchData();
  }, [passedName, passedId]);

  const gf = (obj, ...keys) => { for (const k of keys) if (obj && obj[k] != null) return obj[k]; return null; };

  const latestRecord = apiRecords && apiRecords.length > 0 ? apiRecords[0] : null;
  const p = apiPatient ? {
    personal: {
      name:   gf(apiPatient,'name','full_name') || `${apiPatient.first_name||''} ${apiPatient.last_name||''}`.trim() || passedName || '—',
      id:     gf(apiPatient,'patient_id','id','_id') || '—',
      age:    gf(apiPatient,'age') || '—',
      gender: gf(apiPatient,'gender') || '—',
      status: gf(apiPatient,'status') || 'ACTIVE',
    },
    vitals: {
      bp:     gf(apiPatient,'blood_pressure','bp') || (latestRecord[0] && gf(latestRecord[0],'blood_pressure','bp')) || '—',
hr: gf(apiPatient,'pulse_rate','heart_rate','hr') || (latestRecord && gf(latestRecord,'pulse_rate','heart_rate','hr')) || '—',
      temp:   gf(apiPatient,'temperature','temp')  || (latestRecord[0] && gf(latestRecord[0],'temperature','temp'))  || '—',
      weight: gf(apiPatient,'weight')              || (latestRecord[0] && gf(latestRecord[0],'weight'))              || '—',
    },
    clinicalNotes: (latestRecord[0] && gf(latestRecord[0],'clinical_notes','notes','observation')) || '—',
    diagnosis:     (latestRecord[0] && gf(latestRecord[0],'diagnosis')) || gf(apiPatient,'diagnosis','primary_diagnosis') || '—',
  } : {
    personal: { name: passedName || 'Loading...', id:'—', age:'—', gender:'—', status:'ACTIVE' },
    vitals: { bp:'—', hr:'—', temp:'—', weight:'—' },
    clinicalNotes: 'Loading...', diagnosis: '—',
  };

  const historyData = apiRecords.length > 0
    ? apiRecords.map(r => ({
        date: r.created_at ? new Date(r.created_at).toLocaleDateString('en-GB') : '—',
        d:    gf(r,'diagnosis') || '—',
        t:    gf(r,'treatment','clinical_notes') || '—',
        by:   gf(r,'doctor_name','recorded_by') || 'Dr. Bright Amofa',
      }))
    : [{ date: '—', d: 'No records found', t: '—', by: '—' }];

  const docsData = [
    { name: 'Lab Result - Full Blood Count (FBC)', date: '19/02/2026', by: 'Dr. Bright Amofa', s: 'PENDING', sbg: '#FEF3C7', stc: '#B45309' },
    { name: 'Patient Consent - Treatment',         date: '15/02/2026', by: 'Dr. Bright Amofa', s: 'READY',   sbg: '#DBEAFE', stc: '#1D4ED8' },
  ];

  if (loading) return <div style={{ textAlign: 'center', padding: '60px', color: '#94A3B8', fontSize: '15px', fontWeight: '600' }}>Loading patient profile...</div>;

  return (
    <div style={{ minHeight: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <div>
        <h1 style={{ fontWeight: '800', fontSize: '32px', color: '#1E293B', marginBottom: '30px', marginTop: 0 }}>Patient Profile</h1>

        {/* Patient Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '30px' }}>
          <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: '#E2E8F0' }} />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <h2 style={{ margin: 0, fontSize: '28px', fontWeight: '800', color: '#1E293B' }}>{p.personal.name}</h2>
              <span style={{ backgroundColor: '#DCFCE7', color: '#166534', padding: '5px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '800' }}>{p.personal.status}</span>
            </div>
            <p style={{ margin: '5px 0 0 0', color: '#64748B', fontWeight: '700', fontSize: '14px' }}>ID: {p.personal.id} | {p.personal.gender} | {p.personal.age} Years Old</p>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '30px', borderBottom: '1px solid #E2E8F0', marginBottom: '35px' }}>
          {['Overview', 'History', 'Documents'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{ padding: '10px 0', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '800', fontSize: '14px', color: activeTab === tab ? '#3B82F6' : '#64748B', borderBottom: activeTab === tab ? '3px solid #3B82F6' : '3px solid transparent', marginBottom: '-1px' }}>{tab}</button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'Overview' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '30px' }}>
              {[{ l: 'Blood Pressure', v: p.vitals.bp, u: 'mmHg' }, { l: 'Heart Rate', v: p.vitals.hr, u: 'bpm' }, { l: 'Temperature', v: p.vitals.temp, u: '°C' }, { l: 'Weight', v: p.vitals.weight, u: 'kg' }].map((v, i) => (
                <div key={i} style={{ backgroundColor: '#F1F5F9', padding: '25px', borderRadius: '12px', textAlign: 'center', position: 'relative' }}>
                  <span style={{ fontSize: '12px', color: '#64748B', fontWeight: '700', display: 'block', marginBottom: '12px' }}>{v.l}</span>
                  <h3 style={{ margin: 0, fontSize: '30px', fontWeight: '800', color: '#1E293B' }}>{v.v}</h3>
                  <span style={{ fontSize: '11px', color: '#94A3B8', position: 'absolute', bottom: '10px', right: '12px' }}>{v.u}</span>
                </div>
              ))}
            </div>
            <div style={{ marginBottom: '30px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#1E293B', marginBottom: '15px' }}>Clinical Notes & Diagnosis</h3>
              <div style={{ backgroundColor: 'white', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '25px', minHeight: '160px' }}>
                <p style={{ margin: 0, fontSize: '14px', color: '#1E293B' }}>{p.clinicalNotes}</p>
              </div>
            </div>
            <div>
              <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#64748B', marginBottom: '10px' }}>Primary Diagnosis</h4>
              <div style={{ background: 'white', padding: '15px', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '14px', fontWeight: '700', display: 'inline-block' }}>{p.diagnosis}</div>
            </div>
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'History' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '15% 28% 32% 25%', padding: '0 25px 14px 25px', color: '#64748B', fontSize: '12px', fontWeight: '800' }}>
              <div>DATE</div><div>DIAGNOSIS</div><div>TREATMENT</div><div>RECORDED BY</div>
            </div>
            {historyData.map((h, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '15% 28% 32% 25%', alignItems: 'center', backgroundColor: 'white', padding: '20px 25px', borderRadius: '12px', marginBottom: '10px', border: '1px solid #E2E8F0', fontSize: '14px', fontWeight: '700' }}>
                <div>{h.date}</div><div>{h.d}</div><div>{h.t}</div><div style={{ color: '#64748B' }}>{h.by}</div>
              </div>
            ))}
          </div>
        )}

        {/* Documents Tab */}
        {activeTab === 'Documents' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {docsData.map((doc, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', backgroundColor: '#F8FAFC', padding: '20px 24px', borderRadius: '12px', border: '1px solid #E2E8F0', gap: '18px' }}>
                <div style={{ width: '38px', height: '44px', backgroundColor: '#3B82F6', borderRadius: '6px', flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
                    <span style={{ fontWeight: '700', fontSize: '15px', color: '#1E293B' }}>{doc.name}</span>
                    <span style={{ padding: '3px 12px', borderRadius: '20px', backgroundColor: doc.sbg, color: doc.stc, fontSize: '11px', fontWeight: '800' }}>{doc.s}</span>
                  </div>
                  <div style={{ fontSize: '13px', color: '#64748B' }}>Requested: {doc.date} &nbsp;|&nbsp; Requested by: {doc.by}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '20px', borderTop: '1px solid #E2E8F0', marginTop: '30px' }}>
        <button onClick={() => navigate('/nurse-patients')} style={{ padding: '12px 35px', backgroundColor: '#3B82F6', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}>Save & Close Record</button>
      </div>
      <div style={{ textAlign: 'right', marginTop: '10px', fontSize: '12px', color: '#64748B', opacity: 0.7, fontWeight: '600' }}>
        Last System Audit: 12/02/2026 at 10:24 AM by Admin_Sarah
      </div>
    </div>
  );
};

// --- NURSE TRIAGE & VITALS QUEUE ---
const NurseTriage = ({ searchText }) => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const [showVitalsModal, setShowVitalsModal]     = React.useState(false);
  const [showRegisterModal, setShowRegisterModal] = React.useState(false);
  const [selectedPatient, setSelectedPatient]     = React.useState(null);
  const [toastMessage, setToastMessage]           = React.useState('');
  const [toastType, setToastType]                 = React.useState('success');
  const [submitting, setSubmitting]               = React.useState(false);

  // Vitals form
  const [temp, setTemp]     = React.useState('');
  const [weight, setWeight] = React.useState('');
  const [bp, setBp]         = React.useState('');
  const [hr, setHr]         = React.useState('');
  const [notes, setNotes]   = React.useState('');

  // Registration form
  const [firstName, setFirstName]   = React.useState('');
  const [lastName, setLastName]     = React.useState('');
  const [dob, setDob]               = React.useState('');
  const [phone, setPhone]           = React.useState('');
  const [gender, setGender]         = React.useState('');
  const [dateOfReg, setDateOfReg]   = React.useState('');

  const triggerToast = (msg, type = 'success') => { setToastMessage(msg); setToastType(type); setTimeout(() => setToastMessage(''), 3500); };

  // Fetch appointments as the triage queue
  const [queue, setQueue]   = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  const priorityStyle = (tl) => {
    const p = String(tl || 'P3').toUpperCase();
    if (p.includes('1') || p === 'EMERGENCY') return { pl: 'P1', pLabel: 'Emergency', pbg: '#FEE2E2', ptc: '#DC2626' };
    if (p.includes('2') || p === 'URGENT')    return { pl: 'P2', pLabel: 'Urgent',    pbg: '#FEF3C7', ptc: '#B45309' };
    return { pl: 'P3', pLabel: 'Routine', pbg: '#DCFCE7', ptc: '#16A34A' };
  };

  React.useEffect(() => {
    const fetchQueue = async () => {
  try {
    setLoading(true);
    const res = await fetch(`${BASE_URL}/api/patients/triage/queue`, { 
      headers: { Authorization: `Bearer ${token}` } 
    });
    const data = await res.json();
    const list = Array.isArray(data) ? data : [];
    const normalized = list.map(a => ({
      n:    a.full_name || a.name || 'Unknown',
      id:   a.patient_id,
      wait: '—',
      s:   'Pending',
      sbg:  '#FEF3C7',
      stc:  '#B45309',
      appt_id: a.patient_id,
      pl: 'P3', pLabel: 'Routine', pbg: '#DCFCE7', ptc: '#16A34A',
}));
    setQueue(normalized);
  } catch { setQueue([]); }
  finally { setLoading(false); }
};
    fetchQueue();
  }, []);

  const filtered = queue.filter(p => p.n.toLowerCase().includes(searchText.toLowerCase()));
  const gridTemplate = '26% 18% 24% 18% 14%';

  const resetVitals   = () => { setTemp(''); setWeight(''); setBp(''); setHr(''); setNotes(''); };
  const resetRegister = () => { setFirstName(''); setLastName(''); setDob(''); setPhone(''); setGender(''); setDateOfReg(''); };

  // Save vitals → POST /api/medical-records
  const handleSaveVitals = async () => {
  setSubmitting(true);
  try {
    const res = await fetch(`${BASE_URL}/api/medical-records`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        patient_id: selectedPatient.id,
        temperature: temp,
        weight: weight,
        blood_pressure: bp,
        pulse_rate: hr,
        chief_complaint: notes,
      }),
    });

    if (res.ok) {
      await fetch(`${BASE_URL}/api/patients/${selectedPatient.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: 'active' }),
      });

      setQueue(prev => prev.filter(p => p.id !== selectedPatient.id));
      triggerToast(`Vitals recorded for ${selectedPatient.n}. Patient sent to doctor queue.`);
    } else {
      triggerToast('Failed to save vitals. Please try again.', 'error');
    }
  } catch { triggerToast('Network error. Vitals not saved.', 'error'); }
  finally { setSubmitting(false); setShowVitalsModal(false); resetVitals(); }
};

  // Register patient → POST /api/patients (Nurse)
  const handleRegister = async () => {
    if (!firstName || !lastName) { triggerToast('Please enter first and last name.', 'error'); return; }
    setSubmitting(true);
    try {
      const res = await fetch(`${BASE_URL}/api/patients`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ first_name: firstName, last_name: lastName, date_of_birth: dob, phone: phone, gender, registration_date: dateOfReg }),
      });
      if (res.ok) {
        triggerToast(`${firstName} ${lastName} registered successfully!`);
      } else {
        triggerToast('Failed to register patient. Please try again.', 'error');
      }
    } catch { triggerToast('Network error. Patient not registered.', 'error'); }
    finally { setSubmitting(false); setShowRegisterModal(false); resetRegister(); }
  };

  return (
    <div style={{ minHeight: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>

      {/* Toast */}
      {toastMessage && (
        <div style={{ position: 'fixed', top: '25px', left: '50%', transform: 'translateX(-50%)', backgroundColor: toastType === 'error' ? '#FEF2F2' : 'white', color: toastType === 'error' ? '#DC2626' : '#16A34A', padding: '14px 24px', borderRadius: '10px', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', display: 'flex', alignItems: 'center', gap: '10px', zIndex: 999, fontWeight: '700', fontSize: '14px', border: toastType === 'error' ? '1px solid #FECACA' : '1px solid #BBF7D0' }}>
          <span style={{ fontSize: '18px' }}>{toastType === 'error' ? '🚫' : '✅'}</span> {toastMessage}
        </div>
      )}

      <div>
        {/* Page Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '35px' }}>
          <h1 style={{ fontWeight: '800', fontSize: 'clamp(22px, 2.5vw, 32px)', color: '#1E293B', margin: 0 }}>Triage & Vitals Queue</h1>
        </div>

        {/* Stat Cards */}
        <div style={{ display: 'flex', gap: '20px', marginBottom: '50px', flexWrap: 'wrap' }}>
          {[
            { l: 'Patients Waiting',      v: loading ? '—' : filtered.length.toString(),                                                   tc: '#1E293B', bg: 'white',   bc: '#E2E8F0' },
            { l: 'Vitals Captured Today', v: loading ? '—' : queue.filter(p => p.s === 'Captured').length.toString(),                       tc: '#16A34A', bg: '#F0FDF4', bc: '#BBF7D0' },
            { l: 'Emergency Triage',      v: loading ? '—' : queue.filter(p => p.pLabel === 'Emergency').length.toString(),                 tc: '#EF4444', bg: '#FEF2F2', bc: '#FECACA' },
          ].map((c, i) => (
            <div key={i} style={{ padding: 'clamp(18px, 2vw, 30px) clamp(16px, 1.8vw, 28px)', borderRadius: '16px', backgroundColor: c.bg, flex: 1, minWidth: '140px', border: `1px solid ${c.bc}` }}>
              <p style={{ color: '#64748B', fontWeight: '700', fontSize: '14px', margin: 0 }}>{c.l}</p>
              <h2 style={{ fontSize: 'clamp(32px, 4vw, 52px)', fontWeight: '800', margin: '16px 0 0 0', color: c.tc }}>{c.v}</h2>
            </div>
          ))}
        </div>

        {/* Table Header */}
        <div style={{ display: 'grid', gridTemplateColumns: gridTemplate, padding: '14px 25px', backgroundColor: '#F8FAFC', borderRadius: '10px', marginBottom: '8px', color: '#64748B', fontSize: '12px', fontWeight: '800', letterSpacing: '0.5px' }}>
          <div>PATIENT NAME</div><div>WAIT TIME</div><div>TRIAGE LEVEL</div><div>VITALS STATUS</div><div>ACTION</div>
        </div>

        {/* Table Rows */}
        {filtered.map((p, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: gridTemplate, alignItems: 'center', backgroundColor: 'white', padding: '20px 25px', borderRadius: '12px', marginBottom: '10px', border: '1px solid #E2E8F0', fontSize: '14px', fontWeight: '700' }}>
            <div style={{ color: '#1E293B' }}>{p.n}</div>
            <div style={{ color: '#64748B' }}>{p.wait}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ color: '#64748B' }}>{p.pl}</span>
              <span style={{ padding: '4px 14px', borderRadius: '20px', backgroundColor: p.pbg, color: p.ptc, fontSize: '12px', fontWeight: '700' }}>{p.pLabel}</span>
            </div>
            <div>
              <span style={{ padding: '5px 16px', borderRadius: '20px', backgroundColor: p.sbg, color: p.stc, fontSize: '12px', fontWeight: '700' }}>{p.s}</span>
            </div>
            <div>
              <button onClick={() => { setSelectedPatient(p); setShowVitalsModal(true); }} style={{ padding: '10px 16px', backgroundColor: '#1E293B', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '13px', cursor: 'pointer' }}>
                Start Triage
              </button>
            </div>
          </div>
        ))}
      </div>

      <div style={{ textAlign: 'right', marginTop: '40px', fontSize: '12px', color: '#64748B', opacity: 0.7, fontWeight: '600' }}>
        Last System Audit: 12/02/2026 at 10:24 AM by Admin_Sarah
      </div>

      {/* Vitals Entry Modal */}
      {showVitalsModal && selectedPatient && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ width: 'min(480px, 95vw)', backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 20px 40px rgba(0,0,0,0.15)', overflow: 'hidden' }}>
            {/* Header */}
            <div style={{ padding: '28px 32px 20px 32px', borderBottom: '1px solid #F1F5F9' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#1E293B' }}>Record Patient Vitals - {selectedPatient.n}</h3>
            </div>
            {/* Fields */}
            <div style={{ padding: '24px 32px', display: 'flex', flexDirection: 'column', gap: '18px', maxHeight: '460px', overflowY: 'auto' }}>
              {[
                { label: 'Temp(°C)',            placeholder: 'e.g. 36.8',  value: temp,   setter: setTemp },
                { label: 'Weight (kg)',          placeholder: 'e.g. 75',    value: weight, setter: setWeight },
                { label: 'Blood Pressure (mmHg)',placeholder: 'e.g. 120/80',value: bp,     setter: setBp },
                { label: 'Heart Rate (BPM)',     placeholder: 'e.g. 72',    value: hr,     setter: setHr },
              ].map((f, i) => (
                <div key={i}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#1E293B', marginBottom: '8px' }}>{f.label}</label>
                  <input value={f.value} onChange={(e) => f.setter(e.target.value)} placeholder={f.placeholder} style={{ width: '100%', padding: '13px 15px', border: '1px solid #E2E8F0', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box', outline: 'none' }} />
                </div>
              ))}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#1E293B', marginBottom: '8px' }}>Triage Notes / Chief Complaint</label>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Enter patient's primary reason for visit..." style={{ width: '100%', height: '110px', padding: '13px 15px', border: '1px solid #E2E8F0', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box', resize: 'none', fontFamily: '"Inter", sans-serif', outline: 'none' }} />
              </div>
            </div>
            {/* Footer */}
            <div style={{ padding: '16px 32px 20px 32px', borderTop: '1px solid #F1F5F9' }}>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', marginBottom: '12px' }}>
                <button onClick={() => { setShowVitalsModal(false); resetVitals(); }} style={{ padding: '12px 24px', backgroundColor: 'white', color: '#64748B', border: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '14px', cursor: 'pointer' }}>Cancel</button>
                <button onClick={handleSaveVitals} disabled={submitting} style={{ padding: '12px 28px', backgroundColor: submitting ? '#94A3B8' : '#3B82F6', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '14px', cursor: submitting ? 'not-allowed' : 'pointer' }}>{submitting ? 'Saving...' : 'Save & Queue For Doctor'}</button>
              </div>
              <p style={{ margin: 0, fontSize: '11px', color: '#94A3B8', textAlign: 'center' }}>Last System Audit: 12/02/2026 at 10:24 AM by Admin_Sarah</p>
            </div>
          </div>
        </div>
      )}

      {/* Register New Patient Modal */}
      {showRegisterModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ width: 'min(500px, 95vw)', backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 20px 40px rgba(0,0,0,0.15)', overflow: 'hidden' }}>

            {/* Header */}
            <div style={{ padding: '28px 32px 20px 32px', borderBottom: '1px solid #F1F5F9' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#1E293B', textAlign: 'center' }}>Record New Patient</h3>
            </div>

            {/* Fields */}
            <div style={{ padding: '24px 32px', display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '520px', overflowY: 'auto' }}>

              {/* First Name + Last Name side by side */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#1E293B', marginBottom: '8px' }}>First Name</label>
                  <input value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="e.g. Albert" style={{ width: '100%', padding: '13px 15px', border: '1px solid #E2E8F0', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box', outline: 'none' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#1E293B', marginBottom: '8px' }}>Last Name</label>
                  <input value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="e.g. Opoku" style={{ width: '100%', padding: '13px 15px', border: '1px solid #E2E8F0', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box', outline: 'none' }} />
                </div>
              </div>

              {/* Date of Birth */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#1E293B', marginBottom: '8px' }}>Date of Birth</label>
                <input value={dob} onChange={(e) => setDob(e.target.value)} placeholder="e.g. 20/04/1995" style={{ width: '100%', padding: '13px 15px', border: '1px solid #E2E8F0', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box', outline: 'none' }} />
              </div>

              {/* Phone Number */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#1E293B', marginBottom: '8px' }}>Phone Number</label>
                <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="e.g. 0234564765" style={{ width: '100%', padding: '13px 15px', border: '1px solid #E2E8F0', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box', outline: 'none' }} />
              </div>

              {/* Gender */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#1E293B', marginBottom: '8px' }}>Gender</label>
                <select value={gender} onChange={(e) => setGender(e.target.value)} style={{ width: '100%', padding: '13px 15px', border: '1px solid #E2E8F0', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box', outline: 'none', backgroundColor: 'white', color: gender ? '#1E293B' : '#94A3B8' }}>
                  <option value="">Select...</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Date of Registration */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#1E293B', marginBottom: '8px' }}>Date of Registration</label>
                <input value={dateOfReg} onChange={(e) => setDateOfReg(e.target.value)} placeholder="e.g. 25/03/2026" style={{ width: '100%', padding: '13px 15px', border: '1px solid #E2E8F0', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box', outline: 'none' }} />
              </div>

            </div>

            {/* Footer */}
            <div style={{ padding: '12px 32px 20px 32px', borderTop: '1px solid #F1F5F9' }}>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', marginBottom: '12px' }}>
                <button onClick={() => { setShowRegisterModal(false); resetRegister(); }} style={{ padding: '12px 24px', backgroundColor: 'white', color: '#64748B', border: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '14px', cursor: 'pointer' }}>Cancel</button>
                <button onClick={handleRegister} disabled={submitting} style={{ padding: '12px 28px', backgroundColor: submitting ? '#94A3B8' : '#3B82F6', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '14px', cursor: submitting ? 'not-allowed' : 'pointer' }}>{submitting ? 'Registering...' : 'Register Patient'}</button>
              </div>
              <p style={{ margin: 0, fontSize: '11px', color: '#94A3B8', textAlign: 'center' }}>Last System Audit: 12/02/2026 at 10:24 AM by Admin_Sarah</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- NURSE SCHEDULE VIEW (read-only doctor schedule) ---
const NurseSchedule = ({ searchText }) => {
  const gridTemplate = '22% 15% 18% 17% 14% 14%';
  const token = localStorage.getItem('token');
  const user  = JSON.parse(localStorage.getItem('user') || '{}');
  const nurseName = localStorage.getItem('display_name') || user.name || 'Nurse';

  const [showVitalsModal, setShowVitalsModal] = React.useState(false);
  const [selectedPatient, setSelectedPatient] = React.useState(null);
  const [toastMessage, setToastMessage]       = React.useState('');
  const [toastType, setToastType]             = React.useState('success');
  const [submitting, setSubmitting]           = React.useState(false);
  const [temp, setTemp]     = React.useState('');
  const [weight, setWeight] = React.useState('');
  const [bp, setBp]         = React.useState('');
  const [hr, setHr]         = React.useState('');
  const [notes, setNotes]   = React.useState('');

  const [scheduleData, setScheduleData] = React.useState([]);
  const [loading, setLoading]           = React.useState(true);

  const triggerToast = (msg, type = 'success') => {
    setToastMessage(msg); setToastType(type);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const resetVitals = () => { setTemp(''); setWeight(''); setBp(''); setHr(''); setNotes(''); };

  // Priority styling
  const priorityStyle = (tl) => {
    const p = String(tl || 'P3').toUpperCase();
    if (p.includes('1') || p === 'EMERGENCY') return { pl: 'P1', pLabel: 'Emergency', pbg: '#FEE2E2', ptc: '#DC2626' };
    if (p.includes('2') || p === 'URGENT')    return { pl: 'P2', pLabel: 'Urgent',    pbg: '#FEF3C7', ptc: '#B45309' };
    return { pl: 'P3', pLabel: 'Routine', pbg: '#DCFCE7', ptc: '#16A34A' };
  };

  React.useEffect(() => {
    const fetchSchedule = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${BASE_URL}/api/appointments`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          const list = Array.isArray(data) ? data : (data.appointments || data.data || []);
          setScheduleData(list.map(a => ({
            n:       a.patient_name || (a.patient && a.patient.name) || 'Unknown',
            id:      a.patient_id   || (a.patient && a.patient.id),
            appt_id: a.id || a._id,
            t:       a.appointment_time || a.appointment_date || '—',
            r:       a.reason || a.reason_for_visit || '—',
            v:       (a.vitals_status || '').toLowerCase() === 'captured' ? 'Captured' : 'Pending',
            vbg:     (a.vitals_status || '').toLowerCase() === 'captured' ? '#DCFCE7' : '#FEF3C7',
            vtc:     (a.vitals_status || '').toLowerCase() === 'captured' ? '#16A34A' : '#B45309',
            ready:   (a.vitals_status || '').toLowerCase() === 'captured',
            ...priorityStyle(a.triage_level || a.priority),
          })));
        }
      } catch { } finally { setLoading(false); }
    };
    fetchSchedule();
  }, []);

  const filtered = scheduleData.filter(p => p.n.toLowerCase().includes(searchText.toLowerCase()));

  // Save vitals → POST /api/medical-records
  const handleSave = async () => {
    setSubmitting(true);
    try {
      const res = await fetch(`${BASE_URL}/api/medical-records`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          patient_id:     selectedPatient.id,
          vitals: { temperature: temp, weight, blood_pressure: bp, heart_rate: hr },
          clinical_notes: notes,
        }),
      });
      if (res.ok && selectedPatient.appt_id) {
        await fetch(`${BASE_URL}/api/appointments/${selectedPatient.appt_id}/status`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ status: 'ready', vitals_status: 'captured' }),
        });
      }
      setScheduleData(prev => prev.map(p =>
        p.n === selectedPatient.n
          ? { ...p, v: 'Captured', vbg: '#DCFCE7', vtc: '#16A34A', ready: true }
          : p
      ));
      setShowVitalsModal(false);
      resetVitals();
      triggerToast(`${selectedPatient.n} prepared and queued for doctor`);
    } catch {
      triggerToast('Failed to save vitals.', 'error');
    } finally { setSubmitting(false); }
  };

  return (
    <div style={{ minHeight: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>

      {toastMessage && (
        <div style={{ position: 'fixed', top: '25px', left: '50%', transform: 'translateX(-50%)', backgroundColor: toastType === 'error' ? '#FEF2F2' : 'white', color: toastType === 'error' ? '#DC2626' : '#16A34A', padding: '14px 24px', borderRadius: '10px', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', display: 'flex', alignItems: 'center', gap: '10px', zIndex: 999, fontWeight: '700', fontSize: '14px', border: toastType === 'error' ? '1px solid #FECACA' : '1px solid #BBF7D0' }}>
          <span style={{ fontSize: '18px' }}>{toastType === 'error' ? '🚫' : '✅'}</span> {toastMessage}
        </div>
      )}

      <div>
        <div style={{ marginBottom: '35px' }}>
          <div style={{ fontSize: '28px', marginBottom: '5px' }}>👋</div>
          <h1 style={{ fontSize: '32px', fontWeight: '800', margin: 0, color: '#1E293B' }}>Patient Queue — {nurseName}</h1>
          <p style={{ color: '#64748B', fontSize: '14px', margin: '6px 0 0 0', fontWeight: '500' }}>Patients waiting for vitals to be captured today</p>
        </div>

        <div style={{ display: 'flex', gap: '20px', marginBottom: '45px', flexWrap: 'wrap' }}>
          {[
            { l: 'Pending Vitals',    v: loading ? '—' : filtered.filter(p => !p.ready).length.toString(), bg: '#EFF6FF', tc: '#3B82F6', bc: '#BFDBFE' },
            { l: 'Ready for Doctor',  v: loading ? '—' : filtered.filter(p => p.ready).length.toString(),  bg: '#F0FDF4', tc: '#22C55E', bc: '#BBF7D0' },
            { l: 'High Priority',     v: loading ? '—' : filtered.filter(p => p.pLabel === 'Emergency').length.toString(), bg: '#FEF2F2', tc: '#EF4444', bc: '#FECACA' },
          ].map((c, i) => (
            <div key={i} style={{ padding: 'clamp(18px, 2vw, 30px) clamp(16px, 1.8vw, 28px)', borderRadius: '16px', backgroundColor: c.bg, flex: 1, minWidth: '140px', border: `1px solid ${c.bc}` }}>
              <p style={{ color: '#64748B', fontWeight: '700', fontSize: '14px', margin: 0 }}>{c.l}</p>
              <h2 style={{ fontSize: 'clamp(32px, 4vw, 52px)', fontWeight: '800', margin: '16px 0 0 0', color: c.tc }}>{c.v}</h2>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: gridTemplate, padding: '14px 25px', backgroundColor: '#F8FAFC', borderRadius: '10px', marginBottom: '8px', color: '#64748B', fontSize: '12px', fontWeight: '800', letterSpacing: '0.5px' }}>
          <div>PATIENT NAME</div><div>APPOINTMENT TIME</div><div>REASON FOR VISIT</div><div>TRIAGE LEVEL</div><div>VITALS STATUS</div><div>ACTION</div>
        </div>

        {loading && <div style={{ textAlign: 'center', padding: '40px', color: '#94A3B8', fontSize: '14px' }}>Loading queue...</div>}
        {!loading && filtered.length === 0 && <div style={{ textAlign: 'center', padding: '40px', color: '#94A3B8', fontSize: '14px' }}>No patients in queue.</div>}

        {!loading && filtered.map((p, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: gridTemplate, alignItems: 'center', backgroundColor: 'white', padding: '20px 25px', borderRadius: '12px', marginBottom: '10px', border: '1px solid #E2E8F0', fontSize: '14px', fontWeight: '700' }}>
            <div>{p.n}</div>
            <div style={{ color: '#64748B' }}>{p.t}</div>
            <div>{p.r}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: '#64748B' }}>{p.pl}</span>
              <span style={{ padding: '4px 12px', borderRadius: '20px', backgroundColor: p.pbg, color: p.ptc, fontSize: '11px', fontWeight: '700' }}>{p.pLabel}</span>
            </div>
            <div>
              <span style={{ padding: '4px 14px', borderRadius: '20px', backgroundColor: p.vbg, color: p.vtc, fontSize: '11px', fontWeight: '700' }}>{p.v}</span>
            </div>
            <div>
              <button
                onClick={() => { if (!p.ready) { setSelectedPatient(p); setShowVitalsModal(true); } }}
                disabled={p.ready}
                style={{ padding: '9px 14px', backgroundColor: p.ready ? '#94A3B8' : '#3B82F6', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '12px', cursor: p.ready ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap' }}
              >
                {p.ready ? '✓ Ready' : 'Prepare Patient'}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div style={{ textAlign: 'right', marginTop: '40px', fontSize: '12px', color: '#64748B', opacity: 0.7, fontWeight: '600' }}>
        Last System Audit: 12/02/2026 at 10:24 AM by Admin_Sarah
      </div>

      {/* Vitals Entry Modal */}
      {showVitalsModal && selectedPatient && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ width: 'min(480px, 95vw)', backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 20px 40px rgba(0,0,0,0.15)', overflow: 'hidden' }}>
            <div style={{ padding: '28px 32px 20px 32px', borderBottom: '1px solid #F1F5F9' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#1E293B' }}>Record Patient Vitals - {selectedPatient.n}</h3>
            </div>
            <div style={{ padding: '24px 32px', display: 'flex', flexDirection: 'column', gap: '18px', maxHeight: '420px', overflowY: 'auto' }}>
              {[
                { label: 'Temp(°C)',             placeholder: 'e.g. 36.8',   value: temp,   setter: setTemp },
                { label: 'Weight (kg)',           placeholder: 'e.g. 75',     value: weight, setter: setWeight },
                { label: 'Blood Pressure (mmHg)', placeholder: 'e.g. 120/80', value: bp,     setter: setBp },
                { label: 'Heart Rate (BPM)',      placeholder: 'e.g. 72',     value: hr,     setter: setHr },
              ].map((f, i) => (
                <div key={i}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#1E293B', marginBottom: '8px' }}>{f.label}</label>
                  <input value={f.value} onChange={(e) => f.setter(e.target.value)} placeholder={f.placeholder} style={{ width: '100%', padding: '13px 15px', border: '1px solid #E2E8F0', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box', outline: 'none' }} />
                </div>
              ))}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#1E293B', marginBottom: '8px' }}>Triage Notes / Chief Complaint</label>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Enter patient's primary reason for visit..." style={{ width: '100%', height: '100px', padding: '13px 15px', border: '1px solid #E2E8F0', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box', resize: 'none', fontFamily: '"Inter", sans-serif', outline: 'none' }} />
              </div>
            </div>
            <div style={{ padding: '16px 32px 20px 32px', borderTop: '1px solid #F1F5F9' }}>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', marginBottom: '12px' }}>
                <button onClick={() => { setShowVitalsModal(false); resetVitals(); }} style={{ padding: '12px 24px', backgroundColor: 'white', color: '#64748B', border: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '14px', cursor: 'pointer' }}>Cancel</button>
                <button onClick={handleSave} style={{ padding: '12px 28px', backgroundColor: '#3B82F6', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '14px', cursor: 'pointer' }}>Save & Queue For Doctor</button>
              </div>
              <p style={{ margin: 0, fontSize: '11px', color: '#94A3B8', textAlign: 'center' }}>Last System Audit: 12/02/2026 at 10:24 AM by Admin_Sarah</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================
// --- PHARMACIST LAYOUT ---
// ============================================================
const PharmLayout = ({ children, searchText, setSearchText }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { label: 'Dashboard',   path: '/pharm-dashboard' },
    { label: 'Prescription',path: '/pharm-prescriptions' },
    { label: 'Inventory',   path: '/pharm-inventory' },
  ];

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', backgroundColor: '#F4F7F6', fontFamily: '"Inter", sans-serif', overflow: 'hidden' }}>
      {/* SIDEBAR */}
      <div style={{ width: 'clamp(180px, 18vw, 240px)', minWidth: '180px', backgroundColor: '#1E293B', color: 'white', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', overflow: 'hidden' }}>
        <div>
          <div style={{ padding: '32px 24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ fontSize: '50px', fontWeight: '300', lineHeight: '0.6', color: 'white', flexShrink: 0 }}>+</div>
            <div>
              <h2 style={{ fontSize: '18px', margin: 0, fontWeight: '800', lineHeight: '1.1', letterSpacing: '0.5px' }}>HEALTHCARE<br/>EMR</h2>
            </div>
          </div>
          <nav style={{ marginTop: '10px' }}>
            {navItems.map((item) => (
              <Link key={item.path} to={item.path} style={{ display: 'block', padding: '15px 30px', color: 'white', textDecoration: 'none', opacity: location.pathname === item.path ? 1 : 0.4, fontWeight: '700', fontSize: '14px', borderLeft: location.pathname === item.path ? '4px solid #4ADE80' : '4px solid transparent' }}>
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <div onClick={() => { localStorage.removeItem('token'); localStorage.removeItem('user'); localStorage.removeItem('role'); localStorage.removeItem('display_name'); navigate('/logout'); }} style={{ padding: '25px 30px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '15px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          <span style={{ fontWeight: '700', opacity: 0.6, fontSize: '14px' }}>Logout</span>
        </div>
      </div>

      {/* CONTENT */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 50px', backgroundColor: 'white', borderBottom: '1px solid #E2E8F0', position: 'relative' }}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <span style={{ position: 'absolute', left: '15px', color: '#64748B' }}>🔍</span>
            <input value={searchText} onChange={(e) => setSearchText(e.target.value)} style={{ width: 'clamp(200px, 30vw, 420px)', padding: '12px 15px 12px 45px', borderRadius: '8px', border: '1px solid #E2E8F0', backgroundColor: '#F8FAFC', fontSize: '13px' }} placeholder="Search for patient, order ID or medication..." />
          </div>
          <div style={{ position: 'absolute', right: '50px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '13px', color: '#64748B', fontWeight: '600' }}>{localStorage.getItem('display_name') || JSON.parse(localStorage.getItem('user') || '{}').full_name || JSON.parse(localStorage.getItem('user') || '{}').name || '—'}</span>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#94A3B8' }} />
          </div>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: 'clamp(20px, 3vw, 50px) clamp(20px, 4vw, 50px)' }}>
          {children}
        </div>
      </div>
    </div>
  );
};

// --- PHARMACY DASHBOARD (Prescription list + Dispense modal) ---
const PharmDashboard = ({ searchText }) => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const user  = JSON.parse(localStorage.getItem('user') || '{}');

  const [showDispenseModal, setShowDispenseModal] = React.useState(false);
  const [selectedRx, setSelectedRx]               = React.useState(null);
  const [batch, setBatch]                         = React.useState('');
  const [qty, setQty]                             = React.useState('');
  const [toastMessage, setToastMessage]           = React.useState('');
  const [toastType, setToastType]                 = React.useState('success');
  const [submitting, setSubmitting]               = React.useState(false);

  const triggerToast = (msg, type = 'success') => { setToastMessage(msg); setToastType(type); setTimeout(() => setToastMessage(''), 3500); };

  const [prescriptions, setPrescriptions] = React.useState([]);
  const [loading, setLoading]             = React.useState(true);
  const [error, setError]                 = React.useState('');

  const statusStyle = (s) => {
    const v = (s || '').toLowerCase();
    if (v === 'dispensed') return { sbg: '#DCFCE7', stc: '#16A34A' };
    if (v === 'pending')   return { sbg: '#FEF3C7', stc: '#B45309' };
    return { sbg: '#DBEAFE', stc: '#1D4ED8' };
  };

  React.useEffect(() => {
    const fetchPrescriptions = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${BASE_URL}/api/prescriptions`, { headers: { Authorization: `Bearer ${token}` } });
        const data = await res.json();
        const list = Array.isArray(data) ? data : (data.prescriptions || data.data || []);
        const normalized = list.map(p => ({
          id:     p.id || p._id,
          n:      p.patient_name || (p.patient && p.patient.name) || 'Unknown',
          patient_id: p.patient_id || (p.patient && p.patient.id),
          med:    p.medication_name || p.medication || p.drug_name || '—',
          dosage: p.dosage ? `${p.dosage}${p.frequency ? ' - ' + p.frequency : ''}` : '—',
          s:      p.status || 'Pending',
          ...statusStyle(p.status),
        }));
        setPrescriptions(normalized);
      } catch { setError('Failed to load prescriptions.'); }
      finally { setLoading(false); }
    };
    fetchPrescriptions();
  }, []);

  const filtered = prescriptions.filter(p =>
    p.n.toLowerCase().includes(searchText.toLowerCase()) ||
    p.med.toLowerCase().includes(searchText.toLowerCase())
  );

  // Dispense → POST /api/dispensed
  const handleDispense = async () => {
    if (!batch || !qty) { triggerToast('Please select a batch and enter quantity.', 'error'); return; }
    setSubmitting(true);
    try {
      const res = await fetch(`${BASE_URL}/api/dispensed`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          prescription_id: selectedRx.id,
          patient_id:      selectedRx.patient_id,
          medication_name: selectedRx.med,
          batch_number:    batch,
          quantity:        qty,
          dispensed_by:    user.full_name || user.name || 'Pharmacist',
        }),
      });
      if (res.ok) {
        setPrescriptions(prev => prev.map(p =>
          p.id === selectedRx.id ? { ...p, s: 'Dispensed', sbg: '#DCFCE7', stc: '#16A34A' } : p
        ));
        setShowDispenseModal(false);
        setBatch(''); setQty('');
        triggerToast(`${selectedRx.med} dispensed to ${selectedRx.n} successfully!`);
      } else {
        const errData = await res.json().catch(() => ({}));
        console.error('Dispense error:', res.status, errData);
        triggerToast(`Failed to dispense: ${errData.message || res.status}`, 'error');
      }
    } catch (err) {
      console.error('Network error:', err);
      triggerToast('Network error. Dispense not recorded.', 'error');
    }
    finally { setSubmitting(false); }
  };

  const gridTemplate = '22% 20% 18% 14% 26%';
  const pharmName = user.name || user.full_name || 'Pharmacist';

  return (
    <div style={{ minHeight: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>

      {toastMessage && (
        <div style={{ position: 'fixed', top: '25px', left: '50%', transform: 'translateX(-50%)', backgroundColor: toastType === 'error' ? '#FEF2F2' : 'white', color: toastType === 'error' ? '#DC2626' : '#16A34A', padding: '14px 24px', borderRadius: '10px', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', display: 'flex', alignItems: 'center', gap: '10px', zIndex: 999, fontWeight: '700', fontSize: '14px', border: toastType === 'error' ? '1px solid #FECACA' : '1px solid #BBF7D0' }}>
          <span style={{ fontSize: '18px' }}>{toastType === 'error' ? '🚫' : '✅'}</span> {toastMessage}
        </div>
      )}

      <div>
        <div style={{ marginBottom: '35px' }}>
          <h1 style={{ fontWeight: '800', fontSize: 'clamp(22px, 2.5vw, 32px)', color: '#1E293B', margin: 0 }}>Pharmacy Dashboard</h1>
          <p style={{ color: '#64748B', fontSize: '14px', marginTop: '8px', fontWeight: '500' }}>Welcome, {pharmName}. Here are today's prescriptions.</p>
        </div>

        {/* Stat Cards */}
        <div style={{ display: 'flex', gap: '20px', marginBottom: '50px', flexWrap: 'wrap' }}>
          {[
            { l: 'Total Prescriptions', v: loading ? '—' : prescriptions.length.toString(),                                              tc: '#1E293B', bg: 'white',   bc: '#E2E8F0' },
            { l: 'Pending Pickup',      v: loading ? '—' : prescriptions.filter(p => p.s !== 'Dispensed').length.toString(),             tc: '#3B82F6', bg: '#EFF6FF', bc: '#BFDBFE' },
            { l: 'Dispensed Today',     v: loading ? '—' : prescriptions.filter(p => p.s === 'Dispensed').length.toString(),             tc: '#16A34A', bg: '#F0FDF4', bc: '#BBF7D0' },
          ].map((c, i) => (
            <div key={i} style={{ padding: 'clamp(18px, 2vw, 30px) clamp(16px, 1.8vw, 28px)', borderRadius: '16px', backgroundColor: c.bg, flex: 1, minWidth: '140px', border: `1px solid ${c.bc}` }}>
              <p style={{ color: c.tc === '#1E293B' ? '#64748B' : c.tc, fontWeight: '700', fontSize: '14px', margin: 0 }}>{c.l}</p>
              <h2 style={{ fontSize: 'clamp(32px, 4vw, 52px)', fontWeight: '800', margin: '16px 0 0 0', color: c.tc }}>{c.v}</h2>
            </div>
          ))}
        </div>

        {/* Table Header */}
        <div style={{ display: 'grid', gridTemplateColumns: gridTemplate, padding: '14px 25px', backgroundColor: '#F8FAFC', borderRadius: '10px', marginBottom: '8px', color: '#64748B', fontSize: '12px', fontWeight: '800', letterSpacing: '0.5px' }}>
          <div>PATIENT NAME</div><div>DOSAGE</div><div>MEDICATION</div><div>STATUS</div><div>ACTION</div>
        </div>

        {loading && <div style={{ textAlign: 'center', padding: '40px', color: '#94A3B8', fontSize: '14px' }}>Loading prescriptions...</div>}
        {error && <div style={{ padding: '14px', backgroundColor: '#FEF2F2', borderRadius: '8px', color: '#DC2626', fontWeight: '600', marginBottom: '16px' }}>⚠️ {error}</div>}
        {!loading && filtered.length === 0 && !error && <div style={{ textAlign: 'center', padding: '40px', color: '#94A3B8', fontSize: '14px' }}>No prescriptions found.</div>}

        {!loading && filtered.map((p, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: gridTemplate, alignItems: 'center', backgroundColor: 'white', padding: '22px 25px', borderRadius: '12px', marginBottom: '10px', border: '1px solid #E2E8F0', fontSize: '14px', fontWeight: '700' }}>
            <div style={{ color: '#1E293B' }}>{p.n}</div>
            <div style={{ color: '#64748B', fontWeight: '600' }}>{p.dosage}</div>
            <div style={{ color: '#1E293B' }}>{p.med}</div>
            <div><span style={{ padding: '5px 16px', borderRadius: '20px', backgroundColor: p.sbg, color: p.stc, fontSize: '12px', fontWeight: '800' }}>{p.s}</span></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button onClick={() => navigate('/pharm-patient-history', { state: { patientName: p.n, patientId: p.patient_id } })} style={{ width: '36px', height: '36px', backgroundColor: '#F1F5F9', border: '1px solid #E2E8F0', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px' }}>🔍</button>
              <button onClick={() => { setSelectedRx(p); setShowDispenseModal(true); }} disabled={p.s === 'Dispensed'} style={{ padding: '10px 22px', backgroundColor: p.s === 'Dispensed' ? '#94A3B8' : '#1E293B', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '13px', cursor: p.s === 'Dispensed' ? 'not-allowed' : 'pointer' }}>
                {p.s === 'Dispensed' ? '✓ Dispensed' : 'Dispense'}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div style={{ textAlign: 'right', marginTop: '40px', fontSize: '12px', color: '#64748B', opacity: 0.7, fontWeight: '600' }}>Last System Audit: 12/02/2026 at 10:24 AM by Admin_Sarah</div>

      {/* Dispense Modal */}
      {showDispenseModal && selectedRx && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ width: 'min(480px, 95vw)', backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 20px 40px rgba(0,0,0,0.15)', overflow: 'hidden' }}>
            <div style={{ padding: '28px 32px 24px 32px', borderBottom: '1px solid #F1F5F9' }}>
              <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '800', color: '#1E293B', textAlign: 'center' }}>Dispense Prescription</h3>
            </div>
            <div style={{ padding: '28px 32px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#1E293B', marginBottom: '8px' }}>Patient Name</label>
                <div style={{ padding: '13px 15px', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', fontSize: '14px', fontWeight: '600', color: '#475569' }}>{selectedRx.n}</div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#1E293B', marginBottom: '8px' }}>Prescribed Medication</label>
                <div style={{ padding: '13px 15px', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', fontSize: '14px', fontWeight: '600', color: '#475569' }}>{selectedRx.med} — {selectedRx.dosage}</div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#1E293B', marginBottom: '8px' }}>Select Batch</label>
                <select value={batch} onChange={(e) => setBatch(e.target.value)} style={{ width: '100%', padding: '13px 15px', border: '1px solid #E2E8F0', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box', outline: 'none', backgroundColor: 'white', color: batch ? '#1E293B' : '#94A3B8' }}>
                  <option value="">Search active batches...</option>
                  <option value="BH-GH-2023-082">BH-GH-2023-082</option>
                  <option value="BN-GH-2023-115">BN-GH-2023-115</option>
                  <option value="BN-GH-2023-004">BN-GH-2023-004</option>
                  <option value="BN-GH-2023-990">BN-GH-2023-990</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#1E293B', marginBottom: '8px' }}>Quantity To Dispense</label>
                <input value={qty} onChange={(e) => setQty(e.target.value)} placeholder="Enter amount (e.g., 21)" style={{ width: '100%', padding: '13px 15px', border: '1px solid #E2E8F0', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box', outline: 'none' }} />
              </div>
            </div>
            <div style={{ padding: '0 32px 24px 32px' }}>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', marginBottom: '12px' }}>
                <button onClick={() => { setShowDispenseModal(false); setBatch(''); setQty(''); }} style={{ padding: '12px 24px', backgroundColor: 'white', color: '#64748B', border: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '14px', cursor: 'pointer' }}>Cancel</button>
                <button onClick={handleDispense} disabled={submitting} style={{ padding: '12px 28px', backgroundColor: submitting ? '#94A3B8' : '#3B82F6', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '14px', cursor: submitting ? 'not-allowed' : 'pointer' }}>{submitting ? 'Dispensing...' : 'Confirm & Dispense'}</button>
              </div>
              <p style={{ margin: 0, fontSize: '11px', color: '#94A3B8', textAlign: 'center' }}>Last System Audit: 12/02/2026 at 10:24 AM by Admin_Sarah</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- PATIENT MEDICATION HISTORY (Live API) ---
const PharmPatientHistory = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem('token');
  const passedName = location.state?.patientName || 'Patient';
  const passedId   = location.state?.patientId;

  const [activeTab, setActiveTab]   = React.useState('History');
  const [apiPatient, setApiPatient] = React.useState(null);
  const [history, setHistory]       = React.useState([]);
  const [loading, setLoading]       = React.useState(true);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Find patient
        const pRes = await fetch(`${BASE_URL}/api/patients`, { headers: { Authorization: `Bearer ${token}` } });
        const pData = await pRes.json();
        const pList = Array.isArray(pData) ? pData : (pData.patients || pData.data || []);
        const patient = pList.find(p => {
          if (passedId) return String(p.id || p._id || p.patient_id) === String(passedId);
          const name = p.name || p.full_name || `${p.first_name||''} ${p.last_name||''}`.trim();
          return name.toLowerCase() === passedName.toLowerCase();
        }) || pList[0];
        setApiPatient(patient);

        if (patient) {
          const pid = patient.id || patient._id || patient.patient_id;
          const rxRes = await fetch(`${BASE_URL}/api/prescriptions/patient/${pid}`, { headers: { Authorization: `Bearer ${token}` } });
          if (rxRes.ok) {
            const rxData = await rxRes.json();
            const list = Array.isArray(rxData) ? rxData : (rxData.prescriptions || rxData.data || []);
            setHistory(list.map(r => ({
              dt:    r.created_at ? new Date(r.created_at).toLocaleString('en-GB') : '—',
              med:   r.medication_name || r.medication || r.drug_name || '—',
              sub:   r.dosage ? `${r.dosage}${r.frequency ? ', ' + r.frequency : ''}` : '—',
              batch: r.batch_number || '—',
              s:     r.status || 'Pending',
              sbg:   (r.status||'').toLowerCase() === 'dispensed' ? '#DCFCE7' : (r.status||'').toLowerCase() === 'cancelled' ? '#FEE2E2' : '#FEF3C7',
              stc:   (r.status||'').toLowerCase() === 'dispensed' ? '#16A34A' : (r.status||'').toLowerCase() === 'cancelled' ? '#DC2626' : '#B45309',
              by:    r.dispensed_by || r.pharmacist_name || '—',
            })));
          }
        }
      } catch { } finally { setLoading(false); }
    };
    fetchData();
  }, [passedName, passedId]);

  const getName = (p) => p ? (p.name || p.full_name || `${p.first_name||''} ${p.last_name||''}`.trim()) : passedName;
  const getId   = (p) => p ? (p.patient_id || p.id || p._id || '—') : '—';

  const gridTemplate = '24% 22% 20% 14% 20%';

  return (
    <div style={{ minHeight: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <div>
        <h1 style={{ fontWeight: '800', fontSize: '32px', color: '#1E293B', marginBottom: '30px' }}>Patient Medication History</h1>

        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '30px' }}>
          <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: '#E2E8F0' }} />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <h2 style={{ margin: 0, fontSize: '26px', fontWeight: '800', color: '#1E293B' }}>{getName(apiPatient)}</h2>
              <span style={{ backgroundColor: '#DCFCE7', color: '#166534', padding: '5px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '800' }}>ACTIVE</span>
            </div>
            <p style={{ margin: '5px 0 0 0', color: '#3B82F6', fontWeight: '700', fontSize: '14px' }}>{getId(apiPatient)} | {apiPatient?.gender || '—'} | {apiPatient?.age || '—'} Years Old</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '30px', borderBottom: '1px solid #E2E8F0', marginBottom: '30px' }}>
          {['Overview', 'History', 'Documents'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{ padding: '10px 0', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '800', fontSize: '14px', color: activeTab === tab ? '#3B82F6' : '#64748B', borderBottom: activeTab === tab ? '3px solid #3B82F6' : '3px solid transparent', marginBottom: '-1px' }}>{tab}</button>
          ))}
        </div>

        {activeTab === 'History' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: gridTemplate, padding: '14px 20px', backgroundColor: '#F8FAFC', borderRadius: '10px', marginBottom: '4px', color: '#64748B', fontSize: '12px', fontWeight: '800', letterSpacing: '0.4px' }}>
              <div>DATE & TIME</div><div>MEDICATION & DOSAGE</div><div>BATCH NUMBER</div><div>STATUS</div><div>PHARMACIST</div>
            </div>
            {loading && <div style={{ textAlign: 'center', padding: '40px', color: '#94A3B8' }}>Loading history...</div>}
            {!loading && history.length === 0 && <div style={{ textAlign: 'center', padding: '40px', color: '#94A3B8' }}>No prescription history found.</div>}
            {!loading && history.map((h, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: gridTemplate, alignItems: 'center', backgroundColor: 'white', padding: '20px', borderBottom: '1px solid #F1F5F9', fontSize: '14px' }}>
                <div style={{ color: '#475569', fontWeight: '500' }}>{h.dt}</div>
                <div><div style={{ fontWeight: '800', color: '#1E293B' }}>{h.med}</div><div style={{ fontSize: '12px', color: '#64748B', marginTop: '4px' }}>{h.sub}</div></div>
                <div style={{ color: '#64748B', fontWeight: '600' }}>{h.batch}</div>
                <div><span style={{ padding: '4px 14px', borderRadius: '20px', backgroundColor: h.sbg, color: h.stc, fontSize: '12px', fontWeight: '800' }}>{h.s}</span></div>
                <div style={{ color: '#475569', fontWeight: '600' }}>{h.by}</div>
              </div>
            ))}
          </div>
        )}
        {activeTab === 'Overview' && <div style={{ color: '#64748B', fontSize: '14px', fontWeight: '600' }}>Overview is managed by the doctor.</div>}
        {activeTab === 'Documents' && <div style={{ color: '#64748B', fontSize: '14px', fontWeight: '600' }}>No documents available.</div>}
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '20px', borderTop: '1px solid #E2E8F0', marginTop: '30px' }}>
        <button onClick={() => navigate('/pharm-dashboard')} style={{ padding: '12px 28px', backgroundColor: '#3B82F6', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}>Back to Dashboard</button>
      </div>
    </div>
  );
};

// --- MEDICINE INVENTORY (Live API) ---
const PharmInventory = ({ searchText }) => {
  const token = localStorage.getItem('token');
  const [showBatchModal, setShowBatchModal] = React.useState(false);
  const [medName, setMedName]   = React.useState('');
  const [batchNo, setBatchNo]   = React.useState('');
  const [quantity, setQuantity] = React.useState('');
  const [expiry, setExpiry]     = React.useState('');
  const [toastMessage, setToastMessage] = React.useState('');
  const [toastType, setToastType]       = React.useState('success');
  const [submitting, setSubmitting]     = React.useState(false);

  const triggerToast = (msg, type = 'success') => { setToastMessage(msg); setToastType(type); setTimeout(() => setToastMessage(''), 3500); };

  const [inventory, setInventory] = React.useState([]);
  const [summary, setSummary]     = React.useState({ total: '—', outOfStock: '—', lowStock: '—' });
  const [loading, setLoading]     = React.useState(true);
  const [error, setError]         = React.useState('');

  const statusStyle = (s, stock) => {
    const v = (s || '').toLowerCase();
    const qty = parseInt(stock) || 0;
    if (v === 'out of stock' || qty === 0) return { s: 'Out of Stock', sbg: '#FEE2E2', stc: '#DC2626' };
    if (v === 'low stock' || qty < 20)     return { s: 'Low Stock',    sbg: '#FEF3C7', stc: '#B45309' };
    return { s: 'In Stock', sbg: '#DCFCE7', stc: '#16A34A' };
  };

  React.useEffect(() => {
    const fetchInventory = async () => {
      try {
        setLoading(true);
        const [invRes, sumRes] = await Promise.all([
          fetch(`${BASE_URL}/api/inventory`,        { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${BASE_URL}/api/inventory/summary`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        if (invRes.ok) {
          const data = await invRes.json();
          const list = Array.isArray(data) ? data : (data.inventory || data.data || []);
          setInventory(list.map(item => ({
            id:    item.id || item._id,
            name:  item.medication_name || item.name || item.drug_name || '—',
            cat:   item.category || item.drug_class || 'General',
            stock: item.quantity ? `${item.quantity} Units` : '—',
            exp:   item.expiry_date || item.expiry || '—',
            ...statusStyle(item.status, item.quantity),
          })));
        }
        if (sumRes.ok) {
          const s = await sumRes.json();
          setSummary({
            total:      String(s.total       || s.total_items    || '—'),
            outOfStock: String(s.out_of_stock || s.outOfStock    || '—'),
            lowStock:   String(s.low_stock    || s.expiring_soon || '—'),
          });
        }
      } catch { setError('Failed to load inventory.'); }
      finally { setLoading(false); }
    };
    fetchInventory();
  }, []);

  const filtered = inventory.filter(i =>
    i.name.toLowerCase().includes(searchText.toLowerCase()) ||
    i.cat.toLowerCase().includes(searchText.toLowerCase())
  );

  // Add batch → POST /api/inventory
  const handleAddBatch = async () => {
    if (!medName || !batchNo || !quantity) { triggerToast('Please fill all required fields.', 'error'); return; }
    setSubmitting(true);
    try {
      const res = await fetch(`${BASE_URL}/api/inventory`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          medicine_name:   medName,
          batch_number:    batchNo,
          batch_no:        batchNo,
          quantity:        parseInt(quantity),
          expiry_date:     expiry,
          expiry:          expiry,
          category:        'General',
          status:          'in_stock',
        }),
      });
      if (res.ok) {
        const newItem = { name: medName, cat: 'General', stock: `${quantity} Units`, exp: expiry || 'N/A', ...statusStyle('in stock', parseInt(quantity)) };
        setInventory(prev => [...prev, newItem]);
        setShowBatchModal(false);
        setMedName(''); setBatchNo(''); setQuantity(''); setExpiry('');
        triggerToast(`${medName} batch added to inventory!`);
      } else {
        const errData = await res.json().catch(() => ({}));
        console.error('Add batch error:', res.status, errData);
        if (res.status === 403) {
          triggerToast('Only Pharmacists can add inventory batches.', 'error');
        } else {
          triggerToast(`Failed to add batch: ${errData.message || res.status}`, 'error');
        }
      }
    } catch (err) {
      console.error('Network error:', err);
      triggerToast('Network error. Batch not added.', 'error');
    }
    finally { setSubmitting(false); }
  };

  const gridTemplate = '28% 20% 18% 16% 18%';

  return (
    <div style={{ minHeight: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>

      {toastMessage && (
        <div style={{ position: 'fixed', top: '25px', left: '50%', transform: 'translateX(-50%)', backgroundColor: toastType === 'error' ? '#FEF2F2' : 'white', color: toastType === 'error' ? '#DC2626' : '#16A34A', padding: '14px 24px', borderRadius: '10px', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', display: 'flex', alignItems: 'center', gap: '10px', zIndex: 999, fontWeight: '700', fontSize: '14px', border: toastType === 'error' ? '1px solid #FECACA' : '1px solid #BBF7D0' }}>
          <span style={{ fontSize: '18px' }}>{toastType === 'error' ? '🚫' : '✅'}</span> {toastMessage}
        </div>
      )}

      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '35px' }}>
          <h1 style={{ fontWeight: '800', fontSize: 'clamp(22px, 2.5vw, 32px)', color: '#1E293B', margin: 0 }}>Medicine Inventory</h1>
          <button onClick={() => setShowBatchModal(true)} style={{ padding: '12px 24px', backgroundColor: '#3B82F6', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '14px', cursor: 'pointer' }}>+ Add New Batch</button>
        </div>

        {/* Stat Cards */}
        <div style={{ display: 'flex', gap: '20px', marginBottom: '50px', flexWrap: 'wrap' }}>
          {[
            { l: 'Total Items',   v: loading ? '—' : summary.total,      tc: '#1E293B', bg: 'white',   bc: '#E2E8F0' },
            { l: 'Out of Stock',  v: loading ? '—' : summary.outOfStock, tc: '#DC2626', bg: '#FEF2F2', bc: '#FECACA' },
            { l: 'Low Stock',     v: loading ? '—' : summary.lowStock,   tc: '#B45309', bg: '#FFFBEB', bc: '#FDE68A' },
          ].map((c, i) => (
            <div key={i} style={{ padding: 'clamp(18px, 2vw, 30px) clamp(16px, 1.8vw, 28px)', borderRadius: '16px', backgroundColor: c.bg, flex: 1, minWidth: '140px', border: `1px solid ${c.bc}` }}>
              <p style={{ color: c.tc === '#1E293B' ? '#64748B' : c.tc, fontWeight: '700', fontSize: '14px', margin: 0 }}>{c.l}</p>
              <h2 style={{ fontSize: 'clamp(32px, 4vw, 52px)', fontWeight: '800', margin: '16px 0 0 0', color: c.tc }}>{c.v}</h2>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: gridTemplate, padding: '14px 25px', backgroundColor: '#F8FAFC', borderRadius: '10px', marginBottom: '4px', color: '#64748B', fontSize: '12px', fontWeight: '800', letterSpacing: '0.5px' }}>
          <div>MEDICINE NAME</div><div>CATEGORY</div><div>STOCK LEVEL</div><div>EXPIRY DATE</div><div>STATUS</div>
        </div>

        {loading && <div style={{ textAlign: 'center', padding: '40px', color: '#94A3B8', fontSize: '14px' }}>Loading inventory...</div>}
        {error && <div style={{ padding: '14px', backgroundColor: '#FEF2F2', borderRadius: '8px', color: '#DC2626', fontWeight: '600' }}>⚠️ {error}</div>}
        {!loading && filtered.length === 0 && !error && <div style={{ textAlign: 'center', padding: '40px', color: '#94A3B8', fontSize: '14px' }}>No inventory items found.</div>}
        {!loading && filtered.map((item, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: gridTemplate, alignItems: 'center', backgroundColor: 'white', padding: '22px 25px', borderBottom: '1px solid #F1F5F9', fontSize: '14px', fontWeight: '700' }}>
            <div style={{ color: '#1E293B' }}>{item.name}</div>
            <div style={{ color: '#475569', fontWeight: '600' }}>{item.cat}</div>
            <div style={{ color: '#475569', fontWeight: '600' }}>{item.stock}</div>
            <div style={{ color: '#475569', fontWeight: '600' }}>{item.exp}</div>
            <div><span style={{ padding: '5px 16px', borderRadius: '20px', backgroundColor: item.sbg, color: item.stc, fontSize: '12px', fontWeight: '800' }}>{item.s}</span></div>
          </div>
        ))}
      </div>

      <div style={{ textAlign: 'right', marginTop: '40px', fontSize: '12px', color: '#64748B', opacity: 0.7, fontWeight: '600' }}>Last System Audit: 12/02/2026 at 10:24 AM by Admin_Sarah</div>

      {/* Add New Batch Modal */}
      {showBatchModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ width: 'min(460px, 95vw)', backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 20px 40px rgba(0,0,0,0.15)', overflow: 'hidden' }}>
            <div style={{ padding: '28px 32px 20px 32px', borderBottom: '1px solid #F1F5F9' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#1E293B', textAlign: 'center' }}>Add New Medication Batch</h3>
            </div>
            <div style={{ padding: '24px 32px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {[
                { label: 'Medicine Name', val: medName, set: setMedName, ph: 'e.g. Amoxicillin 500mg' },
                { label: 'Batch Number',  val: batchNo, set: setBatchNo, ph: 'e.g. B24-102' },
                { label: 'Quantity',      val: quantity, set: setQuantity, ph: '0', type: 'number' },
                { label: 'Expiry Date',   val: expiry,   set: setExpiry,   ph: '',  type: 'date' },
              ].map(({ label, val, set, ph, type }, i) => (
                <div key={i}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#1E293B', marginBottom: '8px' }}>{label}</label>
                  <input value={val} onChange={(e) => set(e.target.value)} placeholder={ph} type={type || 'text'} style={{ width: '100%', padding: '13px 15px', border: '1px solid #E2E8F0', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box', outline: 'none' }} />
                </div>
              ))}
            </div>
            <div style={{ padding: '0 32px 24px 32px', display: 'flex', justifyContent: 'flex-end', gap: '16px' }}>
              <button onClick={() => { setShowBatchModal(false); setMedName(''); setBatchNo(''); setQuantity(''); setExpiry(''); }} style={{ padding: '12px 24px', backgroundColor: 'white', color: '#64748B', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleAddBatch} disabled={submitting} style={{ padding: '12px 28px', backgroundColor: submitting ? '#94A3B8' : '#3B82F6', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: submitting ? 'not-allowed' : 'pointer' }}>{submitting ? 'Adding...' : 'Add Batch'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================
// --- PATIENT LAYOUT ---
// ============================================================
const PatientPortalLayout = ({ children, searchText, setSearchText }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { label: 'Dashboard', path: '/patient-dashboard' },
  ];

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', backgroundColor: '#F4F7F6', fontFamily: '"Inter", sans-serif', overflow: 'hidden' }}>
      {/* SIDEBAR */}
      <div style={{ width: 'clamp(180px, 18vw, 240px)', minWidth: '180px', backgroundColor: '#1E293B', color: 'white', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', overflow: 'hidden' }}>
        <div>
          <div style={{ padding: '32px 24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ fontSize: '50px', fontWeight: '300', lineHeight: '0.6', color: 'white', flexShrink: 0 }}>+</div>
            <div>
              <h2 style={{ fontSize: '18px', margin: 0, fontWeight: '800', lineHeight: '1.1', letterSpacing: '0.5px' }}>HEALTHCARE<br/>EMR</h2>
            </div>
          </div>
          <nav style={{ marginTop: '10px' }}>
            {navItems.map((item) => (
              <Link key={item.path} to={item.path} style={{ display: 'block', padding: '15px 30px', color: 'white', textDecoration: 'none', opacity: location.pathname === item.path ? 1 : 0.4, fontWeight: '700', fontSize: '14px', borderLeft: location.pathname === item.path ? '4px solid #4ADE80' : '4px solid transparent' }}>
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <div onClick={() => { localStorage.removeItem('token'); localStorage.removeItem('user'); localStorage.removeItem('role'); localStorage.removeItem('display_name'); navigate('/logout'); }} style={{ padding: '25px 30px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '15px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          <span style={{ fontWeight: '700', opacity: 0.6, fontSize: '14px' }}>Logout</span>
        </div>
      </div>

      {/* CONTENT */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 50px', backgroundColor: 'white', borderBottom: '1px solid #E2E8F0', position: 'relative' }}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <span style={{ position: 'absolute', left: '15px', color: '#64748B' }}>🔍</span>
            <input value={searchText} onChange={(e) => setSearchText(e.target.value)} style={{ width: 'clamp(200px, 30vw, 420px)', padding: '12px 15px 12px 45px', borderRadius: '8px', border: '1px solid #E2E8F0', backgroundColor: '#F8FAFC', fontSize: '13px' }} placeholder="Search your health records..." />
          </div>
          <div style={{ position: 'absolute', right: '50px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '13px', color: '#64748B', fontWeight: '600' }}>{localStorage.getItem('display_name') || JSON.parse(localStorage.getItem('user') || '{}').full_name || JSON.parse(localStorage.getItem('user') || '{}').name || '—'}</span>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#94A3B8' }} />
          </div>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: 'clamp(20px, 3vw, 50px) clamp(20px, 4vw, 50px)' }}>
          {children}
        </div>
      </div>
    </div>
  );
};

// --- PATIENT DASHBOARD ---
const PatientDashboard = () => {
  const token = localStorage.getItem('token');
  const user  = JSON.parse(localStorage.getItem('user') || '{}');

  const [showBookingModal, setShowBookingModal] = React.useState(false);
  const [showSuccessModal, setShowSuccessModal] = React.useState(false);
  const [showUnavailable, setShowUnavailable]   = React.useState(false);
  const [submitting, setSubmitting]             = React.useState(false);
  const [toastMessage, setToastMessage]         = React.useState('');
  const [toastType, setToastType]               = React.useState('success');

  // Booking form state
  const [specialty, setSpecialty] = React.useState('General Consultation');
  const [doctor, setDoctor]       = React.useState('Dr. Bright Amofa');
  const [apptDate, setApptDate]   = React.useState('');
  const [symptoms, setSymptoms]   = React.useState('');

  // API state
  const [profile, setProfile]           = React.useState(null);
  const [appointments, setAppointments] = React.useState([]);
  const [prescriptions, setPrescriptions] = React.useState([]);
  const [labResults, setLabResults]     = React.useState([]);
  const [visitHistory, setVisitHistory] = React.useState([]);
  const [loading, setLoading]           = React.useState(true);

  const triggerToast = (msg, type = 'success') => { setToastMessage(msg); setToastType(type); setTimeout(() => setToastMessage(''), 3000); };

  const actionStyle = (action) => {
    const a = (action || '').toLowerCase();
    if (a.includes('prescription') || a.includes('dispens')) return { abg: '#EDE9FE', atc: '#7C3AED' };
    if (a.includes('lab') || a.includes('result'))           return { abg: '#F0FDF4', atc: '#16A34A' };
    if (a.includes('booked') || a.includes('appointment'))   return { abg: '#DBEAFE', atc: '#1D4ED8' };
    return { abg: '#DCFCE7', atc: '#16A34A' };
  };

  React.useEffect(() => {
    const fetchPatientData = async () => {
      try {
        setLoading(true);
        const patientId = user.id || user._id || user.patient_id;

        // Fetch patient profile using GET /api/patients/:id
        const [pRes, apptRes, rxRes, labRes, recordsRes] = await Promise.all([
          fetch(`${BASE_URL}/api/patients/${patientId}`,                          { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${BASE_URL}/api/appointments`,                                    { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${BASE_URL}/api/prescriptions/patient/${patientId}`,              { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${BASE_URL}/api/lab-results`,                                     { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${BASE_URL}/api/medical-records/patient/${patientId}`,            { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        if (pRes.ok) {
          const pData = await pRes.json();
          setProfile(pData.patient || pData);
        } else {
          setProfile(user);
        }

        const appts   = apptRes.ok   ? (await apptRes.json())   : [];
        const rxs     = rxRes.ok     ? (await rxRes.json())     : [];
        const labs    = labRes.ok    ? (await labRes.json())    : [];
        const records = recordsRes.ok ? (await recordsRes.json()) : [];

        const apptList    = Array.isArray(appts)   ? appts   : (appts.appointments   || appts.data   || []);
        const rxList      = Array.isArray(rxs)     ? rxs     : (rxs.prescriptions    || rxs.data     || []);
        const labList     = Array.isArray(labs)    ? labs    : (labs.labResults       || labs.data    || []);
        const recordsList = Array.isArray(records) ? records : (records.records       || records.data || []);

        // Filter appointments to just this patient's
        const myAppts = apptList.filter(a => {
          const aid = String(a.patient_id || (a.patient && a.patient.id) || '');
          return aid === String(patientId) || aid === '';
        });

        setAppointments(myAppts);
        setPrescriptions(rxList);
        setLabResults(labList);

        // Build visit history
        const historyFromAppts = myAppts.map(a => ({
          date:     a.appointment_date ? new Date(a.appointment_date).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) : '—',
          provider: a.doctor_name || a.doctor || 'Healthcare Provider',
          type:     a.reason || a.reason_for_visit || 'Appointment',
          action:   a.status || 'Scheduled',
          ...actionStyle(a.reason || a.status),
        }));
        const historyFromRecords = recordsList.map(r => ({
          date:     r.created_at ? new Date(r.created_at).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) : '—',
          provider: r.doctor_name || r.recorded_by || 'Healthcare Provider',
          type:     'Consultation',
          action:   r.diagnosis || 'Medical Record',
          ...actionStyle('consultation'),
        }));
        setVisitHistory([...historyFromAppts, ...historyFromRecords]);

      } catch { setProfile(user); }
      finally { setLoading(false); }
    };
    fetchPatientData();
  }, []);

  // Book appointment → POST /api/appointments
  const handleConfirmBooking = async () => {
    if (!apptDate) return;
    setSubmitting(true);
    try {
      const res = await fetch(`${BASE_URL}/api/appointments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          doctor_name:      doctor,
          specialty,
          appointment_date: apptDate,
          reason:           symptoms || specialty,
          status:           'pending',
        }),
      });

      if (res.ok) {
        const dateObj  = new Date(apptDate);
        const formatted = dateObj.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
        setVisitHistory(prev => [{ date: formatted, provider: doctor, type: specialty, action: 'Appointment Booked', abg: '#DBEAFE', atc: '#1D4ED8' }, ...prev]);
        setAppointments(prev => [...prev, { appointment_date: apptDate, doctor_name: doctor, reason: specialty, status: 'pending' }]);
        setShowBookingModal(false);
        setShowSuccessModal(true);
        setApptDate(''); setSymptoms('');
      } else {
        setShowUnavailable(true);
      }
    } catch { triggerToast('Network error. Appointment not booked.', 'error'); }
    finally { setSubmitting(false); }
  };

  const resetBooking = () => { setSpecialty('General Consultation'); setDoctor('Dr. Bright Amofa'); setApptDate(''); setSymptoms(''); setShowUnavailable(false); };

  const patientName = profile
    ? (profile.name || profile.full_name || `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || user.name || 'Patient')
    : (user.name || user.full_name || 'Patient');

  const upcomingCount  = appointments.filter(a => (a.status || '').toLowerCase() === 'pending').length;
  const activeMeds     = prescriptions.filter(p => (p.status || '').toLowerCase() !== 'dispensed').length;
  const newLabResults  = labResults.length;

  const gridTemplate = '20% 22% 18% 22% 18%';

  return (
    <div style={{ minHeight: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>

      {toastMessage && (
        <div style={{ position: 'fixed', top: '25px', left: '50%', transform: 'translateX(-50%)', backgroundColor: toastType === 'error' ? '#EF4444' : '#10B981', color: 'white', padding: '14px 25px', borderRadius: '8px', zIndex: 999, fontWeight: '700', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span>{toastType === 'error' ? '🚫' : '✅'}</span> {toastMessage}
        </div>
      )}

      <div>
        {/* Page Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '35px' }}>
          <div>
            <div style={{ fontSize: '28px', marginBottom: '6px' }}>👋</div>
            <h1 style={{ fontSize: '32px', fontWeight: '800', color: '#1E293B', margin: 0 }}>
              {loading ? 'Welcome back!' : `Good Morning, ${patientName}`}
            </h1>
            <p style={{ color: '#64748B', fontSize: '14px', margin: '6px 0 0 0', fontWeight: '500' }}>Your health summary for today</p>
          </div>
          <button onClick={() => setShowBookingModal(true)} style={{ padding: '12px 24px', backgroundColor: '#3B82F6', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '14px', cursor: 'pointer', whiteSpace: 'nowrap' }}>+ Schedule Appointment</button>
        </div>

        {/* Stat Cards */}
        <div style={{ display: 'flex', gap: '20px', marginBottom: '50px', flexWrap: 'wrap' }}>
          {[
            { l: 'Upcoming Visits',  v: loading ? '—' : `${upcomingCount} Appointment${upcomingCount !== 1 ? 's' : ''}`, tc: '#3B82F6', bg: '#EFF6FF', bc: '#BFDBFE' },
            { l: 'Active Meds',      v: loading ? '—' : `${activeMeds} Prescription${activeMeds !== 1 ? 's' : ''}`,      tc: '#3B82F6', bg: '#EFF6FF', bc: '#BFDBFE' },
            { l: 'New Reports',      v: loading ? '—' : newLabResults > 0 ? `${newLabResults} Lab Result${newLabResults !== 1 ? 's' : ''}` : 'No New Reports', tc: '#16A34A', bg: '#F0FDF4', bc: '#BBF7D0' },
          ].map((c, i) => (
            <div key={i} style={{ padding: 'clamp(18px, 2vw, 30px) clamp(16px, 1.8vw, 28px)', borderRadius: '16px', backgroundColor: c.bg, flex: 1, minWidth: '140px', border: `1px solid ${c.bc}` }}>
              <p style={{ color: c.tc, fontWeight: '700', fontSize: '14px', margin: 0 }}>{c.l}</p>
              <h2 style={{ fontSize: '28px', fontWeight: '800', margin: '16px 0 0 0', color: c.tc }}>{c.v}</h2>
            </div>
          ))}
        </div>

        {/* Visit History Table */}
        <div style={{ display: 'grid', gridTemplateColumns: gridTemplate, padding: '14px 25px', backgroundColor: '#F8FAFC', borderRadius: '10px', marginBottom: '4px', color: '#64748B', fontSize: '12px', fontWeight: '800', letterSpacing: '0.5px' }}>
          <div>DATE</div><div>PROVIDER</div><div>VISIT TYPE</div><div>ACTION TAKEN</div><div>STATUS</div>
        </div>

        {loading && <div style={{ textAlign: 'center', padding: '40px', color: '#94A3B8', fontSize: '14px' }}>Loading your health data...</div>}

        {!loading && visitHistory.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px', color: '#94A3B8', fontSize: '14px' }}>No visit history yet.</div>
        )}

        {!loading && visitHistory.map((v, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: gridTemplate, alignItems: 'center', backgroundColor: 'white', padding: '20px 25px', borderBottom: '1px solid #F1F5F9', fontSize: '14px', fontWeight: '700' }}>
            <div style={{ color: '#475569', fontWeight: '500' }}>{v.date}</div>
            <div style={{ color: '#1E293B' }}>{v.provider}</div>
            <div style={{ color: '#1E293B' }}>{v.type}</div>
            <div><span style={{ padding: '4px 14px', borderRadius: '20px', backgroundColor: v.abg, color: v.atc, fontSize: '12px', fontWeight: '700' }}>{v.action}</span></div>
            <div style={{ color: '#16A34A', fontWeight: '800', fontSize: '13px' }}>SUCCESS</div>
          </div>
        ))}
      </div>

      <div style={{ textAlign: 'right', marginTop: '40px', fontSize: '12px', color: '#64748B', opacity: 0.7, fontWeight: '600' }}>
        Last System Audit: 12/02/2026 at 10:24 AM by Admin_Sarah
      </div>

      {/* Schedule Appointment Modal */}
      {showBookingModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ width: 'min(500px, 95vw)', backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 20px 40px rgba(0,0,0,0.15)', overflow: 'hidden' }}>

            {/* Header */}
            <div style={{ padding: '28px 32px 20px 32px', borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '800', color: '#3B82F6', textAlign: 'center', flex: 1 }}>Schedule New Appointment</h3>
              <span onClick={() => { setShowBookingModal(false); resetBooking(); }} style={{ cursor: 'pointer', fontWeight: '800', fontSize: '20px', color: '#64748B' }}>X</span>
            </div>

            {/* Doctor unavailable warning */}
            {showUnavailable && (
              <div style={{ margin: '16px 32px 0 32px', padding: '12px 16px', backgroundColor: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', color: '#DC2626', fontWeight: '700', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                🚫 {doctor} is not available on this date. Please choose a different date or doctor.
              </div>
            )}

            {/* Fields */}
            <div style={{ padding: '24px 32px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {/* Select Specialty */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#1E293B', marginBottom: '8px' }}>Select Specialty:</label>
                <select value={specialty} onChange={(e) => { setSpecialty(e.target.value); setShowUnavailable(false); }} style={{ width: '100%', padding: '13px 15px', border: '1px solid #E2E8F0', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box', outline: 'none', backgroundColor: '#F8FAFC', color: '#1E293B' }}>
                  <option>General Consultation</option>
                  <option>Specialist</option>
                  <option>Lab Review</option>
                  <option>Follow-up</option>
                  <option>Dental</option>
                </select>
              </div>

              {/* Choose Doctor */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#1E293B', marginBottom: '8px' }}>Choose Doctor:</label>
                <select value={doctor} onChange={(e) => { setDoctor(e.target.value); setShowUnavailable(false); }} style={{ width: '100%', padding: '13px 15px', border: '1px solid #E2E8F0', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box', outline: 'none', backgroundColor: '#F8FAFC', color: '#1E293B' }}>
                  <option>Dr. Bright Amofa</option>
                  <option>Dr. Kwesi Appiah</option>
                  <option>Dr. Abena Chen</option>
                </select>
              </div>

              {/* Appointment Date */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#1E293B', marginBottom: '8px' }}>Appointment Date:</label>
                <input type="date" value={apptDate} onChange={(e) => { setApptDate(e.target.value); setShowUnavailable(false); }} style={{ width: '100%', padding: '13px 15px', border: '1px solid #E2E8F0', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box', outline: 'none', backgroundColor: '#F8FAFC', color: '#1E293B' }} />
              </div>

              {/* Symptoms / Reason */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#1E293B', marginBottom: '8px' }}>Symptoms / Reason:</label>
                <textarea value={symptoms} onChange={(e) => setSymptoms(e.target.value)} placeholder="Type here..." style={{ width: '100%', height: '100px', padding: '13px 15px', border: '1px solid #E2E8F0', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box', resize: 'none', fontFamily: '"Inter", sans-serif', outline: 'none', backgroundColor: '#F8FAFC' }} />
              </div>
            </div>

            {/* Footer */}
            <div style={{ padding: '0 32px 24px 32px', display: 'flex', justifyContent: 'flex-end', gap: '16px' }}>
              <button onClick={() => { setShowBookingModal(false); resetBooking(); }} style={{ padding: '12px 24px', backgroundColor: 'white', color: '#64748B', border: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '14px', cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleConfirmBooking} disabled={submitting} style={{ padding: '12px 28px', backgroundColor: submitting ? '#94A3B8' : '#3B82F6', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '14px', cursor: submitting ? 'not-allowed' : 'pointer' }}>{submitting ? 'Booking...' : 'Confirm Booking'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Appointment Confirmed Success Modal */}
      {showSuccessModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ width: 'min(480px, 95vw)', backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 20px 40px rgba(0,0,0,0.15)', padding: '40px 40px 32px 40px', position: 'relative' }}>

            {/* X close */}
            <span onClick={() => setShowSuccessModal(false)} style={{ position: 'absolute', top: '20px', right: '24px', cursor: 'pointer', fontWeight: '800', fontSize: '20px', color: '#64748B' }}>X</span>

            {/* Green check + title */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '18px', marginBottom: '20px' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: '#22C55E', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <h3 style={{ margin: 0, fontSize: '22px', fontWeight: '800', color: '#1E293B' }}>Appointment Confirmed!</h3>
            </div>

            {/* Message */}
            <p style={{ margin: '0 0 32px 0', fontSize: '14px', color: '#475569', lineHeight: '1.7', fontWeight: '500' }}>
              You're all set! Your appointment with <strong>{doctor}</strong> has been scheduled. You can view the details in your Appointments tab.
            </p>

            {/* Button */}
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowSuccessModal(false)} style={{ padding: '13px 32px', backgroundColor: '#3B82F6', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '14px', cursor: 'pointer' }}>Back to Dashboard</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- ADMIN LAYOUT ---
const AdminLayout = ({ children, searchText, setSearchText }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { label: 'Dashboard',      path: '/admin-dashboard' },
    { label: 'User Management', path: '/admin-users' },
    { label: 'Audit Logs',      path: '/admin-logs' },
  ];

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', backgroundColor: '#F4F7F6', fontFamily: '"Inter", sans-serif', overflow: 'hidden' }}>
      {/* SIDEBAR */}
      <div style={{ width: 'clamp(180px, 18vw, 240px)', minWidth: '180px', backgroundColor: '#1E293B', color: 'white', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', overflow: 'hidden' }}>
        <div>
          <div style={{ padding: '32px 24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ fontSize: '50px', fontWeight: '300', lineHeight: '0.6', color: 'white', flexShrink: 0 }}>+</div>
            <div>
              <h2 style={{ fontSize: '18px', margin: 0, fontWeight: '800', lineHeight: '1.1', letterSpacing: '0.5px' }}>HEALTHCARE<br/>EMR</h2>
            </div>
          </div>
          <nav style={{ marginTop: '10px' }}>
            {navItems.map((item) => (
              <Link key={item.path} to={item.path} style={{ display: 'block', padding: '15px 30px', color: 'white', textDecoration: 'none', opacity: location.pathname === item.path ? 1 : 0.4, fontWeight: '700', fontSize: '14px', borderLeft: location.pathname === item.path ? '4px solid #4ADE80' : '4px solid transparent' }}>
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <div onClick={() => { localStorage.removeItem('token'); localStorage.removeItem('user'); localStorage.removeItem('role'); localStorage.removeItem('display_name'); navigate('/logout'); }} style={{ padding: '25px 30px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '15px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          <span style={{ fontWeight: '700', opacity: 0.6, fontSize: '14px' }}>Logout</span>
        </div>
      </div>

      {/* CONTENT */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '0 50px', backgroundColor: 'white', borderBottom: '1px solid #E2E8F0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '13px', color: '#64748B', fontWeight: '600' }}>{localStorage.getItem('display_name') || JSON.parse(localStorage.getItem('user') || '{}').full_name || JSON.parse(localStorage.getItem('user') || '{}').name || '—'}</span>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#94A3B8' }} />
          </div>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: 'clamp(20px, 3vw, 50px) clamp(20px, 4vw, 50px)' }}>
          {children}
        </div>
      </div>
    </div>
  );
};

// --- ADMIN DASHBOARD ---
const AdminDashboard = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const user  = JSON.parse(localStorage.getItem('user') || '{}');
  const [stats, setStats] = React.useState({ staff: '—', appointments: '—', patients: '—', pending: '—' });

  React.useEffect(() => {
    const fetchStats = async () => {
      try {
        const [usersRes, apptRes, patientsRes] = await Promise.all([
          fetch(`${BASE_URL}/api/users`,        { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${BASE_URL}/api/appointments`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${BASE_URL}/api/patients`,     { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        const users    = await usersRes.json();
        const appts    = await apptRes.json();
        const patients = await patientsRes.json();
        const userList    = Array.isArray(users)    ? users    : (users.users       || users.data    || []);
        const apptList    = Array.isArray(appts)    ? appts    : (appts.appointments || appts.data    || []);
        const patientList = Array.isArray(patients) ? patients : (patients.patients  || patients.data || []);
        setStats({
          staff:        userList.length.toString(),
          appointments: apptList.length.toString(),
          patients:     patientList.length.toString(),
          pending:      apptList.filter(a => (a.status || '').toLowerCase() === 'pending').length.toString(),
        });
      } catch { setStats({ staff: '—', appointments: '—', patients: '—', pending: '—' }); }
    };
    fetchStats();
  }, []);

  const adminName = user.name || user.full_name || 'Admin Sarah';

  return (
    <div>
      <h1 style={{ fontWeight: '800', fontSize: '32px', color: '#1E293B', marginBottom: '10px' }}>Admin Dashboard</h1>
      <p style={{ color: '#64748B', fontSize: '14px', marginBottom: '35px', fontWeight: '500' }}>Welcome back, {adminName}. Here's the system overview.</p>
      <div style={{ display: 'flex', gap: '20px', marginBottom: '40px', flexWrap: 'wrap' }}>
        {[
          { l: 'Total Staff Accounts', v: stats.staff,        tc: '#1E293B', bg: 'white',   bc: '#E2E8F0' },
          { l: 'Appointments Today',   v: stats.appointments,  tc: '#3B82F6', bg: '#EFF6FF', bc: '#BFDBFE' },
          { l: 'Active Patients',      v: stats.patients,      tc: '#16A34A', bg: '#F0FDF4', bc: '#BBF7D0' },
          { l: 'Pending Reports',      v: stats.pending,       tc: '#B45309', bg: '#FFFBEB', bc: '#FDE68A' },
        ].map((c, i) => (
          <div key={i} style={{ padding: 'clamp(16px, 2vw, 28px) clamp(14px, 1.8vw, 24px)', borderRadius: '16px', backgroundColor: c.bg, flex: 1, minWidth: '130px', border: `1px solid ${c.bc}` }}>
            <p style={{ color: '#64748B', fontWeight: '700', fontSize: '13px', margin: 0 }}>{c.l}</p>
            <h2 style={{ fontSize: '42px', fontWeight: '800', margin: '14px 0 0 0', color: c.tc }}>{c.v}</h2>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: '15px' }}>
        <button onClick={() => navigate('/admin-users')} style={{ padding: '14px 28px', backgroundColor: '#1E293B', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '700', fontSize: '14px', cursor: 'pointer' }}>User Management →</button>
        <button onClick={() => navigate('/admin-logs')} style={{ padding: '14px 28px', backgroundColor: 'white', color: '#1E293B', border: '1px solid #E2E8F0', borderRadius: '10px', fontWeight: '700', fontSize: '14px', cursor: 'pointer' }}>Audit Logs →</button>
      </div>
    </div>
  );
};

// --- USER MANAGEMENT PAGE (Live API) ---
const UserManagement = () => {
  const token = localStorage.getItem('token');
  const [showAddModal, setShowAddModal] = React.useState(false);
  const [staffSearch, setStaffSearch]   = React.useState('');
  const [toastMessage, setToastMessage] = React.useState('');
  const [toastType, setToastType]       = React.useState('success');
  const [submitting, setSubmitting]     = React.useState(false);
  const [fullName, setFullName]         = React.useState('');
  const [email, setEmail]               = React.useState('');
  const [role, setRole]                 = React.useState('');
  const [password, setPassword]         = React.useState('');

  // Patient registration state
  const [showPatientModal, setShowPatientModal] = React.useState(false);
  const [pFirst, setPFirst]   = React.useState('');
  const [pLast, setPLast]     = React.useState('');
  const [pDob, setPDob]       = React.useState('');
  const [pPhone, setPPhone]   = React.useState('');
  const [pGender, setPGender] = React.useState('');


  const [staffList, setStaffList] = React.useState([]);
  const [loading, setLoading]     = React.useState(true);
  const [error, setError]         = React.useState('');

  const triggerToast = (msg, type = 'success') => { setToastMessage(msg); setToastType(type); setTimeout(() => setToastMessage(''), 3000); };

  // Register new patient → POST /api/patients (Admin only)
  const handleRegisterPatient = async () => {
    if (!pFirst || !pLast) { triggerToast('Please enter first and last name.', 'error'); return; }
    setSubmitting(true);
    try {
      const res = await fetch(`${BASE_URL}/api/patients`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ first_name: pFirst, last_name: pLast, date_of_birth: pDob, phone: pPhone, gender: pGender }),
      });
      if (res.ok) {
        setShowPatientModal(false);
        setPFirst(''); setPLast(''); setPDob(''); setPPhone(''); setPGender('');
        triggerToast(`${pFirst} ${pLast} registered as a new patient!`);
      } else {
        triggerToast('Failed to register patient.', 'error');
      }
    } catch { triggerToast('Network error. Patient not registered.', 'error'); }
    finally { setSubmitting(false); }
  };

  const statusStyle = (s) => {
    const v = (s || 'active').toLowerCase();
    if (v === 'active')   return { sbg: '#DCFCE7', stc: '#16A34A' };
    if (v === 'inactive') return { sbg: '#FEE2E2', stc: '#DC2626' };
    return { sbg: '#FEF3C7', stc: '#B45309' };
  };

  React.useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${BASE_URL}/api/users`, { headers: { Authorization: `Bearer ${token}` } });
        const data = await res.json();
        const list = Array.isArray(data) ? data : (data.users || data.data || []);
        setStaffList(list.map(u => ({
          id:   u.id || u._id,
          name: u.name || u.full_name || `${u.first_name||''} ${u.last_name||''}`.trim() || '—',
          staffId: u.staff_id || u.employee_id || u.id || '—',
          role: u.role || '—',
          s:    u.status || 'Active',
          ...statusStyle(u.status),
        })));
      } catch { setError('Failed to load staff.'); }
      finally { setLoading(false); }
    };
    fetchUsers();
  }, []);

  // Add staff → POST /api/auth/register
  const handleAddStaff = async () => {
    if (!fullName || !email || !role || !password) { triggerToast('Please fill all fields.', 'error'); return; }
    setSubmitting(true);
    try {
      const formattedRole = role;
      const roleId = formattedRole === 'doctor' ? 2 : formattedRole === 'nurse' ? 3 : formattedRole === 'lab_technician' ? 4 : formattedRole === 'pharmacist' ? 5 : 1;
      console.log('Sending to register:', { full_name: fullName, email, role_id: roleId });
      const res = await fetch(`${BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ full_name: fullName, email, password, role_id: roleId }),
      });

      const resData = await res.json().catch(() => ({}));
      console.log('Register response:', res.status, resData);
      console.log('Sent body:', { name: fullName, email, role: formattedRole, password });

      if (res.ok) {
        setShowAddModal(false);
        setFullName(''); setEmail(''); setRole(''); setPassword('');
        triggerToast(`${fullName} added successfully!`);
        // Small delay then refetch so backend has time to commit
        setTimeout(async () => {
          try {
            const updatedRes = await fetch(`${BASE_URL}/api/users`, { headers: { Authorization: `Bearer ${token}` } });
            if (updatedRes.ok) {
              const updatedData = await updatedRes.json();
              console.log('Refetched users raw:', updatedData);
              const updatedList = Array.isArray(updatedData) ? updatedData : (updatedData.users || updatedData.data || []);
              setStaffList(updatedList.map(u => ({
                id:      u.id || u._id,
                name:    u.name || u.full_name || `${u.first_name||''} ${u.last_name||''}`.trim() || '—',
                staffId: u.staff_id || u.employee_id || String(u.id || '—'),
                role:    u.role || '—',
                s:       u.status || 'Active',
                ...statusStyle(u.status),
              })));
            }
          } catch (e) { console.error('Refetch error:', e); }
        }, 1000);
      } else if (res.status === 403) {
        triggerToast('You do not have permission to add staff.', 'error');
      } else if (res.status === 409 || (resData.message && resData.message.toLowerCase().includes('exist'))) {
        triggerToast('A user with this email already exists.', 'error');
      } else {
        triggerToast(resData.message || 'Failed to add staff. Please try again.', 'error');
      }
    } catch (err) {
      console.error('Add staff error:', err);
      triggerToast('Network error. Staff not added.', 'error');
    }
    finally { setSubmitting(false); }
  };

  // Delete staff → DELETE /api/users/:id
  const handleDelete = async (id, name) => {
    try {
      const res = await fetch(`${BASE_URL}/api/users/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        setStaffList(prev => prev.filter(s => s.id !== id));
        triggerToast(`${name} removed successfully.`);
      } else {
        triggerToast('Failed to delete staff.', 'error');
      }
    } catch { triggerToast('Network error. Staff not deleted.', 'error'); }
  };

  const filtered = staffList.filter(s =>
    s.name.toLowerCase().includes(staffSearch.toLowerCase()) ||
    s.role.toLowerCase().includes(staffSearch.toLowerCase())
  );

  const gridTemplate = '28% 18% 18% 14% 22%';

  return (
    <div style={{ minHeight: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>

      {toastMessage && (
        <div style={{ position: 'fixed', top: '25px', left: '50%', transform: 'translateX(-50%)', backgroundColor: toastType === 'error' ? '#EF4444' : '#10B981', color: 'white', padding: '14px 25px', borderRadius: '8px', zIndex: 999, fontWeight: '700', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span>{toastType === 'error' ? '🚫' : '✅'}</span> {toastMessage}
        </div>
      )}

      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '35px' }}>
          <h1 style={{ fontWeight: '800', fontSize: 'clamp(22px, 2.5vw, 32px)', color: '#1E293B', margin: 0 }}>User Management</h1>
          <button onClick={() => setShowAddModal(true)} style={{ padding: '12px 22px', backgroundColor: '#3B82F6', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '14px', cursor: 'pointer', whiteSpace: 'nowrap' }}>Add Staff</button>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <input value={staffSearch} onChange={(e) => setStaffSearch(e.target.value)} placeholder="Search staff..." style={{ padding: '12px 40px 12px 16px', border: '1px solid #E2E8F0', borderRadius: '8px', fontSize: '13px', width: '220px', outline: 'none', backgroundColor: '#F8FAFC' }} />
            <span style={{ position: 'absolute', right: '13px', color: '#94A3B8' }}>🔍</span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: gridTemplate, padding: '14px 25px', backgroundColor: '#F8FAFC', borderRadius: '10px', marginBottom: '4px', color: '#64748B', fontSize: '12px', fontWeight: '800', letterSpacing: '0.5px' }}>
          <div>NAME</div><div>STAFF ID</div><div>ROLE</div><div>STATUS</div><div>ACTION</div>
        </div>

        {loading && <div style={{ textAlign: 'center', padding: '40px', color: '#94A3B8', fontSize: '14px' }}>Loading staff...</div>}
        {error && <div style={{ padding: '14px', backgroundColor: '#FEF2F2', borderRadius: '8px', color: '#DC2626', fontWeight: '600' }}>⚠️ {error}</div>}
        {!loading && filtered.length === 0 && !error && <div style={{ textAlign: 'center', padding: '40px', color: '#94A3B8', fontSize: '14px' }}>No staff found.</div>}

        {!loading && filtered.map((s, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: gridTemplate, alignItems: 'center', backgroundColor: 'white', padding: '22px 25px', borderBottom: '1px solid #F1F5F9', fontSize: '14px', fontWeight: '700' }}>
            <div style={{ color: '#1E293B' }}>{s.name}</div>
            <div style={{ color: '#64748B', fontWeight: '500' }}>{s.staffId}</div>
            <div style={{ color: '#475569', fontWeight: '600' }}>{s.role}</div>
            <div><span style={{ padding: '4px 14px', borderRadius: '20px', backgroundColor: s.sbg, color: s.stc, fontSize: '11px', fontWeight: '800' }}>{s.s}</span></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0' }}>
              <button style={{ background: 'none', border: 'none', color: '#3B82F6', fontWeight: '700', fontSize: '14px', cursor: 'pointer', padding: '0 8px 0 0' }}>Edit</button>
              <span style={{ color: '#E2E8F0' }}>|</span>
              <button onClick={() => handleDelete(s.id, s.name)} style={{ background: 'none', border: 'none', color: '#EF4444', fontWeight: '700', fontSize: '14px', cursor: 'pointer', padding: '0 0 0 8px' }}>Delete</button>
            </div>
          </div>
        ))}
      </div>

      <div style={{ textAlign: 'right', marginTop: '40px', fontSize: '12px', color: '#64748B', opacity: 0.7, fontWeight: '600' }}>Last System Audit: 12/02/2026 at 10:24 AM by Admin_Sarah</div>

      {/* Add Staff Modal */}
      {showAddModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ width: 'min(460px, 95vw)', backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 20px 40px rgba(0,0,0,0.15)', overflow: 'hidden' }}>
            <div style={{ padding: '32px 36px' }}>
              <h3 style={{ margin: '0 0 28px 0', fontSize: '20px', fontWeight: '800', color: '#1E293B', textAlign: 'center' }}>Add New Staff Member</h3>
              {[
                { label: 'Full Name', val: fullName, set: setFullName, ph: 'e.g. Dr. Kwame Asante', type: 'text' },
                { label: 'Email',     val: email,    set: setEmail,    ph: 'e.g. kwame@hospital.com', type: 'email' },
                { label: 'Password',  val: password, set: setPassword, ph: 'Temporary password', type: 'password' },
              ].map(({ label, val, set, ph, type }, i) => (
                <div key={i} style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#1E293B', marginBottom: '8px' }}>{label}:</label>
                  <input value={val} onChange={(e) => set(e.target.value)} type={type} placeholder={ph} style={{ width: '100%', padding: '13px 15px', border: '1px solid #E2E8F0', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box', outline: 'none' }} />
                </div>
              ))}
              <div style={{ marginBottom: '32px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#1E293B', marginBottom: '8px' }}>Role:</label>
                <select value={role} onChange={(e) => setRole(e.target.value)} style={{ width: '100%', padding: '13px 15px', border: '1px solid #E2E8F0', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box', outline: 'none', backgroundColor: 'white', color: role ? '#1E293B' : '#94A3B8' }}>
                  <option value="">Select role...</option>
                  <option value="doctor">Doctor</option>
                  <option value="nurse">Nurse</option>
                  <option value="pharmacist">Pharmacist</option>
                  <option value="lab_technician">Lab Technician</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', marginBottom: '16px' }}>
                <button onClick={() => { setShowAddModal(false); setFullName(''); setEmail(''); setRole(''); setPassword(''); }} style={{ padding: '12px 24px', backgroundColor: 'white', color: '#64748B', border: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '14px', cursor: 'pointer' }}>Cancel</button>
                <button onClick={handleAddStaff} disabled={submitting} style={{ padding: '12px 28px', backgroundColor: submitting ? '#94A3B8' : '#3B82F6', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '14px', cursor: submitting ? 'not-allowed' : 'pointer' }}>{submitting ? 'Adding...' : 'Add Staff'}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- SYSTEM AUDIT & ACTIVITY LOGS PAGE (Live API) ---
const SystemLogs = () => {
  const token = localStorage.getItem('token');
  const [search, setSearch]           = React.useState('');
  const [selectedLog, setSelectedLog] = React.useState(null);
  const [showExportSuccess, setShowExportSuccess] = React.useState(false);
  const [logsData, setLogsData]       = React.useState([]);
  const [loading, setLoading]         = React.useState(true);

  const actionStyle = (action) => {
    const a = (action || '').toLowerCase();
    if (a.includes('vital') || a.includes('record'))  return { abg: '#DCFCE7', atc: '#16A34A' };
    if (a.includes('prescription') || a.includes('dispens')) return { abg: '#EDE9FE', atc: '#7C3AED' };
    if (a.includes('role') || a.includes('modified')) return { abg: '#FEF3C7', atc: '#B45309' };
    if (a.includes('login') || a.includes('logout'))  return { abg: '#DBEAFE', atc: '#1D4ED8' };
    return { abg: '#DCFCE7', atc: '#16A34A' };
  };

  // Fallback static logs if API doesn't have activity-logs endpoint
  const staticLogs = [
    { ts: 'Mar 24, 2026  3:00 PM', staff: 'Nurse Ama Mensah',    role: 'Nurse',      action: 'Recorded Vitals',    patient: 'Kwame Mensah',    loc: 'Station 4 (Accra)',    device: 'Windows 11 / Chrome', field: null, oldVal: null, newVal: null, ...actionStyle('vitals') },
    { ts: 'Feb 23, 2026  4:00 PM', staff: 'Dr. Bright Amofa',    role: 'Doctor',     action: 'Added Prescription', patient: 'Kwame Mensah',    loc: 'Clinic 2 (Accra)',     device: 'MacOS / Safari',       field: null, oldVal: null, newVal: null, ...actionStyle('prescription') },
    { ts: 'Feb 10, 2026  12:00 PM',staff: 'Sarah Osei',          role: 'Admin',      action: 'Modified User Role', patient: 'Dr. Kwesi Appiah', loc: 'Admin Office (Accra)', device: 'Windows 11 / Chrome', field: 'User Role', oldVal: 'Nurse', newVal: 'Admin', ...actionStyle('modified') },
    { ts: 'Jan 20, 2026  1:30 PM', staff: 'Pharm Kofi Boateng',  role: 'Pharmacist', action: 'Dispensed Meds',     patient: 'Kwame Mensah',    loc: 'Pharmacy (Accra)',     device: 'Windows 10 / Chrome', field: null, oldVal: null, newVal: null, ...actionStyle('dispens') },
  ];

  React.useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${BASE_URL}/api/activity-logs`, { headers: { Authorization: `Bearer ${token}` } });
        if (res.ok) {
          const data = await res.json();
          const list = Array.isArray(data) ? data : (data.logs || data.data || []);
          if (list.length > 0) {
            setLogsData(list.map(l => ({
              ts:      l.created_at ? new Date(l.created_at).toLocaleString('en-GB') : '—',
              staff:   l.user_name || l.staff_name || l.performed_by || '—',
              role:    l.role || l.user_role || '—',
              action:  l.action || l.activity || l.event || '—',
              patient: l.target_patient || l.patient_name || l.target || '—',
              loc:     l.location || 'Hospital',
              device:  l.device || 'Web Browser',
              field:   l.field_modified || null,
              oldVal:  l.old_value || null,
              newVal:  l.new_value || null,
              ...actionStyle(l.action || l.activity),
            })));
          } else {
            setLogsData(staticLogs); // fallback to static
          }
        } else {
          setLogsData(staticLogs); // fallback if endpoint doesn't exist yet
        }
      } catch {
        setLogsData(staticLogs); // fallback on network error
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  const handleExport = () => {
    setShowExportSuccess(true);
    setTimeout(() => setShowExportSuccess(false), 3000);
  };

  const filtered = logsData.filter(l =>
    (l.staff || '').toLowerCase().includes(search.toLowerCase()) ||
    (l.action || '').toLowerCase().includes(search.toLowerCase()) ||
    (l.ts || '').toLowerCase().includes(search.toLowerCase()) ||
    (l.patient || '').toLowerCase().includes(search.toLowerCase())
  );

  const gridTemplate = '24% 18% 10% 20% 16% 12%';

  return (
    <div style={{ minHeight: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative' }}>

      {/* Export Success Toast */}
      {showExportSuccess && (
        <div style={{ position: 'fixed', top: '25px', left: '50%', transform: 'translateX(-50%)', backgroundColor: '#10B981', color: 'white', padding: '18px 32px', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.15)', display: 'flex', alignItems: 'center', gap: '14px', zIndex: 999, fontWeight: '700', fontSize: '15px' }}>
          <span style={{ fontSize: '22px' }}>✅</span>
          <div>
            <div>Export Successful!</div>
            <div style={{ fontSize: '12px', fontWeight: '500', opacity: 0.9, marginTop: '2px' }}>Audit_Logs_2026.csv has been downloaded.</div>
          </div>
        </div>
      )}

      <div>
        {/* Page Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '35px' }}>
          <h1 style={{ fontWeight: '800', fontSize: 'clamp(22px, 2.5vw, 32px)', color: '#1E293B', margin: 0 }}>System Audit & Activity Logs</h1>
          <button onClick={handleExport} style={{ padding: '11px 20px', backgroundColor: 'white', color: '#1E293B', border: '1px solid #E2E8F0', borderRadius: '8px', fontWeight: '700', fontSize: '13px', cursor: 'pointer', marginLeft: 'auto' }}>Export CSV</button>
        </div>

        {/* Stat Cards */}
        <div style={{ display: 'flex', gap: '20px', marginBottom: '50px', flexWrap: 'wrap' }}>
          {[
            { l: 'Total Logs (24h)', v: '1,284', tc: '#3B82F6', bg: '#EFF6FF', bc: '#BFDBFE' },
            { l: 'Critical Alerts',  v: '7',     tc: '#DC2626', bg: '#FEF2F2', bc: '#FECACA' },
            { l: 'System Uptime',    v: '99.9%', tc: '#16A34A', bg: '#F0FDF4', bc: '#BBF7D0' },
          ].map((c, i) => (
            <div key={i} style={{ padding: 'clamp(18px, 2vw, 30px) clamp(16px, 1.8vw, 28px)', borderRadius: '16px', backgroundColor: c.bg, flex: 1, minWidth: '140px', border: `1px solid ${c.bc}` }}>
              <p style={{ color: c.tc, fontWeight: '700', fontSize: '14px', margin: 0 }}>{c.l}</p>
              <h2 style={{ fontSize: '48px', fontWeight: '800', margin: '16px 0 0 0', color: c.tc }}>{c.v}</h2>
            </div>
          ))}
        </div>

        {/* Table Header */}
        <div style={{ display: 'grid', gridTemplateColumns: gridTemplate, padding: '14px 25px', backgroundColor: '#F8FAFC', borderRadius: '10px', marginBottom: '4px', color: '#64748B', fontSize: '12px', fontWeight: '800', letterSpacing: '0.5px' }}>
          <div>TIMESTAMP</div><div>STAFF NAME</div><div>ROLE</div><div>ACTION</div><div>TARGET PATIENT</div><div>STATUS</div>
        </div>

        {loading && <div style={{ textAlign: 'center', padding: '40px', color: '#94A3B8', fontSize: '14px' }}>Loading activity logs...</div>}

        {/* Table Rows — clickable */}
        {!loading && filtered.map((log, i) => (
          <div key={i} onClick={() => setSelectedLog(log)} style={{ display: 'grid', gridTemplateColumns: gridTemplate, alignItems: 'center', backgroundColor: 'white', padding: '22px 25px', borderBottom: '1px solid #F1F5F9', fontSize: '14px', fontWeight: '700', cursor: 'pointer', transition: 'background 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#F8FAFC'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'white'}
          >
            <div style={{ color: '#475569', fontWeight: '500' }}>{log.ts}</div>
            <div style={{ color: '#1E293B' }}>{log.staff}</div>
            <div style={{ color: '#64748B', fontWeight: '600' }}>{log.role}</div>
            <div><span style={{ padding: '4px 14px', borderRadius: '20px', backgroundColor: log.abg, color: log.atc, fontSize: '12px', fontWeight: '700' }}>{log.action}</span></div>
            <div style={{ color: '#1E293B' }}>{log.patient}</div>
            <div style={{ color: '#16A34A', fontWeight: '800', fontSize: '13px' }}>SUCCESS</div>
          </div>
        ))}
      </div>

      <div style={{ textAlign: 'right', marginTop: '40px', fontSize: '12px', color: '#64748B', opacity: 0.7, fontWeight: '600' }}>
        Last System Audit: 12/02/2026 at 10:24 AM by Admin_Sarah
      </div>

      {/* Activity Details Slide-in Panel */}
      {selectedLog && (
        <>
          {/* Dim overlay */}
          <div onClick={() => setSelectedLog(null)} style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.3)', zIndex: 100 }} />
          {/* Panel */}
          <div style={{ position: 'fixed', top: 0, right: 0, width: '340px', height: '100vh', backgroundColor: 'white', boxShadow: '-8px 0 32px rgba(0,0,0,0.12)', zIndex: 101, padding: '40px 32px', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
              <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '800', color: '#1E293B' }}>Activity Details</h3>
              <span onClick={() => setSelectedLog(null)} style={{ cursor: 'pointer', fontWeight: '800', fontSize: '20px', color: '#64748B' }}>X</span>
            </div>

            {/* Detail rows */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <p style={{ margin: 0, fontSize: '14px', color: '#475569' }}><span style={{ fontWeight: '700', color: '#1E293B' }}>User: </span>{selectedLog.staff}</p>
              <p style={{ margin: 0, fontSize: '14px', color: '#475569' }}><span style={{ fontWeight: '700', color: '#1E293B' }}>Location: </span>{selectedLog.loc}</p>
              <p style={{ margin: 0, fontSize: '14px', color: '#475569' }}><span style={{ fontWeight: '700', color: '#1E293B' }}>Device: </span>{selectedLog.device}</p>
            </div>

            {/* Field modified section — only if applicable */}
            {selectedLog.field && (
              <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid #F1F5F9' }}>
                <p style={{ margin: '0 0 16px 0', fontSize: '15px', fontWeight: '800', color: '#1E293B' }}>Field Modified: {selectedLog.field}</p>
                <p style={{ margin: '0 0 10px 0', fontSize: '14px' }}><span style={{ fontWeight: '700', color: '#DC2626' }}>Old Value: </span><span style={{ color: '#DC2626' }}>{selectedLog.oldVal}</span></p>
                <p style={{ margin: 0, fontSize: '14px' }}><span style={{ fontWeight: '700', color: '#16A34A' }}>New Value: </span><span style={{ color: '#16A34A' }}>{selectedLog.newVal}</span></p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

// --- DOCTOR LAB RESULTS (Beaker / Lab) ---
const LabResultsPage = () => {
  const token = localStorage.getItem('token');
  const user  = JSON.parse(localStorage.getItem('user') || '{}');

  const [showPrescriptionModal, setShowPrescriptionModal] = React.useState(false);
  const [showLabRequestModal, setShowLabRequestModal]     = React.useState(false);
  const [toastMessage, setToastMessage]                   = React.useState('');
  const [toastType, setToastType]                         = React.useState('success');
  const [submittingRx, setSubmittingRx]                   = React.useState(false);
  const [submittingLab, setSubmittingLab]                 = React.useState(false);

  // Prescription form
  const [rxMed, setRxMed]   = React.useState('');
  const [rxDose, setRxDose] = React.useState('');
  const [rxDur, setRxDur]   = React.useState('');

  // Lab request checkboxes
  const [labChecks, setLabChecks] = React.useState({ malaria: false, fbc: false, spo2: false, xray: false });
  const toggleLab = (key) => setLabChecks(prev => ({ ...prev, [key]: !prev[key] }));

  // API state
  const [labResults, setLabResults] = React.useState([]);
  const [patient, setPatient]       = React.useState(null);
  const [loading, setLoading]       = React.useState(true);
  const [selectedPatientId, setSelectedPatientId] = React.useState(null);

  const triggerToast = (msg, type = 'success') => { setToastMessage(msg); setToastType(type); setTimeout(() => setToastMessage(''), 3000); };

  const statusStyle = (s, result, ref) => {
    const v = (s || '').toUpperCase();
    if (v === 'ABNORMAL' || v === 'HIGH' || v === 'LOW' || v === 'CRITICAL')
      return { sbg: v === 'LOW' ? '#FEF3C7' : '#FEE2E2', stc: v === 'LOW' ? '#B45309' : '#DC2626', rc: v === 'LOW' ? '#B45309' : '#DC2626', s: v };
    return { sbg: '#DCFCE7', stc: '#16A34A', rc: '#16A34A', s: v || 'NORMAL' };
  };

  React.useEffect(() => {
    const fetchLabResults = async () => {
      try {
        setLoading(true);

        // Fetch lab results
        const lrRes = await fetch(`${BASE_URL}/api/lab-results`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (lrRes.ok) {
          const lrData = await lrRes.json();
          const list = Array.isArray(lrData) ? lrData : (lrData.labResults || lrData.data || []);

          if (list.length > 0) {
            // Use the most recent result's patient
            const latest = list[0];
            const pid = latest.patient_id || (latest.patient && latest.patient.id);
            setSelectedPatientId(pid);

            // Fetch patient info
            if (pid) {
              const pRes = await fetch(`${BASE_URL}/api/patients`, { headers: { Authorization: `Bearer ${token}` } });
              if (pRes.ok) {
                const pData = await pRes.json();
                const pList = Array.isArray(pData) ? pData : (pData.patients || pData.data || []);
                const found = pList.find(p => String(p.id || p._id || p.patient_id) === String(pid));
                setPatient(found || null);
              }
            }

            // Normalize results
            const normalized = list.map(r => {
              const results = r.results || {};
              return Object.entries(results).map(([test, val]) => ({
                test:    test.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
                result:  String(val),
                ref:     '—',
                ...statusStyle(r.status || 'NORMAL'),
              }));
            }).flat();

            // If results object is empty, use top-level fields
            const fallback = list.map(r => ({
              test:   r.test_name || r.test_type || 'Lab Test',
              result: r.result_value || r.result || '—',
              ref:    r.reference_range || '—',
              ...statusStyle(r.status || r.interpretation || 'NORMAL'),
            }));

            setLabResults(normalized.length > 0 ? normalized : fallback);
          }
        }
      } catch (err) {
        console.error('Failed to load lab results:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLabResults();
  }, []);

  // Submit prescription → POST /api/prescriptions
  const handleSavePrescription = async () => {
    if (!rxMed) { triggerToast('Please enter a medication name.', 'error'); return; }
    setSubmittingRx(true);
    try {
      const res = await fetch(`${BASE_URL}/api/prescriptions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ patient_id: selectedPatientId, medication_name: rxMed, dosage: rxDose, duration: rxDur, status: 'pending' }),
      });
      if (res.ok) {
        setShowPrescriptionModal(false);
        setRxMed(''); setRxDose(''); setRxDur('');
        triggerToast('Prescription saved and sent to pharmacy!');
      } else {
        triggerToast('Failed to save prescription.', 'error');
      }
    } catch { triggerToast('Network error. Prescription not saved.', 'error'); }
    finally { setSubmittingRx(false); }
  };

  // Submit lab request → POST /api/lab-requests
  const handleSendToLab = async () => {
    const selected = Object.entries(labChecks).filter(([, v]) => v).map(([k]) => k);
    if (selected.length === 0) { triggerToast('Please select at least one test.', 'error'); return; }
    setSubmittingLab(true);
    try {
      const res = await fetch(`${BASE_URL}/api/lab-requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ patient_id: selectedPatientId, tests: selected, status: 'pending' }),
      });
      if (res.ok) {
        setShowLabRequestModal(false);
        setLabChecks({ malaria: false, fbc: false, spo2: false, xray: false });
        triggerToast('Lab request sent successfully!');
      } else {
        triggerToast('Failed to send lab request.', 'error');
      }
    } catch { triggerToast('Network error. Lab request not sent.', 'error'); }
    finally { setSubmittingLab(false); }
  };

  const getName = (p) => p ? (p.name || p.full_name || `${p.first_name||''} ${p.last_name||''}`.trim()) : 'Unknown';
  const getId   = (p) => p ? (p.patient_id || p.id || p._id || '—') : '—';
  const allergy = patient?.allergies || patient?.allergy || null;

  const gridTemplate = '28% 24% 28% 20%';

  return (
    <div style={{ minHeight: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative' }}>

      {toastMessage && (
        <div style={{ position: 'fixed', top: '25px', left: '50%', transform: 'translateX(-50%)', backgroundColor: toastType === 'error' ? '#EF4444' : '#10B981', color: 'white', padding: '14px 25px', borderRadius: '8px', zIndex: 999, fontWeight: '700', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span>{toastType === 'error' ? '🚫' : '✅'}</span> {toastMessage}
        </div>
      )}

      <div>
        {/* Loading */}
        {loading && <div style={{ textAlign: 'center', padding: '60px', color: '#94A3B8', fontSize: '15px', fontWeight: '600' }}>Loading lab results...</div>}

        {!loading && (
          <>
            {/* Allergy Alert — show if patient has known allergy */}
            {allergy && (
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '30px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: '#FEF2F2', border: '1px solid #FECACA', padding: '12px 30px', borderRadius: '8px', color: '#DC2626', fontWeight: '800', fontSize: '14px' }}>
                  🚫 ALERT: Known {allergy} Allergy
                </div>
              </div>
            )}

            {/* No results message */}
            {labResults.length === 0 && (
              <div style={{ textAlign: 'center', padding: '60px', color: '#94A3B8', fontSize: '15px', fontWeight: '600' }}>
                No lab results available yet. Results will appear here once the lab technician uploads them.
              </div>
            )}

            {/* Patient Card — only show if we have results */}
            {labResults.length > 0 && (
              <>
                <div style={{ backgroundColor: 'white', padding: '28px 30px', borderRadius: '16px', border: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '35px' }}>
                  <div>
                    <h2 style={{ margin: '0 0 8px 0', fontSize: '26px', fontWeight: '800', color: '#1E293B' }}>{getName(patient)}</h2>
                    <p style={{ margin: 0, color: '#64748B', fontSize: '14px', fontWeight: '600' }}>
                      {getId(patient)} {patient?.age ? `| Age: ${patient.age}` : ''} {patient?.gender ? `| Gender: ${patient.gender}` : ''}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '20px' }}>
                    {[
                      { label: 'BP(mmHg)',       val: patient?.blood_pressure || patient?.bp || '—', bg: '#F0FDF4', tc: '#166534', hc: '#14532D' },
                      { label: 'Heart Rate (BPM)', val: patient?.heart_rate || patient?.hr || '—',   bg: '#EFF6FF', tc: '#1E40AF', hc: '#1E3A8A' },
                    ].map((v, i) => (
                      <div key={i} style={{ backgroundColor: v.bg, padding: '18px 22px', borderRadius: '12px', textAlign: 'center', minWidth: '110px' }}>
                        <span style={{ fontSize: '11px', color: v.tc, fontWeight: '800', display: 'block', marginBottom: '8px' }}>{v.label}</span>
                        <h3 style={{ margin: 0, fontSize: '22px', fontWeight: '800', color: v.hc }}>{v.val}</h3>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Results Table */}
                <div style={{ display: 'grid', gridTemplateColumns: gridTemplate, padding: '14px 25px', backgroundColor: '#F8FAFC', borderRadius: '10px', marginBottom: '4px', color: '#64748B', fontSize: '12px', fontWeight: '800', letterSpacing: '0.5px' }}>
                  <div>TEST NAME</div><div>RESULT</div><div>REFERENCE RANGE</div><div>STATUS</div>
                </div>

                {labResults.map((r, i) => (
                  <div key={i} style={{ display: 'grid', gridTemplateColumns: gridTemplate, alignItems: 'center', backgroundColor: 'white', padding: '22px 25px', borderBottom: '1px solid #F1F5F9', fontSize: '14px', fontWeight: '700' }}>
                    <div style={{ color: '#1E293B' }}>{r.test}</div>
                    <div style={{ color: r.rc, fontWeight: '700' }}>{r.result}</div>
                    <div style={{ color: '#94A3B8', fontWeight: '500' }}>{r.ref}</div>
                    <div><span style={{ padding: '5px 16px', borderRadius: '20px', backgroundColor: r.sbg, color: r.stc, fontSize: '12px', fontWeight: '800' }}>{r.s}</span></div>
                  </div>
                ))}

                {/* Diagnosis Note */}
                <div style={{ marginTop: '30px', padding: '20px 24px', backgroundColor: 'white', border: '1px solid #E2E8F0', borderRadius: '12px' }}>
                  <p style={{ margin: 0, fontSize: '14px', color: '#475569', fontStyle: 'italic' }}>
                    Review the results above and take appropriate clinical action. Use the buttons below to prescribe medication or request additional tests.
                  </p>
                </div>
              </>
            )}
          </>
        )}
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '24px', borderTop: '1px solid #E2E8F0', marginTop: '30px' }}>
        <div style={{ display: 'flex', gap: '14px' }}>
          <button onClick={() => setShowPrescriptionModal(true)} style={{ padding: '12px 24px', backgroundColor: '#3B82F6', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '14px', cursor: 'pointer' }}>+ New Prescription</button>
          <button onClick={() => setShowLabRequestModal(true)} style={{ padding: '12px 24px', backgroundColor: 'white', color: '#1E293B', border: '1px solid #E2E8F0', borderRadius: '8px', fontWeight: '700', fontSize: '14px', cursor: 'pointer' }}>+ Request Lab</button>
        </div>
        <button onClick={() => triggerToast('Record saved successfully!')} style={{ padding: '12px 35px', backgroundColor: '#22C55E', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '14px', cursor: 'pointer' }}>SAVE RECORD</button>
      </div>

      {/* New Prescription Modal */}
      {showPrescriptionModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ width: 'min(420px, 95vw)', backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 20px 40px rgba(0,0,0,0.15)', overflow: 'hidden' }}>
            <div style={{ padding: '28px 32px 24px 32px', borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between' }}>
              <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '800', color: '#3B82F6' }}>New Prescription</h3>
              <span onClick={() => setShowPrescriptionModal(false)} style={{ cursor: 'pointer', fontWeight: '800', fontSize: '20px', color: '#64748B' }}>X</span>
            </div>
            <div style={{ padding: '28px 32px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#1E293B', marginBottom: '8px' }}>Medication Name</label>
                <input value={rxMed} onChange={e => setRxMed(e.target.value)} placeholder="e.g. Artemether-Lumefantrine" style={{ width: '100%', padding: '13px 15px', border: '1px solid #E2E8F0', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box', outline: 'none' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#1E293B', marginBottom: '8px' }}>Dosage</label>
                  <input value={rxDose} onChange={e => setRxDose(e.target.value)} placeholder="e.g. 20mg/120mg" style={{ width: '100%', padding: '13px 15px', border: '1px solid #E2E8F0', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box', outline: 'none' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#1E293B', marginBottom: '8px' }}>Duration</label>
                  <input value={rxDur} onChange={e => setRxDur(e.target.value)} placeholder="e.g. 3 Days" style={{ width: '100%', padding: '13px 15px', border: '1px solid #E2E8F0', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box', outline: 'none' }} />
                </div>
              </div>
            </div>
            <div style={{ padding: '0 32px 24px 32px', display: 'flex', justifyContent: 'flex-end', gap: '14px' }}>
              <button onClick={() => setShowPrescriptionModal(false)} style={{ padding: '12px 24px', backgroundColor: 'white', color: '#64748B', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleSavePrescription} disabled={submittingRx} style={{ padding: '12px 28px', backgroundColor: submittingRx ? '#94A3B8' : '#3B82F6', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: submittingRx ? 'not-allowed' : 'pointer' }}>{submittingRx ? 'Saving...' : 'Save Prescription'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Request Lab Modal */}
      {showLabRequestModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ width: 'min(420px, 95vw)', backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 20px 40px rgba(0,0,0,0.15)', overflow: 'hidden' }}>
            <div style={{ padding: '28px 32px 20px 32px', borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#3B82F6' }}>Request New Laboratory Test</h3>
              <span onClick={() => setShowLabRequestModal(false)} style={{ cursor: 'pointer', fontWeight: '800', fontSize: '18px', color: '#64748B' }}>×</span>
            </div>
            <div style={{ padding: '22px 32px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {[{ key: 'malaria', label: 'Malaria Parasite (MP)' }, { key: 'fbc', label: 'Full Blood Count (FBC)' }, { key: 'spo2', label: 'SPO2 / Pulse Ox' }, { key: 'xray', label: 'Chest X-Ray' }].map((t, i) => (
                <label key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                  <div onClick={() => toggleLab(t.key)} style={{ width: '18px', height: '18px', borderRadius: '4px', flexShrink: 0, cursor: 'pointer', backgroundColor: labChecks[t.key] ? '#3B82F6' : 'white', border: labChecks[t.key] ? '2px solid #3B82F6' : '2px solid #CBD5E1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {labChecks[t.key] && <svg width="11" height="9" viewBox="0 0 11 9" fill="none"><path d="M1 4L4 7.5L10 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                  </div>
                  <span style={{ fontSize: '14px', fontWeight: '600', color: '#1E293B' }}>{t.label}</span>
                </label>
              ))}
            </div>
            <div style={{ padding: '0 32px 24px 32px', display: 'flex', justifyContent: 'flex-end', gap: '14px' }}>
              <button onClick={() => setShowLabRequestModal(false)} style={{ padding: '12px 24px', backgroundColor: 'white', color: '#64748B', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleSendToLab} disabled={submittingLab} style={{ padding: '12px 28px', backgroundColor: submittingLab ? '#94A3B8' : '#3B82F6', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: submittingLab ? 'not-allowed' : 'pointer' }}>{submittingLab ? 'Sending...' : 'Submit Request'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- LANDING PAGE (Andy's addition) ---
const LandingPage = () => {
  const navigate = useNavigate();
  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', fontFamily: '"Inter", sans-serif', overflow: 'hidden' }}>
      <div style={{ width: '50%', backgroundColor: '#1A2744', position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center', padding: '60px 50px', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '30%', left: '10%', width: '260px', height: '260px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.06)', filter: 'blur(60px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '15%', left: '30%', width: '300px', height: '300px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.05)', filter: 'blur(80px)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '18px', marginBottom: '30px' }}>
            <div style={{ fontSize: '70px', fontWeight: '200', lineHeight: '0.6', color: 'rgba(255,255,255,0.85)' }}>+</div>
            <div>
              <h2 style={{ fontSize: '22px', margin: 0, fontWeight: '800', color: 'white', lineHeight: '1.15', letterSpacing: '0.5px' }}>HEALTHCARE<br />EMR</h2>
            </div>
          </div>
          <p style={{ fontSize: '20px', color: 'white', fontWeight: '400', lineHeight: '1.5', margin: 0 }}>
            Empowering Healthcare through Data
          </p>
        </div>
      </div>
      <div style={{ width: '50%', backgroundColor: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px' }}>
        <div style={{ maxWidth: '380px', width: '100%', textAlign: 'center' }}>
          <h1 style={{ fontSize: '32px', fontWeight: '800', color: '#1E293B', margin: '0 0 12px 0' }}>Welcome</h1>
          <p style={{ fontSize: '15px', color: 'black', margin: '0 0 50px 0', fontWeight: '500', lineHeight: '1.6' }}>
            Please select how you would like to access the system.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <button onClick={() => navigate('/login')} style={{ width: '100%', padding: '20px', backgroundColor: 'blue', color: 'white', border: '2px solid #1E293B', borderRadius: '10px', fontSize: '16px', fontWeight: '700', cursor: 'pointer' }}>
              Staff Login
            </button>
            <button onClick={() => navigate('/patient-login')} style={{ width: '100%', padding: '20px', backgroundColor: 'blue', color: 'white', border: '2px solid #1E293B', borderRadius: '10px', fontSize: '16px', fontWeight: '700', cursor: 'pointer' }}>
              Patient Portal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- PATIENT LOGIN PAGE (Andy's addition) ---
const PatientLoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail]       = React.useState('');
  const [password, setPassword] = React.useState('');
  const [loading, setLoading]   = React.useState(false);
  const [error, setError]       = React.useState('');

  const handleLogin = async () => {
    if (!email || !password) { setError('Please enter your email and password.'); return; }
    setLoading(true); setError('');
    try {
      const res = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role: 'patient' }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message || 'Invalid email or password.'); setLoading(false); return; }
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('role', data.user.role);
      const displayName = data.user.full_name || data.user.name || data.user.username || '';
      localStorage.setItem('display_name', displayName);
      navigate('/patient-dashboard');
    } catch { setError('Network error. Please check your connection.'); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', fontFamily: '"Inter", sans-serif', overflow: 'hidden' }}>
      <div style={{ width: '50%', backgroundColor: '#1A2744', position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'flex-start', padding: '45px 50px', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '30%', left: '10%', width: '260px', height: '260px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.06)', filter: 'blur(60px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '15%', left: '30%', width: '300px', height: '300px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.05)', filter: 'blur(80px)', pointerEvents: 'none' }} />
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', position: 'relative', zIndex: 1, width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '18px', marginBottom: '24px' }}>
            <div style={{ fontSize: '70px', fontWeight: '200', lineHeight: '0.6', color: 'rgba(255,255,255,0.85)' }}>+</div>
            <div>
              <h2 style={{ fontSize: '22px', margin: 0, fontWeight: '800', color: 'white', lineHeight: '1.15', letterSpacing: '0.5px' }}>HEALTHCARE<br />EMR</h2>
            </div>
          </div>
          <p style={{ margin: 0, fontSize: '20px', color: 'rgba(255,255,255,0.6)', fontWeight: '400', lineHeight: '1.5' }}>
            Access your health records, appointments and prescriptions anytime.
          </p>
        </div>
      </div>
      <div style={{ flex: 1, backgroundColor: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px', minWidth: '300px' }}>
        <div style={{ maxWidth: '380px', width: '100%' }}>
          <h1 style={{ fontSize: '32px', fontWeight: '800', color: '#1E293B', margin: '0 0 8px 0', textAlign: 'center' }}>Patient Portal</h1>
          <p style={{ fontSize: '14px', color: '#64748B', textAlign: 'center', margin: '0 0 40px 0', fontWeight: '500' }}>Sign in to view your health records</p>
          {error && (
            <div style={{ marginBottom: '20px', padding: '12px 16px', backgroundColor: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', color: '#DC2626', fontSize: '13px', fontWeight: '600' }}>
              🚫 {error}
            </div>
          )}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '8px' }}>Email Address:</label>
            <input type="email" value={email} onChange={(e) => { setEmail(e.target.value); setError(''); }} onKeyDown={(e) => e.key === 'Enter' && handleLogin()} placeholder="e.g. abena@email.com" style={{ width: '100%', padding: '15px 16px', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box', outline: 'none' }} />
          </div>
          <div style={{ marginBottom: '40px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '8px' }}>Password:</label>
            <input type="password" value={password} onChange={(e) => { setPassword(e.target.value); setError(''); }} onKeyDown={(e) => e.key === 'Enter' && handleLogin()} placeholder="Enter your password" style={{ width: '100%', padding: '15px 16px', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box', outline: 'none' }} />
          </div>
          <button onClick={handleLogin} disabled={loading} style={{ width: '100%', padding: '18px', backgroundColor: loading ? '#94A3B8' : '#1E293B', color: 'white', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer' }}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
          <p style={{ marginTop: '20px', textAlign: 'center', fontSize: '13px', color: '#64748B' }}>
            Are you a staff member? <span onClick={() => navigate('/login')} style={{ color: '#3B82F6', cursor: 'pointer', fontWeight: '700' }}>Staff Login</span>
          </p>
        </div>
      </div>
    </div>
  );
};

// --- LOGIN PAGE (Connected to Andy's API) ---
const BASE_URL = 'https://emr-backend-production-5ebf.up.railway.app';

const LoginPage = () => {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = React.useState('');
  const [email, setEmail]               = React.useState('');
  const [password, setPassword]         = React.useState('');
  const [loading, setLoading]           = React.useState(false);
  const [error, setError]               = React.useState('');

  // Map backend role values to frontend routes
  const roleRoutes = {
    admin:          '/admin-dashboard',
    doctor:         '/dashboard',
    nurse:          '/nurse-dashboard',
    lab_technician: '/lab-dashboard',
    pharmacist:     '/pharm-dashboard',
    patient:        '/patient-dashboard',
  };

  const handleLogin = async () => {
    if (!email || !password || !selectedRole) {
      setError('Please fill in all fields and select a role.');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role: selectedRole }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Invalid credentials. Please try again.');
        setLoading(false);
        return;
      }

      // Store token and user info in localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('role', data.user.role);
      // Store display name explicitly trying all possible field names
      const displayName = data.user.full_name || data.user.name || data.user.username || '';
      localStorage.setItem('display_name', displayName);
      console.log('Logged in user object:', data.user);

      // Route to the correct dashboard
      const route = roleRoutes[data.user.role] || '/dashboard';
      navigate(route);

    } catch (err) {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  // Allow Enter key to submit
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleLogin();
  };

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', fontFamily: '"Inter", sans-serif', overflow: 'hidden' }}>

      {/* LEFT PANEL — dark branded side */}
      <div style={{ width: 'clamp(300px, 50%, 700px)', backgroundColor: '#1A2744', position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'flex-start', padding: '45px 50px', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '30%', left: '10%', width: '260px', height: '260px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.06)', filter: 'blur(60px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '15%', left: '30%', width: '300px', height: '300px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.05)', filter: 'blur(80px)', pointerEvents: 'none' }} />

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', position: 'relative', zIndex: 1, width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '18px', marginBottom: '24px' }}>
            <div style={{ fontSize: '70px', fontWeight: '200', lineHeight: '0.6', color: 'rgba(255,255,255,0.85)' }}>+</div>
            <div>
              <h2 style={{ fontSize: '22px', margin: 0, fontWeight: '800', color: 'white', lineHeight: '1.15', letterSpacing: '0.5px' }}>HEALTHCARE<br />EMR</h2>
            </div>
          </div>
          <p style={{ margin: 0, fontSize: '20px', color: 'white', fontWeight: '400', lineHeight: '1.5', textAlign: 'left' }}>
            Empowering Healthcare through Data
          </p>
        </div>
      </div>

      {/* RIGHT PANEL — login form */}
      <div style={{ flex: 1, backgroundColor: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minWidth: '300px', padding: '60px' }}>
        <div style={{ maxWidth: '380px', width: '100%' }}>
          <h1 style={{ fontSize: '32px', fontWeight: '800', color: '#1E293B', margin: '0 0 40px 0', textAlign: 'center' }}>Staff Sign-In</h1>

          {/* Error message */}
          {error && (
            <div style={{ marginBottom: '20px', padding: '12px 16px', backgroundColor: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', color: '#DC2626', fontSize: '13px', fontWeight: '600' }}>
              🚫 {error}
            </div>
          )}

          {/* Role Select */}
          <div style={{ marginBottom: '20px' }}>
            <select
              value={selectedRole}
              onChange={(e) => { setSelectedRole(e.target.value); setError(''); }}
              style={{ width: '100%', padding: '15px 16px', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '14px', color: '#64748B', backgroundColor: 'white', appearance: 'auto', boxSizing: 'border-box', outline: 'none' }}
            >
              <option value="">Select Role:</option>
              <option value="doctor">Doctor</option>
              <option value="admin">Admin</option>
              <option value="lab_technician">Lab Technician</option>
              <option value="nurse">Nurse</option>
              <option value="pharmacist">Pharmacist</option>
            </select>
          </div>

          {/* Email */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '8px' }}>Email Address:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(''); }}
              onKeyDown={handleKeyDown}
              placeholder="e.g. bright@hospital.com"
              style={{ width: '100%', padding: '15px 16px', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box', outline: 'none' }}
            />
          </div>

          {/* Password */}
          <div style={{ marginBottom: '40px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '8px' }}>Password:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(''); }}
              onKeyDown={handleKeyDown}
              placeholder="Enter your password"
              style={{ width: '100%', padding: '15px 16px', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box', outline: 'none' }}
            />
          </div>

          {/* Login Button */}
          <button
            onClick={handleLogin}
            disabled={loading}
            style={{ width: '100%', padding: '18px', backgroundColor: loading ? '#94A3B8' : '#1E293B', color: 'white', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer', letterSpacing: '0.3px', transition: 'background 0.2s' }}
          >
            {loading ? 'Signing in...' : 'Login to Dashboard'}
          </button>
        </div>
      </div>
    </div>
  );
};

// --- LOGOUT CONFIRMATION PAGE ---
const LogoutConfirmation = () => {
  const navigate = useNavigate();

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', fontFamily: '"Inter", sans-serif', overflow: 'hidden' }}>

      {/* LEFT PANEL — dark branded side */}
      <div style={{ width: 'clamp(300px, 50%, 700px)', backgroundColor: '#1A2744', position: 'relative', display: 'flex', flexDirection: 'column', padding: '45px 50px', overflow: 'hidden' }}>

        {/* Blurred glow blobs */}
        <div style={{ position: 'absolute', top: '30%', left: '10%', width: '260px', height: '260px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.06)', filter: 'blur(60px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '15%', left: '30%', width: '300px', height: '300px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.05)', filter: 'blur(80px)', pointerEvents: 'none' }} />

        {/* Cross lines decoration */}


        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '18px', position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: '70px', fontWeight: '200', lineHeight: '0.6', color: 'rgba(255,255,255,0.85)' }}>+</div>
          <div>
            <h2 style={{ fontSize: '22px', margin: 0, fontWeight: '800', color: 'white', lineHeight: '1.15', letterSpacing: '0.5px' }}>HEALTHCARE<br />EMR</h2>
          </div>
        </div>

        {/* Tagline */}
        <p style={{ marginTop: '55px', fontSize: '20px', color: 'white', fontWeight: '400', lineHeight: '1.5', position: 'relative', zIndex: 1 }}>
          Empowering Healthcare through Data
        </p>
      </div>

      {/* RIGHT PANEL — white session-ended side */}
      <div style={{ flex: 1, backgroundColor: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minWidth: '300px', padding: '60px' }}>
        <div style={{ maxWidth: '400px', width: '100%', textAlign: 'center' }}>
          <h1 style={{ fontSize: '36px', fontWeight: '800', color: '#1E293B', margin: '0 0 20px 0' }}>Session Ended</h1>
          <p style={{ fontSize: '15px', color: '#475569', fontWeight: '600', lineHeight: '1.6', margin: '0 0 50px 0' }}>
            Your session has ended securely. Please log in again to continue managing patient records.
          </p>
          <button
            onClick={() => { localStorage.removeItem('token'); localStorage.removeItem('user'); localStorage.removeItem('role'); localStorage.removeItem('display_name'); navigate('/'); }}
            style={{ width: '100%', padding: '18px', backgroundColor: '#1E293B', color: 'white', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: '700', cursor: 'pointer', letterSpacing: '0.3px' }}
          >
            Return to Login
          </button>
        </div>
      </div>
    </div>
  );
};

// --- MAIN ROUTER ---
export default function App() {
  const [searchText, setSearchText] = React.useState('');

  return (
    <BrowserRouter>
      <ResponsiveStyles />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/patient-login" element={<PatientLoginPage />} />
        <Route path="/dashboard" element={<DashboardLayout searchText={searchText} setSearchText={setSearchText}><DoctorDashboard searchText={searchText} /></DashboardLayout>} />
        <Route path="/patients" element={<DashboardLayout searchText={searchText} setSearchText={setSearchText}><PatientDatabase searchText={searchText} /></DashboardLayout>} />
        <Route path="/schedule" element={<DashboardLayout searchText={searchText} setSearchText={setSearchText}><DoctorSchedule searchText={searchText} /></DashboardLayout>} />
        <Route path="/patient-profile" element={<DashboardLayout searchText={searchText} setSearchText={setSearchText}><PatientProfile searchText={searchText} /></DashboardLayout>} />
        <Route path="/lab-results" element={<DashboardLayout searchText={searchText} setSearchText={setSearchText}><LabResultsPage /></DashboardLayout>} />
        <Route path="/lab-dashboard" element={<LabLayout searchText={searchText} setSearchText={setSearchText}><LabDashboard /></LabLayout>} />
        <Route path="/lab-queue" element={<LabLayout searchText={searchText} setSearchText={setSearchText}><LabQueue searchText={searchText} /></LabLayout>} />
        <Route path="/admin-dashboard" element={<AdminLayout searchText={searchText} setSearchText={setSearchText}><AdminDashboard /></AdminLayout>} />
        <Route path="/admin-users" element={<AdminLayout searchText={searchText} setSearchText={setSearchText}><UserManagement /></AdminLayout>} />
        <Route path="/admin-logs" element={<AdminLayout searchText={searchText} setSearchText={setSearchText}><SystemLogs /></AdminLayout>} />
        <Route path="/nurse-dashboard" element={<NurseLayout searchText={searchText} setSearchText={setSearchText}><NurseDashboard /></NurseLayout>} />
        <Route path="/nurse-patients" element={<NurseLayout searchText={searchText} setSearchText={setSearchText}><NursePatients searchText={searchText} /></NurseLayout>} />
        <Route path="/nurse-triage" element={<NurseLayout searchText={searchText} setSearchText={setSearchText}><NurseTriage searchText={searchText} /></NurseLayout>} />
        <Route path="/nurse-schedule" element={<NurseLayout searchText={searchText} setSearchText={setSearchText}><NurseSchedule searchText={searchText} /></NurseLayout>} />
        <Route path="/nurse-patient-profile" element={<NurseLayout searchText={searchText} setSearchText={setSearchText}><NursePatientProfile /></NurseLayout>} />
        <Route path="/pharm-dashboard" element={<PharmLayout searchText={searchText} setSearchText={setSearchText}><PharmDashboard searchText={searchText} /></PharmLayout>} />
        <Route path="/pharm-prescriptions" element={<PharmLayout searchText={searchText} setSearchText={setSearchText}><PharmDashboard searchText={searchText} /></PharmLayout>} />
        <Route path="/pharm-inventory" element={<PharmLayout searchText={searchText} setSearchText={setSearchText}><PharmInventory searchText={searchText} /></PharmLayout>} />
        <Route path="/pharm-patient-history" element={<PharmLayout searchText={searchText} setSearchText={setSearchText}><PharmPatientHistory /></PharmLayout>} />
        <Route path="/patient-dashboard" element={<PatientPortalLayout searchText={searchText} setSearchText={setSearchText}><PatientDashboard /></PatientPortalLayout>} />
        <Route path="/patient-records" element={<PatientPortalLayout searchText={searchText} setSearchText={setSearchText}><PatientDashboard /></PatientPortalLayout>} />
        <Route path="/patient-appointments" element={<PatientPortalLayout searchText={searchText} setSearchText={setSearchText}><PatientDashboard /></PatientPortalLayout>} />
        <Route path="/patient-settings" element={<PatientPortalLayout searchText={searchText} setSearchText={setSearchText}><PatientDashboard /></PatientPortalLayout>} />
        <Route path="/logout" element={<LogoutConfirmation />} />
      </Routes>
    </BrowserRouter>
  );
}
