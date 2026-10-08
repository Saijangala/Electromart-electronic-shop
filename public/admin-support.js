/* =========================================================
   ELECTROMART CUSTOMER SUPPORT ADMIN
========================================================= */

let supportRequests = [];
let selectedTicket = null;
/* =====================================================
   SUPPORT ADMIN LOGIN
===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        const loginForm =
            document.getElementById(
                "supportLoginForm"
            );

        if (loginForm) {

            loginForm.addEventListener(
                "submit",
                supportAdminLogin
            );

        }

        checkSupportAdminLogin();

    }
);


/* =====================================================
   CHECK SUPPORT LOGIN
===================================================== */

function checkSupportAdminLogin() {

    const loggedIn =
        sessionStorage.getItem(
            "electromartSupportAdminLoggedIn"
        );

    const loginSection =
        document.getElementById(
            "supportLoginSection"
        );

    const dashboard =
        document.getElementById(
            "supportDashboard"
        );

    if (
        loggedIn === "true"
    ) {

        if (loginSection) {
            loginSection.classList.add(
                "hidden"
            );
        }

        if (dashboard) {
            dashboard.classList.remove(
                "hidden"
            );
        }

        loadSupportRequests();

    } else {

        if (loginSection) {
            loginSection.classList.remove(
                "hidden"
            );
        }

        if (dashboard) {
            dashboard.classList.add(
                "hidden"
            );
        }

    }
}


/* =====================================================
   SUPPORT LOGIN
===================================================== */

async function supportAdminLogin(event) {

    event.preventDefault();

    const email =
        document.getElementById(
            "supportAdminEmail"
        ).value.trim();

    const password =
        document.getElementById(
            "supportAdminPassword"
        ).value.trim();

    const message =
        document.getElementById(
            "supportLoginMessage"
        );

    if (!email || !password) {

        message.textContent =
            "Please enter email and password.";

        return;
    }

    try {

        /*
         * USE YOUR EXISTING ADMIN LOGIN API
         */

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

        const data =
            await response.json();

        console.log(
            "SUPPORT LOGIN RESPONSE:",
            data
        );

        if (
            !response.ok ||
            !data.success
        ) {

            message.textContent =
                data.message ||
                "Invalid admin email or password.";

            return;
        }

        /*
         * SAVE SUPPORT LOGIN
         */

        sessionStorage.setItem(
            "electromartSupportAdminLoggedIn",
            "true"
        );

        /*
         * SHOW DASHBOARD
         */

        document
            .getElementById(
                "supportLoginSection"
            )
            .classList.add(
                "hidden"
            );

        document
            .getElementById(
                "supportDashboard"
            )
            .classList.remove(
                "hidden"
            );

        /*
         * LOAD TICKETS
         */

        await loadSupportRequests();

    }
    catch (error) {

        console.error(
            "SUPPORT LOGIN ERROR:",
            error
        );

        message.textContent =
            "Unable to connect to server.";

    }
}

/* =========================================================
   PAGE LOAD
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    console.log("Customer Support JS loaded");

    document
        .getElementById("refreshBtn")
        ?.addEventListener(
            "click",
            loadSupportRequests
        );

    document
        .getElementById("csvBtn")
        ?.addEventListener(
            "click",
            downloadCSV
        );

    document
        .getElementById("pdfBtn")
        ?.addEventListener(
            "click",
            downloadPDF
        );

    document
        .getElementById("logoutBtn")
        ?.addEventListener(
            "click",
            adminLogout
        );

    document
        .getElementById("sidebarLogoutBtn")
        ?.addEventListener(
            "click",
            adminLogout
        );

    document
        .getElementById("closeModal")
        ?.addEventListener(
            "click",
            closeTicket
        );

    document
        .getElementById("saveTicket")
        ?.addEventListener(
            "click",
            saveTicket
        );

    document
        .getElementById("searchInput")
        ?.addEventListener(
            "input",
            renderTickets
        );

    document
        .getElementById("statusFilter")
        ?.addEventListener(
            "change",
            renderTickets
        );

    document
        .getElementById("allRequestsBtn")
        ?.addEventListener(
            "click",
            clearIssueFilter
        );

    document
        .querySelectorAll(".quick-status button")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const status =
                        button.dataset.status;

                    document.getElementById(
                        "modalStatus"
                    ).value = status;

                }
            );

        });

});


/* =========================================================
   LOAD SUPPORT REQUESTS
========================================================= */

