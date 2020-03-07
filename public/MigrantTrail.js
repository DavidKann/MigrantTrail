//global UI variables
var globalCanvas;
var globalButton1;
var globalButton2;
var globalButton3;
var globalButton4;
var globalTextEntry;

//global game variables
var globalStoryState;
var globalPlayerName;
var globalPlayerProfession;

//Paused when user clicks UI or presses the button 'p'.
//var isPaused = false;

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function gameLose(scenario) {

    closeUI();
    document.getElementById("timer").style.display = "none";


    switch (scenario) {
        case 1: // Run out of time
            closeUI();
            drawImage("Raqqa");
            drawText("You're indesiciveness caused you and you're family to starve")
        case 2: // Smugeler running away with your money
            closeUI();
            drawImage("Raqqa")
            drawText(text)
        case 3: // Get lost in the jungle
            closeUI()
            drawText("You decide to escape by land through a jungle, you took a wrong turn, got lost and starved")

    }
}

function startTimer(time) {
    var timeleft = time;
    var TIMER = setInterval(function () {
        if (timeleft <= 0) {
            clearInterval(TIMER);
            document.getElementById("timer").innerHTML = 0.00;
            sleep(500);
            document.getElementById("timer").style.display = "none";
            gameLose(1);

        } else {
            document.getElementById("timer").innerHTML = `Time Left ${Math.floor(timeleft)}`;
        }
        timeleft -= 0.01;
    }, 10);
}

//bind the user interface elements to global variables and start a new game
function initializeGame(canvas, button1, button2, button3, button4, textEntry) {
    globalCanvas = canvas;
    globalButton1 = button1;
    globalButton2 = button2;
    globalButton3 = button3;
    globalButton4 = button4;
    globalTextEntry = textEntry;

    newGame();

}

//reset the UI elements and reset the story
function newGame(state) {

    closeUI();

    globalStoryState = "Intro";
    advanceStory();
}

//draw an image in the upper two thirds of the canvas.
//the image name is passed as a parameter and must be type
//png and have size 800 x 300 pixels
function drawImage(imageName) {
    try {
        var base_image = new Image();
        base_image.src = 'img/' + imageName + '.png';
        base_image.onload = function () {
            var ctx = globalCanvas.getContext("2d");
            ctx.drawImage(base_image, 0, 0);
        }
    }
    catch (e) {
        console.log("Failed to load : img/" + imageName + ".png does it exist?");
        console.log(e);
    }
}

//draw a text box in the lower thrid of the canvas
//pass the text to draw as a parameter and then parse that
//test into lines
function drawText(text) {
    var ctx = globalCanvas.getContext("2d");
    //fill the space with a white rectangle to overwrite previous text
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 300, 800, 500);
    //draw two black border rectangles
    ctx.rect(0, 300, 800, 500);
    ctx.stroke();
    ctx.rect(5, 305, 790, 190);
    ctx.stroke();

    //set the text font
    ctx.font = "20px Arial";
    ctx.fillStyle = "#000000";

    //all text must terminate in a space character
    text = text + " ";
    //print five lines
    for (var i = 0; i <= 5; i++) {
        //create a variable for each line
        var textLine = "";
        //fill that line with words until it reaches full length or all the text is used
        while (textLine.length < 85 && text.length > 1) {
            //find the next word
            var indexOfSpace = text.indexOf(" ");
            if (indexOfSpace >= 0) {
                //get the next word
                var nextWord = text.substr(0, indexOfSpace) + " ";
                //if the next word would not cause overflow to the next line, append it
                if (textLine.length + nextWord.length < 85) {
                    textLine = textLine + nextWord;
                    text = text.substr(indexOfSpace + 1, text.length);
                }
                //otherwise, skip the next word for now, it will go on the next line
                else {
                    break;
                }
            }
        }
        //var textLine = text.substr(0, 40);
        //text = text.substr(40, text.length);
        ctx.fillText(textLine, 30, 335 + 30 * i);
    }
    //if there is still text left, prompt a continue
    console.log(text);
}

//make the text box visible. optional parameter to enter
//default text into the textbox
function acceptText(text) {
    if (typeof text === 'undefined') { text = ""; }

    globalTextEntry.style.display = "initial";
    globalTextEntry.value = text;
}

//make button number buttonNumvber visible. 
//parameter text will change the text of the button
function setButton(buttonNumber, text) {
    if (buttonNumber == 1) {
        globalButton1.style.display = "initial";
        globalButton1.value = text;
    }
    else if (buttonNumber == 2) {
        globalButton2.style.display = "initial";
        globalButton2.value = text;
    }
    else if (buttonNumber == 3) {
        globalButton3.style.display = "initial";
        globalButton3.value = text;
    }
    else if (buttonNumber == 4) {
        globalButton4.style.display = "initial";
        globalButton4.value = text;
    }
}

//fires when one of the User Interface buttons is clicked
//pass the button number that was clicked to the story
//and reset the UI
//function toPause() {
//    isPaused = ! isPaused
//}

function captureButton(buttonNumber) {
    //if (!isPaused){
    closeUI();
    advanceStory(buttonNumber);
    //} else {
    //    pauseMenu();
    //}
}

