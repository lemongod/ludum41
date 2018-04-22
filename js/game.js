$(document).ready(function() {

    var $gameContainer = $(".gameContainer");
    var gameWidth =  $gameContainer.innerWidth();

    const BACKGROUND_Y_OFFSET = 200;

    const BACKGROUND_SIZE_X = gameWidth;
    const BACKGROUND_SIZE_Y = gameWidth + BACKGROUND_Y_OFFSET;

    const GRIDSIZE = gameWidth/17.2;
    const LINESIZE = GRIDSIZE/10;

    class SnakeFactory{
        constructor(container, board) {
            this.container = container;
            this.board = board;
        }

        createSnake(x, y, letter) {
            if (this.board.snake) {
                return;
            }
            let newSnake = new Snake(
                '',
                [
                    new Tile(x, y, letter, this.container, this.board),
                ],
                this.container,
            )
            this.board.snake = newSnake;
            return newSnake
        }
    }

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
    var snakeCreator;
    let upKey = keyboard(38); // up
    let downKey = keyboard(40); // down
    let leftKey = keyboard(37); // left
    let rightKey = keyboard(39); // right

    function setUpControls(snake) {
        upKey.press = () => {
            snake.setDirection(UP);
        };
        downKey.press = () => {
            snake.setDirection(DOWN);
        };
        leftKey.press = () => {
            snake.setDirection(LEFT);
        };
        rightKey.press = () => {
            snake.setDirection(RIGHT);
        };
    }

    function disableControls(snake) {
        snake.currentDirection = '';
        upKey.press = () => {};
        downKey.press = () => {};
        leftKey.press = () => {};
        rightKey.press = () => {};
    }

    class Tile {
        constructor(x, y, letter, container, board) {
            this.x = x;
            this.y = y;
            this.letter = letter;
            this.board = board;
            this.image = this.setUpImage(container);
        }

        setUpImage(container) {
            // create a new Sprite from an image path
            let image = PIXI.Sprite.fromImage(`static/${this.letter}.svg`);
            image.interactive = true;
            image.buttonMode = true;
            image.on('click', (event) => {
                this.board.removeTile(this);
                this.board.setWinWord(this.letter);
                snakeCreator.createSnake(this.x, this.y, this.letter);
            });
             
            // center the sprite's anchor point
            image.anchor.set(0);

            // move the sprite to the top left
            image.x = this.coordinateToGrid(this.x);
            image.y = this.coordinateToGrid(this.y) + BACKGROUND_Y_OFFSET;
            image.height = GRIDSIZE;
            image.width = GRIDSIZE;

            container.addChild(image);

            return image
        }

        coordinateToGrid(x) {
            if (x === null) return -1000
            return GRIDSIZE * (x + 1) + LINESIZE;
        }

        setX(x) {
            this.x = x;
            this.image.x = this.coordinateToGrid(x);
        }

        setY(y) {
            this.y = y;
            this.image.y = this.coordinateToGrid(y) + BACKGROUND_Y_OFFSET;
        }
    }

    class Snake {
        constructor(currentDirection, snakeTiles, container) {
            this.currentDirection = currentDirection;
            this.snakeTiles = snakeTiles;
            this.container = container;
            this.isDead = false;
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
            return this.snakeTiles.reduce(reducer, '').toLowerCase();
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
            
            if (this.isDead) {
                return;
            }

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
            this.snakeTiles.push(new Tile(null, null, nextTile.letter, this.container, board));
        }

        die() {
            if (!this.isDead) {
                this.isDead = true;
                disableControls(this);
                alert("YOU LOSE");
            }
        }
    }

    class HUD {
        constructor(container) {
            this.container = container;
            this.titleText = 'Welcome to Scrabble 2';
            this.subText = 'Pick a letter to get started.';
            this.wordText = '';

            this.titleElement = this.createTitleElement();
            this.subElement = this.createSubElement();
        }

        getStyle(fontSize) {
            return {
                fontFamily : 'Helvetica',
                fontSize: fontSize,
                fill : 0x000000,
                align : 'center'
            }
        }

        createTitleElement() {
            var element = new PIXI.Text(
                this.titleText,
                this.getStyle(24),
            );
            element.x = 100;
            element.y = 100;

            this.container.addChild(element);
            return element;
        }

        createSubElement() {
            var element = new PIXI.Text(
                this.subText,
                this.getStyle(18),
            );
            element.x = 100;
            element.y = 150;

            this.container.addChild(element);
            return element;
        }

        createWordElement() {
            var element = new PIXI.Text(
                'Win word: ' + this.wordText,
                this.getStyle(18),
            );
            element.x = 500;
            element.y = 100;

            this.container.addChild(element);
            return element;
        }
    }

    class Board {
        constructor(boardContainer, snakeContainer, hudContainer) {

            this.container = boardContainer;

            this.hud = new HUD(hudContainer);

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
                        innerArray.push(new Tile(k, i, grid[i][k], this.container, this));
                    }
                    else {
                        innerArray.push(' ');
                    }
                }
                this.grid.push(innerArray)
            }
            
            this.words = words;
            snakeCreator = new SnakeFactory(snakeContainer, this);
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

        isAlreadySnakeTile(x, y) {
            return this.snake.snakeTiles.filter(
                snakeTile => snakeTile.x == x && snakeTile.y == y
            ).length > 0;
        }

        removeTile(tile) {
            this.container.removeChild(tile.image);
            this.grid[tile.y][tile.x] = ' ';
        }

        setWinWord(letter) {
            function getRandomInt(max) {
                return Math.floor(Math.random() * Math.floor(max));
            }

            let lowerCaseLetter = letter.toLowerCase();
            let randomWordIndex = getRandomInt(this.words[lowerCaseLetter].length);
            this.winWord = this.words[lowerCaseLetter][randomWordIndex].toLowerCase();

            this.hud.wordText = this.winWord;
            this.hud.createWordElement();
        }

        update(renderer) {
            var x, y;
            if (!this.snake) {
                return;
            }
            ({x, y} = this.snake.getNextPosition());
            let snakeName = this.snake.getName();
            console.log(snakeName);

            if (!this.winWord.startsWith(snakeName)) {
                this.snake.die();
            }

            if (this.winWord == this.snake.getName().toLowerCase()) {
                disableControls(this.snake);
                alert("You win!");
            }

            let snakeHasMoved = this.snake.currentDirection;
            let snakeShouldDie = (this.isOutOfBounds(x, y) || this.isAlreadySnakeTile(x, y));
            if (snakeHasMoved && snakeShouldDie) {
                this.snake.die();
            } else if (this.isOpenPosition(x, y)) {
                this.snake.move(x, y);
            } else if (this.isLetterTile(x, y)) {
                var nextTile = this.getTile(x, y);
                this.snake.eat(x, y, nextTile, this);
            }
        }
    }

    function setUp() {

        let renderer = PIXI.autoDetectRenderer(BACKGROUND_SIZE_X, BACKGROUND_SIZE_Y, {backgroundColor: 0xffffff});

        // Create the stage
        let stage = new PIXI.Container(name='stage');
        $gameContainer.append(renderer.view);

        let backgroundGrid = PIXI.Sprite.fromImage('static/game_board.svg');
        backgroundGrid.y = BACKGROUND_Y_OFFSET;
        backgroundGrid.width = BACKGROUND_SIZE_X;
        backgroundGrid.height = BACKGROUND_SIZE_X;

        let boardContainer = new PIXI.Container(name='boardContainer');
        let snakeContainer = new PIXI.Container(name='snakeContainer');
        let hudContainer = new PIXI.Container(name='hudContainer');

        stage.addChild(backgroundGrid);
        stage.addChild(boardContainer);
        stage.addChild(snakeContainer);
        stage.addChild(hudContainer);

        board = new Board(boardContainer, snakeContainer, hudContainer);

        const ticker = new PIXI.ticker.Ticker();
        ticker.add((delta) => gameLoop(delta, renderer, stage, board));
        ticker.start();
    }

    const TICK_SPEED = 15;
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
