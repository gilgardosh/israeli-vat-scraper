import { Report, ReportDetails } from './types.js';

export const missingDataChecker = (): boolean => {
  const table = document.querySelector('#dgDuchot');
  return !table;
};

export const getReportsTable = (): Report[] => {
  const getReportsFromTable = (table: HTMLTableElement) => {
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
        _additionalDetailsName: '',
        _reportExpansionID: '',
      };

      const innerTable = Array.from(
        tableRow.cells[6].children
      )[0] as HTMLTableElement;

      for (const element of innerTable.rows[0].cells[0].children) {
        const additionalDetailsName = element.getAttribute('name');
        if (additionalDetailsName) {
          rowData._additionalDetailsName = additionalDetailsName;
          break;
        }
      }

      tableData.push(rowData);
    }

    return tableData;
  };

  const tableElement = document.querySelector('#dgDuchot') as HTMLTableElement;
  return getReportsFromTable(tableElement);
};

export const clickElementByName = (name: string): void => {
  const elements = Array.from(document.getElementsByName(name));
  console.log(elements);
  elements[0].click();
  return;
};

export const getReportDetails = (): ReportDetails => {
  const tableElement = document.querySelector(
    '#ContentUsersPage_ucPratimNosafimDuchot1_TblPerutDoch'
  ) as HTMLTableElement;

  const getInnerData = (rowNum: number) => {
    return tableElement.rows[rowNum].cells[1].innerText;
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

  console.log(details);
  return details;
};
