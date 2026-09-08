/* =====================================================
   ELECTROMART ADMIN PANEL
   ADMIN JAVASCRIPT
===================================================== */

console.log("admin.js loaded successfully");


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

        const response =
            await fetch(
                "/api/admin/dashboard",
                {
                    credentials: "include"
                }
            );

        const data =
            await response.json();

        console.log(
            "Dashboard:",
            data
        );

        if (!data.success) {

            console.error(
                data.message
            );

            return;
        }

        document.getElementById(
            "totalUsers"
        ).textContent =
            data.stats.totalUsers;

        document.getElementById(
            "totalProducts"
        ).textContent =
            data.stats.totalProducts;

        document.getElementById(
            "totalOrders"
        ).textContent =
            data.stats.totalOrders;

        document.getElementById(
            "totalSales"
        ).textContent =
            formatPrice(
                data.stats.totalSales
            );

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


        if (
            !response.ok ||
            !data.success
        ) {

            alert(
                data.message ||
                "Product could not be saved."
            );

            return;
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


        console.log(
            "Orders:",
            data
        );


        if (!data.success) {

            return;

        }


        const table =
            document.getElementById(
                "ordersTableBody"
            );


        if (!table) {
            return;
        }


        table.innerHTML = "";


        data.orders.forEach(
            function (order) {

                const row =
                    document.createElement(
                        "tr"
                    );


                row.innerHTML = `

                    <td>
                        #${order.id}
                    </td>

                    <td>
                        ${escapeHTML(
                            order.customer_name
                        )}
                    </td>

                    <td>
                        ${escapeHTML(
                            order.customer_email
                        )}
                    </td>

                    <td>
                        ₹${formatPrice(
                            order.total
                        )}
                    </td>

                    <td>
                        ${escapeHTML(
                            order.payment_method || "-"
                        )}
                    </td>

                    <td>

                        <select
                            onchange="
                                updateOrderStatus(
                                    ${order.id},
                                    this.value
                                )
                            ">

                            ${statusOptions(
                                order.status
                            )}

                        </select>

                    </td>

                    <td>
                        ${formatDate(
                            order.created_at
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
   CUSTOMER SUPPORT - CHAT STYLE ADMIN
===================================================== */

async function loadSupportRequests() {

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

        const requests =
            Array.isArray(data)
                ? data
                : Array.isArray(data.requests)
                    ? data.requests
                    : [];

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