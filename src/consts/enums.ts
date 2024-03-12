import { arrayToObjectEnum } from '../utils/array_utils';
import { TUnionFromObjectEnum } from '../utils/type_utils';

export const VISIBILITY_ENUM = arrayToObjectEnum(['show', 'hide']);
export type TVisibility = TUnionFromObjectEnum<typeof VISIBILITY_ENUM>;

export const FILE_EXTENSION_ENUM = arrayToObjectEnum(['json', 'md']);
export type TFileExtension = TUnionFromObjectEnum<typeof FILE_EXTENSION_ENUM>;

export const FILE_TYPE_ENUM = arrayToObjectEnum(['JSON', 'TABLE', 'MARKDOWN', '_']);
export type TFileType = TUnionFromObjectEnum<typeof FILE_TYPE_ENUM>;

export const NOTE_TYPE_ENUM = arrayToObjectEnum(['ONE_LEVEL', 'TWO_LEVEL', '_']);
export type TNoteType = TUnionFromObjectEnum<typeof NOTE_TYPE_ENUM>;
