define([
    'models/tracks/GPX',
    'text!fixtures/basic-track.gpx'
], function(GPXTrack, gpxFixture) {

    describe('GPXTrack', function() {

        it('parses GPX files as expected', function() {

            var track = new GPXTrack();
            var expected = [
                [60.160411, 24.878477, 1341853630, null],
                [60.160411, 24.878477, 1341853693, 50.2],
                [60.160516, 24.8788,   1341853696, 58.9],
                [60.160505, 24.87916,  1341853700, 60.2],
                [60.160475, 24.879459, 1341853704, 60.5]
            ];

            track.parseGPX(gpxFixture)

            expect(track.get('points')).toEqual(expected);

        });

    });

});