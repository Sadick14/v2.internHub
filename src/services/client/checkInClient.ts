'use client';

import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, Timestamp, orderBy, limit } from 'firebase/firestore';
import type { CheckIn } from '../checkInService';
import { format } from 'date-fns';

export function subscribeToTodayCheckIn(
  studentId: string,
  callback: (checkIn: CheckIn | null) => void
): () => void {
  const checkInsCol = collection(db, 'check-ins');
  const todayDate = format(new Date(), 'yyyy-MM-dd');
  
  const q = query(
    checkInsCol,
    where('studentId', '==', studentId),
    where('date', '==', todayDate),
    orderBy('timestamp', 'desc'),
    limit(1)
  );

  const unsubscribe = onSnapshot(q, (snapshot) => {
    if (snapshot.empty) {
      callback(null);
      return;
    }

    const doc = snapshot.docs[0];
    const data = doc.data();
    const plainObject: any = { id: doc.id };

    for (const key in data) {
      if (data[key] instanceof Timestamp) {
        plainObject[key] = data[key].toDate();
      } else {
        plainObject[key] = data[key];
      }
    }
    
    callback(plainObject as CheckIn);
  });

  return unsubscribe;
}
