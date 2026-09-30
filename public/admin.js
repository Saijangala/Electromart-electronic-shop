/* =====================================================
   ELECTROMART ADMIN PANEL
   ADMIN JAVASCRIPT
===================================================== */

console.log("admin.js loaded successfully");
/* =====================================================
   SEND NOTIFICATION TO CUSTOMER
===================================================== */

function sendAdminNotification(type, title, message, extraData = {}) {

    const key = "electromartNotifications";

    let notifications = [];

    try {
        notifications =
            JSON.parse(localStorage.getItem(key)) || [];
    } catch (error) {
        notifications = [];
    }

    const notification = {
        id: Date.now() + Math.random(),
        type: type,
        title: title,
        message: message,
        date: new Date().toISOString(),
        read: false,
        ...extraData
    };

    notifications.unshift(notification);

    notifications = notifications.slice(0, 50);

    localStorage.setItem(
        key,
        JSON.stringify(notifications)
    );
}
/* =====================================================
   SEND NOTIFICATION TO CUSTOMER
===================================================== */

function sendAdminNotification(type, title, message, extraData = {}) {

    const key = "electromartNotifications";

    let notifications = [];

    try {
        notifications =
            JSON.parse(localStorage.getItem(key)) || [];
    } catch (error) {
        notifications = [];
    }

    const notification = {
        id: Date.now() + Math.random(),
        type: type,
        title: title,
        message: message,
        date: new Date().toISOString(),
        read: false,
        ...extraData
    };

    notifications.unshift(notification);

    notifications = notifications.slice(0, 50);

    localStorage.setItem(
        key,
        JSON.stringify(notifications)
    );
}

/* =====================================================
   WHEN PAGE LOADS
===================================================== */

document.addEventListener("DOMContentLoaded", function () {

    console.log("Admin page loaded");

    const loginForm =
        document.getElementById("adminLoginForm");

    if (!loginForm) {

        console.error(
            "ERROR: adminLoginForm not found"
        );

        return;
    }

    loginForm.addEventListener(
        "submit",
        adminLogin
    );

});


/* =====================================================
   ADMIN LOGIN
===================================================== */

async function adminLogin(event) {

    event.preventDefault();

    console.log("Login button clicked");

    const email =
        document
            .getElementById("adminEmail")
            .value
            .trim();

    const password =
        document
            .getElementById("adminPassword")
            .value;

    const message =
        document.getElementById(
            "adminLoginMessage"
        );

    if (!email || !password) {

        message.textContent =
            "Please enter email and password.";

        message.className =
            "message error";

        return;
    }

    try {

        console.log(
            "Sending login request..."
        );

        const response =
            await fetch(
                "/api/admin/login",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    credentials: "include",

                    body: JSON.stringify({
                        email: email,
                        password: password
                    })
                }
            );

        console.log(
            "Server response:",
            response.status
        );

        const data =
            await response.json();

        console.log(
            "Server data:",
            data
        );

        if (!response.ok || !data.success) {

            message.textContent =
                data.message ||
                "Admin login failed.";

            message.className =
                "message error";

            return;
        }

        /* =========================
           LOGIN SUCCESS
        ========================= */

        message.textContent =
            "Login successful!";

        message.className =
            "message success";

        document
            .getElementById(
                "adminLoginSection"
            )
            .classList.add("hidden");

        document
            .getElementById(
                "adminDashboard"
            )
            .classList.remove("hidden");

        console.log(
            "Admin dashboard opened"
        );

        /* Load all admin data */

        loadDashboard();
        loadProducts();
        loadUsers();
        loadOrders();
        loadSupportRequests();

    } catch (error) {

        console.error(
            "LOGIN ERROR:",
            error
        );

        message.textContent =
            "Cannot connect to server. Make sure node server.js is running.";

        message.className =
            "message error";
    }

}


/* =====================================================
   DASHBOARD
===================================================== */
async function loadDashboard() {

    try {

        const response = await fetch(
            "/api/admin/dashboard",
            {
                credentials: "include"
            }
        );

        const data = await response.json();

        console.log("Dashboard:", data);

        if (!response.ok || !data.success) {
            console.error(
                data.message ||
                "Unable to load dashboard."
            );
            return;
        }

        /* TOTAL CUSTOMERS */

        const customerElement =
            document.getElementById(
                "totalCustomers"
            );

        if (customerElement) {

            customerElement.textContent =
                data.stats.totalUsers || 0;

        }

    } catch (error) {

        console.error(
            "Dashboard error:",
            error
        );

    }

}


/* =====================================================
   PRODUCTS
===================================================== */

async function loadProducts() {

    try {

        const response =
            await fetch(
                "/api/admin/products",
                {
                    credentials: "include"
                }
            );

        const data =
            await response.json();

        console.log(
            "Products:",
            data
        );

        if (!data.success) {

            console.error(
                data.message
            );

            return;
        }

        const table =
            document.getElementById(
                "productsTableBody"
            );

        if (!table) {
            return;
        }

        table.innerHTML = "";

        data.products.forEach(
            function (product) {

                const row =
                    document.createElement("tr");

                row.innerHTML = `

                    <td>
                        ${product.id}
                    </td>

                    <td>

                        ${escapeHTML(
                            product.icon || "📦"
                        )}

                        ${escapeHTML(
                            product.name
                        )}

                    </td>

                    <td>

                        ${escapeHTML(
                            product.category
                        )}

                    </td>

                    <td>

                        ₹${formatPrice(
                            product.price
                        )}

                    </td>

                    <td>

                        ${product.stock}

                    </td>

                    <td>

                        <button
                            class="edit-btn"
                            onclick="editProduct(${product.id})">

                            Edit

                        </button>

                        <button
                            class="delete-btn"
                            onclick="deleteProduct(${product.id})">

                            Delete

                        </button>

                    </td>

                `;

                table.appendChild(row);

            }
        );

    } catch (error) {

        console.error(
            "Products error:",
            error
        );

    }

}


/* =====================================================
   ADD PRODUCT FORM
===================================================== */

function openProductForm() {
    const formContainer =
        document.getElementById("productFormContainer");

    const form =
        document.getElementById("productForm");

    const formTitle =
        document.getElementById("productFormTitle");

    const productId =
        document.getElementById("productId");

    if (!formContainer) {
        console.error("Product form container not found");
        return;
    }

    if (form) {
        form.reset();
    }

    if (productId) {
        productId.value = "";
    }

    if (formTitle) {
        formTitle.textContent = "Add Product";
    }

    formContainer.classList.remove("hidden");

    formContainer.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}

/* =====================================================
   SAVE PRODUCT
===================================================== */

async function saveProduct(event) {

    event.preventDefault();

    console.log(
        "Save Product clicked"
    );

    const productId =
        document
            .getElementById(
                "productId"
            )
            .value
            .trim();

    const name =
        document
            .getElementById(
                "productName"
            )
            .value
            .trim();

    const category =
        document
            .getElementById(
                "productCategory"
            )
            .value;

    const price =
        Number(
            document
                .getElementById(
                    "productPrice"
                )
                .value
        );

    const stock =
        Number(
            document
                .getElementById(
                    "productStock"
                )
                .value
        );

    const icon =
        document
            .getElementById(
                "productIcon"
            )
            .value
            .trim();

    const description =
        document
            .getElementById(
                "productDescription"
            )
            .value
            .trim();


    /* Validation */

    if (!name) {

        alert(
            "Please enter Product Name."
        );

        return;
    }

    if (!category) {

        alert(
            "Please select Category."
        );

        return;
    }

    if (isNaN(price) || price < 0) {

        alert(
            "Please enter a valid Price."
        );

        return;
    }

    if (isNaN(stock) || stock < 0) {

        alert(
            "Please enter a valid Stock quantity."
        );

        return;
    }


    const productData = {

        name: name,

        category: category,

        price: price,

        stock: stock,

        icon: icon || "📦",

        description: description

    };


    console.log(
        "Product data:",
        productData
    );


    let url =
        "/api/admin/products";

    let method =
        "POST";


    /* Edit existing product */

    if (productId) {

        url =
            `/api/admin/products/${productId}`;

        method =
            "PUT";

    }


    try {

        const response =
            await fetch(
                url,
                {
                    method: method,

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    credentials: "include",

                    body:
                        JSON.stringify(
                            productData
                        )
                }
            );


        console.log(
            "Server status:",
            response.status
        );


        const data =
            await response.json();


        console.log(
            "Server response:",
            data
        );


        if ( !response.ok ||!data.success  ) {

            alert(
                data.message ||
                "Product could not be saved."
            );

            return;
        }

if (!productId) {

    const notification = {
        id: Date.now() + Math.random(),
        type: "product",
        title: "New Product Added 🛍️",
        message: `${name} has been added to ElectroMart.`,
        date: new Date().toISOString(),
        read: false
    };

    let notifications = [];

    try {
        notifications =
            JSON.parse(
                localStorage.getItem(
                    "electromartNotifications"
                )
            ) || [];

        if (!Array.isArray(notifications)) {
            notifications = [];
        }

    } catch (error) {
        notifications = [];
    }

    notifications.unshift(notification);

    notifications =
        notifications.slice(0, 50);

    localStorage.setItem(
        "electromartNotifications",
        JSON.stringify(notifications)
    );

    console.log(
        "Product notification created:",
        notification
    );
}


/* EXISTING CODE — DO NOT REMOVE */

alert(
    data.message ||
    "Product saved successfully!"
);

 /* =====================================================
   NEW PRODUCT NOTIFICATION
===================================================== */

if (!productId) {

    sendAdminNotification(
        "product",
        "New Product Added",
        `${name} has been added to ElectroMart.`,
        {
            productId: data.productId || null
        }
    );

}

        alert(
            data.message ||
            "Product saved successfully!"
        );


        /* Clear form */

        document
            .getElementById(
                "productForm"
            )
            .reset();

        document
            .getElementById(
                "productId"
            )
            .value = "";

        document
            .getElementById(
                "productFormTitle"
            )
            .textContent =
            "Add Product";

        document
            .getElementById(
                "productFormContainer"
            )
            .classList.add("hidden");


        /* Reload data */

        await loadProducts();

        await loadDashboard();


    } catch (error) {

        console.error(
            "ADD PRODUCT ERROR:",
            error
        );

        alert(
            "Cannot connect to server. Please make sure node server.js is running."
        );

    }

}
/* =====================================================
   STOCK ADDED NOTIFICATION
===================================================== */

if (
    productId &&
    oldStock !== null &&
    stock > oldStock
) {

    const addedQuantity =
        stock - oldStock;

    sendAdminNotification(
        "stock",
        "Product Stock Updated",
        `${name} stock increased by ${addedQuantity} item(s).`,
        {
            productId: Number(productId),
            quantity: addedQuantity
        }
    );
}
/* =====================================================
   EDIT PRODUCT
===================================================== */

async function editProduct(id) {

    try {

        const response =
            await fetch(
                "/api/admin/products",
                {
                    credentials: "include"
                }
            );

        const data =
            await response.json();


        const product =
            data.products.find(
                p =>
                    Number(p.id) ===
                    Number(id)
            );


        if (!product) {

            alert(
                "Product not found."
            );

            return;
        }


        document
            .getElementById(
                "productId"
            )
            .value =
            product.id;


        document
            .getElementById(
                "productName"
            )
            .value =
            product.name;


        document
            .getElementById(
                "productCategory"
            )
            .value =
            product.category;


        document
            .getElementById(
                "productPrice"
            )
            .value =
            product.price;


        document
            .getElementById(
                "productStock"
            )
            .value =
            product.stock;


        document
            .getElementById(
                "productIcon"
            )
            .value =
            product.icon || "";


        document
            .getElementById(
                "productDescription"
            )
            .value =
            product.description || "";


        document
            .getElementById(
                "productFormTitle"
            )
            .textContent =
            "Edit Product";


        document
            .getElementById(
                "productFormContainer"
            )
            .classList
            .remove("hidden");


    } catch (error) {

        console.error(
            "Edit error:",
            error
        );

    }

}


/* =====================================================
   DELETE PRODUCT
===================================================== */

async function deleteProduct(id) {

    if (
        !confirm(
            "Are you sure you want to delete this product?"
        )
    ) {

        return;

    }


    try {

        const response =
            await fetch(
                `/api/admin/products/${id}`,
                {
                    method: "DELETE",

                    credentials: "include"
                }
            );


        const data =
            await response.json();


        alert(
            data.message
        );


        if (data.success) {

            loadProducts();

            loadDashboard();

        }


    } catch (error) {

        console.error(
            "Delete error:",
            error
        );

    }

}


