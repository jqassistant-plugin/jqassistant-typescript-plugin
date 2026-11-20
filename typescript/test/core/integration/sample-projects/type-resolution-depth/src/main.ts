export type tDeeplyNested = { l1: { l2: { l3: { l4: { l5: { l6: { l7: { l8: { l9: { l10: { l11: string } } } } } } } } } } };

export type tGenericFunctionMember = { fun: <T extends { l3: string }>(param: T) => void };
