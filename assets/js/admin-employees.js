(async function(){
  const { $, api, requireAuth, renderShell, initialsFromName, fmtMoneyBR, Icons } = window.Deepontus;
  const user = requireAuth();
  if (!user) return;
  if (user.role !== 'admin') { window.location.href = '../dashboard.html'; return; }

  renderShell({ active:'employees', title:'Funcionários', subtitle:'Cadastre, visualize perfis e redefina senha.', user, isAdmin:true });
  const root = $('#page');

  root.innerHTML = `
    <div class="card paper" style="background:#fff;color:var(--paper-text);border-color:rgba(17,17,19,.12)">
      <div style="display:flex; justify-content:space-between; align-items:center; gap:10px; flex-wrap:wrap">
        <div>
          <h3 style="margin:0 0 6px">Lista</h3>
          <p class="help" style="margin:0">Clique em um funcionário para ver detalhes e redefinir senha.</p>
        </div>
        <button class="btn primary" id="btn-new">+ Novo funcionário</button>
      </div>

      <div class="table-wrap" style="margin-top:14px">
        <table class="table" id="tbl">
          <thead><tr><th>Colaborador</th><th>ID</th><th>Status</th><th>Função</th><th>Modo</th><th>Salário</th><th></th></tr></thead>
          <tbody></tbody>
        </table>
      </div>
    </div>

    <div class="backdrop" id="bd">
      <div class="modal light">
        <h3 id="mTitle">—</h3>
        <div id="mBody"></div>
        <div class="actions">
          <button class="btn" id="mClose">Fechar</button>
          <button class="btn primary" id="mSave" style="display:none">Salvar</button>
        </div>
      </div>
    </div>
  `;

  const bd = $('#bd');
  const mTitle = $('#mTitle');
  const mBody = $('#mBody');
  const mClose = $('#mClose');
  const mSave = $('#mSave');

  function openModal({ title, bodyHtml, onSave }){
    mTitle.textContent = title;
    mBody.innerHTML = bodyHtml;
    bd.classList.add('open');
    if (onSave){
      mSave.style.display='inline-flex';
      mSave.onclick = onSave;
    } else {
      mSave.style.display='none';
      mSave.onclick = null;
    }
  }
  function closeModal(){ bd.classList.remove('open'); }
  mClose.addEventListener('click', closeModal);
  bd.addEventListener('click', (e)=>{ if (e.target === bd) closeModal(); });

  async function load(){
    const list = await api.listEmployees();
    const tbody = $('#tbl tbody');
    tbody.innerHTML='';

    for (const e of list){
      const tr = document.createElement('tr');
      const mode = e.pay_mode === 'hourly' ? 'Horista' : 'Mensal';
      const st = e.is_active === false ? 'Desativado' : 'Ativo';
      tr.innerHTML = `
        <td>
          <div style="display:flex; align-items:center; gap:10px">
            <div class="avatar" style="width:34px;height:34px;border-radius:12px">${e.avatar_url ? `<img src="${e.avatar_url}" alt=""/>` : initialsFromName(e.name)}</div>
            <div style="min-width:0">
              <div style="font-weight:800; white-space:nowrap; overflow:hidden; text-overflow:ellipsis">${e.name || '—'}</div>
              <div class="small">${e.role}</div>
            </div>
          </div>
        </td>
        <td><span class="badge">${e.employee_id}</span></td>
        <td><span class="badge dot ${e.is_active===false?'danger':'success'}">${st}</span></td>
        <td>${e.job_function || '—'}</td>
        <td>${mode}</td>
        <td>${fmtMoneyBR(e.base_salary || 0)}</td>
        <td><button class="btn" data-view="${e.employee_id}">Ver</button></td>
      `;
      tbody.appendChild(tr);
    }

    tbody.querySelectorAll('button[data-view]').forEach(btn=>{
      btn.addEventListener('click', async ()=>{
        const id = btn.getAttribute('data-view');
        const emp = list.find(x=>x.employee_id===id);
        if (!emp) return;

        let profileHtml = '';
        try{
          const pr = await api.getEmployeeProfile(emp.employee_id);
          if (pr.missingTable){
            profileHtml = `<div class="badge dot warning">Tabela <b>employee_profiles</b> não existe. Rode a migration.</div>`;
          } else if (!pr.profile){
            profileHtml = `<div class="badge dot warning">Cadastro CLT ainda não preenchido pelo colaborador.</div>`;
          } else {
            const p = pr.profile;
            profileHtml = `
              <div class="grid" style="gap:10px">
                <div class="badge">Nome completo: <strong>${p.full_name||'—'}</strong></div>
                <div class="badge">CPF: <strong>${p.cpf||'—'}</strong></div>
                <div class="badge">Nascimento: <strong>${p.birth_date||'—'}</strong></div>
                <div class="badge">WhatsApp: <strong>${p.phone||'—'}</strong></div>
                <div class="badge">Endereço: <strong>${[p.address_street,p.address_number,p.address_neighborhood,p.address_city,p.address_state].filter(Boolean).join(', ') || '—'}</strong></div>
              </div>
            `;
          }
        }catch(_){
          profileHtml = `<div class="badge dot warning">Não foi possível carregar o cadastro CLT.</div>`;
        }

        openModal({
          title: `Perfil — ${emp.name}`,
          bodyHtml: `
            <div class="grid" style="gap:10px">
              <div class="badge">ID: <strong>${emp.employee_id}</strong></div>
              <div class="badge">Função: <strong>${emp.job_function || '—'}</strong></div>
              <div class="badge">Modo: <strong>${emp.pay_mode==='hourly'?'Horista':'Mensal (salário)'}</strong></div>
              <div class="badge">Salário: <strong>${fmtMoneyBR(emp.base_salary||0)}</strong></div>
              <div class="badge">Status: <strong>${emp.is_active===false?'Desativado':'Ativo'}</strong></div>
            </div>

            <hr style="border:0;border-top:1px solid var(--outline); margin:14px 0">
            <div>
              <div style="display:flex; align-items:center; gap:8px; font-weight:900"><span class="icon-inline"></span><span>Cadastro CLT</span></div>
              <div style="margin-top:10px">${profileHtml}</div>
            </div>

            <hr style="border:0;border-top:1px solid var(--outline); margin:14px 0">
            <div>
              <div style="display:flex; align-items:center; gap:8px; font-weight:900"><span class="icon-inline"></span><span>Redefinir senha</span></div>
              <div class="field"><label>Nova senha</label><input id="newPass" type="password" placeholder="Digite a nova senha"/></div>
              <p class="help">A senha é criptografada (bcrypt) antes de salvar.</p>
            </div>

            <div style="margin-top:10px; display:flex; justify-content:flex-end">
              <button class="btn ${emp.is_active===false?'success':'danger'}" id="btn-toggle">${emp.is_active===false?'Ativar funcionário':'Desativar funcionário'}</button>
            </div>
          `,
          onSave: async ()=>{
            const np = $('#newPass').value;
            if (!np || np.length < 4) { alert('Defina uma senha com pelo menos 4 caracteres.'); return; }
            try{
              mSave.disabled=true;
              await api.resetEmployeePassword(emp.employee_id, np);
              alert('Senha atualizada.');
              closeModal();
            }catch(ex){ alert(ex.message || ex); }
            finally{ mSave.disabled=false; }
          }
        });

        // toggle ativo/desativado
        setTimeout(()=>{
          const t = $('#btn-toggle');
          t?.addEventListener('click', async ()=>{
            const next = emp.is_active === false;
            const ok = confirm(next ? 'Ativar este funcionário?' : 'Desativar este funcionário?');
            if (!ok) return;
            try{
              t.disabled = true;
              await api.setEmployeeActive(emp.employee_id, next);
              closeModal();
              await load();
            }catch(ex){
              alert(ex.message || ex);
            }finally{
              t.disabled = false;
            }
          });
        }, 0);
      });
    });
  }

  $('#btn-new').addEventListener('click', ()=>{
    openModal({
      title: 'Novo funcionário',
      bodyHtml: `
        <div class="field"><label>ID do colaborador</label><input id="f_id" placeholder="Ex.: EMP005"/></div>
        <div class="field"><label>Nome</label><input id="f_name" placeholder="Nome completo"/></div>
        <div class="field"><label>Iniciais</label><input id="f_ini" placeholder="Ex.: JM"/></div>
        <div class="field"><label>Função</label><input id="f_job" placeholder="Ex.: Monitor"/></div>
        <div class="field"><label>Horas contratuais (mês)</label><input id="f_hours" type="number" value="160" min="0"/></div>
        <div class="field"><label>Modo de pagamento</label>
          <select id="f_pay">
            <option value="salaried">Mensal (Salário)</option>
            <option value="hourly">Horista</option>
          </select>
          <p class="help">⚠️ Valores do banco: <strong>salaried</strong> ou <strong>hourly</strong> (isso corrige o bug do CHECK constraint).</p>
        </div>
        <div class="field"><label>Salário base (R$)</label><input id="f_salary" type="number" step="0.01" value="0"/></div>
        <div class="field"><label>Senha inicial</label><input id="f_pass" type="password" placeholder="Senha temporária"/></div>
        <div class="field"><label>Papel</label>
          <select id="f_role"><option value="employee">employee</option><option value="admin">admin</option></select>
        </div>
      `,
      onSave: async ()=>{
        const payload = {
          employee_id: $('#f_id').value.trim(),
          name: $('#f_name').value.trim(),
          initials: $('#f_ini').value.trim() || initialsFromName($('#f_name').value),
          job_function: $('#f_job').value.trim(),
          contracted_hours_month: Number($('#f_hours').value||0),
          pay_mode: $('#f_pay').value,
          base_salary: Number($('#f_salary').value||0),
          role: $('#f_role').value,
          password: $('#f_pass').value
        };
        if (!payload.employee_id || !payload.name) { alert('Preencha ID e Nome.'); return; }
        try{
          mSave.disabled=true;
          await api.createEmployee(payload);
          alert('Funcionário cadastrado.');
          closeModal();
          await load();
        }catch(ex){
          alert(ex.message || ex);
        }finally{ mSave.disabled=false; }
      }
    });
  });

  await load();
})();
