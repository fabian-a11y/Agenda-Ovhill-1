// Agenda por columnas (similar a la referencia, sin pop-up)

const PROFESSIONALS = [
  { id: 'matias', name: 'Matías Garcia', avatar: 'MG' },
  { id: 'sofia', name: 'Sofía Reyes', avatar: 'SR' },
  { id: 'andrea', name: 'Andrea Fuenzalida', avatar: 'AF' },
  { id: 'catalina', name: 'Catalina Fuentes', avatar: 'CF' },
  { id: 'gabriel', name: 'Gabriel Ortiz', avatar: 'GO' }
];

// Citas de ejemplo
const BOOKINGS = [
  { professional: 'matias', start: '09:00', end: '10:00', title: 'Sesión grupal zumba', person: 'Bárbara Troncose', status: 'reservado', color: '#6ea8fe' },
  { professional: 'matias', start: '12:00', end: '13:00', title: 'Primera cita', person: 'Javier Romero', status: 'reservado', color: '#6ea8fe' },
  { professional: 'matias', start: '14:00', end: '15:00', title: 'Tratamiento segunda cita', person: 'Ricardo Quiceno', status: 'pendiente', color: '#f9d66a' },
  { professional: 'matias', start: '18:00', end: '19:00', title: 'Clase', person: 'Ferran Santana', status: 'confirmado', color: '#9ee493' },

  { professional: 'sofia', start: '11:00', end: '12:00', title: 'Clase personalizada', person: 'Antonia Cardona', status: 'reservado', color: '#f9d66a' },

  { professional: 'andrea', start: '10:00', end: '11:00', title: 'Primera cita', person: 'Felipe Fuenzalida', status: 'confirmado', color: '#9ee493' },
  { professional: 'andrea', start: '16:00', end: '17:00', title: 'Servicio', person: 'Laila Serrano', status: 'pendiente', color: '#f9d66a' },

  { professional: 'catalina', start: '11:00', end: '12:00', title: 'Tercera cita', person: 'Gustavo Flórez', status: 'reservado', color: '#6ea8fe' },
  
  { professional: 'gabriel', start: '09:00', end: '10:00', title: 'Sesión individual', person: 'Elio Zárate', status: 'reservado', color: '#6ea8fe' },
  { professional: 'gabriel', start: '16:00', end: '17:00', title: 'Segunda cita', person: 'Xabier Vázquez', status: 'reservado', color: '#6ea8fe' }
];

const HOURS = Array.from({ length: 13 }, (_, i) => 8 + i); // 8 a 20

let currentDate = new Date();
let selectedDay = new Date(currentDate);

// Utilidades
const pad = (n) => (n < 10 ? `0${n}` : `${n}`);
const toMinutes = (hhmm) => {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
};
const fmtLongDate = (d) => d.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

// --- Sincronización centralizada del día seleccionado ---
function refreshDateTitle(){
  const title = document.getElementById('date-title');
  if (title) title.textContent = capitalize(fmtLongDate(selectedDay));
}

function setSelectedDay(date){
  // Normalizar a fecha local sin horas
  selectedDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  // Actualizar título, mini calendario y tarjetas
  refreshDateTitle();
  renderMiniCalendar();
  requestAnimationFrame(paintBookings);
}

// Inicialización
window.addEventListener('DOMContentLoaded', () => {
  populateFilters();
  renderHeader();
  renderTimeline();
  renderColumns();
  attachTopbarEvents();
  renderMiniCalendar();
  setupAgendaAdmin();
  setupSpecialtyFilter();
  setupProfSpecialtiesEditor();
  setupProfessionalsAdmin();
  setupReserveModal();
  // Reposicionar tarjetas cuando cambie el tamaño del panel embebido
  window.addEventListener('resize', () => requestAnimationFrame(paintBookings));
  // Recalcular cuando las fuentes terminen de cargar (afecta anchos)
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => requestAnimationFrame(paintBookings));
  }
});

function populateFilters(){
  const sel = document.getElementById('professional-filter');
  if(!sel) return;
  sel.innerHTML = '';
  const allOpt = document.createElement('option'); allOpt.value = 'all'; allOpt.textContent = 'Todos'; sel.appendChild(allOpt);
  getAllProfessionals().forEach(p=>{
    const opt = document.createElement('option');
    opt.value = p.id; opt.textContent = p.name; sel.appendChild(opt);
  });
}

function renderHeader(){
  const title = document.getElementById('date-title');
  title.textContent = capitalize(fmtLongDate(selectedDay));
}

