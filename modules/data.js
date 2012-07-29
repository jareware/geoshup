define([
    'lib/jquery',
    'lib/backbone',
    'lib/moment'
], function($, Backbone, moment) {

    "use strict";

    var Track = Backbone.Model.extend({});

    var GPXTrack = Track.extend({
        defaults: {
            points: []
        }
    });

    var YouTubeTrack = Track.extend({});

    var Timeline = Backbone.Collection.extend({
        model: Track
    });

    function addGPXTrack(offset, gpxString) {

        var $track = $(gpxString);
        var $segment = $track.find('trkseg');
        var points = [];

        $segment.find('trkpt').each(function () {
            var $this     = $(this);
            var latitude  = window.parseFloat($this.attr('lat'));
            var longitude = window.parseFloat($this.attr('lon'));
            var timestamp = moment.utc($this.find('time').text()).unix();
            var elevation = window.parseFloat($this.find('ele').text());
            points.push([ latitude, longitude, timestamp, elevation ]);
        });

        timeline.add(new GPXTrack({
            offset: offset,
            points: points
        }));

    }

    var timeline = new Timeline();

    return {
        addGPXTrack: addGPXTrack,
        getTimeline: function() { return timeline }
    };

});