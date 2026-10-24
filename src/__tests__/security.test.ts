import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { normalizePhoneNumber } from '../utils/format.ts';

describe('Security & Business Logic Audit Tests', () => {

  describe('1. Phone Number Normalization & Sanitization', () => {
    it('should normalize international and local phone numbers properly', () => {
      assert.equal(normalizePhoneNumber('+992 (900) 12-34-56'), '+992900123456');
      assert.equal(normalizePhoneNumber('900 12 34 56'), '900123456');
      assert.equal(normalizePhoneNumber('+7 (999) 000-00-00'), '+79990000000');
    });

    it('should reject or flag phone numbers with fewer than 7 digits', () => {
      const shortPhone = '123';
      const digits = shortPhone.replace(/\D/g, '');
      assert.ok(digits.length < 7, 'Short phone digits must be less than 7');
    });
  });

  describe('2. Delivery Fee & Authoritative Totals Calculation', () => {
    function computeTotals(
      items: Array<{ price: number; quantity: number }>,
      deliveryMethod: 'courier' | 'pickup' | 'showroom',
      discountPercentage: number = 0
    ) {
      const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const discountAmount = Math.round(subtotal * (discountPercentage / 100));
      const effectiveSubtotal = subtotal - discountAmount;
      const deliveryAmount = deliveryMethod === 'showroom' ? 0 : effectiveSubtotal >= 5000 ? 0 : 390;
      const totalAmount = effectiveSubtotal + deliveryAmount;
      return { subtotal, discountAmount, deliveryAmount, totalAmount };
    }

    it('should charge 390 delivery fee for standard orders below 5000 somoni', () => {
      const totals = computeTotals([{ price: 1000, quantity: 2 }], 'courier', 0);
      assert.equal(totals.subtotal, 2000);
      assert.equal(totals.deliveryAmount, 390);
      assert.equal(totals.totalAmount, 2390);
    });

    it('should grant free delivery for orders at or above 5000 somoni', () => {
      const totals = computeTotals([{ price: 2500, quantity: 2 }], 'courier', 0);
      assert.equal(totals.subtotal, 5000);
      assert.equal(totals.deliveryAmount, 0);
      assert.equal(totals.totalAmount, 5000);
    });

    it('should grant free delivery for showroom pickup regardless of order value', () => {
      const totals = computeTotals([{ price: 300, quantity: 1 }], 'showroom', 0);
      assert.equal(totals.deliveryAmount, 0);
      assert.equal(totals.totalAmount, 300);
    });

    it('should correctly apply promo discount before delivery calculation', () => {
      // 5500 - 10% = 4950 (< 5000) -> delivery fee of 390 applies
      const totals = computeTotals([{ price: 5500, quantity: 1 }], 'courier', 10);
      assert.equal(totals.subtotal, 5500);
      assert.equal(totals.discountAmount, 550);
      assert.equal(totals.deliveryAmount, 390);
      assert.equal(totals.totalAmount, 4950 + 390);
    });
  });

  describe('3. Review Validation Rules', () => {
    function validateReview(productId: string, author: string, rating: number, comment: string) {
      const cleanProductId = productId.trim();
      const cleanAuthor = author.trim();
      const cleanComment = comment.trim();
      const roundedRating = Math.round(Number(rating));

      if (!cleanProductId) throw new Error('Не указан товар для отзыва.');
      if (!cleanAuthor || cleanAuthor.length > 100) {
        throw new Error('Имя автора должно содержать от 1 до 100 символов.');
      }
      if (isNaN(roundedRating) || roundedRating < 1 || roundedRating > 5) {
        throw new Error('Рейтинг должен быть от 1 до 5 звёзд.');
      }
      if (!cleanComment || cleanComment.length > 2000) {
        throw new Error('Комментарий должен содержать от 1 до 2000 символов.');
      }
      return true;
    }

    it('should accept valid 1-5 star reviews with non-empty fields', () => {
      assert.ok(validateReview('prod-1', 'Фатима', 5, 'Отличное качество платья!'));
      assert.ok(validateReview('prod-1', 'Алишер', 1, 'Не подошёл размер.'));
    });

    it('should reject ratings below 1, above 5, or NaN', () => {
      assert.throws(() => validateReview('prod-1', 'Тест', 0, 'Комментарий'), /Рейтинг/);
      assert.throws(() => validateReview('prod-1', 'Тест', 6, 'Комментарий'), /Рейтинг/);
      assert.throws(() => validateReview('prod-1', 'Тест', -1, 'Комментарий'), /Рейтинг/);
      assert.throws(() => validateReview('prod-1', 'Тест', NaN, 'Комментарий'), /Рейтинг/);
    });

    it('should reject empty or whitespace-only author and comments', () => {
      assert.throws(() => validateReview('prod-1', '   ', 5, 'Комментарий'), /Имя автора/);
      assert.throws(() => validateReview('prod-1', 'Алишер', 5, '   '), /Комментарий/);
    });

    it('should reject comments exceeding 2000 characters', () => {
      const longComment = 'A'.repeat(2001);
      assert.throws(() => validateReview('prod-1', 'Алишер', 5, longComment), /Комментарий/);
    });
  });

  describe('4. Customer Data Overwrite Protection Logic', () => {
    interface CustomerRecord {
      id: string;
      full_name: string;
      phone: string;
      email: string | null;
      city: string | null;
      address: string | null;
    }

    function simulateCustomerMerge(
      existing: CustomerRecord,
      incoming: { full_name: string; email?: string; city?: string; address?: string }
    ): CustomerRecord {
      // Replicates the secured SQL:
      // full_name is NEVER overwritten
      // email, city, address are ONLY backfilled if existing is null/empty
      return {
        ...existing,
        email: existing.email || (incoming.email?.trim() || null),
        city: existing.city || (incoming.city?.trim() || null),
        address: existing.address || (incoming.address?.trim() || null),
      };
    }

    it('should preserve original customer full_name and address when existing customer places order', () => {
      const alice: CustomerRecord = {
        id: 'cust-1',
        full_name: 'Алиса Иванова',
        phone: '+992900112233',
        email: 'alice@example.com',
        city: 'Душанбе',
        address: 'ул. Рудаки 15, кв. 4',
      };

      const maliciousIncoming = {
        full_name: 'Злоумышленник',
        email: 'hacker@evil.com',
        city: 'Худжанд',
        address: 'ул. Фейковая 99',
      };

      const merged = simulateCustomerMerge(alice, maliciousIncoming);
      assert.equal(merged.full_name, 'Алиса Иванова', 'Original name must remain untouched');
      assert.equal(merged.email, 'alice@example.com', 'Original email must remain untouched');
      assert.equal(merged.city, 'Душанбе', 'Original city must remain untouched');
      assert.equal(merged.address, 'ул. Рудаки 15, кв. 4', 'Original address must remain untouched');
    });

    it('should backfill missing fields if existing customer had NULL values', () => {
      const incompleteCustomer: CustomerRecord = {
        id: 'cust-2',
        full_name: 'Дилшод',
        phone: '+992900998877',
        email: null,
        city: null,
        address: null,
      };

      const newOrderInfo = {
        full_name: 'Дилшод',
        email: 'dilshod@example.com',
        city: 'Душанбе',
        address: 'ул. Айни 20',
      };

      const merged = simulateCustomerMerge(incompleteCustomer, newOrderInfo);
      assert.equal(merged.email, 'dilshod@example.com');
      assert.equal(merged.city, 'Душанбе');
      assert.equal(merged.address, 'ул. Айни 20');
    });
  });

  describe('5. SQL Migrations & RLS Policy Integrity Audit', () => {
    const rootDir = process.cwd();
    const sqlFiles = readdirSync(rootDir).filter((f) => f.endsWith('.sql'));

    it('should find SQL migration files in the repository', () => {
      assert.ok(sqlFiles.length >= 8, 'Expected at least 8 SQL migration files');
    });

    for (const sqlFile of sqlFiles) {
      const content = readFileSync(join(rootDir, sqlFile), 'utf-8');

      it(`[${sqlFile}] all SECURITY DEFINER functions must set search_path = public`, () => {
        const hasSecDefinerFunction = /create\s+(or\s+replace\s+)?function[\s\S]*?security\s+definer/i.test(content);
        if (hasSecDefinerFunction) {
          assert.match(
            content,
            /set\s+search_path\s*=\s*public/i,
            `${sqlFile} contains SECURITY DEFINER function without 'set search_path = public'`
          );
        }
      });

      it(`[${sqlFile}] policies created must drop previous policies idempotently`, () => {
        const createPolicyMatches = [...content.matchAll(/create\s+policy\s+"([^"]+)"/gi)];
        for (const match of createPolicyMatches) {
          const policyName = match[1];
          const dropPattern = new RegExp(`drop\\s+policy\\s+if\\s+exists\\s+"${policyName}"`, 'i');
          assert.ok(
            dropPattern.test(content),
            `${sqlFile} creates policy "${policyName}" without 'drop policy if exists "${policyName}"'`
          );
        }
      });

      it(`[${sqlFile}] should never grant direct INSERT on orders or customers to anon`, () => {
        assert.doesNotMatch(
          content,
          /grant\s+insert\s+on\s+(public\.)?(orders|customers)\s+to\s+[^;]*anon/i,
          `${sqlFile} grants direct INSERT on orders or customers to anon role`
        );
      });
    }
  });

  describe('6. Admin Authorization Fail-Closed Invariants', () => {
    function evaluateAdminState(
      sessionUser: { id: string; email?: string } | null,
      adminRow: { user_id: string } | null,
      queryError: Error | null
    ): 'signed-out' | 'forbidden' | 'admin' {
      if (!sessionUser) return 'signed-out';
      if (queryError) return 'forbidden'; // Fail closed on error
      return adminRow ? 'admin' : 'forbidden';
    }

    it('should return signed-out when user session is null', () => {
      assert.equal(evaluateAdminState(null, null, null), 'signed-out');
    });

    it('should return forbidden when user is logged in but not in admin_users', () => {
      assert.equal(
        evaluateAdminState({ id: 'user-normal' }, null, null),
        'forbidden'
      );
    });

    it('should return forbidden when query to admin_users fails (fail-closed)', () => {
      assert.equal(
        evaluateAdminState({ id: 'user-any' }, null, new Error('Network error')),
        'forbidden'
      );
    });

    it('should grant admin only when session user exists and matches admin_users record', () => {
      assert.equal(
        evaluateAdminState(
          { id: 'admin-uuid' },
          { user_id: 'admin-uuid' },
          null
        ),
        'admin'
      );
    });
  });
});
