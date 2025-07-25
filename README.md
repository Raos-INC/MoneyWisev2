# CuanFlowV1.0
# MoneyWiseBE
# MoneyWise
# MoneyWise

# MoneyWise - Personal Finance Management App

A modern, full-featured personal finance management application built with React, Express.js, TypeScript, and MySQL. Features AI-powered insights, smart purchase decisions, tax calculations, and comprehensive financial tracking.

## 🏗️ Architecture

- **Frontend**: React 18 + Vite + TypeScript (Hosted on Hostinger)
- **Backend**: Express.js + TypeScript (Hosted on Railway)
- **Database**: MySQL (Hosted on Hostinger)
- **ORM**: Drizzle ORM
- **Authentication**: JWT-based
- **AI Integration**: Google Gemini AI for financial insights
- **UI Framework**: Radix UI + Tailwind CSS

## ✨ Key Features

### 💰 Core Financial Management
- **Transaction Tracking**: Income and expense management with categories
- **Budget Management**: Set and track monthly/weekly/yearly budgets
- **Savings Goals**: Create and monitor savings targets with progress tracking
- **Financial Reports**: Generate detailed PDF reports and email summaries
- **Tax Calculator**: Built-in tax calculation and planning tools

### 🤖 AI-Powered Features
- **Smart Purchase Decisions**: AI analysis for purchase recommendations
- **Financial Insights**: Automated spending pattern analysis
- **Investment Analysis**: AI-powered investment recommendations
- **Financial Advice**: Personalized financial guidance
- **Smart Notifications**: Intelligent alerts and reminders

### 📊 Analytics & Visualization
- **Interactive Charts**: Real-time financial data visualization
- **Financial Summary**: Comprehensive dashboard with key metrics
- **Trend Analysis**: Historical data analysis and forecasting
- **Export Capabilities**: PDF report generation and email delivery

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- Git installed
- MySQL database (using Hostinger)

### 1. Clone and Setup
```bash
# Clone the repository
git clone <your-repo-url>
cd MoneyWise

# Install dependencies
npm install

# Setup development environment (auto-creates .env if needed)
npm run env:dev
```

### 2. Database Setup
```bash
# Test database connection
npm run test:db

# Create database tables
npm run db:push
```

### 3. Start Development Server
```bash
# Start both frontend and backend
npm run dev:full

# Or start separately:
npm run dev:frontend  # Frontend only (port 3000)
npm run dev:backend   # Backend only (port 5000)
```

## 🌍 Environment Configuration

### Automatic Environment Setup
The application includes an intelligent environment setup system that automatically creates `.env` files when needed:

#### Development Mode
```bash
npm run env:dev
```
**What it does:**
- ✅ Searches for existing env files (`.env.dev`, `env.development`, etc.)
- ✅ Copies found file to `.env` OR creates default development `.env`
- ✅ Updates `client/.env` with local API URL
- ✅ Validates all environment variables
- ✅ Shows next steps

**Result:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- Database: MySQL Hostinger (shared with production)

#### Production Mode
```bash
npm run env:prod
```
**What it does:**
- ✅ Searches for existing env files (`.env.prod`, `env.production`, etc.)
- ✅ Copies found file to `.env` OR creates default production `.env`
- ✅ Updates `client/.env` with Railway API URL
- ✅ Validates all environment variables
- ✅ Shows deployment steps

**Result:**
- Frontend: Hostinger
- Backend API: Railway
- Database: MySQL Hostinger

### Environment File Priority
The setup script searches for env files in this order:
1. `.env.dev` / `.env.prod`
2. `env.dev` / `env.prod`
3. `.env.development` / `.env.production`
4. `env.development` / `env.production`
5. **Auto-create default** if none found

### Default Environment Variables
If no env files exist, the script creates default configurations:

**Development Default:**
```env
NODE_ENV=development
VITE_API_URL=http://127.0.0.1:5000
DB_HOST=srv1982.hstgr.io
DB_USER=u415928144_MOM
DB_NAME=u415928144_MoneyWise
JWT_SECRET=dev-jwt-secret-key-change-in-production-2024
GEMINI_API_KEY=AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
CORS_ORIGIN=http://localhost:3000
```

