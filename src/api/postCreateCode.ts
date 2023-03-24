import { Handler } from 'aws-lambda'
import { put } from '../ddb/put'

export const handler: Handler = async (event, _context, _callback) => {
  const { code_domain, code_hash, expire_timestamp } = JSON.parse(event.body)

  try {
    await put({ code_domain, code_hash, expire_timestamp })

    return {
      statusCode: 200,
      body: `${code_domain}${code_hash}`
    }
  } catch (e) {
    return {
      statusCode: e.statusCode,
      body:
        e.message === 'The conditional request failed'
          ? 'Record Already Exists'
          : e.message
    }
  }
}
