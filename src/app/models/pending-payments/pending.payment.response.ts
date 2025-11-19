export interface PendingPaymentResponse {
  status: PendingPaymentStatus;
  data: PendingPaymentData[];
}

export interface PendingPaymentStatus {
  status: string;
  reason: string;
  message: string;
  date: string;
}

export interface PendingPaymentData {
  status: 'PAYED' | 'ACTIVE' | string;
  document: string;
  documentType: string;
  address: string;
  description: string;
  reference: string;
  total: string;
  company: string;
  agreement: string;
  typeOfDocument: string;
  createdAt: string;
  expirationDate: string;
}
