import {
  Report,
  ReportDeals,
  ReportDetails,
  ReportExpansion,
  ReportFixedInvoice,
  ReportInputs,
  ReportInputTransaction,
  ReportInputTransactionDetails,
  ReportRecordCategories,
  ReportRecordColumns,
} from './types.js';

export const getReportsTable = (table: HTMLTableElement): Report[] => {
  const tableData: Report[] = [];

  const getFloat = (raw: string) => {
    return parseFloat(raw.replace(/\D/g, '')) * (raw.includes('-') ? -1 : 1);
  };

  for (let i = 1; i < table.rows.length; i++) {
    const tableRow = table.rows[i];
    const rowData: Report = {
      submissionPeriod: tableRow.cells[0].innerText,
      type: tableRow.cells[1].innerText,
      corectness: tableRow.cells[2].innerText,
      reportedAmount: getFloat(tableRow.cells[3].innerText),
      submissionDate: tableRow.cells[4].innerText,
      route: tableRow.cells[5].innerText,
      isFixed: tableRow.cells[6].innerText.includes('ת'),
    };

    tableData.push(rowData);
  }

  return tableData;
};

export const getReportDetails = (table: HTMLTableElement): ReportDetails => {
  const getInnerData = (rowNum: number) => {
    return table.rows[rowNum].cells[1].innerText;
  };

  const getInt = (raw: string) => {
    return parseInt(raw.replace(/\D/g, '')) * (raw.includes('-') ? -1 : 1);
  };

  const details: ReportDetails = {
    osekNum: getInnerData(0),
    osekName: getInnerData(1),
    regionalCommissioner: getInnerData(2),
    reportingPeriod: getInnerData(3),
    reportingOrigin: getInnerData(4),
    reportingDate: getInnerData(5),
    reportingStatus: getInnerData(6),
    taxableTransactions: getInt(getInnerData(7)),
    taxableTransactionsVat: getInt(getInnerData(8)),
    exemptTransactions: getInt(getInnerData(9)),
    equipmentInputs: getInt(getInnerData(10)),
    otherInputs: getInt(getInnerData(11)),
    refundAmount: getInt(getInnerData(12)),
    fileInvoiceRecord: getInnerData(13),
  };

  return details;
};

export const getReportExpansionTitle = (
  table: HTMLTableElement
): ReportExpansion => {
  const getInt = (raw: string) => {
    return parseInt(raw.replace(/\D/g, '')) * (raw.includes('-') ? -1 : 1);
  };

  const tableData: ReportExpansion = {
    reportingPeriod: table.rows[0].cells[1].innerText,
    reportingOrigin: table.rows[0].cells[3].innerText,
    reportingDate: table.rows[0].cells[5].innerText,
    taxableTransactions: getInt(table.rows[1].cells[1].innerText),
    taxableTransactionsVat: getInt(table.rows[1].cells[3].innerText),
    exemptTransactions: getInt(table.rows[1].cells[5].innerText),
    equipmentInputs: getInt(table.rows[2].cells[1].innerText),
    otherInputs: getInt(table.rows[2].cells[3].innerText),
    refundAmount: getInt(table.rows[2].cells[5].innerText),
  };

  return tableData;
};

export const getReportExpansionInputs = (
  table: HTMLTableElement
): ReportInputs => {
  const getCategoryData = (
    row: HTMLTableRowElement,
    index: number
  ): ReportRecordColumns => {
    const getInt = (raw: string) => {
      return parseInt(raw.replace(/\D/g, '')) * (raw.includes('-') ? -1 : 1);
    };

    return {
      transactionsNum: getInt(row.cells[index].innerText),
      vatAmount: getInt(row.cells[index + 1].innerText),
      beforeVatAmount: getInt(row.cells[index + 2].innerText),
    };
  };

  const getRowData = (row: HTMLTableRowElement): ReportRecordCategories => {
    return {
      received: getCategoryData(row, 1),
      incorrect: getCategoryData(row, 4),
      total: getCategoryData(row, 7),
    };
  };

  const inputsData: ReportInputs = {
    regularInput: getRowData(table.rows[2]),
    pettyCash: getRowData(table.rows[3]),
    selfInvoiceInput: getRowData(table.rows[4]),
    importList: getRowData(table.rows[5]),
    rashapSupplier: getRowData(table.rows[6]),
    otherDocument: getRowData(table.rows[7]),
    total: getRowData(table.rows[8]),
  };

  return inputsData;
};

