const fs = require('fs');
const path = require('path');

const p = path.join(
  path.dirname(process.mainModule.filename),
  'data',
  'games.json'
);

const getGamesFromFile = cb => {
    fs.readFile(p, (err, fileContent) => {
      if (err) {
        cb([]);
      } else {
        cb(JSON.parse(fileContent));
      }
    });
  };

module.exports = class Game {
    constructor(title, imageURL, price, description) {
        this.title = title;
        this.imageURL = imageURL;
        this.price = price;
        this.description = description;
    }

    upload() {
        // Database upload functionality.
    this.id = Math.random().toString();
    getGamesFromFile(games => {
      games.push(this);
      fs.writeFile(p, JSON.stringify(games), err => {
        console.log(err);
      });
    });
    }

    // static fetchAll(callback) { // fetchAll has a function as a parameter which it will execute when it finishes.
    //     // Database fetches all games on the store.
    // }

    static fetchAll(callback) {
        getGamesFromFile(callback);
      }

    static retrieveByID(id, callback) {
        // Database read functionality.
        getGamesFromFile(games => {
            const game = games.find(p => p.id === id);
            cb(games);
        });
        
    }

}
