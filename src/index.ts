import dotenv from 'dotenv';
import { Config, Report, UserCredentials } from './utils/types.js';
import { homePageHandler } from './handlers/mainPageHandler.js';
import {
  getEnvCredentials,
  updateCredentials,
} from './handlers/loginHandler.js';
import { validateSchema } from './utils/schemaValidator.js';
import { createRequire } from 'module';

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
      const requireFile = createRequire(import.meta.url); // construct the require method
      const schema = requireFile('./vatSchema.json'); // use the require method
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
