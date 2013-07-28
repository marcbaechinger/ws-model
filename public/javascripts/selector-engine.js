(function (global) {
	var isIndex = function(token) {
		return !!token.trim().match(/^(0|[1-9][0-9]*)$/);
	};
	
	var update = function (selector, value, model) {
		var nodes = selector.split("."),
			currentNode;
		while (nodes.length > 1) {
			currentNode = model[nodes[0]];
			if (!currentNode) {
				model[nodes[0]] = isIndex(nodes[1]) ? [] : {};
			}
			model = model[nodes[0]];
			nodes.shift();
		}
		if (typeof value !== "undefined") {
			model[nodes[0]] = value;
		} else {
			delete model[nodes[0]];
		}
	};
	var get = function (selector, model) {
		var nodes = selector.split("."),
			currentNode;
		while (nodes.length > 1) {
			currentNode = model[nodes[0]];
			if (!currentNode) {
				model[nodes[0]] = {};
			}
			model = model[nodes[0]];
			nodes.shift();
		}
		return model[nodes[0]];
	};
	
	global.update = update;
	global.get = get;
	global._test = {
		isIndex: isIndex
	};
}(this));