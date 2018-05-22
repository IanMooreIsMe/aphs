/*global $ Image*/
/*jslint this: true */

class SlideDate {
    constructor(date, dayLetter) {
        this.date = date;
        this.dayLetter = dayLetter
        this.primaryColor = dayLetter == "A" ? "cornflowerblue" : "yellow";
        this.accentColor = dayLetter == "A" ? "white" : "black";
        this.dateString = moment(date, "YYYY-MM-DD").format("dddd, MMMM Do");
    }
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
    //Drawn image and darken
    ctx.drawImage(background, 0, 0, width, height);
    ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
    ctx.fillRect(0, 0, width, height);
    //Draw rectangle
    ctx.fillStyle = day.primaryColor;
    ctx.fillRect(0, 0, division, height);
    ctx.fillStyle = day.accentColor;
    //Write A/B day
    ctx.font = "bold 295px Arial";
    ctx.fillText(day.dayLetter + " Day", 20, 250);
    //Write date
    ctx.font = "bold 90px Arial";
    ctx.fillText(day.dateString, 30, 390);
    //Write weekdays
    var drawHeight = height - 40;
    weekdays.forEach(function (weekday) {
        ctx.fillStyle = day.accentColor;
        ctx.font = "bold 40px Arial";
        ctx.textAlign = "end";
        ctx.fillText(weekday.dayLetter + " Day", division - 20, drawHeight);
        
        //
        ctx.fillStyle = day.accentColor;
        ctx.font = "normal 40px Arial";
        ctx.textAlign = "start";
        ctx.fillText(weekday.dateString, division + 20, drawHeight);
        drawHeight -= 55;
    });
    return {name:day.date, image:ctx.canvas.toDataURL().slice(22)};
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

function makeSlides() {
    "use strict";
    loadBackground("https://lh3.googleusercontent.com/-mxxjgapBiMs/WwNSrX2HRbI/AAAAAAABu84/ryiIsUjIQhUPDKUfVgyaQFAHR3AGDpooACHMYCw/s0/aphs.jpg", function () {
        "use strict";
        var slides = [];
        for (let i = 0; i < 4; i++) {
            slides.push(makeSlide("gold", "black", i));
        };
        makeZip(slides);
    });
}

//makeSlides();

$(document).ready(function () {
    $(":file").change(function () {
        var input = $(this),
        numFiles = input.get(0).files ? input.get(0).files.length : 1,
        label = input.val().replace(/\\/g, '/').replace(/.*\//, '');
        $("[data-file-display=" + this.id + "]").val(label);
    })
    loadBackground("https://lh3.googleusercontent.com/-mxxjgapBiMs/WwNSrX2HRbI/AAAAAAABu84/ryiIsUjIQhUPDKUfVgyaQFAHR3AGDpooACHMYCw/s0/aphs.jpg", function () {
        "use strict";
        makeSlide(
            new SlideDate("2018-01-23", "A"), 
            [new SlideDate("2018-01-24", "B"),
            new SlideDate("2018-01-25", "A"),
            new SlideDate("2018-01-26", "B"),
            new SlideDate("2018-01-27", "B"),
            new SlideDate("2018-01-28", "A")
            ]
        );
        setTimeout(function () {
            makeSlide(new SlideDate("2018-01-29", "B"));
        }, 100000);
    });

    $("#csv").change(function () {

    })
})

