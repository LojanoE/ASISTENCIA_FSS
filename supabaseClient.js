const SUPABASE_URL = 'https://eskgtgcclmkdvetwesfb.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVza2d0Z2NjbG1rZHZldHdlc2ZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY3MDAwNzMsImV4cCI6MjA5MjI3NjA3M30.6-j-_XuN7XLwUdIFw2asWFBGOMM0IJH-XXY7K2Fp5R0';

const _supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const SupabaseDB = {
    async testConnection() {
        try {
            const { error } = await _supabase.from('workers').select('id').limit(1);
            return !error;
        } catch {
            return false;
        }
    },

    // --- Workers ---
    async getWorkers() {
        const { data, error } = await _supabase.from('workers').select('*').order('id');
        if (error) throw error;
        return data.map(w => ({ id: w.id, name: w.name }));
    },
    async addWorker(name) {
        const { data, error } = await _supabase.from('workers').insert({ name }).select().single();
        if (error) throw error;
        return { id: data.id, name: data.name };
    },
    async deleteWorker(id) {
        const { error } = await _supabase.from('workers').delete().eq('id', id);
        if (error) throw error;
    },

    // --- Attendance Records ---
    async getRecords() {
        const { data, error } = await _supabase.from('attendance_records').select('*').order('id', { ascending: false });
        if (error) throw error;
        return data.map(r => ({
            id: r.id,
            worker: r.worker,
            type: r.type,
            date: r.date,
            time: r.time,
            lat: r.lat,
            lon: r.lon,
            status: r.status,
            extra: r.extra || '',
            diffMins: r.diff_mins || 0,
            observation: r.observation || ''
        }));
    },
    async addRecord(record) {
        const row = {
            worker: record.worker,
            type: record.type,
            date: record.date,
            time: record.time,
            lat: record.lat,
            lon: record.lon,
            status: record.status,
            extra: record.extra,
            diff_mins: record.diffMins,
            observation: record.observation || ''
        };
        const { data, error } = await _supabase.from('attendance_records').insert(row).select().single();
        if (error) {
            if (error.code === '23505') {
                const dupError = new Error('Ya existe un registro de ' + record.type + ' para este trabajador hoy');
                dupError.code = '23505';
                throw dupError;
            }
            throw error;
        }
        return data.id;
    },
    async updateRecord(id, updates) {
        const row = {};
        if (updates.time !== undefined) row.time = updates.time;
        if (updates.status !== undefined) row.status = updates.status;
        if (updates.extra !== undefined) row.extra = updates.extra;
        if (updates.diff_mins !== undefined) row.diff_mins = updates.diff_mins;
        if (updates.observation !== undefined) row.observation = updates.observation;
        const { error } = await _supabase.from('attendance_records').update(row).eq('id', id);
        if (error) throw error;
    },

    // --- Settings ---
    async getSettings() {
        const { data, error } = await _supabase.from('settings').select('*').limit(1).single();
        if (error) throw error;
        return { entryTime: data.entry_time, exitTime: data.exit_time };
    },
    async saveSettings(entryTime, exitTime) {
        const { data: existing } = await _supabase.from('settings').select('id').limit(1);
        if (existing && existing.length > 0) {
            const { error } = await _supabase.from('settings').update({ entry_time: entryTime, exit_time: exitTime }).eq('id', existing[0].id);
            if (error) throw error;
        } else {
            const { error } = await _supabase.from('settings').insert({ entry_time: entryTime, exit_time: exitTime });
            if (error) throw error;
        }
    },
    async getAdminPassword() {
        const { data, error } = await _supabase.from('settings').select('admin_password').limit(1).single();
        if (error) throw error;
        return data.admin_password;
    },

    // --- Fruit ---
    async getFruitRecords() {
        const { data, error } = await _supabase.from('fruit').select('*').order('id', { ascending: false });
        if (error) throw error;
        return data.map(r => ({
            id: r.id,
            type: r.type,
            supplier: r.supplier || '',
            crates: r.crates,
            weight: r.weight,
            date: r.date,
            time: r.time,
            observation: r.observation || ''
        }));
    },
    async addFruitRecord(record) {
        const row = {
            type: record.type,
            supplier: record.supplier,
            crates: record.crates,
            weight: record.weight || 0,
            date: record.date,
            time: record.time,
            observation: record.observation || ''
        };
        const { data, error } = await _supabase.from('fruit').insert(row).select().single();
        if (error) throw error;
        return data.id;
    },
    async deleteFruitRecord(id) {
        const { error } = await _supabase.from('fruit').delete().eq('id', id);
        if (error) throw error;
    },
    async getSuppliers() {
        const { data, error } = await _supabase.from('fruit').select('supplier').neq('supplier', '');
        if (error) throw error;
        return [...new Set(data.map(r => r.supplier).filter(Boolean))];
    },

    // --- Worker Transactions (adelantos y cargos) ---
    async getTransactions(filters = {}) {
        let query = _supabase.from('worker_transactions').select('*').order('id', { ascending: false });
        if (filters.worker) query = query.eq('worker', filters.worker);
        if (filters.type) query = query.eq('type', filters.type);
        if (filters.from) query = query.gte('date', filters.from);
        if (filters.to) query = query.lte('date', filters.to);
        const { data, error } = await query;
        if (error) throw error;
        return data.map(r => ({
            id: r.id,
            worker: r.worker,
            type: r.type,
            amount: parseFloat(r.amount),
            date: r.date,
            description: r.description || '',
            createdBy: r.created_by || '',
            createdAt: r.created_at
        }));
    },
    async addTransaction(record) {
        const row = {
            worker: record.worker,
            type: record.type,
            amount: record.amount,
            date: record.date,
            description: record.description || '',
            created_by: record.createdBy || ''
        };
        const { data, error } = await _supabase.from('worker_transactions').insert(row).select().single();
        if (error) throw error;
        return data.id;
    },
    async deleteTransaction(id) {
        const { error } = await _supabase.from('worker_transactions').delete().eq('id', id);
        if (error) throw error;
    },
    async updateTransaction(id, updates) {
        const row = {};
        if (updates.worker !== undefined) row.worker = updates.worker;
        if (updates.type !== undefined) row.type = updates.type;
        if (updates.amount !== undefined) row.amount = updates.amount;
        if (updates.date !== undefined) row.date = updates.date;
        if (updates.description !== undefined) row.description = updates.description;
        const { error } = await _supabase.from('worker_transactions').update(row).eq('id', id);
        if (error) throw error;
    },

    // --- Payroll Periods ---
    async getPayrollPeriods() {
        const { data, error } = await _supabase.from('payroll_periods').select('*').order('id', { ascending: false });
        if (error) throw error;
        return data.map(r => ({
            id: r.id,
            name: r.name,
            startDate: r.start_date,
            endDate: r.end_date,
            status: r.status,
            createdAt: r.created_at
        }));
    },
    async getPayrollPeriod(id) {
        const { data, error } = await _supabase.from('payroll_periods').select('*').eq('id', id).single();
        if (error) throw error;
        return {
            id: data.id,
            name: data.name,
            startDate: data.start_date,
            endDate: data.end_date,
            status: data.status,
            createdAt: data.created_at
        };
    },
    async addPayrollPeriod(period) {
        const row = {
            name: period.name,
            start_date: period.startDate,
            end_date: period.endDate,
            status: period.status || 'abierto'
        };
        const { data, error } = await _supabase.from('payroll_periods').insert(row).select().single();
        if (error) throw error;
        return data.id;
    },
    async updatePayrollPeriod(id, updates) {
        const row = {};
        if (updates.name !== undefined) row.name = updates.name;
        if (updates.startDate !== undefined) row.start_date = updates.startDate;
        if (updates.endDate !== undefined) row.end_date = updates.endDate;
        if (updates.status !== undefined) row.status = updates.status;
        const { error } = await _supabase.from('payroll_periods').update(row).eq('id', id);
        if (error) throw error;
    },
    async closePayrollPeriod(id) {
        const { error } = await _supabase.from('payroll_periods').update({ status: 'cerrado' }).eq('id', id);
        if (error) throw error;
    },
    async deletePayrollPeriod(id) {
        // Borrar entradas asociadas primero para respetar la FK
        const { error: entriesError } = await _supabase.from('payroll_entries').delete().eq('period_id', id);
        if (entriesError) throw entriesError;
        const { error } = await _supabase.from('payroll_periods').delete().eq('id', id);
        if (error) throw error;
    },

    // --- Payroll Entries (sueldo bruto por trabajador) ---
    async getPayrollEntries(periodId) {
        const { data, error } = await _supabase.from('payroll_entries').select('*').eq('period_id', periodId);
        if (error) throw error;
        return data.map(r => ({
            id: r.id,
            periodId: r.period_id,
            worker: r.worker,
            baseSalary: parseFloat(r.base_salary),
            adjustments: parseFloat(r.adjustments),
            notes: r.notes || ''
        }));
    },
    async savePayrollEntry(entry) {
        const { data: existing } = await _supabase
            .from('payroll_entries')
            .select('id')
            .eq('period_id', entry.periodId)
            .eq('worker', entry.worker)
            .limit(1);
        const row = {
            period_id: entry.periodId,
            worker: entry.worker,
            base_salary: entry.baseSalary,
            adjustments: entry.adjustments,
            notes: entry.notes || ''
        };
        if (existing && existing.length > 0) {
            const { error } = await _supabase.from('payroll_entries').update(row).eq('id', existing[0].id);
            if (error) throw error;
            return existing[0].id;
        } else {
            const { data, error } = await _supabase.from('payroll_entries').insert(row).select().single();
            if (error) throw error;
            return data.id;
        }
    }
};