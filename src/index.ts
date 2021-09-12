import dotenv from 'dotenv';
import { Config, Report, UserCredentials } from './utils/types.js';
import { homePageHandler } from './handlers/mainPageHandler.js';
import {
  getEnvCredentials,
  updateCredentials,
} from './handlers/loginHandler.js';
import { validateSchema } from './utils/schemaValidator.js';
import schema from './vatSchema.json';

dotenv.config();

const defaultConfig: Config = {
  visibleBrowser: false,
  expandData: true,
  sortDescending: false,
  validate: true,
  printErrors: true,
  years: undefined,
};

const vatScraper = async (
  credentials?: UserCredentials,
  userConfig: Partial<Config> = {}
): Promise<Report[]> => {
  try {
    updateCredentials(credentials || getEnvCredentials());
    const config = { ...defaultConfig, ...userConfig };

    const reports = await homePageHandler(config);

    if (config.validate) {
      const validation = await validateSchema(schema, reports);
      console.log(validation);
    }

    return reports;
  } catch (e) {
    console.error(e);
    throw new Error(`VatScraper - ${e}`);
  }
};

export default vatScraper;

const test = async () => {
  const data = await vatScraper(undefined, {
    visibleBrowser: false,
    validate: true,
    expandData: true,
    printErrors: true,
    // years: [2018, 2019, 2020, 2021],
  });

  console.log(JSON.stringify(data, null, '  '));
  return;
};

test();
