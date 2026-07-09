const express = require("express");
const router = express.Router();
const db = require("../db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const { body, validationResult } = require("express-validator");

// ================= MAIL CONFIG =================
let transporter = null;

if (process.env.MAIL_USER && process.env.MAIL_PASS) {
    transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASS
        }
    });

    transporter.verify((err) => {
        if (err) {
            console.log("Mail Config Error:", err.message);
        } else {
            console.log("Mail Server Ready ✅");
        }
    });
} else {
    console.log("Mail credentials not found. Email disabled ⚠");
}

// ================= REGISTER =================
router.post(
    "/register",
    [
        body("name").notEmpty().withMessage("Name is required"),
        body("email").isEmail().withMessage("Valid email is required"),
        body("phone").notEmpty().withMessage("Phone number is required"),
        body("password")
            .isLength({ min: 6 })
            .withMessage("Password must be at least 6 characters")
    ],
    async (req, res) => {

        const errors = validationResult(req);

        if (!errors.isEmpty()) {

            return res.status(400).json({

                message: errors.array()[0].msg

            });

        }

        const { name, email, phone, password } = req.body;

        try {

            const hashedPassword = await bcrypt.hash(password, 10);

            const sql =
                "INSERT INTO users (name, email, phone, password) VALUES (?, ?, ?, ?)";

            db.query(
                sql,
                [name, email, phone, hashedPassword],
                (err) => {

                    if (err) {

                        console.log("Registration Error:", err);

                        // Email already exists
                        if (err.code === "ER_DUP_ENTRY") {

                            return res.status(409).json({

                                message: "Email already exists"

                            });

                        }

                        // Other database error
                        return res.status(500).json({

                            message: "Database Error"

                        });

                    }

                    return res.status(201).json({

                        message: "Registration Successful"

                    });

                }
            );

        }

        catch (err) {

            console.log(err);

            return res.status(500).json({

                message: "Server Error"

            });

        }

    }
);

// ================= USER LOGIN =================
router.post("/login", (req, res) => {
    const { email, password } = req.body;

    const sql = "SELECT * FROM users WHERE email=?";

    db.query(sql, [email], async (err, result) => {
        if (err || result.length === 0) {
            return res.status(400).json({
                message: "Invalid Credentials"
            });
        }

        const user = result[0];

        const isMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!isMatch) {
            return res.status(400).json({
                message: "Invalid Credentials"
            });
        }

        const token = jwt.sign(
            {
                id: user.id,
                email: user.email
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1d"
            }
        );

        res.json({
            message: "Login Successful",
            token,
            name: user.name,
            email: user.email,
            phone: user.phone
        });
    });
});

// ================= APPLY SCHEME =================
router.post("/apply", (req, res) => {
    const {
        applicant_name,
        aadhaar,
        address,
        scheme_name,
        email
    } = req.body;

    if (
        !applicant_name ||
        !aadhaar ||
        !address ||
        !scheme_name ||
        !email
    ) {
        return res.status(400).json({
            message: "All fields required"
        });
    }

    const checkSql =
        "SELECT * FROM applications WHERE email=? AND scheme_name=?";

    db.query(
        checkSql,
        [email, scheme_name],
        (checkErr, checkResult) => {

            if (checkErr) {
                console.log(checkErr);
                return res.status(500).json({
                    message: "Check Failed"
                });
            }

            if (checkResult.length > 0) {
                return res.status(400).json({
                    message: "Already Applied"
                });
            }

            const insertSql = `
                INSERT INTO applications
                (applicant_name, aadhaar, address, scheme_name, status, email)
                VALUES (?, ?, ?, ?, ?, ?)
            `;

            db.query(
                insertSql,
                [
                    applicant_name,
                    aadhaar,
                    address,
                    scheme_name,
                    "Pending",
                    email
                ],
                (err) => {
                    if (err) {
                        console.log(err);
                        return res.status(500).json({
                            message: "Application Failed"
                        });
                    }

                    res.status(201).json({
                        message: "Application submitted successfully"
                    });
                }
            );
        }
    );
});

// ================= ADMIN LOGIN =================
router.post("/admin-login", (req, res) => {

    const { email, password } = req.body;

    const sql = "SELECT * FROM admins WHERE email=?";

    db.query(sql, [email], async (err, result) => {

        if (err) {
            console.log(err);
            return res.status(500).json({
                message: "Server Error"
            });
        }

        if (result.length === 0) {
            return res.status(401).json({
                message: "Invalid Email or Password"
            });
        }

        const admin = result[0];

        const match = await bcrypt.compare(password, admin.password);

        if (!match) {
            return res.status(401).json({
                message: "Invalid Email or Password"
            });
        }

        return res.json({
            message: "Admin Login Successful"
        });

    });

});

// ================= GET ALL APPLICATIONS =================
router.get("/applications", (req, res) => {
    db.query(
        "SELECT * FROM applications ORDER BY id ASC",
        (err, result) => {
            if (err) {
                console.log(err);
                return res.json([]);
            }

            res.json(result);
        }
    );
});

