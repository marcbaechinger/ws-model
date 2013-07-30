var select = require("../public/javascripts/selector-engine.js");

describe("test isIndex helper function to recoginze index tokens like 0, 2, 999", function isIndexModule() {
	it("recognize zero as an index", function recognizeIndexTokens() {
		expect(select._test.isIndex("0")).toBe(true);
	});
	it("recognize a single digit as an index", function recognizeIndexTokens() {
		expect(select._test.isIndex("9")).toBe(true);
	});
	it("recognize a mulple digit as an index", function recognizeIndexTokens() {
		expect(select._test.isIndex("721212")).toBe(true);
	});
	it("leading zeros not allowed", function recognizeIndexTokens() {
		expect(select._test.isIndex("01")).toBe(false);
	});
	it("recognize floating point are no indexes", function recognizeIndexTokens() {
		expect(select._test.isIndex("1.2")).toBe(false);
		expect(select._test.isIndex("1,2")).toBe(false);
	});
	it("trim whitespace", function recognizeIndexTokens() {
		expect(select._test.isIndex("    2   ")).toBe(true);
		expect(select._test.isIndex("1    ")).toBe(true);
		expect(select._test.isIndex("   1222")).toBe(true);
		
		expect(select._test.isIndex("12 22")).toBe(false);
	});
	it("recognize alphanum keys are not an index", function recognizeIndexTokens() {
		expect(select._test.isIndex("72s1212")).toBe(false);
		expect(select._test.isIndex("a")).toBe(false);
	});	
});

describe("test normalization of bracket notation for arrays", function normalizeModule() {
	it("normalize selector 'persons[1]'", function recognizeIndexTokens() {
		expect(select._test.normalize("persons[1]")).toBe("persons.1");
	});
	it("normalize selector 'persons[1].name'", function recognizeIndexTokens() {
		expect(select._test.normalize("persons[1].name")).toBe("persons.1.name");
	});
	it("normalize selector 'persons[1][2]'", function recognizeIndexTokens() {
		expect(select._test.normalize("persons[1][2]")).toBe("persons.1.2");
	});
});
describe("test normalization of quoted bracket notation", function normalizeModule() {
	it("normalize selector 'persons['name']'", function recognizeIndexTokens() {
		expect(select._test.normalize("persons['name']")).toBe("persons.name");
	});
	it("normalize selector 'persons[1]['name']'", function recognizeIndexTokens() {
		expect(select._test.normalize("persons[1]['name']")).toBe("persons.1.name");
	});
	it("normalize selector 'persons[\"name\"]'", function recognizeIndexTokens() {
		expect(select._test.normalize("persons[\"name\"]")).toBe("persons.name");
	});
	it("normalize selector 'persons[1][\"name\"].2'", function recognizeIndexTokens() {
		expect(select._test.normalize("persons[2][\"name\"].2")).toBe("persons.2.name.2");
	});
});
