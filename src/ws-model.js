/*jslint node: true */
var selector = require("../public/javascripts/selector-engine.js"),
	uuid = require('node-uuid'),
	mixin = function (target, source) {
		for (name in source) {
			if (!target[name] && source.hasOwnProperty(name)) {
				target[name] = source[name];
			}
		}
	},
	emitError = function (socket, message, opts) {
		socket.emit("error", mixin({
			message: message
		}, opts));
	};

var WebSocketModel = function (ioSockets) {
	console.log("init WebSocketModel");
	var that = this;
	
	this.models = {};
	
	this.registerModel("default", {
		state: "initialized",
		timestamp: uuid.v1(),
		data: {
			items: ["first", "second"]
		}
	});
	
	ioSockets.on('connection', function (socket) {
		
		socket.on("model-register", function (modelId) {
			if (that.models[modelId]) {
				socket.emit("model-init", that.models[modelId].dataModel);
				that.models[modelId].listeners.push(socket);
			} else {
				emitError(socket, "out of sync", {
					timestamp: that.models[modelId].model.timestamp
				});
			}
		});

		socket.on('model-change', function (updateRequest) {
			var dataModel = that.models[updateRequest.modelId].dataModel;
			if (dataModel) {
				console.log("model-change", updateRequest);
				if (updateRequest.timestamp === dataModel.timestamp) {
					// update the model
					selector.update(updateRequest.selector, updateRequest.value, dataModel.data);
					// upcount timestamp
					dataModel.timestamp = uuid.v1();
					// signal to connected sockets
					updateRequest.timestamp = dataModel.timestamp;
					that.sendModelChange(that.models, updateRequest);
				} else {
					console.err("timestamps do not match", dataModel.timestamp , updateRequest.timestamp);
					// model seems to be out of sync
					socket.emit("error", {
						message: "out of sync",
						timestamp: dataModel.timestamp
					});
				}
			} else {
				emitError(socket, "model not found", { modelId: updateRequest.modelId });
			}
		});

		socket.on('model-fetch', function (modelId) {
			socket.emit("model-init", that.models[modelId].dataModel);
		});
		socket.on('model-timestamp', function (modelId) {
			socket.emit("model-timestamp", that.models[modelId].dataModel.timestamp);
		});
	});
};
WebSocketModel.prototype.registerModel = function (id, model) {
	this.models[id] = {
		dataModel: model,
		listeners: []
	};
};
WebSocketModel.prototype.sendModelChange = function (models, updateRequest) {
	if (models[updateRequest.modelId]) {
		models[updateRequest.modelId].listeners.forEach(function (socket) {
			socket.emit("model-change", updateRequest);
		});
	}
};

exports.WebSocketModel = WebSocketModel;