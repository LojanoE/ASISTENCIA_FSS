// --- CONFIGURACIÓN ---
const SESSION_KEY = 'attendance_session_v3';

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
const fruitNationalSupplier = document.getElementById('fruitNationalSupplier');
const fruitNationalCrates = document.getElementById('fruitNationalCrates');
const fruitNationalObs = document.getElementById('fruitNationalObs');
const fruitNationalEntriesBody = document.getElementById('fruitNationalEntriesBody');
const fruitNationalTodaySummary = document.getElementById('fruitNationalTodaySummary');

// --- ESTADO GLOBAL ---
let currentUser = null;
let currentCoords = null;
let recordToEditId = null;

// --- HELPERS ---
function handleDbError(err) {
    console.error('DB Error:', err);
    alert('Error de conexión. Verifique su acceso a internet e intente de nuevo.');
}

function escapeHTML(str) {
    const p = document.createElement('p');
    p.textContent = str;
    return p.innerHTML;
}

function downloadExcel(htmlTable, filename) {
    const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
<head><meta charset="utf-8"><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>Hoja1</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head>
<body>${htmlTable}</body></html>`;
    const blob = new Blob([html], { type: 'application/vnd.ms-excel;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}

// --- INICIALIZACIÓN ---
document.addEventListener('DOMContentLoaded', async () => {
    initDateFilters();
    checkSession();
    startGpsTracking();
    try {
        await renderWorkerSelect();
        await loadSettings();
    } catch (err) {
        handleDbError(err);
    }
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
document.getElementById('btnExport').addEventListener('click', exportAttendanceExcel);

filterDateFrom.addEventListener('change', () => renderAdminDashboard());
filterDateTo.addEventListener('change', () => renderAdminDashboard());

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
document.getElementById('btnExportFruit').addEventListener('click', exportFruitExcel);

fruitDateFrom.addEventListener('change', () => renderFruitSummary());
fruitDateTo.addEventListener('change', () => renderFruitSummary());

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

async function handleLogin() {
    const user = loginUser.value;
    if (!user) return alert('Seleccione un usuario');

    if (user === 'admin') {
        try {
            const dbPassword = await SupabaseDB.getAdminPassword();
            if (loginPass.value === dbPassword) {
                currentUser = { name: 'Admin', isAdmin: true };
                saveSession(currentUser);
                showView('admin');
                await renderAdminDashboard();
            } else {
                alert('Contraseña incorrecta');
            }
        } catch (err) {
            handleDbError(err);
        }
    } else {
        currentUser = { name: user, isAdmin: false };
        saveSession(currentUser);
        showView('worker');
        await renderWorkerDashboard();
    }
}

async function checkSession() {
    const session = JSON.parse(localStorage.getItem(SESSION_KEY));
    if (session) {
        currentUser = session;
        if (session.isAdmin) {
            showView('admin');
            await renderAdminDashboard();
        } else {
            showView('worker');
            await renderWorkerDashboard();
        }
    } else {
        showView('login');
    }
}

function saveSession(user) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

function logout() {
    localStorage.removeItem(SESSION_KEY);
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

async function loadSettings() {
    try {
        const settings = await SupabaseDB.getSettings();
        configEntryTime.value = settings.entryTime;
        configExitTime.value = settings.exitTime;
    } catch {
        configEntryTime.value = '08:00';
        configExitTime.value = '17:00';
    }
}

async function saveSettings() {
    try {
        await SupabaseDB.saveSettings(configEntryTime.value, configExitTime.value);
        alert('Horarios guardados correctamente');
    } catch (err) {
        handleDbError(err);
    }
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

async function registerAttendance(type) {
    if (!currentCoords) return alert("Esperando señal GPS...");

    const now = new Date();
    const today = now.toLocaleDateString();

    try {
        const records = await SupabaseDB.getRecords();
        const existing = records.find(r => r.worker === currentUser.name && r.date === today && r.type === type);
        if (existing) {
            return alert(`Ya ha registrado su ${type} el día de hoy (${existing.time}).`);
        }

        const settings = await SupabaseDB.getSettings();
        const [status, extra, diff] = calculateStatus(type, now, settings);

        const record = {
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

        await SupabaseDB.addRecord(record);
        alert(`✅ ${type} registrada: ${status} ${extra}`);
        await renderWorkerDashboard();
    } catch (err) {
        handleDbError(err);
    }
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

// --- LÓGICA DE EDICIÓN (ADMIN) ---

window.openEditModal = async function(id) {
    try {
        const records = await SupabaseDB.getRecords();
        const record = records.find(r => r.id === id);
        if (!record) return;

        recordToEditId = id;
        const [h, m] = record.time.split(':');
        editTime.value = `${h.padStart(2, '0')}:${m.padStart(2, '0')}`;
        editObservation.value = record.observation || '';
        editModal.classList.remove('hidden');
    } catch (err) {
        handleDbError(err);
    }
};

async function saveEdit() {
    const newTime = editTime.value;
    const observation = editObservation.value.trim();

    if (!newTime) return alert('Seleccione una hora válida');
    if (!observation) return alert('El justificativo es obligatorio');

    try {
        const records = await SupabaseDB.getRecords();
        const record = records.find(r => r.id === recordToEditId);
        if (!record) return;

        const settings = await SupabaseDB.getSettings();
        const [day, month, year] = record.date.split('/');
        const [h, m] = newTime.split(':');
        const newDateObj = new Date(year, month - 1, day, h, m);

        const [status, extra, diff] = calculateStatus(record.type, newDateObj, settings);

        await SupabaseDB.updateRecord(recordToEditId, {
            time: newTime,
            status: status,
            extra: extra,
            diff_mins: diff,
            observation: observation
        });

        alert('Registro actualizado correctamente');
        editModal.classList.add('hidden');
        recordToEditId = null;
        await renderAdminDashboard();
    } catch (err) {
        handleDbError(err);
    }
}

// --- RENDERS ---

async function renderWorkerSelect() {
    try {
        const workers = await SupabaseDB.getWorkers();
        loginUser.innerHTML = `
            <option value="">-- Seleccione su nombre --</option>
            <option value="admin">Administrador</option>
            ${workers.map(w => `<option value="${escapeHTML(w.name)}">${escapeHTML(w.name)}</option>`).join('')}
        `;
    } catch (err) {
        handleDbError(err);
    }
}

async function renderWorkerDashboard() {
    workerNameDisplay.textContent = currentUser.name;
    try {
        const records = await SupabaseDB.getRecords();
        const today = new Date().toLocaleDateString();
        const filtered = records.filter(r => r.worker === currentUser.name && r.date === today);
        
        workerAttendanceBody.innerHTML = filtered.map(r => `
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
    } catch (err) {
        handleDbError(err);
    }
}

