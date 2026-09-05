import { loadConfig } from "./context.mjs";
import { verifierFromRegistries } from "./registries.mjs";
import { validateEnvironment } from "./validate-environment.mjs";
import { validateKnowledgeState } from "./validate-registries.mjs";

export async function validate({
  quiet = false,
  allowOverdueUnresolved = false,
  skipRetentionSweep = false,
  setExitCode = true,
  returnContext = false,
} = {}) {
  const config = await loadConfig();
  const environment = await validateEnvironment(config);
  const { errors } = environment;
  const state = await validateKnowledgeState(
    config,
    environment,
    { allowOverdueUnresolved, skipRetentionSweep },
  );

  if (!quiet) {
    if (errors.length === 0) console.log("Portable knowledge validation passed.");
    for (const error of errors) console.error(`ERROR ${error}`);
  }
  if (setExitCode && errors.length > 0) process.exitCode = 1;
  return returnContext
    ? { errors, registriesValid: state.registriesValid, resultRegistries: state.resultRegistries }
    : errors;
}

export async function prepareProcessedResultVerifier() {
  try {
    const context = await validate({
      quiet: true,
      allowOverdueUnresolved: true,
      skipRetentionSweep: true,
      setExitCode: false,
      returnContext: true,
    });
    if (context.errors.length > 0 || !context.registriesValid) return async () => false;
    return verifierFromRegistries(context.resultRegistries);
  } catch {
    return async () => false;
  }
}
