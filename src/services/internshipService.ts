
'use server';

import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, query, where, writeBatch, serverTimestamp, doc, setDoc } from 'firebase/firestore';
import { createInvite } from './invitesService';
import { createAuditLog } from './auditLogService';

// This service might be used for managing the active internship link later,
// but the initial profile setup is now in internshipProfileService.
