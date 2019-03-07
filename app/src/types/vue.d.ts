declare module 'vue/types/vue' {
  interface Vue {
    $log(message?: any, ...optionalParams: any[]): void
    $error(message?: any, ...optionalParams: any[]): void
    $event: Vue
    $fmoney(s: any, n: any): string
  }
}

export {}
