(function (global) {
	var proxy = function(that, func) {
		return function() {
			func.apply(that, arguments);
		};
	};
}(this));