/* =====================================================
   USERS
===================================================== */

async function loadUsers() {

    try {

        const response =
            await fetch(
                "/api/admin/users",
                {
                    credentials: "include"
                }
            );

        const data =
            await response.json();


        console.log(
            "Users:",
            data
        );


        if (!data.success) {

            return;

        }


        const table =
            document.getElementById(
                "usersTableBody"
            );


        if (!table) {
            return;
        }


        table.innerHTML = "";


        data.users.forEach(
            function (user) {

                const row =
                    document.createElement("tr");


                row.innerHTML = `

                    <td>
                        ${user.id}
                    </td>

                    <td>
                        ${escapeHTML(
                            user.name
                        )}
                    </td>

                    <td>
                        ${escapeHTML(
                            user.email
                        )}
                    </td>

                    <td>
                        ${formatDate(
                            user.created_at
                        )}
                    </td>

                `;


                table.appendChild(
                    row
                );

            }
        );


    } catch (error) {

        console.error(
            "Users error:",
            error
        );

    }

}


/* =====================================================
   ORDERS
===================================================== */

/* =====================================================
   ORDER STATUS COUNTS
===================================================== */
/* =====================================================
   ORDER STATUS COUNTS + DONUT CHART
===================================================== */

function updateOrderCounts(orders) {

    const counts = {

        "Processing": 0,

        "Shipped": 0,

        "Out for Delivery": 0,

        "Delivered": 0,

        "Cancelled": 0

    };


    /* =========================================
       COUNT ORDERS
    ========================================= */

    if (!Array.isArray(orders)) {

        orders = [];

    }


    orders.forEach(function(order) {

        const status =
            String(
                order.status || ""
            ).trim();


        if (
            Object.prototype.hasOwnProperty.call(
                counts,
                status
            )
        ) {

            counts[status]++;

        }

    });


    /* =========================================
       TOTAL ORDERS
    ========================================= */

    const totalOrders =
        Object.values(counts)
            .reduce(
                function(total, value) {
                    return total + value;
                },
                0
            );


    /* =========================================
       UPDATE EXISTING ORDER CARDS
    ========================================= */

    const placed =
        document.getElementById(
            "orderPlacedCount"
        );

    const processing =
        document.getElementById(
            "orderProcessingCount"
        );

    const shipped =
        document.getElementById(
            "orderShippedCount"
        );

    const delivery =
        document.getElementById(
            "orderDeliveryCount"
        );

    const delivered =
        document.getElementById(
            "orderDeliveredCount"
        );

    const cancelled =
        document.getElementById(
            "orderCancelledCount"
        );


    if (placed) {

        placed.textContent =
            counts["Order Placed"];

    }


    if (processing) {

        processing.textContent =
            counts["Processing"];

    }


    if (shipped) {

        shipped.textContent =
            counts["Shipped"];

    }


    if (delivery) {

        delivery.textContent =
            counts["Out for Delivery"];

    }


    if (delivered) {

        delivered.textContent =
            counts["Delivered"];

    }


    if (cancelled) {

        cancelled.textContent =
            counts["Cancelled"];

    }


    /* =========================================
       UPDATE DONUT CENTER TOTAL
    ========================================= */

    const donutTotal =
        document.getElementById(
            "donutTotal"
        );


    if (donutTotal) {

        donutTotal.textContent =
            totalOrders;

    }


    /* =========================================
       UPDATE DONUT LEGEND COUNTS
    ========================================= */

    const placedCount =
        document.getElementById(
            "placedCount"
        );

    const processingCount =
        document.getElementById(
            "processingCount"
        );

    const shippedCount =
        document.getElementById(
            "shippedCount"
        );

    const deliveryCount =
        document.getElementById(
            "deliveryCount"
        );

    const deliveredCount =
        document.getElementById(
            "deliveredCount"
        );

    const cancelledCount =
        document.getElementById(
            "cancelledCount"
        );


    if (placedCount) {

        placedCount.textContent =
            counts["Order Placed"];

    }


    if (processingCount) {

        processingCount.textContent =
            counts["Processing"];

    }


    if (shippedCount) {

        shippedCount.textContent =
            counts["Shipped"];

    }


    if (deliveryCount) {

        deliveryCount.textContent =
            counts["Out for Delivery"];

    }


    if (deliveredCount) {

        deliveredCount.textContent =
            counts["Delivered"];

    }


    if (cancelledCount) {

        cancelledCount.textContent =
            counts["Cancelled"];

    }


    /* =========================================
       CREATE DONUT CHART
    ========================================= */

    const donutChart =
        document.getElementById(
            "donutChart"
        );


    if (!donutChart) {

        console.warn(
            "donutChart element not found."
        );

        return;

    }


    /* No orders */
if (totalOrders === 0) {

    donutChart.style.background =
        "conic-gradient(#e5e7eb 0deg 360deg)";

    createPercentageLabels({
        placed: "0.0",
        processing: "0.0",
        shipped: "0.0",
        outDelivery: "0.0",
        delivered: "0.0",
        cancelled: "0.0"
    });

    return;
}

    /* =========================================
       CALCULATE DEGREES
    ========================================= */

    const placedDegrees =
        (
            counts["Order Placed"] /
            totalOrders
        ) * 360;


    const processingDegrees =
        (
            counts["Processing"] /
            totalOrders
        ) * 360;


    const shippedDegrees =
        (
            counts["Shipped"] /
            totalOrders
        ) * 360;


    const deliveryDegrees =
        (
            counts["Out for Delivery"] /
            totalOrders
        ) * 360;


    const deliveredDegrees =
        (
            counts["Delivered"] /
            totalOrders
        ) * 360;


    const cancelledDegrees =
        (
            counts["Cancelled"] /
            totalOrders
        ) * 360;


    /* =========================================
       BUILD DONUT GRADIENT
    ========================================= */

    const start1 = 0;

    const end1 =
        placedDegrees;


    const start2 =
        end1;

    const end2 =
        start2 +
        processingDegrees;


    const start3 =
        end2;

    const end3 =
        start3 +
        shippedDegrees;


    const start4 =
        end3;

    const end4 =
        start4 +
        deliveryDegrees;


    const start5 =
        end4;

    const end5 =
        start5 +
        deliveredDegrees;


    const start6 =
        end5;

    const end6 =
        start6 +
        cancelledDegrees;

        donutChart.style.background =
    `
    conic-gradient(

        #3b82f6
        ${start1}deg
        ${end1}deg,

        #f59e0b
        ${start2}deg
        ${end2}deg,

        #10b981
        ${start3}deg
        ${end3}deg,

        #06b6d4
        ${start4}deg
        ${end4}deg,

        #8b5cf6
        ${start5}deg
        ${end5}deg,

        #ef4444
        ${start6}deg
        ${end6}deg

    )
    `;


/* =========================================
   CREATE PERCENTAGES
========================================= */

const percentages = {

    placed:
        ((counts["Order Placed"] / totalOrders) * 100)
            .toFixed(1),

    processing:
        ((counts["Processing"] / totalOrders) * 100)
            .toFixed(1),

    shipped:
        ((counts["Shipped"] / totalOrders) * 100)
            .toFixed(1),

    outDelivery:
        ((counts["Out for Delivery"] / totalOrders) * 100)
            .toFixed(1),

    delivered:
        ((counts["Delivered"] / totalOrders) * 100)
            .toFixed(1),

    cancelled:
        ((counts["Cancelled"] / totalOrders) * 100)
            .toFixed(1)

};


/* SHOW PERCENTAGES */

createPercentageLabels(percentages);
}
async function loadOrders() {

    try {

        const response =
            await fetch(
                "/api/admin/orders",
                {
                    credentials: "include"
                }
            );

        const data =
            await response.json();


        if (!data.success) {

            return;

        }


        updateOrderCounts(
            Array.isArray(data.orders)
                ? data.orders
                : []
        );


        // existing table code continues here

    }

    catch (error) {

        console.error(
            "Orders error:",
            error
        );

    }

}


/* =====================================================
   STATUS OPTIONS
===================================================== */

function statusOptions(current) {

    const statuses = [

        "Order Placed",

        "Processing",

        "Shipped",

        "Out for Delivery",

        "Delivered",

        "Cancelled"

    ];


    return statuses
        .map(
            function (status) {

                return `

                    <option
                        value="${status}"
                        ${
                            status === current
                                ? "selected"
                                : ""
                        }>

                        ${status}

                    </option>

                `;

            }
        )
        .join("");

}


/* =====================================================
   UPDATE ORDER STATUS
===================================================== */

async function updateOrderStatus(
    orderId,
    status
) {

    try {

        const response =
            await fetch(
                `/api/admin/orders/${orderId}/status`,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    credentials: "include",

                    body:
                        JSON.stringify({
                            status: status
                        })
                }
            );


        const data =
            await response.json();


        alert(
            data.message
        );


        if (data.success) {

            loadOrders();

        }


    } catch (error) {

        console.error(
            "Status error:",
            error
        );

    }

}


/* =====================================================
   LOGOUT
===================================================== */

async function adminLogout() {

    try {

        await fetch(
            "/api/admin/logout",
            {
                method: "POST",

                credentials: "include"
            }
        );


        window.location.reload();


    } catch (error) {

        console.error(
            "Logout error:",
            error
        );

    }

}


/* =====================================================
   FORMAT PRICE
===================================================== */

function formatPrice(value) {

    return Number(value || 0)
        .toLocaleString(
            "en-IN",
            {
                maximumFractionDigits: 2
            }
        );

}


/* =====================================================
   FORMAT DATE
===================================================== */

function formatDate(value) {

    if (!value) {

        return "-";

    }


    return new Date(value)
        .toLocaleString("en-IN");

}


/* =====================================================
   ESCAPE HTML
===================================================== */

function escapeHTML(value) {

    return String(value ?? "")

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

}


/* =====================================================
   CUSTOMER SUPPORT - ADMIN PANEL
===================================================== */
/* =====================================================
   CUSTOMER SUPPORT - ADMIN PANEL
===================================================== */

/* =====================================================
   CUSTOMER SUPPORT - ADMIN
===================================================== */

let currentSupportRequest = null;


/* =====================================================
   LOAD SUPPORT REQUESTS
===================================================== */

