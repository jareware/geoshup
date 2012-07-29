define([
    'lib/underscore',
    'lib/backbone',
    'lib/moment',
    'lib/google-maps'
], function(_, Backbone, moment, google) {

    "use strict";

    var UPDATE_INTERVAL = 1000;

    var GPX_LATITUDE  = 0;
    var GPX_LONGITUDE = 1;
    var GPX_TIMESTAMP = 2;
    var GPX_ELEVATION = 3;

    return Backbone.View.extend({

        initialize: function() {

            var points = this.model.get('points');

            this.frameCursor = 1;

        },

        sync: function(at) {

            // TODO

            return this;

        },

        play: function() {

            if (this.interval)
                window.clearInterval(this.interval);

            var playbackStartFrame = this.frameCursor;
            var playbackStartedAt = moment().unix();

            this.interval = window.setInterval(_.bind(update, this), UPDATE_INTERVAL);

            function update() {

                var points = this.model.get('points');
                var playbackElapsed = moment().unix() - playbackStartedAt;
                var cursorTimestamp = points[playbackStartFrame][GPX_TIMESTAMP] + playbackElapsed;
                var nextFrame = points[this.frameCursor + 1];

                console.log({
                    frame: this.frameCursor,
                    playbackElapsed: playbackElapsed,
                    nextTimestamp: nextFrame[GPX_TIMESTAMP],
                    cursorTimestamp: cursorTimestamp
                });

                if (!nextFrame || nextFrame[GPX_TIMESTAMP] > cursorTimestamp)
                    return;

                this.frameCursor++;

                var newPosition = new google.maps.LatLng(points[this.frameCursor][GPX_LATITUDE], points[this.frameCursor][GPX_LONGITUDE]);

                this.map.panTo(newPosition);
                this.marker.setPosition(newPosition);

            }

            return this;

        },

        pause: function() {

            if (this.interval)
                window.clearInterval(this.interval);

            return this;

        },

        render: function() {

            var points = this.model.get('points');
            var initCoordinates = new google.maps.LatLng(points[0][GPX_LATITUDE], points[0][GPX_LONGITUDE]);
            var pathCoordinates = [];
            var mapOptions = {
                center: initCoordinates,
                zoom: 15,
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

//            google.maps.event.addListener(trackPath, 'click', function(event) {
//                console.log('click', event);
//                var frame = resolveCoordinatesToFrame(event.latLng);
//                syncMapTo(frame);
//                syncVideoTo(frame);
//            });

            return this;

        }

    });

});