function capitalize(str){
  return str.charAt(0).toUpperCase()+str.slice(1);
}

function renderTimeline(){
  const tl = document.getElementById('timeline');
  tl.innerHTML = '';
  const spacer = document.createElement('div');
  // Inicializar usando la variable CSS actual si existe, con fallback a 52px
  const csRootTL = getComputedStyle(document.documentElement);
  const initHeaderH = csRootTL.getPropertyValue('--header-h')?.trim() || '52px';
  spacer.style.height = initHeaderH; tl.appendChild(spacer);
  HOURS.forEach(h=>{
    // Línea para la hora redonda (ej: 08:00)
    const tHour = document.createElement('div');
    tHour.className = 'time hour';
    tHour.textContent = `${pad(h)}:00`;
    tl.appendChild(tHour);

    // Línea para la media hora (ej: 08:30)
    const tHalf = document.createElement('div');
    tHalf.className = 'time half';
    tHalf.textContent = `${pad(h)}:30`;
    tl.appendChild(tHalf);
  });
}

function renderColumns(){
  const container = document.getElementById('columns');
  const pros = getVisibleProfessionals();
  container.style.setProperty('--cols', pros.length);
  container.innerHTML = '';

  // Header de columnas
  const header = document.createElement('div');
  header.className = 'col-header';
  header.style.setProperty('--cols', pros.length);
  pros.forEach(p=>{
    const h = document.createElement('div');
    h.className = 'col-title';
    h.innerHTML = `<div class="avatar">${p.avatar}</div><div><div>${p.name.split(' ')[0]} ${p.name.split(' ')[1]||''}</div></div>`;
    header.appendChild(h);
  });
  container.appendChild(header);

  // Filas por hora
  HOURS.forEach(h=>{
    const row = document.createElement('div');
    row.className = 'hour-row';
    row.style.setProperty('--cols', pros.length);

    pros.forEach(p=>{
      const cell = document.createElement('div');
      cell.className = 'cell';
      row.appendChild(cell);
    });

    container.appendChild(row);
  });

  // Pintar reservas (tras pintar y asentar layout)
  requestAnimationFrame(paintBookings);
  // Observar cambios de tamaño del header de columnas
  const headerEl = document.querySelector('#columns .col-header');
  if (headerEl && 'ResizeObserver' in window) {
    const ro = new ResizeObserver(() => requestAnimationFrame(paintBookings));
    ro.observe(headerEl);
  }
}