async function loadSupportRequests() {

    const container =
        document.getElementById(
            "supportAdminTable"
        );


    if (!container) {

        console.error(
            "supportAdminTable not found"
        );

        return;
    }


    container.innerHTML = `
        <div class="support-loading">
            Loading customer support requests...
        </div>
    `;


    try {

        const response =
            await fetch(
                "/api/admin/support",
                {
                    method: "GET",
                    credentials: "include",
                    headers: {
                        "Accept":
                            "application/json"
                    }
                }
            );


        const data =
            await response.json();


        console.log(
            "ADMIN SUPPORT RESPONSE:",
            data
        );


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Unable to load support requests."
            );

        }


        const requests =
            Array.isArray(data)
                ? data
                : Array.isArray(data.requests)
                    ? data.requests
                    : [];


        updateSupportCounts(
            requests
        );


        if (requests.length === 0) {

            container.innerHTML = `
                <div class="support-empty">

                    <h3>
                        🛟 No Support Requests
                    </h3>

                    <p>
                        There are currently no customer support requests.
                    </p>

                </div>
            `;

            return;
        }


        /* =========================================
           TABLE
        ========================================= */

        container.innerHTML = `

            <div class="support-table-wrapper">

                <table class="support-admin-table">

                    <thead>

                        <tr>

                            <th>Ticket ID</th>

                            <th>Customer</th>

                            <th>Order</th>

                            <th>Category</th>

                            <th>Message</th>

                            <th>Status</th>

                            <th>Created Time</th>

                            <th>Action</th>

                        </tr>

                    </thead>

                    <tbody id="supportTableBody">

                    </tbody>

                </table>

            </div>

        `;


        const tbody =
            document.getElementById(
                "supportTableBody"
            );


        requests.forEach(
            function (request) {

                const row =
                    document.createElement(
                        "tr"
                    );


                const status =
                    request.status ||
                    "Pending";


                const created =
                    request.created_at
                        ? new Date(
                            request.created_at
                        ).toLocaleString(
                            "en-IN"
                        )
                        : "-";


                row.innerHTML = `

                    <td>
                        <strong>
                            #${request.id}
                        </strong>
                    </td>


                    <td>

                        <div class="support-customer">

                            <strong>
                                ${escapeHTML(
                                    request.customer_name ||
                                    "Unknown"
                                )}
                            </strong>

                            <small>
                                ${escapeHTML(
                                    request.customer_email ||
                                    "-"
                                )}
                            </small>

                        </div>

                    </td>


                    <td>

                        ${
                            request.order_id
                                ? "#" +
                                  request.order_id
                                : "-"
                        }

                    </td>


                    <td>

                        <span class="support-category">

                            ${escapeHTML(
                                request.issue_type ||
                                request.category ||
                                "Complaint"
                            )}

                        </span>

                    </td>


                    <td>

                        <button
                            type="button"
                            class="support-message-view"
                            onclick="openSupportChat(${Number(request.id)})"
                            title="View customer message">

                            ${escapeHTML(
                                String(
                                    request.message ||
                                    "View message"
                                ).slice(0, 35)
                            )}

                            ${
                                String(
                                    request.message ||
                                    ""
                                ).length > 35
                                    ? "..."
                                    : ""
                            }

                        </button>

                    </td>


                    <td>

                        <select
                            class="support-status-select"
                            onchange="changeSupportStatus(${Number(request.id)}, this.value)"
                        >

                            <option
                                value="Pending"
                                ${
                                    status ===
                                    "Pending"
                                        ? "selected"
                                        : ""
                                }>
                                Pending
                            </option>

                            <option
                                value="In Progress"
                                ${
                                    status ===
                                    "In Progress"
                                        ? "selected"
                                        : ""
                                }>
                                In Progress
                            </option>

                            <option
                                value="Resolved"
                                ${
                                    status ===
                                    "Resolved"
                                        ? "selected"
                                        : ""
                                }>
                                Resolved
                            </option>

                            <option
                                value="Closed"
                                ${
                                    status ===
                                    "Closed"
                                        ? "selected"
                                        : ""
                                }>
                                Closed
                            </option>

                        </select>

                    </td>


                    <td>

                        ${created}

                    </td>


                    <td>

                        <button
                            type="button"
                            class="support-view-btn"
                            onclick="openSupportChat(${Number(request.id)})">

                            👁 View

                        </button>

                    </td>

                `;


                tbody.appendChild(
                    row
                );

            }
        );


    }
    catch (error) {

        console.error(
            "ADMIN SUPPORT ERROR:",
            error
        );


        container.innerHTML = `

            <div class="support-error">

                <h3>
                    ⚠️ Unable to Load Support
                </h3>

                <p>
                    ${escapeHTML(
                        error.message
                    )}
                </p>

                <button
                    type="button"
                    onclick="loadSupportRequests()">

                    Try Again

                </button>

            </div>

        `;

    }

}
/* =====================================================
   OPEN SUPPORT CHAT
===================================================== */

async function openSupportChat(ticketId) {

    try {

        const response =
            await fetch(
                "/api/admin/support",
                {
                    credentials: "include"
                }
            );


        const data =
            await response.json();


        const requests =
            Array.isArray(data)
                ? data
                : Array.isArray(data.requests)
                    ? data.requests
                    : [];


        const request =
            requests.find(
                function (item) {

                    return Number(
                        item.id
                    ) === Number(
                        ticketId
                    );

                }
            );


        if (!request) {

            alert(
                "Support ticket not found."
            );

            return;
        }


        currentSupportRequest =
            request;


        /* =========================================
           HEADER
        ========================================= */

        document.getElementById(
            "chatTicketId"
        ).textContent =
            "#" + request.id;


        document.getElementById(
            "chatCustomerName"
        ).textContent =
            request.customer_name ||
            "Customer";


        /* =========================================
           DETAILS
        ========================================= */

        document.getElementById(
            "chatCustomer"
        ).textContent =
            request.customer_name ||
            "-";


        document.getElementById(
            "chatEmail"
        ).textContent =
            request.customer_email ||
            "-";


        document.getElementById(
            "chatOrder"
        ).textContent =
            request.order_id
                ? "#" + request.order_id
                : "General Issue";


        document.getElementById(
            "chatCategory"
        ).textContent =
            request.issue_type ||
            request.category ||
            "Complaint";


        /* =========================================
           STATUS
        ========================================= */

        document.getElementById(
            "chatStatus"
        ).value =
            request.status ||
            "Pending";


        /* =========================================
           CUSTOMER MESSAGE
        ========================================= */

        const chatMessages =
            document.getElementById(
                "supportChatMessages"
            );


        const created =
            request.created_at
                ? new Date(
                    request.created_at
                ).toLocaleString(
                    "en-IN"
                )
                : "";


        chatMessages.innerHTML = `

            <div class="customer-chat-message">

                <div class="customer-chat-label">

                    👤 Customer Message

                </div>

                <div class="customer-chat-text">

                    ${escapeHTML(
                        request.message ||
                        "No message provided."
                    )}

                </div>

                <div class="customer-chat-time">

                    ${created}

                </div>

            </div>

            ${
                request.admin_reply
                    ? `
                        <div class="admin-chat-message">

                            <div class="admin-chat-label">

                                🛠️ Admin Response

                            </div>

                            <div class="customer-chat-text">

                                ${escapeHTML(
                                    request.admin_reply
                                )}

                            </div>

                        </div>
                    `
                    : ""
            }

        `;


        /* =========================================
           OLD REPLY
        ========================================= */

        document.getElementById(
            "adminReply"
        ).value =
            "";


        document.getElementById(
            "supportReplyMessage"
        ).textContent =
            "";


        /* =========================================
           OPEN MODAL
        ========================================= */

        document.getElementById(
            "supportChatModal"
        ).classList.add(
            "show"
        );


    }
    catch (error) {

        console.error(
            "OPEN SUPPORT ERROR:",
            error
        );

        alert(
            "Unable to open support ticket."
        );

    }

}
/* =====================================================
   CLOSE SUPPORT CHAT
===================================================== */

function closeSupportChat() {

    const modal =
        document.getElementById(
            "supportChatModal"
        );


    if (modal) {

        modal.classList.remove(
            "show"
        );

    }


    currentSupportRequest =
        null;

}
/* =====================================================
   CHANGE SUPPORT STATUS
===================================================== */

async function changeSupportStatus(
    ticketId,
    status
) {

    try {

        const response =
            await fetch(
                `/api/admin/support/${ticketId}`,
                {
                    method: "PUT",

                    credentials: "include",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        status: status
                    })
                }
            );


        const data =
            await response.json();


        if (
            !response.ok ||
            !data.success
        ) {

            throw new Error(
                data.message ||
                "Unable to update status."
            );

        }


        /* UPDATE COUNTERS */

        await loadSupportRequests();


        /* KEEP CHAT OPEN */

        if (
            currentSupportRequest &&
            Number(
                currentSupportRequest.id
            ) === Number(ticketId)
        ) {

            currentSupportRequest.status =
                status;

            const chatStatus =
                document.getElementById(
                    "chatStatus"
                );

            if (chatStatus) {

                chatStatus.value =
                    status;

            }

        }


    }
    catch (error) {

        console.error(
            "SUPPORT STATUS ERROR:",
            error
        );


        alert(
            error.message
        );

    }

}
/* =====================================================
   SEND ADMIN RESPONSE
===================================================== */

async function sendSupportResponse() {

    if (
        !currentSupportRequest
    ) {

        return;

    }


    const replyElement =
        document.getElementById(
            "adminReply"
        );


    const statusElement =
        document.getElementById(
            "chatStatus"
        );


    const messageElement =
        document.getElementById(
            "supportReplyMessage"
        );


    const reply =
        replyElement
            ? replyElement.value.trim()
            : "";


    const status =
        statusElement
            ? statusElement.value
            : "In Progress";


    if (!reply) {

        messageElement.textContent =
            "Please type a response.";

        messageElement.style.color =
            "#dc2626";

        replyElement.focus();

        return;

    }


    try {

        messageElement.textContent =
            "Sending...";

        messageElement.style.color =
            "#2563eb";


        const response =
            await fetch(
                `/api/admin/support/${currentSupportRequest.id}`,
                {
                    method: "PUT",

                    credentials: "include",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        status: status,

                        adminReply: reply

                    })

                }
            );


        const data =
            await response.json();


        console.log(
            "SUPPORT REPLY RESPONSE:",
            data
        );


        if (
            !response.ok ||
            !data.success
        ) {

            throw new Error(
                data.message ||
                "Unable to send response."
            );

        }


        messageElement.textContent =
            "✓ Response sent successfully.";

        messageElement.style.color =
            "#16a34a";


        /* CLEAR TEXTAREA */

        replyElement.value =
            "";


        /* RELOAD TABLE */

        await loadSupportRequests();


        /* UPDATE CHAT */

        const chatMessages =
            document.getElementById(
                "supportChatMessages"
            );


        chatMessages.insertAdjacentHTML(
            "beforeend",
            `
                <div class="admin-chat-message">

                    <div class="admin-chat-label">

                        🛠️ Admin Response

                    </div>

                    <div class="customer-chat-text">

                        ${escapeHTML(reply)}

                    </div>

                </div>
            `
        );


        /* SCROLL TO BOTTOM */

        chatMessages.scrollTop =
            chatMessages.scrollHeight;


        currentSupportRequest.admin_reply =
            reply;


    }
    catch (error) {

        console.error(
            "SEND SUPPORT RESPONSE ERROR:",
            error
        );


        messageElement.textContent =
            "❌ " +
            error.message;

        messageElement.style.color =
            "#dc2626";

    }

}
/* =====================================================
   CUSTOMER SUPPORT COUNTS
===================================================== */

function updateSupportCounts(requests) {

    let total = 0;
    let pending = 0;
    let inProgress = 0;
    let solved = 0;
    let closed = 0;

    requests.forEach(function(request) {

        total++;

        const status = String(
            request.status || "Open"
        ).trim().toLowerCase();

        if (
            status === "open" ||
            status === "pending"
        ) {
            pending++;
        }

        else if (
            status === "in progress" ||
            status === "processing"
        ) {
            inProgress++;
        }

        else if (
            status === "resolved" ||
            status === "solved"
        ) {
            solved++;
        }

        else if (
            status === "closed"
        ) {
            closed++;
        }
    });


    const totalElement =
        document.getElementById("totalComplaints");

    const pendingElement =
        document.getElementById("pendingComplaints");

    const progressElement =
        document.getElementById("inProgressComplaints");

    const solvedElement =
        document.getElementById("solvedComplaints");

    const closedElement =
        document.getElementById("closedComplaints");


    if (totalElement) {
        totalElement.textContent = total;
    }

    if (pendingElement) {
        pendingElement.textContent = pending;
    }

    if (progressElement) {
        progressElement.textContent = inProgress;
    }

    if (solvedElement) {
        solvedElement.textContent = solved;
    }

    if (closedElement) {
        closedElement.textContent = closed;
    }
}

/* =====================================================
   CUSTOMER SUPPORT - CHAT STYLE ADMIN
===================================================== */

