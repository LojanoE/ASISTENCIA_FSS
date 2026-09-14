// --- CONFIGURACIÓN ---
const SESSION_KEY = 'attendance_session_v3';
const DEVICE_WORKER_KEY = 'device_worker';
const CONTADOR_PASSWORD = 'FINCASS';
const BODEGUERO_PASSWORD = 'BODEGAFSS';
const OLD_KEYS = ['attendance_records_v3', 'attendance_workers_v3', 'attendance_settings_v3', 'attendance_fruit_v3'];

// --- HELPERS ---
function todayStr() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function displayDate(dateStr) {
    if (!dateStr || !dateStr.includes('-')) return dateStr;
    const [y, m, d] = dateStr.split('-');
    return `${d}/${m}/${y}`;
}

function timeStr() {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function withLoading(btn, text, fn, { reenable = true } = {}) {
    return async function() {
        const originalText = btn.textContent;
        btn.disabled = true;
        btn.textContent = text;
        try {
            await fn();
        } finally {
            btn.textContent = originalText;
            if (reenable) btn.disabled = false;
        }
    };
}

function cleanupOldData() {
    OLD_KEYS.forEach(key => localStorage.removeItem(key));
}

function handleDbError(err) {
    console.error('DB Error:', err);
    alert('Error de conexión. Verifique su acceso a internet e intente de nuevo.');
}
const views = {
    login: document.getElementById('view-login'),
    worker: document.getElementById('view-worker'),
    admin: document.getElementById('view-admin'),
    fruit: document.getElementById('view-fruit'),
    accounting: document.getElementById('view-accounting'),
    warehouse: document.getElementById('view-warehouse')
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

// Modal de Registro Manual (Admin)
const addRecordModal = document.getElementById('addRecordModal');
const addRecordWorker = document.getElementById('addRecordWorker');
const addRecordType = document.getElementById('addRecordType');
const addRecordDate = document.getElementById('addRecordDate');
const addRecordTime = document.getElementById('addRecordTime');
const addRecordObs = document.getElementById('addRecordObs');
const btnSaveRecord = document.getElementById('btnSaveRecord');
const btnCancelRecord = document.getElementById('btnCancelRecord');
const btnAddRecord = document.getElementById('btnAddRecord');

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

// Accounting View
const accWorker = document.getElementById('accWorker');
const accType = document.getElementById('accType');
const accAmount = document.getElementById('accAmount');
const accDate = document.getElementById('accDate');
const accDescription = document.getElementById('accDescription');
const btnAddTransaction = document.getElementById('btnAddTransaction');
const accFilterFrom = document.getElementById('accFilterFrom');
const accFilterTo = document.getElementById('accFilterTo');
const accTransactionsBody = document.getElementById('accTransactionsBody');

const accPeriodName = document.getElementById('accPeriodName');
const accPeriodStart = document.getElementById('accPeriodStart');
const accPeriodEnd = document.getElementById('accPeriodEnd');
const btnAddPayrollPeriod = document.getElementById('btnAddPayrollPeriod');
const accPeriodsList = document.getElementById('accPeriodsList');
const accPayrollFormContainer = document.getElementById('accPayrollFormContainer');
const accPayrollFormTitle = document.getElementById('accPayrollFormTitle');
const accPayrollEntriesBody = document.getElementById('accPayrollEntriesBody');
const btnSavePayrollEntries = document.getElementById('btnSavePayrollEntries');
const btnClosePayrollPeriod = document.getElementById('btnClosePayrollPeriod');
let currentPayrollPeriodId = null;

const accReportPeriod = document.getElementById('accReportPeriod');
const accReportBody = document.getElementById('accReportBody');
const btnExportPayroll = document.getElementById('btnExportPayroll');
const workerBalanceSummary = document.getElementById('workerBalanceSummary');
const workerTransactionsBody = document.getElementById('workerTransactionsBody');
const workerBalanceFrom = document.getElementById('workerBalanceFrom');
const workerBalanceTo = document.getElementById('workerBalanceTo');

// Accounting — Consulta Rápida
const accQuickWorker = document.getElementById('accQuickWorker');
const accQuickFrom = document.getElementById('accQuickFrom');
const accQuickTo = document.getElementById('accQuickTo');
const accQuickSummary = document.getElementById('accQuickSummary');
const accQuickBody = document.getElementById('accQuickBody');
const btnQuickWhatsApp = document.getElementById('btnQuickWhatsApp');

// Modal de edición de movimiento
const editTransactionModal = document.getElementById('editTransactionModal');
const editTxWorker = document.getElementById('editTxWorker');
const editTxType = document.getElementById('editTxType');
const editTxAmount = document.getElementById('editTxAmount');
const editTxDate = document.getElementById('editTxDate');
const editTxDescription = document.getElementById('editTxDescription');
const btnSaveTransactionEdit = document.getElementById('btnSaveTransactionEdit');
const btnCancelTransactionEdit = document.getElementById('btnCancelTransactionEdit');
let transactionToEditId = null;

// Bodega — Herramientas y Equipos
const toolLoanWorker = document.getElementById('toolLoanWorker');
const toolLoanTool = document.getElementById('toolLoanTool');
const toolLoanQty = document.getElementById('toolLoanQty');
const toolLoanObs = document.getElementById('toolLoanObs');
const btnAddToolLoan = document.getElementById('btnAddToolLoan');
const toolTodaySummary = document.getElementById('toolTodaySummary');
const toolTodayBody = document.getElementById('toolTodayBody');
const toolPendingWorker = document.getElementById('toolPendingWorker');
const toolPendingBody = document.getElementById('toolPendingBody');
const toolName = document.getElementById('toolName');
const toolCategory = document.getElementById('toolCategory');
const toolTotalQty = document.getElementById('toolTotalQty');
const btnAddTool = document.getElementById('btnAddTool');
const toolInventoryBody = document.getElementById('toolInventoryBody');
const toolLogFrom = document.getElementById('toolLogFrom');
const toolLogTo = document.getElementById('toolLogTo');
const toolLogWorker = document.getElementById('toolLogWorker');
const toolLogFinca = document.getElementById('toolLogFinca');
const toolLogResponsable = document.getElementById('toolLogResponsable');
const toolLogBody = document.getElementById('toolLogBody');
const btnExportToolLog = document.getElementById('btnExportToolLog');

// Modal de retorno de herramienta
const returnToolModal = document.getElementById('returnToolModal');
const returnToolInfo = document.getElementById('returnToolInfo');
const returnToolQty = document.getElementById('returnToolQty');
const returnToolStatus = document.getElementById('returnToolStatus');
const returnToolObs = document.getElementById('returnToolObs');
const btnSaveToolReturn = document.getElementById('btnSaveToolReturn');
const btnCancelToolReturn = document.getElementById('btnCancelToolReturn');
let toolLoanToReturnId = null;

// Modal de edición de herramienta
const editToolModal = document.getElementById('editToolModal');
const editToolName = document.getElementById('editToolName');
const editToolCategory = document.getElementById('editToolCategory');
const editToolTotalQty = document.getElementById('editToolTotalQty');
const btnSaveToolEdit = document.getElementById('btnSaveToolEdit');
const btnCancelToolEdit = document.getElementById('btnCancelToolEdit');
let toolToEditId = null;

// Calendar
const calendarWorker = document.getElementById('calendarWorker');
const calendarMonthLabel = document.getElementById('calendarMonthLabel');
const calendarGrid = document.getElementById('calendarGrid');

// --- ESTADO GLOBAL ---
let currentUser = null;
let currentCoords = null;
let recordToEditId = null;
let calendarYear = new Date().getFullYear();
let calendarMonth = new Date().getMonth();

// --- HELPERS ---
function escapeHTML(str) {
    const p = document.createElement('p');
    p.textContent = str;
    return p.innerHTML;
}

function downloadExcel(htmlTable, filename, extraHead = '') {
    const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
<head><meta charset="utf-8"><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>Hoja1</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]-->${extraHead}</head>
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
    cleanupOldData();
    initDateFilters();
    checkSession();
    startGpsTracking();
    try {
        await renderWorkerSelect();
        await loadSettings();
        // Verificar y cerrar salidas pendientes al cargar (para días anteriores)
        await autoCloseMissingExits();
    } catch (err) {
        handleDbError(err);
    }
    
    // Verificación periódica cada 60 segundos para cierre automático a las 23:00
    setInterval(async () => {
        await autoCloseMissingExits();
    }, 60000);
});

// --- EVENT LISTENERS ---
loginUser.addEventListener('change', togglePassVisibility);
btnLogin.addEventListener('click', withLoading(btnLogin, 'Ingresando...', handleLogin));
document.getElementById('btnLogoutWorker').addEventListener('click', logout);
document.getElementById('btnLogoutAdmin').addEventListener('click', logout);

btnIn.addEventListener('click', withLoading(btnIn, 'Registrando...', () => registerAttendance('Entrada'), { reenable: false }));
btnOut.addEventListener('click', withLoading(btnOut, 'Registrando...', () => registerAttendance('Salida'), { reenable: false }));

btnAddWorker.addEventListener('click', withLoading(btnAddWorker, 'Agregando...', addWorker));
btnSaveSettings.addEventListener('click', withLoading(btnSaveSettings, 'Guardando...', saveSettings));
document.getElementById('btnExport').addEventListener('click', withLoading(document.getElementById('btnExport'), 'Exportando...', exportAttendanceExcel));

filterDateFrom.addEventListener('change', () => renderAdminDashboard());
filterDateTo.addEventListener('change', () => renderAdminDashboard());

btnSaveEdit.addEventListener('click', withLoading(btnSaveEdit, 'Guardando...', saveEdit));
btnCancelEdit.addEventListener('click', () => {
    editModal.classList.add('hidden');
    recordToEditId = null;
});

btnAddRecord.addEventListener('click', openAddRecordModal);
btnSaveRecord.addEventListener('click', withLoading(btnSaveRecord, 'Guardando...', addAdminRecord));
btnCancelRecord.addEventListener('click', () => {
    addRecordModal.classList.add('hidden');
});

// Fruit module event listeners
document.getElementById('btnFruit').addEventListener('click', showFruitView);
document.getElementById('btnBackToAdmin').addEventListener('click', () => { showView('admin'); renderAdminDashboard(); });
document.getElementById('btnAddFruit').addEventListener('click', withLoading(document.getElementById('btnAddFruit'), 'Agregando...', addFruitEntry));
document.getElementById('btnAddNational').addEventListener('click', withLoading(document.getElementById('btnAddNational'), 'Agregando...', addNationalEntry));
document.getElementById('btnExportFruit').addEventListener('click', withLoading(document.getElementById('btnExportFruit'), 'Exportando...', exportFruitExcel));