function paintBookings(){
  // Limpiar cards previas
  document.querySelectorAll('.booking').forEach(b=>b.remove());

  const statusFilter = document.getElementById('status-filter').value;
  const profFilter = document.getElementById('professional-filter').value;
  const pros = getVisibleProfessionals();
  const bookings = getBookingsForRender();

  const rows = document.querySelectorAll('#columns .hour-row');
  const grid = document.getElementById('columns');
  const timeline = document.getElementById('timeline');
  // Medir alturas reales para evitar desalineaciones por fuentes/paddings/modo embebido
  const header = document.querySelector('#columns .col-header');
  const measuredHeaderH = header ? header.getBoundingClientRect().height : 0;
  // Fallback a variable CSS si aún no está pintado
  const cs = getComputedStyle(document.documentElement);
  const fallbackHeaderH = parseFloat(cs.getPropertyValue('--header-h')) || 52;
  const headerHeight = measuredHeaderH || fallbackHeaderH;
  // Altura de fila: medir la primera fila real si existe
  const measuredRowH = rows && rows[0] ? rows[0].getBoundingClientRect().height : 0;
  const fallbackRowH = parseFloat(cs.getPropertyValue('--row-h')) || 64;
  const rowHeight = measuredRowH || fallbackRowH;

  // Redondear sólo para variables CSS; conservar valores en coma flotante para cálculo preciso
  const headerHpx = Math.round(headerHeight);
  const rowHpx = Math.round(rowHeight);

  // Referencia a las celdas del header para calcular posición y ancho exactos
  const headerCells = header ? Array.from(header.children) : [];

  // Sincronizar variables CSS con las medidas reales para alinear guías en la timeline
  const rootStyle = document.documentElement.style;
  if (headerHpx) rootStyle.setProperty('--header-h', `${headerHpx}px`);
  if (rowHpx) rootStyle.setProperty('--row-h', `${rowHpx}px`);
  // Ajustar el espaciador de la timeline para que coincida exactamente con el header real
  const tl = document.getElementById('timeline');
  if (tl && tl.firstElementChild) tl.firstElementChild.style.height = `${headerHpx}px`;

  // ===== Calibración con la columna de tiempos (timeline) =====
  // Medimos la posición de cada marca de hora en #timeline y la referenciamos al sistema de #columns
  const gridRect = grid ? grid.getBoundingClientRect() : { top: 0 };
  const hourMarks = Array.from(timeline ? timeline.querySelectorAll('.time.hour') : []);
  // Construimos un mapa: hora -> top relativo a #columns
  const hourTopMap = new Map();
  hourMarks.forEach(el => {
    const label = (el.textContent || '').trim(); // p.ej. "08:00"
    const [hh] = label.split(':').map(v=>parseInt(v,10));
    const r = el.getBoundingClientRect();
    const topRel = r.top - gridRect.top; // relativo al grid de columnas
    if (!Number.isNaN(hh)) hourTopMap.set(hh, topRel);
  });
  // Función: convertir HH:MM a top en píxeles usando el mapa de timeline (si disponible), si no, usar filas
  function topFromTime(h, m){
    if (hourTopMap.has(h) && hourTopMap.has(h+1)){
      const t0 = hourTopMap.get(h);
      const t1 = hourTopMap.get(h+1);
      const perMin = (t1 - t0) / 60;
      return t0 + perMin * m;
    }
    // Fallback a filas medidas
    const idx = Math.max(0, Math.min(rows.length-1, h - HOURS[0]));
    const base = rows && rows[idx] ? rows[idx].offsetTop : headerHpx;
    return base + (m/60) * rowHeight;
  }

  bookings
    .filter(b => statusFilter==='all' || b.status===statusFilter)
    .filter(b => profFilter==='all' || b.professional===profFilter)
    // aplicar filtro de especialidad mediante el set de profesionales visibles
    .filter(b => pros.some(p => p.id === b.professional))
    .forEach(b => {
      const colIndex = pros.findIndex(p=>p.id===b.professional);
      if(colIndex===-1) return;

      // Calcular posicionamiento vertical anclado al inicio de la grilla (HOURS[0])
      const startMin = toMinutes(b.start);
      const endMin = toMinutes(b.end);
      const firstHourMin = HOURS[0] * 60;
      const startHour = Math.floor(startMin / 60);
      const endHour = Math.floor(endMin / 60);
      const topRaw = topFromTime(startHour, startMin - startHour*60);
      const endRaw = topFromTime(endHour, endMin - endHour*60);
      // Usar posiciones con coma flotante (CSS acepta subpíxeles) para máxima precisión
      const topPx = topRaw;
      const endPx = endRaw;
      // Con box-sizing:border-box, la altura exacta debe ser fin - inicio
      const heightPx = Math.max(20, endPx - topPx);

      // Crear card
      const card = document.createElement('div');
      card.className = 'booking';
      if(heightPx < 55) card.classList.add('small');
      card.dataset.status = b.status;
      card.style.top = `${topPx}px`;
      card.style.height = `${heightPx}px`;
      card.style.background = hexToSoft(b.color);
      card.style.borderColor = mix(b.color, '#ffffff', 0.3);

      // Calcular izquierda y ancho usando las celdas reales del header
      // grid ya definido arriba
      if (headerCells[colIndex]) {
        const cell = headerCells[colIndex];
        // 1) Método principal: offsetLeft / offsetWidth respecto a #columns
        let left = cell.offsetLeft + 6;
        let width = cell.offsetWidth - 12;
        // 2) Si por algún motivo da 0 (caso embebido con layout aún sin asentar), usar rects
        if (width <= 0) {
          const cellRect = cell.getBoundingClientRect();
          const gridRect = grid.getBoundingClientRect();
          left = Math.max(0, cellRect.left - gridRect.left) + 6;
          width = Math.max(40, cellRect.width - 12);
          // 3) Si todavía es 0, reintentar en el siguiente frame
          if (width <= 0) {
            requestAnimationFrame(paintBookings);
            return;
          }
        }
        card.style.left = `${left}px`;
        card.style.width = `${width}px`;
      } else {
        // Fallback proporcional si no hay header (no debería ocurrir)
        const gridRect = grid.getBoundingClientRect();
        const colWidth = gridRect.width / Math.max(1, pros.length);
        card.style.left = `${6 + colIndex*colWidth}px`;
        card.style.width = `${colWidth - 12}px`;
      }

      card.innerHTML = `
        <div class="title">${b.person}</div>
        <div class="meta">${b.title} • ${b.start} - ${b.end}</div>
      `;
      // Permitir editar: para reservas custom abrimos en modo edición; para demo, como nueva con datos prellenados
      card.addEventListener('click', () => {
        const isCustom = Boolean(b.id);
        openReserveModal(isCustom ? b : { ...b, date: getSelectedISODate(), id: null });
      });

      grid.appendChild(card);
    });
}

