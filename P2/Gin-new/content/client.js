/**
 * To do : hide stock card
 * to do : back to list
 * to do : knock
 * 
 * there is a long network delay sometimes which will lead to a invisiable player' deck, 
 * but sometimes wait for a while it will show
 * especially when using the google chrome. 
 */

var playerID; 
var userName2;
var userName1;

/**
 *  Set Gin Page, submitmelds and cancle function
 */

 var declareGin = function (playerID, gameID){

    fetch('/getTurn/' + gameID)
    .then(res => res.text())
    .then(turn => {
        if((playerID == 1 && turn == "true") || (playerID == 2 && turn == "false")){
            document.getElementById('gin-page').style.visibility = "visible";
            document.getElementById('game-page').style.visibility = "hidden";


            let dropzones = document.querySelectorAll('.dropzone');
            let cards = document.getElementById("player-deck").innerHTML;
            let deadwood = document.getElementById('deadwood');
            deadwood.innerHTML = 'DeadWood'+cards;
            let dragcards = deadwood.children;
            let theCard; 

            for( let i = 0; i < dragcards.length; i ++){
                //console.log(dragcards[i])
                dragcards[i].setAttribute("draggable", "true")
                dragcards[i].addEventListener('dragstart', function(){theCard = this; })
                dragcards[i].addEventListener('dragend', function(){})
            }

            for(let j = 0; j < dropzones.length; j++){
                dropzones[j].addEventListener('dragover', function(e){e.preventDefault();})
                dropzones[j].addEventListener('dragenter', function(e){e.preventDefault();})
                dropzones[j].addEventListener('dragleave', function(e){e.preventDefault();})
                dropzones[j].addEventListener('drop', function(){this.appendChild(theCard);})
            }   
        }else{
            alert('Not your turn')
        }
    })    
} 

var submitMelds = function(playerID, gameID){
    let result = false; 
    let meldsCounter = 0;

    for(let i = 1; i < 4; i++ ){
        let meld = document.querySelector(`#meld${i}`);
        let cards = meld.children
        let values = [];
    
        if(cards.length == 3 || cards.length == 4){

            for( let x = 0; x < cards.length; x++){
                values.push(parseInt(cards[x].classList[1]));
            }
            values.sort((a,b) => (a > b) ? 1 : -1);
            console.log(values);

            for(let j = 0; j < cards.length - 1; ){

                if (values[j]+1 == values[j+1]){ 
                    j++;
                    console.log(`cards turn ${j} good`)

                }else if(values[j] == values[j+1]){
                    j++;
                    console.log(`cards turn ${j} good`)
                }else{
                    alert('Cannot Gin')
                    return
                }

                if(j == cards.length - 1){
                    meldsCounter++; 
                    console.log(`meld ${i} good`)
                }
            }

        }else{
            alert('Illegal submit');
            return 'illegal';
        }
    }    
    
    if(meldsCounter == 3){
        console.log('win')
        result = true
    }else{
        console.log('error')
        return 'error';
    }  

    if(result){
        fetch('/getResults/' + gameID +'/' + playerID + '/' + result.toString)
        .then(res => res.json())
        .then((decks) => {
            console.log(decks.cards[0]);
            document.body.innerHTML = "";
            let h1 = document.createElement('h1');
            h1.innerHTML = `Player `
            document.body.appendChild(h1);
        
            let h2A = document.createElement('h2');
            let h2B = document.createElement('h2');
        
            h2A.innerHTML = 'Player 1\'s Hand';
            h2B.innerHTML = 'Player 1\'s Hand';
            
            playerID == 1 ? h2A.innerHTML += '(ME)' : h2B.innerHTML += '(ME)';
            result ? h2A.innerHTML += ' WINNER' : h2B.innerHTML += ' WINNER';
            h2A.setAttribute('class', 'h2A');
            h2B.setAttribute('class', 'h2B');

            if(playerID == 1){
                cards = decks.cards[0];
                showCards(cards);
            }
            if(playerID == 2){
                showCards(cards);
            }

//To do this should set a interval and try to use displayhand function 
            var showCards = function(playerID, cards){
                for (let i = 0; i < cards.length; i++) { 
                    cards.sort((a,b) => (a.value > b.value) ? 1 : -1)
            
            
                        let card = document.createElement("div");
                        let x = cards[i]
                        //TEST: console.log(cards, x);
                        card.setAttribute('class', 'card');
                        card.onclick = () => changeCard(x, decks, playerID, gameID);
                        card.setAttribute('id', `${cards[i].value}${cards[i].suit}`);
                        card.classList.add(`${cards[i].value}`);
            
                        let ascii_char; 
                        if(cards[i].suit == 'Diamonds'){
                            ascii_char = '&#9826;';
                        } else if (cards[i].suit == 'Hearts'){
                            ascii_char = '&#9825;';
                        } else if (cards[i].suit == 'Spades'){
                            ascii_char = '&spades;';
                        } else if (cards[i].suit == 'Clubs'){
                            ascii_char = '&clubs;';            			
                        }
            
                        //if(decks == "stock-deck"){
                        //    card.innerHTML = ""
                        //}else{
                            card.innerHTML = '' + cards[i].name + '' + ascii_char + '';
                        //}

                        if(playerID == 1){
                            document.getElementById(`${decks}`).appendChild(card);         
                        }else{
                            document.getElementById(`${decks}`).appendChild(card);         
                        }
                    
                }
            }
 



            h2A.innerHTML += cards.cards[0];
            h2B.innerHTML += cards.cards[1];

            document.body.appendChild(h2A);
            document.body.appendChild(h2B);

        })
    }           
}

