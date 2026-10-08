
const express = require("express");
const mysql = require("mysql2/promise");
const bcrypt = require("bcryptjs");
const session = require("express-session");
const cors = require("cors");
const path = require("path");
const nodemailer = require("nodemailer");


require("dotenv").config();
 
const app = express();

const PORT = process.env.PORT || 5000;


/* =====================================================
   MIDDLEWARE
===================================================== */

app.use(
    cors({
        origin: true,
        credentials: true
    })
);

app.use(express.json());

app.use(
    express.urlencoded({
        extended: true
    })
);


/* =====================================================
   SESSION
===================================================== */

app.use(
    session({
        secret:
            process.env.SESSION_SECRET ||
            "electromart_secret",

        resave: false,

        saveUninitialized: false,

        cookie: {
            maxAge:
                24 * 60 * 60 * 1000
        }
    })
);


/* =====================================================
   FRONTEND
===================================================== */

app.use(
    express.static(
        path.join(
            __dirname,
            "public"
        )
    )
);


/* =====================================================
   MYSQL
===================================================== */

const db = mysql.createPool({

        host:
            process.env.DB_HOST,

        user:
            process.env.DB_USER,

        password:
            process.env.DB_PASSWORD,

        database:
            process.env.DB_NAME,

        waitForConnections: true,

        connectionLimit: 10,

        queueLimit: 0
    });
  /* =====================================================
   EMAIL TRANSPORTER
===================================================== */
const mailTransporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,

    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

mailTransporter.verify((error, success) => {

    if (error) {

        console.error("EMAIL CONFIGURATION ERROR:");
        console.error(error.message);

    } else {

        console.log(
            "EMAIL SERVER READY - Gmail authentication successful!"
        );

    }

});
/* =====================================================
   TEST EMAIL
===================================================== */

app.get("/api/test-email", async (req, res) => {

    try {

        console.log("================================");
        console.log("TEST EMAIL STARTED");
        console.log("EMAIL USER:", process.env.EMAIL_USER);
        console.log(
            "EMAIL PASSWORD EXISTS:",
            !!process.env.EMAIL_PASSWORD
        );

        const mailResult =
            await mailTransporter.sendMail({

                from:
                    `"ElectroMart" <${process.env.EMAIL_USER}>`,

                to:
                    process.env.EMAIL_USER,

                subject:
                    "ElectroMart Test Email",

                text:
                    "This is a test email from ElectroMart.",

                html: `
                    <div style="
                        font-family:Arial,sans-serif;
                        padding:30px;
                        text-align:center;
                    ">

                        <h2>⚡ ElectroMart</h2>

                        <h3>Email Test Successful</h3>

                        <p>
                            This is a test email from
                            your ElectroMart application.
                        </p>

                    </div>
                `
            });

        console.log("TEST EMAIL SENT SUCCESSFULLY");
        console.log("Message ID:", mailResult.messageId);
        console.log("Response:", mailResult.response);
        console.log("================================");

        res.json({
            success: true,
            message: "Test email sent successfully.",
            messageId: mailResult.messageId
        });

    } catch (error) {

        console.error("================================");
        console.error("TEST EMAIL ERROR");
        console.error("Code:", error.code);
        console.error("Message:", error.message);
        console.error("================================");

        res.status(500).json({
            success: false,
            code: error.code,
            message: error.message
        });

    }

});
/* =====================================================
   DATABASE TEST
===================================================== */

async function testDatabase() {

    try {

        const connection =
            await db.getConnection();

        console.log(
            "MySQL Connected Successfully!"
        );

        console.log(
            "Database:",
            process.env.DB_NAME
        );

        connection.release();

    } catch (error) {

        console.error(
            "MySQL Connection Failed!"
        );

        console.error(
            error.message
        );
    }
}


/* =====================================================
   CUSTOMER REGISTER
===================================================== */

app.post(
    "/api/register",
    async (req, res) => {

        try {

            const {
                name,
                email,
                password
            } = req.body;

            if (
                !name ||
                !email ||
                !password
            ) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Please enter name, email and password."
                });
            }

            if (password.length < 6) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Password must be at least 6 characters."
                });
            }

            const [existing] =
                await db.execute(
                    "SELECT id FROM users WHERE email = ?",
                    [email]
                );

            if (existing.length > 0) {

                return res.status(409).json({
                    success: false,
                    message:
                        "Email is already registered."
                });
            }

            const hashedPassword =
                await bcrypt.hash(
                    password,
                    10
                );

            const [result] =
                await db.execute(
                    `INSERT INTO users
                    (name, email, password, role)
                    VALUES (?, ?, ?, 'customer')`,
                    [
                        name,
                        email,
                        hashedPassword
                    ]
                );

            res.status(201).json({

                success: true,

                message:
                    "Registration successful!",

                userId:
                    result.insertId
            });

        } catch (error) {

            console.error(
                "REGISTER ERROR:",
                error
            );

            res.status(500).json({
                success: false,
                message:
                    "Registration failed."
            });
        }
    }
);


/* =====================================================
   CUSTOMER LOGIN
===================================================== */

app.post(
    "/api/login",
    async (req, res) => {

        try {

            const {
                email,
                password
            } = req.body;

            const [users] =
                await db.execute(
                    "SELECT * FROM users WHERE email = ?",
                    [email]
                );

            if (users.length === 0) {

                return res.status(401).json({
                    success: false,
                    message:
                        "Invalid email or password."
                });
            }

            const user =
                users[0];

            const passwordMatch =
                await bcrypt.compare(
                    password,
                    user.password
                );

            if (!passwordMatch) {

                return res.status(401).json({
                    success: false,
                    message:
                        "Invalid email or password."
                });
            }

            req.session.userId =
                user.id;

            req.session.user = {
                id: user.id,
                name: user.name,
                email: user.email
            };

            res.json({

                success: true,

                message:
                    "Login successful!",

                user:
                    req.session.user
            });

        } catch (error) {

            console.error(
                "LOGIN ERROR:",
                error
            );

            res.status(500).json({
                success: false,
                message:
                    "Login failed."
            });
        }
    }
);


/* =====================================================
   CUSTOMER LOGOUT
===================================================== */

app.post(
    "/api/logout",
    (req, res) => {

        req.session.destroy(
            error => {

                if (error) {

                    return res.status(500).json({
                        success: false,
                        message:
                            "Logout failed."
                    });
                }

                res.json({
                    success: true,
                    message:
                        "Logout successful."
                });
            }
        );
    }
);
/* =====================================================
   FORGOT PASSWORD - SEND OTP
===================================================== */

