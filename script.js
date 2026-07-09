const API_URL = "https://smart-bharat-assistant-project.onrender.com/api/users";

// ================= REGISTER =================
async function registerUser() {

    try {

        const name =
            document.getElementById("name").value.trim();

        const email =
            document.getElementById("email").value.trim();

        const phone =
            document.getElementById("phone").value.trim();

        const password =
            document.getElementById("password").value;

        const confirmPassword =
            document.getElementById("confirmPassword").value;

        // Name Validation
        if (name.length < 3) {
            showToast("Name must contain at least 3 characters","warning");
            return;
        }

        // Email Validation
        const emailPattern =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailPattern.test(email)) {
            showToast("Enter a valid Email Address","warning");
            return;
        }

        // Phone Validation
        if (!/^[0-9]{10}$/.test(phone)) {
            showToast("Phone Number must contain exactly 10 digits","warning");
            return;
        }

        // Password Validation
        if (password.length < 8) {
            showToast("Password must be at least 8 characters","warning");
            return;
        }

        // Confirm Password
        if (password !== confirmPassword) {
            showToast("Passwords do not match","error");
            return;
        }

        // Register Button Loading
        const btn =
            document.querySelector(".register-box button");

        btn.disabled = true;
        btn.innerHTML = "⏳ Creating Account...";

        const response = await fetch(
            `${API_URL}/register`,
            {
                method:"POST",
                headers:{
                    "Content-Type":"application/json"
                },
                body:JSON.stringify({
                    name,
                    email,
                    phone,
                    password
                })
            }
        );

        const data = await response.json();

        if(response.ok &&
           data.message==="Registration Successful"){

            showToast("Account Created Successfully ✔");

            setTimeout(()=>{

                window.location.href="login.html";

            },1500);

        }else{

            showToast(data.message,"error");

            btn.disabled=false;
            btn.innerHTML="Create Account";

        }

    } catch(err){

        console.log(err);

        showToast("Server Error","error");

        const btn =
            document.querySelector(".register-box button");

        btn.disabled=false;
        btn.innerHTML="Create Account";

    }

}

// ================= USER LOGIN =================
async function loginUser() {

    try {

        const email =
            document.getElementById("loginEmail").value.trim();

        const password =
            document.getElementById("loginPassword").value;

        // Email Validation
        const emailPattern =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailPattern.test(email)) {

            showToast("Enter a valid Email Address", "warning");
            return;

        }

        // Password Validation
        if (password.length < 8) {

            showToast("Password must be at least 8 characters", "warning");
            return;

        }

        // Login Button Loading
        const btn =
            document.querySelector(".login-box button[type='submit']");

        btn.disabled = true;
        btn.innerHTML = "⏳ Logging In...";

        const response = await fetch(
            `${API_URL}/login`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email,
                    password
                })
            }
        );

        const data = await response.json();

        if (response.ok && data.message === "Login Successful") {

            localStorage.setItem("name", data.name);
            localStorage.setItem("email", data.email);
            localStorage.setItem("phone", data.phone);
            localStorage.setItem("token", data.token);

            showToast("Welcome Back, " + data.name + " 👋", "success");

            setTimeout(() => {

                window.location.href = "dashboard.html";

            }, 1500);

        } else {

            showToast(data.message, "error");

            btn.disabled = false;
            btn.innerHTML = "Login";

        }

    } catch (err) {

        console.log(err);

        showToast("Server Error", "error");

        const btn =
            document.querySelector(".login-box button[type='submit']");

        btn.disabled = false;
        btn.innerHTML = "Login";

    }

}

// ================= LOGOUT =================
function logout() {
    localStorage.clear();
    window.location.href = "login.html";
}


