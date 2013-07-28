/*global io: false, Observable: false */
/*jslint browser: true */
(function (global) {
	var WebSocketModel = function () {
		this.modelId = "default";
		this.model = {
			state: "created",
			data: {}
		};
		Observable.apply(this, []);
		this.webSocketSetup(this.model);
	};
	
	WebSocketModel.prototype = new Observable();
	WebSocketModel.prototype.purge = function (selector, timestamp) {
		this.set(selector, undefined, timestamp);
	};
	WebSocketModel.prototype.set = function (selector, value, timestamp) {
		if (timestamp) {
			update(selector, value, this.model.data);
			this.model.timestamp = timestamp;
			console.log("updated model timestamp", timestamp);
			this.emit("set", this.model.data, selector, value);
		} else {
			this.socket.emit("model-change", { 
				modelId: this.modelId,
				selector: selector, 
				value: value,
				timestamp: this.model.timestamp
			});
		}
	};
	WebSocketModel.prototype.get = function (selector) {
		get(selector, this.model.data);
	};
	WebSocketModel.prototype.webSocketSetup = function (model) {
		var that = this;
		
		this.socket = io.connect('http://localhost/model');
		
		this.socket.on('model-change', function (data) {
			console.log("retrieved 'model-change' event", data);
			that.set(data.selector, data.value, data.timestamp);
		});
		
		this.socket.on('model-init', proxy(this, this.initModel));
		this.socket.on("error", function (data) {
			console.err("remote error", data);
		});
		
		this.socket.emit("model-register", this.modelId);
	};
	WebSocketModel.prototype.initModel = function (remoteModel) {
		console.log("init model", remoteModel);
		this.model.data = remoteModel.data;
		this.model.status = remoteModel.status;
		this.model.timestamp = remoteModel.timestamp;
		this.emit("init", this.model.data, this.model.status);
	};
	
	
	global.WebSocketModel = WebSocketModel;
	
}(this));