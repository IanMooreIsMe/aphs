/*global $ Caman Image*/


function makeSlide(base, color, accent, date){
    var ctx = $("#edit-canvas")[0].getContext("2d");
    var width = 1920, height = 1080;
    ctx.canvas.width = width;
    ctx.canvas.height = height;
    var baseImg = new Image();
    baseImg.src = base;
    baseImg.onload = function (){
        ctx.drawImage(baseImg, 0, 0, width, height);
        //Draw rectangle
        ctx.fillStyle = color;
        ctx.fillRect(0, 0, width*.70, height);
        ctx.fillStyle = accent;
        //Write A/B day
        ctx.font = "bold 295px Arial";
	    ctx.fillText("B Day", 20, 250);
	    //Write date
	    ctx.font = "bold 90px Arial";
	    ctx.fillText("Monday, April 2nd", 30, 390);
	    //Write weekdays
    }
}

makeSlide("https://s.hdnux.com/photos/03/63/02/995470/15/920x920.jpg", "gold", "black");