// Helpers de color para fondos suaves
function hexToSoft(hex){
  return mix(hex, '#ffffff', 0.75);
}
function mix(c1, c2, w){
  // mezcla muy simple de colores hex (#rrggbb)
  const a = hexToRgb(c1), b = hexToRgb(c2);
  const m = {
    r: Math.round(a.r*(1-w)+b.r*w),
    g: Math.round(a.g*(1-w)+b.g*w),
    b: Math.round(a.b*(1-w)+b.b*w)
  };
  return `rgb(${m.r}, ${m.g}, ${m.b})`;
}
function hexToRgb(h){
  const x = h.replace('#','');
  return { r: parseInt(x.slice(0,2),16), g: parseInt(x.slice(2,4),16), b: parseInt(x.slice(4,6),16) };
}

function attachTopbarEvents(){
  document.getElementById('btn-today').addEventListener('click', ()=>{
    setSelectedDay(new Date());
  });
  document.getElementById('btn-prev').addEventListener('click', ()=>{
    const d = new Date(selectedDay); d.setDate(d.getDate()-1);
    setSelectedDay(d);
  });
  document.getElementById('btn-next').addEventListener('click', ()=>{
    const d = new Date(selectedDay); d.setDate(d.getDate()+1);
    setSelectedDay(d);
  });

  document.getElementById('status-filter').addEventListener('change', paintBookings);
  document.getElementById('professional-filter').addEventListener('change', paintBookings);
  const specialtyInput = document.getElementById('specialty-filter');
  if (specialtyInput) {
    specialtyInput.addEventListener('input', ()=>{
      renderColumns();
      requestAnimationFrame(paintBookings);
    });
  }

  document.getElementById('find-first-slot').addEventListener('click', ()=>{
    alert('Función demo: búsqueda del primer espacio libre');
  });

  // Abrir modal de nueva reserva
  const newBtn = document.getElementById('btn-new');
  if (newBtn) newBtn.addEventListener('click', openReserveModal);

  // Imprimir
  const printBtn = document.getElementById('btn-print');
  if (printBtn) printBtn.addEventListener('click', ()=>{
    window.print();
  });
}

// ==========================
// Administración de Agendas
// ==========================
const AGENDA_STORAGE_KEY = 'agenda_specialties';
let agendaSpecialties = [];

function setupAgendaAdmin(){
  // Cargar desde storage
  try{
    const raw = localStorage.getItem(AGENDA_STORAGE_KEY);
    agendaSpecialties = Array.isArray(JSON.parse(raw)) ? JSON.parse(raw) : [];
  }catch{ agendaSpecialties = []; }

  // Render inicial
  renderAgendaUI();

  const addBtn = document.getElementById('agenda-add-btn');
  const input = document.getElementById('agenda-input');
  if(addBtn && input){
    addBtn.addEventListener('click', ()=>{
      addAgendaSpecialty(input.value.trim());
    });
    input.addEventListener('keydown', (e)=>{
      if(e.key === 'Enter'){
        e.preventDefault();
        addAgendaSpecialty(input.value.trim());
      }
    });
  }
}

function saveAgenda(){
  localStorage.setItem(AGENDA_STORAGE_KEY, JSON.stringify(agendaSpecialties));
}

function renderAgendaUI(){
  const list = document.getElementById('agenda-list');
  const datalist = document.getElementById('agenda-specialties');
  const input = document.getElementById('agenda-input');
  if(!list || !datalist) return;

  // Chips
  list.innerHTML = '';
  agendaSpecialties.forEach((name, idx)=>{
    const chip = document.createElement('div');
    chip.className = 'chip';
    const label = document.createElement('span');
    label.textContent = name;
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'chip-remove';
    btn.setAttribute('aria-label', `Eliminar ${name}`);
    btn.innerHTML = '&times;';
    btn.addEventListener('click', ()=>{
      removeAgendaSpecialty(idx);
    });
    chip.append(label, btn);
    list.appendChild(chip);
  });

  // Datalist
  datalist.innerHTML = '';
  agendaSpecialties.forEach(name=>{
    const opt = document.createElement('option');
    opt.value = name;
    datalist.appendChild(opt);
  });

  // Estado del input
  if(input){
    input.value = '';
    input.placeholder = agendaSpecialties.length >= 10 ? 'Límite alcanzado (10)' : 'Agregar especialidad...';
    input.disabled = agendaSpecialties.length >= 10;
  }
}

