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

        stateChangeListeners: [],

        sync: function(atPrivateSeconds, ready) {

            var that = this;

            if (this.playerStarted) {

                this.ytp.pauseVideo();
                this.ytp.seekTo(atPrivateSeconds, true);

                _.defer(ready); // TODO: This should in fact be that.onNextStateChange(that.STATE.CUED) but the CUED event is not firing for some reason :S

            } else {

                that.onNextStateChange(that.STATE.PLAYING, function() {
                    _.defer(function() { // note: the _.defer() is essential so that.playerStarted = true
                        that.sync(atPrivateSeconds, ready);
                    });
                });

            }

            return this;

        },

        render: function() {

            var that = this;

            this.playerStarted = false;

            window.onYouTubePlayerReady = function(playerID) { // TODO: Use playerID to allow many instances to coexist

                console.log('[YouTube]', 'onYouTubePlayerReady');

                that.ytp = that.$('#myytplayer')[0];
                that.ytp.addEventListener('onStateChange', 'onYTPStateChange');
                that.ytp.addEventListener('onError', 'onYTPError');

                that.onNextStateChange(that.STATE.PLAYING, function() {
                    that.playerStarted = true; // after autostart has actually started playing the video...
                    that.ytp.pauseVideo(); // ...pause it, and wait for further commands
                });

            };

            window.onYTPStateChange = function(newState) {

                console.log('[YouTube]', 'onYTPStateChange(' + newState + ')');

                function byMatchingListeners(listener) {
                    return listener[0] === newState;
                }

                function triggerListener(listener) {
                    listener[1]();
                }

                var matching  = _.filter(that.stateChangeListeners, byMatchingListeners);
                var remaining = _.reject(that.stateChangeListeners, byMatchingListeners);

                _.each(matching, triggerListener);
                that.stateChangeListeners = remaining;

            };

            window.onYTPError = function(newState) {

                console.log('[YouTube]', 'onYTPError(' + newState + ')');

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

        onNextStateChange: function(matchState, callback) {

            this.stateChangeListeners.push([ matchState, callback ]);

        },

        play: function() {

            this.ytp.playVideo();

        },

        pause: function() {

            this.ytp.pauseVideo();

        }

    });

});