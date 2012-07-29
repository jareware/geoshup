define([
    'models/tracks/Base'
], function(TrackBase) {

    "use strict";

    return TrackBase.extend({

        defaults: {
            offset: 0,
            videoID: null
        },

        parseVideoID: function(youTubeVideoURL) {

            var regex = /http:\/\/www.youtube.com\/watch\?v=(\w+).*/;
            var match = regex.exec(youTubeVideoURL);

            this.set({ videoID: match ? match[1] : null });

        }

    });

});