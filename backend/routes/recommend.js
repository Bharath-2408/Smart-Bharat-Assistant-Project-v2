const express = require("express");
const router = express.Router();
const db = require("../db");

router.post("/", (req, res) => {

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
        AND (occupation IS NULL OR occupation=?)
        AND (income_limit IS NULL OR income_limit>=?)
    ORDER BY scheme_name
    `;

    db.query(
        sql,
        [age, age, gender, occupation, income],
        (err, results) => {

            if (err) {
                return res.status(500).json({
                    success: false,
                    message: err.message
                });
            }

            res.json({
                success: true,
                total: results.length,
                schemes: results
            });

        }
    );

});

router.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Recommend GET Working"
    });
});

module.exports = router;