**Production Default:**
```env
NODE_ENV=production
VITE_API_URL=https://moneywise-production-d344.up.railway.app
DB_HOST=srv1982.hstgr.io
DB_USER=u415928144_MOM
DB_NAME=u415928144_MoneyWise
JWT_SECRET=prod-super-secret-jwt-key-2024-change-this-in-production
GEMINI_API_KEY=AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
CORS_ORIGIN=https://moneywise.fun
```

## 📁 Project Structure

```
MoneyWise/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # UI components
│   │   │   ├── ui/        # Radix UI components
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Transactions.tsx
│   │   │   ├── Savings.tsx
│   │   │   ├── Reports.tsx
│   │   │   ├── SmartPurchaseDecision.tsx
│   │   │   ├── TaxCalculator.tsx
│   │   │   └── FinancialInsights.tsx
│   │   ├── hooks/         # Custom React hooks
│   │   ├── lib/           # Utilities and configurations
│   │   └── pages/         # Page components
│   └── index.html         # Entry point
├── server/                # Express.js backend
│   ├── index.ts           # Server entry point
│   ├── routes.ts          # API routes
│   ├── db.ts              # Database connection
│   └── services/          # Business logic
├── shared/                # Shared code
│   └── schema.ts          # Database schema
├── scripts/               # Utility scripts
│   ├── setup-env.js       # Environment setup (auto-creates .env)
│   ├── deploy-railway.js  # Railway deployment
│   └── test-*.js          # Test scripts
├── migrations/            # Database migrations
├── sqlexport/             # Database export files
├── env.development        # Development environment template
├── env.production         # Production environment template
└── package.json           # Dependencies and scripts
```

## 🔧 Available Scripts

### Development
```bash
npm run dev              # Start development server
npm run dev:frontend     # Start frontend only
npm run dev:backend      # Start backend only
npm run dev:full         # Start both with concurrently
npm run dev:no-db        # Start without database
npm run test:db          # Test database connection
npm run db:push          # Create/update database tables
npm run db:generate      # Generate migrations
npm run db:migrate       # Run migrations
```

### Environment Setup (Enhanced)
```bash
npm run env:dev          # Setup development environment (auto-creates .env)
npm run env:prod         # Setup production environment (auto-creates .env)
npm run env:help         # Show environment setup help
npm run test:env         # Test environment setup
```

### Build & Deploy
```bash
npm run build            # Build for production
npm run build:frontend   # Build frontend only
npm run build:backend    # Build backend only
npm run start            # Start production server
npm run start:dev        # Start production server in dev mode
```

### Railway Deployment
```bash
npm run deploy:railway   # Deploy to Railway (AutoScript, Recommended By Rumi. Scroll Down For More Info)
npm run railway:login    # Login to Railway
npm run railway:up       # Deploy to Railway
npm run railway:logs     # View Railway logs
npm run railway:status   # Check Railway status
```

### Railway Environment Configuration

#### Your Railway Environment File (`.env.railway`)
```env
# Railway Environment Configuration
NODE_ENV=production
PORT=8080

# Database Configuration untuk MySQL Hostinger
DB_HOST=srv1982.hstgr.io
DB_PORT=3306
DB_USER=u415928144_MOM
DB_PASSWORD=Master10Of-07Money_05
DB_NAME=u415928144_MoneyWise
DATABASE_URL=mysql://u415928144_MOM:Master10Of-07Money_05@srv1982.hstgr.io:3306/u415928144_MoneyWise

# API Keys
GEMINI_API_KEY=

# JWT Secret (generate random string for production)
JWT_SECRET=
```

#### Required Environment Variables for Railway
**Important**: You need to fill in the missing values in your Railway environment:

1. **GEMINI_API_KEY**: Get from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. **JWT_SECRET**: Generate a secure random string (min 32 characters)

#### Setting Environment Variables in Railway
```bash
# Set GEMINI_API_KEY
railway variables set GEMINI_API_KEY=your-gemini-api-key-here

# Set JWT_SECRET (generate secure random string)
railway variables set JWT_SECRET=your-super-secure-jwt-secret-min-32-chars

# Set CORS_ORIGIN for your frontend domain
railway variables set CORS_ORIGIN=https://your-hostinger-domain.com
```