async function loadSupportRequests() {
/* =====================================================
   CUSTOMER SUPPORT - STATUS FILTER
===================================================== */

let allSupportRequests = [];
let currentSupportFilter = "all";


function updateSupportCounts(requests) {

    let total = requests.length;
    let pending = 0;
    let inProgress = 0;
    let solved = 0;
    let closed = 0;

    requests.forEach(function(request) {

        const status = String(
            request.status || "Open"
        ).trim().toLowerCase();

        if (
            status === "open" ||
            status === "pending"
        ) {
            pending++;
        }

        else if (
            status === "in progress" ||
            status === "processing"
        ) {
            inProgress++;
        }

        else if (
            status === "resolved" ||
            status === "solved"
        ) {
            solved++;
        }

        else if (
            status === "closed"
        ) {
            closed++;
        }
    });


    document.getElementById(
        "totalComplaints"
    ).textContent = total;


    document.getElementById(
        "pendingComplaints"
    ).textContent = pending;


    document.getElementById(
        "inProgressComplaints"
    ).textContent = inProgress;


    document.getElementById(
        "solvedComplaints"
    ).textContent = solved;


    document.getElementById(
        "closedComplaints"
    ).textContent = closed;
}


/* =====================================================
   CLICK SUPPORT STATUS CARD
===================================================== */

function filterSupportRequests(filter) {

    currentSupportFilter = filter;

    let filteredRequests;


    if (filter === "all") {

        filteredRequests =
            allSupportRequests;

    }

    else {

        filteredRequests =
            allSupportRequests.filter(
                function(request) {

                    const status =
                        String(
                            request.status || "Open"
                        )
                        .trim()
                        .toLowerCase();


                    if (filter === "pending") {

                        return (
                            status === "open" ||
                            status === "pending"
                        );

                    }


                    if (filter === "progress") {

                        return (
                            status === "in progress" ||
                            status === "processing"
                        );

                    }


                    if (filter === "solved") {

                        return (
                            status === "resolved" ||
                            status === "solved"
                        );

                    }


                    if (filter === "closed") {

                        return status === "closed";

                    }

                    return false;

                }
            );

    }


    renderSupportRequests(
        filteredRequests
    );
}
    const container =
        document.getElementById("supportAdminTable");

    if (!container) {
        console.error(
            "supportAdminTable not found in admin.html"
        );
        return;
    }

    container.innerHTML = `
        <div class="support-admin-loading">
            Loading customer support requests...
        </div>
    `;

    try {

        const response =
            await fetch(
                "/api/admin/support",
                {
                    method: "GET",
                    credentials: "include",
                    headers: {
                        "Accept": "application/json"
                    }
                }
            );

        const data =
            await response.json();

        console.log(
            "ADMIN SUPPORT RESPONSE:",
            data
        );

        if (!response.ok) {

            throw new Error(
                data.message ||
                "Unable to load support requests."
            );
        }

        const requests = Array.isArray(data)
                ? data
                : Array.isArray(data.requests)
                    ? data.requests
                    : [];
allSupportRequests = requests;

/* UPDATE SUPPORT TYPES BAR GRAPH */
updateSupportTypesChart(requests);

renderSupportRequests(requests);
 return; 
updateSupportCounts(
    requests
);

renderSupportRequests(
    requests
); 
      /* UPDATE SUPPORT COUNTS */
     updateSupportCounts(requests);                

        if (requests.length === 0) {

            container.innerHTML = `
                <div class="support-empty">
                    <h3>
                        🛟 No Support Requests
                    </h3>

                    <p>
                        There are currently no customer
                        support requests.
                    </p>
                </div>
            `;

            return;
        }

        container.innerHTML = "";

        requests.forEach(
            function(request) {

                const card =
                    document.createElement("div");

                card.className =
                    "support-chat-card";

                const status =
                    request.status || "Open";

                card.innerHTML = `

                    <!-- HEADER -->

                    <div class="support-chat-header">

                        <div>

                            <h3>
                                🛟 Support Ticket #${request.id}
                            </h3>

                            <p>
                                <strong>
                                    ${escapeHTML(
                                        request.customer_name ||
                                        "Customer"
                                    )}
                                </strong>

                                •

                                ${escapeHTML(
                                    request.customer_email ||
                                    "-"
                                )}
                            </p>

                        </div>

                        <span
                            class="support-chat-status">
                            ${escapeHTML(status)}
                        </span>

                    </div>


                    <!-- ORDER / ISSUE -->

                    <div class="support-chat-details">

                        <span>
                            📦 Order:
                            ${
                                request.order_id
                                    ? "#" +
                                      request.order_id
                                    : "General Issue"
                            }
                        </span>

                        <span>
                            ⚠️
                            ${escapeHTML(
                                request.issue_type ||
                                "-"
                            )}
                        </span>

                        <span>
                            📝
                            ${escapeHTML(
                                request.subject ||
                                "-"
                            )}
                        </span>

                    </div>


                    <!-- CHAT -->

                    <div
                        class="support-chat-messages"
                        id="supportMessages-${request.id}"
                    >

                        <!-- CUSTOMER MESSAGE -->

                        <div class="chat-message customer-message">

                            <div class="chat-name">
                                👤 Customer
                            </div>

                            <div class="chat-bubble">

                                ${escapeHTML(
                                    request.message ||
                                    ""
                                )}

                            </div>

                            <div class="chat-time">

                                ${
                                    request.created_at
                                        ? new Date(
                                            request.created_at
                                          ).toLocaleString(
                                            "en-IN"
                                          )
                                        : ""
                                }

                            </div>

                        </div>


                        ${
                            request.admin_reply
                                ? `

                                <!-- ADMIN REPLY -->

                                <div
                                    class="chat-message admin-message"
                                >

                                    <div class="chat-name">
                                        🛡️ Admin
                                    </div>

                                    <div
                                        class="chat-bubble"
                                    >

                                        ${escapeHTML(
                                            request.admin_reply
                                        )}

                                    </div>

                                    <div class="chat-time">
                                        Admin Response
                                    </div>

                                </div>

                                `
                                : `                      
                                <div
                                    class="no-admin-reply"
                                >
                                    Waiting for admin response...
                                </div>

                                `
                        }

                    </div>


                    <!-- ADMIN RESPONSE BOX -->

                    <div class="admin-chat-reply">

                        <label>
                            💬 Admin Response
                        </label>

                        <textarea
                            id="supportReply-${request.id}"
                            rows="3"
                            placeholder="Type your response to the customer..."
                        >${escapeHTML(
                            request.admin_reply || ""
                        )}</textarea>


                        <div class="admin-chat-actions">

                            <button
                                type="button"
                                class="send-reply-btn"
                                onclick="
                                    sendAdminReply(
                                        ${request.id},
                                        this
                                    )
                                "
                            >
                                💬 Send Reply
                            </button>

                        </div>

                    </div>

                `;

                container.appendChild(card);

            }
        );

    } catch (error) {

        console.error(
            "ADMIN SUPPORT ERROR:",
            error
        );

        container.innerHTML = `

            <div class="support-empty">

                <h3>
                    ⚠️ Unable to Load Support
                </h3>

                <p>
                    ${escapeHTML(
                        error.message
                    )}
                </p>

                <button
                    type="button"
                    onclick="loadSupportRequests()"
                >
                    Try Again
                </button>

            </div>

        `;
    }
}


/* =====================================================
   SEND ADMIN REPLY
===================================================== */

/* =====================================================
   SEND ADMIN REPLY
===================================================== */

async function sendAdminReply(requestId, button) {

    const replyElement =
        document.getElementById(
            `supportReply-${requestId}`
        );

    if (!replyElement) {

        alert("Reply box not found.");
        return;
    }

    const adminReply =
        replyElement.value.trim();

    if (!adminReply) {

        alert("Please type a response.");
        replyElement.focus();
        return;
    }

    try {

        button.disabled = true;
        button.textContent = "Sending...";

        /*
         * Get the current support ticket.
         * We do NOT change the existing status.
         */

        const supportResponse =
            await fetch(
                "/api/admin/support",
                {
                    method: "GET",
                    credentials: "include",
                    headers: {
                        "Accept": "application/json"
                    }
                }
            );

        const supportData =
            await supportResponse.json();

        if (!supportResponse.ok) {

            throw new Error(
                supportData.message ||
                "Unable to load support ticket."
            );
        }

        const requests =
            Array.isArray(supportData)
                ? supportData
                : Array.isArray(supportData.requests)
                    ? supportData.requests
                    : [];

        const request =
            requests.find(
                function(item) {

                    return Number(item.id) ===
                           Number(requestId);

                }
            );

        if (!request) {

            throw new Error(
                "Support ticket not found."
            );
        }

        /*
         * Keep the existing status.
         *
         * Example:
         * Open
         * In Progress
         * Resolved
         * Closed
         */

        const currentStatus =
            request.status || "Open";


        /* ==========================================
           SEND ADMIN REPLY
        ========================================== */

        const response =
            await fetch(
                `/api/admin/support/${requestId}`,
                {
                    method: "PUT",

                    credentials: "include",

                    headers: {
                        "Content-Type":
                            "application/json",

                        "Accept":
                            "application/json"
                    },

                    body:
                        JSON.stringify({

                            status:
                                currentStatus,

                            adminReply:
                                adminReply

                        })
                }
            );


        const data =
            await response.json();


        if (!response.ok || !data.success) {

            throw new Error(
                data.message ||
                "Unable to send admin reply."
            );
        }


        /* ==========================================
           SUCCESS
        ========================================== */

        alert(
            "Admin reply sent successfully!"
        );


        /*
         * Clear the reply box
         */

        replyElement.value = "";


        /*
         * Reload support tickets
         */

        await loadSupportRequests();


    } catch (error) {

        console.error(
            "SEND ADMIN REPLY ERROR:",
            error
        );

        alert(
            error.message ||
            "Unable to send reply."
        );


    } finally {

        button.disabled = false;

        button.textContent =
            "💬 Send Reply";

    }

}
/* =====================================================
   ADMIN SIDEBAR NAVIGATION
===================================================== */

function showAdminSection(sectionName) {

    console.log(
        "Opening admin section:",
        sectionName
    );

    /* Hide all sections */

    const sections =
        document.querySelectorAll(
            ".admin-section"
        );

    sections.forEach(function(section) {

        section.classList.remove(
            "active-section"
        );

    });


    /* Show selected section */

    const selectedSection =
        document.getElementById(
            sectionName + "Section"
        );

    if (selectedSection) {

        selectedSection.classList.add(
            "active-section"
        );

    }


    /* Change sidebar active button */

    const links =
        document.querySelectorAll(
            ".side-link"
        );

    links.forEach(function(link) {

        link.classList.remove(
            "active"
        );

        if (
            link.getAttribute(
                "data-section"
            ) === sectionName
        ) {

            link.classList.add(
                "active"
            );

        }

    });


    /* Load required data */

    if (sectionName === "dashboard") {

        loadDashboard();

    }

    else if (sectionName === "customers") {

        loadUsers();

    }

    else if (sectionName === "products") {

        loadProducts();

    }

    else if (sectionName === "orders") {

        loadOrders();

    }

    else if (sectionName === "sales") {

        loadDashboard();

    }

    else if (sectionName === "support") {

        loadSupportRequests();

    }

}
/* =========================================
   ADMIN SECTION NAVIGATION
========================================= */

function showAdminSection(sectionName) {

    console.log(
        "Opening section:",
        sectionName
    );


    /* Hide all sections */

    const sections =
        document.querySelectorAll(
            ".admin-section"
        );

    sections.forEach(function(section) {

        section.classList.remove(
            "active-section"
        );

    });


    /* Find selected section */

    const selected =
        document.getElementById(
            sectionName + "Section"
        );


    if (selected) {

        selected.classList.add(
            "active-section"
        );

    }


    /* Sidebar active button */

    const links =
        document.querySelectorAll(
            ".side-link"
        );

    links.forEach(function(link) {

        link.classList.remove("active");

        if (
            link.dataset.section ===
            sectionName
        ) {

            link.classList.add("active");

        }

    });


    /* Load data */

    if (sectionName === "dashboard") {

        loadDashboard();

    }

    else if (sectionName === "customers") {

        loadUsers();

    }

    else if (sectionName === "products") {

        loadProducts();

    }

    else if (sectionName === "orders") {

        loadOrders();

    }

    else if (sectionName === "support") {

        loadSupportRequests();

    }

}
/* =========================================
   FILTER ORDERS BY STATUS
========================================= */

async function filterOrdersByStatus(
    selectedStatus
) {

    console.log(
        "Selected status:",
        selectedStatus
    );


    /* Open Orders page */

    showAdminSection("orders");


    try {

        const response =
            await fetch(
                "/api/admin/orders",
                {
                    credentials: "include"
                }
            );


        const data =
            await response.json();


        if (
            !response.ok ||
            !data.success
        ) {

            alert(
                data.message ||
                "Unable to load orders."
            );

            return;

        }


        const orders =
            Array.isArray(data.orders)
                ? data.orders
                : [];


        const filtered =
            orders.filter(
                function(order) {

                    return String(
                        order.status || ""
                    ).trim() ===
                    selectedStatus;

                }
            );


        displayOrderList(
            filtered,
            selectedStatus
        );


    } catch (error) {

        console.error(
            "Order filter error:",
            error
        );

        alert(
            "Unable to load orders."
        );

    }

}
/* =========================================
   DISPLAY FILTERED ORDERS
========================================= */

