import { Handler } from 'aws-lambda'
import { v4 as uuidv4 } from 'uuid'
import { putItem } from '../ddb/index'

export const handler: Handler = async (event, _context, _callback) => {
  const { code_domain, use_count, expire_timestamp } = JSON.parse(event.body)

  try {
    const code_hash = uuidv4().split('-').slice(-1)[0].toUpperCase()
    await putItem({ code_domain, expire_timestamp, code_hash, use_count })

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
