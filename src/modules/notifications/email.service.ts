import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from "@nestjs/common";


@Injectable()
export class EmailService {

    constructor(private mailerService: MailerService,
    ) { }

    async sendEmail(
        email: string,
        subject: string,
        html: string,
    ): Promise<boolean> {
        try {
        
            const info = await this.mailerService.sendMail({
                to: email,
                subject,
                html,
            });

            return !!info.messageId;
        } catch (error) {
            return false;
        }
    }

};