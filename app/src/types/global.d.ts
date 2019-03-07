declare global {
  interface Date {
    format(fmt: string): string
    getToday(): string
  }
  interface Window {
    webkit: any
    JsInterface: any
    theme: string
  }
}

export {}
