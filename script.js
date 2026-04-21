// --- CONFIGURACIÓN & STORAGE ---
const STORAGE_KEYS = {
    RECORDS: 'attendance_records_v3',
    WORKERS: 'attendance_workers_v3',
    SESSION: 'attendance_session_v3',
    SETTINGS: 'attendance_settings_v3',
    FRUIT: 'attendance_fruit_v3'
};

const ADMIN_CREDENTIALS = { user: 'admin', pass: '123' };

// --- ELEMENTOS DEL DOM ---
const views = {
    login: document.getElementById('view-login'),
    worker: document.getElementById('view-worker'),
    admin: document.getElementById('view-admin'),
    fruit: document.getElementById('view-fruit')
};

// Login
const loginUser = document.getElementById('loginUser');
const loginPass = document.getElementById('loginPass');
const passContainer = document.getElementById('passContainer');
const btnLogin = document.getElementById('btnLogin');

// Worker View
const workerNameDisplay = document.getElementById('workerNameDisplay');
const workerAttendanceBody = document.getElementById('workerAttendanceBody');
const gpsStatus = document.getElementById('gpsStatus');
const btnIn = document.getElementById('btnIn');
const btnOut = document.getElementById('btnOut');

// Admin View
const configEntryTime = document.getElementById('configEntryTime');
const configExitTime = document.getElementById('configExitTime');
const btnSaveSettings = document.getElementById('btnSaveSettings');
const newWorkerName = document.getElementById('newWorkerName');
const btnAddWorker = document.getElementById('btnAddWorker');
const workerList = document.getElementById('workerList');
const adminAttendanceBody = document.getElementById('adminAttendanceBody');
const filterDateFrom = document.getElementById('filterDateFrom');
const filterDateTo = document.getElementById('filterDateTo');

// Modal de Edición
const editModal = document.getElementById('editModal');
const editTime = document.getElementById('editTime');
const editObservation = document.getElementById('editObservation');
const btnSaveEdit = document.getElementById('btnSaveEdit');
const btnCancelEdit = document.getElementById('btnCancelEdit');

// Fruit View — Export
const fruitSupplier = document.getElementById('fruitSupplier');
const fruitCrates = document.getElementById('fruitCrates');
const fruitWeight = document.getElementById('fruitWeight');
const fruitObs = document.getElementById('fruitObs');
const fruitEntriesBody = document.getElementById('fruitEntriesBody');
const fruitTodaySummary = document.getElementById('fruitTodaySummary');
const fruitSummaryBody = document.getElementById('fruitSummaryBody');
const fruitDateFrom = document.getElementById('fruitDateFrom');
const fruitDateTo = document.getElementById('fruitDateTo');

// Fruit View — Nacional
const fruitNationalCrates = document.getElementById('fruitNationalCrates');
const fruitNationalObs = document.getElementById('fruitNationalObs');
const fruitNationalEntriesBody = document.getElementById('fruitNationalEntriesBody');
const fruitNationalTodaySummary = document.getElementById('fruitNationalTodaySummary');

// --- ESTADO GLOBAL ---
let currentUser = null;
let currentCoords = null;
let recordToEditId = null;

// --- INICIALIZACIÓN ---
document.addEventListener('DOMContentLoaded', () => {
    initDateFilters();
    checkSession();
    startGpsTracking();
    renderWorkerSelect();
    loadSettings();
});

// --- EVENT LISTENERS ---
loginUser.addEventListener('change', togglePassVisibility);
btnLogin.addEventListener('click', handleLogin);
document.getElementById('btnLogoutWorker').addEventListener('click', logout);
document.getElementById('btnLogoutAdmin').addEventListener('click', logout);

btnIn.addEventListener('click', () => registerAttendance('Entrada'));
btnOut.addEventListener('click', () => registerAttendance('Salida'));

