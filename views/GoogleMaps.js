define([
    'lib/underscore',
    'lib/backbone',
    'lib/moment',
    'lib/google-maps',
    'utils/logger'
], function(_, Backbone, moment, google, logger) {

    "use strict";

    var VERBOSE = false;
    var UPDATE_INTERVAL = 1000;

    var GPX_LATITUDE  = 0;
    var GPX_LONGITUDE = 1;
    var GPX_TIMESTAMP = 2;
    var GPX_ELEVATION = 3;

    var log = logger.create('views/GoogleMaps');

    return Backbone.View.extend({

        label: log.label, // this is just sugar for debugging/logging

        sync: function(atPrivateSeconds, ready) {

            log('sync(', atPrivateSeconds, ')');

            this.internalSyncToFrame(this.findFrameBySeconds(atPrivateSeconds));

            _.defer(ready);

            return this;

        },

        internalSyncToFrame: function(atFrame) {

            if (VERBOSE) log('internalSyncToFrame(', atFrame, ')');

            var points = this.model.get('points');
            var baseTimestamp = points[0][GPX_TIMESTAMP];

            this.internalPause();

            if (atFrame === false) {

                this.currentPrivateSeconds = null;
                this.currentFrame = null;

            } else {

                this.currentPrivateSeconds = points[atFrame][GPX_TIMESTAMP] - baseTimestamp;
                this.currentFrame = atFrame;

            }

        },

        /**
         * Looks for the frame at the given (private) seconds and returns its index number.  If the second count falls
         * between frames, the earlier one is returned.  If the optional referenceFrame is provided, starts looking for
         * the match at that frame, instead of the beginning of the track.
         *
         * If the second count is beyond the range of the track in question, returns boolean false.
         *
         * @param atPrivateSeconds
         * @param referenceFrame (optional)
         */
        findFrameBySeconds: function(atPrivateSeconds, referenceFrame) {

            if (atPrivateSeconds < 0)
                return false;

            var points = this.model.get('points');

            if (points.length === 0)
                return false;

            var baseTimestamp = points[0][GPX_TIMESTAMP];
            var startAtFrame = referenceFrame === undefined ? 0 : referenceFrame;

            for (var i = startAtFrame; i < points.length; i++) {

                if (!points[i])
                    return false;

                var currentTimestamp = points[i][GPX_TIMESTAMP] - baseTimestamp;

                if (currentTimestamp === atPrivateSeconds) // exact match to a frame
                    return i;
                else if (currentTimestamp > atPrivateSeconds) // we've gone ahead of the frame already
                    return (i - 1 >= startAtFrame) ? i - 1 : false; // return that, unless frame range excludes the match

            }

            return false;

        },

        /**
         * Looks for the frame that's closest to the given coordinates, returning its index.
         *
         * @see https://developers.google.com/maps/documentation/javascript/reference?hl=en-US#spherical
         *
         * @param fromCoords instanceof google.maps.LatLng
         */
        findFrameByCoordinates: function(fromCoords) {

            var points = this.model.get('points');
            var bestDist = 9000001;
            var bestHit = null;

            points.forEach(function(frame, index) {
                var toCoords = new google.maps.LatLng(frame[0], frame[1]);
                var distance = google.maps.geometry.spherical.computeDistanceBetween(fromCoords, toCoords);
                if (distance < bestDist) {
                    bestDist = distance;
                    bestHit = index;
                }
            });

            if (VERBOSE) log('findFrameByCoordinates() => frame #', bestHit, '@', bestDist, 'meters');

            return bestHit;

        },

        /**
         * Starts advancing the private seconds counter, and updating the map accordingly.
         *
         */
        play: function() {

            log('play()');

            if (this.interval)
                window.clearInterval(this.interval);

            var playbackStartedPrivate = this.currentPrivateSeconds;
            var playbackStartedWall = moment().unix();

            this.interval = window.setInterval(_.bind(updateGoogleMapsLocation, this), UPDATE_INTERVAL);

            function updateGoogleMapsLocation() {

                var playbackElapsed = moment().unix() - playbackStartedWall;

                this.currentPrivateSeconds = playbackStartedPrivate + playbackElapsed;

                var nextFrame = this.findFrameBySeconds(this.currentPrivateSeconds, this.currentFrame);

                if (VERBOSE) log.hash({
                    playbackElapsed: playbackElapsed,
                    currentPrivateSeconds: this.currentPrivateSeconds,
                    currentFrame: this.currentFrame,
                    nextFrame: nextFrame
                });

                if (nextFrame === false)
                    { debugger; } // TODO: Add error handling

                if (nextFrame === this.currentFrame) // haven't ticked to the next frame yet
                    return;

                this.currentFrame = nextFrame;

                var points = this.model.get('points');
                var newPosition = new google.maps.LatLng(points[this.currentFrame][GPX_LATITUDE], points[this.currentFrame][GPX_LONGITUDE]);

                this.map.panTo(newPosition);
                this.marker.setPosition(newPosition);

            }

            return this;

        },

        pause: function() {

            log('pause()');

            this.internalPause();

            return this;

        },

        internalPause: function() {

            if (!this.interval)
                return;

            window.clearInterval(this.interval);

            this.interval = undefined;

        },

        render: function() {

            var that = this;
            var points = this.model.get('points');
            var initCoordinates = new google.maps.LatLng(points[0][GPX_LATITUDE], points[0][GPX_LONGITUDE]);
            var pathCoordinates = [];
            var mapOptions = {
                center: initCoordinates,
                zoom: 16,
                mapTypeId: google.maps.MapTypeId.ROADMAP
            };

            this.map = new google.maps.Map(this.el, mapOptions);
            this.marker = new google.maps.Marker({
                position: initCoordinates,
                map: this.map
            });

            _.each(points, function(point) {
                pathCoordinates.push(new google.maps.LatLng(point[GPX_LATITUDE], point[GPX_LONGITUDE]));
            });

            var trackPath = new google.maps.Polyline({
                path: pathCoordinates,
                strokeColor: '#FF0000',
                strokeOpacity: 0.7,
                strokeWeight: 10
            });

            trackPath.setMap(this.map);

            google.maps.event.addListener(trackPath, 'click', function(event) {

                if (VERBOSE) log('google.maps.event("click",', event.latLng, ')');

                var frame = that.findFrameByCoordinates(event.latLng);

                that.internalSyncToFrame(frame);
                that.orchestrator.sync(that.currentPrivateSeconds, function() {
                    // TODO: Make this dependent on the original play/pause state of this view:
                    that.orchestrator.play();
                    that.play();
                });

            });

            return this;

        }

    });

});