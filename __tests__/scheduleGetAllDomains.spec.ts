import { Context } from 'aws-lambda'
import { fire, ddb, sqs } from '../src/scheduleGetAllDomains'

jest.setTimeout(30e3)

const { scan } = ddb
const { sendMessage } = sqs

let domains: string[]

describe(`Schedule Get All Domains`, () => {
  beforeEach(() => {
    domains = []
    ddb.scan = jest.fn().mockImplementation((params) => {
      return {
        promise: () =>
          Promise.resolve({
            Items: [
              {
                code_domain: 'ABC'
              },
              {
                code_domain: 'XYZ'
              },
              {
                code_domain: 'DOM'
              }
            ]
          })
      }
    })
    sqs.sendMessage = jest.fn().mockImplementation((params) => {
      const { domain } = JSON.parse(params.MessageBody)
      domains.push(domain)
      return {
        promise: () => Promise.resolve()
      }
    })
  })

  afterAll(() => {
    Object.assign(ddb, { scan })
    Object.assign(sqs, { sendMessage })
  })

  it('schedules getting all domains and queueing each for code expiration pruning', async () => {
    await fire({}, {} as Context, () => {})

    expect(domains).toEqual(['ABC', 'XYZ', 'DOM'])
  })

  it('ddb fail', async () => {
    ddb.scan = jest.fn().mockImplementation((params) => {
      return {
        promise: () =>
          Promise.reject({
            statusCode: 500,
            message: 'Internal server error'
          })
      }
    })

    await fire({}, {} as Context, () => {})

    expect(domains).toEqual([])
  })

  it('sqs fail', async () => {
    sqs.sendMessage = jest.fn().mockImplementation((params) => {
      return {
        promise: () =>
          Promise.reject({ statusCode: 500, message: 'Internal server error' })
      }
    })

    await fire({}, {} as Context, () => {})

    expect(domains).toEqual([])
  })
})