app.post(
    "/api/forgot-password",
    async (req, res) => {

        try {

            const email =
                String(req.body.email || "")
                    .trim()
                    .toLowerCase();


            /* CHECK EMAIL */

            if (!email) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Please enter your email address."
                });

            }


            /* FIND USER */

            const [users] =
                await db.execute(
                    `SELECT
                        id,
                        name,
                        email
                     FROM users
                     WHERE LOWER(email) = ?`,
                    [email]
                );


            if (users.length === 0) {

                return res.status(404).json({

                    success: false,

                    message:
                        "No account found with this email address."
                });

            }


            const user = users[0];


            /* GENERATE 6 DIGIT OTP */

            const otp =
                Math.floor(
                    100000 +
                    Math.random() * 900000
                ).toString();


            /* OTP VALID FOR 10 MINUTES */

            const expiresAt =
                new Date(
                    Date.now() +
                    10 * 60 * 1000
                );


            console.log(
                "--------------------------------"
            );

            console.log(
                "PASSWORD RESET REQUEST"
            );

            console.log(
                "Email:",
                email
            );

            console.log(
                "OTP GENERATED:",
                otp
            );

            console.log(
                "OTP EXPIRES:",
                expiresAt
            );


            /* DELETE OLD OTP */

            await db.execute(
                `DELETE FROM password_reset_tokens
                 WHERE email = ?`,
                [email]
            );


            /* SEND OTP EMAIL FIRST */

            const mailResult =
                await mailTransporter.sendMail({

                    from:
                        `"ElectroMart" <${process.env.EMAIL_USER}>`,

                    to: email,

                    subject:
                        "ElectroMart - Password Reset OTP",

                    text:
                        `Hello ${user.name},

Your ElectroMart password reset OTP is:

${otp}

This OTP is valid for 10 minutes.

If you did not request a password reset, please ignore this email.

ElectroMart Electronic Shop`,

                    html: `
                        <div style="
                            font-family: Arial, sans-serif;
                            max-width: 600px;
                            margin: auto;
                            padding: 30px;
                            border: 1px solid #ddd;
                            border-radius: 12px;
                            background: #ffffff;
                        ">

                            <h2 style="
                                color:#2563eb;
                                text-align:center;
                            ">
                                ElectroMart
                            </h2>

                            <p>
                                Hello
                                <strong>
                                    ${user.name}
                                </strong>,
                            </p>

                            <p>
                                We received a request to reset
                                your ElectroMart password.
                            </p>

                            <p>
                                Your OTP is:
                            </p>

                            <div style="
                                font-size: 32px;
                                font-weight: bold;
                                letter-spacing: 8px;
                                color: #2563eb;
                                padding: 20px;
                                text-align: center;
                                background: #f3f6ff;
                                border-radius: 10px;
                            ">
                                ${otp}
                            </div>

                            <p>
                                This OTP will expire in
                                <strong>
                                    10 minutes
                                </strong>.
                            </p>

                            <p>
                                If you did not request a
                                password reset, you can ignore
                                this email.
                            </p>

                            <hr>

                            <p style="
                                color:#777;
                                text-align:center;
                            ">
                                ElectroMart Electronic Shop
                            </p>

                        </div>
                    `
                });


            console.log(
                "EMAIL SENT SUCCESSFULLY"
            );

            console.log(
                "Message ID:",
                mailResult.messageId
            );


            /* SAVE OTP AFTER EMAIL SUCCESS */

            await db.execute(
                `INSERT INTO password_reset_tokens
                (
                    user_id,
                    email,
                    otp,
                    expires_at,
                    used
                )
                VALUES (?, ?, ?, ?, 0)`,
                [
                    user.id,
                    email,
                    otp,
                    expiresAt
                ]
            );


            console.log(
                "OTP SAVED TO DATABASE"
            );

            console.log(
                "--------------------------------"
            );


            res.json({

                success: true,

                message:
                    "OTP has been sent to your email."
            });


        } catch (error) {

            console.error(
                "--------------------------------"
            );

            console.error(
                "FORGOT PASSWORD ERROR"
            );

            console.error(
                "Error Code:",
                error.code
            );

            console.error(
                "Error Message:",
                error.message
            );

            console.error(
                "Full Error:",
                error
         );

            console.error(
                "--------------------------------"
            );
res.status(500).json({

    success: false,

    message:
        error.message || "Unable to send password reset OTP.",

    errorCode:
        error.code || "UNKNOWN_ERROR"
});

        }

    }
);

/* =====================================================
   VERIFY PASSWORD RESET OTP
===================================================== */

app.post(
    "/api/verify-reset-otp",
    async (req, res) => {

        try {

            const email =
                String(req.body.email || "")
                    .trim()
                    .toLowerCase();

            const otp =
                String(req.body.otp || "")
                    .trim();

            if (!email || !otp) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Email and OTP are required."
                });

            }

            const [rows] =
                await db.execute(
                    `SELECT id
                     FROM password_reset_tokens
                     WHERE email = ?
                     AND otp = ?
                     AND used = 0
                     AND expires_at > NOW()
                     ORDER BY id DESC
                     LIMIT 1`,
                    [
                        email,
                        otp
                    ]
                );

            if (rows.length === 0) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid or expired OTP."
                });

            }

            res.json({

                success: true,

                message:
                    "OTP verified successfully."
            });

        } catch (error) {

            console.error(
                "VERIFY OTP ERROR:",
                error
            );

            res.status(500).json({

                success: false,

                message:
                    "Unable to verify OTP."
            });
        }
    }
);


/* =====================================================
   RESET PASSWORD
===================================================== */

app.post(
    "/api/reset-password",
    async (req, res) => {

        try {

            const email =
                String(req.body.email || "")
                    .trim()
                    .toLowerCase();

            const otp =
                String(req.body.otp || "")
                    .trim();

            const newPassword =
                String(
                    req.body.newPassword || ""
                );

            if (
                !email ||
                !otp ||
                !newPassword
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Please fill all fields."
                });

            }

            if (newPassword.length < 6) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Password must contain at least 6 characters."
                });

            }

            /* VERIFY OTP AGAIN */

            const [tokens] =
                await db.execute(
                    `SELECT id, user_id
                     FROM password_reset_tokens
                     WHERE email = ?
                     AND otp = ?
                     AND used = 0
                     AND expires_at > NOW()
                     ORDER BY id DESC
                     LIMIT 1`,
                    [
                        email,
                        otp
                    ]
                );

            if (tokens.length === 0) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid or expired OTP."
                });

            }

            const resetToken =
                tokens[0];

            /* HASH PASSWORD */

            const hashedPassword =
                await bcrypt.hash(
                    newPassword,
                    10
                );

            /* UPDATE PASSWORD */

            await db.execute(
                `UPDATE users
                 SET password = ?
                 WHERE id = ?`,
                [
                    hashedPassword,
                    resetToken.user_id
                ]
            );

            /* MARK OTP AS USED */

            await db.execute(
                `UPDATE password_reset_tokens
                 SET used = 1
                 WHERE id = ?`,
                [resetToken.id]
            );

            res.json({

                success: true,

                message:
                    "Password reset successfully."
            });

        } catch (error) {

            console.error(
                "RESET PASSWORD ERROR:",
                error
            );

            res.status(500).json({

                success: false,

                message:
                    "Unable to reset password."
            });
        }
    }
);

/* =====================================================
   CUSTOMER SESSION
===================================================== */

app.get( "/api/user", (req, res) => {

        if (!req.session.user) {

            return res.json({
                loggedIn: false
            });
        }

        res.json({
            loggedIn: true,
            user:
                req.session.user
        });
    }
);


/* =====================================================
   ADMIN LOGIN
===================================================== */

app.post(
    "/api/admin/login",
    async (req, res) => {

        try {

            const {
                email,
                password
            } = req.body;

            const [admins] =
                await db.execute(
                    `SELECT *
                     FROM users
                     WHERE email = ?
                     AND role = 'admin'`,
                    [email]
                );

            if (admins.length === 0) {

                return res.status(401).json({
                    success: false,
                    message:
                        "Invalid admin email or password."
                });
            }

            const admin =
                admins[0];

            const passwordMatch =
                await bcrypt.compare(
                    password,
                    admin.password
                );

            if (!passwordMatch) {

                return res.status(401).json({
                    success: false,
                    message:
                        "Invalid admin email or password."
                });
            }

            req.session.adminId =
                admin.id;

            req.session.admin = {
                id: admin.id,
                name: admin.name,
                email: admin.email,
                role: "admin"
            };

            res.json({

                success: true,

                message:
                    "Admin login successful!",

                admin:
                    req.session.admin
            });

        } catch (error) {

            console.error(
                "ADMIN LOGIN ERROR:",
                error
            );

            res.status(500).json({
                success: false,
                message:
                    "Admin login failed."
            });
        }
    }
);


/* =====================================================
   AUTH MIDDLEWARE
===================================================== */

function requireLogin(
    req,
    res,
    next
) {

    if (!req.session.userId) {

        return res.status(401).json({
            success: false,
            message:
                "Please login first."
        });
    }

    next();
}


function requireAdmin(
    req,
    res,
    next
) {

    if (
        !req.session.adminId ||
        !req.session.admin
    ) {

        return res.status(401).json({
            success: false,
            message:
                "Admin login required."
        });
    }

    next();
}


/* =====================================================
   PRODUCTS - CUSTOMER
   WITH RATINGS
===================================================== */

