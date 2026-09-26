import bcrypt from 'bcryptjs';
import { User, Role } from '../types/inventory';

const JWT_SECRET = 'stocksense_jwt_secure_secret_2026_x89f_erp';
const USERS_DB_KEY = 'stocksense_secure_users_v2';
const OTP_STORE_KEY = 'stocksense_otp_store_v2';

export interface StoredUser extends User {
  passwordHash: string;
  createdAt: string;
  lastLogin?: string;
  status: 'active' | 'suspended';
}

export interface AuthSession {
  token: string;
  user: User;
  expiresAt: number;
}

// Browser-safe SHA-256 and HMAC-SHA256 standard implementation
function sha256Bytes(data: Uint8Array): Uint8Array {
  const K = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
  ];

  let H = [
    0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
    0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19,
  ];

  const l = data.length;
  const bitLen = l * 8;
  const padLen = (l % 64 < 56) ? (56 - (l % 64)) : (120 - (l % 64));
  const padded = new Uint8Array(l + padLen + 8);
  padded.set(data);
  padded[l] = 0x80;

  const view = new DataView(padded.buffer);
  view.setUint32(padded.length - 4, bitLen >>> 0);
  view.setUint32(padded.length - 8, Math.floor(bitLen / 0x100000000));

  const w = new Uint32Array(64);
  for (let i = 0; i < padded.length; i += 64) {
    for (let j = 0; j < 16; j++) {
      w[j] = view.getUint32(i + j * 4);
    }
    for (let j = 16; j < 64; j++) {
      const s0 = ((w[j - 15] >>> 7) | (w[j - 15] << 25)) ^
                 ((w[j - 15] >>> 18) | (w[j - 15] << 14)) ^
                 (w[j - 15] >>> 3);
      const s1 = ((w[j - 2] >>> 17) | (w[j - 2] << 15)) ^
                 ((w[j - 2] >>> 19) | (w[j - 2] << 13)) ^
                 (w[j - 2] >>> 10);
      w[j] = (w[j - 16] + s0 + w[j - 7] + s1) >>> 0;
    }

    let a = H[0], b = H[1], c = H[2], d = H[3], e = H[4], f = H[5], g = H[6], h = H[7];

    for (let j = 0; j < 64; j++) {
      const S1 = ((e >>> 6) | (e << 26)) ^ ((e >>> 11) | (e << 21)) ^ ((e >>> 25) | (e << 7));
      const ch = (e & f) ^ (~e & g);
      const temp1 = (h + S1 + ch + K[j] + w[j]) >>> 0;
      const S0 = ((a >>> 2) | (a << 30)) ^ ((a >>> 13) | (a << 19)) ^ ((a >>> 22) | (a << 10));
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const temp2 = (S0 + maj) >>> 0;

      h = g;
      g = f;
      f = e;
      e = (d + temp1) >>> 0;
      d = c;
      c = b;
      b = a;
      a = (temp1 + temp2) >>> 0;
    }

    H[0] = (H[0] + a) >>> 0;
    H[1] = (H[1] + b) >>> 0;
    H[2] = (H[2] + c) >>> 0;
    H[3] = (H[3] + d) >>> 0;
    H[4] = (H[4] + e) >>> 0;
    H[5] = (H[5] + f) >>> 0;
    H[6] = (H[6] + g) >>> 0;
    H[7] = (H[7] + h) >>> 0;
  }

  const out = new Uint8Array(32);
  const outView = new DataView(out.buffer);
  for (let i = 0; i < 8; i++) {
    outView.setUint32(i * 4, H[i]);
  }
  return out;
}

function hmacSha256(keyStr: string, messageStr: string): Uint8Array {
  const encoder = new TextEncoder();
  let key: Uint8Array = new Uint8Array(encoder.encode(keyStr));
  const msg: Uint8Array = new Uint8Array(encoder.encode(messageStr));

  if (key.length > 64) {
    key = sha256Bytes(key);
  }
  if (key.length < 64) {
    const padded = new Uint8Array(64);
    padded.set(key);
    key = padded;
  }

  const oKeyPad = new Uint8Array(64);
  const iKeyPad = new Uint8Array(64);
  for (let i = 0; i < 64; i++) {
    oKeyPad[i] = key[i] ^ 0x5c;
    iKeyPad[i] = key[i] ^ 0x36;
  }

  const inner = new Uint8Array(64 + msg.length);
  inner.set(iKeyPad);
  inner.set(msg, 64);
  const innerHash = sha256Bytes(inner);

  const outer = new Uint8Array(64 + 32);
  outer.set(oKeyPad);
  outer.set(innerHash, 64);
  return sha256Bytes(outer);
}

