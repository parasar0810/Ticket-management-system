# Modern Enterprise Ticketing & Issue Management Portal

This project is a **Modern Enterprise Ticketing & Issue Management Portal**. It serves as a centralized bridge between on-ground workers/customers and the administrative support team, ensuring that operational hurdles are reported, tracked, and resolved with high efficiency.

## 🛠 Project Overview
The system provides a high-performance, role-based environment where communication is streamlined and data-driven. It transitions away from manual or legacy reporting methods into a sleek, automated digital ecosystem.

## ✨ Key Features

### 🔹 For the User (Workers & Customers)
*   **Intuitive "Raise a Ticket" Interface:** Categorize issues (Hardware, Software, Network), set impact levels, and provide detailed descriptions.
*   **Evidence Attachment:** Supports file uploads (images/documents) up to 4MB.
*   **Real-Time Tracking Dashboard:** Monitor live status (Open, In Progress, or Resolved).
*   **Email Confirmations:** Automatic email notifications on ticket submission.

### 🔹 For the Administrator (Support & Resolution Team)
*   **Resolution Control Center:** Dedicated portal for high-volume management.
*   **Advanced Workflow Management:** "Take Assignment" (In Progress) and "Reply & Resolve" (Closed).
*   **Interactive Analytics:** Real-time counters for active issues and resolution rates.
*   **Dynamic Filtering:** Filter the entire database by ticket status.

## 🎨 Design & User Experience
*   **Tata Motors Brand Identity:** Professional palette of **Tata Blue (#005596)** and clean whites.
*   **Modern Sidebar Architecture:** Responsive sidebar for effortless navigation.
*   **Card-Based Layout:** Information-rich cards with status-colored badges.

## 🚀 Technical Stack
*   **Frontend:** HTML5, CSS3, Vanilla JavaScript (Zero Dependencies).
*   **Backend:** Node.js, Express.
*   **Database:** MySQL (Relational data storage).
*   **Security:** Role-based access control (RBAC), BCrypt hashing.
*   **Icons:** Lucide Icons.

## 📦 Setup Instructions

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/parasar0810/Ticket-management-system.git
    cd Ticket-management-system
    ```

2.  **Database Setup**:
    *   Import the `setup.sql` file into your MySQL database.
    *   Default Admin Credentials: **admin / admin**

3.  **Backend Configuration**:
    *   Open `server.js` and update your MySQL connection details.
    *   Update `nodemailer` transporter for email notifications.

4.  **Install Dependencies**:
    ```bash
    npm install
    ```

5.  **Run the Server**:
    ```bash
    node server.js
    ```

6.  **Open Frontend**:
    *   Serve the folder using a static server (e.g., `npx serve .`) and open `index.html`.
