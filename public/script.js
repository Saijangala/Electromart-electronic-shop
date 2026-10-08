
/* =========================================================
   ELECTROMART - CUSTOMER SCRIPT
   ========================================================= */

let products = [];
let filteredProducts = [];
let currentCart = [];
let currentUser = null;
let currentInvoiceOrder = null;
let currentWishlist = [];
let currentSupportRequests = [];

let verifiedPincode = "";



/* =========================================================
   PAGE LOAD
   ========================================================= */

document.addEventListener("DOMContentLoaded", async () => {

    await checkLogin();
    await loadProducts();

    /* SEARCH */
    const searchInput = document.getElementById("searchInput");

    if (searchInput) {
        searchInput.addEventListener("input", filterProducts);
    }

    /* CATEGORY */
    const categoryFilter = document.getElementById("categoryFilter");

    if (categoryFilter) {
        categoryFilter.addEventListener("change", filterProducts);
    }

    if (currentUser) {
        await loadCart();
        await loadWishlist();
    } else {
        currentCart = [];
        currentWishlist = [];

        updateCartCount();
        updateWishlistCount();
    }

    startNotificationSystem();
});


/* =========================================================
   PAGE NAVIGATION
   ========================================================= */
/* =========================================================
   PAGE NAVIGATION
========================================================= */

async function showPage(page) {

    console.log(
        "SHOW PAGE:",
        page
    );

    const pages = [
        "homePage",
        "productsPage",
        "productDetailsPage",
        "cartPage",
        "ordersPage",
        "wishlistPage",
        "referralPage",
        "supportPage"
    ];

    /* =====================================
       HIDE ALL PAGES
    ===================================== */

    pages.forEach(function(id) {

        const element =
            document.getElementById(id);

        if (element) {

            element.classList.add(
                "hidden"
            );

        }

    });


    /* =====================================
       SHOW SELECTED PAGE
    ===================================== */

    const selectedPage =
        document.getElementById(
            page + "Page"
        );

    if (selectedPage) {

        selectedPage.classList.remove(
            "hidden"
        );

        console.log(
            "PAGE OPENED:",
            page + "Page"
        );

    } else {

        console.error(
            "PAGE NOT FOUND:",
            page + "Page"
        );

        return;
    }


    /* =====================================
       PRODUCTS
    ===================================== */

    if (page === "products") {

        await loadProducts();

    }


    /* =====================================
       CART
    ===================================== */

    if (page === "cart") {

        if (!currentUser) {

            openLogin();

            return;
        }

        await loadCart();

        displayCart();

    }


    /* =====================================
       ORDERS
    ===================================== */

    if (page === "orders") {

        if (!currentUser) {

            openLogin();

            return;
        }

        await loadOrders();

    }


    /* =====================================
       WISHLIST
    ===================================== */

    if (page === "wishlist") {

        if (!currentUser) {

            openLogin();

            return;
        }

        await loadWishlist();

    }


    /* =====================================
       REFERRAL
    ===================================== */

    if (page === "referral") {

        if (!currentUser) {

            openLogin();

            return;
        }

        if (typeof loadReferralPage === "function") {

            loadReferralPage();

        }

    }


    /* =====================================
       SUPPORT
    ===================================== */

    if (page === "support") {

        if (!currentUser) {

            openLogin();

            return;
        }

        await loadSupportOrders();

        await loadSupportRequests();

    }


    /* =====================================
       SCROLL TOP
    ===================================== */

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

    const notificationWrapper =
        document.querySelector(".notification-wrapper");

    /*
     * All navigation buttons that require login
     */
    const protectedNavButtons =
        document.querySelectorAll(
            ".navbar nav button:not(#loginBtn):not(#registerBtn):not(#logoutBtn)"
        );


    /* =====================================================
       LOGGED IN
    ===================================================== */

    if (currentUser) {

        console.log(
            "USER LOGGED IN - SHOW FULL NAVBAR"
        );

        /* Hide Login */
        loginBtn?.classList.add("hidden");

        /* Hide Register */
        registerBtn?.classList.add("hidden");

        /* Show Logout */
        logoutBtn?.classList.remove("hidden");


        /* Show Home, Products, Cart, Orders,
           Wishlist, Refer, Support */
        protectedNavButtons.forEach(
            function(button) {

                button.classList.remove(
                    "hidden"
                );

                button.style.display = "";
            }
        );


        /* Show Notification */
        if (notificationWrapper) {

            notificationWrapper.style.display =
                "inline-block";
        }

    }

    /* =====================================================
       LOGGED OUT
    ===================================================== */

    else {

        console.log(
            "USER LOGGED OUT - SHOW LOGIN/REGISTER ONLY"
        );

        /* Show Login */
        loginBtn?.classList.remove("hidden");

        loginBtn?.style.removeProperty(
            "display"
        );


        /* Show Register */
        registerBtn?.classList.remove("hidden");

        registerBtn?.style.removeProperty(
            "display"
        );


        /* Hide Logout */
        logoutBtn?.classList.add("hidden");


        /* Hide Home, Products, Cart, Orders,
           Wishlist, Refer, Support */
        protectedNavButtons.forEach(
            function(button) {

                button.classList.add(
                    "hidden"
                );

                button.style.display =
                    "none";
            }
        );


        /* Hide Notification */
        if (notificationWrapper) {

            notificationWrapper.style.display =
                "none";
        }
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
/* =========================================================
   LOGIN
========================================================= */

async function login(event) {

    event.preventDefault();

    console.log("LOGIN BUTTON CLICKED");

    const emailInput =
        document.getElementById("loginEmail");

    const passwordInput =
        document.getElementById("loginPassword");

    const message =
        document.getElementById("loginMessage");

    const email =
        emailInput.value.trim();

    const password =
        passwordInput.value;

    if (!email || !password) {

        message.textContent =
            "Please enter email and password.";

        message.style.color = "red";

        return;
    }

    try {

        message.textContent =
            "Logging in...";

        message.style.color =
            "#2563eb";

        console.log(
            "Sending login request..."
        );

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
                        email: email,
                        password: password
                    })
                }
            );

        console.log(
            "Login response:",
            response.status
        );

        const data =
            await response.json();

        console.log(
            "Login data:",
            data
        );

        /* =====================================
           LOGIN FAILED
        ===================================== */

        if (
            !response.ok ||
            !data.success
        ) {

            message.textContent =
                data.message ||
                "Invalid email or password.";

            message.style.color =
                "red";

            return;
        }


        /* =====================================
           LOGIN SUCCESS
        ===================================== */

        console.log(
            "LOGIN SUCCESS"
        );


        /* SAVE USER */

        currentUser =
            data.user;


        /* UPDATE LOGIN BUTTONS */
updateLoginUI();

/* SHOW NAVBAR */

const navbar =
    document.querySelector(".navbar");

if (navbar) {

    navbar.style.display =
        "flex";
}

/* CLOSE LOGIN */

const loginModal =
    document.getElementById(
        "loginModal"
    );

if (loginModal) {

    loginModal.classList.add(
        "hidden"
    );

    loginModal.style.display =
        "none";

    loginModal.style.visibility =
        "hidden";

    loginModal.style.opacity =
        "0";

    loginModal.style.pointerEvents =
        "none";
}

/* SHOW HOME */

await showPage("home");

        /* =====================================
           LOAD CART
        ===================================== */

        try {

            await loadCart();

        } catch (error) {

            console.error(
                "Cart loading error:",
                error
            );

        }


        /* =====================================
           LOAD WISHLIST
        ===================================== */

        try {

            await loadWishlist();

        } catch (error) {

            console.error(
                "Wishlist loading error:",
                error
            );

        }


        /* =====================================
           START NOTIFICATIONS
        ===================================== */

        try {

            startNotificationSystem();

        } catch (error) {

            console.error(
                "Notification error:",
                error
            );

        }


        /* =====================================
           CLEAR LOGIN FIELDS
        ===================================== */

        emailInput.value = "";

        passwordInput.value = "";


        /* =====================================
           SUCCESS MESSAGE
        ===================================== */

        showToast(
            "Login successful! Welcome to ElectroMart."
        );


        console.log(
            "ElectroMart UI opened successfully."
        );


    } catch (error) {

        console.error(
            "LOGIN ERROR:",
            error
        );

        message.textContent =
            "Unable to connect to server.";

        message.style.color =
            "red";
    }
}
/* =========================================================
   FORGOT PASSWORD
========================================================= */

let resetEmail = "";
let resetOTP = "";


/* OPEN FORGOT PASSWORD */

function openForgotPassword() {

    closeModals();

    const modal =
        document.getElementById(
            "forgotPasswordModal"
        );

    if (modal) {
        modal.classList.remove("hidden");
    }

    document
        .getElementById("forgotStep1")
        ?.classList.remove("hidden");

    document
        .getElementById("forgotStep2")
        ?.classList.add("hidden");

    document
        .getElementById("forgotStep3")
        ?.classList.add("hidden");

    const message =
        document.getElementById(
            "forgotMessage"
        );

    if (message) {
        message.textContent = "";
    }
}


/* CLOSE FORGOT PASSWORD */

function closeForgotPassword() {

    document
        .getElementById(
            "forgotPasswordModal"
        )
        ?.classList.add("hidden");

    resetEmail = "";
    resetOTP = "";
}


/* SEND OTP */

async function sendResetOTP(event) {

    event.preventDefault();

    const emailElement =
        document.getElementById(
            "forgotEmail"
        );

    const message =
        document.getElementById(
            "forgotMessage"
        );

    const button =
        document.getElementById(
            "sendOtpBtn"
        );

    const email =
        emailElement.value
            .trim()
            .toLowerCase();

    if (!email) {

        message.textContent =
            "Please enter your email.";

        message.style.color = "red";

        return;
    }

    try {

        button.disabled = true;
        button.textContent =
            "Sending OTP...";

        message.textContent =
            "Please wait...";

        message.style.color =
            "blue";

        const response =
            await fetch(
                "/api/forgot-password",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    credentials: "include",

                    body:
                        JSON.stringify({
                            email
                        })
                }
            );

        const data =
            await response.json();

        if (
            !response.ok ||
            !data.success
        ) {

            message.textContent =
                data.message ||
                "Unable to send OTP.";

            message.style.color =
                "red";

            return;
        }

        resetEmail = email;

        message.textContent =
            data.message;

        message.style.color =
            "green";

        document
            .getElementById(
                "forgotStep1"
            )
            .classList.add("hidden");

        document
            .getElementById(
                "forgotStep2"
            )
            .classList.remove("hidden");

    } catch (error) {

        console.error(
            "SEND OTP ERROR:",
            error
        );

        message.textContent =
            "Unable to connect to server.";

        message.style.color =
            "red";

    } finally {

        button.disabled = false;

        button.textContent =
            "Send OTP";
    }
}


/* VERIFY OTP */

async function verifyResetOTP() {

    const otpElement =
        document.getElementById(
            "resetOTP"
        );

    const message =
        document.getElementById(
            "otpMessage"
        );

    const otp =
        otpElement.value.trim();

    if (!/^\d{6}$/.test(otp)) {

        message.textContent =
            "Please enter a valid 6-digit OTP.";

        message.style.color =
            "red";

        return;
    }

    try {

        message.textContent =
            "Verifying OTP...";

        message.style.color =
            "blue";

        const response =
            await fetch(
                "/api/verify-reset-otp",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    credentials: "include",

                    body:
                        JSON.stringify({
                            email:
                                resetEmail,

                            otp
                        })
                }
            );

        const data =
            await response.json();

        if (
            !response.ok ||
            !data.success
        ) {

            message.textContent =
                data.message ||
                "Invalid OTP.";

            message.style.color =
                "red";

            return;
        }

        resetOTP = otp;

        document
            .getElementById(
                "forgotStep2"
            )
            .classList.add("hidden");

        document
            .getElementById(
                "forgotStep3"
            )
            .classList.remove("hidden");

    } catch (error) {

        console.error(
            "VERIFY OTP ERROR:",
            error
        );

        message.textContent =
            "Unable to connect to server.";

        message.style.color =
            "red";
    }
}


/* RESET PASSWORD */

async function resetPassword() {

    const newPassword =
        document
            .getElementById(
                "newPassword"
            )
            .value;

    const confirmPassword =
        document
            .getElementById(
                "confirmNewPassword"
            )
            .value;

    const message =
        document.getElementById(
            "resetMessage"
        );

    if (newPassword.length < 6) {

        message.textContent =
            "Password must contain at least 6 characters.";

        message.style.color =
            "red";

        return;
    }

    if (
        newPassword !==
        confirmPassword
    ) {

        message.textContent =
            "Passwords do not match.";

        message.style.color =
            "red";

        return;
    }

    try {

        message.textContent =
            "Updating password...";

        message.style.color =
            "blue";

        const response =
            await fetch(
                "/api/reset-password",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    credentials: "include",

                    body:
                        JSON.stringify({

                            email:
                                resetEmail,

                            otp:
                                resetOTP,

                            newPassword:
                                newPassword
                        })
                }
            );

        const data =
            await response.json();

        if (
            !response.ok ||
            !data.success
        ) {

            message.textContent =
                data.message ||
                "Unable to reset password.";

            message.style.color =
                "red";

            return;
        }

        message.textContent =
            "Password reset successfully!";

        message.style.color =
            "green";

        setTimeout(
            () => {

                closeForgotPassword();

                openLogin();

                const loginMessage =
                    document.getElementById(
                        "loginMessage"
                    );

                if (loginMessage) {

                    loginMessage.textContent =
                        "Password reset successfully. Please login.";

                    loginMessage.style.color =
                        "green";
                }

            },
            1500
        );

    } catch (error) {

        console.error(
            "RESET PASSWORD ERROR:",
            error
        );

        message.textContent =
            "Unable to connect to server.";

        message.style.color =
            "red";
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
   DISPLAY PRODUCTS WITH RATING
========================================================= */

function displayProducts(list) {

    const container =
        document.getElementById("productContainer");

    if (!container) return;

    if (!list || list.length === 0) {

        container.innerHTML = `
            <div class="no-products">
                <h3>No products found</h3>
                <p>Try another search or category.</p>
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
                        item.product_id || item.id
                    ) === Number(product.id)
                );

            let buttonHTML = "";

            /* =========================
               OUT OF STOCK
            ========================= */

            if (Number(product.stock) <= 0) {

                buttonHTML = `
                    <button
                        class="add-btn"
                        disabled>
                        Out of Stock
                    </button>
                `;

            }

            /* =========================
               PRODUCT IN CART
            ========================= */

            else if (quantity > 0) {

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

                        <span class="quantity-number">
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

            }

            /* =========================
               ADD TO CART + BUY NOW
            ========================= */

            else {

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

            /* =========================
               WISHLIST
            ========================= */
const wishlistButton = isWishlisted
        ? `
            <button
                type="button"
                class="wishlist-btn active"
                onclick="removeFromWishlist(
                    ${product.id}
                )"
                title="Remove from Wishlist">
                ❤️
            </button>
        `
        : `
            <button
                type="button"
                class="wishlist-btn"
                onclick="addToWishlist(
                    ${product.id}
                )"
                title="Add to Wishlist">
                ♡
            </button>
        `;


/* ==========================================
   SHARE BUTTON
   ========================================== */

const shareButton = `
    <button
        type="button"
        class="share-btn"
        onclick="openShareMenu(${product.id})"
        title="Share Product">
        🔗
    </button>
`;


/* RATING */

            /* =========================
               RATING
            ========================= */

            const averageRating =
                Number(product.average_rating || 0);

            const reviewCount =
                Number(product.review_count || 0);

            const roundedRating =
                Math.round(averageRating);

            let stars = "";

            for (let i = 1; i <= 5; i++) {

                stars +=
                    i <= roundedRating
                        ? "★"
                        : "☆";
            }

            return `

                <div class="product-card">
<div class="product-actions">
    ${wishlistButton}
    ${shareButton}
</div>

                   <div class="product-image">

    ${product.icon || "📦"}

    <!-- SHARE BUTTON -->
    <button
        type="button"
        class="share-btn"
        onclick="openShareMenu(this)"
        title="Share Product">
        ↗
    </button>

    <!-- SHARE MENU -->
    <div class="share-menu">

        <button
            type="button"
            class="share-option whatsapp"
            onclick="shareWhatsApp(event, this)">
            🟢 WhatsApp
        </button>

        <button
            type="button"
            class="share-option facebook"
            onclick="shareFacebook(event, this)">
            🔵 Facebook
        </button>

        <button
            type="button"
            class="share-option instagram"
            onclick="shareInstagram(event, this)">
            🟣 Instagram
        </button>

    </div>

</div>

                    <div class="product-info">

                        <span class="product-category">
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

                        <!-- RATING DISPLAY -->
                        <div class="product-rating">

                            <span class="rating-stars">
                                ${stars}
                            </span>

                            <span class="rating-number">
                                ${averageRating.toFixed(1)}
                            </span>

                            <span class="review-count">
                                (${reviewCount} reviews)
                            </span>

                        </div>

                        <!-- RATE BUTTON -->
                     <button
    type="button"
    class="rate-review-btn"
    data-product-id="${product.id}">
    ⭐ Rate & Review
</button>
                        <div class="product-bottom">

                            <div class="product-price">
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
   RATING BUTTON CLICK
========================================================= */

document.addEventListener("click", function (event) {

    const button =
        event.target.closest(".rate-review-btn");

    if (!button) {
        return;
    }

    const productId =
        Number(button.dataset.productId);

    if (!productId) {
        console.error("Invalid product ID");
        return;
    }

    openReviewModal(productId);
});

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
    const cartCount = document.getElementById("cartCount");

    if (!cartCount) return;

    const totalQuantity = currentCart.reduce(
        (total, item) => {
            return total + Number(item.quantity || 0);
        },
        0
    );

    cartCount.textContent = totalQuantity;

    if (totalQuantity > 0) {
        cartCount.style.display = "inline-flex";
    } else {
        cartCount.style.display = "none";
    }
}
/* =====================================================
   PRODUCT IMAGE RENDERER
   Used by Cart + Wishlist
===================================================== */

