// String utilities
export function reverse(s: string): string {
    return s.split('').reverse().join('')
}

// Flag emoji utilities
export function getFlagEmoji(isoCode: string): string {
    const codePoints = isoCode
        .toUpperCase()
        .split('')
        .map(char => 127397 + char.charCodeAt(0))
    return String.fromCodePoint(...codePoints)
}

// Array utilities
export function shuffleArray<T>(array: T[]): T[] {
    const newArray = [...array]
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]]
    }
    return newArray
}

// Buffer utilities
export function arrayBufferToHex(buffer: ArrayBuffer): string {
    return [...new Uint8Array(buffer)]
        .map(x => x.toString(16).padStart(2, '0'))
        .join('')
}

export function base64ToArrayBuffer(base64Str: string): { earlyData?: ArrayBuffer; error?: Error } {
    if (!base64Str) {
        return { error: undefined }
    }

    try {
        const cleanBase64 = base64Str.replace(/-/g, '+').replace(/_/g, '/')
        const binaryStr = atob(cleanBase64)
        const bytes = Uint8Array.from(binaryStr, c => c.charCodeAt(0))
        return { earlyData: bytes.buffer }
    } catch (error) {
        return { error: error instanceof Error ? error : new Error('Unknown error') }
    }
}

// Crypto utilities
export async function generateHashFromText(text: string): Promise<string> {
    const encoder = new TextEncoder()
    const data = encoder.encode(text)
    const hashBuffer = await crypto.subtle.digest('MD5', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

// WebSocket utilities
export function safeCloseWebSocket(socket: WebSocket): void {
    try {
        if (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CLOSING) {
            socket.close()
        }
    } catch (error) {
        console.error('Error closing WebSocket:', error)
    }
} 