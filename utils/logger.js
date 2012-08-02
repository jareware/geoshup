define(function() {

    "use strict";

    var topLabelLength = 0;

    return {

        getTopLabelLength: function() {

            return topLabelLength;

        },

        setTopLabelLength: function(newValue) {

            topLabelLength = newValue;

        },

        create: function(label) {

            if (label.length > topLabelLength)
                topLabelLength = label.length;

            var logger = function() {

                if (!window.console || !window.console.log)
                    return;

                var tagPadding = new Array(topLabelLength - label.length + 1).join(' ');
                var argsToLog  = Array.prototype.slice.call(arguments);

                window.console.log.apply(window.console, [ tagPadding + logger.label ].concat(argsToLog));

            };

            logger.label = '[' + label + ']';

            return logger;

        }
    };

});