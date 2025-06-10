const express = require('express');
const router = express.Router();
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const multer = require('multer');
const fs = require('fs');

// Nastavenie upload priečinka
const uploadsDir = path.join(__dirname, '../../skuska recipix/Recipix_app-main/server/uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer storage a filter
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({
    storage: storage,
    fileFilter: function (req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif|webp)$/)) {
            return cb(new Error('Only image files are allowed!'), false);
        }
        cb(null, true);
    }
});

// Pripojenie k databáze
const db = new sqlite3.Database(
    path.join(__dirname, '../../skuska recipix/Recipix_app-main/server/recipix.db')
);

// GET všetky recepty s ingredienciami
router.get('/', (req, res) => {
    db.all('SELECT * FROM recipes', [], async (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        const recipesWithIngredients = await Promise.all(rows.map(recipe => {
            return new Promise((resolve, reject) => {
                db.all(
                    `SELECT i.name, ri.quantity, ri.unit
                     FROM recipe_ingredients ri
                     JOIN ingredients i ON ri.ingredient_id = i.id
                     WHERE ri.recipe_id = ?`,
                    [recipe.id],
                    (err, ingredients) => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve({ ...recipe, ingredients });
                        }
                    }
                );
            });
        }));
        res.json(recipesWithIngredients);
    });
});

// GET jeden recept podľa ID
router.get('/:id', (req, res) => {
    const recipeId = req.params.id;
    db.get('SELECT * FROM recipes WHERE id = ?', [recipeId], (err, recipe) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        if (!recipe) {
            res.status(404).json({ error: 'Recipe not found' });
            return;
        }
        db.all(
            `SELECT i.name, ri.quantity, ri.unit
             FROM recipe_ingredients ri
             JOIN ingredients i ON ri.ingredient_id = i.id
             WHERE ri.recipe_id = ?`,
            [recipeId],
            (err, ingredients) => {
                if (err) {
                    res.status(500).json({ error: err.message });
                    return;
                }
                res.json({ ...recipe, ingredients });
            }
        );
    });
});

// POST nový recept s obrázkom
router.post('/', upload.single('image'), (req, res) => {
    // Validácia povinných polí
    if (!req.body.title || !req.body.preparationTime || !req.body.servings || !req.body.steps || !req.body.ingredients) {
        return res.status(400).json({ error: "All fields (title, preparationTime, servings, steps, ingredients) are required." });
    }

    // Validácia title
    if (typeof req.body.title !== "string" || !req.body.title.trim() || req.body.title.length > 100) {
        return res.status(400).json({ error: "Title must be a non-empty string (max 100 znakov)." });
    }

    // Validácia steps
    if (typeof req.body.steps !== "string" || !req.body.steps.trim() || req.body.steps.length > 1000) {
        return res.status(400).json({ error: "Steps must be a non-empty string (max 1000 znakov)." });
    }

    // Validácia obrázka
    const imagePath = req.file ? req.file.path : null;
    if (!imagePath) {
        return res.status(400).json({ error: "Recipe image is required." });
    }

    // Validácia preparationTime a servings
    const prepTime = Number(req.body.preparationTime);
    const numServings = Number(req.body.servings);

    if (!Number.isInteger(prepTime) || prepTime <= 0 || prepTime > 1000) {
        return res.status(400).json({ error: "preparationTime must be an integer between 1 and 1000." });
    }
    if (!Number.isInteger(numServings) || numServings <= 0 || numServings > 100) {
        return res.status(400).json({ error: "servings must be an integer between 1 and 100." });
    }

    // Validácia ingrediencií
    let parsedIngredients = [];
    try {
        parsedIngredients = typeof req.body.ingredients === "string" ? JSON.parse(req.body.ingredients) : req.body.ingredients;
        if (!Array.isArray(parsedIngredients) || parsedIngredients.length === 0) {
            throw new Error();
        }
        for (const ing of parsedIngredients) {
            if (
                typeof ing.name !== "string" ||
                !ing.name.trim() ||
                !/[a-zA-ZáäčďéíĺľňóôŕšťúýžÁÄČĎÉÍĹĽŇÓÔŔŠŤÚÝŽ]/.test(ing.name) ||
                typeof ing.quantity !== "number" ||
                ing.quantity <= 0 ||
                typeof ing.unit !== "string" ||
                !ing.unit.trim() ||
                ing.unit.length > 20
            ) {
                throw new Error();
            }
        }
    } catch (e) {
        return res.status(400).json({ error: "Ingredients must be a non-empty array of valid ingredient objects." });
    }

    db.run(
        `INSERT INTO recipes (title, preparationTime, servings, steps, imagePath) VALUES (?, ?, ?, ?, ?)`,
        [req.body.title, prepTime, numServings, req.body.steps, imagePath],
        function (err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            const recipeId = this.lastID;

            function addIngredients(index) {
                if (index >= parsedIngredients.length) {
                    res.json({ message: 'Recipe added!', recipeId });
                    return;
                }
                const ingredient = parsedIngredients[index];
                db.get(
                    `SELECT id FROM ingredients WHERE name = ?`,
                    [ingredient.name],
                    (err, row) => {
                        if (err) {
                            res.status(500).json({ error: err.message });
                            return;
                        }
                        if (row) {
                            insertRecipeIngredient(row.id);
                        } else {
                            db.run(
                                `INSERT INTO ingredients (name) VALUES (?)`,
                                [ingredient.name],
                                function (err) {
                                    if (err) {
                                        res.status(500).json({ error: err.message });
                                        return;
                                    }
                                    insertRecipeIngredient(this.lastID);
                                }
                            );
                        }
                    }
                );

                function insertRecipeIngredient(ingredientId) {
                    db.run(
                        `INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit) VALUES (?, ?, ?, ?)`,
                        [recipeId, ingredientId, ingredient.quantity, ingredient.unit],
                        (err) => {
                            if (err) {
                                res.status(500).json({ error: err.message });
                                return;
                            }
                            addIngredients(index + 1);
                        }
                    );
                }
            }

            addIngredients(0);
        }
    );
});

module.exports = router;