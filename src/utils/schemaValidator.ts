import Ajv, { ErrorObject } from 'ajv';
import addFormats from 'ajv-formats';
import { Report } from './types.js';

export const validateSchema = async (
  jsonSchema: Record<string, unknown>,
  data: Report[]
): Promise<{ isValid: boolean; errors?: ErrorObject[] | null }> => {
  const ajv = new Ajv({ verbose: true, allowMatchingProperties: true });
  addFormats(ajv);
  let valid;
  try {
    valid = ajv.validate(jsonSchema, data);
  } catch (e) {
    console.error(e);
    return { isValid: false, errors: [e as ErrorObject] };
  }

  return { isValid: valid, errors: ajv.errors };
};