function addAgendaSpecialty(name){
  if(!name) return;
  if(agendaSpecialties.length >= 10) return;
  const exists = agendaSpecialties.some(s => s.toLowerCase() === name.toLowerCase());
  if(exists) return;
  agendaSpecialties.push(name);
  saveAgenda();
  renderAgendaUI();
}

function removeAgendaSpecialty(index){
  if(index < 0 || index >= agendaSpecialties.length) return;
  agendaSpecialties.splice(index, 1);
  saveAgenda();
  renderAgendaUI();
}

// ==========================
// Especialidades por profesional
// ==========================
const PROFSPEC_STORAGE_KEY = 'prof_specialties';
let profSpecialties = {}; // { [professionalId]: string[] }

function setupSpecialtyFilter(){
  // Cargar asignaciones
  loadProfSpecs();
}

function setupProfSpecialtiesEditor(){
  loadProfSpecs();
  renderProfSpecialtiesEditor();
}

function loadProfSpecs(){
  try{
    const raw = localStorage.getItem(PROFSPEC_STORAGE_KEY);
    const parsed = JSON.parse(raw);
    profSpecialties = parsed && typeof parsed === 'object' ? parsed : {};
  }catch{ profSpecialties = {}; }
}

function saveProfSpecs(){
  localStorage.setItem(PROFSPEC_STORAGE_KEY, JSON.stringify(profSpecialties));
}

function renderProfSpecialtiesEditor(){
  const host = document.getElementById('prof-specialties');
  const datalist = document.getElementById('agenda-specialties');
  if(!host) return;
  host.innerHTML = '';

  getAllProfessionals().forEach(p => {
    const row = document.createElement('div');
    row.className = 'profspec-row';

    const left = document.createElement('div');
    left.className = 'profspec-left';
    left.innerHTML = `<div class="avatar">${p.avatar}</div><div class="name">${p.name}</div>`;

    const right = document.createElement('div');
    right.className = 'profspec-right';

    // chips actuales
    const chips = document.createElement('div');
    chips.className = 'chips';

    const list = (profSpecialties[p.id] || []);
    list.forEach((spec, idx)=>{
      const chip = document.createElement('div');
      chip.className = 'chip';
      const label = document.createElement('span'); label.textContent = spec;
      const btn = document.createElement('button'); btn.type='button'; btn.className='chip-remove'; btn.innerHTML='&times;';
      btn.addEventListener('click', ()=>{
        removeProfSpecialty(p.id, idx);
      });
      chip.append(label, btn);
      chips.appendChild(chip);
    });

    const inline = document.createElement('div');
    inline.className = 'inline';
    const input = document.createElement('input');
    input.setAttribute('list','agenda-specialties');
    input.placeholder = 'Agregar especialidad...';
    input.autocomplete = 'off';
    const addBtn = document.createElement('button');
    addBtn.className = 'btn'; addBtn.type = 'button'; addBtn.textContent = 'Agregar';
    addBtn.addEventListener('click', ()=>{
      addProfSpecialty(p.id, input.value.trim());
      input.value = '';
    });
    input.addEventListener('keydown', (e)=>{
      if(e.key==='Enter'){
        e.preventDefault();
        addProfSpecialty(p.id, input.value.trim());
        input.value='';
      }
    });
    inline.append(input, addBtn);

    right.append(chips, inline);
    row.append(left, right);
    host.appendChild(row);
  });
}

function addProfSpecialty(profId, name){
  if(!name) return;
  const current = profSpecialties[profId] || [];
  if(current.length >= 10) return; // por consistencia con agendas
  const exists = current.some(s => s.toLowerCase() === name.toLowerCase());
  if(exists) return;
  profSpecialties[profId] = [...current, name];
  saveProfSpecs();
  renderProfSpecialtiesEditor();
  // si el filtro actual coincide, refrescar vista
  renderColumns(); requestAnimationFrame(paintBookings);
}

function removeProfSpecialty(profId, index){
  const current = profSpecialties[profId] || [];
  if(index<0 || index>=current.length) return;
  current.splice(index,1);
  profSpecialties[profId] = current;
  saveProfSpecs();
  renderProfSpecialtiesEditor();
  renderColumns(); requestAnimationFrame(paintBookings);
}