// ================= UPDATE STATUS =================
router.post("/update-status", (req, res) => {
    const { id, status } = req.body;

    const updateQuery =
        "UPDATE applications SET status=? WHERE id=?";

    db.query(updateQuery, [status, id], (err) => {
        if (err) {
            console.log(err);
            return res.status(500).json({
                message: "Update Failed"
            });
        }

        const getUserQuery =
            "SELECT email, scheme_name FROM applications WHERE id=?";

        db.query(getUserQuery, [id], (err, result) => {
            if (!err && result.length > 0 && transporter) {
                const email = result[0].email;
                const scheme = result[0].scheme_name;

                const mailOptions = {
                    from: process.env.MAIL_USER,
                    to: email,
                    subject: "Application Status Update",
                    text: `Your application for ${scheme} is ${status}`
                };

                transporter.sendMail(mailOptions, (err) => {
                    if (err) {
                        console.log("Mail Error:", err.message);
                    } else {
                        console.log("Mail Sent Successfully ✅");
                    }
                });
            }
        });

        res.json({
            message: "Status Updated Successfully"
        });
    });
});

// ================= USER STATUS =================
router.get("/status/:email", (req, res) => {
    const email = req.params.email;

    db.query(
        "SELECT * FROM applications WHERE email=? ORDER BY id ASC",
        [email],
        (err, result) => {
            if (err) {
                console.log(err);
                return res.json([]);
            }

            res.json(result);
        }
    );
});

// ================= NOTIFICATIONS =================
router.get("/notifications/:email", (req, res) => {
    const email = req.params.email;

    db.query(
        "SELECT * FROM notifications WHERE email=? ORDER BY id DESC",
        [email],
        (err, result) => {
            if (err) {
                console.log(err);
                return res.json([]);
            }

            res.json(result);
        }
    );
});

// ================= CHANGE PASSWORD =================
router.post("/change-password", async (req, res) => {

    const { email, oldPassword, newPassword } = req.body;

    if (!email || !oldPassword || !newPassword) {
        return res.status(400).json({
            message: "All fields required"
        });
    }

    const sql =
        "SELECT * FROM users WHERE email=?";

    db.query(sql, [email], async (err, result) => {

        if (err) {
            console.log(err);
            return res.status(500).json({
                message: "Server Error"
            });
        }

        if (result.length === 0) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        const user = result[0];

        const isMatch =
            await bcrypt.compare(
                oldPassword,
                user.password
            );

        if (!isMatch) {
            return res.status(400).json({
                message: "Old Password Incorrect"
            });
        }

        const hashedPassword =
            await bcrypt.hash(newPassword, 10);

        const updateSql =
            "UPDATE users SET password=? WHERE email=?";

        db.query(
            updateSql,
            [hashedPassword, email],
            (err) => {

                if (err) {
                    console.log(err);
                    return res.status(500).json({
                        message: "Password Update Failed"
                    });
                }

                res.json({
                    message: "Password Updated Successfully"
                });

            }
        );

    });

});

let otpStore = {};

// ================= FORGOT PASSWORD SEND OTP =================
router.post("/forgot-password", (req, res) => {

    const { email } = req.body;

    if (!email) {

        return res.status(400).json({
            message: "Email is required"
        });

    }

    const sql = "SELECT * FROM users WHERE email=?";

    db.query(sql, [email], (err, result) => {

        if (err) {

            console.log(err);

            return res.status(500).json({
                message: "Database Error"
            });

        }

        if (result.length === 0) {

            return res.status(400).json({
                message: "Email not found"
            });

        }

        const otp = Math.floor(100000 + Math.random() * 900000);

        otpStore[email] = otp;

        if (!transporter) {

            return res.status(500).json({
                message: "Mail Server Not Configured"
            });

        }

        const mailOptions = {

            from: process.env.MAIL_USER,

            to: email,

            subject: "Smart Bharat Assistant Password Reset OTP",

            text:
`Your OTP for password reset is: ${otp}

This OTP is valid for 10 minutes.

Do not share this OTP with anyone.

- Smart Bharat Assistant`

        };

        transporter.sendMail(mailOptions, (mailErr, info) => {

            if (mailErr) {

                console.log("Mail Error:", mailErr);

                return res.status(500).json({
                    message: "OTP Send Failed"
                });

            }

            console.log("Mail Sent:", info.response);

            res.status(200).json({
                message: "OTP Sent Successfully"
            });

        });

    });

});

router.post("/verify-otp", (req, res) => {

    const { email, otp, newPassword } = req.body;

    if (!otpStore[email]) {

        return res.status(400).json({
            message: "OTP Expired"
        });

    }

    if (otpStore[email] != otp) {

        return res.status(400).json({
            message: "Invalid OTP"
        });

    }

    const sql =
        "UPDATE users SET password=? WHERE email=?";

    db.query(
        sql,
        [newPassword, email],
        (err) => {

            if (err) {

                return res.status(500).json({
                    message: "Database Error"
                });

            }

            delete otpStore[email];

            res.json({
                message: "Password Reset Successful"
            });

        }
    );

});

// ================= RESET PASSWORD =================
router.post("/reset-password", async (req, res) => {

    const { email, newPassword } = req.body;

    const hashedPassword =
        await bcrypt.hash(newPassword, 10);

    const sql =
        "UPDATE users SET password=? WHERE email=?";

    db.query(
        sql,
        [hashedPassword, email],
        (err) => {

            if (err) {
                return res.status(500).json({
                    message: "Password Reset Failed"
                });
            }

            delete otpStore[email];

            res.json({
                message: "Password Reset Successful"
            });

        }
    );

});

module.exports = router;