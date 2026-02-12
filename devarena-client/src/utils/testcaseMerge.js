/**
 * Append imported testcases to existing ones with hard cap and order normalization.
 *
 * @param {Array<{order:number,input:string,output:string}>} existing
 * @param {Array<{order:number,input:string,output:string}>} imported
 * @param {number} maxAllowed
 *
 * @returns {{
 *   merged: Array<{order:number,input:string,output:string}>,
 *   addedCount: number,
 *   droppedCount: number
 * }}
 */
export function appendTestcasesWithLimit(existing, imported, maxAllowed) {
  const safeExisting = Array.isArray(existing) ? existing : [];
  const safeImported = Array.isArray(imported) ? imported : [];

  const availableSlots = Math.max(0, maxAllowed - safeExisting.length);

  if (availableSlots === 0 || safeImported.length === 0) {
    return {
      merged: normalizeOrder(safeExisting),
      addedCount: 0,
      droppedCount: safeImported.length,
    };
  }

  const toAppend = safeImported.slice(0, availableSlots);
  const droppedCount = safeImported.length - toAppend.length;

  const merged = normalizeOrder([...safeExisting, ...toAppend]);

  return {
    merged,
    addedCount: toAppend.length,
    droppedCount,
  };
}

/**
 * Reassigns order as 1..N deterministically.
 */
export const normalizeOrder = (testcases) => {
  return testcases.map((tc, index) => ({
    ...tc,
    order: index + 1,
  }));
}