function getVisibleProfessionals(){
  const specialty = (document.getElementById('specialty-filter')?.value || '').trim().toLowerCase();
  if(!specialty){
    return [... getAllProfessionals()];
  }
  return getAllProfessionals().filter(p => {
    const list = (profSpecialties[p.id] || []).map(s => s.toLowerCase());
    return list.includes(specialty);
  });
}

// ==========================
// Reservas: persistencia y modal
// ==========================
const BOOKING_STORAGE_KEY = 'custom_bookings';
let currentEditingBookingId = null; // null => creando nueva

function getCustomBookings(){
  try{
    const raw = localStorage.getItem(BOOKING_STORAGE_KEY);
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  }catch{ return []; }
}
function saveCustomBookings(list){
  localStorage.setItem(BOOKING_STORAGE_KEY, JSON.stringify(list));
}
function addCustomBooking(b){
  const list = getCustomBookings();
  // asignar ID único si no tiene
  const id = b.id || (`bkg_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,7)}`);
  list.push({ ...b, id });
  saveCustomBookings(list);
}
function updateCustomBooking(b){
  const list = getCustomBookings();
  const idx = list.findIndex(x => x.id === b.id);
  if (idx !== -1) {
    list[idx] = { ...list[idx], ...b };
    saveCustomBookings(list);
  }
}
function deleteCustomBooking(id){
  const list = getCustomBookings().filter(x => x.id !== id);
  saveCustomBookings(list);
}

function sameDayISO(d1, d2){
  return d1 && d2 && d1 === d2; // recibe YYYY-MM-DD
}

function getBookingsForRender(){
  const pros = getVisibleProfessionals();
  const prosSet = new Set(pros.map(p=>p.id));
  const selectedISO = getSelectedISODate();
  // Demo bookings no tienen fecha: se muestran siempre si el profesional está visible
  const demo = BOOKINGS.filter(b => prosSet.has(b.professional));
  // Custom bookings sí tienen fecha: filtrar por día seleccionado
  const custom = getCustomBookings().filter(b => prosSet.has(b.professional) && sameDayISO(b.date, selectedISO));
  return [...demo, ...custom];
}

function getSelectedISODate(){
  return new Date(selectedDay.getTime() - selectedDay.getTimezoneOffset()*60000).toISOString().split('T')[0];
}

function hasConflict(professional, date, start, end, excludeId=null){
  const list = getCustomBookings().filter(b => b.professional === professional && b.date === date && (!excludeId || b.id !== excludeId));
  const s = toMinutes(start), e = toMinutes(end);
  return list.some(b => {
    const bs = toMinutes(b.start), be = toMinutes(b.end);
    // solapa si s < be y e > bs
    return s < be && e > bs;
  });
}

function setupReserveModal(){
  const overlay = document.getElementById('reserve-modal');
  const closeBtn = document.getElementById('reserve-close');
  const cancelBtn = document.getElementById('reserve-cancel');
  const saveBtn = document.getElementById('reserve-save');
  const deleteBtn = document.getElementById('reserve-delete');
  if(!overlay) return;

  // Cerrar
  const close = ()=>{ overlay.setAttribute('aria-hidden','true'); overlay.classList.remove('show'); };
  if (closeBtn) closeBtn.addEventListener('click', close);
  if (cancelBtn) cancelBtn.addEventListener('click', close);
  overlay.addEventListener('click', (e)=>{ if(e.target===overlay) close(); });

  // Guardar
  if (saveBtn) {
    saveBtn.addEventListener('click', ()=>{
      const profSel = document.getElementById('reserve-professional');
      const dateEl = document.getElementById('reserve-date');
      const startEl = document.getElementById('reserve-start');
      const endEl = document.getElementById('reserve-end');
      const personEl = document.getElementById('reserve-person');
      const titleEl = document.getElementById('reserve-title-input');
      const statusEl = document.getElementById('reserve-status');
      const colorEl = document.getElementById('reserve-color');

      const professional = profSel?.value || '';
      const date = (dateEl?.value || '').trim();
      const start = (startEl?.value || '').slice(0,5);
      const end = (endEl?.value || '').slice(0,5);
      const person = (personEl?.value || '').trim();
      const title = (titleEl?.value || '').trim();
      const status = statusEl?.value || 'reservado';
      const color = colorEl?.value || '#6ea8fe';

      // Validaciones mínimas
      if (!professional) { alert('Selecciona un profesional'); return; }
      if (!date) { alert('Selecciona una fecha'); return; }
      if (!start || !end) { alert('Selecciona horario de inicio y fin'); return; }
      if (toMinutes(end) <= toMinutes(start)) { alert('La hora de fin debe ser mayor a la de inicio'); return; }
      if (!person) { alert('Completa el nombre del paciente'); return; }
      if (!title) { alert('Completa el título/motivo'); return; }

      // Conflictos
      if (hasConflict(professional, date, start, end, currentEditingBookingId)){
        alert('Existe un conflicto de horario para ese profesional. Ajusta el horario.');
        return;
      }

      if (currentEditingBookingId){
        updateCustomBooking({ id: currentEditingBookingId, professional, date, start, end, person, title, status, color });
      } else {
        addCustomBooking({ professional, date, start, end, person, title, status, color });
      }
      // Refrescar UI
      renderColumns();
      requestAnimationFrame(paintBookings);
      // Cerrar
      overlay.setAttribute('aria-hidden','true'); overlay.classList.remove('show');
      currentEditingBookingId = null;
    });
  }
  if (deleteBtn){
    deleteBtn.addEventListener('click', ()=>{
      if (!currentEditingBookingId) return;
      if (!confirm('¿Eliminar esta reserva?')) return;
      deleteCustomBooking(currentEditingBookingId);
      renderColumns();
      requestAnimationFrame(paintBookings);
      overlay.setAttribute('aria-hidden','true'); overlay.classList.remove('show');
      currentEditingBookingId = null;
    });
  }
}

