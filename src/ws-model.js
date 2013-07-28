/*jslint node: true */
var selector = require("../public/javascripts/selector-engine.js"),
	_ = require("underscore"),
	uuid = require('node-uuid'),
	mixin = function (target, source) {
		var name;
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
	},
	emitModelChange = function (models, updateRequest) {
		if (models[updateRequest.modelId]) {
			models[updateRequest.modelId].listeners.forEach(function (socket) {
				socket.emit("model-change", updateRequest);
			});
		}
	},
	registerForModel = function (models, socket, modelId) {
		if (models[modelId]) {
			socket.emit("model-init", models[modelId].dataModel);
			models[modelId].listeners.push(socket);
		} else {
			emitError(socket, "no such model: '" + modelId + "'", {
				timestamp: models[modelId].model.timestamp
			});
		}
	},
	unregisterForModel = function (models, socket, modelId) {
		if (models[modelId]) {
			models[modelId].listeners = _.filter(models[modelId].listeners, function (currentSocket) {
				return currentSocket !== socket;
			});
		}
	},
	updateModel = function (models, socket, updateRequest) {
		var dataModel = models[updateRequest.modelId].dataModel;
		if (!dataModel) {
			emitError(socket, "model not found", { modelId: updateRequest.modelId });
		} else if (dataModel.timestamp === updateRequest.timestamp) {
			console.log("model-change", updateRequest);
			// update the model
			selector.update(updateRequest.selector, updateRequest.value, dataModel.data);
			// upcount timestamp
			dataModel.timestamp = uuid.v1();
			// signal to connected sockets
			updateRequest.timestamp = dataModel.timestamp;
			emitModelChange(models, updateRequest);
		} else {
			console.err("timestamps do not match", dataModel.timestamp , updateRequest.timestamp);
			// model seems to be out of sync
			emitError(socket, "out of sync", {
				timestamp: dataModel.timestamp
			});
		}
	},
	handleConnection = function (models, socket) {
		socket.on("model-register", _.partial(registerForModel, models, socket));
		socket.on("model-unregister", _.partial(unregisterForModel, models, socket));
		
		socket.on('model-change', _.partial(updateModel, models, socket));
		
		socket.on('model-fetch', function (modelId) {
			socket.emit("model-init", models[modelId].dataModel);
		});
		socket.on('model-timestamp', function (modelId) {
			socket.emit("model-timestamp", models[modelId].dataModel.timestamp, modelId);
		});
	};

var WebSocketModel = function (ioSockets) {
	this.models = {};
	this.registerModel("default", {
		state: "initialized",
		timestamp: uuid.v1(),
		data: {
			items: ["first", "second"]
		}
	});
	ioSockets.on('connection', _.partial(handleConnection, this.models));
};
WebSocketModel.prototype.registerModel = function (id, model) {
	model.modelId = id;
	this.models[id] = {
		dataModel: model,
		listeners: []
	};
};

exports.WebSocketModel = WebSocketModel;