async function loadSupportRequests() {

    const body =
        document.getElementById(
            "ticketBody"
        );

    if (body) {

        body.innerHTML = `
            <tr>
                <td colspan="7" class="loading">
                    Loading support requests...
                </td>
            </tr>
        `;

    }

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

        console.log(
            "SUPPORT API STATUS:",
            response.status
        );

        const text =
            await response.text();

        let data;

        try {

            data =
                text
                    ? JSON.parse(text)
                    : {};

        } catch (error) {

            console.error(
                "Invalid JSON:",
                text
            );

            throw new Error(
                "Server returned invalid response."
            );

        }


        console.log(
            "SUPPORT API DATA:",
            data
        );


        if (
            response.status === 401 ||
            response.status === 403
        ) {

            alert(
                "Admin login expired. Please login again."
            );

            window.location.href =
                "/admin.html";

            return;

        }


        if (!response.ok) {

            throw new Error(
                data.message ||
                `Support API error: ${response.status}`
            );

        }


        /*
            Accept these possible formats:

            [
                {...}
            ]

            OR

            {
                requests: [...]
            }

            OR

            {
                success: true,
                requests: [...]
            }
        */

        if (Array.isArray(data)) {

            supportRequests = data;

        } else if (
            Array.isArray(data.requests)
        ) {

            supportRequests =
                data.requests;

        } else if (
            Array.isArray(data.supportRequests)
        ) {

            supportRequests =
                data.supportRequests;

        } else if (
            Array.isArray(data.data)
        ) {

            supportRequests =
                data.data;

        } else {

            supportRequests = [];

        }


        console.log(
            "TOTAL SUPPORT REQUESTS:",
            supportRequests.length
        );


        updateSummary();

        renderSupportTypes();

        updateSupportCharts();

        renderTickets();


        const updated =
            document.getElementById(
                "lastUpdated"
            );

        if (updated) {

            updated.textContent =
                "Updated " +
                new Date().toLocaleTimeString();

        }


    } catch (error) {

        console.error(
            "SUPPORT ERROR:",
            error
        );

        supportRequests = [];

        updateSummary();

        renderSupportTypes();

        updateSupportCharts();

        if (body) {

            body.innerHTML = `
                <tr>
                    <td
                        colspan="7"
                        class="loading">

                        ❌ Unable to load support requests.

                        <br><br>

                        <small>
                            ${escapeHTML(
                                error.message
                            )}
                        </small>

                        <br><br>

                        <button
                            type="button"
                            onclick="loadSupportRequests()"
                            style="
                                background:#2563eb;
                                color:white;
                                border:none;
                                padding:10px 18px;
                                border-radius:8px;
                                cursor:pointer;
                            ">

                            ↻ Try Again

                        </button>

                    </td>
                </tr>
            `;

        }

    }

}


/* =========================================================
   SUMMARY
========================================================= */

function updateSummary() {

    const total =
        supportRequests.length;


    const open =
        supportRequests.filter(
            ticket =>
                normalizeStatus(
                    ticket.status
                ) === "open"
        ).length;


    const progress =
        supportRequests.filter(
            ticket =>
                normalizeStatus(
                    ticket.status
                ) === "in progress"
        ).length;


    const closed =
        supportRequests.filter(
            ticket => {

                const status =
                    normalizeStatus(
                        ticket.status
                    );

                return (
                    status === "resolved" ||
                    status === "closed" ||
                    status === "solved"
                );

            }
        ).length;


    setText(
        "totalCount",
        total
    );

    setText(
        "openCount",
        open
    );

    setText(
        "progressCount",
        progress
    );

    setText(
        "closedCount",
        closed
    );


    setText(
        "totalPercent",
        total > 0
            ? "100%"
            : "0%"
    );

    setText(
        "openPercent",
        percentage(
            open,
            total
        )
    );

    setText(
        "progressPercent",
        percentage(
            progress,
            total
        )
    );

    setText(
        "closedPercent",
        percentage(
            closed,
            total
        )
    );

}
/* =========================================================
   SUMMARY CARD CLICK ACTIONS
========================================================= */


/* =========================================================
   SHOW ALL REQUESTS
========================================================= */

function showTotalRequests() {

    console.log(
        "TOTAL REQUESTS CARD CLICKED"
    );

    const search =
        document.getElementById(
            "searchInput"
        );

    const status =
        document.getElementById(
            "statusFilter"
        );


    /* Clear search */

    if (search) {
        search.value = "";
    }


    /* Show all statuses */

    if (status) {
        status.value = "all";
    }


    /* Render all tickets */

    renderTickets();


    /* Scroll to table */

    const section =
        document.getElementById(
            "supportRequestsSection"
        );

    if (section) {

        section.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

    }

}


/* =========================================================
   SHOW OPEN REQUESTS
========================================================= */

function showOpenRequests() {

    console.log(
        "OPEN REQUESTS CARD CLICKED"
    );

    const search =
        document.getElementById(
            "searchInput"
        );

    const status =
        document.getElementById(
            "statusFilter"
        );


    /* Clear search */

    if (search) {
        search.value = "";
    }


    /* Select Open */

    if (status) {
        status.value = "Open";
    }


    /* Render filtered tickets */

    renderTickets();


    /* Scroll to table */

    const section =
        document.getElementById(
            "supportRequestsSection"
        );

    if (section) {

        section.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

    }

}


/* =========================================================
   SHOW IN PROGRESS REQUESTS
========================================================= */

function showProgressRequests() {

    console.log(
        "IN PROGRESS CARD CLICKED"
    );

    const search =
        document.getElementById(
            "searchInput"
        );

    const status =
        document.getElementById(
            "statusFilter"
        );


    if (search) {
        search.value = "";
    }


    if (status) {
        status.value = "In Progress";
    }


    renderTickets();


    const section =
        document.getElementById(
            "supportRequestsSection"
        );

    if (section) {

        section.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

    }

}


/* =========================================================
   SHOW CLOSED + RESOLVED REQUESTS
========================================================= */

