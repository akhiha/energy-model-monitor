# SAGE-ML Dashboard - GitHub Pages Deployment Guide

## Prerequisites
- GitHub account
- Git installed on your computer

## Step-by-Step Deployment Instructions

### Method 1: Using Lovable's GitHub Integration (Recommended)

1. **Connect Lovable to GitHub:**
   - In Lovable editor, click GitHub button (top right)
   - Click "Connect to GitHub"
   - Authorize Lovable GitHub App
   - Select your GitHub account
   - Click "Create Repository"

2. **Configure GitHub Pages:**
   - Go to your new GitHub repository
   - Click Settings → Pages
   - Under "Source", select "GitHub Actions"

3. **Update Repository Name in Config:**
   - Edit `vite.config.ts`
   - Replace `/your-repo-name/` with your actual repository name
   - Example: if repo is `sage-ml-dashboard`, use `/sage-ml-dashboard/`

4. **Push Changes:**
   - The workflow will automatically trigger
   - Your site will be available at: `https://yourusername.github.io/your-repo-name/`

### Method 2: Manual Deployment

1. **Download Project Files:**
   - Download all project files from Lovable
   - Create a new GitHub repository

2. **Initialize Git:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/yourusername/your-repo-name.git
   git push -u origin main
   ```

3. **Follow steps 2-4 from Method 1**

## Important Notes

- Replace `your-repo-name` in `vite.config.ts` with your actual repository name
- The site will be available at: `https://yourusername.github.io/your-repo-name/`
- GitHub Pages deployment takes 2-5 minutes after pushing changes
- Make sure your repository is public (required for free GitHub Pages)

## Troubleshooting

- If deployment fails, check the Actions tab in your GitHub repository
- Ensure Node.js version in workflow matches your development environment
- Check that all dependencies are properly listed in package.json

## Custom Domain (Optional)

To use a custom domain:
1. Go to Settings → Pages in your repository
2. Add your custom domain
3. Enable "Enforce HTTPS"
4. Update your DNS settings to point to GitHub Pages

Your SAGE-ML dashboard will be live and accessible to anyone with the URL!