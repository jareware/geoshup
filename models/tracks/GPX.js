define([
    'lib/jquery',
    'lib/backbone',
    'lib/moment'
], function($, Backbone, moment) {

    "use strict";

    return Backbone.Model.extend({

        defaults: {
            offset: 0,
            points: []
        },

        parseGPX: function(string) {

            function parse(string) {
                var result = window.parseFloat(string);
                return window.isNaN(result) ? null : result;
            }

            var $track = $(string);
            var $segment = $track.find('trkseg');
            var points = [];

            $segment.find('trkpt').each(function () {
                var $this     = $(this);
                var latitude  = parse($this.attr('lat'));
                var longitude = parse($this.attr('lon'));
                var timestamp = moment.utc($this.find('time').text()).unix();
                var elevation = parse($this.find('ele').text());
                points.push([ latitude, longitude, timestamp, elevation ]);
            });

            this.set({ points: points });

        }

    });

});