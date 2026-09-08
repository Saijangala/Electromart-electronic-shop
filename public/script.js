/* =========================================================
   ELECTROMART - CUSTOMER SCRIPT
   ========================================================= */

let products = [];
let filteredProducts = [];
let currentCart = [];
let currentUser = null;
let currentWishlist = [];
let currentSupportRequests = [];


/* =========================================================
   PAGE LOAD
   ========================================================= */

document.addEventListener("DOMContentLoaded", async () => {
    await checkLogin();
    await loadProducts();

    if (currentUser) {
        await loadCart();
        await loadWishlist();
    } else {
        currentCart = [];
        currentWishlist = [];
        updateCartCount();
        updateWishlistCount();
    }
});


/* =========================================================
   PAGE NAVIGATION
   ========================================================= */

async function showPage(page) {

    const pages = [
        "homePage",
        "productsPage",
        "cartPage",
        "ordersPage",
        "wishlistPage",
        "supportPage"
    ];

    pages.forEach(id => {
        const element = document.getElementById(id);

        if (element) {
            element.classList.add("hidden");
        }
    });

    const selectedPage =
        document.getElementById(page + "Page");

    if (selectedPage) {
        selectedPage.classList.remove("hidden");
    }

    /* PRODUCTS */
    if (page === "products") {
        await loadProducts();
    }

    /* CART */
    if (page === "cart") {

        if (!currentUser) {
            openLogin();
            return;
        }

        await loadCart();
        displayCart();
    }

    /* ORDERS */
    if (page === "orders") {

        if (!currentUser) {
            openLogin();
            return;
        }

        await loadOrders();
    }

    /* WISHLIST */
    if (page === "wishlist") {

        if (!currentUser) {
            openLogin();
            return;
        }

        await loadWishlist();
    }

    /* SUPPORT */
    if (page === "support") {

        if (!currentUser) {

            alert(
                "Please login to use Customer Support."
            );

            openLogin();
            return;
        }

        await loadSupportOrders();
        await loadSupportRequests();
    }

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


/* =========================================================
   LOGIN CHECK
   ========================================================= */

async function checkLogin() {

    try {

        const response = await fetch(
            "/api/user",
            {
                credentials: "include"
            }
        );

        const data = await response.json();

        if (data.loggedIn && data.user) {
            currentUser = data.user;
        } else {
            currentUser = null;
        }

        updateLoginUI();

    } catch (error) {

        console.error(
            "LOGIN CHECK ERROR:",
            error
        );

        currentUser = null;

        updateLoginUI();
    }
}


/* =========================================================
   LOGIN UI
   ========================================================= */

function updateLoginUI() {

    const loginBtn =
        document.getElementById("loginBtn");

    const registerBtn =
        document.getElementById("registerBtn");

    const logoutBtn =
        document.getElementById("logoutBtn");

    if (currentUser) {

        loginBtn?.classList.add("hidden");
        registerBtn?.classList.add("hidden");
        logoutBtn?.classList.remove("hidden");

    } else {

        loginBtn?.classList.remove("hidden");
        registerBtn?.classList.remove("hidden");
        logoutBtn?.classList.add("hidden");
    }
}


/* =========================================================
   MODALS
   ========================================================= */

function openLogin() {

    closeModals();

    document
        .getElementById("loginModal")
        ?.classList.remove("hidden");

    const message =
        document.getElementById("loginMessage");

    if (message) {
        message.textContent = "";
    }
}


function openRegister() {

    closeModals();

    document
        .getElementById("registerModal")
        ?.classList.remove("hidden");

    const message =
        document.getElementById("registerMessage");

    if (message) {
        message.textContent = "";
    }
}


function closeModals() {

    [
        "loginModal",
        "registerModal",
        "checkoutModal"
    ].forEach(id => {

        document
            .getElementById(id)
            ?.classList.add("hidden");

    });
}


/* =========================================================
   LOGIN
   ========================================================= */

async function login(event) {

    event.preventDefault();

    const email =
        document
            .getElementById("loginEmail")
            .value
            .trim();

    const password =
        document
            .getElementById("loginPassword")
            .value;

    const message =
        document.getElementById("loginMessage");

    if (!email || !password) {

        message.textContent =
            "Please enter email and password.";

        message.style.color = "red";

        return;
    }

    try {

        message.textContent =
            "Logging in...";

        message.style.color = "blue";

        const response =
            await fetch(
                "/api/login",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    credentials: "include",

                    body: JSON.stringify({
                        email,
                        password
                    })
                }
            );

        const data =
            await response.json();

        if (!response.ok || !data.success) {

            message.textContent =
                data.message ||
                "Invalid email or password.";

            message.style.color = "red";

            return;
        }

        currentUser = data.user;

        updateLoginUI();

        document
            .getElementById("loginEmail")
            .value = "";

        document
            .getElementById("loginPassword")
            .value = "";

        closeModals();

        await loadCart();
        await loadWishlist();

        displayProducts(filteredProducts);

        showToast(
            "Login successful!"
        );

    } catch (error) {

        console.error(
            "LOGIN ERROR:",
            error
        );

        message.textContent =
            "Unable to connect to server.";

        message.style.color = "red";
    }
}


/* =========================================================
   REGISTER
   ========================================================= */

