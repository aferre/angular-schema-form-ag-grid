angular.module("schemaForm").run(["$templateCache", function($templateCache) {$templateCache.put("directives/decorators/bootstrap/aggrid/aggridselect.html","<div ng-controller=\"agGridSelectController\" class=\"form-group {{form.htmlClass}}\"\n     ng-class=\"{\'has-error\': hasError(), \'has-success\': hasSuccess()}\">\n    <label class=\"control-label {{form.labelHtmlClass}}\" ng-show=\"showTitle()\">{{form.title}}</label>\n\n <!--   <div class=\"form-group {{form.fieldHtmlClass}}\" ng-init=\"populateList(form)\">-->\n    <div class=\"form-group {{form.fieldHtmlClass}}\">\n        <input  ag-grid-select type=\"hidden\" class=\"btn btn-default\" sf-changed=\"form\" schema-validate=\"form\" ng-model=\"$$value$$\"\n                \n               >\n        </input>\n\n        <div>\n       <!--       <span ng-show=\"$$value$$\" class=\"bg-info\">value: {{ $$value$$ }}</span> -->\n       <!--       <span ng-show=\"!$$value$$\" class=\"bg-danger\">value</span>-->\n            <button class=\"btn btn-default\" ng-click=\"selectAll(true)\"> {{ \'Select all\' | translate }}</button>\n            <button class=\"btn btn-default\" ng-click=\"selectAll(false)\"> {{ \'Deselect all\' | translate }}</button>\n        </div>\n        <div style=\"height: 200px;\">\n            <div ag-grid=\"gridOptions\" class=\"ag-fresh\" style=\"height: 100%;\"></div>\n        </div>\n\n        <span class=\"help-block\">{{ (hasError() && errorMessage(schemaError())) || form.description}}</span>\n    </div>\n</div>\n");}]);
angular.module('schemaForm').config(
    ['schemaFormProvider', 'schemaFormDecoratorsProvider', 'sfPathProvider',
        function (schemaFormProvider, schemaFormDecoratorsProvider, sfPathProvider) {

            var select = function (name, schema, options) {
                if ((schema.type === 'string') && ("enum" in schema)) {
                    var f = schemaFormProvider.stdFormObj(name, schema, options);
                    f.key = options.path;
                    f.type = 'strapselect';
                    options.lookup[sfPathProvider.stringify(options.path)] = f;
                    return f;
                }
            };

            schemaFormProvider.defaults.string.unshift(select);

            
             schemaFormDecoratorsProvider.addMapping('bootstrapDecorator', 'aggridselect',
                'directives/decorators/bootstrap/aggrid/aggridselect.html');

        }])
.directive('agGridSelect', function() {
  return {
    // The directive needs the ng-model to be set, look at the <div>
    require: ['ngModel'],
    restrict: 'A',
    scope: {},
    // Define a controller, use the function from above, inject the scope
    controller : ['$scope', function($scope)  {
        $scope.$parent.$watch('agGridData_model',function(){
          if($scope.$parent.agGridData_model != undefined) {
            $scope.$parent.insideModel = $scope.$parent.agGridData_model;
            $scope.$parent.ngModel.$setViewValue($scope.$parent.agGridData_model);
          }
        });
      }],
    // Use the link function to initiate the ngModel in the controller scope
    link: function(scope, iElement, iAttrs, ngModelCtrl) {
        scope.ngModel = ngModelCtrl;
    }
  };
});

