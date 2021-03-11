// Global UI variables
const canvas = document.querySelector ("#canvas"); 

const timerText = document.querySelector ("#timer"); 

const button1 = document.querySelector ("#button1"); 
const button2 = document.querySelector ("#button2"); 
const button3 = document.querySelector ("#button3"); 
const button4 = document.querySelector ("#button4"); 

const nameInput = document.querySelector ("#nameInput"); 

const saveButton = document.querySelector ("#save")

// Global debug variables
const debutTextInput = document.querySelector ("#debugTextInput"); 
const debutSendCommand = document.querySelector ("#debugSendCommand"); 
const debutTextOutput = document.querySelector ("#debugTextOutput"); 

// Global game variables
let timer = 0; 

let storyState = ""; // Keeps track of which step in the story the user has reached
let playerName = ""; 
let playerProfession = ""; 

const sleep = (ms) => { return new Promise(resolve => setTimeout(resolve, ms)); }

// Reset UI and story
let newGame = ()  =>
{
    resetUI();

    storyState = "Intro";

    load()
    advanceStory();
}

// Draw image in upper two thirds of canvas
// Image name passed as a parameter
// Must be png and have size 800x300 pixels
let drawImage = (imageName) =>
{
    try 
    {
        let image = new Image();
        image.src = 'img/' + imageName + '.png';
        image.onload = () => { canvas.getContext("2d").drawImage(image, 0, 0); }
    }
    catch (error) 
    {
        console.log("Failed to load : img/" + imageName + ".png");
        console.log(error);
    }
}

// Draw textbox in lower thrid of canvas
// Pass text as parameter then parse to lines
let drawText = (text) => 
{
    const ctx = canvas.getContext("2d"); 
    // Fill space white to overwrite previous text
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 300, 800, 500);
    // Draw two black border rectangles
    ctx.rect(0, 300, 800, 500);
    ctx.stroke();
    ctx.rect(5, 305, 790, 190);
    ctx.stroke();

    // Set text font
    ctx.font = "20px Arial";
    ctx.fillStyle = "#000000";

    // All text must end in space
    text = text + " ";

    // Print five lines
    for (let i = 0; i <= 5; i++) {
        // Create variable for each line
        let textLine = "";
        // Fill line with words until it reaches full length or all text used
        while (textLine.length < 85 && text.length > 1) {
            // Get find the next word
            let indexOfSpace = text.indexOf(" ");

            if (indexOfSpace >= 0) 
            {
                // Get next word
                let nextWord = text.substr(0, indexOfSpace) + " ";

                // append next word if it won't cause overflow
                if (textLine.length + nextWord.length < 85) 
                {
                    textLine = textLine + nextWord;
                    text = text.substr(indexOfSpace + 1, text.length);
                }
                else
                    break;
            }
        }
        
        ctx.fillText(textLine, 30, 335 + 30 * i);
    }
    //if there is still text left, prompt a continue
    console.log(text);
}