function showClosedRequests() {

    console.log(
        "CLOSED / RESOLVED CARD CLICKED"
    );

    const search =
        document.getElementById(
            "searchInput"
        );


    if (search) {
        search.value = "";
    }


    /*
       The normal status dropdown cannot select
       both Resolved and Closed at the same time.

       Therefore use a custom filter here.
    */

    const body =
        document.getElementById(
            "ticketBody"
        );

    const countLabel =
        document.getElementById(
            "ticketCountLabel"
        );


    const closedTickets =
        supportRequests.filter(
            ticket => {

                const status =
                    normalizeStatus(
                        ticket.status
                    );

                return (
                    status === "closed" ||
                    status === "resolved" ||
                    status === "solved"
                );

            }
        );


    if (countLabel) {

        countLabel.textContent =
            `${closedTickets.length} tickets`;

    }


    if (!body) {
        return;
    }


    if (!closedTickets.length) {

        body.innerHTML = `

            <tr>

                <td
                    colspan="7"
                    class="loading"
                >

                    No closed or resolved
                    support requests found.

                </td>

            </tr>

        `;

    } else {

        body.innerHTML =
            closedTickets
                .map(ticket => {

                    const status =
                        ticket.status ||
                        "Closed";


                    const statusClass =
                        getStatusClass(
                            status
                        );


                    const customerName =
                        ticket.name ||
                        ticket.customer_name ||
                        ticket.customerName ||
                        "Customer";


                    const email =
                        ticket.email ||
                        ticket.customer_email ||
                        "";


                    const issue =
                        getIssueType(
                            ticket
                        ) || "-";


                    const order =
                        ticket.order_id ||
                        ticket.orderId ||
                        "-";


                    const ticketId =
                        ticket.id ||
                        ticket.ticket_id ||
                        "-";


                    return `

                        <tr>

                            <td>

                                <strong>
                                    #${escapeHTML(
                                        String(ticketId)
                                    )}
                                </strong>

                            </td>


                            <td>

                                <strong>
                                    ${escapeHTML(
                                        customerName
                                    )}
                                </strong>

                                <br>

                                <small>
                                    ${escapeHTML(
                                        email
                                    )}
                                </small>

                            </td>


                            <td>
                                ${escapeHTML(
                                    issue
                                )}
                            </td>


                            <td>
                                ${escapeHTML(
                                    String(order)
                                )}
                            </td>


                            <td>
                                ${formatDate(
                                    ticket.created_at ||
                                    ticket.createdAt
                                )}
                            </td>


                            <td>

                                <span
                                    class="
                                        status-badge
                                        ${statusClass}
                                    "
                                >

                                    ${escapeHTML(
                                        status
                                    )}

                                </span>

                            </td>


                            <td>

                                <button
                                    type="button"
                                    class="view-btn"
                                    onclick="openTicket(
                                        ${Number(ticketId)}
                                    )"
                                >

                                    👁 View

                                </button>

                            </td>

                        </tr>

                    `;

                })
                .join("");

    }


    const section =
        document.getElementById(
            "supportRequestsSection"
        );

    if (section) {

        section.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

    }

}


/* =========================================================
   SUPPORT TYPES
========================================================= */

function renderSupportTypes() {

    const container =
        document.getElementById(
            "typeGrid"
        );

    if (!container) {
        return;
    }


    const types = [
        "Delivery Issue",
        "Payment Issue",
        "Return Product",
        "Refund Request",
        "Complaint"
    ];


    container.innerHTML =
        types
            .map(type => {

                const count =
                    supportRequests.filter(
                        ticket => {

                            const issue =
                                getIssueType(
                                    ticket
                                ).toLowerCase();

                            return (
                                issue ===
                                type.toLowerCase()
                            );

                        }
                    ).length;


             return `

    <div
        class="type-card"
        onclick="showCategoryStatus('${escapeHTML(type)}')"
        style="cursor:pointer;"
    >

        <strong>
            ${escapeHTML(type)}
        </strong>

        <span>
            ${count} requests
        </span>

    </div>

`;

            })
            .join("");

}


/* =========================================================
   RENDER TICKETS
========================================================= */

function renderTickets() {

    const searchInput =
        document.getElementById(
            "searchInput"
        );

    const statusFilter =
        document.getElementById(
            "statusFilter"
        );


    const search =
        searchInput
            ? searchInput.value
                .trim()
                .toLowerCase()
            : "";


    const selectedStatus =
        statusFilter
            ? statusFilter.value
            : "all";


    let list =
        supportRequests.filter(
            ticket => {

                const customer =
                    `
                    ${ticket.name || ""}
                    ${ticket.customer_name || ""}
                    ${ticket.email || ""}
                    `
                        .toLowerCase();


                const text =
                    `
                    ${ticket.id || ""}
                    ${ticket.ticket_id || ""}
                    ${customer}
                    ${ticket.subject || ""}
                    ${ticket.message || ""}
                    ${ticket.issue_type || ""}
                    ${ticket.issueType || ""}
                    ${ticket.order_id || ""}
                    ${ticket.orderId || ""}
                    `
                        .toLowerCase();


                const matchesSearch =
                    !search ||
                    text.includes(search);


                const actualStatus =
                    normalizeStatus(
                        ticket.status
                    );


                const wantedStatus =
                    normalizeStatus(
                        selectedStatus
                    );


                const matchesStatus =
                    selectedStatus === "all" ||
                    actualStatus ===
                    wantedStatus;


                return (
                    matchesSearch &&
                    matchesStatus
                );

            }
        );


    const countLabel =
        document.getElementById(
            "ticketCountLabel"
        );


    if (countLabel) {

        countLabel.textContent =
            `${list.length} tickets`;

    }


    const body =
        document.getElementById(
            "ticketBody"
        );


    if (!body) {
        return;
    }


    if (!list.length) {

        body.innerHTML = `
            <tr>
                <td
                    colspan="7"
                    class="loading">

                    No support requests found.

                </td>
            </tr>
        `;

        return;

    }


    body.innerHTML =
        list
            .map(ticket => {

                const status =
                    ticket.status ||
                    "Open";


                const statusClass =
                    getStatusClass(
                        status
                    );


                const customerName =
                    ticket.name ||
                    ticket.customer_name ||
                    ticket.customerName ||
                    "Customer";


                const email =
                    ticket.email ||
                    ticket.customer_email ||
                    "";


                const issue =
                    getIssueType(
                        ticket
                    ) || "-";


                const order =
                    ticket.order_id ||
                    ticket.orderId ||
                    "-";


                return `

                    <tr>

                        <td>
                            <strong>
                                #${escapeHTML(
                                    String(
                                        ticket.id ||
                                        ticket.ticket_id ||
                                        "-"
                                    )
                                )}
                            </strong>
                        </td>


                        <td>

                            <strong>
                                ${escapeHTML(
                                    customerName
                                )}
                            </strong>

                            <br>

                            <small>
                                ${escapeHTML(
                                    email
                                )}
                            </small>

                        </td>


                        <td>
                            ${escapeHTML(issue)}
                        </td>


                        <td>
                            ${escapeHTML(
                                String(order)
                            )}
                        </td>


                        <td>
                            ${formatDate(
                                ticket.created_at ||
                                ticket.createdAt
                            )}
                        </td>


                        <td>

                            <span
                                class="
                                    status-badge
                                    ${statusClass}
                                ">

                                ${escapeHTML(
                                    status
                                )}

                            </span>

                        </td>


                        <td>

                            <button
                                type="button"
                                class="view-btn"
                                onclick="openTicket(
                                    ${Number(
                                        ticket.id ||
                                        ticket.ticket_id
                                    )}
                                )">

                                👁 View

                            </button>

                        </td>

                    </tr>

                `;

            })
            .join("");

}


