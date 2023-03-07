class Game {
  constructor() {
    this.resetTitle = createElement("h2");
    this.resetButton = createButton("");
    this.leadeboardTitle = createElement("h2");
    this.leader1 = createElement("h2");
    this.leader2 = createElement("h2");

    this.playerMoving = false;
    //tecla left ativa ?
    this.leftKeyActive = false;
    this.blast = false;
    
  }

  getState(){
    var gameStateRef = database.ref("gameState");
    gameStateRef.on("value", function(data){
      gameState = data.val();
    })
  }

  update(state){
    database.ref("/").update({
      gameState:state
    })
  }

  start() {
    form = new Form();
    form.display();
    player = new Player();
    playerCount = player.getCount();

    car1 = createSprite(width/2 -50, height -100);
    car1.addImage("car1",car1_img);
    car1.addImage("blast",blastImg);
    car1.scale = 0.1;

    car2 = createSprite(width/2 +100, height -100);
    car2.addImage("car2",car2_img);
    car2.addImage("blast",blastImg);
    car2.scale = 0.1;

    cars = [car1,car2];

    fuels = new Group();
    powerCoins = new Group();
    obstacles1 = new Group();
    obstacles2 = new Group();

    // matrizes com posição e imagens dos obstáculos
    var obstacle1Positions = [
      { x: width / 2 - 150, y: height - 1300, image: obstacle_1_img },
      { x: width / 2 + 250, y: height - 1800, image: obstacle_1_img },
      { x: width / 2 - 180, y: height - 3300, image: obstacle_1_img },
     
      { x: width / 2 - 150, y: height - 4300, image: obstacle_1_img },
      { x: width / 2, y: height - 5300, image: obstacle_1_img },
    ];

    var obstacle2Positions = [
      { x: width / 2 + 250, y: height - 800, image: obstacle_2_img },
      { x: width / 2 - 180, y: height - 2300, image: obstacle_2_img },
      { x: width / 2, y: height - 2800, image: obstacle_2_img },
     
      { x: width / 2 + 180, y: height - 3300, image: obstacle_2_img },
      { x: width / 2 + 250, y: height - 3800, image: obstacle_2_img },
      { x: width / 2 + 250, y: height - 4800, image: obstacle_2_img },
      { x: width / 2 - 180, y: height - 5500, image: obstacle_2_img }
    ];


    //criando os grupos de recompensas e obstáculos
    this.addSprites(powerCoins,18,powerCoin_img,0.09);
    this.addSprites(fuels,4,fuel_img,0.02);
    this.addSprites(obstacles1,obstacle1Positions.length,obstacle_1_img,0.04,obstacle1Positions);
    this.addSprites(obstacles2,obstacle2Positions.length,obstacle_2_img,0.04,obstacle2Positions);

  }

  play(){
    this.handleElements();
    this.handleResetButton();
    Player.getPlayersInfo();
    player.getCarsAtEnd();

    //jogadores estão prontos?
    if(allPlayers !== undefined){
      image(track,0, -height*5,width,height*6);

      this.showLeaderboard(); //placar
      this.showFuelBar(); 
      this.showLife();

      var index = 0 
      for (var i in allPlayers){
        index += 1;

        var x = allPlayers[i].positionX;
        var y = height - allPlayers[i].positionY;

        var currentLife = allPlayers[i].life;
        if(currentLife <=0){
          cars[index-1].changeImage("blast");
          cars[index-1].scale = 0.3;
        }

        cars[index-1].position.x = x
        cars[index-1].position.y = y

        //identificando o jogador <------ <----
        if(index === player.index){
          fill("red");
          ellipse(x,y,100,100);
          
          this.handleFuel(index);
          this.handlePowerCoins(index);
          //chamar função de colisão
          this.handleObstacleCollision(index);
          this.handleCarsCollision(index);

          //Se life 0
          if(player.life <= 0){
            this.blast = true;
            this.playerMoving = false;
            //this.gameOver();
          }

          //alterando posição da câmera
          camera.position.y = cars[index - 1].position.y;
        }
      }

      if(this.playerMoving){
          player.positionY += 5;
          player.update();
      }

      // manipulação de eventos de teclado
      this.handlePlayerControls();
      
      // Linha de chegada
      const finishLine = height*6 -100;

      if(player.positionY > finishLine){
        gameState = 2;
        player.rank += 1;
        Player.updateCarsAtEnd(player.rank);
        player.update();
        this.showRank();
      }


      drawSprites();
    }
  }

  handleElements(){
    form.hide();
    form.titleImg.position(40,50);
    form.titleImg.class("gameTitleNovo");

    this.resetTitle.html("Reiniciar");
    this.resetTitle.class("resetText");
    this.resetButton.class("resetButton");
    this.resetTitle.position(width / 2 + 200, 40);
    this.resetButton.position(width / 2 + 230, 100);

    this.leadeboardTitle.html("Placar");
    this.leadeboardTitle.class("resetText");
    this.leadeboardTitle.position(width / 3 - 60, 40);

    this.leader1.class("leadersText");
    this.leader1.position(width / 3 - 50, 80);

    this.leader2.class("leadersText");
    this.leader2.position(width / 3 - 50, 130);
  }
  //controles do jogador
  handlePlayerControls(){
    if(!this.blast){
      if(keyIsDown(UP_ARROW)){
        this.playerMoving = true;
        player.positionY += 10;
        player.update();
      }
  
      if(keyIsDown(LEFT_ARROW) && player.positionX > width/3 -50){
        this.leftKeyActive = true;
        player.positionX -= 5;
        player.update();
        console.log(player.positionX)
      }
  
      if(keyIsDown(RIGHT_ARROW) && player.positionX < width/2 + 300){
        player.positionX += 5;
        player.update();
        console.log(player.positionX)
      }
    }
  }

  //função reset 
  handleResetButton(){
    this.resetButton.mousePressed(()=>{
      database.ref("/").set({
        playerCount:0,
        gameState:0,
        players: {},
        CarsAtEnd:0
      });
      window.location.reload();
    });
  }

  //gerando o placar
  showLeaderboard() {
    var leader1, leader2;
    var players = Object.values(allPlayers);
    if (
      (players[0].rank === 0 && players[1].rank === 0) ||
      players[0].rank === 1
    ) {
      // &emsp;    Esta tag é usada para exibir quatro espaços.
      leader1 =
        players[0].rank +"&emsp;" + players[0].name + "&emsp;" + players[0].score;

      leader2 =
        players[1].rank +
        "&emsp;" +
        players[1].name +
        "&emsp;" +
        players[1].score;
    }

    if (players[1].rank === 1) {
      leader1 =
        players[1].rank +
        "&emsp;" +
        players[1].name +
        "&emsp;" +
        players[1].score;

      leader2 =
        players[0].rank +
        "&emsp;" +
        players[0].name +
        "&emsp;" +
        players[0].score;
    }

    this.leader1.html(leader1);
    this.leader2.html(leader2);
  }

  // função para gerar recompensas e obstáculos
  addSprites(spriteGroup, numberOfSprites,spriteImage,scale,positions = []){
    for(var i = 0; i < numberOfSprites;i++){
      var x,y;

      if(positions.length > 0){
        x = positions[i].x;
        y = positions[i].y;
        spriteImage = positions[i].image;
      }else{
        x = random(width/2 + 150,width/2 - 150);
        y = random(-height * 4.5,height - 400);
      }
     
      var sprite = createSprite(x,y);
      sprite.addImage(spriteImage);
      sprite.scale = scale;
      spriteGroup.add(sprite);
    }

  }

  // função para colisão com combustivel
  handleFuel(index) {
    // Adicione o combustível
    cars[index - 1].overlap(fuels, function(collector, collected) {
      player.fuel = 185;
      //collected (coletado) é o sprite no grupo de colecionáveis que desencadeia
      //o evento
      collected.remove();
    });
    
    // Reduzir o combustível do carro do jogador
    if (player.fuel > 0 && this.playerMoving) {
      player.fuel -= 0.3;
    }
    
    if (player.fuel <= 0) {
      gameState = 2;
      this.gameOver();
    }
  }
  
  // função para colisão com moeda
  handlePowerCoins(index) {
    cars[index - 1].overlap(powerCoins, function(collector, collected) {
      player.score += 21;
      player.update();
      //collected (coletado) é o sprite no grupo de colecionáveis que desencadeia
      //o evento
      collected.remove();
    });
  }

  //feedbacks - barras de progresso
showFuelBar(){
  push();
  image(fuel_img,width/2 -130,height-player.positionY-350,20,20);
  fill("white");
  rect(width/2 - 100,height-player.positionY-350,185,20);
  fill("#ffc400");
  rect(width/2 - 100,height-player.positionY-350,player.fuel,20);
  noStroke();
  pop();
}

showLife(){
  push();
  image(lifeImg,width/2 -130,height-player.positionY-310,20,20);
  fill("white");
  rect(width/2 - 100,height-player.positionY-310,185,20);
  fill("red");
  rect(width/2 - 100,height-player.positionY-310,player.life,20);
  noStroke();
  pop();
}

  

  //janelas de fim de jogo
  showRank() {
    swal({
      title: `Incrível!${"\n"}Classificação${"\n"}${player.rank}`,
      text: "Você alcançou a linha de chegada com sucesso!",
      imageUrl:
        "https://raw.githubusercontent.com/vishalgaddam873/p5-multiplayer-car-race-game/master/assets/cup.png",
      imageSize: "100x100",
      confirmButtonText: "Ok"
    });
  }

  gameOver() {
    swal({
      title: `Fim de Jogo`,
      text: "Ops, você perdeu a corrida....!!!",
      imageUrl:
        "https://cdn.shopify.com/s/files/1/1061/1924/products/Thumbs_Down_Sign_Emoji_Icon_ios10_grande.png",
      imageSize: "100x100",
      confirmButtonText: "Obrigado por Jogar"
    });
  }

  end() {
    console.log("Fim de Jogo");
  }

  handleObstacleCollision(index){
    if(cars[index-1].collide(obstacles1)||cars[index-1].collide(obstacles2)){
      if(this.leftKeyActive){
        player.positionX +=100;
      }else{
        player.positionX -=100;
      }

      if(player.life > 0){
        player.life -= 185/4;
      }
      player.update();
    }
  }
  
  handleCarsCollision(index){
    if(index === 1){
      if(cars[index-1].collide(cars[1])){
        if(this.leftKeyActive){
          player.positionX +=100;
        }else{
          player.positionX -=100;
        }
  
        if(player.life > 0){
          player.life -= 185/4;
        }
        player.update();
      }
    }
    if(index === 2){
      if(cars[index-1].collide(cars[0])){
        if(this.leftKeyActive){
          player.positionX +=100;
        }else{
          player.positionX -=100;
        }
  
        if(player.life > 0){
          player.life -= 185/4;
        }
        player.update();
      }
      }
    }
  }