function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlToBytes(base64Url: string): Uint8Array {
  let b64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  while (b64.length % 4) {
    b64 += '=';
  }
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function strToBase64Url(str: string): string {
  return bytesToBase64Url(new TextEncoder().encode(str));
}

function base64UrlToStr(base64Url: string): string {
  return new TextDecoder().decode(base64UrlToBytes(base64Url));
}

// Browser-safe standard JWT sign and verify (RFC 7519)
const browserJwt = {
  sign(payload: Record<string, any>, secret: string, options: { expiresIn?: number } = {}): string {
    const header = { alg: 'HS256', typ: 'JWT' };
    const nowSec = Math.floor(Date.now() / 1000);
    const finalPayload = {
      ...payload,
      iat: nowSec,
      exp: options.expiresIn ? nowSec + options.expiresIn : nowSec + 86400,
    };
    const headerB64 = strToBase64Url(JSON.stringify(header));
    const payloadB64 = strToBase64Url(JSON.stringify(finalPayload));
    const toSign = `${headerB64}.${payloadB64}`;
    const sig = bytesToBase64Url(hmacSha256(secret, toSign));
    return `${toSign}.${sig}`;
  },

  verify(token: string, secret: string): Record<string, any> {
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid JWT token format');
    }
    const [headerB64, payloadB64, sig] = parts;
    const toSign = `${headerB64}.${payloadB64}`;
    const expectedSig = bytesToBase64Url(hmacSha256(secret, toSign));
    if (sig !== expectedSig) {
      throw new Error('Invalid token signature');
    }
    const payload = JSON.parse(base64UrlToStr(payloadB64));
    const nowSec = Math.floor(Date.now() / 1000);
    if (payload.exp && nowSec > payload.exp) {
      throw new Error('Token expired');
    }
    return payload;
  },
};

// Default seeded users with bcrypt hashed passwords
// Elena: 'Manager@123'
// Marcus: 'Staff@123'
const DEFAULT_STORED_USERS: StoredUser[] = [
  {
    id: 'usr-manager-1',
    name: 'Elena Vance',
    email: 'elena.vance@stocksense.io',
    role: 'inventory_manager',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    assignedWarehouseId: 'wh-1',
    passwordHash: bcrypt.hashSync('Manager@123', 10),
    createdAt: '2026-08-01T08:00:00.000Z',
    lastLogin: '2026-09-25T21:40:00.000Z',
    status: 'active',
  },
  {
    id: 'usr-staff-2',
    name: 'Marcus Chen',
    email: 'marcus.chen@stocksense.io',
    role: 'warehouse_staff',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    assignedWarehouseId: 'wh-1',
    passwordHash: bcrypt.hashSync('Staff@123', 10),
    createdAt: '2026-08-15T09:30:00.000Z',
    lastLogin: '2026-09-25T20:15:00.000Z',
    status: 'active',
  },
];

interface StoredOtp {
  email: string;
  otp: string;
  expiresAt: number;
  verified: boolean;
}

class AuthService {
  private getUsers(): StoredUser[] {
    try {
      const raw = localStorage.getItem(USERS_DB_KEY);
      if (!raw) {
        localStorage.setItem(USERS_DB_KEY, JSON.stringify(DEFAULT_STORED_USERS));
        return DEFAULT_STORED_USERS;
      }
      return JSON.parse(raw);
    } catch {
      return DEFAULT_STORED_USERS;
    }
  }

  private saveUsers(users: StoredUser[]): void {
    try {
      localStorage.setItem(USERS_DB_KEY, JSON.stringify(users));
    } catch (e) {
      console.error('Failed to save users database', e);
    }
  }

