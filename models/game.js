module.exports = class Game {
    constructor(title, imageURL, price, description) {
        this.title = title;
        this.imageURL = imageURL;
        this.price = price;
        this.description = description;
    }

    upload() {
        // Database upload functionality.
    }

    // static fetchAll(callback) { // fetchAll has a function as a parameter which it will execute when it finishes.
    //     // Database fetches all games on the store.
    // }

    static fetchAll(callback) {
        getGamesFromFile(cb);
      }

    static retrieveByID(id, callback) {
        // Database read functionality.
    }

}