define([
    'models/tracks/YouTube'
], function(YouTubeTrack) {

    describe('models/tracks/YouTube', function() {

        var URL = 'http://www.youtube.com/watch?v=4UynmT8bpx0&foo=bar';

        it('parses YouTube URLs as expected', function() {

            var track = new YouTubeTrack();

            track.parseVideoID(URL);
            expect(track.get('videoID')).toEqual('4UynmT8bpx0');

            track.parseVideoID('something invalid');
            expect(track.get('videoID')).toEqual(null);

        });

    });

});