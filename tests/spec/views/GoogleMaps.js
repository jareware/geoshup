define([
    'lib/backbone',
    'lib/google-maps',
    'views/GoogleMaps'
], function(Backbone, google, GoogleMapsView) {

    describe('views/GoogleMaps', function() {

        var points, track, view;

        beforeEach(function() {
            points = [
                [ 60.160498, 24.88216,  100, 50 ],
                [ 60.160521, 24.882495, 102, 50 ],
                [ 60.160524, 24.883035, 103, 50 ],
                [ 60.160582, 24.883386, 107, 50 ],
                [ 60.16063,  24.883597, 108, 50 ]
            ];
            track = new Backbone.Model({
                points: points
            });
            view = new GoogleMapsView({
                model: track
            });
        });

        it('finds frames based on private seconds', function() {

            // 0  1  2  3  4  5  6  7  8 <- elapsed seconds
            [  0, 0, 1, 2, 2, 2, 2, 3, 4 ].forEach(function(expectedFrameIndex, atPrivateSeconds) {
                expect(view.findFrameBySeconds(atPrivateSeconds)).toBe(expectedFrameIndex);
            });

        });

        it('handles frame lookups outside the valid range', function() {

            expect(view.findFrameBySeconds(-1)).toBe(false);
            expect(view.findFrameBySeconds(-9001)).toBe(false);

            expect(view.findFrameBySeconds(9)).toBe(false);
            expect(view.findFrameBySeconds(1337)).toBe(false);

        });

        it('looks up frames using a reference frame', function() {

            expect(view.findFrameBySeconds(7, 2)).toBe(3); // TODO: Check that the previous indices really weren't tested..?
            expect(view.findFrameBySeconds(4, 2)).toBe(2); // starting to look while frame active
            expect(view.findFrameBySeconds(5, 3)).toBe(false); // starting to look after frame already passed
            expect(view.findFrameBySeconds(7, 3)).toBe(3); // immediate match

            expect(view.findFrameBySeconds(0, 0)).toBe(0); // default 0 should be OK to specify, too
            expect(view.findFrameBySeconds(1, 0)).toBe(0);
            expect(view.findFrameBySeconds(2, 0)).toBe(1);

        });

        it('tolerates non-sane reference frames', function() {

            expect(view.findFrameBySeconds(0, -1)).toBe(false);
            expect(view.findFrameBySeconds(0, 20)).toBe(false);
            expect(view.findFrameBySeconds(20, 20)).toBe(false);

        });

        it('tolerates pointless tracks (pun intended)', function() {

            track.set({ points: [] });

            expect(view.findFrameBySeconds(-1)).toBe(false);
            expect(view.findFrameBySeconds(0)).toBe(false);
            expect(view.findFrameBySeconds(1)).toBe(false);

        });

        it('invokes the ready-callback after sync()', function() {

            var readySpy = jasmine.createSpy('readySpy');

            view.sync(0, readySpy);

            waitsFor(function() {
                return readySpy.callCount > 0;
            });

        });

        xit('finds frames by their coordinates', function() { // TODO: See if this could be made work without loading the Google Maps API in its massive entirety

            var lookForCoords = new google.maps.LatLng(60.160523, 24.883034); // original: [ 60.160524, 24.883035, 103, 50 ],

            expect(view.findFrameByCoordinates(lookForCoords)).toBe(3);

        });

    });

});