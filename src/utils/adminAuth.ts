
import * as crypto from 'crypto-js';

// The salt increases security of the hashed password
const SALT = "StreamifyRadioSalt2025";
// Storage key for the hashed admin password
const ADMIN_PASSWORD_KEY = "streamify_admin_hash";

/**
 * Hash a password with SHA-256 and a salt
 */
export const hashPassword = (password: string): string => {
  return crypto.SHA256(password + SALT).toString();
};

/**
 * Check if the provided password matches the stored hash
 */
export const verifyPassword = (password: string): boolean => {
  const storedHash = localStorage.getItem(ADMIN_PASSWORD_KEY);
  
  // If no password set yet, check against the hardcoded one
  if (!storedHash) {
    const hardcodedHash = hashPassword("J@b1tw$tr3@w");
    localStorage.setItem(ADMIN_PASSWORD_KEY, hardcodedHash);
    return hashPassword(password) === hardcodedHash;
  }
  
  return hashPassword(password) === storedHash;
};

/**
 * Change the admin password
 */
export const changeAdminPassword = (newPassword: string): void => {
  const newHash = hashPassword(newPassword);
  localStorage.setItem(ADMIN_PASSWORD_KEY, newHash);
};
