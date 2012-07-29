define([
    'lib/underscore',
    'lib/backbone',
    'lib/swfobject'
], function(_, Backbone, swfobject) {

    "use strict";

    // @see https://developers.google.com/youtube/js_api_reference

    function EMBED_URL(videoID) {
        return 'http://www.youtube.com/v/' + videoID + '?enablejsapi=1&playerapiid=ytplayer&version=3&autoplay=1&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3&theme=light';
    }

    return Backbone.View.extend({

        STATE: {
            UNSTARTED: -1, // When the SWF is first loaded it will broadcast an unstarted (-1) event
            ENDED:      0,
            PLAYING:    1,
            PAUSED:     2,
            BUFFERING:  3,
            CUED:       5 // When the video is cued and ready to play it will broadcast a video cued event (5)
        },

        sync: function(atPrivateSeconds, ready) {

            console.log('YouTube.sync(' + atPrivateSeconds + ')');

            var that = this;

            if (!this.playerStarted) {
                console.log('Queuing YouTubeView sync()');
                this.playerStartedCallback = function() {
                    that.sync(atPrivateSeconds, ready);
                };
                return this;
            }

            this.ytp.pauseVideo();
            this.ytp.seekTo(atPrivateSeconds, true);
            console.log('seek command given');

            return this;

        },

        render: function() {

            var that = this;
            var firstPlay = true;

            this.playerStarted = false;

            window.onYouTubePlayerReady = function(playerID) { // TODO: Use playerID to allow many instances to coexist

                console.log('[YouTube]', 'onYouTubePlayerReady');

                that.ytp = that.$('#myytplayer')[0];
                that.ytp.addEventListener('onStateChange', 'onYTPStateChange');
                that.ytp.addEventListener('onError', 'onYTPError');

            };

            window.onYTPStateChange = function(newState) {

                console.log('[YouTube]', newState);

                if (newState === that.STATE.PLAYING && firstPlay) {

                    firstPlay = false;
                    that.playerStarted = true;
                    that.ytp.pauseVideo();

                    if (that.playerStartedCallback)
                        _.defer(that.playerStartedCallback);

                }

            };

            window.onYTPError = function(newState) {

                console.log('[YouTube ERROR]', newState);

            };

            var params = { allowScriptAccess: 'always' };
            var atts = { id: 'myytplayer' };
            var embedURL = EMBED_URL(this.model.get('videoID'));
            var width = '425';
            var height = '356';
            var version = '8';

            this.$el.html('<div id="foobarID" />');

            swfobject.embedSWF(embedURL, 'foobarID', width, height, version, null, null, params, atts);

            return this;

        },

        play: function() {

            this.ytp.playVideo();

        },

        pause: function() {

            this.ytp.pauseVideo();

        }

    });

});