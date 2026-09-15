// Small fetch wrapper shared by every API call.
// It keeps error handling in one place so components stay simple.

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

/**
 * Error thrown for any failed API call.
 * `fieldErrors` holds Laravel's validation errors, e.g. { amount: ['...'] }.
 */
export class ApiError extends Error {
  constructor(message, { status = 0, fieldErrors = {} } = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.fieldErrors = fieldErrors
  }

  /** First validation message for a field, or undefined. */
  fieldError(field) {
    const messages = this.fieldErrors[field]
    return Array.isArray(messages) ? messages[0] : messages
  }
}

function defaultMessage(status) {
  if (status === 404) return 'That savings goal could not be found. It may already be deleted.'
  if (status === 422) return 'Please check the values you entered.'
  if (status >= 500) return 'The server had a problem. Please try again in a moment.'
  return 'Something went wrong while talking to the server.'
}

async function parseBody(response) {
  if (response.status === 204) return null

  const text = await response.text()
  if (!text) return null

  try {
    return JSON.parse(text)
  } catch {
    return null
  }
}

/**
 * Performs a request against the SaveWise API.
 * Returns the parsed JSON body (or null for 204 No Content).
 */
export async function request(path, { method = 'GET', body } = {}) {
  let response

  try {
    response = await fetch(`${BASE_URL}${path}`, {
      method,
      headers: {
        Accept: 'application/json',
        ...(body ? { 'Content-Type': 'application/json' } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    })
  } catch {
    throw new ApiError(
      'Cannot reach the server. Make sure the Laravel backend is running.',
      { status: 0 },
    )
  }

  const data = await parseBody(response)

  if (!response.ok) {
    // Laravel's 404/500 responses can contain raw internals (SQL, stack
    // traces) when APP_DEBUG is on, so we show our own wording for those.
    const serverMessage =
      response.status === 404 || response.status >= 500 ? undefined : data?.message

    throw new ApiError(serverMessage || defaultMessage(response.status), {
      status: response.status,
      fieldErrors: data?.errors || {},
    })
  }

  return data
}
