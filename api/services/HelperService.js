/**
 * /api/services/HelperService.js
 *
 * Generic helper service, which contains a punch of methods that can be used in application.
 */
"use strict";

/**
 * Sorter function which can be used to sort given array of objects by multiple object
 * attributes. Also note that sort order can be specified. Example of usage:
 *
 *  yourArray.sort(HelperService.dynamicSortMultiple(attribute1, attribute2, attribute3));
 *
 * Where attribute can be defined as an sub attribute as example below:
 *
 *  yourArray.sort(HelperService.dynamicSortMultiple(attribute1, object.attribute, attribute2));
 *
 * Also sort order can be specified for attributes like:
 *
 *  yourArray.sort(HelperService.dynamicSortMultiple(!attribute1, attribute2, !attribute3));
 *
 * @returns {Function}
 */
exports.dynamicSortMultiple = function() {
    /**
     * save the arguments object as it will be overwritten note that arguments object
     * is an array-like object consisting of the names of the properties to sort by
     */
    var props = arguments;

    return function(obj1, obj2) {
        var i = 0, result = 0, numberOfProperties = props.length;

        // try getting a different result from 0 (equal) as long as we have extra properties to compare
        while(result === 0 && i < numberOfProperties) {
            result = HelperService.dynamicSort(props[i])(obj1, obj2);
            i++;
        }

        return result;
    }
};

/**
 * Actual dynamic sort function for specified property. Note that property can be
 * assigned to sub-object if needed also sort order can be given within property.
 *
 * Note that this function is used within "dynamicSortMultiple" function.
 *
 * @param   {String}    property
 *
 * @returns {Function}
 */
exports.dynamicSort = function(property) {
    return function(obj1, obj2) {
        var reverse = (property.indexOf("!") === 0);
        var comparisonValue1, comparisonValue2 = "";

        if (reverse) {
            property = property.substr(1);
        }

        if (property.indexOf(".") !== -1) {
            var bits = property.split(".");

            comparisonValue1 = obj1[bits[0]][bits[1]];
            comparisonValue2 = obj2[bits[0]][bits[1]];
        } else {
            comparisonValue1 = obj1[property];
            comparisonValue2 = obj2[property];
        }

        return reverse
            ? (comparisonValue1 < comparisonValue2 ? 1 : comparisonValue1 > comparisonValue2 ? -1 : 0)
            : (comparisonValue1 > comparisonValue2 ? 1 : comparisonValue1 < comparisonValue2 ? -1 : 0);
    }
};