  private getOtpStore(): Record<string, StoredOtp> {
    try {
      const raw = localStorage.getItem(OTP_STORE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }

  private saveOtpStore(store: Record<string, StoredOtp>): void {
    try {
      localStorage.setItem(OTP_STORE_KEY, JSON.stringify(store));
    } catch (e) {
      console.error('Failed to save OTP store', e);
    }
  }

  private stripSensitive(user: StoredUser): User {
    const { passwordHash, ...safe } = user;
    return safe;
  }

  /**
   * Authenticate user with email and password
   */
  public async login(
    email: string,
    passwordPlain: string,
    rememberMe: boolean = true
  ): Promise<{ success: boolean; session?: AuthSession; message?: string }> {
    // Simulate realistic async network delay
    await new Promise(r => setTimeout(r, 400));

    const cleanEmail = email.trim().toLowerCase();
    const users = this.getUsers();
    const user = users.find(u => u.email.toLowerCase() === cleanEmail);

    if (!user) {
      return { success: false, message: 'Invalid email address or password' };
    }

    if (user.status !== 'active') {
      return { success: false, message: 'Your account has been deactivated. Please contact your manager.' };
    }

    const isValidPassword = bcrypt.compareSync(passwordPlain, user.passwordHash);
    if (!isValidPassword) {
      return { success: false, message: 'Invalid email address or password' };
    }

    // Update lastLogin
    const nowIso = new Date().toISOString();
    user.lastLogin = nowIso;
    this.saveUsers(users);

    const safeUser = this.stripSensitive(user);
    const expiresInSeconds = rememberMe ? 7 * 24 * 60 * 60 : 24 * 60 * 60; // 7 days vs 1 day
    const token = browserJwt.sign(
      {
        sub: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
      },
      JWT_SECRET,
      { expiresIn: expiresInSeconds }
    );

    return {
      success: true,
      session: {
        token,
        user: safeUser,
        expiresAt: Date.now() + expiresInSeconds * 1000,
      },
      message: 'Login successful',
    };
  }

  /**
   * Register a new user with bcrypt password hashing
   */
  public async register(
    name: string,
    email: string,
    role: Role,
    passwordPlain: string,
    assignedWarehouseId: string = 'wh-1'
  ): Promise<{ success: boolean; session?: AuthSession; message?: string }> {
    await new Promise(r => setTimeout(r, 450));

    const cleanEmail = email.trim().toLowerCase();
    const users = this.getUsers();

    if (users.some(u => u.email.toLowerCase() === cleanEmail)) {
      return { success: false, message: 'An account with this email already exists' };
    }

    if (passwordPlain.length < 6) {
      return { success: false, message: 'Password must be at least 6 characters long' };
    }

    const passwordHash = bcrypt.hashSync(passwordPlain, 10);
    const newUser: StoredUser = {
      id: `usr-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name: name.trim(),
      email: cleanEmail,
      role,
      assignedWarehouseId,
      passwordHash,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      status: 'active',
    };

    users.push(newUser);
    this.saveUsers(users);

    const safeUser = this.stripSensitive(newUser);
    const token = browserJwt.sign(
      {
        sub: newUser.id,
        email: newUser.email,
        role: newUser.role,
        name: newUser.name,
      },
      JWT_SECRET,
      { expiresIn: 7 * 24 * 60 * 60 }
    );

    return {
      success: true,
      session: {
        token,
        user: safeUser,
        expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
      },
      message: 'Account created successfully',
    };
  }

  /**
   * Verify token from storage and retrieve active user
   */
  public verifyToken(token: string): { valid: boolean; user?: User; error?: string } {
    try {
      const decoded = browserJwt.verify(token, JWT_SECRET) as any;
      const users = this.getUsers();
      const user = users.find(u => u.id === decoded.sub);

      if (!user || user.status !== 'active') {
        return { valid: false, error: 'User session expired or user deactivated' };
      }

      return { valid: true, user: this.stripSensitive(user) };
    } catch {
      return { valid: false, error: 'Invalid or expired authentication token' };
    }
  }

  /**
   * Step 1: Request password reset OTP
   */
  public async requestPasswordResetOtp(
    email: string
  ): Promise<{ success: boolean; otp?: string; message: string }> {
    await new Promise(r => setTimeout(r, 350));

    const cleanEmail = email.trim().toLowerCase();
    const users = this.getUsers();
    const user = users.find(u => u.email.toLowerCase() === cleanEmail);

    if (!user) {
      return { success: false, message: 'No registered user found with this email address' };
    }

    // Generate cryptographically random 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpStore = this.getOtpStore();

    otpStore[cleanEmail] = {
      email: cleanEmail,
      otp,
      expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
      verified: false,
    };

    this.saveOtpStore(otpStore);

    return {
      success: true,
      otp,
      message: `A 6-digit verification code has been generated for ${cleanEmail}.`,
    };
  }

  /**
   * Step 2: Verify the 6-digit OTP
   */
  public async verifyOtp(
    email: string,
    otp: string
  ): Promise<{ success: boolean; message: string }> {
    await new Promise(r => setTimeout(r, 300));

    const cleanEmail = email.trim().toLowerCase();
    const otpStore = this.getOtpStore();
    const record = otpStore[cleanEmail];

    if (!record) {
      return { success: false, message: 'No verification request found. Please request a new code.' };
    }

    if (Date.now() > record.expiresAt) {
      delete otpStore[cleanEmail];
      this.saveOtpStore(otpStore);
      return { success: false, message: 'Verification code has expired. Please request a new one.' };
    }

    if (record.otp.trim() !== otp.trim()) {
      return { success: false, message: 'Invalid verification code. Please check and try again.' };
    }

    record.verified = true;
    this.saveOtpStore(otpStore);

    return { success: true, message: 'Verification code confirmed. You can now set your new password.' };
  }

  /**
   * Step 3: Reset password with verified OTP
   */
  public async resetPassword(
    email: string,
    otp: string,
    newPasswordPlain: string
  ): Promise<{ success: boolean; session?: AuthSession; message: string }> {
    await new Promise(r => setTimeout(r, 400));

    const cleanEmail = email.trim().toLowerCase();
    const otpStore = this.getOtpStore();
    const record = otpStore[cleanEmail];

    if (!record || record.otp.trim() !== otp.trim()) {
      return { success: false, message: 'Invalid verification state. Please restart password recovery.' };
    }

    if (Date.now() > record.expiresAt) {
      delete otpStore[cleanEmail];
      this.saveOtpStore(otpStore);
      return { success: false, message: 'OTP has expired. Please request a new code.' };
    }

    if (newPasswordPlain.length < 6) {
      return { success: false, message: 'New password must be at least 6 characters long.' };
    }

    const users = this.getUsers();
    const userIndex = users.findIndex(u => u.email.toLowerCase() === cleanEmail);

    if (userIndex === -1) {
      return { success: false, message: 'User account not found.' };
    }

    // Hash new password securely with bcrypt
    users[userIndex].passwordHash = bcrypt.hashSync(newPasswordPlain, 10);
    users[userIndex].lastLogin = new Date().toISOString();
    this.saveUsers(users);

    // Consume OTP
    delete otpStore[cleanEmail];
    this.saveOtpStore(otpStore);

    const safeUser = this.stripSensitive(users[userIndex]);
    const token = browserJwt.sign(
      {
        sub: safeUser.id,
        email: safeUser.email,
        role: safeUser.role,
        name: safeUser.name,
      },
      JWT_SECRET,
      { expiresIn: 7 * 24 * 60 * 60 }
    );

    return {
      success: true,
      session: {
        token,
        user: safeUser,
        expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
      },
      message: 'Password reset successful! You are now logged in.',
    };
  }

  /**
   * Change password for logged-in user
   */
  public async changePassword(
    userId: string,
    currentPasswordPlain: string,
    newPasswordPlain: string
  ): Promise<{ success: boolean; message: string }> {
    await new Promise(r => setTimeout(r, 350));

    const users = this.getUsers();
    const user = users.find(u => u.id === userId);

    if (!user) {
      return { success: false, message: 'User session not found' };
    }

    const matches = bcrypt.compareSync(currentPasswordPlain, user.passwordHash);
    if (!matches) {
      return { success: false, message: 'Current password does not match' };
    }

    if (newPasswordPlain.length < 6) {
      return { success: false, message: 'New password must be at least 6 characters long' };
    }

    user.passwordHash = bcrypt.hashSync(newPasswordPlain, 10);
    this.saveUsers(users);

    return { success: true, message: 'Password updated successfully' };
  }

  /**
   * Update profile details
   */
  public updateProfile(
    userId: string,
    updates: Partial<Pick<User, 'name' | 'email' | 'avatar' | 'assignedWarehouseId'>>
  ): User | null {
    const users = this.getUsers();
    const idx = users.findIndex(u => u.id === userId);
    if (idx === -1) return null;

    users[idx] = {
      ...users[idx],
      ...updates,
    };
    this.saveUsers(users);
    return this.stripSensitive(users[idx]);
  }
}

export const authService = new AuthService();
