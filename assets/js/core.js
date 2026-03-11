/* Deepontus v2 - core */

const $ = (q, root=document) => root.querySelector(q);
const $$ = (q, root=document) => [...root.querySelectorAll(q)];

function fmtDateBR(d){ return new Date(d).toLocaleDateString('pt-BR'); }
function fmtMoneyBR(n){
  try { return new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(Number(n||0)); }
  catch { return `R$ ${Number(n||0).toFixed(2)}`; }
}
function initialsFromName(name){
  const parts = String(name||'').trim().split(/\s+/).filter(Boolean);
  const ini = (parts[0]?.[0]||'') + (parts[parts.length-1]?.[0]||'');
  return ini.toUpperCase() || 'DP';
}

// Icons (minimal line icons — consistent stroke)
const Icons = {
  play: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M9 7v10l8-5-8-5Z"/></svg>`,
  stop: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><rect x="8" y="8" width="8" height="8" rx="1.5"/></svg>`,
  pause: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M9 8v8"/><path d="M15 8v8"/></svg>`,
  coffee: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M5 8h10v6a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4V8Z"/><path d="M15 9h2a2 2 0 0 1 0 4h-2"/><path d="M7 4v2"/><path d="M10 4v2"/><path d="M13 4v2"/></svg>`,
  dashboard: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="8" height="8" rx="2"/><rect x="12" y="12" width="8" height="8" rx="2"/><rect x="12" y="4" width="8" height="6" rx="2"/><rect x="4" y="14" width="8" height="6" rx="2"/></svg>`,
  calendar: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4"/><path d="M16 3v4"/><path d="M3 9h18"/><path d="M8 13h4"/></svg>`,
  wallet: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7a2 2 0 0 1 2-2h12"/><path d="M4 7v12a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9H6a2 2 0 0 1-2-2Z"/><path d="M18 13h2"/></svg>`,
  users: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M16 11a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z"/><path d="M4 20a6 6 0 0 1 16 0"/></svg>`,
  inbox: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16v10h-4l-2 3h-4l-2-3H4V4Z"/><path d="M4 14v6h16v-6"/></svg>`,
  logout: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M10 17l-4-5 4-5"/><path d="M6 12h9"/><path d="M15 4h5v16h-5"/></svg>`,
  menu: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M5 7h14"/><path d="M5 12h14"/><path d="M5 17h14"/></svg>`,
  key: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M7.5 14a4.5 4.5 0 1 1 4.2-6H22v4"/><path d="M16 12v2"/><path d="M12 14v2"/><path d="M7.5 14h0"/></svg>`,
  chart: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19V5"/><path d="M8 19v-6"/><path d="M12 19V9"/><path d="M16 19v-8"/><path d="M20 19V7"/></svg>`,
  edit: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4 11.5-11.5Z"/></svg>`,
  upload: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12"/><path d="M7 8l5-5 5 5"/><path d="M4 21h16"/></svg>`,
  info: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 11v5"/><path d="M12 8h.01"/></svg>`,
  photo: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="6" width="16" height="14" rx="2"/><path d="M8 6l2-2h4l2 2"/><circle cx="12" cy="13" r="3"/></svg>`,
  money: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="7" width="18" height="10" rx="2"/><path d="M7 10h2"/><path d="M15 10h2"/><path d="M12 9v6"/></svg>`,
};

// Supabase
function getSupabase(){
  const cfg = window.DEEPONTUS_CONFIG;
  if (!cfg?.SUPABASE_URL || !cfg?.SUPABASE_ANON_KEY) throw new Error('Config Supabase ausente.');
  return window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY);
}
const sb = getSupabase();

function getBcrypt(){ return window.bcrypt || (window.dcodeIO && window.dcodeIO.bcrypt) || null; }

const Storage = {
  key: 'deepontus_user_v2',
  get(){ try { return JSON.parse(localStorage.getItem(this.key)||'null'); } catch { return null; } },
  set(v){ localStorage.setItem(this.key, JSON.stringify(v)); },
  clear(){ localStorage.removeItem(this.key); }
};

