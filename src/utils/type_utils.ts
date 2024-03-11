export type TUnionFromObjectEnum<T> = T extends { [key: string]: infer U } ? U : never;