export const getReportExpansionInputTransactions = (
  table: HTMLTableElement
): ReportInputTransaction[] => {
  const transactionsData: ReportInputTransaction[] = [];

  const getInt = (raw: string) => {
    return parseInt(raw.replace(/\D/g, '')) * (raw.includes('-') ? -1 : 1);
  };

  for (let i = 1; i < table.rows.length; i++) {
    const tableRow = table.rows[i];
    const transaction: ReportInputTransaction = {
      type: tableRow.cells[0].innerText,
      referenceNum: tableRow.cells[1].innerText,
      invoiceDate: tableRow.cells[2].innerText,
      vatAmount: getInt(tableRow.cells[3].innerText),
      amount: getInt(tableRow.cells[4].innerText),
      supplierOrList: tableRow.cells[5].innerText,
      errorDescription: tableRow.cells[6].innerText,
    };

    transactionsData.push(transaction);
  }

  return transactionsData;
};

export const getReportExpansionInputTransactionDetails = (
  table: HTMLTableElement
): ReportInputTransactionDetails => {
  const getInt = (raw: string) => {
    return parseInt(raw.replace(/\D/g, '')) * (raw.includes('-') ? -1 : 1);
  };

  const tableData: ReportInputTransactionDetails = {
    type: table.rows[0].cells[1].innerText,
    invoiceNum: table.rows[1].cells[1].innerText,
    referenceGroup: table.rows[2].cells[1].innerText,
    invoiceDate: table.rows[3].cells[1].innerText,
    vatAmount: getInt(table.rows[4].cells[1].innerText),
    amount: getInt(table.rows[5].cells[1].innerText),
    supplierOrList: table.rows[6].cells[1].innerText,
  };

  return tableData;
};

export const getReportExpansionDeals = (
  table: HTMLTableElement
): ReportDeals => {
  const getCategoryData = (
    row: HTMLTableRowElement,
    index: number
  ): ReportRecordColumns => {
    const getInt = (raw: string) => {
      return parseInt(raw.replace(/\D/g, '')) * (raw.includes('-') ? -1 : 1);
    };

    return {
      transactionsNum: getInt(row.cells[index].innerText),
      vatAmount: getInt(row.cells[index + 1].innerText),
      beforeVatAmount: getInt(row.cells[index + 2].innerText),
    };
  };

  const getRowData = (row: HTMLTableRowElement): ReportRecordCategories => {
    return {
      received: getCategoryData(row, 1),
      incorrect: getCategoryData(row, 4),
      total: getCategoryData(row, 7),
    };
  };

  const inputsData: ReportDeals = {
    regularDealRecognized: getRowData(table.rows[2]),
    zeroDealRecognized: getRowData(table.rows[3]),
    regularDealUnrecognized: getRowData(table.rows[4]),
    zeroDealUnrecognized: getRowData(table.rows[5]),
    selfInvoiceDeal: getRowData(table.rows[6]),
    listExport: getRowData(table.rows[7]),
    servicesExport: getRowData(table.rows[8]),
    rashapClient: getRowData(table.rows[9]),
    total: getRowData(table.rows[10]),
  };

  return inputsData;
};

export const getReportExpansionFixes = (
  table: HTMLTableElement
): ReportFixedInvoice[] => {
  const fixesData: ReportFixedInvoice[] = [];

  const getInt = (raw: string) => {
    return parseInt(raw.replace(/\D/g, '')) * (raw.includes('-') ? -1 : 1);
  };

  for (let i = 1; i < table.rows.length; i++) {
    const tableRow = table.rows[i];
    const fix: ReportFixedInvoice = {
      type: tableRow.cells[0].innerText,
      referenceNum: tableRow.cells[1].innerText,
      invoiceDate: tableRow.cells[2].innerText,
      invoiceAmount: getInt(tableRow.cells[3].innerText),
      vatAmount: getInt(tableRow.cells[4].innerText),
      expenderOrRecoever: tableRow.cells[5].innerText,
      fixDetails: tableRow.cells[6].innerText,
    };

    fixesData.push(fix);
  }

  return fixesData;
};