app.get(
    "/api/products",
    async (req, res) => {

        try {

            const [products] =
                await db.execute(`
                    SELECT
                        p.id,
                        p.name,
                        p.category,
                        p.price,
                        p.description,
                        p.icon,
                        p.stock,

                        COALESCE(
                            ROUND(AVG(pr.rating), 1),
                            0
                        ) AS average_rating,

                        COUNT(pr.id)
                            AS review_count

                    FROM products p

                    LEFT JOIN product_reviews pr
                        ON p.id = pr.product_id

                    GROUP BY
                        p.id,
                        p.name,
                        p.category,
                        p.price,
                        p.description,
                        p.icon,
                        p.stock

                    ORDER BY p.id ASC
                `);

            res.json({
                success: true,
                products
            });

        } catch (error) {

            console.error(
                "PRODUCT ERROR:",
                error
            );

            res.status(500).json({
                success: false,
                message:
                    "Unable to load products."
            });
        }
    }
);

/* =====================================================
   GET PRODUCT REVIEWS
===================================================== */

app.get(
    "/api/products/:id/reviews",
    async (req, res) => {

        try {

            const productId =
                Number(req.params.id);

            if (!productId) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Invalid product ID."
                });
            }

            const [reviews] =
                await db.execute(`
                    SELECT
                        pr.id,
                        pr.product_id,
                        pr.user_id,
                        pr.rating,
                        pr.review,
                        pr.created_at,
                        u.name AS customer_name

                    FROM product_reviews pr

                    INNER JOIN users u
                        ON pr.user_id = u.id

                    WHERE pr.product_id = ?

                    ORDER BY
                        pr.created_at DESC
                `, [productId]);

            res.json({
                success: true,
                reviews
            });

        } catch (error) {

            console.error(
                "GET REVIEWS ERROR:",
                error
            );

            res.status(500).json({
                success: false,
                message:
                    "Unable to load reviews."
            });
        }
    }
);

/* =====================================================
   ADD PRODUCT RATING / REVIEW
===================================================== */

app.post(
    "/api/products/:id/reviews",
    requireLogin,
    async (req, res) => {

        try {

            const productId =
                Number(req.params.id);

            const userId =
                req.session.userId;

            const rating =
                Number(req.body.rating);

            const review =
                String(
                    req.body.review || ""
                ).trim();


            if (!productId) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Invalid product ID."
                });
            }


            if (
                !Number.isInteger(rating) ||
                rating < 1 ||
                rating > 5
            ) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Rating must be between 1 and 5."
                });
            }


            if (review.length > 1000) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Review cannot exceed 1000 characters."
                });
            }


            const [products] =
                await db.execute(
                    `SELECT id
                     FROM products
                     WHERE id = ?`,
                    [productId]
                );


            if (products.length === 0) {

                return res.status(404).json({
                    success: false,
                    message:
                        "Product not found."
                });
            }
        const [existingReview] =
    await db.execute(
        `SELECT id
         FROM product_reviews
         WHERE product_id = ?
         AND user_id = ?`,
        [
            productId,
            userId
        ]
    );

if (existingReview.length > 0) {

    // UPDATE EXISTING REVIEW
    await db.execute(
        `UPDATE product_reviews
         SET rating = ?,
             review = ?
         WHERE id = ?`,
        [
            rating,
            review || null,
            existingReview[0].id
        ]
    );

    return res.status(200).json({
        success: true,
        message: "Review updated successfully."
    });
}
await db.execute(
    `INSERT INTO product_reviews
    (
        product_id,
        user_id,
        rating,
        review
    )
    VALUES (?, ?, ?, ?)`,
    [
        productId,
        userId,
        rating,
        review || null
    ]
);

res.status(201).json({
    success: true,
    message:
        "Rating submitted successfully."
});

        } catch (error) {

            console.error(
                "ADD REVIEW ERROR:",
                error
            );


            if (
                error.code ===
                "ER_DUP_ENTRY"
            ) {

                return res.status(409).json({
                    success: false,
                    message:
                        "You have already rated this product."
                });
            }


            res.status(500).json({
                success: false,
                message:
                    "Unable to submit rating."
            });
        }
    }
);

/* =====================================================
   CART - GET
===================================================== */

app.get(
    "/api/cart",
    requireLogin,
    async (req, res) => {

        try {

            const userId =
                Number(req.session.userId);


            const [items] =
                await db.execute(
                    `
                    SELECT
                        c.id,
                        c.product_id,
                        c.quantity,

                        p.name,
                        p.price,
                        p.description,
                        p.icon,
                        p.stock

                    FROM cart c

                    INNER JOIN products p
                        ON c.product_id = p.id

                    WHERE c.user_id = ?

                    ORDER BY c.id DESC
                    `,
                    [userId]
                );


            let total = 0;


            items.forEach(item => {

                total +=
                    Number(item.price) *
                    Number(item.quantity);

            });


            res.json({
                success: true,
                items: items,
                total: total
            });


        } catch (error) {

            console.error(
                "CART GET ERROR:",
                error
            );


            res.status(500).json({
                success: false,
                message:
                    error.sqlMessage ||
                    error.message ||
                    "Unable to load cart."
            });

        }

    }
);
/* =====================================================
   CART - ADD
===================================================== */
/* =====================================================
   CART - ADD
===================================================== */

app.post(
    "/api/cart",
    requireLogin,
    async (req, res) => {

        try {

            const userId =
                Number(req.session.userId);

            const productId =
                Number(req.body.productId);

            const quantity =
                Number(req.body.quantity) || 1;


            console.log("ADD CART REQUEST");
            console.log("User ID:", userId);
            console.log("Product ID:", productId);
            console.log("Quantity:", quantity);


            if (!userId) {

                return res.status(401).json({
                    success: false,
                    message: "Please login first."
                });

            }


            if (!productId) {

                return res.status(400).json({
                    success: false,
                    message: "Invalid product ID."
                });

            }


            /* CHECK PRODUCT */

            const [products] =
                await db.execute(
                    `
                    SELECT
                        id,
                        name,
                        price,
                        stock
                    FROM products
                    WHERE id = ?
                    `,
                    [productId]
                );


            if (products.length === 0) {

                return res.status(404).json({
                    success: false,
                    message: "Product not found."
                });

            }


            const product =
                products[0];


            if (
                Number(product.stock) <= 0
            ) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Product is out of stock."
                });

            }


            if (
                quantity >
                Number(product.stock)
            ) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Not enough stock."
                });

            }


            /* CHECK EXISTING CART ITEM */

            const [existing] =
                await db.execute(
                    `
                    SELECT
                        id,
                        quantity
                    FROM cart
                    WHERE user_id = ?
                    AND product_id = ?
                    `,
                    [
                        userId,
                        productId
                    ]
                );


            if (existing.length > 0) {

                const newQuantity =
                    Number(existing[0].quantity) +
                    quantity;


                if (
                    newQuantity >
                    Number(product.stock)
                ) {

                    return res.status(400).json({
                        success: false,
                        message:
                            "Not enough stock."
                    });

                }


                await db.execute(
                    `
                    UPDATE cart
                    SET quantity = ?
                    WHERE user_id = ?
                    AND product_id = ?
                    `,
                    [
                        newQuantity,
                        userId,
                        productId
                    ]
                );

            } else {

                await db.execute(
                    `
                    INSERT INTO cart
                    (
                        user_id,
                        product_id,
                        quantity
                    )
                    VALUES (?, ?, ?)
                    `,
                    [
                        userId,
                        productId,
                        quantity
                    ]
                );

            }


            console.log(
                "PRODUCT ADDED TO CART"
            );


            res.json({
                success: true,
                message:
                    "Product added to cart successfully."
            });


        } catch (error) {

            console.error(
                "================================"
            );

            console.error(
                "ADD CART MYSQL ERROR"
            );

            console.error(
                "Code:",
                error.code
            );

            console.error(
                "Message:",
                error.message
            );

            console.error(
                "SQL Message:",
                error.sqlMessage
            );

            console.error(
                "================================"
            );


            res.status(500).json({
                success: false,
                message:
                    error.sqlMessage ||
                    error.message ||
                    "Unable to add product to cart.",
                errorCode:
                    error.code || "UNKNOWN"
            });

        }

    }
);