function displayOrderList(
    orders,
    status
) {

    const table =
        document.getElementById(
            "ordersTableBody"
        );


    if (!table) {

        console.error(
            "ordersTableBody not found"
        );

        return;

    }


    table.innerHTML = "";


    if (orders.length === 0) {

        table.innerHTML = `

            <tr>

                <td
                    colspan="7"
                    style="
                        text-align:center;
                        padding:30px;
                    ">

                    No ${status} orders found.

                </td>

            </tr>

        `;

        return;

    }


    orders.forEach(
        function(order) {

            const row =
                document.createElement(
                    "tr"
                );


            row.innerHTML = `

                <td>
                    #${order.id}
                </td>

                <td>
                    ${order.customer_name || "-"}
                </td>

                <td>
                    ${order.customer_email || "-"}
                </td>

                <td>
                    ₹${formatPrice(
                        order.total || 0
                    )}
                </td>

                <td>
                    ${order.payment_method || "-"}
                </td>

                <td>

                    <select
                        onchange="
                            updateOrderStatus(
                                ${order.id},
                                this.value
                            )
                        ">

                        <option
                            value="Order Placed"
                            ${order.status === "Order Placed" ? "selected" : ""}>
                            Order Placed
                        </option>

                        <option
                            value="Processing"
                            ${order.status === "Processing" ? "selected" : ""}>
                            Processing
                        </option>

                        <option
                            value="Shipped"
                            ${order.status === "Shipped" ? "selected" : ""}>
                            Shipped
                        </option>

                        <option
                            value="Out for Delivery"
                            ${order.status === "Out for Delivery" ? "selected" : ""}>
                            Out for Delivery
                        </option>

                        <option
                            value="Delivered"
                            ${order.status === "Delivered" ? "selected" : ""}>
                            Delivered
                        </option>

                        <option
                            value="Cancelled"
                            ${order.status === "Cancelled" ? "selected" : ""}>
                            Cancelled
                        </option>

                    </select>

                </td>

                <td>
                    ${formatDate(
                        order.created_at
                    )}
                </td>

            `;


            table.appendChild(row);

        }
    );

}
/* =====================================================
   CUSTOMER SUPPORT - RENDER SUPPORT REQUESTS
   FIX: renderSupportRequests is not defined
===================================================== */
 /* =====================================================
   CUSTOMER SUPPORT - TABLE VIEW
===================================================== */

function renderSupportRequests(requests) {

    const container =
        document.getElementById("supportAdminTable");

    if (!container) {
        console.error(
            "supportAdminTable not found"
        );
        return;
    }


    if (!Array.isArray(requests)) {
        requests = [];
    }


    /* =================================================
       UPDATE COUNTS
    ================================================= */

    let total = requests.length;
    let pending = 0;
    let inProgress = 0;
    let solved = 0;
    let closed = 0;


    requests.forEach(function(request) {

        const status =
            String(
                request.status || "Open"
            )
            .trim()
            .toLowerCase();


        if (
            status === "open" ||
            status === "pending"
        ) {
            pending++;
        }

        else if (
            status === "in progress" ||
            status === "processing"
        ) {
            inProgress++;
        }

        else if (
            status === "solved" ||
            status === "resolved"
        ) {
            solved++;
        }

        else if (
            status === "closed"
        ) {
            closed++;
        }

    });


    const totalElement =
        document.getElementById(
            "totalComplaints"
        );

    const pendingElement =
        document.getElementById(
            "pendingComplaints"
        );

    const progressElement =
        document.getElementById(
            "inProgressComplaints"
        );

    const solvedElement =
        document.getElementById(
            "solvedComplaints"
        );

    const closedElement =
        document.getElementById(
            "closedComplaints"
        );


    if (totalElement)
        totalElement.textContent = total;

    if (pendingElement)
        pendingElement.textContent = pending;

    if (progressElement)
        progressElement.textContent = inProgress;

    if (solvedElement)
        solvedElement.textContent = solved;

    if (closedElement)
        closedElement.textContent = closed;


    /* =================================================
       NO REQUESTS
    ================================================= */

    if (requests.length === 0) {

        container.innerHTML = `
            <div class="support-empty">
                <h3>🛟 No Support Requests</h3>
                <p>
                    There are currently no customer
                    support requests.
                </p>
            </div>
        `;

        return;
    }


    /* =================================================
       TABLE
    ================================================= */

    container.innerHTML = `

        <div class="support-table-wrapper">

            <table class="support-table">

                <thead>

                    <tr>

                        <th>Ticket ID</th>

                        <th>Customer</th>

                        <th>Order</th>

                        <th>Category</th>

                        <th>Message</th>

                        <th>Status</th>

                        <th>Created Time</th>

                    </tr>

                </thead>


                <tbody>

                    ${requests.map(function(request) {

                        const status =
                            String(
                                request.status ||
                                "Open"
                            ).trim();


                        const statusClass =
                            status
                                .toLowerCase()
                                .replace(
                                    /\s+/g,
                                    "-"
                                );


                        const createdTime =
                            request.created_at
                                ? new Date(
                                    request.created_at
                                  ).toLocaleString(
                                    "en-IN"
                                  )
                                : "-";


                        return `

                            <tr
                                class="support-table-row"
                                data-support-status="${escapeHTML(
                                    status.toLowerCase()
                                )}"
                            >

                                <!-- TICKET ID -->

                                <td>
                                    <strong>
                                        #${request.id}
                                    </strong>
                                </td>


                                <!-- CUSTOMER -->

                                <td>

                                    <div class="support-customer">

                                        <strong>
                                            ${escapeHTML(
                                                request.customer_name ||
                                                "Unknown"
                                            )}
                                        </strong>

                                        <small>
                                            ${escapeHTML(
                                                request.customer_email ||
                                                "-"
                                            )}
                                        </small>

                                    </div>

                                </td>


                                <!-- ORDER -->

                                <td>

                                    ${
                                        request.order_id
                                            ? `#${request.order_id}`
                                            : "-"
                                    }

                                </td>


                                <!-- CATEGORY -->

                                <td>

                                    <span class="support-category">

                                        ${escapeHTML(
                                            request.issue_type ||
                                            "General"
                                        )}

                                    </span>

                                </td>


                                <!-- MESSAGE -->

                                <td>

                                    <div
                                        class="support-message-cell"
                                        title="${escapeHTML(
                                            request.message ||
                                            ""
                                        )}"
                                    >

                                        ${escapeHTML(
                                            request.message ||
                                            "-"
                                        )}

                                    </div>

                                </td>


                                <!-- STATUS -->
                         <td>

    <select
        class="support-status-select ${statusClass}"
        id="supportStatus-${request.id}"
        onchange="updateSupportStatus(${request.id}, this)"
    >

        <option
            value="Open"
            ${status === "Open" ? "selected" : ""}
        >
            Open
        </option>

        <option
            value="In Progress"
            ${status === "In Progress" ? "selected" : ""}
        >
            In Progress
        </option>

        <option
            value="Resolved"
            ${status === "Resolved" ? "selected" : ""}
        >
            Resolved
        </option>

        <option
            value="Closed"
            ${status === "Closed" ? "selected" : ""}
        >
            Closed
        </option>

    </select>

</td>
                            

                                <!-- CREATED -->

                                <td>

                                    <span class="support-created">

                                        ${createdTime}

                                    </span>

                                </td>
  <td class="support-action-cell">
    <button
        type="button"
        class="support-view-btn"
        onclick="openSupportChat(${Number(request.id)})"
    >
        👁 View
    </button>

</td> 

                            </tr>

                        `;

                    }).join("")}

                </tbody>

            </table>

        </div>

    `;

}

    /* =================================================
       CLEAR OLD REQUESTS
    ================================================= */

    container.innerHTML = "";


    /* =================================================
       RENDER EVERY SUPPORT REQUEST
    ================================================= */
requests.forEach(function (request) {

    const card =
        document.createElement("div");


    card.className =
        "support-admin-card";


    card.dataset.supportStatus =
        String(
            request.status || "Open"
        )
        .trim()
        .toLowerCase();

        card.innerHTML = `

            <div class="support-card-header">

                <h3>
                    🛟 Support Ticket #${request.id}
                </h3>

                <span class="support-status">
                    ${escapeHTML(status)}
                </span>

            </div>


            <div class="support-card-body">

                <p>
                    <strong>Customer:</strong>
                    ${escapeHTML(
                        request.customer_name ||
                        "Unknown"
                    )}
                </p>


                <p>
                    <strong>Email:</strong>
                    ${escapeHTML(
                        request.customer_email ||
                        "-"
                    )}
                </p>


                <p>
                    <strong>Order:</strong>

                    ${
                        request.order_id
                            ? "#" + request.order_id
                            : "General Issue"
                    }

                </p>


                <p>
                    <strong>Issue Type:</strong>
                    ${escapeHTML(
                        request.issue_type ||
                        "-"
                    )}
                </p>


                <p>
                    <strong>Subject:</strong>
                    ${escapeHTML(
                        request.subject ||
                        "-"
                    )}
                </p>


                <div class="support-message">

                    <strong>
                        Customer Message:
                    </strong>

                    <p>
                        ${escapeHTML(
                            request.message ||
                            ""
                        )}
                    </p>

                </div>


                <p>
                    <strong>Created:</strong>

                    ${
                        request.created_at
                            ? new Date(
                                request.created_at
                              ).toLocaleString(
                                "en-IN"
                              )
                            : "-"
                    }

                </p>


                <hr>


                <!-- STATUS -->

                <label>
                    <strong>
                        Update Status
                    </strong>
                </label>

                <select
                    id="supportStatus-${request.id}"
                    class="support-status-select"
                >

                    <option
                        value="Open"
                        ${
                            status === "Open"
                                ? "selected"
                                : ""
                        }
                    >
                        Open
                    </option>

                    <option
                        value="In Progress"
                        ${
                            status === "In Progress"
                                ? "selected"
                                : ""
                        }
                    >
                        In Progress
                    </option>

                    <option
                        value="Resolved"
                        ${
                            status === "Resolved"
                                ? "selected"
                                : ""
                        }
                    >
                        Resolved
                    </option>

                    <option
                        value="Closed"
                        ${
                            status === "Closed"
                                ? "selected"
                                : ""
                        }
                    >
                        Closed
                    </option>

                </select>


                <!-- ADMIN REPLY -->

                <label>
                    <strong>
                        Admin Reply
                    </strong>
                </label>

                <textarea
                    id="supportReply-${request.id}"
                    class="support-reply"
                    rows="4"
                    placeholder="Write reply to customer..."
                >${escapeHTML(
                    request.admin_reply || ""
                )}</textarea>


                <!-- UPDATE BUTTON -->

                <button
                    type="button"
                    class="support-update-btn"
                    onclick="
                        updateSupportRequest(
                            ${request.id},
                            this
                        )
                    "
                >
                    💬 Update Support Request
                </button>

            </div>

        `;


        container.appendChild(card);

    });



/* =====================================================
   UPDATE SUPPORT REQUEST
===================================================== */

async function updateSupportRequest(
    requestId,
    button
) {

    const statusElement =
        document.getElementById(
            "supportStatus-" +
            requestId
        );

    const replyElement =
        document.getElementById(
            "supportReply-" +
            requestId
        );


    if (!statusElement) {

        alert(
            "Support status field not found."
        );

        return;
    }


    try {

        button.disabled = true;

        button.textContent =
            "Updating...";


        const response =
            await fetch(
                `/api/admin/support/${requestId}`,
                {
                    method: "PUT",

                    credentials: "include",

                    headers: {
                        "Content-Type":
                            "application/json",

                        "Accept":
                            "application/json"
                    },

                    body:
                        JSON.stringify({

                            status:
                                statusElement.value,

                            adminReply:
                                replyElement
                                    ? replyElement.value.trim()
                                    : ""

                        })
                }
            );


        const data =
            await response.json();


        if (
            !response.ok ||
            !data.success
        ) {

            throw new Error(
                data.message ||
                "Unable to update support request."
            );

        }


        alert(
            "Support request updated successfully!"
        );


        /* Reload support data */

        await loadSupportRequests();


    }
    catch (error) {

        console.error(
            "UPDATE SUPPORT ERROR:",
            error
        );

        alert(
            error.message ||
            "Unable to update support request."
        );

    }
    finally {

        button.disabled = false;

        button.textContent =
            "💬 Update Support Request";

    }

}
/* =====================================================
   SUPPORT CARD FILTER
===================================================== */
   /* =====================================================
   SUPPORT TABLE FILTER
===================================================== */

