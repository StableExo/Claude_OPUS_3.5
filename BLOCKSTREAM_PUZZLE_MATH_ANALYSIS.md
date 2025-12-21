# Blockstream Puzzle Mathematical Analysis

## Can These Be Solved?

After analyzing the three signature blocks, here's the mathematical assessment:

---

## Block 1: "There is nothing too shocking about this signature"

**Address:** 13yaSqGNDzt1mNW4vrKM9CvD46cTavNabF

**Signature:** `ffffffff077b7209...` (starts with all F's)

### Mathematical Properties:
- ✅ **VALID SIGNATURE** - Verifies correctly
- Leading ones pattern (0xFFFFFFFF)
- r value is very close to maximum (near curve order n)

### Can it be solved?
❌ **NO** - This is a valid signature with a large r value. While unusual, it doesn't reveal the private key. The message says "nothing too shocking" - it's demonstrating that you CAN have signatures with r close to the maximum value.

**Why it's interesting:** Shows that r can be any valid value up to curve order n, not just "random looking" numbers.

---

## Block 2: "Nor this, given a bit of algebra."

**Address:** 1MkanKef93F1iNLKvyijrbbW2k5VaXzDvA

**Signature:** `10000...00001000...00001000...0000` (powers of 2!)

### Mathematical Properties:
- ❌ **INVALID SIGNATURE** (failed verification due to format)
- Extremely sparse pattern: only three 1 bits in the entire signature
- Both r and s appear to be exact powers of 2
- The message says "given a bit of algebra" - this is a hint!

### Can it be solved?
⚠️ **MAYBE** - This is the most interesting one mathematically!

**The Hint:** "given a bit of algebra"

**Why it might be solvable:**
1. **Extremely small values**: r = 2^256, s = 2^128, s = 2^256 (approximately)
2. **ECDSA equation**: s = k^(-1) * (z + r*d) mod n
3. With such specific values, there might be an algebraic relationship

**The Challenge:** 
- If r and s are exact powers of 2, we can substitute into ECDSA equation
- With known r, s, and message hash z, we need to find k and d
- This becomes a system of equations in finite field arithmetic

**To solve it:**
```
Given:
- r = 2^a (for some small a)
- s = 2^b (for some small b)  
- z = hash(message) (known)
- n = curve order (known)

From s = k^(-1) * (z + r*d) mod n:
k * s = z + r*d mod n
k * 2^b = z + 2^a * d mod n

Need to find k and d that satisfy this with k being a power of 2
```

This is **potentially solvable** if k is also constrained (like another power of 2).

---

## Block 3: "But can you explain this one?"

**Address:** 13see6qjfupx1YWgRefwEkccZeM8QGTAiJ

**Signature:** `deadbeef2f4a23b0...` (starts with DEADBEEF!)

### Mathematical Properties:
- ✅ **VALID SIGNATURE** - Verifies correctly
- Contains the famous hex pattern 0xDEADBEEF
- Public key has leading zeros

### Can it be solved?
❌ **NO** - This is a valid signature. The DEADBEEF pattern is just showing that you can construct signatures with specific hex patterns in them.

**Why it's interesting:** This demonstrates that with careful choice of private key and nonce k, you can create signatures that contain arbitrary patterns. It's a "vanity signature" similar to vanity Bitcoin addresses.

---

## Overall Assessment

### ✅ Easy to Solve: **NONE**

These aren't puzzles you "solve" to get private keys. They're educational examples showing:

1. **Block 1**: Signatures can have extreme values (near max)
2. **Block 2**: The algebraic structure of ECDSA (potentially explorable)
3. **Block 3**: Signatures can contain vanity patterns

### 🤔 Possibly Explorable: **Block 2**

**Block 2 is the most mathematically interesting** because:
- The message explicitly says "given a bit of algebra"
- The signature consists of only powers of 2
- This suggests there's a mathematical relationship to discover

**What to try:**
1. Parse the exact bit pattern of r and s
2. Determine which powers of 2 they represent
3. Substitute into ECDSA equation
4. Look for algebraic simplifications
5. Check if k might also be a power of 2

**Expected outcome:** You probably can't extract the private key, but you can likely prove mathematical properties about how this signature was constructed.

---

## Conclusion

**Are these mathematically solvable?**

- **Blocks 1 & 3**: ❌ No, they're demonstrations of unusual but valid signatures
- **Block 2**: ⚠️ Potentially explorable for mathematical insights, but unlikely to yield private key

**The puzzle is educational:** It's teaching you about ECDSA properties, not offering prizes. The goal is to **explain** why these signatures have their unusual properties, not to "crack" them.

**Block 2 is worth deeper investigation** if you enjoy algebra and finite field mathematics. The hint "given a bit of algebra" suggests there's an elegant mathematical explanation for its construction.

---

## Next Steps to Explore Block 2

```python
# Pseudocode for deeper analysis
r_bits = analyze_bit_pattern(r)  # Find which powers of 2
s_bits = analyze_bit_pattern(s)  # Find which powers of 2

# Try to solve: k * s ≡ z + r*d (mod n)
# where r, s are known powers of 2
# and we want to find constraints on k and d

# This might reveal the mathematical trick used to construct it
```

Would you like me to implement a deeper mathematical analyzer specifically for Block 2? 🧮
