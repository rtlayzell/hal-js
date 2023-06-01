import { type HalLink, type HalLinkOptions, HalLinkBuilder } from './link.js';

export type HalResource = {
  _links?: { [rel: string]: HalLink | HalLink[] },
  _embedded?: { [rel: string]: HalResource | HalResource[] },
  [key: string]: any,
}

export type HalEmbeddedResource = {
  rel: string,
  resource: HalResourceBuilder | HalResource
}

type HalCurieOptions = Omit<HalLinkOptions, 'name'>

export class HalResourceBuilder {
  private readonly _links: HalLinkBuilder[];
  private readonly _embed: HalEmbeddedResource[];
  private readonly _state: object;

  constructor(state: object) {
    this._links = [];
    this._embed = [];
    this._state = state;
  }

  link(rel: string, href: string, opts: HalLinkOptions = {}): HalResourceBuilder {
    this._addLink(rel, href, { ...opts });
    return this;
  }

  curie(name: string, href: string, opts: HalCurieOptions = {}): HalResourceBuilder {
    this._addLink('curies', href, { name, ...opts })
    return this;
  }

  embed(rel: string, resource: HalResourceBuilder | HalResource): HalResourceBuilder {
    this._addEmbed(rel, resource);
    return this;
  }

  json(replacer?: (string | number)[] | null, space?: string | number): string {
    return JSON.stringify(this.build(), replacer, space);
  }

  build(): HalResource | HalResource[] {
    return Array.isArray(this._state)
      ? this._buildCollectionResource(this._state)
      : this._buildSingletonResource(this._state);
  }

  private _addLink(rel: string, href: string, opts: HalLinkOptions) {
    const link = new HalLinkBuilder(rel, href, opts);
    this._links.push(link);
  }

  private _addEmbed(rel: string, resource: HalResourceBuilder | HalResource) {
    const emdedded = { rel, resource };
    this._embed.push({ rel, resource });
  }

  private _buildCollectionResource(state: object[]): HalResource[] {
    return state.map(this._buildSingletonResource.bind(this));
  }

  private _buildSingletonResource(state: object): HalResource {
    const result: HalResource = {};

    if (Array.isArray(this._links) && this._links.length) {
      result._links = this._buildLinks(state);
    }
    if (Array.isArray(this._embed) && this._embed.length) {
      result._embedded = this._buildEmbedded();
    }

    return Object.assign(result, state);
  }

  private _buildLinks(state: object): { [rel: string]: HalLink | HalLink[] } {
    return this._links.reduce((result: { [rel: string]: HalLink | HalLink[] }, curr, index) => {
      const { rel, opts } = curr;
      const link = curr.build(state);

      if (result[rel] === undefined) {
        result[rel] = rel === 'curies' ? [link] : link;
      } else if (!Array.isArray(result[rel])) {
        result[rel] = [result[rel] as HalLink, link];
      } else {
        (result[rel] as HalLink[]).push(link);
      }

      return result;
    }, {});
  }

  private _buildEmbedded(): { [rel: string]: HalResource | HalResource[] } {
    return this._embed.reduce((result: { [rel: string]: HalResource | HalResource[] }, curr, index) => {
      const { rel, resource } = curr;
      const embedded = (resource instanceof HalResourceBuilder)
        ? resource.build()
        : resource;

      if (result[rel] === undefined) {
        result[rel] = embedded;
      } else if (!Array.isArray(result[rel])) {
        result[rel] = [result[rel], embedded];
      } else {
        (result[rel] as HalResource[]).push(embedded);
      }

      return result;
    }, {});
  }
}