// ================= APPLY SCHEME =================
async function submitApplication() {

    try {

        const applicant_name =
            document.getElementById("applicantName").value.trim();

        const aadhaar =
            document.getElementById("aadhaar").value.trim();

        const address =
            document.getElementById("address").value.trim();

        const scheme_name =
            document.getElementById("scheme").value;

        const email =
            localStorage.getItem("email");

        // Name Validation
        if (applicant_name.length < 3) {

            showToast("Enter a valid Applicant Name","warning");
            return;

        }

        // Aadhaar Validation
        if (!/^[0-9]{12}$/.test(aadhaar)) {

            showToast("Aadhaar Number must contain exactly 12 digits","warning");
            return;

        }

        // Address Validation
        if (address.length < 10) {

            showToast("Please enter a complete Address","warning");
            return;

        }

        // Scheme Validation
        if (scheme_name === "") {

            showToast("Please select a Scheme","warning");
            return;

        }

        // Loading Button
        const btn =
            document.querySelector(".application-box button[type='submit']");

        if(btn){

            btn.disabled = true;
            btn.innerHTML = "⏳ Submitting...";

        }

        const response = await fetch(
            `${API_URL}/apply`,
            {
                method:"POST",
                headers:{
                    "Content-Type":"application/json"
                },
                body:JSON.stringify({
                    applicant_name,
                    aadhaar,
                    address,
                    scheme_name,
                    email
                })
            }
        );

        const data = await response.json();

        if(response.ok){

            showToast("Application Submitted Successfully ✔");

            localStorage.removeItem("selectedScheme");

            setTimeout(()=>{

                window.location.href="status.html";

            },1500);

        }else{

            showToast(data.message,"error");

            if(btn){

                btn.disabled=false;
                btn.innerHTML="Submit Application";

            }

        }

    } catch(err){

        console.log(err);

        showToast("Server Error","error");

        const btn =
            document.querySelector(".application-box button[type='submit']");

        if(btn){

            btn.disabled=false;
            btn.innerHTML="Submit Application";

        }

    }

}

// ================= ADMIN LOGIN =================
async function adminLogin() {

    const email = document.getElementById("adminEmail").value.trim();
    const password = document.getElementById("adminPassword").value.trim();

    if (!email || !password) {
        showToast("Please enter email and password", "error");
        return;
    }

    const loginBtn = document.querySelector("button[type='submit']");
    const originalText = loginBtn.innerHTML;

    loginBtn.disabled = true;
    loginBtn.innerHTML = `
        <i class="fa-solid fa-spinner fa-spin"></i>
        Logging in...
    `;

    try {

        const response = await fetch(`${API_URL}/admin-login`, {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                email,
                password
            })

        });

        const data = await response.json();

        if (response.ok) {

            localStorage.setItem("admin", "true");

            showToast(data.message, "success");

            setTimeout(() => {

                window.location.href = "admin-dashboard.html";

            }, 1500);

        } else {

            showToast(data.message, "error");

        }

    } catch (err) {

        console.error(err);

        showToast("Server Error", "error");

    } finally {

        loginBtn.disabled = false;
        loginBtn.innerHTML = originalText;

    }

}

// ================= LOAD APPLICATIONS =================
let allApplications = [];

async function loadApplications() {
    try {
        const response = await fetch(
            `${API_URL}/applications`
        );

        const data = await response.json();

        allApplications = data;

        renderApplications(data);

    } catch (err) {
        console.log(err);
    }
}

function renderApplications(data) {

    let rows = "";

    data.forEach((app, index) => {

        let statusBadge = "";

        if (app.status === "Approved") {

            statusBadge = `
                <span class="status approved">
                    <i class="fa-solid fa-circle-check"></i>
                    Approved
                </span>
            `;

        }

        else if (app.status === "Rejected") {

            statusBadge = `
                <span class="status rejected">
                    <i class="fa-solid fa-circle-xmark"></i>
                    Rejected
                </span>
            `;

        }

        else {

            statusBadge = `
                <span class="status pending">
                    <i class="fa-solid fa-clock"></i>
                    Pending
                </span>
            `;

        }

        rows += `

        <tr>

            <td>${index + 1}</td>

            <td>${app.id}</td>

            <td>${app.applicant_name}</td>

            <td>${app.aadhaar}</td>

            <td>${app.address}</td>

            <td>${app.scheme_name}</td>

            <td>${statusBadge}</td>

            <td>

                <div class="action-buttons">

                    <button
                        class="approve-btn"
                        onclick="updateStatus(${app.id},'Approved')">

                        <i class="fa-solid fa-check"></i>

                        Approve

                    </button>

                    <button
                        class="reject-btn"
                        onclick="updateStatus(${app.id},'Rejected')">

                        <i class="fa-solid fa-xmark"></i>

                        Reject

                    </button>

                </div>

            </td>

            <td>

                <button
                    class="download-btn"
                    onclick="downloadApplicationPDF(
                        '${app.id}',
                        '${app.applicant_name}',
                        '${app.aadhaar}',
                        '${app.address}',
                        '${app.scheme_name}',
                        '${app.status}'
                    )">

                    <i class="fa-solid fa-file-pdf"></i>

                    Download PDF

                </button>

            </td>

        </tr>

        `;

    });

    document.getElementById("applicationTable").innerHTML = rows;

}

