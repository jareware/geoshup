$(function() {

    'use strict';

    var defCoords = new google.maps.LatLng(60.160411, 24.878477);
    var myOptions = {
        center: defCoords,
        zoom: 15,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    var map = new google.maps.Map(document.getElementById('map_canvas'), myOptions);
    var points = [];
    var STAMP_OFFSET = 1341853630;
    var marker = new google.maps.Marker({
        position: defCoords,
        map: map,
        title: 'Cursor position'
    });

    $.ajax({
        type: 'GET',
        url: 'track.gpx',
        dataType: 'xml',
        success: function(data) {
            var $track = $(data);
            var $segment = $track.find('trkseg');
            var pathCoordinates = [];
            $segment.find('trkpt').each(function () {
                var $this = $(this);
                var timestamp = moment.utc($this.find('time').text()).unix();
                var cur;
                points.push(cur = [ $this.attr('lat'), $this.attr('lon'), timestamp - STAMP_OFFSET ]);
                pathCoordinates.push(new google.maps.LatLng(cur[0], cur[1]));
            });
            var trackPath = new google.maps.Polyline({
                path: pathCoordinates,
                strokeColor: '#FF0000',
                strokeOpacity: 0.7,
                strokeWeight: 10
            });
            trackPath.setMap(map);
            google.maps.event.addListener(trackPath, 'click', function(event) {
                console.log('click', event);
                var frame = resolveCoordinatesToFrame(event.latLng);
                syncMapTo(frame);
                syncVideoTo(frame);
            });
            console.log('points', points);
        }
    });

    var interval;

    function syncMapTo(startFrame) {

        var cursor = startFrame;
        var playbackStart = moment().unix();

        if (!points[cursor])
            return;

        map.panTo(new google.maps.LatLng(points[cursor][0], points[cursor][1]));
        marker.setPosition(new google.maps.LatLng(points[cursor][0], points[cursor][1]));

        if (interval)
            window.clearInterval(interval);

        interval = window.setInterval(function() {

            var playedForSecs = moment().unix() - playbackStart;
            var next = points[cursor + 1];

            if (!next)
                return console.log('Error: No next frame');

//                    console.log(points[startFrame][2] + playedForSecs, '>=?', next[2]);

            if (points[startFrame][2] + playedForSecs < next[2])
                return;

            cursor++;
            map.panTo(new google.maps.LatLng(points[cursor][0], points[cursor][1]));
            marker.setPosition(new google.maps.LatLng(points[cursor][0], points[cursor][1]));

            if (points[cursor - 1] && points[cursor]) {
                var a = new google.maps.LatLng(points[cursor - 1][0], points[cursor - 1][1]);
                var b = new google.maps.LatLng(points[cursor][0], points[cursor][1]);
                var distance = google.maps.geometry.spherical.computeDistanceBetween(a, b);
                var time = points[cursor][2] - points[cursor - 1][2];
                var speed = distance / time;
            }

            console.log('@', moment.duration(points[cursor][2], "seconds").humanize(), 'dist:', distance, 'time:', time, 'speed:', Math.round(speed * 10) / 10, 'm/s');

        }, 1000);

    }

    syncMapTo(0);

    window.syncMapTo = syncMapTo;

    var ytp;
    var VIDEO_OFFSET = 40;

    window.onYouTubePlayerReady = function(playerId) {
        ytp = document.getElementById("myytplayer");
        console.log('[YouTube]', 'onYouTubePlayerReady');
        ytp.addEventListener("onStateChange", "onYTPStateChange");
        ytp.addEventListener("onError", "onYTPError");
    };
    window.onYTPStateChange = function(newState) {
        // Possible values are unstarted (-1), ended (0), playing (1), paused (2), buffering (3), video cued (5).
        // When the SWF is first loaded it will broadcast an unstarted (-1) event. When the video is cued and ready to play it will broadcast a video cued event (5).
        console.log('[YouTube]', newState);
        if (newState === 1)
            navigateMapTo(ytp.getCurrentTime());
    };
    window.onYTPError = function(newState) {
        // The 2 error code is broadcast when a request contains an invalid parameter. For example, this error occurs if you specify a video ID that does not have 11 characters, or if the video ID contains invalid characters, such as exclamation points or asterisks.
        // The 100 error code is broadcast when the video requested is not found. This occurs when a video has been removed (for any reason), or it has been marked as private.
        // The 101 error code is broadcast when the video requested does not allow playback in the embedded players.
        // The error code 150 is the same as 101, it's just 101 in disguise!
        console.log('[YouTube ERROR]', newState);
    };
    window.navigateMapTo = function(seconds) {
        if (suppressSyncsFromVideo) {
            return;
        }
        console.log('navigateMapTo(', seconds, ')');
        var foundFrame = false;
        for (var i = 0; i < points.length; i++) {
            if (points[i][2] > seconds + VIDEO_OFFSET) {
                foundFrame = i;
                break;
            }
        }
        if (foundFrame) {
            syncMapTo(foundFrame);
        } else {
            console.log('Error: Frame not found for seconds: ', seconds);
        }
    };

    function resolveCoordinatesToFrame(/* instanceof google.maps.LatLng */ coords) {

        var bestDist = 9001;
        var bestHit = null;
        var latLonOrig = coords;

        points.forEach(function(frame, index) {
            var latLonCur = new google.maps.LatLng(frame[0], frame[1]);
            // https://developers.google.com/maps/documentation/javascript/reference?hl=en-US#spherical
            var distance = google.maps.geometry.spherical.computeDistanceBetween(latLonOrig, latLonCur);
            if (distance < bestDist) {
                bestDist = distance;
                bestHit = index;
            }
        });

        console.log('resolveCoordinatesToFrame() => ', bestHit);

        return bestHit;

    }

    var suppressSyncsFromVideo = false;

    function syncVideoTo(frameIndex) {

        ytp.seekTo(points[frameIndex][2] - 45);

        suppressSyncsFromVideo = true;

        window.setTimeout(function() {
            suppressSyncsFromVideo = false;
        }, 2000);

    }

});