function renderProductImage(item, className = "cart-product-image") {

    const imageValue = String(
        item?.image ||
        item?.image_url ||
        item?.imageUrl ||
        item?.product_image ||
        item?.icon ||
        ""
    ).trim();


    /* No image */

    if (!imageValue) {

        return `
            <div class="cart-image-fallback">
                📦
            </div>
        `;
    }


    let imageSource = "";


    /* IMAGE URL */

    if (
        imageValue.startsWith("http://") ||
        imageValue.startsWith("https://") ||
        imageValue.startsWith("/") ||
        imageValue.startsWith("./") ||
        imageValue.startsWith("images/") ||
        imageValue.startsWith("uploads/")
    ) {

        imageSource = imageValue;

    }


    /* BASE64 IMAGE */

    else if (
        imageValue.length > 100 &&
        /^[A-Za-z0-9+/=\s]+$/.test(imageValue)
    ) {

        imageSource =
            "data:image/jpeg;base64," +
            imageValue.replace(/\s/g, "");

    }


    /* IMAGE FOUND */

    if (imageSource) {

        return `
            <img
                src="${escapeHTML(imageSource)}"
                alt="${escapeHTML(
                    item?.name || "Product"
                )}"
                class="${className}"
                loading="lazy"
                onerror="
                    this.style.display='none';
                    this.nextElementSibling.style.display='flex';
                "
            >

            <div
                class="cart-image-fallback"
                style="display:none;"
            >
                📦
            </div>
        `;
    }


    /* EMOJI / ICON */

    if (imageValue.length <= 20) {

        return `
            <div class="cart-image-fallback">
                ${escapeHTML(imageValue)}
            </div>
        `;
    }


    /* INVALID LONG VALUE */

    return `
        <div class="cart-image-fallback">
            📦
        </div>
    `;
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
                <div class="cart-item-image">
    ${renderProductImage(
        item,
        "cart-product-image"
    )}
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

/* =========================================================
   SEARCH AND CATEGORY FILTER
   ========================================================= */

function filterProducts() {

    const searchInput = document.getElementById("searchInput");
    const categoryFilter = document.getElementById("categoryFilter");

    const searchText = searchInput
        ? searchInput.value.trim().toLowerCase()
        : "";

    const selectedCategory = categoryFilter
        ? categoryFilter.value.toLowerCase()
        : "all";

    filteredProducts = products.filter(product => {

        const name = String(product.name || "").toLowerCase();

        const description = String(
            product.description || ""
        ).toLowerCase();

        const productCategory = String(
            product.category || ""
        ).toLowerCase();

        /* Search in product name, description and category */
        const matchesSearch =
            name.includes(searchText) ||
            description.includes(searchText) ||
            productCategory.includes(searchText);

        /* Category filter */
        const matchesCategory =
            selectedCategory === "all" ||
            productCategory === selectedCategory;

        return matchesSearch && matchesCategory;
    });

    displayProducts(filteredProducts);
}


/* =========================================================
   CHECKOUT
   ORIGINAL TOTAL + 10% DISCOUNT + FINAL TOTAL
   ========================================================= */

async function checkout() {

    console.log("CHECKOUT BUTTON CLICKED");

    /* -----------------------------------------
       LOGIN CHECK
    ----------------------------------------- */

    if (!currentUser) {

        alert("Please login first.");

        if (typeof openLogin === "function") {
            openLogin();
        }

        return;
    }


    /* -----------------------------------------
       GET LATEST CART
    ----------------------------------------- */

    try {

        const response = await fetch(
            "/api/cart",
            {
                method: "GET",
                credentials: "include"
            }
        );

        const data = await response.json();

        console.log("CART API RESPONSE:", data);


        if (!response.ok || !data.success) {

            console.error(
                "Cart API ERROR:",
                data
            );

            alert(
                data.message ||
                "Unable to load cart."
            );

            return;
        }


        /* -----------------------------------------
           UPDATE CURRENT CART
        ----------------------------------------- */

        currentCart =
            Array.isArray(data.items)
                ? data.items
                : [];


        console.log(
            "CURRENT CART:",
            currentCart
        );


        /* -----------------------------------------
           EMPTY CART CHECK
        ----------------------------------------- */

        if (currentCart.length === 0) {

            alert(
                "Your cart is empty."
            );

            return;
        }


        /* =========================================
           CALCULATE ORIGINAL TOTAL
        ========================================= */

        let subtotal = 0;


        currentCart.forEach(function(item) {

            const price = Number(
                item.price ??
                item.unit_price ??
                item.product_price ??
                item.sale_price ??
                0
            );


            const quantity = Number(
                item.quantity ?? 1
            );


            console.log(
                "PRODUCT:",
                item.name,
                "PRICE:",
                price,
                "QUANTITY:",
                quantity
            );


            subtotal +=
                price * quantity;

        });

/* =========================================
   FINAL TOTAL
========================================= */
/* =========================================
   FINAL TOTAL
========================================= */

/* =========================================
   12% DISCOUNT
========================================= */

const discount = subtotal * 0.12;

/* =========================================
   FINAL TOTAL
========================================= */

const finalTotal = subtotal - discount;

console.log("ORIGINAL TOTAL:", subtotal);
console.log("DISCOUNT 12%:", discount);
console.log("FINAL TOTAL:", finalTotal);

console.log(
    "TOTAL:",
    finalTotal
);


        /* =========================================
           GET ORDER SUMMARY ELEMENTS
        ========================================= */
const subtotalElement =
    document.getElementById(
        "checkoutSubtotal"
    );

const discountElement =
    document.getElementById(
        "checkoutDiscount"
    );

const totalElement =
    document.getElementById(
        "checkoutTotal"
    );
    if (subtotalElement) {
    subtotalElement.textContent =
        subtotal.toLocaleString(
            "en-IN",
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }
        );
}

if (discountElement) {
    discountElement.textContent =
        discount.toLocaleString(
            "en-IN",
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }
        );
}

if (totalElement) {
    totalElement.textContent =
        finalTotal.toLocaleString(
            "en-IN",
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }
        );
}

        /* =========================================
           SHOW FINAL TOTAL
        ========================================= */

        if (totalElement) {

            totalElement.textContent =
                finalTotal.toLocaleString(
                    "en-IN",
                    {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                    }
                );

        } else {

            console.error(
                "checkoutTotal NOT FOUND"
            );

        }


        /* =========================================
           CUSTOMER NAME
        ========================================= */

        const nameInput =
            document.getElementById(
                "checkoutFullName"
            );


        if (nameInput) {

            nameInput.value =
                currentUser.name || "";

        }


        /* =========================================
           CUSTOMER PHONE
        ========================================= */

        const phoneInput =
            document.getElementById(
                "checkoutPhone"
            );


        if (phoneInput) {

            phoneInput.value =
                currentUser.phone || "";

        }
        /* -----------------------------------------------
   CUSTOMER EMAIL
----------------------------------------------- */

const emailInput =
    document.getElementById(
        "checkoutEmail"
    );

if (emailInput) {
    emailInput.value =
        currentUser.email || "";
}



        /* =========================================
           OPEN CHECKOUT MODAL
        ========================================= */

        const modal =
            document.getElementById(
                "checkoutModal"
            );


        if (!modal) {

            console.error(
                "checkoutModal NOT FOUND"
            );

            alert(
                "Checkout window not found."
            );

            return;
        }


        modal.classList.remove(
            "hidden"
        );


        console.log(
            "CHECKOUT OPENED SUCCESSFULLY"
        );

    }

    catch (error) {

        console.error(
            "CHECKOUT ERROR:",
            error
        );

        alert(
            "Unable to load checkout."
        );

    }

}
/* =========================================================
   PINCODE ADDRESS LOOKUP
   Uses India Post Pincode API
   ========================================================= */

async function fetchPincodeAddress() {

    const pincodeInput =
        document.getElementById("deliveryPincode");

    const cityInput =
        document.getElementById("deliveryCity");

    const stateInput =
        document.getElementById("deliveryState");

    const postOfficeInput =
        document.getElementById("deliveryPostOffice");

    const message =
        document.getElementById("checkoutMessage");

    const button =
        document.getElementById("pincodeBtn");


    if (!pincodeInput) return;


    const pincode =
        pincodeInput.value.trim();/* =========================================================
   PINCODE CHANGE HANDLER
   ENABLE GET ADDRESS FOR A NEW PINCODE
   ========================================================= */

function handlePincodeChange() {

    const pincodeInput =
        document.getElementById("deliveryPincode");

    const button =
        document.getElementById("pincodeBtn");

    const message =
        document.getElementById("checkoutMessage");

    if (!pincodeInput || !button) {
        return;
    }

    const currentPincode =
        pincodeInput.value.trim();


    /* -----------------------------------------
       NEW PINCODE ENTERED
    ----------------------------------------- */

    if (currentPincode !== verifiedPincode) {

        button.disabled = false;

        button.style.display = "block";

        button.textContent =
            "🔍 Get Address";


        if (message) {

            message.textContent = "";

            message.style.color = "";

        }


        /* Reset input styling */

        pincodeInput.style.border = "";

        pincodeInput.style.background = "";

    }

}

    /* -----------------------------------------
       VALIDATE PINCODE
    ----------------------------------------- */

    if (!/^[0-9]{6}$/.test(pincode)) {

        if (message) {

            message.textContent =
                "Please enter a valid 6 digit PIN code.";

            message.style.color = "red";

        }

        return;
    }


    try {

        if (button) {

            button.disabled = true;

            button.textContent = "Loading...";

        }


        if (message) {

            message.textContent =
                "Finding address...";

            message.style.color = "blue";

        }


        const response = await fetch(
            `https://api.postalpincode.in/pincode/${pincode}`
        );


        if (!response.ok) {

            throw new Error(
                "Unable to fetch pincode details."
            );

        }


        const data =
            await response.json();


        /* -----------------------------------------
           CHECK API RESPONSE
        ----------------------------------------- */

        if (
            !data ||
            !data[0] ||
            data[0].Status !== "Success" ||
            !data[0].PostOffice ||
            data[0].PostOffice.length === 0
        ) {

            throw new Error(
                "Pincode not found."
            );

        }


        const postOffice =
            data[0].PostOffice[0];


        /* -----------------------------------------
           GET ADDRESS INFORMATION
        ----------------------------------------- */

        const district =
            postOffice.District || "";

        const state =
            postOffice.State || "";

        const officeName =
            postOffice.Name || "";


        /* -----------------------------------------
           FILL FORM
        ----------------------------------------- */

        if (cityInput) {

            cityInput.value = district;

        }


        if (stateInput) {

            stateInput.value = state;

        }


        if (postOfficeInput) {

            postOfficeInput.value =
                officeName;

        }


        /* -----------------------------------------
           SHOW ADDRESS PREVIEW
        ----------------------------------------- */
/* -----------------------------------------
   SHOW ADDRESS PREVIEW
----------------------------------------- */

updateAddressPreview();


/* -----------------------------------------
   SAVE VERIFIED PINCODE
----------------------------------------- */

verifiedPincode = pincode;


/* -----------------------------------------
   DISABLE GET ADDRESS BUTTON
----------------------------------------- */

if (button) {

    button.disabled = true;

    button.textContent =
        "✓ Address Found";

}


/* -----------------------------------------
   SUCCESS MESSAGE
----------------------------------------- */

if (message) {

    message.textContent =
        "✓ PIN code verified successfully.";

    message.style.color = "green";

}
    } catch (error) {

        console.error(
            "PINCODE ERROR:",
            error
        );


        if (cityInput) {
            cityInput.value = "";
        }

        if (stateInput) {
            stateInput.value = "";
        }

        if (postOfficeInput) {
            postOfficeInput.value = "";
        }


        if (message) {

            message.textContent =
                error.message ||
                "Unable to find this PIN code.";

            message.style.color = "red";

        }
    } finally {

    if (button) {

        /*
         * Keep button disabled after successful lookup.
         * It will be enabled again automatically
         * when the user enters a different Pincode.
         */

        if (pincode === verifiedPincode) {

            button.disabled = true;

            button.textContent =
                "✓ Address Found";

        } else {

            button.disabled = false;

            button.textContent =
                "🔍 Get Address";

        }

    }

}

}

/* =========================================================
   UPDATE ADDRESS PREVIEW
   ========================================================= */

function updateAddressPreview() {

    const pincode =
        document.getElementById("deliveryPincode");

    const city =
        document.getElementById("deliveryCity");

    const state =
        document.getElementById("deliveryState");

    const postOffice =
        document.getElementById("deliveryPostOffice");

    const address =
        document.getElementById("deliveryAddress");

    const preview =
        document.getElementById("addressPreview");

    const fullPreview =
        document.getElementById("fullAddressPreview");


    if (
        !pincode ||
        !city ||
        !state ||
        !postOffice ||
        !address ||
        !preview ||
        !fullPreview
    ) {

        return;

    }


    const houseAddress =
        address.value.trim();


    const parts = [

        houseAddress,

        postOffice.value.trim(),

        city.value.trim(),

        state.value.trim(),

        pincode.value.trim()

    ].filter(Boolean);


    if (parts.length === 0) {

        preview.classList.add("hidden");

        fullPreview.textContent = "";

        return;

    }


    fullPreview.textContent =
        parts.join(", ");


    preview.classList.remove("hidden");

}

/* =========================================================
   PLACE ORDER
   NO PAYMENT METHOD
   ========================================================= */

/* =========================================================
   PLACE ORDER
   NO PAYMENT METHOD
   10% DISCOUNT
   ========================================================= */
   /* =====================================================
   PLACE ORDER
===================================================== */

