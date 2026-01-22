'use client';

import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, Timestamp, orderBy } from 'firebase/firestore';
import type { Report } from '../reportsService';

export function subscribeToReportsByStudent(
  studentId: string,
  callback: (reports: Report[]) => void
): () => void {
  const reportsCol = collection(db, 'reports');
  const q = query(
    reportsCol, 
    where('studentId', '==', studentId),
    orderBy('reportDate', 'desc')
  );

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const reportList = snapshot.docs.map(doc => {
      const data = doc.data();
      const plainObject: any = { id: doc.id };

      for (const key in data) {
        if (data[key] instanceof Timestamp) {
          plainObject[key] = data[key].toDate();
        } else {
          plainObject[key] = data[key];
        }
      }
      return plainObject as Report;
    });

    callback(reportList);
  });

  return unsubscribe;
}
