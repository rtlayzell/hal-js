import { parseTemplate, type Template } from 'url-template';

export type HalLink = {
  href: string,
  name?: string,
  title?: string,
  profile?: string,
  hreflang?: string,
  deprecation?: string,
  templated?: boolean,
}

export type HalLinkOptions = Omit<HalLink, 'href'> & {
  expand?: boolean,
};

export class HalLinkBuilder {
  private _template?: Template;
  private get template() {
    return this._template
      ?? (this._template = parseTemplate(this.href));
  }

  constructor(
    readonly rel: string,
    readonly href: string,
    readonly opts: HalLinkOptions = {},
  ) { }

  build(state: any): HalLink {
    if (this.opts.templated) return { href: this.href, ...this.opts };

    const expansion = this.template.expand(state);
    const href = this.opts.expand ? expansion : this.href;
    const result = { href, ...this.opts };

    result.templated = !this.opts.expand && this.href !== expansion;
    if (!result.templated) delete result.templated;

    delete result.expand;
    return result;
  }
}