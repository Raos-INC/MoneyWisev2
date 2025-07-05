# Railway Deployment Guide

## Setup Instructions

1. **Deploy to Railway**
   - Connect your GitHub repository to Railway
   - Deploy from the main branch
   - Railway will automatically detect the Node.js app and build it

2. **CRITICAL: Environment Variables**
   Set these environment variables in Railway dashboard:
   ```
   NODE_ENV=production
   DB_HOST=srv1982.hstgr.io
   DB_PORT=3306
   DB_USER=u415928144_MOM
   DB_PASSWORD=Master10Of-07Money_05
   DB_NAME=u415928144_MoneyWise
   DATABASE_URL=mysql://u415928144_MOM:Master10Of-07Money_05@srv1982.hstgr.io:3306/u415928144_MoneyWise
   GEMINI_API_KEY=AIzaSyAnkZNecHZ_om-VYX7TEhJl5PAXZnAlogo
   JWT_SECRET=your-super-secret-jwt-key-here
   ```

   **NOTE**: Do NOT set PORT manually - Railway automatically provides this.

3. **Health Check**
   - Railway will monitor the `/health` endpoint
   - If deployment is successful, you should see "OK" status at `https://your-app.railway.app/health`

4. **Debugging**
   - Check Railway logs for any startup errors
   - Verify database connection by checking the logs
   - Test the API endpoints using the root endpoint `/`

## Common Issues

1. **502 Bad Gateway**: Service is not starting properly
   - Check environment variables are set correctly
   - Check Railway logs for startup errors
   - Verify database connection

2. **CORS Errors**: 
   - The server now includes CORS headers to allow cross-origin requests
   - If issues persist, check the CORS configuration in `server/index.ts`

3. **Database Connection**: 
   - Ensure MySQL database on Hostinger is accessible
   - Check if IP whitelisting is required for Railway's IP ranges

## Testing

Once deployed, test these endpoints:
- `GET /` - Should return API status
- `GET /health` - Should return OK status
- `POST /api/auth/login` - Should handle login requests
- `POST /api/auth/register` - Should handle registration requests