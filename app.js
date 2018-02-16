/*global angular */
"use strict";

/**
 * The main app module
 * @name testApp
 * @type {angular.Module}
 */

var testApp = angular.module("testApp", ["schemaForm", "mgcrea.ngStrap", "mgcrea.ngStrap.modal",
    "pascalprecht.translate", "ui.select", "mgcrea.ngStrap.select","agGrid"

]);

testApp.controller("appController", ["$scope", "$http", function ($scope, $http) {

    $scope.callBackSD = function (options, search) {
        if (search) {
            console.log("Here the select lis could be narrowed using the search value: " + search.toString());
            return [
                {value: "value1", name: "text1"},
                {value: "value2", name: "text2"},
                {value: "value3", name: "Select dynamic!"}
            ].filter(function (item) {
                    return (item.name.search(search) > -1)
                });
        }
        else {
            return [
                {value: "value1", name: "text1"},
                {value: "value2", name: "text2"},
                {value: "value3", name: "Select dynamic!"}
            ];

        }
        // Note: Options is a reference to the original instance, if you change a value,
        // that change will persist when you use this form instance again.
    };
    $scope.callBackUI = function (options) {
        return [
            {"value": "value1", "name": "text1", "category": "value1"},
            {"value": "value2", "name": "text2", "category": "value1"},
            {"value": "value3", "name": "So this is the next item", "category": "value2"},
            {"value": "value4", "name": "The last item", "category": "value1"}
        ];
        // Note: Options is a reference to the original instance, if you change a value,
        // that change will persist when you use this form instance again.
    };
    $scope.callBackMSD = function (options) {
        return [
            {value: "value1", name: "text1"},
            {value: "value2", name: "text2"},
            {value: "value3", name: "Multiple select dynamic!"}
        ];
        // Note: Options is a reference to the original instance, if you change a value,
        // that change will persist when you use this form instance again.
    };

    $scope.callBackMSDAsync = function (options) {
        // Note that we got the url from the options. Not necessary, but then the same callback function can be used
        // by different selects with different parameters.

        // The asynchronous function must always return a httpPromise
        return $http.get(options.urlOrWhateverOptionIWant);
    };

    $scope.stringOptionsCallback = function (options) {
        // Here you can manipulate the form options used in a http_post or http_get
        // For example, you can use variables to build the URL or set the parameters, here we just set the url.
        options.httpPost.url = "test/testdata.json";
        // Note: This is a copy of the form options, edits here will not persist but are only used in this request.
        return options;
    };

    $scope.onPopulationError = function (form, data, status) {
        console.log("An error occurred when the " + form.key + "-fields drop down was to be populated! \n")
        console.log("The data: " + data.data.toString());
        console.log("The status: " + status);
    };

    $scope.getChargers = function(){
        return [{"id":373,"name":"ConnectorLockFailure"},{"id":376,"name":"HighTemperature"},{"id":379,"name":"Mode3Error"},{"id":382,"name":"NoError"},{"id":385,"name":"PowerMeterFailure"},{"id":388,"name":"PowerSwitchFailure"},{"id":391,"name":"ReaderFailure"},{"id":394,"name":"GroundFailure"},{"id":397,"name":"OverCurrentFailure"},{"id":400,"name":"ResetFailure"},{"id":403,"name":"UnderVoltage"},{"id":406,"name":"WeakSignal"},{"id":409,"name":"ServiceDoorOpened"},{"id":412,"name":"Tilt"},{"id":415,"name":"TiltSensorFailure"},{"id":418,"name":"Shock"},{"id":421,"name":"ShockSensorFailure"},{"id":424,"name":"ServiceDoorFailure"},{"id":427,"name":"LowDiskSpace"},{"id":428,"name":"OtherError"},{"id":429,"name":"LocalListConflict"},{"id":432,"name":"InternalError"},{"id":435,"name":"OverVoltage"},{"id":438,"name":"EVCommunicationError"}];

    }

    $scope.getChargersColumnDefs = function() {
        return [{
            headerValueGetter: function(params) {
                return "";
            },
            width: 30,
            checkboxSelection: function(params) {
                return true;
            }
        }, {
            headerValueGetter: function(params) {
                return "id"
            },
            field: "id"
        }, {
            headerValueGetter: function(params) {
                return "stationName"
            },
            sort: "asc",
            field: "stationName"
        }, {
            headerValueGetter: function(params) {
                return "name";
            },
            field: "name"
        }];
    };

    $scope.schema = {
        type: "object",
        title: "Select",
        properties: {
            multiselectaggrid: {
                title: "Multi select strap-select",
                type: "array",
                items: {
                    "type": "object",
                    "properties": {
                        "id": {
                            "type": "number"
                        },
                        "name": {
                            "type": "string"
                        }
                    }
                },
                maxItems: 2,
                description: "Multiple items are allowed, select three for maxItems validation error. Each item belongs to a \"category\", so the list is filtered depending on what you have selected in the \"Single select strap-select\" above."
            }

        },
        required: ["select", "multiselect"]
    };

    $scope.form = [
        {
            "key": "aggridmultiselect",
            "type": "aggridselect",
            "placeholder": "My items feel unselected. Or you selected text3 in the selector above me.",
            "options": {
                "multiple": "true",
                "filterTriggers": ["model.aggridmultiselect"],
                "filter": "item.category.indexOf(model.select) > -1",
                "callback": "getChargers",
                "columnDefs" : "getChargersColumnDefs",
                "onSelect" : "onChargerSelected"
            },
            "validationMessage": "Hey, you can only select three items or you'll see this!"
        }
        ,
        {
            type: "submit",
            style: "btn-info",
            title: "OK"
        }

    ];
    $scope.model = {};
    $scope.model.aggridmultiselect = [{"id":429,"name":"LocalListConflict"},{"id":42,"name":"qsd"}];

    $scope.submitted = function (form) {
        $scope.$broadcast("schemaFormValidate");
        console.log($scope.model);
    };

    $scope.addOne = function (form) {
      $scope.model.aggridmultiselect.push({"id":409,"name":"ServiceDoorOpened"});

    };
}])
;