/* =========================================================
   OPEN TICKET
========================================================= */

function openTicket(id) {

    selectedTicket =
        supportRequests.find(
            ticket =>
                Number(
                    ticket.id ||
                    ticket.ticket_id
                ) === Number(id)
        );


    if (!selectedTicket) {

        alert(
            "Support ticket not found."
        );

        return;

    }


    setText(
        "modalTicket",
        `Ticket #${
            selectedTicket.id ||
            selectedTicket.ticket_id
        }`
    );


    setText(
        "modalSubject",
        selectedTicket.subject ||
        getIssueType(
            selectedTicket
        ) ||
        "Support Request"
    );


    const customerName =
        selectedTicket.name ||
        selectedTicket.customer_name ||
        "Customer";


    const email =
        selectedTicket.email ||
        selectedTicket.customer_email ||
        "-";


    const order =
        selectedTicket.order_id ||
        selectedTicket.orderId ||
        "-";


    const phone =
        selectedTicket.phone ||
        selectedTicket.customer_phone ||
        "-";


    const meta =
        document.getElementById(
            "modalMeta"
        );


    if (meta) {

        meta.innerHTML = `

            <strong>Customer:</strong>
            ${escapeHTML(customerName)}

            &nbsp; | &nbsp;

            <strong>Email:</strong>
            ${escapeHTML(email)}

            <br>

            <strong>Phone:</strong>
            ${escapeHTML(phone)}

            &nbsp; | &nbsp;

            <strong>Order:</strong>
            ${escapeHTML(
                String(order)
            )}

            <br>

            <strong>Created:</strong>
            ${escapeHTML(
                formatDate(
                    selectedTicket.created_at ||
                    selectedTicket.createdAt
                )
            )}

        `;

    }


    setText(
        "modalMessage",
        selectedTicket.message ||
        selectedTicket.description ||
        "No message."
    );


    const oldReply =
        selectedTicket.admin_reply ||
        selectedTicket.adminReply ||
        selectedTicket.reply ||
        "";


    const replyBox =
        document.getElementById(
            "previousReplyBox"
        );


    const previousReply =
        document.getElementById(
            "previousReply"
        );


    if (oldReply) {

        if (replyBox) {
            replyBox.style.display =
                "block";
        }

        if (previousReply) {
            previousReply.textContent =
                oldReply;
        }

    } else {

        if (replyBox) {
            replyBox.style.display =
                "none";
        }

    }


    const replyInput =
        document.getElementById(
            "adminReply"
        );


    if (replyInput) {

        replyInput.value = "";

    }


    const statusSelect =
        document.getElementById(
            "modalStatus"
        );


    if (statusSelect) {

        statusSelect.value =
            normalizeDisplayStatus(
                selectedTicket.status
            );

    }


    document
        .getElementById(
            "ticketModal"
        )
        ?.classList.add("show");

}


/* =========================================================
   SAVE REPLY + STATUS
========================================================= */

async function saveTicket() {

    if (!selectedTicket) {

        alert(
            "No ticket selected."
        );

        return;

    }


    const reply =
        document.getElementById(
            "adminReply"
        )?.value.trim() || "";


    const status =
        document.getElementById(
            "modalStatus"
        )?.value || "Open";


    const id =
        selectedTicket.id ||
        selectedTicket.ticket_id;


    try {

        const response =
            await fetch(
                `/api/admin/support/${id}`,
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

                        status:
                            status,

                        adminReply:
                            reply

                    })

                }
            );


        const text =
            await response.text();


        let data = {};

        try {

            data =
                text
                    ? JSON.parse(text)
                    : {};

        } catch {

            data = {};

        }


        if (
            response.status === 401 ||
            response.status === 403
        ) {

            alert(
                "Admin session expired. Please login again."
            );

            window.location.href =
                "/admin.html";

            return;

        }


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Unable to update ticket."
            );

        }


        alert(
            "Support ticket updated successfully."
        );


        closeTicket();

        await loadSupportRequests();


    } catch (error) {

        console.error(
            "UPDATE SUPPORT ERROR:",
            error
        );

        alert(
            error.message ||
            "Unable to connect to server."
        );

    }

}


/* =========================================================
   FILTER
========================================================= */

function filterIssue(issue) {

    const search =
        document.getElementById(
            "searchInput"
        );


    const status =
        document.getElementById(
            "statusFilter"
        );


    if (search) {
        search.value = issue;
    }


    if (status) {
        status.value = "all";
    }


    renderTickets();

}
/* =========================================================
   CATEGORY STATUS BREAKDOWN
========================================================= */