// ================= UPDATE STATUS =================
async function updateStatus(id, status) {
    try {
        const response = await fetch(
            `${API_URL}/update-status`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ id, status })
            }
        );

        const result = await response.text();
        console.log(result);

        loadApplications();
        loadStatistics();

    } catch (err) {
        console.log(err);
    }
}


// ================= USER STATUS =================
async function loadStatus() {

    const email = localStorage.getItem("email");

    if (!email) {

        showToast("Please Login First", "error");

        setTimeout(() => {

            window.location.href = "login.html";

        }, 1500);

        return;

    }

    try {

        const response = await fetch(`${API_URL}/status/${email}`);

        if (!response.ok) {

            throw new Error("Failed to fetch applications");

        }

        const data = await response.json();

        document.getElementById("totalApplications").innerText = data.length;

        let rows = "";

        if (data.length === 0) {

            rows = `
                <tr>
                    <td colspan="6" class="no-data">
                        <i class="fa-solid fa-folder-open"></i><br><br>
                        No Applications Found
                    </td>
                </tr>
            `;

        } else {

            data.forEach((app, index) => {

                let statusBadge = "";

                const status = (app.status || "").toLowerCase();

                if (status === "approved") {

                    statusBadge = `
                        <span class="status approved">
                            <i class="fa-solid fa-circle-check"></i>
                            Approved
                        </span>
                    `;

                } else if (status === "rejected") {

                    statusBadge = `
                        <span class="status rejected">
                            <i class="fa-solid fa-circle-xmark"></i>
                            Rejected
                        </span>
                    `;

                } else {

                    statusBadge = `
                        <span class="status pending">
                            <i class="fa-solid fa-clock"></i>
                            Pending
                        </span>
                    `;

                }

                rows += `
                <tr>

                    <td>${index + 1}</td>

                    <td>${app.id}</td>

                    <td>${app.applicant_name}</td>

                    <td>${app.scheme_name}</td>

                    <td>${statusBadge}</td>

                    <td>

                        <button
                            class="download-btn"
                            onclick='downloadSinglePDF(
                                ${JSON.stringify(app.id)},
                                ${JSON.stringify(app.applicant_name)},
                                ${JSON.stringify(app.scheme_name)},
                                ${JSON.stringify(app.status)}
                            )'>

                            <i class="fa-solid fa-file-pdf"></i>

                            Download PDF

                        </button>

                    </td>

                </tr>
                `;

            });

        }

        document.getElementById("statusTable").innerHTML = rows;

    }

    catch (err) {

        console.error(err);

        showToast("Unable to Load Applications", "error");

    }

}

// ================= NOTIFICATIONS =================
async function loadNotifications() {
    const email = localStorage.getItem("email");

    const response = await fetch(
        `${API_URL}/notifications/${email}`
    );

    const data = await response.json();

    let output = "";

    data.forEach(note => {
        output += `
        <div class="card">
            <h3>${note.message}</h3>
        </div><br>
        `;
    });

    document.getElementById("notificationList").innerHTML = output;
}


// ================= SELECT SCHEME =================
function searchScheme() {
    const searchValue = document
        .getElementById("searchInput")
        .value
        .toLowerCase()
        .trim();

    // Emptyனா எல்லா schemes show
    if (searchValue === "") {
        displaySchemes(schemes);
        return;
    }

    const filteredSchemes = schemes.filter((scheme) => {
        return (
            scheme.name.toLowerCase().includes(searchValue) ||
            scheme.description.toLowerCase().includes(searchValue)
        );
    });

    if (filteredSchemes.length > 0) {
        displaySchemes(filteredSchemes);
    } else {
        document.getElementById("schemeContainer").innerHTML = `
            <div class="scheme-card">
                <h3>No Scheme Found</h3>
                <p>Try another keyword</p>
            </div>
        `;
    }
}

window.addEventListener("load", function () {

    const theme =
        localStorage.getItem("theme");

    const themeBtn =
        document.getElementById("themeBtn");

    if (theme === "dark") {

        document.body.classList.add("dark-mode");

        if (themeBtn) {
            themeBtn.innerHTML = "☀ Light Mode";
        }

    } else {

        if (themeBtn) {
            themeBtn.innerHTML = "🌙 Dark Mode";
        }

    }

});

