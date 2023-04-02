import { Handler } from 'aws-lambda'
import { putItem } from '../ddb/index'

export const handler: Handler = async (event, _context, _callback) => {
  const { code_domain, code_hash, use_count, expire_timestamp } = JSON.parse(
    event.body
  )

  try {
    await putItem({ code_domain, code_hash, expire_timestamp, use_count })

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
