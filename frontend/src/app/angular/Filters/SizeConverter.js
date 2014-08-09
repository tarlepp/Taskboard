/**
 * Simple filter to convert size value (number) to human readable format. Usage example:
 *
 *  <span>{{sizeValueInBytes|sizeConverter:2}}</span>
 *
 * And that will give you something like:
 *
 *  <span>252 bytes</span>
 *  <span>1.06 KB</span>
 *  <span>2.13 MB</span>
 *  ...
 *
 * Second filter parameter is optionally, if not given it defaults to 1.
 */
(function() {
    'use strict';

    angular.module('Taskboard.filters')
        .filter('sizeConverter',
            [
                '_',
                function(_) {
                    return function(size, precision) {
                        precision = precision || 1;

                        if (size === 0 || _.isNull(size)) {
                            return '';
                        }

                        else if (!isNaN(size)) {
                            var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
                            var positionText = 0;

                            if (size < 1024) {
                                return Number(size) + ' ' + sizes[positionText];
                            }

                            while (size >= 1024) {
                                positionText++;

                                size = size / 1024;
                            }

                            var power = Math.pow (10, precision);
                            var poweredValue = Math.ceil (size * power);

                            size = poweredValue / power;

                            return size + ' ' + sizes[positionText];
                        } else {
                            console.log('Error: Not a number.');

                            return '';
                        }
                    };
                }
            ]
        );
}());
