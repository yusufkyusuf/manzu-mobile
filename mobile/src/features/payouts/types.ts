// GET /api/pharmacy/payouts/summary — pharmacy-payouts.repository.js getPayoutSummary().
// Order.pharmacyAmount and Payout.amount are Prisma Float → JSON numbers (0 when no rows).

export interface PayoutBucket {
  amount: number;
  count: number;
}

export interface PayoutSummaryResponse {
  message: string;
  /** COMPLETED orders with payoutStatus PENDING. */
  pending: PayoutBucket;
  processing: PayoutBucket;
  completed: PayoutBucket;
  failed: PayoutBucket;
  /** Pharmacy.recipientCode is set. */
  bankingConfigured: boolean;
}
