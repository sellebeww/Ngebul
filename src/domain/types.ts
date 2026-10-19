export type DateKey = string;
export type Range = { min: number; usual: number; max: number };
export type Income = {
 id: string; householdId: string; name: string;
 pattern: 'harian'|'mingguan'|'per_proyek'|'musiman'|'tidak_menentu';
 range: Range; arrivalStart: DateKey; arrivalEnd: DateKey; repeatDays?: number;
 lateDays: number; activeMonths: number[]; confidence: 'rendah'|'sedang'|'tinggi';
};
export type Fund = { id: string; kind: 'tunai'|'rekening'|'amplop'|'tabungan_terkunci'; amount: number; available: 'segera'|'setelah_tanggal'|'terkunci'; date?: DateKey };
export type Obligation = { id: string; name: string; amount: number; due: DateKey; repeatDays?: number; category: 'makan'|'sewa'|'listrik'|'air'|'obat'|'sekolah'|'cicilan'|'sosial_adat'|'lainnya'; priority: number; penalty: { kind: 'rp'|'persen'; value: number }; graceDays: number; negotiable: boolean; deferrable: boolean };
export type Variable = { id: string; name: string; weekly: Range; floor: number };
export type Actual = { id: string; week: number; date: DateKey; incomes: { sourceId: string; amount: number; forecast: Range }[]; payments: { obligationId: string; due: DateKey; paidOn?: DateKey; amount: number; fine: number }[]; notes: string; snapshot?: ForecastSnapshot };
export type Checkin = { id: string; householdId: string; time: string; minutes: number };
export type Trial = { id: string; householdId: string; week: number; status: 'segar'|'usang'; baseline: { lateCount: number; lateDays: number; fines: number; recallBiased: true }; start: DateKey };
export type Household = { id: string; name: string; dependents: number; occupation: string; fictional: boolean; companionConsent: boolean; incomes: Income[]; funds: Fund[]; obligations: Obligation[]; variables: Variable[]; actuals: Actual[]; checkins: Checkin[]; trial: Trial; scenarios?: Scenario[]; forecasts?: ForecastSnapshot[] };
export type Case = 'conservative'|'usual'|'optimistic';
export type Changes = { variableReduction?: number; deferId?: string; deferDays?: number; extraIncome?: number; extraDate?: DateKey; essentialsFirst?: boolean };
export type Scenario = { id: string; householdId: string; name: string; parameters: Changes & { incomeCase: Case; arrivalDelay: number }; result?: Projection };
export type Payment = { id: string; obligationId: string; name: string; due: DateKey; amount: number; shortfall: number; covered: boolean; essential: boolean; fine: number; graceRemaining: number; reason: string; negotiable: boolean; deferrable: boolean };
export type Projection = { days: { date: DateKey; balance: number }[]; payments: Payment[]; firstFailure?: DateKey; runway: number; totalIncome: number; essentialTotal: number; shortfall: number };

export type ForecastSnapshot = { asOf: DateKey; plan: Pick<Household, "funds"|"incomes"|"obligations"|"variables"> };