async function renderAdminDashboard() {
    await renderWorkerList();
    try {
        const allRecords = await SupabaseDB.getRecords();
        const from = filterDateFrom.value;
        const to = filterDateTo.value;

        const filteredRecords = allRecords.filter(r => {
            const [d, m, y] = r.date.split('/');
            const recordDate = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
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
    } catch (err) {
        handleDbError(err);
    }
}

async function addWorker() {
    const name = newWorkerName.value.trim();
    if (!name) return;
    try {
        await SupabaseDB.addWorker(name);
        newWorkerName.value = '';
        await renderWorkerList();
        await renderWorkerSelect();
    } catch (err) {
        handleDbError(err);
    }
}

async function renderWorkerList() {
    try {
        const workers = await SupabaseDB.getWorkers();
        workerList.innerHTML = workers.map(w => `
            <li>
                <span>${escapeHTML(w.name)}</span>
                <button class="btn btn-danger-sm" onclick="deleteWorker(${w.id})">Eliminar</button>
            </li>
        `).join('');
    } catch (err) {
        handleDbError(err);
    }
}

window.deleteWorker = async function(id) {
    if (!confirm('¿Seguro que desea eliminar a este trabajador?')) return;
    try {
        await SupabaseDB.deleteWorker(id);
        await renderWorkerList();
        await renderWorkerSelect();
    } catch (err) {
        handleDbError(err);
    }
};

function getStatusClass(status) {
    switch(status) {
        case 'Atraso': return 'bg-danger';
        case 'Puntual': return 'bg-success';
        case 'Extra': return 'bg-warning';
        default: return 'bg-info';
    }
}

async function exportAttendanceExcel() {
    try {
        const allRecords = await SupabaseDB.getRecords();
        const from = filterDateFrom.value;
        const to = filterDateTo.value;

        const filteredRecords = allRecords.filter(r => {
            const [d, m, y] = r.date.split('/');
            const recordDate = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
            return recordDate >= from && recordDate <= to;
        });

        if (filteredRecords.length === 0) return alert('No hay registros para exportar en este rango');

        let html = '<table border="1" cellpadding="4" cellspacing="0" style="border-collapse:collapse;">';
        html += '<tr style="background-color:#2563eb;color:white;font-weight:bold;"><td>Trabajador</td><td>Tipo</td><td>Fecha</td><td>Hora</td><td>Estado</td><td>Detalles</td><td>Min. Diferencia</td><td>Lat</td><td>Lon</td><td>Observacion</td></tr>';
        filteredRecords.forEach(r => {
            html += `<tr><td>${escapeHTML(r.worker)}</td><td>${r.type}</td><td>${r.date}</td><td>${r.time}</td><td>${r.status}</td><td>${escapeHTML(r.extra || '')}</td><td>${r.diffMins || 0}</td><td>${r.lat}</td><td>${r.lon}</td><td>${escapeHTML(r.observation || '')}</td></tr>`;
        });
        html += '</table>';

        downloadExcel(html, `asistencia_${from}_al_${to}.xls`);
    } catch (err) {
        handleDbError(err);
    }
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
        renderSupplierDatalist();
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

// --- Nacional ---

async function addNationalEntry() {
    const supplier = fruitNationalSupplier.value.trim();
    const crates = parseInt(fruitNationalCrates.value, 10);
    if (!supplier) return alert('Ingrese el nombre del proveedor');
    if (!crates || crates < 1) return alert('Ingrese una cantidad válida de gavetas');

    const now = new Date();
    const record = {
        type: 'Nacional',
        supplier: supplier,
        crates: crates,
        weight: 0,
        date: now.toLocaleDateString(),
        time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        observation: fruitNationalObs.value.trim()
    };

    try {
        await SupabaseDB.addFruitRecord(record);
        fruitNationalSupplier.value = '';
        fruitNationalCrates.value = '5';
        fruitNationalObs.value = '';
        await renderNationalEntries();
        renderSupplierDatalist();
    } catch (err) {
        handleDbError(err);
    }
}

window.deleteNationalEntry = async function(id) {
    if (!confirm('¿Eliminar este registro?')) return;
    try {
        await SupabaseDB.deleteFruitRecord(id);
        await renderNationalEntries();
    } catch (err) {
        handleDbError(err);
    }
};

async function renderNationalEntries() {
    try {
        const records = await SupabaseDB.getFruitRecords();
        const today = new Date().toLocaleDateString();
        const national = records.filter(r => r.date === today && r.type === 'Nacional');
        const totalCrates = national.reduce((s, r) => s + r.crates, 0);

        fruitNationalTodaySummary.innerHTML = `<span class="badge bg-info">Registros: ${national.length}</span> <span class="badge bg-warning">Gavetas: ${totalCrates}</span>`;

        fruitNationalEntriesBody.innerHTML = national.map(r => `
            <tr>
                <td>${escapeHTML(r.supplier)}</td>
                <td>${r.crates}</td>
                <td>${r.time}</td>
                <td><small>${escapeHTML(r.observation || '-')}</small></td>
                <td><button class="btn btn-danger-sm" onclick="deleteNationalEntry(${r.id})">X</button></td>
            </tr>
        `).join('') || '<tr><td colspan="5" class="text-center">Sin registros hoy</td></tr>';
    } catch (err) {
        handleDbError(err);
    }
}

// --- Exportación ---

async function addFruitEntry() {
    const supplier = fruitSupplier.value.trim();
    const crates = parseInt(fruitCrates.value, 10);
    const weight = parseFloat(fruitWeight.value);

    if (!supplier) return alert('Ingrese el nombre del proveedor');
    if (!crates || crates < 1) return alert('Ingrese una cantidad válida de gavetas');
    if (!weight || weight <= 0) return alert('Ingrese el peso');

    const now = new Date();
    const record = {
        type: 'Exportación',
        supplier: supplier,
        crates: crates,
        weight: weight,
        date: now.toLocaleDateString(),
        time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        observation: fruitObs.value.trim()
    };

    try {
        await SupabaseDB.addFruitRecord(record);
        fruitSupplier.value = '';
        fruitCrates.value = '5';
        fruitWeight.value = '';
        fruitObs.value = '';
        await renderExportEntries();
        renderSupplierDatalist();
    } catch (err) {
        handleDbError(err);
    }
}

window.deleteFruitEntry = async function(id) {
    if (!confirm('¿Eliminar este registro?')) return;
    try {
        await SupabaseDB.deleteFruitRecord(id);
        await renderExportEntries();
    } catch (err) {
        handleDbError(err);
    }
};

async function renderExportEntries() {
    try {
        const records = await SupabaseDB.getFruitRecords();
        const today = new Date().toLocaleDateString();
        const exports = records.filter(r => r.date === today && r.type === 'Exportación');

        const totalCrates = exports.reduce((s, r) => s + r.crates, 0);
        const totalWeight = exports.reduce((s, r) => s + r.weight, 0);

        fruitTodaySummary.innerHTML = `<span class="badge bg-info">Registros: ${exports.length}</span> <span class="badge bg-warning">Gavetas: ${totalCrates}</span> <span class="badge bg-success">Peso: ${totalWeight.toFixed(1)} kg</span>`;

        fruitEntriesBody.innerHTML = exports.map(r => `
            <tr>
                <td><strong>${escapeHTML(r.supplier)}</strong></td>
                <td>${r.crates}</td>
                <td>${r.weight}</td>
                <td>${r.time}</td>
                <td><button class="btn btn-danger-sm" onclick="deleteFruitEntry(${r.id})">X</button></td>
            </tr>
        `).join('') || '<tr><td colspan="5" class="text-center">Sin registros hoy</td></tr>';
    } catch (err) {
        handleDbError(err);
    }
}

async function renderSupplierDatalist() {
    try {
        const suppliers = await SupabaseDB.getSuppliers();
        const datalist = document.getElementById('supplierList');
        datalist.innerHTML = suppliers.map(s => `<option value="${escapeHTML(s)}">`).join('');
    } catch {
        // non-critical, silently fail
    }
}

// --- Resumen ---

async function renderFruitSummary() {
    try {
        const allRecords = await SupabaseDB.getFruitRecords();
        const from = fruitDateFrom.value;
        const to = fruitDateTo.value;

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
            const key = r.supplier;
            if (!byDate[r.date][key]) {
                byDate[r.date][key] = { supplier: r.supplier, nacCrates: 0, nacCount: 0, expCrates: 0, expCount: 0, weight: 0 };
            }
            if (r.type === 'Nacional') {
                byDate[r.date][key].nacCrates += r.crates;
                byDate[r.date][key].nacCount++;
            } else {
                byDate[r.date][key].expCrates += r.crates;
                byDate[r.date][key].expCount++;
                byDate[r.date][key].weight += r.weight;
            }
        });

        const sortedDates = Object.keys(byDate).sort((a, b) => {
            const [da, ma, ya] = a.split('/');
            const [db, mb, yb] = b.split('/');
            return `${ya}-${ma.padStart(2,'0')}-${da.padStart(2,'0')}`.localeCompare(`${yb}-${mb.padStart(2,'0')}-${db.padStart(2,'0')}`);
        });

        let totalNacCrates = 0, totalExpCrates = 0, totalWeight = 0;
        let html = '';

        sortedDates.forEach(date => {
            const entries = Object.values(byDate[date]);
            let dateNacCrates = 0, dateExpCrates = 0, dateWeight = 0;

            html += `<tr class="summary-date-row"><td colspan="5"><strong>${date}</strong></td></tr>`;

            entries.forEach(e => {
                const nacDisplay = e.nacCrates > 0 ? e.nacCrates : '—';
                const expDisplay = e.expCrates > 0 ? e.expCrates : '—';
                const weightDisplay = e.weight > 0 ? e.weight.toFixed(1) : '—';
                html += `<tr>
                    <td>${e.nacCrates > 0 ? '<span class="badge bg-info">Nac.</span>' : ''}${e.expCrates > 0 ? '<span class="badge bg-success">Exp.</span>' : ''}</td>
                    <td>${escapeHTML(e.supplier)}</td>
                    <td>${nacDisplay}</td>
                    <td>${expDisplay}</td>
                    <td>${weightDisplay}</td>
                </tr>`;
                dateNacCrates += e.nacCrates;
                dateExpCrates += e.expCrates;
                dateWeight += e.weight;
            });

            html += `<tr class="summary-date-subtotal">
                <td><em>Subtotal ${date}</em></td>
                <td></td>
                <td>${dateNacCrates > 0 ? dateNacCrates : '—'}</td>
                <td>${dateExpCrates > 0 ? dateExpCrates : '—'}</td>
                <td>${dateWeight > 0 ? dateWeight.toFixed(1) : '—'}</td>
            </tr>`;

            totalNacCrates += dateNacCrates;
            totalExpCrates += dateExpCrates;
            totalWeight += dateWeight;
        });

        html += `<tr class="summary-grand-total">
            <td><strong>TOTAL</strong></td>
            <td></td>
            <td><strong>${totalNacCrates}</strong></td>
            <td><strong>${totalExpCrates}</strong></td>
            <td><strong>${totalWeight.toFixed(1)}</strong></td>
        </tr>`;

        fruitSummaryBody.innerHTML = html;
    } catch (err) {
        handleDbError(err);
    }
}

async function exportFruitExcel() {
    try {
        const allRecords = await SupabaseDB.getFruitRecords();
        const from = fruitDateFrom.value;
        const to = fruitDateTo.value;

        const filtered = allRecords.filter(r => {
            const [d, m, y] = r.date.split('/');
            const recordDate = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
            return recordDate >= from && recordDate <= to;
        });

        if (filtered.length === 0) return alert('No hay registros para exportar en este rango');

        const byDate = {};
        filtered.forEach(r => {
            if (!byDate[r.date]) byDate[r.date] = {};
            const key = r.supplier;
            if (!byDate[r.date][key]) {
                byDate[r.date][key] = { supplier: r.supplier, nacCrates: 0, expCrates: 0, weight: 0 };
            }
            if (r.type === 'Nacional') {
                byDate[r.date][key].nacCrates += r.crates;
            } else {
                byDate[r.date][key].expCrates += r.crates;
                byDate[r.date][key].weight += r.weight;
            }
        });

        const sortedDates = Object.keys(byDate).sort((a, b) => {
            const [da, ma, ya] = a.split('/');
            const [db, mb, yb] = b.split('/');
            return `${ya}-${ma.padStart(2,'0')}-${da.padStart(2,'0')}`.localeCompare(`${yb}-${mb.padStart(2,'0')}-${db.padStart(2,'0')}`);
        });

        const hdrStyle = 'style="background-color:#2563eb;color:white;font-weight:bold;"';
        const subStyle = 'style="background-color:#dbeafe;font-weight:bold;"';
        const totStyle = 'style="background-color:#2563eb;color:white;font-weight:bold;"';

        let html = '<table border="1" cellpadding="4" cellspacing="0" style="border-collapse:collapse;">';
        html += `<tr ${hdrStyle}><td>Fecha</td><td>Tipo</td><td>Proveedor</td><td>Gav. Nac.</td><td>Gav. Exp.</td><td>Peso (kg)</td></tr>`;

        let grandNac = 0, grandExp = 0, grandWeight = 0;

        sortedDates.forEach(date => {
            const entries = Object.values(byDate[date]);
            let dateNac = 0, dateExp = 0, dateW = 0;

            entries.forEach(e => {
                html += `<tr><td>${date}</td>`;
                html += `<td>${e.nacCrates > 0 ? 'Nacional' : ''}${e.expCrates > 0 ? (e.nacCrates > 0 ? ' / ' : '') + 'Exportación' : ''}</td>`;
                html += `<td>${escapeHTML(e.supplier)}</td>`;
                html += `<td>${e.nacCrates > 0 ? e.nacCrates : ''}</td>`;
                html += `<td>${e.expCrates > 0 ? e.expCrates : ''}</td>`;
                html += `<td>${e.weight > 0 ? e.weight.toFixed(1) : ''}</td></tr>`;
                dateNac += e.nacCrates;
                dateExp += e.expCrates;
                dateW += e.weight;
            });

            html += `<tr ${subStyle}><td colspan="3">Subtotal ${date}</td><td>${dateNac}</td><td>${dateExp}</td><td>${dateW.toFixed(1)}</td></tr>`;
            grandNac += dateNac;
            grandExp += dateExp;
            grandWeight += dateW;
        });

        html += `<tr ${totStyle}><td colspan="3">TOTAL</td><td>${grandNac}</td><td>${grandExp}</td><td>${grandWeight.toFixed(1)}</td></tr>`;
        html += '</table>';

        downloadExcel(html, `fruta_${from}_al_${to}.xls`);
    } catch (err) {
        handleDbError(err);
    }
}