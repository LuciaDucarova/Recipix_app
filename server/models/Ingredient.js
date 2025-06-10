class Ingredient {
    constructor(id, name, quantity, unit) {
        this.id = id;           // číslo alebo null (ak ešte nie je v DB)
        this.name = name;       // string
        this.quantity = quantity; // číslo
        this.unit = unit;       // string
    }
}

module.exports = Ingredient; 