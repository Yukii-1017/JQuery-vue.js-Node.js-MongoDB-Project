/**
 * To do: if the first player left the room, delete the object from the room list array; if game is going on, alert player 1 left
 * To do: do not allow the third player to get into this room
 */

const express = require('express');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(express.static('content'))
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const port = 3000;


/**
 * Make and send cards
 */

var makeCards = function() { 
    let cards = []; 
    let slicedCards = [];

    let names = ['A','2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
    let suits = ['Hearts','Diamonds','Spades','Clubs'];
    // all cards with value, suit and name 
    for( let i = 0; i < suits.length; i++ ) {
        for( let j = 0; j < names.length; j++ ) {
            cards.push( {value : j+1, name: names[j], suit: suits[i] });
        }
    }
    //shuffle cards
    for(let j, x, i = cards.length; 
        i; 
        j = parseInt(Math.random() * i), x = cards[--i], cards[i] = cards[j], cards[j] = x);

    let player1cards = cards.slice(0,10);
    slicedCards.push(player1cards);

    let player2cards = cards.slice(10,20); 
    slicedCards.push(player2cards);

    let stock = cards.slice(20);
    let upcard = stock.pop();
    let discard = [];
    discard.push(upcard);
    slicedCards.push(stock);
    slicedCards.push(discard);

    return slicedCards;
}

var sendCards = function(playerID, thisGame){
    let playerdeck = [];
    let stockdeck = [];//Although it is a single object, but it is necessary to put it into an array  
    let discarddeck = [];//so it can be run on the client side normally. 

    let x = thisGame.cards[3].length-1;

    if (playerID == 1){
        playerdeck.push(thisGame.cards[0]);
    }else{
        playerdeck.push(thisGame.cards[1]);
    }
    stockdeck.push(thisGame.cards[2][0]);
    discarddeck.push(thisGame.cards[3][x]);
    playerdeck.push(stockdeck);
    playerdeck.push(discarddeck); 
    return playerdeck;
}



/**
 * Set game ID and players
 */
var games = [];
app.get('/startGame', (req, res) => {
    let room = {"gameID" : uuidv4(), 'winner' : undefined, "player1" : true, "player2" : false, "p1turn" : true, "cards": makeCards(), discard : false, get : false}; 
    games.push(room);
    //TEST: console.log(games);
    res.end(room.gameID);  
})

app.get('/getList', (req, res) => {
    let gameID = [];
    for(let i = 0; i < games.length; i++ ){
        gameID.push(games[i].gameID);
    }
    //TEST: console.log(gameID);
    res.end(JSON.stringify(gameID));
})



/**
 * Give cards to players and arrange stock deck 
 */
app.get("/joinGame/:gameID", (req, res) => {
    let thisGame = games.find(x => x.gameID === req.params.gameID);
    thisGame.player2 = true; 
    //TEST: console.log(thisGame.player2)
    let playerdeck = [];
    let cards = sendCards(2, thisGame);
    playerdeck.push(cards);

    let turn = [];
    turn.push({"p1turn": thisGame.p1turn});
    playerdeck.push(turn);

    let winner = [];
    winner.push({"winner": thisGame.winner})
    playerdeck.push(winner);

    res.end(JSON.stringify(playerdeck));

})

app.get("/player1deck/:gameID", (req, res) => {
    let thisGame = games.find(x => x.gameID === req.params.gameID)
    //TEST: console.log(thisGame.player2);
    if(thisGame.player2){
        //TEST: console.log('2')
        let playerdeck = [];
        let cards = sendCards(1, thisGame);
        playerdeck.push(cards);

        let turn = [];
        turn.push({"p1turn": thisGame.p1turn});
        playerdeck.push(turn);

        let winner = [];
        winner.push({"winner": thisGame.winner})
        playerdeck.push(winner);
        res.end(JSON.stringify(playerdeck));
    }
})




/**
 * change cards 
 */

app.post("/newcards/:gameID/:decks", (req, res) => {
    //TEST: console.log(req.body)

    let thisGame = games.find(x => x.gameID === req.params.gameID);

    let changeCard = function(toMove, toPush){
        let x = thisGame.cards[toMove];//get card from server side
        let y = thisGame.cards[toPush];
        //console.log(x.length, y.length)

        let card = x.find(i => (i.value === req.body.value) && (i.suit === req.body.suit) );

        y.push(card);
        thisGame.cards[toPush] = y; 
        thisGame.cards[toMove] = x.filter((i) => {
            //TEST: console.log(i !== card);
            if(i != card){
                return i
            }
        })
    }

    if(thisGame.p1turn){
        //console.log(thisGame.p1turn)
        //console.log('1');
        if(thisGame.get == false){
            if(req.params.decks == "discard-deck"){
                //console.log('2');
                thisGame.get = true;
                changeCard(3, 0);
                res.end()
            }else if(req.params.decks == "stock-deck"){
                //console.log('3');
                thisGame.get = true;
                changeCard(2, 0);
            }
            //p1 get   
        }
        
        if(thisGame.discard == false && req.params.decks == "player-deck"){
            //console.log('4')
            thisGame.discard = true; 
            changeCard(0, 3);
            // p1 disacard
        }
        
        if(thisGame.get == true && thisGame.discard == true ){
            //console.log('A')

            thisGame.p1turn = !thisGame.p1turn;
            thisGame.get = false; 
            thisGame.discard = false; 
        }

    }else{
        if(thisGame.get == false){
            if(req.params.decks == "discard-deck"){
                //console.log('5')
                thisGame.get = true;
                changeCard(3, 1);
                res.end()
            }else if(req.params.decks == "stock-deck"){
                //console.log('6')

                thisGame.get = true;
                changeCard(2, 1);
            }
            //p2 get   
        }
        
        if(thisGame.discard == false && req.params.decks == "player-deck"){
            //console.log('7')

            thisGame.discard = true; 
            changeCard(1, 3);
            // p2 disacard
        }

        if(thisGame.get == true && thisGame.discard == true ){
            //console.log('B')

            thisGame.p1turn = !thisGame.p1turn;
            thisGame.get = false; 
            thisGame.discard = false; 
        }
    }    
res.end()
})



/**
 * return turn
 */

app.get("/getTurn/:gameID", (req, res) => {
    let thisGame = games.find(x => x.gameID === req.params.gameID)
    //console.log(thisGame.p1turn.toString())
    res.send(thisGame.p1turn.toString());
})|


/**
 * return results
 */

 app.get("/getResults/:gameID/:playerID/:result", (req, res) => {
    let thisGame = games.find(x => x.gameID === req.params.gameID);
    thisGame.winner = req.params.playerID;
    res.end(JSON.stringify(thisGame));
})

/**
 * Express
 */
app.listen(3000, () => {
    console.log('Listening for request: http://localhost:3000')
})
