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

### 3.2 Create CNAME File
Once you provide the domain, I'll create a `CNAME` file in the `public/` folder with your domain name.

### 3.3 Update GitHub Pages Settings
1. In your repository, go to **Settings** → **Pages**
2. Under **Custom domain**, enter your domain (e.g., `alfredoquintana.com`)
3. Check **Enforce HTTPS** (recommended)

### 3.4 Configure DNS Records
You'll need to add DNS records at your domain registrar:

**Option A: Apex Domain (alfredoquintana.com)**
- Type: `A`
- Name: `@` (or leave blank)
- Value: `185.199.108.153`
- TTL: 3600 (or default)

- Type: `A`
- Name: `@` (or leave blank)
- Value: `185.199.109.153`
- TTL: 3600 (or default)

- Type: `A`
- Name: `@` (or leave blank)
- Value: `185.199.110.153`
- TTL: 3600 (or default)

- Type: `A`
- Name: `@` (or leave blank)
- Value: `185.199.111.153`
- TTL: 3600 (or default)

**Option B: www Subdomain (www.alfredoquintana.com)**
- Type: `CNAME`
- Name: `www`
- Value: `YOUR_USERNAME.github.io`
- TTL: 3600 (or default)

**Option C: Both (Recommended)**
- Add all 4 A records for apex domain
- Add CNAME record for www subdomain

### 3.5 Update Workflow for Custom Domain
Once you provide the domain, I'll update the GitHub Actions workflow to use base path `/` instead of the repository name.

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

