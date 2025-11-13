export interface ContractResponse {
  status: StatusResponse;
  data: ContractData[];
}

export interface StatusResponse {
  status: string;
  reason: string;
  message: string;
  date: string;
}

export interface ContractData {
  address: string;
  company: string;
  agreement: string;
}