/* =====================================================
   CART - UPDATE
===================================================== */

app.put(
    "/api/cart/:productId",
    requireLogin,
    async (req, res) => {

        try {

            const userId =
                req.session.userId;

            const productId =
                Number(req.params.productId);

            const quantity =
                Number(req.body.quantity);

            if (quantity <= 0) {

                await db.execute(
                    `DELETE FROM cart
                     WHERE user_id = ?
                     AND product_id = ?`,
                    [
                        userId,
                        productId
                    ]
                );

                return res.json({
                    success: true,
                    message:
                        "Product removed."
                });
            }

            const [products] =
                await db.execute(
                    "SELECT stock FROM products WHERE id = ?",
                    [productId]
                );

            if (products.length === 0) {

                return res.status(404).json({
                    success: false,
                    message:
                        "Product not found."
                });
            }

            if (
                quantity >
                products[0].stock
            ) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Not enough stock."
                });
            }

            await db.execute(
                `UPDATE cart
                 SET quantity = ?
                 WHERE user_id = ?
                 AND product_id = ?`,
                [
                    quantity,
                    userId,
                    productId
                ]
            );

            res.json({
                success: true,
                message:
                    "Cart updated."
            });

        } catch (error) {

            console.error(
                "UPDATE CART ERROR:",
                error
            );

            res.status(500).json({
                success: false,
                message:
                    "Unable to update cart."
            });
        }
    }
);


/* =====================================================
   CART - DELETE
===================================================== */

app.delete(
    "/api/cart/:productId",
    requireLogin,
    async (req, res) => {

        try {

            const userId =
                req.session.userId;

            const productId =
                Number(req.params.productId);

            await db.execute(
                `DELETE FROM cart
                 WHERE user_id = ?
                 AND product_id = ?`,
                [
                    userId,
                    productId
                ]
            );

            res.json({
                success: true,
                message:
                    "Product removed from cart."
            });

        } catch (error) {

            console.error(
                "DELETE CART ERROR:",
                error
            );

            res.status(500).json({
                success: false,
                message:
                    "Unable to remove product."
            });
        }
    }
);


/* =====================================================
   PLACE ORDER
   PAYMENT REMOVED
===================================================== */

app.post(
    "/api/orders",
    requireLogin,
    async (req, res) => {

        const connection =
            await db.getConnection();

        try {

            const userId =
                req.session.userId;

            const address =
                String(
                    req.body.address || ""
                ).trim();

            if (!address) {

                connection.release();

                return res.status(400).json({
                    success: false,
                    message:
                        "Delivery address is required."
                });
            }

            await connection.beginTransaction();

            const [items] =
                await connection.execute(
                    `SELECT
                        cart.product_id,
                        cart.quantity,
                        products.name,
                        products.price,
                        products.stock
                     FROM cart
                     INNER JOIN products
                     ON cart.product_id =
                        products.id
                     WHERE cart.user_id = ?
                     FOR UPDATE`,
                    [userId]
                );

            if (items.length === 0) {

                await connection.rollback();

                connection.release();

                return res.status(400).json({
                    success: false,
                    message:
                        "Your cart is empty."
                });
            }

            let total = 0;

            for (const item of items) {

                if (
                    item.quantity >
                    item.stock
                ) {

                    await connection.rollback();

                    connection.release();

                    return res.status(400).json({
                        success: false,
                        message:
                            `${item.name} does not have enough stock.`
                    });
                }

                total +=
                    Number(item.price) *
                    Number(item.quantity);
            }


            /* IMPORTANT:
               payment_method REMOVED
            */

            const [orderResult] =
                await connection.execute(
                    `INSERT INTO orders
                    (
                        user_id,
                        total,
                        address,
                        status
                    )
                    VALUES (?, ?, ?, ?)`,
                    [
                        userId,
                        total,
                        address,
                        "Order Placed"
                    ]
                );

            const orderId =
                orderResult.insertId;


            for (const item of items) {

                await connection.execute(
                    `INSERT INTO order_items
                    (
                        order_id,
                        product_id,
                        quantity,
                        price
                    )
                    VALUES (?, ?, ?, ?)`,
                    [
                        orderId,
                        item.product_id,
                        item.quantity,
                        item.price
                    ]
                );

                await connection.execute(
                    `UPDATE products
                     SET stock = stock - ?
                     WHERE id = ?`,
                    [
                        item.quantity,
                        item.product_id
                    ]
                );
            }


            await connection.execute(
                `DELETE FROM cart
                 WHERE user_id = ?`,
                [userId]
            );
await connection.commit();

connection.release();
/* =====================================================
   SEND ORDER CONFIRMATION EMAIL
===================================================== */

try {

    /* GET CUSTOMER DETAILS FROM DATABASE */

    const [customerRows] = await db.execute(
        `SELECT name, email
         FROM users
         WHERE id = ?`,
        [userId]
    );

    if (customerRows.length === 0) {

        console.log(
            "CUSTOMER NOT FOUND - EMAIL NOT SENT"
        );

    } else {
      
    const customerName =
    String(
        req.body.name ||
        customerRows[0].name ||
        "Customer"
    ).trim();

const customerEmail =
    String(
        req.body.email ||
        ""
    ).trim();
       

        console.log("--------------------------------");
        console.log("ORDER EMAIL");
        console.log("Order ID:", orderId);
        console.log("Customer:", customerName);
        console.log("Email:", customerEmail);
        console.log("--------------------------------");

        if (!customerEmail) {

            console.log(
                "CUSTOMER EMAIL IS EMPTY"
            );

        } else {

            /* CREATE PRODUCT TABLE */

            const productsHTML =
                items.map((item, index) => {

                    const itemTotal =
                        Number(item.price) *
                        Number(item.quantity);

                    return `
                        <tr>

                            <td style="
                                padding:12px;
                                border-bottom:1px solid #eee;
                            ">
                                ${index + 1}
                            </td>

                            <td style="
                                padding:12px;
                                border-bottom:1px solid #eee;
                            ">
                                ${item.name}
                            </td>

                            <td style="
                                padding:12px;
                                text-align:center;
                                border-bottom:1px solid #eee;
                            ">
                                ${item.quantity}
                            </td>

                            <td style="
                                padding:12px;
                                text-align:right;
                                border-bottom:1px solid #eee;
                            ">
                                ₹${itemTotal.toLocaleString("en-IN")}
                            </td>

                        </tr>
                    `;

                }).join("");


            /* SEND EMAIL */
console.log("================================");
console.log("TEST ORDER RECEIPT");
console.log("SENDING TO:", process.env.EMAIL_USER);
console.log("ORDER ID:", orderId);
console.log("TOTAL:", total);
console.log("================================");
            const mailResult =
                await mailTransporter.sendMail({
               
                    from:
                        `"ElectroMart" <${process.env.EMAIL_USER}>`,

                    to:
                          process.env.EMAIL_USER,

                    subject:
                        `Order #${orderId} Confirmed - ElectroMart`,

                    text:
                        `Hello ${customerName},

Your ElectroMart order #${orderId} has been successfully placed.

Order Total:
₹${Number(total).toLocaleString("en-IN")}

Thank you for shopping with ElectroMart.`,

 html: `

                        <div style="
                            max-width:650px;
                            margin:auto;
                            font-family:Arial,sans-serif;
                            background:#ffffff;
                            border:1px solid #ddd;
                            border-radius:12px;
                            overflow:hidden;
                        ">

                            <div style="
                                padding:25px;
                                text-align:center;
                                background:#f8fafc;
                            ">

                                <h1>
                                    ⚡ ElectroMart
                                </h1>

                                <p>
                                    Electronic Shop
                                </p>

                            </div>


                            <div style="
                                padding:30px;
                            ">

                                <h2 style="
                                    color:#16a34a;
                                ">
                                    ✅ Order Confirmed
                                </h2>

                                <p>
                                    Hello
                                    <strong>
                                        ${customerName}
                                    </strong>,
                                </p>

                                <p>
                                    Thank you for shopping
                                    with ElectroMart.
                                </p>


                                <div style="
                                    background:#f8fafc;
                                    padding:20px;
                                    border-radius:10px;
                                ">

                                    <p>
                                        <strong>
                                            Order ID:
                                        </strong>
                                        #${orderId}
                                    </p>

                                    <p>
                                        <strong>
                                            Status:
                                        </strong>
                                        Order Placed
                                    </p>

                                    <p>
                                        <strong>
                                            Total:
                                        </strong>
                                        ₹${Number(total)
                                            .toLocaleString("en-IN")}
                                    </p>

                                </div>


                                <h3>
                                    Order Items
                                </h3>


                                <table
                                    width="100%"
                                    cellpadding="0"
                                    cellspacing="0"
                                    style="
                                        border-collapse:collapse;
                                    "
                                >

                                    <thead>

                                        <tr>

                                            <th
                                                style="
                                                    padding:12px;
                                                    text-align:left;
                                                "
                                            >
                                                #
                                            </th>

                                            <th
                                                style="
                                                    padding:12px;
                                                    text-align:left;
                                                "
                                            >
                                                Product
                                            </th>

                                            <th
                                                style="
                                                    padding:12px;
                                                    text-align:center;
                                                "
                                            >
                                                Qty
                                            </th>

                                            <th
                                                style="
                                                    padding:12px;
                                                    text-align:right;
                                                "
                                            >
                                                Amount
                                            </th>

                                        </tr>

                                    </thead>


                                    <tbody>

                                        ${productsHTML}

                                    </tbody>

                                </table>


                                <div style="
                                    margin-top:30px;
                                    padding:20px;
                                    text-align:center;
                                    background:#f8fafc;
                                ">

                                    <strong>
                                        Total Amount:
                                    </strong>

                                    <span>
                                        ₹${Number(total)
                                            .toLocaleString("en-IN")}
                                    </span>

                                </div>

                            </div>


                            <div style="
                                padding:20px;
                                text-align:center;
                                background:#f8fafc;
                                color:#64748b;
                                font-size:13px;
                            ">

                                ElectroMart Electronic Shop

                            </div>

                        </div>

                    `
                });


            console.log(
                "================================"
            );

            console.log(
                "ORDER EMAIL SENT SUCCESSFULLY"
            );

            console.log(
                "To:",
                customerEmail
            );

            console.log(
                "Message ID:",
                mailResult.messageId
            );

            console.log(
                "================================"
            );

        }

    }

} catch (emailError) {

    console.error(
        "ORDER EMAIL ERROR:"
    );

    console.error(
        "Code:",
        emailError.code
    );

    console.error(
        "Message:",
        emailError.message
    );

}


/* =====================================================
   SEND RESPONSE
===================================================== */

return res.status(201).json({

    success: true,

    message:
        "Order placed successfully!",

    orderId,

    total

});


        } catch (error) {

            await connection.rollback();

            connection.release();

            console.error(
                "ORDER ERROR:",
                error
            );

         res.status(500).json({
    success: false,
    message: error.sqlMessage || error.message || "Unable to place order."
});
        }
    }
);