### Deploy:Railway Script Details

The `npm run deploy:railway` command is an **automated deployment script** that handles the complete Railway deployment process:

#### What the Script Does:
1. **🔍 Pre-deployment Validation**
   - Checks if you're in the correct project directory
   - Verifies `package.json` exists
   - Creates `.env` file from `env.production` if missing

2. **🛠️ Railway CLI Management**
   - Auto-installs Railway CLI if not found: `npm install -g @railway/cli`
   - Verifies login status with `railway whoami`
   - Provides clear error messages if not logged in

3. **🏗️ Build Process**
   - Runs `npm run build` to create production build
   - Validates build success before proceeding
   - Shows build progress and any errors

4. **🚀 Deployment**
   - Executes `railway up` for deployment
   - Provides real-time deployment feedback
   - Shows deployment status and logs

5. **📋 Post-deployment Guidance**
   - Lists next steps for verification
   - Shows required environment variables
   - Provides health check URL
   - Gives troubleshooting tips

#### Usage:
```bash
# Complete automated deployment
npm run deploy:railway
```

#### Expected Output:
```
🚀 Railway Deployment Script for MoneyWise
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 Pre-deployment checks:
1. Checking Railway CLI...
✅ Railway CLI is installed
2. Checking Railway login...
✅ Logged in to Railway

🔨 Building application...
✅ Build completed successfully

🚀 Deploying to Railway...
✅ Deployment completed successfully

🎉 Deployment completed!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 Next steps:
1. Check your Railway dashboard for the deployment status
2. Verify environment variables are set correctly
3. Test the health endpoint: https://your-app.railway.app/health
4. Update your frontend to use the new API URL
```

#### Troubleshooting the Deploy Script:
- **CLI not found**: Script auto-installs Railway CLI
- **Not logged in**: Run `railway login` first
- **Build fails**: Check TypeScript errors with `npm run check`
- **Deployment fails**: Check Railway logs with `railway logs`

### Testing & Utilities
```bash
npm run check            # TypeScript check
npm run check:fix        # TypeScript check with fixes
npm run test:shutdown    # Test graceful shutdown
npm run show:ip          # Show current IP address
```

## 🗄️ Database Schema

### Core Tables
- `users` - User accounts and authentication
- `categories` - Transaction categories (income/expense)
- `transactions` - Financial transactions
- `budgets` - Budget tracking and limits
- `savings_goals` - Savings targets and progress
- `ai_insights` - AI-generated financial insights
- `reports` - Financial reports and exports

