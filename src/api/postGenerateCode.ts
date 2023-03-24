import { Handler } from 'aws-lambda'
import { v4 as uuidv4 } from 'uuid'
import { put } from '../ddb/put'

export const handler: Handler = async (event, _context, _callback) => {
  const { code_domain, expire_timestamp } = JSON.parse(event.body)

  try {
    const code_hash = uuidv4().split('-').slice(-1).toUpperCase()
    await put({ code_domain, expire_timestamp, code_hash })

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
