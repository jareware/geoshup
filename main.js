require([
    'lib/jquery',
    'controllers/Orchestrator',
    'models/Timeline',
    'models/tracks/GPX',
    'models/tracks/YouTube',
    'views/GoogleMaps',
    'views/YouTube',
    'utils/logger'
], function($, Orchestrator, Timeline, GPXTrack, YouTubeTrack, GoogleMapsView, YouTubeView, logger) {

    "use strict";

    var log = logger.create('main');

    $(function() {

        $.ajax({
            type: 'GET',
            url: 'track.gpx',
            dataType: 'xml',
            success: function(payload) {

                log('setting up timeline');

                var timeline = new Timeline();

                var gpxTrack = new GPXTrack({
                    offset: -59 //+ 13
                });
                gpxTrack.parseGPX(payload);
                timeline.add(gpxTrack);

                var ytTrack = new YouTubeTrack({
                    offset: -14 //+ 13
                });
                ytTrack.parseVideoID('http://www.youtube.com/watch?v=4UynmT8bpx0');
                timeline.add(ytTrack);

                var gpxView = new GoogleMapsView({
                    el: $('#map_canvas')[0],
                    model: gpxTrack
                }).render();

                var ytView = new YouTubeView({
                    el: $('#ytapiplayer')[0],
                    model: ytTrack,
                    width: 500,
                    height: 356
                }).render();

                var orchestrator = new Orchestrator(timeline);
                orchestrator.addView(gpxView);
                orchestrator.addView(ytView);
                orchestrator.syncAtGlobalSeconds(100, function() {
                    log('orchestrator sync ready-callback');
                    orchestrator.play();
                });

                window.orc = orchestrator;

            }
        });

//        var interval;
//
//        function syncMapTo(startFrame) {
//
//            var cursor = startFrame;
//            var playbackStart = moment().unix();
//
//            if (!points[cursor])
//                return;
//
//            map.panTo(new google.maps.LatLng(points[cursor][0], points[cursor][1]));
//            marker.setPosition(new google.maps.LatLng(points[cursor][0], points[cursor][1]));
//
//            if (interval)
//                window.clearInterval(interval);
//
//            interval = window.setInterval(function() {
//
//                var playedForSecs = moment().unix() - playbackStart;
//                var next = points[cursor + 1];
//
//                if (!next)
//                    return console.log('Error: No next frame');
//
//    //                    console.log(points[startFrame][2] + playedForSecs, '>=?', next[2]);
//
//                if (points[startFrame][2] + playedForSecs < next[2])
//                    return;
//
//                cursor++;
//                map.panTo(new google.maps.LatLng(points[cursor][0], points[cursor][1]));
//                marker.setPosition(new google.maps.LatLng(points[cursor][0], points[cursor][1]));
//
//                if (points[cursor - 1] && points[cursor]) {
//                    var a = new google.maps.LatLng(points[cursor - 1][0], points[cursor - 1][1]);
//                    var b = new google.maps.LatLng(points[cursor][0], points[cursor][1]);
//                    var distance = google.maps.geometry.spherical.computeDistanceBetween(a, b);
//                    var time = points[cursor][2] - points[cursor - 1][2];
//                    var speed = distance / time;
//                }
//
//                console.log('@', moment.duration(points[cursor][2], "seconds").humanize(), 'dist:', distance, 'time:', time, 'speed:', Math.round(speed * 10) / 10, 'm/s');
//
//            }, 1000);
//
//        }
//
//        syncMapTo(0);
//
//        window.syncMapTo = syncMapTo;
//
//        var ytp;
//        var VIDEO_OFFSET = 40;
//
//        window.onYouTubePlayerReady = function(playerId) {
//            ytp = document.getElementById("myytplayer");
//            console.log('[YouTube]', 'onYouTubePlayerReady');
//            ytp.addEventListener("onStateChange", "onYTPStateChange");
//            ytp.addEventListener("onError", "onYTPError");
//        };
//        window.onYTPStateChange = function(newState) {
//            // Possible values are unstarted (-1), ended (0), playing (1), paused (2), buffering (3), video cued (5).
//            // When the SWF is first loaded it will broadcast an unstarted (-1) event. When the video is cued and ready to play it will broadcast a video cued event (5).
//            console.log('[YouTube]', newState);
//            if (newState === 1)
//                navigateMapTo(ytp.getCurrentTime());
//        };
//        window.onYTPError = function(newState) {
//            // The 2 error code is broadcast when a request contains an invalid parameter. For example, this error occurs if you specify a video ID that does not have 11 characters, or if the video ID contains invalid characters, such as exclamation points or asterisks.
//            // The 100 error code is broadcast when the video requested is not found. This occurs when a video has been removed (for any reason), or it has been marked as private.
//            // The 101 error code is broadcast when the video requested does not allow playback in the embedded players.
//            // The error code 150 is the same as 101, it's just 101 in disguise!
//            console.log('[YouTube ERROR]', newState);
//        };
//        window.navigateMapTo = function(seconds) {
//            if (suppressSyncsFromVideo) {
//                return;
//            }
//            console.log('navigateMapTo(', seconds, ')');
//            var foundFrame = false;
//            for (var i = 0; i < points.length; i++) {
//                if (points[i][2] > seconds + VIDEO_OFFSET) {
//                    foundFrame = i;
//                    break;
//                }
//            }
//            if (foundFrame) {
//                syncMapTo(foundFrame);
//            } else {
//                console.log('Error: Frame not found for seconds: ', seconds);
//            }
//        };
//
//        var suppressSyncsFromVideo = false;
//
//        function syncVideoTo(frameIndex) {
//
//            ytp.seekTo(points[frameIndex][2] - 45);
//
//            suppressSyncsFromVideo = true;
//
//            window.setTimeout(function() {
//                suppressSyncsFromVideo = false;
//            }, 2000);
//
//        }

    });

});