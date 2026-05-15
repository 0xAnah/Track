export const workerPaymentStatus = {
  tier: 'solid',
  base_salary: 350000,
  bonus: 25000,
  advance_deduction: 0,
  disbursement_status: 'scheduled',
  next_pay_date: '2026-05-31',
}

export const advanceHistory = [
  { id: 1, amount: 50000, status: 'repaid', requested_at: '2026-03-15' },
]

export const teamPayments = [
  { id: 1, worker_name: 'John Williams', amount: 350000, status: 'on_hold', tier: 'solid' },
  { id: 2, worker_name: 'Ada Okonkwo', amount: 420000, status: 'ready', tier: 'elite' },
  { id: 3, worker_name: 'Chidi Nwosu', amount: 280000, status: 'on_hold', tier: 'flagged' },
]

export const banks = [
  { code: '058', name: 'GTBank' },
  { code: '011', name: 'First Bank' },
]