// Game story
// Optional parameter buttonNumber is the UI button that was clicked
// Each story stage image and text have to be reset with drawImage and drawText
// UI needs to be set up as it closes after every user input
let advanceStory = (buttonNumber) => 
{
    if (typeof buttonNumber === 'undefined') 
        buttonNumber = 0; 

    clearInterval(timer);

    if (storyState == "Intro") 
    {
        drawImage("homescreen");
        drawText("Your life is about to change forever. But first, who are you? Enter your name to start your Journey! In Migrant Trail, take on the role and face the hardship of a migrant fleeing conflict in Syria.");

        acceptText();
        setButton(1, "Enter your name");
        storyState = "EnterName";
    }
    else if (storyState == "EnterName") 
    {
        if (nameInput.value.length > 0) 
        {
            playerName = nameInput.value;

            startTimer(30);

            drawImage("Raqqa");
            drawText("You and your family have been laying low in Raqqa for years now. The Islamic State has murdered many of your friends and family but you're still hoping to keep a low profile. '" + playerName + "', your mom tells you, 'Your father has been taken by IS and I hear you're next. We need to leave. Now.' You pause briefly to reflect on the life you are leaving behind: ");

            setButton(1, "I was only a medical student, but I'm proud of the people I helped in our make-shift clinic");
            setButton(2, "I could only ever find odd-jobs even before things fell apart. Maybe there will be new opportunities ahead");
            setButton(3, "The hotel I used to work in is gone now, but I will miss the friends I made there");
            setButton(4, "Even though buisness has been good at the auto shop, if I need to leave then I need to leave");

            storyState = "ChooseProfession";
        }
        else 
        {
            drawText("Enter a name in the box below. Your name must be at least one character long.");
            acceptText();
            setButton(1, "Enter your name");
            storyState = "EnterName";
        }
    }
    else if (storyState == "ChooseProfession") {

        if (buttonNumber == 1) 
            playerProfession = "MedStudent";
        else if (buttonNumber == 2) 
            playerProfession = "OddJobs";
        else if (buttonNumber == 3) 
            playerProfession = "HotelClerk";
        else if (buttonNumber == 4) 
            playerProfession = "Mechanic";

        storyState = "escape";
        advanceStory();
    }
    else if (storyState == "escape") {
        drawImage("Raqqa")
        drawText("You need to find a way out!")
        setButton(1, "You decide to pay a smuggler to help you escape by sea")
        setButton(2, "You decide to escape by land")

        if (buttonNumber == 1) 
        {
            if (Math.floor(Math.random() * 2))
                gameLose(2)
            else 
                storyState = "ending";
        }

        if (buttonNumber == 2) {
            if (Math.floor(Math.random() * 2))
                gameLose(3)
            else
                storyState = "ending";
        }
    } 
    else if (storyState == "ending") 
    {
        if (playerProfession == "MedStudent" && Math.floor(Math.random() * 2))
            drawText("You made it to Turkery where you got a job as a doctor");
        else if (playerProfession == "HotelClerk" && Math.floor(Math.random() * 2))
            drawText("You made it to Turkery where you got a job as a Hotel Clerk");
        else if (playerProfession == "Mechanic" && Math.floor(Math.random() * 2))
            drawText("You made it to Turkery where you got a job as a Mechanic");
        else if (playerProfession == "OddJobs" && Math.floor(Math.random() * 5) > 4) 
            drawText("You made it to Turkey where you someone you knew helped you get in illegally")
    }
    else
        console.log("Story state " + storyState + " not found");
}

// Make nameInput textbox visible. 
// Optional parameter for default text
let acceptText = (text) => 
{
    if (typeof text === 'undefined') { text = ""; }

    nameInput.style.display = "initial"; 
    nameInput.value = text; 
}

// Make button buttonNumvber visible. 
// Updates text of button
let setButton = (buttonNumber, text) => 
{
    if (buttonNumber == 1) 
    {
        button1.style.display = "initial";
        button1.value = text;
    }
    else if (buttonNumber == 2) 
    {
        button2.style.display = "initial";
        button2.value = text;
    }
    else if (buttonNumber == 3) 
    {
        button3.style.display = "initial";
        button3.value = text;
    }
    else if (buttonNumber == 4) 
    {
        button4.style.display = "initial";
        button4.value = text;
    }
}

let startTimer = (time) =>
{
    let timeleft = time;

    let TIMER = setInterval(() => {
        timer = TIMER;
        if (timeleft <= 0) 
        {
            clearInterval(TIMER);
            timerText.innerHTML = 0.00;
            sleep(500);
            // timerText.style.display = "none";
            gameLose(1);
        } 
        else 
            timerText.innerHTML = timeleft;
        
        timeleft -= 1;
    }, 1000);
}