async function register(event) {

    event.preventDefault();

    const name =
        document
            .getElementById("registerName")
            .value
            .trim();

    const email =
        document
            .getElementById("registerEmail")
            .value
            .trim();

    const password =
        document
            .getElementById("registerPassword")
            .value;

    const confirmPassword =
        document
            .getElementById("confirmPassword")
            .value;

    const message =
        document
            .getElementById("registerMessage");

    if (!name || !email || !password) {

        message.textContent =
            "Please fill all required fields.";

        message.style.color = "red";

        return;
    }

    if (password !== confirmPassword) {

        message.textContent =
            "Passwords do not match.";

        message.style.color = "red";

        return;
    }

    if (password.length < 6) {

        message.textContent =
            "Password must contain at least 6 characters.";

        message.style.color = "red";

        return;
    }

    try {

        message.textContent =
            "Creating account...";

        message.style.color = "blue";

        const response =
            await fetch(
                "/api/register",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    credentials: "include",

                    body: JSON.stringify({
                        name,
                        email,
                        password
                    })
                }
            );

        const data =
            await response.json();

        if (!response.ok || !data.success) {

            message.textContent =
                data.message ||
                "Registration failed.";

            message.style.color = "red";

            return;
        }

        document
            .getElementById("registerName")
            .value = "";

        document
            .getElementById("registerEmail")
            .value = "";

        document
            .getElementById("registerPassword")
            .value = "";

        document
            .getElementById("confirmPassword")
            .value = "";

        closeModals();

        showToast(
            "Registration successful! Please login."
        );

        openLogin();

    } catch (error) {

        console.error(
            "REGISTER ERROR:",
            error
        );

        message.textContent =
            "Unable to connect to server.";

        message.style.color = "red";
    }
}


/* =========================================================
   LOGOUT
   ========================================================= */

async function logout() {

    try {

        const response =
            await fetch(
                "/api/logout",
                {
                    method: "POST",
                    credentials: "include"
                }
            );

        const data =
            await response.json();

        currentUser = null;
        currentCart = [];
        currentWishlist = [];

        updateLoginUI();
        updateCartCount();
        updateWishlistCount();

        showPage("home");

        showToast(
            data.message ||
            "Logout successful."
        );

    } catch (error) {

        console.error(
            "LOGOUT ERROR:",
            error
        );

        currentUser = null;
        currentCart = [];
        currentWishlist = [];

        updateLoginUI();
        updateCartCount();
        updateWishlistCount();

        showPage("home");
    }
}


/* =========================================================
   LOAD PRODUCTS
   ========================================================= */

async function loadProducts() {

    const container =
        document.getElementById(
            "productContainer"
        );

    if (!container) return;

    try {

        const response =
            await fetch(
                "/api/products",
                {
                    credentials: "include"
                }
            );

        const data =
            await response.json();

        if (!response.ok || !data.success) {

            container.innerHTML = `
                <div class="no-products">
                    <h3>Unable to load products</h3>

                    <p>
                        ${escapeHTML(
                            data.message ||
                            "Something went wrong."
                        )}
                    </p>

                    <button
                        class="primary-btn"
                        onclick="loadProducts()">
                        Try Again
                    </button>
                </div>
            `;

            return;
        }

        products =
            Array.isArray(data.products)
                ? data.products
                : [];

        filteredProducts =
            [...products];

        if (currentUser) {
            await loadCart();
            await loadWishlist();
        }

        displayProducts(
            filteredProducts
        );

    } catch (error) {

        console.error(
            "PRODUCT ERROR:",
            error
        );

        container.innerHTML = `
            <div class="no-products">

                <h3>
                    Unable to load products
                </h3>

                <p>
                    Please make sure the Node.js
                    server is running.
                </p>

                <button
                    class="primary-btn"
                    onclick="loadProducts()">
                    Try Again
                </button>

            </div>
        `;
    }
}


/* =========================================================
   DISPLAY PRODUCTS
   ========================================================= */

