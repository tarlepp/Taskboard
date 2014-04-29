//
///**
// * @ngdoc module
// * @name ngsails.resource
// * @description
// *
// * # sailsResource
// *
// * The `ngsails.resource` module brings the Sails / Waterline model API to Angular.
// *
// *
// * <div doc-module-components="sailsResource"></div>
// *
// *
// */


SailsResourceProvider.$inject = ['$injector'];
function SailsResourceProvider($injector) {




    function resourceFactory($injector){



        var Model = $injector.get('$sailsModel');



        return function(model,controller,options){

            var Resource = function(data){

               this.data = data;
                "use strict";
            }


            Resource.inherits(Model);

            Resource.identity = model;

           // var resource = new SailsResource(model);

            //Model.inherits(resource);



            return Resource
        }

    }


    this.config = {
        models : {},
        controllers : {}
    }

    this.$get = ['$injector',resourceFactory];


};

angular.module('sails.resource',[])
    .provider('$sailsModel',SailsModelProvider)
    .provider('$sailsCache',SailsObjectCacheProvider)
    .provider('$sailsResource',SailsResourceProvider);





function SailsObjectCache($filter) {

    // function cache(instance, primaryKey)
    //
    // @param {instance} - Model instance to store in the model's cache
    //
    // If the instance has an ID, add it to the cache of its constructor. E.g.:
    //    sensor => {id: 1, name: "Johnny's Window"}
    //    sensor.constructor = Sensor
    //
    //    expect(Sensor.cached[1]).toEqual(sensor);
    Object.defineProperty(this, 'cache', {
        enumerable: false,
        value: function(instance, primaryKey) {
            if (instance && instance[primaryKey] !== undefined) {
                instance.constructor.cached[instance[primaryKey]] = instance;
            }
        }
    });

    // function isEmpty()
    //
    // True/false cache is empty
    Object.defineProperty(this, 'isEmpty', {
        enumerable: false,
        value: function() {
            return !!(!Object.keys(this).length);
        }
    });

    // function where(terms)
    //
    // @param {terms} - Search terms used to find instances in the cache
    //
    // Returns all cached instances that match the given terms
    Object.defineProperty(this, 'where', {
        enumerable: false,
        value: function(terms) {
            if (Object.keys(terms).length == 0) terms = undefined;
            return _.where(this, terms, this);
        }
    });
};



function SailsObjectCacheProvider(){
    "use strict";
    this.$get = ['$filter',SailsObjectCache]
}

"use strict";

//basic inheritance functionality....
Function.prototype.inherits = function (base) {
    var _constructor;
    _constructor = this;
    return _constructor = base.apply(_constructor);
};






function SailsModel() {

    var Model = this;


    var Record = Model.prototype;

    Record.save = function(){
        console.log('saving!')
    }

    var defaultAttrs = {
        id : { primaryKey : true}
    }



    Model.new = function(data){
        if(!data) data = {};

        return new Model(data);
    }



    Model.find = function(){
        console.log('finding!' + this.identity);
    };

    var MODEL_INSTANCE_ACTIONS = {
        'save' : {method : 'PUT'},
        'destroy' : {method : 'DELETE'}
    };



    var COLLECTION_ACTIONS = {
        'find': { method:'get'},
        'findOne': { method:'get'},
        'create' : { method : 'post'},
        'update' : { method : 'put'},
        'destroy' : { method : 'delete'}
    };

//    var _collection = this;
//
//    var _controller = angular.extend(COLLECTION_ACTIONS,controller || {});
//
//    var _properties = {}

//    _properties.identity = model.identity || modelName.toLowerCase();
//    _properties.name = modelName;
//    _properties.basePath = '/' + model.identity;

    Object.defineProperty(Model, '_attributes', {
        enumerable: false,
        writable: false,
        value: defaultAttrs
    });

//    Object.defineProperty(Model, '_connection', {
//        enumerable: false,
//        writable: false,
//        value: connection
//    });
//
//    Object.defineProperty(Model, '_model', {
//        enumerable: false,
//        writable: false,
//        value: model
//    });

//    forEach(_controller,function(action,key){
//
//
//        _collection[key] = function(){
//
//            return _collection._connection[action.method](_collection._properties.basePath,arguments);
//
//
//
//        }
//
//    })

    return Model;
};



function SailsModelProvider(){



    this.$get = ['$injector',function($injector){


            return SailsModel;


    }];

}