const schemes = [

{ name: "PM Kisan Samman Nidhi", description: "Income support for farmers." },

{ name: "Ayushman Bharat Yojana", description: "Health insurance for poor families." },

{ name: "PM Awas Yojana", description: "Affordable housing for all." },

{ name: "Atal Pension Yojana", description: "Pension support for workers." },

{ name: "Sukanya Samriddhi Yojana", description: "Savings scheme for girl children." },

{ name: "Mudra Loan Scheme", description: "Loan support for small businesses." },

{ name: "Stand Up India Scheme", description: "Entrepreneurship support for SC/ST/Women." },

{ name: "PM Scholarship Scheme", description: "Financial support for students." },

{ name: "National Education Scholarship", description: "Scholarship for higher education." },

{ name: "Skill India Mission", description: "Skill development training for youth." },

{ name: "Digital India Scheme", description: "Promoting digital literacy and online services." },

{ name: "Startup India Scheme", description: "Support for startups and innovation." },

{ name: "Beti Bachao Beti Padhao", description: "Girl child welfare and education." },

{ name: "Ujjwala Yojana", description: "Free LPG connection for women." },

{ name: "PM Suraksha Bima Yojana", description: "Accident insurance coverage." },

{ name: "PM Jeevan Jyoti Bima Yojana", description: "Life insurance coverage." },

{ name: "Jan Dhan Yojana", description: "Bank account for all citizens." },

{ name: "MGNREGA", description: "Employment guarantee for rural households." },

{ name: "National Food Security Scheme", description: "Food grains support for poor families." },

{ name: "PM Fasal Bima Yojana", description: "Crop insurance for farmers." },

{ name: "Kisan Credit Card Scheme", description: "Credit support for farmers." },

{ name: "PM Vishwakarma Yojana", description: "Support for traditional workers." },

{ name: "One Nation One Ration Card", description: "Portable ration card across India." },

{ name: "Swachh Bharat Mission", description: "Clean India initiative." },

{ name: "Jal Jeevan Mission", description: "Tap water connection for rural homes." },

{ name: "National Health Mission", description: "Healthcare services for all." },

{ name: "Free Laptop Scheme", description: "Laptop support for students." },

{ name: "Women Self Help Group Scheme", description: "Financial support for women groups." },

{ name: "PM Employment Generation Programme", description: "Support for employment generation." },

{ name: "Farmer Welfare Scheme", description: "Farmer welfare and subsidy support." }

];  

function displaySchemes(list = schemes) {
    let html = "";

    list.forEach((scheme) => {
        html += `
        <div class="scheme-card">

            <h3>${scheme.name}</h3>

            <p>${scheme.description}</p>

            <button onclick="viewScheme('${scheme.name}')">
                View Details
            </button>

        </div>
        `;
    });

    document.getElementById("schemeContainer").innerHTML = html;
}

async function loadStatistics() {
    try {
    
            const response = await fetch(
    `${API_URL}/applications`
);
        

        const data = await response.json();

        const pending = data.filter(
            app => app.status.trim().toLowerCase() === "pending"
        ).length;

        const approved = data.filter(
            app => app.status.trim().toLowerCase() === "approved"
        ).length;

        const rejected = data.filter(
            app => app.status.trim().toLowerCase() === "rejected"
        ).length;

        document.getElementById("totalCount").innerHTML = data.length;
        document.getElementById("pendingCount").innerHTML = pending;
        document.getElementById("approvedCount").innerHTML = approved;
        document.getElementById("rejectedCount").innerHTML = rejected;

    } catch (err) {
        console.log(err);
    }
}

function selectScheme(schemeName) {
    localStorage.setItem("selectedScheme", schemeName);
    window.location.href = "application.html";
}

function viewScheme(schemeName) {
    localStorage.setItem(
        "selectedScheme",
        schemeName
    );

    window.location.href =
        "scheme-details.html";
}

function goApply() {
    window.location.href =
        "application.html";
}