/* =====================================================
   CUSTOMER ORDERS
===================================================== */
/* =====================================================
   CUSTOMER ORDERS
===================================================== */

app.get(
    "/api/orders",
    requireLogin,
    async (req, res) => {

        try {

            const userId =
                Number(req.session.userId);


            const [orders] =
                await db.execute(
                    `
                    SELECT
                        id,
                        total,
                        address,
                        status,
                        created_at
                    FROM orders
                    WHERE user_id = ?
                    ORDER BY created_at DESC
                    `,
                    [userId]
                );


            for (const order of orders) {

                const [items] =
                    await db.execute(
                        `
                        SELECT
                            oi.id,
                            oi.product_id,
                            oi.quantity,
                            oi.price,

                            p.name,
                            p.icon

                        FROM order_items oi

                        LEFT JOIN products p
                            ON oi.product_id = p.id

                        WHERE oi.order_id = ?
                        `,
                        [order.id]
                    );


                order.items = items;

            }


            res.json({
                success: true,
                orders: orders
            });


        } catch (error) {

            console.error(
                "================================"
            );

            console.error(
                "ORDERS MYSQL ERROR"
            );

            console.error(
                "Code:",
                error.code
            );

            console.error(
                "Message:",
                error.message
            );

            console.error(
                "SQL Message:",
                error.sqlMessage
            );

            console.error(
                "================================"
            );


            res.status(500).json({
                success: false,
                message:
                    error.sqlMessage ||
                    error.message ||
                    "Unable to load orders."
            });

        }

    }
);
/* =====================================================
   ADMIN GET PRODUCTS
===================================================== */

app.get(
    "/api/admin/products",
    requireAdmin,
    async (req, res) => {

        try {

            const [products] =
                await db.execute(
                    `SELECT
                        id,
                        name,
                        category,
                        price,
                        description,
                        icon,
                        stock,
                        created_at
                     FROM products
                     ORDER BY id DESC`
                );

            res.json({
                success: true,
                products
            });

        } catch (error) {

            console.error(
                "ADMIN PRODUCTS ERROR:",
                error
            );

            res.status(500).json({
                success: false,
                message:
                    "Unable to load products."
            });
        }
    }
);


/* =====================================================
   ADMIN ADD PRODUCT
===================================================== */

app.post(
    "/api/admin/products",
    requireAdmin,
    async (req, res) => {

        try {

            const {
                name,
                category,
                price,
                description,
                icon,
                stock
            } = req.body;

            if (
                !name ||
                !category ||
                price === undefined
            ) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Name, category and price are required."
                });
            }

            if (Number(price) < 0) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Price cannot be negative."
                });
            }

            if (Number(stock || 0) < 0) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Stock cannot be negative."
                });
            }

            const [result] =
                await db.execute(
                    `INSERT INTO products
                    (
                        name,
                        category,
                        price,
                        description,
                        icon,
                        stock
                    )
                    VALUES (?, ?, ?, ?, ?, ?)`,
                    [
                        name,
                        category,
                        Number(price),
                        description || "",
                        icon || "📦",
                        Number(stock) || 0
                    ]
                );

            res.status(201).json({

                success: true,

                message:
                    "Product added successfully!",

                productId:
                    result.insertId
            });

        } catch (error) {

            console.error(
                "ADD PRODUCT ERROR:",
                error
            );

            res.status(500).json({
                success: false,
                message:
                    "Unable to add product."
            });
        }
    }
);


/* =====================================================
   ADMIN UPDATE PRODUCT
===================================================== */

app.put(
    "/api/admin/products/:id",
    requireAdmin,
    async (req, res) => {

        try {

            const productId =
                Number(req.params.id);

            const {
                name,
                category,
                price,
                description,
                icon,
                stock
            } = req.body;

            if (
                !name ||
                !category ||
                price === undefined
            ) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Name, category and price are required."
                });
            }

            const [result] =
                await db.execute(
                    `UPDATE products
                     SET
                        name = ?,
                        category = ?,
                        price = ?,
                        description = ?,
                        icon = ?,
                        stock = ?
                     WHERE id = ?`,
                    [
                        name,
                        category,
                        Number(price),
                        description || "",
                        icon || "📦",
                        Number(stock) || 0,
                        productId
                    ]
                );

            if (result.affectedRows === 0) {

                return res.status(404).json({
                    success: false,
                    message:
                        "Product not found."
                });
            }

            res.json({
                success: true,
                message:
                    "Product updated successfully!"
            });

        } catch (error) {

            console.error(
                "UPDATE PRODUCT ERROR:",
                error
            );

            res.status(500).json({
                success: false,
                message:
                    "Unable to update product."
            });
        }
    }
);


/* =====================================================
   ADMIN DELETE PRODUCT
===================================================== */

