export type GraphLayer = { readonly no: string; readonly name: string; readonly en: string; readonly moduleIds: readonly string[] };
export type GraphModule = { readonly id: string; readonly zh: string; readonly en: string; readonly href: string; readonly layerNo: string; readonly layerName: string; readonly summary: string };
export type GraphTerm = { readonly id: string; readonly zh: string; readonly en: string; readonly abbr?: string; readonly description: string; readonly moduleIds: readonly string[]; readonly primaryModuleId: string };
export type GraphRelationType = { readonly label: string; readonly description: string };
