import React, { useState, useRef, useEffect } from "react";
import { User, Phone, Save, AlertTriangle, Check } from "lucide-react";
import { useAuth } from "../lib/auth";
import { supabase } from "../lib/supabase";
import { OptimizedImage } from "../components/OptimizedImage";
import { getLocalArray, getLocalObject } from "../lib/utils";

export function Profile() {
  const { user, token, updateUser, logout } = useAuth();
  
  const [profile, setProfile] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    whatsapp: user?.whatsapp || "",
    bio: user?.bio || "",
    address: user?.address || ""
  });

  useEffect(() => {
    if (user) {
      setProfile(prev => ({
        ...prev,
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        whatsapp: user.whatsapp || "",
        bio: user.bio || "",
        address: user.address || ""
      }));
    }
  }, [user]);

  const [isSaved, setIsSaved] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verifySuccess, setVerifySuccess] = useState(false);
  const [verifyError, setVerifyError] = useState("");
  const [adminStatus, setAdminStatus] = useState(user?.verificationStatus || "none");
  useEffect(() => {
    if (user?.email) {
      const existing = getLocalArray<any>('campusmarket_verifications');
      const userReq = existing.find((v: any) => v.email === user.email);
      if (userReq) {
        setAdminStatus(userReq.status);
      }
    }
  }, [user]);

  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const matricRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const avatarRef = useRef<HTMLInputElement>(null);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    
    setUploadingAvatar(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file);

      if (uploadError) {
        console.warn("Using mock avatar due to upload error:", uploadError.message);
        const reader = new FileReader();
        reader.onloadend = async () => {
          await updateUser({ ...user, avatarUrl: reader.result as string });
        };
        reader.readAsDataURL(file);
      } else {
        const { data } = supabase.storage.from('avatars').getPublicUrl(fileName);
        await updateUser({ ...user, avatarUrl: data.publicUrl });
      }
    } catch (err: any) {
      console.warn("Avatar upload error:", err);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          name: profile.name,
          phone: profile.phone,
          whatsapp: profile.whatsapp,
          bio: profile.bio,
          address: profile.address
        }
      });
      if (error) throw error;
    } catch (err) {
      console.warn("Error saving profile to auth", err);
    }

    const updatedUser = { ...user, ...profile };
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
    const localProfiles = getLocalObject<any>('campusmarket_vendor_profiles');
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
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerifyError("");
    setVerifySuccess(false);
    
    if (!user) {
      setVerifyError("You must be logged in to verify.");
      return;
    }

    const matricNumber = matricRef.current?.value;
    const file = fileRef.current?.files?.[0];

    if (!matricNumber || !file) {
      setVerifyError("Please provide both matriculation number and a file.");
      return;
    }

    setVerifying(true);

    try {
      const reader = new FileReader();
      const base64Promise = new Promise<{base64Data: string, mimeType: string}>((resolve, reject) => {
        reader.onload = () => {
          const result = reader.result as string;
          const [prefix, base64Data] = result.split(',');
          const mimeType = prefix.match(/:(.*?);/)?.[1] || file.type;
          resolve({ base64Data, mimeType });
        };
        reader.onerror = reject;
      });
      reader.readAsDataURL(file);
      
      const { base64Data, mimeType } = await base64Promise;

      const verifyRes = await fetch("/api/verify-document", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          base64Data,
          mimeType,
          expectedName: profile.name || user.name
        })
      });

      if (!verifyRes.ok) {
        const errorData = await verifyRes.json().catch(() => ({}));
        throw new Error(errorData.error || "Verification service failed.");
      }

      const verifyData = await verifyRes.json();
      if (!verifyData.verified) {
        throw new Error(`Verification rejected: ${verifyData.reason || "Name does not match the document."}`);
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('verifications')
        .upload(fileName, file);

      if (uploadError) {
        console.warn("Using mock verification due to upload error:", uploadError.message);
      }

      await updateUser({ 
        ...user, 
        isVerified: false, 
        matricNumber,
        verificationStatus: "pending"
      });

      setVerifySuccess(true);
      const existing = getLocalArray<any>('campusmarket_verifications');
      const userIndex = existing.findIndex((v: any) => v.email === user.email);
      const newV = { email: user.email, status: "pending", time: new Date().toLocaleString(), matricNumber };
      if (userIndex >= 0) existing[userIndex] = newV;
      else existing.push(newV);
      localStorage.setItem('campusmarket_verifications', JSON.stringify(existing));
    } catch (err: any) {
      setVerifyError(err.message);
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Your Profile</h1>
          <p className="text-muted-foreground mt-1">Manage your account and contact details.</p>
        </div>
        <button
          onClick={async () => {
            await logout();
            window.location.href = "/";
          }}
          className="text-sm font-medium text-destructive bg-destructive/10 hover:bg-destructive/20 px-4 py-2 rounded-xl transition-colors"
        >
          Sign Out
        </button>
      </div>

            <div className="bg-card border border-border/50 shadow-sm rounded-3xl overflow-hidden">
        {isSaved ? (
          <div className="py-20 text-center flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold mb-2">Profile Saved!</h3>
            <p className="text-muted-foreground">Your information has been updated successfully.</p>
          </div>
        ) : (
        <form onSubmit={handleSave} className="p-6 sm:p-8 space-y-6">
          
          <div className="flex items-center gap-6 pb-6 border-b border-border/50">
            <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center text-primary overflow-hidden">
              {user?.avatarUrl ? (
                <OptimizedImage src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <User className="h-10 w-10" />
              )}
            </div>
            <div>
              <input 
                type="file" 
                accept="image/*" 
                ref={avatarRef} 
                className="hidden" 
                onChange={handleAvatarUpload} 
              />
              <button 
                type="button" 
                onClick={() => avatarRef.current?.click()}
                disabled={uploadingAvatar}
                className="text-sm font-medium bg-secondary text-secondary-foreground px-4 py-2 rounded-xl hover:bg-secondary/90 transition-colors disabled:opacity-50"
              >
                {uploadingAvatar ? "Uploading..." : "Change Avatar"}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Full Name</label>
              <input 
                type="text"
                value={profile.name}
                onChange={(e) => setProfile({...profile, name: e.target.value})}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Campus Email</label>
              <input 
                type="email"
                disabled
                value={profile.email}
                className="flex h-10 w-full rounded-md border border-input bg-muted/50 px-3 py-2 text-sm text-muted-foreground cursor-not-allowed"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Phone className="w-4 h-4 text-muted-foreground" />
                Phone Number (Calls)
              </label>
              <input 
                type="tel"
                value={profile.phone}
                onChange={(e) => setProfile({...profile, phone: e.target.value})}
                placeholder="e.g., 08012345678"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <svg className="w-4 h-4 text-muted-foreground" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
                </svg>
                WhatsApp Number
              </label>
              <input 
                type="tel"
                value={profile.whatsapp}
                onChange={(e) => setProfile({...profile, whatsapp: e.target.value})}
                placeholder="e.g., 08012345678"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
            </div>
          </div>

          <div className="space-y-2">
                <label className="text-sm font-medium">Store Address / Location</label>
                <input
                  type="text"
                  value={profile.address}
                  onChange={e => setProfile({...profile, address: e.target.value})}
                  placeholder="e.g. Block A, Room 102"
                  className="flex h-12 w-full rounded-xl border border-input bg-background px-4 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Bio</label>
            <textarea 
              rows={4}
              value={profile.bio}
              onChange={(e) => setProfile({...profile, bio: e.target.value})}
              placeholder="Tell others a bit about yourself..."
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
            />
          </div>

                    <div className="pt-4 flex items-center justify-between border-t border-border/50">
              <span className="text-sm text-muted-foreground">This info will be visible to buyers/sellers when you transact.</span>
            <button 
              type="submit"
              className="px-6 py-2 bg-foreground text-background text-sm font-medium rounded-xl hover:bg-foreground/90 transition-colors shadow-sm flex items-center gap-2"
            >
              <Save className="w-4 h-4" /> Save Profile
            </button>
          </div>
        </form>
        )}
      </div>

      {user?.accountType === "vendor" && !user?.isVerified && adminStatus !== "resolved" && (
        <div className="bg-card border border-border/50 shadow-sm rounded-3xl overflow-hidden mt-8">
          <form className="p-6 sm:p-8 space-y-6" onSubmit={handleVerify}>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-foreground">Vendor Verification</h2>
              <p className="text-sm text-muted-foreground mt-1">To sell items on CampusMarket, you must verify your student identity.</p>
            </div>
            
            {verifyError && (
              <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md">
                {verifyError}
              </div>
            )}
            
            

            {verifySuccess || adminStatus === "pending" ? (
              <div className="py-8 text-center flex flex-col items-center justify-center">
                <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold mb-2">Verification Pending Review</h3>
                <p className="text-muted-foreground">Your student identity is being reviewed. Please wait up to 24 hours.</p>
              </div>
            ) : (
            <>
            {adminStatus === "rejected" && (
              <div className="bg-destructive/15 text-destructive text-sm p-4 rounded-xl mb-6">
                Your previous verification was rejected. Please ensure your matriculation number and ID match clearly, and try again.
              </div>
            )}
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Matriculation Number <span className="text-destructive">*</span></label>
                <input 
                  required
                  type="text"
                  ref={matricRef}
                  placeholder="e.g., CMP/18/12345"
                  className="flex h-10 w-full max-w-md rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Upload Student ID / Admission Letter <span className="text-destructive">*</span></label>
                <input 
                  required
                  type="file" 
                  ref={fileRef}
                  accept="image/*,.pdf"
                  className="flex w-full max-w-md rounded-md border border-input bg-background px-3 py-2 text-sm text-muted-foreground file:border-0 file:bg-primary/10 file:text-primary file:text-sm file:font-medium file:px-3 file:py-1 file:rounded-md file:mr-3 hover:file:bg-primary/20 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
              </div>
              <button 
                type="submit"
                disabled={verifying}
                className="mt-4 px-6 py-2 bg-secondary text-secondary-foreground text-sm font-medium rounded-xl hover:bg-secondary/90 transition-colors shadow-sm disabled:opacity-50"
              >
                {verifying ? "Submitting..." : "Submit for Verification"}
              </button>
            </div>
            </>
            )}
          </form>
        </div>
      )}

      {user?.accountType === "vendor" && user?.isVerified && (
        <div className="bg-card border border-border/50 shadow-sm rounded-3xl overflow-hidden mt-8">
          <div className="p-6 sm:p-8 space-y-6">
            {user?.verificationStatus === "pending" ? (
              <div className="flex items-start gap-4">
                <div className="p-3 bg-amber-100 text-amber-600 rounded-full flex-shrink-0">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-foreground">Verification Under Review</h2>
                  <p className="text-sm text-muted-foreground mt-1">Your document passed the automated check, allowing you to start listing products immediately. However, an admin will perform a final manual review. If any issues are found, your verification may be revoked.</p>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-4">
                <div className="p-3 bg-emerald-100 text-emerald-600 rounded-full flex-shrink-0">
                  <Save className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-foreground">Verified Vendor</h2>
                  <p className="text-sm text-muted-foreground mt-1">Your identity has been fully verified by an admin (Matric: {user.matricNumber}). You can list products on the marketplace.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