app.delete(
    "/api/admin/products/:id",
    requireAdmin,
    async (req, res) => {

        try {

            const productId =
                Number(req.params.id);

            const [cartItems] =
                await db.execute(
                    `SELECT id
                     FROM cart
                     WHERE product_id = ?
                     LIMIT 1`,
                    [productId]
                );

            if (cartItems.length > 0) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Product is currently in a cart."
                });
            }

            const [orderItems] =
                await db.execute(
                    `SELECT id
                     FROM order_items
                     WHERE product_id = ?
                     LIMIT 1`,
                    [productId]
                );

            if (orderItems.length > 0) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Product is already part of an order."
                });
            }

            const [result] =
                await db.execute(
                    `DELETE FROM products
                     WHERE id = ?`,
                    [productId]
                );

            if (result.affectedRows === 0) {

                return res.status(404).json({
                    success: false,
                    message:
                        "Product not found."
                });
            }

            res.json({
                success: true,
                message:
                    "Product deleted successfully!"
            });

        } catch (error) {

            console.error(
                "DELETE PRODUCT ERROR:",
                error
            );

            res.status(500).json({
                success: false,
                message:
                    "Unable to delete product."
            });
        }
    }
);


/* =====================================================
   ADMIN DASHBOARD
===================================================== */

app.get(
    "/api/admin/dashboard",
    requireAdmin,
    async (req, res) => {

        try {

            const [[users]] =
                await db.execute(
                    `SELECT COUNT(*) AS totalUsers
                     FROM users
                     WHERE role = 'customer'`
                );

            const [[products]] =
                await db.execute(
                    `SELECT COUNT(*) AS totalProducts
                     FROM products`
                );

            const [[orders]] =
                await db.execute(
                    `SELECT COUNT(*) AS totalOrders
                     FROM orders`
                );

            const [[sales]] =
                await db.execute(
                    `SELECT
                        COALESCE(
                            SUM(total),
                            0
                        ) AS totalSales
                     FROM orders
                     WHERE status != 'Cancelled'`
                );

            res.json({

                success: true,

                stats: {

                    totalUsers:
                        users.totalUsers,

                    totalProducts:
                        products.totalProducts,

                    totalOrders:
                        orders.totalOrders,

                    totalSales:
                        sales.totalSales
                }
            });

        } catch (error) {

            console.error(
                "DASHBOARD ERROR:",
                error
            );

            res.status(500).json({
                success: false,
                message:
                    "Unable to load dashboard."
            });
        }
    }
);


/* =====================================================
   ADMIN CUSTOMERS
===================================================== */

app.get(
    "/api/admin/users",
    requireAdmin,
    async (req, res) => {

        try {

            const [users] =
                await db.execute(
                    `SELECT
                        id,
                        name,
                        email,
                        created_at
                     FROM users
                     WHERE role = 'customer'
                     ORDER BY id DESC`
                );

            res.json({
                success: true,
                users
            });

        } catch (error) {

            console.error(
                "ADMIN USERS ERROR:",
                error
            );

            res.status(500).json({
                success: false,
                message:
                    "Unable to load users."
            });
        }
    }
);
/* =====================================================
   ADMIN SALES REPORT
===================================================== */

app.get(
    "/api/admin/sales",
    requireAdmin,
    async (req, res) => {

        try {

            const year =
                Number(
                    req.query.year
                ) ||
                new Date().getFullYear();


            const [sales] =
                await db.execute(
                    `
                    SELECT
                        MONTH(created_at)
                            AS month,

                        COALESCE(
                            SUM(total),
                            0
                        ) AS total

                    FROM orders

                    WHERE
                        YEAR(created_at) = ?

                    AND status != 'Cancelled'

                    GROUP BY
                        MONTH(created_at)

                    ORDER BY
                        MONTH(created_at)
                    `,
                    [year]
                );


            res.json({

                success: true,

                year: year,

                sales: sales

            });


        } catch (error) {

            console.error(
                "ADMIN SALES ERROR:",
                error
            );


            res.status(500).json({

                success: false,

                message:
                    "Unable to load sales."

            });

        }

    }
);

/* =====================================================
   ADMIN ORDERS
===================================================== */

app.get(
    "/api/admin/orders",
    requireAdmin,
    async (req, res) => {

        try {

            const [orders] =
                await db.execute(
                    `SELECT
                        orders.id,
                        orders.total,
                        orders.address,
                        orders.status,
                        orders.created_at,
                        users.name AS customer_name,
                        users.email AS customer_email
                     FROM orders
                     INNER JOIN users
                     ON orders.user_id =
                        users.id
                     ORDER BY
                        orders.created_at DESC`
                );

            for (const order of orders) {

                const [items] =
                    await db.execute(
                        `SELECT
                            order_items.product_id,
                            order_items.quantity,
                            order_items.price,
                            products.name,
                            products.icon
                         FROM order_items
                         INNER JOIN products
                         ON order_items.product_id =
                            products.id
                         WHERE order_items.order_id = ?`,
                        [order.id]
                    );

                order.items = items;
            }

            res.json({
                success: true,
                orders
            });

        } catch (error) {

            console.error(
                "ADMIN ORDERS ERROR:",
                error
            );

            res.status(500).json({
                success: false,
                message:
                    "Unable to load orders."
            });
        }
    }
);


/* =====================================================
   ADMIN UPDATE ORDER STATUS
===================================================== */

app.put(
    "/api/admin/orders/:id/status",
    requireAdmin,
    async (req, res) => {

        try {

            const orderId =
                Number(req.params.id);

            const { status } =
                req.body;

            const allowedStatuses = [

                "Order Placed",

                "Processing",

                "Shipped",

                "Out for Delivery",

                "Delivered",

                "Cancelled"
            ];

            if (
                !allowedStatuses.includes(status)
            ) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Invalid order status."
                });
            }

            const [result] =
                await db.execute(
                    `UPDATE orders
                     SET status = ?
                     WHERE id = ?`,
                    [
                        status,
                        orderId
                    ]
                );

            if (result.affectedRows === 0) {

                return res.status(404).json({
                    success: false,
                    message:
                        "Order not found."
                });
            }

            res.json({

                success: true,

                message:
                    "Order status updated successfully!"
            });

        } catch (error) {

            console.error(
                "STATUS ERROR:",
                error
            );

            res.status(500).json({
                success: false,
                message:
                    "Unable to update order status."
            });
        }
    }
);


/* =====================================================
   ADMIN SESSION
===================================================== */

app.get(
    "/api/admin/user",
    (req, res) => {

        if (
            !req.session.adminId ||
            !req.session.admin
        ) {

            return res.json({
                loggedIn: false
            });
        }

        res.json({

            loggedIn: true,

            admin:
                req.session.admin
        });
    }
);


/* =====================================================
   ADMIN LOGOUT
===================================================== */

app.post(
    "/api/admin/logout",
    (req, res) => {

        req.session.adminId = null;
        req.session.admin = null;

        res.json({
            success: true,
            message:
                "Admin logged out successfully."
        });
    }
);


/* =====================================================
   ROUTES
===================================================== */

app.get(
    "/",
    (req, res) => {

        res.sendFile(
            path.join(
                __dirname,
                "public",
                "index.html"
            )
        );
    }
);

app.get(
    "/admin.html",
    (req, res) => {

        res.sendFile(
            path.join(
                __dirname,
                "public",
                "admin.html"
            )
        );
    }
);
app.get(
    "/admin-support.html",
    (req, res) => {

        res.sendFile(
            path.join(
                __dirname,
                "public",
                "admin-support.html"
            )
        );

    }
);


/* ==========================================
   CUSTOMER SUPPORT API
========================================== */


/* ==========================================
   CREATE SUPPORT REQUEST
========================================== */

