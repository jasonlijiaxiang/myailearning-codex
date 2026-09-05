// Single JSON Schema validation walker used by both the portable knowledge
// tool and scripts/lib/json-schema-lite.mjs. It supports two dialects:
// - "kb": the portable kb-tool validator (type/enum early return, date formats,
//   literal error messages that appear verbatim in CLI output);
// - "lite": the former json-schema-lite validator (const/contains/allOf/not/if,
//   schema-object additionalProperties, JSON deep equality for enum/const).
// Each dialect keeps the exact acceptance/rejection behavior and message text
// of the validator it replaced.

/** @param {any} value @param {string} type @returns {boolean} */
function matchesJsonType(value, type) {
  if (type === "null") return value === null;
  if (type === "array") return Array.isArray(value);
  if (type === "object") return value !== null && typeof value === "object" && !Array.isArray(value);
  if (type === "integer") return Number.isInteger(value);
  return typeof value === type;
}

/** @param {any} value @returns {string} */
function valueType(value) {
  if (value === null) return "null";
  if (Array.isArray(value)) return "array";
  if (Number.isInteger(value)) return "integer";
  return typeof value;
}

/** @param {any} value @param {string | string[]} expected @returns {boolean} */
function matchesType(value, expected) {
  if (Array.isArray(expected)) return expected.some((type) => matchesType(value, type));
  if (expected === "number") return typeof value === "number" && Number.isFinite(value);
  if (expected === "integer") return Number.isInteger(value);
  return valueType(value) === expected;
}

/** @param {any} left @param {any} right @returns {boolean} */
function sameValue(left, right) {
  return JSON.stringify(left) === JSON.stringify(right);
}

/** @param {any} value @returns {boolean} */
export function validDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value ?? "")) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed.valueOf()) && parsed.toISOString().slice(0, 10) === value;
}

/** @param {any} value @param {any} schema @returns {boolean} */
function matchesSchema(value, schema) {
  return walk(value, schema, "$", [], "lite").length === 0;
}