function filterSupportRequests(filter) {

    const rows =
        document.querySelectorAll(
            "#supportAdminTable .support-table-row"
        );


    const filterCards =
        document.querySelectorAll(
            ".support-filter-card"
        );


    /* Remove active */

    filterCards.forEach(function(card) {

        card.classList.remove("active");

    });


    /* Activate selected card */

    const cardIndex = {

        all: 0,

        pending: 1,

        "in progress": 2,

        solved: 3,

        closed: 4

    };


    if (
        filterCards[cardIndex[filter]]
    ) {

        filterCards[
            cardIndex[filter]
        ].classList.add("active");

    }


    /* =================================================
       FILTER TABLE ROWS
    ================================================= */

    rows.forEach(function(row) {

        const status =
            String(
                row.dataset.supportStatus ||
                ""
            )
            .trim()
            .toLowerCase();


        let show = false;


        /* TOTAL */

        if (filter === "all") {

            show = true;

        }


        /* PENDING */

        else if (filter === "pending") {

            show =
                status === "open" ||
                status === "pending";

        }


        /* IN PROGRESS */

        else if (
            filter === "in progress"
        ) {

            show =
                status === "in progress" ||
                status === "processing";

        }


        /* SOLVED */

        else if (filter === "solved") {

            show =
                status === "solved" ||
                status === "resolved";

        }


        /* CLOSED */

        else if (filter === "closed") {

            show =
                status === "closed";

        }


        row.style.display =
            show ? "" : "none";

    });

}
    /* Scroll to tickets */

    const supportTable =
        document.getElementById(
            "supportAdminTable"
        );

    if (supportTable) {

        supportTable.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

    }
    /* =====================================================
   UPDATE SUPPORT STATUS DIRECTLY FROM TABLE
===================================================== */
/* =====================================================
   UPDATE SUPPORT STATUS DIRECTLY FROM TABLE
===================================================== */

async function updateSupportStatus(
    requestId,
    selectElement
) {

    const newStatus =
        selectElement.value;

    const oldStatus =
        selectElement.dataset.oldStatus ||
        newStatus;

    try {

        selectElement.disabled = true;

        const response =
            await fetch(
                `/api/admin/support/${requestId}`,
                {
                    method: "PUT",

                    credentials: "include",

                    headers: {
                        "Content-Type":
                            "application/json",

                        "Accept":
                            "application/json"
                    },

                    body: JSON.stringify({

                        status: newStatus,

                        adminReply: ""

                    })
                }
            );

        const data =
            await response.json();

        if (
            !response.ok ||
            !data.success
        ) {

            throw new Error(
                data.message ||
                "Unable to update support status."
            );

        }

        selectElement.dataset.oldStatus =
            newStatus;

        selectElement.className =
            "support-status-select " +
            getSupportStatusClass(
                newStatus
            );

        /*
           Reload support table
           and counters
        */

        await loadSupportRequests();

        /* =========================================
           UPDATE SUPPORT PIE IMMEDIATELY
        ========================================= */

        updateSupportPieChart();

    }
    catch (error) {

        console.error(
            "SUPPORT STATUS UPDATE ERROR:",
            error
        );

        selectElement.value =
            oldStatus;

        alert(
            error.message ||
            "Unable to update support status."
        );

    }
    finally {

        selectElement.disabled =
            false;

    }

}
/* =====================================================
   SUPPORT STATUS CLASS
===================================================== */

function getSupportStatusClass(status) {

    status = String(status || "").trim();

    switch (status) {

        case "In Progress":
            return "progress";

        case "Resolved":
            return "resolved";

        case "Closed":
            return "closed";

        case "Open":
        default:
            return "open";
    }
}
/* =====================================================
   FINAL SUPPORT TABLE RENDERER
   FIX: VIEW BUTTON
===================================================== */

window.renderSupportRequests = function (requests) {

    const container = document.getElementById("supportAdminTable");

    if (!container) {
        console.error("supportAdminTable not found");
        return;
    }

    if (!Array.isArray(requests)) {
        requests = [];
    }

    /* COUNTS */
    let pending = 0;
    let inProgress = 0;
    let solved = 0;
    let closed = 0;

    requests.forEach(function (request) {

        const status = String(
            request.status || "Open"
        ).trim().toLowerCase();

        if (status === "open" || status === "pending") {
            pending++;
        }

        else if (
            status === "in progress" ||
            status === "processing"
        ) {
            inProgress++;
        }

        else if (
            status === "resolved" ||
            status === "solved"
        ) {
            solved++;
        }

        else if (status === "closed") {
            closed++;
        }
    });

    const totalElement =
        document.getElementById("totalComplaints");

    const pendingElement =
        document.getElementById("pendingComplaints");

    const progressElement =
        document.getElementById("inProgressComplaints");

    const solvedElement =
        document.getElementById("solvedComplaints");

    const closedElement =
        document.getElementById("closedComplaints");

    if (totalElement)
        totalElement.textContent = requests.length;

    if (pendingElement)
        pendingElement.textContent = pending;

    if (progressElement)
        progressElement.textContent = inProgress;

    if (solvedElement)
        solvedElement.textContent = solved;

    if (closedElement)
        closedElement.textContent = closed;


    /* NO REQUESTS */

    if (requests.length === 0) {

        container.innerHTML = `
            <div class="support-empty">
                <h3>🛟 No Support Requests</h3>
                <p>
                    There are currently no customer
                    support requests.
                </p>
            </div>
        `;

        return;
    }


    /* TABLE */

    container.innerHTML = `
        <div class="support-table-wrapper">

            <table class="support-table">

                <thead>
                    <tr>
                        <th>Ticket ID</th>
                        <th>Customer</th>
                        <th>Order</th>
                        <th>Category</th>
                        <th>Message</th>
                        <th>Status</th>
                        <th>Created Time</th>
                        <th>Action</th>
                    </tr>
                </thead>

                <tbody>

                    ${requests.map(function (request) {

                        const status =
                            String(
                                request.status || "Open"
                            ).trim();

                        const statusClass =
                            status
                                .toLowerCase()
                                .replace(/\s+/g, "-");

                        const createdTime =
                            request.created_at
                                ? new Date(
                                    request.created_at
                                ).toLocaleString("en-IN")
                                : "-";

                        return `
                            <tr class="support-table-row">

                                <!-- TICKET -->

                                <td>
                                    <strong>
                                        #${request.id}
                                    </strong>
                                </td>


                                <!-- CUSTOMER -->

                                <td>
                                    <div class="support-customer">

                                        <strong>
                                            ${escapeHTML(
                                                request.customer_name ||
                                                "Unknown"
                                            )}
                                        </strong>

                                        <small>
                                            ${escapeHTML(
                                                request.customer_email ||
                                                "-"
                                            )}
                                        </small>

                                    </div>
                                </td>


                                <!-- ORDER -->

                                <td>
                                    ${
                                        request.order_id
                                            ? `#${request.order_id}`
                                            : "-"
                                    }
                                </td>


                                <!-- CATEGORY -->

                                <td>
                                    <span class="support-category">
                                        ${escapeHTML(
                                            request.issue_type ||
                                            "General"
                                        )}
                                    </span>
                                </td>


                                <!-- MESSAGE -->

                                <td>
                                    <div
                                        class="support-message-cell"
                                        title="${escapeHTML(
                                            request.message || ""
                                        )}"
                                    >
                                        ${escapeHTML(
                                            request.message || "-"
                                        )}
                                    </div>
                                </td>


                                <!-- STATUS -->

                                <td>

                                    <select
                                        class="support-status-select ${statusClass}"
                                        id="supportStatus-${request.id}"
                                        onchange="updateSupportStatus(${request.id}, this)"
                                    >

                                        <option
                                            value="Open"
                                            ${status === "Open" ? "selected" : ""}
                                        >
                                            Open
                                        </option>

                                        <option
                                            value="In Progress"
                                            ${status === "In Progress" ? "selected" : ""}
                                        >
                                            In Progress
                                        </option>

                                        <option
                                            value="Resolved"
                                            ${status === "Resolved" ? "selected" : ""}
                                        >
                                            Resolved
                                        </option>

                                        <option
                                            value="Closed"
                                            ${status === "Closed" ? "selected" : ""}
                                        >
                                            Closed
                                        </option>

                                    </select>

                                </td>


                                <!-- CREATED -->

                                <td>
                                    <span class="support-created">
                                        ${createdTime}
                                    </span>
                                </td>


                                <!-- VIEW BUTTON -->

                                <td>

                                    <button
                                        type="button"
                                        class="support-view-btn"
                                        onclick="openSupportChat(${Number(request.id)})"
                                    >
                                        👁 View
                                    </button>

                                </td>

                            </tr>
                        `;

                    }).join("")}

                </tbody>

            </table>

        </div>
    `;
};
/* =====================================================
   CUSTOMER SUPPORT EXPORT SYSTEM
   PRINT + CSV + PDF
===================================================== */


/* =====================================================
   GET SUPPORT TABLE
===================================================== */

function getSupportTable() {

    const container =
        document.getElementById(
            "supportAdminTable"
        );

    if (!container) {

        alert(
            "Customer Support table was not found."
        );

        return null;
    }


    const table =
        container.querySelector("table");

    if (!table) {

        alert(
            "Customer Support table is not loaded yet."
        );

        return null;
    }


    return table;
}


/* =====================================================
   GET CLEAN SUPPORT TABLE DATA
===================================================== */

function getSupportExportData() {

    const table =
        getSupportTable();

    if (!table) {

        return null;
    }


    const headers = [];

    const rows = [];


    /* ---------------------------------------------
       HEADERS
    --------------------------------------------- */

    const headerCells =
        table.querySelectorAll(
            "thead th"
        );


    headerCells.forEach(
        function (cell, index) {

            /*
             * Last column is View button.
             * Do not export it.
             */

            if (
                index ===
                headerCells.length - 1
            ) {

                return;
            }


            headers.push(
                cell.innerText
                    .trim()
            );

        }
    );


    /* ---------------------------------------------
       BODY ROWS
    --------------------------------------------- */

    const bodyRows =
        table.querySelectorAll(
            "tbody tr"
        );


    bodyRows.forEach(
        function (row) {

            const cells =
                row.querySelectorAll(
                    "td"
                );


            const rowData = [];


            cells.forEach(
                function (cell, index) {

                    /*
                     * Last column contains
                     * View button.
                     */

                    if (
                        index ===
                        cells.length - 1
                    ) {

                        return;
                    }


                    /*
                     * If Status contains
                     * a SELECT element,
                     * get selected value.
                     */

                    const select =
                        cell.querySelector(
                            "select"
                        );


                    if (select) {

                        rowData.push(
                            select.value
                        );

                    } else {

                        rowData.push(
                            cell.innerText
                                .trim()
                                .replace(
                                    /\s+/g,
                                    " "
                                )
                        );

                    }

                }
            );


            if (
                rowData.length > 0
            ) {

                rows.push(
                    rowData
                );

            }

        }
    );


    return {
        headers: headers,
        rows: rows
    };
}


/* =====================================================
   FILE DATE / TIME
===================================================== */

function getSupportExportFileDate() {

    const now =
        new Date();


    const day =
        String(
            now.getDate()
        ).padStart(
            2,
            "0"
        );


    const month =
        String(
            now.getMonth() + 1
        ).padStart(
            2,
            "0"
        );


    const year =
        now.getFullYear();


    const hours =
        String(
            now.getHours()
        ).padStart(
            2,
            "0"
        );


    const minutes =
        String(
            now.getMinutes()
        ).padStart(
            2,
            "0"
        );


    const seconds =
        String(
            now.getSeconds()
        ).padStart(
            2,
            "0"
        );


    return (
        day +
        "-" +
        month +
        "-" +
        year +
        "_" +
        hours +
        "-" +
        minutes +
        "-" +
        seconds
    );
}


/* =====================================================
   CSV ESCAPE
===================================================== */

function escapeSupportCSV(value) {

    value =
        String(
            value ?? ""
        );


    return (
        '"' +
        value
            .replace(
                /"/g,
                '""'
            ) +
        '"'
    );
}


/* =====================================================
   DOWNLOAD CSV
===================================================== */

function downloadSupportCSV() {

    console.log(
        "CSV EXPORT STARTED"
    );


    const data =
        getSupportExportData();


    if (!data) {

        return;
    }


    if (
        data.rows.length === 0
    ) {

        alert(
            "There are no support records to download."
        );

        return;
    }


    const csvRows = [];


    /* HEADER */

    csvRows.push(
        data.headers
            .map(
                escapeSupportCSV
            )
            .join(",")
    );


    /* DATA */

    data.rows.forEach(
        function (row) {

            csvRows.push(
                row
                    .map(
                        escapeSupportCSV
                    )
                    .join(",")
            );

        }
    );


    const csvContent =
        "\uFEFF" +
        csvRows.join(
            "\r\n"
        );


    const blob =
        new Blob(
            [csvContent],
            {
                type:
                    "text/csv;charset=utf-8;"
            }
        );


    const url =
        URL.createObjectURL(
            blob
        );


    const link =
        document.createElement(
            "a"
        );


    const filename =
        "ElectroMart_Customer_Support_" +
        getSupportExportFileDate() +
        ".csv";


    link.href = url;

    link.download = filename;

    link.style.display = "none";


    document.body.appendChild(
        link
    );


    link.click();


    document.body.removeChild(
        link
    );


    setTimeout(
        function () {

            URL.revokeObjectURL(
                url
            );

        },
        1000
    );


    console.log(
        "CSV DOWNLOAD:",
        filename
    );
}


