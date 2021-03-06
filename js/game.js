$(document).ready(function() {

    var $gameContainer = $(".gameContainer");
    var gameWidth =  $gameContainer.innerWidth() - 100;

    const BACKGROUND_Y_OFFSET = 100;

    const BACKGROUND_SIZE_X = gameWidth;
    const BACKGROUND_SIZE_Y = gameWidth + BACKGROUND_Y_OFFSET;

    const GRIDSIZE = gameWidth/17.2;
    const LINESIZE = GRIDSIZE/10;

    function getRandomInt(max) {
        return Math.floor(Math.random() * Math.floor(max));
    }

    class SnakeFactory{
        constructor(container, board) {
            this.container = container;
            this.board = board;
        }

        createSnake(x, y, letter) {
            if (this.board.snake) {
                return;
            }
            let headTile = new Tile(x, y, letter, this.container, this.board);
            headTile.image.tint = 0x52ff52;
            let newSnake = new Snake(
                '',
                [headTile],
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
            if ([37, 38, 39, 40].includes(event.keyCode)) {
                event.preventDefault();
            }
        };

        key.upHandler = event => {
            if (event.keyCode === key.code) {
                if (key.isDown && key.release) key.release();
                key.isDown = false;
                key.isUp = true;
            }
            if ([37, 38, 39, 40].includes(event.keyCode)) {
                event.preventDefault();
            }
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
        upKey.press = () => snake.setDirection(UP);
        downKey.press = () => snake.setDirection(DOWN);
        leftKey.press = () => snake.setDirection(LEFT);
        rightKey.press = () => snake.setDirection(RIGHT);
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
            this.lastX = x;
            this.lastY = y;
            this.offset = 0;
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
                if (!this.board.snake) {
                    this.board.removeTile(this);
                    this.board.setWinWord(this.letter);
                    snakeCreator.createSnake(this.x, this.y, this.letter);
                }
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

        update(delta) {
            const differenceX = this.x - this.lastX;
            const differenceY = this.y - this.lastY;

            if (differenceX == 0 && differenceY == 0) {
                return;
            }

            this.offset += delta / TICK_SPEED;

            if (this.offset >= 1) {
                this.offset -= 1;
                return;
            }

            const imageX = this.lastX + this.offset*differenceX;
            const imageY = this.lastY + this.offset*differenceY;

            this.image.x = this.coordinateToGrid(imageX);
            this.image.y = this.coordinateToGrid(imageY) + BACKGROUND_Y_OFFSET;
        }

        setX(x) {
            this.lastX = this.x;
            this.x = x;
            // this.image.x = this.coordinateToGrid(x);
        }

        setY(y) {
            this.lastY = this.y;
            this.y = y;
            // this.image.y = this.coordinateToGrid(y) + BACKGROUND_Y_OFFSET;
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

            if (this.currentDirection != '') {
                // Clear the initial selected tile filter we apply on snake creation
                this.getHead().image.filters = [];
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

        disableControls() {
            disableControls(this);
            this.isDead = true;
            for (let tile of this.snakeTiles) {
                tile.lastX = tile.x;
                tile.lastY = tile.y;
            }
        }

        die() {
            if (!this.isDead) {
                this.disableControls();
                let losePhrases = [
                    'Snake it or break it, you definitely did not snake it.',
                    'If you keep losing, you might get hissed off.',
                    'Looks like you\'re chasing your own tail.',
                    'Pat yourself on the back, because you are not a snake.',
                    'You\'re eating your words here.',
                    'Ssssssssucksssss to sssssuuck',
                    'Maye some games are just incompatible? You lose anyway.',
                    'Maybe try unhinging your jaw?',
                ]
                alert(losePhrases[getRandomInt(losePhrases.length)]);
                location.reload();
            }
        }
    }

    class HUD {
        constructor(container) {
            this.container = container;

            this.titleElement = this.createTitleElement('Eat Your Words');
            this.subElement = this.createSubElement('Click on a letter to get started.');
        }

        getStyle(fontSize) {
            return {
                fontFamily : 'Helvetica',
                fontSize: fontSize,
                fill : 0x000000,
                align : 'center'
            }
        }

        createElement(text, fontSize, y) {
            var element = new PIXI.Text(
                text,
                this.getStyle(fontSize),
            );
            element.x = BACKGROUND_SIZE_X / 2;
            element.y = y;
            element.anchor.set(0.5, 0);

            this.container.addChild(element);
            return element;
        }

        createTitleElement(text) {
            return this.createElement(text, 24, 0);
        }

        createSubElement(text) {
            return this.createElement(text, 18, 50);
        }

        createWordElement(text) {
            return this.createElement(text, 18, 30);
        }

        setWinWord(winWord) {
            this.container.removeChild(this.wordElement);
            this.wordElement = this.createWordElement(winWord);

            this.container.removeChild(this.titleElement);
            this.titleElement = this.createTitleElement('Your word is:');

            this.container.removeChild(this.subElement);
            this.subElement = this.createSubElement('Snake around with the arrow keys and try to spell it.');
        }

    }

    class Board {
        constructor(boardContainer, snakeContainer, hudContainer) {

            this.container = boardContainer;

            this.hud = new HUD(hudContainer);

            var grid = [
                '               ',
                '     ADDER V   ',
                '         E E   ',
                '      SERPENTS ',
                '  C   N  T O   ',
                ' BOA  A  I M   ',
                '  I   K  L O   ',
                ' SLITHER I U   ',
                '  I   S  A S   ',
                '  N      N     ',
                '  GECKO        ',
                '    O    Z     ',
                '    BASILISK   ',
                '    R    G     ',
                '    A          ',
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

        * generateBoardTiles() {
            for (var i = 0; i < this.grid.length; i++) {
                for (var k = 0; k < this.grid[i].length; k++) {
                    let tile = this.grid[i][k];
                    if (tile != ' ') {
                        yield this.grid[i][k];
                    }
                }
            }
        }

        * generateTiles() {
            yield* this.generateBoardTiles();
            if (this.snake) {
                yield* this.snake.snakeTiles;
            }
        }

        update(delta) {
            for (let tile of this.generateTiles()) {
                tile.update(delta);
            }
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
            let lowerCaseLetter = letter.toLowerCase();
            let randomWordIndex = getRandomInt(this.words[lowerCaseLetter].length);
            this.winWord = this.words[lowerCaseLetter][randomWordIndex].toLowerCase();

            this.hud.setWinWord(this.winWord);
        }

        gameTick(renderer) {
            var x, y;
            if (!this.snake || this.snake.isDead) {
                return;
            }
            ({x, y} = this.snake.getNextPosition());

            let snakeName = this.snake.getName();
            let snakeHasMoved = this.snake.currentDirection;
            let snakeShouldDie = (this.isOutOfBounds(x, y) || this.isAlreadySnakeTile(x, y));
            if (snakeHasMoved && snakeShouldDie) {
                this.snake.die();
                return;
            }

            if (this.winWord == snakeName) {
                this.snake.disableControls();
                alert("You win! You are a snake!");
                return;
            }

            let nextTile = this.getTile(x, y);
            if (nextTile.letter) {
                let nextLetter = this.getTile(x, y).letter.toLowerCase();
                let nextWord = snakeName + nextLetter;
                if (!this.winWord.startsWith(nextWord)) {
                    this.snake.die();
                    return;
                }
            }

            if (this.isOpenPosition(x, y)) {
                this.snake.move(x, y);
            } else if (this.isLetterTile(x, y)) {
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


    function gameLoop(delta, renderer, stage, board) {
        timeSinceLastTick += delta;
        if (timeSinceLastTick > TICK_SPEED) {
            timeSinceLastTick = timeSinceLastTick - TICK_SPEED;
            board.gameTick(renderer);
        }

        board.update(delta);
        renderer.render(stage);
    }

    setUp();
});
