export interface Report {
  submissionPeriod: string; //תקופת הדיווח
  type: string; //סוג הדוח
  corectness: string; //תקינות
  reportedAmount: number; //סכום מדווח
  submissionDate: string; //תאריך הגשה
  route: string; //מסלול
  isFixed: boolean; //האם תוקן
  additionalDetails?: ReportDetails; //פרטים נוספים
  reportExpansion?: ReportExpansion; // פירוט הדוח
}

export interface ReportDetails {
  osekNum: string; // מספר עוסק
  osekName: string; // שם עוסק	אורי גולדשטיין בע"מ
  regionalCommissioner: string; // ממונה אזורי
  reportingPeriod: string; // תקופת הדווח
  reportingOrigin: string; // מקור הדווח
  reportingDate: string; // תאריך הדווח
  reportingStatus: string; // מצב הדווח
  taxableTransactions: number; // עסקאות חייבות
  taxableTransactionsVat: number; // מע"מ עסקאות חייבות
  exemptTransactions: number; // עסקאות פטורות / אפס
  equipmentInputs: number; // תשומות ציוד
  otherInputs: number; // תשומות אחרות
  refundAmount: number; // סכום להחזר
  fileInvoiceRecord: string; // רשומת חשבונית מהקובץ
}

export interface ReportExpansion {
  reportingPeriod: string; // תקופת הדווח
  reportingOrigin: string; // מקור הדווח
  reportingDate: string; // תאריך הדווח
  taxableTransactions: number; // עסקאות חייבות
  taxableTransactionsVat: number; // מע"מ עסקאות חייבות
  exemptTransactions: number; // עסקאות פטורות / אפס
  equipmentInputs: number; // תשומות ציוד
  otherInpute: number; // תשומות אחרות
  refundAmount: number; // סכום להחזר
  inputs?: ReportInputs; // תשומות
  deals?: ReportDeals; // עסקאות
  fixedInvoices?: ReportFixedInvoice[]; // חשבוניות שתוקנו
}

export interface ReportInputs {
  regularInput: ReportRecordCategories; // תשומה רגילה
  pettyCash: ReportRecordCategories; // קופה קטנה
  selfInvoiceInput: ReportRecordCategories; // חשבונית עצמית (תשומה)
  importList: ReportRecordCategories; // רשימון יבוא
  rashapSupplier: ReportRecordCategories; // ספק רש"פ
  otherDocument: ReportRecordCategories; // מסמך אחר
  total: ReportRecordCategories; // סה"כ
}

export interface ReportDeals {
  regularDealRecognized: ReportRecordCategories; // עסקה רגילה - מזוהה
  zeroDealRecognized: ReportRecordCategories; // עסקה אפס - מזוהה
  regularDealUnrecognized: ReportRecordCategories; // עסקה רגילה - לא מזוהה
  zeroDealUnrecognized: ReportRecordCategories; // עסקה אפס - לא מזוהה
  selfInvoiceDeal: ReportRecordCategories; // חשבונית עצמית (עסקה)
  listExport: ReportRecordCategories; // רשימון יצוא
  servicesExport: ReportRecordCategories; // יצוא שירותים
  rashapClient: ReportRecordCategories; // לקוח רש"פ
  total: ReportRecordCategories; // סה"כ
}

export interface ReportRecordCategories {
  received: ReportRecordColumns; // נתקבל (100%)
  incorrect: ReportRecordColumns; // שגוי
  total: ReportRecordColumns; // סיכום
}

export interface ReportRecordColumns {
  transactionsNum: number; // מס' תנועות
  vatAmount: number; // סכום מע"מ
  beforeVatAmount: number; // סכום לפני מע"מ
  transactions?: ReportInputTransaction[];
}

export interface ReportInputTransaction {
  type: string; // סוג רשומה
  referenceNum: string; // מספר אסמכתא
  invoiceDate: string; // תאריך החשבונית
  vatAmount: number; // סכום המע"מ
  amount: number; // סכום
  supplierOrList: string; // ספק / רשימון
  errorDescription: string; // תאור שגיאה
  details?: ReportInputTransactionDetails; // פרטים נוספים
}

export interface ReportInputTransactionDetails {
  type: string; // סוג רשומה
  invoiceNum: string; // מספר חשבונית
  referenceGroup: string; // קבוצת אסמכתא
  invoiceDate: string; // תאריך החשבונית
  vatAmount: number; // סכום המע"מ
  amount: number; // סכום
  supplierOrList: string; // ספק / רשימון
}

export interface ReportFixedInvoice {
  type: string; // סוג
  referenceNum: string; // מס' אסמכתא
  invoiceDate: string; // תאריך החשבונית
  invoiceAmount: number; // סכום החשבונית
  vatAmount: number; // סכום המע'מ
  expenderOrRecoever: string; // מוציא/מקבל
  fixDetails: string; // פרטי תיקון
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
