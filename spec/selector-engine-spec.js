var select = require("../public/javascripts/selector-engine.js");

describe("set properties of the model", function setPropertiesModule() {
	"use strict";
	
	it("assign a primitive value to a property defined by selector (selector: 'address.street')", function setPrimtitiveProperties() {
		var model = {
				address: {}
			},
			modified = new Date();


		select.update("name", "Marc", model);
		select.update("address['street']", "Hegistrasse 37c", model);
		select.update("address[\"street2\"]", "Hegistrasse 37c", model);
		select.update("address.type", 2 , model);
		select.update("address.modified", modified, model);
		
		expect(model.name).toBe("Marc");
		expect(model.address.street).toBe("Hegistrasse 37c");
		expect(model.address.street2).toBe("Hegistrasse 37c");
		expect(model.address.type).toBe(2);
		expect(model.address.modified).toBe(modified);
	});
	
	it("assign a value to not exisiting property defined by selector (selector: 'address.type')", function setNonExistingPrimitiveProperty() {
		var model = {},
			modified = new Date();

		select.update("address.type", 2 , model);
		
		expect(model.address).toBeDefined();
		expect(model.address.type).toBe(2);
	});

	
	it("assign an object graph to the property defined by selector", function setComplexObject() {
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
	
	it("assign arrays and items of arrays to a property defined by selector (selector: 'model.persons[3][1][1]')", function setComplexObject() {
		var model = {
				persons: []
			},
			arr = ["a", "b", "c"]

		select.update("persons", ["aa", "bb", "cc"] , model);
		select.update("persons[2]", arr , model);
		select.update("persons[2][1]", "value" , model);
		select.update("persons[2][0]", {name: "value200"} , model);
	
		expect(model.persons).toBeDefined();
		expect(model.persons[0]).toBe("aa");
		expect(model.persons[1]).toBe("bb");
		expect(model.persons[2][0].name).toBe("value200");
		expect(model.persons[2][1]).toBe("value");

		select.update("persons[3]", ["zz", ["uu", "vv"]] , model);
		select.update("persons[3][1][0]", "hans" , model);
		expect(model.persons[3][1][0]).toBe("hans");
		expect(model.persons[3][1][1]).toBe("vv");
		select.update("persons.3.1.1", "marc" , model);
		expect(model.persons[3][1][1]).toBe("marc");
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

		select.update("person[0]", "Marc" , model);
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