var cancleGin = function(){
    document.getElementById('gin-page').style.visibility = "hidden";
    document.getElementById('game-page').style.visibility = "visible";
    document.getElementById('deadwood').innerHTML = 'Deadwood';
    document.getElementById('meld1').innerHTML = 'Meld 1';
    document.getElementById('meld2').innerHTML = 'Meld 2';
    document.getElementById('meld3').innerHTML = 'Meld 3';
}


/**
 * set player1 page
 * when there is a player2, use interval function 
 * to get player1's cards, stock cards, and discard pile
 */
var startGame = function(){
    fetch('/startGame')
    .then(res => res.text())
    .then((gameID) => {
        // TEST: console.log(gameID); 
        // set html page
        userName1 = prompt("Please enter your name: ");

        document.getElementById('buttons').innerHTML = ""; 
        document.getElementById('list').innerHTML = ""; 
        
        let gameTitle = document.createElement("h2");
        gameTitle.innerHTML = "Game ID is " + gameID
        document.getElementById('titles').appendChild(gameTitle); 

        let playerTitle = document.createElement("h2");
        playerTitle.setAttribute("id", "p1turn")
        playerTitle.innerHTML = `${userName1}, It's Your Turn`;
        document.getElementById('titles').appendChild(playerTitle);

        let waitSlogan = document.createElement("h3");
        waitSlogan.setAttribute("id", "waitSign");
        waitSlogan.innerHTML = "Wait for another player ...";
        document.getElementById('titles').appendChild(waitSlogan);

        let gin = document.getElementById("gin");
        gin.onclick = () => declareGin(1, gameID);

        let submit = document.getElementById("submit");
        submit.onclick = () => submitMelds(1, gameID);

        //interval function to get cards 
        let getPlayer1Deck = function() {
            //TEST: console.log('1')
            fetch('/player1deck/' + gameID)
            .then((res) => res.json())
            .then(player1deck => {
                document.getElementById('waitSign').innerHTML = "";
                document.getElementById('player-deck').innerHTML = "";
                document.getElementById('discard-deck').innerHTML = "";
                document.getElementById('stock-deck').innerHTML = "";

                //console.log(player1deck[1][0].p1turn);

                if(player1deck[1][0].p1turn == true){
                    document.getElementById('p1turn').innerHTML = `${userName1}, It's Your Turn`
                }else{
                    document.getElementById('p1turn').innerHTML = "Player 2's Turn"
                }

                if(player1deck[2][0].winner == 1){
                    clearInterval(intervalId);

                }else if(player1deck[2][0].winner == 2){
                    clearInterval(intervalId);
                }

                displayHand(player1deck[0][0], "player-deck", gameID, 1);
                displayHand(player1deck[0][1], "stock-deck", gameID, 1);
                displayHand(player1deck[0][2], "discard-deck", gameID, 1);

                //clearInterval(intervalId);
            });
            //TEST: console.log('getPlayer1Deck')

        }
        let intervalId = setInterval(getPlayer1Deck, 1000);
    });
}


/**
 * set game list 
 */
var getList = function(){
    fetch('/getList')
    .then(res => res.json())
    .then(gameIDs => {
        //TEST: console.log(gameIDs)
        let gameList = document.getElementById("list")
        gameList.innerHTML = "";
        for (let i = 0; i < gameIDs.length; i ++ ){
            //TEST: console.log(games[i].gameIDs)
            let li = document.createElement("li");
            li.setAttribute("id", gameIDs[i]);
            li.onclick = () => joinGame(li.id);
            li.innerHTML = gameIDs[i];
            document.getElementById("list").appendChild(li)
        }
    })
}


