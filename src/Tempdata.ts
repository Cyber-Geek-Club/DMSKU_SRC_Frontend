export interface DocumentStatus{
  Userid: string;
  documentname: string;
  status: number;
  waituser: string[];
}

export const temp_data: DocumentStatus[] =[
  {
    Userid: "00001",
    documentname: "โครงการDSMKU",
    status: 0,
    waituser: ["02", "03", "04", "05"]
  },
  {
    Userid: "000022",
    documentname: "โครงการDSMKU1",
    status: 0,
    waituser: ["02", "03", "04", "05","09", "08",]
  }
];