/** @param {any} value @param {any} schema @param {string} path @param {string[]} errors @param {"kb" | "lite"} dialect @returns {string[]} */
function walk(value, schema, path, errors, dialect) {
  if (dialect === "lite") {
    if (!schema || typeof schema !== "object") return errors;
  }

  const types = Array.isArray(schema.type) ? schema.type : schema.type ? [schema.type] : [];
  if (dialect === "kb") {
    if (types.length > 0 && !types.some((/** @type {string} */ type) => matchesJsonType(value, type))) {
      errors.push(`${path} must be ${types.join(" or ")}`);
      return errors;
    }
  } else if (schema.type && !matchesType(value, schema.type)) {
    errors.push(`${path}: expected ${JSON.stringify(schema.type)}, received ${valueType(value)}`);
    return errors;
  }

  if (dialect === "lite" && Object.hasOwn(schema, "const") && !sameValue(value, schema.const)) {
    errors.push(`${path}: must equal ${JSON.stringify(schema.const)}`);
  }

  if (schema.enum) {
    if (dialect === "kb") {
      if (!schema.enum.includes(value)) {
        errors.push(`${path} must be one of ${schema.enum.join(", ")}`);
        return errors;
      }
    } else if (!schema.enum.some((/** @type {any} */ candidate) => sameValue(value, candidate))) {
      errors.push(`${path}: value ${JSON.stringify(value)} is not in enum`);
    }
  }

  if (typeof value === "number") {
    if (dialect === "kb") {
      if (Number.isFinite(schema.minimum) && value < schema.minimum) {
        errors.push(`${path} must be at least ${schema.minimum}`);
      }
      if (Number.isFinite(schema.maximum) && value > schema.maximum) {
        errors.push(`${path} must be at most ${schema.maximum}`);
      }
    } else {
      if (schema.minimum != null && value < schema.minimum) {
        errors.push(`${path}: number is less than ${schema.minimum}`);
      }
      if (schema.maximum != null && value > schema.maximum) {
        errors.push(`${path}: number is greater than ${schema.maximum}`);
      }
    }
  }

  if (typeof value === "string") {
    if (dialect === "kb") {
      if (schema.minLength && value.length < schema.minLength) errors.push(`${path} is empty`);
      if (schema.pattern && !new RegExp(schema.pattern).test(value)) {
        errors.push(`${path} does not match the required hashed identifier format`);
      }
      if (schema.format === "date" && !validDate(value)) errors.push(`${path} must be a valid date`);
      if (schema.format === "date-time" && !Number.isFinite(Date.parse(value))) {
        errors.push(`${path} must be a valid date-time`);
      }
    } else {
      if (schema.pattern && !new RegExp(schema.pattern).test(value)) {
        errors.push(`${path}: value does not match ${schema.pattern}`);
      }
      if (schema.minLength != null && value.length < schema.minLength) {
        errors.push(`${path}: string has fewer than ${schema.minLength} characters`);
      }
    }
  }

  if (Array.isArray(value)) {
    if (dialect === "kb") {
      if (schema.minItems && value.length < schema.minItems) {
        errors.push(`${path} needs at least ${schema.minItems} item(s)`);
      }
      if (schema.uniqueItems) {
        const serialized = value.map((item) => JSON.stringify(item));
        if (new Set(serialized).size !== serialized.length) errors.push(`${path} must contain unique items`);
      }
      if (schema.items) {
        value.forEach((item, index) => walk(item, schema.items, `${path}[${index}]`, errors, dialect));
      }
    } else {
      if (schema.minItems != null && value.length < schema.minItems) {
        errors.push(`${path}: array has fewer than ${schema.minItems} items`);
      }
      if (schema.uniqueItems) {
        const serialized = value.map((item) => JSON.stringify(item));
        if (new Set(serialized).size !== serialized.length) errors.push(`${path}: array items must be unique`);
      }
      if (schema.items) {
        value.forEach((item, index) => walk(item, schema.items, `${path}[${index}]`, errors, dialect));
      }
      if (schema.contains && !value.some((item) => matchesSchema(item, schema.contains))) {
        errors.push(`${path}: array does not contain an item matching the required schema`);
      }
    }
  }

  if (value !== null && typeof value === "object" && !Array.isArray(value)) {
    if (dialect === "kb") {
      for (const required of schema.required ?? []) {
        if (!(required in value)) errors.push(`${path}.${required} is required`);
      }
      const properties = schema.properties ?? {};
      if (schema.additionalProperties === false) {
        for (const key of Object.keys(value)) {
          if (!(key in properties)) errors.push(`${path}.${key} is not allowed`);
        }
      }
      for (const [key, childSchema] of Object.entries(properties)) {
        if (key in value) walk(value[key], childSchema, `${path}.${key}`, errors, dialect);
      }
    } else {
      for (const key of schema.required ?? []) {
        if (!Object.hasOwn(value, key)) errors.push(`${path}: missing required property ${key}`);
      }
      const properties = schema.properties ?? {};
      for (const [key, child] of Object.entries(value)) {
        if (Object.hasOwn(properties, key)) {
          walk(child, properties[key], `${path}.${key}`, errors, dialect);
        } else if (schema.additionalProperties === false) {
          errors.push(`${path}: unexpected property ${key}`);
        } else if (schema.additionalProperties && typeof schema.additionalProperties === "object") {
          walk(child, schema.additionalProperties, `${path}.${key}`, errors, dialect);
        }
      }
    }
  }

  if (dialect === "lite") {
    for (const [index, childSchema] of (schema.allOf ?? []).entries()) {
      walk(value, childSchema, `${path}.allOf[${index}]`, errors, dialect);
    }
    if (schema.not && matchesSchema(value, schema.not)) {
      errors.push(`${path}: value matches a forbidden schema`);
    }
    if (schema.if) {
      const branch = matchesSchema(value, schema.if) ? schema.then : schema.else;
      if (branch) walk(value, branch, path, errors, dialect);
    }
  }

  return errors;
}

/** @param {any} value @param {any} schema @param {string} label @param {string[]} errors @returns {string[]} */
export function validateSchemaValue(value, schema, label, errors) {
  return walk(value, schema, label, errors, "kb");
}

/** @param {any} value @param {any} schema @param {string} [path] @param {string[]} [errors] @returns {string[]} */
export function validateJsonSchema(value, schema, path = "$", errors = []) {
  return walk(value, schema, path, errors, "lite");
}

/** @param {any} value @param {any} schema @param {string} [label] */
export function assertJsonSchema(value, schema, label = "value") {
  const errors = validateJsonSchema(value, schema, label);
  if (errors.length) throw new Error(`Schema validation failed:\n${errors.map((error) => `  - ${error}`).join("\n")}`);
}