async function placeOrder(event) {

    event.preventDefault();
/* =====================================================
   CHECKOUT ERROR
===================================================== */

function showCheckoutError(message) {

    const element =
        document.getElementById(
            "checkoutMessage"
        );


    if (element) {

        element.textContent =
            "⚠️ " + message;

        element.style.color =
            "#dc2626";

    }

}
/* =====================================================
   DEFAULT ADDRESS
===================================================== */

function getDefaultAddressKey() {

    if (!currentUser) {
        return "electromart_default_address_guest";
    }

    return "electromart_default_address_" +
           String(
               currentUser.id ||
               currentUser.email ||
               "user"
           );
}


/* =====================================================
   SAVE DEFAULT ADDRESS
===================================================== */

function saveDefaultAddress() {

    const address = {

        pincode:
            document.getElementById(
                "deliveryPincode"
            )?.value.trim() || "",

        city:
            document.getElementById(
                "deliveryCity"
            )?.value.trim() || "",

        state:
            document.getElementById(
                "deliveryState"
            )?.value.trim() || "",

        postOffice:
            document.getElementById(
                "deliveryPostOffice"
            )?.value.trim() || "",

        houseAddress:
            document.getElementById(
                "deliveryAddress"
            )?.value.trim() || ""

    };


    if (
        !address.pincode ||
        !address.city ||
        !address.state ||
        !address.postOffice ||
        !address.houseAddress
    ) {

        return false;
    }


    localStorage.setItem(
        getDefaultAddressKey(),
        JSON.stringify(address)
    );


    console.log(
        "Default address saved:",
        address
    );


    return true;
}


/* =====================================================
   LOAD DEFAULT ADDRESS
===================================================== */
    function loadDefaultAddress() {

    const saved =
        localStorage.getItem(
            getDefaultAddressKey()
        );

    if (!saved) {
        return false;
    }

    try {

        const address =
            JSON.parse(saved);

        const pincode =
            document.getElementById(
                "deliveryPincode"
            );

        const city =
            document.getElementById(
                "deliveryCity"
            );

        const state =
            document.getElementById(
                "deliveryState"
            );

        const postOffice =
            document.getElementById(
                "deliveryPostOffice"
            );

        const houseAddress =
            document.getElementById(
                "deliveryAddress"
            );


        if (pincode) {
            pincode.value =
                address.pincode || "";
        }

        if (city) {
            city.value =
                address.city || "";
        }

        if (state) {
            state.value =
                address.state || "";
        }

        if (postOffice) {
            postOffice.value =
                address.postOffice || "";
        }

        if (houseAddress) {
            houseAddress.value =
                address.houseAddress || "";
        }


        // Mark pincode as verified
        if (address.pincode) {
            verifiedPincode =
                address.pincode;
        }


        // Check the default-address checkbox
       

       

    } catch (error) {

        console.error(
            "Error loading default address:",
            error
        );

        return false;
    }
}


    /* -----------------------------------------------
       GET ELEMENTS
    ----------------------------------------------- */

    const nameElement =
        document.getElementById(
            "checkoutFullName"
        );


    const phoneElement =
        document.getElementById(
            "checkoutPhone"
        );
     const emailElement =
    document.getElementById(
        "checkoutEmail"
    );

    const pincodeElement =
        document.getElementById(
            "deliveryPincode"
        );


    const cityElement =
        document.getElementById(
            "deliveryCity"
        );


    const stateElement =
        document.getElementById(
            "deliveryState"
        );


    const postOfficeElement =
        document.getElementById(
            "deliveryPostOffice"
        );


    const addressElement =
        document.getElementById(
            "deliveryAddress"
        );


    const messageElement =
        document.getElementById(
            "checkoutMessage"
        );


    const placeOrderButton =
        document.getElementById(
            "placeOrderBtn"
        );


    /* -----------------------------------------------
       GET VALUES
    ----------------------------------------------- */

    const name =
        nameElement
            ? nameElement.value.trim()
            : "";


    const phone =
        phoneElement
            ? phoneElement.value.trim()
            : "";
    const email =
    emailElement
        ? emailElement.value.trim()
        : "";

    const pincode =
        pincodeElement
            ? pincodeElement.value.trim()
            : "";


    const city =
        cityElement
            ? cityElement.value.trim()
            : "";


    const state =
        stateElement
            ? stateElement.value.trim()
            : "";


    const postOffice =
        postOfficeElement
            ? postOfficeElement.value.trim()
            : "";


    const houseAddress =
        addressElement
            ? addressElement.value.trim()
            : "";


    /* -----------------------------------------------
       VALIDATE NAME
    ----------------------------------------------- */

    if (!name) {

        showCheckoutError(
            "Please enter your full name."
        );

        nameElement?.focus();

        return;
    }


    /* -----------------------------------------------
       VALIDATE PHONE
    ----------------------------------------------- */

    if (!/^[0-9]{10}$/.test(phone)) {

        showCheckoutError(
            "Please enter a valid 10-digit phone number."
        );

        phoneElement?.focus();

        return;
    }

    /* -----------------------------------------------
   VALIDATE EMAIL
----------------------------------------------- */

if (
    !email ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
) {
    showCheckoutError(
        "Please enter a valid Gmail / Email address."
    );

    emailElement?.focus();

    return;
}


    /* -----------------------------------------------
       VALIDATE PINCODE
    ----------------------------------------------- */

    if (!/^[0-9]{6}$/.test(pincode)) {

        showCheckoutError(
            "Please enter a valid 6-digit Pincode."
        );

        pincodeElement?.focus();

        return;
    }


    /* -----------------------------------------------
       VALIDATE CITY
    ----------------------------------------------- */

    if (!city) {

        showCheckoutError(
            "Please click Get Address to verify the Pincode."
        );

        return;
    }


    /* -----------------------------------------------
       VALIDATE STATE
    ----------------------------------------------- */

    if (!state) {

        showCheckoutError(
            "Please verify the Pincode first."
        );

        return;
    }


    /* -----------------------------------------------
       VALIDATE POST OFFICE
    ----------------------------------------------- */

    if (!postOffice) {

        showCheckoutError(
            "Please verify the Pincode first."
        );

        return;
    }


    /* -----------------------------------------------
       VALIDATE HOUSE ADDRESS
    ----------------------------------------------- */

    if (!houseAddress) {

        showCheckoutError(
            "Please enter your house number, street or area."
        );

        addressElement?.focus();

        return;
    }


    /* -----------------------------------------------
       LOGIN CHECK
    ----------------------------------------------- */

    if (!currentUser) {

        showCheckoutError(
            "Please login before placing an order."
        );

        return;
    }


    /* -----------------------------------------------
       CART CHECK
    ----------------------------------------------- */

    if (
        !currentCart ||
        currentCart.length === 0
    ) {

        showCheckoutError(
            "Your cart is empty."
        );

        return;
    }


    /* -----------------------------------------------
       COMPLETE ADDRESS
    ----------------------------------------------- */

    const completeAddress =

        `Name: ${name}, ` +

        `Phone: ${phone}, ` +

        `House/Street/Area: ${houseAddress}, ` +

        `Post Office: ${postOffice}, ` +

        `City: ${city}, ` +

        `State: ${state}, ` +

        `Pincode: ${pincode}`;
        


    try {

        /* -------------------------------------------
           DISABLE BUTTON
        ------------------------------------------- */

        if (placeOrderButton) {

            placeOrderButton.disabled =
                true;

            placeOrderButton.textContent =
                "Placing Order...";

        }


        if (messageElement) {

            messageElement.textContent =
                "Placing your order...";

            messageElement.style.color =
                "#2563eb";

        }


        /* -------------------------------------------
           SEND TO BACKEND
        ------------------------------------------- */

        const response =
            await fetch(
                "/api/orders",
                {
                    method: "POST",

                    credentials: "include",

                    headers: {

                        "Content-Type":
                            "application/json",

                        "Accept":
                            "application/json"

                    },
                body: JSON.stringify({

    address:
        completeAddress,

    name:
        name,

    phone:
        phone,

    email:
        email

})

                }
            );


        const data =
            await response.json();


        console.log(
            "ORDER RESPONSE:",
            data
        );


        /* -------------------------------------------
           CHECK RESPONSE
        ------------------------------------------- */

        if (
            !response.ok ||
            !data.success
        ) {

            throw new Error(
                data.message ||
                "Unable to place order."
            );

        }


        /* -------------------------------------------
           SUCCESS
        ------------------------------------------- */

        if (messageElement) {

            messageElement.textContent =
                "✅ Order placed successfully!";

            messageElement.style.color =
                "#16a34a";

        }


        showToast(
            "Order placed successfully!"
        );


        /* -------------------------------------------
           CLEAR CART
        ------------------------------------------- */

        currentCart = [];


        updateCartCount();


        /* -------------------------------------------
           CLOSE AFTER 1.2 SECONDS
        ------------------------------------------- */

        setTimeout(
            function() {

                closeModals();

                loadCart();

            },
            1200
        );


    }
    catch (error) {

        console.error(
            "PLACE ORDER ERROR:",
            error
        );


        if (messageElement) {

            messageElement.textContent =
                "❌ " +
                (
                    error.message ||
                    "Unable to place order."
                );

            messageElement.style.color =
                "#dc2626";

        }

    }
    finally {

        if (placeOrderButton) {

            placeOrderButton.disabled =
                false;

            placeOrderButton.textContent =
                "🛍️ Place Order";

        }

    }

}

/* =========================================================
   LIVE ADDRESS PREVIEW
   ========================================================= */

document.addEventListener(
    "input",
    function (event) {

        if (
            event.target.id ===
            "deliveryAddress"
        ) {

            updateAddressPreview();

        }

    }
);
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
                    <div class="order-card"
         onclick="openOrderDetails(${order.id})">
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
/* =====================================================
   OPEN ORDER DETAILS
===================================================== */

async function openOrderDetails(orderId) {

    const modal =
        document.getElementById(
            "orderDetailsModal"
        );

    if (!modal) {
        console.error(
            "orderDetailsModal not found"
        );
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


        if (
            !response.ok ||
            !data.success
        ) {

            throw new Error(
                data.message ||
                "Unable to load order details."
            );
        }


        const order =
            data.orders.find(
                item =>
                    Number(item.id) ===
                    Number(orderId)
            );


        if (!order) {

            alert(
                "Order not found."
            );

            return;
        }
     currentInvoiceOrder = order;

        /* ORDER ID */

        document.getElementById(
            "detailsOrderId"
        ).textContent =
            `#${order.id}`;


        /* STATUS */

        const status =
            order.status ||
            "Order Placed";


        document.getElementById(
            "detailsOrderStatus"
        ).textContent =
            status;


        /* ITEMS */

        const items =
            Array.isArray(order.items)
                ? order.items
                : [];


        document.getElementById(
            "detailsItems"
        ).textContent =
            `${items.length} ${
                items.length === 1
                    ? "item"
                    : "items"
            }`;


        /* ADDRESS */

        document.getElementById(
            "detailsAddress"
        ).textContent =
            order.address ||
            "N/A";


        /* LOCATION */

        document.getElementById(
            "detailsLocation"
        ).textContent =
            order.current_location ||
            getDefaultOrderLocation(status);


        /* TOTAL */

        const total =
            Number(order.total || 0);


        document.getElementById(
            "detailsTotal"
        ).textContent =
            `₹${total.toLocaleString("en-IN")}`;


        /* DELIVERY CHARGE */

        document.getElementById(
            "detailsDeliveryCharge"
        ).textContent =
            "₹0";


        /* DELIVERY DAYS */

        document.getElementById(
            "detailsDeliveryDays"
        ).textContent =
            getDeliveryDays(status);


        /* PRODUCTS */

        const productsContainer =
            document.getElementById(
                "detailsProducts"
            );


        productsContainer.innerHTML =
            items.map(
                item => `
    <div class="details-product">

    ${
        item.icon
            ? `
                <img
                    src="${escapeHTML(item.icon)}"
                    alt="${escapeHTML(item.name || "Product")}"
                >
              `
            : ""
    }

    <div class="details-product-info">

        <strong>
            ${escapeHTML(
                item.name || "Product"
            )}
        </strong>

        <span>
            Quantity: ${item.quantity}
        </span>

        <span>
            ₹${Number(
                item.price || 0
            ).toLocaleString("en-IN")}
        </span>

        ${
            String(order.status).toLowerCase() === "delivered"
                ? `
                    <button
                        type="button"
                        class="product-rate-btn"
                        onclick="
                            event.stopPropagation();
                            openReviewModal(
                                ${Number(item.product_id)}
                            );
                        "
                    >
                        ⭐ Rate & Review
                    </button>
                  `
                : ""
        }

    </div>

</div>
                `
            ).join("");


        /* TRACKING */

        updateOrderDetailTracking(
            status
        );



 /* =====================================================
   ACTION BUTTONS
===================================================== */
/* ACTION BUTTONS */

const actions =
    document.getElementById(
        "orderDetailsActions"
    );

if (actions) {

    let reviewButton = "";

    if (
        status.toLowerCase() ===
        "delivered" &&
        items.length > 0
    ) {

        reviewButton = `

            <button
                type="button"
                class="order-details-review-btn"
                onclick="
                    event.stopPropagation();
                    openReviewModal(
                        ${Number(items[0].product_id)}
                    );
                "
            >
                ⭐ Rate & Review
            </button>

        `;
    }


    let trackButton = "";

    if (
        status.toLowerCase() !==
        "delivered"
    ) {

        trackButton = `

            <button
                type="button"
                class="order-details-track-btn"
                onclick="
                    event.stopPropagation();
                    trackOrder(${Number(order.id)});
                "
            >
                📍 Track My Order
            </button>

        `;
    }


    actions.innerHTML = `

        <div class="order-action-row">

            ${trackButton}

            ${reviewButton}

            <button
                type="button"
                class="invoice-print-btn"
                onclick="
                    event.stopPropagation();
                    printCustomerInvoice();
                "
            >
                🖨️ Print Invoice
            </button>


            <button type="button"
    class="invoice-download-btn"
    id="customerDownloadInvoiceBtn"
>
    📥 Download Invoice
</button>
        </div>

    `;
}

        /* SHOW MODAL */

        modal.classList.remove(
            "hidden"
        );


        document.body.style.overflow =
            "hidden";


    } catch (error) {

        console.error(
            "ORDER DETAILS ERROR:",
            error
        );

        alert(
            error.message
        );
    }
}
/* =====================================================
   DOWNLOAD INVOICE BUTTON CLICK
===================================================== */

document.addEventListener(
    "click",
    function (event) {

        const button =
            event.target.closest(
                "#customerDownloadInvoiceBtn"
            );

        if (!button) {
            return;
        }

        event.preventDefault();
        event.stopPropagation();

        console.log(
            "DOWNLOAD INVOICE BUTTON CLICKED"
        );

        console.log(
            "currentInvoiceOrder:",
            currentInvoiceOrder
        );

        downloadCustomerInvoice();

    }
);


/* =====================================================
   CLOSE ORDER DETAILS
===================================================== */

function closeOrderDetails() {

    const modal =
        document.getElementById(
            "orderDetailsModal"
        );

    if (modal) {

        modal.classList.add(
            "hidden"
        );

    }

    document.body.style.overflow =
        "";
}


/* =====================================================
   DEFAULT LOCATION
===================================================== */

function getDefaultOrderLocation(
    status
) {

    switch (
        String(status).toLowerCase()
    ) {

        case "order placed":
            return "Order Processing Center";

        case "processing":
            return "Warehouse";

        case "shipped":
            return "Hyderabad Sorting Center";

        case "out for delivery":
            return "Hyderabad Local Delivery Hub";

        case "delivered":
            return "Delivered to Customer";

        case "cancelled":
            return "Order Cancelled";

        default:
            return "Processing Center";
    }
}


/* =====================================================
   DELIVERY DAYS
===================================================== */

function getDeliveryDays(status) {

    switch (
        String(status).toLowerCase()
    ) {

        case "order placed":
            return "4 days";

        case "processing":
            return "3 days";

        case "shipped":
            return "2 days";

        case "out for delivery":
            return "Today";

        case "delivered":
            return "Delivered";

        default:
            return "-";
    }
}


/* =====================================================
   UPDATE TRACKING
===================================================== */