/**
 * when there is a player2, fetch player2's cards, stock cards, discard pile and set html page
 * to do : forbid other players to get into this game
 */

var joinGame = function(gameID){
    // set html page
    userName2 = prompt("Please enter your name: ");
    document.getElementById('buttons').innerHTML = ""; 
    document.getElementById('list').innerHTML = ""; 
    
    let gameTitle = document.createElement("h2");
    gameTitle.innerHTML = "Game ID is " + gameID
    document.getElementById('titles').appendChild(gameTitle); 

    let playerTitle = document.createElement("h2");
    playerTitle.setAttribute("id", "p2turn")
    playerTitle.innerHTML = 'Player 1\'s Turn';
    document.getElementById('titles').appendChild(playerTitle);

    let gin = document.getElementById("gin");
    gin.onclick = () => declareGin(2, gameID);

    let knock = document.getElementById("knock");
    knock.onclick = () => knockMelds(2, gameID);

    let submit = document.getElementById("submit");
    submit.onclick = () => submitMelds(2, gameID);

    //set interval function
    let getPlayer2Deck = function() {
        fetch('/joinGame/' + gameID)
        .then(res => res.json())
        .then(player2deck => {
            //TEST: console.log(player2deck)
            document.getElementById('player-deck').innerHTML = "";
            document.getElementById('discard-deck').innerHTML = "";
            document.getElementById('stock-deck').innerHTML = "";

            if(player2deck[1][0].p1turn != true){
                document.getElementById('p2turn').innerHTML = `${userName2} It's Your Turn`
            }else{
                document.getElementById('p2turn').innerHTML = "Player 1's Turn"
            }

            if(player2deck[2][0].winner == 1){
                clearInterval(intervalId);

            }else if(player2deck[2][0].winner == 2){
                clearInterval(intervalId);

            }

            displayHand(player2deck[0][0], "player-deck", gameID, 2);
            displayHand(player2deck[0][1], "stock-deck", gameID, 2);
            displayHand(player2deck[0][2], "discard-deck", gameID, 2);
        })
        //TEST: console.log('getPlayer2Deck')
    }
    var intervalId = setInterval(getPlayer2Deck, 1000);
}


/**
 * Change cards
 */

var changeCard = function(x, decks, playerID, gameID){
        //TEST: console.log(x);

        fetch('/getTurn/' + gameID)
        .then(res => res.text())
        .then(turn => {
            //console.log(turn)
            if((playerID == 1 && turn == "true")  || (playerID == 2 && turn == "false")){
                //console.log(playerID)
                fetch('/newcards/' + gameID +'/' + decks, {    
                    body: JSON.stringify(x), 
                    cache: 'no-cache', 
                    credentials: 'same-origin', 
                    headers: {
                    'user-agent': 'Mozilla/4.0 MDN Example',
                    'content-type': 'application/json'
                    },
                    method: 'POST', 
                    mode: 'cors',
                    redirect: 'follow',
                    referrer: 'no-referrer',})
                .then(res => {
                })
            }
        })   
}


/**
 * Display hand
 */

function displayHand(cards, decks, gameID, playerID) {
    //TEST: console.log(cards)
    
    for (let i = 0; i < cards.length; i++) { 
        cards.sort((a,b) => (a.value > b.value) ? 1 : -1)

        if(cards[i] != null){

            let card = document.createElement("div");
            let x = cards[i]
            //TEST: console.log(cards, x);
            card.setAttribute('class', 'card');
            card.onclick = () => changeCard(x, decks, playerID, gameID);
            card.setAttribute('id', `${cards[i].value}${cards[i].suit}`);
            card.classList.add(`${cards[i].value}`);

            let ascii_char; 
            if(cards[i].suit == 'Diamonds'){
                ascii_char = '&#9826;';
            } else if (cards[i].suit == 'Hearts'){
                ascii_char = '&#9825;';
            } else if (cards[i].suit == 'Spades'){
                ascii_char = '&spades;';
            } else if (cards[i].suit == 'Clubs'){
                ascii_char = '&clubs;';            			
            }

            //if(decks == "stock-deck"){
            //    card.innerHTML = ""
            //}else{
                card.innerHTML = '' + cards[i].name + '' + ascii_char + '';
            //}
            document.getElementById(`${decks}`).appendChild(card);         
        }
    }
}
