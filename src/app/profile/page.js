"use client";
// app/profile/page.js
import { useSession } from 'next-auth/react';
import { useState, useEffect } from "react";
import UserProfileForm from "@/components/UserProfileForm";
export const dynamic = "force-dynamic";
async function fetchUserProfile(userId) {
    const res = await fetch(`/api/users/${userId}`);
    if (!res.ok) throw new Error("Error al obtener grupos");
    const data = await res.json();
    return data;
}

export default function ProfilePage() {
  
  const { data: session, status } = useSession();
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
      if (status === 'authenticated' && session.user?.id) {
        fetchUserProfile(session.user.id)
          .then(profileData => {
            setUserProfile(profileData);
           
          })
          .catch(() => setIsLoading(false));
      }     
    }, [status, session]);


  

  if (!userProfile) return <div>Debes iniciar sesión.</div>;

  return <UserProfileForm user={userProfile} />;
}