btnAddWorker.addEventListener('click', addWorker);
btnSaveSettings.addEventListener('click', saveSettings);
document.getElementById('btnExport').addEventListener('click', exportCSV);

filterDateFrom.addEventListener('change', renderAdminDashboard);
filterDateTo.addEventListener('change', renderAdminDashboard);

btnSaveEdit.addEventListener('click', saveEdit);
btnCancelEdit.addEventListener('click', () => {
    editModal.classList.add('hidden');
    recordToEditId = null;
});

// Fruit module event listeners
document.getElementById('btnFruit').addEventListener('click', showFruitView);
document.getElementById('btnBackToAdmin').addEventListener('click', () => { showView('admin'); renderAdminDashboard(); });
document.getElementById('btnAddFruit').addEventListener('click', addFruitEntry);
document.getElementById('btnAddNational').addEventListener('click', addNationalEntry);
document.getElementById('btnExportFruit').addEventListener('click', exportFruitCSV);

fruitDateFrom.addEventListener('change', renderFruitSummary);
fruitDateTo.addEventListener('change', renderFruitSummary);

document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => toggleFruitSubView(btn.dataset.tab));
});

// --- LÓGICA DE LOGIN & SESIÓN ---

function initDateFilters() {
    const today = new Date().toISOString().split('T')[0];
    filterDateFrom.value = today;
    filterDateTo.value = today;
}

function togglePassVisibility() {
    if (loginUser.value === 'admin') {
        passContainer.classList.remove('hidden');
    } else {
        passContainer.classList.add('hidden');
        loginPass.value = '';
    }
}

function handleLogin() {
    const user = loginUser.value;
    if (!user) return alert('Seleccione un usuario');

    if (user === 'admin') {
        if (loginPass.value === ADMIN_CREDENTIALS.pass) {
            currentUser = { name: 'Admin', isAdmin: true };
            saveSession(currentUser);
            showView('admin');
            renderAdminDashboard();
        } else {
            alert('Contraseña incorrecta');
        }
    } else {
        currentUser = { name: user, isAdmin: false };
        saveSession(currentUser);
        showView('worker');
        renderWorkerDashboard();
    }
}

function checkSession() {
    const session = JSON.parse(localStorage.getItem(STORAGE_KEYS.SESSION));
    if (session) {
        currentUser = session;
        if (session.isAdmin) {
            showView('admin');
            renderAdminDashboard();
        } else {
            showView('worker');
            renderWorkerDashboard();
        }
    } else {
        showView('login');
    }
}

function saveSession(user) {
    localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(user));
}

function logout() {
    localStorage.removeItem(STORAGE_KEYS.SESSION);
    currentUser = null;
    showView('login');
    loginUser.value = '';
    loginPass.value = '';
    passContainer.classList.add('hidden');
    renderWorkerSelect();
}

function showView(viewKey) {
    Object.values(views).forEach(v => v.classList.add('hidden'));
    views[viewKey].classList.remove('hidden');
}

// --- LÓGICA DE CONFIGURACIÓN ---

function loadSettings() {
    const settings = JSON.parse(localStorage.getItem(STORAGE_KEYS.SETTINGS)) || { entryTime: '08:00', exitTime: '17:00' };
    configEntryTime.value = settings.entryTime;
    configExitTime.value = settings.exitTime;
}

function saveSettings() {
    const settings = {
        entryTime: configEntryTime.value,
        exitTime: configExitTime.value
    };
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    alert('Horarios guardados correctamente');
}

// --- LÓGICA GPS ---

function startGpsTracking() {
    if (!navigator.geolocation) {
        gpsStatus.textContent = "GPS no disponible";
        return;
    }
    navigator.geolocation.watchPosition(
        (pos) => {
            currentCoords = { lat: pos.coords.latitude, lon: pos.coords.longitude };
            gpsStatus.textContent = `📍 Ubicación OK (Precisión: ${Math.round(pos.coords.accuracy)}m)`;
            gpsStatus.classList.add('bg-success');
        },
        (err) => {
            gpsStatus.textContent = "⚠️ Error GPS: " + err.message;
            gpsStatus.classList.add('bg-danger');
        },
        { enableHighAccuracy: true }
    );
}