function showCategoryStatus(issue) {

    console.log(
        "CATEGORY SELECTED:",
        issue
    );

    const categoryTickets =
        supportRequests.filter(ticket => {

            const ticketIssue =
                getIssueType(ticket)
                    .trim()
                    .toLowerCase();

            return ticketIssue ===
                issue.trim().toLowerCase();

        });

    const total =
        categoryTickets.length;

    let open = 0;
    let progress = 0;
    let resolved = 0;
    let closed = 0;

    categoryTickets.forEach(ticket => {

        const status =
            normalizeStatus(ticket.status);

        if (status === "open") {

            open++;

        } else if (
            status === "in progress"
        ) {

            progress++;

        } else if (
            status === "resolved"
        ) {

            resolved++;

        } else if (
            status === "closed"
        ) {

            closed++;

        }

    });

    console.log(
        "CATEGORY STATUS:",
        {
            issue,
            total,
            open,
            progress,
            resolved,
            closed
        }
    );

    const percentage = function(value) {

        if (!total) {
            return 0;
        }

        return Math.round(
            (value / total) * 100
        );

    };

    const message = `

        ${issue}

        Total Requests: ${total}

        Open:
        ${open} (${percentage(open)}%)

        In Progress:
        ${progress} (${percentage(progress)}%)

        Resolved:
        ${resolved} (${percentage(resolved)}%)

        Closed:
        ${closed} (${percentage(closed)}%)

    `;

    /*
       Show category information
    */

    alert(message);

    /*
       Also filter the main ticket table
    */

    const search =
        document.getElementById(
            "searchInput"
        );

    const status =
        document.getElementById(
            "statusFilter"
        );

    if (search) {

        search.value = issue;

    }

    if (status) {

        status.value = "all";

    }

    renderTickets();

    /*
       Scroll to Support Requests
    */

    const section =
        document.getElementById(
            "supportRequestsSection"
        );

    if (section) {

        section.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

    }

}

function clearIssueFilter() {

    const search =
        document.getElementById(
            "searchInput"
        );


    const status =
        document.getElementById(
            "statusFilter"
        );


    if (search) {
        search.value = "";
    }


    if (status) {
        status.value = "all";
    }


    renderTickets();

}


/* =========================================================
   CHARTS
========================================================= */

function updateSupportCharts() {

    drawStatusPieChart();

    drawCategoryPieChart();

}


function drawStatusPieChart() {

    const canvas =
        document.getElementById(
            "supportStatusChart"
        );


    if (!canvas) {
        return;
    }


    const ctx =
        canvas.getContext("2d");


    const statuses = {

        "Open": 0,

        "In Progress": 0,

        "Resolved": 0,

        "Closed": 0

    };


    supportRequests.forEach(
        ticket => {

            const status =
                normalizeStatus(
                    ticket.status
                );


            if (status === "open") {

                statuses["Open"]++;

            } else if (
                status ===
                "in progress"
            ) {

                statuses[
                    "In Progress"
                ]++;

            } else if (
                status ===
                "resolved"
            ) {

                statuses[
                    "Resolved"
                ]++;

            } else if (
                status ===
                "closed"
            ) {

                statuses[
                    "Closed"
                ]++;

            } else {

                statuses["Open"]++;

            }

        }
    );


    const colors = [
        "#f59e0b",
        "#6366f1",
        "#22c55e",
        "#ef4444"
    ];


    drawPie(
        ctx,
        Object.values(statuses),
        colors
    );


    createLegend(
        "supportStatusLegend",
        Object.entries(statuses),
        colors
    );

}


function drawCategoryPieChart() {

    const canvas =
        document.getElementById(
            "supportCategoryChart"
        );


    if (!canvas) {
        return;
    }


    const ctx =
        canvas.getContext("2d");


    const categories = {

        "Delivery Issue": 0,

        "Payment Issue": 0,

        "Return Product": 0,

        "Refund Request": 0,

        "Complaint": 0

    };


    supportRequests.forEach(
        ticket => {

            const issue =
                getIssueType(
                    ticket
                ).toLowerCase();


            if (
                issue.includes("delivery")
            ) {

                categories[
                    "Delivery Issue"
                ]++;

            } else if (
                issue.includes("payment")
            ) {

                categories[
                    "Payment Issue"
                ]++;

            } else if (
                issue.includes("return")
            ) {

                categories[
                    "Return Product"
                ]++;

            } else if (
                issue.includes("refund")
            ) {

                categories[
                    "Refund Request"
                ]++;

            } else if (
                issue.includes("complaint")
            ) {

                categories[
                    "Complaint"
                ]++;

            }

        }
    );


    const colors = [
        "#3b82f6",
        "#8b5cf6",
        "#f97316",
        "#14b8a6",
        "#ef4444"
    ];


    drawPie(
        ctx,
        Object.values(categories),
        colors
    );


    createLegend(
        "supportCategoryLegend",
        Object.entries(categories),
        colors
    );

}


