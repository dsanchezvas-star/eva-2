/* ═══════════════════════════════════════════════════════════════
   NEXOTECH - GESTIÓN DE PRÉSTAMOS
   Funcionalidades JavaScript
═══════════════════════════════════════════════════════════════ */

// ══════════════════════════════════════
//  1. VARIABLES GLOBALES
// ══════════════════════════════════════
let usuarioActual = null;
let accordionAbierto = false;
let usuarios = [];

let prestamos = [];

const INVENTARIO = {
  'Laptop': {
    emoji: '💻',
    total: 5,
    disponibles: 5
  },
  'Monitor': {
    emoji: '🖥️',
    total: 8,
    disponibles: 8
  },
  'Teclado': {
    emoji: '⌨️',
    total: 10,
    disponibles: 10
  },
  'Mouse': {
    emoji: '🖱️',
    total: 15,
    disponibles: 15
  },
  'Webcam': {
    emoji: '📷',
    total: 6,
    disponibles: 6
  },
  'Micrófono': {
    emoji: '🎙️',
    total: 4,
    disponibles: 4
  }
};

// ══════════════════════════════════════
//  2. VALIDADOR DE RUT CHILENO
// ══════════════════════════════════════
const Validar = {
  rut: (rut) => {
    const rutExp = /^\d{1,8}-[0-9Kk]$/;
    if (!rutExp.test(rut)) return false;

    const [numerosStr, dv] = rut.split('-');
    const numeros = parseInt(numerosStr, 10);
    let suma = 0;
    let multiplicador = 2;

    for (let i = numerosStr.length - 1; i >= 0; i--) {
      suma += parseInt(numerosStr[i]) * multiplicador;
      multiplicador++;
      if (multiplicador > 7) multiplicador = 2;
    }

    const residuo = 11 - (suma % 11);
    let dvEsperado;
    if (residuo === 11) {
      dvEsperado = '0';
    } else if (residuo === 10) {
      dvEsperado = 'K';
    } else {
      dvEsperado = residuo.toString();
    }

    return dvEsperado === dv.toUpperCase();
  },

  fechaFutura: (fecha) => {
    const f = new Date(fecha);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    return f > hoy;
  },

  nombre: (n) => {
    return /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{3,80}$/.test(n.trim());
  }
};

// ══════════════════════════════════════
//  3. AUTH UI
// ══════════════════════════════════════
function mostrarTab(tab) {
  document.getElementById('form-login').classList.toggle('hidden', tab !== 'login');
  document.getElementById('form-register').classList.toggle('hidden', tab !== 'register');
  document.getElementById('tab-login').classList.toggle('active', tab === 'login');
  document.getElementById('tab-register').classList.toggle('active', tab === 'register');
}

function togglePass(id, btn) {
  const input = document.getElementById(id);
  if (input.type === 'password') {
    input.type = 'text';
    btn.textContent = '🙈';
  } else {
    input.type = 'password';
    btn.textContent = '👁';
  }
}

