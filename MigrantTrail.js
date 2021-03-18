// Global UI variables
const canvas = document.querySelector ("#canvas"); 

const timerText = document.querySelector ("#timer"); 
const choiceButtons = document.querySelectorAll (".choiceButtons"); 
const inputField = document.querySelector ("#nameInput"); 

const saveButton = document.querySelector ("#save")
const restartButton = document.querySelector ("#restart"); 

// Global game variables
let timeLeft = 0; 
let countdown = 0; // Holds setInterval state

const FADETIME = 400; // Choice button fade length in milliseconds

let playerName = ""; 
let profession = ""; 
let storyStage = 0; 

// STORY STRUCTURE
// Each story stage, input field and all buttons disabled
// Call setImage, setText, setInputField, or setButton to enable required elements for stage
// Odd storyState used for displaying data. End odd storyStages with storyStage++ and advanceStory ()
// Even storyState used for getting input. End even storyStages with storyStage++ and advanceStory ()
const advanceStory = (buttonIndex) => 
{
    switch (storyStage) {
        case 0:
            console.log ("DISPLAY Enter Name")
            setImage ("homescreen"); 
            setText ("Your life is about to change forever. But first, who are you? Enter your name to start your Journey! In Migrant Trail, take on the role and face the hardship of a migrant fleeing conflict in Syria."); 
            setInputField (); 
            setButton (1, "Enter your name"); 
            storyStage++; 
            break;
        case 1:
            console.log ("INPUT Enter Name")
            if (inputField.value.length > 0) 
            {
                playerName = inputField.value;
                
                startTimer(); 
                
                storyStage ++; 
                advanceStory (); 
            }
            else
            {
                setImage ("homescreen");
                setText("Enter a name in the box below. Your name must be at least one character long.");
                setInputField();
                setButton(1, "Enter your name");
            }
            break; 
        case 2: 
            console.log ("DISPLAY professions"); 
            setImage("Raqqa");
            setText("You and your family have been laying low in Raqqa for years now. The Islamic State has murdered many of your friends and family but you're still hoping to keep a low profile. '" + playerName + "', your mom tells you, 'Your father has been taken by IS and I hear you're next. We need to leave. Now.' You pause briefly to reflect on the life you are leaving behind: ");
            setButton(1, "I was only a medical student, but I'm proud of the people I helped in our make-shift clinic");
            setButton(2, "I could only ever find odd-jobs even before things fell apart. Maybe there will be new opportunities ahead");
            setButton(3, "The hotel I used to work in is gone now, but I will miss the friends I made there");
            setButton(4, "Even though buisness has been good at the auto shop, if I need to leave then I need to leave");
            storyStage++; 
            break; 

        case 3: 
            console.log ("INPUT professions"); 
            if (buttonIndex == 1) profession = "MedStudent"; 
            if (buttonIndex == 2) profession = "OddJobs"; 
            if (buttonIndex == 3) profession = "HotelClerk"; 
            if (buttonIndex == 4) profession = "Mechanic"; 
            storyStage ++; 
            advanceStory (); 
            break; 
        case 4: 
            console.log ("DISPLAY Escape Options"); 
            setImage("Raqqa"); 
            setText("You need to find a way out!"); 
            setButton(1, "You decide to pay a smuggler to help you escape by sea"); 
            setButton(2, "You decide to escape by land"); 
            storyStage++; 
            break; 
        case 5: 
            console.log ("INPUT Escape Options"); 

            if (Math.floor (Math.random () * 2) == 0)
                gameOver (buttonIndex == 1 ? 2 : 3); 
            else
            {
                storyStage ++; 
                advanceStory (); 
            }
            break; 
        case 6: 
            console.log ("DISPLAY Success"); 
            if (profession == "MedStudent") setText("You made it to Turkery where you got a job as a doctor");
            else if (profession == "HotelClerk") setText("You made it to Turkery where you got a job as a Hotel Clerk");
            else if (profession == "Mechanic") setText("You made it to Turkery where you got a job as a Mechanic");
            else setText("You made it to Turkey where you someone you knew helped you get in illegally"); 
            setTimer (timeLeft); // Stop timer
            break; 
        default:
            console.log("Story state " + storyStage + " not found"); 
            break; 
    }
}

// Reset UI and story
const newGame = ()  =>
{
    setTimer (30); 

    choiceButtons.forEach(button => // If restart button used, need to reset default classes
    {
        button.className = ""; 
        button.classList.add ("choiceButtons", "fadedOut"); 
    });

    inputField.className = ""; 
    inputField.classList.add ("fadedOut"); 
    
    resetUI(); 

    storyStage = 0;

    inputField.value = ""; 
    
    load()
    advanceStory(); 
}

