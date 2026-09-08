const express = require("express");
const mysql = require("mysql2/promise");
const bcrypt = require("bcryptjs");
const session = require("express-session");
const cors = require("cors");
const path = require("path");
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

const db =
    mysql.createPool({

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
   CUSTOMER SESSION
===================================================== */

app.get(
    "/api/user",
    (req, res) => {

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
===================================================== */

app.get(
    "/api/products",
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
                        stock
                     FROM products
                     ORDER BY id ASC`
                );

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
   CART - GET
===================================================== */

app.get(
    "/api/cart",
    requireLogin,
    async (req, res) => {

        try {

            const userId =
                req.session.userId;

            const [items] =
                await db.execute(
                    `SELECT
                        cart.id,
                        cart.product_id,
                        cart.quantity,
                        products.name,
                        products.price,
                        products.description,
                        products.icon,
                        products.stock
                     FROM cart
                     INNER JOIN products
                     ON cart.product_id =
                        products.id
                     WHERE cart.user_id = ?
                     ORDER BY cart.id DESC`,
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
                items,
                total
            });

        } catch (error) {

            console.error(
                "CART ERROR:",
                error
            );

            res.status(500).json({
                success: false,
                message:
                    "Unable to load cart."
            });
        }
    }
);


/* =====================================================
   CART - ADD
===================================================== */

app.post(
    "/api/cart",
    requireLogin,
    async (req, res) => {

        try {

            const userId =
                req.session.userId;

            const productId =
                Number(
                    req.body.productId
                );

            const quantity =
                Number(
                    req.body.quantity
                ) || 1;

            if (!productId) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Product ID is required."
                });
            }

            const [products] =
                await db.execute(
                    "SELECT * FROM products WHERE id = ?",
                    [productId]
                );

            if (products.length === 0) {

                return res.status(404).json({
                    success: false,
                    message:
                        "Product not found."
                });
            }

            const product =
                products[0];

            if (product.stock <= 0) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Product is out of stock."
                });
            }

            const [existing] =
                await db.execute(
                    `SELECT *
                     FROM cart
                     WHERE user_id = ?
                     AND product_id = ?`,
                    [
                        userId,
                        productId
                    ]
                );

            if (existing.length > 0) {

                const newQuantity =
                    Number(
                        existing[0].quantity
                    ) + quantity;

                if (
                    newQuantity >
                    product.stock
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
                        newQuantity,
                        userId,
                        productId
                    ]
                );

            } else {

                if (
                    quantity >
                    product.stock
                ) {

                    return res.status(400).json({
                        success: false,
                        message:
                            "Not enough stock."
                    });
                }

                await db.execute(
                    `INSERT INTO cart
                    (user_id, product_id, quantity)
                    VALUES (?, ?, ?)`,
                    [
                        userId,
                        productId,
                        quantity
                    ]
                );
            }

            res.json({
                success: true,
                message:
                    "Product added to cart."
            });

        } catch (error) {

            console.error(
                "ADD CART ERROR:",
                error
            );

            res.status(500).json({
                success: false,
                message:
                    "Unable to add product to cart."
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

            res.status(201).json({

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
                message:
                    "Unable to place order."
            });
        }
    }
);


/* =====================================================
   CUSTOMER ORDERS
===================================================== */

app.get(
    "/api/orders",
    requireLogin,
    async (req, res) => {

        try {

            const userId =
                req.session.userId;

            const [orders] =
                await db.execute(
                    `SELECT
                        id,
                        total,
                        address,
                        status,
                        created_at
                     FROM orders
                     WHERE user_id = ?
                     ORDER BY created_at DESC`,
                    [userId]
                );

            for (const order of orders) {

                const [items] =
                    await db.execute(
                        `SELECT
                            order_items.id,
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
                "ORDERS ERROR:",
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


            /* CHECK SUBJECT */

            if (
                !subject ||
                subject.trim().length < 3
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

    app.listen(
        PORT,
        () => {

            console.log(
                "================================"
            );

            console.log(
                "      ELECTROMART SERVER"
            );

            console.log(
                "================================"
            );

            console.log(
                `Website: http://localhost:${PORT}`
            );

            console.log(
                `Admin: http://localhost:${PORT}/admin.html`
            );

            console.log(
                "================================"
            );
        }
    );
}

startServer();