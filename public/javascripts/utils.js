(function (global) {
	var proxy = function(that, func) {
		return function() {
			func.apply(that, arguments);
		};
	};
	global.proxy = proxy;
}(this));