// --- LÓGICA DE ASISTENCIA ---

function registerAttendance(type) {
    if (!currentCoords) return alert("Esperando señal GPS...");

    const now = new Date();
    const today = now.toLocaleDateString();
    const records = getRecords();

    // Regla: Una sola entrada y una sola salida por día
    const existing = records.find(r => r.worker === currentUser.name && r.date === today && r.type === type);
    if (existing) {
        return alert(`Ya ha registrado su ${type} el día de hoy (${existing.time}).`);
    }

    const settings = JSON.parse(localStorage.getItem(STORAGE_KEYS.SETTINGS)) || { entryTime: '08:00', exitTime: '17:00' };
    
    const [status, extra, diff] = calculateStatus(type, now, settings);

    const record = {
        id: Date.now(),
        worker: currentUser.name,
        type: type,
        date: today,
        time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        lat: currentCoords.lat,
        lon: currentCoords.lon,
        status: status,
        extra: extra,
        diffMins: diff,
        observation: ''
    };

    records.unshift(record);
    localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(records));
    
    alert(`✅ ${type} registrada: ${record.status} ${record.extra}`);
    renderWorkerDashboard();
}

function calculateStatus(type, timeObj, settings) {
    let statusBadge = '';
    let extraInfo = '';
    let diffMinsTotal = 0;

    if (type === 'Entrada') {
        const [expH, expM] = settings.entryTime.split(':').map(Number);
        const entryLimit = new Date(timeObj);
        entryLimit.setHours(expH, expM, 0);

        if (timeObj > entryLimit) {
            const diffMs = timeObj - entryLimit;
            const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
            const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
            diffMinsTotal = Math.floor(diffMs / (1000 * 60));
            
            statusBadge = 'Atraso';
            extraInfo = `${diffHrs > 0 ? diffHrs + 'h ' : ''}${diffMins}m Atraso`;
        } else {
            statusBadge = 'Puntual';
        }
    } else {
        const [expH, expM] = settings.exitTime.split(':').map(Number);
        const exitLimit = new Date(timeObj);
        exitLimit.setHours(expH, expM, 0);

        if (timeObj > exitLimit) {
            const diffMs = timeObj - exitLimit;
            const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
            const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
            diffMinsTotal = Math.floor(diffMs / (1000 * 60));
            
            statusBadge = 'Extra';
            extraInfo = `${diffHrs > 0 ? diffHrs + 'h ' : ''}${diffMins}m Extras`;
        } else {
            statusBadge = 'Normal';
        }
    }
    return [statusBadge, extraInfo, diffMinsTotal];
}

function getRecords() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.RECORDS)) || [];
}

// --- LÓGICA DE EDICIÓN (ADMIN) ---

window.openEditModal = function(id) {
    const records = getRecords();
    const record = records.find(r => r.id === id);
    if (!record) return;

    recordToEditId = id;
    // Convertir "14:30" a "14:30:00" para el input type="time" si es necesario, 
    // pero usualmente acepta HH:mm
    const [h, m] = record.time.split(':');
    editTime.value = `${h.padStart(2, '0')}:${m.padStart(2, '0')}`;
    editObservation.value = record.observation || '';
    editModal.classList.remove('hidden');
};

