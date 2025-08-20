export interface DocumentStatus{
  Userid: string;
  documentname: string;
  status: number;
  waituser: string[];
}

export interface FileDoc{
  Userid: string[];
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


export const file: FileDoc[] =[
  {
    Userid: ["00077","0078","0079","0080"],
  },
  {
    Userid: ["000078"],
  }
];