function displayProducts(list) {

    const container =
        document.getElementById(
            "productContainer"
        );

    if (!container) return;

    if (!list || list.length === 0) {

        container.innerHTML = `
            <div class="no-products">

                <h3>
                    No products found
                </h3>

                <p>
                    Try another search or category.
                </p>

            </div>
        `;

        return;
    }

    container.innerHTML =
        list.map(product => {

            const cartItem =
                currentCart.find(item =>
                    Number(item.product_id) ===
                    Number(product.id)
                );

            const quantity =
                cartItem
                    ? Number(cartItem.quantity)
                    : 0;

            const isWishlisted =
                currentWishlist.some(item =>
                    Number(
                        item.product_id ||
                        item.id
                    ) === Number(product.id)
                );

            let buttonHTML = "";

            if (Number(product.stock) <= 0) {

                buttonHTML = `
                    <button
                        class="add-btn"
                        disabled>
                        Out of Stock
                    </button>
                `;

            } else if (quantity > 0) {

                buttonHTML = `
                    <div class="quantity-control">

                        <button
                            class="quantity-btn"
                            onclick="
                                changeProductQuantity(
                                    ${product.id},
                                    -1
                                )
                            ">
                            −
                        </button>

                        <span
                            class="quantity-number">
                            ${quantity}
                        </span>

                        <button
                            class="quantity-btn"
                            onclick="
                                changeProductQuantity(
                                    ${product.id},
                                    1
                                )
                            ">
                            +
                        </button>

                    </div>
                `;

            } else {

                buttonHTML = `
                    <div class="product-buttons">

                        <button
                            class="add-btn"
                            onclick="
                                addProductToCart(
                                    ${product.id}
                                )
                            ">
                            🛒 Add to Cart
                        </button>

                        <button
                            class="buy-now-btn"
                            onclick="
                                buyNow(
                                    ${product.id}
                                )
                            ">
                            ⚡ Buy Now
                        </button>

                    </div>
                `;
            }

            const wishlistButton =
                isWishlisted
                    ? `
                        <button
                            class="wishlist-btn active"
                            onclick="
                                removeFromWishlist(
                                    ${product.id}
                                )
                            "
                            title="Remove from Wishlist">
                            ❤️
                        </button>
                    `
                    : `
                        <button
                            class="wishlist-btn"
                            onclick="
                                addToWishlist(
                                    ${product.id}
                                )
                            "
                            title="Add to Wishlist">
                            ♡
                        </button>
                    `;

            return `
                <div class="product-card">

                    <div class="product-wishlist">
                        ${wishlistButton}
                    </div>

                    <div class="product-image">
                        ${product.icon || "📦"}
                    </div>

                    <div class="product-info">

                        <span
                            class="product-category">
                            ${escapeHTML(
                                product.category ||
                                "Electronics"
                            )}
                        </span>

                        <h3>
                            ${escapeHTML(
                                product.name
                            )}
                        </h3>

                        <p class="product-description">
                            ${escapeHTML(
                                product.description ||
                                "Quality electronic product."
                            )}
                        </p>

                        <div class="product-bottom">

                            <div
                                class="product-price">
                                ₹${Number(
                                    product.price || 0
                                ).toLocaleString("en-IN")}
                            </div>

                            ${buttonHTML}

                        </div>

                    </div>

                </div>
            `;

        }).join("");
}


/* =========================================================
   ADD TO CART
   ========================================================= */

async function addProductToCart(productId) {

    if (!currentUser) {

        showToast(
            "Please login to add products."
        );

        openLogin();

        return;
    }

    try {

        const response =
            await fetch(
                "/api/cart",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    credentials: "include",

                    body: JSON.stringify({
                        productId:
                            Number(productId),
                        quantity: 1
                    })
                }
            );

        const data =
            await response.json();

        if (!response.ok || !data.success) {

            showToast(
                data.message ||
                "Unable to add product."
            );

            return;
        }

        await loadCart();

        displayProducts(
            filteredProducts
        );

        showToast(
            "Product added to cart!"
        );

    } catch (error) {

        console.error(
            "ADD CART ERROR:",
            error
        );

        showToast(
            "Unable to connect to server."
        );
    }
}


/* =========================================================
   BUY NOW
   ========================================================= */

async function buyNow(productId) {

    if (!currentUser) {

        showToast(
            "Please login first."
        );

        openLogin();

        return;
    }

    try {

        const response =
            await fetch(
                "/api/cart",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    credentials: "include",

                    body: JSON.stringify({
                        productId:
                            Number(productId),
                        quantity: 1
                    })
                }
            );

        const data =
            await response.json();

        if (!response.ok || !data.success) {

            showToast(
                data.message ||
                "Unable to buy product."
            );

            return;
        }

        await loadCart();

        checkout();

    } catch (error) {

        console.error(
            "BUY NOW ERROR:",
            error
        );

        showToast(
            "Unable to connect to server."
        );
    }
}


/* =========================================================
   CHANGE PRODUCT QUANTITY
   ========================================================= */

async function changeProductQuantity(
    productId,
    change
) {

    if (!currentUser) {

        openLogin();

        return;
    }

    const cartItem =
        currentCart.find(item =>
            Number(item.product_id) ===
            Number(productId)
        );

    if (!cartItem) {

        if (change > 0) {
            await addProductToCart(
                productId
            );
        }

        return;
    }

    const newQuantity =
        Number(cartItem.quantity) +
        Number(change);

    if (newQuantity <= 0) {

        await removeFromCart(
            productId
        );

        return;
    }

    await updateCartQuantity(
        productId,
        newQuantity
    );
}


/* =========================================================
   LOAD CART
   ========================================================= */

async function loadCart() {

    if (!currentUser) {

        currentCart = [];

        updateCartCount();

        return;
    }

    try {

        const response =
            await fetch(
                "/api/cart",
                {
                    credentials: "include"
                }
            );

        const data =
            await response.json();

        if (
            response.ok &&
            data.success
        ) {

            currentCart =
                data.items || [];

        } else {

            currentCart = [];
        }

        updateCartCount();

        const cartPage =
            document.getElementById(
                "cartPage"
            );

        if (
            cartPage &&
            !cartPage.classList.contains(
                "hidden"
            )
        ) {

            displayCart();
        }

    } catch (error) {

        console.error(
            "LOAD CART ERROR:",
            error
        );

        currentCart = [];

        updateCartCount();
    }
}


/* =========================================================
   CART COUNT
   ========================================================= */

function updateCartCount() {

    const cartCount =
        document.getElementById(
            "cartCount"
        );

    if (!cartCount) return;

    const totalQuantity =
        currentCart.reduce(
            (total, item) =>
                total +
                Number(
                    item.quantity || 0
                ),
            0
        );

    cartCount.textContent =
        totalQuantity;
}


