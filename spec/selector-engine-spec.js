var select = require("../public/javascripts/selector-engine.js");

describe("set properties of the model", function setPropertiesModule() {
	"use strict";
	
	it("set primitive properties (selector: 'address.street')", function setPrimtitiveProperties() {
		var model = {
				address: {}
			},
			modified = new Date();

		select.update("name", "Marc", model);
		select.update("address.street", "Hegistrasse 37c", model);
		select.update("address.type", 2 , model);
		select.update("address.modified", modified, model);
		
		expect(model.name).toBe("Marc");
		expect(model.address.street).toBe("Hegistrasse 37c");
		expect(model.address.type).toBe(2);
		expect(model.address.modified).toBe(modified);
	});
	
	it("set attribute of none exisiting property (selector: 'address.type')", function setNonExistingPrimitiveProperty() {
		var model = {},
			modified = new Date();

		select.update("address.type", 2 , model);
		
		expect(model.address).toBeDefined();
		expect(model.address.type).toBe(2);
	});

	
	it("set object graph as property", function setComplexObject() {
		var model = {
				person: {
					name: "Hans"
				}
			},
			graph = {
				firstName: "Marc",
				lastName: "Bächinger",
				gender: "m"
			};

		select.update("person", graph , model);
		
		expect(model.person).toBeDefined();
		expect(model.person.firstName).toBe("Marc");
		expect(model.person.lastName).toBe("Bächinger");
		expect(model.person.gender).toBe("m");
	});
	
	it("set array as property", function setComplexObject() {
		var model = {
				persons: []
			},
			arr = ["a", "b", "c"]

		select.update("persons", arr , model);
		select.update("persons.2", arr , model);
		
		expect(model.persons).toBeDefined();
		expect(model.persons[0]).toBe("a");
		expect(model.persons[1]).toBe("b");
		expect(model.persons[2][0]).toBe("a");
	});

	
	it("set non-existing object graph as property", function selectorOnNonExistingObjectProperty() {
		var model = {},
			graph = {
				firstName: "Marc",
				lastName: "Bächinger",
				gender: "m"
			};

		select.update("person", graph , model);
		
		expect(model.person).toBeDefined();
		expect(model.person.firstName).toBe("Marc");
		expect(model.person.lastName).toBe("Bächinger");
		expect(model.person.gender).toBe("m");
	});
	
	
	it("set an item in an array by index (selector: 'persons.1')", function arrayIndexSelector() {
		var model = {
				persons: [
					"Marc",
					"Hans",
					"Fritz"
				]
			};

		select.update("persons.1", "Dave" , model);
		select.update("persons.2", "Bill" , model);
		
		expect(model.persons[1]).toBe("Dave");
		expect(model.persons[2]).toBe("Bill");
	});
	
	it("set an item in an array by index (complex objects; selector: 'persons.1.street')", function arrayIndexSelectorComplex() {
		var model = {
				persons: [
					"Marc",
					"Hans",
					"Fritz"
				]
			};

		select.update("persons.1", { name: "Marc" } , model);
		select.update("persons.2", { name: "Bill" } , model);
		select.update("persons.1.street", "street" , model);
		
		expect(model.persons[1].name).toBe("Marc");
		expect(model.persons[1].street).toBe("street");
		
		expect(model.persons[2].name).toBe("Bill");
		select.update("persons.2.name", "Hans" , model);
		expect(model.persons[2].name).toBe("Hans");
	});
});


describe("auto creation of non-existing properties defined in a selector path", function autoCreationModule() {
	
	it("auto-create an object (selector: 'person.name')", function arrayIndexSelector() {
		var model = {};

		select.update("person.name", "Marc" , model);
		expect(model.person).toBeDefined();
		expect(model.person.name).toBe("Marc");
	});
	
	it("auto-create an array (selector: 'person.0')", function arrayIndexSelector() {
		var model = {},
			toString = Object.prototype.toString;

		select.update("person.0", "Marc" , model);
		expect(model.person).toBeDefined();
		expect(model.person[0]).toBe("Marc");
		expect(toString.apply(model.person)).toBe(toString.apply([]));
	});
	
	it("auto-create an item of an auto-created array and set a prop on it (selector: 'person.0.name')", function arrayIndexSelector() {
		var model = {},
			toString = Object.prototype.toString;

		select.update("person.0.name", "Marc" , model);
		select.update("person.1.name", "Marc" , model);
		expect(model.person).toBeDefined();
		expect(model.person[0].name).toBe("Marc");
		expect(toString.apply(model.person)).toBe(toString.apply([]));
		expect(toString.apply(model.person[0])).toBe(toString.apply({}));
	});
});


describe("delete properties of the model", function deletePropertiesModule() {
	
	it("delete a primitive property", function arrayIndexSelector() {
		var model = {
				name: "Marc"
			};

		select.update("name", undefined , model);
		expect(model.name).not.toBeDefined();
	});
	it("delete an object property", function arrayIndexSelector() {
		var model = {
				person: {
					name: "Marc"
				}
			};

		expect(model.person).toBeDefined();
		select.update("person", undefined , model);
		expect(model.person).not.toBeDefined();
	});

	it("delete an array property", function arrayIndexSelector() {
		var model = {
				names: ["a", "b"]
			};

		expect(model.names).toBeDefined();
		select.update("names", undefined , model);
		expect(model.names).not.toBeDefined();
	});
});


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
	it("recognize a alphanum values digit as an index", function recognizeIndexTokens() {
		expect(select._test.isIndex("72s1212")).toBe(false);
		expect(select._test.isIndex("a")).toBe(false);
	});
	
});
