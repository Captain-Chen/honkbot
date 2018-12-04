function Dungeon(){
  this.partyList = [];
}

Dungeon.prototype.reset = function(){}
Dungeon.prototype.start = function(){}

Dungeon.prototype.join = function(sender){
  if(!this.partyList.exists(sender)){
    this.partyList.push(sender);
    return `${sender} joined the party.`;
  }else{
    return `${sender}, you are already in the party!`;
  }
}

Dungeon.prototype.render = function(renderer){
  
}

Array.prototype.exists = function(value){
  for(let i = 0; i < this.length; i++){
    const currentItem = this[i];
    if(currentItem === value){
      return true;
    }
  }
  return false;
}

module.exports = Dungeon;