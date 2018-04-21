$(document).ready(function() {

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
            'keydown', key.downHandler.bind(key), false
        );
        window.addEventListener(
            'keyup', key.upHandler.bind(key), false
        );
        return key;
    }

    const UP = 'up', DOWN = 'down', LEFT = 'left', RIGHT = 'right';
    let snake;

    var setUp = function() {
        // create canvas view
        // create gameboard grid
        // create snake
        class SnakeTile {
            constructor(x, y, letter) {
                this.x = x;
                this.y = y;
                this.letter = letter;
            }
        }

        class Snake {
            constructor(currentDirection, snakeTiles) {
                this.currentDirection = currentDirection;
                this.snakeTiles = snakeTiles;
            }

            getHead() {
                return this.snakeTiles[0];
            }

            getHeadPosition() {
                return {
                    x: this.getHead().x,
                    y: this.getHead().y
                }
            }

            getNextPosition() {
                var x, y;
                ({x, y} = this.getHeadPosition());
                debugger;
                if (this.currentDirection == UP) {
                    y -= 1;
                }
                else if (this.currentDirection == DOWN) {
                    y += 1;
                }
                else if (this.currentDirection == LEFT) {
                    x -= 1;
                }
                else if (this.currentDirection == RIGHT) {
                    x += 1;
                }
                return {
                    x: x, 
                    y: y,
                };
            }

            move(nextX, nextY) {
                var head = this.snakeTiles[0];
                
                var prevX = head.x;
                var prevY = head.y;

                for (var i = 1; i < this.snakeTiles.length; i++) {
                    var thisPrevX = this.snakeTiles[i].x;
                    var thisPrevY = this.snakeTiles[i].y;

                    this.snakeTiles[i].x = prevX;
                    this.snakeTiles[i].y = prevY;

                    prevX = thisPrevX;
                    prevY = thisPrevY;
                }

                head.x = nextX;
                head.y = nextY;
            }
        }
    
        var gameWord = ['V', 'S', 'L'];
        var grid = [
            [' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' '],
            [' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' '],
            [' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' '],
            [' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' '],
            [' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' '],
            [' ',' ',' ',' ',' ',' ',' ',' ',' ',' ','R',' ','V',' ',' '],
            [' ',' ',' ',' ',' ',' ',' ',' ',' ',' ','E',' ','E',' ',' '],
            [' ',' ',' ',' ',' ',' ',' ','S','E','R','P','E','N','T',' '],
            [' ',' ',' ',' ',' ',' ',' ','N',' ',' ','T',' ','O',' ',' '],
            [' ',' ',' ',' ',' ',' ',' ','A',' ',' ','I',' ','M',' ',' '],
            [' ',' ',' ',' ',' ',' ',' ','K',' ',' ','L',' ',' ',' ',' '],
            [' ',' ','S','L','I','T','H','E','R',' ','E',' ',' ',' ',' '],
            [' ',' ',' ',' ',' ',' ',' ','S',' ',' ',' ',' ',' ',' ',' '],
            [' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' '],
            [' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ']
        ]
    
        // initial solid snaaaaaake
        var snake = new Snake(
            UP,
            [new SnakeTile(12, 5, 'V')]
        )

        // Create visual stuff

        var app = new PIXI.Application(860,860);
        document.body.appendChild(app.view);

        const GRIDSIZE = 50;
        const LINESIZE = 5;

        var backgroundGrid = PIXI.Sprite.fromImage('static/game_board.svg');
        backgroundGrid.width = 860;
        backgroundGrid.height = 860;
        app.stage.addChild(backgroundGrid);

        // create a new Sprite from an image path
        var letterImage = PIXI.Sprite.fromImage('static/G.svg');

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

        app.ticker.add(delta => gameLoop(delta));
    }

    var gameLoop = function(delta) {
        // headSnake asks for next snake position (based on last direction input)
        // check for open tile/out of bounds tile/own tail/another letter tile
        // if open tile, move into it, shift all letters into the position of the next letter in the snake array
        // if out of bounds, die
        // if own tail, die
        // if another letter tile, move into it and add the letter to the tail, remove letter from gameboard
        //    check state of current word, if it cannot match gameWord, die
    }

    setUp();
});