function openReserveModal(booking=null){
  const overlay = document.getElementById('reserve-modal');
  if(!overlay) return;
  // Poblar profesionales
  const sel = document.getElementById('reserve-professional');
  if (sel){
    sel.innerHTML = '';
    getAllProfessionals().forEach(p=>{
      const opt = document.createElement('option'); opt.value = p.id; opt.textContent = p.name; sel.appendChild(opt);
    });
    sel.disabled = sel.options.length === 0;
  }
  // Valores por defecto
  const dateEl = document.getElementById('reserve-date');
  const localISO = getSelectedISODate();
  if (dateEl) dateEl.value = booking?.date || localISO;
  const startEl = document.getElementById('reserve-start');
  const endEl = document.getElementById('reserve-end');
  if (startEl) startEl.value = booking?.start || '08:00';
  if (endEl) endEl.value = booking?.end || '09:00';
  const personEl = document.getElementById('reserve-person'); if (personEl) personEl.value = booking?.person || '';
  const titleEl = document.getElementById('reserve-title-input'); if (titleEl) titleEl.value = booking?.title || '';
  const statusEl = document.getElementById('reserve-status'); if (statusEl) statusEl.value = booking?.status || 'reservado';
  const colorEl = document.getElementById('reserve-color'); if (colorEl) colorEl.value = booking?.color || '#6ea8fe';
  if (sel && booking?.professional) sel.value = booking.professional;

  // Modo edición vs creación
  currentEditingBookingId = booking?.id || null;
  const deleteBtn = document.getElementById('reserve-delete');
  if (deleteBtn) deleteBtn.style.display = currentEditingBookingId ? 'inline-block' : 'none';

  overlay.classList.add('show');
  overlay.setAttribute('aria-hidden','false');
}

// ==========================
// Administración de Profesionales (hasta 15)
// ==========================
const PROS_STORAGE_KEY = 'professionals_list';
let customProfessionals = [];

function setupProfessionalsAdmin(){
  loadProfessionals();
  renderProfessionalsAdminUI();
  populateFilters();
  renderColumns();
  requestAnimationFrame(paintBookings);
}

function loadProfessionals(){
  try{
    const raw = localStorage.getItem(PROS_STORAGE_KEY);
    const arr = JSON.parse(raw);
    customProfessionals = Array.isArray(arr) ? arr : [];
  }catch{ customProfessionals = []; }
}

function saveProfessionals(){
  localStorage.setItem(PROS_STORAGE_KEY, JSON.stringify(customProfessionals));
}

function getAllProfessionals(){
  // Mostrar vacío hasta que el admin agregue profesionales
  return (customProfessionals && customProfessionals.length > 0) ? customProfessionals : [];
}

