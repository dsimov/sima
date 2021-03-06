angular.module('page', ['ngAnimate', 'ui.bootstrap']);
angular.module('page')
.factory('httpRequestInterceptor', function () {
	return {
		request: function (config) {
			config.headers['X-Requested-With'] = 'Fetch';
			return config;
		}
	};
})
.config(['$httpProvider', function($httpProvider) {
	$httpProvider.interceptors.push('httpRequestInterceptor');
}])
.factory('$messageHub', [function(){
	var messageHub = new FramesMessageHub();

	var message = function(evtName, data){
		messageHub.post({data: data}, 'sima-proba.Entities.Stamps.' + evtName);
	};

	var on = function(topic, callback){
		messageHub.subscribe(callback, topic);
	};

	return {
		message: message,
		on: on,
		onEntityRefresh: function(callback) {
			on('sima-proba.Entities.Stamps.refresh', callback);
		},
		onSeriesModified: function(callback) {
			on('sima-proba.Entities.Series.modified', callback);
		},
		onIssuersModified: function(callback) {
			on('sima-proba.Entities.Issuers.modified', callback);
		},
		messageEntityModified: function() {
			message('modified');
		}
	};
}])
.controller('PageController', function ($scope, $http, $messageHub) {

	var api = '../../../../../../../../services/v3/js/sima-proba/api/Entities/Stamps.js';
	var seriesOptionsApi = '../../../../../../../../services/v3/js/sima-proba/api/Entities/Series.js';
	var issuerOptionsApi = '../../../../../../../../services/v3/js/sima-proba/api/Entities/Issuers.js';

	$scope.seriesOptions = [];

	$scope.issuerOptions = [];

	$scope.dateOptions = {
		startingDay: 1
	};
	$scope.dateFormats = ['yyyy/MM/dd', 'dd-MMMM-yyyy', 'dd.MM.yyyy', 'shortDate'];
	$scope.dateFormat = $scope.dateFormats[0];

	function seriesOptionsLoad() {
		$http.get(seriesOptionsApi)
		.success(function(data) {
			$scope.seriesOptions = data;
		});
	}
	seriesOptionsLoad();

	function issuerOptionsLoad() {
		$http.get(issuerOptionsApi)
		.success(function(data) {
			$scope.issuerOptions = data;
		});
	}
	issuerOptionsLoad();

	$scope.dataPage = 1;
	$scope.dataCount = 0;
	$scope.dataOffset = 0;
	$scope.dataLimit = 10;

	$scope.getPages = function() {
		return new Array($scope.dataPages);
	};

	$scope.nextPage = function() {
		if ($scope.dataPage < $scope.dataPages) {
			$scope.loadPage($scope.dataPage + 1);
		}
	};

	$scope.previousPage = function() {
		if ($scope.dataPage > 1) {
			$scope.loadPage($scope.dataPage - 1);
		}
	};

	$scope.loadPage = function(pageNumber) {
		$scope.dataPage = pageNumber;
		$http.get(api + '/count')
		.success(function(data) {
			$scope.dataCount = data;
			$scope.dataPages = Math.ceil($scope.dataCount / $scope.dataLimit);
			$http.get(api + '?$offset=' + ((pageNumber - 1) * $scope.dataLimit) + '&$limit=' + $scope.dataLimit)
			.success(function(data) {
				$scope.data = data;
			});
		});
	};
	$scope.loadPage($scope.dataPage);

	$scope.openNewDialog = function() {
		$scope.actionType = 'new';
		$scope.entity = {};
		toggleEntityModal();
	};

	$scope.openEditDialog = function(entity) {
		$scope.actionType = 'update';
		$scope.entity = entity;
		toggleEntityModal();
	};

	$scope.openDeleteDialog = function(entity) {
		$scope.actionType = 'delete';
		$scope.entity = entity;
		toggleEntityModal();
	};

	$scope.close = function() {
		$scope.loadPage($scope.dataPage);
		toggleEntityModal();
	};

	$scope.create = function() {
		$http.post(api, JSON.stringify($scope.entity))
		.success(function(data) {
			$scope.loadPage($scope.dataPage);
			toggleEntityModal();
			$messageHub.messageEntityModified();
		}).error(function(data) {
			alert(JSON.stringify(data));
		});
			
	};

	$scope.update = function() {
		$http.put(api + '/' + $scope.entity.ID, JSON.stringify($scope.entity))

		.success(function(data) {
			$scope.loadPage($scope.dataPage);
			toggleEntityModal();
			$messageHub.messageEntityModified();
		}).error(function(data) {
			alert(JSON.stringify(data));
		})
	};

	$scope.delete = function() {
		$http.delete(api + '/' + $scope.entity.ID)
		.success(function(data) {
			$scope.loadPage($scope.dataPage);
			toggleEntityModal();
			$messageHub.messageEntityModified();
		}).error(function(data) {
			alert(JSON.stringify(data));
		});
	};

	$scope.seriesOptionValue = function(optionKey) {
		for (var i = 0 ; i < $scope.seriesOptions.length; i ++) {
			if ($scope.seriesOptions[i].ID === optionKey) {
				return $scope.seriesOptions[i].Name;
			}
		}
		return null;
	};
	$scope.issuerOptionValue = function(optionKey) {
		for (var i = 0 ; i < $scope.issuerOptions.length; i ++) {
			if ($scope.issuerOptions[i].ID === optionKey) {
				return $scope.issuerOptions[i].Organization;
			}
		}
		return null;
	};

	$messageHub.onEntityRefresh($scope.loadPage($scope.dataPage));
	$messageHub.onSeriesModified(seriesOptionsLoad);
	$messageHub.onIssuersModified(issuerOptionsLoad);

	function toggleEntityModal() {
		$('#entityModal').modal('toggle');
	}
});