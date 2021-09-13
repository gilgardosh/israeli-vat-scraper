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

  for (let i = 1; i < table.rows.length; i++) {
    const tableRow = table.rows[i];
    const rowData: Report = {
      submissionPeriod: tableRow.cells[0].innerText,
      type: tableRow.cells[1].innerText,
      corectness: tableRow.cells[2].innerText,
      reportedAmount: parseFloat(tableRow.cells[3].innerText),
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

  const details: ReportDetails = {
    osekNum: getInnerData(0),
    osekName: getInnerData(1),
    regionalCommissioner: getInnerData(2),
    reportingPeriod: getInnerData(3),
    reportingOrigin: getInnerData(4),
    reportingDate: getInnerData(5),
    reportingStatus: getInnerData(6),
    taxableTransactions: parseInt(getInnerData(7)),
    taxableTransactionsVat: parseInt(getInnerData(8)),
    exemptTransactions: parseInt(getInnerData(9)),
    equipmentInputs: parseInt(getInnerData(10)),
    otherInputs: parseInt(getInnerData(11)),
    refundAmount: parseInt(getInnerData(12)),
    fileInvoiceRecord: getInnerData(13),
  };

  return details;
};

export const getReportExpansionTitle = (
  table: HTMLTableElement
): ReportExpansion => {
  const tableData: ReportExpansion = {
    reportingPeriod: table.rows[0].cells[1].innerText,
    reportingOrigin: table.rows[0].cells[3].innerText,
    reportingDate: table.rows[0].cells[5].innerText,
    taxableTransactions: parseInt(table.rows[1].cells[1].innerText),
    taxableTransactionsVat: parseInt(table.rows[1].cells[3].innerText),
    exemptTransactions: parseInt(table.rows[1].cells[5].innerText),
    equipmentInputs: parseInt(table.rows[2].cells[1].innerText),
    otherInputs: parseInt(table.rows[2].cells[3].innerText),
    refundAmount: parseInt(table.rows[2].cells[5].innerText),
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
    return {
      transactionsNum: parseInt(row.cells[index].innerText),
      vatAmount: parseInt(row.cells[index + 1].innerText),
      beforeVatAmount: parseInt(row.cells[index + 2].innerText),
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

  for (let i = 1; i < table.rows.length; i++) {
    const tableRow = table.rows[i];
    const transaction: ReportInputTransaction = {
      type: tableRow.cells[0].innerText,
      referenceNum: tableRow.cells[1].innerText,
      invoiceDate: tableRow.cells[2].innerText,
      vatAmount: parseInt(tableRow.cells[3].innerText),
      amount: parseInt(tableRow.cells[4].innerText),
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
  const tableData: ReportInputTransactionDetails = {
    type: table.rows[0].cells[1].innerText,
    invoiceNum: table.rows[1].cells[1].innerText,
    referenceGroup: table.rows[2].cells[1].innerText,
    invoiceDate: table.rows[3].cells[1].innerText,
    vatAmount: parseInt(table.rows[4].cells[1].innerText),
    amount: parseInt(table.rows[5].cells[1].innerText),
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
    return {
      transactionsNum: parseInt(row.cells[index].innerText),
      vatAmount: parseInt(row.cells[index + 1].innerText),
      beforeVatAmount: parseInt(row.cells[index + 2].innerText),
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

  for (let i = 1; i < table.rows.length; i++) {
    const tableRow = table.rows[i];
    const fix: ReportFixedInvoice = {
      type: tableRow.cells[0].innerText,
      referenceNum: tableRow.cells[1].innerText,
      invoiceDate: tableRow.cells[2].innerText,
      invoiceAmount: parseInt(tableRow.cells[3].innerText),
      vatAmount: parseInt(tableRow.cells[4].innerText),
      expenderOrRecoever: tableRow.cells[5].innerText,
      fixDetails: tableRow.cells[6].innerText,
    };

    fixesData.push(fix);
  }

  return fixesData;
};
