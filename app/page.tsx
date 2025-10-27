'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getUserSession } from './.lib/auth';
import { CircularProgress } from '@mui/material';

export default function HomePageClient() {
  const router = useRouter();

  useEffect(() => {
    async function checkSession() {
      const token = sessionStorage.getItem('jwtToken');

      if (!token) {
        router.replace('/access/login');
        return;
      }

      const session = await getUserSession(token);

      if (!session) {
        router.replace('/access/login');
        return;
      }

      switch (session.role) {
        case 'user':
          router.push('/main');
          break;
        case 'atendent':
          router.push('/attendant');
          break;
        case 'doctor':
          router.push('/doctor');
          break;
        case 'admin':
          router.push('/manager');
          break;
        default:
          router.push('/access/login');
      }
    }

    checkSession();
  }, [router]);

  return <center style={{marginTop: "50vh"}}><CircularProgress /></center>;
}