/* =========================================================
   DISPLAY CART
   ========================================================= */

function displayCart() {

    const container =
        document.getElementById(
            "cartContainer"
        );

    const summary =
        document.getElementById(
            "cartSummary"
        );

    if (!container) return;

    if (!currentUser) {

        container.innerHTML = `
            <div class="no-products">

                <h3>
                    Please login
                </h3>

                <p>
                    Login to view your cart.
                </p>

                <button
                    class="primary-btn"
                    onclick="openLogin()">
                    Login
                </button>

            </div>
        `;

        summary?.classList.add(
            "hidden"
        );

        return;
    }

    if (currentCart.length === 0) {

        container.innerHTML = `
            <div class="no-products">

                <h3>
                    Your cart is empty 🛒
                </h3>

                <p>
                    Add electronic products
                    to your cart.
                </p>

                <button
                    class="primary-btn"
                    onclick="
                        showPage('products')
                    ">
                    Shop Products
                </button>

            </div>
        `;

        summary?.classList.add(
            "hidden"
        );

        return;
    }

    let totalItems = 0;
    let totalAmount = 0;

    container.innerHTML =
        currentCart.map(item => {

            const quantity =
                Number(
                    item.quantity || 0
                );

            const price =
                Number(
                    item.price || 0
                );

            const subtotal =
                quantity * price;

            totalItems += quantity;
            totalAmount += subtotal;

            return `
                <div class="cart-item">

                    <div class="cart-item-image">
                        ${item.icon || "📦"}
                    </div>

                    <div class="cart-item-info">

                        <h3>
                            ${escapeHTML(
                                item.name
                            )}
                        </h3>

                        <p>
                            ₹${price.toLocaleString(
                                "en-IN"
                            )}
                        </p>

                    </div>

                    <div
                        class="quantity-control">

                        <button
                            class="quantity-btn"
                            onclick="
                                updateCartQuantity(
                                    ${item.product_id},
                                    ${quantity - 1}
                                )
                            ">
                            −
                        </button>

                        <span
                            class="quantity-number">
                            ${quantity}
                        </span>

                        <button
                            class="quantity-btn"
                            onclick="
                                updateCartQuantity(
                                    ${item.product_id},
                                    ${quantity + 1}
                                )
                            ">
                            +
                        </button>

                    </div>

                    <div
                        class="cart-subtotal">
                        ₹${subtotal.toLocaleString(
                            "en-IN"
                        )}
                    </div>

                    <button
                        class="remove-cart-btn"
                        onclick="
                            removeFromCart(
                                ${item.product_id}
                            )
                        ">
                        🗑️
                    </button>

                </div>
            `;

        }).join("");

    summary?.classList.remove(
        "hidden"
    );

    const totalItemsElement =
        document.getElementById(
            "totalItems"
        );

    const cartTotalElement =
        document.getElementById(
            "cartTotal"
        );

    if (totalItemsElement) {
        totalItemsElement.textContent =
            totalItems;
    }

    if (cartTotalElement) {
        cartTotalElement.textContent =
            totalAmount.toLocaleString(
                "en-IN"
            );
    }
}


/* =========================================================
   UPDATE CART
   ========================================================= */

async function updateCartQuantity(
    productId,
    quantity
) {

    if (quantity <= 0) {

        await removeFromCart(
            productId
        );

        return;
    }

    try {

        const response =
            await fetch(
                `/api/cart/${productId}`,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    credentials: "include",

                    body: JSON.stringify({
                        quantity:
                            Number(quantity)
                    })
                }
            );

        const data =
            await response.json();

        if (!response.ok || !data.success) {

            showToast(
                data.message ||
                "Unable to update cart."
            );

            return;
        }

        await loadCart();

        displayProducts(
            filteredProducts
        );

    } catch (error) {

        console.error(
            "UPDATE CART ERROR:",
            error
        );

        showToast(
            "Unable to connect to server."
        );
    }
}


/* =========================================================
   REMOVE CART
   ========================================================= */

async function removeFromCart(
    productId
) {

    try {

        const response =
            await fetch(
                `/api/cart/${productId}`,
                {
                    method: "DELETE",
                    credentials: "include"
                }
            );

        const data =
            await response.json();

        if (!response.ok || !data.success) {

            showToast(
                data.message ||
                "Unable to remove product."
            );

            return;
        }

        await loadCart();

        displayProducts(
            filteredProducts
        );

        displayCart();

        showToast(
            "Product removed from cart."
        );

    } catch (error) {

        console.error(
            "REMOVE CART ERROR:",
            error
        );

        showToast(
            "Unable to connect to server."
        );
    }
}


/* =========================================================
   SEARCH AND CATEGORY FILTER
   ========================================================= */