/* =====================================================
   CREATE CLEAN TABLE FOR PRINT
===================================================== */

function createSupportPrintTable() {

    const data =
        getSupportExportData();


    if (!data) {

        return null;
    }


    const table =
        document.createElement(
            "table"
        );


    table.className =
        "support-print-table";


    /* ---------------------------------------------
       HEADER
    --------------------------------------------- */

    const thead =
        document.createElement(
            "thead"
        );


    const headerRow =
        document.createElement(
            "tr"
        );


    data.headers.forEach(
        function (header) {

            const th =
                document.createElement(
                    "th"
                );


            th.textContent =
                header;


            headerRow.appendChild(
                th
            );

        }
    );


    thead.appendChild(
        headerRow
    );


    table.appendChild(
        thead
    );


    /* ---------------------------------------------
       BODY
    --------------------------------------------- */

    const tbody =
        document.createElement(
            "tbody"
        );


    data.rows.forEach(
        function (row) {

            const tr =
                document.createElement(
                    "tr"
                );


            row.forEach(
                function (value) {

                    const td =
                        document.createElement(
                            "td"
                        );


                    td.textContent =
                        value;


                    tr.appendChild(
                        td
                    );

                }
            );


            tbody.appendChild(
                tr
            );

        }
    );


    table.appendChild(
        tbody
    );


    return table;
}


/* =====================================================
   PRINT SUPPORT TABLE
===================================================== */

function printSupportTable() {

    console.log(
        "PRINT SUPPORT TABLE"
    );


    const table =
        createSupportPrintTable();


    if (!table) {

        return;
    }


    const printWindow =
        window.open(
            "",
            "_blank",
            "width=1200,height=800"
        );


    if (!printWindow) {

        alert(
            "Please allow pop-ups for this website."
        );

        return;
    }


    printWindow.document.open();


    printWindow.document.write(`

        <!DOCTYPE html>

        <html>

        <head>

            <title>
                ElectroMart Customer Support
            </title>

            <style>

                @page {

                    size: A4 landscape;

                    margin: 10mm;

                }


                * {

                    box-sizing: border-box;

                }


                body {

                    margin: 0;

                    padding: 20px;

                    font-family:
                        Arial,
                        sans-serif;

                    background: #ffffff;

                    color: #000000;

                }


                h1 {

                    text-align: center;

                    font-size: 20px;

                    margin: 0 0 15px 0;

                }


                table {

                    width: 100%;

                    border-collapse: collapse;

                    font-size: 11px;

                }


                th,
                td {

                    border: 1px solid #333;

                    padding: 7px;

                    text-align: left;

                    vertical-align: top;

                }


                th {

                    font-weight: bold;

                    background: #f2f2f2;

                }


                tr {

                    page-break-inside: avoid;

                }

            </style>

        </head>


        <body>

            <h1>
                ElectroMart Customer Support
            </h1>

            ${table.outerHTML}

        </body>

        </html>

    `);


    printWindow.document.close();


    printWindow.focus();


    setTimeout(
        function () {

            printWindow.print();

            setTimeout(
                function () {

                    printWindow.close();

                },
                500
            );

        },
        500
    );
}


/* =====================================================
   DOWNLOAD PDF
===================================================== */

function downloadSupportPDF() {

    console.log(
        "PDF EXPORT STARTED"
    );


    const data =
        getSupportExportData();


    if (!data) {

        return;
    }


    if (
        data.rows.length === 0
    ) {

        alert(
            "There are no support records to download."
        );

        return;
    }


    /* ---------------------------------------------
       CHECK PDF LIBRARY
    --------------------------------------------- */

    if (
        !window.jspdf ||
        !window.jspdf.jsPDF
    ) {

        alert(
            "PDF library is not loaded. Please check your internet connection and refresh the page."
        );

        return;
    }


    const {
        jsPDF
    } = window.jspdf;


    const doc =
        new jsPDF(
            {
                orientation:
                    "landscape",

                unit:
                    "mm",

                format:
                    "a4"
            }
        );


    /* ---------------------------------------------
       TITLE
    --------------------------------------------- */

    doc.setFontSize(
        16
    );


    doc.text(
        "ElectroMart Customer Support",
        148,
        12,
        {
            align:
                "center"
        }
    );


    /* ---------------------------------------------
       PDF TABLE
    --------------------------------------------- */

    doc.autoTable({

        head: [
            data.headers
        ],

        body:
            data.rows,

        startY:
            18,

        theme:
            "grid",

        styles: {

            fontSize:
                7,

            cellPadding:
                2,

            overflow:
                "linebreak",

            valign:
                "top"

        },

        headStyles: {

            fontSize:
                7,

            fontStyle:
                "bold"

        },

        columnStyles: {

            0: {
                cellWidth:
                    16
            },

            1: {
                cellWidth:
                    35
            },

            2: {
                cellWidth:
                    18
            },

            3: {
                cellWidth:
                    28
            },

            4: {
                cellWidth:
                    80
            },

            5: {
                cellWidth:
                    25
            },

            6: {
                cellWidth:
                    35
            }

        },

        margin: {

            left:
                8,

            right:
                8

        }

    });


    /* ---------------------------------------------
       FILE NAME
    --------------------------------------------- */

    const filename =
        "ElectroMart_Customer_Support_" +
        getSupportExportFileDate() +
        ".pdf";


    /* ---------------------------------------------
       DOWNLOAD
    --------------------------------------------- */

    doc.save(
        filename
    );


    console.log(
        "PDF DOWNLOAD:",
        filename
    );
}
/* =====================================================
   ORDER STATUS CHART
===================================================== */

function loadOrderStatusChart() {

    console.log("Loading Order Status Chart...");


    /*
       CHANGE THESE VALUES FROM YOUR DATABASE/API
       LATER.

       CURRENT EXAMPLE:

       Order Placed     = 26
       Processing       = 2
       Shipped          = 4
       Out Delivery     = 2
       Delivered        = 11
       Cancelled        = 3
    */

    const orderStatus = {

        placed: 26,

        processing: 2,

        shipped: 4,

        outDelivery: 2,

        delivered: 11,

        cancelled: 3

    };


    /* =================================================
       TOTAL
    ================================================= */

    const total =

        orderStatus.placed +

        orderStatus.processing +

        orderStatus.shipped +

        orderStatus.outDelivery +

        orderStatus.delivered +

        orderStatus.cancelled;


    /* =================================================
       SHOW TOTAL
    ================================================= */

    const totalElement =
        document.getElementById("donutTotal");


    if (totalElement) {

        totalElement.textContent = total;

    }


    /* =================================================
       UPDATE COUNTS
    ================================================= */

    updateElement(
        "placedCount",
        orderStatus.placed
    );

    updateElement(
        "processingCount",
        orderStatus.processing
    );

    updateElement(
        "shippedCount",
        orderStatus.shipped
    );

    updateElement(
        "outDeliveryCount",
        orderStatus.outDelivery
    );

    updateElement(
        "deliveredCount",
        orderStatus.delivered
    );

    updateElement(
        "cancelledCount",
        orderStatus.cancelled
    );


    /* =================================================
       CALCULATE PERCENTAGES
    ================================================= */

    const percentages = {

        placed:
            calculatePercentage(
                orderStatus.placed,
                total
            ),

        processing:
            calculatePercentage(
                orderStatus.processing,
                total
            ),

        shipped:
            calculatePercentage(
                orderStatus.shipped,
                total
            ),

        outDelivery:
            calculatePercentage(
                orderStatus.outDelivery,
                total
            ),

        delivered:
            calculatePercentage(
                orderStatus.delivered,
                total
            ),

        cancelled:
            calculatePercentage(
                orderStatus.cancelled,
                total
            )

    };


    /* =================================================
       CALCULATE DONUT ANGLES
    ================================================= */

    const placedAngle =
        percentages.placed * 3.6;

    const processingAngle =
        percentages.processing * 3.6;

    const shippedAngle =
        percentages.shipped * 3.6;

    const outDeliveryAngle =
        percentages.outDelivery * 3.6;

    const deliveredAngle =
        percentages.delivered * 3.6;


    const donut =
        document.getElementById(
            "donutChart"
        );


    if (donut) {

        donut.style.background = `conic-gradient(

            #3b82f6
            0deg
            ${placedAngle}deg,

            #f59e0b
            ${placedAngle}deg
            ${placedAngle + processingAngle}deg,

            #10b981
            ${placedAngle + processingAngle}deg
            ${placedAngle + processingAngle + shippedAngle}deg,

            #06b6d4
            ${placedAngle + processingAngle + shippedAngle}deg
            ${placedAngle + processingAngle + shippedAngle + outDeliveryAngle}deg,

            #8b5cf6
            ${placedAngle + processingAngle + shippedAngle + outDeliveryAngle}deg
            ${placedAngle + processingAngle + shippedAngle + outDeliveryAngle + deliveredAngle}deg,

            #ef4444
            ${placedAngle + processingAngle + shippedAngle + outDeliveryAngle + deliveredAngle}deg
            360deg

        )`;

    }


    /* =================================================
       SHOW PERCENTAGES
    ================================================= */

    createPercentageLabels(percentages);

}


/* =====================================================
   UPDATE HTML ELEMENT
===================================================== */

function updateElement(id, value) {

    const element =
        document.getElementById(id);

    if (element) {

        element.textContent = value;

    }

}


/* =====================================================
   CALCULATE %
===================================================== */

function calculatePercentage(value, total) {

    if (!total) {

        return 0;

    }

    return Number(
        ((value / total) * 100).toFixed(1)
    );

}


/* =====================================================
   CREATE % LABELS
===================================================== */
/* =====================================================
   CREATE ORDER PERCENTAGES AROUND DONUT
===================================================== */

function createPercentageLabels(percentages) {

    const container =
        document.getElementById("orderPercentages");

    if (!container) {
        console.warn("orderPercentages container not found");
        return;
    }

    container.innerHTML = "";

    const labels = [

        /* BLUE - TOP */
        {
            value: percentages.placed,
            className: "blue",
            top: "2%",
            left: "50%"
        },

        /* YELLOW - TOP RIGHT */
        {
            value: percentages.processing,
            className: "yellow",
            top: "27%",
            left: "94%"
        },

        /* GREEN - RIGHT / BOTTOM */
        {
            value: percentages.shipped,
            className: "green",
            top: "72%",
            left: "94%"
        },

        /* CYAN - BOTTOM */
        {
            value: percentages.outDelivery,
            className: "cyan",
            top: "98%",
            left: "50%"
        },

        /* PURPLE - LEFT / BOTTOM */
        {
            value: percentages.delivered,
            className: "purple",
            top: "72%",
            left: "6%"
        },

        /* RED - LEFT / TOP */
        {
            value: percentages.cancelled,
            className: "red",
            top: "27%",
            left: "6%"
        }

    ];

    labels.forEach(function(label) {

        const percentage =
            document.createElement("div");

        percentage.className =
            "chart-percentage " +
            label.className;

        percentage.textContent =
            Number(label.value).toFixed(1) + "%";

        percentage.style.position = "absolute";
        percentage.style.top = label.top;
        percentage.style.left = label.left;

        container.appendChild(percentage);

    });

}


