
'use server';

import { sendMail } from '@/lib/email';
import type { AppNotification } from './notificationsService';

// Constants for consistent styling and branding
const BRAND_COLOR_PRIMARY = '#221C4A';
const BRAND_COLOR_SECONDARY = '#4A90E2';
const FONT_FAMILY = 'Arial, Helvetica, sans-serif';
const MAX_WIDTH = '600px';
const BORDER_RADIUS = '8px';
const BOX_SHADOW = '0 4px 15px rgba(0,0,0,0.1)';
const PADDING = '20px';
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://v2-intern-hub.vercel.app?_vercel_share=rcXpYCmxTH7pLPXw1YACBNSXNhrY1KoT';

export type UserType = 'student' | 'supervisor' | 'lecturer' | 'hod' | 'admin';

/**
 * Base email template to maintain consistency across all emails
 */
const baseEmailTemplate = (
  content: string,
  options?: {
    headerColor?: string;
    headerText?: string;
    customFooter?: string;
  }
) => `
  <div style="font-family: ${FONT_FAMILY}; background-color: #f4f4f4; padding: ${PADDING};">
    <div style="max-width: ${MAX_WIDTH}; margin: 0 auto; background-color: #ffffff; border-radius: ${BORDER_RADIUS}; overflow: hidden; box-shadow: ${BOX_SHADOW};">
      <div style="background-color: ${options?.headerColor || BRAND_COLOR_PRIMARY}; color: #ffffff; padding: ${PADDING}; text-align: center;">
        <h1 style="margin: 0; font-size: 24px;">${options?.headerText || 'InternHub (HTU)'}</h1>
      </div>
      ${content}
      <div style="background-color: #f4f4f4; padding: ${PADDING}; text-align: center; border-top: 1px solid #eeeeee;">
        ${options?.customFooter || `
          <p style="font-size: 12px; color: #888888; margin: 0;">You received this email as part of the InternHub platform for Ho Technical University.</p>
          <p style="font-size: 12px; color: #888888; margin: 5px 0 0 0;">&copy; ${new Date().getFullYear()} InternHub Team (HTU)</p>
        `}
      </div>
    </div>
  </div>
`;

/**
 * Creates a styled button for email actions
 */
const emailButton = (text: string, href: string, color: string = BRAND_COLOR_PRIMARY) => `
  <div style="text-align: center; margin: 30px 0;">
    <a href="${href}" style="background-color: ${color}; color: #ffffff; padding: 14px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block; font-size: 16px;">${text}</a>
  </div>
`;

/**
 * Gets user-specific invitation details
 */
const getUserInviteDetails = (userType: UserType, name: string) => {
  const common = {
    subject: `You're invited to join InternHub for HTU`,
    buttonText: 'Verify Your Account',
  };

  switch (userType) {
    case 'student':
      return {
        ...common,
        greeting: `Welcome to InternHub, ${name}!`,
        intro: `You've been registered as a <strong>student</strong> on <strong>InternHub</strong>, the official internship management platform for <strong>Ho Technical University (HTU)</strong>.`,
        purpose: `This platform will help you manage your internship process, submit reports, communicate with your supervisors, and track your progress throughout your internship period.`,
      };
    case 'supervisor':
      return {
        ...common,
        greeting: `Welcome aboard, ${name}!`,
        intro: `You've been registered as a <strong>supervisor</strong> on <strong>InternHub</strong>, the official internship management platform for <strong>Ho Technical University (HTU)</strong>.`,
        purpose: `This platform will enable you to monitor student progress, review reports, provide feedback, and manage all aspects of your assigned students' internships.`,
      };
    case 'lecturer':
    case 'hod':
    case 'admin':
      return {
        ...common,
        greeting: `Welcome to the team, ${name}!`,
        intro: `You've been registered as a <strong>${userType}</strong> on <strong>InternHub</strong>, the official internship management platform for <strong>Ho Technical University (HTU)</strong>.`,
        purpose: `This platform will help you coordinate with students and supervisors, access internship reports, and contribute to the evaluation process.`,
      };
    default:
      throw new Error('Invalid user type');
  }
};

/**
 * Sends an invitation email tailored to the user type
 * @param to The recipient's email address
 * @param name The recipient's name
 * @param userType The type of user (student, supervisor, or lecturer)
 * @param verificationLink The link for email verification
 */
export async function sendInviteEmail(
  to: string,
  name: string,
  userType: UserType,
  verificationLink: string = `${BASE_URL}/verify`
): Promise<void> {
  const { subject, greeting, intro, purpose, buttonText } = getUserInviteDetails(userType, name);

  const content = `
    <div style="padding: 30px;">
      <h2 style="color: #333333; font-size: 20px; margin-top: 0;">${greeting}</h2>
      <p style="color: #555555; line-height: 1.6; margin-bottom: 16px;">
        ${intro}
      </p>
      <p style="color: #555555; line-height: 1.6; margin-bottom: 16px;">
        ${purpose}
      </p>
      ${emailButton(buttonText, verificationLink)}
      <p style="color: #555555; line-height: 1.6; margin-bottom: 0; font-size: 14px;">
        <strong>Note:</strong> This invitation will expire in 7 days. If you didn't expect this invitation, 
        please ignore this email or contact our support team at internhub-support@htu.edu.gh.
      </p>
    </div>
  `;

  const text = `${greeting}\n\n${intro.replace(/<[^>]*>/g, '')}\n\n${purpose.replace(/<[^>]*>/g, '')}\n\nPlease verify your account here: ${verificationLink}\n\nThis invitation expires in 7 days.`;

  await sendMail({
    to,
    subject,
    text,
    html: baseEmailTemplate(content)
  });
}