function filterProducts() {

    const searchInput =
        document.getElementById(
            "searchInput"
        );

    const categoryFilter =
        document.getElementById(
            "categoryFilter"
        );

    const searchText =
        searchInput
            ? searchInput.value
                .trim()
                .toLowerCase()
            : "";

    const category =
        categoryFilter
            ? categoryFilter.value
                .toLowerCase()
            : "all";

    filteredProducts =
        products.filter(product => {

            const name =
                String(
                    product.name || ""
                ).toLowerCase();

            const description =
                String(
                    product.description || ""
                ).toLowerCase();

            const productCategory =
                String(
                    product.category || ""
                ).toLowerCase();

            const matchesSearch =
                name.includes(
                    searchText
                ) ||
                description.includes(
                    searchText
                );

            const matchesCategory =
                category === "all" ||
                productCategory === category;

            return (
                matchesSearch &&
                matchesCategory
            );
        });

    displayProducts(
        filteredProducts
    );
}

/* =========================================================
   CHECKOUT
   ========================================================= */

function checkout() {

    if (!currentUser) {

        showToast(
            "Please login first."
        );

        openLogin();

        return;
    }

    if (
        !currentCart ||
        currentCart.length === 0
    ) {

        showToast(
            "Your cart is empty."
        );

        return;
    }

    let total = 0;

    currentCart.forEach(item => {

        total +=
            Number(item.price || 0) *
            Number(item.quantity || 0);

    });

    const checkoutTotal =
        document.getElementById(
            "checkoutTotal"
        );

    if (checkoutTotal) {

        checkoutTotal.textContent =
            total.toLocaleString(
                "en-IN"
            );
    }

    const message =
        document.getElementById(
            "checkoutMessage"
        );

    if (message) {
        message.textContent = "";
    }

    document
        .getElementById(
            "checkoutModal"
        )
        ?.classList.remove(
            "hidden"
        );
}


/* =========================================================
   PLACE ORDER
   NO PAYMENT METHOD
   ========================================================= */

async function placeOrder(event) {

    event.preventDefault();

    const addressElement =
        document.getElementById(
            "deliveryAddress"
        );

    const messageElement =
        document.getElementById(
            "checkoutMessage"
        );

    const address =
        addressElement
            ? addressElement.value.trim()
            : "";

    if (!address) {

        if (messageElement) {

            messageElement.textContent =
                "Please enter your delivery address.";

            messageElement.style.color =
                "red";
        }

        return;
    }

    if (!currentUser) {

        if (messageElement) {

            messageElement.textContent =
                "Please login before placing an order.";

            messageElement.style.color =
                "red";
        }

        return;
    }

    if (
        !currentCart ||
        currentCart.length === 0
    ) {

        if (messageElement) {

            messageElement.textContent =
                "Your cart is empty.";

            messageElement.style.color =
                "red";
        }

        return;
    }

    try {

        if (messageElement) {

            messageElement.textContent =
                "Placing order...";

            messageElement.style.color =
                "blue";
        }

        const response =
            await fetch(
                "/api/orders",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    credentials: "include",

                    body: JSON.stringify({
                        address
                    })
                }
            );

        const data =
            await response.json();

        if (!response.ok || !data.success) {

            if (messageElement) {

                messageElement.textContent =
                    data.message ||
                    "Unable to place order.";

                messageElement.style.color =
                    "red";
            }

            return;
        }

        if (messageElement) {

            messageElement.textContent =
                "Order placed successfully!";

            messageElement.style.color =
                "green";
        }

        if (addressElement) {
            addressElement.value = "";
        }

        currentCart = [];

        updateCartCount();

        await loadCart();

        displayProducts(
            filteredProducts
        );

        setTimeout(
            async () => {

                closeModals();

                showPage("orders");

                await loadOrders();

                showToast(
                    `Order #${data.orderId} placed successfully!`
                );

            },
            800
        );

    } catch (error) {

        console.error(
            "PLACE ORDER ERROR:",
            error
        );

        if (messageElement) {

            messageElement.textContent =
                "Unable to connect to server.";

            messageElement.style.color =
                "red";
        }
    }
}


/* =========================================================
   LOAD ORDERS
   ========================================================= */

async function loadOrders() {

    const container =
        document.getElementById(
            "ordersContainer"
        );

    if (!container) return;

    if (!currentUser) {

        container.innerHTML = `
            <div class="no-products">

                <h3>
                    Please login
                </h3>

                <p>
                    Login to view your orders.
                </p>

                <button
                    class="primary-btn"
                    onclick="openLogin()">
                    Login
                </button>

            </div>
        `;

        return;
    }

    try {

        const response =
            await fetch(
                "/api/orders",
                {
                    credentials: "include"
                }
            );

        const data =
            await response.json();

        if (!response.ok || !data.success) {

            container.innerHTML = `
                <div class="no-products">

                    <h3>
                        Unable to load orders
                    </h3>

                    <p>
                        ${escapeHTML(
                            data.message || ""
                        )}
                    </p>

                </div>
            `;

            return;
        }

        const orders =
            data.orders || [];

        if (orders.length === 0) {

            container.innerHTML = `
                <div class="no-products">

                    <h3>
                        No orders yet 📦
                    </h3>

                    <p>
                        Your placed orders
                        will appear here.
                    </p>

                    <button
                        class="primary-btn"
                        onclick="
                            showPage('products')
                        ">
                        Start Shopping
                    </button>

                </div>
            `;

            return;
        }

        container.innerHTML =
            orders.map(order => {

                const total =
                    Number(
                        order.total || 0
                    );

                const date =
                    order.created_at
                        ? new Date(
                            order.created_at
                        ).toLocaleString(
                            "en-IN"
                        )
                        : "";

                return `
                    <div class="order-card">

                        <div class="order-header">

                            <div>

                                <h3>
                                    Order #${order.id}
                                </h3>

                                <p>
                                    ${date}
                                </p>

                            </div>

                            <span
                                class="order-status">
                                ${escapeHTML(
                                    order.status ||
                                    "Order Placed"
                                )}
                            </span>

                        </div>

                        <div class="order-details">

                            <p>

                                <strong>
                                    Total:
                                </strong>

                                ₹${total.toLocaleString(
                                    "en-IN"
                                )}

                            </p>

                            <p>

                                <strong>
                                    Delivery Address:
                                </strong>

                                ${escapeHTML(
                                    order.address ||
                                    "N/A"
                                )}

                            </p>

                        </div>

                    </div>
                `;

            }).join("");

    } catch (error) {

        console.error(
            "LOAD ORDERS ERROR:",
            error
        );

        container.innerHTML = `
            <div class="no-products">

                <h3>
                    Unable to load orders
                </h3>

                <p>
                    Please try again.
                </p>

                <button
                    class="primary-btn"
                    onclick="loadOrders()">
                    Try Again
                </button>

            </div>
        `;
    }
}


