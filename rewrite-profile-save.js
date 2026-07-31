import fs from 'fs';

let code = fs.readFileSync('src/pages/Profile.tsx', 'utf8');

const profileSyncCode = `      const updatedUser = { ...user, ...profile };
      updateUser(updatedUser);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
      
      const profileData = {
         phone: updatedUser.phone,
         whatsapp: updatedUser.whatsapp,
         bio: updatedUser.bio,
         address: updatedUser.address,
         isVerified: updatedUser.isVerified
      };
      
      // Always update local storage as a fallback
      const localProfiles = (JSON.parse(localStorage.getItem('campusmarket_vendor_profiles') || '{}') || {});
      localProfiles[user.id] = {
         name: updatedUser.name,
         avatarUrl: updatedUser.avatarUrl,
         ...profileData
      };
      localStorage.setItem('campusmarket_vendor_profiles', JSON.stringify(localProfiles));
      
      try {
        const { data: existing } = await supabase.from('vendor_profiles').select('id').eq('user_id', user.id).single();
        const payload = {
           user_id: user.id,
           name: updatedUser.name || 'Vendor',
           phone: updatedUser.phone,
           whatsapp: updatedUser.whatsapp,
           address: updatedUser.address,
           bio: updatedUser.bio,
           avatar_url: updatedUser.avatarUrl || '',
           is_verified: updatedUser.isVerified
        };
        if (existing) {
          const { error } = await supabase.from('vendor_profiles').update(payload).eq('id', existing.id);
          if (error) throw error;
        } else {
          const { error } = await supabase.from('vendor_profiles').insert([payload]);
          if (error) throw error;
        }
      } catch(err) {
        console.warn("Failed to sync profile to remote:", err);
      }`;

code = code.replace(/const updatedUser = \{ \.\.\.user, \.\.\.profile \};\s*updateUser\(updatedUser\);\s*setIsSaved\(true\);\s*setTimeout\(\(\) => setIsSaved\(false\), 3000\);\s*const profileData = \{[\s\S]*?\} catch\(err\) \{\s*console\.warn\("Failed to sync profile to remote", err\);\s*\}/g, profileSyncCode);

fs.writeFileSync('src/pages/Profile.tsx', code);
