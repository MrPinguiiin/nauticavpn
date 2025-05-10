/**
 * Stub/mock untuk tipe-tipe Cloudflare Workers yang tidak tersedia di SvelteKit
 */

// Mock socket interface
export interface CloudflareSocket {
  readable: ReadableStream;
  writable: WritableStream;
  closed: Promise<void>;
}

// Mock WebSocketPair 
export class MockWebSocketPair {
  client: WebSocket;
  server: MockWebSocket;
  
  constructor() {
    // Mock client - dapat diganti dengan implementasi yang lebih baik
    this.client = {
      send: () => {},
      close: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => true,
    } as unknown as WebSocket;
    
    // Mock server
    this.server = new MockWebSocket();
  }
  
  // Implementasi Object.values untuk WebSocketPair
  static values(pair: MockWebSocketPair): [WebSocket, MockWebSocket] {
    return [pair.client, pair.server];
  }
}

// Mock WebSocket server
export class MockWebSocket {
  readyState: number = 1; // OPEN
  
  accept(): void {
    console.log("[MOCK] WebSocket accepted");
  }
  
  send(data: any): void {
    console.log("[MOCK] WebSocket sent data", data);
  }
  
  close(): void {
    console.log("[MOCK] WebSocket closed");
    this.readyState = 2; // CLOSING
  }
  
  addEventListener(type: string, listener: any): void {
    console.log(`[MOCK] Added event listener for ${type}`);
  }
}

// Constants
export const WS_READY_STATE_OPEN = 1;
export const WS_READY_STATE_CLOSING = 2;

// Mock connect function
export function mockConnect(options: { hostname: string; port: number }): CloudflareSocket {
  console.log(`[MOCK] Connecting to ${options.hostname}:${options.port}`);
  
  // Return stub object
  return {
    readable: new ReadableStream(),
    writable: new WritableStream(),
    closed: Promise.resolve()
  };
}

// Fungsi untuk membuat WebSocket pair
export function createWebSocketPair(): { 0: WebSocket, 1: MockWebSocket } {
  const pair = new MockWebSocketPair();
  return {
    0: pair.client,
    1: pair.server
  };
} 