/* =========================================================
   DRAW PIE
========================================================= */
function drawPie(
    ctx,
    values,
    colors
) {

    const total =
        values.reduce(
            (sum, value) => sum + value,
            0
        );

    ctx.clearRect(
        0,
        0,
        ctx.canvas.width,
        ctx.canvas.height
    );

    const centerX =
        ctx.canvas.width / 2;

    const centerY =
        ctx.canvas.height / 2;

    const radius = 105;

    /*
        No data
    */

    if (total === 0) {

        ctx.beginPath();

        ctx.arc(
            centerX,
            centerY,
            radius,
            0,
            Math.PI * 2
        );

        ctx.fillStyle = "#1e293b";

        ctx.fill();

        ctx.closePath();

        return;
    }


    let startAngle =
        -Math.PI / 2;


    values.forEach(
        (value, index) => {

            if (value <= 0) {
                return;
            }


            const sliceAngle =
                (
                    value / total
                ) *
                Math.PI *
                2;


            const endAngle =
                startAngle +
                sliceAngle;


            /*
                Draw slice
            */

            ctx.beginPath();

            ctx.moveTo(
                centerX,
                centerY
            );

            ctx.arc(
                centerX,
                centerY,
                radius,
                startAngle,
                endAngle
            );

            ctx.closePath();

            ctx.fillStyle =
                colors[index];

            ctx.fill();


            /*
                Calculate percentage
            */

            const percentage =
                Math.round(
                    (
                        value /
                        total
                    ) *
                    100
                );


            /*
                Position for percentage
            */

            const middleAngle =
                startAngle +
                (
                    sliceAngle / 2
                );


            const labelRadius =
                radius * 0.72;


            const labelX =
                centerX +
                Math.cos(
                    middleAngle
                ) *
                labelRadius;


            const labelY =
                centerY +
                Math.sin(
                    middleAngle
                ) *
                labelRadius;


            /*
                Show percentage
            */

            if (percentage >= 5) {

                ctx.fillStyle =
                    "#ffffff";

                ctx.font =
                    "bold 15px Arial";

                ctx.textAlign =
                    "center";

                ctx.textBaseline =
                    "middle";


                ctx.fillText(
                    percentage + "%",
                    labelX,
                    labelY
                );

            }


            startAngle =
                endAngle;

        }
    );


    /*
        Center hole
    */

    ctx.beginPath();

    ctx.arc(
        centerX,
        centerY,
        55,
        0,
        Math.PI * 2
    );

    ctx.fillStyle =
        "#07101f";

    ctx.fill();

    ctx.closePath();


    /*
        Center total
    */

    ctx.fillStyle =
        "#ffffff";

    ctx.font =
        "bold 24px Arial";

    ctx.textAlign =
        "center";

    ctx.textBaseline =
        "middle";

    ctx.fillText(
        total,
        centerX,
        centerY
    );

}

/* =========================================================
   LEGEND
========================================================= */

function createLegend(
    elementId,
    entries,
    colors
) {

    const container =
        document.getElementById(
            elementId
        );


    if (!container) {
        return;
    }


    const total =
        entries.reduce(
            (sum, item) =>
                sum + item[1],
            0
        );


    container.innerHTML =
        entries
            .map(
                ([name, value], index) => {

                    const percent =
                        total
                            ? Math.round(
                                (
                                    value /
                                    total
                                ) *
                                100
                            )
                            : 0;


                    return `

                        <div
                            class="legend-item">

                            <span
                                class="legend-dot"
                                style="
                                    background:
                                    ${colors[index]};
                                ">
                            </span>

                            <span
                                class="legend-name">

                                ${escapeHTML(
                                    name
                                )}

                            </span>

                            <span
                                class="legend-value">

                                ${value}
                                (${percent}%)

                            </span>

                        </div>

                    `;

                }
            )
            .join("");

}


/* =========================================================
   LOGOUT
========================================================= */
/* =====================================================
   SUPPORT ADMIN LOGOUT
===================================================== */

async function adminLogout() {

    const confirmed =
        confirm(
            "Are you sure you want to logout?"
        );

    if (!confirmed) {
        return;
    }

    try {

        await fetch(
            "/api/admin/logout",
            {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type":
                        "application/json"
                }
            }
        );

    } catch (error) {

        console.error(
            "SUPPORT LOGOUT ERROR:",
            error
        );

    }

    /*
       REMOVE SUPPORT LOGIN
    */

    sessionStorage.removeItem(
        "electromartSupportAdminLoggedIn"
    );

    /*
       RETURN TO SUPPORT LOGIN PAGE
    */

    window.location.href =
        "/admin-support.html";
}


/* =========================================================
   CLOSE MODAL
========================================================= */

function closeTicket() {

    const modal =
        document.getElementById(
            "ticketModal"
        );


    if (modal) {

        modal.classList.remove(
            "show"
        );

    }


    selectedTicket = null;

}


/* =========================================================
   CSV
========================================================= */

