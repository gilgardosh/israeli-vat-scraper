import { Page } from 'puppeteer';
import { newPageByMonth } from '../utils/browserUtil.js';
import { getReportExpansionSales } from '../utils/evaluationFunctions.js';
import { waitAndClick, waitForSelectorPlus } from '../utils/pageUtil.js';
import { Config, ReportSales } from '../utils/types.js';
import { UserPrompt } from '../utils/userPrompt.js';
import { monthExpansionRecordsHandler } from './monthExpansionRecordsHandler.js';

const SALES_BUTTON_SELECTOR = '#ContentUsersPage_TabMenu1_LinkButton1';

export class MonthSalesHandler {
  private config: Config;
  private prompt: UserPrompt;
  private location: string[];
  private index: number;
  private page: Page | null = null;

  constructor(
    config: Config,
    prompt: UserPrompt,
    location: string[],
    index: number
  ) {
    this.config = config;
    this.prompt = prompt;
    this.location = [...location, 'Sales'];
    this.index = index;
  }

  public handle = async (): Promise<ReportSales | undefined> => {
    this.prompt.update(this.location, 'Fetching...');
    try {
      this.page = await newPageByMonth(
        this.config.visibleBrowser,
        this.location[0],
        this.index
      );

      await waitAndClick(this.page, SALES_BUTTON_SELECTOR);

      const salesTable = await waitForSelectorPlus(this.page, '#tblSikum');
      const salesData = await this.page.evaluate(
        getReportExpansionSales,
        salesTable
      );

      // get income records
      for (const key in salesData) {
        if (key === 'total') {
          continue;
        }
        if (salesData[key as keyof ReportSales].received.recordsCount > 0) {
          const index = ((): number | null => {
            switch (key) {
              case 'regularSaleRecognized':
                return 3;
              case 'zeroSaleRecognized':
                return 4;
              case 'regularSaleUnrecognized':
                return 5;
              case 'zeroSaleUnrecognized':
                return 6;
              case 'selfInvoiceSale':
                return 7;
              case 'listExport':
                return 8;
              case 'servicesExport':
                return 9;
              case 'rashapClient':
                return 10;
              default:
                return null;
            }
          })();
          const secondaryIndex = 2;

          if (index) {
            const recordsHandler = new monthExpansionRecordsHandler(
              this.config,
              this.prompt,
              this.location,
              SALES_BUTTON_SELECTOR,
              index,
              secondaryIndex
            );
            salesData[key as keyof ReportSales].received.records =
              await recordsHandler.handle();
            [];
          }
        }

        if (salesData[key as keyof ReportSales].incorrect.recordsCount > 0) {
          const index = ((): number | null => {
            switch (key) {
              case 'regularSaleRecognized':
                return 3;
              case 'zeroSaleRecognized':
                return 4;
              case 'regularSaleUnrecognized':
                return 5;
              case 'zeroSaleUnrecognized':
                return 6;
              case 'selfInvoiceSale':
                return 7;
              case 'listExport':
                return 8;
              case 'servicesExport':
                return 9;
              case 'rashapClient':
                return 10;
              default:
                return null;
            }
          })();
          const secondaryIndex = 5;

          if (index) {
            const recordsHandler = new monthExpansionRecordsHandler(
              this.config,
              this.prompt,
              this.location,
              SALES_BUTTON_SELECTOR,
              index,
              secondaryIndex
            );
            salesData[key as keyof ReportSales].incorrect.records =
              await recordsHandler.handle();
            [];
          }
        }
      }

      this.page.browser().close();
      this.prompt.update(this.location, 'Done');
      return salesData;
    } catch (e) {
      this.prompt.addError(this.location, (e as Error)?.message || e);
      this.page?.browser().close();
      return;
    }
  };
}