fruitDateFrom.addEventListener('change', () => renderFruitSummary());
fruitDateTo.addEventListener('change', () => renderFruitSummary());

document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const parent = btn.closest('section');
        if (parent && parent.id === 'view-fruit') {
            toggleFruitSubView(btn.dataset.tab);
        } else if (parent && parent.id === 'view-accounting') {
            toggleAccountingSubView(btn.dataset.tab);
        } else if (parent && parent.id === 'view-warehouse') {
            toggleWarehouseSubView(btn.dataset.tab);
        }
    });
});

// Accounting event listeners
document.getElementById('btnAccounting').addEventListener('click', showAccountingView);
document.getElementById('btnBackToAdminFromAccounting').addEventListener('click', () => { showView('admin'); renderAdminDashboard(); });
document.getElementById('btnLogoutAccounting').addEventListener('click', logout);
btnAddTransaction.addEventListener('click', withLoading(btnAddTransaction, 'Registrando...', addTransaction));
accFilterFrom.addEventListener('change', () => renderAccountingTransactions());
accFilterTo.addEventListener('change', () => renderAccountingTransactions());
btnAddPayrollPeriod.addEventListener('click', withLoading(btnAddPayrollPeriod, 'Creando...', addPayrollPeriod));
btnSavePayrollEntries.addEventListener('click', withLoading(btnSavePayrollEntries, 'Guardando...', savePayrollEntries));
btnClosePayrollPeriod.addEventListener('click', withLoading(btnClosePayrollPeriod, 'Cerrando...', closePayrollPeriod));
accReportPeriod.addEventListener('change', () => renderPayrollReport());
btnExportPayroll.addEventListener('click', withLoading(btnExportPayroll, 'Exportando...', exportPayrollExcel));
workerBalanceFrom.addEventListener('change', () => renderWorkerBalance());
workerBalanceTo.addEventListener('change', () => renderWorkerBalance());
accQuickWorker.addEventListener('change', () => renderQuickView());
accQuickFrom.addEventListener('change', () => renderQuickView());
accQuickTo.addEventListener('change', () => renderQuickView());
btnQuickWhatsApp.addEventListener('click', shareQuickSummaryWhatsApp);
btnSaveTransactionEdit.addEventListener('click', withLoading(btnSaveTransactionEdit, 'Guardando...', saveTransactionEdit));
btnCancelTransactionEdit.addEventListener('click', () => {
    editTransactionModal.classList.add('hidden');
    transactionToEditId = null;
});

// Bodega event listeners
document.getElementById('btnWarehouse').addEventListener('click', showWarehouseView);
document.getElementById('btnBackToAdminFromWarehouse').addEventListener('click', () => { showView('admin'); renderAdminDashboard(); });
document.getElementById('btnLogoutWarehouse').addEventListener('click', logout);
btnAddToolLoan.addEventListener('click', withLoading(btnAddToolLoan, 'Registrando...', addToolLoan));
toolPendingWorker.addEventListener('change', () => renderPendingLoans());
btnAddTool.addEventListener('click', withLoading(btnAddTool, 'Agregando...', addTool));
toolLogFrom.addEventListener('change', () => renderToolLog());
toolLogTo.addEventListener('change', () => renderToolLog());
toolLogWorker.addEventListener('change', () => renderToolLog());
btnExportToolLog.addEventListener('click', withLoading(btnExportToolLog, 'Exportando...', exportToolLogExcel));
btnSaveToolReturn.addEventListener('click', withLoading(btnSaveToolReturn, 'Guardando...', saveToolReturn));
btnCancelToolReturn.addEventListener('click', () => {
    returnToolModal.classList.add('hidden');
    toolLoanToReturnId = null;
});
btnSaveToolEdit.addEventListener('click', withLoading(btnSaveToolEdit, 'Guardando...', saveToolEdit));
btnCancelToolEdit.addEventListener('click', () => {
    editToolModal.classList.add('hidden');
    toolToEditId = null;
});

// Calendar event listeners
document.getElementById('btnPrevMonth').addEventListener('click', () => {
    calendarMonth--;
    if (calendarMonth < 0) { calendarMonth = 11; calendarYear--; }
    renderCalendar();
});
document.getElementById('btnNextMonth').addEventListener('click', () => {
    calendarMonth++;
    if (calendarMonth > 11) { calendarMonth = 0; calendarYear++; }
    renderCalendar();
});
calendarWorker.addEventListener('change', () => renderCalendar());

// --- LÓGICA DE LOGIN & SESIÓN ---

function initDateFilters() {
    const today = new Date().toISOString().split('T')[0];
    filterDateFrom.value = today;
    filterDateTo.value = today;
    accDate.value = today;
    initPayrollPeriodDefaults();
}

function togglePassVisibility() {
    if (loginUser.value === 'admin') {
        passContainer.classList.remove('hidden');
        loginPass.placeholder = 'Contraseña';
    } else if (loginUser.value === 'contador') {
        passContainer.classList.remove('hidden');
        loginPass.placeholder = 'Contraseña de contador';
    } else if (loginUser.value === 'bodeguero') {
        passContainer.classList.remove('hidden');
        loginPass.placeholder = 'Contraseña de bodeguero';
    } else {
        passContainer.classList.add('hidden');
        loginPass.value = '';
        loginPass.placeholder = 'Contraseña';
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
    } else if (user === 'contador') {
        if (loginPass.value === CONTADOR_PASSWORD) {
            currentUser = { name: 'Contador', isAdmin: false, isAccountant: true };
            saveSession(currentUser);
            showAccountingView();
        } else {
            alert('Contraseña incorrecta');
        }
    } else if (user === 'bodeguero') {
        if (loginPass.value === BODEGUERO_PASSWORD) {
            currentUser = { name: 'Bodeguero', isAdmin: false, isWarehouse: true };
            saveSession(currentUser);
            showWarehouseView();
        } else {
            alert('Contraseña incorrecta');
        }
    } else {
        currentUser = { name: user, isAdmin: false };
        saveSession(currentUser);
        localStorage.setItem(DEVICE_WORKER_KEY, user);
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
        } else if (session.isAccountant) {
            showAccountingView();
        } else if (session.isWarehouse) {
            showWarehouseView();
        } else {
            showView('worker');
            await renderWorkerDashboard();
        }
    } else {
        const deviceWorker = localStorage.getItem(DEVICE_WORKER_KEY);
        if (deviceWorker) {
            currentUser = { name: deviceWorker, isAdmin: false };
            saveSession(currentUser);
            showView('worker');
            await renderWorkerDashboard();
            return;
        }
        showView('login');
    }
}

function saveSession(user) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

function logout() {
    if (currentUser && !currentUser.isAdmin && !currentUser.isAccountant && !currentUser.isWarehouse) {
        const adminPass = prompt('Ingrese contraseña de administrador para cambiar de usuario:');
        if (adminPass === null) return;
        verifyAdminBeforeLogout(adminPass);
        return;
    }
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(DEVICE_WORKER_KEY);
    currentUser = null;
    showView('login');
    loginUser.value = '';
    loginPass.value = '';
    passContainer.classList.add('hidden');
    renderWorkerSelect();
}

async function verifyAdminBeforeLogout(password) {
    try {
        const dbPassword = await SupabaseDB.getAdminPassword();
        if (password === dbPassword) {
            localStorage.removeItem(SESSION_KEY);
            localStorage.removeItem(DEVICE_WORKER_KEY);
            currentUser = null;
            showView('login');
            loginUser.value = '';
            loginPass.value = '';
            passContainer.classList.add('hidden');
            await renderWorkerSelect();
        } else {
            alert('Contraseña incorrecta');
        }
    } catch (err) {
        handleDbError(err);
    }
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
        gpsStatus.innerHTML = '⚠️ Sin GPS — Se registrará sin ubicación';
        gpsStatus.classList.add('bg-danger');
        return;
    }
    navigator.geolocation.watchPosition(
        (pos) => {
            currentCoords = { lat: pos.coords.latitude, lon: pos.coords.longitude };
            gpsStatus.innerHTML = `📍 Ubicación OK (Precisión: ${Math.round(pos.coords.accuracy)}m)`;
            gpsStatus.classList.add('bg-success');
        },
        (err) => {
            gpsStatus.innerHTML = "⚠️ Sin GPS — Se registrará sin ubicación";
            gpsStatus.classList.add('bg-danger');
        },
        { enableHighAccuracy: true }
    );
}

// --- LÓGICA DE ASISTENCIA ---

async function registerAttendance(type) {
    const noGps = !currentCoords;

    const now = new Date();
    const today = todayStr();

    try {
        const records = await SupabaseDB.getRecords();
        const existing = records.find(r => r.worker === currentUser.name && r.date === today && r.type === type);
        if (existing) {
            await renderWorkerDashboard();
            return alert(`Ya ha registrado su ${type} el día de hoy (${existing.time}).`);
        }

        const settings = await SupabaseDB.getSettings();
        const [status, extra, diff] = calculateStatus(type, now, settings, { worker: currentUser.name, date: today, records });

        const record = {
            worker: currentUser.name,
            type: type,
            date: today,
            time: timeStr(),
            lat: currentCoords ? currentCoords.lat : 0,
            lon: currentCoords ? currentCoords.lon : 0,
            status: status,
            extra: extra,
            diffMins: diff,
            observation: noGps ? 'Sin GPS' : ''
        };

        await SupabaseDB.addRecord(record);
        alert(`✅ ${type} registrada: ${status} ${extra}`);
        await renderWorkerDashboard();
    } catch (err) {
        if (err && err.code === '23505') {
            alert(`Ya existe un registro de ${type} para hoy. Sincronizando...`);
            await renderWorkerDashboard();
        } else {
            handleDbError(err);
            await renderWorkerDashboard();
        }
    }
}

