const print = console.log.bind(this);

class Dungeon{
  constructor(connection){
    this.irc = connection;
    this.handleMessages = this.handleMessages.bind(this);
    this.irc._client.on('message', this.handleMessages);
    this.partyList = [];
  }

  start(){}

  reset(){}

  join(sender){
    if(!this.partyList.exists(sender)){
      this.partyList.push(sender);
      return `${sender} joined the party.`;
    }else{
      return `${sender}, you are already in the party!`;
    }
  }

  render(renderer){

  }

  handleMessages(channel, userstate, message, self){
    if(self){
      return;
    }

    let sender = userstate['display-name'];

    if(message === "!dungeon"){
      this.irc._client.say(channel, this.join(sender));
    }
  }
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