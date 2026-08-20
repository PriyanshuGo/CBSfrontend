# Content Broadcast System (CBS) - User Flow Guide

Welcome to the **Content Broadcast System (CBS)**. This guide outlines the step-by-step workflow for Teachers, Principals, and Live Screen Viewers to use the application.

---

## 🧑‍🏫 Role 1: The Teacher Workflow

### Step 1: Login
1. Open the application and go to the **Login** page (`/login`).
2. You will see card suggestions with test credentials for the **Teacher** role.
3. Click the **Copy** button on the Teacher Login card. This copies the JSON credentials `{ email, password }` directly to your clipboard.
4. Paste the credentials into either the Email or Password field (the system automatically extracts both fields on paste) and click **Sign In**.

### Step 2: Create a Content Draft
1. On the Teacher Dashboard, click the **+ Create Content** button.
2. Fill in the title, description, and rotation duration. *(The current local date and time is automatically set as the default start time).*
3. Select an image file to upload (displays a live visual preview).
4. Click **Create Draft**. Your new content will appear in your list with a grey **Draft** status bar.

### Step 3: Request Principal Approval
1. On your draft content card, click **🚀 Send For Approval**.
2. A modal will pop up. Write a short review note for the Principal explaining the context, and optionally list a summary of changes.
3. Click **Send Request**. The content card status bar will turn yellow (**Pending**), awaiting review.

---

## 🧳 Role 2: The Principal Workflow

### Step 1: Login
1. Go to the **Login** page (`/login`).
2. Click **Copy** on the Principal Login card.
3. Paste the credentials into the input field and click **Sign In**.

### Step 2: Review Submissions
1. On the Principal Dashboard, you will see a list of contents submitted by teachers.
2. Use the status filter chips at the top to select **Pending** to view only submissions awaiting action.
3. Click on any card to read the teacher's request note, view teacher details, and check the scheduled broadcast dates.

### Step 3: Moderation (Approve or Reject)
- **To Approve**: Click **✓ Approve**. Confirm the prompt. The content card status turns green (**Approved**), scheduling it for the live screen.
- **To Reject**: Click **✗ Reject**. A modal will open. Write the reason for rejection (e.g., "Please update the image to high resolution") and submit. The status turns red (**Rejected**).

### Step 4: Teacher Re-submission (If Rejected)
1. If the Principal rejects the content, the Teacher sees a red **Rejected** status on their dashboard along with the Principal's feedback note.
2. The Teacher can click **✏️ Edit** to modify the content, then click **🔄 Request Again** to resubmit it.

---

## 📺 Role 3: Live Broadcast View (Public Display)

1. Navigate to the **Live Content** page (`/live`).
2. The system checks the current time and cross-references it with the scheduled start and end times of **Approved** content.
3. If an approved broadcast schedule is active, the content displays on the public board, rotating at the set interval duration.
4. If no content is currently scheduled or active, the page displays a friendly "No Live Content Available" notice.