app.post(
    "/api/support",
    requireLogin,
    async (req, res) => {

        try {

            const {
                orderId,
                issueType,
                subject,
                message
            } = req.body;


            const allowedIssues = [

                "Delivery Issue",

                "Payment Issue",

                "Return Product",

                "Refund Request",

                "Complaint"

            ];


            /* CHECK ISSUE */

            if (
                !issueType ||
                !allowedIssues.includes(
                    issueType
                )
            ) {

                return res.status(400).json({

                    message:
                        "Invalid issue type."

                });

            }


            /* CHECK SUBJECT
   Subject is required ONLY for Complaint
*/

if (
    issueType === "Complaint" &&
    (!subject || subject.trim().length < 3)
) {

    return res.status(400).json({

        message:
            "Please enter a valid subject."

    });

}


            /* CHECK MESSAGE */

            if (
                !message ||
                message.trim().length < 5
            ) {

                return res.status(400).json({

                    message:
                        "Please describe your problem."

                });

            }


            /* CHECK ORDER */

            if (orderId) {

                const [orders] =
                    await db.query(

                        `SELECT id
                         FROM orders
                         WHERE id = ?
                         AND user_id = ?`,

                        [
                            orderId,
                            req.session.user.id
                        ]

                    );


                if (
                    orders.length === 0
                ) {

                    return res.status(400).json({

                        message:
                            "Invalid order selected."

                    });

                }

            }


            /* INSERT SUPPORT REQUEST */

            const [result] =
                await db.query(

                    `INSERT INTO support_requests
                    (
                        user_id,
                        order_id,
                        issue_type,
                        subject,
                        message,
                        status
                    )
                    VALUES
                    (?, ?, ?, ?, ?, 'Open')`,

                    [

                        req.session.user.id,

                        orderId || null,

                        issueType,

                        subject.trim(),

                        message.trim()

                    ]

                );


            res.status(201).json({

                success: true,

                requestId:
                    result.insertId,

                message:
                    "Support request submitted successfully."

            });


        } catch (error) {

            console.error(
                "CREATE SUPPORT ERROR:",
                error
            );


            res.status(500).json({

                message:
                    "Server error while creating support request."

            });

        }

    }
);


/* ==========================================
   GET CUSTOMER SUPPORT REQUESTS
========================================== */

app.get(
    "/api/support",
    requireLogin,
    async (req, res) => {

        try {

            const [requests] =
                await db.query(

                    `SELECT
                        id,
                        order_id,
                        issue_type,
                        subject,
                        message,
                        status,
                        admin_reply,
                        created_at,
                        updated_at

                     FROM support_requests

                     WHERE user_id = ?

                     ORDER BY created_at DESC`,

                    [
                        req.session.user.id
                    ]

                );


            res.json(requests);


        } catch (error) {

            console.error(
                "GET SUPPORT ERROR:",
                error
            );


            res.status(500).json({

                message:
                    "Server error while loading support requests."

            });

        }

    }
);


/* ==========================================
   ADMIN GET ALL SUPPORT REQUESTS
========================================== */

app.get(
    "/api/admin/support",
    requireAdmin,
    async (req, res) => {

        try {

            const [requests] =
                await db.query(

                    `SELECT
                        s.id,
                        s.user_id,
                        s.order_id,
                        s.issue_type,
                        s.subject,
                        s.message,
                        s.status,
                        s.admin_reply,
                        s.created_at,
                        s.updated_at,

                        u.name AS customer_name,
                        u.email AS customer_email

                     FROM support_requests s

                     INNER JOIN users u
                     ON s.user_id = u.id

                     ORDER BY
                     s.created_at DESC`

                );


            res.json(requests);


        } catch (error) {

            console.error(
                "ADMIN SUPPORT ERROR:",
                error
            );


            res.status(500).json({

                message:
                    "Server error while loading support requests."

            });

        }

    }
);


/* ==========================================
   ADMIN UPDATE SUPPORT REQUEST
========================================== */

app.put(
    "/api/admin/support/:id",
    requireAdmin,
    async (req, res) => {

        try {

            const requestId =
                req.params.id;


            const {
                status,
                adminReply
            } = req.body;


            const allowedStatuses = [

                "Open",

                "In Progress",

                "Resolved",

                "Closed"

            ];


            if (
                !allowedStatuses.includes(
                    status
                )
            ) {

                return res.status(400).json({

                    message:
                        "Invalid support status."

                });

            }


            await db.query(

                `UPDATE support_requests

                 SET
                    status = ?,
                    admin_reply = ?

                 WHERE id = ?`,

                [

                    status,

                    adminReply
                        ? adminReply.trim()
                        : null,

                    requestId

                ]

            );


            res.json({

                success: true,

                message:
                    "Support request updated successfully."

            });


        } catch (error) {

            console.error(
                "UPDATE SUPPORT ERROR:",
                error
            );


            res.status(500).json({

                message:
                    "Server error while updating support request."

            });

        }

    }
);

/* =====================================================
   WISHLIST
===================================================== */


/* -----------------------------------------------------
   GET CUSTOMER WISHLIST
----------------------------------------------------- */

app.get(
    "/api/wishlist",
    requireLogin,
    async (req, res) => {

        try {

            const userId =
                req.session.userId;


            const [wishlist] =
                await db.execute(
                    `
                    SELECT
                        wishlist.id AS wishlist_id,
                        wishlist.product_id,
                        wishlist.created_at,

                        products.id,
                        products.name,
                        products.category,
                        products.price,
                        products.description,
                        products.icon,
                        products.stock

                    FROM wishlist

                    INNER JOIN products
                    ON wishlist.product_id =
                       products.id

                    WHERE wishlist.user_id = ?

                    ORDER BY wishlist.created_at DESC
                    `,
                    [userId]
                );


            res.json({
                success: true,
                wishlist
            });


        } catch (error) {

            console.error(
                "GET WISHLIST ERROR:",
                error
            );


            res.status(500).json({

                success: false,

                message:
                    "Unable to load wishlist.",

                error:
                    error.message

            });

        }

    }
);



/* -----------------------------------------------------
   ADD PRODUCT TO WISHLIST
----------------------------------------------------- */

app.post(
    "/api/wishlist",
    requireLogin,
    async (req, res) => {

        try {

            const userId =
                req.session.userId;


            const productId =
                Number(req.body.productId);


            if (!productId) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Product ID is required."

                });

            }


            /* CHECK PRODUCT */

            const [products] =
                await db.execute(

                    `
                    SELECT
                        id,
                        name
                    FROM products
                    WHERE id = ?
                    `,

                    [productId]

                );


            if (products.length === 0) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Product not found."

                });

            }


            /* CHECK ALREADY EXISTS */

            const [existing] =
                await db.execute(

                    `
                    SELECT id
                    FROM wishlist

                    WHERE user_id = ?
                    AND product_id = ?
                    `,

                    [
                        userId,
                        productId
                    ]

                );


            if (existing.length > 0) {

                return res.json({

                    success: true,

                    alreadyExists: true,

                    message:
                        "Product is already in your wishlist."

                });

            }


            /* ADD PRODUCT */

            await db.execute(

                `
                INSERT INTO wishlist
                (
                    user_id,
                    product_id
                )

                VALUES (?, ?)
                `,

                [
                    userId,
                    productId
                ]

            );


            res.status(201).json({

                success: true,

                message:
                    "Product added to wishlist."

            });


        } catch (error) {

            console.error(
                "ADD WISHLIST ERROR:",
                error
            );


            res.status(500).json({

                success: false,

                message:
                    "Unable to add product to wishlist.",

                error:
                    error.message

            });

        }

    }
);



/* -----------------------------------------------------
   REMOVE PRODUCT FROM WISHLIST
----------------------------------------------------- */

app.delete(
    "/api/wishlist/:productId",
    requireLogin,
    async (req, res) => {

        try {

            const userId =
                req.session.userId;


            const productId =
                Number(req.params.productId);


            if (!productId) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Product ID is required."

                });

            }


            const [result] =
                await db.execute(

                    `
                    DELETE FROM wishlist

                    WHERE user_id = ?
                    AND product_id = ?
                    `,

                    [
                        userId,
                        productId
                    ]

                );


            if (result.affectedRows === 0) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Product is not in your wishlist."

                });

            }


            res.json({

                success: true,

                message:
                    "Product removed from wishlist."

            });


        } catch (error) {

            console.error(
                "REMOVE WISHLIST ERROR:",
                error
            );


            res.status(500).json({

                success: false,

                message:
                    "Unable to remove wishlist item.",

                error:
                    error.message

            });

        }

    }
);

