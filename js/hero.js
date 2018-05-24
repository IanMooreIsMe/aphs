/*global $ Image*/
/*jslint this: true */

var font = "Arial"; //Poor man's Helvetica

function slideDate(date, dayName, primaryColor, accentColor) {
    "use strict";
    return {
        date: date,
        dayName: dayName,
        primaryColor: primaryColor,
        accentColor: accentColor,
        dateString: moment(date, "YYYY-MM-DD").format("dddd, MMMM Do")
    };
}

var background;
function loadBackground(src, callback) {
    "use strict";
    var img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = function () {
        background = img;
        callback();
    };
    img.src = src;
}


function makeSlide(day, weekdays) {
    "use strict";
    var ctx = $("#edit-canvas")[0].getContext("2d");
    var width = 1920, height = 1080, division = width * 0.72;
    ctx.canvas.width = width;
    ctx.canvas.height = height;
    //Drawn image and darken/lighten
    ctx.drawImage(background, 0, 0, width, height);
    if (tinycolor(day.accentColor).isLight()) {
        ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
    } else {
        ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
    }
    ctx.fillRect(0, 0, width, height);
    //Draw rectangle
    ctx.fillStyle = day.primaryColor;
    ctx.fillRect(0, 0, division, height);
    ctx.fillStyle = day.accentColor;
    //Write A/B day
    ctx.font = "bold 295px " + font;
    ctx.fillText(day.dayName, 30, 270);
    //Write date
    ctx.font = "bold 90px " + font;
    ctx.fillText(day.dateString, 50, 415);
    //Write weekdays
    var drawHeight = height - 40;
    weekdays.forEach(function (weekday) {
        //Write day name
        ctx.fillStyle = day.accentColor;
        ctx.font = "bold 40px " + font;
        ctx.textAlign = "end";
        ctx.fillText(weekday.dayName, division - 20, drawHeight);
        //Write date
        ctx.fillStyle = day.primaryColor;
        ctx.font = "normal 40px " + font;
        ctx.textAlign = "start";
        ctx.fillText(weekday.dateString, division + 20, drawHeight);
        drawHeight -= 55;
    });
    return {name:day.date, image:ctx.canvas.toDataURL().slice(22)};
}

function makeCoverSlide() {
    "use strict";
    var ctx = $("#edit-canvas")[0].getContext("2d");
    var width = 1920, height = 1080;
    ctx.canvas.width = width;
    ctx.canvas.height = height;
    //Draw background and lighten it up
    ctx.drawImage(background, 0, 0, width, height);
    ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
    ctx.fillRect(0, 0, width, height);
    //Draw bottom rectangle
    ctx.fillStyle = "yellow";
    ctx.fillRect(0, height, width, -100);
    //Write "Welcome to"
    ctx.fillStyle = "#215192";
    ctx.font = "bold 80px " + font;
    ctx.fillText("Welcome to", 50, 375);
    //Write "Averill Park High School"
    ctx.font = "bold 140px " + font;
    ctx.fillText("Averill Park High School", 50, 550);
    //Write "Home of the Warriors"
    ctx.fillStyle = "#5580E7";
    ctx.font = "normal 90px " + font;
    ctx.fillText("Home of the Warriors", 50, 675);
    return {name:"cover", image:ctx.canvas.toDataURL().slice(22)};
}

function makeZip(slides) {
    "use strict";
    var zip = new JSZip();
    slides.forEach(function (slide) {
        zip.file(slide.name + ".png", slide.image, {base64: true});
    });
    zip.generateAsync({type:"blob"}).then(function (content) {
        saveAs(content, "slides.zip");
    });
}

function toast(message, duration) {
    "use strict";
    var toaster = $(".toast");
    toaster.text(message);
    $(".toast").removeClass("show");
    $(".toast").addClass("show");
    setTimeout(function() {
        $(".toast").removeClass("show");
    }, duration);
}

var slideImages = [];

function makeSlideBatch(week, batch, total) {
    "use strict";
    var progressBar = $("#make-progress .progress-bar");
    setTimeout(function () {
        week.reverse().forEach(function (day) {
            slideImages.push(makeSlide(day, week));
        });
        progressBar.text(batch * 5 + "/" + total);
        progressBar.width(batch * 5 / total * 100 + "%");
    }, batch * 2000);
}


$(document).ready(function () {
    "use strict";
    $(":file").change(function () {
        var input = $(this),
        numFiles = input.get(0).files ? input.get(0).files.length : 1,
        label = input.val().replace(/\\/g, '/').replace(/.*\//, '');
        $("[data-file-display=" + this.id + "]").val(label);
    });
    loadBackground("https://lh3.googleusercontent.com/-Tzhft65Sdk8/WwcOua6mXNI/AAAAAAABvDU/gJYQdTu1VOoH0D1SL251NEcwq4URUjUswCHMYCw/s0/aphs-front.jpg", function () {
        "use strict";
        //Give an example
        makeSlide(
            slideDate(moment().format("YYYY-MM-DD"), "B Day", "yellow", "black"),
            [slideDate(moment().add(5, "days").format("YYYY-MM-DD"), "A Day"),
            slideDate(moment().add(4, "days").format("YYYY-MM-DD"), "B Day"),
            slideDate(moment().add(3, "days").format("YYYY-MM-DD"), "A Day"),
            slideDate(moment().add(2, "days").format("YYYY-MM-DD"), "B Day"),
            slideDate(moment().add(1, "days").format("YYYY-MM-DD"), "A Day")]
        );
    });

    $("#csv").change(function () {
        $("#csv").parse({
            config: {
                skipEmptyLines: true,
                fastMode: true,
                complete: function(results, file) {
                    toast("Started making slides, please wait...", 10000);
                    var slidesData = [];
                    results.data.forEach(function(value) {
                        var date = value[0];
                        var dayText = value[1];
                        var primaryColor = value[2];
                        var accentColor = value[3];
                        if (dayText == "A") { primaryColor = "cornflowerblue"; } else if (dayText == "B") { primaryColor = "yellow"; }
                        if (dayText == "A") { accentColor = "white"; } else if (dayText == "B") { accentColor = "black"; }
                        if (dayText == "A") { dayText = "A Day"; } else if (dayText == "B") { dayText = "B Day"; }
                        slidesData.push(slideDate(date, dayText, primaryColor, accentColor));
                    });
                    var slidesTotal = slidesData.length;
                    var chunk = 5;
                    var batch = 1;
                    slideImages = [makeCoverSlide()];
                    for (var i = 0; i < slidesTotal; i += chunk) {
                        var week = slidesData.slice(i, i + chunk);
                        makeSlideBatch(week, batch, slidesTotal);
                        batch++;
                        console.log(batch)
                    }
                    setTimeout(function () {
                        toast("Finished making slides, downloading as .zip file..", 10000);
                        makeZip(slideImages);
                    }, (batch + 1) * 2000);
                },
                error: function(err, file, inputElem, reason) {
                    toast("Error reading .csv file!", 10000)
                }
            }
        });
    })
})
