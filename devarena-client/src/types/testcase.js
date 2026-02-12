/**
 * Value object matching backend Testcase exactly.
 *
 * order  : number (explicit, deterministic)
 * input  : string (stdin)
 * output : string (expected stdout)
 */
export const createTestcase = ({ order, input, output }) => ({
  order,
  input,
  output,
});

export const isValidTestcaseShape = (tc) =>
  typeof tc === "object" &&
  typeof tc.order === "number" &&
  typeof tc.input === "string" &&
  typeof tc.output === "string";

const sampleTestcaseLimit = 4;
const getSampleTestcaseLimit = () => sampleTestcaseLimit;

const hiddenTestcaseLimit = 20;
const getHiddenTestcaseLimit = () => hiddenTestcaseLimit;
export { getSampleTestcaseLimit, getHiddenTestcaseLimit };