const api = {
  async login({ employee_id, password }){
    const { data: emp, error } = await sb
      .from('employees')
      .select('employee_id,name,initials,role,contracted_hours_month,password_hash,avatar_url,base_salary,job_function,hourly_rate_monitoria,hourly_rate_gravacao,pay_mode,is_active')
      .eq('employee_id', employee_id)
      .single();
    if (error || !emp) return { success:false, error:'Usuário não encontrado.' };
    if (emp.is_active === false) return { success:false, error:'Usuário desativado. Fale com o administrador.' };
    const bcrypt = getBcrypt();
    if (!bcrypt) throw new Error('bcryptjs não carregado');
    const ok = bcrypt.compareSync(password, emp.password_hash);
    if (!ok) return { success:false, error:'Senha inválida.' };
    const { password_hash, ...user } = emp;
    return { success:true, user };
  },

  async listEmployees(){
    const { data, error } = await sb
      .from('employees')
      .select('employee_id,name,role,contracted_hours_month,initials,avatar_url,base_salary,job_function,hourly_rate_monitoria,hourly_rate_gravacao,pay_mode,is_active')
      .order('name');
    if (error) throw error;
    return data || [];
  },

  async createEmployee(payload){
    // FIX DO BUG: pay_mode precisa ser exatamente 'salaried' | 'hourly'
    if (!['salaried','hourly'].includes(payload.pay_mode)) {
      throw new Error("Modo de pagamento inválido. Use 'salaried' ou 'hourly'.");
    }
    const password = payload.password;
    if (!password) throw new Error('Senha obrigatória.');
    delete payload.password;
    const bcrypt = getBcrypt();
    if (!bcrypt) throw new Error('bcryptjs não carregado');
    const password_hash = bcrypt.hashSync(password, 10);
    const { data, error } = await sb
      .from('employees')
      .insert({ ...payload, password_hash })
      .select()
      .single();
    if (error) throw new Error(error.message || 'Falha no cadastro.');
    const { password_hash:_, ...u } = data;
    return u;
  },

  async resetEmployeePassword(employee_id, newPassword){
    const bcrypt = getBcrypt();
    if (!bcrypt) throw new Error('bcryptjs não carregado');
    const password_hash = bcrypt.hashSync(newPassword, 10);
    const { error } = await sb
      .from('employees')
      .update({ password_hash })
      .eq('employee_id', employee_id);
    if (error) throw error;
    return true;
  },

  async getTodayOpenSession(employee_id){
    const today = new Date();
    const date = today.toISOString().slice(0,10);
    const { data, error } = await sb
      .from('sessions')
      .select('*')
      .eq('employee_id', employee_id)
      .eq('date', date)
      .is('end_time', null)
      .eq('is_deleted', false)
      .order('start_time', { ascending:false })
      .limit(1);
    if (error) throw error;
    return data?.[0] || null;
  },

  async getLatestOpenSession(employee_id){
    const { data, error } = await sb
      .from('sessions')
      .select('*')
      .eq('employee_id', employee_id)
      .is('end_time', null)
      .eq('is_deleted', false)
      .order('start_time', { ascending:false })
      .limit(1);
    if (error) throw error;
    return data?.[0] || null;
  },

  async forceCloseSessionAt(employeeSessionId, endIso){
    const end = new Date(endIso);
    const { data: s, error: selErr } = await sb
      .from('sessions')
      .select('*')
      .eq('id', employeeSessionId)
      .single();
    if (selErr) throw selErr;
    const start = new Date(s.start_time);
    const total = Math.max(0, Math.round((end-start)/60000));
    const break_total = Number(s.break_total_minutes||0);
    const duration_minutes = Math.max(0, total - break_total);
    const { data, error } = await sb
      .from('sessions')
      .update({ end_time: end.toISOString(), duration_minutes })
      .eq('id', employeeSessionId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async startShift(employee_id){
    const now = new Date();
    const payload = {
      employee_id,
      date: now.toISOString().slice(0,10),
      start_time: now.toISOString(),
      source: 'auto',
      status: 'approved',
      modality: 'na',
      origin: 'web'
    };
    const { data, error } = await sb.from('sessions').insert(payload).select().single();
    if (error) throw error;
    return data;
  },

  async openBreak(session_id){
    const now = new Date().toISOString();
    // guardamos o horário do intervalo no notes (JSON) para o calendário conseguir exibir
    const { data: cur, error: selErr } = await sb.from('sessions').select('notes,break_open_since').eq('id', session_id).single();
    if (selErr) throw selErr;
    if (cur.break_open_since) return cur;
    let notes = cur.notes;
    try{
      const j = notes ? JSON.parse(notes) : {};
      j.breaks = Array.isArray(j.breaks) ? j.breaks : [];
      j.breaks.push({ start: now, end: null });
      notes = JSON.stringify(j);
    }catch{
      notes = JSON.stringify({ breaks:[{ start: now, end: null }] });
    }

    const { data, error } = await sb
      .from('sessions')
      .update({ break_open_since: now, notes })
      .eq('id', session_id)
      .is('break_open_since', null)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async closeBreak(session){
    if (!session.break_open_since) return session;
    const start = new Date(session.break_open_since);
    const end = new Date();
    const minutes = Math.max(0, Math.round((end - start)/60000));
    const break_total_minutes = Number(session.break_total_minutes||0) + minutes;
    // atualiza último intervalo em notes
    let notes = session.notes;
    try{
      const j = notes ? JSON.parse(notes) : {};
      j.breaks = Array.isArray(j.breaks) ? j.breaks : [];
      for (let i=j.breaks.length-1;i>=0;i--){
        if (j.breaks[i] && !j.breaks[i].end){ j.breaks[i].end = end.toISOString(); break; }
      }
      notes = JSON.stringify(j);
    }catch{/* ignore */}
    const { data, error } = await sb
      .from('sessions')
      .update({ break_open_since: null, break_total_minutes, notes })
      .eq('id', session.id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async endShift(session){
    const end = new Date();
    const start = new Date(session.start_time);
    const total = Math.max(0, Math.round((end-start)/60000));
    const break_total = Number(session.break_total_minutes||0);
    const duration_minutes = Math.max(0, total - break_total);
    const { data, error } = await sb
      .from('sessions')
      .update({ end_time: end.toISOString(), duration_minutes })
      .eq('id', session.id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async listMonthCalendar(employee_id, year, month){
    const start = new Date(Date.UTC(year, month, 1));
    const end = new Date(Date.UTC(year, month+1, 1));
    const startDate = start.toISOString().slice(0,10);
    const endDate = end.toISOString().slice(0,10);

    const sessionsQ = sb
      .from('sessions')
      .select('id,date,start_time,end_time,duration_minutes,break_total_minutes,break_open_since,notes,modality,status,is_deleted')
      .eq('employee_id', employee_id)
      .gte('date', startDate)
      .lt('date', endDate)
      .eq('is_deleted', false);

    const attQ = sb
      .from('attestations')
      .select('id,start_date,end_date,status')
      .eq('employee_id', employee_id)
      .lte('start_date', endDate)
      .gte('end_date', startDate);

    const [sessionsR, attR] = await Promise.all([sessionsQ, attQ]);
    if (sessionsR.error) throw sessionsR.error;
    if (attR.error) throw attR.error;

    return { sessions: sessionsR.data||[], attestations: attR.data||[] };
  },

  async listDaySessions(employee_id, date){
    const { data, error } = await sb
      .from('sessions')
      .select('id,date,start_time,end_time,duration_minutes,break_total_minutes,break_open_since,notes,modality,status,is_deleted')
      .eq('employee_id', employee_id)
      .eq('date', date)
      .eq('is_deleted', false)
      .order('start_time', { ascending:true });
    if (error) throw error;
    return data || [];
  },

  async listSessionsRange(employee_id, startDate, endDate){
    const { data, error } = await sb
      .from('sessions')
      .select('id,date,duration_minutes,break_total_minutes,modality,status,is_deleted')
      .eq('employee_id', employee_id)
      .gte('date', startDate)
      .lt('date', endDate)
      .eq('is_deleted', false)
      .eq('status', 'approved');
    if (error) throw error;
    return data || [];
  },

  async createAdjustment(payload){
    // payload: employee_id, date, delta_minutes, reason, type
    const safe = {
      employee_id: payload.employee_id,
      date: payload.date,
      delta_minutes: Number(payload.delta_minutes||0),
      reason: String(payload.reason||'').slice(0,1000),
      type: payload.type || 'correction',
      status: 'pending',
      created_by: 'employee'
    };
    const { data, error } = await sb.from('adjustments').insert(safe).select().single();
    if (error) throw error;
    return data;
  },

  async adminMonthlyOverview(){
    const { data, error } = await sb.from('v_employees_admin_list').select('*');
    if (error) throw error;
    return data || [];
  },

  async getLatestSalary(employee_id){
    const { data, error } = await sb
      .from('salaries')
      .select('base_salary,effective_from')
      .eq('employee_id', employee_id)
      .order('effective_from', { ascending:false })
      .limit(1);
    if (error) return null;
    return data?.[0] || null;
  },

  async listPendingRequests(){
    const [adjR, attR] = await Promise.all([
      sb.from('adjustments').select('*').eq('status','pending').order('created_at',{ascending:false}),
      sb.from('attestations').select('*').eq('status','pending').order('created_at',{ascending:false})
    ]);
    if (adjR.error) throw adjR.error;
    if (attR.error) throw attR.error;
    return { adjustments: adjR.data||[], attestations: attR.data||[] };
  },

  // Perfil CLT (tabela: employee_profiles). Se a tabela não existir ainda, retornamos um flag.
  async getEmployeeProfile(employee_id){
    const { data, error } = await sb
      .from('employee_profiles')
      .select('*')
      .eq('employee_id', employee_id)
      .maybeSingle();
    if (error) {
      // Quando tabela não existe, o Postgres retorna 42P01 (undefined_table)
      if (String(error.code||'').toUpperCase() === '42P01') return { missingTable:true, profile:null };
      throw error;
    }
    return { missingTable:false, profile: data || null };
  },

  async upsertEmployeeProfile(payload){
    const { data, error } = await sb
      .from('employee_profiles')
      .upsert(payload, { onConflict: 'employee_id' })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // Desativar/ativar funcionário
  async setEmployeeActive(employee_id, is_active){
    const { error } = await sb
      .from('employees')
      .update({ is_active })
      .eq('employee_id', employee_id);
    if (error) throw error;
    return true;
  },

  async updateEmployeeAvatar(employee_id, avatar_url){
    const { data, error } = await sb
      .from('employees')
      .update({ avatar_url })
      .eq('employee_id', employee_id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async setRequestStatus(table, id, status){
    const { error } = await sb.from(table).update({ status }).eq('id', id);
    if (error) throw error;
    return true;
  }
};

function getBase(){
  // Se estamos em /admin/*, precisamos subir um nível.
  return window.location.pathname.includes('/admin/') ? '../' : './';
}

function requireAuth(){
  const user = Storage.get();
  const BASE = getBase();
  if (!user) { window.location.href = `${BASE}login.html`; return null; }
  return user;
}

function logout(){
  const BASE = getBase();
  Storage.clear();
  window.location.href = `${BASE}login.html`;
}

function renderShell({ active, title, subtitle, user, isAdmin }){
  const BASE = getBase();

  // Mobile drawer (mesmo menu do desktop)
  const sidebar = document.createElement('aside');
  sidebar.className = 'sidebar';
  sidebar.innerHTML = `
    <div class="brand">
      <div class="logo" aria-hidden="true">
        <img src="${BASE}assets/img/favicon.png" alt="Batinga Cursos"/>
      </div>
      <div>
        <h1>Batinga Cursos</h1>
        <p>Ponto • RH</p>
      </div>
    </div>

    <nav class="nav">
      <a href="${BASE}dashboard.html" class="${active==='dashboard'?'active':''}">${Icons.dashboard}<span>Painel</span></a>
      <a href="${BASE}calendar.html" class="${active==='calendar'?'active':''}">${Icons.calendar}<span>Calendário</span></a>
      <a href="${BASE}finance.html" class="${active==='finance'?'active':''}">${Icons.wallet}<span>Financeiro</span></a>
      <a href="${BASE}profile.html" class="${active==='profile'?'active':''}">${Icons.key}<span>Meu cadastro</span></a>
      ${isAdmin ? `
        <a href="${BASE}admin/employees.html" class="${active==='employees'?'active':''}">${Icons.users}<span>Funcionários</span></a>
        <a href="${BASE}admin/finance.html" class="${active==='admin-finance'?'active':''}">${Icons.chart}<span>Financeiro (Admin)</span></a>
        <a href="${BASE}admin/requests.html" class="${active==='requests'?'active':''}">${Icons.inbox}<span>Pendências</span></a>
      `:''}
    </nav>

    <div class="meta">
      <div class="avatar">${user.avatar_url ? `<img src="${user.avatar_url}" alt=""/>` : initialsFromName(user.name||user.employee_id)}</div>
      <div class="who">
        <p class="name">${user.name || user.employee_id}</p>
        <p class="role">${user.role || 'employee'}</p>
      </div>
      <div class="actions">
        <button class="iconbtn" id="btn-logout" title="Sair">${Icons.logout}</button>
      </div>
    </div>
  `;

  const main = document.createElement('main');
  main.className = 'main';
  main.innerHTML = `
    <header class="topnav">
      <div class="inner">
        <div class="brandline">
          <img src="${BASE}assets/img/favicon.png" alt="Batinga Cursos"/>
          <div class="small" style="font-weight:900">Batinga Cursos</div>
        </div>

        <nav class="links" aria-label="Navegação">
          <a href="${BASE}dashboard.html" class="${active==='dashboard'?'active':''}">${Icons.dashboard}<span>Painel</span></a>
          <a href="${BASE}calendar.html" class="${active==='calendar'?'active':''}">${Icons.calendar}<span>Calendário</span></a>
          <a href="${BASE}finance.html" class="${active==='finance'?'active':''}">${Icons.wallet}<span>Financeiro</span></a>
          <a href="${BASE}profile.html" class="${active==='profile'?'active':''}">${Icons.key}<span>Meu cadastro</span></a>
          ${isAdmin ? `
            <a href="${BASE}admin/employees.html" class="${active==='employees'?'active':''}">${Icons.users}<span>Funcionários</span></a>
            <a href="${BASE}admin/finance.html" class="${active==='admin-finance'?'active':''}">${Icons.chart}<span>Financeiro (Admin)</span></a>
            <a href="${BASE}admin/requests.html" class="${active==='requests'?'active':''}">${Icons.inbox}<span>Pendências</span></a>
          `:''}
        </nav>

        <div style="display:flex;align-items:center;gap:10px">
          <div class="avatar" style="width:34px;height:34px;border-radius:12px">${user.avatar_url ? `<img src="${user.avatar_url}" alt=""/>` : initialsFromName(user.name||user.employee_id)}</div>
          <button class="iconbtn" id="btn-logout-top" title="Sair">${Icons.logout}</button>
        </div>
      </div>
    </header>

    <div class="mobilebar">
      <button class="iconbtn" id="btn-menu" title="Menu">${Icons.menu}</button>
      <div class="small">Batinga Cursos</div>
      <button class="iconbtn" id="btn-logout-m" title="Sair">${Icons.logout}</button>
    </div>

    <div class="topbar">
      <div class="title">
        <h2>${title}</h2>
        <p>${subtitle || ''}</p>
      </div>
      <div class="badge dot ${isAdmin?'warning':'success'}">${isAdmin?'Admin':'Colaborador'}</div>
    </div>

    <div id="page" class="paper"></div>
  `;

  document.body.innerHTML='';
  const wrap = document.createElement('div');
  wrap.className='container';
  wrap.appendChild(sidebar);
  wrap.appendChild(main);
  document.body.appendChild(wrap);

  $('#btn-logout')?.addEventListener('click', logout);
  $('#btn-logout-top')?.addEventListener('click', logout);
  $('#btn-logout-m')?.addEventListener('click', logout);
  $('#btn-menu')?.addEventListener('click', ()=> sidebar.classList.toggle('open'));
}

window.Deepontus = { $, $$, api, Storage, requireAuth, renderShell, fmtMoneyBR, fmtDateBR, initialsFromName, Icons };
