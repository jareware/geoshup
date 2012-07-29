define([
    'lib/backbone',
    'views/GoogleMaps'
], function(Backbone, GoogleMapsView) {

    describe('GoogleMapsView', function() {

        var points, track, view;

        beforeEach(function() {
            points = [
                [ 60.160411, 24.878477, 100, 50 ],
                [ 60.160411, 24.878477, 102, 50 ],
                [ 60.160411, 24.878477, 103, 50 ],
                [ 60.160411, 24.878477, 107, 50 ],
                [ 60.160411, 24.878477, 108, 50 ]
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
                expect(view.findFrame(atPrivateSeconds)).toBe(expectedFrameIndex);
            });

        });

        it('handles frame lookups outside the valid range', function() {

            expect(view.findFrame(-1)).toBe(false);
            expect(view.findFrame(-9001)).toBe(false);

            expect(view.findFrame(9)).toBe(false);
            expect(view.findFrame(1337)).toBe(false);

        });

        it('looks up frames using a reference frame', function() {

            expect(view.findFrame(7, 2)).toBe(3); // TODO: Check that the previous indices really weren't tested..?
            expect(view.findFrame(4, 2)).toBe(2); // starting to look while frame active
            expect(view.findFrame(5, 3)).toBe(false); // starting to look after frame already passed
            expect(view.findFrame(7, 3)).toBe(3); // immediate match

            expect(view.findFrame(0, 0)).toBe(0); // default 0 should be OK to specify, too
            expect(view.findFrame(1, 0)).toBe(0);
            expect(view.findFrame(2, 0)).toBe(1);

        });

        it('tolerates non-sane reference frames', function() {

            expect(view.findFrame(0, -1)).toBe(false);
            expect(view.findFrame(0, 20)).toBe(false);
            expect(view.findFrame(20, 20)).toBe(false);

        });

        it('tolerates pointless tracks (pun intended)', function() {

            track.set({ points: [] });

            expect(view.findFrame(-1)).toBe(false);
            expect(view.findFrame(0)).toBe(false);
            expect(view.findFrame(1)).toBe(false);

        });

    });

});