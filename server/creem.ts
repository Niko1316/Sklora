import crypto from "crypto";

// Creem API configuration
const CREEM_API_KEY = process.env.CREEM_API_KEY || "";
const CREEM_BASE_URL = CREEM_API_KEY.startsWith("creem_test_")
  ? "https://test-api.creem.io"
  : "https://api.creem.io";

export function isCreemConfigured(): boolean {
  return !!CREEM_API_KEY;
}

// Generic Creem API request
async function creemRequest<T>(
  method: string,
  path: string,
  body?: Record<string, unknown>
): Promise<T> {
  const url = `${CREEM_BASE_URL}${path}`;
  const options: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
      "x-api-key": CREEM_API_KEY,
    },
  };
  if (body && method !== "GET") {
    options.body = JSON.stringify(body);
  }
  const response = await fetch(url, options);
  if (!response.ok) {
    const errorText = await response.text();
    console.error(`[Creem] API error ${response.status}: ${errorText}`);
    throw new Error(`Creem API error: ${response.status} - ${errorText}`);
  }
  return response.json() as Promise<T>;
}

// Types
export interface CreemCheckoutResponse {
  id: string;
  mode: string;
  object: string;
  status: string;
  product: string;
  request_id?: string;
  units: number;
  order?: {
    id: string;
    amount: number;
    currency: string;
    status: string;
    type: string;
  };
  subscription?: string;
  customer?: string;
  checkout_url: string;
  success_url?: string;
  metadata?: Record<string, string>;
}

export interface CreemSubscription {
  id: string;
  mode: string;
  status: string;
  current_period_start: string;
  current_period_end: string;
  product: string;
  customer: string;
}

// Create a checkout session
export async function createCheckoutSession(params: {
  productId: string;
  customerEmail?: string;
  userId: string;
  successUrl: string;
  metadata?: Record<string, string>;
  discountCode?: string;
}): Promise<CreemCheckoutResponse> {
  return creemRequest<CreemCheckoutResponse>("POST", "/v1/checkouts", {
    product_id: params.productId,
    request_id: `sklora_${params.userId}_${Date.now()}`,
    customer: params.customerEmail
      ? { email: params.customerEmail }
      : undefined,
    success_url: params.successUrl,
    discount_code: params.discountCode || undefined,
    metadata: {
      user_id: params.userId,
      ...(params.metadata || {}),
    },
  });
}

// Retrieve a subscription
export async function getSubscription(
  subscriptionId: string
): Promise<CreemSubscription> {
  return creemRequest<CreemSubscription>(
    "GET",
    `/v1/subscriptions/${subscriptionId}`
  );
}

// Cancel a subscription
export async function cancelSubscription(
  subscriptionId: string
): Promise<CreemSubscription> {
  return creemRequest<CreemSubscription>(
    "POST",
    `/v1/subscriptions/${subscriptionId}/cancel`
  );
}

// Generate customer portal link
export async function getCustomerPortalUrl(
  customerId: string
): Promise<{ url: string }> {
  return creemRequest<{ url: string }>(
    "POST",
    `/v1/customers/portal`,
    { id: customerId }
  );
}

// Verify webhook signature
export function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const computedSignature = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex");
  return crypto.timingSafeEqual(
    Buffer.from(computedSignature),
    Buffer.from(signature)
  );
}

// Webhook event types
export type CreemWebhookEvent =
  | "checkout.completed"
  | "subscription.active"
  | "subscription.paid"
  | "subscription.canceled"
  | "subscription.scheduled_cancel"
  | "subscription.past_due"
  | "subscription.expired"
  | "refund.created"
  | "dispute.created"
  | "subscription.update"
  | "subscription.trialing"
  | "subscription.paused";
