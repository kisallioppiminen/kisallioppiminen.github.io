/**
 * Changes exercise header color based on color and exercise ID.
 * @param id {String} 'COLOR_ID;EXERCISE_ID' for example '0;e56f54a7-3619-4cf8-bb6c-00ab8243b818'
 */
function changeProblemHeaderColor(id) {
    var problemID = id.substr(2, id.length - 1);

    // RGB values for red, yellow and green
    var colors = ["rgb(217, 83, 79)", "rgb(240, 173, 78)", "rgb(92, 184, 92)"];
    var color = colors[id.charAt(0)];

    var header_id = 'div[id="' + problemID + '"]';

    // Fallback to default gray if same button is pressed again
    if ($(header_id + " header").css("background").includes(color) ) {
        $(header_id + " header ").css({"background" : "background: -webkit-linear-gradient(top, #F9F8F8, #F1F1F1);" +
        "background: -moz-linear-gradient(top, #F9F8F8, #F1F1F1);" +
        "background: -ms-linear-gradient(top, #F9F8F8, #F1F1F1);" +
        "background: -o-linear-gradient(top, #F9F8F8, #F1F1F1);"});
        var text_id = 'h3[id="textbar_' + id.substr(2,id.length - 1) + '"]';
        // Restore text
        $(text_id).html("Miten tehtävä meni?");
    } else {
        $(header_id + " header").css({"background" : color});
    }
}

/**
 * Returns integer based on input color
 * @param status {String} color (red, yellow, green)
 * @returns {Integer} (0: red, 1: yellow, 2: green)
 */
function getColorID(status) {
    var colors = { "red": 0, "yellow": 1, "green": 2 };
    return colors[status];
}

/**
 * Colors headers for exercises student has already submitted
 * @param jsonData
 */
function colorCheckmarks(jsonData) {
    for (i in jsonData.exercises) {
        var exercise = jsonData.exercises[i];
        if ($('div[id="' + exercise.id + '"]').length) {
            changeProblemHeaderColor(getColorID(exercise.status) + ";" + exercise.id);
        }
    }
}

/**
 * Returns current course html_id
 * @returns {String} for example 'may1'
 */
function getHTMLID() {
    var regexp = /(?:kurssit\/)([a-z0-9]+)(?:\/)/g;
    var pathname = window.location.pathname;
    return regexp.exec(pathname)[1];
}

/**
 * Extracts course key and course id and sets them as global variables
 * @param data
 * @returns {*|Document.coursekey}
 */
function extractCourseData(data) {
    var html_id = getHTMLID();
    for (var i in data) {
        if (data[i].html_id == html_id) {
            coursekey = data[i].coursekey;
            course_id = data[i].id;
            break;
        }
    }
    return coursekey;
}

/**
 * Gets current course key
 * @returns {String} course key
 */
function getCourseKey() {
    return $.ajax({
        url: BACKEND_BASE_URL + `students/${session.getUserId()}/courses`,
        dataType: 'json',
        xhrFields: {
            withCredentials: true
        },
        crossDomain: true
    })
    .done(function(e) {
        extractCourseData(e);
    });
}

/**
 * Requests student's checkmarks and proceeds to color them if request is successful.
 */
function getCheckmarks() {
    var restfulUrl = BACKEND_BASE_URL + `students/${session.getUserId()}/courses/${course_id}/checkmarks`;

    $.ajax({
        url: restfulUrl,
        dataType: 'json',
        xhrFields: {
            withCredentials: true
        },
        crossDomain: true,
        success: function(data) {
            colorCheckmarks(data);
        },
        error: function(data) {
            console.warn("Could not retrieve checkmarks. Message: " + JSON.parse(data.responseText).error);
        }
    });
}

/**
 * Changes button title text
 * @param id {String} exercise ID, for example 'e56f54a7-3619-4cf8-bb6c-00ab8243b818'
 * @param message {String} message to be displayed
 */
function changeButtonTitleText(id, message) {
    var text_id = 'h3[id="textbar_' + id + '"]';
    $(text_id).html(message);
}

/**
 * Execute when DOM has loaded
 */
$(document).ready(function() {

    getCourseKey().done(function() {
        getCheckmarks();
    });

    // Triggers when student sends a checkmark
    $('.problemButton').click(function() {
        var problemId = this.id;

        var stats = ["red", "yellow", "green"];

        var checkmark = {
            html_id: this.id.substr(2, this.id.length - 1),
            status: stats[this.id.charAt(0)],
            coursekey: coursekey
        };

        $.ajax({
            url: BACKEND_BASE_URL+ 'checkmarks',
            type : 'POST',
            dataType : 'json',
            contentType: 'application/json',
            xhrFields: {
                withCredentials: true
            },
            crossDomain: true,
            data : JSON.stringify(checkmark),
            success : function() {
                changeButtonTitleText(problemId.substr(2,problemId.length - 1), "Vastauksesi on lähetetty!");
                changeProblemHeaderColor(problemId);
            },
            error: function(data) {
                changeButtonTitleText(problemId.substr(2,problemId.length - 1), "Virhe! " + JSON.parse(data.responseText).error);
            }
        });
    });
});