export interface CodeKey {
  code_domain: string
  code_hash: string
}

export interface Code extends CodeKey {
  expire_timestamp: number
  use_count?: number
  [key: string]: any
}
