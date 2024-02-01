export class Rules {
  public static required (val: string | undefined) {
    return !!val || 'Required'
  }

  public static validFilename (val: string | undefined) {
    return (typeof val === 'string' && /^[A-Za-z]+$/.test(val)) || 'Not valid filename'
  }

  public static string (val: string | undefined) {
    return typeof val === 'string' || 'Required'
  }
}