function saveEdit() {
    const newTime = editTime.value;
    const observation = editObservation.value.trim();

    if (!newTime) return alert('Seleccione una hora válida');
    if (!observation) return alert('El justificativo es obligatorio');

    const records = getRecords();
    const index = records.findIndex(r => r.id === recordToEditId);
    if (index === -1) return;

    const record = records[index];
    const settings = JSON.parse(localStorage.getItem(STORAGE_KEYS.SETTINGS)) || { entryTime: '08:00', exitTime: '17:00' };

    // Crear un objeto Date para recalcular el estado
    // Usamos la fecha original del registro
    const [day, month, year] = record.date.split('/');
    const [h, m] = newTime.split(':');
    const newDateObj = new Date(year, month - 1, day, h, m);

    const [status, extra, diff] = calculateStatus(record.type, newDateObj, settings);

    record.time = newTime;
    record.status = status;
    record.extra = extra;
    record.diffMins = diff;
    record.observation = observation;

    records[index] = record;
    localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(records));

    alert('Registro actualizado correctamente');
    editModal.classList.add('hidden');
    recordToEditId = null;
    renderAdminDashboard();
}

// --- RENDERS ---

function renderWorkerSelect() {
    const workers = JSON.parse(localStorage.getItem(STORAGE_KEYS.WORKERS)) || [];
    loginUser.innerHTML = `
        <option value="">-- Seleccione su nombre --</option>
        <option value="admin">Administrador</option>
        ${workers.map(w => `<option value="${escapeHTML(w.name)}">${escapeHTML(w.name)}</option>`).join('')}
    `;
}

function renderWorkerDashboard() {
    workerNameDisplay.textContent = currentUser.name;
    const records = getRecords().filter(r => r.worker === currentUser.name && r.date === new Date().toLocaleDateString());
    
    workerAttendanceBody.innerHTML = records.map(r => `
        <tr>
            <td><strong>${r.type}</strong></td>
            <td>${r.time}</td>
            <td>
                <span class="badge ${getStatusClass(r.status)}">${r.status}</span>
                <div style="font-size: 0.7rem; color: var(--text-muted)">${r.extra}</div>
            </td>
            <td><small>${escapeHTML(r.observation || '-')}</small></td>
        </tr>
    `).join('') || '<tr><td colspan="4" class="text-center">Sin registros hoy</td></tr>';
}

