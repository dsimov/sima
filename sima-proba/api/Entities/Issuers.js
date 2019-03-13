var rs = require('http/v3/rs');
var dao = require('sima-proba/data/dao/Entities/Issuers');
var http = require('sima-proba/api/http');

rs.service()
	.resource('')
		.get(function(ctx, request) {
			var queryOptions = {};
			var parameters = request.getParameterNames();
			for (var i = 0; i < parameters.length; i ++) {
				queryOptions[parameters[i]] = request.getParameter(parameters[i]);
			}
			var entities = dao.list(queryOptions);
			http.sendResponseOk(entities);
		})
	.resource('count')
		.get(function(ctx, request) {
			http.sendResponseOk(dao.count());
		})
	.resource('{id}')
		.get(function(ctx) {
			var id = ctx.pathParameters.id;
			var entity = dao.get(id);
			if (entity) {
			    http.sendResponseOk(entity);
			} else {
				http.sendResponseNotFound('Issuers not found');
			}
		})
	.resource('')
		.post(function(ctx, request, response) {
			var entity = request.getJSON();
			entity.ID = dao.create(entity);
			response.setHeader('Content-Location', '/services/v3/js/sima-proba/api/Issuers.js/' + entity.ID);
			http.sendResponseCreated(entity);
		})
	.resource('{id}')
		.put(function(ctx, request) {
			var entity = request.getJSON();
			entity.ID = ctx.pathParameters.id;
			dao.update(entity);
			http.sendResponseOk(entity);
		})
	.resource('{id}')
		.delete(function(ctx) {
			var id = ctx.pathParameters.id;
			var entity = dao.get(id);
			if (entity) {
				dao.delete(id);
				http.sendResponseNoContent();
			} else {
				http.sendResponseNotFound('Issuers not found');
			}
		})
.execute();
