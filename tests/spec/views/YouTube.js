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
            view.orchestrator = {
                play: jasmine.createSpy('orchestratorPlaySpy')
            };

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
            ytp.mute = jasmine.createSpy('mute');
        }

        it('reports the player as started (even under these hacks)', function() {

            view.render();

            window.onYouTubePlayerReady('playerID');
            spyOnControls(view.ytp);
            window.onYTPStateChange(view.STATE.PLAYING); // this means the player is ready and thus started playback

            expect(view.playerStarted).toBeTruthy();

        });

        it('gives expected PAUSE-command to YTP during startup', function() {

            view.render();

            window.onYouTubePlayerReady('playerID');
            spyOnControls(view.ytp);
            window.onYTPStateChange(view.STATE.PLAYING); // this means the player is ready and thus started playback

            expect(view.ytp.playVideo).not.toHaveBeenCalled();
            expect(view.ytp.pauseVideo).toHaveBeenCalled();
            expect(view.ytp.seekTo).not.toHaveBeenCalled();

        });

        it('gives expected commands to YTP during sync()', function() {

            view.render();

            window.onYouTubePlayerReady('playerID');
            spyOnControls(view.ytp);
            window.onYTPStateChange(view.STATE.PLAYING); // this means the player is ready and thus started playback

            expect(view.ytp.playVideo).not.toHaveBeenCalled();
            expect(view.ytp.pauseVideo).toHaveBeenCalled();
            expect(view.ytp.seekTo).not.toHaveBeenCalled();

            view.sync(123, function() {});

            expect(view.ytp.playVideo.callCount).toBe(1);
            expect(view.ytp.pauseVideo.callCount).toBe(1);
            expect(view.ytp.seekTo).toHaveBeenCalledWith(123, true);
            expect(view.ytp.seekTo.callCount).toBe(1);

            window.onYTPStateChange(view.STATE.PLAYING); // help trigger the ready() call

            expect(view.ytp.playVideo.callCount).toBe(1);
            expect(view.ytp.pauseVideo.callCount).toBe(2);

        });

        it('delays commands to YTP during sync() if YTP is not ready', function() {

            view.render().sync(123, function() {});

            window.onYouTubePlayerReady('playerID');
            spyOnControls(view.ytp);
            window.onYTPStateChange(view.STATE.PLAYING); // this means the player is ready and thus started playback

            waitsFor(function() {
                return view.ytp.seekTo.callCount > 0; // this means seek has been ordered -> YTP is now listening for the subsequent PLAY state
            });

            runs(function() {
                window.onYTPStateChange(view.STATE.PLAYING); // this means the player has buffered after the seek, and is ready -> it'll be paused while it waits for further instructions
            });

            waitsFor(function() {
                return view.ytp.pauseVideo.callCount === 2;
            });

            runs(function() {
                expect(view.ytp.playVideo.callCount).toBe(1);
                expect(view.ytp.seekTo).toHaveBeenCalledWith(123, true);
                expect(view.ytp.seekTo.callCount).toBe(1);
            });

        });

        it('allows subscribing one-off event handlers', function() {

            view.render();

            window.onYouTubePlayerReady('playerID');

            spyOnControls(view.ytp);

            var spyA = jasmine.createSpy('spyA');
            var spyB = jasmine.createSpy('spyB');
            var spyC = jasmine.createSpy('spyC');

            view.onNextStateChange(view.STATE.PLAYING,   spyA);
            view.onNextStateChange(view.STATE.PAUSED,    spyB);
            view.onNextStateChange(view.STATE.BUFFERING, spyC);

            window.onYTPStateChange(view.STATE.PLAYING);

            expect(spyA.callCount).toBe(1);
            expect(spyB.callCount).toBe(0);
            expect(spyC.callCount).toBe(0);

            window.onYTPStateChange(view.STATE.PLAYING);
            window.onYTPStateChange(view.STATE.PAUSED);
            window.onYTPStateChange(view.STATE.CUED);

            expect(spyA.callCount).toBe(1);
            expect(spyB.callCount).toBe(1);
            expect(spyC.callCount).toBe(0);

        });

        it('allows subscribing multiple handlers to a single state change', function() {

            view.render();

            window.onYouTubePlayerReady('playerID');

            spyOnControls(view.ytp);

            var spyA = jasmine.createSpy('spyA');
            var spyB = jasmine.createSpy('spyB');

            view.onNextStateChange(view.STATE.PLAYING, spyA);
            view.onNextStateChange(view.STATE.PLAYING, spyB);

            window.onYTPStateChange(view.STATE.PLAYING);
            window.onYTPStateChange(view.STATE.PLAYING);

            expect(spyA.callCount).toBe(1);
            expect(spyB.callCount).toBe(1);

        });

        it('calls the ready() function after a successful sync()', function() {

            var readySpy = jasmine.createSpy('readySpy');

            view.render().sync(123, readySpy);

            window.onYouTubePlayerReady('playerID');
            spyOnControls(view.ytp);
            window.onYTPStateChange(view.STATE.PLAYING); // this means the player is ready and thus started playback

            waitsFor(function() {
               return view.ytp.seekTo.callCount > 0; // this means seek has been ordered -> YTP is now listening for the subsequent PLAY state
            });

            runs(function() {
               window.onYTPStateChange(view.STATE.PLAYING); // this means the player has buffered after the seek, and is ready -> it'll be paused while it waits for further instructions
            });

            waitsFor(function() {
                return readySpy.callCount > 0;
            });

        });

        // TODO: Enable below tests; likely culprit for failing to coexist: that.ytp = that.$('#myytplayer')[0];
        xit('triggers play() and pause() requests on the Orchestrator', function() {

            view.render();

            window.onYouTubePlayerReady('playerID');
            spyOnControls(view.ytp);

            view.ytp.playVideo.andCallFake(function() {
                window.onYTPStateChange(view.STATE.PLAYING);
            });
            view.ytp.pauseVideo.andCallFake(function() {
                window.onYTPStateChange(view.STATE.PAUSED);
            });

            window.onYTPStateChange(view.STATE.UNSTARTED);
            window.onYTPStateChange(view.STATE.PLAYING); // simulating player-generated startup events

            window.onYTPStateChange(view.STATE.PLAYING); // simulate a user-generated event

            expect(view.orchestrator.play).toHaveBeenCalled();

        });

        it('triggers play() and pause() requests on the Orchestrator after a sync', function() {

            view.render();

            window.onYouTubePlayerReady('playerID');
            spyOnControls(view.ytp);

            view.ytp.playVideo.andCallFake(function() {
                window.onYTPStateChange(view.STATE.PLAYING);
            });
            view.ytp.pauseVideo.andCallFake(function() {
                window.onYTPStateChange(view.STATE.PAUSED);
            });

            window.onYTPStateChange(view.STATE.UNSTARTED);
            window.onYTPStateChange(view.STATE.PLAYING); // simulating player-generated startup events

            expect(view.playerStarted).toBe(true); // this is just an assertion; otherwise the rest of the test won't make sense

            view.sync(123, function() {});
            window.onYTPStateChange(view.STATE.PLAYING); // simulate the YTP finishing its seekTo()
            window.onYTPStateChange(view.STATE.PLAYING); // simulate a user-generated event

            expect(view.orchestrator.play).toHaveBeenCalled();

        });

    });

});