// ══════════════════════════════════════
//  4. REGISTRO
// ══════════════════════════════════════
function hacerRegistro(e) {
  e.preventDefault();
  const nombre = document.getElementById('reg-nombre').value.trim();
  const rut = document.getElementById('reg-rut').value.trim();
  const pass = document.getElementById('reg-pass').value;
  const pass2 = document.getElementById('reg-pass2').value;

  ['reg-nombre-err', 'reg-rut-err', 'reg-pass-err', 'reg-pass2-err', 'reg-general-err'].forEach(
    (id) => (document.getElementById(id).textContent = '')
  );

  let ok = true;

  if (!Validar.nombre(nombre)) {
    document.getElementById('reg-nombre-err').textContent =
      'Nombre inválido (solo letras, mín. 3 caracteres)';
    ok = false;
  }
  if (!Validar.rut(rut)) {
    document.getElementById('reg-rut-err').textContent = 'RUT no válido (ej: 12345678-K)';
    ok = false;
  } else if (usuarios.find((u) => u.rut === rut)) {
    document.getElementById('reg-rut-err').textContent =
      'Este RUT ya tiene una cuenta registrada';
    ok = false;
  }
  if (pass.length < 6) {
    document.getElementById('reg-pass-err').textContent = 'Mínimo 6 caracteres';
    ok = false;
  }
  if (pass !== pass2) {
    document.getElementById('reg-pass2-err').textContent = 'Las contraseñas no coinciden';
    ok = false;
  }

  if (!ok) return;

  usuarios.push({ rut, nombre, pass });
  const msgEl = document.getElementById('reg-general-err');
  msgEl.style.color = '#00ff9f';
  msgEl.textContent = '✅ Cuenta creada. Ahora inicia sesión.';
  setTimeout(() => {
    mostrarTab('login');
    document.getElementById('login-rut').value = rut;
    msgEl.textContent = '';
    document.getElementById('form-register').reset();
  }, 1400);
}

