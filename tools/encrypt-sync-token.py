"""Encrypt a GitHub fine-grained token with the lodge passcode -> sync-config.json.

Usage: python encrypt-sync-token.py <token> <passcode>
Uses PBKDF2-HMAC-SHA256 (150k iterations) + AES-256-GCM, matching the app's WebCrypto code.
Requires: pip install cryptography
"""
import base64, json, os, sys
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.ciphers.aead import AESGCM

def main():
    token, passcode = sys.argv[1], sys.argv[2]
    salt, iv = os.urandom(16), os.urandom(12)
    key = PBKDF2HMAC(algorithm=hashes.SHA256(), length=32, salt=salt, iterations=150000).derive(passcode.encode())
    ct = AESGCM(key).encrypt(iv, token.encode(), None)
    cfg = {"configured": True,
           "salt": base64.b64encode(salt).decode(),
           "iv": base64.b64encode(iv).decode(),
           "ct": base64.b64encode(ct).decode()}
    out = os.path.join(os.path.dirname(__file__), "..", "sync-config.json")
    with open(out, "w") as f:
        json.dump(cfg, f, indent=2)
    print("Wrote", os.path.abspath(out))

if __name__ == "__main__":
    main()
