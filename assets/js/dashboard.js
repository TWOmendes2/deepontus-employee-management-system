(async function(){
  const { $, api, requireAuth, renderShell, fmtMoneyBR } = window.Deepontus;
  const user = requireAuth();
  if (!user) return;
  const isAdmin = user.role === 'admin';

  // Bloqueio por cadastro incompleto (CLT)
  if (!isAdmin){
    try{
      const res = await api.getEmployeeProfile(user.employee_id);
      const p = res.profile || {};
      const required = ['full_name','cpf','birth_date','email','rg','pis_pasep','ctps_number','phone','address_street','address_number','address_neighborhood','address_city','address_state','address_zip'];
      const missing = required.filter(k=>!String(p[k]||'').trim());
      if (missing.length){
        alert('Antes de usar o sistema, complete seu cadastro obrigatório (CLT).');
        window.location.href = './profile.html';
        return;
      }
    }catch(_){
      // se não conseguir validar, deixa passar
    }
  }

  renderShell({ active:'dashboard', title:'Painel', subtitle:'Registre seu ponto e acompanhe o resumo do dia.', user, isAdmin });
  const root = $('#page');

  const { Icons } = window.Deepontus;
  root.innerHTML = `
    <div class="grid cols-2">
      <div class="card" id="card-timer">
        <div class="kpi">
          <div class="stat">
            <div class="label">Hora atual</div>
            <div class="value" id="clock">--:--:--</div>
          </div>
          <div class="stat">
            <div class="label">Status</div>
            <div class="value" id="status">--</div>
          </div>
        </div>

        <div style="margin-top:14px; display:flex; gap:10px; flex-wrap:wrap">
          <button class="btn success" id="btn-start">${Icons.play}Iniciar ponto</button>
          <button class="btn warning" id="btn-break">${Icons.coffee}Iniciar intervalo</button>
          <button class="btn warning" id="btn-break-end">${Icons.pause}Encerrar intervalo</button>
          <button class="btn danger" id="btn-end">${Icons.stop}Encerrar ponto</button>
          <button class="btn ghost" id="btn-correction">${Icons.edit}Solicitar correção</button>
        </div>
        <p class="help" style="margin-top:10px">Intervalo fica registrado no mesmo ponto do dia. Se você fechar o navegador, ao voltar o sistema retoma o estado pelo banco.</p>
      </div>

      <div class="card">
        <h3 style="margin:0 0 6px">Resumo do colaborador</h3>
        <p class="help" style="margin:0 0 12px">Dados básicos (configurados pelo admin).</p>
        <div class="grid" style="gap:10px">
          <div class="badge">ID: <strong>${user.employee_id}</strong></div>
          <div class="badge">Função: <strong>${user.job_function || '—'}</strong></div>
          <div class="badge">Modo: <strong>${user.pay_mode === 'salaried' ? 'Mensal (salário)' : 'Horista'}</strong></div>
          <div class="badge">Salário base: <strong>${fmtMoneyBR(user.base_salary || 0)}</strong></div>
        </div>
      </div>
    </div>
  `;

  function tickClock(){
    const now = new Date();
    $('#clock').textContent = now.toLocaleTimeString('pt-BR');
  }
  setInterval(tickClock, 1000); tickClock();

  let currentSession = null;

  // modal simples (correção de ponto)
  const bd = document.createElement('div');
  bd.className = 'backdrop';
  bd.innerHTML = `
    <div class="modal light">
      <h3 style="margin:0 0 8px">Solicitar correção de ponto</h3>
      <p class="help" style="margin:0 0 12px">Use quando você esqueceu de bater ponto ou houve erro no registro. O admin aprova/rejeita.</p>
      <div class="field"><label>Data</label><input type="date" id="c_date"></div>
      <div class="field"><label>Minutos (+ / -)</label><input type="number" id="c_minutes" placeholder="Ex.: 30 ou -15"></div>
      <div class="field"><label>Motivo</label><textarea id="c_reason" rows="3" placeholder="Explique o que aconteceu..."></textarea></div>
      <div class="actions">
        <button class="btn" id="c_cancel">Cancelar</button>
        <button class="btn primary" id="c_send">Enviar</button>
      </div>
    </div>
  `;
  document.body.appendChild(bd);
  function openCorrection(){ bd.classList.add('open'); }
  function closeCorrection(){ bd.classList.remove('open'); }
  bd.addEventListener('click', (e)=>{ if (e.target===bd) closeCorrection(); });
  bd.querySelector('#c_cancel').addEventListener('click', closeCorrection);

  async function refresh(){
    // pega o último ponto aberto (mesmo se virou o dia)
    currentSession = await api.getLatestOpenSession(user.employee_id);
    if (currentSession){
      const today = new Date().toISOString().slice(0,10);
      if (String(currentSession.date) < today){
        // virou o dia: fecha automaticamente às 23:59:59 do dia anterior
        const endIso = `${currentSession.date}T23:59:59.000Z`;
        try{ await api.forceCloseSessionAt(currentSession.id, endIso); }
        catch(_){ /* se falhar, seguimos e o admin pode ajustar */ }
        currentSession = await api.getLatestOpenSession(user.employee_id);
      }
    }
    const st = $('#status');
    const startBtn = $('#btn-start');
    const breakBtn = $('#btn-break');
    const breakEndBtn = $('#btn-break-end');
    const endBtn = $('#btn-end');

    if (!currentSession){
      st.textContent = 'Sem ponto aberto';
      startBtn.disabled = false;
      breakBtn.disabled = true;
      breakEndBtn.disabled = true;
      endBtn.disabled = true;
      return;
    }

    const inBreak = !!currentSession.break_open_since;
    st.textContent = inBreak ? 'Em intervalo' : 'Ponto em andamento';
    startBtn.disabled = true;
    breakBtn.disabled = inBreak;
    breakEndBtn.disabled = !inBreak;
    endBtn.disabled = false;
  }

  $('#btn-start').addEventListener('click', async ()=>{
    try{
      $('#btn-start').disabled=true;
      await api.startShift(user.employee_id);
      await refresh();
    }catch(ex){ alert(ex.message || ex); }
    finally{ $('#btn-start').disabled=false; }
  });

  $('#btn-break').addEventListener('click', async ()=>{
    if (!currentSession) return;
    try{
      $('#btn-break').disabled=true;
      await api.openBreak(currentSession.id);
      await refresh();
    }catch(ex){ alert(ex.message || ex); }
    finally{ $('#btn-break').disabled=false; }
  });

  $('#btn-break-end').addEventListener('click', async ()=>{
    if (!currentSession) return;
    try{
      $('#btn-break-end').disabled=true;
      currentSession = await api.closeBreak(currentSession);
      await refresh();
    }catch(ex){ alert(ex.message || ex); }
    finally{ $('#btn-break-end').disabled=false; }
  });

  $('#btn-end').addEventListener('click', async ()=>{
    if (!currentSession) return;
    if (!confirm('Encerrar o ponto agora?')) return;
    try{
      $('#btn-end').disabled=true;
      // se estiver em intervalo, fecha antes
      currentSession = await api.closeBreak(currentSession);
      await api.endShift(currentSession);
      await refresh();
    }catch(ex){ alert(ex.message || ex); }
    finally{ $('#btn-end').disabled=false; }
  });

  $('#btn-correction').addEventListener('click', ()=>{
    const today = new Date().toISOString().slice(0,10);
    bd.querySelector('#c_date').value = today;
    bd.querySelector('#c_minutes').value = '';
    bd.querySelector('#c_reason').value = '';
    openCorrection();
  });

  bd.querySelector('#c_send').addEventListener('click', async ()=>{
    const date = bd.querySelector('#c_date').value;
    const mins = Number(bd.querySelector('#c_minutes').value||0);
    const reason = bd.querySelector('#c_reason').value.trim();
    if (!date) { alert('Selecione a data.'); return; }
    if (!mins || !Number.isFinite(mins)) { alert('Informe os minutos (ex.: 30 ou -15).'); return; }
    if (!reason) { alert('Explique o motivo.'); return; }
    const btn = bd.querySelector('#c_send');
    try{
      btn.disabled = true;
      await api.createAdjustment({ employee_id: user.employee_id, date, delta_minutes: mins, reason, type:'correction' });
      alert('Solicitação enviada.');
      closeCorrection();
    }catch(ex){
      alert(ex.message || ex);
    }finally{ btn.disabled=false; }
  });

  await refresh();
})();