function updateOrderDetailTracking(
    status
) {

    const statusMap = {

        "order placed": 0,

        "processing": 1,

        "shipped": 2,

        "out for delivery": 3,

        "delivered": 4

    };


    let current =
        statusMap[
            String(status)
                .toLowerCase()
        ];


    if (
        current === undefined
    ) {

        current = 0;

    }


    for (
        let i = 0;
        i < 5;
        i++
    ) {

        const step =
            document.getElementById(
                `detailStep${i}`
            );


        if (!step) continue;


        step.classList.remove(
            "active",
            "current"
        );


        if (i <= current) {

            step.classList.add(
                "active"
            );

        }


        if (i === current) {

            step.classList.add(
                "current"
            );

        }
    }


    for (
        let i = 0;
        i < 4;
        i++
    ) {

        const line =
            document.getElementById(
                `detailLine${i}`
            );


        if (!line) continue;


        line.classList.toggle(
            "active",
            i < current
        );

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
    const element = document.getElementById("wishlistCount");

    if (!element) return;

    const count = currentWishlist.length;

    element.textContent = count;

    if (count > 0) {
        element.style.display = "inline-flex";
    } else {
        element.style.display = "none";
    }
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
    ${renderProductImage(
        item,
        "wishlist-product-image"
    )}
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
   SHARE PRODUCT
========================================================= */

function shareProduct(productId, productName) {

    const shareUrl =
        window.location.origin +
        window.location.pathname +
        "?product=" +
        encodeURIComponent(productId);

    const shareText =
        "Check out " +
        productName +
        " on ElectroMart!";

    // WhatsApp
    const whatsappUrl =
        "https://wa.me/?text=" +
        encodeURIComponent(
            shareText + "\n" + shareUrl
        );

    // Facebook
    const facebookUrl =
        "https://www.facebook.com/sharer/sharer.php?u=" +
        encodeURIComponent(shareUrl);

    // Instagram
    const instagramUrl =
        "https://www.instagram.com/";

    const modal = document.createElement("div");

    modal.className = "share-modal-overlay";

    modal.innerHTML = `
        <div class="share-modal">

            <button
                class="share-close"
                onclick="this.closest('.share-modal-overlay').remove()">
                ×
            </button>

            <h2>Share Product</h2>

            <p>
                Share <strong>${productName}</strong>
            </p>

            <div class="share-buttons">

                <a
                    href="${whatsappUrl}"
                    target="_blank"
                    class="share-btn whatsapp">
                    🟢 WhatsApp
                </a>

                <a
                    href="${facebookUrl}"
                    target="_blank"
                    class="share-btn facebook">
                    🔵 Facebook
                </a>

                <a
                    href="${instagramUrl}"
                    target="_blank"
                    class="share-btn instagram">
                    🟣 Instagram
                </a>

            </div>

            <button
                class="copy-share-btn"
                onclick="copyProductLink('${shareUrl}')">
                🔗 Copy Product Link
            </button>

        </div>
    `;

    document.body.appendChild(modal);
}


/* =========================================================
   COPY PRODUCT LINK
========================================================= */

function copyProductLink(url) {

    navigator.clipboard
        .writeText(url)
        .then(() => {

            showToast(
                "Product link copied!"
            );

        })
        .catch(() => {

            showToast(
                "Unable to copy link."
            );

        });
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

    // SUBJECT IS REQUIRED ONLY FOR COMPLAINT

if (issueType === "Complaint" && subject.length < 3) {

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

/* =========================================================
   DISPLAY SUPPORT REQUESTS WITH CHAT
   ========================================================= */

async function displaySupportRequests() {

    const container =
        document.getElementById(
            "supportRequestsContainer"
        );

    if (!container) return;

    if (
        !Array.isArray(currentSupportRequests) ||
        currentSupportRequests.length === 0
    ) {

        container.innerHTML = `
            <div class="support-empty">

                <div class="support-empty-icon">
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

    for (
        const request
        of currentSupportRequests
    ) {

        const card =
            document.createElement("div");

        card.className =
            "support-request";

        const status =
            request.status || "Open";

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
                🛟 Ticket #${Number(request.id)}
            </h4>

            <p>
                <strong>Subject:</strong>
                ${escapeHTML(
                    request.subject || ""
                )}
            </p>

            <p>
                <strong>Issue:</strong>
                ${escapeHTML(
                    request.issue_type || ""
                )}
            </p>

            <p>
                <strong>Order:</strong>
                ${
                    request.order_id
                        ? "#" +
                          Number(request.order_id)
                        : "General Issue"
                }
            </p>

            <p>
                <strong>Message:</strong>
                ${escapeHTML(
                    request.message || ""
                )}
            </p>

            <p>
                <strong>Status:</strong>

                <span
                    class="support-status ${statusClass}">
                    ${escapeHTML(status)}
                </span>
            </p>

            <p>
                <strong>Created:</strong>

                ${
                    request.created_at
                        ? new Date(
                            request.created_at
                        ).toLocaleString("en-IN")
                        : "-"
                }
            </p>

            <!-- OLD ADMIN REPLY -->

            ${
                request.admin_reply
                    ? `
                        <div class="support-reply">

                            <strong>
                                👨‍💼 Admin Reply
                            </strong>

                            <p>
                                ${escapeHTML(
                                    request.admin_reply
                                )}
                            </p>

                        </div>
                    `
                    : ""
            }

            <!-- CHAT -->

            <div
                class="support-chat"
                id="supportChat-${Number(request.id)}">

                <div class="chat-loading">
                    Loading conversation...
                </div>

            </div>

            <!-- CUSTOMER MESSAGE -->

            ${
                status.toLowerCase() !== "closed"
                    ? `

                        <div class="customer-chat-box">

                            <textarea
                                class="customer-chat-input"
                                id="customerMessage-${Number(request.id)}"
                                maxlength="2000"
                                placeholder="Type your reply to admin...">
                            </textarea>

                            <button
                                type="button"
                                class="customer-chat-send"
                                data-support-id="${Number(request.id)}">

                                💬 Send Reply

                            </button>

                        </div>

                    `
                    : `

                        <div class="ticket-closed-message">
                            🔒 This support ticket is closed.
                        </div>

                    `
            }

        `;

        container.appendChild(card);

        await loadSupportChat(
            Number(request.id)
        );
    }
}

/* =========================================================
   LOAD SUPPORT CHAT
   ========================================================= */

async function loadSupportChat(
    supportId
) {

    const chat =
        document.getElementById(
            `supportChat-${supportId}`
        );

    if (!chat) return;

    try {

        const response =
            await fetch(
                `/api/support/${supportId}/messages`,
                {
                    credentials: "include",
                    headers: {
                        "Accept":
                            "application/json"
                    }
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
                "Unable to load chat."
            );
        }

        const messages =
            Array.isArray(data.messages)
                ? data.messages
                : [];

        if (messages.length === 0) {

            chat.innerHTML = `
                <div class="chat-empty">
                    💬 No replies yet.
                </div>
            `;

            return;
        }

        chat.innerHTML = `

            <div class="chat-title">
                💬 Conversation
            </div>

            <div class="chat-messages">

                ${messages.map(
                    message => {

                        const isCustomer =
                            message.sender_type ===
                            "customer";

                        return `

                            <div
                                class="
                                    chat-message
                                    ${
                                        isCustomer
                                            ? "customer-message"
                                            : "admin-message"
                                    }
                                ">

                                <div
                                    class="chat-sender">

                                    ${
                                        isCustomer
                                            ? "👤 You"
                                            : "👨‍💼 Admin"
                                    }

                                </div>

                                <div
                                    class="chat-text">

                                    ${escapeHTML(
                                        message.message
                                    )}

                                </div>

                                <div
                                    class="chat-time">

                                    ${
                                        message.created_at
                                            ? new Date(
                                                message.created_at
                                            ).toLocaleString(
                                                "en-IN"
                                            )
                                            : ""
                                    }

                                </div>

                            </div>

                        `;
                    }
                ).join("")}

            </div>
        `;

        /* Scroll chat to bottom */

        const messagesBox =
            chat.querySelector(
                ".chat-messages"
            );

        if (messagesBox) {

            messagesBox.scrollTop =
                messagesBox.scrollHeight;
        }

    } catch (error) {

        console.error(
            "LOAD SUPPORT CHAT ERROR:",
            error
        );

        chat.innerHTML = `
            <div class="chat-error">
                ⚠️ Unable to load conversation.
            </div>
        `;
    }
}

/* =========================================================
   SEND CUSTOMER SUPPORT CHAT MESSAGE
   ========================================================= */

async function sendCustomerSupportMessage(
    supportId
) {

    if (!currentUser) {

        showToast(
            "Please login first."
        );

        openLogin();

        return;
    }

    const input =
        document.getElementById(
            `customerMessage-${supportId}`
        );

    if (!input) return;

    const message =
        input.value.trim();

    if (!message) {

        showToast(
            "Please type a message."
        );

        input.focus();

        return;
    }

    if (message.length > 2000) {

        showToast(
            "Message cannot exceed 2000 characters."
        );

        return;
    }

    const button =
        document.querySelector(
            `.customer-chat-send[data-support-id="${supportId}"]`
        );

    try {

        if (button) {

            button.disabled = true;

            button.textContent =
                "Sending...";
        }

        const response =
            await fetch(
                `/api/support/${supportId}/messages`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    credentials: "include",

                    body: JSON.stringify({
                        message
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
                "Unable to send message."
            );
        }

        input.value = "";

        showToast(
            "Reply sent successfully."
        );

        await loadSupportChat(
            supportId
        );

        await loadSupportRequests();

    } catch (error) {

        console.error(
            "SEND SUPPORT MESSAGE ERROR:",
            error
        );

        showToast(
            error.message ||
            "Unable to send reply."
        );

    } finally {

        if (button) {

            button.disabled = false;

            button.textContent =
                "💬 Send Reply";
        }
    }
}

/* =========================================================
   CUSTOMER CHAT BUTTON
   ========================================================= */

document.addEventListener(
    "click",
    function (event) {

        const button =
            event.target.closest(
                ".customer-chat-send"
            );

        if (!button) return;

        const supportId =
            Number(
                button.dataset.supportId
            );

        if (!supportId) return;

        sendCustomerSupportMessage(
            supportId
        );
    }
);

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

/* =========================================================
   SHOW SUBJECT ONLY WHEN COMPLAINT IS SELECTED
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    const issueType = document.getElementById("issueType");

    const subjectGroup =
        document.getElementById("subjectGroup");

    const supportSubject =
        document.getElementById("supportSubject");


    if (issueType && subjectGroup && supportSubject) {

        issueType.addEventListener("change", function () {

            if (this.value === "Complaint") {

                // Show subject
                subjectGroup.style.display = "block";

                // Make subject required
                supportSubject.required = true;

                // Focus subject
                supportSubject.focus();

            } else {

                // Hide subject
                subjectGroup.style.display = "none";

                // Remove required
                supportSubject.required = false;

                // Clear old subject
                supportSubject.value = "";
            }

        });

    }

});
// =====================================================
// NOTIFICATION SYSTEM
// =====================================================


/* =========================================================
   ELECTROMART NOTIFICATION SYSTEM
   ========================================================= */
let notifications = [];

const NOTIFICATION_STORAGE_KEY =
    "electromartNotifications";

function loadStoredNotifications() {

    try {

        const saved =
            localStorage.getItem(
                NOTIFICATION_STORAGE_KEY
            );

        notifications =
            saved
                ? JSON.parse(saved)
                : [];

        if (!Array.isArray(notifications)) {
            notifications = [];
        }

    } catch (error) {

        console.error(
            "Notification load error:",
            error
        );

        notifications = [];
    }
}

function saveStoredNotifications() {

    localStorage.setItem(
        NOTIFICATION_STORAGE_KEY,
        JSON.stringify(notifications)
    );
}


/* Add notification */
function addNotification(type, title, message, extraData = {}) {

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

    // Keep only latest 50
    notifications = notifications.slice(0, 50);

    saveStoredNotifications();

    renderNotifications();
}


/* Display notifications */
function renderNotifications() {

    const list = document.getElementById("notificationList");
    const count = document.getElementById("notificationCount");

    if (!list) return;

    const unreadCount =
        notifications.filter(n => !n.read).length;

    if (count) {
        count.textContent = unreadCount;

        count.style.display =
            unreadCount > 0 ? "inline-flex" : "none";
    }


    if (notifications.length === 0) {

        list.innerHTML = `
            <div class="notification-empty">
                🔔 No notifications
            </div>
        `;

        return;
    }


    list.innerHTML = notifications.map(notification => {

        const date = new Date(notification.date);

        return `
            <div
                class="notification-item ${notification.read ? "" : "unread"}"
                onclick="readNotification('${notification.id}')"
            >

                <div class="notification-icon">

                    ${
                        notification.type === "order"
                        ? "🚚"
                        : notification.type === "product"
                        ? "🛍️"
                        : notification.type === "stock"
                        ? "📦"
                        : "🔔"
                    }

                </div>

                <div class="notification-content">

                    <strong>
                        ${escapeNotificationText(notification.title)}
                    </strong>

                    <p>
                        ${escapeNotificationText(notification.message)}
                    </p>

                    <small>
                        ${date.toLocaleString()}
                    </small>

                </div>

            </div>
        `;

    }).join("");
}


/* Escape notification text */
function escapeNotificationText(text) {

    return String(text || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


/* Open / close notification panel */
/* =====================================================
   NOTIFICATION BUTTON
===================================================== */
function toggleNotifications(event) {

    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }

    const panel =
        document.getElementById("notificationPanel");

    if (!panel) {
        console.error("Notification panel not found!");
        return;
    }

    const isHidden =
        panel.classList.contains("hidden");

    if (isHidden) {
        panel.classList.remove("hidden");
    } else {
        panel.classList.add("hidden");
    }

    renderNotifications();
}

/* =====================================================
   CLOSE NOTIFICATION PANEL
===================================================== */

function closeNotifications() {

    const panel =
        document.getElementById("notificationPanel");

    if (panel) {
        panel.classList.add("hidden");
    }
}


/* =====================================================
   MARK ONE AS READ
===================================================== */
function readNotification(id) {

    const notification =
        notifications.find(
            item =>
                String(item.id) === String(id)
        );

    if (!notification) {
        return;
    }

    notification.read = true;

    saveStoredNotifications();

    renderNotifications();
}


/* =====================================================
   MARK ALL AS READ
===================================================== */

function markAllNotificationsRead() {

    notifications.forEach(notification => {
        notification.read = true;
    });

    renderNotifications();
}


/* =========================================================
   STEP 7 — DELIVERED ORDER NOTIFICATION
   ========================================================= */

async function checkDeliveredOrders() {
    try {

        const response = await fetch("/api/orders", {
            method: "GET",
            credentials: "include"
        });

        if (!response.ok) {
            console.log("Unable to check orders.");
            return;
        }

        const data = await response.json();

        /*
         * IMPORTANT:
         * /api/orders returns:
         * {
         *   success: true,
         *   orders: [...]
         * }
         */
        if (!data.success || !Array.isArray(data.orders)) {
            return;
        }

        const orders = data.orders;

        orders.forEach(order => {

            const status = String(
                order.status || ""
            ).trim().toLowerCase();

            /* Only create notification when Delivered */
            if (status !== "delivered") {
                return;
            }

            const orderId =
                order.id ||
                order.order_id ||
                order._id;

            if (!orderId) {
                return;
            }

            /* Prevent duplicate notification */
            const alreadyNotified =
                notifications.some(notification =>
                    notification.type === "order" &&
                    String(notification.orderId) ===
                    String(orderId)
                );

            if (alreadyNotified) {
                return;
            }

            /* Create notification */
            addNotification(
                "order",
                "Order Delivered 🚚",
                `Your order #${orderId} has been delivered successfully.`,
                {
                    orderId: orderId
                }
            );

            console.log(
                `Delivered notification created for Order #${orderId}`
            );

        });

    } catch (error) {

        console.error(
            "Delivered notification error:",
            error
        );

    }
}

/* =========================================================
   PRODUCT ADDED NOTIFICATION
   ========================================================= */

function notifyProductAdded(product) {

    const productName =
        product.name ||
        product.product_name ||
        "New product";


    addNotification(
        "product",
        "New Product Added",
        `${productName} has been added to ElectroMart.`
    );
}


/* =========================================================
   STOCK ADDED NOTIFICATION
   ========================================================= */

function notifyStockAdded(product, quantity) {

    const productName =
        product.name ||
        product.product_name ||
        "Product";


    addNotification(
        "stock",
        "Product Stock Updated",
        `${productName} stock increased by ${quantity} item(s).`
    );
}
/* =========================================================
   ORDER STATUS CHANGE NOTIFICATION
========================================================= */

async function checkOrderStatusChanges() {

    try {

        if (!currentUser) {
            return;
        }

        const response =
            await fetch(
                "/api/orders",
                {
                    method: "GET",
                    credentials: "include"
                }
            );

        if (!response.ok) {
            return;
        }

        const data =
            await response.json();

        if (
            !data.success ||
            !Array.isArray(data.orders)
        ) {
            return;
        }

        const orders =
            data.orders;

        const storageKey =
            "electromartOrderStatuses_" +
            currentUser.id;

        let oldStatuses = {};

        try {

            oldStatuses =
                JSON.parse(
                    localStorage.getItem(
                        storageKey
                    )
                ) || {};

        } catch (error) {

            oldStatuses = {};

        }


        const newStatuses = {};

        orders.forEach(
            function(order) {

                const orderId =
                    order.id ||
                    order.order_id ||
                    order._id;

                if (!orderId) {
                    return;
                }

                const newStatus =
                    String(
                        order.status ||
                        "Order Placed"
                    ).trim();

                newStatuses[orderId] =
                    newStatus;


                /*
                   Do not create notifications
                   during the first load.
                */

                if (
                    Object.keys(
                        oldStatuses
                    ).length === 0
                ) {
                    return;
                }


                const oldStatus =
                    oldStatuses[orderId];


                /*
                   Create notification only
                   when status actually changes.
                */

                if (
                    oldStatus &&
                    oldStatus !== newStatus
                ) {

                    addNotification(

                        "order",

                        "Order Status Updated 📦",

                        `Your order #${orderId} is now ${newStatus}.`,

                        {
                            orderId:
                                orderId,

                            status:
                                newStatus
                        }

                    );

                    console.log(
                        `Notification created: Order #${orderId} → ${newStatus}`
                    );

                }

            }
        );


        localStorage.setItem(
            storageKey,
            JSON.stringify(
                newStatuses
            )
        );


    } catch (error) {

        console.error(
            "ORDER STATUS NOTIFICATION ERROR:",
            error
        );

    }

}

/* =========================================================
   START NOTIFICATION SYSTEM
   ========================================================= */

function startNotificationSystem() {

    loadStoredNotifications();

    renderNotifications();

    /* Check order status immediately */
    checkOrderStatusChanges();

    /* Check every 10 seconds */
    setInterval(
        checkOrderStatusChanges,
        10000
    );
}


/* =========================================================
   LIVE NOTIFICATION SYNC
========================================================= */

window.addEventListener(
    "storage",
    function (event) {

        if (
            event.key ===
            NOTIFICATION_STORAGE_KEY
        ) {

            loadStoredNotifications();

            renderNotifications();

        }

    }
);
// =====================================================
// RENDER NOTIFICATIONS
// =====================================================
   function renderNotifications() {

    const list =
        document.getElementById("notificationList");

    const count =
        document.getElementById("notificationCount");

    const subtitle =
        document.getElementById("notificationSubtitle");

    if (!list) return;

    const unread =
        notifications.filter(
            notification => !notification.read
        );

    /* =========================
       NOTIFICATION COUNT
    ========================= */

    if (count) {

        if (unread.length > 0) {

            count.textContent = unread.length;
            count.style.display = "inline-flex";

        } else {

            count.textContent = "";
            count.style.display = "none";

        }
    }

    /* =========================
       SUBTITLE
    ========================= */

    if (subtitle) {

        if (unread.length === 0) {

            subtitle.textContent =
                "No new notifications";

        } else {

            subtitle.textContent =
                unread.length +
                (
                    unread.length === 1
                        ? " new notification"
                        : " new notifications"
                );

        }
    }

    /* =========================
       EMPTY
    ========================= */

    if (notifications.length === 0) {

        list.innerHTML = `
            <div class="notification-empty">

                <div style="font-size:40px;">
                    🔔
                </div>

                <h4>No Notifications</h4>

                <p>
                    You don't have any new notifications.
                </p>

            </div>
        `;

        return;
    }

    /* =========================
       DISPLAY
    ========================= */

    list.innerHTML =
        notifications.map(notification => {

            const date =
                new Date(notification.date);

            let icon = "🔔";

            if (notification.type === "order") {
                icon = "🚚";
            }

            else if (notification.type === "product") {
                icon = "🛍️";
            }

            else if (notification.type === "stock") {
                icon = "📦";
            }

            return `

                <div
                    class="notification-item ${
                        notification.read
                            ? ""
                            : "unread"
                    }"
                    onclick="readNotification('${notification.id}')"
                >

                    <div class="notification-icon">
                        ${icon}
                    </div>

                    <div class="notification-content">

                        <h4>
                            ${escapeNotificationText(
                                notification.title
                            )}
                        </h4>

                        <p>
                            ${escapeNotificationText(
                                notification.message
                            )}
                        </p>

                        <span class="notification-time">
                            ${date.toLocaleString()}
                        </span>

                    </div>

                </div>

            `;

        }).join("");
}

// =====================================================
// OPEN / CLOSE NOTIFICATION PANEL
// =====================================================

function closeNotifications() {

    const panel =
        document.getElementById("notificationPanel");

    if (panel) {
        panel.classList.add("hidden");
    }
}


// =====================================================
// READ ONE NOTIFICATION
// =====================================================

function readNotification(id) {

    const notification =
        notifications.find(
            item =>
                String(item.id) ===
                String(id)
        );

    if (!notification) {
        return;
    }

    notification.read = true;

    saveStoredNotifications();

    renderNotifications();
}


// =====================================================
// MARK ALL AS READ
// =====================================================
function markAllNotificationsRead() {

    notifications.forEach(notification => {
        notification.read = true;
    });

    saveStoredNotifications();

    renderNotifications();
}


// =====================================================
// INITIALIZE
// =====================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        renderNotifications();

    }
);


// =====================================================
// CLOSE WHEN CLICKING OUTSIDE
// =====================================================

document.addEventListener(
    "click",
    function (event) {

        const panel =
            document.getElementById(
                "notificationPanel"
            );

        const button =
            document.getElementById(
                "notificationBtn"
            );

        if (!panel || !button) return;

        if (
            !panel.contains(event.target) &&
            !button.contains(event.target)
        ) {

            panel.classList.add("hidden");

        }

    }
);


// =====================================================
// COMPLAINT SUBJECT
// SHOW SUBJECT ONLY FOR COMPLAINT
// =====================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        const issueType =
            document.getElementById("issueType");

        const subjectGroup =
            document.getElementById("subjectGroup");

        const supportSubject =
            document.getElementById("supportSubject");

        if (
            !issueType ||
            !subjectGroup ||
            !supportSubject
        ) {
            return;
        }

        issueType.addEventListener(
            "change",
            function () {

                if (this.value === "Complaint") {

                    subjectGroup.style.display =
                        "block";

                    supportSubject.required =
                        true;

                } else {

                    subjectGroup.style.display =
                        "none";

                    supportSubject.required =
                        false;

                    supportSubject.value = "";

                }

            }
        );

    }
);

/* =========================================================
   PRODUCT RATING & REVIEW SYSTEM
========================================================= */

let selectedRating = 0;
let selectedProductId = null;


/* =========================================================
   CREATE REVIEW MODAL
========================================================= */

function createReviewModal() {

    if (document.getElementById("reviewModal")) {
        return;
    }

    const modal = document.createElement("div");

    modal.id = "reviewModal";

    modal.innerHTML = `

        <div class="review-modal-overlay"
             onclick="closeReviewModal()">

            <div class="review-modal"
                 onclick="event.stopPropagation()">

                <button
                    class="review-close"
                    onclick="closeReviewModal()">
                    ×
                </button>

                <h2>
                    ⭐ Rate & Review
                </h2>

                <h3 id="reviewProductName">
                    Product
                </h3>

                <p class="review-label">
                    Select your rating
                </p>

                <div class="star-selector">

                    <button
                        type="button"
                        onclick="selectRating(1)">
                        ★
                    </button>

                    <button
                        type="button"
                        onclick="selectRating(2)">
                        ★
                    </button>

                    <button
                        type="button"
                        onclick="selectRating(3)">
                        ★
                    </button>

                    <button
                        type="button"
                        onclick="selectRating(4)">
                        ★
                    </button>

                    <button
                        type="button"
                        onclick="selectRating(5)">
                        ★
                    </button>

                </div>

                <p id="selectedRatingText"
                   class="selected-rating-text">
                    Please select a rating
                </p>

                <label>
                    Your Review
                </label>

                <textarea
                    id="reviewText"
                    maxlength="1000"
                    placeholder="Write your review here..."
                    rows="5"></textarea>

                <button
                    class="submit-review-btn"
                    onclick="submitProductReview()">
                    ⭐ Submit Review
                </button>

                <div
                    id="existingReviews"
                    class="existing-reviews">
                </div>

            </div>

        </div>
    `;

    document.body.appendChild(modal);
}


/* =========================================================
   OPEN REVIEW MODAL
========================================================= */

async function openReviewModal(productId) {

    if (!currentUser) {

        showToast(
            "Please login to rate this product."
        );

        openLogin();

        return;
    }

    selectedProductId = Number(productId);
    selectedRating = 0;

    createReviewModal();

    const modal =
        document.getElementById("reviewModal");

    const productNameElement =
        document.getElementById(
            "reviewProductName"
        );

    const reviewText =
        document.getElementById("reviewText");

    const ratingText =
        document.getElementById(
            "selectedRatingText"
        );

    /* Find product name from existing products */

    const product =
        products.find(
            item =>
                Number(item.id) ===
                Number(productId)
        );

    if (productNameElement) {

        productNameElement.textContent =
            product
                ? product.name
                : "Product";
    }

    if (reviewText) {

        reviewText.value = "";
    }

    if (ratingText) {

        ratingText.textContent =
            "Please select a rating";
    }

    updateRatingStars();

    if (modal) {

        modal.classList.add("show");
    }

    await loadProductReviews(
        selectedProductId
    );
}


/* =========================================================
   CLOSE REVIEW MODAL
========================================================= */

function closeReviewModal() {

    const modal =
        document.getElementById(
            "reviewModal"
        );

    if (modal) {

        modal.classList.remove("show");
    }

    selectedRating = 0;
    selectedProductId = null;
}


/* =========================================================
   SELECT STAR RATING
========================================================= */

function selectRating(rating) {

    selectedRating =
        Number(rating);

    updateRatingStars();

    const ratingText =
        document.getElementById(
            "selectedRatingText"
        );

    if (ratingText) {

        ratingText.textContent =
            `${selectedRating} out of 5 stars`;
    }
}


/* =========================================================
   UPDATE STAR DISPLAY
========================================================= */

function updateRatingStars() {

    const stars =
        document.querySelectorAll(
            ".star-selector button"
        );

    stars.forEach(
        (star, index) => {

            if (
                index + 1 <=
                selectedRating
            ) {

                star.classList.add(
                    "selected"
                );

            } else {

                star.classList.remove(
                    "selected"
                );
            }
        }
    );
}


/* =========================================================
   SUBMIT REVIEW
========================================================= */
/* =========================================================
   SUBMIT PRODUCT REVIEW
========================================================= */

async function submitProductReview() {

    if (!currentUser) {

        showToast("Please login first.");

        return;
    }


    if (!selectedProductId) {

        showToast("Product not selected.");

        return;
    }


    if (
        selectedRating < 1 ||
        selectedRating > 5
    ) {

        showToast(
            "Please select a star rating."
        );

        return;
    }


    const reviewElement =
        document.getElementById(
            "reviewText"
        );


    const review =
        reviewElement
            ? reviewElement.value.trim()
            : "";


    try {

        const response =
            await fetch(
                `/api/products/${selectedProductId}/reviews`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    credentials: "include",

                    body: JSON.stringify({

                        rating:
                            Number(selectedRating),

                        review:
                            review

                    })
                }
            );


        const data =
            await response.json();


        if (
            !response.ok ||
            !data.success
        ) {

            showToast(
                data.message ||
                "Unable to submit rating."
            );

            return;
        }


        /* SUCCESS */

        showToast(
            "⭐ Rating submitted successfully!"
        );


        /* CLOSE REVIEW POPUP */

        closeReviewModal();


        /*
         * IMPORTANT:
         * Reload products from database
         * so average_rating and review_count
         * are updated.
         */

        await loadProducts();


        /*
         * If products page is not currently
         * visible, refresh the product list
         * directly as well.
         */

        if (
            typeof displayProducts ===
            "function" &&
            Array.isArray(products)
        ) {

            displayProducts(products);

        }


    } catch (error) {

        console.error(
            "REVIEW SUBMIT ERROR:",
            error
        );


        showToast(
            "Unable to connect to server."
        );
    }
}

/* =========================================================
   LOAD REVIEWS
========================================================= */

async function loadProductReviews(
    productId
) {

    const container =
        document.getElementById(
            "existingReviews"
        );

    if (!container) return;

    container.innerHTML = `
        <p>
            Loading reviews...
        </p>
    `;

    try {

        const response =
            await fetch(
                `/api/products/${productId}/reviews`,
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

            container.innerHTML = `
                <p>
                    Unable to load reviews.
                </p>
            `;

            return;
        }

        if (
            !data.reviews ||
            data.reviews.length === 0
        ) {

            container.innerHTML = `
                <div class="no-reviews">
                    <p>
                        No reviews yet.
                    </p>

                    <p>
                        Be the first customer to rate
                        this product!
                    </p>
                </div>
            `;

            return;
        }

        container.innerHTML = `

            <h3>
                Customer Reviews
            </h3>

            ${data.reviews.map(
                review => {

                    let stars = "";

                    for (
                        let i = 1;
                        i <= 5;
                        i++
                    ) {

                        stars +=
                            i <=
                            Number(
                                review.rating
                            )
                                ? "★"
                                : "☆";
                    }

                    return `

                        <div class="review-item">

                            <div
                                class="review-item-header">

                                <strong>
                                    ${escapeHTML(
                                        review.customer_name ||
                                        "Customer"
                                    )}
                                </strong>

                                <span
                                    class="review-item-stars">
                                    ${stars}
                                </span>

                            </div>

                            <p>
                                ${escapeHTML(
                                    review.review ||
                                    "No written review."
                                )}
                            </p>

                            <small>
                                ${
                                    review.created_at
                                        ? new Date(
                                            review.created_at
                                        ).toLocaleString(
                                            "en-IN"
                                        )
                                        : ""
                                }
                            </small>

                        </div>

                    `;
                }
            ).join("")}

        `;

    } catch (error) {

        console.error(
            "LOAD REVIEWS ERROR:",
            error
        );

        container.innerHTML = `
            <p>
                Unable to load reviews.
            </p>
        `;
    }
}


/* =========================================================
   RATING CSS
========================================================= */

const ratingStyle =
    document.createElement("style");

ratingStyle.textContent = `

.product-rating {
    display: flex;
    align-items: center;
    gap: 7px;
    margin: 12px 0 8px;
}

.rating-stars {
    color: #f5a623;
    font-size: 20px;
    letter-spacing: 1px;
}

.rating-number {
    font-weight: 700;
    color: #333;
}

.review-count {
    color: #777;
    font-size: 13px;
}

.rate-review-btn {
    width: 100%;
    border: none;
    padding: 10px 14px;
    margin: 5px 0 15px;
    border-radius: 8px;
    background: #fff3cd;
    color: #8a6200;
    font-weight: 700;
    cursor: pointer;
    transition: 0.2s;
}

.rate-review-btn:hover {
    transform: translateY(-1px);
}

.review-modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 99999;
    opacity: 0;
    visibility: hidden;
    transition: 0.2s;
    padding: 20px;
}

.review-modal-overlay.show {
    opacity: 1;
    visibility: visible;
}

.review-modal {
    width: 100%;
    max-width: 550px;
    max-height: 90vh;
    overflow-y: auto;
    background: white;
    border-radius: 16px;
    padding: 28px;
    position: relative;
    box-shadow: 0 20px 60px rgba(0,0,0,0.3);
}

.review-close {
    position: absolute;
    right: 15px;
    top: 12px;
    border: none;
    background: transparent;
    font-size: 30px;
    cursor: pointer;
}

.review-modal h2 {
    margin-bottom: 8px;
}

.review-modal h3 {
    margin-bottom: 20px;
}

.review-label {
    font-weight: 700;
}

.star-selector {
    display: flex;
    gap: 8px;
    margin: 10px 0;
}

.star-selector button {
    border: none;
    background: transparent;
    color: #bbb;
    font-size: 40px;
    cursor: pointer;
    transition: 0.2s;
}

.star-selector button:hover,
.star-selector button.selected {
    color: #f5a623;
    transform: scale(1.1);
}

.selected-rating-text {
    font-weight: 600;
    margin-bottom: 15px;
}

.review-modal label {
    display: block;
    font-weight: 700;
    margin-bottom: 8px;
}

.review-modal textarea {
    width: 100%;
    border: 1px solid #ddd;
    border-radius: 10px;
    padding: 12px;
    resize: vertical;
    font-family: inherit;
    margin-bottom: 15px;
}

.submit-review-btn {
    width: 100%;
    border: none;
    padding: 13px;
    border-radius: 9px;
    background: #2563eb;
    color: white;
    font-weight: 700;
    cursor: pointer;
    font-size: 15px;
}

.existing-reviews {
    margin-top: 25px;
    border-top: 1px solid #eee;
    padding-top: 20px;
}

.review-item {
    border-bottom: 1px solid #eee;
    padding: 15px 0;
}

.review-item-header {
    display: flex;
    justify-content: space-between;
    gap: 10px;
    margin-bottom: 7px;
}

.review-item-stars {
    color: #f5a623;
}

.review-item p {
    margin: 5px 0;
    color: #444;
}

.review-item small {
    color: #888;
}

.no-reviews {
    text-align: center;
    padding: 15px;
    color: #777;
}

`;

document.head.appendChild(ratingStyle);

/* =========================================================
   DISPLAY PRODUCTS WITH RATING
========================================================= */
/* =========================================================
   NEW MODERN PRODUCT CARD DESIGN
========================================================= */

function displayProducts(list) {

    const container =
        document.getElementById("productContainer");

    if (!container) return;

    if (!list || list.length === 0) {

        container.innerHTML = `
            <div class="no-products">
                <h3>No products found</h3>
                <p>Try another search or category.</p>
            </div>
        `;

        return;
    }

    container.innerHTML = list.map(product => {

        /* =========================
           CART
        ========================= */

        const cartItem =
            currentCart.find(item =>
                Number(item.product_id) === Number(product.id)
            );

        const quantity =
            cartItem
                ? Number(cartItem.quantity)
                : 0;


        /* =========================
           WISHLIST
        ========================= */

        const isWishlisted =
            currentWishlist.some(item =>
                Number(item.product_id || item.id)
                === Number(product.id)
            );


        const wishlistButton =
            isWishlisted

                ? `
                    <button
                        type="button"
                        class="wishlist-btn active"
                        onclick="removeFromWishlist(${product.id})"
                        title="Remove from Wishlist">

                        ❤️

                    </button>
                `

                : `
                    <button
                        type="button"
                        class="wishlist-btn"
                        onclick="addToWishlist(${product.id})"
                        title="Add to Wishlist">

                        ♡

                    </button>
                `;


        /* =========================
           PRODUCT IMAGE
        ========================= */

        const imageValue =
            String(product.icon || "").trim();

        let productImage = "";

        if (
            imageValue.startsWith("http://") ||
            imageValue.startsWith("https://") ||
            imageValue.startsWith("/") ||
            imageValue.startsWith("./")
        ) {

            productImage = `
                <img
                    src="${escapeHTML(imageValue)}"
                    alt="${escapeHTML(product.name || "Product")}"
                    class="product-real-image"
                    loading="lazy"
                    onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">

                <div class="image-fallback" style="display:none;">
                    📦
                </div>
            `;

        } else {

            productImage = `
                <div class="image-fallback">
                    ${escapeHTML(imageValue || "📦")}
                </div>
            `;
        }


        /* =========================
           RATING
        ========================= */

        const averageRating =
            Number(product.average_rating || 0);

        const reviewCount =
            Number(product.review_count || 0);

        const roundedRating =
            Math.round(averageRating);

        let stars = "";

        for (let i = 1; i <= 5; i++) {

            stars +=
                i <= roundedRating
                    ? "★"
                    : "☆";
        }


        let ratingHTML = "";

        if (reviewCount > 0) {

            ratingHTML = `
                <div class="product-rating">

                    <span class="rating-stars">
                        ${stars}
                    </span>

                    <strong class="rating-number">
                        ${averageRating.toFixed(1)}
                    </strong>

                    <span class="review-count">
                        (${reviewCount} reviews)
                    </span>

                </div>
            `;
        }


        /* =========================
           CART BUTTONS
        ========================= */

        let buttonHTML = "";

        if (Number(product.stock) <= 0) {

            buttonHTML = `
                <button
                    type="button"
                    class="add-btn out-stock-btn"
                    disabled>

                    Out of Stock

                </button>
            `;

        }

        else if (quantity > 0) {

            buttonHTML = `
                <div class="quantity-control">

                    <button
                        type="button"
                        class="quantity-btn"
                        onclick="changeProductQuantity(${product.id}, -1)">

                        −

                    </button>

                    <span class="quantity-number">
                        ${quantity}
                    </span>

                    <button
                        type="button"
                        class="quantity-btn"
                        onclick="changeProductQuantity(${product.id}, 1)">

                        +

                    </button>

                </div>
            `;

        }

        else {

            buttonHTML = `
                <div class="product-buttons">

                    <button
                        type="button"
                        class="add-btn"
                        onclick="addProductToCart(${product.id})">

                        🛒 Add to Cart

                    </button>

                    <button
                        type="button"
                        class="buy-now-btn"
                        onclick="buyNow(${product.id})">

                        ⚡ Buy Now

                    </button>

                </div>
            `;
        }


        /* =========================
           RETURN PRODUCT CARD
        ========================= */

        return `

            <article class="product-card-new">

                <!-- IMAGE AREA -->
    <div class="product-image-new">

    <!-- WISHLIST -->
    <div class="product-wishlist-new">
        ${wishlistButton}
    </div>

    <!-- SHARE -->
    <button
        type="button"
        class="product-share-new"
        onclick="shareProduct(${Number(product.id)})"
        title="Share Product">
        <span>↗</span>
    </button>

    <!-- PRODUCT IMAGE -->
    ${productImage}

</div>


                <!-- PRODUCT DETAILS -->

                <div class="product-info-new">

                    <span class="product-category-new">

                        ${escapeHTML(
                            String(product.category || "Electronics")
                                .toUpperCase()
                        )}

                    </span>


                    <h3 class="product-title-new">

                        ${escapeHTML(product.name)}

                    </h3>


                    <p class="product-description-new">

                        ${escapeHTML(
                            product.description ||
                            "Quality electronic product."
                        )}

                    </p>


                    <!-- RATING -->

                    ${ratingHTML}


                    <!-- RATE BUTTON -->

                    <button
                        type="button"
                        class="rate-review-btn-new"
                        data-product-id="${Number(product.id)}"
                        onclick="openReviewModal(${Number(product.id)}); return false;">

                        ⭐ Rate & Review

                    </button>


                    <!-- PRICE -->

                    <div class="product-price-new">

                        ₹${Number(
                            product.price || 0
                        ).toLocaleString("en-IN")}

                    </div>


                    <!-- STOCK -->

                    <div class="product-stock-new">

                        ${
                            Number(product.stock) > 0

                                ? `
                                    <span class="stock-badge">
                                        ✓ In Stock
                                    </span>
                                `

                                : `
                                    <span class="stock-badge stock-out">
                                        Out of Stock
                                    </span>
                                `
                        }

                    </div>


                    <!-- CART -->

                    <div class="product-actions-new">

                        ${buttonHTML}

                    </div>

                </div>

            </article>

        `;

    }).join("");
}
/* =====================================================
   ELECTROMART CUSTOMER INVOICE
   DOWNLOAD PDF
===================================================== */

function downloadCustomerInvoice() {

    console.log("DOWNLOAD INVOICE CLICKED");

    if (!currentInvoiceOrder) {

        alert("Please open an order first.");

        console.error(
            "currentInvoiceOrder is missing."
        );

        return;
    }


    if (
        typeof window.jspdf === "undefined" ||
        typeof window.jspdf.jsPDF !== "function"
    ) {

        alert(
            "PDF library is not loaded. Please refresh the page."
        );

        console.error(
            "jsPDF is not available."
        );

        return;
    }


    try {

        const order =
            currentInvoiceOrder;


        const items =
            Array.isArray(order.items)
                ? order.items
                : [];


        const customerName =
            currentUser &&
            currentUser.name
                ? currentUser.name
                : "Customer";


        const customerEmail =
            currentUser &&
            currentUser.email
                ? currentUser.email
                : "-";


        const orderId =
            order.id ||
            order.order_id ||
            "N/A";


        const subtotal =
            Number(order.total || 0);


        const shipping =
            0;


        const grandTotal =
            subtotal + shipping;


        const invoiceDate =
            order.created_at
                ? new Date(
                    order.created_at
                ).toLocaleString("en-IN")
                : new Date().toLocaleString("en-IN");


        const printedDate =
            new Date().toLocaleString("en-IN");


        const jsPDF =
            window.jspdf.jsPDF;


        const doc =
            new jsPDF({
                orientation: "portrait",
                unit: "mm",
                format: "a4"
            });


        /* =================================================
           HEADER
        ================================================= */

        doc.setFont(
            "helvetica",
            "bold"
        );

        doc.setFontSize(22);

        doc.text(
            "ElectroMart",
            15,
            20
        );


        doc.setFontSize(10);

        doc.setFont(
            "helvetica",
            "normal"
        );

        doc.text(
            "Electronic Shop",
            15,
            27
        );


        doc.setFont(
            "helvetica",
            "bold"
        );

        doc.setFontSize(16);

        doc.text(
            "INVOICE",
            195,
            20,
            {
                align: "right"
            }
        );


        doc.setFont(
            "helvetica",
            "normal"
        );

        doc.setFontSize(9);

        doc.text(
            `Order ID: ${orderId}`,
            195,
            27,
            {
                align: "right"
            }
        );


        doc.text(
            `Date: ${invoiceDate}`,
            195,
            33,
            {
                align: "right"
            }
        );


        doc.line(
            15,
            40,
            195,
            40
        );


        /* =================================================
           CUSTOMER INFORMATION
        ================================================= */

        doc.setFont(
            "helvetica",
            "bold"
        );

        doc.setFontSize(11);

        doc.text(
            "CUSTOMER INFORMATION",
            15,
            52
        );


        doc.setFont(
            "helvetica",
            "normal"
        );

        doc.setFontSize(10);

        doc.text(
            `Name: ${customerName}`,
            15,
            60
        );


        doc.text(
            `Email: ${customerEmail}`,
            15,
            67
        );


        doc.text(
            `Address: ${order.address || "Address not available"}`,
            15,
            74
        );


        /* =================================================
           ORDER ITEMS
        ================================================= */

        let y =
            88;


        doc.setFont(
            "helvetica",
            "bold"
        );

        doc.setFontSize(10);

        doc.text(
            "ORDER ITEMS",
            15,
            y
        );


        y += 8;


        /* TABLE HEADER */

        doc.setFillColor(
            230,
            235,
            245
        );

        doc.rect(
            15,
            y - 5,
            180,
            9,
            "F"
        );


        doc.setFont(
            "helvetica",
            "bold"
        );

        doc.setFontSize(9);


        doc.text(
            "#",
            18,
            y
        );


        doc.text(
            "Product",
            30,
            y
        );


        doc.text(
            "Qty",
            125,
            y
        );


        doc.text(
            "Price",
            145,
            y
        );


        doc.text(
            "Total",
            175,
            y
        );


        y += 10;


        doc.setFont(
            "helvetica",
            "normal"
        );


        if (items.length === 0) {

            doc.text(
                "No item information available.",
                18,
                y
            );

            y += 10;

        } else {

            items.forEach(
                (item, index) => {

                    const productName =
                        item.product_name ||
                        item.name ||
                        item.title ||
                        "Product";


                    const quantity =
                        Number(
                            item.quantity ||
                            item.qty ||
                            1
                        );


                    const price =
                        Number(
                            item.price ||
                            item.unit_price ||
                            0
                        );


                    const itemTotal =
                        quantity * price;


                    const productLines =
                        doc.splitTextToSize(
                            String(productName),
                            85
                        );


                    doc.text(
                        String(index + 1),
                        18,
                        y
                    );


                    doc.text(
                        productLines,
                        30,
                        y
                    );


                    doc.text(
                        String(quantity),
                        125,
                        y
                    );


                    doc.text(
                        `INR ${price.toFixed(2)}`,
                        145,
                        y
                    );


                    doc.text(
                        `INR ${itemTotal.toFixed(2)}`,
                        195,
                        y,
                        {
                            align: "right"
                        }
                    );


                    const lineHeight =
                        Math.max(
                            6,
                            productLines.length * 5
                        );


                    y +=
                        lineHeight + 5;


                    doc.line(
                        15,
                        y - 3,
                        195,
                        y - 3
                    );


                    /* NEW PAGE IF NEEDED */

                    if (y > 245) {

                        doc.addPage();

                        y = 20;

                    }

                }
            );
        }


        /* =================================================
           TOTALS
        ================================================= */

        y += 8;


        doc.setFont(
            "helvetica",
            "normal"
        );

        doc.setFontSize(10);


        doc.text(
            "Subtotal",
            140,
            y
        );


        doc.text(
            `INR ${subtotal.toFixed(2)}`,
            195,
            y,
            {
                align: "right"
            }
        );


        y += 7;


        doc.text(
            "Shipping",
            140,
            y
        );


        doc.text(
            `INR ${shipping.toFixed(2)}`,
            195,
            y,
            {
                align: "right"
            }
        );


        y += 5;


        doc.line(
            135,
            y,
            195,
            y
        );


        y += 9;


        doc.setFont(
            "helvetica",
            "bold"
        );

        doc.setFontSize(12);


        doc.text(
            "TOTAL",
            140,
            y
        );


        doc.text(
            `INR ${grandTotal.toFixed(2)}`,
            195,
            y,
            {
                align: "right"
            }
        );


        /* =================================================
           FOOTER
        ================================================= */

        doc.setFont(
            "helvetica",
            "normal"
        );

        doc.setFontSize(8);


        doc.line(
            15,
            275,
            195,
            275
        );


        doc.text(
            `Printed on: ${printedDate}`,
            15,
            282
        );


        doc.text(
            "ElectroMart Customer Invoice",
            195,
            282,
            {
                align: "right"
            }
        );


        doc.setFont(
            "helvetica",
            "bold"
        );

        doc.setFontSize(9);


        doc.text(
            "Thank you for shopping with ElectroMart.",
            105,
            290,
            {
                align: "center"
            }
        );


        /* =================================================
           DOWNLOAD
        ================================================= */

        const now =
            new Date();


        const day =
            String(
                now.getDate()
            ).padStart(2, "0");


        const month =
            String(
                now.getMonth() + 1
            ).padStart(2, "0");


        const year =
            now.getFullYear();


        const filename =
            `ElectroMart_Invoice_Order_${orderId}_${day}-${month}-${year}.pdf`;


        doc.save(
            filename
        );


        console.log(
            "INVOICE PDF DOWNLOADED:",
            filename
        );


        if (
            typeof showToast ===
            "function"
        ) {

            showToast(
                "Invoice downloaded successfully!"
            );

        }

    } catch (error) {

        console.error(
            "INVOICE DOWNLOAD ERROR:",
            error
        );


        alert(
            "Invoice download failed. Check the browser Console."
        );

    }
}
/* =========================================
   PRODUCT SHARE
========================================= */

function openShareMenu(button) {

    const productImage = button.closest(".product-image");

    if (!productImage) {
        console.log("Product image container not found");
        return;
    }

    // Close other share menus
    document.querySelectorAll(".share-menu").forEach(menu => {

        if (!productImage.contains(menu)) {
            menu.classList.remove("show");
        }

    });

    const menu = productImage.querySelector(".share-menu");

    if (menu) {
        menu.classList.toggle("show");
    }
}


/* =========================================
   GET PRODUCT INFORMATION
========================================= */

function getShareProduct(button) {

    const card = button.closest(".product-card");

    if (!card) {
        return {
            name: "ElectroMart Product",
            url: window.location.href
        };
    }

    const titleElement =
        card.querySelector(".product-name") ||
        card.querySelector("h3") ||
        card.querySelector("h2");

    const name = titleElement
        ? titleElement.innerText.trim()
        : "ElectroMart Product";

    return {
        name: name,
        url: window.location.href
    };
}


/* =========================================
   WHATSAPP
========================================= */

function shareWhatsApp(event, link) {

    event.preventDefault();

    const product = getShareProduct(link);

    const message =
        "Check out this product on ElectroMart: " +
        product.name +
        " " +
        product.url;

    const whatsappURL =
        "https://wa.me/?text=" +
        encodeURIComponent(message);

    window.open(
        whatsappURL,
        "_blank",
        "noopener,noreferrer"
    );
}


/* =========================================
   FACEBOOK
========================================= */

function shareFacebook(event, link) {

    event.preventDefault();

    const product = getShareProduct(link);

    const facebookURL =
        "https://www.facebook.com/sharer/sharer.php?u=" +
        encodeURIComponent(product.url);

    window.open(
        facebookURL,
        "_blank",
        "width=600,height=500"
    );
}


/* =========================================
   INSTAGRAM
========================================= */

function shareInstagram(event) {

    event.preventDefault();

    const productURL = window.location.href;

    // Instagram does not provide the same simple
    // website URL-sharing popup as Facebook.

    if (navigator.share) {

        navigator.share({
            title: "ElectroMart Product",
            text: "Check out this product on ElectroMart",
            url: productURL
        }).catch(function(error) {

            console.log("Share cancelled:", error);

        });

    } else {

        navigator.clipboard.writeText(productURL)
            .then(function() {

                alert(
                    "Product link copied!\n\n" +
                    "Open Instagram and paste the link."
                );

            })
            .catch(function() {

                alert(
                    "Copy this product link:\n" +
                    productURL
                );

            });

    }
}


/* =========================================
   CLOSE SHARE MENU WHEN CLICKING OUTSIDE
========================================= */

document.addEventListener("click", function(event) {

    if (
        !event.target.closest(".share-btn") &&
        !event.target.closest(".share-menu")
    ) {

        document.querySelectorAll(".share-menu")
            .forEach(function(menu) {

                menu.classList.remove("show");

            });

    }

});
/* =========================================================
   SHARE PRODUCT
========================================================= */

function shareProduct(productId, productName) {

    const shareUrl =
        window.location.origin +
        window.location.pathname +
        "?product=" +
        encodeURIComponent(productId);

    const shareText =
        "Check out " +
        productName +
        " on ElectroMart!";

    const whatsappUrl =
        "https://wa.me/?text=" +
        encodeURIComponent(
            shareText + "\n" + shareUrl
        );

    const facebookUrl =
        "https://www.facebook.com/sharer/sharer.php?u=" +
        encodeURIComponent(shareUrl);

    const modal =
        document.createElement("div");

    modal.className =
        "share-modal-overlay";

    modal.innerHTML = `

        <div class="share-modal">

            <button
                type="button"
                class="share-close"
                onclick="
                    this.closest(
                        '.share-modal-overlay'
                    ).remove()
                ">
                ×
            </button>

            <h2>Share Product</h2>

            <p>
                Share
                <strong>${productName}</strong>
            </p>

            <div class="share-buttons">

                <!-- WHATSAPP -->
                <a
                    href="${whatsappUrl}"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="share-option whatsapp">
                    🟢 WhatsApp
                </a>

                <!-- FACEBOOK -->
                <a
                    href="${facebookUrl}"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="share-option facebook">
                    🔵 Facebook
                </a>

                <!-- INSTAGRAM -->
                <a
                    href="https://www.instagram.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="share-option instagram">
                    🟣 Instagram
                </a>

            </div>

            <button
                type="button"
                class="copy-share-btn"
                onclick="
                    copyProductLink(
                        '${shareUrl.replace(/'/g, "\\'")}'
                    )
                ">
                🔗 Copy Product Link
            </button>

        </div>
    `;

    document.body.appendChild(modal);
}


/* =========================================================
   COPY SHARE LINK
========================================================= */

function copyProductLink(url) {

    navigator.clipboard
        .writeText(url)
        .then(() => {

            if (typeof showToast === "function") {
                showToast(
                    "Product link copied!"
                );
            } else {
                alert(
                    "Product link copied!"
                );
            }

        })
        .catch(() => {

            alert(
                "Unable to copy product link."
            );

        });
}
/* =========================================
   PRODUCT SHARE
========================================= */

function shareProduct(productId) {

    const product = products.find(
        p => Number(p.id) === Number(productId)
    );

    if (!product) {
        alert("Product not found");
        return;
    }

    const productName = product.name || "Electronic Product";

    const productUrl = window.location.origin +
        window.location.pathname +
        "?product=" + encodeURIComponent(productId);

    const shareText =
        `Check out ${productName} on ElectroMart!`;

    const encodedText =
        encodeURIComponent(shareText);

    const encodedUrl =
        encodeURIComponent(productUrl);

    const existing =
        document.getElementById("shareMenu");

    if (existing) {
        existing.remove();
    }

    const shareMenu = document.createElement("div");

    shareMenu.id = "shareMenu";

    shareMenu.innerHTML = `
        <div class="share-overlay" onclick="closeShareMenu()"></div>

        <div class="share-popup">

            <button
                class="share-close"
                onclick="closeShareMenu()">
                ×
            </button>

            <h3>Share Product</h3>

            <p>${escapeHTML(productName)}</p>

            <div class="share-options">

                <a
                    class="share-option whatsapp"
                    href="https://wa.me/?text=${encodedText}%20${encodedUrl}"
                    target="_blank"
                    rel="noopener noreferrer">

                    <span>💬</span>
                    <strong>WhatsApp</strong>

                </a>

                <a
                    class="share-option instagram"
                    href="https://www.instagram.com/"
                    target="_blank"
                    rel="noopener noreferrer">

                    <span>📷</span>
                    <strong>Instagram</strong>

                </a>

                <a
                    class="share-option facebook"
                    href="https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}"
                    target="_blank"
                    rel="noopener noreferrer">

                    <span>f</span>
                    <strong>Facebook</strong>

                </a>

                <button
                    class="share-option copy-link"
                    onclick="copyProductLink('${productUrl}')">

                    <span>🔗</span>
                    <strong>Copy Link</strong>

                </button>

            </div>

        </div>
    `;

    document.body.appendChild(shareMenu);
}


/* CLOSE SHARE */

function closeShareMenu() {

    const menu =
        document.getElementById("shareMenu");

    if (menu) {
        menu.remove();
    }
}


/* COPY LINK */

function copyProductLink(url) {

    navigator.clipboard.writeText(url)
        .then(() => {

            alert("Product link copied!");

        })
        .catch(() => {

            prompt(
                "Copy this product link:",
                url
            );

        });
}
// ===============================
// DEFAULT ADDRESS
// ===============================


/* =====================================================
   NOTIFICATION SYSTEM TEST
   ===================================================== */

document.addEventListener("DOMContentLoaded", function () {

    console.log("ElectroMart Notification System Started");

    loadStoredNotifications();
    renderNotifications();

});

    renderNotifications();


/* =====================================================
   ELECTROMART CUSTOMER INVOICE
   PRINT
===================================================== */

function printCustomerInvoice() {

    console.log("PRINT INVOICE CLICKED");

    if (!currentInvoiceOrder) {
        alert("Please open an order first.");
        console.error("currentInvoiceOrder is missing.");
        return;
    }

    const order = currentInvoiceOrder;

    const items = Array.isArray(order.items)
        ? order.items
        : [];

    const customerName =
        currentUser && currentUser.name
            ? currentUser.name
            : "Customer";

    const customerEmail =
        currentUser && currentUser.email
            ? currentUser.email
            : "-";

    const orderId =
        order.id ||
        order.order_id ||
        "N/A";

    const orderDate =
        order.created_at
            ? new Date(order.created_at).toLocaleString("en-IN")
            : new Date().toLocaleString("en-IN");

    const total =
        Number(order.total || 0);

    let productsHTML = "";

    if (items.length === 0) {

        productsHTML = `
            <tr>
                <td colspan="4">
                    No product information available
                </td>
            </tr>
        `;

    } else {

        productsHTML = items.map(
            (item, index) => {

                const name =
                    item.product_name ||
                    item.name ||
                    item.title ||
                    "Product";

                const quantity =
                    Number(
                        item.quantity ||
                        item.qty ||
                        1
                    );

                const price =
                    Number(
                        item.price ||
                        item.unit_price ||
                        0
                    );

                const itemTotal =
                    quantity * price;

                return `
                    <tr>
                        <td>${index + 1}</td>
                        <td>${name}</td>
                        <td>${quantity}</td>
                        <td>
                            ₹${itemTotal.toLocaleString("en-IN")}
                        </td>
                    </tr>
                `;

            }
        ).join("");
    }

    const invoiceHTML = `

        <!DOCTYPE html>

        <html>

        <head>

            <title>
                ElectroMart Invoice #${orderId}
            </title>

            <style>

                * {
                    box-sizing: border-box;
                }

                body {
                    margin: 0;
                    padding: 30px;
                    font-family: Arial, sans-serif;
                    color: #222;
                    background: #fff;
                }

                .invoice {
                    width: 800px;
                    max-width: 100%;
                    margin: auto;
                    border: 1px solid #ddd;
                    padding: 30px;
                }

                .invoice-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    border-bottom: 2px solid #222;
                    padding-bottom: 20px;
                    margin-bottom: 25px;
                }

                .shop-name {
                    font-size: 30px;
                    font-weight: bold;
                }

                .shop-subtitle {
                    margin-top: 5px;
                    font-size: 14px;
                }

                .invoice-title {
                    text-align: right;
                }

                .invoice-title h1 {
                    margin: 0;
                    font-size: 28px;
                }

                .invoice-title p {
                    margin: 5px 0;
                    font-size: 13px;
                }

                .customer-section {
                    margin-bottom: 25px;
                }

                .customer-section h3 {
                    margin-bottom: 12px;
                }

                .customer-section p {
                    margin: 6px 0;
                }

                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-top: 20px;
                }

                th,
                td {
                    border: 1px solid #ccc;
                    padding: 12px;
                }

                th {
                    background: #f2f2f2;
                    text-align: left;
                }

                .summary {
                    width: 350px;
                    margin-left: auto;
                    margin-top: 25px;
                }

                .summary-row {
                    display: flex;
                    justify-content: space-between;
                    padding: 7px 0;
                }

                .grand-total {
                    border-top: 2px solid #222;
                    margin-top: 8px;
                    padding-top: 10px;
                    font-size: 20px;
                    font-weight: bold;
                }

                .footer {
                    text-align: center;
                    border-top: 1px solid #ddd;
                    margin-top: 40px;
                    padding-top: 20px;
                    font-size: 13px;
                }

                @media print {

                    body {
                        padding: 0;
                    }

                    .invoice {
                        border: none;
                    }

                }

            </style>

        </head>

        <body>

            <div class="invoice">

                <div class="invoice-header">

                    <div>

                        <div class="shop-name">
                            ⚡ ElectroMart
                        </div>

                        <div class="shop-subtitle">
                            Electronic Shop
                        </div>

                    </div>

                    <div class="invoice-title">

                        <h1>
                            INVOICE
                        </h1>

                        <p>
                            Order ID: #${orderId}
                        </p>

                        <p>
                            Date: ${orderDate}
                        </p>

                    </div>

                </div>


                <div class="customer-section">

                    <h3>
                        Customer Information
                    </h3>

                    <p>
                        <strong>Name:</strong>
                        ${customerName}
                    </p>

                    <p>
                        <strong>Email:</strong>
                        ${customerEmail}
                    </p>

                    <p>
                        <strong>Address:</strong>
                        ${order.address || "N/A"}
                    </p>

                    <p>
                        <strong>Location:</strong>
                        ${
                            order.current_location ||
                            "Delivered to Customer"
                        }
                    </p>

                </div>


                <h3>
                    Order Items
                </h3>

                <table>

                    <thead>

                        <tr>

                            <th>
                                #
                            </th>

                            <th>
                                Product
                            </th>

                            <th>
                                Quantity
                            </th>

                            <th>
                                Amount
                            </th>

                        </tr>

                    </thead>

                    <tbody>

                        ${productsHTML}

                    </tbody>

                </table>


                <div class="summary">

                    <div class="summary-row">

                        <span>
                            Subtotal
                        </span>

                        <span>
                            ₹${total.toLocaleString("en-IN")}
                        </span>

                    </div>


                    <div class="summary-row">

                        <span>
                            Delivery Charge
                        </span>

                        <span>
                            ₹0
                        </span>

                    </div>


                    <div class="summary-row grand-total">

                        <span>
                            TOTAL
                        </span>

                        <span>
                            ₹${total.toLocaleString("en-IN")}
                        </span>

                    </div>

                </div>


                <div class="footer">

                    <p>
                        Thank you for shopping with ElectroMart!
                    </p>

                    <p>
                        This is a computer-generated invoice.
                    </p>

                </div>

            </div>


            <script>

                window.onload = function () {

                    setTimeout(
                        function () {

                            window.print();

                        },
                        500
                    );

                };

            <\/script>

        </body>

        </html>

    `;


    const printWindow =
        window.open(
            "",
            "_blank",
            "width=900,height=700"
        );


    if (!printWindow) {

        alert(
            "Popup blocked. Please allow pop-ups for localhost:5000."
        );

        return;
    }


    printWindow.document.open();

    printWindow.document.write(
        invoiceHTML
    );

    printWindow.document.close();

}
document.addEventListener( "DOMContentLoaded",
    function () {

        const addressFields = [
            "deliveryPincode",
            "deliveryCity",
            "deliveryState",
            "deliveryPostOffice",
            "deliveryAddress"
        ];

        addressFields.forEach(
            function (id) {

                const field =
                    document.getElementById(id);

                if (field) {

                    field.addEventListener(
                        "input",
                        updateAddressPreview
                    );

                    field.addEventListener(
                        "change",
                        updateAddressPreview
                    );
                }
            }
        );

    }
);
document.addEventListener("DOMContentLoaded", function () {

    const checkbox =
        document.getElementById("saveDefaultAddress");

    if (checkbox) {

        checkbox.addEventListener(
            "change",
            function () {

                if (this.checked) {

                    const saved =
                        saveCurrentAddressAsSaved(true);

                    if (!saved) {

                        this.checked = false;

                        alert(
                            "Please enter the complete address before saving."
                        );

                        return;
                    }

                    showToast(
                        "Address saved successfully!"
                    );

                    renderSavedAddresses();
                    updateAddressPreview();

                }

            }
        );

    }

});
document.addEventListener("DOMContentLoaded", function () {

    console.log("Saved Address System Started");

    // Show saved addresses
    if (typeof renderSavedAddresses === "function") {
        renderSavedAddresses();
    }

    // Add New Address button
    const addButton =
        document.getElementById("addNewAddressBtn");

    if (addButton) {

        addButton.addEventListener("click", function () {

            if (typeof addNewAddress === "function") {
                addNewAddress();
            }

        });

    }

});
function openSavedDefaultAddress() {

    const list =
        getSavedAddresses();

    if (!list || !list.length) {

        renderSavedAddresses();

        return false;

    }


    const defaultAddress =
        list.find(
            address => address.isDefault
        ) || list[0];


    if (!defaultAddress) {

        return false;

    }


    fillAddressForm(
        defaultAddress
    );

    renderSavedAddresses();

    return true;

}
/* =========================================================
   ELECTROMART SAVED ADDRESSES - COMPLETE SYSTEM
========================================================= */

const SAVED_ADDRESSES_KEY =
    "electromartSavedAddresses";


/* =========================================================
   GET SAVED ADDRESSES
========================================================= */

function getSavedAddresses() {

    try {

        const data =
            localStorage.getItem(
                SAVED_ADDRESSES_KEY
            );

        if (!data) {
            return [];
        }

        const addresses =
            JSON.parse(data);

        return Array.isArray(addresses)
            ? addresses
            : [];

    } catch (error) {

        console.error(
            "Unable to read saved addresses:",
            error
        );

        return [];

    }

}


/* =========================================================
   SAVE SAVED ADDRESSES
========================================================= */

function saveSavedAddresses(addresses) {

    localStorage.setItem(
        SAVED_ADDRESSES_KEY,
        JSON.stringify(addresses)
    );

}


/* =========================================================
   GET CURRENT CHECKOUT ADDRESS
========================================================= */

function getCurrentAddressFromForm() {

    const pincode =
        document.getElementById(
            "deliveryPincode"
        )?.value.trim() || "";

    const city =
        document.getElementById(
            "deliveryCity"
        )?.value.trim() || "";

    const state =
        document.getElementById(
            "deliveryState"
        )?.value.trim() || "";

    const postOffice =
        document.getElementById(
            "deliveryPostOffice"
        )?.value.trim() || "";

    const address =
        document.getElementById(
            "deliveryAddress"
        )?.value.trim() || "";


    if (
        !pincode ||
        !city ||
        !state ||
        !postOffice ||
        !address
    ) {

        alert(
            "Please enter the complete delivery address first."
        );

        return null;

    }


    return {

        id:
            Date.now(),

        name:
            currentUser?.name ||
            currentUser?.username ||
            "Customer",

        phone:
            currentUser?.phone ||
            currentUser?.mobile ||
            "",

        pincode:
            pincode,

        city:
            city,

        state:
            state,

        postOffice:
            postOffice,

        address:
            address,

        isDefault:
            false

    };

}


/* =========================================================
   FILL ADDRESS INTO CHECKOUT FORM
========================================================= */

function fillAddressForm(address) {

    if (!address) {
        return;
    }


    const pincode =
        document.getElementById(
            "deliveryPincode"
        );

    const city =
        document.getElementById(
            "deliveryCity"
        );

    const state =
        document.getElementById(
            "deliveryState"
        );

    const postOffice =
        document.getElementById(
            "deliveryPostOffice"
        );

    const deliveryAddress =
        document.getElementById(
            "deliveryAddress"
        );


    if (pincode) {
        pincode.value =
            address.pincode || "";
    }

    if (city) {
        city.value =
            address.city || "";
    }

    if (state) {
        state.value =
            address.state || "";
    }

    if (postOffice) {
        postOffice.value =
            address.postOffice || "";
    }

    if (deliveryAddress) {
        deliveryAddress.value =
            address.address || "";
    }


    const checkbox =
        document.getElementById(
            "saveDefaultAddress"
        );

    if (checkbox) {

        checkbox.checked =
            address.isDefault === true;

    }


    if (
        typeof updateAddressPreview ===
        "function"
    ) {

        updateAddressPreview();

    }

}


/* =========================================================
   RENDER SAVED ADDRESS CARDS
========================================================= */

function renderSavedAddresses() {

    const container =
        document.getElementById(
            "savedAddressesList"
        );


    if (!container) {

        console.log(
            "savedAddressesList not found."
        );

        return;

    }


    const addresses =
        getSavedAddresses();


    container.innerHTML = "";


    if (addresses.length === 0) {

        container.innerHTML = `
            <div class="saved-address-empty">
                No saved addresses yet.
            </div>
        `;

        return;

    }


    addresses.forEach(function (address) {

        const card =
            document.createElement("div");

        card.className =
            "saved-address-card" +
            (
                address.isDefault
                    ? " default"
                    : ""
            );


        card.innerHTML = `

            <div class="saved-address-top">

                <input
                    type="radio"
                    class="saved-address-radio"
                    name="selectedSavedAddress"
                    ${
                        address.isDefault
                            ? "checked"
                            : ""
                    }
                >

                <span class="saved-address-name">
                    ${
                        address.name ||
                        "Customer"
                    }
                </span>

                ${
                    address.isDefault
                        ? `
                            <span
                                class="saved-address-badge"
                            >
                                Default
                            </span>
                          `
                        : ""
                }

            </div>


            <div class="saved-address-line">

                ${
                    address.address ||
                    ""
                }

            </div>


            <div class="saved-address-line">

                ${
                    address.postOffice ||
                    ""
                }

            </div>


            <div class="saved-address-line">

                ${
                    address.city ||
                    ""
                }

            </div>


            <div class="saved-address-line">

                ${
                    address.state ||
                    ""
                }

            </div>


            <div
                class="saved-address-line
                       saved-address-pin"
            >

                PIN:
                ${
                    address.pincode ||
                    ""
                }

            </div>


            <div class="saved-address-actions">

                <button
                    type="button"
                    class="select-address-btn"
                    onclick="
                        selectSavedAddress(
                            ${address.id}
                        )
                    "
                >

                    ✓ Select

                </button>


                ${
                    !address.isDefault
                        ? `
                            <button
                                type="button"
                                class="default-address-btn"
                                onclick="
                                    setSavedAddressDefault(
                                        ${address.id}
                                    )
                                "
                            >
                                Set as Default
                            </button>
                          `
                        : ""
                }


                <button
                    type="button"
                    class="edit-address-btn"
                    onclick="
                        editSavedAddress(
                            ${address.id}
                        )
                    "
                >

                    Edit

                </button>


                <button
                    type="button"
                    class="delete-address-btn"
                    onclick="
                        deleteSavedAddress(
                            ${address.id}
                        )
                    "
                >

                    Delete

                </button>

            </div>

        `;


        container.appendChild(card);

    });

}


/* =========================================================
   ADD NEW ADDRESS
========================================================= */

function addNewAddress() {

    console.log(
        "Add New Address clicked"
    );


    const pincode =
        document.getElementById(
            "deliveryPincode"
        );

    const city =
        document.getElementById(
            "deliveryCity"
        );

    const state =
        document.getElementById(
            "deliveryState"
        );

    const postOffice =
        document.getElementById(
            "deliveryPostOffice"
        );

    const address =
        document.getElementById(
            "deliveryAddress"
        );


    if (pincode) {
        pincode.value = "";
    }

    if (city) {
        city.value = "";
    }

    if (state) {
        state.value = "";
    }

    if (postOffice) {
        postOffice.value = "";
    }

    if (address) {
        address.value = "";
    }


    const checkbox =
        document.getElementById(
            "saveDefaultAddress"
        );

    if (checkbox) {
        checkbox.checked = false;
    }


    if (
        typeof updateAddressPreview ===
        "function"
    ) {

        updateAddressPreview();

    }


    /* Scroll to address form */

    if (pincode) {

        pincode.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });

    }


    alert(
        "Enter your new delivery address."
    );

}