/**
 * Sends a verification code email.
 * @param to The recipient's email address.
 * @param code The verification code.
 */
export async function sendVerificationCodeEmail(to: string, code: string): Promise<void> {
  const subject = 'Your InternHub Verification Code';
  const text = `Your verification code for InternHub (HTU) is ${code}. Please use this code to complete your registration.`;
  const content = `
    <div style="padding: 30px;">
        <h2 style="color: #333333; font-size: 20px;">Your Verification Code</h2>
        <p style="color: #555555; line-height: 1.6;">Please use the following code to complete your account setup on the InternHub platform for HTU.</p>
        <div style="text-align: center; margin: 30px 0;">
        <p style="font-size: 32px; font-weight: bold; letter-spacing: 4px; background-color: #f0f2f0; padding: 15px 25px; display: inline-block; border-radius: 5px; color: #333;">${code}</p>
        </div>
        <p style="color: #555555; line-height: 1.6;">This code will expire in 10 minutes. If you did not request this, please ignore this email.</p>
    </div>
  `;
  const footer = `<p style="font-size: 12px; color: #888888; margin: 0;">You received this email because you requested a verification code for the InternHub platform for HTU.</p><p style="font-size: 12px; color: #888888; margin: 5px 0 0 0;">&copy; ${new Date().getFullYear()} InternHub Team (HTU)</p>`;

  await sendMail({ to, subject, text, html: baseEmailTemplate(content, { customFooter: footer }) });
}


/**
 * Sends a generic notification email.
 * @param to The recipient's email address.
 * @param notification The notification object containing title, message, and href.
 */
export async function sendGenericNotificationEmail(to: string, notification: Pick<AppNotification, 'title' | 'message' | 'href'>): Promise<void> {
    const { title, message, href } = notification;
    const fullHref = href ? `${BASE_URL}${href}` : `${BASE_URL}/dashboard`;
    const subject = `InternHub Notification: ${title}`;
    const text = `${message}\n\nYou can view this notification in the InternHub app (HTU): ${fullHref}`;
    const content = `
       <div style="padding: 30px;">
        <h2 style="color: #333333; font-size: 20px;">${title}</h2>
        <p style="color: #555555; line-height: 1.6;">${message}</p>
        ${href ? emailButton('View Details in App', fullHref, BRAND_COLOR_SECONDARY) : ''}
      </div>
    `;
    const footer = `<p style="font-size: 12px; color: #888888; margin: 0;">You are receiving this email because of activity related to your account on the InternHub platform for HTU. You can manage your notification preferences in your account settings.</p><p style="font-size: 12px; color: #888888; margin: 5px 0 0 0;">&copy; ${new Date().getFullYear()} InternHub Team (HTU)</p>`;

    await sendMail({ to, subject, text, html: baseEmailTemplate(content, { headerColor: BRAND_COLOR_SECONDARY, headerText: 'InternHub Notification (HTU)', customFooter: footer}) });
}


/**
 * Sends an announcement email to a user.
 * @param to Recipient's email address.
 * @param name Recipient's name.
 * @param title The announcement title/subject.
 * @param message The announcement message body (can contain HTML).
 */
export async function sendAnnouncementEmail(to: string, name: string, title: string, message: string): Promise<void> {
    const subject = `InternHub Announcement: ${title}`;
    const text = `Hello ${name},\n\nAn announcement has been posted on the InternHub platform:\n\nTitle: ${title}\n\n${message.replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]*>/g, '')}\n\n---\nInternHub Team (HTU)`;
    
    // Sanitize message for HTML email by replacing newlines with <br>
    const htmlMessage = message.replace(/\n/g, '<br />');
    const fullHref = `${BASE_URL}/dashboard`;

    const content = `
       <div style="padding: 30px;">
        <h2 style="color: #333333; font-size: 20px;">Hello ${name},</h2>
        <p style="color: #555555; line-height: 1.6;">A new announcement has been posted on the InternHub platform:</p>
        <div style="padding: 20px; border-left: 4px solid ${BRAND_COLOR_SECONDARY}; background-color: #f8f9fa; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #333;">${title}</h3>
            <p style="color: #555555; line-height: 1.6;">${htmlMessage}</p>
        </div>
        ${emailButton('Go to Dashboard', fullHref, BRAND_COLOR_SECONDARY)}
      </div>
    `;
     const footer = `<p style="font-size: 12px; color: #888888; margin: 0;">You are receiving this email as a member of the InternHub platform for HTU. This is an official announcement from the administration.</p><p style="font-size: 12px; color: #888888; margin: 5px 0 0 0;">&copy; ${new Date().getFullYear()} InternHub Team (HTU)</p>`;

    await sendMail({ to, subject, text, html: baseEmailTemplate(content, { headerColor: BRAND_COLOR_PRIMARY, headerText: 'Official Announcement (HTU)', customFooter: footer}) });
}