/* =====================================================
   LOAD WHEN ADMIN PANEL OPENS
===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    function() {

      

    }
);
/* =====================================================
   CUSTOMER SUPPORT PIE CHART
===================================================== */
function updateSupportPieChart() {

    const totalElement =
        document.getElementById("totalComplaints");

    const pendingElement =
        document.getElementById("pendingComplaints");

    const progressElement =
        document.getElementById("inProgressComplaints");

    const solvedElement =
        document.getElementById("solvedComplaints");

    const closedElement =
        document.getElementById("closedComplaints");

    const pie =
        document.getElementById("supportPieChart");

    const pieTotal =
        document.getElementById("supportPieTotal");

    const labels =
        document.getElementById("supportPieLabels");

    if (
        !totalElement ||
        !pendingElement ||
        !progressElement ||
        !solvedElement ||
        !closedElement ||
        !pie ||
        !pieTotal ||
        !labels
    ) {
        console.log("Support pie chart elements not found.");
        return;
    }

    const total =
        Number(totalElement.textContent) || 0;

    const pending =
        Number(pendingElement.textContent) || 0;

    const progress =
        Number(progressElement.textContent) || 0;

    const solved =
        Number(solvedElement.textContent) || 0;

    const closed =
        Number(closedElement.textContent) || 0;


    /* TOTAL IN CENTER */

    pieTotal.textContent = total;


    if (total <= 0) {

        pie.style.background = "#e5e7eb";

        labels.innerHTML = `
            <div class="support-pie-label">
                No support tickets
            </div>
        `;

        return;
    }


    /* ===============================
       CALCULATE PERCENTAGES
    =============================== */

    const pendingPercent =
        (pending / total) * 100;

    const progressPercent =
        (progress / total) * 100;

    const solvedPercent =
        (solved / total) * 100;

    const closedPercent =
        (closed / total) * 100;


    /* ===============================
       CALCULATE DEGREES
    =============================== */

    const pendingDeg =
        pendingPercent * 3.6;

    const progressDeg =
        progressPercent * 3.6;

    const solvedDeg =
        solvedPercent * 3.6;


    const pendingEnd =
        pendingDeg;

    const progressEnd =
        pendingEnd + progressDeg;

    const solvedEnd =
        progressEnd + solvedDeg;


    /* ===============================
       DONUT COLORS
    =============================== */

    pie.style.background = `
        conic-gradient(
            #f59e0b 0deg ${pendingEnd}deg,
            #2563eb ${pendingEnd}deg ${progressEnd}deg,
            #16a34a ${progressEnd}deg ${solvedEnd}deg,
            #ef4444 ${solvedEnd}deg 360deg
        )
    `;


    /* ===============================
       PERCENTAGES AROUND CIRCLE
    =============================== */

    pie.querySelectorAll(
        ".pie-percentage"
    ).forEach(function(item) {
        item.remove();
    });


    const percentages = [
        {
            name: "Pending",
            value: pendingPercent,
            start: 0,
            end: pendingDeg,
            color: "#f59e0b"
        },

        {
            name: "In Progress",
            value: progressPercent,
            start: pendingEnd,
            end: progressEnd,
            color: "#2563eb"
        },

        {
            name: "Solved",
            value: solvedPercent,
            start: progressEnd,
            end: solvedEnd,
            color: "#16a34a"
        },

        {
            name: "Closed",
            value: closedPercent,
            start: solvedEnd,
            end: 360,
            color: "#ef4444"
        }
    ];


    percentages.forEach(function(item) {

        if (item.value <= 0) {
            return;
        }

        const middleAngle =
            (item.start + item.end) / 2;

        const radians =
            (middleAngle - 90) *
            Math.PI / 180;

        const radius = 95;

        const x =
            50 +
            (radius / 135 * 50) *
            Math.cos(radians);

        const y =
            50 +
            (radius / 135 * 50) *
            Math.sin(radians);


        const percentage =
            document.createElement("div");

        percentage.className =
            "pie-percentage";

        percentage.textContent =
            item.value.toFixed(1) + "%";

        percentage.style.left =
            x + "%";

        percentage.style.top =
            y + "%";

        percentage.style.color =
            item.color;

        pie.appendChild(percentage);
    });


    /* ===============================
       BOTTOM LEGEND
    =============================== */

    labels.innerHTML = `

        <div class="support-pie-label">

            <div class="support-pie-label-left">

                <span
                    class="support-pie-dot pending">
                </span>

                <span class="support-pie-name">
                    Pending
                </span>

            </div>

            <strong class="support-pie-percent">
                ${pendingPercent.toFixed(1)}%
            </strong>

        </div>


        <div class="support-pie-label">

            <div class="support-pie-label-left">

                <span
                    class="support-pie-dot progress">
                </span>

                <span class="support-pie-name">
                    In Progress
                </span>

            </div>

            <strong class="support-pie-percent">
                ${progressPercent.toFixed(1)}%
            </strong>

        </div>


        <div class="support-pie-label">

            <div class="support-pie-label-left">

                <span
                    class="support-pie-dot solved">
                </span>

                <span class="support-pie-name">
                    Solved
                </span>

            </div>

            <strong class="support-pie-percent">
                ${solvedPercent.toFixed(1)}%
            </strong>

        </div>


        <div class="support-pie-label">

            <div class="support-pie-label-left">

                <span
                    class="support-pie-dot closed">
                </span>

                <span class="support-pie-name">
                    Closed
                </span>

            </div>

            <strong class="support-pie-percent">
                ${closedPercent.toFixed(1)}%
            </strong>

        </div>

    `;
}
/* =====================================================
   AUTOMATICALLY UPDATE PIE CHART
===================================================== */

function startSupportPieChart() {

    updateSupportPieChart();


    const ids = [
        "totalComplaints",
        "pendingComplaints",
        "inProgressComplaints",
        "solvedComplaints",
        "closedComplaints"
    ];


    ids.forEach(function(id) {

        const element =
            document.getElementById(id);

        if (!element) {
            return;
        }


        const observer =
            new MutationObserver(
                function() {

                    updateSupportPieChart();

                }
            );


        observer.observe(
            element,
            {
                childList: true,
                characterData: true,
                subtree: true
            }
        );

    });

}


/* =====================================================
   START AFTER PAGE LOAD
===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    function() {

        setTimeout(
            function() {

                startSupportPieChart();

            },
            500
        );

    }
);
/* =====================================================
   CLICK SUPPORT PIE CIRCLE
   SHOW SELECTED PERCENTAGE
===================================================== */

function enableSupportPieClick() {

    const pie =
        document.getElementById("supportPieChart");

    const selected =
        document.getElementById("supportPieSelected");

    if (!pie || !selected) {
        console.log(
            "Support pie click elements not found."
        );
        return;
    }

    /* Prevent duplicate event listeners */
    if (pie.dataset.clickEnabled === "true") {
        return;
    }

    pie.dataset.clickEnabled = "true";


    pie.addEventListener(
        "click",
        function(event) {

            const rect =
                pie.getBoundingClientRect();

            const centerX =
                rect.left + rect.width / 2;

            const centerY =
                rect.top + rect.height / 2;


            const x =
                event.clientX - centerX;

            const y =
                event.clientY - centerY;


            /*
                Convert mouse position
                into circle angle.
            */

            let angle =
                Math.atan2(y, x)
                * 180
                / Math.PI;

            /*
                Start from TOP of circle
                instead of RIGHT.
            */

            angle =
                angle + 90;

            if (angle < 0) {
                angle += 360;
            }


            /* =========================================
               READ CURRENT COUNTS
            ========================================= */

            const total =
                Number(
                    document.getElementById(
                        "totalComplaints"
                    )?.textContent
                ) || 0;

            const pending =
                Number(
                    document.getElementById(
                        "pendingComplaints"
                    )?.textContent
                ) || 0;

            const progress =
                Number(
                    document.getElementById(
                        "inProgressComplaints"
                    )?.textContent
                ) || 0;

            const solved =
                Number(
                    document.getElementById(
                        "solvedComplaints"
                    )?.textContent
                ) || 0;

            const closed =
                Number(
                    document.getElementById(
                        "closedComplaints"
                    )?.textContent
                ) || 0;


            if (total <= 0) {

                selected.innerHTML =
                    "No support tickets";

                return;
            }


            /* =========================================
               CALCULATE DEGREES
            ========================================= */

            const pendingDeg =
                (pending / total) * 360;

            const progressDeg =
                (progress / total) * 360;

            const solvedDeg =
                (solved / total) * 360;

            const closedDeg =
                (closed / total) * 360;


            /* =========================================
               FIND CLICKED COLOR
            ========================================= */

            let status = "";
            let value = 0;
            let percent = 0;
            let symbol = "";
            let borderColor = "";


            /* YELLOW - PENDING */

            if (
                angle >= 0 &&
                angle < pendingDeg
            ) {

                status = "Pending";
                value = pending;

                percent =
                    (pending / total) * 100;

                symbol = "🟠";
                borderColor = "#f59e0b";
            }


            /* BLUE - IN PROGRESS */

            else if (
                angle >= pendingDeg &&
                angle <
                pendingDeg + progressDeg
            ) {

                status = "In Progress";
                value = progress;

                percent =
                    (progress / total) * 100;

                symbol = "🔵";
                borderColor = "#2563eb";
            }


            /* GREEN - SOLVED */

            else if (
                angle >=
                    pendingDeg + progressDeg &&
                angle <
                    pendingDeg +
                    progressDeg +
                    solvedDeg
            ) {

                status = "Solved";
                value = solved;

                percent =
                    (solved / total) * 100;

                symbol = "🟢";
                borderColor = "#16a34a";
            }


            /* RED - CLOSED */

            else {

                status = "Closed";
                value = closed;

                percent =
                    (closed / total) * 100;

                symbol = "🔴";
                borderColor = "#ef4444";
            }


            /* =========================================
               SHOW RESULT BELOW CIRCLE
            ========================================= */

            selected.innerHTML = `
                <span class="selected-name">
                    ${symbol} ${status}
                </span>

                <span class="selected-percent">
                    ${percent.toFixed(1)}%
                </span>

                <br>

                <small>
                    ${value} ticket${value === 1 ? "" : "s"}
                    out of ${total}
                </small>
            `;


            selected.style.borderColor =
                borderColor;

            selected.classList.add(
                "active"
            );

        }
    );


    console.log(
        "Support pie click enabled."
    );
}


/* =====================================================
   START SUPPORT PIE CLICK
===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    function() {

        setTimeout(
            function() {

                enableSupportPieClick();

            },
            700
        );

    }
);
/* =====================================================
   SUPPORT TYPES BAR GRAPH
===================================================== */

function updateSupportTypesChart(requests) {

    const chart =
        document.getElementById(
            "supportTypesChart"
        );

    if (!chart) {
        return;
    }


    if (!Array.isArray(requests)) {
        requests = [];
    }


    /* =========================================
       SUPPORT TYPE COUNTS
    ========================================= */

    const counts = {

     
        "Delivery Issue": 0,

        "Payment Issue": 0,

        "Return & Refund": 0,

        "Other": 0

    };


    /* =========================================
       COUNT REQUESTS
    ========================================= */

    requests.forEach(
        function(request) {

            const type =
                String(
                    request.issue_type ||
                    request.category ||
                    ""
                )
                .trim()
                .toLowerCase();


            if (!type) {

                counts["Other"]++;

            }   
         else if (
                type.includes("delivery")
            ) {

                counts["Delivery Issue"]++;

            }

            else if (
                type.includes("payment") ||
                type.includes("refund")
            ) {

                counts["Payment Issue"]++;

            }

            else if (
                type.includes("return") ||
                type.includes("exchange")
            ) {

                counts["Return & Refund"]++;

            }

            else {

                counts["Other"]++;

            }

        }
    );


    /* =========================================
       FIND MAXIMUM
    ========================================= */

    const maxCount =
        Math.max(
            ...Object.values(counts),
            1
        );


    const axisMax =
        Math.max(
            4,
            Math.ceil(maxCount / 4) * 4
        );


    /* =========================================
       BAR COLORS
    ========================================= */

    const barClasses = {
        "Delivery Issue":
            "delivery-bar",

        "Payment Issue":
            "payment-bar",

        "Return & Refund":
            "return-bar",

        "Other":
            "other-bar"

    };


    /* =========================================
       CREATE BARS
    ========================================= */

    const rows =
        Object.entries(counts)
            .map(
                function([label, count]) {

                    const width =
                        Math.min(
                            100,
                            (count / axisMax) * 100
                        );


                    return `

                        <div class="support-type-row">

                            <div class="support-type-label">

                                ${escapeHTML(label)}

                            </div>


                            <div class="support-type-track">

                                <div
                                    class="
                                        support-type-bar
                                        ${barClasses[label]}
                                    "
                                    style="
                                        width:${width}%
                                    "
                                ></div>

                            </div>


                            <div class="support-type-count">

                                ${count}

                            </div>

                        </div>

                    `;

                }
            )
            .join("");


    /* =========================================
       AXIS VALUES
    ========================================= */

    const ticks = [

        0,

        Math.round(
            axisMax * 0.25
        ),

        Math.round(
            axisMax * 0.50
        ),

        Math.round(
            axisMax * 0.75
        ),

        axisMax

    ];


    /* =========================================
       DISPLAY GRAPH
    ========================================= */

    chart.innerHTML = `

        <div class="support-type-rows">

            ${rows}

        </div>


        <div class="support-type-axis">

            <span>${ticks[0]}</span>

            <span>${ticks[1]}</span>

            <span>${ticks[2]}</span>

            <span>${ticks[3]}</span>

            <span>${ticks[4]}</span>

        </div>

    `;
}