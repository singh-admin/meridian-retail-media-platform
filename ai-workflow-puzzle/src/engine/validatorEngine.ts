import { ValidationResult } from '../types';

export class ValidatorEngine {
  /**
   * Validate data based on configuration
   */
  static validate(data: any, config: Record<string, any>): ValidationResult {
    const validationType = config.validationType || 'json-schema';
    const errors: string[] = [];
    const warnings: string[] = [];

    if (data === undefined || data === null) {
      return {
        valid: false,
        errors: ['Output is null or undefined'],
        warnings: []
      };
    }

    try {
      if (validationType === 'required-fields') {
        const requiredList = (config.requiredFields || '')
          .split(',')
          .map((f: string) => f.trim())
          .filter(Boolean);

        for (const field of requiredList) {
          const val = this.getNestedValue(data, field);
          if (val === undefined || val === null || val === '') {
            errors.push(`Missing required field: "${field}"`);
          } else if (Array.isArray(val) && val.length === 0) {
            warnings.push(`Field "${field}" is an empty array`);
          }
        }
      } else if (validationType === 'json-schema') {
        const schema = config.schema || {};
        this.validateJsonSchema(data, schema, '', errors, warnings);
      } else if (validationType === 'custom') {
        const customCode = config.customValidator || 'return { valid: true, errors: [] };';
        try {
          const fn = new Function('input', customCode);
          const res = fn(data);
          if (res && res.valid === false) {
            errors.push(...(res.errors || ['Custom validation failed']));
          }
        } catch (e: any) {
          errors.push(`Custom validator error: ${e.message}`);
        }
      }
    } catch (err: any) {
      errors.push(`Validation exception: ${err.message}`);
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  private static validateJsonSchema(
    data: any,
    schema: any,
    path: string,
    errors: string[],
    warnings: string[]
  ) {
    if (!schema || Object.keys(schema).length === 0) return;

    const currentPath = path || 'root';

    // Type check
    if (schema.type) {
      const actualType = Array.isArray(data)
        ? 'array'
        : data === null
        ? 'null'
        : typeof data;
      if (schema.type !== actualType) {
        errors.push(
          `Type mismatch at ${currentPath}: expected ${schema.type}, got ${actualType}`
        );
        return;
      }
    }

    // Required properties
    if (schema.required && Array.isArray(schema.required) && typeof data === 'object' && data !== null) {
      for (const req of schema.required) {
        if (data[req] === undefined || data[req] === null) {
          errors.push(`Missing required property "${req}" at ${currentPath}`);
        }
      }
    }

    // Nested properties
    if (schema.properties && typeof data === 'object' && data !== null) {
      for (const [key, propSchema] of Object.entries(schema.properties)) {
        if (data[key] !== undefined) {
          this.validateJsonSchema(
            data[key],
            propSchema,
            `${currentPath}.${key}`,
            errors,
            warnings
          );
        }
      }
    }

    // Items check for arrays
    if (schema.items && Array.isArray(data)) {
      data.forEach((item, index) => {
        this.validateJsonSchema(
          item,
          schema.items,
          `${currentPath}[${index}]`,
          errors,
          warnings
        );
      });
    }
  }

  private static getNestedValue(obj: any, path: string): any {
    if (!obj || typeof obj !== 'object') return undefined;
    const parts = path.split('.');
    let curr = obj;
    for (const p of parts) {
      if (curr === null || curr === undefined) return undefined;
      curr = curr[p];
    }
    return curr;
  }
}
