class Player {
  constructor() {
    this.name = null;
    this.index = null;
    this.positionX = 0;
    this.positionY = 0;
    this.rank = 0;
    this.score = 0;
    this.fuel = 185;
    this.life = 185;
  }

  getCount(){
    var playerGetCount = database.ref("playerCount");
    playerGetCount.on("value", (data)=>{
      playerCount = data.val();
    })
  }

  updateCount(count){
    database.ref("/").update({
      playerCount: count,
    })
  }

  addPlayer(){
    var playerIndex = "players/player" + this.index;

    if(this.index === 1){
      this.positionX = width/2 - 100;
    }else{
      this.positionX = width/2 + 100;
    }

    database.ref(playerIndex).set({
      name: this.name,
      positionX: this.positionX,
      positionY: this.positionY,
      rank: this.rank,
      life: this.life,
      score: this.score
      
    })
  }

  static getPlayersInfo(){
    var playerInfoRef = database.ref("players");
    playerInfoRef.on("value", (data)=>{
      allPlayers = data.val();
    })
  }

  getDistance(){
    var playerDistance = database.ref("players/player" + this.index);
    playerDistance.on("value", (data)=>{
      var data = data.val();
      this.positionX = data.positionX;
      this.positionY = data.positionY;
    });
  }

  
  update(){
    var playerIndex = "players/player" + this.index;
    database.ref(playerIndex).update({
      positionX: this.positionX,
      positionY: this.positionY,
      rank: this.rank,
      life: this.life,
      score: this.score
    });
  }

//funções para classificação do jogador
  getCarsAtEnd(){
    database.ref("CarsAtEnd").on("value", data =>{
      this.rank = data.val();
    });
  }

  static updateCarsAtEnd(rank){
database.ref("/").update({
  CarsAtEnd: rank,
})
  }
}