/* =========================================================
   WISHLIST
   ========================================================= */

async function loadWishlist() {

    if (!currentUser) {

        currentWishlist = [];

        updateWishlistCount();

        return;
    }

    try {

        const response =
            await fetch(
                "/api/wishlist",
                {
                    credentials: "include"
                }
            );

        const data =
            await response.json();

        if (
            response.ok &&
            data.success
        ) {

            currentWishlist =
                Array.isArray(
                    data.wishlist
                )
                    ? data.wishlist
                    : [];

        } else {

            currentWishlist = [];
        }

        updateWishlistCount();

        displayProducts(
            filteredProducts
        );

        const wishlistPage =
            document.getElementById(
                "wishlistPage"
            );

        if (
            wishlistPage &&
            !wishlistPage.classList.contains(
                "hidden"
            )
        ) {

            displayWishlist();
        }

    } catch (error) {

        console.error(
            "LOAD WISHLIST ERROR:",
            error
        );

        currentWishlist = [];

        updateWishlistCount();
    }
}


/* =========================================================
   WISHLIST COUNT
   ========================================================= */

function updateWishlistCount() {

    const element =
        document.getElementById(
            "wishlistCount"
        );

    if (!element) return;

    element.textContent =
        currentWishlist.length;
}


/* =========================================================
   DISPLAY WISHLIST
   ========================================================= */

function displayWishlist() {

    const container =
        document.getElementById(
            "wishlistContainer"
        );

    if (!container) return;

    if (!currentUser) {

        container.innerHTML = `
            <div class="no-products">

                <h3>
                    Please login
                </h3>

                <p>
                    Login to view your wishlist.
                </p>

                <button
                    class="primary-btn"
                    onclick="openLogin()">
                    Login
                </button>

            </div>
        `;

        return;
    }

    if (currentWishlist.length === 0) {

        container.innerHTML = `
            <div class="no-products">

                <h3>
                    Your wishlist is empty ❤️
                </h3>

                <p>
                    Save products here for later.
                </p>

                <button
                    class="primary-btn"
                    onclick="
                        showPage('products')
                    ">
                    Browse Products
                </button>

            </div>
        `;

        return;
    }

    container.innerHTML =
        currentWishlist.map(item => {

            const productId =
                Number(
                    item.product_id ||
                    item.id
                );

            const price =
                Number(
                    item.price || 0
                );

            return `
                <div class="product-card">

                    <div
                        class="product-wishlist">

                        <button
                            class="wishlist-btn active"
                            onclick="
                                removeFromWishlist(
                                    ${productId}
                                )
                            ">
                            ❤️
                        </button>

                    </div>

                    <div class="product-image">
                        ${item.icon || "📦"}
                    </div>

                    <div class="product-info">

                        <span
                            class="product-category">
                            ${escapeHTML(
                                item.category ||
                                "Electronics"
                            )}
                        </span>

                        <h3>
                            ${escapeHTML(
                                item.name ||
                                "Product"
                            )}
                        </h3>

                        <p
                            class="product-description">
                            ${escapeHTML(
                                item.description ||
                                "Quality electronic product."
                            )}
                        </p>

                        <div
                            class="product-bottom">

                            <div
                                class="product-price">
                                ₹${price.toLocaleString(
                                    "en-IN"
                                )}
                            </div>

                            <div
                                class="product-buttons">

                                <button
                                    class="add-btn"
                                    onclick="
                                        addProductToCart(
                                            ${productId}
                                        )
                                    ">
                                    🛒 Add to Cart
                                </button>

                                <button
                                    class="buy-now-btn"
                                    onclick="
                                        buyNow(
                                            ${productId}
                                        )
                                    ">
                                    ⚡ Buy Now
                                </button>

                            </div>

                        </div>

                    </div>

                </div>
            `;

        }).join("");
}


/* =========================================================
   ADD TO WISHLIST
   ========================================================= */

