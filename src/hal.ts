import { HalResourceBuilder as HalResourceBuilderImpl } from './resource.js';
interface HalResourceBuilder extends HalResourceBuilderImpl {}

export { HalResourceBuilder };
export const hal = (resource?: object): HalResourceBuilder => new HalResourceBuilderImpl(resource ?? {});

