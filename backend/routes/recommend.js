const express = require("express");
const router = express.Router();
const db = require("../db");

// Test Route
router.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Recommend GET Working"
    });
});

// Recommendation Route
router.post("/", (req, res) => {

    console.log("Recommendation Request:", req.body);

    const {
        age,
        gender,
        occupation,
        income
    } = req.body;

    const sql = `
    SELECT *
    FROM schemes
    WHERE
        (age_min IS NULL OR age_min <= ?)
        AND (age_max IS NULL OR age_max >= ?)
        AND (gender='Any' OR gender=?)
        AND (occupation IS NULL OR occupation=? OR occupation='Any')
        AND (income_limit IS NULL OR income_limit>=?)
    ORDER BY scheme_name
    `;

    db.query(
        sql,
        [age, age, gender, occupation, income],
        (err, results) => {

            if (err) {

                console.log(err);

                return res.status(500).json({
                    success: false,
                    message: err.message
                });

            }

            console.log("Recommended Schemes:", results.length);

            res.json({
                success: true,
                total: results.length,
                schemes: results
            });

        }
    );

});

module.exports = router;