//parse the text in the debug text input box to assign global variable values and/or trigger game states
//One variable assign per line. Assigning globalStoryState also triggers a reset of the story state
//
// for example:
//  globalPlayerName = "David"
//  globalStoryState = "EnterName"
// would set the two global variables and reset the story state by calling advanceStory();
// function debugSendCommand() {
//     var cmd = globalDebugTextInput.value;
//     var setStoryState = false;
//     do {
//         //split the debug text into single lines
//         var indexOfNewLine = cmd.indexOf("\n");
//         //include the last line without a newline character
//         if (indexOfNewLine < 0) { indexOfNewLine = cmd.length; }
//         var line = cmd.substr(0, indexOfNewLine);
//         //check to see if the line follows the format "variable = value"
//         if (line.includes("=")) {
//             //pull the variable name and value
//             var variable = line.substr(0, line.indexOf("="));
//             //do not allow any non-alphanumeric characters in the variable name;
//             variable = variable.replace(/\W|_/g, "");
//             var value = line.substr(line.indexOf("=") + 1, line.length);
//             value = value.trim();
//             //only allow editing of variables that are global and start with the keyword "global"
//             if (variable.substring(0, 6) == "global") {
//                 try {
//                     //set variable = value
//                     eval(variable + " = " + value);
//                     //if the variable was globalStoryState, also flag a reset of the story later
//                     if (variable == "globalStoryState") { setStoryState = true; }
//                     //debugLog("Set " + variable + " to " + value);
//                 }
//                 catch (e) {
//                     //debugLog("Failed to evaluate: " + variable + " = " + value + "\nIs " + variable + " a global variable?");
//                     //debugLog(e);
//                 }
//             }
//         }
//         cmd = cmd.substr(indexOfNewLine + 1, cmd.length);
//     } while (cmd.length > 0);

//     //if globalStoryState was changed, reset the story
//     if (setStoryState) {
//         advanceStory();
//     }
// }

//fires when one of the User Interface buttons is clicked
//pass the button number that was clicked to the story
//and reset the UI
//function toPause() {
//    isPaused = ! isPaused
//}

let captureButton = (buttonNumber) =>
{
    resetUI();
    advanceStory(buttonNumber); 
}

let resetUI = ()  =>
{
    button1.style.display = "none";
    button2.style.display = "none";
    button3.style.display = "none";
    button4.style.display = "none";
    nameInput.style.display = "none";
}

let gameLose = (scenario) =>
{
    resetUI();

    // timerText.style.display = "none";

    switch (scenario) 
    {
        case 1:
            drawImage("Raqqa");
            drawText("You're indesiciveness caused you and you're family to starve")
        case 2: 
            drawImage("Raqqa")
            drawText("The smuggler stole your money, are left stranded")
        case 3: 
            drawImage("Raqqa")
            drawText("You decide to escape by land through a jungle, you took a wrong turn, got lost and starved")
    }
}

let urldecode = (str) => { return decodeURIComponent((str + '').replace(/\+/g, '%20')); }

const save = () => {
    if (storyState == "Intro") return

    let payload = JSON.stringify
    ({
        name: playerName,
        profession: playerProfession,
        storyState: storyState
    })

    /*
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
    */


    return document.cookie = `save=${JSON.stringify(payload)}`
}

const load = () => {
    if (!document.cookie) return;

    let data = document.cookie.replace("save=", "");
    let gameInfo = JSON.parse(JSON.parse(data));

    console.log(gameInfo);

    playerProfession = gameInfo.profession;
    playerName = gameInfo.name;
    storyState = gameInfo.storyState;

    resetUI();
    console.log(storyState);
    advanceStory();
}



button1.addEventListener("click", () => { captureButton (1); });
button2.addEventListener("click", () => { captureButton (2); });
button3.addEventListener("click", () => { captureButton (3); });
button4.addEventListener("click", () => { captureButton (4); });

saveButton.addEventListener("click", () => { save (); });

newGame(); 
load(); 