/* =========================================================
   SAVE CURRENT ADDRESS
========================================================= */

function saveCurrentAddressAsSaved(
    makeDefault = false
) {

    const newAddress =
        getCurrentAddressFromForm();


    if (!newAddress) {

        return false;

    }


    let addresses =
        getSavedAddresses();


    /*
       If this is the first address,
       automatically make it default.
    */

    if (addresses.length === 0) {

        makeDefault = true;

    }


    if (makeDefault) {

        addresses =
            addresses.map(
                function (item) {

                    return {
                        ...item,
                        isDefault: false
                    };

                }
            );

    }


    newAddress.isDefault =
        makeDefault;


    addresses.push(
        newAddress
    );


    saveSavedAddresses(
        addresses
    );


    renderSavedAddresses();


    return true;

}


/* =========================================================
   SELECT SAVED ADDRESS
========================================================= */

function selectSavedAddress(id) {

    const addresses =
        getSavedAddresses();


    const address =
        addresses.find(
            function (item) {

                return Number(item.id) ===
                    Number(id);

            }
        );


    if (!address) {

        return;

    }


    fillAddressForm(
        address
    );


    renderSavedAddresses();

}

/* PUT THE NEW CHECKBOX CODE HERE */

document.addEventListener("DOMContentLoaded", function () {

    const checkbox =
        document.getElementById("saveDefaultAddress");

    if (!checkbox) {
        return;
    }

    checkbox.addEventListener("change", function () {

        if (!this.checked) {
            return;
        }

        const saved =
            saveCurrentAddressAsSaved(true);

        if (!saved) {

            this.checked = false;

            alert(
                "Please enter the complete delivery address first."
            );

            return;
        }

        showToast(
            "Address saved successfully!"
        );

        renderSavedAddresses();
        updateAddressPreview();

    });

});