function renderProfessionalsAdminUI(){
  const list = document.getElementById('professional-list');
  const input = document.getElementById('professional-input');
  const addBtn = document.getElementById('professional-add-btn');
  if(!list || !input || !addBtn) return;

  // chips
  list.innerHTML = '';
  customProfessionals.forEach((p, idx)=>{
    const chip = document.createElement('div');
    chip.className = 'chip';
    const label = document.createElement('span'); label.textContent = p.name;
    const btn = document.createElement('button'); btn.type='button'; btn.className='chip-remove'; btn.innerHTML='&times;';
    btn.addEventListener('click', ()=>{
      removeProfessional(idx);
    });
    chip.append(label, btn);
    list.appendChild(chip);
  });

  // estado input
  input.value = '';
  input.placeholder = customProfessionals.length >= 15 ? 'Límite alcanzado (15)' : 'Agregar profesional (Nombre y Apellido)';
  input.disabled = customProfessionals.length >= 15;

  // listeners
  addBtn.onclick = ()=>{
    addProfessional(input.value.trim());
  };
  input.onkeydown = (e)=>{
    if(e.key==='Enter'){
      e.preventDefault();
      addProfessional(input.value.trim());
    }
  };
}

function addProfessional(name){
  if(!name) return;
  if(customProfessionals.length >= 15) return;
  // generar id slug único
  const baseId = slugify(name);
  let id = baseId; let k = 1;
  const existsId = (x)=> customProfessionals.some(p=>p.id===x);
  while(existsId(id) || PROFESSIONALS.some(p=>p.id===id)){
    k++; id = `${baseId}-${k}`;
  }
  const avatar = initials(name);
  customProfessionals.push({ id, name, avatar });
  saveProfessionals();
  populateFilters();
  renderProfessionalsAdminUI();
  renderProfSpecialtiesEditor();
  renderColumns();
  requestAnimationFrame(paintBookings);
}

function removeProfessional(index){
  if(index<0 || index>=customProfessionals.length) return;
  const prof = customProfessionals[index];
  customProfessionals.splice(index,1);
  saveProfessionals();
  // limpiar especialidades asignadas a este profesional
  if (prof && profSpecialties[prof.id]){
    delete profSpecialties[prof.id];
    saveProfSpecs();
  }
  populateFilters();
  renderProfessionalsAdminUI();
  renderProfSpecialtiesEditor();
  renderColumns();
  requestAnimationFrame(paintBookings);
}

function slugify(str){
  return str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');
}
function initials(str){
  const parts = str.trim().split(/\s+/);
  const a = (parts[0]?.[0]||'').toUpperCase();
  const b = (parts[1]?.[0]||'').toUpperCase();
  return `${a}${b}` || 'PR';
}

// Mini calendario básico
function renderMiniCalendar(){
  const cont = document.getElementById('mini-calendar');
  cont.innerHTML = '';

  const d = new Date(selectedDay);
  d.setDate(1);
  const month = d.getMonth();

  const header = document.createElement('div');
  header.className = 'mc-header';
  const prev = document.createElement('button'); prev.className='icon-btn'; prev.innerHTML='\u2039';
  const next = document.createElement('button'); next.className='icon-btn'; next.innerHTML='\u203A';
  const title = document.createElement('div'); title.textContent = d.toLocaleDateString('es-ES',{month:'long', year:'numeric'});
  header.append(prev,title,next);
  cont.appendChild(header);

  const grid = document.createElement('div');
  grid.className = 'mc-grid';

  const days = ['Do','Lu','Ma','Mi','Ju','Vi','Sa'];
  days.forEach(x=>{
    const c = document.createElement('div'); c.className='mc-cell header'; c.textContent=x; grid.appendChild(c);
  });

  const start = new Date(d);
  start.setDate(1 - ((d.getDay()+6)%7 + 1)%7); // empezar en domingo

  for(let i=0;i<42;i++){
    const cellDate = new Date(start); cellDate.setDate(start.getDate()+i);
    const c = document.createElement('div'); c.className='mc-cell day';
    c.textContent = cellDate.getDate();
    if(cellDate.toDateString() === new Date().toDateString()) c.classList.add('today');
    if(cellDate.getMonth() !== month) c.style.opacity=.4;
    if(cellDate.toDateString() === selectedDay.toDateString()) c.classList.add('selected');
    c.addEventListener('click',()=>{ setSelectedDay(new Date(cellDate)); });
    grid.appendChild(c);
  }
  cont.appendChild(grid);

  prev.addEventListener('click',()=>{ d.setMonth(d.getMonth()-1); setSelectedDay(d); });
  next.addEventListener('click',()=>{ d.setMonth(d.getMonth()+1); setSelectedDay(d); });
}
