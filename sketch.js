const PLAYER_FRAME_COUNT = 10; // 設定我方 stop 動畫的影格數量為十張。
const RUN_FRAME_COUNT = 6; // 設定我方 run 動畫的影格數量為六張。
const FIGHT_FRAME_COUNT = 10; // 設定我方 fight 動畫的影格數量為十張。
const PLAYER_SPRITE_WIDTH = 1095 / 10; // 依照我方精靈表寬度計算單格角色寬度。
const PLAYER_SPRITE_HEIGHT = 183; // 設定我方單格角色的原始高度。
const RUN_SPRITE_WIDTH = 1063 / 6; // 依照 run 圖片總寬度計算單格角色寬度。
const RUN_SPRITE_HEIGHT = 158; // 設定 run 單格角色的原始高度。
const FIGHT_SPRITE_WIDTH = 2215 / 10; // 依照 fight 圖片總寬度計算單格角色寬度。
const FIGHT_SPRITE_HEIGHT = 125; // 設定 fight 單格角色的原始高度。
const PLAYER_SCALE = 1.5; // 設定我方角色的顯示尺寸放大一點五倍。
const FRAME_INTERVAL = 100; // 設定動畫每隔一百毫秒切換一格。
const PLAYER_SPEED = 5; // 設定我方角色每畫格移動五個像素。

let playerFrames = []; // 建立陣列，用來存放我方的十張 stop 圖片。
let runFrames = []; // 建立陣列，用來存放我方的六張 run 圖片。
let fightFrames = []; // 建立陣列，用來存放我方的十張 fight 圖片。

let bgImg; // 宣告變數，用來存放背景圖片。
let bgX = 0; // 記錄背景目前的水平位移量。
let bgWidth = 0; // 記錄背景圖片縮放後的實際寬度。
let bgHeight = 0; // 記錄背景圖片縮放後的實際高度。
let minBgX = 0; // 背景向右滾動的極限位置（最右端）。
let maxBgX = 0; // 背景向左滾動的極限位置（最左端）。

let playerCenterX; // 宣告變數，用來記錄我方角色中心的水平位置。
let facingDirection = 1; // 設定角色初始面向右方。
let isAttacking = false; // 記錄目前是否正在播放攻擊動作。
let fightStartTime = 0; // 記錄攻擊動畫開始播放的時間。

function preload() { // 在畫布建立前預先載入所有角色與背景圖片。
  for (let frame = 0; frame < PLAYER_FRAME_COUNT; frame++) {
    playerFrames.push(loadImage(`2/stop/${frame}.png`));
  }
  for (let frame = 0; frame < RUN_FRAME_COUNT; frame++) {
    runFrames.push(loadImage(`2/run/${frame}.png`));
  }
  for (let frame = 0; frame < FIGHT_FRAME_COUNT; frame++) {
    fightFrames.push(loadImage(`2/fight/${frame}.png`));
  }
  bgImg = loadImage('bg/2.png'); // 從指定資料夾載入 bg/2.png 背景圖片。
}

function setup() { // 設定全螢幕畫布與初始化尺寸位置。
  createCanvas(windowWidth, windowHeight);
  imageMode(CORNER);
  
  // 依照視窗高度等比例計算背景寬高
  bgHeight = height;
  bgWidth = bgImg.width * (height / bgImg.height);
  
  // 設定三張拼貼背景的滾動極限範圍
  // 三張圖總寬度為 bgWidth * 3，讓初始位置位於中間那張圖
  bgX = -bgWidth; 
  minBgX = -bgWidth * 2; // 背景向右滾動到底（最右端）
  maxBgX = 0;            // 背景向左滾動到底（最左端）

  playerCenterX = width / 2; // 將角色初始位置設定在畫面正中央。
}

function draw() { // 每一畫格重新繪製背景與動畫角色。
  background(135, 206, 235); // 使用天空藍作為預設背景顏色。

  const rightPressed = keyIsDown(RIGHT_ARROW); // 檢查目前是否按住鍵盤右方向鍵。
  const leftPressed = keyIsDown(LEFT_ARROW); // 檢查目前是否按住鍵盤左方向鍵。
  const isRunning = rightPressed || leftPressed; // 判斷目前是否正在移動。

  // 取得角色當前動作對應的寬高與顯示尺寸
  const isFighting = isAttacking && millis() - fightStartTime < FIGHT_FRAME_COUNT * FRAME_INTERVAL;
  if (isAttacking && !isFighting) {
    isAttacking = false;
  }
  const basePlayerWidth = isFighting ? FIGHT_SPRITE_WIDTH : isRunning ? RUN_SPRITE_WIDTH : PLAYER_SPRITE_WIDTH;
  const basePlayerHeight = isFighting ? FIGHT_SPRITE_HEIGHT : isRunning ? RUN_SPRITE_HEIGHT : PLAYER_SPRITE_HEIGHT;
  const playerWidth = basePlayerWidth * PLAYER_SCALE;
  const playerHeight = basePlayerHeight * PLAYER_SCALE;
  const playerY = height - playerHeight;

  // 處理背景捲動與角色移動的分段邏輯
  if (rightPressed && !leftPressed) {
    facingDirection = 1;
    // 如果背景還沒到達最右端（minBgX），則背景往左移動
    if (bgX > minBgX) {
      bgX -= PLAYER_SPEED;
      bgX = max(bgX, minBgX); // 確保不超出邊界
    } else {
      // 背景已到達最右端，背景暫停，改由角色往右移動
      playerCenterX += PLAYER_SPEED;
      playerCenterX = constrain(playerCenterX, playerWidth / 2, width - playerWidth / 2);
    }
  } else if (leftPressed && !rightPressed) {
    facingDirection = -1;
    // 如果背景還沒到達最左端（maxBgX），則背景往右移動
    if (bgX < maxBgX) {
      bgX += PLAYER_SPEED;
      bgX = min(bgX, maxBgX); // 確保不超出邊界
    } else {
      // 背景已到達最左端，背景暫停，改由角色往左移動
      playerCenterX -= PLAYER_SPEED;
      playerCenterX = constrain(playerCenterX, playerWidth / 2, width - playerWidth / 2);
    }
  }

  // 連續繪製三張相同的背景圖片拼貼在一起（左、中、右）
  image(bgImg, bgX, 0, bgWidth, bgHeight);
  image(bgImg, bgX + bgWidth, 0, bgWidth, bgHeight);
  image(bgImg, bgX + bgWidth * 2, 0, bgWidth, bgHeight);

  // 計算並繪製角色動畫影格
  const animationFrame = isFighting ? min(floor((millis() - fightStartTime) / FRAME_INTERVAL), FIGHT_FRAME_COUNT - 1) : floor(millis() / FRAME_INTERVAL) % (isRunning ? RUN_FRAME_COUNT : PLAYER_FRAME_COUNT);
  const currentFrame = isFighting ? fightFrames[animationFrame] : isRunning ? runFrames[animationFrame] : playerFrames[animationFrame];

  push();
  translate(playerCenterX, playerY);
  scale(facingDirection, 1);
  image(currentFrame, -playerWidth / 2, 0, playerWidth, playerHeight);
  pop();
}

function keyPressed() {
  if (key === ' ' && !isAttacking) {
    isAttacking = true;
    fightStartTime = millis();
  }
  if (key === ' ') {
    return false; // 阻止瀏覽器因空白鍵而捲動頁面。
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  // 當視窗大小改變時同步更新背景尺寸與極限範圍
  bgHeight = height;
  bgWidth = bgImg.width * (height / bgImg.height);
  minBgX = -bgWidth * 2;
  maxBgX = 0;
}