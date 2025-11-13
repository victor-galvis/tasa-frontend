export interface InvoiceResponse {
  status: InvoiceStatus;
  data: Invoice[];
}

export interface InvoiceStatus {
  status: string;
  reason: string;
  message: string;
  date: string;
}

export interface Invoice {
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
