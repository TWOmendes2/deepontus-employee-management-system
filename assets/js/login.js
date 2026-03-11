(async function(){
  const { $, api, Storage } = window.Deepontus;
  const form = $('#login-form');
  const err = $('#error');
  const btn = $('#btn-login');

  const existing = Storage.get();
  if (existing) { window.location.href = './dashboard.html'; return; }

  form.addEventListener('submit', async (e)=>{
    e.preventDefault();
    err.textContent='';
    btn.disabled=true;
    try{
      const employee_id = $('#employee_id').value.trim();
      const password = $('#password').value;
      const res = await api.login({ employee_id, password });
      if (!res.success) { err.textContent = res.error || 'Falha no login.'; return; }
      Storage.set(res.user);

      // Força o colaborador a completar o cadastro CLT antes de usar o sistema.
      try{
        const p = await api.getEmployeeProfile(res.user.employee_id);
        const profile = p?.profile;
        const required = ['cpf','full_name','birth_date','phone','address_street','address_number','address_neighborhood','address_city','address_state','address_zip'];
        const complete = profile && required.every(k => String(profile[k]||'').trim().length > 0);
        if (!complete) { window.location.href = './profile.html'; return; }
      }catch(_){ /* se falhar, manda pro perfil */
        window.location.href = './profile.html'; return;
      }

      window.location.href = './dashboard.html';
    }catch(ex){
      err.textContent = ex.message || String(ex);
    }finally{
      btn.disabled=false;
    }
  });
})();
