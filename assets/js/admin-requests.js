(async function(){
  const { $, api, requireAuth, renderShell, fmtDateBR } = window.Deepontus;
  const user = requireAuth();
  if (!user) return;
  if (user.role !== 'admin') { window.location.href = '../dashboard.html'; return; }

  renderShell({ active:'requests', title:'Pendências', subtitle:'Ajustes de ponto e atestados pendentes.', user, isAdmin:true });
  const root = $('#page');

  root.innerHTML = `
    <div class="grid cols-2">
      <div class="card paper" style="background:#fff;color:var(--paper-text);border-color:rgba(17,17,19,.12)">
        <h3 style="margin:0 0 10px">Solicitações de ajuste</h3>
        <div class="table-wrap">
          <table class="table" id="tAdj"><thead><tr><th>Colaborador</th><th>Data</th><th>Motivo</th><th>Ações</th></tr></thead><tbody></tbody></table>
        </div>
      </div>

      <div class="card">
        <h3 style="margin:0 0 10px">Atestados</h3>
        <div class="table-wrap">
          <table class="table" id="tAtt"><thead><tr><th>Colaborador</th><th>Período</th><th>Obs.</th><th>Ações</th></tr></thead><tbody></tbody></table>
        </div>
      </div>
    </div>
  `;

  async function load(){
    const { adjustments, attestations } = await api.listPendingRequests();

    const adjBody = $('#tAdj tbody');
    adjBody.innerHTML='';
    for (const a of adjustments){
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><span class="badge">${a.employee_id || '—'}</span></td>
        <td>${a.date ? fmtDateBR(a.date) : '—'}</td>
        <td>${(a.reason || a.notes || '—').slice(0,60)}</td>
        <td>
          <button class="btn success" data-ok="${a.id}">Aprovar</button>
          <button class="btn danger" data-no="${a.id}">Negar</button>
        </td>
      `;
      adjBody.appendChild(tr);
    }

    const attBody = $('#tAtt tbody');
    attBody.innerHTML='';
    for (const a of attestations){
      const tr = document.createElement('tr');
      const period = (a.start_date && a.end_date) ? `${fmtDateBR(a.start_date)} → ${fmtDateBR(a.end_date)}` : '—';
      tr.innerHTML = `
        <td><span class="badge">${a.employee_id || '—'}</span></td>
        <td>${period}</td>
        <td>${(a.notes || a.description || '—').slice(0,60)}</td>
        <td>
          <button class="btn success" data-att-ok="${a.id}">Aprovar</button>
          <button class="btn danger" data-att-no="${a.id}">Negar</button>
        </td>
      `;
      attBody.appendChild(tr);
    }

    // bind actions
    adjBody.querySelectorAll('button[data-ok]').forEach(b=>b.onclick=async()=>{ await api.setRequestStatus('adjustments', b.dataset.ok, 'approved'); await load(); });
    adjBody.querySelectorAll('button[data-no]').forEach(b=>b.onclick=async()=>{ await api.setRequestStatus('adjustments', b.dataset.no, 'rejected'); await load(); });
    attBody.querySelectorAll('button[data-att-ok]').forEach(b=>b.onclick=async()=>{ await api.setRequestStatus('attestations', b.dataset.attOk, 'approved'); await load(); });
    attBody.querySelectorAll('button[data-att-no]').forEach(b=>b.onclick=async()=>{ await api.setRequestStatus('attestations', b.dataset.attNo, 'rejected'); await load(); });
  }

  await load();
})();
