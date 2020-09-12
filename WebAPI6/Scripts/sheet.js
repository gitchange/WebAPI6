angular.module('app', ['ui.grid', 'blockUI'])

.config(['$locationProvider', function($locationProvider) {
		$locationProvider.html5Mode({ enabled: true, requireBase: false });
}])

.controller('MainCtrl', ['$http', '$location', function ($http, $location) {
	var queryString = $location.search();
	
	var vm = this;
  
	vm.gridOptions = {};
	
	vm.granted = true;
	
	vm.reset = function () {
		vm.gridOptions.data = [];
		vm.gridOptions.columnDefs = [];
		delete vm.errorMessage;
	};
  
	vm.save = function () {
		if (!vm.gridOptions.data || vm.gridOptions.data.length === 0) {
			alert("This sheet content is empty.");
			return;
		}
		console.log(JSON.stringify({
				excel: vm.gridOptions.data
			}));
		$http({
			method: 'POST',
			url: '/api/Richards', 
			withCredentials: true,
			data: {
				excel: vm.gridOptions.data
			}
		}).
		then(
			function(resp){ 
				if (resp.data.error_message) {
					vm.errorMessage = resp.data.error_message;
				} else {
					delete vm.errorMessage;
					angular.element("#successConfirm").modal();
				}				
			}, 
			function(resp){ 
				alert("error occurred"); 
			}
		);
	};
	
}])

.directive('fileread', [function () {
	return {
		scope: {
			opts: '='
		},
		link: function ($scope, $elm, $attrs) {
			$elm.on('change', function (changeEvent) {
				var reader = new FileReader();
		
				reader.onload = function (evt) {
					$scope.$apply(function () {
						var data = evt.target.result;
						var workbook = XLSX.read(data, {type: 'binary'});
						var headerNames = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], { header: 1 })[0];
						var data = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
						
						// processing sheet header
						var dateHeaders = [];
						$scope.opts.columnDefs = [];
						
						headerNames.forEach(function (h) {
							if (h.match(/^\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2}$/)) {
								dateHeaders.push(h);
							} else {
								$scope.opts.columnDefs.push({ field: h });
							}
						});
						
						// processing sheet data
						if (dateHeaders.length !== 0) {
							$scope.opts.columnDefs.push({ field: 'CLNDR_DT' });
							$scope.opts.columnDefs.push({ field: 'QTY' });
							
							var newDataCollection = [];
							
							data.forEach(function(d) {
								var same = angular.copy(d);
								dateHeaders.forEach(function(date) {
									delete same[date];
								});
								dateHeaders.forEach(function(date) {
									var newData = angular.extend({}, same);
									newData['CLNDR_DT'] = date;
									newData['QTY'] = (d[date] || '');
									newDataCollection.push(newData);
								});
							});
							
							$scope.opts.data = newDataCollection;
						} else {
							$scope.opts.data = data;
						}
						
						// check if some attributes lost
						$scope.opts.data.forEach(function (d) {
							$scope.opts.columnDefs.forEach(function (h) {
								if (!d.hasOwnProperty(h.field)) {
									d[h.field] = '';
								}
							});
						});
						
						$elm.val(null);
					});
				};
				
				reader.readAsBinaryString(changeEvent.target.files[0]);
			});
		}
	}
}]);