import os from 'os';
import https from 'https';

console.log('🌐 MoneyWise IP Checker');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

// Show local IP addresses
console.log('🔎 Local IP addresses (LAN):');
const nets = os.networkInterfaces();
const results = [];
for (const name of Object.keys(nets)) {
  for (const net of nets[name] || []) {
    if (net.family === 'IPv4' && !net.internal) {
      results.push(net.address);
      console.log(` - ${net.address} (${name})`);
    }
  }
}
if (results.length === 0) {
  console.log(' - No local IPv4 addresses found.');
}

// Show public IP address
console.log('\n🌍 Checking your public IP (WAN)...');
https.get('https://api.ipify.org?format=json', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const ip = JSON.parse(data).ip;
      console.log(`✅ Your public IP: ${ip}`);
      console.log('\n💡 Add this IP to Hostinger Remote MySQL whitelist:');
      console.log('   Hostinger cPanel → Databases → Remote MySQL');
      console.log('   Add your public IP above.');
      console.log('\n⚠️  If your IP changes (dynamic IP), you may need to re-add it.');
    } catch (e) {
      console.log('❌ Failed to parse public IP.');
    }
  });
}).on('error', (err) => {
  console.log('❌ Failed to fetch public IP:', err.message);
}); 