async function addToWishlist(
    productId
) {

    if (!currentUser) {

        showToast(
            "Please login to use Wishlist."
        );

        openLogin();

        return;
    }

    try {

        const response =
            await fetch(
                "/api/wishlist",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    credentials: "include",

                    body: JSON.stringify({
                        productId:
                            Number(productId)
                    })
                }
            );

        const data =
            await response.json();

        if (!response.ok || !data.success) {

            showToast(
                data.message ||
                "Unable to add wishlist item."
            );

            return;
        }

        await loadWishlist();

        displayProducts(
            filteredProducts
        );

        showToast(
            data.alreadyExists
                ? "Already in wishlist."
                : "Added to wishlist ❤️"
        );

    } catch (error) {

        console.error(
            "ADD WISHLIST ERROR:",
            error
        );

        showToast(
            "Unable to connect to server."
        );
    }
}


/* =========================================================
   REMOVE FROM WISHLIST
   ========================================================= */

async function removeFromWishlist(
    productId
) {

    if (!currentUser) {

        openLogin();

        return;
    }

    try {

        const response =
            await fetch(
                `/api/wishlist/${productId}`,
                {
                    method: "DELETE",
                    credentials: "include"
                }
            );

        const data =
            await response.json();

        if (!response.ok || !data.success) {

            showToast(
                data.message ||
                "Unable to remove wishlist item."
            );

            return;
        }

        currentWishlist =
            currentWishlist.filter(item =>
                Number(
                    item.product_id ||
                    item.id
                ) !== Number(productId)
            );

        updateWishlistCount();

        displayProducts(
            filteredProducts
        );

        displayWishlist();

        showToast(
            "Removed from wishlist."
        );

    } catch (error) {

        console.error(
            "REMOVE WISHLIST ERROR:",
            error
        );

        showToast(
            "Unable to connect to server."
        );
    }
}


/* =========================================================
   CUSTOMER SUPPORT
   ========================================================= */

async function loadSupportOrders() {

    const orderSelect =
        document.getElementById(
            "supportOrder"
        );

    if (!orderSelect) {
        return;
    }

    try {

        const response =
            await fetch(
                "/api/orders",
                {
                    credentials: "include"
                }
            );

        const data =
            await response.json();

        orderSelect.innerHTML = `
            <option value="">
                General Issue
            </option>
        `;

        /*
           Backend may return:
           { success: true, orders: [] }
           or directly []
        */

        const orders =
            Array.isArray(data)
                ? data
                : (
                    Array.isArray(
                        data.orders
                    )
                        ? data.orders
                        : []
                );

        orders.forEach(order => {

            const option =
                document.createElement(
                    "option"
                );

            option.value =
                order.id;

            option.textContent =
                "Order #" +
                order.id +
                " - ₹" +
                Number(
                    order.total || 0
                ).toLocaleString(
                    "en-IN"
                );

            orderSelect.appendChild(
                option
            );
        });

    } catch (error) {

        console.error(
            "SUPPORT ORDER ERROR:",
            error
        );
    }
}


/* =========================================================
   SUBMIT SUPPORT REQUEST
   ========================================================= */

async function submitSupportRequest(
    event
) {

    event.preventDefault();

    if (!currentUser) {

        alert(
            "Please login before submitting a support request."
        );

        openLogin();

        return;
    }

    const orderElement =
        document.getElementById(
            "supportOrder"
        );

    const issueElement =
        document.getElementById(
            "issueType"
        );

    const subjectElement =
        document.getElementById(
            "supportSubject"
        );

    const messageElement =
        document.getElementById(
            "supportMessage"
        );

    const result =
        document.getElementById(
            "supportMessageResult"
        );

    const button =
        document.getElementById(
            "supportSubmitBtn"
        );

    const orderId =
        orderElement
            ? orderElement.value
            : "";

    const issueType =
        issueElement
            ? issueElement.value
            : "";

    const subject =
        subjectElement
            ? subjectElement.value.trim()
            : "";

    const message =
        messageElement
            ? messageElement.value.trim()
            : "";

    if (!issueType) {

        if (result) {

            result.textContent =
                "Please select an issue type.";

            result.style.color =
                "#dc2626";
        }

        return;
    }

    if (subject.length < 3) {

        if (result) {

            result.textContent =
                "Please enter a valid subject.";

            result.style.color =
                "#dc2626";
        }

        return;
    }

    if (message.length < 5) {

        if (result) {

            result.textContent =
                "Please describe your problem.";

            result.style.color =
                "#dc2626";
        }

        return;
    }

    try {

        if (button) {

            button.disabled = true;

            button.textContent =
                "Submitting...";
        }

        if (result) {
            result.textContent = "";
        }

        const response =
            await fetch(
                "/api/support",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    credentials: "include",

                    body: JSON.stringify({
                        orderId:
                            orderId || null,

                        issueType,

                        subject,

                        message
                    })
                }
            );

        const data =
            await response.json();

        if (!response.ok || !data.success) {

            throw new Error(
                data.message ||
                "Unable to submit request."
            );
        }

        if (result) {

            result.textContent =
                "Support request #" +
                data.requestId +
                " submitted successfully.";

            result.style.color =
                "#15803d";
        }

        document
            .getElementById(
                "supportForm"
            )
            ?.reset();

        await loadSupportRequests();

        showToast(
            "Support request submitted."
        );

    } catch (error) {

        console.error(
            "SUPPORT SUBMIT ERROR:",
            error
        );

        if (result) {

            result.textContent =
                error.message ||
                "Unable to submit request.";

            result.style.color =
                "#dc2626";
        }

    } finally {

        if (button) {

            button.disabled = false;

            button.textContent =
                "Submit Support Request";
        }
    }
}