function downloadSinglePDF(appId, applicant, scheme, status) {

    if (!window.jspdf) {
        showToast("PDF Library Not Loaded", "error");
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    const name = localStorage.getItem("name") || "User";
    const email = localStorage.getItem("email") || "Not Available";

    // Try to add logo (optional)
    try {

        const logo = new Image();
        logo.src = "images/emblem.png";

        doc.addImage(logo, "PNG", 12, 5, 18, 20);

    } catch (e) {

        console.log("Logo skipped");

    }

    // Header
    doc.setFillColor(13,110,253);
    doc.rect(0,0,210,30,"F");

    doc.setTextColor(255,255,255);
    doc.setFont("helvetica","bold");
    doc.setFontSize(18);

    doc.text(
        "SMART BHARAT ASSISTANT",
        105,
        14,
        {align:"center"}
    );

    doc.setFontSize(11);

    doc.text(
        "Government Scheme Application Report",
        105,
        22,
        {align:"center"}
    );

    // Body
    doc.setTextColor(0,0,0);

    doc.setFontSize(16);
    doc.text("Application Details",20,45);

    doc.line(20,48,190,48);

    let y = 62;

    function row(label,value){

        doc.setFont("helvetica","bold");
        doc.text(label+" :",20,y);

        doc.setFont("helvetica","normal");
        doc.text(String(value),80,y);

        y += 12;

    }

    row("Application ID",appId);
    row("Applicant Name",applicant);
    row("Registered User",name);
    row("Email",email);
    row("Scheme Name",scheme);
    row("Application Status",status);

    // Status Box

    let bgColor = [255,193,7];

    if(String(status).toLowerCase()=="approved"){

        bgColor=[40,167,69];

    }

    else if(String(status).toLowerCase()=="rejected"){

        bgColor=[220,53,69];

    }

    doc.setFillColor(...bgColor);

    doc.roundedRect(20,y+8,170,22,3,3,"F");

    doc.setTextColor(255,255,255);

    doc.setFont("helvetica","bold");

    doc.text(
        "Current Status : "+status,
        25,
        y+22
    );

    // Footer

    doc.setTextColor(0,0,0);

    doc.line(20,275,190,275);

    doc.setFontSize(10);

    doc.text(
        "Generated by Smart Bharat Assistant",
        20,
        283
    );

    doc.text(
        new Date().toLocaleString(),
        190,
        283,
        {align:"right"}
    );

    doc.save(
        `${String(scheme).replace(/[^a-zA-Z0-9]/g,"_")}.pdf`
    );

    showToast(
        "PDF Downloaded Successfully",
        "success"
    );

}

function downloadApplicationPDF(
    appId,
    applicant,
    email,
    scheme,
    status
) {

    if (!window.jspdf) {

        showToast("PDF Library Not Loaded", "error");

        return;

    }

    const { jsPDF } = window.jspdf;

    const doc = new jsPDF();

    // Header
    doc.setFillColor(13,110,253);
    doc.rect(0,0,210,30,"F");

    doc.setTextColor(255,255,255);

    doc.setFont("helvetica","bold");
    doc.setFontSize(18);

    doc.text(
        "SMART BHARAT ASSISTANT",
        105,
        14,
        {align:"center"}
    );

    doc.setFontSize(11);

    doc.text(
        "Government Scheme Application Report",
        105,
        22,
        {align:"center"}
    );

    doc.setTextColor(0,0,0);

    doc.setFontSize(16);

    doc.text("Application Details",20,45);

    doc.line(20,48,190,48);

    let y = 65;

    function row(label,value){

        doc.setFont("helvetica","bold");

        doc.text(label+" :",20,y);

        doc.setFont("helvetica","normal");

        doc.text(String(value),75,y);

        y += 12;

    }

    row("Application ID",appId);

    row("Applicant",applicant);

    row("Email",email);

    row("Scheme",scheme);

    row("Status",status);

    doc.line(20,275,190,275);

    doc.setFontSize(10);

    doc.text(
        "Generated by Smart Bharat Assistant",
        20,
        283
    );

    doc.text(
        new Date().toLocaleString(),
        190,
        283,
        {align:"right"}
    );

    doc.save(
        `Application_${appId}.pdf`
    );

    showToast(
        "PDF Downloaded Successfully",
        "success"
    );

}

async function submitPasswordChange(){

const oldPassword=
document.getElementById("oldPassword").value;

const newPassword=
document.getElementById("newPassword").value;

const confirmPassword=
document.getElementById("confirmNewPassword").value;

if(!oldPassword || !newPassword || !confirmPassword){

showToast("Please fill all fields","warning");

return;

}

if(newPassword.length<8){

showToast("Password must be at least 8 characters","warning");

return;

}

if(newPassword!==confirmPassword){

showToast("Passwords do not match","error");

return;

}

const email=
localStorage.getItem("email");

try{

const response=await fetch(
`${API_URL}/change-password`,
{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify({
email,
oldPassword,
newPassword
})
}
);

const data=await response.json();

if(response.ok){

showToast(data.message);

closePasswordModal();

}else{

showToast(data.message,"error");

}

}catch(err){

console.log(err);

showToast("Server Error","error");

}

}

// ================= SEND OTP =================

async function sendOTP() {

    const email = document
        .getElementById("forgotEmail")
        .value
        .trim();

    if (!email) {

        showToast("Please enter your registered email", "error");
        return;

    }

    try {

        const response = await fetch(`${API_URL}/forgot-password`, {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                email
            })

        });

        const data = await response.json();

        if (response.ok) {

            localStorage.setItem("resetEmail", email);

            showToast(data.message, "success");

            document.getElementById("otpSection").style.display = "block";

            document.getElementById("otp").focus();

        }

        else {

            showToast(data.message, "error");

        }

    }

    catch (err) {

        console.log(err);

        showToast("Server Error", "error");

    }

}