// ══════════════════════════════════════
//  5. LOGIN
// ══════════════════════════════════════
function hacerLogin(e) {
  e.preventDefault();
  const rut = document.getElementById('login-rut').value.trim();
  const pass = document.getElementById('login-pass').value;

  ['login-rut-err', 'login-pass-err', 'login-general-err'].forEach(
    (id) => (document.getElementById(id).textContent = '')
  );

  let ok = true;
  if (!Validar.rut(rut)) {
    document.getElementById('login-rut-err').textContent = 'RUT no válido';
    ok = false;
  }
  if (!pass) {
    document.getElementById('login-pass-err').textContent = 'Ingresa tu contraseña';
    ok = false;
  }
  if (!ok) return;

  const user = usuarios.find((u) => u.rut === rut && u.pass === pass);
  if (!user) {
    document.getElementById('login-general-err').textContent = '❌ RUT o contraseña incorrectos';
    return;
  }

  usuarioActual = user;
  document.getElementById('screen-auth').classList.add('hidden');
  document.getElementById('screen-app').classList.remove('hidden');
  document.getElementById('form-login').reset();

// ══════════════════════════════════════
//  5. HACER LOGIN
// ══════════════════════════════════════
function hacerLogin(user) {
  usuarioActual = user;

  document.getElementById('screen-auth').classList.add('hidden');
  document.getElementById('screen-app').classList.remove('hidden');

  document.getElementById('form-login').reset();

  const iniciales = user.nombre
    .split(' ')
    .map((p) => p[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();
  document.getElementById('user-avatar').textContent = iniciales;
  document.getElementById('user-nombre-chip').textContent = user.nombre.split(' ')[0];
  document.getElementById('bienvenida').textContent = `Bienvenido/a, ${user.nombre.split(' ')[0]} 👋`;

  actualizar();
}

  const iniciales = user.nombre
    .split(' ')
    .map((p) => p[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();
  document.getElementById('user-avatar').textContent = iniciales;
  document.getElementById('user-nombre-chip').textContent = user.nombre.split(' ')[0];
  document.getElementById('bienvenida').textContent = `Bienvenido/a, ${user.nombre.split(' ')[0]} 👋`;

  actualizar();
}

// ══════════════════════════════════════
//  6. CERRAR SESIÓN
// ══════════════════════════════════════
function cerrarSesion() {
  if (!confirm('¿Cerrar sesión?')) return;
  usuarioActual = null;
  document.getElementById('screen-app').classList.add('hidden');
  document.getElementById('screen-auth').classList.remove('hidden');
}

// ══════════════════════════════════════
//  7. ACCORDION
// ══════════════════════════════════════
function toggleAccordion() {
  accordionAbierto = !accordionAbierto;
  document.getElementById('accordion-body').classList.toggle('open', accordionAbierto);
  document.getElementById('accordion-arrow').classList.toggle('open', accordionAbierto);
}

// ══════════════════════════════════════
//  8. BUSCADOR
// ══════════════════════════════════════
function filtrarTabla() {
  const q = document.getElementById('search-input').value.toLowerCase();
  document.querySelectorAll('#loan-list tr.fila-prestamo').forEach((fila) => {
    fila.style.display = (fila.dataset.search || '').includes(q) ? '' : 'none';
  });
}

// ══════════════════════════════════════
//  9. TOTALES
// ══════════════════════════════════════
const calcTotales = () => {
  let totalInv = 0,
    totalDisp = 0;
  Object.values(INVENTARIO).forEach((e) => {
    totalInv += e.total;
    totalDisp += e.disponibles;
  });
  return { totalInv, totalDisp, prestados: totalInv - totalDisp };
};

const actualizarContadores = () => {
  const { totalInv, totalDisp } = calcTotales();
  const activos = prestamos.length;
  document.getElementById('count-active').textContent = activos;
  document.getElementById('count-disponible').textContent = totalDisp;
  document.getElementById('count-total').textContent = totalInv;
  document.getElementById('count-prestados').textContent = totalInv - totalDisp;
  document.getElementById('badge-count').textContent = activos;
};

// ══════════════════════════════════════
//  10. SELECT EQUIPOS
// ══════════════════════════════════════
const poblarSelect = () => {
  const sel = document.getElementById('equipo');
  const valorActual = sel.value;
  sel.replaceChildren();

  const def = document.createElement('option');
  def.value = '';
  def.textContent = 'Seleccione un equipo...';
  sel.appendChild(def);

  Object.entries(INVENTARIO).forEach(([nombre, data]) => {
    const opt = document.createElement('option');
    opt.value = nombre;
    if (data.disponibles === 0) {
      opt.textContent = `${data.emoji} ${nombre} — Sin stock`;
      opt.disabled = true;
    } else {
      const d = data.disponibles;
      opt.textContent = `${data.emoji} ${nombre} — ${d} disponible${d !== 1 ? 's' : ''}`;
    }
    if (nombre === valorActual) opt.selected = true;
    sel.appendChild(opt);
  });
};

// ══════════════════════════════════════
//  11. TABLA PRÉSTAMOS
// ══════════════════════════════════════
const renderizarTabla = () => {
  const lista = document.getElementById('loan-list');
  lista.replaceChildren();

  if (prestamos.length === 0) {
    lista.innerHTML = `
      <tr><td colspan="5">
        <div class="empty">
          <div class="icon">🗂️</div>
          <p>Sin préstamos registrados aún</p>
        </div>
      </td></tr>`;
    return;
  }

  prestamos.forEach((p, index) => {
    const tr = document.createElement('tr');
    tr.className = 'fila-prestamo';
    tr.dataset.search = `${p.rut} ${p.equipo} ${p.registradoPor}`.toLowerCase();

    const emoji = INVENTARIO[p.equipo]?.emoji || '📦';
    tr.innerHTML = `
      <td><span class="rut-badge">${p.rut}</span></td>
      <td><span class="equipo-tag">${emoji} ${p.equipo}</span></td>
      <td><span class="fecha-pill">${formatFecha(p.fecha)}</span></td>
      <td><span class="reg-por">👤 ${p.registradoPor}</span></td>
      <td></td>
    `;

    const btn = document.createElement('button');
    btn.textContent = 'Devolver';
    btn.className = 'btn-del';
    btn.onclick = () => devolverEquipo(index, p.equipo);
    tr.querySelector('td:last-child').appendChild(btn);
    lista.appendChild(tr);
  });
};

// ══════════════════════════════════════
//  12. INVENTARIO VISUAL
// ══════════════════════════════════════
const renderizarInventario = () => {
  const grid = document.getElementById('inventario-grid');
  grid.replaceChildren();

  Object.entries(INVENTARIO).forEach(([nombre, data]) => {
    const pct = data.total > 0 ? (data.disponibles / data.total) * 100 : 0;
    const isLow = pct > 0 && pct <= 30;
    const isZero = data.disponibles === 0;

    const item = document.createElement('div');
    item.className = `inv-item${isZero ? ' agotado' : ''}`;
    item.innerHTML = `
      <div class="inv-emoji">${data.emoji}</div>
      <div class="inv-nombre">${nombre}</div>
      <div class="inv-barra-wrap">
        <div class="inv-barra ${isZero ? 'zero' : isLow ? 'low' : ''}"
             style="width:${isZero ? 100 : pct}%"></div>
      </div>
      <div class="inv-nums">
        <span class="${isZero ? 'bad' : isLow ? 'warn' : 'ok'}">${data.disponibles} disp.</span>
        <span>${data.total} total</span>
      </div>
    `;
    grid.appendChild(item);
  });
};

// ══════════════════════════════════════
//  13. ACTUALIZACIÓN COMPLETA
// ══════════════════════════════════════
const actualizar = () => {
  actualizarContadores();
  poblarSelect();
  renderizarTabla();
  renderizarInventario();
};

// ══════════════════════════════════════
//  14. HELPERS
// ══════════════════════════════════════
function formatFecha(f) {
  if (!f) return '—';
  const [y, m, d] = f.split('-');
  return `${d}/${m}/${y}`;
}

function limpiarErroresForm() {
  ['rut-error', 'equipo-error', 'fecha-error'].forEach((id) => {
    document.getElementById(id).textContent = '';
  });
  document.getElementById('rut').classList.remove('error');
}

// ══════════════════════════════════════
//  15. GUARDAR PRÉSTAMO
// ══════════════════════════════════════
const guardarPrestamo = (e) => {
  e.preventDefault();
  limpiarErroresForm();

  const rutVal = document.getElementById('rut').value.trim();
  const equipoVal = document.getElementById('equipo').value;
  const fechaVal = document.getElementById('fecha').value;
  let ok = true;

  if (!Validar.rut(rutVal)) {
    document.getElementById('rut-error').textContent = 'RUT no válido (ej: 12345678-K)';
    document.getElementById('rut').classList.add('error');
    ok = false;
  }
  if (!equipoVal) {
    document.getElementById('equipo-error').textContent = 'Selecciona un equipo';
    ok = false;
  } else if (INVENTARIO[equipoVal]?.disponibles <= 0) {
    document.getElementById('equipo-error').textContent = 'Sin stock disponible';
    ok = false;
  }
  if (!fechaVal || !Validar.fechaFutura(fechaVal)) {
    document.getElementById('fecha-error').textContent = 'Debe ser una fecha futura';
    ok = false;
  }
  if (!ok) return;

  INVENTARIO[equipoVal].disponibles--;
  prestamos.push({
    rut: rutVal,
    equipo: equipoVal,
    fecha: fechaVal,
    registradoPor: usuarioActual ? usuarioActual.nombre : 'Desconocido'
  });

  if (!accordionAbierto) toggleAccordion();

  actualizar();
  e.target.reset();
};

// ══════════════════════════════════════
//  16. DEVOLVER EQUIPO
// ══════════════════════════════════════
const devolverEquipo = (index, equipo) => {
  if (confirm('¿Marcar equipo como devuelto y eliminar registro?')) {
    if (INVENTARIO[equipo]) {
      INVENTARIO[equipo].disponibles = Math.min(
        INVENTARIO[equipo].disponibles + 1,
        INVENTARIO[equipo].total
      );
    }
    prestamos.splice(index, 1);
    actualizar();
  }
};

// ══════════════════════════════════════
//  17. INICIALIZACIÓN
// ══════════════════════════════════════
document.getElementById('loan-form').addEventListener('submit', guardarPrestamo);
document.getElementById('btn-clear').addEventListener('click', () => {
  document.getElementById('loan-form').reset();
  limpiarErroresForm();
});