function renderAdminDashboard() {
    renderWorkerList();
    const allRecords = getRecords();
    const from = filterDateFrom.value; // YYYY-MM-DD
    const to = filterDateTo.value;     // YYYY-MM-DD

    const filteredRecords = allRecords.filter(r => {
        // El registro tiene fecha en formato DD/MM/YYYY
        const [d, m, y] = r.date.split('/');
        const recordDate = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`; // Convertir a YYYY-MM-DD para comparar
        return recordDate >= from && recordDate <= to;
    });

    adminAttendanceBody.innerHTML = filteredRecords.map(r => `
        <tr>
            <td><strong>${escapeHTML(r.worker)}</strong></td>
            <td>${r.type}</td>
            <td>${r.date}</td>
            <td>${r.time}</td>
            <td>
                <span class="badge ${getStatusClass(r.status)}">${r.status}</span>
                <div style="font-size: 0.7rem">${r.extra}</div>
            </td>
            <td><a href="https://www.google.com/maps?q=${r.lat},${r.lon}" target="_blank" class="maps-link">📍 Ver</a></td>
            <td><small>${escapeHTML(r.observation || '-')}</small></td>
            <td>
                <button class="btn btn-edit-sm" onclick="openEditModal(${r.id})">Editar</button>
            </td>
        </tr>
    `).join('') || '<tr><td colspan="8" class="text-center">No hay registros en este rango</td></tr>';
}

function addWorker() {
    const name = newWorkerName.value.trim();
    if (!name) return;
    const workers = JSON.parse(localStorage.getItem(STORAGE_KEYS.WORKERS)) || [];
    workers.push({ id: Date.now(), name });
    localStorage.setItem(STORAGE_KEYS.WORKERS, JSON.stringify(workers));
    newWorkerName.value = '';
    renderWorkerList();
    renderWorkerSelect(); // Actualizar el select de login si se añaden desde admin
}

function renderWorkerList() {
    const workers = JSON.parse(localStorage.getItem(STORAGE_KEYS.WORKERS)) || [];
    workerList.innerHTML = workers.map(w => `
        <li>
            <span>${escapeHTML(w.name)}</span>
            <button class="btn btn-danger-sm" onclick="deleteWorker(${w.id})">Eliminar</button>
        </li>
    `).join('');
}

window.deleteWorker = function(id) {
    if (!confirm('¿Seguro que desea eliminar a este trabajador?')) return;
    let workers = JSON.parse(localStorage.getItem(STORAGE_KEYS.WORKERS)) || [];
    workers = workers.filter(w => w.id !== id);
    localStorage.setItem(STORAGE_KEYS.WORKERS, JSON.stringify(workers));
    renderWorkerList();
    renderWorkerSelect(); // Actualizar el select de login
};

function getStatusClass(status) {
    switch(status) {
        case 'Atraso': return 'bg-danger';
        case 'Puntual': return 'bg-success';
        case 'Extra': return 'bg-warning';
        default: return 'bg-info';
    }
}

function exportCSV() {
    const allRecords = getRecords();
    const from = filterDateFrom.value;
    const to = filterDateTo.value;

    const filteredRecords = allRecords.filter(r => {
        const [d, m, y] = r.date.split('/');
        const recordDate = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
        return recordDate >= from && recordDate <= to;
    });

    if (filteredRecords.length === 0) return alert('No hay registros para exportar en este rango');

    let csv = "Trabajador,Tipo,Fecha,Hora,Estado,Detalles,Minutos_Diferencia,Lat,Lon,Observacion\n";
    filteredRecords.forEach(r => {
        csv += `"${r.worker}",${r.type},${r.date},${r.time},${r.status},"${r.extra}",${r.diffMins || 0},${r.lat},${r.lon},"${r.observation || ''}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `asistencia_${from}_al_${to}.csv`;
    a.click();
}

function escapeHTML(str) {
    const p = document.createElement('p');
    p.textContent = str;
    return p.innerHTML;
}

// --- LÓGICA DE ENVÍO DE FRUTA ---

function showFruitView() {
    showView('fruit');
    toggleFruitSubView('fruit-national');
}

function toggleFruitSubView(tabId) {
    document.querySelectorAll('#view-fruit .tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tabId);
    });
    document.querySelectorAll('#view-fruit .tab-content').forEach(tc => {
        tc.classList.toggle('hidden', tc.id !== tabId);
    });
    if (tabId === 'fruit-national') {
        renderNationalEntries();
    } else if (tabId === 'fruit-export') {
        renderExportEntries();
        renderSupplierDatalist();
    } else if (tabId === 'fruit-summary') {
        const today = new Date().toISOString().split('T')[0];
        fruitDateFrom.value = today;
        fruitDateTo.value = today;
        renderFruitSummary();
    }
}

function getFruitRecords() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.FRUIT)) || [];
}

// --- Nacional ---

function addNationalEntry() {
    const crates = parseInt(fruitNationalCrates.value, 10);
    if (!crates || crates < 1) return alert('Ingrese una cantidad válida de gavetas');

    const now = new Date();
    const record = {
        id: Date.now(),
        type: 'Nacional',
        supplier: '',
        crates: crates,
        weight: 0,
        date: now.toLocaleDateString(),
        time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        observation: fruitNationalObs.value.trim()
    };

    const records = getFruitRecords();
    records.unshift(record);
    localStorage.setItem(STORAGE_KEYS.FRUIT, JSON.stringify(records));

    fruitNationalCrates.value = '5';
    fruitNationalObs.value = '';
    renderNationalEntries();
}

window.deleteNationalEntry = function(id) {
    if (!confirm('¿Eliminar este registro?')) return;
    let records = getFruitRecords();
    records = records.filter(r => r.id !== id);
    localStorage.setItem(STORAGE_KEYS.FRUIT, JSON.stringify(records));
    renderNationalEntries();
};