/* =========================================================
   SET DEFAULT ADDRESS
========================================================= */

function setSavedAddressDefault(id) {

    let addresses =
        getSavedAddresses();


    addresses =
        addresses.map(
            function (address) {

                return {

                    ...address,

                    isDefault:
                        Number(address.id) ===
                        Number(id)

                };

            }
        );


    saveSavedAddresses(
        addresses
    );


    const selected =
        addresses.find(
            function (address) {

                return Number(address.id) ===
                    Number(id);

            }
        );


    if (selected) {

        fillAddressForm(
            selected
        );

    }


    renderSavedAddresses();


    alert(
        "Default address updated successfully."
    );

}


/* =========================================================
   EDIT ADDRESS
========================================================= */

function editSavedAddress(id) {

    const addresses =
        getSavedAddresses();


    const address =
        addresses.find(
            function (item) {

                return Number(item.id) ===
                    Number(id);

            }
        );


    if (!address) {

        return;

    }


    fillAddressForm(
        address
    );


    /*
       Store the address being edited
    */

    window.editingAddressId =
        Number(id);


    const pincode =
        document.getElementById(
            "deliveryPincode"
        );


    if (pincode) {

        pincode.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });

    }


    alert(
        "Edit the address and save it again."
    );

}


/* =========================================================
   DELETE ADDRESS
========================================================= */

