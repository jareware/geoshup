define([
    'lib/backbone',
    'lib/swfobject'
], function(Backbone, swfobject) {

    "use strict";

    function getEmbedURL(videoID) {
        return 'http://www.youtube.com/v/' + videoID + '?enablejsapi=1&playerapiid=ytplayer&version=3&autoplay=1&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3&theme=light';
    }

    return Backbone.View.extend({

        sync: function(atPrivateSeconds) {

            this.currentPrivateSeconds = atPrivateSeconds;

            return this;

        },

        render: function() {

            var params = { allowScriptAccess: 'always' };
            var atts = { id: 'myytplayer' };
            var embedURL = getEmbedURL(this.model.get('videoID'));
            var width = '425';
            var height = '356';
            var version = '8';

            swfobject.embedSWF(embedURL, this.el.id, width, height, version, null, null, params, atts);

            return this;

        }

    });

});