function renderNationalEntries() {
    const today = new Date().toLocaleDateString();
    const records = getFruitRecords().filter(r => r.date === today && r.type === 'Nacional');
    const totalCrates = records.reduce((s, r) => s + r.crates, 0);

    fruitNationalTodaySummary.innerHTML = `<span class="badge bg-info">Registros: ${records.length}</span> <span class="badge bg-warning">Gavetas: ${totalCrates}</span>`;

    fruitNationalEntriesBody.innerHTML = records.map(r => `
        <tr>
            <td>${r.crates}</td>
            <td>${r.time}</td>
            <td><small>${escapeHTML(r.observation || '-')}</small></td>
            <td><button class="btn btn-danger-sm" onclick="deleteNationalEntry(${r.id})">X</button></td>
        </tr>
    `).join('') || '<tr><td colspan="4" class="text-center">Sin registros hoy</td></tr>';
}

// --- Exportación ---

function addFruitEntry() {
    const supplier = fruitSupplier.value.trim();
    const crates = parseInt(fruitCrates.value, 10);
    const weight = parseFloat(fruitWeight.value);

    if (!supplier) return alert('Ingrese el nombre del proveedor');
    if (!crates || crates < 1) return alert('Ingrese una cantidad válida de gavetas');
    if (!weight || weight <= 0) return alert('Ingrese el peso');

    const now = new Date();
    const record = {
        id: Date.now(),
        type: 'Exportación',
        supplier: supplier,
        crates: crates,
        weight: weight,
        date: now.toLocaleDateString(),
        time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        observation: fruitObs.value.trim()
    };

    const records = getFruitRecords();
    records.unshift(record);
    localStorage.setItem(STORAGE_KEYS.FRUIT, JSON.stringify(records));

    fruitSupplier.value = '';
    fruitCrates.value = '5';
    fruitWeight.value = '';
    fruitObs.value = '';

    renderExportEntries();
    renderSupplierDatalist();
}

window.deleteFruitEntry = function(id) {
    if (!confirm('¿Eliminar este registro?')) return;
    let records = getFruitRecords();
    records = records.filter(r => r.id !== id);
    localStorage.setItem(STORAGE_KEYS.FRUIT, JSON.stringify(records));
    renderExportEntries();
};

function renderExportEntries() {
    const today = new Date().toLocaleDateString();
    const records = getFruitRecords().filter(r => r.date === today && r.type === 'Exportación');

    const totalCrates = records.reduce((s, r) => s + r.crates, 0);
    const totalWeight = records.reduce((s, r) => s + r.weight, 0);

    fruitTodaySummary.innerHTML = `<span class="badge bg-info">Registros: ${records.length}</span> <span class="badge bg-warning">Gavetas: ${totalCrates}</span> <span class="badge bg-success">Peso: ${totalWeight.toFixed(1)} kg</span>`;

    fruitEntriesBody.innerHTML = records.map(r => `
        <tr>
            <td><strong>${escapeHTML(r.supplier)}</strong></td>
            <td>${r.crates}</td>
            <td>${r.weight}</td>
            <td>${r.time}</td>
            <td><button class="btn btn-danger-sm" onclick="deleteFruitEntry(${r.id})">X</button></td>
        </tr>
    `).join('') || '<tr><td colspan="5" class="text-center">Sin registros hoy</td></tr>';
}

function renderSupplierDatalist() {
    const records = getFruitRecords();
    const suppliers = [...new Set(records.filter(r => r.type === 'Exportación').map(r => r.supplier).filter(Boolean))];
    const datalist = document.getElementById('supplierList');
    datalist.innerHTML = suppliers.map(s => `<option value="${escapeHTML(s)}">`).join('');
}

// --- Resumen ---

