# Nginx Server Configuration

This directory contains the production Nginx server configuration for **`work-board.giganexus.info`**.

---

### File: `work-board.giganexus.info.conf`
Location on VPS: `/etc/nginx/sites-available/work-board.giganexus.info`

---

### How to apply Nginx changes to VPS:

1. **SSH into the VPS**:
   ```bash
   ssh root@194.164.151.17
   ```

2. **Update the config file**:
   ```bash
   # If you pulled latest git changes in ~/work-board-frontend:
   cp ~/work-board-frontend/nginx/work-board.giganexus.info.conf /etc/nginx/sites-available/work-board.giganexus.info
   ```

3. **Test Nginx Syntax**:
   ```bash
   nginx -t
   ```

4. **Reload Nginx**:
   ```bash
   systemctl reload nginx
   ```
