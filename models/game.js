const db = require('../data/database');
const { v4: uuidv4 } = require('uuid');



module.exports = class Game {
    constructor(title, imageURL, price, description) {
        this.title = title;
        this.imageURL = imageURL;
        this.price = price;
        this.description = description;
    }

    // Upload a game for review.
    create(gameObject) {
      const title = gameObject.title
      const description = gameObject.description
      const id = uuidv4();
      const values = [title, id, 'https://cdn.factorio.com/assets/img/blog/fff-310-factorio-cover-017-stable-squared.png', 4.99, description]
      const text = 'INSERT INTO "Game".test(title, id, "imageURL", price, description) VALUES ($1, $2, $3, $4, $5)'
      db.query(text, values).catch(err => console.log(err));

    }

    static deleteByID(id) {

    }

    // List All Games
    static listAll() {
      const games  = db.query('SELECT * FROM "Game".test')
      return games
    }

    static getByID(id) {
      
    }

}