// Draw image in upper two thirds of canvas
// Must be png and have size 800x300 pixels
const setImage = (imageName) =>
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
const setText = (text) => 
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
}

// Enables input field
const setInputField = () => 
{
    if (storyStage != 0)
        setTimeout(() => { fadeIn (inputField); }, FADETIME); 
    else
        fadeIn (inputField); 
}

// Enables button and updates text
const setButton = (buttonIndex, text) => 
{
    if (storyStage != 0)
    {
        setTimeout(() => 
        { 
            fadeIn (choiceButtons [buttonIndex - 1]); 
            choiceButtons [buttonIndex - 1].value = text; 
        }, FADETIME); 
    }
    else
    {
        fadeIn (choiceButtons [buttonIndex - 1]);
        choiceButtons [buttonIndex - 1].value = text; 
    }
}

// Capture button input
let captureButton = (buttonNumber) =>
{
    resetUI();
    advanceStory(buttonNumber); 
}

// Disable choice buttons and name input
let resetUI = ()  =>
{
    choiceButtons.forEach((button, index) => 
    { 
        if (!button.classList.contains ("fadedOut"))
            fadeOut (button); 
    });

    if (!inputField.classList.contains ("fadedOut"))
        fadeOut (inputField); 
}

// Start countdown from timeLeft
const startTimer = () =>
{
    countdown = setInterval(() => 
    {
        timeLeft -= 1;
        timerText.innerHTML = timeLeft;
        
        if (timeLeft <= 0) 
            gameOver(1); 
    }, 1000);
}

// Pause timer and set timeLeft
let setTimer = (time) =>
{
    clearInterval (countdown); 
    timeLeft = time; 
    timerText.innerHTML = timeLeft; 
}

// Game over with different scenarios
let gameOver = (scenario) =>
{
    resetUI();

    setTimer (timeLeft); 

    setImage("Raqqa")

    switch (scenario)
    {
        case 1:
            setText("You're indesiciveness caused you and your family to starve"); 
            break; 
        case 2: 
            setText("The smuggler stole your money, are left stranded"); 
            break; 
        case 3: 
            setText("You decide to escape by land through a jungle, you took a wrong turn, got lost and starved"); 
            break; 
        default: 
            console.log ("Unexpected game over scenario"); 
            break; 
    }
}

// Save game state with cookies
const save = () => 
{
    if (storyStage == "Intro") return; 

    let payload = JSON.stringify
    ({
        nameData: playerName,
        professionData: profession,
        storyStateData: (storyStage % 2 == 0) ? storyStage : storyStage - 1, 
        timeLeftData: timeLeft
    })

    document.cookie = `data=${payload}`;  
}

// Load game state from cookies
const load = () => 
{
    if (!document.cookie) return; 

    let gameInfo = JSON.parse(document.cookie.replace("data=", "")); 

    profession = gameInfo.professionData; 
    playerName = gameInfo.nameData;
    storyStage = gameInfo.storyStateData;
    
    setTimer (gameInfo.timeLeftData); 

    if (storyStage > 1)
        startTimer ();
}

// Reset game state and cookies
const restart = () =>
{
    // Reset cookies
    document.cookie.split(";").forEach(cookie => 
    {
        let name = cookie.indexOf("=") > -1 ? cookie.substr(0, cookie.indexOf("=")) : cookie; 
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT"; 
    });

    newGame ()
}

// Fades in given HTML element
const fadeIn = (element) =>
{
    element.classList.add ("fadeIn"); 
    element.classList.remove ("fadedOut"); 

    setTimeout(() => 
    {
        element.classList.add ("fadedIn"); 
        element.classList.remove ("fadeIn"); 
    }, FADETIME);
}

// Fades out given HTML element
const fadeOut = (element) =>
{
    element.classList.add ("fadeOut"); 
    element.classList.remove ("fadedIn"); 

    setTimeout(() => 
    {
        element.classList.add ("fadedOut"); 
        element.classList.remove ("fadeOut"); 
    }, FADETIME); 
}

// Add event listeners to buttons
choiceButtons [0].addEventListener("click", () => { captureButton (1); });
choiceButtons [1].addEventListener("click", () => { captureButton (2); });
choiceButtons [2].addEventListener("click", () => { captureButton (3); });
choiceButtons [3].addEventListener("click", () => { captureButton (4); });

saveButton.addEventListener("click", () => { save (); });
restartButton.addEventListener("click", () => { restart (); });

newGame(); 