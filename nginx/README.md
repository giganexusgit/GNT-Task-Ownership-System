# Nginx Server Configuration

This directory contains the production Nginx server configuration for **`work-board.giganexus.info`**.

---

### File: `work-board.giganexus.info.conf`
Location on VPS: `/etc/nginx/sites-available/work-board.giganexus.info`

---

---

### Automated Deployment via CI/CD:
Any changes pushed to [`nginx/work-board.giganexus.info.conf`](file:///c:/GNT_CodeBase/GNT-Task-Ownership-System/nginx/work-board.giganexus.info.conf) on the `main` branch will **automatically**:
1. Copy the file to `/etc/nginx/sites-available/work-board.giganexus.info`
2. Validate syntax (`nginx -t`)
3. Reload Nginx (`systemctl reload nginx`)

---

### Manual Fallback (if needed):
1. **SSH into the VPS**:
   ```bash
   ssh root@194.164.151.17
   ```
2. **Copy and Reload**:
   ```bash
   cp ~/work-board-frontend/nginx/work-board.giganexus.info.conf /etc/nginx/sites-available/work-board.giganexus.info
   nginx -t
   systemctl reload nginx
   ```
