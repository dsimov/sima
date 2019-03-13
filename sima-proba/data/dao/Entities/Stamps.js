var query = require("db/v3/query");
var producer = require("messaging/v3/producer");
var daoApi = require("db/v3/dao");
var dao = daoApi.create({
	table: "STAMPS",
	properties: [
		{
			name: "ID",
			column: "ID",
			type: "INTEGER",
			id: true,
		}, {
			name: "CatalogNumber",
			column: "CATALOGNUMBER",
			type: "VARCHAR",
		}, {
			name: "Series",
			column: "SERIES",
			type: "INTEGER",
		}]
});
exports.list = function(settings) {
	return dao.list(settings);
};

exports.get = function(id) {
	return dao.find(id);
};

exports.create = function(entity) {
	var id = dao.insert(entity);
	triggerEvent("Create", {
		table: "STAMPS",
		key: {
			name: "ID",
			column: "ID",
			value: id
		}
	});
	return id;
};

exports.update = function(entity) {
	dao.update(entity);
	triggerEvent("Update", {
		table: "STAMPS",
		key: {
			name: "ID",
			column: "ID",
			value: entity.ID
		}
	});
};

exports.delete = function(id) {
	dao.remove(id);
	triggerEvent("Delete", {
		table: "STAMPS",
		key: {
			name: "ID",
			column: "ID",
			value: id
		}
	});
};

exports.count = function() {
	return dao.count();
};

exports.customDataCount = function() {
	var resultSet = query.execute("SELECT COUNT(*) FROM STAMPS");
	if (resultSet !== null && resultSet[0] !== null) {
		if (resultSet[0].COUNT !== undefined && resultSet[0].COUNT !== null) {
			return resultSet[0].COUNT;
		} else if (resultSet[0].count !== undefined && resultSet[0].count !== null) {
			return resultSet[0].count;
		}
	}
	return 0;
};

function triggerEvent(operation, data) {
	producer.queue("sima-proba/Entities/Stamps/" + operation).send(JSON.stringify(data));
}