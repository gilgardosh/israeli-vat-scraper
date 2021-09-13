export interface Report {
  /**
   * תקופת הדיווח
   */
  submissionPeriod: string;
  /**
   * סוג הדוח
   */
  type: string;
  /**
   * תקינות
   */
  corectness: string;
  /**
   * סכום מדווח
   */
  reportedAmount: number;
  /**
   * תאריך הגשה
   */
  submissionDate: string;
  /**
   * מסלול
   */
  route: string;
  /**
   * האם תוקן
   */
  isFixed: boolean;
  /**
   * פרטים נוספים
   */
  additionalDetails?: ReportDetails;
  /**
   *  פירוט הדוח
   */
  reportExpansion?: ReportExpansion;
}

export interface ReportDetails {
  /**
   * מספר עוסק
   */
  osekNum: string;
  /**
   * שם עוסק	אורי גולדשטיין בע"מ
   */
  osekName: string;
  /**
   * ממונה אזורי
   */
  regionalCommissioner: string;
  /**
   * תקופת הדווח
   */
  reportingPeriod: string;
  /**
   * מקור הדווח
   */
  reportingOrigin: string;
  /**
   * תאריך הדווח
   */
  reportingDate: string;
  /**
   * מצב הדווח
   */
  reportingStatus: string;
  /**
   * עסקאות חייבות
   */
  taxableTransactions: number;
  /**
   * מע"מ עסקאות חייבות
   */
  taxableTransactionsVat: number;
  /**
   * עסקאות פטורות / אפס
   */
  exemptTransactions: number;
  /**
   * תשומות ציוד
   */
  equipmentInputs: number;
  /**
   * תשומות אחרות
   */
  otherInputs: number;
  /**
   * סכום להחזר
   */
  refundAmount: number;
  /**
   * רשומת חשבונית מהקובץ
   */
  fileInvoiceRecord: string;
}

export interface ReportExpansion {
  /**
   * תקופת הדווח
   */
  reportingPeriod: string;
  /**
   * מקור הדווח
   */
  reportingOrigin: string;
  /**
   * תאריך הדווח
   */
  reportingDate: string;
  /**
   * עסקאות חייבות
   */
  taxableTransactions: number;
  /**
   * מע"מ עסקאות חייבות
   */
  taxableTransactionsVat: number;
  /**
   * עסקאות פטורות / אפס
   */
  exemptTransactions: number;
  /**
   * תשומות ציוד
   */
  equipmentInputs: number;
  /**
   * תשומות אחרות
   */
  otherInpute: number;
  /**
   * סכום להחזר
   */
  refundAmount: number;
  /**
   * תשומות
   */
  inputs?: ReportInputs;
  /**
   * עסקאות
   */
  deals?: ReportDeals;
  /**
   * חשבוניות שתוקנו
   */
  fixedInvoices?: ReportFixedInvoice[];
}

export interface ReportInputs {
  /**
   * תשומה רגילה
   */
  regularInput: ReportRecordCategories;
  /**
   * קופה קטנה
   */
  pettyCash: ReportRecordCategories;
  /**
   * חשבונית עצמית (תשומה)
   */
  selfInvoiceInput: ReportRecordCategories;
  /**
   * רשימון יבוא
   */
  importList: ReportRecordCategories;
  /**
   * ספק רש"פ
   */
  rashapSupplier: ReportRecordCategories;
  /**
   * מסמך אחר
   */
  otherDocument: ReportRecordCategories;
  /**
   * סה"כ
   */
  total: ReportRecordCategories;
}

