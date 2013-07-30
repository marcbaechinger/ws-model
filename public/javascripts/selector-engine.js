(function (global) {
	var isIndex = function(token) {
		return !!token.trim().match(/^(0|[1-9][0-9]*)$/);
	};
	var normalize = function(selector) {
		return selector.replace(/\[/g, ".").replace(/\]|\'|\"/g, "");
	};
	var getTargetNode = function (selector, model, callback) {
		var nodes = normalize(selector).split("."),
			currentNode;
		while (nodes.length > 1) {
			currentNode = model[nodes[0]];
			if (typeof currentNode === "undefined") {
				model[nodes[0]] = isIndex(nodes[1]) ? [] : {};
			}
			model = model[nodes[0]];
			nodes.shift();
		}
		callback(model, nodes[0]);
	};
	var update = function (selector, value, model) {
		getTargetNode(selector, model, function (targetNode, propertyName) {
			if (typeof value !== "undefined") {
				targetNode[propertyName] = value;
			} else {
				delete targetNode[propertyName];
			}
		});
	};
	var get = function (selector, model) {
		var val;
		getTargetNode(selector, model, function (targetNode, propertyName) {
			val = targetNode[propertyName];
		});
		return val;
	};
	
	global.update = update;
	global.get = get;
	global._test = {
		isIndex: isIndex,
		normalize: normalize
	};
}(this));