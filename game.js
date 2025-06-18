const canvas = document.getElementById('pong');
const ctx = canvas.getContext('2d');

// Game settings
const paddleWidth = 12;
const paddleHeight = 80;
const paddleMargin = 12;
const ballRadius = 10;

// Paddle objects
const player = {
    x: paddleMargin,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    color: "#4be0ff"
};

const ai = {
    x: canvas.width - paddleMargin - paddleWidth,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    color: "#f37055",
    speed: 3
};

// Ball object
const ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: ballRadius,
    speed: 5,
    velocityX: 5,
    velocityY: 5,
    color: "#fff"
};

// Draw paddle
function drawPaddle(paddle) {
    ctx.fillStyle = paddle.color;
    ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
}

// Draw ball
function drawBall(ball) {
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2, false);
    ctx.fillStyle = ball.color;
    ctx.fill();
    ctx.closePath();
}

// Draw net
function drawNet() {
    ctx.fillStyle = "#888";
    for (let i = 0; i < canvas.height; i += 32) {
        ctx.fillRect(canvas.width / 2 - 1, i, 2, 16);
    }
}

// Move player paddle with mouse
canvas.addEventListener('mousemove', function(evt) {
    const rect = canvas.getBoundingClientRect();
    let mouseY = evt.clientY - rect.top;
    player.y = mouseY - player.height / 2;

    // Clamp paddle inside canvas
    if (player.y < 0) player.y = 0;
    if (player.y + player.height > canvas.height) player.y = canvas.height - player.height;
});

// Basic AI for right paddle
function moveAI() {
    let target = ball.y - ai.height / 2;
    if (ai.y < target) {
        ai.y += ai.speed;
        if (ai.y > target) ai.y = target;
    } else if (ai.y > target) {
        ai.y -= ai.speed;
        if (ai.y < target) ai.y = target;
    }
    // Clamp
    if (ai.y < 0) ai.y = 0;
    if (ai.y + ai.height > canvas.height) ai.y = canvas.height - ai.height;
}

// Reset ball to center
function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    // Randomize direction
    ball.velocityX = (Math.random() > 0.5 ? 1 : -1) * ball.speed;
    ball.velocityY = (Math.random() > 0.5 ? 1 : -1) * ball.speed;
}

// Collision detection (AABB - circle)
function collision(paddle, ball) {
    let px = paddle.x;
    let py = paddle.y;
    let pw = paddle.width;
    let ph = paddle.height;
    let bx = ball.x;
    let by = ball.y;
    let br = ball.radius;

    // Closest point to circle inside rectangle
    let closestX = Math.max(px, Math.min(bx, px + pw));
    let closestY = Math.max(py, Math.min(by, py + ph));

    // Distance from closest point to circle center
    let dx = bx - closestX;
    let dy = by - closestY;

    return (dx * dx + dy * dy) < (br * br);
}

// Main update loop
function update() {
    // Move ball
    ball.x += ball.velocityX;
    ball.y += ball.velocityY;

    // Wall collision (top/bottom)
    if (ball.y - ball.radius < 0) {
        ball.y = ball.radius;
        ball.velocityY = -ball.velocityY;
    }
    if (ball.y + ball.radius > canvas.height) {
        ball.y = canvas.height - ball.radius;
        ball.velocityY = -ball.velocityY;
    }

    // Paddle collision
    if (collision(player, ball)) {
        ball.x = player.x + player.width + ball.radius; // prevent sticking
        ball.velocityX = -ball.velocityX;
        // Add some "spin" based on where it hit the paddle
        let collidePoint = (ball.y - (player.y + player.height / 2)) / (player.height / 2);
        ball.velocityY = ball.speed * collidePoint;
    }
    if (collision(ai, ball)) {
        ball.x = ai.x - ball.radius; // prevent sticking
        ball.velocityX = -ball.velocityX;
        let collidePoint = (ball.y - (ai.y + ai.height / 2)) / (ai.height / 2);
        ball.velocityY = ball.speed * collidePoint;
    }

    // Score reset if ball goes off the screen (left or right)
    if (ball.x - ball.radius < 0 || ball.x + ball.radius > canvas.width) {
        resetBall();
    }

    moveAI();
}

// Render everything
function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawNet();
    drawPaddle(player);
    drawPaddle(ai);
    drawBall(ball);
}

// Game loop
function gameLoop() {
    update();
    render();
    requestAnimationFrame(gameLoop);
}

// Start game
resetBall();
gameLoop();