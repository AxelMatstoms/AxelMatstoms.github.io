const gameContainer = document.getElementById("gameContainer");
const height = gameContainer.clientHeight;

const playerSpeed = 192;
const ballStartSpeed = 128;
const ballSpeedRatio = 1.05;
let ballSpeed = ballStartSpeed;

const focus = {
    y: height / 2,
    vy: 0,
    score: 0
};

const maxi = {
    x : height / 2,
    vy: 0,
    score: 0
};

const ball = {
    x: height / 2,
    y: height / 2, //Height is same as width
    vx: 128,
    vy: 0
};

const maxBallAngle = Math.PI / 3;

const focusDOM = document.getElementById("focus");
const maxiDOM = document.getElementById("maxi");
const ballDOM = document.getElementById("ball");

const keys = new Set();

let lastFrame = performance.now();

const spButton = document.getElementById("single");
const mpButton = document.getElementById("multi");
let gamemode = "";

const scoreDOM = document.getElementById("score");

function spGameLoop(timestamp) {
    const dt = (timestamp - lastFrame) / 1000;
    if (keys.has("ArrowUp")) {
	focus.vy = -playerSpeed;
    } else if (keys.has("ArrowDown")) {
	focus.vy = playerSpeed;
    } else {
	focus.vy = 0;
    }

    updateAI();
    updateObjs(dt);
    updateDOM();

    lastFrame = timestamp;
    if (gamemode != "mp") {
	window.requestAnimationFrame(spGameLoop);
    }
}

function mpGameLoop(timestamp) {
    const dt = (timestamp - lastFrame) / 1000;
    if (keys.has("ArrowUp")) {
	focus.vy = -playerSpeed;
    } else if (keys.has("ArrowDown")) {
	focus.vy = playerSpeed;
    } else {
	focus.vy = 0;
    }

    if (keys.has("w")) {
	maxi.vy = -playerSpeed;
    } else if (keys.has("s")) {
	maxi.vy = playerSpeed;
    } else {
	maxi.vy = 0;
    }

    updateObjs(dt);
    updateDOM();

    lastFrame = timestamp;
    if (gamemode != "sp") {
	window.requestAnimationFrame(mpGameLoop);
    }
}

function updateObjs(dt) {
    //Update ICA Focus
    focus.y += focus.vy * dt;
    if (focus.y + focusDOM.scrollHeight > 512) {
	focus.y = 512 - focusDOM.scrollHeight;
    }
    if (focus.y < 0) {
	focus.y = 0;
    }
    //Update ICA Maxi
    maxi.y += maxi.vy * dt;
    if (maxi.y + maxiDOM.scrollHeight > 512) {
	maxi.y = 512 - maxiDOM.scrollHeight;
    }
    if (maxi.y < 0) {
	maxi.y = 0;
    }

    
    //Update ball
    if (ball.y + ballDOM.clientHeight / 2 > 512) {
	ball.y = 512 - ballDOM.clientHeight / 2;
	ball.vy = -ball.vy;
    }
    if (ball.y - ballDOM.clientHeight / 2 < 0) {
	ball.y = ballDOM.clientHeight / 2;
	ball.vy = -ball.vy;
    }

    const focusBound = focusDOM.getBoundingClientRect();
    const maxiBound = maxiDOM.getBoundingClientRect();
    const gameBound = gameContainer.getBoundingClientRect();
    
    if (ball.x - ballDOM.clientWidth / 2 < (focusBound.left - gameBound.left) + focusDOM.scrollWidth) {
	if (inRange(ball.y, focus.y - ballDOM.clientHeight / 2, focus.y + focusDOM.clientHeight + ballDOM.clientHeight / 2)) {
	    const pos = (ball.y - (focus.y + focusDOM.clientHeight / 2)) / (focusDOM.clientHeight);
	    const angle = pos * maxBallAngle;
	    ballSpeed *= ballSpeedRatio;
	    ball.vx = Math.cos(angle) * ballSpeed;
	    ball.vy = Math.sin(angle) * ballSpeed;
	} else {
	    maxi.score++;
	    reset();
	}
    }

    if (ball.x + ballDOM.clientWidth / 2 > maxiBound.left - gameBound.left) {
	if (inRange(ball.y, maxi.y - ballDOM.clientHeight / 2, maxi.y + maxiDOM.clientHeight + ballDOM.clientHeight / 2)) {
	    const pos = (ball.y - (maxi.y + maxiDOM.clientHeight / 2)) / (maxiDOM.clientHeight);
	    const angle = Math.PI - pos * maxBallAngle;
	    ballSpeed *= ballSpeedRatio;
	    ball.vx = Math.cos(angle) * ballSpeed;
	    ball.vy = Math.sin(angle) * ballSpeed;
	} else {
	    focus.score++;
	    reset();
	}
    }


    ball.x += ball.vx * dt;
    ball.y += ball.vy * dt;
    
}

function updateDOM() {
    focusDOM.style.top = `${focus.y}px`;
    maxiDOM.style.top = `${maxi.y}px`;
    ballDOM.style.left = `${ball.x - ballDOM.clientWidth / 2}px`;
    ballDOM.style.top = `${ball.y - ballDOM.clientHeight / 2}px`;
}

function updateAI() {
    const posy = maxi.y + maxiDOM.clientHeight / 2;
    const h = maxiDOM.clientHeight;
    if (posy + h / 4 < ball.y) {
	maxi.vy = playerSpeed;
    } else if (posy - h / 4 > ball.y) {
	maxi.vy = -playerSpeed;
    } else {
	maxi.vy = 0;
    }
}

function reset() {
    ballSpeed = ballStartSpeed;
    ball.x = height / 2;
    ball.y = height / 2;
    const angle = 0;
    ball.vx = Math.cos(angle) * ballSpeed;
    ball.vy = Math.sin(angle) * ballSpeed;
    focus.y = height / 2;
    focus.vy = 0;
    maxi.y = height / 2;
    maxi.vy = 0;
    scoreDOM.innerHTML = `${focus.score}:${maxi.score}`;
}

function resetScore() {
    focus.score = 0;
    maxi.score = 0;
}

function inRange(value, lower, upper) {
    return (value > lower && value < upper);
}

spButton.addEventListener("click", (ev) => {
    gamemode = "sp";
    resetScore();
    reset();
    lastFrame = performance.now();
    window.requestAnimationFrame(spGameLoop);
});

mpButton.addEventListener("click", (ev) => {
    gamemode = "mp";
    resetScore();
    reset();
    lastFrame = performance.now();
    window.requestAnimationFrame(mpGameLoop);
});

window.addEventListener("keydown", (ev) => {
    keys.add(ev.key);
});

window.addEventListener("keyup", (ev) => {
    keys.delete(ev.key);
});

