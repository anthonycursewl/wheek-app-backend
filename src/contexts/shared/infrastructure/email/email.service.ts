import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { IEmailService } from './interfaces/email.service.interface';

@Injectable()
export class EmailService implements IEmailService {
    private transporter: nodemailer.Transporter;

    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.HOST_EMAIL,
            port: parseInt(process.env.PORT_EMAIL || '587'),
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASSWORD,
            },
        });
    }

    async sendInvitationEmail(
        to: string,
        invitationToken: string,
        storeName: string,
        inviterName: string,
        roleName: string,
        frontendUrl: string = process.env.FRONTEND_URL || 'http://localhost:3000',
        message: string = '',
    ): Promise<void> {
        
        const mailOptions = {
            from: process.env.SMTP_FROM || process.env.SMTP_USER,
            to: to,
            subject: `Invitación para unirte a ${storeName}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #333;">Has sido invitado a unirte a ${storeName}</h2>
                    <p>Hola,</p>
                    <p>${inviterName} te ha invitado a unirte a <strong>${storeName}</strong> con el rol de <strong>${roleName}</strong>.</p>
                    <p>Para aceptar la invitación, copia el siguiente token:</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <input type="text" value="${invitationToken}" readonly style="width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 4px;">
                    </div>

                    <p>${message}</p>
                    <p>Esta invitación expirará en 7 días.</p>
                    <p>Si no esperabas esta invitación, puedes ignorar este correo.</p>
                    <p>Saludos,<br>El equipo de ${storeName}</p>
                </div>
            `,
        };

        try {
            await this.transporter.sendMail(mailOptions);
            console.log(`Invitation email sent to ${to}`);
        } catch (error) {
            console.error('Error sending invitation email:', error);
            throw new Error('Failed to send invitation email');
        }
    }

    async sendDeclineEmail(
        to: string,
        storeName: string,
        invitedUserName: string,
        inviterName: string
    ): Promise<void> {
        const mailOptions = {
            from: process.env.SMTP_FROM || process.env.SMTP_USER,
            to: to,
            subject: `Invitación rechazada para ${storeName}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
                    <div style="text-align: center; margin-bottom: 30px;">
                        <h2 style="color: #d32f2f; margin: 0;">Invitación Rechazada</h2>
                    </div>
                    
                    <p style="font-size: 16px; line-height: 1.5; color: #333;">Hola <strong>${inviterName}</strong>,</p>
                    
                    <div style="background-color: #f5f5f5; padding: 15px; border-radius: 6px; margin: 20px 0;">
                        <p style="margin: 0; color: #555;">Te informamos que <strong>${invitedUserName}</strong> ha decidido rechazar la invitación para unirse a <strong>${storeName}</strong>.</p>
                    </div>
                    
                    <p style="font-size: 16px; line-height: 1.5; color: #333;">La invitación ha sido marcada como rechazada en nuestro sistema.</p>
                    
                    <div style="margin: 30px 0; padding: 20px; background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 6px;">
                        <p style="margin: 0; color: #856404; font-size: 14px;"><strong>Nota:</strong> Si deseas invitar a otra persona, puedes generar una nueva invitación desde el panel de administración.</p>
                    </div>
                    
                    <p style="font-size: 16px; line-height: 1.5; color: #333;">Gracias por usar nuestro servicio.</p>
                    
                    <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center; color: #666; font-size: 14px;">
                        <p style="margin: 0;">Este es un correo automático, por favor no respondas a este mensaje.</p>
                        <p style="margin: 5px 0 0 0;">Saludos,<br>El equipo de Wheek App</p>
                    </div>
                </div>
            `,
        };

        try {
            await this.transporter.sendMail(mailOptions);
            console.log(`Decline email sent to ${to}`);
        } catch (error) {
            console.error('Error sending decline email:', error);
            throw new Error('Failed to send decline email');
        }
    }

    async sendTestEmail(to: string): Promise<void> {
        const mailOptions = {
            from: process.env.SMTP_FROM || process.env.SMTP_USER,
            to: to,
            subject: 'Prueba de envío de correo',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #333;">Prueba de Email Service</h2>
                    <p>Este es un correo de prueba para verificar que el servicio de email está funcionando correctamente.</p>
                    <p>Si recibes este correo, significa que la configuración SMTP es correcta.</p>
                    <p>Saludos,<br>El equipo de Wheek App</p>
                </div>
            `,
        };

        try {
            await this.transporter.sendMail(mailOptions);
            console.log(`Test email sent to ${to}`);
        } catch (error) {
            console.error('Error sending test email:', error);
            throw new Error('Failed to send test email');
        }
    }

    async sendNotificationEmail(to: string, subject: string, htmlContent: string): Promise<void> {
        const mailOptions = {
            from: process.env.SMTP_FROM || process.env.SMTP_USER,
            to: to,
            subject: subject,
            html: htmlContent,
        };

        try {
            await this.transporter.sendMail(mailOptions);
            console.log(`Notification email sent to ${to} with subject: ${subject}`);
        } catch (error) {
            console.error('Error sending notification email:', error);
            throw new Error('Failed to send notification email');
        }
    }

    async verifyConnection(): Promise<boolean> {
        try {
            await this.transporter.verify();
            console.log('SMTP connection verified successfully');
            return true;
        } catch (error) {
            console.error('SMTP connection verification failed:', error);
            return false;
        }
    }
}
