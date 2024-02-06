export class Rules {
  public static required (val: string | undefined) {
    return !!val || 'Required'
  }

  public static validFileNameOrFolder (val: string | undefined) {
    return (typeof val === 'string' && /^\w{1,255}$/.test(val)) || 'Not valid'
  }

  public static validKDriveID (val: string | undefined) {
    return (typeof val === 'string' && /^[0-9]+$/.test(val)) || 'Not valid kDrive ID'
  }

  public static validEmail (val: string | undefined) {
    return (
      typeof val === 'string' &&
      /(^$|^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$)/.test(val)
    ) || 'Not valid email'
  }

  public static string (val: string | undefined) {
    return typeof val === 'string' || 'Required'
  }
}