angular.module('schemaForm').controller('agGridSelectController', ['$scope', '$http', '$timeout', function ($scope, $http, $timeout) {

    if (!$scope.form.options) {
        $scope.form.options = {};
    }

    $scope.agGridData_model = {};


    var tt = "alerts.0.chargers";
    var keyAr = $scope.form.key;
    
        var valNeeded = $scope.$parent.$parent.$parent.model;
        for (var i in keyAr){
            valNeeded = valNeeded[keyAr[i]];
        }

    if (valNeeded ){
        $scope.agGridData_model = valNeeded ;
    }

    console.log("Setting options." + $scope.form.options.toString());
    $scope.form.options.scope = $scope;

    $scope.onGridReadyCB = function(){
        console.log("Grid ready for init");
        $scope.populateList($scope.form);
        var model = $scope.ngModel;
        var parentScope = $scope.$parent
        console.log(model);
    }

    $scope.getCallback = function (callback) {
        if (typeof(callback) == "string") {
            var _result = $scope.$parent.evalExpr(callback);
            if (typeof(_result) == "function") {
                return _result;
            }
            else {
                throw("A callback string must match name of a function in the parent scope")
            }

        }
        else if (typeof(callback) == "function") {
            return callback;
        }
        else {
            throw("A callback must either be a string matching the name of a function in the parent scope or a " +
            "direct function reference")

        }
    };

    var columnDefs = [];
    if ($scope.form.options.columnDefs)
        columnDefs = $scope.getCallback($scope.form.options.columnDefs)();

    console.log("initing gridOptions");
    $scope.gridOptions = {
            columnDefs: columnDefs,
            angularCompileRows: true,
            enableFilter: true,
            enableSorting: true,
            enableColResize: true,
            rowHeight: 30,
            rowSelection: 'multiple',
            multiSelect: true,
            onReady: function(params) {
                console.log('ag grid on ready ' + params);
                $scope.onGridReadyCB();
            },
            onGridReady: function() {
               $scope.onGridReadyCB();
            },
            onSelectionChanged: function() {
                var selectItems = $scope.gridOptions.api.getSelectedRows();
//                $scope.insideModel = $scope.selectItems;
                $scope.selectedItems = selectItems;
                var parentScope = $scope.$parent;
                $scope.getCallback
                if ($scope.form.options.postSelection){
                    selectItems = $scope.getCallback($scope.form.options.postSelection)(selectItems);
                }
                $scope.agGridData_model = selectItems;
                var model = $scope.ngModel; 
               // model.$setViewValue(selectItems);
                
            }
        };

    $scope.triggerinitialData = function () {
        console.log("listener triggered");
        // Ugly workaround to trigger initialData expression re-evaluation so that the selectFilter it reapplied.
        $scope.form.initialData.push({"value": "345890u340598u3405u9", "name": "34095u3p4ouij"})
        $timeout(function () { $scope.form.initialData.pop() })

    };

    $scope.initFiltering = function (localModel) {
        if ($scope.form.options.filterTriggers) {
            $scope.form.options.filterTriggers.forEach(function (trigger) {
                $scope.$parent.$watch(trigger, $scope.triggerinitialData)

            });
        }
        // This is set here, as the model value may become unitialized and typeless if validation fails.
        $scope.localModelType =  Object.prototype.toString.call(localModel);
        $scope.filteringInitialized = true;
    };


    $scope.finalizeList = function (form, data, newOptions) {
        // Remap the data


        if (newOptions && "map" in newOptions && newOptions .map) {
            var current_row = null,
            final = newOptions.map.nameProperty.length - 1,
            separator = newOptions.map.separatorValue ? newOptions.map.separatorValue : ' - ';
                data.forEach(function (current_row) {
                current_row["value"] = current_row[newOptions .map.valueProperty];
                //check if the value passed is a string or not
                if(typeof newOptions.map.nameProperty != 'string'){
                    //loop through the object/array
                    var newName = "";
                    for (var i in newOptions.map.nameProperty) {
                        newName += current_row[newOptions .map.nameProperty[i]];
                        if(i != final){newName += separator};
                    }
                    current_row["name"] = newName; //init the 'name' property
                }
                else{
                    //if it is a string
                    current_row["name"] = current_row[newOptions .map.nameProperty];
                }
                form.initialData.push(current_row);
            });

        }
        else {

            data.forEach(function (item) {
                    if ("text" in item) {
                        item.name = item.text
                    }
                }
            );
            form.initialData = data;
            $scope.gridOptions.api.setRowData(data);
        }

        if ($scope.agGridData_model) {
            
            $scope.gridOptions.api.forEachNode(function(rowNode, index) {
             //   console.log($scope.agGridData_model);
                for (var i in $scope.agGridData_model) {
                    var val = $scope.agGridData_model[i];
                    if (val !== undefined) {
                        console.log('Comparing row ' + rowNode + ' to ' + JSON.stringify(val));
                        if (rowNode.data.id == val.id) {
                            $scope.gridOptions.api.selectNode(rowNode);
                        }
                    }
                }
            });
        }

        // The ui-selects needs to be reinitialized (UI select sets the internalModel and externalModel.
        if ($scope.internalModel) {
            console.log("Call uiMultiSelectInitInternalModel");
            $scope.uiMultiSelectInitInternalModel($scope.externalModel);
        }
    };

    $scope.clone = function (obj) {
        // Clone an object (except references to this scope)
        if (null == obj || "object" != typeof(obj)) return obj;

        var copy = obj.constructor();
        for (var attr in obj) {
            // Do not clone if it is this scope
            if (obj[attr] != $scope) {
                if (obj.hasOwnProperty(attr)) copy[attr] = $scope.clone(obj[attr]);
            }
        }
        return copy;
    };

    $scope.selectAll = function(select) {
        if (select) $scope.gridOptions.api.selectAll();
        else $scope.gridOptions.api.deselectAll();
    }

    $scope.getOptions = function (options, search) {
        // If defined, let the a callback function manipulate the options
        if (options.httpPost && options.httpPost.optionsCallback) {
            newOptionInstance = $scope.clone(options);
            return $scope.getCallback(options.httpPost.optionsCallback)(newOptionInstance, search);
        }
        if (options.httpGet && options.httpGet.optionsCallback) {
            newOptionInstance = $scope.clone(options);
            return $scope.getCallback(options.httpGet.optionsCallback)(newOptionInstance, search);
        }
        else {
            return options;
        }
    };

    $scope.test = function (form) {
        form.initialData.pop();
    };

    $scope.populateList = function (form, search) {

        if (form.schema && "enum" in form.schema) {
            form.initialData = [];
            form.schema.enum.forEach(function (item) {
                    form.initialData.push({"value": item, "name": item})
                }
            );

        }
        else if (!form.options) {

            console.log("dynamicSelectController.populateinitialData(key:" + form.key + ") : No options set, needed for dynamic selects");
        }
        else if (form.options.callback) {
            form.initialData = $scope.getCallback(form.options.callback)(form.options, search);
            $scope.finalizeList(form,form.initialData, form.options);
            console.log("callback items: ", form.initialData);
        }
        else if (form.options.asyncCallback) {
            return $scope.getCallback(form.options.asyncCallback)(form.options, search).then(
                function (_data) {
                    // In order to work with both $http and generic promises
                    _data = _data.data || _data;
                    $scope.finalizeList(form, _data, form.options);
                    console.log('asyncCallback items', form.initialData);
                },
                function (data, status) {
                    if (form.options.onPopulationError) {
                        $scope.getCallback(form.options.onPopulationError)(form, data, status);
                    }
                    else {
                        alert("Loading select items failed(Options: '" + String(form.options) +
                        "\nError: " + status);
                    }
                });
        }
        else if (form.options.httpPost) {
            var finalOptions = $scope.getOptions(form.options, search);

            return $http.post(finalOptions.httpPost.url, finalOptions.httpPost.parameter).then(
                function (_data) {

                    $scope.finalizeList(form, _data.data, finalOptions);
                    console.log('httpPost items', form.initialData);
                },
                function (data, status) {
                    if (form.options.onPopulationError) {
                        $scope.getCallback(form.options.onPopulationError)(form, data, status);
                    }
                    else {
                        alert("Loading select items failed (URL: '" + String(finalOptions.httpPost.url) +
                        "' Parameter: " + String(finalOptions.httpPost.parameter) + "\nError: " + status);
                    }
                });
        }
        else if (form.options.httpGet) {
            var finalOptions = $scope.getOptions(form.options, search);
            return $http.get(finalOptions.httpGet.url, finalOptions.httpGet.parameter).then(
                function (data) {
                    $scope.finalizeList(form, data.data, finalOptions);
                    console.log('httpGet items', form.initialData);
                },
                function (data, status) {
                    if (form.options.onPopulationError) {
                        $scope.getCallback(form.options.onPopulationError)(form, data, status);
                    }
                    else {
                        alert("Loading select items failed (URL: '" + String(finalOptions.httpGet.url) +
                        "\nError: " + status);
                    }
                });
        }
        else {
            if ($scope.insideModel && $scope.agGridData_model.selected === undefined) {
                $scope.agGridData_model.selected = $scope.find_in_initialData($scope.insideModel);
            }
        }
    };
    $scope.find_in_initialData = function (value) {
        for (i = 0; i < $scope.form.initialData.length; i++) {
            if ($scope.form.initialData[i].value == value) {
                return {"item": $scope.form.initialData[i], "index": i};
            }
        }

    };


}]);