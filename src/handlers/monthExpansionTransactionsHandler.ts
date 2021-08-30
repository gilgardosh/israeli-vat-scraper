import { Page } from 'puppeteer';
import {
  getReportExpansionInputTransactionDetails,
  getReportExpansionInputTransactions,
} from '../utils/evaluationFunctions.js';
import { waitAndClick, waitForSelectorPlus } from '../utils/pageUtil.js';
import {
  ReportInputTransaction,
  ReportInputTransactionDetails,
} from '../utils/types.js';
import { UserPrompt } from '../utils/userPrompt.js';

export class monthExpansionTransactionsHandler {
  private prompt: UserPrompt;
  private location: string[];
  private page: Page;
  private index: number;

  constructor(
    prompt: UserPrompt,
    location: string[],
    page: Page,
    index: number
  ) {
    this.prompt = prompt;
    this.location = [...location, 'Transactions'];
    this.page = page;
    this.index = index;
  }

  public handle = async (): Promise<ReportInputTransaction[]> => {
    try {
      this.prompt.update(this.location, 'Fetching');
      await waitAndClick(
        this.page,
        `#tblSikum > tbody > tr:nth-child(${this.index}) > td:nth-child(2) > a`
      );

      const transactionsTable = await waitForSelectorPlus(
        this.page,
        '#ContentUsersPage_dgHeshboniot'
      );
      const transactions = await this.page.evaluate(
        getReportExpansionInputTransactions,
        transactionsTable
      );

      this.prompt.update(this.location, 'Fetching details');
      for (let i = 0; i < transactions.length; i++) {
        transactions[i].details = await this.getTransactionDetails(i);
      }

      await waitAndClick(this.page, '#ContentUsersPage_btnGoBack');
      this.prompt.update(this.location, 'Done');
      return transactions;
    } catch (e) {
      this.prompt.addError(this.location, e);
      return [];
    }
  };

  private getTransactionDetails = async (
    index: number
  ): Promise<ReportInputTransactionDetails | undefined> => {
    try {
      await waitAndClick(
        this.page,
        `#ContentUsersPage_dgHeshboniot_btnPratimNosafim_${index}`
      );

      const detailsTable = await waitForSelectorPlus(
        this.page,
        '#ContentUsersPage_ucPratimNosafimHsb1_TblPerutHeshbonit'
      );

      const details = await this.page.evaluate(
        getReportExpansionInputTransactionDetails,
        detailsTable
      );

      await waitAndClick(this.page, '#BtnCloseDlgPrtNsf');
      return details;
    } catch (e) {
      this.prompt.addError([...this.location, 'Details'], e);
      return;
    }
  };
}
