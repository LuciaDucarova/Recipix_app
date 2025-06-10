class Recipe {
    constructor(id, title, preparationTime, servings, steps, imagePath, ingredients = [], notes = '', rating = null, favorite = false) {
        this.id = id;                   // číslo alebo null
        this.title = title;             // string
        this.preparationTime = preparationTime; // číslo
        this.servings = servings;       // číslo
        this.steps = steps;             // string
        this.imagePath = imagePath;     // string (cesta k obrázku)
        this.ingredients = ingredients; // pole Ingredient objektov
        this.notes = notes;             // string
        this.rating = rating;           // číslo alebo null
        this.favorite = favorite;       // boolean
    }
}

module.exports = Recipe;