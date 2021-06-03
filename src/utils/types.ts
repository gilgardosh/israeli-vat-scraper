export interface Report {
  submissionPeriod: string; //תקופת הדיווח
  type: string; //סוג הדוח
  corectness: string; //תקינות
  reportedAmount: number; //סכום מדווח
  submissionDate: string; //תאריך הגשה
  route: string; //מסלול
  isFixed: boolean; //האם תוקן
  _additionalDetailsName: string;
  additionalDetails?: ReportDetails; //פרטים נוספים
  _reportExpansionID: string;
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
  transactions?: ReportDeals; // עסקאות
  fixedInvoices?: ReportFixedInvoices; // חשבוניות שתוקנו
}

export interface ReportInputs {
  regularInput: ReportRecordCategory; // תשומה רגילה
  pettyCash: ReportRecordCategory; // קופה קטנה
  selfInvoiceInput: ReportRecordCategory; // חשבונית עצמית (תשומה)
  importList: ReportRecordCategory; // רשימון יבוא
  rashapSupplier: ReportRecordCategory; // ספק רש"פ
  otherDocument: ReportRecordCategory; // מסמך אחר
  total: ReportRecordCategory; // סה"כ
}

export interface ReportDeals {
  regularDealRecognized: ReportRecordCategory; // עסקה רגילה - מזוהה
  zeroDealRecognized: ReportRecordCategory; // עסקה אפס - מזוהה
  regularDealUnrecognized: ReportRecordCategory; // עסקה רגילה - לא מזוהה
  zeroDealUnrecognized: ReportRecordCategory; // עסקה אפס - לא מזוהה
  selfInvoiceDeal: ReportRecordCategory; // חשבונית עצמית (עסקה)
  listExport: ReportRecordCategory; // רשימון יצוא
  servicesExport: ReportRecordCategory; // יצוא שירותים
  rashapClient: ReportRecordCategory; // לקוח רש"פ
  total: ReportRecordCategory; // סה"כ
}

export interface ReportRecordCategory {
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
  details: ReportInputTransactionDetails; // פרטים נוספים
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

export interface ReportFixedInvoices {
  type: string; // סוג
  referenceNum: string; // מס' אסמכתא
  invoiceDate: string; // תאריך החשבונית
  invoiceAmount: number; // סכום החשבונית
  vatAmount: number; // סכום המע'מ
  expenderOrRecoever: string; // מוציא/מקבל
  fixDetails: string; // פרטי תיקון
}
