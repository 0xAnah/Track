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
  {
    id: 1,
    worker_name: 'John Williams',
    tier: 'solid',
    bank_name: 'GTBank',
    account_number: '0581000001',
    account_type: 'Savings',
    disbursement: {
      id: 101,
      base_salary: 350000,
      advances_deducted: 50000,
      net_payout: 300000,
      status: 'held',
    },
  },
  {
    id: 2,
    worker_name: 'Ada Okonkwo',
    tier: 'elite',
    bank_name: 'GTBank',
    account_number: '0581000002',
    account_type: 'Savings',
    disbursement: {
      id: 102,
      base_salary: 420000,
      advances_deducted: 0,
      net_payout: 420000,
      status: 'completed',
    },
  },
  {
    id: 3,
    worker_name: 'Chidi Nwosu',
    tier: 'flagged',
    bank_name: 'GTBank',
    account_number: '0581000003',
    account_type: 'Savings',
    disbursement: {
      id: 103,
      base_salary: 280000,
      advances_deducted: 20000,
      net_payout: 260000,
      status: 'held',
    },
  },
]

export const banks = [
  { code: '058', name: 'GTBank' },
  { code: '011', name: 'First Bank' },
]
