$(document).ready(function() {

    var $gameContainer = $(".gameContainer");
    var gameWidth =  $gameContainer.innerWidth();

    const BACKGROUND_SIZE = gameWidth;
    const GRIDSIZE = gameWidth/17.2;
    const LINESIZE = GRIDSIZE/10;

    function keyboard(keyCode) {
        let key = {};
        key.code = keyCode;
        key.isDown = false;
        key.isUp = true;
        key.press = undefined;
        key.release = undefined;

        key.downHandler = event => {
            if (event.keyCode === key.code) {
                if (key.isUp && key.press) key.press();
                key.isDown = true;
                key.isUp = false;
            }
            event.preventDefault();
        };

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

    function setUpControls(snake) {
        let upKey = keyboard(38); // up
        upKey.press = () => {
            snake.setDirection(UP);
        };
        upKey.release = () => {};

        let downKey = keyboard(40); // down
        downKey.press = () => {
            snake.setDirection(DOWN);
        };
        downKey.release = () => {};

        let leftKey = keyboard(37); // left
        leftKey.press = () => {
            snake.setDirection(LEFT);
        };
        leftKey.release = () => {};

        let rightKey = keyboard(39); // right
        rightKey.press = () => {
            snake.setDirection(RIGHT);
        };
        rightKey.release = () => {};
    }

    class Tile {
        constructor(x, y, letter, container) {
            this.x = x;
            this.y = y;
            this.letter = letter;
            this.image = this.setUpImage(container);
        }

        setUpImage(container) {
            // create a new Sprite from an image path
            let image = PIXI.Sprite.fromImage(`static/${this.letter}.svg`);

            // center the sprite's anchor point
            image.anchor.set(0);

            // move the sprite to the top left
            image.x = this.coordinateToGrid(this.x);
            image.y = this.coordinateToGrid(this.y);
            image.height = GRIDSIZE;
            image.width = GRIDSIZE;

            container.addChild(image);

            return image
        }

        coordinateToGrid(x) {
            return GRIDSIZE * (x + 1) + LINESIZE;
        }

        setX(x) {
            this.x = x;
            this.image.x = this.coordinateToGrid(x);
        }

        setY(y) {
            this.y = y;
            this.image.y = this.coordinateToGrid(y);
        }
    }

    class Snake {
        constructor(currentDirection, snakeTiles, container) {
            this.currentDirection = currentDirection;
            this.snakeTiles = snakeTiles;
            this.container = container;
            setUpControls(this);
        }

        setDirection(direction) {
            this.currentDirection = direction;
        }

        getHead() {
            return this.snakeTiles[0];
        }

        getHeadPosition() {
            return {
                x: this.getHead().x,
                y: this.getHead().y,
            }
        }

        getName() {
            const reducer = (name, tile) => (name + tile.letter);
            return this.snakeTiles.reduce(reducer, '');
        }

        getNextPosition() {
            let x, y;
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
            let head = this.snakeTiles[0];
            
            let prevX = head.x;
            let prevY = head.y;

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

        eat(nextX, nextY, nextTile, board) {
            board.removeTile(nextTile);
            this.move(nextX, nextY);
            this.snakeTiles.push(new Tile(nextX, nextY, nextTile.letter, this.container));
        }
    }

    class Board {
        constructor(boardContainer, snakeContainer) {

            this.container = boardContainer;

            var grid = [
                '               ',
                '               ',
                '          R V  ',
                '          E E  ',
                '       SERPENT ',
                '       N  T O  ',
                '    C  A  I M  ',
                '    O  K  L    ',
                '  SLITHER E    ',
                '    L  S       ',
                '               ',
                '               ',
                '               ',
                '               ',
                '               ',
            ]

            this.grid = []
            for (var i = 0; i < grid.length; i++) {
                var innerArray = [];
                for (var k = 0; k < grid[i].length; k++) {
                    if (grid[i][k] !== ' '){ 
                        innerArray.push(new Tile(k, i, grid[i][k], this.container));
                    }
                    else {
                        innerArray.push(' ');
                    }
                }
                this.grid.push(innerArray)
            }

            this.snake = new Snake(
                UP,
                [
                    new Tile(12, 2, 'V', snakeContainer),
                    // new Tile(12, 6, 'I', stage),
                    // new Tile(12, 7, 'N', stage),
                    // new Tile(11, 7, 'C', stage),
                    // new Tile(10, 7, 'E', stage),
                ],
                snakeContainer
            )
        }

        getTile(x, y) {
            return this.grid[y][x];
        }

        isOutOfBounds(x, y) {
            return (x > 14 || x < 0 || y > 14 || y < 0);
        }

        isOpenPosition(x, y) {
            if (this.isOutOfBounds(x, y)) {
                return false;
            }
            return this.grid[y][x] == ' '
        }

        isLetterTile(x, y) {
            if (this.isOutOfBounds(x, y)) {
                return false;
            }
            return this.grid[y][x] !== ' ';
        }

        removeTile(tile) {
            this.container.removeChild(tile.image);
            this.grid[tile.y][tile.x] = ' ';
        }

        update(renderer) {
            var x, y;
            ({x, y} = this.snake.getNextPosition());
            console.log(this.snake.getName());
            if (this.isOpenPosition(x, y)) {
                this.snake.move(x, y);
            } else if (this.isLetterTile(x, y)) {
                var nextTile = this.getTile(x, y);
                this.snake.eat(x, y, nextTile, this);
            }
        }
    }

    var setUp = function() {
        // create canvas view
        // create gameboard grid
        // create snake

        var gameWord = ['V', 'S', 'L'];

        // Create visual stuff

        let renderer = PIXI.autoDetectRenderer(BACKGROUND_SIZE, BACKGROUND_SIZE);

        // Create the stage
        let stage = new PIXI.Container();
        $gameContainer.append(renderer.view);

        let backgroundGrid = PIXI.Sprite.fromImage('static/game_board.svg');
        backgroundGrid.width = BACKGROUND_SIZE;
        backgroundGrid.height = BACKGROUND_SIZE;

        let boardContainer = new PIXI.Container();
        let snakeContainer = new PIXI.Container();

        stage.addChild(backgroundGrid);
        stage.addChild(boardContainer);
        stage.addChild(snakeContainer);

        board = new Board(boardContainer, snakeContainer);

        const ticker = new PIXI.ticker.Ticker();
        ticker.add((delta) => gameLoop(delta, renderer, stage, board));
        ticker.start();
    }

    const TICK_SPEED = 10;
    var timeSinceLastTick = 0;

    function gameLogic(renderer, board) {
        // headSnake asks for next snake position (based on last direction input)
        // check for open tile/out of bounds tile/own tail/another letter tile
        // if open tile, move into it, shift all letters into the position of the next letter in the snake array
        // if out of bounds, die
        // if own tail, die
        // if another letter tile, move into it and add the letter to the tail, remove letter from gameboard
        //    check state of current word, if it cannot match gameWord, die
        board.update(renderer);
    }

    function gameLoop(delta, renderer, stage, board) {
        timeSinceLastTick += delta;
        if (timeSinceLastTick > TICK_SPEED) {
            timeSinceLastTick = 0;
            gameLogic(renderer, board);
        }

        renderer.render(stage);
    }

    setUp();
});
