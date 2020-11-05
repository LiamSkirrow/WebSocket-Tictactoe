/* implementation of the game logic for multiplayer TicTacToe */

$(document).ready(() => {
    var socket = io.connect('http://localhost:3000') //establish a socket connection with the server
    var cellLen = 75;       //the tictactoe grid width/height
    var horizLen = 3;       //how many cells fit horizontally within the canvas element
    var vertLen = 3;        //how many cells fit vertically within the canvas element
    var index;              //used later to find a specific cell in a list of cells
    var identity;           //unique player identity

    //clone the cell elements and create the grid
    for(var j = 0; j < vertLen; j++){    
        for(var i = 0; i < horizLen; i++){
            if(i===0 && j===0)
            tmp = $("#cell");
            else{
                tmp = $("#cell").clone();
                tmp.appendTo("#canvas");
            }
            tmp.css({top: j*cellLen, left: i*cellLen});
        }
    }
    
    //fire a sendMessage event when the submitButton is clicked
    $("#submitButton").click(function(e) {
        e.preventDefault(); // prevents page reloading
        var msg = $("#message").val();

        var elem = $('<li>').css('background-color', 'white');
        $("#messageList").append($(elem).text(msg));

        //send message to server
        socket.emit('sendMessage', msg);

        $("#message").val('');
        return false;
    });

    //handle message receiving
    socket.on('received message', (msg) => {
        //console.log("Opponent: " + msg);
        var elem = $('<li>').css('background-color', '#eee');
        $("#messageList").append($(elem).text(msg));
    });


    //maybe include 'user is typing' feature. Include another event listener, which fires off an event,
    //when someone is entering text in the message box


    //your turn, turn back on the click event handler 
    socket.on('your turn', () => {

        //update chat console
        //var elem = $('<li>').css('background-color', 'grey');
        //set italics here!
        //$("#messageList").append($(elem).text("Server: your turn"));

        $("#whoseTurn").text("Your turn");

        //'click' event handler for each cell
        $(".cells").on('click', function turnHandler() {
            //console.log("cell clicked!"); //find a way to uniquely identify each div
            
            //check if the cell is valid
            if( $(this).css('background-color') === "rgb(255, 255, 255)" ){
                //console.log("valid cell clicked");
                $(this).css('background-color', 'green');

                //loop over the class list and check which index 'this' belongs to, which is the index to be sent
                //over to the server            
                var classList = document.getElementsByClassName("cells");
                for(index = 0; index < classList.length; index++){
                    if(classList[index] === this){
                        //console.log(index);
                        break;
                    }
                }
                //turn off the click event handler at the end of the users go
                $(".cells").off('click');

                //send 'index' over to the server
                socket.emit('cell clicked', index, identity);
                checkForWinner();
                
                //update chat console
                //var elem = $('<li>').css('background-color', 'grey');
                //set italics here!
                //$("#messageList").append($(elem).text("Server: opponents turn"));

                $("#whoseTurn").text("Opponents turn");
            } 
        });
    });

    //the handler for the opponent's cell selection
    socket.on('opponent', (index) => {
        //console.log("opponent selected cell: " + index);
        var classList = $(".cells");
        $(classList[index]).css('background-color', 'red');
    });

    //get the unique player ID, which distinguishes the player from the opponent
    socket.on('socket ID', (ID) => {
        identity = ID;
        console.log("ID: " + identity);
    });

    //event handler for the 'lose' case
    socket.on('lose', () => {
        //console.log("You lose!");
        var elem = $('<li>').css('background-color', 'grey');   
        $("#messageList").append($(elem).text("Server: You Lose!"));
    });

    //the game has finished, 
    socket.on('end', () => {
        //console.log("game finished");
        $(".cells").off('click');
        $(".cells").css("background-color", "white");

        //TODO: allow the game to be restarted via a button + voting system, update variables keeping track of wins and losses in this session
        //TODO: alternative: automatically restart the game after a few seconds, no buttons at all...
    });

    //check for 3 cells in a row
    function checkForWinner(){
        var classList = $(".cells");
        var v = 0, h = 0, d = 0;

        loop:
        for(var i = 0; i < vertLen; i++){
            h = v = d = 0;   //reset dummy variables to zero
            for(var j = 0; j < horizLen; j++){

                //console.log( $(classList[i*vertLen + j]).css('background-color') );

                //check horizontally
                if($(classList[i*vertLen + j]).css('background-color') === "rgb(0, 128, 0)" ){
                    h++;
                }
                //check vertically
                if($(classList[j*vertLen + i]).css('background-color') === "rgb(0, 128, 0)" ){
                    v++;
                }
                //check diagonally
                if($(classList[0]).css('background-color') === "rgb(0, 128, 0)" && $(classList[4]).css('background-color') === "rgb(0, 128, 0)" && $(classList[8]).css('background-color') === "rgb(0, 128, 0)"){
                    d = 3;
                }
                //check diagonally
                else if($(classList[2]).css('background-color') === "rgb(0, 128, 0)" && $(classList[4]).css('background-color') === "rgb(0, 128, 0)" && $(classList[6]).css('background-color') === "rgb(0, 128, 0)"){
                    d = 3;
                }

                if(h === 3 || v === 3 || d === 3){
                    var elem = $('<li>').css('background-color', 'grey');
                    $("#messageList").append($(elem).text("Server: You Win!"));
                    socket.emit('winner');

                    break loop;
                }
            }
        }
    }
});