//function pauseMenu(){
//Set background semi-transparent
//Nullifies all surrounding taps
//Settings?
//Saves --> gameState cookie.
//}
//reset the UI. Make all UI elements disabled
function closeUI() {
    globalButton1.style.display = "none";
    globalButton2.style.display = "none";
    globalButton3.style.display = "none";
    globalButton4.style.display = "none";
    globalTextEntry.style.display = "none";
}


//the game story
//
//optional parameter buttonNumber is the UI button that was clicked
//
//global variable globalStoryState keeps track of which step in the story the user has reached
//in each story stage, the image and/or text have to be reset with drawImage and drawText
//additionally, the UI needs to be set up as it closes after every user input.
function advanceStory(buttonNumber) {
    //the buttonNumber variable is an optional parameter, so set it to zero if it is unused
    if (typeof buttonNumber === 'undefined') { buttonNumber = 0; }

    if (globalStoryState == "Intro") {
        drawImage("homescreen");
        drawText("Your life is about to change forever. But first, who are you? Enter your name to start your Journey! In Migrant Trail, take on the role and face the hardship of a migrant fleeing conflict in Syria.");

        acceptText();
        setButton(1, "Enter your name");
        globalStoryState = "EnterName";

    }
    else if (globalStoryState == "EnterName") {
        if (globalTextEntry.value.length > 0) {
            globalPlayerName = globalTextEntry.value;
            startTimer(30);

            drawImage("Raqqa");
            drawText("You and your family have been laying low in Raqqa for years now. The Islamic State has murdered many of your friends and family but you're still hoping to keep a low profile. '" + globalPlayerName + "', your mom tells you, 'Your father has been taken by IS and I hear you're next. We need to leave. Now.' You pause briefly to reflect on the life you are leaving behind: ");

            setButton(1, "I was only a medical student, but I'm proud of the people I helped in our make-shift clinic");
            setButton(2, "I could only ever find odd-jobs even before things fell apart. Maybe there will be new opportunities ahead");
            setButton(3, "The hotel I used to work in is gone now, but I will miss the friends I made there");
            setButton(4, "Even though buisness has been good at the auto shop, if I need to leave then I need to leave");

            globalStoryState = "ChooseProfession";
        }
        else {
            drawText("Enter a name in the box below. Your name must be at least one character long.");
            acceptText();
            setButton(1, "Enter your name");
            globalStoryState = "EnterName";
        }

    }
    else if (globalStoryState == "ChooseProfession") {

        if (buttonNumber == 1) {
            globalPlayerProfession = "MedStudent";
        }
        else if (buttonNumber == 2) {
            globalPlayerProfession = "OddJobs";
        }
        else if (buttonNumber == 3) {
            globalPlayerProfession = "HotelClerk";
        }
        else if (buttonNumber == 4) {
            globalPlayerProfession = "Mechanic";

        }

        globalStoryState = "escape";
        advanceStory();

    }
    else if (globalStoryState == "escape") {
        drawImage("Raqqa")
        drawText("You need to find a way out!")
        setButton(1, "You decide to pay a smuggler to help you escape by sea")
        setButton(2, "You decide to escape by land ")

        if (buttonNumber == 1) {
            if (Math.floor(Math.random() * 2)) {
                closeUI();
                drawText("You decided to pay a smuggler and they ran away with your money")
            } else {
                globalStoryState = "ending";
                advanceStory()
            }
        }

        if (buttonNumber == 2) {
            if (Math.floor(Math.random() * 2)) {
                closeUI();
                gameLose(3)
            }
        }

        // FIXME - Not moving to ending state
        globalStoryState = "ending";
        advanceStory()
    }

    else if (globalStoryState == "ending") {

        if (globalPlayerProfession == "MedStudent" && Math.floor(Math.random() * 2)) {
            drawText("You made it to Turkery where you got a job as a doctor");
        }

        else if (globalPlayerProfession == "HotelClerk" && Math.floor(Math.random() * 2)) {
            drawText("You made it to Turkery where you got a job as a Hotel Clerk");
        }

        else if (globalPlayerProfession == "Mechanic" && Math.floor(Math.random() * 2)) {
            drawText("You made it to Turkery where you got a job as a Mechanic");
        }
        else if (globalPlayerProfession == "OddJobs" && Math.floor(Math.random() * 5) > 4) {
            drawText("You made it to Turkey where you someone you knew helped you get in illegally")
        }

    }

    else {
        //entered an invalid story state
        console.log("Story State Not Found: " + globalStoryState);
    }
}

function urldecode(str) {
    return decodeURIComponent((str + '').replace(/\+/g, '%20'));
}

const save = () => {
    if (globalStoryState == "Intro") return

    let payload = JSON.stringify({
        name: globalPlayerName,
        profession: globalPlayerProfession,
        storyState: globalStoryState
    })


    axios.post('/api/save', {
        save: payload
    })
        .then(function (response) {
            console.log(response);
        })
        .catch(function (error) {
            console.log(error);
        });

    console.log(payload)
}

const load = () => {
    if (!document.cookie) return;

    let gameInfo = JSON.parse(urldecode(document.cookie.replace("save=", "")));

    console.log(gameInfo);

    //  closeUI();

    globalPlayerProfession = gameInfo.profession;
    globalPlayerName = gameInfo.name;
    globalStoryState = gameInfo.storyState;

    closeUI();
    console.log(globalStoryState);
    advanceStory();
}