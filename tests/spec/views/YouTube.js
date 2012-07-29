define([
    'lib/backbone',
    'swfobject',
    'views/YouTube'
], function(Backbone, swfobject, YouTubeView) {

    describe('views/YouTube', function() {

        var view;

        beforeEach(function() {

            view = new YouTubeView({
                model: new Backbone.Model({
                    videoID: '12345'
                })
            });

            swfobject.embedSWF = function() {
                view.$el.html('<div id="myytplayer" />');
            };

        });

        afterEach(function() {

            delete swfobject.embedSWF;

        });

        function spyOnControls(ytp) {
            ytp.playVideo = jasmine.createSpy('playVideo');
            ytp.pauseVideo = jasmine.createSpy('pauseVideo');
            ytp.seekTo = jasmine.createSpy('seekTo');
        }

        it('reports the player as started (even under these hacks)', function() {

            view.render();

            window.onYouTubePlayerReady('playerID');
            spyOnControls(view.ytp);
            window.onYTPStateChange(view.STATE.PLAYING);

            expect(view.playerStarted).toBeTruthy();

        });

        it('gives expected PAUSE-command to YTP during startup', function() {

            view.render();

            window.onYouTubePlayerReady('playerID');
            spyOnControls(view.ytp);
            window.onYTPStateChange(view.STATE.PLAYING);

            expect(view.ytp.playVideo).not.toHaveBeenCalled();
            expect(view.ytp.pauseVideo).toHaveBeenCalled();
            expect(view.ytp.seekTo).not.toHaveBeenCalled();

        });

        it('gives expected commands to YTP during sync()', function() {

            view.render();

            window.onYouTubePlayerReady('playerID');
            spyOnControls(view.ytp);
            window.onYTPStateChange(view.STATE.PLAYING);

            expect(view.ytp.playVideo).not.toHaveBeenCalled();
            expect(view.ytp.pauseVideo).toHaveBeenCalled();
            expect(view.ytp.seekTo).not.toHaveBeenCalled();

            var readySpy = jasmine.createSpy('readySpy');

            view.sync(123, readySpy);

            expect(view.ytp.playVideo).not.toHaveBeenCalled();
            expect(view.ytp.pauseVideo.callCount).toBe(2);
            expect(view.ytp.seekTo).toHaveBeenCalledWith(123, true);
            expect(view.ytp.seekTo.callCount).toBe(1);

//            expect(readySpy.callCount).toBe(1); // TODO

        });

        it('delays commands to YTP during sync() if YTP is not ready', function() {

            var readySpy = jasmine.createSpy('readySpy');

            view.render().sync(123, readySpy);

            window.onYouTubePlayerReady('playerID');
            spyOnControls(view.ytp);
            window.onYTPStateChange(view.STATE.PLAYING);

            waitsFor(function() {
                return view.ytp.seekTo.callCount > 0;
            });

            runs(function() {
                expect(view.ytp.playVideo).not.toHaveBeenCalled();
                expect(view.ytp.pauseVideo.callCount).toBe(2);
                expect(view.ytp.seekTo).toHaveBeenCalledWith(123, true);
                expect(view.ytp.seekTo.callCount).toBe(1);

//                expect(readySpy.callCount).toBe(1); // TODO
            });

        });

    });

});