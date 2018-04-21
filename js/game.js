$(document).ready(function() {    
    var app = new PIXI.Application(860,860);
    document.body.appendChild(app.view);

    function keyboard(keyCode) {
        let key = {};
        key.code = keyCode;
        key.isDown = false;
        key.isUp = true;
        key.press = undefined;
        key.release = undefined;
        //The `downHandler`
        key.downHandler = event => {
            if (event.keyCode === key.code) {
                if (key.isUp && key.press) key.press();
                key.isDown = true;
                key.isUp = false;
            }
            event.preventDefault();
        };

        //The `upHandler`
        key.upHandler = event => {
            if (event.keyCode === key.code) {
                if (key.isDown && key.release) key.release();
                key.isDown = false;
                key.isUp = true;
            }
            event.preventDefault();
        };

        //Attach event listeners
        window.addEventListener(
            "keydown", key.downHandler.bind(key), false
        );
        window.addEventListener(
            "keyup", key.upHandler.bind(key), false
        );
        return key;
    }

    const GRIDSIZE = 50;
    const LINESIZE = 5;

    var backgroundGrid = PIXI.Sprite.fromImage('static/game_board.svg');
    backgroundGrid.width = 860;
    backgroundGrid.height = 860;
    app.stage.addChild(backgroundGrid);

    // create a new Sprite from an image path
    var letterImage = PIXI.Sprite.fromImage('static/G.svg')

    // center the sprite's anchor point
    letterImage.anchor.set(0);

    // move the sprite to the top left
    letterImage.x = GRIDSIZE + LINESIZE;
    letterImage.y = GRIDSIZE + LINESIZE;
    letterImage.height = GRIDSIZE;
    letterImage.width = GRIDSIZE;

    app.stage.addChild(letterImage);

    let upKey = keyboard(38); // up
    upKey.press = () => {
        if (letterImage.y >= (GRIDSIZE * 2)) {
            letterImage.y -= GRIDSIZE
        }
    };
    upKey.release = () => {};

    let downKey = keyboard(40); // down
    downKey.press = () => {
        var lowerBound = app.stage.height - GRIDSIZE * 3
        if (letterImage.y <= lowerBound) {
            letterImage.y += GRIDSIZE
        }
    };
    downKey.release = () => {};

    let leftKey = keyboard(37); // left
    leftKey.press = () => {
        if (letterImage.x >= (GRIDSIZE * 2)) {
            letterImage.x -= GRIDSIZE
        }        
    };
    leftKey.release = () => {};

    let rightKey = keyboard(39); // right
    rightKey.press = () => {
        var upperBound = app.stage.height - GRIDSIZE * 3
        if (letterImage.x <= upperBound) {
            letterImage.x += GRIDSIZE
        }        
    };
    rightKey.release = () => {};
});