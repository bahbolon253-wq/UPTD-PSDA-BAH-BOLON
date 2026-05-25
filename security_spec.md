# Security Specification: UPTD PSDA Bah Bolon Management System

This document specifies the security requirements, data invariants, and edge-case attack payloads to verify our Firestore security rules.

## 1. Data Invariants

1. **Authentication:** Only authenticated users are allowed to read or write any UPTD data.
2. **Strict Structure:** Documents must have exactly the properties described in the blueprints. Extra fields are strictly prohibited to prevent Shadow Update vulnerabilities.
3. **Immutability of IDs:** The document `id` field must match the document path variable `id`.

## 2. The Dirty Dozen Payloads

Here are 12 specific payloads representing unauthorized or malformed data that must be strictly rejected (PERMISSION_DENIED) by our security rules:

1. **Unauthenticated Read on Profil:** Reading `/profil/kantor` without an authenticated context.
2. **Anonymous Write on Profil:** Attempting to write `/profil/kantor` when not logged in.
3. **Extra Fields (Shadow Keys) in SuratMasuk:** Writing a document to `/surat-masuk/SM-999` containing the extra field `"isSecretAdmin": true`.
4. **Incorrect Status in SuratMasuk:** Writing status `"Menunggu"` (invalid enum) to `/surat-masuk/SM-001`.
5. **ID Mismatch in Pegawai:** Writing employee data to `/pegawai/PEG-001` where the payload `id` is `"PEG-999"`.
6. **Negative Jumlah in Keuangan:** Direct client write to `/keuangan/TX-999` with a negative decimal value `"jumlah": -100`.
7. **Invalid Kategori in Aset:** Adding asset `/aset/AST-999` with category `"KIB X - Rahasia"` (invalid enum).
8. **Invalid ID Character Guard:** Injecting path variable containing malicious scripts `/aset/AST-999<script>` to compromise paths.
9. **String Overflow Attack:** Creating an asset with an extremely long string (`"namaAset"` longer than 200 characters) to cause denial-of-wallet resource degradation.
10. **State Shortcutting in SuratKeluar:** Attempting a client-side update on `/surat-keluar/SK-001` that modifies the `"seksiAsal"` (which is read-only after creation) to `"Seksi O&P"`.
11. **Spoofed User Context:** Attempting to update or create documents with an email that claims to be admin without passing authentication verification.
12. **Blanket Read Query:** Querying `/pegawai` without active authentication.

## 3. Recommended Tests

A security tester suite would run matches asserting `get`, `list`, `create`, `update`, and `delete` operations fail for these payloads. We will enforce these policies directly inside our `firestore.rules`.
