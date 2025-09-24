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
        frontendUrl: string = process.env.FRONTEND_URL || 'http://localhost:3000'
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