### Key Features
- **Foreign Key Relationships**: Proper referential integrity
- **Auto-increment IDs**: Optimized primary keys
- **Timestamps**: Created/updated tracking
- **Soft Deletes**: Data preservation
- **Indexing**: Optimized query performance

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/user` - Get current user
- `GET/POST /api/logout` - User logout

### Categories
- `GET /api/categories` - Get all categories
- `GET /api/categories/:type` - Get categories by type
- `POST /api/categories` - Create new category
- `POST /api/categories/force-init` - Force initialize categories

### Transactions
- `GET /api/transactions` - Get all transactions
- `GET /api/transactions/summary` - Get transaction summary
- `POST /api/transactions` - Create new transaction
- `PUT /api/transactions/:id` - Update transaction
- `DELETE /api/transactions/:id` - Delete transaction

### Budgets
- `GET /api/budgets` - Get all budgets
- `POST /api/budgets` - Create new budget

### Savings Goals
- `GET /api/savings-goals` - Get all savings goals
- `POST /api/savings-goals` - Create new savings goal
- `PUT /api/savings-goals/:id` - Update savings goal
- `POST /api/savings-goals/simulate` - Simulate savings goal

### AI Insights
- `GET /api/ai-insights` - Get AI insights
- `POST /api/ai-insights/analyze` - Analyze transactions
- `POST /api/ai-insights/generate` - Generate new insights

### Reports
- `GET /api/reports` - Get all reports
- `POST /api/reports/generate` - Generate new report
- `GET /api/reports/export/pdf` - Export PDF report
- `POST /api/reports/email` - Email report

### Smart Features
- `POST /api/smart-purchase-decision` - Smart purchase analysis
- `GET /api/user/financial-summary` - Financial summary
- `POST /api/financial-advice` - Get financial advice
- `POST /api/investment-analysis` - Investment analysis
- `POST /api/tax/calculate` - Tax calculation

### System
- `GET /health` - Health check
- `GET /` - API status
- `POST /api/initialize` - Initialize user data

## 🌐 Deployment

### Frontend (Hostinger)
1. Build the frontend: `npm run build:frontend`
2. Upload `dist/public/` to Hostinger public_html
3. Configure domain and SSL
4. Update CORS settings in backend

### Backend (Railway)
1. Push code to GitHub
2. Connect repository to Railway
3. Set environment variables in Railway dashboard
4. Deploy automatically with `npm run deploy:railway`

## 🔍 Troubleshooting

### Common Issues

1. **Database Connection Failed**
   ```bash
   npm run test:db
   ```
   - Check if database credentials are correct
   - Verify Hostinger database is accessible
   - Ensure database structure is correct (INT IDs, foreign keys)

2. **Port Already in Use**
   - Kill process using port 5000: `netstat -ano | findstr :5000`
   - Or change port in environment file

3. **Environment Variables Not Loading**
   - Run `npm run env:dev` to setup environment (auto-creates .env)
   - Check if `.env` file exists
   - Verify environment file syntax

4. **Build Errors**
   ```bash
   npm run check  # TypeScript check
   npm install    # Reinstall dependencies
   ```

5. **Foreign Key Errors**
   - Ensure all ID columns are INT type
   - Check foreign key constraints
   - Verify data consistency

### Windows-Specific Issues

1. **Path Issues**: Use forward slashes in paths
2. **Environment Variables**: Use `cross-env` for cross-platform compatibility
3. **File Permissions**: Run as administrator if needed

### Railway Deployment Issues

1. **Not Linked to Project**
   - Run `railway link` and select the correct project.

2. **Not Logged In / Unauthorized**
   - Run `railway login` to authenticate.
   - If issues persist, try `railway logout` then `railway login` again.

3. **Wrong API URL in Frontend**
   - Always update `client/.env` with the correct `VITE_API_URL` **before building** the frontend.
   - Rebuild the frontend after changing the API URL.

4. **Build Failed**
   - Check Railway logs: `railway logs`
   - Verify environment variables
   - Test build locally: `npm run build`

5. **Database Connection**
   - Verify database credentials in Railway
   - Check if database is accessible from Railway
   - Test connection: `npm run test:db`

### Environment Setup Issues

1. **No .env file created**
   - Ensure you have write permissions in project directory
   - Check if any existing env files are corrupted
   - Run `npm run env:dev` or `npm run env:prod` again

2. **Client .env not created**
   - Script automatically creates `client/` directory if needed
   - Check console output for any error messages
   - Verify API URL is correct for your setup

## 📝 Development Workflow

1. **Setup Environment**: `npm run env:dev` (auto-creates .env)
2. **Start Development**: `npm run dev:full`
3. **Make Changes**: Edit code in `client/src/` and `server/`
4. **Test Database**: `npm run test:db`
5. **Update Schema**: `npm run db:push`
6. **Type Check**: `npm run check`
7. **Build for Production**: `npm run build`
8. **Deploy**: Push to GitHub (Railway auto-deploys)

## 🛡️ Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt password encryption
- **CORS Protection**: Cross-origin request security
- **Input Validation**: Zod schema validation
- **SQL Injection Protection**: Parameterized queries with Drizzle ORM
- **Environment Variable Security**: Sensitive data protection

## 🚀 Performance Features

- **Graceful Shutdown**: Proper server and database cleanup
- **Connection Pooling**: Optimized database connections
- **Query Optimization**: Efficient database queries
- **Caching**: React Query for frontend caching
- **Lazy Loading**: Component and route optimization

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

---

**MoneyWise** - Smart Personal Finance Management with AI-Powered Insights