/* =========================================================
   LOAD SUPPORT REQUESTS
   ========================================================= */

async function loadSupportRequests() {

    const container =
        document.getElementById(
            "supportRequestsContainer"
        );

    if (!container) {
        return;
    }

    container.innerHTML = `
        <div class="support-loading">
            Loading requests...
        </div>
    `;

    try {

        const response =
            await fetch(
                "/api/support",
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

        if (!response.ok) {

            throw new Error(
                data.message ||
                "Unable to load support requests."
            );
        }

        /*
           Supports both:
           []
           and
           { success:true, requests:[] }
        */

        if (Array.isArray(data)) {

            currentSupportRequests =
                data;

        } else if (
            Array.isArray(
                data.requests
            )
        ) {

            currentSupportRequests =
                data.requests;

        } else {

            currentSupportRequests = [];
        }

        displaySupportRequests();

    } catch (error) {

        console.error(
            "CUSTOMER SUPPORT LOAD ERROR:",
            error
        );

        container.innerHTML = `
            <div class="support-empty">

                <div
                    class="support-empty-icon">
                    ⚠️
                </div>

                <h3>
                    Unable to load support requests
                </h3>

                <p>
                    ${escapeHTML(
                        error.message
                    )}
                </p>

                <button
                    type="button"
                    class="primary-btn"
                    onclick="
                        loadSupportRequests()
                    ">
                    Try Again
                </button>

            </div>
        `;
    }
}


/* =========================================================
   DISPLAY SUPPORT REQUESTS
   ========================================================= */

function displaySupportRequests() {

    const container =
        document.getElementById(
            "supportRequestsContainer"
        );

    if (!container) {
        return;
    }

    if (
        currentSupportRequests.length === 0
    ) {

        container.innerHTML = `
            <div class="support-empty">

                <div
                    class="support-empty-icon">
                    🛟
                </div>

                <p>
                    You have no support requests yet.
                </p>

            </div>
        `;

        return;
    }

    container.innerHTML = "";

    currentSupportRequests.forEach(
        request => {

            const card =
                document.createElement(
                    "div"
                );

            card.className =
                "support-request";

            const status =
                request.status ||
                "Open";

            let statusClass =
                "open";

            if (
                status === "In Progress"
            ) {

                statusClass =
                    "progress";
            }

            if (
                status === "Resolved"
            ) {

                statusClass =
                    "resolved";
            }

            if (
                status === "Closed"
            ) {

                statusClass =
                    "closed";
            }

            card.innerHTML = `

                <h4>
                    🛟 Ticket #${request.id}
                </h4>

                <p>
                    <strong>
                        Subject:
                    </strong>

                    ${escapeHTML(
                        request.subject || ""
                    )}
                </p>

                <p>
                    <strong>
                        Issue:
                    </strong>

                    ${escapeHTML(
                        request.issue_type || ""
                    )}
                </p>

                <p>
                    <strong>
                        Order:
                    </strong>

                    ${
                        request.order_id
                            ? "#" +
                              request.order_id
                            : "General Issue"
                    }
                </p>

                <p>
                    <strong>
                        Message:
                    </strong>

                    ${escapeHTML(
                        request.message || ""
                    )}
                </p>

                <p>
                    <strong>
                        Status:
                    </strong>

                    <span
                        class="support-status ${statusClass}">
                        ${escapeHTML(
                            status
                        )}
                    </span>
                </p>

                <p>
                    <strong>
                        Created:
                    </strong>

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

                ${
                    request.admin_reply
                        ? `
                            <div
                                class="support-reply">

                                <strong>
                                    👨‍💼 Admin Reply
                                </strong>

                                <br>

                                ${escapeHTML(
                                    request.admin_reply
                                )}

                            </div>
                        `
                        : `
                            <div
                                class="support-reply">

                                <strong>
                                    👨‍💼 Admin Reply
                                </strong>

                                <br>

                                Waiting for admin response.

                            </div>
                        `
                }

            `;

            container.appendChild(
                card
            );
        }
    );
}


/* =========================================================
   TOAST
   ========================================================= */

function showToast(message) {

    const toast =
        document.getElementById(
            "toast"
        );

    if (!toast) {

        alert(message);

        return;
    }

    toast.textContent =
        message;

    toast.classList.add(
        "show"
    );

    setTimeout(
        () => {

            toast.classList.remove(
                "show"
            );

        },
        2500
    );
}


/* =========================================================
   ESCAPE HTML
   ========================================================= */

function escapeHTML(value) {

    return String(
        value ?? ""
    )
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


/* =========================================================
   CLOSE MODAL WHEN CLICKING OUTSIDE
   ========================================================= */

document.addEventListener(
    "click",
    event => {

        document
            .querySelectorAll(
                ".modal"
            )
            .forEach(modal => {

                if (
                    event.target === modal
                ) {

                    modal.classList.add(
                        "hidden"
                    );
                }
            });
    }
);


/* =========================================================
   ESC KEY
   ========================================================= */

document.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "Escape"
        ) {

            closeModals();
        }
    }
);
