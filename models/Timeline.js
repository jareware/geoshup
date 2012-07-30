define([
    'lib/backbone'
], function(Backbone) {

    "use strict";

    return Backbone.Collection.extend({

        globalToPrivate: function(seconds, povTrack) {

            return seconds - povTrack.get('offset');

        },

        privateToGlobal: function(seconds, povTrack) {

            return seconds + povTrack.get('offset');

        }

    });

});