export interface ReportDeals {
  /**
   * עסקה רגילה - מזוהה
   */
  regularDealRecognized: ReportRecordCategories;
  /**
   * עסקה אפס - מזוהה
   */
  zeroDealRecognized: ReportRecordCategories;
  /**
   * עסקה רגילה - לא מזוהה
   */
  regularDealUnrecognized: ReportRecordCategories;
  /**
   * עסקה אפס - לא מזוהה
   */
  zeroDealUnrecognized: ReportRecordCategories;
  /**
   * חשבונית עצמית (עסקה)
   */
  selfInvoiceDeal: ReportRecordCategories;
  /**
   * רשימון יצוא
   */
  listExport: ReportRecordCategories;
  /**
   * יצוא שירותים
   */
  servicesExport: ReportRecordCategories;
  /**
   * לקוח רש"פ
   */
  rashapClient: ReportRecordCategories;
  /**
   * סה"כ
   */
  total: ReportRecordCategories;
}

export interface ReportRecordCategories {
  /**
   * נתקבל (100%)
   */
  received: ReportRecordColumns;
  /**
   * שגוי
   */
  incorrect: ReportRecordColumns;
  /**
   * סיכום
   */
  total: ReportRecordColumns;
}

export interface ReportRecordColumns {
  /**
   * מס' תנועות
   */
  transactionsNum: number;
  /**
   * סכום מע"מ
   */
  vatAmount: number;
  /**
   * סכום לפני מע"מ
   */
  beforeVatAmount: number;
  transactions?: ReportInputTransaction[];
}

export interface ReportInputTransaction {
  /**
   * סוג רשומה
   */
  type: string;
  /**
   * מספר אסמכתא
   */
  referenceNum: string;
  /**
   * תאריך החשבונית
   */
  invoiceDate: string;
  /**
   * סכום המע"מ
   */
  vatAmount: number;
  /**
   * סכום
   */
  amount: number;
  /**
   * ספק / רשימון
   */
  supplierOrList: string;
  /**
   * תאור שגיאה
   */
  errorDescription: string;
  /**
   * פרטים נוספים
   */
  details?: ReportInputTransactionDetails;
}

export interface ReportInputTransactionDetails {
  /**
   * סוג רשומה
   */
  type: string;
  /**
   * מספר חשבונית
   */
  invoiceNum: string;
  /**
   * קבוצת אסמכתא
   */
  referenceGroup: string;
  /**
   * תאריך החשבונית
   */
  invoiceDate: string;
  /**
   * סכום המע"מ
   */
  vatAmount: number;
  /**
   * סכום
   */
  amount: number;
  /**
   * ספק / רשימון
   */
  supplierOrList: string;
}

export interface ReportFixedInvoice {
  /**
   * סוג
   */
  type: string;
  /**
   * מס' אסמכתא
   */
  referenceNum: string;
  /**
   * תאריך החשבונית
   */
  invoiceDate: string;
  /**
   * סכום החשבונית
   */
  invoiceAmount: number;
  /**
   * סכום המע'מ
   */
  vatAmount: number;
  /**
   * מוציא/מקבל
   */
  expenderOrRecoever: string;
  /**
   * פרטי תיקון
   */
  fixDetails: string;
}

export interface Config {
  /**
   * Defines whether scraping browser will be visible
   * default: false
   */
  visibleBrowser: boolean;
  /**
   * Defines whether to fetch reportExpansion data
   * default: true
   */
  expandData: boolean;
  /**
   * Results are sorted ascending by default.
   * Raising this flag will sort data in descending order
   * default: false
   */
  sortDescending: boolean;
  /**
   * Defined whether the data will be schema-validated.
   * default: true
   */
  validate: boolean;
  /**
   * Occasionally, an error might accure in one of the sub-fields fetch proccess.
   * The app will not stop for errors, but move on.
   * This flag will print all this runtime errors, if any.
   * default: true
   */
  printErrors: boolean;
  /**
   * Optional config. limits the data being fetched to specific years or months.
   * Example of fetching all months of 2019-2020:
   *   [2019, 2020]
   * User can also select months, by replacing the year number with a tuple of year and months array.
   * For example, for fetching Jan-Feb of years 2019-2020:
   *   [ [2019, [1, 2]], [2020, [1, 2]] ]
   * default is null (no limitation, fetch all).
   */
  years?: (number | [number, number[]])[];
}

export interface UserCredentials {
  vatNumber: string;
  userCode: string;
  userPass: string;
}
