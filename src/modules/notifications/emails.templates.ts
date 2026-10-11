

export const emailTemplates = {
  registrationEmail(code: string, login?: string): string {
    return `
      <div>
        <h1>
          Thank you for your registration${login ? `, ${login}` : ''}!
        </h1>

        <p>
          To finish registration, please follow the link below:
        </p>

        <a href="https://somesite.com/confirm-email?code=${code}">
          Complete registration
        </a>
      </div>
    `;
  },

  recoveryPasswordEmail(code: string): string {
    return `
      <div>
        <h1>Password recovery</h1>

        <p>
          To finish password recovery please follow the link below:
        </p>

        <a href="https://somesite.com/password-recovery?recoveryCode=${code}">
          Recovery password
        </a>
      </div>
    `;
  },
};