function deleteSavedAddress(id) {

    const confirmDelete =
        confirm(
            "Are you sure you want to delete this address?"
        );


    if (!confirmDelete) {

        return;

    }


    let addresses =
        getSavedAddresses();


    const deleted =
        addresses.find(
            function (address) {

                return Number(address.id) ===
                    Number(id);

            }
        );


    addresses =
        addresses.filter(
            function (address) {

                return Number(address.id) !==
                    Number(id);

            }
        );


    /*
       If deleted address was default,
       make first remaining address default.
    */

    if (
        deleted &&
        deleted.isDefault &&
        addresses.length > 0
    ) {

        addresses[0].isDefault =
            true;

    }


    saveSavedAddresses(
        addresses
    );


    renderSavedAddresses();


    alert(
        "Address deleted successfully."
    );

}


/* =========================================================
   PAGE LOAD
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        console.log(
            "ElectroMart Saved Address System Started"
        );


        renderSavedAddresses();

     const addButton =
    document.getElementById("addNewAddressBtn");

if (addButton) {
    addButton.addEventListener(
        "click",
        function () {
            addNewAddress();
        }
    );
}
       

    }
);
/* =========================================================
   ELECTROMART - REFER & EARN
========================================================= */

const REFERRAL_REWARD = 100;


/* ---------------------------------------------------------
   GET CURRENT USER REFERRAL CODE
--------------------------------------------------------- */

