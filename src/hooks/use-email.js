import { useSession } from "next-auth/react";
import { addEmailJob } from "@/lib/queue";

export const useEmail = () => {
    const { data: session } = useSession();
    
    // Función para encolar emails directos
    const sendEmail = async (subject, html, options = {}) => {
        try {
            await addEmailJob({
                type: 'direct_email',
                to: process.env.NOTIFY_EMAIL,
                subject: subject,
                html: html,
                priority: options.priority || 0,
                delay: options.delay || 0,
                metadata: {
                    sent_by: session?.user?.email,
                    timestamp: new Date().toISOString(),
                    ...options.metadata
                }
            });
            console.log('Email queued successfully');
        } catch (error) {
            console.error('Error queuing email:', error);
            throw error;
        }
    };

    // Función para enviar notificaciones específicas con plantillas
    const sendNotification = async (type, data, options = {}) => {
        try {
            await addEmailJob({
                type: type,
                ...data,
                priority: options.priority || 5,
                delay: options.delay || 0,
                metadata: {
                    sent_by: session?.user?.email,
                    timestamp: new Date().toISOString(),
                    ...options.metadata
                }
            });
            console.log(`Notification of type ${type} queued successfully`);
        } catch (error) {
            console.error(`Error queuing ${type} notification:`, error);
            throw error;
        }
    };

    return { 
        sendEmail, 
        sendNotification,
        isAuthenticated: !!session 
    };
};

