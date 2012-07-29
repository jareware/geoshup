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

            var $track = $(string);
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

            this.set({ points: points });

        }

    });

});