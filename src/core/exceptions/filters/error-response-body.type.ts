export class FieldError {
  message: string | null;
  field: string | null;
}

export class APIErrorResult {
  errorsMessages: FieldError[];
}