// ================= VERIFY OTP & RESET PASSWORD =================

async function verifyAndResetPassword() {

    const email =
        localStorage.getItem("resetEmail");

    const otp =
        document.getElementById("otp").value.trim();

    const newPassword =
        document.getElementById("resetPassword").value;

    const confirmPassword =
        document.getElementById("confirmResetPassword").value;

    if (!otp || !newPassword || !confirmPassword) {

        showToast("Please fill all fields", "warning");
        return;

    }

    if (newPassword.length < 8) {

        showToast("Password must be at least 8 characters", "warning");
        return;

    }

    if (newPassword !== confirmPassword) {

        showToast("Passwords do not match", "error");
        return;

    }

    try {

        const response = await fetch(
            `${API_URL}/verify-otp`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    email,
                    otp,
                    newPassword
                })
            }
        );

        const data = await response.json();

        if (response.ok) {

            showToast("Password Reset Successful", "success");

            localStorage.removeItem("resetEmail");

            setTimeout(() => {

                window.location.href = "login.html";

            }, 1500);

        }

        else {

            showToast(data.message, "error");

        }

    }

    catch (err) {

        console.log(err);

        showToast("Server Error", "error");

    }

}

// ================= TOAST =================

function showToast(message, type = "success") {

    const toast = document.getElementById("toast");
    const msg = document.getElementById("toastMessage");
    const icon = document.getElementById("toastIcon");

    toast.className = "toast";

    msg.innerHTML = message;

    switch (type) {

        case "success":

            toast.classList.add("show");
            icon.innerHTML = "✔";
            break;

        case "error":

            toast.classList.add("show", "error");
            icon.innerHTML = "✖";
            break;

        case "warning":

            toast.classList.add("show", "warning");
            icon.innerHTML = "!";
            break;

        case "info":

            toast.classList.add("show", "info");
            icon.innerHTML = "ℹ";
            break;

        default:

            toast.classList.add("show");
            icon.innerHTML = "✔";

    }

    setTimeout(() => {

        toast.classList.remove("show");

    }, 3000);

}

function openPasswordModal() {

    document.getElementById("passwordModal").style.display = "flex";

}

function closePasswordModal() {

    document.getElementById("passwordModal").style.display = "none";

}

document.addEventListener("DOMContentLoaded", function () {

    const oldPassword = document.getElementById("oldPassword");
    const newPassword = document.getElementById("newPassword");
    const confirmPassword = document.getElementById("confirmNewPassword");

    // Profile page இல்லையென்றால் exit
    if (!oldPassword || !newPassword || !confirmPassword) {
        return;
    }

    // Old Password -> New Password
    oldPassword.addEventListener("keydown", function (e) {

        if (e.key === "Enter") {

            e.preventDefault();
            newPassword.focus();

        }

    });

    // New Password -> Confirm Password
    newPassword.addEventListener("keydown", function (e) {

        if (e.key === "Enter") {

            e.preventDefault();
            confirmPassword.focus();

        }

    });

    // Confirm Password -> Submit
    confirmPassword.addEventListener("keydown", function (e) {

        if (e.key === "Enter") {

            e.preventDefault();
            submitPasswordChange();

        }

    });

});