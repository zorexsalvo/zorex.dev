# Why Did PEP 3150 Die?

## Weak Use Case

The problem (reusing intermediate values) was real, but niche.

Nick Coghlan's own words in the PEP:

> *"it might be kinda, sorta, nice to have, sometimes"*

<!-- note:
- He wrote "kinda sorta nice" in an official document and expected it to pass
- This is the same person who wrote PEP 343, which gave us the `with` statement
- Even the best authors have off days
-->

## Un-Pythonic

```python
# Proposed:
y = (x**2 given x = calculate())

# Existing (better):
x = calculate()
y = x**2
```
