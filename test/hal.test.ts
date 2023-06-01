import { HalResourceBuilder, hal } from "../src/hal";

describe("GIVEN hal is called", () => {

  describe("WITH no argument", () => {
    let resource: HalResourceBuilder

    beforeEach(() => {
      resource = hal();
    });

    test("THEN it should produce an empty resource.", () => {
      expect(resource.build()).toEqual({});
    });

    test("THEN converting to json should produce an empty json object.", () => {
      expect(resource.json()).toBe("{}");
    });

    describe("AND a link is added", () => {
      beforeEach(() => {
        resource.link("self", "/resource");
      });

      test("THEN it should produce a resource with a '_links' property and the link.", () => {
        expect(resource.build()).toEqual({
          _links: { self: { href: "/resource" } }
        });
      });
    });

    describe("AND multiple links are added", () => {
      beforeEach(() => {
        resource
          .link("self", "/resource")
          .link("next", "/resource?page=2&limit=10");
      });

      test("THEN it should produce a resource with a '_links' property and the links.", () => {
        expect(resource.build()).toEqual({
          _links: {
            self: { href: "/resource" },
            next: { href: "/resource?page=2&limit=10" },
          },
        });
      });
    });

    describe("AND a link with a templated href is added", () => {
      beforeEach(() => {
        resource.link("find", "/resource/{id}");
      });

      test("THEN it should produce a link with the 'templated' attribute set to 'true'.", () => {
        expect(resource.build()).toEqual({
          _links: { find: { href: '/resource/{id}', templated: true } }
        });
      });
    });

    describe("AND a link with optional parameters are added", () => {
      beforeEach(() => {
        resource.link("self", "/resource", {
          deprecation: "deprecation",
          hreflang: 'hreflang',
          name: "name",
          title: "title",
          profile: "profile"
        });
      });

      test("THEN it should produce a link with the optional parameters in the '_links' object.", () => {
        expect(resource.build()).toEqual({
          _links: {
            self: {
              href: "/resource",
              deprecation: "deprecation",
              hreflang: 'hreflang',
              name: "name",
              title: "title",
              profile: "profile"
            }
          }
        })
      });
    });

    describe("AND a link where the href is a template", () => {

    });

    describe("AND an embedded resource is added", () => {
      beforeEach(() => {
        resource.embed("resource", { first: 1, second: "two" });
      });

      test("THEN it should produce a resource with an '_embedded' property and the embedded resource.", () => {
        expect(resource.build()).toEqual({
          _embedded: { resource: { first: 1, second: "two" } }
        });
      });
    });
  });

  describe("WITH an singleton resource argument", () => {
    let resource: HalResourceBuilder;

    beforeEach(() => {
      resource = hal({
        first: 1,
        second: "two"
      });
    });

    test("THEN it should produce a singleton resource with each property supplied.", () => {
      expect(resource.build()).toEqual({
        first: 1,
        second: "two"
      });
    });

    test("THEN converting to json should produce an empty json object.", () => {
      expect(resource.json()).toBe('{"first":1,"second":"two"}');
    });

    describe("AND a link is added", () => {
      beforeEach(() => {
        resource.link("self", "/resource");
      });

      test("THEN it should produce a singleton resource merging the '_links' property.", () => {
        expect(resource.build()).toEqual({
          first: 1,
          second: "two",
          _links: { self: { href: "/resource" } }
        });
      });
    });

    describe("AND an embedded resource is added", () => {
      beforeEach(() => {
        resource.embed("resource", { first: 1, second: "two" });
      });

      test("THEN it should produce a resource merging the '_embedded' property.", () => {
        expect(resource.build()).toEqual({
          first: 1,
          second: "two",
          _embedded: { resource: { first: 1, second: "two" } }
        });
      });
    });
  });

  describe("WITH an collection resource argument", () => {
    let resource: HalResourceBuilder;

    beforeEach(() => {
      resource = hal([
        { id: 1 },
        { id: 2 },
      ]);
    });

    test("THEN it should produce a collection resource.", () => {
      expect(resource.build()).toEqual([
        { id: 1 },
        { id: 2 },
      ]);
    });

    describe("AND an expanded template link is added", () => {
      beforeEach(() => {
        resource.link('self', '/resource/{id}', { expand: true });
      });

      test("THEN should add links to each resource with rendered templates.", () => {
        expect(resource.build()).toEqual([
          { id: 1, _links: { self: { href: "/resource/1" } } },
          { id: 2, _links: { self: { href: "/resource/2" } } },
        ]);
      });
    });
  });
});

// const log = (item?: any) => console.dir(item, { depth: null });

// log(hal({ count: 1, total: 1 })
//   .link("self", "/resource/{id}")
//   .embed("name", [{ foo: "bar" }, { baz: "quux" }])
//   .build())

// create a collection resource of products and expand
// the link template uri"s with the product id"s.
// const products = hal([
//    { id: 131, name: "Shampoo" },
//    { id: 412, name: "Hair Gel" },
//    { id: 733, name: "Toothpaste" },
// ])
//    .link("self", "/products/{id}", { expand: true })
//    .link("foos", "/products/{id}/foos", { expand: true });

// console.dir(
//    hal({ count: 3, total: 9 })
//       .curie("http://docs.acme.com/relations/{rel}", { name: "acme" })
//       .curie("http://docs.acme.com/relations/{rel}", { name: "ea" })
//       .link("self", "/products")
//       .link("find", "/products/{id}")
//       .link("admin", "/admin/2", { title: "Fred" })
//       .link("admin", "/admin/5", { title: "Alice" })
//       .embed("products", products.build())
//       .build(),
//    { depth: null });