function downloadCSV() {

    if (!supportRequests.length) {

        alert(
            "There are no support requests to export."
        );

        return;

    }


    const rows = [

        [
            "Ticket",
            "Customer",
            "Email",
            "Phone",
            "Issue",
            "Order",
            "Message",
            "Status",
            "Created"
        ]

    ];


    supportRequests.forEach(
        ticket => {

            rows.push([

                ticket.id ||
                ticket.ticket_id ||
                "",

                ticket.name ||
                ticket.customer_name ||
                "",

                ticket.email ||
                ticket.customer_email ||
                "",

                ticket.phone ||
                ticket.customer_phone ||
                "",

                getIssueType(
                    ticket
                ),

                ticket.order_id ||
                ticket.orderId ||
                "",

                ticket.message ||
                "",

                ticket.status ||
                "",

                ticket.created_at ||
                ticket.createdAt ||
                ""

            ]);

        }
    );


    const csv =
        rows
            .map(
                row =>
                    row
                        .map(
                            value =>
                                `"${String(
                                    value ?? ""
                                ).replaceAll(
                                    '"',
                                    '""'
                                )}"`
                        )
                        .join(",")
            )
            .join("\n");


    const blob =
        new Blob(
            [csv],
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


    link.href = url;

    link.download =
        "electromart-support.csv";


    document.body.appendChild(
        link
    );

    link.click();

    link.remove();


    URL.revokeObjectURL(
        url
    );

}


/* =========================================================
   PDF / PRINT
========================================================= */

function downloadPDF() {

    console.log("PDF BUTTON CLICKED");

    if (!supportRequests || supportRequests.length === 0) {
        alert("There are no support requests to export.");
        return;
    }

    const rows = supportRequests.map(ticket => {

        const ticketId =
            ticket.id ||
            ticket.ticket_id ||
            "-";

        const customer =
            ticket.name ||
            ticket.customer_name ||
            ticket.customerName ||
            "Customer";

        const email =
            ticket.email ||
            ticket.customer_email ||
            "-";

        const issue =
            getIssueType(ticket) || "-";

        const order =
            ticket.order_id ||
            ticket.orderId ||
            "-";

        const created =
            formatDate(
                ticket.created_at ||
                ticket.createdAt
            );

        const status =
            ticket.status || "Open";

        return `
            <tr>
                <td>#${escapeHTML(String(ticketId))}</td>

                <td>
                    <strong>${escapeHTML(customer)}</strong><br>
                    <small>${escapeHTML(email)}</small>
                </td>

                <td>${escapeHTML(issue)}</td>

                <td>${escapeHTML(String(order))}</td>

                <td>${escapeHTML(created)}</td>

                <td>${escapeHTML(status)}</td>
            </tr>
        `;
    }).join("");

    const printWindow = window.open(
        "",
        "_blank",
        "width=1200,height=800"
    );

    if (!printWindow) {

        alert(
            "Popup blocked. Please allow pop-ups for localhost:5000."
        );

        return;
    }

    printWindow.document.write(`

        <!DOCTYPE html>

        <html>

        <head>

            <meta charset="UTF-8">

            <title>
                ElectroMart - Support Requests
            </title>

            <style>

                * {
                    box-sizing: border-box;
                }

                body {
                    margin: 0;
                    padding: 25px;
                    font-family: Arial, sans-serif;
                    color: #111827;
                    background: white;
                }

                h1 {
                    text-align: center;
                    margin-bottom: 5px;
                    font-size: 25px;
                }

                .subtitle {
                    text-align: center;
                    color: #555;
                    margin-bottom: 20px;
                }

                .report-info {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 15px;
                    padding: 10px 0;
                    border-bottom: 2px solid #111827;
                }

                table {
                    width: 100%;
                    border-collapse: collapse;
                    font-size: 11px;
                }

                th {
                    background: #111827;
                    color: white;
                    padding: 10px;
                    border: 1px solid #111827;
                    text-align: left;
                }

                td {
                    padding: 9px;
                    border: 1px solid #d1d5db;
                    vertical-align: top;
                }

                tbody tr:nth-child(even) {
                    background: #f8fafc;
                }

                @page {
                    size: A4 landscape;
                    margin: 12mm;
                }

                @media print {

                    body {
                        padding: 0;
                    }

                }

            </style>

        </head>

        <body>

            <h1>
                ElectroMart - Customer Support
            </h1>

            <div class="subtitle">
                Support Requests Report
            </div>

            <div class="report-info">

                <strong>
                    Total Requests:
                    ${supportRequests.length}
                </strong>

                <span>
                    Generated:
                    ${escapeHTML(
                        new Date().toLocaleString("en-IN")
                    )}
                </span>

            </div>

            <table>

                <thead>

                    <tr>

                        <th>Ticket</th>

                        <th>Customer</th>

                        <th>Issue</th>

                        <th>Order</th>

                        <th>Created</th>

                        <th>Status</th>

                    </tr>

                </thead>

                <tbody>

                    ${rows}

                </tbody>

            </table>

            <script>

                window.onload = function () {

                    setTimeout(function () {

                        window.print();

                    }, 300);

                };

            <\/script>

        </body>

        </html>

    `);

    printWindow.document.close();

}

/* =========================================================
   HELPERS
========================================================= */

function setText(
    id,
    value
) {

    const element =
        document.getElementById(
            id
        );


    if (element) {

        element.textContent =
            value;

    }

}


function percentage(
    value,
    total
) {

    if (!total) {

        return "0%";

    }


    return (
        Math.round(
            (
                value /
                total
            ) *
            100
        ) +
        "%"
    );

}


function normalizeStatus(
    status
) {

    const value =
        String(
            status ||
            "Open"
        )
            .trim()
            .toLowerCase();


    if (
        value === "in_progress" ||
        value === "in-progress" ||
        value === "in progress" ||
        value === "progress"
    ) {

        return "in progress";

    }


    if (
        value === "resolved" ||
        value === "solved"
    ) {

        return "resolved";

    }


    if (
        value === "closed"
    ) {

        return "closed";

    }


    return "open";

}


function normalizeDisplayStatus(
    status
) {

    const value =
        normalizeStatus(
            status
        );


    if (
        value === "in progress"
    ) {

        return "In Progress";

    }


    if (
        value === "resolved"
    ) {

        return "Resolved";

    }


    if (
        value === "closed"
    ) {

        return "Closed";

    }


    return "Open";

}


function getStatusClass(
    status
) {

    const value =
        normalizeStatus(
            status
        );


    if (
        value === "open"
    ) {

        return "status-open";

    }


    if (
        value === "in progress"
    ) {

        return "status-progress";

    }


    return "status-closed";

}


function getIssueType(
    ticket
) {

    return (
        ticket.issue_type ||
        ticket.issueType ||
        ticket.category ||
        ticket.type ||
        "Other"
    );

}


function formatDate(
    value
) {

    if (!value) {
        return "-";
    }


    const date =
        new Date(value);


    if (
        isNaN(
            date.getTime()
        )
    ) {

        return "-";

    }


    return date.toLocaleString(
        "en-IN"
    );

}


function escapeHTML(
    value
) {

    return String(
        value ?? ""
    )
        .replaceAll(
            "&",
            "&amp;"
        )
        .replaceAll(
            "<",
            "&lt;"
        )
        .replaceAll(
            ">",
            "&gt;"
        )
        .replaceAll(
            '"',
            "&quot;"
        )
        .replaceAll(
            "'",
            "&#039;"
        );

}


/* =========================================================
   ESC KEY / BACKDROP
========================================================= */

document.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "Escape"
        ) {

            closeTicket();

        }

    }
);


