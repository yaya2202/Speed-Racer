var canvas;
var backgroundImage;
var bgImg;
var database;
var form, player;
var gameState;
var playerCount;
var car1,car2,car1_img,car2_img, track;
var cars = [];
var allPlayers, fuels, powerCoins,fuel_img, powerCoin_img,lifeImg;
var obstacle_1_img,obstacle_2_img, obstacles1,obstacles2;
var blastImg;

function preload() {
  backgroundImage = loadImage("./assets/planodefundo.png");
  car1_img = loadImage("assets/car1.png");
  car2_img = loadImage("assets/car2.png");
  track = loadImage("assets/track.jpg");
  fuel_img = loadImage("assets/fuel.png");
  powerCoin_img = loadImage("assets/goldCoin.png");
  obstacle_1_img = loadImage("assets/obstacle1.png");
  obstacle_2_img = loadImage("assets/obstacle2.png");
  lifeImg = loadImage("assets/life.png");
  blastImg = loadImage("assets/blast.png")

}

function setup() {
  canvas = createCanvas(windowWidth, windowHeight);
  database = firebase.database();
  game = new Game();
  game.getState();
  game.start();

}

function draw() {
  background(backgroundImage);
  if(playerCount === 2){
    game.update(1);
  }
  
  if(gameState === 1){
    game.play();
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}


/*
var a = 10
var b = 3
var soma = a + b

console.log(` A soma de ${a} e ${b} é igual a ${soma}`)
*/