function getMyReferralCode() {

    if (!currentUser) {
        return "";
    }

    if (!currentUser.referralCode) {

        const namePart =
            (currentUser.name || "USER")
                .replace(/\s+/g, "")
                .substring(0, 4)
                .toUpperCase();

        const randomPart =
            Math.floor(
                1000 + Math.random() * 9000
            );

        currentUser.referralCode =
            "EM" +
            namePart +
            randomPart;
    }

    return currentUser.referralCode;
}


/* ---------------------------------------------------------
   OPEN REFERRAL PAGE
--------------------------------------------------------- */

function loadReferralPage() {

    if (!currentUser) {

        showToast(
            "Please login first."
        );

        openLogin();

        return;
    }


    const code =
        getMyReferralCode();


    const codeInput =
        document.getElementById(
            "myReferralCode"
        );


    if (codeInput) {

        codeInput.value =
            code;

    }


    loadReferralEarnings();

}


/* ---------------------------------------------------------
   REFERRAL STORAGE
--------------------------------------------------------- */

function getReferralData() {

    if (!currentUser) {

        return {
            earnings: 0,
            referrals: []
        };

    }


    const storageKey =
        "electromartReferral_" +
        (
            currentUser.email ||
            currentUser.id ||
            "user"
        );


    const saved =
        localStorage.getItem(
            storageKey
        );


    if (!saved) {

        return {
            earnings: 0,
            referrals: []
        };

    }


    try {

        return JSON.parse(
            saved
        );

    } catch (error) {

        return {
            earnings: 0,
            referrals: []
        };

    }

}


/* ---------------------------------------------------------
   SAVE REFERRAL DATA
--------------------------------------------------------- */

function saveReferralData(data) {

    if (!currentUser) {
        return;
    }


    const storageKey =
        "electromartReferral_" +
        (
            currentUser.email ||
            currentUser.id ||
            "user"
        );


    localStorage.setItem(
        storageKey,
        JSON.stringify(data)
    );

}


/* ---------------------------------------------------------
   LOAD EARNINGS
--------------------------------------------------------- */

function loadReferralEarnings() {

    const data =
        getReferralData();


    const earningsElement =
        document.getElementById(
            "referralEarnings"
        );


    if (earningsElement) {

        earningsElement.textContent =
            "₹" +
            Number(
                data.earnings || 0
            ).toLocaleString(
                "en-IN"
            );

    }


    renderReferralHistory(
        data.referrals || []
    );

}


/* ---------------------------------------------------------
   SHOW REFERRAL HISTORY
--------------------------------------------------------- */

function renderReferralHistory(
    referrals
) {

    const container =
        document.getElementById(
            "referralHistory"
        );


    if (!container) {
        return;
    }


    if (
        !referrals ||
        referrals.length === 0
    ) {

        container.innerHTML = `
            <p class="no-referrals">
                No referrals yet.
            </p>
        `;

        return;

    }


    container.innerHTML =
        referrals
            .map(function(referral) {

                return `
                    <div class="referral-history-item">

                        <div>
                            <strong>
                                ${referral.name || "Friend"}
                            </strong>

                            <small>
                                ${referral.email || ""}
                            </small>
                        </div>

                        <strong class="referral-earned">
                            + ₹${Number(
                                referral.reward || REFERRAL_REWARD
                            ).toLocaleString("en-IN")}
                        </strong>

                    </div>
                `;

            })
            .join("");

}


/* ---------------------------------------------------------
   COPY REFERRAL CODE
--------------------------------------------------------- */

function copyReferralCode() {

    const code =
        getMyReferralCode();


    if (!code) {

        showToast(
            "Please login first."
        );

        return;

    }


    navigator.clipboard
        .writeText(code)
        .then(function() {

            showToast(
                "Referral code copied!"
            );

        })
        .catch(function() {

            alert(
                "Referral Code: " +
                code
            );

        });

}


/* ---------------------------------------------------------
   REFERRAL LINK
--------------------------------------------------------- */

function getReferralLink() {

    const code =
        getMyReferralCode();


    return (
        window.location.origin +
        window.location.pathname +
        "?ref=" +
        encodeURIComponent(code)
    );

}


/* ---------------------------------------------------------
   COPY REFERRAL LINK
--------------------------------------------------------- */

function shareReferralLink() {

    const link =
        getReferralLink();


    navigator.clipboard
        .writeText(link)
        .then(function() {

            showToast(
                "Referral link copied!"
            );

        })
        .catch(function() {

            alert(
                "Referral Link:\n" +
                link
            );

        });

}


/* ---------------------------------------------------------
   WHATSAPP SHARE
--------------------------------------------------------- */

function shareReferralWhatsApp() {

    const link =
        getReferralLink();


    const message =
        "Join me on ElectroMart and get started! " +
        "Use my referral link: " +
        link;


    const whatsappURL =
        "https://wa.me/?text=" +
        encodeURIComponent(
            message
        );


    window.open(
        whatsappURL,
        "_blank"
    );

}


/* ---------------------------------------------------------
   CHECK REFERRAL FROM URL
--------------------------------------------------------- */

function checkReferralFromURL() {

    const params =
        new URLSearchParams(
            window.location.search
        );


    const referralCode =
        params.get("ref");


    if (!referralCode) {
        return;
    }


    localStorage.setItem(
        "electromartPendingReferral",
        referralCode
    );

}


/* ---------------------------------------------------------
   LOAD REFERRAL PAGE WHEN OPENED
--------------------------------------------------------- */

document.addEventListener(
    "DOMContentLoaded",
    function() {

        checkReferralFromURL();

    }
);
/* =====================================================
   OPEN ORDER FROM EMAIL
===================================================== */

async function openOrderFromEmail() {

    const params =
        new URLSearchParams(
            window.location.search
        );

    const orderId =
        params.get("orderId");

    if (!orderId) {
        return;
    }

    console.log(
        "Opening order from email:",
        orderId
    );

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

        if (
            !response.ok ||
            !data.success
        ) {

            console.error(
                "Unable to load order"
            );

            return;
        }

        const order =
            data.orders.find(
                item =>
                    String(item.id) ===
                    String(orderId)
            );

        if (!order) {

            console.error(
                "Order not found:",
                orderId
            );

            return;
        }

        console.log(
            "Order opened:",
            order
        );


        /* OPEN ORDERS SECTION */

        if (
            typeof showSection ===
            "function"
        ) {

            showSection("orders");

        }


        /* IF YOUR WEBSITE HAS
           RENDER ORDERS FUNCTION */

        if (
            typeof renderOrders ===
            "function"
        ) {

            renderOrders();

        }


        /* SCROLL TO ORDERS */

        setTimeout(
            function () {

                const ordersSection =
                    document.getElementById(
                        "orders"
                    );

                if (ordersSection) {

                    ordersSection.scrollIntoView({
                        behavior:"smooth",
                        block:"start"
                    });

                }

            },
            500
        );


    } catch (error) {

        console.error(
            "EMAIL ORDER OPEN ERROR:",
            error
        );

    }

}


/* RUN */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        openOrderFromEmail();

    }
);