import fs from 'fs';
let code = fs.readFileSync('src/pages/ProductDetail.tsx', 'utf8');

const profileLogic = `        const profiles = (JSON.parse(localStorage.getItem('campusmarket_vendor_profiles') || '{}') || {});
        let vendorProfile = profiles[data.vendor_id];
        
        // If it's a mock product and there's no profile, but the user is logged in, use their profile to avoid showing dummy data to themselves
        if (!vendorProfile && (data.vendor_id === 'vendor-123' || data.vendor_id === 'vendor-456' || data.vendor_id === 'vendor-789') && user) {
           vendorProfile = profiles[user.id];
        }
        
        try {
           const remoteProfile = await ProductService.getVendorProfile(data.vendor_id);
           if (remoteProfile) {
              vendorProfile = remoteProfile;
              // Also cache it locally to avoid future misses
              profiles[data.vendor_id] = remoteProfile;
              localStorage.setItem('campusmarket_vendor_profiles', JSON.stringify(profiles));
           }
        } catch(e) {}
        
        if (vendorProfile) {`;

code = code.replace(/const profiles = \(JSON\.parse\(localStorage\.getItem\('campusmarket_vendor_profiles'\) \|\| '\{\}'\) \|\| \{\}\);\n\s*let vendorProfile = profiles\[data\.vendor_id\];\n\s*\/\/ If it's a mock product[\s\S]*?if \(vendorProfile\) \{/, profileLogic);

fs.writeFileSync('src/pages/ProductDetail.tsx', code);
