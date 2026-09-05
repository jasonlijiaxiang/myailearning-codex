/** @param {any} value */
function valueType(value) {
  if (value === null) return "null";
  if (Array.isArray(value)) return "array";
  if (Number.isInteger(value)) return "integer";
  return typeof value;
}

/**
 * @param {any} value
 * @param {string | string[]} expected
 * @returns {boolean}
 */
function matchesType(value, expected) {
  if (Array.isArray(expected)) return expected.some((type) => matchesType(value, type));
  if (expected === "number") return typeof value === "number" && Number.isFinite(value);
  if (expected === "integer") return Number.isInteger(value);
  return valueType(value) === expected;
}

/**
 * @param {any} left
 * @param {any} right
 */
function sameValue(left, right) {
  return JSON.stringify(left) === JSON.stringify(right);
}

/**
 * @param {any} value
 * @param {any} schema
 */
function matchesSchema(value, schema) {
  return validateJsonSchema(value, schema, "$", []).length === 0;
}

/**
 * @param {any} value
 * @param {any} schema
 * @param {string} [path]
 * @param {string[]} [errors]
 * @returns {string[]}
 */
export function validateJsonSchema(value, schema, path = "$", errors = []) {
  if (!schema || typeof schema !== "object") return errors;

  if (schema.type && !matchesType(value, schema.type)) {
    errors.push(`${path}: expected ${JSON.stringify(schema.type)}, received ${valueType(value)}`);
    return errors;
  }
  if (Object.hasOwn(schema, "const") && !sameValue(value, schema.const)) {
    errors.push(`${path}: must equal ${JSON.stringify(schema.const)}`);
  }
  if (schema.enum && !schema.enum.some((/** @type {any} */ candidate) => sameValue(value, candidate))) {
    errors.push(`${path}: value ${JSON.stringify(value)} is not in enum`);
  }
  if (schema.pattern && typeof value === "string" && !new RegExp(schema.pattern).test(value)) {
    errors.push(`${path}: value does not match ${schema.pattern}`);
  }
  if (schema.minLength != null && typeof value === "string" && value.length < schema.minLength) {
    errors.push(`${path}: string has fewer than ${schema.minLength} characters`);
  }
  if (schema.minimum != null && typeof value === "number" && value < schema.minimum) {
    errors.push(`${path}: number is less than ${schema.minimum}`);
  }
  if (schema.maximum != null && typeof value === "number" && value > schema.maximum) {
    errors.push(`${path}: number is greater than ${schema.maximum}`);
  }

  if (Array.isArray(value)) {
    if (schema.minItems != null && value.length < schema.minItems) {
      errors.push(`${path}: array has fewer than ${schema.minItems} items`);
    }
    if (schema.uniqueItems) {
      const serialized = value.map((item) => JSON.stringify(item));
      if (new Set(serialized).size !== serialized.length) errors.push(`${path}: array items must be unique`);
    }
    if (schema.items) value.forEach((item, index) => validateJsonSchema(item, schema.items, `${path}[${index}]`, errors));
    if (schema.contains && !value.some((item) => matchesSchema(item, schema.contains))) {
      errors.push(`${path}: array does not contain an item matching the required schema`);
    }
  }

  if (value && typeof value === "object" && !Array.isArray(value)) {
    for (const key of schema.required ?? []) {
      if (!Object.hasOwn(value, key)) errors.push(`${path}: missing required property ${key}`);
    }
    const properties = schema.properties ?? {};
    for (const [key, child] of Object.entries(value)) {
      if (Object.hasOwn(properties, key)) {
        validateJsonSchema(child, properties[key], `${path}.${key}`, errors);
      } else if (schema.additionalProperties === false) {
        errors.push(`${path}: unexpected property ${key}`);
      } else if (schema.additionalProperties && typeof schema.additionalProperties === "object") {
        validateJsonSchema(child, schema.additionalProperties, `${path}.${key}`, errors);
      }
    }
  }

  for (const [index, childSchema] of (schema.allOf ?? []).entries()) {
    validateJsonSchema(value, childSchema, `${path}.allOf[${index}]`, errors);
  }
  if (schema.not && matchesSchema(value, schema.not)) {
    errors.push(`${path}: value matches a forbidden schema`);
  }
  if (schema.if) {
    const branch = matchesSchema(value, schema.if) ? schema.then : schema.else;
    if (branch) validateJsonSchema(value, branch, path, errors);
  }

  return errors;
}

/**
 * @param {any} value
 * @param {any} schema
 * @param {string} [label]
 */
export function assertJsonSchema(value, schema, label = "value") {
  const errors = validateJsonSchema(value, schema, label);
  if (errors.length) throw new Error(`Schema validation failed:\n${errors.map((error) => `  - ${error}`).join("\n")}`);
}