function calculateStatus(type, timeObj, settings, context) {
    let statusBadge = '';
    let extraInfo = '';
    let diffMinsTotal = 0;

    var jornadaMins = calcJornadaMins(settings);

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
        var entryTime = null;
        if (context && context.worker && context.date && context.records) {
            var entryRecord = context.records.find(function(r) {
                return r.worker === context.worker && r.date === context.date && r.type === 'Entrada';
            });
            if (entryRecord) {
                var parts = entryRecord.time.split(':');
                entryTime = new Date(timeObj);
                entryTime.setHours(parseInt(parts[0], 10), parseInt(parts[1], 10), 0);
            }
        }

        if (entryTime) {
            var workedMs = timeObj - entryTime;
            var workedMins = Math.floor(workedMs / (1000 * 60));
            diffMinsTotal = Math.abs(workedMins - jornadaMins);

            if (workedMins > jornadaMins) {
                var extraMins = workedMins - jornadaMins;
                var extraHrs = Math.floor(extraMins / 60);
                var extraMinRem = extraMins % 60;
                statusBadge = 'Extra';
                extraInfo = `${extraHrs > 0 ? extraHrs + 'h ' : ''}${extraMinRem}m Extras`;
            } else if (workedMins < jornadaMins) {
                var faltaMins = jornadaMins - workedMins;
                var faltaHrs = Math.floor(faltaMins / 60);
                var faltaMinRem = faltaMins % 60;
                statusBadge = 'Jornada incompleta';
                extraInfo = `Faltan ${faltaHrs > 0 ? faltaHrs + 'h ' : ''}${faltaMinRem}m`;
            } else {
                statusBadge = 'Normal';
            }
        } else {
            const [expH, expM] = settings.exitTime.split(':').map(Number);
            const exitLimit = new Date(timeObj);
            exitLimit.setHours(expH, expM, 0);

            if (timeObj > exitLimit) {
                var diffMs = timeObj - exitLimit;
                var diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
                var diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
                diffMinsTotal = Math.floor(diffMs / (1000 * 60));
                
                statusBadge = 'Extra';
                extraInfo = `${diffHrs > 0 ? diffHrs + 'h ' : ''}${diffMins}m Extras`;
            } else {
                statusBadge = 'Normal';
            }
        }
    }
    return [statusBadge, extraInfo, diffMinsTotal];
}

function calcJornadaMins(settings) {
    var eParts = settings.entryTime.split(':').map(Number);
    var xParts = settings.exitTime.split(':').map(Number);
    return (xParts[0] * 60 + xParts[1]) - (eParts[0] * 60 + eParts[1]);
}

// --- SALIDA AUTOMÁTICA (CIERRE DE JORNADAS SIN SALIDA) ---