document.addEventListener(
    "click",
    event => {

        const modal =
            document.getElementById(
                "ticketModal"
            );


        if (
            event.target === modal
        ) {

            closeTicket();

        }

    }
);
/* =========================================================
   CATEGORY DETAILS - NO ALERT POPUP
========================================================= */

function showCategoryStatus(issue) {

    console.log("CATEGORY CLICKED:", issue);

    const categoryTickets = supportRequests.filter(ticket => {

        const ticketIssue =
            getIssueType(ticket)
                .trim()
                .toLowerCase();

        return ticketIssue ===
            issue.trim().toLowerCase();

    });


    const total = categoryTickets.length;

    let open = 0;
    let progress = 0;
    let resolved = 0;
    let closed = 0;


    categoryTickets.forEach(ticket => {

        const status =
            normalizeStatus(ticket.status);

        if (status === "open") {

            open++;

        } else if (status === "in progress") {

            progress++;

        } else if (status === "resolved") {

            resolved++;

        } else if (status === "closed") {

            closed++;

        }

    });


    function getPercent(value) {

        if (!total) {
            return 0;
        }

        return Math.round(
            (value / total) * 100
        );

    }


    /* TITLE */

    setText(
        "categoryDetailsTitle",
        issue
    );


    setText(
        "categoryDetailsSubtitle",
        `${total} requests in this support category`
    );


    /* TOTAL */

    setText(
        "categoryTotalCount",
        total
    );


    /* OPEN */

    setText(
        "categoryOpenCount",
        open
    );

    setText(
        "categoryOpenPercent",
        getPercent(open) + "%"
    );


    /* IN PROGRESS */

    setText(
        "categoryProgressCount",
        progress
    );

    setText(
        "categoryProgressPercent",
        getPercent(progress) + "%"
    );


    /* RESOLVED */

    setText(
        "categoryResolvedCount",
        resolved
    );

    setText(
        "categoryResolvedPercent",
        getPercent(resolved) + "%"
    );


    /* CLOSED */

    setText(
        "categoryClosedCount",
        closed
    );

    setText(
        "categoryClosedPercent",
        getPercent(closed) + "%"
    );


    setText(
        "categoryRequestCount",
        `${total} requests`
    );


    /* REQUEST TABLE */

    const body =
        document.getElementById(
            "categoryRequestBody"
        );


    if (!body) {

        console.error(
            "categoryRequestBody not found"
        );

        return;

    }


    if (categoryTickets.length === 0) {

        body.innerHTML = `

            <tr>

                <td
                    colspan="7"
                    style="
                        text-align:center;
                        padding:30px;
                        color:#94a3b8;
                    "
                >

                    No requests found
                    for ${escapeHTML(issue)}.

                </td>

            </tr>

        `;

    } else {

        body.innerHTML =
            categoryTickets.map(ticket => {

                const ticketId =
                    ticket.id ||
                    ticket.ticket_id ||
                    "-";


                const customerName =
                    ticket.name ||
                    ticket.customer_name ||
                    ticket.customerName ||
                    "Customer";


                const email =
                    ticket.email ||
                    ticket.customer_email ||
                    "-";


                const issueType =
                    getIssueType(ticket);


                const order =
                    ticket.order_id ||
                    ticket.orderId ||
                    "-";


                const created =
                    formatDate(
                        ticket.created_at ||
                        ticket.createdAt
                    );


                const status =
                    ticket.status ||
                    "Open";


                const statusClass =
                    getStatusClass(status);


                return `

                    <tr>

                        <td>
                            <strong>
                                #${escapeHTML(
                                    String(ticketId)
                                )}
                            </strong>
                        </td>


                        <td>

                            <strong>
                                ${escapeHTML(
                                    customerName
                                )}
                            </strong>

                            <br>

                            <small>
                                ${escapeHTML(
                                    email
                                )}
                            </small>

                        </td>


                        <td>
                            ${escapeHTML(
                                issueType
                            )}
                        </td>


                        <td>
                            ${escapeHTML(
                                String(order)
                            )}
                        </td>


                        <td>
                            ${escapeHTML(
                                created
                            )}
                        </td>


                        <td>

                            <span
                                class="
                                    status-badge
                                    ${statusClass}
                                "
                            >

                                ${escapeHTML(
                                    status
                                )}

                            </span>

                        </td>


                        <td>

                            <button
                                type="button"
                                class="view-btn"
                                onclick="openTicket(
                                    ${Number(ticketId)}
                                )"
                            >

                                👁 View

                            </button>

                        </td>

                    </tr>

                `;

            }).join("");

    }


    /* SHOW CATEGORY PANEL */

    const panel =
        document.getElementById(
            "categoryDetailsPanel"
        );


    if (!panel) {

        console.error(
            "categoryDetailsPanel not found"
        );

        return;

    }


    panel.classList.remove("hidden");


    panel.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });


    console.log(
        "CATEGORY PANEL OPENED:",
        issue
    );

}


/* =========================================================
   CLOSE CATEGORY DETAILS
========================================================= */

function closeCategoryDetails() {

    const panel =
        document.getElementById(
            "categoryDetailsPanel"
        );

    if (panel) {

        panel.classList.add(
            "hidden"
        );

    }

}