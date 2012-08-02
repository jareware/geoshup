define([
    'lib/underscore',
    'lib/moment'
], function(_, moment) {

    "use strict";

    var ENABLED = true;
    var TIMESTAMP = true;
    var FORMAT = '@ss.SSS'; // 'HH:mm:ss:SSS';

    var topLabelLength = 0;

    return {

        getTopLabelLength: function() {

            return topLabelLength;

        },

        setTopLabelLength: function(newValue) {

            topLabelLength = newValue;

        },

        create: function(label) {

            if (!ENABLED)
                return function() {};

            if (label.length > topLabelLength)
                topLabelLength = label.length;

            var logger = function() {

                if (!window.console || !window.console.log)
                    return;

                var timestamp = TIMESTAMP ? moment().format(FORMAT) + ' ' : '';
                var tagPadding = new Array(topLabelLength - label.length + 1).join(' ');
                var argsToLog  = Array.prototype.slice.call(arguments);

                window.console.log.apply(window.console, [ timestamp + tagPadding + logger.label ].concat(argsToLog));

            };

            logger.label = '[' + label + ']';

            logger.hash = function(hash) {

                var pieces = [];

                _.each(hash, function(value, key) {
                    pieces.push(key + ':');
                    pieces.push(value);
                    pieces.push(', ');
                });

                pieces.pop();

                logger.apply(logger, pieces);

            };

            return logger;

        }
    };

});