async function autoCloseMissingExits() {
    const now = new Date();
    const today = todayStr();
    const currentHour = now.getHours();
    
    // Verificar si es momento de ejecutar (23:00 o más tarde) para el día actual
    const isAfter23h = currentHour >= 23;
    
    try {
        const records = await SupabaseDB.getRecords();
        const settings = await SupabaseDB.getSettings();
        
        // Agrupar registros por (worker, date)
        const byWorkerDate = {};
        records.forEach(r => {
            const key = `${r.worker}|${r.date}`;
            if (!byWorkerDate[key]) {
                byWorkerDate[key] = { worker: r.worker, date: r.date, entrada: null, salida: null };
            }
            if (r.type === 'Entrada') byWorkerDate[key].entrada = r;
            if (r.type === 'Salida') byWorkerDate[key].salida = r;
        });
        
        // Encontrar workers con entrada pero sin salida
        const pendingExits = Object.values(byWorkerDate).filter(item => item.entrada && !item.salida);
        
        if (pendingExits.length === 0) {
            return;
        }
        
        // Para cada caso pendiente, verificar si corresponde cerrar
        let closedCount = 0;
        
        for (const item of pendingExits) {
            const entryDate = item.date;
            
            // Condiciones para cerrar:
            // 1. Fecha anterior a hoy: cerrar siempre (estos casos siempre se cierran)
            // 2. Fecha de hoy: solo si ya son las 23:00 o más
            const shouldClose = entryDate < today || (entryDate === today && isAfter23h);
            
            if (!shouldClose) {
                continue;
            }
            
            // Construir la hora de salida usando settings.exitTime
            const [exitHour, exitMinute] = settings.exitTime.split(':').map(Number);
            
            // Crear el objeto Date para calculateStatus
            // Usar la fecha de la entrada con la hora configurada de salida
            const [entryYear, entryMonth, entryDay] = entryDate.split('-').map(Number);
            const exitDateTime = new Date(entryYear, entryMonth - 1, entryDay, exitHour, exitMinute);
            
            // Calcular el status
            const context = { worker: item.worker, date: entryDate, records: records };
            const [status, extra, diff] = calculateStatus('Salida', exitDateTime, settings, context);
            
            // Crear el registro de salida automática
            const exitRecord = {
                worker: item.worker,
                type: 'Salida',
                date: entryDate,
                time: settings.exitTime,
                lat: 0,
                lon: 0,
                status: status,
                extra: extra,
                diffMins: diff,
                observation: 'Salida automática'
            };
            
            try {
                await SupabaseDB.addRecord(exitRecord);
                closedCount++;
                console.log(`[Auto Exit] Cerrada salida para ${item.worker} el ${entryDate} a las ${settings.exitTime} (${status})`);
            } catch (err) {
                // Si da error 23505 (duplicado), otro usuario ya la cerró
                if (err && err.code === '23505') {
                    console.log(`[Auto Exit] Salida ya existía para ${item.worker} el ${entryDate}`);
                } else {
                    console.error('[Auto Exit] Error al cerrar:', err);
                }
            }
        }
        
        if (closedCount > 0) {
            console.log(`[Auto Exit] Total de salidas cerradas: ${closedCount}`);
            // Si estamos en la vista del worker, refrescar
            if (currentUser && !currentUser.isAdmin && !currentUser.isAccountant && !currentUser.isWarehouse) {
                await renderWorkerDashboard();
            }
        }
        
    } catch (err) {
        console.error('[Auto Exit] Error general:', err);
    }
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
        const [day, month, year] = record.date.split('-');
        const [h, m] = newTime.split(':');
        const newDateObj = new Date(year, month - 1, day, h, m);

        const [status, extra, diff] = calculateStatus(record.type, newDateObj, settings, { worker: record.worker, date: record.date, records });

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

async function openAddRecordModal() {
    try {
        const workers = await SupabaseDB.getWorkers();
        addRecordWorker.innerHTML = workers.map(w => `<option value="${escapeHTML(w.name)}">${escapeHTML(w.name)}</option>`).join('');
        addRecordDate.value = todayStr();
        addRecordTime.value = '';
        addRecordObs.value = '';
        addRecordType.value = 'Entrada';
        addRecordModal.classList.remove('hidden');
    } catch (err) {
        handleDbError(err);
    }
}

async function addAdminRecord() {
    const worker = addRecordWorker.value;
    const type = addRecordType.value;
    const date = addRecordDate.value;
    const time = addRecordTime.value;
    const observation = addRecordObs.value.trim();

    if (!worker || !date || !time) return alert('Complete todos los campos obligatorios');

    try {
        const records = await SupabaseDB.getRecords();
        const existing = records.find(r => r.worker === worker && r.date === date && r.type === type);
        if (existing) {
            return alert(`Ya existe un registro de ${type} para ${worker} el ${displayDate(date)} (${existing.time}).`);
        }

        const [y, m, d] = date.split('-');
        const [h, min] = time.split(':');
        const dateObj = new Date(y, m - 1, d, h, min);
        const settings = await SupabaseDB.getSettings();
        const [status, extra, diff] = calculateStatus(type, dateObj, settings, { worker: worker, date: date, records: records });

        await SupabaseDB.addRecord({
            worker, type, date, time,
            lat: 0, lon: 0,
            status, extra, diffMins: diff,
            observation: observation || 'Registro manual'
        });

        alert(`✅ ${type} registrada para ${worker}: ${status} ${extra}`);
        addRecordModal.classList.add('hidden');
        await renderAdminDashboard();
    } catch (err) {
        if (err && err.code === '23505') {
            alert(`Ya existe un registro de ${type} para ${worker} en esa fecha.`);
            await renderAdminDashboard();
        } else {
            handleDbError(err);
        }
    }
}

// --- RENDERS ---

async function renderWorkerSelect() {
    try {
        const workers = await SupabaseDB.getWorkers();
        const deviceWorker = localStorage.getItem(DEVICE_WORKER_KEY);

        if (deviceWorker) {
            loginUser.innerHTML = `
                <option value="">-- Seleccione --</option>
                <option value="admin">Administrador</option>
                <option value="contador">Contador</option>
                <option value="bodeguero">Bodeguero</option>
                <option value="${escapeHTML(deviceWorker)}">${escapeHTML(deviceWorker)}</option>
            `;
        } else {
            loginUser.innerHTML = `
                <option value="">-- Seleccione su nombre --</option>
                <option value="admin">Administrador</option>
                <option value="contador">Contador</option>
                <option value="bodeguero">Bodeguero</option>
                ${workers.map(w => `<option value="${escapeHTML(w.name)}">${escapeHTML(w.name)}</option>`).join('')}
            `;
        }
    } catch (err) {
        handleDbError(err);
    }
}

async function renderWorkerDashboard() {
    workerNameDisplay.textContent = currentUser.name;
    try {
        const records = await SupabaseDB.getRecords();
        const today = todayStr();
        const filtered = records.filter(r => r.worker === currentUser.name && r.date === today);
        const hasEntrada = filtered.some(r => r.type === 'Entrada');
        const hasSalida = filtered.some(r => r.type === 'Salida');
        btnIn.disabled = hasEntrada;
        btnOut.disabled = hasSalida;

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

        await renderWorkerBalance();
    } catch (err) {
        handleDbError(err);
    }
}

async function renderAdminDashboard() {
    await renderWorkerList();
    await populateCalendarWorkers();
    renderCalendar();
    try {
        const allRecords = await SupabaseDB.getRecords();
        const from = filterDateFrom.value;
        const to = filterDateTo.value;

        const filteredRecords = allRecords.filter(r => {
            return r.date >= from && r.date <= to;
        });

        adminAttendanceBody.innerHTML = filteredRecords.map(r => `
            <tr>
                <td><strong>${escapeHTML(r.worker)}</strong></td>
                <td>${r.type}</td>
                <td>${displayDate(r.date)}</td>
                <td>${r.time}</td>
                <td>
                    <span class="badge ${getStatusClass(r.status)}">${r.status}</span>
                    <div style="font-size: 0.7rem">${r.extra}</div>
                </td>
                <td>${r.lat === 0 && r.lon === 0 ? '⚠️ Sin GPS' : `<a href="https://www.google.com/maps?q=${r.lat},${r.lon}" target="_blank" class="maps-link">📍 Ver</a>`}</td>
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
        case 'Jornada incompleta': return 'bg-incompleta';
        default: return 'bg-info';
    }
}

async function exportAttendanceExcel() {
    try {
        const allRecords = await SupabaseDB.getRecords();
        const from = filterDateFrom.value;
        const to = filterDateTo.value;

        const filteredRecords = allRecords.filter(r => {
            return r.date >= from && r.date <= to;
        });

        if (filteredRecords.length === 0) return alert('No hay registros para exportar en este rango');

        let html = '<table border="1" cellpadding="4" cellspacing="0" style="border-collapse:collapse;">';
        html += '<tr style="background-color:#2563eb;color:white;font-weight:bold;"><td>Trabajador</td><td>Tipo</td><td>Fecha</td><td>Hora</td><td>Estado</td><td>Detalles</td><td>Min. Diferencia</td><td>Lat</td><td>Lon</td><td>Observacion</td></tr>';
        filteredRecords.forEach(r => {
            html += `<tr><td>${escapeHTML(r.worker)}</td><td>${r.type}</td><td>${displayDate(r.date)}</td><td>${r.time}</td><td>${r.status}</td><td>${escapeHTML(r.extra || '')}</td><td>${r.diffMins || 0}</td><td>${r.lat}</td><td>${r.lon}</td><td>${escapeHTML(r.observation || '')}</td></tr>`;
        });
        html += '</table>';

        downloadExcel(html, `asistencia_${from}_al_${to}.xls`);
    } catch (err) {
        handleDbError(err);
    }
}

// --- LÓGICA DE ENVÃO DE FRUTA ---

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
        date: todayStr(),
        time: timeStr(),
        observation: fruitNationalObs.value.trim()
    };

    try {
        await SupabaseDB.addFruitRecord(record);
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
        const today = todayStr();
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
        date: todayStr(),
        time: timeStr(),
        observation: fruitObs.value.trim()
    };

    try {
        await SupabaseDB.addFruitRecord(record);
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
        const today = todayStr();
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
            return r.date >= from && r.date <= to;
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

        const sortedDates = Object.keys(byDate).sort();

        let totalNacCrates = 0, totalExpCrates = 0, totalWeight = 0;
        let html = '';

        sortedDates.forEach(date => {
            const entries = Object.values(byDate[date]);
            let dateNacCrates = 0, dateExpCrates = 0, dateWeight = 0;

            html += `<tr class="summary-date-row"><td colspan="5"><strong>${displayDate(date)}</strong></td></tr>`;

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
                <td><em>Subtotal ${displayDate(date)}</em></td>
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
            return r.date >= from && r.date <= to;
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

        const sortedDates = Object.keys(byDate).sort();

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
                html += `<tr><td>${displayDate(date)}</td>`;
                html += `<td>${e.nacCrates > 0 ? 'Nacional' : ''}${e.expCrates > 0 ? (e.nacCrates > 0 ? ' / ' : '') + 'Exportación' : ''}</td>`;
                html += `<td>${escapeHTML(e.supplier)}</td>`;
                html += `<td>${e.nacCrates > 0 ? e.nacCrates : ''}</td>`;
                html += `<td>${e.expCrates > 0 ? e.expCrates : ''}</td>`;
                html += `<td>${e.weight > 0 ? e.weight.toFixed(1) : ''}</td></tr>`;
                dateNac += e.nacCrates;
                dateExp += e.expCrates;
                dateW += e.weight;
            });

            html += `<tr ${subStyle}><td colspan="3">Subtotal ${displayDate(date)}</td><td>${dateNac}</td><td>${dateExp}</td><td>${dateW.toFixed(1)}</td></tr>`;
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

// --- LÓGICA DE CONTABILIDAD ---

function showAccountingView() {
    showView('accounting');
    const isAccountantOnly = currentUser && currentUser.isAccountant;
    document.getElementById('btnBackToAdminFromAccounting').classList.toggle('hidden', isAccountantOnly);
    document.getElementById('btnLogoutAccounting').classList.toggle('hidden', !isAccountantOnly);
    toggleAccountingSubView('accounting-transactions');
}

async function toggleAccountingSubView(tabId) {
    document.querySelectorAll('#view-accounting .tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tabId);
    });
    document.querySelectorAll('#view-accounting .tab-content').forEach(tc => {
        tc.classList.toggle('hidden', tc.id !== tabId);
    });
    if (tabId === 'accounting-transactions') {
        await renderAccountingTransactions();
    } else if (tabId === 'accounting-quick') {
        await renderQuickWorkerSelect();
        await renderQuickView();
    } else if (tabId === 'accounting-periods') {
        await renderPayrollPeriods();
    } else if (tabId === 'accounting-report') {
        await renderPayrollPeriodSelect();
        await renderPayrollReport();
    }
}

async function renderAccountingWorkerSelect() {
    try {
        const workers = await SupabaseDB.getWorkers();
        const html = '<option value="">-- Seleccione --</option>' +
            workers.map(w => `<option value="${escapeHTML(w.name)}">${escapeHTML(w.name)}</option>`).join('');
        accWorker.innerHTML = html;
    } catch (err) {
        handleDbError(err);
    }
}

async function addTransaction() {
    const worker = accWorker.value;
    const type = accType.value;
    const amount = parseFloat(accAmount.value);
    const date = accDate.value;
    const description = accDescription.value.trim();

    if (!worker) return alert('Seleccione un trabajador');
    if (!date) return alert('Seleccione una fecha');
    if (!amount || amount <= 0) return alert('Ingrese un monto válido mayor a 0');

    try {
        const periods = await SupabaseDB.getPayrollPeriods();
        const closedPeriod = periods.find(p => p.status === 'cerrado' && date >= p.startDate && date <= p.endDate);
        if (closedPeriod) {
            return alert(`No se pueden agregar movimientos porque el período ${closedPeriod.name} ya está cerrado.`);
        }

        const newId = await SupabaseDB.addTransaction({
            worker,
            type,
            amount,
            date,
            description,
            createdBy: currentUser ? currentUser.name : 'contador'
        });
        accAmount.value = '';
        accDescription.value = '';
        await renderAccountingTransactions();
        if (confirm('Movimiento registrado correctamente.\n¿Desea notificarlo por WhatsApp al trabajador?')) {
            shareTransactionWhatsApp(newId);
        }
    } catch (err) {
        handleDbError(err);
    }
}

window.deleteTransaction = async function(id) {
    if (!confirm('¿Eliminar este movimiento?')) return;
    try {
        await SupabaseDB.deleteTransaction(id);
        await renderAccountingTransactions();
    } catch (err) {
        handleDbError(err);
    }
};

async function renderAccountingTransactions() {
    await renderAccountingWorkerSelect();
    const today = todayStr();
    if (!accFilterFrom.value) accFilterFrom.value = `${today.slice(0, 7)}-01`;
    if (!accFilterTo.value) accFilterTo.value = today;

    try {
        const transactions = await SupabaseDB.getTransactions({
            from: accFilterFrom.value,
            to: accFilterTo.value
        });

        const typeLabels = {
            adelanto: 'Adelanto',
            viveres: 'Víveres / Raciones',
            prestamo: 'Préstamo / Avance',
            otro_descuento: 'Otro descuento'
        };

        accTransactionsBody.innerHTML = transactions.map(t => `
            <tr>
                <td>${displayDate(t.date)}</td>
                <td><strong>${escapeHTML(t.worker)}</strong></td>
                <td>${typeLabels[t.type] || t.type}</td>
                <td>$${t.amount.toFixed(2)}</td>
                <td><small>${escapeHTML(t.description || '-')}</small></td>
                <td style="white-space: nowrap;">
                    <button class="btn btn-whatsapp-sm" onclick="shareTransactionWhatsApp(${t.id})" title="Notificar por WhatsApp">📲</button>
                    <button class="btn btn-edit-sm" onclick="openEditTransactionModal(${t.id})">Editar</button>
                    <button class="btn btn-danger-sm" onclick="deleteTransaction(${t.id})">X</button>
                </td>
            </tr>
        `).join('') || '<tr><td colspan="6" class="text-center">Sin movimientos en este rango</td></tr>';
    } catch (err) {
        handleDbError(err);
    }
}

// --- Edición de movimientos ---

window.openEditTransactionModal = async function(id) {
    try {
        const transactions = await SupabaseDB.getTransactions();
        const tx = transactions.find(t => t.id === id);
        if (!tx) return;

        transactionToEditId = id;

        const workers = await SupabaseDB.getWorkers();
        editTxWorker.innerHTML = workers.map(w =>
            `<option value="${escapeHTML(w.name)}" ${w.name === tx.worker ? 'selected' : ''}>${escapeHTML(w.name)}</option>`
        ).join('');

        editTxType.value = tx.type;
        editTxAmount.value = tx.amount.toFixed(2);
        editTxDate.value = tx.date;
        editTxDescription.value = tx.description;
        editTransactionModal.classList.remove('hidden');
    } catch (err) {
        handleDbError(err);
    }
};

async function saveTransactionEdit() {
    const worker = editTxWorker.value;
    const type = editTxType.value;
    const amount = parseFloat(editTxAmount.value);
    const date = editTxDate.value;
    const description = editTxDescription.value.trim();

    if (!worker) return alert('Seleccione un trabajador');
    if (!date) return alert('Seleccione una fecha');
    if (!amount || amount <= 0) return alert('Ingrese un monto válido mayor a 0');

    try {
        await SupabaseDB.updateTransaction(transactionToEditId, { worker, type, amount, date, description });
        alert('Movimiento actualizado correctamente');
        editTransactionModal.classList.add('hidden');
        transactionToEditId = null;
        await renderAccountingTransactions();
    } catch (err) {
        handleDbError(err);
    }
}

// --- Notificación por WhatsApp ---

window.shareTransactionWhatsApp = async function(id) {
    try {
        const transactions = await SupabaseDB.getTransactions();
        const tx = transactions.find(t => t.id === id);
        if (!tx) return;

        const typeLabels = {
            adelanto: 'Adelanto en efectivo',
            viveres: 'Víveres / Raciones',
            prestamo: 'Préstamo / Avance',
            otro_descuento: 'Otro descuento'
        };

        // Saldo acumulado del trabajador en el período que cubre esta fecha
        let balanceLine = '';
        const periods = await SupabaseDB.getPayrollPeriods();
        const period = periods.find(p => tx.date >= p.startDate && tx.date <= p.endDate);
        if (period) {
            const workerTx = await SupabaseDB.getTransactions({
                worker: tx.worker,
                from: period.startDate,
                to: period.endDate
            });
            const total = workerTx.reduce((s, t) => s + t.amount, 0);
            balanceLine = `\nAcumulado del período (${period.name}): $${total.toFixed(2)}`;
        }

        const msg =
`*MOVIMIENTO DE CUENTA - FSS*
Fecha: ${displayDate(tx.date)}
Trabajador: ${tx.worker}
Tipo: ${typeLabels[tx.type] || tx.type}
Monto: $${tx.amount.toFixed(2)}${tx.description ? `\nDetalle: ${tx.description}` : ''}${balanceLine}`;

        window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
    } catch (err) {
        handleDbError(err);
    }
};

// --- Consulta Rápida por Trabajador ---

async function renderQuickWorkerSelect() {
    try {
        const workers = await SupabaseDB.getWorkers();
        const currentValue = accQuickWorker.value;
        accQuickWorker.innerHTML = '<option value="">-- Seleccione --</option>' +
            workers.map(w => `<option value="${escapeHTML(w.name)}">${escapeHTML(w.name)}</option>`).join('');
        if (currentValue) accQuickWorker.value = currentValue;

        const today = todayStr();
        if (!accQuickFrom.value) accQuickFrom.value = `${today.slice(0, 7)}-01`;
        if (!accQuickTo.value) accQuickTo.value = today;
    } catch (err) {
        handleDbError(err);
    }
}

async function renderQuickView() {
    const worker = accQuickWorker.value;
    if (!worker) {
        accQuickSummary.innerHTML = '<p class="text-center" style="color: var(--text-muted);">Seleccione un trabajador</p>';
        accQuickBody.innerHTML = '<tr><td colspan="4" class="text-center">—</td></tr>';
        btnQuickWhatsApp.classList.add('hidden');
        return;
    }

    try {
        const transactions = await SupabaseDB.getTransactions({
            worker,
            from: accQuickFrom.value,
            to: accQuickTo.value
        });

        const typeLabels = {
            adelanto: 'Adelanto',
            viveres: 'Víveres / Raciones',
            prestamo: 'Préstamo / Avance',
            otro_descuento: 'Otro descuento'
        };

        const byType = { adelanto: 0, viveres: 0, prestamo: 0, otro_descuento: 0 };
        transactions.forEach(t => { byType[t.type] = (byType[t.type] || 0) + t.amount; });
        const total = transactions.reduce((s, t) => s + t.amount, 0);

        accQuickSummary.innerHTML = `
            <p style="margin-bottom: 0.75rem;"><strong>${escapeHTML(worker)}</strong> — ${displayDate(accQuickFrom.value)} al ${displayDate(accQuickTo.value)}</p>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(110px, 1fr)); gap: 0.5rem; margin-bottom: 1rem;">
                <div class="balance-item"><small>Adelantos</small><div>$${byType.adelanto.toFixed(2)}</div></div>
                <div class="balance-item"><small>Víveres</small><div>$${byType.viveres.toFixed(2)}</div></div>
                <div class="balance-item"><small>Préstamos</small><div>$${byType.prestamo.toFixed(2)}</div></div>
                <div class="balance-item"><small>Otros desc.</small><div>$${byType.otro_descuento.toFixed(2)}</div></div>
            </div>
            <div class="balance-total" style="text-align: center; padding: 1rem; border-radius: 0.75rem; background: var(--primary-color); color: white;">
                <strong>TOTAL ACUMULADO</strong>
                <div style="font-size: 1.5rem; font-weight: bold;">$${total.toFixed(2)}</div>
            </div>
        `;

        accQuickBody.innerHTML = transactions.length
            ? transactions.map(t => `
                <tr>
                    <td>${displayDate(t.date)}</td>
                    <td>${typeLabels[t.type] || t.type}</td>
                    <td>$${t.amount.toFixed(2)}</td>
                    <td><small>${escapeHTML(t.description || '-')}</small></td>
                </tr>
            `).join('')
            : '<tr><td colspan="4" class="text-center">Sin movimientos en este rango</td></tr>';

        btnQuickWhatsApp.classList.remove('hidden');
    } catch (err) {
        handleDbError(err);
    }
}

async function shareQuickSummaryWhatsApp() {
    const worker = accQuickWorker.value;
    if (!worker) return;

    try {
        const transactions = await SupabaseDB.getTransactions({
            worker,
            from: accQuickFrom.value,
            to: accQuickTo.value
        });

        const typeLabels = {
            adelanto: 'Adelantos',
            viveres: 'Víveres / Raciones',
            prestamo: 'Préstamos / Avances',
            otro_descuento: 'Otros descuentos'
        };

        const byType = { adelanto: 0, viveres: 0, prestamo: 0, otro_descuento: 0 };
        transactions.forEach(t => { byType[t.type] = (byType[t.type] || 0) + t.amount; });
        const total = transactions.reduce((s, t) => s + t.amount, 0);

        const lines = Object.keys(typeLabels)
            .filter(k => byType[k] > 0)
            .map(k => `${typeLabels[k]}: $${byType[k].toFixed(2)}`)
            .join('\n');

        const msg =
`*RESUMEN DE CUENTA - FSS*
Trabajador: ${worker}
Período consultado: ${displayDate(accQuickFrom.value)} al ${displayDate(accQuickTo.value)}
${lines ? lines + '\n' : ''}TOTAL ACUMULADO: $${total.toFixed(2)}`;

        window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
    } catch (err) {
        handleDbError(err);
    }
}

// --- Períodos de Pago ---

function initPayrollPeriodDefaults() {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const lastDay = new Date(y, now.getMonth() + 1, 0).getDate();
    accPeriodName.value = `${monthName(now.getMonth())} ${y}`;
    accPeriodStart.value = `${y}-${m}-01`;
    accPeriodEnd.value = `${y}-${m}-${String(lastDay).padStart(2, '0')}`;
}

function monthName(idx) {
    const names = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    return names[idx];
}

async function addPayrollPeriod() {
    const name = accPeriodName.value.trim();
    const startDate = accPeriodStart.value;
    const endDate = accPeriodEnd.value;

    if (!name || !startDate || !endDate) return alert('Complete todos los campos');
    if (endDate < startDate) return alert('La fecha fin no puede ser anterior a la inicio');

    try {
        await SupabaseDB.addPayrollPeriod({ name, startDate, endDate, status: 'abierto' });
        initPayrollPeriodDefaults();
        await renderPayrollPeriods();
    } catch (err) {
        handleDbError(err);
    }
}

async function renderPayrollPeriods() {
    try {
        const periods = await SupabaseDB.getPayrollPeriods();
        if (periods.length === 0) {
            accPeriodsList.innerHTML = '<p class="text-center" style="color: var(--text-muted);">No hay períodos creados</p>';
            accPayrollFormContainer.classList.add('hidden');
            return;
        }

        accPeriodsList.innerHTML = periods.map(p => `
            <div class="period-row" style="display:flex; justify-content:space-between; align-items:center; padding:0.75rem; border-bottom:1px solid var(--border-color);">
                <div>
                    <strong>${escapeHTML(p.name)}</strong><br>
                    <small>${displayDate(p.startDate)} al ${displayDate(p.endDate)} — <span class="badge ${p.status === 'abierto' ? 'bg-success' : 'bg-danger'}">${p.status.toUpperCase()}</span></small>
                </div>
                <div>
                    <button class="btn btn-edit-sm" onclick="openPayrollForm(${p.id})">Sueldos</button>
                    ${p.status === 'abierto' ? `<button class="btn btn-danger-sm" onclick="deletePayrollPeriod(${p.id})">Eliminar</button>` : ''}
                </div>
            </div>
        `).join('');
    } catch (err) {
        handleDbError(err);
    }
}

window.openPayrollForm = async function(periodId) {
    currentPayrollPeriodId = periodId;
    try {
        const period = await SupabaseDB.getPayrollPeriod(periodId);
        const workers = await SupabaseDB.getWorkers();
        const entries = await SupabaseDB.getPayrollEntries(periodId);
        const entryMap = {};
        entries.forEach(e => { entryMap[e.worker] = e; });

        accPayrollFormTitle.textContent = period.name;
        accPayrollFormContainer.classList.remove('hidden');

        accPayrollEntriesBody.innerHTML = workers.map(w => {
            const e = entryMap[w.name] || { baseSalary: 0, adjustments: 0, notes: '' };
            return `
                <tr data-worker="${escapeHTML(w.name)}">
                    <td><strong>${escapeHTML(w.name)}</strong></td>
                    <td><input type="number" class="payroll-base" data-worker="${escapeHTML(w.name)}" value="${e.baseSalary.toFixed(2)}" step="0.01" min="0" style="width: 7rem;"></td>
                    <td><input type="number" class="payroll-adj" data-worker="${escapeHTML(w.name)}" value="${e.adjustments.toFixed(2)}" step="0.01" style="width: 7rem;"></td>
                    <td><input type="text" class="payroll-notes" data-worker="${escapeHTML(w.name)}" value="${escapeHTML(e.notes)}" style="width: 100%;"></td>
                </tr>
            `;
        }).join('');

        if (period.status === 'cerrado') {
            accPayrollEntriesBody.querySelectorAll('input').forEach(i => i.disabled = true);
            btnSavePayrollEntries.classList.add('hidden');
            btnClosePayrollPeriod.classList.add('hidden');
        } else {
            accPayrollEntriesBody.querySelectorAll('input').forEach(i => i.disabled = false);
            btnSavePayrollEntries.classList.remove('hidden');
            btnClosePayrollPeriod.classList.remove('hidden');
        }
    } catch (err) {
        handleDbError(err);
    }
};

async function savePayrollEntries() {
    if (!currentPayrollPeriodId) return;
    try {
        const rows = accPayrollEntriesBody.querySelectorAll('tr[data-worker]');
        for (const row of rows) {
            const worker = row.getAttribute('data-worker');
            const base = parseFloat(row.querySelector('.payroll-base').value) || 0;
            const adj = parseFloat(row.querySelector('.payroll-adj').value) || 0;
            const notes = row.querySelector('.payroll-notes').value.trim();
            await SupabaseDB.savePayrollEntry({
                periodId: currentPayrollPeriodId,
                worker,
                baseSalary: base,
                adjustments: adj,
                notes
            });
        }
        alert('Sueldos guardados correctamente');
    } catch (err) {
        handleDbError(err);
    }
}

async function closePayrollPeriod() {
    if (!currentPayrollPeriodId) return;
    if (!confirm('¿Cerrar el período? Una vez cerrado no se podrán agregar más movimientos en esas fechas.')) return;
    try {
        await savePayrollEntries();
        await SupabaseDB.closePayrollPeriod(currentPayrollPeriodId);
        await renderPayrollPeriods();
        await openPayrollForm(currentPayrollPeriodId);
    } catch (err) {
        handleDbError(err);
    }
}

window.deletePayrollPeriod = async function(id) {
    if (!confirm('¿Eliminar este período y todos sus sueldos asociados?')) return;
    try {
        await SupabaseDB.deletePayrollPeriod(id);
        if (currentPayrollPeriodId === id) {
            currentPayrollPeriodId = null;
            accPayrollFormContainer.classList.add('hidden');
        }
        await renderPayrollPeriods();
    } catch (err) {
        handleDbError(err);
    }
};

// --- Reporte de Corte ---

async function renderPayrollPeriodSelect() {
    try {
        const periods = await SupabaseDB.getPayrollPeriods();
        accReportPeriod.innerHTML = periods.map(p =>
            `<option value="${p.id}">${escapeHTML(p.name)} (${displayDate(p.startDate)} - ${displayDate(p.endDate)})</option>`
        ).join('');
    } catch (err) {
        handleDbError(err);
    }
}

async function renderPayrollReport() {
    const periodId = parseInt(accReportPeriod.value, 10);
    if (!periodId) {
        accReportBody.innerHTML = '<tr><td colspan="10" class="text-center">Seleccione un período</td></tr>';
        return;
    }

    try {
        const period = await SupabaseDB.getPayrollPeriod(periodId);
        const workers = await SupabaseDB.getWorkers();
        const transactions = await SupabaseDB.getTransactions({
            from: period.startDate,
            to: period.endDate
        });
        const entries = await SupabaseDB.getPayrollEntries(periodId);
        const entryMap = {};
        entries.forEach(e => { entryMap[e.worker] = e; });

        const typeLabels = {
            adelanto: 'Adelanto',
            viveres: 'Víveres / Raciones',
            prestamo: 'Préstamo / Avance',
            otro_descuento: 'Otro descuento'
        };

        let html = '';
        workers.forEach(w => {
            const workerTx = transactions.filter(t => t.worker === w.name);
            const byType = { adelanto: 0, viveres: 0, prestamo: 0, otro_descuento: 0 };
            workerTx.forEach(t => { byType[t.type] = (byType[t.type] || 0) + t.amount; });

            const entry = entryMap[w.name] || { baseSalary: 0, adjustments: 0 };
            const totalDesc = byType.adelanto + byType.viveres + byType.prestamo + byType.otro_descuento;
            const neto = entry.baseSalary + entry.adjustments - totalDesc;
            const estado = neto >= 0
                ? `<span class="badge bg-success">A favor: $${neto.toFixed(2)}</span>`
                : `<span class="badge bg-danger">Debe: $${Math.abs(neto).toFixed(2)}</span>`;

            html += `
                <tr>
                    <td><strong>${escapeHTML(w.name)}</strong></td>
                    <td>$${entry.baseSalary.toFixed(2)}</td>
                    <td>$${entry.adjustments.toFixed(2)}</td>
                    <td>$${byType.adelanto.toFixed(2)}</td>
                    <td>$${byType.viveres.toFixed(2)}</td>
                    <td>$${byType.prestamo.toFixed(2)}</td>
                    <td>$${byType.otro_descuento.toFixed(2)}</td>
                    <td><strong>$${totalDesc.toFixed(2)}</strong></td>
                    <td><strong>$${neto.toFixed(2)}</strong></td>
                    <td>${estado}</td>
                </tr>
            `;
        });

        accReportBody.innerHTML = html || '<tr><td colspan="10" class="text-center">No hay trabajadores registrados</td></tr>';
    } catch (err) {
        handleDbError(err);
    }
}

async function exportPayrollExcel() {
    const periodId = parseInt(accReportPeriod.value, 10);
    if (!periodId) return alert('Seleccione un período');

    try {
        const period = await SupabaseDB.getPayrollPeriod(periodId);
        const workers = await SupabaseDB.getWorkers();
        const transactions = await SupabaseDB.getTransactions({
            from: period.startDate,
            to: period.endDate
        });
        const entries = await SupabaseDB.getPayrollEntries(periodId);
        const entryMap = {};
        entries.forEach(e => { entryMap[e.worker] = e; });

        const hdrStyle = 'style="background-color:#2563eb;color:white;font-weight:bold;"';
        let html = '<table border="1" cellpadding="4" cellspacing="0" style="border-collapse:collapse;">';
        html += `<tr ${hdrStyle}><td>Trabajador</td><td>Sueldo Bruto</td><td>Ajustes</td><td>Adelantos</td><td>Viveres</td><td>Prestamos</td><td>Otros Desc.</td><td>Total Desc.</td><td>Neto</td><td>Estado</td></tr>`;

        workers.forEach(w => {
            const workerTx = transactions.filter(t => t.worker === w.name);
            const byType = { adelanto: 0, viveres: 0, prestamo: 0, otro_descuento: 0 };
            workerTx.forEach(t => { byType[t.type] = (byType[t.type] || 0) + t.amount; });
            const entry = entryMap[w.name] || { baseSalary: 0, adjustments: 0 };
            const totalDesc = byType.adelanto + byType.viveres + byType.prestamo + byType.otro_descuento;
            const neto = entry.baseSalary + entry.adjustments - totalDesc;
            const estado = neto >= 0 ? `A favor: $${neto.toFixed(2)}` : `Debe: $${Math.abs(neto).toFixed(2)}`;

            html += `<tr><td>${escapeHTML(w.name)}</td><td>${entry.baseSalary.toFixed(2)}</td><td>${entry.adjustments.toFixed(2)}</td><td>${byType.adelanto.toFixed(2)}</td><td>${byType.viveres.toFixed(2)}</td><td>${byType.prestamo.toFixed(2)}</td><td>${byType.otro_descuento.toFixed(2)}</td><td>${totalDesc.toFixed(2)}</td><td>${neto.toFixed(2)}</td><td>${estado}</td></tr>`;
        });

        html += '</table>';
        downloadExcel(html, `corte_${period.name.replace(/\s+/g, '_')}.xls`);
    } catch (err) {
        handleDbError(err);
    }
}

// --- Saldo del trabajador en vista worker ---

async function renderWorkerBalance() {
    if (!workerBalanceSummary) return;
    if (!currentUser || currentUser.isAdmin) {
        workerBalanceSummary.innerHTML = '';
        workerTransactionsBody.innerHTML = '';
        return;
    }

    const today = todayStr();
    if (!workerBalanceFrom.value) workerBalanceFrom.value = `${today.slice(0, 7)}-01`;
    if (!workerBalanceTo.value) workerBalanceTo.value = today;

    const from = workerBalanceFrom.value;
    const to = workerBalanceTo.value;

    try {
        const transactions = await SupabaseDB.getTransactions({
            worker: currentUser.name,
            from,
            to
        });

        const typeLabels = {
            adelanto: 'Adelanto',
            viveres: 'Víveres / Raciones',
            prestamo: 'Préstamo / Avance',
            otro_descuento: 'Otro descuento'
        };

        const byType = { adelanto: 0, viveres: 0, prestamo: 0, otro_descuento: 0 };
        transactions.forEach(t => { byType[t.type] = (byType[t.type] || 0) + t.amount; });
        const totalDesc = byType.viveres + byType.prestamo + byType.otro_descuento;
        const neto = byType.adelanto - totalDesc; // Los adelantos son dinero entregado; los demás son cargos

        workerBalanceSummary.innerHTML = `
            <p style="margin-bottom: 0.5rem;"><strong>Rango:</strong> ${displayDate(from)} al ${displayDate(to)}</p>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 0.5rem; margin-bottom: 1rem;">
                <div class="balance-item"><small>Adelantos</small><div>$${byType.adelanto.toFixed(2)}</div></div>
                <div class="balance-item"><small>Víveres</small><div>$${byType.viveres.toFixed(2)}</div></div>
                <div class="balance-item"><small>Préstamos</small><div>$${byType.prestamo.toFixed(2)}</div></div>
                <div class="balance-item"><small>Otros desc.</small><div>$${byType.otro_descuento.toFixed(2)}</div></div>
            </div>
            <div class="balance-total" style="text-align: center; padding: 1rem; border-radius: 0.75rem; background: ${neto >= 0 ? 'var(--success)' : 'var(--danger)'}; color: white;">
                <strong>${neto >= 0 ? 'ADELANTOS NETOS' : 'CARGOS NETOS'}</strong>
                <div style="font-size: 1.25rem; font-weight: bold;">$${Math.abs(neto).toFixed(2)}</div>
            </div>
        `;

        workerTransactionsBody.innerHTML = transactions.length
            ? transactions.map(t => `
                <tr>
                    <td>${displayDate(t.date)}</td>
                    <td>${typeLabels[t.type] || t.type}</td>
                    <td>$${t.amount.toFixed(2)}</td>
                    <td><small>${escapeHTML(t.description || '-')}</small></td>
                </tr>
            `).join('')
            : '<tr><td colspan="4" class="text-center">Sin movimientos en este rango</td></tr>';
    } catch (err) {
        handleDbError(err);
    }
}

// --- LÓGICA DE BODEGA (HERRAMIENTAS Y EQUIPOS) ---

const TOOL_CATEGORY_LABELS = { herramienta: 'Herramienta', equipo: 'Equipo' };

function showWarehouseView() {
    showView('warehouse');
    const isWarehouseOnly = currentUser && currentUser.isWarehouse;
    document.getElementById('btnBackToAdminFromWarehouse').classList.toggle('hidden', isWarehouseOnly);
    document.getElementById('btnLogoutWarehouse').classList.toggle('hidden', !isWarehouseOnly);
    toggleWarehouseSubView('warehouse-out');
}

async function toggleWarehouseSubView(tabId) {
    document.querySelectorAll('#view-warehouse .tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tabId);
    });
    document.querySelectorAll('#view-warehouse .tab-content').forEach(tc => {
        tc.classList.toggle('hidden', tc.id !== tabId);
    });
    if (tabId === 'warehouse-out') {
        await renderToolLoanForm();
        await renderTodayLoans();
    } else if (tabId === 'warehouse-return') {
        await renderPendingLoans();
    } else if (tabId === 'warehouse-inventory') {
        await renderToolInventory();
    } else if (tabId === 'warehouse-log') {
        await renderToolLog();
    }
}

// Unidades en campo = préstamos sin retorno; disponible = total - en campo
function computeToolStock(tools, pendingLoans) {
    const inField = {};
    pendingLoans.forEach(l => {
        if (l.toolId) inField[l.toolId] = (inField[l.toolId] || 0) + l.quantity;
    });
    return tools.map(t => ({
        ...t,
        inField: inField[t.id] || 0,
        available: t.totalQty - (inField[t.id] || 0)
    }));
}

function workerOptionsHTML(workers, placeholder) {
    return `<option value="">${placeholder}</option>` +
        workers.map(w => `<option value="${escapeHTML(w.name)}">${escapeHTML(w.name)}</option>`).join('');
}

function loanStatusText(loan) {
    if (!loan.timeIn) return 'En campo';
    const missing = loan.quantity - loan.returnedQty;
    return missing > 0 ? `${loan.returnStatus} (faltan ${missing})` : loan.returnStatus;
}

function loanStatusBadge(loan) {
    let cls = 'bg-warning';
    if (loan.timeIn) {
        cls = loan.returnStatus === 'Bueno' ? 'bg-success' : loan.returnStatus === 'Dañado' ? 'bg-incompleta' : 'bg-danger';
    }
    return `<span class="badge ${cls}">${escapeHTML(loanStatusText(loan))}</span>`;
}

// --- Salida ---

async function renderToolLoanForm() {
    try {
        const [workers, tools, pending] = await Promise.all([
            SupabaseDB.getWorkers(),
            SupabaseDB.getTools(),
            SupabaseDB.getToolLoans({ pending: true })
        ]);

        const selectedWorker = toolLoanWorker.value;
        toolLoanWorker.innerHTML = workerOptionsHTML(workers, '-- Seleccione --');
        toolLoanWorker.value = selectedWorker;

        const selectedTool = toolLoanTool.value;
        toolLoanTool.innerHTML = tools.length
            ? '<option value="">-- Seleccione --</option>' + computeToolStock(tools, pending).map(t =>
                `<option value="${t.id}" ${t.available <= 0 ? 'disabled' : ''}>${escapeHTML(t.name)} — disp. ${t.available}</option>`
            ).join('')
            : '<option value="">Agregue herramientas en Inventario</option>';
        toolLoanTool.value = selectedTool;
    } catch (err) {
        handleDbError(err);
    }
}

async function addToolLoan() {
    const worker = toolLoanWorker.value;
    const toolId = parseInt(toolLoanTool.value, 10);
    const quantity = parseInt(toolLoanQty.value, 10);
    const observation = toolLoanObs.value.trim();

    if (!worker) return alert('Seleccione un trabajador');
    if (!toolId) return alert('Seleccione una herramienta o equipo');
    if (!quantity || quantity < 1) return alert('Ingrese una cantidad válida');

    try {
        const [tools, pending] = await Promise.all([
            SupabaseDB.getTools(),
            SupabaseDB.getToolLoans({ pending: true })
        ]);
        const tool = computeToolStock(tools, pending).find(t => t.id === toolId);
        if (!tool) return alert('La herramienta ya no existe en el inventario');
        if (quantity > tool.available) {
            return alert(`Solo hay ${tool.available} disponible(s) de "${tool.name}" en bodega.`);
        }

        await SupabaseDB.addToolLoan({
            toolId: tool.id,
            toolName: tool.name,
            category: tool.category,
            worker,
            quantity,
            date: todayStr(),
            timeOut: timeStr(),
            observation,
            createdBy: currentUser ? currentUser.name : 'Bodeguero'
        });
        // Se mantiene el trabajador para cargar varias herramientas seguidas
        toolLoanTool.value = '';
        toolLoanQty.value = '1';
        toolLoanObs.value = '';
        await renderToolLoanForm();
        await renderTodayLoans();
    } catch (err) {
        handleDbError(err);
    }
}

async function renderTodayLoans() {
    try {
        const today = todayStr();
        const loans = await SupabaseDB.getToolLoans({ from: today, to: today });
        const totalQty = loans.reduce((s, l) => s + l.quantity, 0);
        const inFieldQty = loans.filter(l => !l.timeIn).reduce((s, l) => s + l.quantity, 0);

        toolTodaySummary.innerHTML = `<span class="badge bg-info">Salidas: ${loans.length}</span> <span class="badge bg-success">Unidades: ${totalQty}</span> <span class="badge bg-warning">En campo: ${inFieldQty}</span>`;

        toolTodayBody.innerHTML = loans.map(l => `
            <tr>
                <td><strong>${escapeHTML(l.worker)}</strong></td>
                <td>${escapeHTML(l.toolName)}</td>
                <td>${l.quantity}</td>
                <td>${escapeHTML(l.timeOut)}</td>
                <td>${loanStatusBadge(l)}</td>
            </tr>
        `).join('') || '<tr><td colspan="5" class="text-center">Sin salidas hoy</td></tr>';
    } catch (err) {
        handleDbError(err);
    }
}

// --- Retorno ---

async function renderPendingLoans() {
    try {
        const [workers, loans] = await Promise.all([
            SupabaseDB.getWorkers(),
            SupabaseDB.getToolLoans({ pending: true })
        ]);

        const selected = toolPendingWorker.value;
        toolPendingWorker.innerHTML = workerOptionsHTML(workers, '-- Todos --');
        toolPendingWorker.value = selected;

        const today = todayStr();
        const filtered = selected ? loans.filter(l => l.worker === selected) : loans;

        toolPendingBody.innerHTML = filtered.map(l => `
            <tr${l.date < today ? ' class="bg-danger"' : ''}>
                <td>${displayDate(l.date)}</td>
                <td><strong>${escapeHTML(l.worker)}</strong></td>
                <td>${escapeHTML(l.toolName)}</td>
                <td>${l.quantity}</td>
                <td>${escapeHTML(l.timeOut)}</td>
                <td><button class="btn btn-edit-sm" onclick="openReturnToolModal(${l.id})">Devolver</button></td>
            </tr>
        `).join('') || '<tr><td colspan="6" class="text-center">No hay herramientas en campo</td></tr>';
    } catch (err) {
        handleDbError(err);
    }
}

window.openReturnToolModal = async function(id) {
    try {
        const loans = await SupabaseDB.getToolLoans({ pending: true });
        const loan = loans.find(l => l.id === id);
        if (!loan) {
            await renderPendingLoans();
            return alert('Esta salida ya tiene retorno registrado');
        }

        toolLoanToReturnId = id;
        returnToolInfo.textContent = `${loan.worker} — ${loan.toolName} x${loan.quantity} (salió ${displayDate(loan.date)} ${loan.timeOut})`;
        returnToolQty.value = loan.quantity;
        returnToolQty.max = loan.quantity;
        returnToolStatus.value = 'Bueno';
        returnToolObs.value = '';
        returnToolModal.classList.remove('hidden');
    } catch (err) {
        handleDbError(err);
    }
};

async function saveToolReturn() {
    const returnedQty = parseInt(returnToolQty.value, 10);
    const returnStatus = returnToolStatus.value;
    const returnObs = returnToolObs.value.trim();

    try {
        const loans = await SupabaseDB.getToolLoans({ pending: true });
        const loan = loans.find(l => l.id === toolLoanToReturnId);
        if (!loan) {
            returnToolModal.classList.add('hidden');
            toolLoanToReturnId = null;
            await renderPendingLoans();
            return alert('Esta salida ya tiene retorno registrado');
        }

        if (isNaN(returnedQty) || returnedQty < 0 || returnedQty > loan.quantity) {
            return alert(`La cantidad devuelta debe estar entre 0 y ${loan.quantity}`);
        }
        const missing = loan.quantity - returnedQty;
        if (missing > 0 && returnStatus === 'Bueno') {
            return alert(`Faltan ${missing} unidad(es). Seleccione el estado Dañado o Perdido.`);
        }

        const observation = returnObs
            ? `${loan.observation ? loan.observation + ' | ' : ''}Retorno: ${returnObs}`
            : loan.observation;

        await SupabaseDB.returnToolLoan(loan.id, { timeIn: timeStr(), returnedQty, returnStatus, observation });

        if (missing > 0 && loan.toolId && confirm(`Faltan ${missing} de "${loan.toolName}".\n¿Descontar ${missing} unidad(es) faltante(s) del inventario?`)) {
            const tools = await SupabaseDB.getTools();
            const tool = tools.find(t => t.id === loan.toolId);
            if (tool) await SupabaseDB.updateTool(tool.id, { totalQty: Math.max(0, tool.totalQty - missing) });
        }

        returnToolModal.classList.add('hidden');
        toolLoanToReturnId = null;
        await renderPendingLoans();
    } catch (err) {
        handleDbError(err);
    }
}

// --- Inventario ---

async function renderToolInventory() {
    try {
        const [tools, pending] = await Promise.all([
            SupabaseDB.getTools(),
            SupabaseDB.getToolLoans({ pending: true })
        ]);

        toolInventoryBody.innerHTML = computeToolStock(tools, pending).map(t => `
            <tr>
                <td><strong>${escapeHTML(t.name)}</strong></td>
                <td>${TOOL_CATEGORY_LABELS[t.category] || escapeHTML(t.category)}</td>
                <td>${t.totalQty}</td>
                <td>${t.inField}</td>
                <td><span class="badge ${t.available > 0 ? 'bg-success' : 'bg-danger'}">${t.available}</span></td>
                <td style="white-space: nowrap;">
                    <button class="btn btn-edit-sm" onclick="openEditToolModal(${t.id})">Editar</button>
                    <button class="btn btn-danger-sm" onclick="deleteTool(${t.id})">X</button>
                </td>
            </tr>
        `).join('') || '<tr><td colspan="6" class="text-center">Sin herramientas registradas</td></tr>';
    } catch (err) {
        handleDbError(err);
    }
}

async function addTool() {
    const name = toolName.value.trim();
    const category = toolCategory.value;
    const totalQty = parseInt(toolTotalQty.value, 10);

    if (!name) return alert('Ingrese el nombre de la herramienta o equipo');
    if (!totalQty || totalQty < 1) return alert('Ingrese una cantidad válida');

    try {
        const tools = await SupabaseDB.getTools();
        if (tools.some(t => t.name.toLowerCase() === name.toLowerCase())) {
            return alert(`"${name}" ya existe en el inventario. Use Editar para cambiar la cantidad.`);
        }
        await SupabaseDB.addTool({ name, category, totalQty });
        toolName.value = '';
        toolTotalQty.value = '1';
        await renderToolInventory();
    } catch (err) {
        handleDbError(err);
    }
}

window.openEditToolModal = async function(id) {
    try {
        const tools = await SupabaseDB.getTools();
        const tool = tools.find(t => t.id === id);
        if (!tool) return;

        toolToEditId = id;
        editToolName.value = tool.name;
        editToolCategory.value = tool.category;
        editToolTotalQty.value = tool.totalQty;
        editToolModal.classList.remove('hidden');
    } catch (err) {
        handleDbError(err);
    }
};

async function saveToolEdit() {
    const name = editToolName.value.trim();
    const category = editToolCategory.value;
    const totalQty = parseInt(editToolTotalQty.value, 10);

    if (!name) return alert('Ingrese el nombre');
    if (isNaN(totalQty) || totalQty < 0) return alert('Ingrese una cantidad válida');

    try {
        const pending = await SupabaseDB.getToolLoans({ pending: true });
        const inField = pending.filter(l => l.toolId === toolToEditId).reduce((s, l) => s + l.quantity, 0);
        if (totalQty < inField) {
            return alert(`Hay ${inField} unidad(es) en campo. El total no puede ser menor.`);
        }

        await SupabaseDB.updateTool(toolToEditId, { name, category, totalQty });
        editToolModal.classList.add('hidden');
        toolToEditId = null;
        await renderToolInventory();
    } catch (err) {
        handleDbError(err);
    }
}

window.deleteTool = async function(id) {
    try {
        const pending = await SupabaseDB.getToolLoans({ pending: true });
        if (pending.some(l => l.toolId === id)) {
            return alert('No se puede eliminar: tiene unidades en campo. Registre primero el retorno.');
        }
        if (!confirm('¿Eliminar esta herramienta del inventario? El historial de salidas se conserva.')) return;
        await SupabaseDB.deleteTool(id);
        await renderToolInventory();
    } catch (err) {
        handleDbError(err);
    }
};

// --- Registro R019 ---

async function renderToolLog() {
    const today = todayStr();
    if (!toolLogFrom.value) toolLogFrom.value = `${today.slice(0, 7)}-01`;
    if (!toolLogTo.value) toolLogTo.value = today;

    try {
        const [workers, loans] = await Promise.all([
            SupabaseDB.getWorkers(),
            SupabaseDB.getToolLoans({ from: toolLogFrom.value, to: toolLogTo.value, worker: toolLogWorker.value })
        ]);

        const selected = toolLogWorker.value;
        toolLogWorker.innerHTML = workerOptionsHTML(workers, '-- Todos --');
        toolLogWorker.value = selected;

        toolLogBody.innerHTML = loans.map(l => `
            <tr>
                <td>${displayDate(l.date)}</td>
                <td><strong>${escapeHTML(l.worker)}</strong></td>
                <td>${escapeHTML(l.toolName)}</td>
                <td>${TOOL_CATEGORY_LABELS[l.category] || escapeHTML(l.category)}</td>
                <td>${l.quantity}</td>
                <td>${escapeHTML(l.timeOut)}</td>
                <td>${escapeHTML(l.timeIn || '-')}</td>
                <td>${l.timeIn ? l.returnedQty : '-'}</td>
                <td>${loanStatusBadge(l)}</td>
                <td><small>${escapeHTML(l.observation || '-')}</small></td>
            </tr>
        `).join('') || '<tr><td colspan="10" class="text-center">Sin registros en este rango</td></tr>';
    } catch (err) {
        handleDbError(err);
    }
}

async function exportToolLogExcel() {
    const from = toolLogFrom.value;
    const to = toolLogTo.value;
    const worker = toolLogWorker.value;
    if (!from || !to) return alert('Seleccione el rango de fechas');

    try {
        const loans = await SupabaseDB.getToolLoans({ from, to, worker });
        if (loans.length === 0) return alert('No hay registros para exportar en este rango');
        loans.sort((a, b) => a.id - b.id);

        // Formato BPA (igual a Registros.docx): título, encabezado Finca/Responsable/Fecha, tabla, observaciones y firma
        const cols = 11;
        const blank = '______________________';
        const finca = escapeHTML(toolLogFinca.value.trim()) || blank;
        const responsable = escapeHTML(toolLogResponsable.value.trim()) || blank;
        const fecha = from === to ? displayDate(from) : `${displayDate(from)} al ${displayDate(to)}`;
        const hdrStyle = 'style="border:1px solid #000;text-align:center;vertical-align:middle;font-weight:bold;"';
        const cellStyle = 'style="border:1px solid #000;text-align:center;vertical-align:middle;height:24pt;"';
        const headers = ['Fecha', 'Hora salida', 'Trabajador', 'Herramienta / Equipo', 'Tipo', 'Cantidad', 'Hora retorno', 'Cant. devuelta', 'Estado', 'Observaciones', 'Firma'];

        let html = '<table cellpadding="4" cellspacing="0" style="border-collapse:collapse;font-family:Calibri,Arial,sans-serif;">';
        html += `<tr><td colspan="${cols}" style="text-align:center;font-size:16pt;font-weight:bold;">REGISTROS BPA - PRODUCCIÓN DE PITAHAYA AMARILLA</td></tr>`;
        html += `<tr><td colspan="${cols}" style="text-align:center;">Versión: 01 &nbsp;·&nbsp; Código: BPA-REG</td></tr>`;
        html += `<tr><td colspan="${cols}"></td></tr>`;
        html += `<tr><td colspan="${cols}" style="text-align:center;font-size:13pt;font-weight:bold;">R019 - SALIDA Y RETORNO DE HERRAMIENTAS Y EQUIPOS</td></tr>`;
        html += `<tr><td colspan="${cols}"></td></tr>`;
        html += `<tr><td colspan="${cols}" style="font-weight:bold;">Finca: ${finca} &nbsp;&nbsp;&nbsp; Responsable: ${responsable} &nbsp;&nbsp;&nbsp; Fecha: ${fecha}</td></tr>`;
        html += `<tr>${headers.map(h => `<td ${hdrStyle}>${h}</td>`).join('')}</tr>`;

        loans.forEach(l => {
            const values = [
                displayDate(l.date),
                escapeHTML(l.timeOut),
                escapeHTML(l.worker),
                escapeHTML(l.toolName),
                TOOL_CATEGORY_LABELS[l.category] || escapeHTML(l.category),
                l.quantity,
                escapeHTML(l.timeIn),
                l.timeIn ? l.returnedQty : '',
                escapeHTML(loanStatusText(l)),
                escapeHTML(l.observation),
                ''
            ];
            html += `<tr>${values.map(v => `<td ${cellStyle}>${v}</td>`).join('')}</tr>`;
        });

        html += `<tr><td colspan="${cols}"></td></tr>`;
        html += `<tr><td colspan="${cols}">Observaciones: _________________________________________________</td></tr>`;
        html += `<tr><td colspan="${cols}"></td></tr>`;
        html += `<tr><td colspan="${cols}">Firma responsable: ______________________________</td></tr>`;
        html += '</table>';

        const workerSuffix = worker ? `_${worker.replace(/\s+/g, '_')}` : '';
        downloadExcel(html, `R019_herramientas${workerSuffix}_${from}_al_${to}.xls`,
            '<style>@page { mso-page-orientation: landscape; margin: 0.75in 0.5in; }</style>');
    } catch (err) {
        handleDbError(err);
    }
}

// --- CALENDARIO DE ASISTENCIA ---

async function renderCalendar() {
    const workerName = calendarWorker.value;
    const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    calendarMonthLabel.textContent = `${monthNames[calendarMonth]} ${calendarYear}`;

    // Remove old day cells (keep headers)
    const oldDays = calendarGrid.querySelectorAll('.calendar-day');
    oldDays.forEach(d => d.remove());

    if (!workerName) {
        const empty = document.createElement('div');
        empty.className = 'calendar-day empty';
        empty.style.gridColumn = '1 / -1';
        empty.innerHTML = '<span style="color:var(--text-muted);">Seleccione un trabajador</span>';
        calendarGrid.appendChild(empty);
        return;
    }

    try {
        const allRecords = await SupabaseDB.getRecords();
        const workerRecords = allRecords.filter(r => r.worker === workerName);

        // Build a map: "YYYY-MM-DD" -> { status, type, extra }
        const recordMap = {};
        workerRecords.forEach(r => {
            if (!recordMap[r.date]) recordMap[r.date] = [];
            recordMap[r.date].push({ type: r.type, status: r.status, extra: r.extra });
        });

        const firstDay = new Date(calendarYear, calendarMonth, 1);
        const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();
        let startDow = firstDay.getDay(); // 0=Sun
        startDow = startDow === 0 ? 6 : startDow - 1; // convert to Mon=0

        // Empty cells before first day
        for (let i = 0; i < startDow; i++) {
            const empty = document.createElement('div');
            empty.className = 'calendar-day empty';
            calendarGrid.appendChild(empty);
        }

        // Day cells
        const today = todayStr();
        for (let d = 1; d <= daysInMonth; d++) {
            const dayStr = `${calendarYear}-${String(calendarMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            const cell = document.createElement('div');
            cell.className = 'calendar-day';

            const entries = recordMap[dayStr] || [];

            if (entries.length === 0) {
                cell.classList.add('sin-registro');
                cell.innerHTML = `<span class="day-num">${d}</span>`;
            } else {
                // Determine overall status: worst wins (Atraso/Jornada incompleta > Extra > Puntual/Normal)
                let hasEntry = entries.some(e => e.type === 'Entrada');
                let hasAtraso = entries.some(e => e.status === 'Atraso');
                let hasIncomplete = entries.some(e => e.status === 'Jornada incompleta');
                let hasExtra = entries.some(e => e.status === 'Extra');
                let isPuntual = entries.some(e => e.status === 'Puntual');
                let isNormal = entries.some(e => e.status === 'Normal');

                let statusClass = 'sin-registro';
                let statusText = '';

                if (hasAtraso) {
                    statusClass = 'atraso';
                    statusText = 'Atraso';
                } else if (hasIncomplete) {
                    statusClass = 'incompleta';
                    statusText = 'Jorn. incompleta';
                } else if (hasExtra && !isPuntual) {
                    statusClass = 'extra';
                    statusText = 'Extra';
                } else if (isPuntual) {
                    statusClass = 'puntual';
                    statusText = 'Puntual';
                    if (hasExtra) statusText = 'Puntual + Extra';
                } else if (isNormal) {
                    statusClass = 'extra';
                    statusText = 'Normal + Extra';
                } else if (hasExtra) {
                    statusClass = 'extra';
                    statusText = 'Extra';
                }

                cell.classList.add(statusClass);
                cell.innerHTML = `<span class="day-num">${d}</span>${statusText ? `<span class="day-badge">${statusText}</span>` : ''}`;
            }

            calendarGrid.appendChild(cell);
        }
    } catch (err) {
        handleDbError(err);
    }
}

async function populateCalendarWorkers() {
    try {
        const workers = await SupabaseDB.getWorkers();
        calendarWorker.innerHTML = '<option value="">-- Seleccione --</option>' +
            workers.map(w => `<option value="${escapeHTML(w.name)}">${escapeHTML(w.name)}</option>`).join('');
    } catch (err) {
        handleDbError(err);
    }
}