/* =====================================================
   WISHLIST
===================================================== */


/* GET CUSTOMER WISHLIST */

app.get(
    "/api/wishlist",
    requireLogin,
    async (req, res) => {

        try {

            const userId = req.session.userId;

            const [wishlist] = await db.execute(
                `
                SELECT
                    wishlist.id AS wishlist_id,
                    wishlist.product_id,
                    wishlist.created_at,
                    products.id,
                    products.name,
                    products.category,
                    products.price,
                    products.description,
                    products.icon,
                    products.stock

                FROM wishlist

                INNER JOIN products
                    ON wishlist.product_id = products.id

                WHERE wishlist.user_id = ?

                ORDER BY wishlist.created_at DESC
                `,
                [userId]
            );

            res.json({
                success: true,
                wishlist
            });

        } catch (error) {

            console.error(
                "GET WISHLIST ERROR:",
                error
            );

            res.status(500).json({
                success: false,
                message: "Unable to load wishlist.",
                error: error.message
            });
        }
    }
);


/* ADD PRODUCT TO WISHLIST */

app.post(
    "/api/wishlist",
    requireLogin,
    async (req, res) => {

        try {

            const userId = req.session.userId;

            const productId =
                Number(req.body.productId);

            if (!productId) {

                return res.status(400).json({
                    success: false,
                    message: "Product ID is required."
                });
            }


            const [products] = await db.execute(
                `
                SELECT id
                FROM products
                WHERE id = ?
                `,
                [productId]
            );


            if (products.length === 0) {

                return res.status(404).json({
                    success: false,
                    message: "Product not found."
                });
            }


            const [existing] = await db.execute(
                `
                SELECT id
                FROM wishlist
                WHERE user_id = ?
                AND product_id = ?
                `,
                [
                    userId,
                    productId
                ]
            );


            if (existing.length > 0) {

                return res.json({
                    success: true,
                    alreadyExists: true,
                    message:
                        "Product is already in your wishlist."
                });
            }


            await db.execute(
                `
                INSERT INTO wishlist
                (
                    user_id,
                    product_id
                )
                VALUES (?, ?)
                `,
                [
                    userId,
                    productId
                ]
            );


            res.status(201).json({
                success: true,
                message:
                    "Product added to wishlist."
            });

        } catch (error) {

            console.error(
                "ADD WISHLIST ERROR:",
                error
            );

            res.status(500).json({
                success: false,
                message:
                    "Unable to add product to wishlist.",
                error: error.message
            });
        }
    }
);


/* REMOVE PRODUCT FROM WISHLIST */

app.delete(
    "/api/wishlist/:productId",
    requireLogin,
    async (req, res) => {

        try {

            const userId = req.session.userId;

            const productId =
                Number(req.params.productId);


            if (!productId) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Product ID is required."
                });
            }


            const [result] = await db.execute(
                `
                DELETE FROM wishlist

                WHERE user_id = ?
                AND product_id = ?
                `,
                [
                    userId,
                    productId
                ]
            );


            if (result.affectedRows === 0) {

                return res.status(404).json({
                    success: false,
                    message:
                        "Product is not in your wishlist."
                });
            }


            res.json({
                success: true,
                message:
                    "Product removed from wishlist."
            });

        } catch (error) {

            console.error(
                "REMOVE WISHLIST ERROR:",
                error
            );

            res.status(500).json({
                success: false,
                message:
                    "Unable to remove wishlist item.",
                error: error.message
            });
        }
    }
);

/* =========================================================
   GET CUSTOMER SUPPORT CHAT
   ========================================================= */

app.get(
    "/api/support/:supportId/messages",
    requireLogin,
    async (req, res) => {

        try {

            const supportId =
                Number(req.params.supportId);

            const userId =
                req.session.userId;

            if (
                !Number.isInteger(supportId) ||
                supportId <= 0
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid support ticket."
                });
            }

            /* Make sure ticket belongs to logged-in customer */

            const [tickets] =
                await db.execute(
                    `
                    SELECT id
                    FROM support_requests
                    WHERE id = ?
                    AND user_id = ?
                    `,
                    [
                        supportId,
                        userId
                    ]
                );

            if (tickets.length === 0) {

                return res.status(403).json({
                    success: false,
                    message:
                        "You cannot access this support ticket."
                });
            }

            const [messages] =
                await db.execute(
                    `
                    SELECT
                        sm.id,
                        sm.support_id,
                        sm.sender_type,
                        sm.sender_id,
                        sm.message,
                        sm.created_at
                    FROM support_messages sm
                    WHERE sm.support_id = ?
                    ORDER BY sm.created_at ASC
                    `,
                    [supportId]
                );

            res.json({
                success: true,
                messages
            });

        } catch (error) {

            console.error(
                "GET SUPPORT CHAT ERROR:",
                error
            );

            res.status(500).json({
                success: false,
                message:
                    "Unable to load support chat."
            });
        }
    }
);

/* =========================================================
   CUSTOMER SEND SUPPORT MESSAGE
   ========================================================= */

app.post("/api/support/:supportId/messages", requireLogin,
    async (req, res) => {

        try {

            const supportId =
                Number(req.params.supportId);

            const userId =
                req.session.userId;

            const message =
                String(
                    req.body.message || ""
                ).trim();

            if (
                !Number.isInteger(supportId) ||
                supportId <= 0
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid support ticket."
                });
            }

            if (!message) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Please enter a message."
                });
            }

            if (message.length > 2000) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Message cannot exceed 2000 characters."
                });
            }

            /* Check ticket ownership */

            const [tickets] =
                await db.execute(
                    `
                    SELECT id, status
                    FROM support_requests
                    WHERE id = ?
                    AND user_id = ?
                    `,
                    [
                        supportId,
                        userId
                    ]
                );

            if (tickets.length === 0) {

                return res.status(403).json({
                    success: false,
                    message:
                        "You cannot reply to this ticket."
                });
            }

            const ticket =
                tickets[0];

            /* Don't allow messages on closed tickets */

            if (
                String(ticket.status)
                    .toLowerCase() === "closed"
            ) {

                return res.status(400).json({
                    success: false,
                    message:
                        "This support ticket is closed."
                });
            }

            const [result] =
                await db.execute(
                    `
                    INSERT INTO support_messages
                    (
                        support_id,
                        sender_type,
                        sender_id,
                        message
                    )
                    VALUES (?, 'customer', ?, ?)
                    `,
                    [
                        supportId,
                        userId,
                        message
                    ]
                );

            /* Set ticket back to Open */

            await db.execute(
                `
                UPDATE support_requests
                SET status = 'Open'
                WHERE id = ?
                `,
                [supportId]
            );

            res.json({
                success: true,
                message:
                    "Message sent successfully.",
                messageId:
                    result.insertId
            });

        } catch (error) {

            console.error(
                "CUSTOMER SUPPORT MESSAGE ERROR:",
                error
            );

            res.status(500).json({
                success: false,
                message:
                    "Unable to send message."
            });
        }
    }
);

/* =====================================================
   API 404
===================================================== */

app.use(
    "/api",
    (req, res) => {

        res.status(404).json({
            success: false,
            message:
                "API endpoint not found."
        });
    }
);


/* =====================================================
   START
===================================================== */

async function startServer() {

    await testDatabase();

    app.listen(PORT, () => {

    console.log("");
    console.log("========================================");
    console.log("       ELECTROMART SERVER RUNNING");
    console.log("========================================");

    console.log("");
    console.log("🌐 Website:");
    console.log(`   http://localhost:${PORT}`);

    console.log("");
    console.log("🔐 Admin Panel:");
    console.log(`   http://localhost:${PORT}/admin.html`);

    console.log("");
    console.log("🛟 Customer Support:");
    console.log(`   http://localhost:${PORT}/admin-support.html`);

    console.log("");
    console.log("========================================");
});
}

startServer();
 
