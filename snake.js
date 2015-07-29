function Snake(parent) {
    //Configs TBA
    /*var data = {
     width : 100,
     height : 100,
     backgroundColor : "white",
     snakeColor : "black",
     speed : 100
     };*/
    //Pixel size: 15
    //Playfield: 0 - 495

    var game = new Game(parent);

    this.init = function () {
        game.init();
    };

    /**
     * The engine that handles the game
     * @param parent    parent element
     * @constructor
     */
    function Game(parent) {
        var snake,					//Snake
            food,					//Food
            playField,					//Canvas
            frames;					//Timeout for frames (speed)

        //Init, first startup
        this.init = function () {
            snake = new SnakePlayer();
            food = new Position(0, 0);
            snake.life[0] = new Position(75, 255);
            newFood(food);
            playField = new PlayField(parent, snake, food);
            playField.initPlayField();
            controls = new ControlHandler();
            this.start();
        };

        //Restart, possible if snake is dead
        this.restart = function () {
            snake.life.length = 0;
            snake.life[0] = new Position(75, 255);
            clearInterval(frames);
            this.start();
        };

        this.start = function () {
            playField.drawBoard();
            frames = setInterval(drawFrame, 100);
            console.log("Starting up");
        };

        var end = function () {
            clearInterval(frames);
        };

        //Draws frame
        var drawFrame = function () {
            playField.clear();

            //If snake failed to move to the new position = dead
            if (!movement(controls.direction())) {
                playField.gameOver();
                console.log("Dead");
                end();
            }
            playField.drawSnake();
            playField.drawFood();
        };

        //Movement for snake, adds new head every frame and removes one with pop()
        var movement = function (direction) {
            var currentPosition = snake.life[0];
            var newPosition = movePosition(currentPosition, direction);

            //Snake collided with itself or went outside of playfield
            if (snake.collide(newPosition)) {
                return false;
            }

            //Eat food, grow one size
            if (food.collide(currentPosition)) {
                newFood(food);
                snake.life.push(newPosition);
            }

            snake.direction = direction;
            snake.life.unshift(newPosition);
            snake.life.pop();

            return true;
        };

        //Help function to calculate new position for snake movement, 15 = pixel size (Config TBA)
        var movePosition = function (position, direction) {
            var newPosition;
            switch (direction) {
                case "UP":
                    newPosition = new Position(position.x, position.y - 15);
                    break;
                case "DOWN":
                    newPosition = new Position(position.x, position.y + 15);
                    break;
                case "LEFT":
                    newPosition = new Position(position.x - 15, position.y);
                    break;
                case "RIGHT":
                    newPosition = new Position(position.x + 15, position.y);
                    break;
            }
            return newPosition;
        };

        //Randomize new location for food
        var newFood = function (food) {
            var x = Math.floor(Math.random() * 33);
            var y = Math.floor(Math.random() * 33);
            food.x = x * 15;
            food.y = y * 15;
        };
    }

    /**
     * Playfield that draws the board
     * @param parent    Parent element
     * @param snake     Snake object
     * @param food      Food object
     * @constructor
     */
    function PlayField(parent, snake, food) {
        var playField,
            ctx;

        this.initPlayField = function () {
            playField = document.createElement("canvas");
            playField.setAttribute("id", "snake");
            playField.setAttribute("width", 510);
            playField.setAttribute("height", 510);
            parent.appendChild(playField);
            ctx = playField.getContext("2d");
        };

        //Clear playfield every frame
        this.clear = function () {
            ctx.fillStyle = "white";
            ctx.fillRect(1, 1, 508, 508);
        };

        //Draws the border of the playfield
        this.drawBoard = function () {
            ctx.beginPath();
            ctx.rect(0, 0, 510, 510);
            ctx.fillStyle = "white";
            ctx.fill();
            ctx.lineWidth = 1;
            ctx.strokeStyle = "black";
            ctx.stroke();
        };

        //Draws the whole snake every frame
        this.drawSnake = function () {
            ctx.beginPath();
            ctx.fillStyle = "black";
            for (var i = 0; i < snake.life.length; i++) {
                var position = snake.life[i];
                ctx.fillRect(position.x, position.y, 15, 15);
            }
        };

        //Draw food
        this.drawFood = function () {
            ctx.fillStyle = "black";
            ctx.fillRect(food.x, food.y, 15, 15);
        };

        //Game over message
        this.gameOver = function () {
            ctx.font = "50px Georgia";
            ctx.fillStyle = "black";
            ctx.fillText("Game over", 140, 250);
        };
    }

    /**
     * Snake object itself
     * @constructor
     */
    function SnakePlayer() {
        this.life = [];
        this.direction = "RIGHT";

        //Test collision
        this.collide = function (position) {
            for (var i = 0; i < this.life.length; i++) {
                if (position.collide(this.life[i])) {
                    return true;
                }
            }
            return false;
        };
    }

    /**
     * Position object. Each object on the playfield consist of a position.
     * @param x     x coordinate
     * @param y     y coordinate
     * @constructor
     */
    function Position(x, y) {
        this.x = x;
        this.y = y;

        this.collide = function (position) {
            //Checks if there is a collision
            if (position.x == this.x && position.y == this.y) {
                return true;
                //Checks if the position is outside of the playfield (dead snake)
            } else if (position.x < 0 || position.x > 495 || position.y < 0 || position.y > 495) {
                return true;
            } else {
                return false;
            }
        };
    }

    /**
     * Handler for inputs
     * @constructor
     */
    function ControlHandler() {
        //Default direction
        var direction = "RIGHT";

        this.direction = function () {
            return direction;
        };

        window.addEventListener("keydown", function (event) {
            console.log(event.keyCode);
            switch (event.keyCode) {
                case 37:
                    //Prevent the scrollbar from moving
                    event.preventDefault();
                    //Disable movement for opposite direction
                    if (!(direction == "RIGHT")) {
                        direction = "LEFT";
                    }
                    break;
                case 38:
                    event.preventDefault();
                    if (!(direction == "DOWN")) {
                        direction = "UP";
                    }
                    break;
                case 39:
                    event.preventDefault();
                    if (!(direction == "LEFT")) {
                        direction = "RIGHT";
                    }
                    break;
                case 40:
                    event.preventDefault();
                    if (!(direction == "UP")) {
                        direction = "DOWN";
                    }
                    break;
                case 82:
                    //R key, restarts game
                    game.restart();
                    direction = "RIGHT";
                    break;
            }
        }, false);
    }

    this.init();
}
		
