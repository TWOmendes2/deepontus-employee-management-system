/* Financeiro (salário + estimativa do mês) */
(async function(){
  const { $, api, requireAuth, renderShell, fmtMoneyBR } = window.Deepontus;
  const user = requireAuth();
  if (!user) return;
  const isAdmin = user.role === 'admin';

  if (!isAdmin){
    try{
      const res = await api.getEmployeeProfile(user.employee_id);
      const p = res.profile || {};
      const required = ['full_name','cpf','birth_date','email','rg','pis_pasep','ctps_number','phone','address_street','address_number','address_neighborhood','address_city','address_state','address_zip'];
      const missing = required.filter(k=>!String(p[k]||'').trim());
      if (missing.length){
        alert('Complete seu cadastro (CLT) para liberar as abas.');
        window.location.href = './profile.html';
        return;
      }
    }catch(_){/* ignore */}
  }

  renderShell({
    active:'finance',
    title:'Financeiro',
    subtitle:'Salário configurado pelo administrador + estimativa baseada nas sessões aprovadas do mês.',
    user,
    isAdmin
  });

  const root = $('#page');

  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();
  const start = new Date(Date.UTC(y, m, 1)).toISOString().slice(0,10);
  const end = new Date(Date.UTC(y, m+1, 1)).toISOString().slice(0,10);

  const latestSalary = await api.getLatestSalary(user.employee_id);
  const baseSalary = Number(latestSalary?.base_salary ?? user.base_salary ?? 0);

  const sessions = await api.listSessionsRange(user.employee_id, start, end);
  const minutesTotal = sessions.reduce((acc,s)=> acc + Number(s.duration_minutes||0), 0);
  const hoursTotal = minutesTotal / 60;

  const rateBase = Number(user.hourly_rate || 0);
  const rateMon = Number(user.hourly_rate_monitoria || 0);
  const rateGra = Number(user.hourly_rate_gravacao || 0);

  let hoursMonitoria = 0;
  let hoursGravacao = 0;
  let hoursOutros = 0;

  for (const s of sessions){
    const h = Number(s.duration_minutes||0)/60;
    if (s.modality === 'monitoria') hoursMonitoria += h;
    else if (s.modality === 'gravacao') hoursGravacao += h;
    else hoursOutros += h;
  }

  let estimateGross = 0;
  if (user.pay_mode === 'hourly'){
    // prioridade: taxa por modalidade, senão hourly_rate
    const mon = (rateMon || rateBase) * hoursMonitoria;
    const gra = (rateGra || rateBase) * hoursGravacao;
    const oth = (rateBase || rateMon || rateGra || 0) * hoursOutros;
    estimateGross = mon + gra + oth;
  } else {
    estimateGross = baseSalary;
  }

  const modeLabel = user.pay_mode === 'hourly' ? 'Horista' : 'Mensal (salário)';
  const competence = now.toLocaleDateString('pt-BR', { month:'long', year:'numeric' });

  // Deduções (placeholder: pode ser configurado em versões futuras / rubricas no banco)
  const inss = 0;
  const otherDed = 0;
  const totalDed = inss + otherDed;
  const net = Math.max(0, estimateGross - totalDed);

  root.innerHTML = `
    <div class="grid cols-2">
      <div class="card">
        <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:10px;flex-wrap:wrap">
          <div>
            <h3 style="margin:0 0 6px">Seu salário</h3>
            <div class="muted">Competência: <b>${competence}</b></div>
          </div>
          <div class="badge">Modo: <strong>${modeLabel}</strong></div>
        </div>

        <div class="kpi" style="margin-top:14px">
          <div class="stat">
            <div class="label">Base configurada</div>
            <div class="value">${fmtMoneyBR(baseSalary)}</div>
          </div>
          <div class="stat">
            <div class="label">Estimativa bruta do mês</div>
            <div class="value">${fmtMoneyBR(estimateGross)}</div>
          </div>
        </div>

        <p class="help" style="margin-top:10px">A estimativa é calculada com base nas <b>sessões aprovadas</b> do mês. Descontos (INSS/VT etc.) podem variar e serão exibidos no holerite quando implementado/fechado pelo admin.</p>
      </div>

      <div class="card">
        <h3 style="margin:0 0 10px">Horas registradas (mês)</h3>
        <div class="grid" style="gap:10px">
          <div class="badge">Total: <strong>${hoursTotal.toFixed(2)}h</strong></div>
          <div class="badge">Monitoria: <strong>${hoursMonitoria.toFixed(2)}h</strong></div>
          <div class="badge">Gravação: <strong>${hoursGravacao.toFixed(2)}h</strong></div>
          <div class="badge">Outros: <strong>${hoursOutros.toFixed(2)}h</strong></div>
        </div>
        <div class="help" style="margin-top:10px">Se alguma data estiver errada, envie uma solicitação de ajuste em "Pendências" (admin).</div>
      </div>

      <div class="card" style="grid-column:1/-1">
        <h3 style="margin:0 0 10px">Prévia de holerite (bruto)</h3>
        <div class="table-wrap">
          <table class="table">
            <thead><tr><th>Descrição</th><th>Base</th><th>Valor</th></tr></thead>
            <tbody>
              <tr>
                <td>Salário base</td>
                <td>${user.pay_mode==='hourly' ? '—' : 'Mensal'}</td>
                <td>${user.pay_mode==='hourly' ? '—' : fmtMoneyBR(baseSalary)}</td>
              </tr>
              <tr>
                <td>Horas monitoria</td>
                <td>${(rateMon||rateBase) ? `${fmtMoneyBR(rateMon||rateBase)}/h` : '—'}</td>
                <td>${user.pay_mode==='hourly' ? fmtMoneyBR((rateMon||rateBase)*hoursMonitoria) : '—'}</td>
              </tr>
              <tr>
                <td>Horas gravação</td>
                <td>${(rateGra||rateBase) ? `${fmtMoneyBR(rateGra||rateBase)}/h` : '—'}</td>
                <td>${user.pay_mode==='hourly' ? fmtMoneyBR((rateGra||rateBase)*hoursGravacao) : '—'}</td>
              </tr>
              <tr>
                <td>Outras horas</td>
                <td>${(rateBase||rateMon||rateGra) ? `${fmtMoneyBR(rateBase||rateMon||rateGra)}/h` : '—'}</td>
                <td>${user.pay_mode==='hourly' ? fmtMoneyBR((rateBase||rateMon||rateGra||0)*hoursOutros) : '—'}</td>
              </tr>
              <tr>
                <td><b>Total estimado</b></td>
                <td>—</td>
                <td><b>${fmtMoneyBR(estimateGross)}</b></td>
              </tr>
            </tbody>
          </table>
        </div>

        <div style="margin-top:14px" class="badge">Horas no mês: <b>${hoursTotal.toFixed(2)}</b> • Monitoria: <b>${hoursMonitoria.toFixed(2)}</b> • Gravação: <b>${hoursGravacao.toFixed(2)}</b></div>

        <div style="margin-top:14px" class="table-wrap">
          <table class="table">
            <thead><tr><th>Modalidade</th><th>Horas</th><th>Valor</th></tr></thead>
            <tbody>
              <tr><td>Monitoria</td><td>${hoursMonitoria.toFixed(2)}</td><td>${fmtMoneyBR((rateMon||rateBase)*hoursMonitoria)}</td></tr>
              <tr><td>Gravação</td><td>${hoursGravacao.toFixed(2)}</td><td>${fmtMoneyBR((rateGra||rateBase)*hoursGravacao)}</td></tr>
              <tr><td>Outros</td><td>${hoursOutros.toFixed(2)}</td><td>${fmtMoneyBR((rateBase||rateMon||rateGra||0)*hoursOutros)}</td></tr>
            </tbody>
          </table>
        </div>

        <p class="help" style="margin-top:10px">* O detalhamento acima é uma estimativa baseada em sessões aprovadas. O valor final é configurado pelo administrador.</p>
      </div>

      <div class="card">
        <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:10px;flex-wrap:wrap">
          <div>
            <h3 style="margin:0 0 6px">Holerite (prévia)</h3>
            <div class="muted">Competência: <b>${competence}</b></div>
          </div>
          <div class="badge">Prévia</div>
        </div>

        <div style="margin-top:14px" class="table-wrap">
          <table class="table">
            <thead><tr><th>Descrição</th><th>Proventos</th><th>Descontos</th></tr></thead>
            <tbody>
              <tr><td>Salário / Produção</td><td><b>${fmtMoneyBR(estimateGross)}</b></td><td>—</td></tr>
              <tr><td>INSS</td><td>—</td><td>${fmtMoneyBR(inss)}</td></tr>
              <tr><td>Outros descontos</td><td>—</td><td>${fmtMoneyBR(otherDed)}</td></tr>
            </tbody>
            <tfoot>
              <tr><td><b>Total</b></td><td><b>${fmtMoneyBR(estimateGross)}</b></td><td><b>${fmtMoneyBR(totalDed)}</b></td></tr>
              <tr><td colspan="3" style="text-align:right"><span class="badge dot success">Líquido: <b>${fmtMoneyBR(net)}</b></span></td></tr>
            </tfoot>
          </table>
        </div>
        <p class="help" style="margin-top:10px">Nesta versão, os descontos ainda não são configuráveis pelo admin no banco. Na próxima versão, vamos adicionar rubricas e INSS automático.</p>
      </div>
    </div>
  `;
})();
