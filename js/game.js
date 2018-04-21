$(document).ready(function() {

    const BACKGROUND_SIZE = 860;
    const GRIDSIZE = 50;
    const LINESIZE = 5;

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

    // function setUpControls(letterImage, stage) {
    //     let upKey = keyboard(38); // up
    //     upKey.press = () => {
    //         if (letterImage.y >= (GRIDSIZE * 2)) {
    //             letterImage.y -= GRIDSIZE
    //         }
    //     };
    //     upKey.release = () => {};

    //     let downKey = keyboard(40); // down
    //     downKey.press = () => {
    //         var lowerBound = stage.height - GRIDSIZE * 3
    //         if (letterImage.y <= lowerBound) {
    //             letterImage.y += GRIDSIZE
    //         }
    //     };
    //     downKey.release = () => {};

    //     let leftKey = keyboard(37); // left
    //     leftKey.press = () => {
    //         if (letterImage.x >= (GRIDSIZE * 2)) {
    //             letterImage.x -= GRIDSIZE
    //         }        
    //     };
    //     leftKey.release = () => {};

    //     let rightKey = keyboard(39); // right
    //     rightKey.press = () => {
    //         var upperBound = stage.height - GRIDSIZE * 3
    //         if (letterImage.x <= upperBound) {
    //             letterImage.x += GRIDSIZE
    //         }        
    //     };
    //     rightKey.release = () => {};
    // }

    class SnakeTile {
        constructor(x, y, letter, stage) {
            this.x = x;
            this.y = y;
            this.letter = letter;
            this.image = this.setUpImage(stage);
        }

        setUpImage(stage) {
            // create a new Sprite from an image path
            var image = PIXI.Sprite.fromImage(`static/${this.letter}.svg`);

            // center the sprite's anchor point
            image.anchor.set(0);

            // move the sprite to the top left
            image.x = GRIDSIZE*this.x + LINESIZE;
            image.y = GRIDSIZE*this.y + LINESIZE;
            image.height = GRIDSIZE;
            image.width = GRIDSIZE;

            stage.addChild(image);

            return image
        }

        setX(x) {
            this.x = x;
            this.image.x = GRIDSIZE * x + LINESIZE;
        }

        setY(y) {
            this.y = y;
            this.image.y = GRIDSIZE * y + LINESIZE;
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

                this.snakeTiles[i].setX(prevX);
                this.snakeTiles[i].setY(prevY);

                prevX = thisPrevX;
                prevY = thisPrevY;
            }

            head.setX(nextX);
            head.setY(nextY);
        }
    }

    class Board {
        constructor(stage) {
            this.grid = [
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

            this.snake = new Snake(
                UP,
                [new SnakeTile(12, 5, 'V', stage)]
            )
        }

        update(renderer, stage) {
            var x, y;
            ({x, y} = this.snake.getNextPosition());
            this.snake.move(x, y);
        }
    }

    var setUp = function() {
        // create canvas view
        // create gameboard grid
        // create snake
    
        var gameWord = ['V', 'S', 'L'];
    
        // Create visual stuff

        var renderer = PIXI.autoDetectRenderer(BACKGROUND_SIZE, BACKGROUND_SIZE);

        // Create the stage
        var stage = new PIXI.Container();
        document.body.appendChild(renderer.view);

        var backgroundGrid = PIXI.Sprite.fromImage('static/game_board.svg');
        backgroundGrid.width = BACKGROUND_SIZE;
        backgroundGrid.height = BACKGROUND_SIZE;
        stage.addChild(backgroundGrid);

        board = new Board(stage);

        const ticker = new PIXI.ticker.Ticker();
        ticker.add((delta) => gameLoop(delta, renderer, stage, board));
        ticker.start();
    }

    const TICK_SPEED = 500;
    var timeSinceLastTick = 0;

    function gameLogic(renderer, stage, board) {
        // headSnake asks for next snake position (based on last direction input)
        // check for open tile/out of bounds tile/own tail/another letter tile
        // if open tile, move into it, shift all letters into the position of the next letter in the snake array
        // if out of bounds, die
        // if own tail, die
        // if another letter tile, move into it and add the letter to the tail, remove letter from gameboard
        //    check state of current word, if it cannot match gameWord, die
        board.update(renderer, stage);
    }

    function gameLoop(delta, renderer, stage, board) {

        timeSinceLastTick += delta;
        if (timeSinceLastTick > TICK_SPEED) {
            timeSinceLastTick = 0;
            gameLogic(renderer, stage, board);
        }

        renderer.render(stage);
        requestAnimationFrame(() => gameLoop(delta, renderer, stage, board));
    }

    setUp();
});