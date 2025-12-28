# Deployment Guide

## Step 1: Upload to Private GitHub Repository

### 1.1 Initialize Git Repository (if not already done)
```bash
cd /Users/alfredoquintana/personalwebsite
git init
```

### 1.2 Create .gitignore (if it doesn't exist)
Make sure you have a `.gitignore` file. Create one if needed:
```bash
# If .gitignore doesn't exist, create it with:
cat > .gitignore << EOF
node_modules/
dist/
.DS_Store
*.log
.env
.env.local
EOF
```

### 1.3 Stage and Commit All Files
```bash
git add .
git commit -m "Initial commit: Personal website setup"
```

### 1.4 Create Private Repository on GitHub
1. Go to https://github.com/new
2. Repository name: `personalwebsite` (or your preferred name)
3. Description: (optional)
4. Select **Private**
5. **DO NOT** initialize with README, .gitignore, or license
6. Click **Create repository**

### 1.5 Push to GitHub
```bash
# Replace YOUR_USERNAME with your GitHub username
git remote add origin https://github.com/YOUR_USERNAME/personalwebsite.git
git branch -M main
git push -u origin main
```

---

## Step 2: Setup GitHub Pages

### 2.1 Enable GitHub Pages
1. Go to your repository on GitHub
2. Click **Settings** (top menu)
3. Scroll down to **Pages** in the left sidebar
4. Under **Source**, select **GitHub Actions**
5. The workflow will automatically deploy when you push to `main`

### 2.2 Verify Deployment
1. Go to **Actions** tab in your repository
2. You should see the "Deploy to GitHub Pages" workflow running
3. Wait for it to complete (usually 2-3 minutes)
4. Once complete, your site will be available at:
   `https://YOUR_USERNAME.github.io/personalwebsite/`

---

## Step 3: Setup Custom Domain

### 3.1 Information Needed
Before proceeding, I need to know:
- **What domain do you want to use?** (e.g., `alfredoquintana.com`, `www.alfredoquintana.com`)
- **Do you own the domain?** (Yes/No)
- **Where is your domain registered?** (e.g., Namecheap, GoDaddy, Google Domains, etc.)
- **Do you have access to DNS settings?** (Yes/No)

### 3.2 CNAME File Created ✅
The `CNAME` file has been created in the `public/` folder with `alfredoquintana.com`

### 3.3 Update GitHub Pages Settings
1. In your repository, go to **Settings** → **Pages**
2. Under **Custom domain**, enter: `alfredoquintana.com`
3. Check **Enforce HTTPS** (recommended)
4. Click **Save**
5. Wait a few minutes for GitHub to verify the domain

### 3.4 Configure DNS Records in GoDaddy

**For alfredoquintana.com (Apex Domain):**

1. Log in to your GoDaddy account
2. Go to **My Products** → Click **DNS** next to `alfredoquintana.com`
3. You'll see a list of DNS records. **Add these 4 A records:**

   **Record 1:**
   - Type: `A`
   - Name: `@` (or leave blank/empty)
   - Value: `185.199.108.153`
   - TTL: `600` (or 1 hour)

   **Record 2:**
   - Type: `A`
   - Name: `@` (or leave blank/empty)
   - Value: `185.199.109.153`
   - TTL: `600` (or 1 hour)

   **Record 3:**
   - Type: `A`
   - Name: `@` (or leave blank/empty)
   - Value: `185.199.110.153`
   - TTL: `600` (or 1 hour)

   **Record 4:**
   - Type: `A`
   - Name: `@` (or leave blank/empty)
   - Value: `185.199.111.153`
   - TTL: `600` (or 1 hour)

4. **Optional: Add www subdomain (CNAME)**
   - Type: `CNAME`
   - Name: `www`
   - Value: `YOUR_USERNAME.github.io` (replace with your GitHub username)
   - TTL: `600` (or 1 hour)

5. **Remove any existing A records** that point to other IPs (if any)
6. **Save** all changes

**Note:** In GoDaddy, if the Name field shows "@" or is empty, that means it's for the root domain (alfredoquintana.com)

### 3.5 Workflow Configuration

**Current Setup:** The workflow is configured to work on the GitHub Pages subdomain (`qalfredo.github.io/personalwebsite/`) for testing purposes.

**After Custom Domain is Configured:**
Once your custom domain `alfredoquintana.com` is set up and working, you need to update the workflow:

1. Edit `.github/workflows/deploy.yml`
2. Change line 38 from:
   ```yaml
   VITE_BASE_PATH: /${{ github.event.repository.name }}/
   ```
   to:
   ```yaml
   VITE_BASE_PATH: /
   ```
3. Commit and push the change
4. The site will then work properly on your custom domain

### 3.6 Wait for DNS Propagation
- DNS changes can take 24-48 hours to propagate
- You can check propagation status at: https://www.whatsmydns.net/

---

## After Custom Domain Setup

Once DNS is configured and the domain is verified:
1. The site will be accessible at your custom domain
2. HTTPS will be automatically enabled by GitHub
3. Both `yourdomain.com` and `www.yourdomain.com` will work (if configured)

---

## Troubleshooting

### Site showing blank page?
- **If accessing via GitHub Pages subdomain** (`qalfredo.github.io/personalwebsite/`):
  - Make sure the workflow uses base path `/personalwebsite/` (currently configured)
  - Push the latest changes and wait for deployment to complete
  - Hard refresh the page (Ctrl+Shift+R or Cmd+Shift+R)
  
- **If accessing via custom domain** (`alfredoquintana.com`):
  - Make sure the workflow uses base path `/` (change after DNS is configured)
  - Verify DNS records are correct
  - Wait for DNS propagation (can take 24-48 hours)

### Site not loading?
- Check GitHub Actions tab for build errors
- Verify DNS records are correct
- Wait for DNS propagation (can take up to 48 hours)

### 404 errors on routes?
- Make sure the base path is set correctly in the workflow
- For custom domain, base path should be `/`
- For GitHub Pages subdomain, base path should be `/repository-name/`

### Build fails?
- Check the Actions tab for error messages
- Ensure all dependencies are in `package.json`
- Verify Node.js version compatibility