function renderFruitSummary() {
    const from = fruitDateFrom.value;
    const to = fruitDateTo.value;
    const allRecords = getFruitRecords();

    const filtered = allRecords.filter(r => {
        const [d, m, y] = r.date.split('/');
        const recordDate = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
        return recordDate >= from && recordDate <= to;
    });

    if (filtered.length === 0) {
        fruitSummaryBody.innerHTML = '<tr><td colspan="5" class="text-center">Sin registros en este rango</td></tr>';
        return;
    }

    const byDate = {};
    filtered.forEach(r => {
        if (!byDate[r.date]) byDate[r.date] = {};
        const key = r.type === 'Nacional' ? `Nacional||${r.date}` : `${r.supplier}||${r.type}`;
        if (!byDate[r.date][key]) {
            byDate[r.date][key] = { supplier: r.supplier, type: r.type, count: 0, crates: 0, weight: 0 };
        }
        byDate[r.date][key].count++;
        byDate[r.date][key].crates += r.crates;
        byDate[r.date][key].weight += r.weight;
    });

    const sortedDates = Object.keys(byDate).sort((a, b) => {
        const [da, ma, ya] = a.split('/');
        const [db, mb, yb] = b.split('/');
        return `${ya}-${ma.padStart(2,'0')}-${da.padStart(2,'0')}`.localeCompare(`${yb}-${mb.padStart(2,'0')}-${db.padStart(2,'0')}`);
    });

    let totalCount = 0, totalCrates = 0, totalWeight = 0;
    let html = '';

    sortedDates.forEach(date => {
        const entries = Object.values(byDate[date]);
        let dateCount = 0, dateCrates = 0, dateWeight = 0;

        html += `<tr class="summary-date-row"><td colspan="5"><strong>${date}</strong></td></tr>`;

        entries.forEach(e => {
            html += `<tr>
                <td><span class="badge ${e.type === 'Nacional' ? 'bg-info' : 'bg-success'}">${e.type === 'Nacional' ? 'Nacional' : 'Exportación'}</span></td>
                <td>${e.type === 'Nacional' ? '—' : escapeHTML(e.supplier)}</td>
                <td>${e.count}</td>
                <td>${e.crates}</td>
                <td>${e.type === 'Nacional' ? '—' : e.weight.toFixed(1)}</td>
            </tr>`;
            dateCount += e.count;
            dateCrates += e.crates;
            dateWeight += e.weight;
        });

        html += `<tr class="summary-date-subtotal">
            <td><em>Subtotal ${date}</em></td>
            <td></td>
            <td>${dateCount}</td>
            <td>${dateCrates}</td>
            <td>${dateWeight.toFixed(1)}</td>
        </tr>`;

        totalCount += dateCount;
        totalCrates += dateCrates;
        totalWeight += dateWeight;
    });

    html += `<tr class="summary-grand-total">
        <td><strong>TOTAL</strong></td>
        <td></td>
        <td><strong>${totalCount}</strong></td>
        <td><strong>${totalCrates}</strong></td>
        <td><strong>${totalWeight.toFixed(1)}</strong></td>
    </tr>`;

    fruitSummaryBody.innerHTML = html;
}

function exportFruitCSV() {
    const from = fruitDateFrom.value;
    const to = fruitDateTo.value;
    const allRecords = getFruitRecords();

    const filtered = allRecords.filter(r => {
        const [d, m, y] = r.date.split('/');
        const recordDate = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
        return recordDate >= from && recordDate <= to;
    });

    if (filtered.length === 0) return alert('No hay registros para exportar en este rango');

    let csv = "Tipo,Proveedor,Gavetas,Peso_kg,Fecha,Hora,Observacion\n";
    filtered.forEach(r => {
        csv += `${r.type},"${r.supplier || ''}",${r.crates},${r.weight},${r.date},${r.time},"${r.observation || ''}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fruta_${from}_al_${to}.csv`;
    a.click();
}
